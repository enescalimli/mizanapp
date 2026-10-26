import Decimal from "decimal.js";
import {
  CalendarBasisType,
  CompanySummary,
  KatilimRiskAssessment,
  ScreeningStandardCode,
  SellPurificationSimulation,
  ZakatIntentionType,
} from "@/types/katilim";

// Global precision for financial calculations on client side (matches Python Decimal prec=28)
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export function toDecimal(value: string | number | Decimal): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  if (typeof value === "number") {
    return new Decimal(value.toString());
  }
  const cleaned = (value || "0").toString().trim();
  if (!cleaned || isNaN(Number(cleaned))) {
    return new Decimal(0);
  }
  return new Decimal(cleaned);
}

export function formatTRY(
  amount: string | number | Decimal,
  decimals: number = 2
): string {
  try {
    const dec = toDecimal(amount);
    const num = dec.toNumber();
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  } catch {
    return `₺${amount}`;
  }
}

export function formatPercent(
  ratio: string | number | Decimal,
  decimals: number = 2
): string {
  try {
    const dec = toDecimal(ratio);
    const percent = dec.times(100);
    return `%${percent.toFixed(decimals)}`;
  } catch {
    return `%${ratio}`;
  }
}

export function formatCompactNumber(
  val: string | number | Decimal
): string {
  try {
    const dec = toDecimal(val);
    const num = dec.toNumber();
    return new Intl.NumberFormat("tr-TR", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(num);
  } catch {
    return String(val);
  }
}

/**
 * Calculates calendar days elapsed between purchaseDate and valuationDate.
 * Investors NEVER manually type days held; it is computed deterministically from date.
 * Uses current date dynamically when valuationDateStr is omitted.
 */
export function calculateDaysHeld(
  purchaseDateStr: string,
  valuationDateStr?: string
): {
  totalDaysHeld: number;
  daysHeldInQuarter: number;
  daysHeldInSixMonths: number;
  formattedPurchaseDate: string;
} {
  try {
    const pDate = new Date(purchaseDateStr);
    const vDate = valuationDateStr ? new Date(valuationDateStr) : new Date();
    const diffMs = vDate.getTime() - pDate.getTime();
    const diffDays = isNaN(diffMs)
      ? 365
      : Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 1);

    // Single-quarter window (90 days) and TKBB 6-month reporting window (182 days)
    const daysInQuarter = Math.min(diffDays, 90);
    const daysInSixMonths = Math.min(diffDays, 182);

    const formatted = isNaN(diffMs)
      ? "1 Yıl (365 Gün)"
      : new Intl.DateTimeFormat("tr-TR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(pDate);

    return {
      totalDaysHeld: diffDays,
      daysHeldInQuarter: daysInQuarter,
      daysHeldInSixMonths: daysInSixMonths,
      formattedPurchaseDate: formatted,
    };
  } catch {
    return {
      totalDaysHeld: 365,
      daysHeldInQuarter: 90,
      daysHeldInSixMonths: 182,
      formattedPurchaseDate: purchaseDateStr || "1 Yıl (365 Gün)",
    };
  }
}

/**
 * TKBB Pay Senedi İhracı ve Alım-Satımı Standardı Madde 3.6.2 & Arındırma Rehberi:
 * Faiz gelirlerinin arındırılmasında, ilgili bilanço dönemindeki enflasyon (TÜFE) oranını
 * aşan reel kısım esas alınır; anaparanın enflasyon karşısındaki değer kaybını telafi eden
 * kısım mahzurlu kazanç matrahından düşülür.
 */
export function applyTkbbInflationAdjustmentClient(params: {
  grossInterestIncomeTRY: string | number | Decimal;
  nonCompliantOperatingIncomeTRY?: string | number | Decimal;
  interestBearingCashTRY?: string | number | Decimal;
  periodInflationRateDecimal?: string | number | Decimal;
  nominalInterestRateDecimal?: string | number | Decimal;
}): Decimal {
  const grossInterest = Decimal.max(new Decimal(0), toDecimal(params.grossInterestIncomeTRY));
  const nonCompliantOp = Decimal.max(
    new Decimal(0),
    toDecimal(params.nonCompliantOperatingIncomeTRY || 0)
  );
  const cashPrincipal = Decimal.max(
    new Decimal(0),
    toDecimal(params.interestBearingCashTRY || 0)
  );
  const inflationRate = Decimal.max(
    new Decimal(0),
    toDecimal(params.periodInflationRateDecimal || 0)
  );
  const nominalRate = Decimal.max(
    new Decimal(0),
    toDecimal(params.nominalInterestRateDecimal || 0)
  );

  let realInterestIncome = grossInterest;

  if (cashPrincipal.gt(0) && inflationRate.gt(0)) {
    const inflationCompensation = cashPrincipal.times(inflationRate);
    realInterestIncome = Decimal.max(new Decimal(0), grossInterest.minus(inflationCompensation));
  } else if (inflationRate.gt(0) && nominalRate.gt(0)) {
    if (nominalRate.lte(inflationRate)) {
      realInterestIncome = new Decimal(0);
    } else {
      const realPortionRatio = nominalRate.minus(inflationRate).dividedBy(nominalRate);
      realInterestIncome = grossInterest.times(realPortionRatio);
    }
  }

  return realInterestIncome.plus(nonCompliantOp);
}

/**
 * TKBB Danışma Kurulu "Mahzurlu Kazançları Arındırmaya İlişkin Uygulama Rehberi" Formülü:
 * Arındırma Tutarı = (Dönemlik Mahzurlu Gelir / Toplam Pay Adedi) * Sahip Olunan Pay Adedi * (Elde Tutulan Gün / Dönem Gün Sayısı)
 *
 * Not: Yatırımcı hisseyi 1 çeyrekten (90 gün) veya 6 aydan (182 gün) daha uzun süre tuttuysa,
 * gün sayısı 90'a kesilmez (clamping yapılmaz); tutulan tüm günlerin (`daysHeld / periodTotalDays`)
 * oransal karşılığı eksiksiz hesaplanır.
 */
export function calculateHoldingPurificationClient(
  impureIncomeQuarterTRY: string | Decimal,
  totalSharesOutstanding: string | Decimal,
  quantityLots: string | Decimal,
  daysHeld: number,
  periodTotalDays: number = 90,
  useCeiling: boolean = true
): {
  purificationPerShare: Decimal;
  proRataFactor: Decimal;
  totalPurificationRaw: Decimal;
  totalPurificationPayable: Decimal;
} {
  const impure = toDecimal(impureIncomeQuarterTRY);
  const shares = toDecimal(totalSharesOutstanding);
  const lots = toDecimal(quantityLots);

  if (shares.isZero() || periodTotalDays <= 0 || lots.lte(0) || daysHeld <= 0) {
    return {
      purificationPerShare: new Decimal(0),
      proRataFactor: new Decimal(0),
      totalPurificationRaw: new Decimal(0),
      totalPurificationPayable: new Decimal(0),
    };
  }

  // EC-03: Şirket net dönem zararı açıklamış olsa bile pozitif mahzurlu gelir pay başına arındırılır
  const safeImpure = Decimal.max(new Decimal(0), impure);
  const pShare = safeImpure.dividedBy(shares);
  const effectiveDays = Math.max(daysHeld, 1);
  const factor = new Decimal(effectiveDays).dividedBy(periodTotalDays);
  const raw = pShare.times(lots).times(factor);

  const roundingMode = useCeiling
    ? Decimal.ROUND_CEIL
    : Decimal.ROUND_HALF_UP;
  const payable = raw.toDecimalPlaces(2, roundingMode);

  return {
    purificationPerShare: pShare,
    proRataFactor: factor,
    totalPurificationRaw: raw,
    totalPurificationPayable: payable,
  };
}

export function calculateDividendPurificationClient(
  dividendReceivedTRY: string | Decimal,
  impureIncomeRatio: string | Decimal,
  useCeiling: boolean = true
): {
  purificationRaw: Decimal;
  purificationPayable: Decimal;
} {
  const dividend = Decimal.max(new Decimal(0), toDecimal(dividendReceivedTRY));
  const ratio = Decimal.max(new Decimal(0), toDecimal(impureIncomeRatio));
  const raw = dividend.times(ratio);
  const roundingMode = useCeiling
    ? Decimal.ROUND_CEIL
    : Decimal.ROUND_HALF_UP;
  const payable = raw.toDecimalPlaces(2, roundingMode);

  return {
    purificationRaw: raw,
    purificationPayable: payable,
  };
}

/**
 * Computes exact purification fee deducted and net halal proceeds when selling a position.
 * Uses totalDaysHeld so multi-quarter holding durations are purified in full without 90-day truncation.
 */
export function calculateSellPurificationAndProceeds(params: {
  holdingId: string;
  ticker: string;
  companyName: string;
  lotsToSell: string | Decimal;
  currentPriceTRY: string | Decimal;
  avgCostTRY: string | Decimal;
  purchaseDate: string;
  impureIncomeQuarterTRY: string | Decimal;
  totalSharesOutstanding: string | Decimal;
  useCeiling?: boolean;
}): SellPurificationSimulation {
  const lots = Decimal.max(new Decimal(1), toDecimal(params.lotsToSell));
  const price = Decimal.max(new Decimal(0), toDecimal(params.currentPriceTRY));
  const cost = Decimal.max(new Decimal(0), toDecimal(params.avgCostTRY));

  const grossProceeds = lots.times(price);
  const costBasis = lots.times(cost);
  const realizedPnl = grossProceeds.minus(costBasis);

  const { totalDaysHeld } = calculateDaysHeld(params.purchaseDate);

  const purif = calculateHoldingPurificationClient(
    params.impureIncomeQuarterTRY,
    params.totalSharesOutstanding,
    lots,
    totalDaysHeld,
    90,
    params.useCeiling !== undefined ? params.useCeiling : true
  );

  const netHalalProceeds = grossProceeds.minus(purif.totalPurificationPayable);
  const purifPercent = grossProceeds.gt(0)
    ? purif.totalPurificationPayable.dividedBy(grossProceeds).times(100).toFixed(3)
    : "0.000";

  return {
    holdingId: params.holdingId,
    ticker: params.ticker,
    companyName: params.companyName,
    lotsToSell: lots.toString(),
    currentPriceTRY: price.toFixed(2),
    grossProceedsTRY: grossProceeds.toFixed(2),
    avgCostTRY: cost.toFixed(2),
    costBasisTRY: costBasis.toFixed(2),
    realizedPnlTRY: realizedPnl.toFixed(2),
    purchaseDate: params.purchaseDate,
    daysHeldInPeriod: totalDaysHeld,
    purificationPerShareQuarterTRY: purif.purificationPerShare.toFixed(6),
    purificationFeePayableTRY: purif.totalPurificationPayable.toFixed(2),
    netHalalProceedsTRY: netHalalProceeds.toFixed(2),
    purificationDeductionPercent: `%${purifPercent}`,
  };
}

export function calculateZakatForPositionClient(params: {
  quantityLots: string | Decimal;
  currentPriceTRY: string | Decimal;
  zatableNetAssetsPerShareTRY: string | Decimal;
  intent: ZakatIntentionType;
  calendarBasis?: CalendarBasisType;
}): {
  marketValueTRY: Decimal;
  zakatBaseTRY: Decimal;
  zakatRateDecimal: Decimal;
  zakatPayableTRY: Decimal;
} {
  const lots = Decimal.max(new Decimal(0), toDecimal(params.quantityLots));
  const price = Decimal.max(new Decimal(0), toDecimal(params.currentPriceTRY));
  const zatablePerShare = Decimal.max(
    new Decimal(0),
    toDecimal(params.zatableNetAssetsPerShareTRY)
  );

  const marketValueTRY = lots.times(price);
  const zakatBaseTRY =
    params.intent === "TRADING_SHORT_TERM"
      ? marketValueTRY
      : lots.times(zatablePerShare);

  const zakatRateDecimal =
    params.calendarBasis === "GREGORIAN_365"
      ? new Decimal("0.02577000")
      : new Decimal("0.02500000");

  const zakatPayableTRY = zakatBaseTRY
    .times(zakatRateDecimal)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    marketValueTRY,
    zakatBaseTRY,
    zakatRateDecimal,
    zakatPayableTRY,
  };
}

export function calculateEquivalentLotsForSwap(
  currentMarketValueTRY: string | Decimal,
  targetPriceTRY: string | Decimal
): string {
  const mval = toDecimal(currentMarketValueTRY);
  const targetPrice = toDecimal(targetPriceTRY);
  if (targetPrice.lte(0) || mval.lte(0)) {
    return "100";
  }
  const eqLots = mval.dividedBy(targetPrice).toDecimalPlaces(0, Decimal.ROUND_FLOOR);
  return Decimal.max(new Decimal(1), eqLots).toString();
}

/**
 * Analyzes whether a company has exited compliance OR is at risk of exiting compliance (Çıkma İhtimali).
 * Trigger condition:
 * - BREACHED: Status is NON_COMPLIANT (katılımdan çıktı)
 * - AT_RISK: Debt ratio is within 3% of limit (e.g. >= 30.0% for 33% limit), or in Grace Period tolerance band, or cash >= 30%, or impure income >= 4.0%.
 * - SAFE: Comfortably under all limits.
 */
export function assessStockKatilimRisk(
  summary: CompanySummary,
  standard: ScreeningStandardCode = "BIST_KATILIM_DIB"
): KatilimRiskAssessment {
  const debtThreshold = 33.0;
  const status = summary.bistStatus;

  const debtMargin = debtThreshold - summary.debtRatioPercent;
  const isBreached = status === "NON_COMPLIANT";

  // Check if at risk: close to debt threshold (<= 3.0% margin), in grace period, or close to income threshold (>= 4.0%)
  const isNearBreach =
    !isBreached &&
    (status === "GRACE_PERIOD_TOLERANCE" ||
      debtMargin <= 3.0 ||
      summary.cashRatioPercent >= debtThreshold - 3.0 ||
      summary.impureIncomePercent >= 4.0);

  if (isBreached) {
    return {
      ticker: summary.ticker,
      riskLevel: "BREACHED",
      title: "Katılım Endeksinden Çıktı",
      explanation: `${summary.ticker} son bilançoda katılım kriterlerini ihlal etti (Borç Oranı: %${summary.debtRatioPercent.toFixed(1)}).`,
      debtRatioPercent: summary.debtRatioPercent,
      debtThresholdPercent: debtThreshold,
      debtMarginPercent: debtMargin,
      cashRatioPercent: summary.cashRatioPercent,
      impureIncomePercent: summary.impureIncomePercent,
      isNearBreach: true,
      consecutiveBreachQuarters: 1,
      actionRecommendation: "Pozisyonu satıp aynı sektördeki %100 uygun alternatifle ikame etmeniz tavsiye edilir.",
    };
  }

  if (isNearBreach) {
    return {
      ticker: summary.ticker,
      riskLevel: "AT_RISK",
      title: "Çıkma İhtimali / Riskli Eşikte",
      explanation: `${summary.ticker} borç/faiz oranı (%${summary.debtRatioPercent.toFixed(1)}) %${debtThreshold.toFixed(0)} sınırına yalnızca %${debtMargin.toFixed(1)} mesafede; sonraki bilançoda endeksten çıkma riski yüksek.`,
      debtRatioPercent: summary.debtRatioPercent,
      debtThresholdPercent: debtThreshold,
      debtMarginPercent: debtMargin,
      cashRatioPercent: summary.cashRatioPercent,
      impureIncomePercent: summary.impureIncomePercent,
      isNearBreach: true,
      consecutiveBreachQuarters: status === "GRACE_PERIOD_TOLERANCE" ? 1 : 0,
      actionRecommendation: "Hisse tampon bölgede veya sınıra yakın. Yeni alım önerilmez; alternatifleri izleyin.",
    };
  }

  return {
    ticker: summary.ticker,
    riskLevel: "SAFE",
    title: "%100 Katılım Uygun",
    explanation: `${summary.ticker} finansal borç, nakit ve gelir kriterlerinde güvenli marj bölgesindedir (%${summary.debtRatioPercent.toFixed(1)} borç).`,
    debtRatioPercent: summary.debtRatioPercent,
    debtThresholdPercent: debtThreshold,
    debtMarginPercent: debtMargin,
    cashRatioPercent: summary.cashRatioPercent,
    impureIncomePercent: summary.impureIncomePercent,
    isNearBreach: false,
    consecutiveBreachQuarters: 0,
    actionRecommendation: "Katılım portföyü için güvenli uygunluk seviyesindedir.",
  };
}
