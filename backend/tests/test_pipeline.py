"""MizanApp.tr Veri Boru Hattı (Data Pipeline) Birim ve Entegrasyon Testleri.

Kapsanan Modüller:
1. `backend/services/pipeline/tkbb_sync.py` (TKBB & BIST Katılım Scraper + Pandas DataFrame)
2. `backend/services/pipeline/kap_parser.py` (KAP Finansal Veri Çekici + Faz 2 `ScreeningEngine` BIST/AAOIFI Testi)
3. `backend/services/pipeline/sync_db.py` (Supabase `stocks_data` Upsert + Durum Değişimi Tespiti ve Loglama)
4. `backend/services/pipeline/run_pipeline.py` (Uçtan Uca Orkestratör, CLI/Cron ve FastAPI Endpoint)
"""

from __future__ import annotations

import json
import logging
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List

import httpx
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.core.exceptions import ZeroFloatViolationError
from app.main import app
from services.pipeline.kap_parser import (
    CANONICAL_KAP_SNAPSHOTS,
    KAPFinancialParser,
    KAPFinancialSnapshot,
    parse_kap_financial_html,
)
from services.pipeline.run_pipeline import DataPipelineOrchestrator, main, run_pipeline
from services.pipeline.sync_db import SupabaseStockSyncService
from services.pipeline.tkbb_sync import (
    CANONICAL_TKBB_ANNOUNCEMENT_HTML,
    TKBBReasonCode,
    TKBBSyncService,
    classify_tkbb_reason_code,
    parse_tkbb_announcement_html,
)


# ============================================================================
# 1. TKBB & BIST KATILIM SCRAPER TESTLERİ (`tkbb_sync.py`)
# ============================================================================


def test_parse_tkbb_announcement_html_extracts_tickers_and_reason_codes() -> None:
    """TKBB HTML duyuru tablosundan şirket kodları, `is_compliant` ve `reason_code` doğru ayrıştırılmalı."""
    records = parse_tkbb_announcement_html(CANONICAL_TKBB_ANNOUNCEMENT_HTML)
    assert len(records) == 13

    by_ticker = {r.ticker: r for r in records}

    # BIMAS -> UYGUN (Arındırma ile uygun)
    assert "BIMAS" in by_ticker
    assert by_ticker["BIMAS"].is_compliant is True
    assert by_ticker["BIMAS"].reason_code == TKBBReasonCode.COMPLIANT_WITH_PURIFICATION.value

    # THYAO -> UYGUN DEĞİL (%33 borç eşiği aşımı)
    assert "THYAO" in by_ticker
    assert by_ticker["THYAO"].is_compliant is False
    assert by_ticker["THYAO"].reason_code == TKBBReasonCode.DEBT_RATIO_EXCEEDED_33.value

    # PGSUS -> UYGUN (SINIRDA)
    assert "PGSUS" in by_ticker
    assert by_ticker["PGSUS"].is_compliant is True
    assert by_ticker["PGSUS"].reason_code == TKBBReasonCode.AT_RISK_BORDERLINE_DEBT.value

    # ALBRK -> Katılım Bankası
    assert "ALBRK" in by_ticker
    assert by_ticker["ALBRK"].is_compliant is True
    assert by_ticker["ALBRK"].reason_code == TKBBReasonCode.COMPLIANT_PARTICIPATION_BANK.value


@pytest.mark.parametrize(
    ("status_text", "reason_text", "expected_compliant", "expected_code"),
    [
        ("UYGUN", "Tüm kriterlere uygun", True, TKBBReasonCode.COMPLIANT_ALL_CRITERIA.value),
        (
            "UYGUN DEĞİL",
            "Faizli nakit ve menkul kıymetler oranı %33 sınırını aşmıştır",
            False,
            TKBBReasonCode.CASH_RATIO_EXCEEDED_33.value,
        ),
        (
            "KAPSAM DIŞI",
            "Faiz gelirleri / toplam hasılat oranı %5 sınırını aşmıştır",
            False,
            TKBBReasonCode.IMPURE_INCOME_EXCEEDED_5.value,
        ),
        (
            "ÇIKARILDI",
            "Konvansiyonel banka ve faktoring ana faaliyet konusu",
            False,
            TKBBReasonCode.PROHIBITED_SECTOR_ACTIVITY.value,
        ),
        (
            "UYGUN DEĞİL",
            "Katılım finans ilkeleri bilgi formu gönderilmemiştir",
            False,
            TKBBReasonCode.MISSING_INFORMATION_FORM.value,
        ),
    ],
)
def test_classify_tkbb_reason_code_variants(
    status_text: str,
    reason_text: str,
    expected_compliant: bool,
    expected_code: str,
) -> None:
    is_comp, code = classify_tkbb_reason_code(status_text, reason_text)
    assert is_comp is expected_compliant
    assert code == expected_code


async def test_tkbb_sync_service_http_fetch_and_dataframe_conversion() -> None:
    """`TKBBSyncService` httpx üzerinden HTML çekip Pandas DataFrame'e dönüştürebilmeli."""
    custom_html = """
    <html><body>
      <div data-period="2026-Q3"></div>
      <table>
        <tbody>
          <tr>
            <td>BIMAS</td>
            <td>BİM Birleşik Mağazalar A.Ş.</td>
            <td>Perakende</td>
            <td>UYGUN</td>
            <td>Arındırma ile uygun</td>
          </tr>
          <tr>
            <td>THYAO</td>
            <td>Türk Hava Yolları A.O.</td>
            <td>Havacılık</td>
            <td>UYGUN DEĞİL</td>
            <td>Faizli borç rasyosu %33 sınırını aşmıştır</td>
          </tr>
        </tbody>
      </table>
    </body></html>
    """

    def mock_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text=custom_html)

    transport = httpx.MockTransport(mock_handler)
    async with httpx.AsyncClient(transport=transport) as client:
        service = TKBBSyncService()
        records = await service.fetch_periodic_list(
            url="https://mock.katilimendeksi.org/list",
            client=client,
            use_canonical_fallback=False,
        )

    assert len(records) == 2
    assert records[0].effective_period == "2026-Q3"

    df = service.to_dataframe(records)
    assert isinstance(df, pd.DataFrame)
    assert list(df["ticker"]) == ["BIMAS", "THYAO"]
    assert list(df["is_compliant"]) == [True, False]


# ============================================================================
# 2. KAP FİNANSAL VERİ ÇEKİCİ & SCREENING ENGINE TESTLERİ (`kap_parser.py`)
# ============================================================================


def test_parse_kap_financial_html_and_ratio_calculations() -> None:
    """KAP HTML tablosundan finansal kalemler Decimal olarak çekilmeli ve 3 temel rasyo doğru hesaplanmalı."""
    sample_kap_html = """
    <table>
      <tr><td>Toplam Varlıklar</td><td>180.000.000.000,00</td></tr>
      <tr><td>Toplam Faizli Borçlar (Kısa + Uzun Vadeli Finansal Borçlar)</td><td>40.000.000.000,00</td></tr>
      <tr><td>Faizli Nakit ve Vadeli Mevduat</td><td>20.000.000.000,00</td></tr>
      <tr><td>Toplam Hasılat (Satış Gelirleri)</td><td>100.000.000.000,00</td></tr>
      <tr><td>Faiz Gelirleri</td><td>1.500.000.000,00</td></tr>
      <tr><td>Uygun Olmayan Faaliyet Gelirleri</td><td>500.000.000,00</td></tr>
      <tr><td>Tekil Çeyrek Uygunsuz Gelir</td><td>400.000.000,00</td></tr>
      <tr><td>Zekata Tabi Dönen Varlıklar</td><td>60.000.000.000,00</td></tr>
      <tr><td>Kısa Vadeli Yükümlülükler</td><td>25.000.000.000,00</td></tr>
    </table>
    """
    # Piyasa Değeri = 200.00 TL * 1.000.000.000 pay = 200.000.000.000 TL
    snapshot = parse_kap_financial_html(
        html_content=sample_kap_html,
        ticker="TESTK",
        company_name="Test Katılım Sanayi A.Ş.",
        sector="Sanayi",
        fiscal_period="2026-Q2",
        last_price_try=Decimal("200.00"),
        total_shares_outstanding=Decimal("1000000000"),
    )

    # 1. Toplam Faizli Borçlar / Piyasa Değeri = 40B / 200B = 0.200000 (%20.00)
    assert snapshot.debt_to_market_cap_ratio == Decimal("0.200000")
    # 2. Faiz Gelirleri / Toplam Hasılat = 1.5B / 100B = 0.015000 (%1.50)
    assert snapshot.interest_income_to_revenue_ratio == Decimal("0.015000")
    # 3. Uygun Olmayan Faaliyet Gelirleri / Toplam Hasılat = 0.5B / 100B = 0.005000 (%0.50)
    assert snapshot.non_compliant_operating_income_ratio == Decimal("0.005000")
    # Toplam Uygunsuz Gelir Oranı = (1.5B + 0.5B) / 100B = 0.020000 (%2.00)
    assert snapshot.total_impure_income_ratio == Decimal("0.020000")


def test_kap_snapshot_rejects_float_inputs() -> None:
    """Zero-Float kuralı gereği `KAPFinancialSnapshot` içine `float` verilirse Zero-Float Violation hatası fırlatılmalı."""
    with pytest.raises((TypeError, ZeroFloatViolationError), match="Zero-Float Violation"):
        KAPFinancialSnapshot(
            ticker="FLOAT",
            company_name="Float Hata A.Ş.",
            sector="Test",
            fiscal_period="2026-Q2",
            last_price_try=100.50,  # type: ignore[arg-type]
            change_24h_percent=Decimal("0"),
            market_cap_try=Decimal("1000"),
            total_assets_try=Decimal("1000"),
            total_shares_outstanding=Decimal("10"),
            interest_bearing_debt_try=Decimal("100"),
            interest_bearing_cash_try=Decimal("50"),
            interest_income_ttm_try=Decimal("5"),
            non_compliant_operating_income_ttm_try=Decimal("0"),
            total_revenue_ttm_try=Decimal("500"),
            impure_income_isolated_quarter_try=Decimal("1"),
            zatable_current_assets_try=Decimal("200"),
            current_liabilities_try=Decimal("100"),
        )


def test_kap_parser_feeds_screening_engine_for_bist_and_aaoifi() -> None:
    """`KAPFinancialParser` verileri Faz 2 `ScreeningEngine` sınıfına besleyerek BIST (%33) ve AAOIFI (%30) farkını yakalamalı."""
    parser = KAPFinancialParser()

    # 1. BIMAS -> BIST Uygun (<%33), AAOIFI Uygun (<%30) => COMPLIANT
    bimas_eval = parser.evaluate_snapshot_with_screening_engine(
        CANONICAL_KAP_SNAPSHOTS["BIMAS"]
    )
    assert bimas_eval.is_bist_katilim_compliant is True
    assert bimas_eval.is_aaoifi_compliant is True
    assert bimas_eval.compliance_status == "COMPLIANT"
    assert bimas_eval.debt_ratio_percent == Decimal("14.8000")
    assert bimas_eval.purification_per_share_try == Decimal("0.084200")

    # 2. PGSUS (%31.40 Borç) -> BIST Uygun (<%33), AAOIFI Uygun Değil (>=%30) => AT_RISK
    pgsus_eval = parser.evaluate_snapshot_with_screening_engine(
        CANONICAL_KAP_SNAPSHOTS["PGSUS"]
    )
    assert pgsus_eval.is_bist_katilim_compliant is True
    assert pgsus_eval.is_aaoifi_compliant is False
    assert pgsus_eval.compliance_status == "AT_RISK"
    assert pgsus_eval.debt_ratio_percent == Decimal("31.4000")
    assert any("AAOIFI_THRESHOLD_BREACH" in r for r in pgsus_eval.compliance_reasons)

    # 3. THYAO (%36.80 Borç) -> BIST Uygun Değil (>=%33), AAOIFI Uygun Değil (>=%30) => NON_COMPLIANT
    thyao_eval = parser.evaluate_snapshot_with_screening_engine(
        CANONICAL_KAP_SNAPSHOTS["THYAO"]
    )
    assert thyao_eval.is_bist_katilim_compliant is False
    assert thyao_eval.is_aaoifi_compliant is False
    assert thyao_eval.compliance_status == "NON_COMPLIANT"
    assert thyao_eval.debt_ratio_percent == Decimal("36.8000")


# ============================================================================
# 3. SUPABASE VERİ EŞİTLEYİCİ & DURUM DEĞİŞİMİ TESTLERİ (`sync_db.py`)
# ============================================================================


def test_sync_db_detects_and_logs_compliance_status_changes(
    caplog: pytest.LogCaptureFixture,
) -> None:
    """Hisselerin uygunluk durumundaki değişiklikler tespit edilip uyarı olarak loglanmalı."""
    parser = KAPFinancialParser()
    bimas_eval = parser.evaluate_snapshot_with_screening_engine(
        CANONICAL_KAP_SNAPSHOTS["BIMAS"]
    )
    thyao_eval = parser.evaluate_snapshot_with_screening_engine(
        CANONICAL_KAP_SNAPSHOTS["THYAO"]
    )
    pgsus_eval = parser.evaluate_snapshot_with_screening_engine(
        CANONICAL_KAP_SNAPSHOTS["PGSUS"]
    )

    # Önceki dönemde THYAO'nun COMPLIANT, PGSUS'un COMPLIANT, BIMAS'ın ise NON_COMPLIANT olduğunu varsayalım
    previous_db_state: Dict[str, Dict[str, Any]] = {
        "THYAO": {
            "ticker": "THYAO",
            "compliance_status": "COMPLIANT",
            "is_bist_katilim_compliant": True,
            "is_aaoifi_compliant": True,
        },
        "PGSUS": {
            "ticker": "PGSUS",
            "compliance_status": "COMPLIANT",
            "is_bist_katilim_compliant": True,
            "is_aaoifi_compliant": True,
        },
        "BIMAS": {
            "ticker": "BIMAS",
            "compliance_status": "NON_COMPLIANT",
            "is_bist_katilim_compliant": False,
            "is_aaoifi_compliant": False,
        },
    }

    with caplog.at_level(logging.WARNING):
        changes = SupabaseStockSyncService.detect_status_changes(
            previous_records=previous_db_state,
            evaluations=[bimas_eval, thyao_eval, pgsus_eval],
        )

    assert len(changes) == 3
    change_by_ticker = {c.ticker: c for c in changes}

    assert change_by_ticker["THYAO"].change_type == "EXITED_COMPLIANCE"
    assert change_by_ticker["PGSUS"].change_type == "ENTERED_RISK_ZONE"
    assert change_by_ticker["BIMAS"].change_type == "ENTERED_COMPLIANCE"
    assert "[COMPLIANCE_CHANGE]" in caplog.text


async def test_supabase_stock_sync_service_live_upsert_with_mock_transport() -> None:
    """`SupabaseStockSyncService.upsert_to_supabase` PostgREST endpoint'ine doğru `on_conflict=ticker` isteği atmalı."""
    parser = KAPFinancialParser()
    evaluations = await parser.fetch_and_evaluate_batch(tickers=["BIMAS", "THYAO"])
    tkbb_records = parse_tkbb_announcement_html(CANONICAL_TKBB_ANNOUNCEMENT_HTML)

    captured_requests: List[httpx.Request] = []
    captured_payload: List[Dict[str, Any]] = []

    def supabase_mock_handler(request: httpx.Request) -> httpx.Response:
        captured_requests.append(request)
        body = json.loads(request.content.decode("utf-8"))
        captured_payload.extend(body)
        return httpx.Response(201, json=body)

    transport = httpx.MockTransport(supabase_mock_handler)
    sync_service = SupabaseStockSyncService(
        supabase_url="https://mockproject.supabase.co",
        supabase_key="service-role-secret-key",
    )

    async with httpx.AsyncClient(transport=transport) as client:
        report = await sync_service.upsert_to_supabase(
            evaluations=evaluations,
            tkbb_records=tkbb_records,
            existing_rows={
                "THYAO": {
                    "ticker": "THYAO",
                    "compliance_status": "COMPLIANT",
                    "is_bist_katilim_compliant": True,
                    "is_aaoifi_compliant": True,
                }
            },
            client=client,
            dry_run=False,
        )

    assert report.mode == "LIVE_SUPABASE"
    assert report.upserted_count == 2
    assert report.upserted_tickers == ["BIMAS", "THYAO"]
    assert len(report.status_changes) == 1
    assert report.status_changes[0].ticker == "THYAO"
    assert report.status_changes[0].change_type == "EXITED_COMPLIANCE"

    # HTTP isteği doğrulaması
    assert len(captured_requests) == 1
    req = captured_requests[0]
    assert req.method == "POST"
    assert str(req.url) == "https://mockproject.supabase.co/rest/v1/stocks_data?on_conflict=ticker"
    assert "resolution=merge-duplicates" in req.headers.get("Prefer", "")

    # Gönderilen JSON şeması `public.stocks_data` ile tam uyumlu olmalı
    bimas_row = next(r for r in captured_payload if r["ticker"] == "BIMAS")
    assert bimas_row["is_bist_katilim_compliant"] is True
    assert bimas_row["is_aaoifi_compliant"] is True
    assert bimas_row["debt_ratio_percent"] == "14.8000"
    assert bimas_row["purification_per_share_try"] == "0.084200"


# ============================================================================
# 4. CLI / CRON VE END-TO-END ORKESTRATÖR TESTLERİ (`run_pipeline.py`)
# ============================================================================


async def test_end_to_end_pipeline_orchestrator_and_dataframe_merge() -> None:
    """`run_pipeline` 13 BIST hissesini uçtan uca taramalı, Pandas ile birleştirmeli ve rapor üretmeli."""
    result = await run_pipeline(effective_period="2026-Q2", dry_run=True)

    assert len(result.tkbb_records) == 13
    assert len(result.kap_evaluations) == 13
    assert result.sync_report.upserted_count == 13
    assert not result.merged_dataframe.empty
    assert "tkbb_official_compliant" in result.merged_dataframe.columns
    assert "tkbb_reason_code" in result.merged_dataframe.columns

    summary = result.to_summary_dict()
    assert summary["bist_compliant_count"] == 12
    assert summary["aaoifi_compliant_count"] == 11
    assert summary["non_compliant_tickers"] == ["THYAO"]
    assert summary["at_risk_tickers"] == ["PGSUS"]


def test_cli_main_entrypoint_writes_output_json(tmp_path: Path) -> None:
    """`run_pipeline.py` CLI giriş noktası argümanlarla çalışıp JSON özet dosyası oluşturabilmeli."""
    output_file = tmp_path / "pipeline_summary.json"
    exit_code = main(
        [
            "--tickers",
            "BIMAS",
            "PGSUS",
            "THYAO",
            "--period",
            "2026-Q2",
            "--dry-run",
            "--output-json",
            str(output_file),
        ]
    )
    assert exit_code == 0
    assert output_file.exists()

    summary_data = json.loads(output_file.read_text(encoding="utf-8"))
    assert summary_data["kap_evaluated_count"] == 3
    assert summary_data["bist_compliant_count"] == 2
    assert summary_data["aaoifi_compliant_count"] == 1
    assert summary_data["non_compliant_tickers"] == ["THYAO"]
    assert summary_data["at_risk_tickers"] == ["PGSUS"]


def test_fastapi_pipeline_sync_endpoint() -> None:
    """FastAPI `/api/v1/pipeline/sync` ucu pipeline'ı tetikleyip 200 OK ve özet JSON dönmeli."""
    client = TestClient(app)
    response = client.post("/api/v1/pipeline/sync?effective_period=2026-Q2&dry_run=true")
    assert response.status_code == 200
    payload = response.json()
    assert payload["effective_period"] == "2026-Q2"
    assert payload["kap_evaluated_count"] == 13
    assert "THYAO" in payload["non_compliant_tickers"]
    assert "PGSUS" in payload["at_risk_tickers"]
