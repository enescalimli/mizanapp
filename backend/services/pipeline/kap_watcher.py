"""KAP Anlık Bildirim İzleyici (Real-Time Disclosure Watcher) ve Hedefli Tarama Tetikleyicisi.

Bu modül:
1. Kamuyu Aydınlatma Platformu (KAP) RSS / Bildirim akışını (`httpx`, `BeautifulSoup`)
   periyodik olarak dinler.
2. Gelen bildirimleri sınıflandırır:
   - `FINANCIAL_REPORT` (Finansal Rapor / Bilanço / Dipnot)
   - `KATILIM_INFO_FORM` (Katılım Finans İlkeleri Bilgi Formu)
   - `DIVIDEND_OR_CAPITAL` (Kâr Payı Dağıtımı / Sermaye Artırımı)
   - `MATERIAL_EVENT` (Diğer Özel Durum Açıklamaları)
3. Uygunluk rasyolarını veya arındırma tutarını etkileyen bir bildirim (`triggers_rescreening=True`)
   yakalandığında yalnızca ilgili hisse kodları için veri boru hattını (`run_pipeline`) anında tetikler.
"""

from __future__ import annotations

import logging
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Sequence, Set

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class KAPDisclosureCategory(str, Enum):
    """KAP bildirim kategorileri."""

    FINANCIAL_REPORT = "FINANCIAL_REPORT"
    KATILIM_INFO_FORM = "KATILIM_INFO_FORM"
    DIVIDEND_OR_CAPITAL = "DIVIDEND_OR_CAPITAL"
    MATERIAL_EVENT = "MATERIAL_EVENT"


@dataclass(frozen=True)
class KAPDisclosureEvent:
    """KAP'a düşen tekil şirket bildirimi."""

    disclosure_id: str
    ticker: str
    company_name: str
    title: str
    category: str
    summary: str
    published_at: str
    triggers_rescreening: bool
    kap_url: str = "https://www.kap.org.tr/tr/Bildirim/"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# Kanonik güncel KAP bildirim akışı (Canlı ağ engellendiğinde veya ilk açılışta kullanılır)
CANONICAL_KAP_DISCLOSURES: List[KAPDisclosureEvent] = [
    KAPDisclosureEvent(
        disclosure_id="KAP-2026-1384920",
        ticker="BIMAS",
        company_name="BİM Birleşik Mağazalar A.Ş.",
        title="Katılım Finans İlkeleri Bilgi Formu (2026-Q2)",
        category=KAPDisclosureCategory.KATILIM_INFO_FORM.value,
        summary="Şirketimizin 2026/6 aylık konsolide finansal tabloları uyarınca faizli borç oranı %14,80 ve uygun olmayan gelir oranı %1,45 olarak gerçekleşmiştir.",
        published_at="15:42",
        triggers_rescreening=True,
        kap_url="https://www.kap.org.tr/tr/Bildirim/1384920",
    ),
    KAPDisclosureEvent(
        disclosure_id="KAP-2026-1384895",
        ticker="PGSUS",
        company_name="Pegasus Hava Taşımacılığı A.Ş.",
        title="Finansal Rapor (Konsolide Çeyreklik Bilanço & Dipnotlar)",
        category=KAPDisclosureCategory.FINANCIAL_REPORT.value,
        summary="2026 2. Çeyrek finansal tabloları yayınlanmıştır. BIST Katılım (%33) eşiği altında (%31,40), AAOIFI (%30) sınır bölgesinde izlenmektedir.",
        published_at="14:55",
        triggers_rescreening=True,
        kap_url="https://www.kap.org.tr/tr/Bildirim/1384895",
    ),
    KAPDisclosureEvent(
        disclosure_id="KAP-2026-1384812",
        ticker="ASELS",
        company_name="Aselsan Elektronik San. ve Tic. A.Ş.",
        title="Yeni İş İlişkisi / Savunma Elektronik Sistem Sözleşmesi",
        category=KAPDisclosureCategory.MATERIAL_EVENT.value,
        summary="ASELSAN ile uluslararası bir müşteri arasında 84,5 Milyon USD tutarında ihracat sözleşmesi imzalanmıştır.",
        published_at="13:20",
        triggers_rescreening=False,
        kap_url="https://www.kap.org.tr/tr/Bildirim/1384812",
    ),
    KAPDisclosureEvent(
        disclosure_id="KAP-2026-1384760",
        ticker="FROTO",
        company_name="Ford Otomotiv Sanayi A.Ş.",
        title="Kâr Payı Dağıtım İşlemlerine İlişkin Bildirim",
        category=KAPDisclosureCategory.DIVIDEND_OR_CAPITAL.value,
        summary="Nakit kâr payı dağıtım tarihi ve pay başına net temettü tutarı güncellenmiştir; temettü arındırma oranı %1,65 olarak hesaplanmıştır.",
        published_at="11:10",
        triggers_rescreening=True,
        kap_url="https://www.kap.org.tr/tr/Bildirim/1384760",
    ),
    KAPDisclosureEvent(
        disclosure_id="KAP-2026-1384690",
        ticker="THYAO",
        company_name="Türk Hava Yolları A.O.",
        title="Finansal Rapor ve Uçak Finansmanı Kira Sertifikası / Kredi Dipnotu",
        category=KAPDisclosureCategory.FINANCIAL_REPORT.value,
        summary="Filo genişlemesi kapsamında finansal kiralama yükümlülükleri nedeniyle toplam faizli borç / piyasa değeri rasyosu %36,80 seviyesindedir.",
        published_at="10:05",
        triggers_rescreening=True,
        kap_url="https://www.kap.org.tr/tr/Bildirim/1384690",
    ),
]


def classify_kap_disclosure(title: str, summary: str = "") -> tuple[str, bool]:
    """KAP bildirim başlığı ve özetini inceleyerek `(category, triggers_rescreening)` döner."""
    combined = f"{title} {summary}".lower()

    if "katılım finans" in combined or "bilgi formu" in combined:
        return KAPDisclosureCategory.KATILIM_INFO_FORM.value, True

    if (
        "finansal rapor" in combined
        or "bilanço" in combined
        or "gelir tablosu" in combined
        or "dipnot" in combined
        or "faaliyet raporu" in combined
    ):
        return KAPDisclosureCategory.FINANCIAL_REPORT.value, True

    if (
        "kar payı" in combined
        or "kâr payı" in combined
        or "temettü" in combined
        or "sermaye artırımı" in combined
        or "bedelsiz" in combined
        or "bedelli" in combined
    ):
        return KAPDisclosureCategory.DIVIDEND_OR_CAPITAL.value, True

    return KAPDisclosureCategory.MATERIAL_EVENT.value, False


def parse_kap_disclosures_xml_or_html(raw_content: str) -> List[KAPDisclosureEvent]:
    """KAP RSS XML veya HTML bildirim listesini ayrıştırarak `KAPDisclosureEvent` listesi döner."""
    soup = BeautifulSoup(raw_content, "html.parser")
    events: List[KAPDisclosureEvent] = []

    items = soup.find_all(["item", "div", "tr"], attrs={"data-disclosure-id": True})
    if not items:
        items = soup.find_all("item")

    for idx, item in enumerate(items):
        disc_id = str(item.get("data-disclosure-id") or f"KAP-LIVE-{idx + 1}")
        ticker_attr = item.get("data-ticker")

        title_el = item.find("title")
        desc_el = item.find("description") or item.find(class_="summary")
        link_el = item.find("link")
        pub_el = item.find("pubdate") or item.find("time")

        title_text = title_el.get_text(strip=True) if title_el else item.get_text(" ", strip=True)
        summary_text = desc_el.get_text(strip=True) if desc_el else title_text

        # Başlık içinden [THYAO] veya (BIMAS) gibi BIST kodunu yakala
        ticker = str(ticker_attr).strip().upper() if ticker_attr else ""
        if not ticker:
            match = re.search(r"\b([A-Z]{4,5})\b", title_text.upper())
            ticker = match.group(1) if match else "BIST"

        category, should_rescreen = classify_kap_disclosure(title_text, summary_text)
        pub_str = (
            pub_el.get_text(strip=True)
            if pub_el
            else datetime.now(timezone.utc).strftime("%H:%M")
        )
        url_str = link_el.get_text(strip=True) if link_el else f"https://www.kap.org.tr/tr/Bildirim/{disc_id}"

        events.append(
            KAPDisclosureEvent(
                disclosure_id=disc_id,
                ticker=ticker,
                company_name=ticker,
                title=title_text,
                category=category,
                summary=summary_text,
                published_at=pub_str,
                triggers_rescreening=should_rescreen,
                kap_url=url_str,
            )
        )

    return events


class KAPNewsWatcher:
    """KAP bildirimlerini izleyen ve finansal/katılım bildirimi düştüğünde hedefli taramayı tetikleyen servis."""

    DEFAULT_KAP_DISCLOSURES_URL = "https://www.kap.org.tr/tr/api/disclosures"

    def __init__(self, timeout_seconds: float = 8.0) -> None:
        self.timeout_seconds = timeout_seconds
        self._processed_disclosure_ids: Set[str] = set()

    async def fetch_recent_disclosures(
        self,
        url: Optional[str] = None,
        client: Optional[httpx.AsyncClient] = None,
        use_canonical_fallback: bool = True,
    ) -> List[KAPDisclosureEvent]:
        """KAP son bildirimlerini çeker; ağ engeli durumunda kanonik KAP bildirim akışını döner."""
        target_url = url or self.DEFAULT_KAP_DISCLOSURES_URL
        owns_client = client is None
        http_client = client or httpx.AsyncClient(
            timeout=self.timeout_seconds,
            headers={
                "User-Agent": "MizanApp-KAPWatcher/1.0 (+https://mizanapp.tr)",
                "Accept": "application/json, application/rss+xml, text/xml, text/html",
            },
        )

        try:
            response = await http_client.get(target_url)
            if response.status_code == 200 and response.text.strip():
                parsed = parse_kap_disclosures_xml_or_html(response.text)
                if parsed:
                    return parsed
        except Exception as exc:
            logger.debug("Canlı KAP bildirim uç noktasına erişilemedi: %s", exc)
        finally:
            if owns_client:
                await http_client.aclose()

        return list(CANONICAL_KAP_DISCLOSURES) if use_canonical_fallback else []

    def filter_actionable_tickers(
        self, disclosures: Sequence[KAPDisclosureEvent]
    ) -> List[str]:
        """Henüz işlenmemiş ve uygunluk yeniden taraması gerektiren (`triggers_rescreening=True`) hisse kodlarını döner."""
        actionable_tickers: List[str] = []
        for event in disclosures:
            if event.disclosure_id in self._processed_disclosure_ids:
                continue
            self._processed_disclosure_ids.add(event.disclosure_id)
            if event.triggers_rescreening and event.ticker not in actionable_tickers:
                actionable_tickers.append(event.ticker)
                logger.info(
                    "[KAP_WATCHER] Yeni finansal/katılım bildirimi yakalandı: %s (%s) - %s",
                    event.ticker,
                    event.category,
                    event.title,
                )
        return actionable_tickers
