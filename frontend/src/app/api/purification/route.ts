import { NextResponse } from "next/server";
import { DETAILED_COMPANIES_DATABASE } from "@/lib/data/sampleCompanies";
import { fetchLiveBistUniverse24x7, getCompanyByTicker } from "@/lib/data/bistUniverse";
import {
  calculateDividendPurificationClient,
  calculateHoldingPurificationClient,
  formatTRY,
  toDecimal,
} from "@/lib/decimal/decimal";
import { PurificationCalculationRequest } from "@/types/katilim";

export async function POST(request: Request) {
  try {
    const body: PurificationCalculationRequest = await request.json();
    const ticker = body.ticker.toUpperCase().trim();

    // 1. Try detailed audited balance sheet database first
    const detailedCompany = DETAILED_COMPANIES_DATABASE[ticker];

    // 2. Fallback to 626 comprehensive BIST universe
    const { companies } = await fetchLiveBistUniverse24x7();
    const univ =
      companies.find((c) => c.ticker === ticker) || getCompanyByTicker(ticker);

    if (!detailedCompany && !univ) {
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

    // Determine ratios & synchronized TKBB per-share metrics
    const impureIncomeRatio = detailedCompany
      ? detailedCompany.purificationMetrics.dividendPurificationRatio
      : (toDecimal(univ?.impureIncomePercent || 1.5).div(100)).toFixed(4);

    const price = parseFloat(univ?.priceTRY || "50");
    const mcap = univ?.marketCapTRY || price * 100_000_000;
    const totalShares = detailedCompany
      ? detailedCompany.purificationMetrics.totalSharesOutstanding
      : String(Math.max(10_000_000, Math.round(mcap / (price || 1))));

    const pShareQuarter = detailedCompany
      ? toDecimal(detailedCompany.purificationMetrics.purificationPerShareQuarterTRY)
      : toDecimal(univ?.purificationPerShareTRY || "0");

    const impureQuarter = detailedCompany
      ? detailedCompany.purificationMetrics.impureIncomeIsolatedQuarterTRY
      : pShareQuarter.times(toDecimal(totalShares)).toFixed(4);

    if (calculationMethod === "DIVIDEND_BASED" || (body as any).calculationMethod === "DIVIDEND_PRO_RATA") {
      const divAmount = dividendReceivedTRY || "0.0000";
      const res = calculateDividendPurificationClient(
        divAmount,
        impureIncomeRatio,
        useConservativeCeiling
      );

      return NextResponse.json({
        ticker,
        companyName: detailedCompany?.companyName || univ?.name || ticker,
        calculationMethod: "DIVIDEND_BASED",
        dividendReceivedTRY: divAmount,
        impureIncomeRatio,
        purificationRawTRY: res.purificationRaw.toFixed(4),
        purificationPayableTRY: res.purificationPayable.toFixed(2),
        formattedPayable: formatTRY(res.purificationPayable),
        breakdownSummary: `${formatTRY(divAmount)} temettü x %${(
          Number(impureIncomeRatio) * 100
        ).toFixed(2)} uygunsuz gelir oranı`,
      });
    }

    // Default: HOLDING_PERIOD_PRO_RATA
    const effectiveDaysHeld = Number(daysHeld) > 0 ? Number(daysHeld) : periodTotalDays;
    const res = calculateHoldingPurificationClient(
      impureQuarter,
      totalShares,
      quantityLots || "100",
      effectiveDaysHeld,
      periodTotalDays,
      useConservativeCeiling
    );

    return NextResponse.json({
      ticker,
      companyName: detailedCompany?.companyName || univ?.name || ticker,
      calculationMethod: "HOLDING_PERIOD_PRO_RATA",
      quantityLots: quantityLots || "100",
      daysHeld: effectiveDaysHeld,
      periodTotalDays,
      proRataFactor: res.proRataFactor.toFixed(6),
      purificationPerShareTRY: res.purificationPerShare.toFixed(8),
      totalPurificationRawTRY: res.totalPurificationRaw.toFixed(4),
      totalPurificationPayableTRY: res.totalPurificationPayable.toFixed(2),
      formattedPayable: formatTRY(res.totalPurificationPayable),
      breakdownSummary: `(${formatTRY(
        impureQuarter,
        0
      )} / ${Number(totalShares).toLocaleString("tr-TR")} pay) x ${quantityLots || "100"} lot x (${effectiveDaysHeld} / ${periodTotalDays} gün)`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
