import { NextResponse } from "next/server";
import { BistIpoItem, REAL_BIST_IPOS } from "@/lib/data/realBistIpos";

export const dynamic = "force-dynamic";

async function updateLivePriceForIpo(ticker: string, originalPrice: number): Promise<{ current: number; change: number } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2600);
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}.IS?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta || meta.regularMarketPrice == null) return null;

    const currentPrice = Number(meta.regularMarketPrice);
    if (currentPrice <= 0) return null;

    const gainPercent = ((currentPrice - originalPrice) / originalPrice) * 100;
    return {
      current: Number(currentPrice.toFixed(2)),
      change: Number(gainPercent.toFixed(2)),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("compliant"); // "true" or "false"
  const q = searchParams.get("q")?.toUpperCase().trim() || "";

  // Canlı piyasa fiyatlarını paralel olarak güncelle
  const ipoList: BistIpoItem[] = REAL_BIST_IPOS.map((item) => ({ ...item }));
  
  // İlk 6 popüler halka arz için anlık canlı fiyat çekelim
  const topTickers = ipoList.slice(0, 6);
  await Promise.all(
    topTickers.map(async (ipo) => {
      const live = await updateLivePriceForIpo(ipo.ticker, ipo.ipoPriceTRY);
      if (live) {
        ipo.currentPriceTRY = live.current;
        ipo.changeSinceIpoPercent = live.change;
      }
    })
  );

  let filtered = ipoList;

  if (statusFilter === "true") {
    filtered = filtered.filter((i) => i.isKatilimCompliant);
  } else if (statusFilter === "false") {
    filtered = filtered.filter((i) => !i.isKatilimCompliant);
  }

  if (q) {
    filtered = filtered.filter(
      (i) =>
        i.ticker.includes(q) ||
        i.companyName.toUpperCase().includes(q) ||
        i.sector.toUpperCase().includes(q)
    );
  }

  const compliantCount = ipoList.filter((i) => i.isKatilimCompliant).length;
  const nonCompliantCount = ipoList.filter((i) => !i.isKatilimCompliant).length;

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    totalIpos: ipoList.length,
    stats: {
      totalCount: ipoList.length,
      compliantCount,
      nonCompliantCount,
      complianceRatePercent: Number(((compliantCount / ipoList.length) * 100).toFixed(1)),
    },
    ipos: filtered,
  });
}
