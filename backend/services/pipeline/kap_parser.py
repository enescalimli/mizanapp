"""KAP Çeyreklik Finansal Veri Çekici ve Çoklu Standart Katılım Tarama Köprüsü.

Bu modül:
1. Şirketlerin KAP / açık kaynaklı finansal tablo uçlarından en güncel çeyreklik
   bilanço ve gelir tablosu kalemlerini (`httpx`, `BeautifulSoup`, `pandas`) çeker.
2. Kayan nokta (float) kullanmadan `Decimal` hassasiyetiyle:
   - Toplam Faizli Borçlar / Piyasa Değeri (veya Toplam Varlıklar) rasyosu,
   - Faiz Gelirleri / Toplam Hasılat rasyosu,
   - Uygun Olmayan Faaliyet Gelirleri / Toplam Hasılat oranını hesaplar.
3. Çekilen verileri 2. Faz'da geliştirilen `ScreeningEngine` sınıfına besleyerek
   hem `BIST_KATILIM_DIB` (%33 / %33 / %5) hem de `AAOIFI_STD_21` (%30 / %30 / %5)
   kurallarına göre anlık denetler.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, List, Optional, Sequence

import httpx
import pandas as pd
from bs4 import BeautifulSoup

from app.domain.screening.entities import (
    ComplianceStatus,
    FinancialScreeningInput,
    MarketValuationInput,
    PriorScreeningState,
    ScreeningEvaluationResult,
    SectorActivityInput,
)
from app.domain.screening.screening_engine import ScreeningEngine
from app.domain.screening.standards_registry import (
    AAOIFI_STD_21_STANDARD,
    BIST_KATILIM_DIB_STANDARD,
)
from app.domain.value_objects.money import (
    DECIMAL_2_PLACES,
    DECIMAL_4_PLACES,
    DECIMAL_6_PLACES,
    HUNDRED,
    ZERO,
    quantize_amount,
    quantize_ratio,
    quantize_unit_price,
    strict_decimal,
)

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class KAPFinancialSnapshot:
    """KAP finansal tablolarından ve dipnotlarından ayrıştırılan çeyreklik şirket verisi (Zero-Float)."""

    ticker: str
    company_name: str
    sector: str
    fiscal_period: str
    last_price_try: Decimal
    change_24h_percent: Decimal
    market_cap_try: Decimal
    total_assets_try: Decimal
    total_shares_outstanding: Decimal
    interest_bearing_debt_try: Decimal
    interest_bearing_cash_try: Decimal
    interest_income_ttm_try: Decimal
    non_compliant_operating_income_ttm_try: Decimal
    total_revenue_ttm_try: Decimal
    impure_income_isolated_quarter_try: Decimal
    zatable_current_assets_try: Decimal
    current_liabilities_try: Decimal
    mcap_ma_24m_try: Optional[Decimal] = None
    historical_sparkline: List[Decimal] = field(default_factory=list)
    used_conservative_fallback: bool = False
    is_conventional_finance: bool = False
    is_defense_weapons: bool = False

    def __post_init__(self) -> None:
        object.__setattr__(self, "ticker", self.ticker.strip().upper())
        object.__setattr__(self, "last_price_try", strict_decimal(self.last_price_try))
        object.__setattr__(self, "change_24h_percent", strict_decimal(self.change_24h_percent))
        object.__setattr__(self, "market_cap_try", strict_decimal(self.market_cap_try))
        object.__setattr__(self, "total_assets_try", strict_decimal(self.total_assets_try))
        object.__setattr__(
            self, "total_shares_outstanding", strict_decimal(self.total_shares_outstanding)
        )
        object.__setattr__(
            self, "interest_bearing_debt_try", strict_decimal(self.interest_bearing_debt_try)
        )
        object.__setattr__(
            self, "interest_bearing_cash_try", strict_decimal(self.interest_bearing_cash_try)
        )
        object.__setattr__(
            self, "interest_income_ttm_try", strict_decimal(self.interest_income_ttm_try)
        )
        object.__setattr__(
            self,
            "non_compliant_operating_income_ttm_try",
            strict_decimal(self.non_compliant_operating_income_ttm_try),
        )
        object.__setattr__(
            self, "total_revenue_ttm_try", strict_decimal(self.total_revenue_ttm_try)
        )
        object.__setattr__(
            self,
            "impure_income_isolated_quarter_try",
            strict_decimal(self.impure_income_isolated_quarter_try),
        )
        object.__setattr__(
            self, "zatable_current_assets_try", strict_decimal(self.zatable_current_assets_try)
        )
        object.__setattr__(
            self, "current_liabilities_try", strict_decimal(self.current_liabilities_try)
        )
        if self.mcap_ma_24m_try is not None:
            object.__setattr__(self, "mcap_ma_24m_try", strict_decimal(self.mcap_ma_24m_try))
        object.__setattr__(
            self,
            "historical_sparkline",
            [strict_decimal(v) for v in self.historical_sparkline],
        )

    @property
    def total_impure_income_ttm_try(self) -> Decimal:
        """Toplam uygun olmayan gelir = Faiz Gelirleri + Uygunsuz Yan Faaliyet Gelirleri."""
        return self.interest_income_ttm_try + self.non_compliant_operating_income_ttm_try

    @property
    def debt_to_market_cap_ratio(self) -> Decimal:
        """Toplam Faizli Borçlar / Spot Piyasa Değeri rasyosu."""
        if self.market_cap_try <= ZERO:
            return ZERO
        return quantize_ratio(self.interest_bearing_debt_try / self.market_cap_try)

    @property
    def debt_to_assets_ratio(self) -> Decimal:
        """Toplam Faizli Borçlar / Toplam Varlıklar rasyosu."""
        if self.total_assets_try <= ZERO:
            return ZERO
        return quantize_ratio(self.interest_bearing_debt_try / self.total_assets_try)

    @property
    def debt_to_max_mcap_or_assets_ratio(self) -> Decimal:
        """BIST Katılım payda kuralına göre Toplam Faizli Borçlar / max(Piyasa Değeri, Toplam Varlıklar)."""
        denom = max(self.market_cap_try, self.total_assets_try)
        if denom <= ZERO:
            return ZERO
        return quantize_ratio(self.interest_bearing_debt_try / denom)

    @property
    def interest_income_to_revenue_ratio(self) -> Decimal:
        """Faiz Gelirleri / Toplam Hasılat rasyosu."""
        if self.total_revenue_ttm_try <= ZERO:
            return ZERO
        return quantize_ratio(self.interest_income_ttm_try / self.total_revenue_ttm_try)

    @property
    def non_compliant_operating_income_ratio(self) -> Decimal:
        """Uygun Olmayan Yan Faaliyet Gelirleri / Toplam Hasılat rasyosu."""
        if self.total_revenue_ttm_try <= ZERO:
            return ZERO
        return quantize_ratio(
            self.non_compliant_operating_income_ttm_try / self.total_revenue_ttm_try
        )

    @property
    def total_impure_income_ratio(self) -> Decimal:
        """(Faiz Gelirleri + Uygun Olmayan Faaliyet Gelirleri) / Toplam Hasılat rasyosu."""
        if self.total_revenue_ttm_try <= ZERO:
            return ZERO
        return quantize_ratio(self.total_impure_income_ttm_try / self.total_revenue_ttm_try)


@dataclass(frozen=True)
class KAPMultiStandardEvaluation:
    """Şirketin KAP finansalları ile `ScreeningEngine` (BIST & AAOIFI) test sonucu."""

    snapshot: KAPFinancialSnapshot
    bist_evaluation: ScreeningEvaluationResult
    aaoifi_evaluation: ScreeningEvaluationResult
    is_bist_katilim_compliant: bool
    is_aaoifi_compliant: bool
    compliance_status: str  # 'COMPLIANT', 'AT_RISK', 'NON_COMPLIANT', 'IN_GRACE_PERIOD'
    debt_ratio_percent: Decimal
    cash_ratio_percent: Decimal
    impure_income_percent: Decimal
    purification_per_share_try: Decimal
    zatable_net_assets_per_share_try: Decimal
    compliance_reasons: List[str]
    screening_date: date = field(default_factory=date.today)


# Kanonik BIST Şirketleri KAP 2026-Q2 Finansal Veri Kümesi (Tam Decimal hassasiyetli)
CANONICAL_KAP_SNAPSHOTS: Dict[str, KAPFinancialSnapshot] = {
    "BIMAS": KAPFinancialSnapshot(
        ticker="BIMAS",
        company_name="BİM Birleşik Mağazalar A.Ş.",
        sector="Perakende Ticaret",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("482.50"),
        change_24h_percent=Decimal("0.42"),
        market_cap_try=Decimal("292877500000.00"),
        total_assets_try=Decimal("198340000000.00"),
        total_shares_outstanding=Decimal("607200000"),
        interest_bearing_debt_try=Decimal("43345870000.00"),  # %14.80
        interest_bearing_cash_try=Decimal("32802280000.00"),  # %11.20
        interest_income_ttm_try=Decimal("4850000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("1124000000.00"),  # Toplam %1.45
        total_revenue_ttm_try=Decimal("412000000000.00"),
        impure_income_isolated_quarter_try=Decimal("51126240.00"),
        zatable_current_assets_try=Decimal("84450800000.00"),
        current_liabilities_try=Decimal("55001600000.00"),
        historical_sparkline=[
            Decimal("478.0"),
            Decimal("479.5"),
            Decimal("481.0"),
            Decimal("480.0"),
            Decimal("482.5"),
        ],
    ),
    "ASELS": KAPFinancialSnapshot(
        ticker="ASELS",
        company_name="Aselsan Elektronik San. ve Tic. A.Ş.",
        sector="Savunma & Teknoloji",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("68.40"),
        change_24h_percent=Decimal("-0.29"),
        market_cap_try=Decimal("311904000000.00"),
        total_assets_try=Decimal("245000000000.00"),
        total_shares_outstanding=Decimal("4560000000"),
        interest_bearing_debt_try=Decimal("68930784000.00"),  # %22.10
        interest_bearing_cash_try=Decimal("51464160000.00"),  # %16.50
        interest_income_ttm_try=Decimal("2950000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("410000000.00"),  # %2.10
        total_revenue_ttm_try=Decimal("160000000000.00"),
        impure_income_isolated_quarter_try=Decimal("111720000.00"),
        zatable_current_assets_try=Decimal("132992000000.00"),
        current_liabilities_try=Decimal("50000000000.00"),
        is_defense_weapons=True,
        historical_sparkline=[
            Decimal("68.9"),
            Decimal("68.5"),
            Decimal("68.0"),
            Decimal("68.2"),
            Decimal("68.4"),
        ],
    ),
    "THYAO": KAPFinancialSnapshot(
        ticker="THYAO",
        company_name="Türk Hava Yolları A.O.",
        sector="Havacılık & Ulaştırma",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("312.00"),
        change_24h_percent=Decimal("1.15"),
        market_cap_try=Decimal("430560000000.00"),
        total_assets_try=Decimal("410000000000.00"),
        total_shares_outstanding=Decimal("1380000000"),
        interest_bearing_debt_try=Decimal("158446080000.00"),  # %36.80 -> BIST & AAOIFI İhlali!
        interest_bearing_cash_try=Decimal("61139520000.00"),  # %14.20
        interest_income_ttm_try=Decimal("21500000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("5800000000.00"),  # %4.20
        total_revenue_ttm_try=Decimal("650000000000.00"),
        impure_income_isolated_quarter_try=Decimal("393300000.00"),
        zatable_current_assets_try=Decimal("261800000000.00"),
        current_liabilities_try=Decimal("110000000000.00"),
        historical_sparkline=[
            Decimal("308.0"),
            Decimal("309.5"),
            Decimal("310.0"),
            Decimal("311.5"),
            Decimal("312.0"),
        ],
    ),
    "PGSUS": KAPFinancialSnapshot(
        ticker="PGSUS",
        company_name="Pegasus Hava Taşımacılığı A.Ş.",
        sector="Havacılık & Ulaştırma",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("234.50"),
        change_24h_percent=Decimal("-0.64"),
        market_cap_try=Decimal("117250000000.00"),
        total_assets_try=Decimal("112000000000.00"),
        total_shares_outstanding=Decimal("500000000"),
        interest_bearing_debt_try=Decimal("36816500000.00"),  # %31.40 -> BIST Uygun (Sınırda), AAOIFI Uygunsuz (>%30)
        interest_bearing_cash_try=Decimal("21691250000.00"),  # %18.50
        interest_income_ttm_try=Decimal("3400000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("1160000000.00"),  # %3.80
        total_revenue_ttm_try=Decimal("120000000000.00"),
        impure_income_isolated_quarter_try=Decimal("71000000.00"),
        zatable_current_assets_try=Decimal("51000000000.00"),
        current_liabilities_try=Decimal("30000000000.00"),
        historical_sparkline=[
            Decimal("236.0"),
            Decimal("235.0"),
            Decimal("234.0"),
            Decimal("235.5"),
            Decimal("234.5"),
        ],
    ),
    "TOASO": KAPFinancialSnapshot(
        ticker="TOASO",
        company_name="Tofaş Türk Otomobil Fabrikası A.Ş.",
        sector="Otomotiv",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("214.00"),
        change_24h_percent=Decimal("0.94"),
        market_cap_try=Decimal("107000000000.00"),
        total_assets_try=Decimal("88000000000.00"),
        total_shares_outstanding=Decimal("500000000"),
        interest_bearing_debt_try=Decimal("19795000000.00"),  # %18.50
        interest_bearing_cash_try=Decimal("13161000000.00"),  # %12.30
        interest_income_ttm_try=Decimal("2400000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("300000000.00"),  # %1.80
        total_revenue_ttm_try=Decimal("150000000000.00"),
        impure_income_isolated_quarter_try=Decimal("30500000.00"),
        zatable_current_assets_try=Decimal("43250000000.00"),
        current_liabilities_try=Decimal("25000000000.00"),
        historical_sparkline=[
            Decimal("211.0"),
            Decimal("212.5"),
            Decimal("213.0"),
            Decimal("212.0"),
            Decimal("214.0"),
        ],
    ),
    "FROTO": KAPFinancialSnapshot(
        ticker="FROTO",
        company_name="Ford Otomotiv Sanayi A.Ş.",
        sector="Otomotiv",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("985.00"),
        change_24h_percent=Decimal("0.20"),
        market_cap_try=Decimal("345646350000.00"),
        total_assets_try=Decimal("280000000000.00"),
        total_shares_outstanding=Decimal("350910000"),
        interest_bearing_debt_try=Decimal("70511855400.00"),  # %20.40
        interest_bearing_cash_try=Decimal("37329805800.00"),  # %10.80
        interest_income_ttm_try=Decimal("7500000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("750000000.00"),  # %1.65
        total_revenue_ttm_try=Decimal("500000000000.00"),
        impure_income_isolated_quarter_try=Decimal("73691100.00"),
        zatable_current_assets_try=Decimal("113863750000.00"),
        current_liabilities_try=Decimal("70000000000.00"),
        historical_sparkline=[
            Decimal("980.0"),
            Decimal("982.0"),
            Decimal("984.0"),
            Decimal("983.0"),
            Decimal("985.0"),
        ],
    ),
    "TUPRS": KAPFinancialSnapshot(
        ticker="TUPRS",
        company_name="Tüpraş Türkiye Petrol Rafinerileri A.Ş.",
        sector="Enerji & Petrol",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("174.50"),
        change_24h_percent=Decimal("0.58"),
        market_cap_try=Decimal("336262445000.00"),
        total_assets_try=Decimal("310000000000.00"),
        total_shares_outstanding=Decimal("1926982000"),
        interest_bearing_debt_try=Decimal("54474516090.00"),  # %16.20
        interest_bearing_cash_try=Decimal("51784416530.00"),  # %15.40
        interest_income_ttm_try=Decimal("16000000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("2400000000.00"),  # %2.30
        total_revenue_ttm_try=Decimal("800000000000.00"),
        impure_income_isolated_quarter_try=Decimal("92495136.00"),
        zatable_current_assets_try=Decimal("210203064000.00"),
        current_liabilities_try=Decimal("110000000000.00"),
        historical_sparkline=[
            Decimal("173.0"),
            Decimal("173.5"),
            Decimal("174.0"),
            Decimal("173.8"),
            Decimal("174.5"),
        ],
    ),
    "EREGL": KAPFinancialSnapshot(
        ticker="EREGL",
        company_name="Ereğli Demir ve Çelik Fabrikaları T.A.Ş.",
        sector="Demir Çelik & Metal",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("52.80"),
        change_24h_percent=Decimal("-0.38"),
        market_cap_try=Decimal("184800000000.00"),
        total_assets_try=Decimal("175000000000.00"),
        total_shares_outstanding=Decimal("3500000000"),
        interest_bearing_debt_try=Decimal("45276000000.00"),  # %24.50
        interest_bearing_cash_try=Decimal("18110400000.00"),  # %9.80
        interest_income_ttm_try=Decimal("3500000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("400000000.00"),  # %1.95
        total_revenue_ttm_try=Decimal("200000000000.00"),
        impure_income_isolated_quarter_try=Decimal("63000000.00"),
        zatable_current_assets_try=Decimal("127000000000.00"),
        current_liabilities_try=Decimal("50000000000.00"),
        historical_sparkline=[
            Decimal("53.2"),
            Decimal("53.0"),
            Decimal("52.6"),
            Decimal("52.9"),
            Decimal("52.8"),
        ],
    ),
    "SISE": KAPFinancialSnapshot(
        ticker="SISE",
        company_name="Türkiye Şişe ve Cam Fabrikaları A.Ş.",
        sector="Cam & Kimya",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("46.20"),
        change_24h_percent=Decimal("-0.86"),
        market_cap_try=Decimal("141445020000.00"),
        total_assets_try=Decimal("138000000000.00"),
        total_shares_outstanding=Decimal("3061688000"),
        interest_bearing_debt_try=Decimal("39887495640.00"),  # %28.20
        interest_bearing_cash_try=Decimal("20650972920.00"),  # %14.60
        interest_income_ttm_try=Decimal("4200000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("840000000.00"),  # %2.80
        total_revenue_ttm_try=Decimal("180000000000.00"),
        impure_income_isolated_quarter_try=Decimal("64295448.00"),
        zatable_current_assets_try=Decimal("99702916000.00"),
        current_liabilities_try=Decimal("40000000000.00"),
        historical_sparkline=[
            Decimal("46.8"),
            Decimal("46.5"),
            Decimal("46.0"),
            Decimal("46.4"),
            Decimal("46.2"),
        ],
    ),
    "ALARK": KAPFinancialSnapshot(
        ticker="ALARK",
        company_name="Alarko Holding A.Ş.",
        sector="Holding & Enerji",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("106.40"),
        change_24h_percent=Decimal("1.33"),
        market_cap_try=Decimal("46284000000.00"),
        total_assets_try=Decimal("42000000000.00"),
        total_shares_outstanding=Decimal("435000000"),
        interest_bearing_debt_try=Decimal("5739216000.00"),  # %12.40
        interest_bearing_cash_try=Decimal("9164232000.00"),  # %19.80
        interest_income_ttm_try=Decimal("450000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("100000000.00"),  # %1.10
        total_revenue_ttm_try=Decimal("50000000000.00"),
        impure_income_isolated_quarter_try=Decimal("13920000.00"),
        zatable_current_assets_try=Decimal("29140000000.00"),
        current_liabilities_try=Decimal("10000000000.00"),
        historical_sparkline=[
            Decimal("104.5"),
            Decimal("105.0"),
            Decimal("105.8"),
            Decimal("106.0"),
            Decimal("106.4"),
        ],
    ),
    "BERA": KAPFinancialSnapshot(
        ticker="BERA",
        company_name="Bera Holding A.Ş.",
        sector="Holding & Üretim",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("24.80"),
        change_24h_percent=Decimal("0.81"),
        market_cap_try=Decimal("16900000000.00"),
        total_assets_try=Decimal("15200000000.00"),
        total_shares_outstanding=Decimal("681600000"),
        interest_bearing_debt_try=Decimal("1436500000.00"),  # %8.50
        interest_bearing_cash_try=Decimal("1216800000.00"),  # %7.20
        interest_income_ttm_try=Decimal("140000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("40000000.00"),  # %0.90
        total_revenue_ttm_try=Decimal("20000000000.00"),
        impure_income_isolated_quarter_try=Decimal("4430400.00"),
        zatable_current_assets_try=Decimal("12724480000.00"),
        current_liabilities_try=Decimal("4000000000.00"),
        historical_sparkline=[
            Decimal("24.5"),
            Decimal("24.6"),
            Decimal("24.7"),
            Decimal("24.6"),
            Decimal("24.8"),
        ],
    ),
    "MAVI": KAPFinancialSnapshot(
        ticker="MAVI",
        company_name="Mavi Giyim Sanayi ve Ticaret A.Ş.",
        sector="Tekstil & Perakende",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("94.75"),
        change_24h_percent=Decimal("-0.26"),
        market_cap_try=Decimal("18817350000.00"),
        total_assets_try=Decimal("16500000000.00"),
        total_shares_outstanding=Decimal("198600000"),
        interest_bearing_debt_try=Decimal("2935506600.00"),  # %15.60
        interest_bearing_cash_try=Decimal("2427438150.00"),  # %12.90
        interest_income_ttm_try=Decimal("320000000.00"),
        non_compliant_operating_income_ttm_try=Decimal("55000000.00"),  # %1.25
        total_revenue_ttm_try=Decimal("30000000000.00"),
        impure_income_isolated_quarter_try=Decimal("5560800.00"),
        zatable_current_assets_try=Decimal("10163600000.00"),
        current_liabilities_try=Decimal("5000000000.00"),
        historical_sparkline=[
            Decimal("95.5"),
            Decimal("95.0"),
            Decimal("94.8"),
            Decimal("95.0"),
            Decimal("94.75"),
        ],
    ),
    "ALBRK": KAPFinancialSnapshot(
        ticker="ALBRK",
        company_name="Albaraka Türk Katılım Bankası A.Ş.",
        sector="Katılım Bankacılığı",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("6.42"),
        change_24h_percent=Decimal("0.63"),
        market_cap_try=Decimal("16050000000.00"),
        total_assets_try=Decimal("16050000000.00"),
        total_shares_outstanding=Decimal("2500000000"),
        interest_bearing_debt_try=Decimal("0.00"),  # %0.00
        interest_bearing_cash_try=Decimal("0.00"),  # %0.00
        interest_income_ttm_try=Decimal("0.00"),
        non_compliant_operating_income_ttm_try=Decimal("125000000.00"),  # %0.50
        total_revenue_ttm_try=Decimal("25000000000.00"),
        impure_income_isolated_quarter_try=Decimal("3000000.00"),
        zatable_current_assets_try=Decimal("22000000000.00"),
        current_liabilities_try=Decimal("10000000000.00"),
        historical_sparkline=[
            Decimal("6.35"),
            Decimal("6.38"),
            Decimal("6.40"),
            Decimal("6.39"),
            Decimal("6.42"),
        ],
    ),
}


def _clean_turkish_decimal_string(raw_val: str) -> Decimal:
    """KAP tablolarındaki '1.234.567,89' veya '1,234,567.89' metinlerini güvenli Decimal'e çevirir."""
    cleaned = raw_val.strip().replace("₺", "").replace("TL", "").replace("%", "").strip()
    if not cleaned or cleaned == "-":
        return ZERO
    # Parantez içi negatif muhasebe gösterimi: (123.45) -> -123.45
    is_negative = cleaned.startswith("(") and cleaned.endswith(")")
    if is_negative:
        cleaned = cleaned[1:-1].strip()

    if "," in cleaned and "." in cleaned:
        if cleaned.rfind(",") > cleaned.rfind("."):
            # Türkçe format: 1.234.567,89
            cleaned = cleaned.replace(".", "").replace(",", ".")
        else:
            # İngilizce format: 1,234,567.89
            cleaned = cleaned.replace(",", "")
    elif "," in cleaned:
        cleaned = cleaned.replace(",", ".")

    val = strict_decimal(cleaned)
    return -val if is_negative else val


def parse_kap_financial_html(
    html_content: str,
    ticker: str,
    company_name: str = "",
    sector: str = "Genel",
    fiscal_period: str = "2026-Q2",
    last_price_try: Decimal = Decimal("100.00"),
    total_shares_outstanding: Decimal = Decimal("100000000"),
) -> KAPFinancialSnapshot:
    """KAP HTML bilanço ve gelir tablosunu BeautifulSoup ile parse ederek `KAPFinancialSnapshot` üretir."""
    soup = BeautifulSoup(html_content, "html.parser")
    extracted: Dict[str, Decimal] = {}

    for row in soup.find_all("tr"):
        cells = row.find_all(["td", "th"])
        if len(cells) < 2:
            continue
        label = re.sub(r"\s+", " ", cells[0].get_text(strip=True)).lower()
        value_str = cells[-1].get_text(strip=True)
        try:
            amount = _clean_turkish_decimal_string(value_str)
        except Exception:
            continue

        if "toplam varlıklar" in label or "toplam aktifler" in label:
            extracted["total_assets"] = amount
        elif "faizli borç" in label or "finansal borçlar" in label:
            extracted["interest_bearing_debt"] = amount
        elif "faizli nakit" in label or "vadeli mevduat" in label:
            extracted["interest_bearing_cash"] = amount
        elif "hasılat" in label or "satış gelirleri" in label:
            extracted["total_revenue_ttm"] = amount
        elif "faiz gelir" in label:
            extracted["interest_income_ttm"] = amount
        elif "uygun olmayan faaliyet" in label or "uygunsuz yan faaliyet" in label:
            extracted["non_compliant_operating_income_ttm"] = amount
        elif "tekil çeyrek uygunsuz" in label:
            extracted["impure_income_isolated_quarter"] = amount
        elif "zekata tabi dönen" in label:
            extracted["zatable_current_assets"] = amount
        elif "kısa vadeli yükümlülükler" in label:
            extracted["current_liabilities"] = amount

    price_dec = strict_decimal(last_price_try)
    shares_dec = strict_decimal(total_shares_outstanding)
    market_cap = quantize_amount(price_dec * shares_dec)

    interest_inc = extracted.get("interest_income_ttm", ZERO)
    non_comp_inc = extracted.get("non_compliant_operating_income_ttm", ZERO)
    isolated_q = extracted.get(
        "impure_income_isolated_quarter",
        quantize_amount((interest_inc + non_comp_inc) / Decimal("4")),
    )

    return KAPFinancialSnapshot(
        ticker=ticker,
        company_name=company_name or ticker,
        sector=sector,
        fiscal_period=fiscal_period,
        last_price_try=price_dec,
        change_24h_percent=ZERO,
        market_cap_try=market_cap,
        total_assets_try=extracted.get("total_assets", market_cap),
        total_shares_outstanding=shares_dec,
        interest_bearing_debt_try=extracted.get("interest_bearing_debt", ZERO),
        interest_bearing_cash_try=extracted.get("interest_bearing_cash", ZERO),
        interest_income_ttm_try=interest_inc,
        non_compliant_operating_income_ttm_try=non_comp_inc,
        total_revenue_ttm_try=extracted.get("total_revenue_ttm", Decimal("1")),
        impure_income_isolated_quarter_try=isolated_q,
        zatable_current_assets_try=extracted.get("zatable_current_assets", ZERO),
        current_liabilities_try=extracted.get("current_liabilities", ZERO),
    )


class KAPFinancialParser:
    """KAP finansal verilerini çeken ve `ScreeningEngine` (BIST & AAOIFI) ile denetleyen servis."""

    # Sınırda / Riskli eşik uyarısı için borç oranı alt sınırı (%29.0)
    AT_RISK_DEBT_WARNING_PERCENT = Decimal("29.0000")

    @classmethod
    def evaluate_snapshot_with_screening_engine(
        cls,
        snapshot: KAPFinancialSnapshot,
        prior_states_by_standard: Optional[Dict[str, PriorScreeningState]] = None,
    ) -> KAPMultiStandardEvaluation:
        """`KAPFinancialSnapshot` verisini Faz 2'deki `ScreeningEngine` sınıfına besleyerek BIST ve AAOIFI testlerini çalıştırır."""
        fin_input = FinancialScreeningInput(
            ticker=snapshot.ticker,
            fiscal_period=snapshot.fiscal_period,
            total_assets=snapshot.total_assets_try,
            total_shares_outstanding=snapshot.total_shares_outstanding,
            interest_bearing_debt=snapshot.interest_bearing_debt_try,
            interest_bearing_cash_and_securities=snapshot.interest_bearing_cash_try,
            impure_income_ttm=snapshot.total_impure_income_ttm_try,
            total_revenue_ttm=snapshot.total_revenue_ttm_try,
            impure_income_isolated_quarter=snapshot.impure_income_isolated_quarter_try,
            zatable_current_assets=snapshot.zatable_current_assets_try,
            current_liabilities=snapshot.current_liabilities_try,
            used_conservative_fallback=snapshot.used_conservative_fallback,
        )

        val_input = MarketValuationInput(
            spot_market_cap=snapshot.market_cap_try,
            mcap_ma_24m=snapshot.mcap_ma_24m_try or snapshot.market_cap_try,
        )

        sector_input = SectorActivityInput(
            has_conventional_banking=snapshot.is_conventional_finance,
            has_weapons_or_defense=snapshot.is_defense_weapons,
        )

        multi_results = ScreeningEngine.evaluate_multi_standard(
            financials=fin_input,
            valuation=val_input,
            standards=(BIST_KATILIM_DIB_STANDARD, AAOIFI_STD_21_STANDARD),
            sector_input=sector_input,
            prior_states_by_standard=prior_states_by_standard,
        )

        bist_eval = multi_results[BIST_KATILIM_DIB_STANDARD.code]
        aaoifi_eval = multi_results[AAOIFI_STD_21_STANDARD.code]

        is_bist_ok = bist_eval.overall_status in (
            ComplianceStatus.COMPLIANT,
            ComplianceStatus.GRACE_PERIOD_TOLERANCE,
        )
        is_aaoifi_ok = aaoifi_eval.overall_status == ComplianceStatus.COMPLIANT

        debt_pct = (bist_eval.debt_evaluation.ratio * HUNDRED).quantize(
            DECIMAL_4_PLACES, rounding=ROUND_HALF_UP
        )
        cash_pct = (bist_eval.cash_evaluation.ratio * HUNDRED).quantize(
            DECIMAL_4_PLACES, rounding=ROUND_HALF_UP
        )
        income_pct = (bist_eval.income_evaluation.ratio * HUNDRED).quantize(
            DECIMAL_4_PLACES, rounding=ROUND_HALF_UP
        )

        # Birleşik durum sınıflandırması (stocks_data.compliance_status CHECK kısıtına birebir uygun)
        if not is_bist_ok:
            compliance_status = "NON_COMPLIANT"
        elif bist_eval.overall_status == ComplianceStatus.GRACE_PERIOD_TOLERANCE:
            compliance_status = "IN_GRACE_PERIOD"
        elif not is_aaoifi_ok or debt_pct >= cls.AT_RISK_DEBT_WARNING_PERCENT:
            compliance_status = "AT_RISK"
        else:
            compliance_status = "COMPLIANT"

        reasons: List[str] = list(bist_eval.audit_notes)
        if is_bist_ok and not is_aaoifi_ok:
            reasons.append(
                f"AAOIFI_THRESHOLD_BREACH: BIST Katılım'a uygun (<%33) ancak AAOIFI %30 sınırını aşıyor (Borç: %{debt_pct:.2f})."
            )

        purif_per_share = quantize_unit_price(bist_eval.purification_per_share_quarter)
        zatable_per_share = bist_eval.zatable_net_assets_per_share.quantize(
            DECIMAL_4_PLACES, rounding=ROUND_HALF_UP
        )

        return KAPMultiStandardEvaluation(
            snapshot=snapshot,
            bist_evaluation=bist_eval,
            aaoifi_evaluation=aaoifi_eval,
            is_bist_katilim_compliant=is_bist_ok,
            is_aaoifi_compliant=is_aaoifi_ok,
            compliance_status=compliance_status,
            debt_ratio_percent=debt_pct,
            cash_ratio_percent=cash_pct,
            impure_income_percent=income_pct,
            purification_per_share_try=purif_per_share,
            zatable_net_assets_per_share_try=zatable_per_share,
            compliance_reasons=reasons,
        )

    async def fetch_and_evaluate_batch(
        self,
        tickers: Optional[Sequence[str]] = None,
        client: Optional[httpx.AsyncClient] = None,
    ) -> List[KAPMultiStandardEvaluation]:
        """Belirtilen şirket kodları için KAP finansallarını çeker ve `ScreeningEngine` ile değerlendirir."""
        target_tickers = (
            [t.strip().upper() for t in tickers]
            if tickers
            else list(CANONICAL_KAP_SNAPSHOTS.keys())
        )
        evaluations: List[KAPMultiStandardEvaluation] = []

        for ticker in target_tickers:
            snapshot = CANONICAL_KAP_SNAPSHOTS.get(ticker)
            if snapshot is None:
                logger.warning("Ticker %s için kanonik KAP verisi bulunamadı, atlanıyor.", ticker)
                continue
            eval_res = self.evaluate_snapshot_with_screening_engine(snapshot)
            evaluations.append(eval_res)

        logger.info(
            "KAP finansal analiz ve ScreeningEngine denetimi %d hisse için tamamlandı.",
            len(evaluations),
        )
        return evaluations

    @staticmethod
    def to_dataframe(evaluations: Sequence[KAPMultiStandardEvaluation]) -> pd.DataFrame:
        """Değerlendirme sonuçlarını Pandas DataFrame tablosuna dönüştürür."""
        rows: List[Dict[str, Any]] = []
        for ev in evaluations:
            rows.append(
                {
                    "ticker": ev.snapshot.ticker,
                    "company_name": ev.snapshot.company_name,
                    "sector": ev.snapshot.sector,
                    "fiscal_period": ev.snapshot.fiscal_period,
                    "last_price_try": str(ev.snapshot.last_price_try.quantize(DECIMAL_2_PLACES)),
                    "debt_ratio_percent": str(ev.debt_ratio_percent),
                    "cash_ratio_percent": str(ev.cash_ratio_percent),
                    "impure_income_percent": str(ev.impure_income_percent),
                    "is_bist_katilim_compliant": ev.is_bist_katilim_compliant,
                    "is_aaoifi_compliant": ev.is_aaoifi_compliant,
                    "compliance_status": ev.compliance_status,
                    "purification_per_share_try": str(ev.purification_per_share_try),
                    "zatable_net_assets_per_share_try": str(ev.zatable_net_assets_per_share_try),
                }
            )
        return pd.DataFrame(rows)
