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

    Formül (TKBB Pay Senedi İhracı ve Alım-Satımı Standardı Madde 3.2.1 & 3.6.2):
        P_holding = (Enflasyondan Arındırılmış Dönemlik Mahzurlu Gelir / Toplam Pay Sayısı)
                    * Lot * (Eldeki Gün / Dönem Gün)

    EC-03 & TKBB Madde 3.2.1 Kuralı: Şirketin kâr elde edip etmemesi (net_income < 0)
    ya da kâr dağıtımı (temettü) yapıp yapmaması arındırma yükümlülüğü açısından
    farklılık oluşturmaz; pozitif mahzurlu geliri varsa arındırma tam olarak hesaplanır.
    """

    @staticmethod
    def apply_tkbb_inflation_adjustment(
        interest_income_period: Decimal,
        interest_bearing_cash_principal: Decimal,
        period_inflation_rate: Decimal,
        other_impure_operating_income: Decimal = ZERO,
    ) -> Decimal:
        """TKBB Pay Senedi Standardı Madde 3.6.2:
        'Faiz gelirlerinden, enflasyon oranı kadar olan kısım (anaparanın değer kaybı
        telafisi olduğu için) düşüldükten sonra kalan reel faiz kısmı arındırmaya tabi tutulur.'
        Faiz dışı mahzurlu faaliyet gelirleri ise enflasyon indirimine tabi tutulmadan tam eklenir.
        """
        interest_inc = quantize_amount(strict_decimal(interest_income_period))
        principal = quantize_amount(strict_decimal(interest_bearing_cash_principal))
        inf_rate = strict_decimal(period_inflation_rate)
        other_impure = quantize_amount(strict_decimal(other_impure_operating_income))

        if interest_inc < ZERO:
            raise ValueError(f"interest_income_period cannot be negative: {interest_inc}")
        if principal < ZERO:
            raise ValueError(f"interest_bearing_cash_principal cannot be negative: {principal}")
        if other_impure < ZERO:
            raise ValueError(f"other_impure_operating_income cannot be negative: {other_impure}")

        effective_inf_rate = max(ZERO, inf_rate)
        inflation_erosion = quantize_amount(principal * effective_inf_rate, rounding=ROUND_HALF_UP)
        real_interest_above_inflation = max(ZERO, interest_inc - inflation_erosion)
        return quantize_amount(real_interest_above_inflation + other_impure, rounding=ROUND_HALF_UP)

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
        strict_single_period: bool = False,
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
        if days_held < 0:
            raise ValueError(f"days_held ({days_held}) cannot be negative")
        if strict_single_period and days_held > period_total_days:
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
