import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { BIST_COMPREHENSIVE_UNIVERSE } from "@/lib/data/bistUniverse";
import { fetchStocksDataFromSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { CompanySummary } from "@/types/katilim";

export const dynamic = "force-dynamic";

export interface LiveStockQuoteDTO {
  ticker: string;
  priceTRY: string;
  change24h: string;
  change24hNumeric: number;
  sparkline: number[];
  source: "YAHOO_LIVE" | "SUPABASE_DB" | "CANONICAL";
  updatedAt: string;
}

export interface KAPDisclosureDTO {
  disclosureId: string;
  ticker: string;
  companyName: string;
  title: string;
  category: "FINANCIAL_REPORT" | "KATILIM_INFO_FORM" | "DIVIDEND_OR_CAPITAL" | "MATERIAL_EVENT";
  summary: string;
  publishedAt: string;
  triggersRescreening: boolean;
  kapUrl: string;
}

const DEFAULT_KAP_DISCLOSURES: KAPDisclosureDTO[] = [
  {
    disclosureId: "KAP-2026-140210",
    ticker: "BIMAS",
    companyName: "BİM Birleşik Mağazalar A.Ş.",
    title: "Katılım Finans İlkeleri Bilgi Formu (KAFİF)",
    category: "KATILIM_INFO_FORM",
    summary:
      "Faizli borç rasyosu %1.32, uygunsuz gelir oranı %0.23 olarak gerçekleşmiştir. BIST Katılım ve AAOIFI tam uygundur.",
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
      "Filo genişlemesi finansal kiralama borçları nedeniyle borç rasyosu %30.85 olarak izlenmektedir (BIST Katılım uygun, AAOIFI hoşgörü bandında).",
    publishedAt: "09:50",
    triggersRescreening: true,
    kapUrl: "https://www.kap.org.tr",
  },
];

async function fetchYahooBistQuote(ticker: string): Promise<LiveStockQuoteDTO | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2800);
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}.IS?interval=1d&range=5d`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta || meta.regularMarketPrice == null) return null;

    const priceDec = new Decimal(String(meta.regularMarketPrice));
    const prevDec = new Decimal(
      String(meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice)
    );
    if (priceDec.lte(0)) return null;

    const pctDec = prevDec.gt(0)
      ? priceDec.minus(prevDec).div(prevDec).mul(100)
      : new Decimal(0);
    const sign = pctDec.gte(0) ? "+" : "";
    const formattedChange = `${sign}${pctDec.toFixed(2)}%`;

    const rawCloses: Array<number | null> = result?.indicators?.quote?.[0]?.close ?? [];
    const sparkline = rawCloses
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0)
      .slice(-5)
      .map((v) => Number(new Decimal(String(v)).toFixed(2)));

    return {
      ticker,
      priceTRY: priceDec.toFixed(2),
      change24h: formattedChange,
      change24hNumeric: Number(pctDec.toFixed(2)),
      sparkline:
        sparkline.length >= 2
          ? sparkline
          : [Number(prevDec.toFixed(2)), Number(priceDec.toFixed(2))],
      source: "YAHOO_LIVE",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const baseCompanies: CompanySummary[] = BIST_COMPREHENSIVE_UNIVERSE.map((c) => ({ ...c }));
  const quotesByTicker: Record<string, LiveStockQuoteDTO> = {};
  let dataSource: "LIVE_HYBRID" | "SUPABASE_DB" | "CANONICAL" = "CANONICAL";

  // 1. Supabase varsa oku
  if (isSupabaseConfigured()) {
    try {
      const { data: dbRows } = await fetchStocksDataFromSupabase();
      if (dbRows && dbRows.length > 0) {
        dataSource = "SUPABASE_DB";
        for (const row of dbRows) {
          const idx = baseCompanies.findIndex((c) => c.ticker === row.ticker);
          const changeNum = Number(row.change_24h_percent || 0);
          const formattedChange = `${changeNum >= 0 ? "+" : ""}${changeNum.toFixed(2)}%`;

          quotesByTicker[row.ticker] = {
            ticker: row.ticker,
            priceTRY: new Decimal(String(row.last_price_try || 0)).toFixed(2),
            change24h: formattedChange,
            change24hNumeric: changeNum,
            sparkline: Array.isArray(row.historical_sparkline)
              ? row.historical_sparkline
              : [],
            source: "SUPABASE_DB",
            updatedAt: row.updated_at || new Date().toISOString(),
          };

          if (idx !== -1) {
            baseCompanies[idx] = {
              ...baseCompanies[idx],
              priceTRY: quotesByTicker[row.ticker].priceTRY,
              change24h: formattedChange,
              debtRatioPercent: Number(row.debt_ratio_percent),
              cashRatioPercent: Number(row.cash_ratio_percent),
              impureIncomePercent: Number(row.impure_income_percent),
              purificationPerShareTRY: String(row.purification_per_share_try),
              zatableNetAssetsPerShareTRY: String(row.zatable_net_assets_per_share_try),
              bistStatus: row.is_bist_katilim_compliant ? "COMPLIANT" : "NON_COMPLIANT",
              aaoifiStatus: row.is_aaoifi_compliant
                ? "COMPLIANT"
                : row.compliance_status === "AT_RISK"
                ? "GRACE_PERIOD_TOLERANCE"
                : "NON_COMPLIANT",
            };
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. İlk 15 hisse için anlık Yahoo Finance canlı sorgusu yapalım
  const primaryTickers = baseCompanies.slice(0, 15).map((c) => c.ticker);
  const liveResults = await Promise.all(primaryTickers.map((t) => fetchYahooBistQuote(t)));

  let anyYahooLive = false;
  for (let i = 0; i < primaryTickers.length; i++) {
    const liveQuote = liveResults[i];
    if (liveQuote) {
      anyYahooLive = true;
      const comp = baseCompanies.find((c) => c.ticker === primaryTickers[i]);
      if (comp) {
        comp.priceTRY = liveQuote.priceTRY;
        comp.change24h = liveQuote.change24h;
      }
      quotesByTicker[primaryTickers[i]] = liveQuote;
    }
  }

  // Geri kalan hisseler için quotesByTicker tamamla
  for (const comp of baseCompanies) {
    if (!quotesByTicker[comp.ticker]) {
      const parsedChange = parseFloat(comp.change24h.replace("%", "").replace("+", "")) || 0;
      const basePrice = parseFloat(comp.priceTRY) || 50;
      quotesByTicker[comp.ticker] = {
        ticker: comp.ticker,
        priceTRY: comp.priceTRY,
        change24h: comp.change24h,
        change24hNumeric: parsedChange,
        sparkline: [
          Number((basePrice * 0.985).toFixed(2)),
          Number((basePrice * 0.992).toFixed(2)),
          Number((basePrice * 0.996).toFixed(2)),
          Number((basePrice * 0.998).toFixed(2)),
          basePrice,
        ],
        source: "CANONICAL",
        updatedAt: new Date().toISOString(),
      };
    }
  }

  if (anyYahooLive) {
    dataSource = "LIVE_HYBRID";
  }

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    source: dataSource,
    companies: baseCompanies,
    quotes: quotesByTicker,
    kapDisclosures: DEFAULT_KAP_DISCLOSURES,
  });
}
