import { NextResponse } from "next/server";
import { SAMPLE_COMPANIES_SUMMARY } from "@/lib/data/sampleCompanies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toUpperCase().trim() || "";
  const status = searchParams.get("status");

  let list = SAMPLE_COMPANIES_SUMMARY;

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

  return NextResponse.json({
    total: list.length,
    companies: list,
  });
}
