from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, Sequence

from app.domain.purification_zakat.entities import (
    FIFOLotSlice,
    HoldingPurificationResult,
    PortfolioTransactionInput,
)
from app.domain.purification_zakat.fifo_lot_matcher import FIFOLotMatcher
from app.domain.value_objects.money import (
    ZERO,
    quantize_amount,
    quantize_purification_currence,
    quantize_ratio,
    quantize_share_quantity,
    strict_decimal,
)


class HoldingPurifier:
    """Yöntem 1: Hisse Başına / Dönem Bazlı Arındırma (Holding Period Pro-Rata Purification).

    Formül:
        P_holding = (Toplam Uygunsuz Gelir / Toplam Pay Sayısı) * Lot * (Eldeki Gün / Dönem Gün)

    EC-03 Kuralı: Şirket net dönem zararı açıklasa dahi (net_income < 0),
    pozitif faiz/uygunsuz geliri (impure_income > 0) varsa arındırma tam olarak hesaplanır.
    """

    @staticmethod
    def calculate_direct(
        ticker: str,
        fiscal_period: str,
        impure_income_isolated_quarter: Decimal,
        total_shares_outstanding: Decimal,
        quantity_lots: Decimal,
        days_held: int,
        period_total_days: int = 90,
        period_start_date: Optional[date] = None,
        period_end_date: Optional[date] = None,
        net_income_isolated_quarter: Optional[Decimal] = None,  # EC-03: Net zarar olsa bile arındırma sıfırlanmaz
        payable_rounding: str = ROUND_HALF_UP,
    ) -> HoldingPurificationResult:
        impure = quantize_amount(strict_decimal(impure_income_isolated_quarter))
        shares = quantize_share_quantity(strict_decimal(total_shares_outstanding))
        lots = quantize_share_quantity(strict_decimal(quantity_lots))

        if impure < ZERO:
            raise ValueError(f"impure_income_isolated_quarter cannot be negative: {impure}")
        if shares <= ZERO:
            raise ValueError(f"total_shares_outstanding must be positive: {shares}")
        if lots < ZERO:
            raise ValueError(f"quantity_lots cannot be negative: {lots}")
        if period_total_days <= 0:
            raise ValueError(f"period_total_days must be positive: {period_total_days}")
        if days_held < 0 or days_held > period_total_days:
            raise ValueError(
                f"days_held ({days_held}) must be between 0 and period_total_days ({period_total_days})"
            )

        if net_income_isolated_quarter is not None:
            _ = strict_decimal(net_income_isolated_quarter)

        purif_per_share = quantize_ratio(impure / shares, rounding=ROUND_HALF_UP)
        pro_rata = quantize_ratio(
            Decimal(days_held) / Decimal(period_total_days),
            rounding=ROUND_HALF_UP,
        )
        raw_amount = quantize_amount(
            (impure / shares) * lots * (Decimal(days_held) / Decimal(period_total_days)),
            rounding=ROUND_HALF_UP,
        )
        payable = quantize_purification_currence(raw_amount, rounding=payable_rounding)

        start_dt = period_start_date or date(2026, 1, 1)
        end_dt = period_end_date or date(2026, 3, 31)

        slice_item = FIFOLotSlice(
            buy_date=start_dt,
            sell_date=None,
            effective_start_date=start_dt,
            effective_end_date=end_dt,
            quantity_lots=lots,
            days_held_in_period=days_held,
            period_total_days=period_total_days,
            pro_rata_factor=pro_rata,
            purification_amount=raw_amount,
        )

        return HoldingPurificationResult(
            ticker=ticker,
            fiscal_period=fiscal_period,
            period_start_date=start_dt,
            period_end_date=end_dt,
            period_total_days=period_total_days,
            impure_income_isolated_quarter=impure,
            total_shares_outstanding=shares,
            purification_per_share=purif_per_share,
            lot_slices=[slice_item] if lots > ZERO and days_held > 0 else [],
            total_purification_raw=raw_amount,
            total_purification_payable=payable,
        )

    @staticmethod
    def calculate_from_fifo_transactions(
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
        impure = quantize_amount(strict_decimal(impure_income_isolated_quarter))
        shares = quantize_share_quantity(strict_decimal(total_shares_outstanding))

        if impure < ZERO:
            raise ValueError(f"impure_income_isolated_quarter cannot be negative: {impure}")
        if shares <= ZERO:
            raise ValueError(f"total_shares_outstanding must be positive: {shares}")
        if net_income_isolated_quarter is not None:
            _ = strict_decimal(net_income_isolated_quarter)

        purif_per_share = quantize_ratio(impure / shares, rounding=ROUND_HALF_UP)
        period_total_days = (period_end_date - period_start_date).days + 1

        slices = FIFOLotMatcher.match_and_slice_for_period(
            transactions=transactions,
            period_start_date=period_start_date,
            period_end_date=period_end_date,
            purification_per_share=purif_per_share,
        )

        total_raw = quantize_amount(
            sum((s.purification_amount for s in slices), ZERO),
            rounding=ROUND_HALF_UP,
        )
        total_payable = quantize_purification_currence(
            total_raw, rounding=payable_rounding
        )

        return HoldingPurificationResult(
            ticker=ticker,
            fiscal_period=fiscal_period,
            period_start_date=period_start_date,
            period_end_date=period_end_date,
            period_total_days=period_total_days,
            impure_income_isolated_quarter=impure,
            total_shares_outstanding=shares,
            purification_per_share=purif_per_share,
            lot_slices=slices,
            total_purification_raw=total_raw,
            total_purification_payable=total_payable,
        )
