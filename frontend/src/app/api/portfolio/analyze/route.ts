import { NextResponse } from "next/server";
import {
  ComplianceAlertItem,
  PortfolioHoldingItem,
  ScreeningStandardCode,
} from "@/types/katilim";
import {
  DETAILED_COMPANIES_DATABASE,
  evaluateCompanyStatusForStandard,
  getCompanySummary,
  getSmartAlternativesForTicker,
} from "@/lib/data/sampleCompanies";
import {
  Decimal,
  toDecimal,
  calculateDaysHeld,
  calculateHoldingPurificationClient,
  calculateDividendPurificationClient,
  calculateZakatForPositionClient,
} from "@/lib/decimal/decimal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const holdings: PortfolioHoldingItem[] = body.holdings || [];
    const standard: ScreeningStandardCode =
      body.standard || "BIST_KATILIM_DIB";
    const useCeiling: boolean =
      body.useCeiling !== undefined ? Boolean(body.useCeiling) : true;

    let totalMarketValue = new Decimal(0);
    let totalCostBasis = new Decimal(0);
    let compliantMarketValue = new Decimal(0);
    let totalPurificationPayable = new Decimal(0);
    let totalZakatPayable = new Decimal(0);

    const alerts: ComplianceAlertItem[] = [];

    const evaluatedHoldings = holdings.map((h) => {
      const summary = getCompanySummary(h.ticker);
      const detail = DETAILED_COMPANIES_DATABASE[h.ticker.toUpperCase()];

      const price = toDecimal(summary?.priceTRY || "100.00");
      const lots = toDecimal(h.lots || "0");
      const avgCost = toDecimal(h.avgCostTRY || price);

      const marketValue = lots.times(price);
      const costValue = lots.times(avgCost);
      const pnlTRY = marketValue.minus(costValue);

      totalMarketValue = totalMarketValue.plus(marketValue);
      totalCostBasis = totalCostBasis.plus(costValue);

      const evalResult = summary
        ? evaluateCompanyStatusForStandard(summary, standard)
        : { status: "COMPLIANT" as const, breachedMetrics: [] };

      if (
        evalResult.status === "COMPLIANT" ||
        evalResult.status === "GRACE_PERIOD_TOLERANCE"
      ) {
        compliantMarketValue = compliantMarketValue.plus(marketValue);
      }

      // Automatically determine days held from purchaseDate
      const { totalDaysHeld, daysHeldInQuarter, formattedPurchaseDate } =
        calculateDaysHeld(h.purchaseDate || "2026-06-01");

      // Purification via Phase 2 PurificationEngine formula
      const impureQuarter = toDecimal(
        detail?.purificationMetrics.impureIncomeIsolatedQuarterTRY || "0"
      );
      const totalShares = toDecimal(
        detail?.purificationMetrics.totalSharesOutstanding || "1000000000"
      );
      const divRatio = toDecimal(
        detail?.purificationMetrics.dividendPurificationRatio || "0"
      );

      let payablePurification = new Decimal(0);
      if (h.purificationMethod === "dividend") {
        const divRes = calculateDividendPurificationClient(
          h.receivedDividendTRY || "0",
          divRatio,
          useCeiling
        );
        payablePurification = divRes.purificationPayable;
      } else {
        const holdRes = calculateHoldingPurificationClient(
          impureQuarter,
          totalShares,
          lots,
          daysHeldInQuarter,
          90,
          useCeiling
        );
        payablePurification = holdRes.totalPurificationPayable;
      }

      totalPurificationPayable =
        totalPurificationPayable.plus(payablePurification);

      // Zakat calculation
      const zakatRes = calculateZakatForPositionClient({
        quantityLots: lots,
        currentPriceTRY: price,
        zatableNetAssetsPerShareTRY:
          detail?.purificationMetrics.zatableNetCurrentAssetsPerShareTRY ||
          summary?.zatableNetAssetsPerShareTRY ||
          "0",
        intent: h.zakatIntent || "LONG_TERM_DIVIDEND",
      });

      totalZakatPayable = totalZakatPayable.plus(zakatRes.zakatPayableTRY);

      if (evalResult.status !== "COMPLIANT" && summary) {
        alerts.push({
          holdingId: h.id,
          ticker: summary.ticker,
          companyName: summary.name,
          sector: summary.sector,
          fiscalPeriod: "2026-Q2",
          previousStatus: summary.previousQuarterStatus || "COMPLIANT",
          currentStatus: evalResult.status,
          riskLevel:
            evalResult.status === "NON_COMPLIANT" ? "BREACHED" : "AT_RISK",
          consecutiveBreachQuarters: 1,
          maxGraceQuarters: 2,
          breachedMetrics: evalResult.breachedMetrics,
          reasonText:
            summary.breachReasonSummary ||
            "Son bilanço döneminde finansal uygunluk rasyoları eşik değeri aşmıştır.",
          actionRequiredText:
            evalResult.status === "NON_COMPLIANT"
              ? "Hissenin elde tutulduğu gün kadar şüpheli gelir arındırılmalı ve aynı sektördeki %100 uygun alternatiflerle ikame edilmelidir."
              : "Hoşgörü süresi (Grace Period 1/2 çeyrek) takip edilmeli; rasyo düzelmezse pozisyon uygun alternatifle değiştirilmelidir.",
          positionMarketValueTRY: marketValue.toFixed(4),
          accruedPurificationTRY: payablePurification.toFixed(2),
          alternatives: getSmartAlternativesForTicker(summary.ticker, standard),
        });
      }

      return {
        ...h,
        totalDaysHeld,
        daysHeldInQuarter,
        formattedPurchaseDate,
        status: evalResult.status,
        marketValueTRY: marketValue.toFixed(2),
        costValueTRY: costValue.toFixed(2),
        pnlTRY: pnlTRY.toFixed(2),
        purificationPayableTRY: payablePurification.toFixed(2),
        zakatPayableTRY: zakatRes.zakatPayableTRY.toFixed(2),
      };
    });

    const halalWeightPercent = totalMarketValue.gt(0)
      ? compliantMarketValue
          .dividedBy(totalMarketValue)
          .times(100)
          .toFixed(2)
      : "100.00";

    return NextResponse.json({
      standard,
      totalMarketValueTRY: totalMarketValue.toFixed(2),
      totalCostBasisTRY: totalCostBasis.toFixed(2),
      totalPnlTRY: totalMarketValue.minus(totalCostBasis).toFixed(2),
      halalWeightPercent,
      totalPurificationPayableTRY: totalPurificationPayable.toFixed(2),
      totalZakatPayableTRY: totalZakatPayable.toFixed(2),
      evaluatedHoldings,
      alerts,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Portföy analizi hatası: ${String(err)}` },
      { status: 400 }
    );
  }
}
