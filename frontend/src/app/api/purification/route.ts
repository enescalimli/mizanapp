import { NextResponse } from "next/server";
import { DETAILED_COMPANIES_DATABASE } from "@/lib/data/sampleCompanies";
import {
  calculateDividendPurificationClient,
  calculateHoldingPurificationClient,
  formatTRY,
} from "@/lib/decimal/decimal";
import { PurificationCalculationRequest } from "@/types/katilim";

export async function POST(request: Request) {
  try {
    const body: PurificationCalculationRequest = await request.json();
    const ticker = body.ticker.toUpperCase().trim();
    const company = DETAILED_COMPANIES_DATABASE[ticker];

    if (!company) {
      return NextResponse.json(
        { error: `Şirket bulunamadı: ${ticker}` },
        { status: 404 }
      );
    }

    const {
      quantityLots,
      daysHeld,
      periodTotalDays = 90,
      calculationMethod,
      dividendReceivedTRY,
      useConservativeCeiling = false,
    } = body;

    if (calculationMethod === "DIVIDEND_BASED") {
      const divAmount = dividendReceivedTRY || "0.0000";
      const ratio = company.purificationMetrics.dividendPurificationRatio;
      const res = calculateDividendPurificationClient(
        divAmount,
        ratio,
        useConservativeCeiling
      );

      return NextResponse.json({
        ticker,
        calculationMethod,
        dividendReceivedTRY: divAmount,
        impureIncomeRatio: ratio,
        purificationRawTRY: res.purificationRaw.toFixed(4),
        purificationPayableTRY: res.purificationPayable.toFixed(2),
        formattedPayable: formatTRY(res.purificationPayable),
        breakdownSummary: `${formatTRY(divAmount)} temettü x %${(
          Number(ratio) * 100
        ).toFixed(2)} uygunsuz gelir oranı`,
      });
    }

    // Default: HOLDING_PERIOD_PRO_RATA
    const impureQuarter =
      company.purificationMetrics.impureIncomeIsolatedQuarterTRY;
    const shares = company.purificationMetrics.totalSharesOutstanding;
    const res = calculateHoldingPurificationClient(
      impureQuarter,
      shares,
      quantityLots,
      daysHeld,
      periodTotalDays,
      useConservativeCeiling
    );

    return NextResponse.json({
      ticker,
      calculationMethod: "HOLDING_PERIOD_PRO_RATA",
      quantityLots,
      daysHeld,
      periodTotalDays,
      proRataFactor: res.proRataFactor.toFixed(6),
      purificationPerShareTRY: res.purificationPerShare.toFixed(8),
      totalPurificationRawTRY: res.totalPurificationRaw.toFixed(4),
      totalPurificationPayableTRY: res.totalPurificationPayable.toFixed(2),
      formattedPayable: formatTRY(res.totalPurificationPayable),
      breakdownSummary: `(${formatTRY(
        impureQuarter,
        0
      )} / ${shares} pay) x ${quantityLots} lot x (${daysHeld} / ${periodTotalDays} gün)`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
