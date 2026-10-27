export type ComplianceStatus =
  | "COMPLIANT"
  | "GRACE_PERIOD_TOLERANCE"
  | "NON_COMPLIANT"
  | "INSUFFICIENT_DATA";

export type ScreeningStandardCode = "BIST_KATILIM_DIB";

export type ZakatIntentionType = "TRADING_SHORT_TERM" | "LONG_TERM_DIVIDEND";

export type CalendarBasisType = "HIJRI_354" | "GREGORIAN_365";

export type KatilimRiskLevel = "SAFE" | "AT_RISK" | "BREACHED";

export interface CompanySummary {
  ticker: string;
  name: string;
  sector: string;
  subSector?: string;
  bistStatus: ComplianceStatus;
  aaoifiStatus?: ComplianceStatus;
  debtRatioPercent: number;
  cashRatioPercent: number;
  impureIncomePercent: number;
  priceTRY: string;
  change24h: string;
  purificationPerShareTRY: string;
  zatableNetAssetsPerShareTRY?: string;
  breachReasonSummary?: string;
  previousQuarterStatus?: ComplianceStatus;
}

export interface RatioDetail {
  numeratorTRY: string;
  denominatorTRY: string;
  ratioDecimal: string;
  ratioPercentage: string;
  thresholdPercentage: string;
  toleranceCeilingPercentage: string;
  isCompliant: boolean;
  isInToleranceBand: boolean;
  marginToLimitPercentage: string;
}

export interface CashFootnoteDetail {
  cashOnHandTRY: string;
  demandDepositsTRY: string;
  participationAccountsTRY: string;
  timeDepositsInterestTRY: string;
  reverseRepoTRY: string;
  moneyMarketFundsTRY: string;
  unclassifiedCashTRY: string;
}

export interface DebtFootnoteDetail {
  participationBankFinancingsTRY: string;
  sukukIssuedTRY: string;
  operationalLeaseTRY: string;
  conventionalBankLoansTRY: string;
  issuedBondsDebtTRY: string;
  factoringDebtTRY: string;
}

export interface FootnoteVerification {
  isAccountingIdentityVerified: boolean;
  usedConservativeFallback: boolean;
  extractionMethod: string;
  auditNotes: string[];
  balanceSheetCashTotalTRY: string;
  balanceSheetDebtTotalTRY: string;
  cashBreakdown: CashFootnoteDetail;
  debtBreakdown: DebtFootnoteDetail;
}

export interface CompanyFinancialsSummary {
  revenueTRY: string;
  grossProfitTRY: string;
  ebitdaTRY: string;
  netIncomeTRY: string;
  currentAssetsTRY: string;
  nonCurrentAssetsTRY: string;
  totalAssetsTRY: string;
  financialDebtTRY: string;
  netDebtTRY: string;
  equityTRY: string;
  revenueGrowthYoY: string;
  netIncomeGrowthYoY: string;
  grossMargin: string;
  ebitdaMargin: string;
  netMargin: string;
  peRatio: string;
  pbRatio: string;
  evEbitda: string;
  netDebtToEbitda: string;
  roePercent: string;
  roaPercent: string;
}

export interface PeriodicReturns {
  daily: string;
  weekly: string;
  monthly: string;
  threeMonths?: string;
  sixMonths: string;
  ytd2026: string;
  oneYear: string;
  fiveYears: string;
  previousCloseTRY?: number;
  openTRY?: number;
  high1M?: number;
  low1M?: number;
  high3M?: number;
  low3M?: number;
  high6M?: number;
  low6M?: number;
  high52W?: number;
  low52W?: number;
}

export interface AiComponentScore {
  name: string;
  score: number;
  status: "EXCELLENT" | "GOOD" | "MODERATE" | "WEAK" | "CRITICAL";
  description: string;
}

export interface AiAnalysisReport {
  score: number;
  verdict: string;
  shariahRiskSummary: string;
  financialHealthSummary: string;
  purificationZakatNote: string;
  pros: string[];
  cons: string[];
  scoresBreakdown?: {
    shariahSafety: AiComponentScore;
    financialResilience: AiComponentScore;
    profitabilityGrowth: AiComponentScore;
    valuationAttractiveness: AiComponentScore;
  };
  shariahSafetyBufferPercent?: number;
  nextQuarterRiskLevel?: "DÜŞÜK" | "ORTA" | "YÜKSEK";
  nextQuarterRiskOutlook?: string;
  valuationInsight?: string;
  dupontAiSynthesis?: string;
  targetInvestorProfile?: string;
  shariahActionPlan?: string;
  simulationRiskText?: string;
  maxAdditionalDebtTRY?: string;
  zakatPerShareTRY?: string;
  zakatLongTermPerShareTRY?: string;
  zakatShortTermTradingPerShareTRY?: string;
  compliantPeerAlternatives?: {
    ticker: string;
    name: string;
    debtRatioPercent: number;
    peRatio: string;
    pbRatio: string;
    reason: string;
  }[];
}

export interface DetailedBreachDiagnostic {
  category: "SECTOR_ACTIVITY" | "SUBSIDIARY" | "GOVERNANCE_KAFIF" | "DEBT_RATIO" | "CASH_RATIO" | "INCOME_RATIO" | "COMPLIANT";
  categoryLabel: string;
  primaryReason: string;
  regulatoryStandard: string;
  detailExplanation: string;
}

export interface ScorecardCriterion {
  label: string;
  passed: boolean;
  value?: string;
  threshold?: string;
  subText?: string;
}

export interface CompanyScorecard {
  profitabilityScore: number; // out of 6
  profitabilityItems: ScorecardCriterion[];
  growthScore: number; // out of 6
  growthItems: ScorecardCriterion[];
  debtScore: number; // out of 6
  debtItems: ScorecardCriterion[];
  shariahScore: number; // out of 6
  shariahItems: ScorecardCriterion[];
  totalScore: number; // out of 24
  passedCount?: number;
  failedCount?: number;
  categorySummaries?: {
    profitability: string;
    growth: string;
    debt: string;
    shariah: string;
  };
  ratingLetter: "A+" | "A" | "B+" | "B" | "C" | "D" | "F";
}

export interface DetailedRatiosGroup {
  valuation: {
    pe: string;
    pb: string;
    evEbitda: string;
    priceToFcf: string;
    epsTRY: string;
    dividendYield: string;
  };
  profitability: {
    grossMargin: string;
    operatingMargin: string;
    ebitdaMargin: string;
    netMargin: string;
    roe: string;
    roa: string;
    roic: string;
  };
  liquidity: {
    currentRatio: string;
    quickRatio: string;
    cashRatio: string;
    workingCapitalTRY: string;
  };
  debt: {
    debtToEquity: string;
    netDebtToEbitda: string;
    debtToAssets: string;
    financialDebtTRY: string;
    netDebtTRY: string;
  };
}

export interface DupontAnalysis {
  netMarginPercent: number;
  assetTurnover: number;
  leverageMultiplier: number;
  calculatedRoePercent: number;
}

export interface HistoricalDividendItem {
  year: number;
  grossPerShareTRY: string;
  dividendYieldPercent: string;
  purificationPerShareTRY: string;
  paymentDate: string;
}

export interface PeerComparisonItem {
  ticker: string;
  name: string;
  priceTRY: string;
  change24h: string;
  isCompliant: boolean;
  peRatio: string;
  pbRatio: string;
  evEbitda: string;
  debtRatioPercent: number;
  roePercent?: string;
  netDebtToEbitda?: string;
}

export interface CompanyDetailScreening {
  ticker: string;
  companyName: string;
  sector: string;
  subSector: string;
  fiscalPeriod: string;
  valuationDate: string;
  standardCode: ScreeningStandardCode;
  overallStatus: ComplianceStatus;
  currentPriceTRY?: number;
  change24h?: string;
  change24hNumeric?: number;
  isSectorCompliant: boolean;
  prohibitedActivitiesFound: string[];
  detailedBreach?: DetailedBreachDiagnostic;
  financials?: CompanyFinancialsSummary;
  periodicReturns?: PeriodicReturns;
  scorecard?: CompanyScorecard;
  detailedRatios?: DetailedRatiosGroup;
  dupont?: DupontAnalysis;
  dividendHistory?: HistoricalDividendItem[];
  peers?: PeerComparisonItem[];
  aiAnalysis?: AiAnalysisReport;
  gracePeriodInfo: {
    isInGracePeriod: boolean;
    consecutiveBreachQuarters: number;
    maxAllowedQuarters: number;
    notes: string[];
  };
  ratios: {
    denominatorRuleUsed: string;
    denominatorValueTRY: string;
    spotMarketCapTRY: string;
    mcapMA24mTRY: string;
    totalAssetsTRY: string;
    interestDebt: RatioDetail;
    interestCash: RatioDetail;
    impureIncome: RatioDetail;
  };
  footnoteVerification: FootnoteVerification;
  purificationMetrics: {
    purificationPerShareQuarterTRY: string;
    dividendPurificationRatio: string;
    zatableNetCurrentAssetsPerShareTRY: string;
    totalSharesOutstanding: string;
    impureIncomeIsolatedQuarterTRY: string;
    isLossMakingQuarter?: boolean;
  };
}

export interface PurificationCalculationRequest {
  ticker: string;
  quantityLots: string;
  daysHeld: number;
  periodTotalDays?: number;
  calculationMethod: "HOLDING_PERIOD_PRO_RATA" | "DIVIDEND_BASED";
  dividendReceivedTRY?: string;
  useConservativeCeiling?: boolean;
}

export interface PurificationCalculationResponse {
  ticker: string;
  quantityLots: string;
  daysHeld: number;
  periodTotalDays: number;
  proRataFactor: string;
  purificationPerShareTRY: string;
  totalPurificationRawTRY: string;
  totalPurificationPayableTRY: string;
  methodUsed: string;
  breakdownSummary: string;
}

export interface PortfolioHoldingItem {
  id: string;
  ticker: string;
  lots: string;
  avgCostTRY: string;
  purchaseDate: string; // e.g. "2026-04-15" (Days held is computed dynamically, never manually typed)
  periodDays?: number;
  receivedDividendTRY?: string;
  purificationMethod: "holding" | "dividend";
  zakatIntent: ZakatIntentionType;
}

export interface PortfolioTransactionItem {
  id: string;
  ticker: string;
  type: "BUY" | "SELL";
  lots: number;
  priceTRY: number;
  totalAmountTRY: number;
  realizedPnlTRY?: number;
  realizedPnlPercent?: number;
  purificationAmountTRY: number;
  isPurified: boolean; // "Arındırma yapıldı / infak edildi mi?"
  date: string; // "YYYY-MM-DD"
  notes?: string;
}

export interface BreachedMetricItem {
  metricName: string;
  currentValuePercent: string;
  thresholdPercent: string;
  excessPercent: string;
  severity: "CRITICAL" | "WARNING";
}

export interface SmartAlternativeStock {
  ticker: string;
  name: string;
  sector: string;
  subSector?: string;
  priceTRY: string;
  change24h: string;
  debtRatioPercent: number;
  cashRatioPercent: number;
  impureIncomePercent: number;
  purificationPerShareTRY: string;
  complianceAdvantageNote: string;
}

export interface KatilimRiskAssessment {
  ticker: string;
  riskLevel: KatilimRiskLevel; // "SAFE" | "AT_RISK" (çıkma ihtimali) | "BREACHED" (katılımdan çıktı)
  title: string;
  explanation: string;
  debtRatioPercent: number;
  debtThresholdPercent: number;
  debtMarginPercent: number; // e.g. 2.15% margin to limit
  cashRatioPercent: number;
  impureIncomePercent: number;
  isNearBreach: boolean; // Borç oranı eşiğe %3'ten yakınsa veya hoşgörü süresindeyse
  consecutiveBreachQuarters: number;
  actionRecommendation: string;
}

export interface ComplianceAlertItem {
  holdingId: string;
  ticker: string;
  companyName: string;
  sector: string;
  fiscalPeriod: string;
  previousStatus: ComplianceStatus;
  currentStatus: ComplianceStatus;
  riskLevel: KatilimRiskLevel; // "BREACHED" or "AT_RISK"
  alertType?: "EXITED_COMPLIANCE" | "GRACE_PERIOD_WARNING";
  consecutiveBreachQuarters: number;
  maxGraceQuarters: number;
  breachedMetrics: BreachedMetricItem[];
  reasonText: string;
  actionRequiredText: string;
  positionMarketValueTRY: string;
  accruedPurificationTRY: string;
  alternatives: SmartAlternativeStock[];
}

export interface LivePriceQuote {
  ticker: string;
  priceTRY: string;
  change24h: string;
  changePercent: number;
  tickDirection: "up" | "down" | "flat";
  lastUpdated: string;
}

export interface SellPurificationSimulation {
  holdingId: string;
  ticker: string;
  companyName: string;
  lotsToSell: string;
  currentPriceTRY: string;
  grossProceedsTRY: string;
  avgCostTRY: string;
  costBasisTRY: string;
  realizedPnlTRY: string;
  purchaseDate: string;
  daysHeldInPeriod: number;
  purificationPerShareQuarterTRY: string;
  purificationFeePayableTRY: string;
  netHalalProceedsTRY: string;
  purificationDeductionPercent: string;
}
