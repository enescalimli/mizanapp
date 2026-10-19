from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, Sequence

from app.domain.screening.entities import (
    DenominatorRule,
    FinancialScreeningInput,
    MarketValuationInput,
    RatioEvaluationDetail,
    ScreeningStandardConfig,
)
from app.domain.value_objects.money import (
    ONE,
    ZERO,
    BasisPoints,
    quantize_amount,
    quantize_ratio,
    strict_decimal,
)

TRADING_DAYS_12M = 252
TRADING_DAYS_24M = 504
TRADING_DAYS_36M = 756


class RatioCalculator:
    """BIST Katılım ve AAOIFI finansal rasyo, hareketli ortalama payda ve
    hisse başı arındırma/zekat metrikleri hesaplayıcısı.
    """

    @staticmethod
    def compute_moving_average_mcap(
        daily_mcaps: Sequence[Decimal],
        window_days: int,
    ) -> Decimal:
        """Tarihsel günlük piyasa değeri serisinden son N işlem gününün aritmetik ortalamasını hesaplar."""
        if not daily_mcaps:
            raise ValueError("daily_mcaps series cannot be empty")
        if window_days <= 0:
            raise ValueError(f"window_days must be positive, got {window_days}")

        sliced = daily_mcaps[-window_days:]
        total = ZERO
        for val in sliced:
            dec_val = strict_decimal(val)
            if dec_val < ZERO:
                raise ValueError(f"Market cap value cannot be negative: {dec_val}")
            total += dec_val

        count = Decimal(len(sliced))
        return quantize_amount(total / count, rounding=ROUND_HALF_UP)

    @classmethod
    def resolve_effective_mcap(
        cls,
        valuation: MarketValuationInput,
        moving_avg_months: int = 0,
    ) -> Decimal:
        """Seçilen hareketli ortalama ay sayısına (0, 12, 24, 36) göre efektif piyasa değerini çözer."""
        if moving_avg_months == 12:
            if valuation.mcap_ma_12m is not None and valuation.mcap_ma_12m > ZERO:
                return valuation.mcap_ma_12m
            if valuation.historical_daily_mcaps:
                return cls.compute_moving_average_mcap(
                    valuation.historical_daily_mcaps, TRADING_DAYS_12M
                )
        elif moving_avg_months == 24:
            if valuation.mcap_ma_24m is not None and valuation.mcap_ma_24m > ZERO:
                return valuation.mcap_ma_24m
            if valuation.historical_daily_mcaps:
                return cls.compute_moving_average_mcap(
                    valuation.historical_daily_mcaps, TRADING_DAYS_24M
                )
        elif moving_avg_months == 36:
            if valuation.mcap_ma_36m is not None and valuation.mcap_ma_36m > ZERO:
                return valuation.mcap_ma_36m
            if valuation.historical_daily_mcaps:
                return cls.compute_moving_average_mcap(
                    valuation.historical_daily_mcaps, TRADING_DAYS_36M
                )
        return valuation.spot_market_cap

    @classmethod
    def resolve_denominator(
        cls,
        rule: DenominatorRule,
        financials: FinancialScreeningInput,
        valuation: MarketValuationInput,
        moving_avg_months: int = 0,
    ) -> Decimal:
        """Standardın payda kuralına (DenominatorRule) göre rasyo paydasını belirler."""
        if rule == DenominatorRule.TOTAL_ASSETS:
            return financials.total_assets

        if rule == DenominatorRule.MCAP_MA_12M:
            return cls.resolve_effective_mcap(valuation, moving_avg_months=12)

        if rule == DenominatorRule.MCAP_MA_24M:
            return cls.resolve_effective_mcap(valuation, moving_avg_months=24)

        if rule == DenominatorRule.MCAP_MA_36M:
            return cls.resolve_effective_mcap(valuation, moving_avg_months=36)

        if rule == DenominatorRule.SPOT_MCAP:
            if moving_avg_months in (12, 24, 36):
                return cls.resolve_effective_mcap(valuation, moving_avg_months=moving_avg_months)
            return valuation.spot_market_cap

        if rule == DenominatorRule.MAX_OF_MCAP_OR_ASSETS:
            effective_mcap = cls.resolve_effective_mcap(
                valuation, moving_avg_months=moving_avg_months
            )
            return max(financials.total_assets, effective_mcap)

        return valuation.spot_market_cap

    @staticmethod
    def evaluate_balance_sheet_ratio(
        numerator: Decimal,
        denominator: Decimal,
        threshold: Decimal,
        tolerance_band_bps: int,
        strict_less_than: bool = True,
    ) -> RatioEvaluationDetail:
        """Faizli Borç veya Faizli Nakit/Varlık rasyosunu ve tampon bölgeyi (tolerance band) değerlendirir."""
        num = quantize_amount(strict_decimal(numerator))
        den = quantize_amount(strict_decimal(denominator))
        thresh = quantize_ratio(strict_decimal(threshold))
        tol_delta = BasisPoints(tolerance_band_bps).to_decimal()
        tol_ceiling = quantize_ratio(thresh + tol_delta)

        if den <= ZERO:
            if num == ZERO:
                return RatioEvaluationDetail(
                    numerator=num,
                    denominator=den,
                    ratio=ZERO,
                    threshold=thresh,
                    tolerance_ceiling=tol_ceiling,
                    is_strictly_compliant=True,
                    is_within_tolerance_band=False,
                )
            return RatioEvaluationDetail(
                numerator=num,
                denominator=den,
                ratio=quantize_ratio(ONE),
                threshold=thresh,
                tolerance_ceiling=tol_ceiling,
                is_strictly_compliant=False,
                is_within_tolerance_band=False,
            )

        ratio = quantize_ratio(num / den, rounding=ROUND_HALF_UP)

        if strict_less_than:
            is_strictly_ok = ratio < thresh
            is_in_tolerance = (not is_strictly_ok) and (ratio < tol_ceiling)
        else:
            is_strictly_ok = ratio <= thresh
            is_in_tolerance = (not is_strictly_ok) and (ratio <= tol_ceiling)

        return RatioEvaluationDetail(
            numerator=num,
            denominator=den,
            ratio=ratio,
            threshold=thresh,
            tolerance_ceiling=tol_ceiling,
            is_strictly_compliant=is_strictly_ok,
            is_within_tolerance_band=is_in_tolerance,
        )

    @staticmethod
    def evaluate_income_ratio(
        impure_income_ttm: Decimal,
        total_revenue_ttm: Decimal,
        threshold: Decimal,
        strict_less_than: bool = True,
    ) -> RatioEvaluationDetail:
        """Uygun olmayan gelir oranını (< %5) değerlendirir.
        EC-06: Sıfır hasılat durumunda DivisionByZero fırlatmaz; uygunsuz gelir > 0 ise %100 (1.0) atar.
         Gelir rasyosunda tampon bölge (tolerance) uygulanmaz.
        """
        num = quantize_amount(strict_decimal(impure_income_ttm))
        den = quantize_amount(strict_decimal(total_revenue_ttm))
        thresh = quantize_ratio(strict_decimal(threshold))

        if den <= ZERO:
            if num == ZERO:
                return RatioEvaluationDetail(
                    numerator=num,
                    denominator=den,
                    ratio=ZERO,
                    threshold=thresh,
                    tolerance_ceiling=thresh,
                    is_strictly_compliant=True,
                    is_within_tolerance_band=False,
                )
            # EC-06: Hasılat 0 ama faiz/uygunsuz gelir > 0 -> Oran 1.00000000 (%100), NON_COMPLIANT
            return RatioEvaluationDetail(
                numerator=num,
                denominator=den,
                ratio=quantize_ratio(ONE),
                threshold=thresh,
                tolerance_ceiling=thresh,
                is_strictly_compliant=False,
                is_within_tolerance_band=False,
            )

        ratio = quantize_ratio(num / den, rounding=ROUND_HALF_UP)
        is_strictly_ok = (ratio < thresh) if strict_less_than else (ratio <= thresh)

        return RatioEvaluationDetail(
            numerator=num,
            denominator=den,
            ratio=ratio,
            threshold=thresh,
            tolerance_ceiling=thresh,
            is_strictly_compliant=is_strictly_ok,
            is_within_tolerance_band=False,
        )

    @staticmethod
    def compute_per_share_metrics(
        financials: FinancialScreeningInput,
        income_ratio_detail: RatioEvaluationDetail,
    ) -> tuple[Decimal, Decimal, Decimal]:
        """Hisse başı çeyreklik arındırma tutarı, temettü arındırma oranı ve
        hisse başı zekata tabi net dönen varlık (EC-04 korumalı) değerlerini hesaplar.
        """
        shares = financials.total_shares_outstanding
        purification_per_share_quarter = quantize_ratio(
            financials.impure_income_isolated_quarter / shares,
            rounding=ROUND_HALF_UP,
        )
        purification_ratio_dividend = income_ratio_detail.ratio

        # EC-04: Negatif Net Dönen Varlık zekat matrahını negatife düşüremez -> max(0, net_zatable)
        net_zatable_total = max(
            ZERO, financials.zatable_current_assets - financials.current_liabilities
        )
        zatable_per_share = quantize_ratio(
            net_zatable_total / shares,
            rounding=ROUND_HALF_UP,
        )
        return (
            purification_per_share_quarter,
            purification_ratio_dividend,
            zatable_per_share,
        )
