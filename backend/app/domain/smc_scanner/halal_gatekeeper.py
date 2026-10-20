from typing import Sequence
from app.domain.smc_scanner.entities import SMCSignal, SignalStatus


class HalalGatekeeper:
    """
    Shariah Gatekeeper for Technical Analysis & Smart Money Concepts.
    Guarantees that NO technical signals are generated or emitted for NON_COMPLIANT stocks.
    When a company breaches compliance thresholds in a new quarterly filing,
    any existing active SMC signals are immediately archived with ARCHIVED_DUE_TO_NON_COMPLIANCE.
    """

    ELIGIBLE_STATUSES = frozenset({"COMPLIANT", "GRACE_PERIOD_TOLERANCE"})

    @classmethod
    def is_eligible(cls, overall_status: str) -> bool:
        """Checks if a company is compliant or in allowable grace period."""
        return str(overall_status).upper() in cls.ELIGIBLE_STATUSES

    @classmethod
    def filter_eligible_tickers(cls, company_status_map: dict[str, str]) -> list[str]:
        """Returns list of tickers that pass the Shariah gatekeeper filter."""
        return [ticker for ticker, status in company_status_map.items() if cls.is_eligible(status)]

    @classmethod
    def apply_gatekeeper_to_signals(
        cls, signals: Sequence[SMCSignal], current_compliance_status: str
    ) -> list[SMCSignal]:
        """
        Audits existing signals against the company's current Katilim compliance status.
        If non-compliant, transforms all active signals to ARCHIVED_DUE_TO_NON_COMPLIANCE.
        """
        is_safe = cls.is_eligible(current_compliance_status)
        processed: list[SMCSignal] = []

        for sig in signals:
            if not is_safe:
                sig.status = SignalStatus.ARCHIVED_DUE_TO_NON_COMPLIANCE
                sig.metadata_json["archival_reason"] = (
                    f"Şirket katılım uygunluk şartlarını ihlal ettiği için ({current_compliance_status}) "
                    "SMC teknik analiz sinyali yayından kaldırılmıştır."
                )
            processed.append(sig)

        return processed
