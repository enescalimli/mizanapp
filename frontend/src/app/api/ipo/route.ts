import { NextResponse } from "next/server";
import { fetchLiveBistIpos24x7 } from "@/lib/data/realBistIpos";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("compliant"); // "true" or "false"
  const q = searchParams.get("q")?.toUpperCase().trim() || "";
  const forceSync = searchParams.get("sync") === "true";

  const { ipos: ipoList, isLive, source, lastScrapedTime } = await fetchLiveBistIpos24x7(forceSync);

  let filtered = [...ipoList];

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
    isLive,
    source,
    lastScrapedTime,
    totalIpos: ipoList.length,
    stats: {
      totalCount: ipoList.length,
      compliantCount,
      nonCompliantCount,
      complianceRatePercent:
        ipoList.length > 0
          ? Number(((compliantCount / ipoList.length) * 100).toFixed(1))
          : 0,
    },
    ipos: filtered,
  });
}
