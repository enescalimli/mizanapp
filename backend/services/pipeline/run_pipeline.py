"""MizanApp.tr Veri Boru Hattı (Data Pipeline) Orkestratörü, CLI / Cron ve FastAPI Tetikleyicisi.

Bu modül tüm veri boru hattını tek komutla, zamanlanmış görevle (cron job) veya
FastAPI endpoint'i üzerinden uçtan uca çalıştırır:
1. `TKBBSyncService` ile BIST Katılım Endeksi ve TKBB dönemsel listesini tarar.
2. `KAPFinancialParser` ile çeyreklik KAP finansal tablolarını çekip Faz 2'deki
   `ScreeningEngine` (BIST Katılım %33/%33/%5 & AAOIFI %30/%30/%5) ile denetler.
3. `pandas.DataFrame` üzerinde TKBB ve KAP denetim sonuçlarını birleştirir.
4. `SupabaseStockSyncService` ile sonuçları `public.stocks_data` tablosuna `upsert`
   eder ve uygunluk durumundaki değişiklikleri tespit edip loglar.

Kullanım (CLI / Cron):
    python -m services.pipeline.run_pipeline --period 2026-Q2
    python -m services.pipeline.run_pipeline --tickers BIMAS THYAO PGSUS --dry-run
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

# Doğrudan `python backend/services/pipeline/run_pipeline.py` olarak çalıştırıldığında
# `backend/` dizinini sys.path'e ekle
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

import httpx
import pandas as pd
from fastapi import APIRouter

from services.pipeline.kap_parser import KAPFinancialParser, KAPMultiStandardEvaluation
from services.pipeline.sync_db import SupabaseStockSyncService, SupabaseSyncReport
from services.pipeline.tkbb_sync import TKBBIndexRecord, TKBBSyncService

logger = logging.getLogger(__name__)


@dataclass
class PipelineExecutionResult:
    """Uçtan uca veri boru hattı çalışma özeti ve birleştirilmiş veri çıktısı."""

    effective_period: str
    tkbb_records: List[TKBBIndexRecord]
    kap_evaluations: List[KAPMultiStandardEvaluation]
    sync_report: SupabaseSyncReport
    merged_dataframe: pd.DataFrame
    executed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_summary_dict(self) -> Dict[str, Any]:
        bist_compliant_count = sum(
            1 for ev in self.kap_evaluations if ev.is_bist_katilim_compliant
        )
        aaoifi_compliant_count = sum(
            1 for ev in self.kap_evaluations if ev.is_aaoifi_compliant
        )
        non_compliant_tickers = [
            ev.snapshot.ticker
            for ev in self.kap_evaluations
            if not ev.is_bist_katilim_compliant
        ]
        at_risk_tickers = [
            ev.snapshot.ticker
            for ev in self.kap_evaluations
            if ev.compliance_status == "AT_RISK"
        ]
        return {
            "effective_period": self.effective_period,
            "executed_at": self.executed_at.isoformat(),
            "tkbb_scraped_count": len(self.tkbb_records),
            "kap_evaluated_count": len(self.kap_evaluations),
            "bist_compliant_count": bist_compliant_count,
            "aaoifi_compliant_count": aaoifi_compliant_count,
            "non_compliant_tickers": non_compliant_tickers,
            "at_risk_tickers": at_risk_tickers,
            "sync_report": self.sync_report.to_dict(),
        }


class DataPipelineOrchestrator:
    """TKBB Scraper, KAP Parser (`ScreeningEngine`) ve Supabase Upsert adımlarını yöneten orkestratör."""

    def __init__(
        self,
        tkbb_service: Optional[TKBBSyncService] = None,
        kap_parser: Optional[KAPFinancialParser] = None,
        sync_service: Optional[SupabaseStockSyncService] = None,
    ) -> None:
        self.tkbb_service = tkbb_service or TKBBSyncService()
        self.kap_parser = kap_parser or KAPFinancialParser()
        self.sync_service = sync_service or SupabaseStockSyncService()

    async def execute(
        self,
        tickers: Optional[Sequence[str]] = None,
        effective_period: str = "2026-Q2",
        dry_run: bool = False,
        existing_rows: Optional[Dict[str, Dict[str, Any]]] = None,
        http_client: Optional[httpx.AsyncClient] = None,
    ) -> PipelineExecutionResult:
        """Tüm veri boru hattını sırasıyla çalıştırır ve sonuç raporunu döner."""
        logger.info(
            "MizanApp Veri Boru Hattı başlatılıyor (Dönem: %s, DryRun: %s)...",
            effective_period,
            dry_run,
        )

        # 1. TKBB & BIST Katılım dönemsel duyuru listesini çek
        tkbb_records = await self.tkbb_service.fetch_periodic_list(
            effective_period=effective_period,
            client=http_client,
        )
        if tickers:
            wanted = {t.strip().upper() for t in tickers}
            tkbb_records = [r for r in tkbb_records if r.ticker in wanted]

        tkbb_df = self.tkbb_service.to_dataframe(tkbb_records)

        # 2. KAP çeyreklik finansal verilerini çek ve ScreeningEngine (BIST + AAOIFI) ile denetle
        target_tickers = (
            [t.strip().upper() for t in tickers]
            if tickers
            else [r.ticker for r in tkbb_records]
        )
        kap_evaluations = await self.kap_parser.fetch_and_evaluate_batch(
            tickers=target_tickers,
            client=http_client,
        )
        kap_df = self.kap_parser.to_dataframe(kap_evaluations)

        # 3. Pandas üzerinde TKBB resmi durumu ile KAP finansal tarama tablosunu birleştir
        if not tkbb_df.empty and not kap_df.empty:
            merged_df = pd.merge(
                kap_df,
                tkbb_df[["ticker", "is_compliant", "reason_code", "effective_period"]].rename(
                    columns={
                        "is_compliant": "tkbb_official_compliant",
                        "reason_code": "tkbb_reason_code",
                    }
                ),
                on="ticker",
                how="left",
            )
        else:
            merged_df = kap_df

        # 4. Supabase `stocks_data` tablosuna upsert et ve durum değişimlerini logla
        sync_report = await self.sync_service.upsert_to_supabase(
            evaluations=kap_evaluations,
            tkbb_records=tkbb_records,
            existing_rows=existing_rows,
            client=http_client,
            dry_run=dry_run,
        )

        logger.info(
            "MizanApp Veri Boru Hattı tamamlandı: %d hisse işlendi, %d durum değişimi kaydedildi.",
            sync_report.upserted_count,
            len(sync_report.status_changes),
        )

        return PipelineExecutionResult(
            effective_period=effective_period,
            tkbb_records=tkbb_records,
            kap_evaluations=kap_evaluations,
            sync_report=sync_report,
            merged_dataframe=merged_df,
        )


async def run_pipeline(
    tickers: Optional[Sequence[str]] = None,
    effective_period: str = "2026-Q2",
    dry_run: bool = False,
    existing_rows: Optional[Dict[str, Dict[str, Any]]] = None,
) -> PipelineExecutionResult:
    """Pipeline'ı tek fonksiyon çağrısıyla çalıştıran yardımcı giriş noktası."""
    orchestrator = DataPipelineOrchestrator()
    return await orchestrator.execute(
        tickers=tickers,
        effective_period=effective_period,
        dry_run=dry_run,
        existing_rows=existing_rows,
    )


# FastAPI üzerinden de tetiklenebilmesi için modüler router
router = APIRouter(prefix="/pipeline", tags=["Data Pipeline"])


@router.post("/sync")
async def trigger_pipeline_sync_endpoint(
    effective_period: str = "2026-Q2",
    dry_run: bool = True,
) -> Dict[str, Any]:
    """FastAPI üzerinden TKBB + KAP + ScreeningEngine + Supabase senkronizasyonunu tetikler."""
    result = await run_pipeline(effective_period=effective_period, dry_run=dry_run)
    return result.to_summary_dict()


def _build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="MizanApp.tr TKBB & KAP Katılım Finans Veri Boru Hattı (CLI / Cron)"
    )
    parser.add_argument(
        "--tickers",
        nargs="*",
        default=None,
        help="Sadece belirtilen hisse kodlarını çalıştır (örn: BIMAS THYAO PGSUS)",
    )
    parser.add_argument(
        "--period",
        default="2026-Q2",
        help="Finansal değerlendirme dönemi (varsayılan: 2026-Q2)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Supabase'e ağ isteği göndermeden yerel doğrulama ve raporlama çalıştır",
    )
    parser.add_argument(
        "--output-json",
        type=str,
        default=None,
        help="Çalışma özetini belirtilen JSON dosyasına kaydet",
    )
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    """CLI ve Cron Job giriş noktası."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    parser = _build_arg_parser()
    args = parser.parse_args(argv)

    result = asyncio.run(
        run_pipeline(
            tickers=args.tickers,
            effective_period=args.period,
            dry_run=args.dry_run,
        )
    )
    summary = result.to_summary_dict()

    if args.output_json:
        out_path = Path(args.output_json)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(
            json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        logger.info("Pipeline özeti %s dosyasına yazıldı.", out_path)

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
