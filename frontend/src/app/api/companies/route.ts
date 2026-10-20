import { NextResponse } from "next/server";
import { fetchLiveBistUniverse24x7 } from "@/lib/data/bistUniverse";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toUpperCase().trim() || "";
  const status = searchParams.get("status");
  const sector = searchParams.get("sector");

  const { companies: rawList, isLive, xktumCount } = await fetchLiveBistUniverse24x7();
  let list = [...rawList];

  if (q) {
    list = list.filter(
      (c) =>
        c.ticker.includes(q) ||
        c.name.toUpperCase().includes(q) ||
        c.sector.toUpperCase().includes(q)
    );
  }

  if (status) {
    list = list.filter((c) => c.bistStatus === status);
  }

  if (sector && sector !== "TÜMÜ") {
    list = list.filter((c) => c.sector.toLowerCase().includes(sector.toLowerCase()));
  }

  return NextResponse.json({
    total: list.length,
    totalUniverse: rawList.length,
    xktumCount,
    isLive,
    companies: list,
  });
}
