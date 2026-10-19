from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import List, Optional, Sequence

from app.domain.value_objects.money import (
    ZERO,
    quantize_amount,
    quantize_ratio,
    quantize_share_quantity,
    strict_decimal,
)


class ComplianceStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    GRACE_PERIOD_TOLERANCE = "GRACE_PERIOD_TOLERANCE"
    NON_COMPLIANT = "NON_COMPLIANT"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class DenominatorRule(str, Enum):
    SPOT_MCAP = "SPOT_MCAP"
    TOTAL_ASSETS = "TOTAL_ASSETS"
    MCAP_MA_12M = "MCAP_MA_12M"
    MCAP_MA_24M = "MCAP_MA_24M"
    MCAP_MA_36M = "MCAP_MA_36M"
    MAX_OF_MCAP_OR_ASSETS = "MAX_OF_MCAP_OR_ASSETS"


@dataclass(frozen=True)
class ScreeningStandardConfig:
    """Katılım uygunluk standardı parametrik tanımı (Sihirli sayı yasağına uygun)."""

    code: str
    name: str
    max_interest_debt_ratio: Decimal
    max_interest_cash_ratio: Decimal
    max_impure_income_ratio: Decimal
    debt_denominator_rule: DenominatorRule = DenominatorRule.MAX_OF_MCAP_OR_ASSETS
    cash_denominator_rule: DenominatorRule = DenominatorRule.MAX_OF_MCAP_OR_ASSETS
    mcap_moving_avg_months: int = 0
    tolerance_band_bps: int = 150
    grace_period_quarters: int = 2
    exclude_defense_sector: bool = False
    strict_less_than: bool = True

    def __post_init__(self) -> None:
        for attr in (
            "max_interest_debt_ratio",
            "max_interest_cash_ratio",
            "max_impure_income_ratio",
        ):
            val = quantize_ratio(strict_decimal(getattr(self, attr)))
            if val <= ZERO or val >= Decimal("1"):
                raise ValueError(f"{attr} must be between 0 and 1, got {val}")
            object.__setattr__(self, attr, val)
        if self.tolerance_band_bps < 0:
            raise ValueError("tolerance_band_bps cannot be negative")
        if self.grace_period_quarters < 0:
            raise ValueError("grace_period_quarters cannot be negative")


@dataclass(frozen=True)
class SectorActivityInput:
    """Şirket faaliyet alanı ve ana sözleşme uygunluk girdisi."""

    incorporation_articles_compliant: bool = True
    is_participation_institution: bool = False
    has_conventional_banking: bool = False
    has_conventional_insurance: bool = False
    has_alcohol_production_or_trade: bool = False
    has_tobacco: bool = False
    has_gambling_or_betting: bool = False
    has_pork_products: bool = False
    has_weapons_or_defense: bool = False
    has_adult_entertainment_or_media: bool = False


@dataclass(frozen=True)
class MarketValuationInput:
    """Piyasa değeri ve hareketli ortalama girdisi."""

    spot_market_cap: Decimal
    mcap_ma_12m: Optional[Decimal] = None
    mcap_ma_24m: Optional[Decimal] = None
    mcap_ma_36m: Optional[Decimal] = None
    historical_daily_mcaps: Optional[Sequence[Decimal]] = None

    def __post_init__(self) -> None:
        spot = quantize_amount(strict_decimal(self.spot_market_cap))
        if spot < ZERO:
            raise ValueError(f"spot_market_cap cannot be negative: {spot}")
        object.__setattr__(self, "spot_market_cap", spot)

        for attr in ("mcap_ma_12m", "mcap_ma_24m", "mcap_ma_36m"):
            raw = getattr(self, attr)
            if raw is not None:
                val = quantize_amount(strict_decimal(raw))
                if val < ZERO:
                    raise ValueError(f"{attr} cannot be negative: {val}")
                object.__setattr__(self, attr, val)

        if self.historical_daily_mcaps is not None:
            cleaned = tuple(
                quantize_amount(strict_decimal(x)) for x in self.historical_daily_mcaps
            )
            object.__setattr__(self, "historical_daily_mcaps", cleaned)


@dataclass(frozen=True)
class FinancialScreeningInput:
    """Tarama motoru için doğrulanmış finansal tablo ve dipnot girdisi."""

    ticker: str
    fiscal_period: str
    total_assets: Decimal
    total_shares_outstanding: Decimal
    interest_bearing_debt: Decimal
    interest_bearing_cash_and_securities: Decimal
    impure_income_ttm: Decimal
    total_revenue_ttm: Decimal
    impure_income_isolated_quarter: Decimal = ZERO
    zatable_current_assets: Decimal = ZERO
    current_liabilities: Decimal = ZERO
    used_conservative_fallback: bool = False

    def __post_init__(self) -> None:
        shares = quantize_share_quantity(strict_decimal(self.total_shares_outstanding))
        if shares <= ZERO:
            raise ValueError(f"total_shares_outstanding must be positive, got {shares}")
        object.__setattr__(self, "total_shares_outstanding", shares)

        for attr in (
            "total_assets",
            "interest_bearing_debt",
            "interest_bearing_cash_and_securities",
            "impure_income_ttm",
            "total_revenue_ttm",
            "impure_income_isolated_quarter",
            "zatable_current_assets",
            "current_liabilities",
        ):
            val = quantize_amount(strict_decimal(getattr(self, attr)))
            if val < ZERO:
                raise ValueError(f"{attr} cannot be negative: {val}")
            object.__setattr__(self, attr, val)


@dataclass(frozen=True)
class PriorScreeningState:
    """Tampon bölge / hoşgörü süresi (Grace Period FSM) için önceki dönem durumu."""

    previous_status: ComplianceStatus = ComplianceStatus.COMPLIANT
    consecutive_breach_quarters: int = 0


@dataclass(frozen=True)
class RatioEvaluationDetail:
    """Tek bir finansal oranın (Borç, Nakit veya Gelir) değerlendirme detayı."""

    numerator: Decimal
    denominator: Decimal
    ratio: Decimal
    threshold: Decimal
    tolerance_ceiling: Decimal
    is_strictly_compliant: bool
    is_within_tolerance_band: bool


@dataclass(frozen=True)
class ScreeningEvaluationResult:
    """Katılım Uygunluk Motoru nihai değerlendirme çıktısı."""

    ticker: str
    fiscal_period: str
    standard_code: str
    overall_status: ComplianceStatus
    is_sector_compliant: bool
    prohibited_activities_found: List[str]
    debt_evaluation: RatioEvaluationDetail
    cash_evaluation: RatioEvaluationDetail
    income_evaluation: RatioEvaluationDetail
    denominator_value_used_for_debt: Decimal
    denominator_value_used_for_cash: Decimal
    consecutive_breach_quarters: int
    is_in_grace_period: bool
    used_conservative_fallback: bool
    purification_per_share_quarter: Decimal
    purification_ratio_dividend: Decimal
    zatable_net_assets_per_share: Decimal
    audit_notes: List[str] = field(default_factory=list)
