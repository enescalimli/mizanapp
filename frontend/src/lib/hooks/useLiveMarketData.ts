"use client";

import { useCallback, useEffect, useState } from "react";
import { SAMPLE_COMPANIES_SUMMARY } from "@/lib/data/sampleCompanies";
import { CompanySummary } from "@/types/katilim";
import type { KAPDisclosureDTO, LiveStockQuoteDTO } from "@/app/api/live-market/route";

export interface UseLiveMarketDataReturn {
  companies: CompanySummary[];
  quotes: Record<string, LiveStockQuoteDTO>;
  kapDisclosures: KAPDisclosureDTO[];
  updatedAt: string | null;
  source: "LIVE_HYBRID" | "SUPABASE_DB" | "CANONICAL_FALLBACK";
  isRefreshing: boolean;
  refreshNow: () => Promise<void>;
}

const INITIAL_KAP_FEED: KAPDisclosureDTO[] = [
  {
    disclosureId: "KAP-2026-1384920",
    ticker: "BIMAS",
    companyName: "BİM Birleşik Mağazalar A.Ş.",
    title: "Katılım Finans İlkeleri Bilgi Formu (2026-Q2)",
    category: "KATILIM_INFO_FORM",
    summary:
      "Konsolide finansal tablolar uyarınca faizli borç oranı %14,80 ve uygun olmayan gelir oranı %1,45 olarak gerçekleşmiştir.",
    publishedAt: "15:42",
    triggersRescreening: true,
    kapUrl: "https://www.kap.org.tr/tr/Bildirim/1384920",
  },
  {
    disclosureId: "KAP-2026-1384895",
    ticker: "PGSUS",
    companyName: "Pegasus Hava Taşımacılığı A.Ş.",
    title: "Finansal Rapor (Konsolide Çeyreklik Bilanço & Dipnotlar)",
    category: "FINANCIAL_REPORT",
    summary:
      "BIST Katılım (%33) eşiği altında (%31,40), AAOIFI (%30) sınır bölgesinde izlenmektedir; uygunluk durumu otomatik güncellendi.",
    publishedAt: "14:55",
    triggersRescreening: true,
    kapUrl: "https://www.kap.org.tr/tr/Bildirim/1384895",
  },
  {
    disclosureId: "KAP-2026-1384760",
    ticker: "FROTO",
    companyName: "Ford Otomotiv Sanayi A.Ş.",
    title: "Kâr Payı Dağıtım İşlemlerine İlişkin Bildirim",
    category: "DIVIDEND_OR_CAPITAL",
    summary:
      "Nakit kâr payı dağıtım tarihi güncellenmiştir; temettü arındırma oranı %1,65 olarak hesaplanmıştır.",
    publishedAt: "11:10",
    triggersRescreening: true,
    kapUrl: "https://www.kap.org.tr/tr/Bildirim/1384760",
  },
];

export function useLiveMarketData(pollIntervalMs: number = 30000): UseLiveMarketDataReturn {
  const [companies, setCompanies] = useState<CompanySummary[]>(SAMPLE_COMPANIES_SUMMARY);
  const [quotes, setQuotes] = useState<Record<string, LiveStockQuoteDTO>>({});
  const [kapDisclosures, setKapDisclosures] = useState<KAPDisclosureDTO[]>(INITIAL_KAP_FEED);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [source, setSource] = useState<"LIVE_HYBRID" | "SUPABASE_DB" | "CANONICAL_FALLBACK">(
    "CANONICAL_FALLBACK"
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshNow = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/live-market", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.companies) && data.companies.length > 0) {
        setCompanies(data.companies);
      }
      if (data.quotes && typeof data.quotes === "object") {
        setQuotes(data.quotes);
      }
      if (Array.isArray(data.kapDisclosures) && data.kapDisclosures.length > 0) {
        setKapDisclosures(data.kapDisclosures);
      }
      if (data.source) {
        setSource(data.source);
      }
      setUpdatedAt(
        new Date(data.updatedAt || Date.now()).toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch {
      // Sessizce mevcut veriyi koru
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshNow();
    if (pollIntervalMs <= 0) return;
    const timer = setInterval(refreshNow, pollIntervalMs);
    return () => clearInterval(timer);
  }, [pollIntervalMs, refreshNow]);

  return {
    companies,
    quotes,
    kapDisclosures,
    updatedAt,
    source,
    isRefreshing,
    refreshNow,
  };
}
