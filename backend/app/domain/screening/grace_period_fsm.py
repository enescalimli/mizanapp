from typing import List, Tuple

from app.domain.screening.entities import (
    ComplianceStatus,
    PriorScreeningState,
    RatioEvaluationDetail,
    ScreeningStandardConfig,
)


class GracePeriodStateMachine:
    """Tampon Bölge (Tolerance Band) ve Hoşgörü Süresi (Grace Period) Durum Makinesi (FSM)."""

    @staticmethod
    def transition(
        is_sector_compliant: bool,
        debt_eval: RatioEvaluationDetail,
        cash_eval: RatioEvaluationDetail,
        income_eval: RatioEvaluationDetail,
        standard: ScreeningStandardConfig,
        prior_state: PriorScreeningState,
    ) -> Tuple[ComplianceStatus, int, bool, List[str]]:
        notes: List[str] = []

        # 1. Sektör ve Uygunsuz Gelir (< %5) için sıfır tolerans (Kesin Kırmızı Çizgi)
        if not is_sector_compliant:
            notes.append("Sector assessment failed: zero tolerance applied.")
            return (
                ComplianceStatus.NON_COMPLIANT,
                prior_state.consecutive_breach_quarters + 1,
                False,
                notes,
            )

        if not income_eval.is_strictly_compliant:
            notes.append(
                f"Impure income ratio ({income_eval.ratio}) reached or exceeded threshold "
                f"({income_eval.threshold}): zero tolerance applied."
            )
            return (
                ComplianceStatus.NON_COMPLIANT,
                prior_state.consecutive_breach_quarters + 1,
                False,
                notes,
            )

        # 2. Tüm rasyolar katı eşiklerin altında ise -> COMPLIANT ve ihlal sayacı sıfırlanır
        if debt_eval.is_strictly_compliant and cash_eval.is_strictly_compliant:
            if prior_state.consecutive_breach_quarters > 0:
                notes.append("All ratios normalized below strict thresholds; breach counter reset to 0.")
            return (
                ComplianceStatus.COMPLIANT,
                0,
                False,
                notes,
            )

        # 3. Borç veya Nakit rasyolarından en az biri katı eşiği aştı
        new_breach_count = prior_state.consecutive_breach_quarters + 1
        debt_within_tol = (
            debt_eval.is_strictly_compliant or debt_eval.is_within_tolerance_band
        )
        cash_within_tol = (
            cash_eval.is_strictly_compliant or cash_eval.is_within_tolerance_band
        )

        # Tampon bölge üst sınırı (tolerance_ceiling) aşıldıysa doğrudan NON_COMPLIANT
        if not (debt_within_tol and cash_within_tol):
            notes.append(
                f"Balance sheet ratio exceeded tolerance ceiling "
                f"(Debt: {debt_eval.ratio}/{debt_eval.tolerance_ceiling}, "
                f"Cash: {cash_eval.ratio}/{cash_eval.tolerance_ceiling})."
            )
            return (
                ComplianceStatus.NON_COMPLIANT,
                new_breach_count,
                False,
                notes,
            )

        # Daha önce NON_COMPLIANT olan bir şirket tam normalleşme (< eşik) sağlamadan
        # tampon bölgeden GRACE_PERIOD_TOLERANCE statüsüne giremez
        if prior_state.previous_status not in (
            ComplianceStatus.COMPLIANT,
            ComplianceStatus.GRACE_PERIOD_TOLERANCE,
        ):
            notes.append(
                "Previously NON_COMPLIANT company must strictly pass thresholds (< threshold) to re-enter compliant pool."
            )
            return (
                ComplianceStatus.NON_COMPLIANT,
                new_breach_count,
                False,
                notes,
            )

        # Hoşgörü çeyrek süresi kontrolü (Örn: max 2 ardışık çeyrek)
        if (
            standard.grace_period_quarters > 0
            and new_breach_count <= standard.grace_period_quarters
        ):
            notes.append(
                f"Grace Period Tolerance active ({new_breach_count}/{standard.grace_period_quarters} quarters) "
                f"within {standard.tolerance_band_bps} bps tolerance band."
            )
            return (
                ComplianceStatus.GRACE_PERIOD_TOLERANCE,
                new_breach_count,
                True,
                notes,
            )

        notes.append(
            f"Grace period exhausted ({new_breach_count} > {standard.grace_period_quarters} quarters)."
        )
        return (
            ComplianceStatus.NON_COMPLIANT,
            new_breach_count,
            False,
            notes,
        )
