import { NextResponse } from "next/server";
import { SAMPLE_COMPANIES_SUMMARY } from "@/lib/data/sampleCompanies";
import { fetchStocksDataFromSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toUpperCase().trim() || "";
  const status = searchParams.get("status");

  let list = SAMPLE_COMPANIES_SUMMARY.map((c) => ({ ...c }));

  if (isSupabaseConfigured()) {
    try {
      const { data: dbRows } = await fetchStocksDataFromSupabase();
      if (dbRows && dbRows.length > 0) {
        for (const row of dbRows) {
          const idx = list.findIndex((c) => c.ticker === row.ticker);
          const changeNum = Number(row.change_24h_percent || 0);
          const formattedChange = `${changeNum >= 0 ? "+" : ""}${changeNum.toFixed(2)}%`;
          if (idx !== -1) {
            list[idx] = {
              ...list[idx],
              priceTRY: Number(row.last_price_try || 0).toFixed(2),
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
      // Fallback to canonical list
    }
  }

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
