from decimal import Decimal
from typing import Optional

from app.domain.financial_parser.entities import (
    CumulativeQuarterIncomeInput,
    IsolatedQuarterIncomeResult,
)
from app.domain.value_objects.money import ZERO, quantize_amount


class QuarterIsolator:
    """KAP kümülatif gelir tablolarından (Q1=3A, Q2=6A, Q3=9A, Q4=12A)
    tekil çeyrek (isolated quarter) ve TTM (Son 12 Ay) değerlerini ayrıştırır.
    """

    @staticmethod
    def isolate_quarter(
        current: CumulativeQuarterIncomeInput,
        previous_quarter: Optional[CumulativeQuarterIncomeInput] = None,
        prior_year_q4: Optional[CumulativeQuarterIncomeInput] = None,
        prior_year_same_quarter: Optional[CumulativeQuarterIncomeInput] = None,
    ) -> IsolatedQuarterIncomeResult:
        used_floor = False

        if current.fiscal_quarter == 1:
            rev_iso = current.revenue_cumulative
            int_iso = current.interest_income_cumulative
            side_iso = current.non_compliant_side_income_cumulative
            fx_iso = current.fx_gain_interest_bearing_cumulative
            net_iso = current.net_income_cumulative
        else:
            if previous_quarter is None:
                raise ValueError(
                    f"previous_quarter (Q{current.fiscal_quarter - 1}) is required "
                    f"to isolate Q{current.fiscal_quarter} for year {current.fiscal_year}."
                )
            if (
                previous_quarter.fiscal_year != current.fiscal_year
                or previous_quarter.fiscal_quarter != current.fiscal_quarter - 1
            ):
                raise ValueError(
                    f"previous_quarter must be {current.fiscal_year}-Q{current.fiscal_quarter - 1}, "
                    f"got {previous_quarter.fiscal_year}-Q{previous_quarter.fiscal_quarter}."
                )

            raw_rev = quantize_amount(
                current.revenue_cumulative - previous_quarter.revenue_cumulative
            )
            raw_int = quantize_amount(
                current.interest_income_cumulative
                - previous_quarter.interest_income_cumulative
            )
            raw_side = quantize_amount(
                current.non_compliant_side_income_cumulative
                - previous_quarter.non_compliant_side_income_cumulative
            )
            raw_fx = quantize_amount(
                current.fx_gain_interest_bearing_cumulative
                - previous_quarter.fx_gain_interest_bearing_cumulative
            )
            net_iso = quantize_amount(
                current.net_income_cumulative - previous_quarter.net_income_cumulative
            )

            # EC-07: Kur farkı geri dönüşü veya TMS 29 düzeltmesi nedeniyle
            # tekil çeyrek uygunsuz gelir kalemleri negatif olamaz (max(0, diff)).
            if raw_rev < ZERO or raw_int < ZERO or raw_side < ZERO or raw_fx < ZERO:
                used_floor = True

            rev_iso = max(ZERO, raw_rev)
            int_iso = max(ZERO, raw_int)
            side_iso = max(ZERO, raw_side)
            fx_iso = max(ZERO, raw_fx)

        total_impure_iso = quantize_amount(int_iso + side_iso + fx_iso)

        # TTM (Son 12 Ay) Hesabı
        rev_ttm: Optional[Decimal] = None
        impure_ttm: Optional[Decimal] = None

        current_total_impure_cum = quantize_amount(
            current.interest_income_cumulative
            + current.non_compliant_side_income_cumulative
            + current.fx_gain_interest_bearing_cumulative
        )

        if current.fiscal_quarter == 4:
            rev_ttm = current.revenue_cumulative
            impure_ttm = max(ZERO, current_total_impure_cum)
        elif prior_year_q4 is not None and prior_year_same_quarter is not None:
            raw_rev_ttm = quantize_amount(
                current.revenue_cumulative
                + prior_year_q4.revenue_cumulative
                - prior_year_same_quarter.revenue_cumulative
            )
            py_q4_impure = quantize_amount(
                prior_year_q4.interest_income_cumulative
                + prior_year_q4.non_compliant_side_income_cumulative
                + prior_year_q4.fx_gain_interest_bearing_cumulative
            )
            py_same_impure = quantize_amount(
                prior_year_same_quarter.interest_income_cumulative
                + prior_year_same_quarter.non_compliant_side_income_cumulative
                + prior_year_same_quarter.fx_gain_interest_bearing_cumulative
            )
            raw_impure_ttm = quantize_amount(
                current_total_impure_cum + py_q4_impure - py_same_impure
            )
            rev_ttm = max(ZERO, raw_rev_ttm)
            impure_ttm = max(ZERO, raw_impure_ttm)

        return IsolatedQuarterIncomeResult(
            fiscal_year=current.fiscal_year,
            fiscal_quarter=current.fiscal_quarter,
            revenue_isolated_quarter=rev_iso,
            interest_income_isolated_quarter=int_iso,
            non_compliant_side_income_isolated_quarter=side_iso,
            fx_gain_interest_bearing_isolated_quarter=fx_iso,
            total_impure_income_isolated_quarter=total_impure_iso,
            net_income_isolated_quarter=net_iso,
            revenue_ttm=rev_ttm,
            total_impure_income_ttm=impure_ttm,
            used_fx_reversal_floor=used_floor,
        )
