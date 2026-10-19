"""Supabase `stocks_data` Veri Eşitleyici ve Uygunluk Durum Değişimi Dedektörü.

Bu modül:
1. `KAPFinancialParser` + `ScreeningEngine` tarafından üretilen çoklu standart (BIST & AAOIFI)
   denetim sonuçlarını ve `TKBBSyncService` duyuru kayıtlarını birleştirir.
2. Hisselerin önceki uygunluk durumları ile yeni hesaplanan durumlarını karşılaştırarak
   uygunluktan çıkış (`EXITED_COMPLIANCE`), uygunluğa giriş (`ENTERED_COMPLIANCE`),
   risk bölgesine geçiş (`ENTERED_RISK_ZONE`) veya TKBB-KAP uyuşmazlığı (`TKBB_DECISION_MISMATCH`)
   gibi geçişleri tespit edip yapılandırılmış olarak loglar.
3. Hazırlanan `Decimal` hassasiyetli kayıtları Supabase `public.stocks_data` tablosuna
   `ON CONFLICT (ticker) DO UPDATE` (`upsert`) semantiğiyle yazar.
"""

from __future__ import annotations

import logging
import os
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP
from typing import Any, Dict, List, Optional, Sequence

import httpx

from app.domain.value_objects.money import (
    DECIMAL_2_PLACES,
    DECIMAL_4_PLACES,
    DECIMAL_6_PLACES,
)
from services.pipeline.kap_parser import KAPMultiStandardEvaluation
from services.pipeline.tkbb_sync import TKBBIndexRecord

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ComplianceStatusChange:
    """Bir hissenin uygunluk durumundaki değişimi temsil eden denetim kaydı."""

    ticker: str
    company_name: str
    previous_status: str
    new_status: str
    previous_bist_compliant: Optional[bool]
    new_bist_compliant: bool
    previous_aaoifi_compliant: Optional[bool]
    new_aaoifi_compliant: bool
    change_type: str  # 'EXITED_COMPLIANCE', 'ENTERED_COMPLIANCE', 'ENTERED_RISK_ZONE', 'STATUS_UPDATED', 'TKBB_DECISION_MISMATCH'
    reason_summary: str
    detected_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["detected_at"] = self.detected_at.isoformat()
        return data


@dataclass
class SupabaseSyncReport:
    """Supabase `stocks_data` upsert ve durum değişimi denetim raporu."""

    total_processed: int
    upserted_count: int
    status_changes: List[ComplianceStatusChange]
    upserted_tickers: List[str]
    mode: str  # 'LIVE_SUPABASE' veya 'DRY_RUN_LOCAL'
    synced_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    payload_snapshot: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_processed": self.total_processed,
            "upserted_count": self.upserted_count,
            "upserted_tickers": self.upserted_tickers,
            "mode": self.mode,
            "synced_at": self.synced_at.isoformat(),
            "status_changes": [change.to_dict() for change in self.status_changes],
        }


class SupabaseStockSyncService:
    """Çekilen ve filtrelenen verileri Supabase `stocks_data` tablosuna `upsert` eden servis."""

    def __init__(
        self,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None,
        timeout_seconds: float = 20.0,
    ) -> None:
        self.supabase_url = (
            supabase_url
            or os.getenv("SUPABASE_URL")
            or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
            or ""
        ).rstrip("/")
        self.supabase_key = (
            supabase_key
            or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or os.getenv("SUPABASE_KEY")
            or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
            or ""
        )
        self.timeout_seconds = timeout_seconds

    @property
    def is_configured(self) -> bool:
        """Supabase URL ve API anahtarının tanımlı olup olmadığını kontrol eder."""
        return bool(
            self.supabase_url
            and self.supabase_key
            and not self.supabase_url.startswith("https://your-project")
        )

    def _rest_headers(self, prefer: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
        }
        if prefer:
            headers["Prefer"] = prefer
        return headers

    @staticmethod
    def build_stocks_data_payload(
        ev: KAPMultiStandardEvaluation,
        tkbb_record: Optional[TKBBIndexRecord] = None,
    ) -> Dict[str, Any]:
        """`KAPMultiStandardEvaluation` ve `TKBBIndexRecord` verisini `public.stocks_data` şemasına dönüştürür."""
        snap = ev.snapshot
        reasons = list(ev.compliance_reasons)

        if tkbb_record is not None:
            tkbb_tag = (
                f"TKBB_RESMI_LISTE ({tkbb_record.effective_period}): "
                f"{'UYGUN' if tkbb_record.is_compliant else 'UYGUN DEĞİL'} "
                f"[{tkbb_record.reason_code}] - {tkbb_record.reason_description}"
            )
            if tkbb_tag not in reasons:
                reasons.insert(0, tkbb_tag)

        sparkline_strings = [
            float(val.quantize(DECIMAL_2_PLACES, rounding=ROUND_HALF_UP))
            for val in snap.historical_sparkline
        ]

        return {
            "ticker": snap.ticker,
            "company_name": snap.company_name,
            "sector": snap.sector,
            "sub_sector": tkbb_record.sector if tkbb_record else snap.sector,
            "is_bist_katilim_compliant": ev.is_bist_katilim_compliant,
            "is_aaoifi_compliant": ev.is_aaoifi_compliant,
            "compliance_status": ev.compliance_status,
            "last_price_try": str(
                snap.last_price_try.quantize(DECIMAL_4_PLACES, rounding=ROUND_HALF_UP)
            ),
            "change_24h_percent": str(
                snap.change_24h_percent.quantize(DECIMAL_2_PLACES, rounding=ROUND_HALF_UP)
            ),
            "market_cap_try": str(
                snap.market_cap_try.quantize(DECIMAL_2_PLACES, rounding=ROUND_HALF_UP)
            ),
            "debt_ratio_percent": str(
                ev.debt_ratio_percent.quantize(DECIMAL_4_PLACES, rounding=ROUND_HALF_UP)
            ),
            "cash_ratio_percent": str(
                ev.cash_ratio_percent.quantize(DECIMAL_4_PLACES, rounding=ROUND_HALF_UP)
            ),
            "impure_income_percent": str(
                ev.impure_income_percent.quantize(DECIMAL_4_PLACES, rounding=ROUND_HALF_UP)
            ),
            "purification_per_share_try": str(
                ev.purification_per_share_try.quantize(
                    DECIMAL_6_PLACES, rounding=ROUND_HALF_UP
                )
            ),
            "zatable_net_assets_per_share_try": str(
                ev.zatable_net_assets_per_share_try.quantize(
                    DECIMAL_4_PLACES, rounding=ROUND_HALF_UP
                )
            ),
            "total_shares_outstanding": int(snap.total_shares_outstanding),
            "quarter_impure_income_try": str(
                snap.impure_income_isolated_quarter_try.quantize(
                    DECIMAL_2_PLACES, rounding=ROUND_HALF_UP
                )
            ),
            "last_screening_date": ev.screening_date.isoformat(),
            "fiscal_period": snap.fiscal_period,
            "historical_sparkline": sparkline_strings,
            "compliance_reasons": reasons,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    @staticmethod
    def detect_status_changes(
        previous_records: Dict[str, Dict[str, Any]],
        evaluations: Sequence[KAPMultiStandardEvaluation],
        tkbb_map: Optional[Dict[str, TKBBIndexRecord]] = None,
    ) -> List[ComplianceStatusChange]:
        """Önceki veritabanı kayıtları ile yeni tarama sonuçlarını karşılaştırarak uygunluk değişimlerini tespit eder ve loglar."""
        changes: List[ComplianceStatusChange] = []
        tkbb_lookup = tkbb_map or {}

        for ev in evaluations:
            ticker = ev.snapshot.ticker
            prev = previous_records.get(ticker)
            tkbb_rec = tkbb_lookup.get(ticker)

            # 1. Önceki veritabanı durumu ile yeni hesaplanan durum karşılaştırması
            if prev is not None:
                prev_status = str(prev.get("compliance_status", "UNKNOWN")).upper()
                prev_bist = prev.get("is_bist_katilim_compliant")
                prev_aaoifi = prev.get("is_aaoifi_compliant")

                status_changed = prev_status != ev.compliance_status
                bist_changed = (
                    prev_bist is not None and bool(prev_bist) != ev.is_bist_katilim_compliant
                )
                aaoifi_changed = (
                    prev_aaoifi is not None and bool(prev_aaoifi) != ev.is_aaoifi_compliant
                )

                if status_changed or bist_changed or aaoifi_changed:
                    if prev_bist is True and not ev.is_bist_katilim_compliant:
                        change_type = "EXITED_COMPLIANCE"
                    elif prev_bist is False and ev.is_bist_katilim_compliant:
                        change_type = "ENTERED_COMPLIANCE"
                    elif ev.compliance_status == "AT_RISK" and prev_status == "COMPLIANT":
                        change_type = "ENTERED_RISK_ZONE"
                    elif ev.compliance_status == "COMPLIANT" and prev_status in (
                        "AT_RISK",
                        "IN_GRACE_PERIOD",
                    ):
                        change_type = "RECOVERED_TO_COMPLIANT"
                    else:
                        change_type = "STATUS_UPDATED"

                    reason_summary = (
                        f"{ticker} uygunluk durumu değişti: {prev_status} -> {ev.compliance_status} "
                        f"(BIST: {prev_bist}->{ev.is_bist_katilim_compliant}, "
                        f"AAOIFI: {prev_aaoifi}->{ev.is_aaoifi_compliant}, "
                        f"Borç: %{ev.debt_ratio_percent:.2f})"
                    )
                    change = ComplianceStatusChange(
                        ticker=ticker,
                        company_name=ev.snapshot.company_name,
                        previous_status=prev_status,
                        new_status=ev.compliance_status,
                        previous_bist_compliant=bool(prev_bist) if prev_bist is not None else None,
                        new_bist_compliant=ev.is_bist_katilim_compliant,
                        previous_aaoifi_compliant=(
                            bool(prev_aaoifi) if prev_aaoifi is not None else None
                        ),
                        new_aaoifi_compliant=ev.is_aaoifi_compliant,
                        change_type=change_type,
                        reason_summary=reason_summary,
                    )
                    changes.append(change)
                    logger.warning("[COMPLIANCE_CHANGE] %s | %s", change_type, reason_summary)

            # 2. TKBB resmi duyurusu ile anlık KAP rasyo taraması arasında farklılık varsa uyar
            if tkbb_rec is not None and tkbb_rec.is_compliant != ev.is_bist_katilim_compliant:
                mismatch_summary = (
                    f"{ticker} için TKBB resmi listesi ({tkbb_rec.is_compliant}) ile "
                    f"güncel KAP çeyreklik rasyo testi ({ev.is_bist_katilim_compliant}) farklılaştı! "
                    f"Güncel Borç Oranı: %{ev.debt_ratio_percent:.2f}"
                )
                mismatch_change = ComplianceStatusChange(
                    ticker=ticker,
                    company_name=ev.snapshot.company_name,
                    previous_status="TKBB_COMPLIANT" if tkbb_rec.is_compliant else "TKBB_NON_COMPLIANT",
                    new_status=ev.compliance_status,
                    previous_bist_compliant=tkbb_rec.is_compliant,
                    new_bist_compliant=ev.is_bist_katilim_compliant,
                    previous_aaoifi_compliant=None,
                    new_aaoifi_compliant=ev.is_aaoifi_compliant,
                    change_type="TKBB_DECISION_MISMATCH",
                    reason_summary=mismatch_summary,
                )
                changes.append(mismatch_change)
                logger.warning("[TKBB_KAP_MISMATCH] %s", mismatch_summary)

        return changes

    async def fetch_existing_stocks_map(
        self, client: Optional[httpx.AsyncClient] = None
    ) -> Dict[str, Dict[str, Any]]:
        """Supabase `stocks_data` tablosundaki mevcut kayıtları çekerek `ticker -> row` sözlüğü döner."""
        if not self.is_configured:
            return {}

        owns_client = client is None
        http_client = client or httpx.AsyncClient(timeout=self.timeout_seconds)
        endpoint = (
            f"{self.supabase_url}/rest/v1/stocks_data"
            "?select=ticker,compliance_status,is_bist_katilim_compliant,is_aaoifi_compliant,debt_ratio_percent"
        )
        try:
            response = await http_client.get(endpoint, headers=self._rest_headers())
            response.raise_for_status()
            rows = response.json()
            if isinstance(rows, list):
                return {str(r["ticker"]).upper(): r for r in rows if "ticker" in r}
            return {}
        except Exception as exc:
            logger.warning("Supabase mevcut kayıtlar okunamadı: %s", exc)
            return {}
        finally:
            if owns_client:
                await http_client.aclose()

    async def upsert_to_supabase(
        self,
        evaluations: Sequence[KAPMultiStandardEvaluation],
        tkbb_records: Optional[Sequence[TKBBIndexRecord]] = None,
        existing_rows: Optional[Dict[str, Dict[str, Any]]] = None,
        client: Optional[httpx.AsyncClient] = None,
        dry_run: bool = False,
    ) -> SupabaseSyncReport:
        """Filtrelenen ve denetlenen verileri Supabase `stocks_data` tablosuna `upsert` eder."""
        tkbb_map: Dict[str, TKBBIndexRecord] = {
            rec.ticker.upper(): rec for rec in (tkbb_records or [])
        }

        previous_map = (
            existing_rows
            if existing_rows is not None
            else (await self.fetch_existing_stocks_map(client=client) if not dry_run else {})
        )

        status_changes = self.detect_status_changes(
            previous_records=previous_map,
            evaluations=evaluations,
            tkbb_map=tkbb_map,
        )

        payload_rows: List[Dict[str, Any]] = [
            self.build_stocks_data_payload(ev, tkbb_map.get(ev.snapshot.ticker))
            for ev in evaluations
        ]
        tickers = [row["ticker"] for row in payload_rows]

        if dry_run or not self.is_configured:
            mode = "DRY_RUN_LOCAL"
            logger.info(
                "Supabase senkronizasyonu %s modunda tamamlandı (%d hisse hazırlandı, %d durum değişimi tespit edildi).",
                mode,
                len(payload_rows),
                len(status_changes),
            )
            return SupabaseSyncReport(
                total_processed=len(evaluations),
                upserted_count=len(payload_rows),
                status_changes=status_changes,
                upserted_tickers=tickers,
                mode=mode,
                payload_snapshot=payload_rows,
            )

        owns_client = client is None
        http_client = client or httpx.AsyncClient(timeout=self.timeout_seconds)
        endpoint = f"{self.supabase_url}/rest/v1/stocks_data?on_conflict=ticker"
        prefer_header = "resolution=merge-duplicates,return=representation"

        try:
            response = await http_client.post(
                endpoint,
                headers=self._rest_headers(prefer=prefer_header),
                json=payload_rows,
            )
            response.raise_for_status()
            upserted_data = response.json()
            upserted_count = (
                len(upserted_data) if isinstance(upserted_data, list) else len(payload_rows)
            )
            logger.info(
                "Supabase `stocks_data` tablosuna %d hisse başarıyla upsert edildi.",
                upserted_count,
            )
            return SupabaseSyncReport(
                total_processed=len(evaluations),
                upserted_count=upserted_count,
                status_changes=status_changes,
                upserted_tickers=tickers,
                mode="LIVE_SUPABASE",
                payload_snapshot=payload_rows,
            )
        finally:
            if owns_client:
                await http_client.aclose()
