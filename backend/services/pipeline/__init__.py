"""MizanApp.tr Katılım Finans Veri Boru Hattı (Data Pipeline) Paketi."""

from services.pipeline.kap_parser import (
    CANONICAL_KAP_SNAPSHOTS,
    KAPFinancialParser,
    KAPFinancialSnapshot,
    KAPMultiStandardEvaluation,
    parse_kap_financial_html,
)
from services.pipeline.run_pipeline import (
    DataPipelineOrchestrator,
    PipelineExecutionResult,
    router,
    run_pipeline,
)
from services.pipeline.sync_db import (
    ComplianceStatusChange,
    SupabaseStockSyncService,
    SupabaseSyncReport,
)
from services.pipeline.tkbb_sync import (
    CANONICAL_TKBB_ANNOUNCEMENT_HTML,
    TKBBIndexRecord,
    TKBBReasonCode,
    TKBBSyncService,
    classify_tkbb_reason_code,
    parse_tkbb_announcement_html,
)

__all__ = [
    "CANONICAL_KAP_SNAPSHOTS",
    "CANONICAL_TKBB_ANNOUNCEMENT_HTML",
    "ComplianceStatusChange",
    "DataPipelineOrchestrator",
    "KAPFinancialParser",
    "KAPFinancialSnapshot",
    "KAPMultiStandardEvaluation",
    "PipelineExecutionResult",
    "SupabaseStockSyncService",
    "SupabaseSyncReport",
    "TKBBIndexRecord",
    "TKBBReasonCode",
    "TKBBSyncService",
    "classify_tkbb_reason_code",
    "parse_kap_financial_html",
    "parse_tkbb_announcement_html",
    "router",
    "run_pipeline",
]
