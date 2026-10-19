from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Sequence

from app.domain.purification_zakat.dividend_purifier import DividendPurifier
from app.domain.purification_zakat.entities import (
    CalendarBasis,
    DividendPurificationResult,
    HoldingPurificationResult,
    PortfolioTransactionInput,
    ZakatPortfolioReport,
    ZakatPositionBreakdown,
    ZakatPositionInput,
)
from app.domain.purification_zakat.holding_purifier import HoldingPurifier
from app.domain.purification_zakat.zakat_calculator import ZakatCalculator
from app.domain.value_objects.money import (
    ZERO,
    quantize_amount,
    quantize_purification_currence,
)


@dataclass(frozen=True)
class ComprehensivePurificationAndZakatReport:
    """Portföy geneli birleşik Arındırma (Hisse + Temettü) ve Zekat Raporu."""

    holding_purification_items: List[HoldingPurificationResult]
    dividend_purification_items: List[DividendPurificationResult]
    total_holding_purification_raw: Decimal
    total_dividend_purification_raw: Decimal
    total_purification_raw: Decimal
    total_purification_payable: Decimal
    zakat_report: Optional[ZakatPortfolioReport] = None


class PurificationEngine:
    """Kuruşu Kuruşuna Arındırma (Purification) ve Hisse Zekatı Motoru.

    Desteklenen Hesaplamalar:
    1. Hisse Başına / Dönem Bazlı Arındırma (Doğrudan veya FIFO Lot Eşleştirmeli):
       (Toplam Uygunsuz Gelir / Toplam Pay Sayısı) * Lot * (Eldeki Gün / Dönem Günü)
    2. Temettü Bazlı Arındırma:
       Dağıtılan Net/Brüt Temettü * (Toplam Uygunsuz Gelir / Toplam Hasılat)
    3. Hisse Zekatı Hesaplayıcı:
       - Al-Sat (TRADING_SHORT_TERM): Tam Piyasa Değeri * %2.5 (veya Miladi %2.577)
       - Uzun Vadeli Temettü (LONG_TERM_DIVIDEND): max(0, Zekata Tabi Net Dönen Varlık / Pay Sayısı) * Lot * %2.5
    """

    @staticmethod
    def calculate_holding_purification(
        ticker: str,
        fiscal_period: str,
        impure_income_isolated_quarter: Decimal,
        total_shares_outstanding: Decimal,
        quantity_lots: Decimal,
        days_held: int,
        period_total_days: int = 90,
        period_start_date: Optional[date] = None,
        period_end_date: Optional[date] = None,
        net_income_isolated_quarter: Optional[Decimal] = None,
        payable_rounding: str = ROUND_HALF_UP,
    ) -> HoldingPurificationResult:
        """Gün bazlı hisse tutma süresine göre doğrudan arındırma hesaplar."""
        return HoldingPurifier.calculate_direct(
            ticker=ticker,
            fiscal_period=fiscal_period,
            impure_income_isolated_quarter=impure_income_isolated_quarter,
            total_shares_outstanding=total_shares_outstanding,
            quantity_lots=quantity_lots,
            days_held=days_held,
            period_total_days=period_total_days,
            period_start_date=period_start_date,
            period_end_date=period_end_date,
            net_income_isolated_quarter=net_income_isolated_quarter,
            payable_rounding=payable_rounding,
        )

    @staticmethod
    def calculate_fifo_holding_purification(
        ticker: str,
        fiscal_period: str,
        period_start_date: date,
        period_end_date: date,
        impure_income_isolated_quarter: Decimal,
        total_shares_outstanding: Decimal,
        transactions: Sequence[PortfolioTransactionInput],
        net_income_isolated_quarter: Optional[Decimal] = None,
        payable_rounding: str = ROUND_HALF_UP,
    ) -> HoldingPurificationResult:
        """FIFO işlem geçmişi (BUY, SELL, BONUS_ISSUE / EC-05) üzerinden dönemlik arındırma hesaplar."""
        return HoldingPurifier.calculate_from_fifo_transactions(
            ticker=ticker,
            fiscal_period=fiscal_period,
            period_start_date=period_start_date,
            period_end_date=period_end_date,
            impure_income_isolated_quarter=impure_income_isolated_quarter,
            total_shares_outstanding=total_shares_outstanding,
            transactions=transactions,
            net_income_isolated_quarter=net_income_isolated_quarter,
            payable_rounding=payable_rounding,
        )

    @staticmethod
    def calculate_dividend_purification(
        ticker: str,
        dividend_received: Decimal,
        impure_income_total: Decimal,
        total_revenue: Decimal,
        is_gross_basis: bool = True,
        payable_rounding: str = ROUND_HALF_UP,
    ) -> DividendPurificationResult:
        """Alınan nakit temettü tutarı üzerinden arındırma hesaplar."""
        return DividendPurifier.calculate(
            ticker=ticker,
            dividend_received=dividend_received,
            impure_income_total=impure_income_total,
            total_revenue=total_revenue,
            is_gross_basis=is_gross_basis,
            payable_rounding=payable_rounding,
        )

    @staticmethod
    def calculate_dividend_purification_from_lots(
        ticker: str,
        quantity_lots: Decimal,
        dividend_per_share: Decimal,
        impure_income_total: Decimal,
        total_revenue: Decimal,
        is_gross_basis: bool = True,
        payable_rounding: str = ROUND_HALF_UP,
    ) -> DividendPurificationResult:
        """Lot miktarı ve hisse başı temettü üzerinden temettü arındırması hesaplar."""
        return DividendPurifier.calculate_from_lots(
            ticker=ticker,
            quantity_lots=quantity_lots,
            dividend_per_share=dividend_per_share,
            impure_income_total=impure_income_total,
            total_revenue=total_revenue,
            is_gross_basis=is_gross_basis,
            payable_rounding=payable_rounding,
        )

    @staticmethod
    def calculate_zakat_position(
        position: ZakatPositionInput,
        calendar_basis: CalendarBasis = CalendarBasis.HIJRI_354,
    ) -> ZakatPositionBreakdown:
        """Tek bir hisse pozisyonu için (Al-Sat veya Uzun Vadeli Temettü) zekat hesaplar."""
        rate = ZakatCalculator.resolve_zakat_rate(calendar_basis)
        return ZakatCalculator.evaluate_position(position=position, zakat_rate=rate)

    @staticmethod
    def calculate_portfolio_zakat(
        positions: Sequence[ZakatPositionInput],
        valuation_date: date,
        gold_85g_nisab_try: Decimal = ZERO,
        other_zakatable_cash_try: Decimal = ZERO,
        calendar_basis: CalendarBasis = CalendarBasis.HIJRI_354,
        enforce_nisab: bool = True,
        payable_rounding: str = ROUND_HALF_UP,
    ) -> ZakatPortfolioReport:
        """Portföydeki tüm pozisyonlar için niyet bazlı hisse zekatı ve nisap kontrolü yapar."""
        return ZakatCalculator.calculate_portfolio_zakat(
            positions=positions,
            valuation_date=valuation_date,
            gold_85g_nisab_try=gold_85g_nisab_try,
            other_zakatable_cash_try=other_zakatable_cash_try,
            calendar_basis=calendar_basis,
            enforce_nisab=enforce_nisab,
            payable_rounding=payable_rounding,
        )

    @staticmethod
    def build_comprehensive_report(
        holding_items: Sequence[HoldingPurificationResult],
        dividend_items: Sequence[DividendPurificationResult],
        zakat_report: Optional[ZakatPortfolioReport] = None,
        payable_rounding: str = ROUND_HALF_UP,
    ) -> ComprehensivePurificationAndZakatReport:
        """Dönem bazlı hisse arındırmaları, temettü arındırmaları ve zekat raporunu birleştirir."""
        total_holding = quantize_amount(
            sum((h.total_purification_raw for h in holding_items), ZERO),
            rounding=ROUND_HALF_UP,
        )
        total_div = quantize_amount(
            sum((d.purification_raw for d in dividend_items), ZERO),
            rounding=ROUND_HALF_UP,
        )
        total_raw = quantize_amount(
            total_holding + total_div,
            rounding=ROUND_HALF_UP,
        )
        total_payable = quantize_purification_currence(
            total_raw,
            rounding=payable_rounding,
        )

        return ComprehensivePurificationAndZakatReport(
            holding_purification_items=list(holding_items),
            dividend_purification_items=list(dividend_items),
            total_holding_purification_raw=total_holding,
            total_dividend_purification_raw=total_div,
            total_purification_raw=total_raw,
            total_purification_payable=total_payable,
            zakat_report=zakat_report,
        )
