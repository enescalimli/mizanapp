from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from app.domain.purification_zakat.entities import DividendPurificationResult
from app.domain.value_objects.money import (
    ONE,
    ZERO,
    quantize_amount,
    quantize_purification_currence,
    quantize_ratio,
    quantize_share_quantity,
    quantize_unit_price,
    strict_decimal,
)


class DividendPurifier:
    """Yöntem 2: Temettü Bazlı Arındırma (Dividend Purification).

    Formül:
        P_dividend = Dağıtılan Net/Brüt Temettü * (Toplam Uygunsuz Gelir / Toplam Hasılat)
    """

    @staticmethod
    def calculate(
        ticker: str,
        dividend_received: Decimal,
        impure_income_total: Decimal,
        total_revenue: Decimal,
        is_gross_basis: bool = True,
        payable_rounding: str = ROUND_HALF_UP,
    ) -> DividendPurificationResult:
        div = quantize_amount(strict_decimal(dividend_received))
        impure = quantize_amount(strict_decimal(impure_income_total))
        rev = quantize_amount(strict_decimal(total_revenue))

        if div < ZERO:
            raise ValueError(f"dividend_received cannot be negative: {div}")
        if impure < ZERO:
            raise ValueError(f"impure_income_total cannot be negative: {impure}")
        if rev < ZERO:
            raise ValueError(f"total_revenue cannot be negative: {rev}")

        if rev == ZERO:
            ratio = ZERO if impure == ZERO else quantize_ratio(ONE)
        else:
            ratio = quantize_ratio(impure / rev, rounding=ROUND_HALF_UP)

        raw_purif = quantize_amount(div * ratio, rounding=ROUND_HALF_UP)
        payable = quantize_purification_currence(raw_purif, rounding=payable_rounding)

        return DividendPurificationResult(
            ticker=ticker,
            dividend_received=div,
            is_gross_basis=is_gross_basis,
            impure_income_total=impure,
            total_revenue=rev,
            impure_income_ratio=ratio,
            purification_raw=raw_purif,
            purification_payable=payable,
        )

    @classmethod
    def calculate_from_lots(
        cls,
        ticker: str,
        quantity_lots: Decimal,
        dividend_per_share: Decimal,
        impure_income_total: Decimal,
        total_revenue: Decimal,
        is_gross_basis: bool = True,
        payable_rounding: str = ROUND_HALF_UP,
    ) -> DividendPurificationResult:
        lots = quantize_share_quantity(strict_decimal(quantity_lots))
        dps = quantize_unit_price(strict_decimal(dividend_per_share))
        if lots < ZERO or dps < ZERO:
            raise ValueError("quantity_lots and dividend_per_share cannot be negative")
        total_div = quantize_amount(lots * dps, rounding=ROUND_HALF_UP)
        return cls.calculate(
            ticker=ticker,
            dividend_received=total_div,
            impure_income_total=impure_income_total,
            total_revenue=total_revenue,
            is_gross_basis=is_gross_basis,
            payable_rounding=payable_rounding,
        )
