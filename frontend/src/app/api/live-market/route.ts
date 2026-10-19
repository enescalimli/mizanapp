import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { SAMPLE_COMPANIES_SUMMARY } from "@/lib/data/sampleCompanies";
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
    disclosureId: "KAP-2026-1384812",
    ticker: "ASELS",
    companyName: "Aselsan Elektronik San. ve Tic. A.Ş.",
    title: "Yeni İş İlişkisi / Savunma Elektronik Sistem Sözleşmesi",
    category: "MATERIAL_EVENT",
    summary:
      "ASELSAN ile uluslararası bir müşteri arasında 84,5 Milyon USD tutarında ihracat sözleşmesi imzalanmıştır.",
    publishedAt: "13:20",
    triggersRescreening: false,
    kapUrl: "https://www.kap.org.tr/tr/Bildirim/1384812",
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
  {
    disclosureId: "KAP-2026-1384690",
    ticker: "THYAO",
    companyName: "Türk Hava Yolları A.O.",
    title: "Finansal Rapor ve Uçak Finansmanı Kira Sertifikası / Kredi Dipnotu",
    category: "FINANCIAL_REPORT",
    summary:
      "Filo genişlemesi kapsamında finansal kiralama yükümlülükleri nedeniyle toplam faizli borç / piyasa değeri rasyosu güncellenmiştir.",
    publishedAt: "10:05",
    triggersRescreening: true,
    kapUrl: "https://www.kap.org.tr/tr/Bildirim/1384690",
  },
];

async function fetchYahooBistQuote(ticker: string): Promise<LiveStockQuoteDTO | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3200);
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
  const baseCompanies: CompanySummary[] = SAMPLE_COMPANIES_SUMMARY.map((c) => ({ ...c }));
  const quotesByTicker: Record<string, LiveStockQuoteDTO> = {};
  let dataSource: "LIVE_HYBRID" | "SUPABASE_DB" | "CANONICAL_FALLBACK" =
    "CANONICAL_FALLBACK";

  // 1. Varsa Supabase stocks_data tablosundan güncel kayıtları oku
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
      // Fallback to canonical + live Yahoo quotes
    }
  }

  // 2. BIST hisseleri için paralel canlı fiyat sorgusu (Yahoo Finance .IS)
  const tickers = baseCompanies.map((c) => c.ticker);
  const liveResults = await Promise.all(tickers.map((t) => fetchYahooBistQuote(t)));

  let anyYahooLive = false;
  for (let i = 0; i < baseCompanies.length; i++) {
    const comp = baseCompanies[i];
    const liveQuote = liveResults[i];
    if (liveQuote) {
      anyYahooLive = true;
      comp.priceTRY = liveQuote.priceTRY;
      comp.change24h = liveQuote.change24h;
      quotesByTicker[comp.ticker] = liveQuote;
    } else if (!quotesByTicker[comp.ticker]) {
      const parsedChange = parseFloat(comp.change24h.replace("%", "").replace("+", "")) || 0;
      const basePrice = parseFloat(comp.priceTRY) || 100;
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
