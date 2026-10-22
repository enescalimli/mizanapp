"use client";

import { useCallback, useEffect, useState } from "react";
import { BIST_COMPREHENSIVE_UNIVERSE } from "@/lib/data/bistUniverse";
import { CompanySummary } from "@/types/katilim";
import type { KAPDisclosureDTO, LiveStockQuoteDTO } from "@/app/api/live-market/route";

export interface UseLiveMarketDataReturn {
  companies: CompanySummary[];
  quotes: Record<string, LiveStockQuoteDTO>;
  kapDisclosures: KAPDisclosureDTO[];
  updatedAt: string | null;
  source: "LIVE_HYBRID" | "SUPABASE_DB" | "CANONICAL" | "CANONICAL_FALLBACK";
  isRefreshing: boolean;
  refreshNow: () => Promise<void>;
}

const INITIAL_KAP_FEED: KAPDisclosureDTO[] = [
  {
    disclosureId: "KAP-2026-140210",
    ticker: "BIMAS",
    companyName: "BİM Birleşik Mağazalar A.Ş.",
    title: "Katılım Finans İlkeleri Bilgi Formu (KAFİF)",
    category: "KATILIM_INFO_FORM",
    summary:
      "Faizli borç rasyosu %1.32, uygunsuz gelir oranı %0.23 olarak gerçekleşmiştir. BIST Katılım tam uygundur.",
    publishedAt: "16:45",
    triggersRescreening: true,
    kapUrl: "https://www.kap.org.tr",
  },
  {
    disclosureId: "KAP-2026-140205",
    ticker: "OBAMS",
    companyName: "Oba Makarnacılık San. ve Tic. A.Ş.",
    title: "Finansal Rapor ve Kâr Dağıtım Arındırma Oranı",
    category: "DIVIDEND_OR_CAPITAL",
    summary:
      "2026 kâr payı dağıtımında hisse başı fıkhi arındırma oranı 0.0420 TL olarak onaylanmıştır.",
    publishedAt: "15:20",
    triggersRescreening: true,
    kapUrl: "https://www.kap.org.tr",
  },
  {
    disclosureId: "KAP-2026-140192",
    ticker: "ASELS",
    companyName: "Aselsan Elektronik San. ve Tic. A.Ş.",
    title: "Yeni Sözleşme / Savunma Elektroniği İhracatı",
    category: "MATERIAL_EVENT",
    summary:
      "ASELSAN ile uluslararası bir kurum arasında 92 Milyon USD tutarında yeni sistem tedarik sözleşmesi imzalandı.",
    publishedAt: "14:10",
    triggersRescreening: false,
    kapUrl: "https://www.kap.org.tr",
  },
  {
    disclosureId: "KAP-2026-140180",
    ticker: "EFORC",
    companyName: "Efor Çay Sanayi Ticaret A.Ş.",
    title: "KAFİF Katılım Finansı İlkeleri Beyanı",
    category: "KATILIM_INFO_FORM",
    summary:
      "Şirketin faizli borç oranı %8.70 seviyesinde gerçekleşmiş olup BIST Katılım Endeksi kriterleri eksiksiz sağlanmaktadır.",
    publishedAt: "11:35",
    triggersRescreening: true,
    kapUrl: "https://www.kap.org.tr",
  },
  {
    disclosureId: "KAP-2026-140165",
    ticker: "THYAO",
    companyName: "Türk Hava Yolları A.O.",
    title: "Konsolide Finansal Rapor & Uçak Kiralama Yükümlülükleri",
    category: "FINANCIAL_REPORT",
    summary:
      "Filo genişlemesi finansal kiralama borçları nedeniyle borç rasyosu %30.85 olarak izlenmektedir (BIST Katılım %33 tavanı altında).",
    publishedAt: "09:50",
    triggersRescreening: true,
    kapUrl: "https://www.kap.org.tr",
  },
];

export function useLiveMarketData(pollIntervalMs: number = 30000): UseLiveMarketDataReturn {
  const [companies, setCompanies] = useState<CompanySummary[]>(BIST_COMPREHENSIVE_UNIVERSE);
  const [quotes, setQuotes] = useState<Record<string, LiveStockQuoteDTO>>({});
  const [kapDisclosures, setKapDisclosures] = useState<KAPDisclosureDTO[]>(INITIAL_KAP_FEED);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [source, setSource] = useState<"LIVE_HYBRID" | "SUPABASE_DB" | "CANONICAL" | "CANONICAL_FALLBACK">(
    "CANONICAL"
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
    if (pollIntervalMs > 0) {
      const interval = setInterval(refreshNow, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [refreshNow, pollIntervalMs]);

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
