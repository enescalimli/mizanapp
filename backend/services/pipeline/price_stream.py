"""BIST Canlı Fiyat Akışı (Yahoo Finance / BIST API) ve Dinamik Piyasa Değeri Güncelleyici.

Bu modül:
1. BIST hisselerinin (`BIMAS.IS`, `THYAO.IS` vb.) anlık/15dk gecikmeli piyasa fiyatlarını,
   günlük yüzdesel değişimlerini ve son 5 günlük kapanış serisini (`sparkline`) `httpx` ile çeker.
2. Kayan nokta (`float`) kullanmadan tüm fiyat verilerini `str -> Decimal` (`strict_decimal`)
   üzerinden işler.
3. Güncel hisse fiyatı ile toplam pay sayısını çarparak **canlı Piyasa Değerini (Spot Market Cap)**
   yeniden hesaplar ve `KAPFinancialSnapshot` nesnesini günceller. Böylece hisse fiyatı düştüğünde
   veya yükseldiğinde `Faizli Borç / Piyasa Değeri` rasyosu da anlık olarak güncellenir.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field, replace
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, List, Optional, Sequence

import httpx

from app.domain.value_objects.money import (
    DECIMAL_2_PLACES,
    DECIMAL_4_PLACES,
    HUNDRED,
    ZERO,
    quantize_amount,
    strict_decimal,
)
from services.pipeline.kap_parser import CANONICAL_KAP_SNAPSHOTS, KAPFinancialSnapshot

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class BISTLiveQuote:
    """Tek bir BIST hissesi için canlı fiyat, günlük değişim ve sparkline verisi (Zero-Float)."""

    ticker: str
    last_price_try: Decimal
    previous_close_try: Decimal
    change_24h_percent: Decimal
    sparkline_5d: List[Decimal] = field(default_factory=list)
    source: str = "YAHOO_FINANCE_BIST"
    fetched_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        object.__setattr__(self, "ticker", self.ticker.strip().upper())
        object.__setattr__(self, "last_price_try", strict_decimal(self.last_price_try))
        object.__setattr__(self, "previous_close_try", strict_decimal(self.previous_close_try))
        object.__setattr__(self, "change_24h_percent", strict_decimal(self.change_24h_percent))
        object.__setattr__(
            self, "sparkline_5d", [strict_decimal(v) for v in self.sparkline_5d]
        )


def _safe_decimal_from_json_number(val: Any, fallback: Decimal = ZERO) -> Decimal:
    """JSON'dan gelen sayısal değeri float aritmetiğine sokmadan `str(val)` üzerinden güvenli Decimal'e çevirir."""
    if val is None or isinstance(val, bool):
        return fallback
    try:
        return strict_decimal(str(val))
    except Exception:
        return fallback


def parse_yahoo_chart_payload(ticker: str, payload: Dict[str, Any]) -> Optional[BISTLiveQuote]:
    """Yahoo Finance v8 chart JSON yanıtını ayrıştırarak `BISTLiveQuote` döner."""
    try:
        results = payload.get("chart", {}).get("result")
        if not results or not isinstance(results, list):
            return None
        result = results[0]
        meta = result.get("meta", {})

        raw_price = meta.get("regularMarketPrice")
        raw_prev = meta.get("chartPreviousClose") or meta.get("previousClose") or raw_price
        if raw_price is None:
            return None

        last_price = _safe_decimal_from_json_number(raw_price).quantize(
            DECIMAL_2_PLACES, rounding=ROUND_HALF_UP
        )
        prev_close = _safe_decimal_from_json_number(raw_prev, fallback=last_price).quantize(
            DECIMAL_2_PLACES, rounding=ROUND_HALF_UP
        )
        if last_price <= ZERO:
            return None

        if prev_close > ZERO:
            change_pct = (((last_price - prev_close) / prev_close) * HUNDRED).quantize(
                DECIMAL_2_PLACES, rounding=ROUND_HALF_UP
            )
        else:
            change_pct = ZERO

        quotes_list = result.get("indicators", {}).get("quote", [])
        closes_raw: List[Any] = (
            quotes_list[0].get("close", []) if quotes_list and isinstance(quotes_list, list) else []
        )
        sparkline: List[Decimal] = []
        for item in closes_raw:
            dec_val = _safe_decimal_from_json_number(item)
            if dec_val > ZERO:
                sparkline.append(dec_val.quantize(DECIMAL_2_PLACES, rounding=ROUND_HALF_UP))

        if not sparkline:
            sparkline = [prev_close, last_price]
        elif len(sparkline) > 5:
            sparkline = sparkline[-5:]

        return BISTLiveQuote(
            ticker=ticker.strip().upper(),
            last_price_try=last_price,
            previous_close_try=prev_close,
            change_24h_percent=change_pct,
            sparkline_5d=sparkline,
            source="YAHOO_FINANCE_BIST",
        )
    except Exception as exc:
        logger.debug("Yahoo chart verisi ayrıştırılamadı (%s): %s", ticker, exc)
        return None


class BISTLivePriceService:
    """BIST hisselerinin canlı fiyatlarını çeken ve `KAPFinancialSnapshot` piyasa değerlerini güncelleyen servis."""

    YAHOO_CHART_URL_TEMPLATE = (
        "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}.IS?interval=1d&range=5d"
    )

    def __init__(self, timeout_seconds: float = 6.0) -> None:
        self.timeout_seconds = timeout_seconds

    async def fetch_quote(
        self,
        ticker: str,
        client: Optional[httpx.AsyncClient] = None,
        use_canonical_fallback: bool = True,
    ) -> Optional[BISTLiveQuote]:
        """Tek bir BIST hissesi için canlı fiyat verisini çeker."""
        clean_ticker = ticker.strip().upper()
        url = self.YAHOO_CHART_URL_TEMPLATE.format(symbol=clean_ticker)
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "application/json",
        }

        owns_client = client is None
        http_client = client or httpx.AsyncClient(timeout=self.timeout_seconds, headers=headers)

        try:
            response = await http_client.get(url)
            if response.status_code == 200:
                quote = parse_yahoo_chart_payload(clean_ticker, response.json())
                if quote is not None:
                    return quote
        except Exception as exc:
            logger.debug("Canlı fiyat çekilemedi (%s): %s", clean_ticker, exc)
        finally:
            if owns_client:
                await http_client.aclose()

        if use_canonical_fallback and clean_ticker in CANONICAL_KAP_SNAPSHOTS:
            snap = CANONICAL_KAP_SNAPSHOTS[clean_ticker]
            return BISTLiveQuote(
                ticker=clean_ticker,
                last_price_try=snap.last_price_try,
                previous_close_try=snap.last_price_try,
                change_24h_percent=snap.change_24h_percent,
                sparkline_5d=list(snap.historical_sparkline),
                source="CANONICAL_FALLBACK",
            )
        return None

    async def fetch_quotes_batch(
        self,
        tickers: Optional[Sequence[str]] = None,
        client: Optional[httpx.AsyncClient] = None,
        use_canonical_fallback: bool = True,
    ) -> Dict[str, BISTLiveQuote]:
        """Birden fazla BIST hissesi için paralel olarak canlı fiyat çeker."""
        target_tickers = (
            [t.strip().upper() for t in tickers]
            if tickers
            else list(CANONICAL_KAP_SNAPSHOTS.keys())
        )
        owns_client = client is None
        http_client = client or httpx.AsyncClient(
            timeout=self.timeout_seconds,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Accept": "application/json",
            },
        )

        try:
            tasks = [
                self.fetch_quote(
                    t, client=http_client, use_canonical_fallback=use_canonical_fallback
                )
                for t in target_tickers
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            quotes: Dict[str, BISTLiveQuote] = {}
            for res in results:
                if isinstance(res, BISTLiveQuote):
                    quotes[res.ticker] = res
            return quotes
        finally:
            if owns_client:
                await http_client.aclose()

    @staticmethod
    def apply_quote_to_snapshot(
        snapshot: KAPFinancialSnapshot,
        quote: BISTLiveQuote,
    ) -> KAPFinancialSnapshot:
        """Canlı fiyatı `KAPFinancialSnapshot` üzerine uygular ve Piyasa Değerini (`market_cap_try`) yeniden hesaplar."""
        updated_mcap = quantize_amount(
            quote.last_price_try * snapshot.total_shares_outstanding
        )
        return replace(
            snapshot,
            last_price_try=quote.last_price_try,
            change_24h_percent=quote.change_24h_percent,
            market_cap_try=updated_mcap,
            historical_sparkline=(
                quote.sparkline_5d if quote.sparkline_5d else snapshot.historical_sparkline
            ),
        )
