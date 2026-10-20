"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calculator,
  Coins,
  BellRing,
  Activity,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import {
  KatilimRiskAssessment,
  PortfolioHoldingItem,
  ScreeningStandardCode,
  ZakatIntentionType,
  ComplianceAlertItem,
} from "@/types/katilim";
import {
  SAMPLE_COMPANIES_SUMMARY,
  DETAILED_COMPANIES_DATABASE,
  evaluateCompanyStatusForStandard,
  getCompanySummary,
  getSmartAlternativesForTicker,
} from "@/lib/data/sampleCompanies";
import {
  Decimal,
  toDecimal,
  formatTRY,
  formatPercent,
  calculateDaysHeld,
  calculateHoldingPurificationClient,
  calculateSellPurificationAndProceeds,
  calculateZakatForPositionClient,
  assessStockKatilimRisk,
} from "@/lib/decimal/decimal";
import { SmartAlternativeCard } from "@/components/SmartAlternativeCard";
import { SellPurificationModal } from "@/components/SellPurificationModal";
import { AlarmNotificationDrawer } from "@/components/AlarmNotificationDrawer";
import { ZakatTrackerModule } from "@/components/ZakatTrackerModule";
import { SpotlightCard } from "@/components/SpotlightCard";
import { MiniSparkline } from "@/components/MiniSparkline";
import { MizanHealthComplication } from "@/components/MizanHealthComplication";
import {
  PortfolioAllocationBar,
  AllocationBarItem,
} from "@/components/PortfolioAllocationBar";

export default function PortfolioManagementPage() {
  const [standard, setStandard] =
    useState<ScreeningStandardCode>("BIST_KATILIM_DIB");
  const [useCeilingRounding, setUseCeilingRounding] = useState<boolean>(true);
  const [isAlarmDrawerOpen, setIsAlarmDrawerOpen] = useState<boolean>(false);
  const [sellModalHolding, setSellModalHolding] = useState<any | null>(null);
  const [saleReceiptNotification, setSaleReceiptNotification] =
    useState<string | null>(null);
  const [expandedAlternativeRowId, setExpandedAlternativeRowId] =
    useState<string | null>(null);

  // Live Price Ticker Simulation (Simulates live tick updates)
  const [livePrices, setLivePrices] = useState<Record<string, string>>({
    BIMAS: "482.50",
    ASELS: "68.40",
    THYAO: "312.00",
    PGSUS: "234.50",
    TOASO: "214.00",
    FROTO: "985.00",
    TUPRS: "174.50",
    EREGL: "52.80",
    SISE: "46.20",
    ALARK: "106.40",
    BERA: "24.80",
    MAVI: "94.75",
    ALBRK: "6.42",
  });
  const [priceTickDirections, setPriceTickDirections] = useState<
    Record<string, "up" | "down" | "flat">
  >({});
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [lastTickTime, setLastTickTime] = useState<string>("Canlı");

  // Fetch live BIST prices from /api/live-market (Yahoo Finance BIST + Supabase sync)
  const tickLivePrices = async () => {
    try {
      const res = await fetch("/api/live-market", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.quotes && typeof data.quotes === "object") {
          setLivePrices((prev) => {
            const updated: Record<string, string> = { ...prev };
            const directions: Record<string, "up" | "down" | "flat"> = {};
            for (const [ticker, quoteObj] of Object.entries<any>(data.quotes)) {
              if (quoteObj?.priceTRY) {
                const oldVal = parseFloat(prev[ticker] || quoteObj.priceTRY);
                const newVal = parseFloat(quoteObj.priceTRY);
                updated[ticker] = quoteObj.priceTRY;
                directions[ticker] =
                  newVal > oldVal
                    ? "up"
                    : newVal < oldVal
                    ? "down"
                    : quoteObj.change24hNumeric > 0
                    ? "up"
                    : quoteObj.change24hNumeric < 0
                    ? "down"
                    : "flat";
              }
            }
            setPriceTickDirections(directions);
            return updated;
          });
          setLastTickTime(new Date().toLocaleTimeString("tr-TR"));
          return;
        }
      }
    } catch {
      // Fallback to local micro-tick if offline
    }
    setLastTickTime(new Date().toLocaleTimeString("tr-TR"));
  };

  useEffect(() => {
    tickLivePrices();
    if (!isLiveStreaming) return;
    const interval = setInterval(tickLivePrices, 20000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Initial investor portfolio with explicit purchase dates
  const [holdings, setHoldings] = useState<PortfolioHoldingItem[]>([
    {
      id: "h-1",
      ticker: "BIMAS",
      lots: "400",
      avgCostTRY: "420.00",
      purchaseDate: "2026-04-15",
      purificationMethod: "holding",
      zakatIntent: "LONG_TERM_DIVIDEND",
    },
    {
      id: "h-2",
      ticker: "ASELS",
      lots: "2000",
      avgCostTRY: "59.50",
      purchaseDate: "2026-06-10",
      purificationMethod: "holding",
      zakatIntent: "LONG_TERM_DIVIDEND",
    },
    {
      id: "h-3",
      ticker: "THYAO",
      lots: "500",
      avgCostTRY: "295.00",
      purchaseDate: "2026-08-01",
      purificationMethod: "holding",
      zakatIntent: "TRADING_SHORT_TERM",
    },
    {
      id: "h-4",
      ticker: "PGSUS",
      lots: "300",
      avgCostTRY: "220.00",
      purchaseDate: "2026-07-15",
      purificationMethod: "holding",
      zakatIntent: "TRADING_SHORT_TERM",
    },
  ]);

  // New Asset Form State
  const [newTicker, setNewTicker] = useState<string>("FROTO");
  const [newLots, setNewLots] = useState<string>("100");
  const [newAvgCost, setNewAvgCost] = useState<string>("985.00");
  const [newPurchaseDate, setNewPurchaseDate] = useState<string>("2026-08-15");
  const [newZakatIntent, setNewZakatIntent] =
    useState<ZakatIntentionType>("LONG_TERM_DIVIDEND");

  const handleSelectNewTicker = (ticker: string) => {
    setNewTicker(ticker);
    const live = livePrices[ticker] || getCompanySummary(ticker)?.priceTRY;
    if (live) setNewAvgCost(live);
  };

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    const lotsDec = toDecimal(newLots);
    if (lotsDec.lte(0)) return;

    const item: PortfolioHoldingItem = {
      id: `h-${Date.now()}`,
      ticker: newTicker.toUpperCase(),
      lots: lotsDec.toString(),
      avgCostTRY: toDecimal(newAvgCost || "100").toFixed(2),
      purchaseDate: newPurchaseDate || "2026-08-15",
      purificationMethod: "holding",
      zakatIntent: newZakatIntent,
    };

    setHoldings((prev) => [...prev, item]);
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  // Swap non-compliant position with 100% compliant alternative
  const handleSwapHolding = (
    holdingId: string,
    targetTicker: string,
    equivalentLots: string,
    targetPriceTRY: string
  ) => {
    const old = holdings.find((h) => h.id === holdingId);
    setHoldings((prev) =>
      prev.map((h) => {
        if (h.id !== holdingId) return h;
        return {
          ...h,
          ticker: targetTicker,
          lots: equivalentLots,
          avgCostTRY: targetPriceTRY,
          purchaseDate: new Date().toISOString().split("T")[0],
        };
      })
    );
    setExpandedAlternativeRowId(null);
    if (old) {
      setSaleReceiptNotification(
        `${old.ticker} pozisyonunuz başarıyla satılarak aynı sektördeki %100 Katılım Uygun ${targetTicker} (${equivalentLots} Lot) ile ikame edildi.`
      );
      setTimeout(() => setSaleReceiptNotification(null), 7000);
    }
  };

  // Confirm Sale in Sell Modal
  const handleConfirmSaleFromModal = (
    holdingId: string,
    lotsSoldStr: string,
    netHalalProceedsTRY: string,
    purificationFeeTRY: string
  ) => {
    const holding = holdings.find((h) => h.id === holdingId);
    if (!holding) return;

    const soldLots = parseInt(lotsSoldStr);
    const existingLots = parseInt(holding.lots);

    if (soldLots >= existingLots) {
      setHoldings((prev) => prev.filter((h) => h.id !== holdingId));
    } else {
      setHoldings((prev) =>
        prev.map((h) =>
          h.id === holdingId ? { ...h, lots: String(existingLots - soldLots) } : h
        )
      );
    }

    setSaleReceiptNotification(
      `${holding.ticker} hissesinden ${soldLots} lot satışı gerçekleşti. Net Helal Hasılat: ${formatTRY(
        netHalalProceedsTRY,
        2
      )} • Ayrılan Arındırma Ücreti: ${formatTRY(purificationFeeTRY, 2)}`
    );
    setTimeout(() => setSaleReceiptNotification(null), 8000);
    setSellModalHolding(null);
  };

  // Comprehensive Zero-Float Calculations
  const portfolioAnalysis = useMemo(() => {
    let totalMarketValue = new Decimal(0);
    let totalCostBasis = new Decimal(0);
    let compliantMarketValue = new Decimal(0);
    let totalExitPurificationPayable = new Decimal(0);
    let totalZakatPayable = new Decimal(0);

    const breachedAlerts: ComplianceAlertItem[] = [];
    const atRiskAlerts: KatilimRiskAssessment[] = [];

    const rows = holdings.map((h) => {
      const summary = getCompanySummary(h.ticker) || {
        ticker: h.ticker,
        name: h.ticker,
        sector: "Diğer",
        bistStatus: "COMPLIANT",
        aaoifiStatus: "COMPLIANT",
        priceTRY: "100.00",
        change24h: "%0.00",
        debtRatioPercent: 15,
        cashRatioPercent: 10,
        impureIncomePercent: 1.5,
        purificationPerShareTRY: "0.05",
        lastScreeningDate: "2026-06-30",
        zatableNetAssetsPerShareTRY: "25.00",
      };

      const detail =
        DETAILED_COMPANIES_DATABASE[h.ticker] ||
        DETAILED_COMPANIES_DATABASE["BIMAS"];

      const livePriceStr = livePrices[h.ticker] || summary.priceTRY;
      const livePrice = toDecimal(livePriceStr);
      const lotsDec = toDecimal(h.lots);
      const avgCostDec = toDecimal(h.avgCostTRY);

      const marketValue = lotsDec.times(livePrice);
      const costValue = lotsDec.times(avgCostDec);
      const pnlTRY = marketValue.minus(costValue);
      const pnlPercent = costValue.gt(0)
        ? pnlTRY.dividedBy(costValue).times(100)
        : new Decimal(0);

      totalMarketValue = totalMarketValue.plus(marketValue);
      totalCostBasis = totalCostBasis.plus(costValue);

      const evalResult = evaluateCompanyStatusForStandard(summary, standard);
      const isCompliant = evalResult.status === "COMPLIANT";
      if (isCompliant) {
        compliantMarketValue = compliantMarketValue.plus(marketValue);
      }

      const riskAssessment = assessStockKatilimRisk(summary, standard);

      const { totalDaysHeld, daysHeldInQuarter, formattedPurchaseDate } =
        calculateDaysHeld(h.purchaseDate);

      const purif = calculateHoldingPurificationClient(
        detail.purificationMetrics.impureIncomeIsolatedQuarterTRY,
        detail.purificationMetrics.totalSharesOutstanding,
        lotsDec,
        daysHeldInQuarter,
        90,
        useCeilingRounding
      );

      totalExitPurificationPayable = totalExitPurificationPayable.plus(
        purif.totalPurificationPayable
      );

      const alternatives = getSmartAlternativesForTicker(
        summary.ticker,
        standard
      );

      if (riskAssessment.riskLevel === "BREACHED") {
        breachedAlerts.push({
          holdingId: h.id,
          ticker: h.ticker,
          companyName: summary.name,
          sector: summary.sector,
          fiscalPeriod: "2026-Q2",
          previousStatus: "COMPLIANT",
          currentStatus: "NON_COMPLIANT",
          riskLevel: "BREACHED",
          alertType: "EXITED_COMPLIANCE",
          consecutiveBreachQuarters: 1,
          maxGraceQuarters: 2,
          breachedMetrics: evalResult.breachedMetrics.length > 0 ? evalResult.breachedMetrics : [
            {
              metricName: "Faizli Borç Oranı",
              currentValuePercent: `%${summary.debtRatioPercent.toFixed(1)}`,
              thresholdPercent: standard === "BIST_KATILIM_DIB" ? "%33.0" : "%30.0",
              excessPercent: `+${(summary.debtRatioPercent - (standard === "BIST_KATILIM_DIB" ? 33 : 30)).toFixed(1)}% Aşım`,
              severity: "CRITICAL",
            },
          ],
          reasonText: `${h.ticker} hissesi son bilanço döneminde faizli borç eşiğini (%${summary.debtRatioPercent.toFixed(1)}) aşarak katılım endeksinden çıkmıştır.`,
          actionRequiredText: "Portföyden çıkarılması veya helal alternatif ile ikame edilmesi tavsiye edilir.",
          positionMarketValueTRY: marketValue.toFixed(2),
          accruedPurificationTRY: purif.totalPurificationPayable.toFixed(2),
          alternatives,
        });
      } else if (riskAssessment.riskLevel === "AT_RISK") {
        atRiskAlerts.push(riskAssessment);
      }

      const zatablePerShare =
        detail.purificationMetrics.zatableNetCurrentAssetsPerShareTRY ||
        summary.zatableNetAssetsPerShareTRY ||
        "0";
      const zakatCalc = calculateZakatForPositionClient({
        quantityLots: lotsDec,
        currentPriceTRY: livePrice,
        zatableNetAssetsPerShareTRY: zatablePerShare,
        intent: h.zakatIntent,
      });

      totalZakatPayable = totalZakatPayable.plus(zakatCalc.zakatPayableTRY);

      return {
        ...h,
        summary,
        detail,
        livePrice,
        lotsDec,
        avgCostDec,
        marketValue,
        costValue,
        pnlTRY,
        pnlPercent,
        totalDaysHeld,
        daysHeldInQuarter,
        formattedPurchaseDate,
        riskAssessment,
        purificationPerShare: purif.purificationPerShare,
        exitPurificationPayable: purif.totalPurificationPayable,
        zatablePerShare,
        zakatPayableTRY: zakatCalc.zakatPayableTRY,
        alternatives,
      };
    });

    const totalPnlTRY = totalMarketValue.minus(totalCostBasis);
    const totalPnlPercent = totalCostBasis.gt(0)
      ? totalPnlTRY.dividedBy(totalCostBasis).times(100)
      : new Decimal(0);

    const halalWeightPercent = totalMarketValue.gt(0)
      ? compliantMarketValue.dividedBy(totalMarketValue).times(100)
      : new Decimal(100);

    const totalAlertsCount = breachedAlerts.length + atRiskAlerts.length;

    let avgDebtRatioPercent = 0;
    let purificationRatioPercent = 0;

    if (totalMarketValue.gt(0)) {
      rows.forEach((r) => {
        const w = r.marketValue.dividedBy(totalMarketValue).toNumber();
        avgDebtRatioPercent += (r.summary.debtRatioPercent || 0) * w;
        purificationRatioPercent += (r.summary.impureIncomePercent || 0) * w;
      });
    }

    return {
      rows,
      breachedAlerts,
      atRiskAlerts,
      totalAlertsCount,
      totalMarketValue,
      totalCostBasis,
      totalPnlTRY,
      totalPnlPercent,
      halalWeightPercent,
      avgDebtRatioPercent,
      purificationRatioPercent,
      totalExitPurificationPayable,
      totalZakatPayable,
    };
  }, [holdings, livePrices, standard, useCeilingRounding]);

  const allocationItems: AllocationBarItem[] = useMemo(() => {
    return portfolioAnalysis.rows.map((r) => ({
      id: r.id,
      ticker: r.ticker,
      companyName: r.summary.name,
      weightPercent: portfolioAnalysis.totalMarketValue.gt(0)
        ? r.marketValue
            .dividedBy(portfolioAnalysis.totalMarketValue)
            .times(100)
            .toNumber()
        : 0,
      marketValueTRY: r.marketValue.toFixed(2),
      status: r.riskAssessment.riskLevel as "COMPLIANT" | "AT_RISK" | "BREACHED",
    }));
  }, [portfolioAnalysis]);

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-[#182542] pb-24">
      {/* Payno Sky-Mist Header */}
      <section className="payno-sky-hero pt-8 pb-10 border-b border-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] tracking-tight">
                Portföy &amp; Akıllı Cüzdan
              </h1>

              {/* Payno Live Streaming Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-[#E2EAF4] text-xs text-[#182542] shadow-2xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveStreaming ? "bg-[#0D9F6E] animate-pulse" : "bg-slate-400"
                  }`}
                />
                <span className="font-mono text-[11px] tabular-nums text-[#182542] font-bold">
                  Canlı BIST Akışı ({lastTickTime})
                </span>
                <button
                  type="button"
                  onClick={tickLivePrices}
                  className="p-0.5 hover:text-[#2E6CF6] text-[#6E81A0] transition"
                  title="Fiyatları Şimdi Yenile"
                >
                  <RefreshCw size={11} />
                </button>
              </div>
            </div>
            <p className="text-xs text-[#6E81A0] mt-1.5 font-medium">
              626 BIST hissesi için otomatik takvim günü hesabı, canlı piyasa fiyatları ve anlık satış arındırma bedeli.
            </p>
          </div>

          {/* Right Controls: Katılım Alarm Pill + Payno Segmented Control */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAlarmDrawerOpen(true)}
              className={`apple-btn-secondary relative text-xs py-2 px-3.5 ${
                portfolioAnalysis.totalAlertsCount > 0
                  ? "border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100"
                  : ""
              }`}
            >
              <BellRing
                size={14}
                className={
                  portfolioAnalysis.totalAlertsCount > 0
                    ? "text-rose-600 animate-pulse"
                    : "text-[#6E81A0]"
                }
              />
              <span className="font-bold">Katılım Alarmları</span>
              {portfolioAnalysis.totalAlertsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold font-mono">
                  {portfolioAnalysis.totalAlertsCount}
                </span>
              )}
            </button>

            <div className="apple-segmented-group">
              <button
                type="button"
                onClick={() => setStandard("BIST_KATILIM_DIB")}
                className={`apple-segmented-item ${
                  standard === "BIST_KATILIM_DIB" ? "active" : ""
                }`}
              >
                BIST Katılım (&lt;%33)
              </button>
              <button
                type="button"
                onClick={() => setStandard("AAOIFI_STD_21")}
                className={`apple-segmented-item ${
                  standard === "AAOIFI_STD_21" ? "active" : ""
                }`}
              >
                AAOIFI No.21 (&lt;%30)
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-8 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Sale / Swap Confirmation Banner */}
      {saleReceiptNotification && (
        <div className="apple-card p-4 border-emerald-500/40 bg-emerald-950/40 flex items-center justify-between text-emerald-200 text-xs font-medium shadow-emerald-glow animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{saleReceiptNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaleReceiptNotification(null)}
            className="text-xs text-emerald-400 hover:text-white font-bold ml-4"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Institutional Mizan Complication & Allocation Spectrum Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 flex">
          <MizanHealthComplication
            halalWeightPercent={portfolioAnalysis.halalWeightPercent.toNumber()}
            avgDebtRatioPercent={portfolioAnalysis.avgDebtRatioPercent}
            debtThresholdPercent={standard === "BIST_KATILIM_DIB" ? 33 : 30}
            purificationRatioPercent={portfolioAnalysis.purificationRatioPercent}
            totalMarketValueTRY={portfolioAnalysis.totalMarketValue.toFixed(2)}
            breachedCount={portfolioAnalysis.breachedAlerts.length}
            atRiskCount={portfolioAnalysis.atRiskAlerts.length}
            standardName={
              standard === "BIST_KATILIM_DIB"
                ? "BIST Katılım (TKBB/DİB)"
                : "AAOIFI Shariah No. 21"
            }
          />
        </div>

        <div className="lg:col-span-7 flex flex-col justify-between">
          <SpotlightCard className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Activity size={15} className="text-emerald-600" />
                    <span>Portföy Varlık Spektrumu &amp; Risk Matrisi</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hisselerin piyasa değeri ağırlıkları ve anlık katılım uygunluk sınıflandırması.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {allocationItems.length} Pozisyon
                </span>
              </div>

              <div className="py-5">
                <PortfolioAllocationBar
                  items={allocationItems}
                  totalMarketValueTRY={portfolioAnalysis.totalMarketValue.toFixed(2)}
                />
              </div>
            </div>

            {/* Quick Metrics Strip inside the Card */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] uppercase font-semibold text-slate-400 block tracking-wider">
                  Ort. Borç Oranı
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
                  %{portfolioAnalysis.avgDebtRatioPercent.toFixed(1)}{" "}
                  <span className="text-[10px] text-slate-500 font-normal">
                    / %{standard === "BIST_KATILIM_DIB" ? "33" : "30"}
                  </span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] uppercase font-semibold text-slate-400 block tracking-wider">
                  Arındırma Kesintisi
                </span>
                <span className="text-sm font-bold font-mono text-amber-700 mt-0.5 block tabular-nums">
                  %{portfolioAnalysis.purificationRatioPercent.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] uppercase font-semibold text-slate-400 block tracking-wider">
                  Zekata Tabi Pay
                </span>
                <span className="text-sm font-bold font-mono text-emerald-700 mt-0.5 block tabular-nums">
                  {formatTRY(portfolioAnalysis.totalZakatPayable, 0)}
                </span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* 4 Core Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Live Market Value */}
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
              PORTFÖY CANLI DEĞERİ
            </span>
            <span className="text-[10px] font-mono font-medium text-slate-500">
              Maliyet: {formatTRY(portfolioAnalysis.totalCostBasis, 0)}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
            {formatTRY(portfolioAnalysis.totalMarketValue, 2)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-mono font-semibold tabular-nums ${
                portfolioAnalysis.totalPnlTRY.gte(0)
                  ? "text-emerald-700"
                  : "text-rose-700"
              }`}
            >
              {portfolioAnalysis.totalPnlTRY.gte(0) ? "+" : ""}
              {formatTRY(portfolioAnalysis.totalPnlTRY, 2)} (
              {portfolioAnalysis.totalPnlTRY.gte(0) ? "+" : ""}
              {portfolioAnalysis.totalPnlPercent.toFixed(2)}%)
            </span>
          </div>
        </SpotlightCard>

        {/* Card 2: Halal Weight & Compliance Status */}
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
              KATILIM UYGUNLUK AĞIRLIĞI
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                portfolioAnalysis.breachedAlerts.length === 0
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-rose-500"
              }`}
            />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
            %{portfolioAnalysis.halalWeightPercent.toFixed(1)}{" "}
            <span className="text-xs font-semibold text-emerald-700">Helal</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            {portfolioAnalysis.breachedAlerts.length > 0 ? (
              <span className="badge-apple-rose">
                {portfolioAnalysis.breachedAlerts.length} Kapsam Dışı Hisse
              </span>
            ) : (
              <span className="badge-apple-emerald">
                Tamamı Katılıma Uygun
              </span>
            )}
            {portfolioAnalysis.atRiskAlerts.length > 0 && (
              <span className="badge-apple-amber">
                {portfolioAnalysis.atRiskAlerts.length} Riskli Eşik
              </span>
            )}
          </div>
        </SpotlightCard>

        {/* Card 3: Exit Purification Obligation */}
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest block">
              SATIŞ ANI ARINDIRMA
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              ROUND_CEIL
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-700 tracking-tight font-mono tabular-nums">
            {formatTRY(portfolioAnalysis.totalExitPurificationPayable, 2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-normal">
            Bugün satılırsa infak edilecek net şüpheli kazanç
          </p>
        </SpotlightCard>

        {/* Card 4: Zakat Obligation */}
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest block">
              HİSSE ZEKATI (%2,5)
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Yıllık
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 tracking-tight font-mono tabular-nums">
            {formatTRY(portfolioAnalysis.totalZakatPayable, 2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-normal">
            Al-Sat &amp; Temettü niyetine göre zekata tabi varlık
          </p>
        </SpotlightCard>
      </div>

      {/* Main Portfolio Holdings Table */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Briefcase size={16} className="text-emerald-700" />
              <span>Portföy Varlıkları ve Canlı Değerleme</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alış tarihi ile otomatik gün hesabı, canlı BIST fiyatları ve satış anında arındırma bedeli.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px]">Şer&apos;i Yuvarlama:</span>
            <button
              type="button"
              onClick={() => setUseCeilingRounding(!useCeilingRounding)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                useCeilingRounding
                  ? "bg-slate-100 text-slate-900 border-slate-300"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
            >
              {useCeilingRounding ? "Tavan (ROUND_CEIL)" : "Standart"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                <th className="py-3.5 px-5">Hisse &amp; Sektör</th>
                <th className="py-3.5 px-4">Katılım &amp; Risk Durumu</th>
                <th className="py-3.5 px-4">Alış Tarihi (Süre)</th>
                <th className="py-3.5 px-4">Lot Adedi</th>
                <th className="py-3.5 px-4">Canlı Fiyat &amp; Trend</th>
                <th className="py-3.5 px-4">Piyasa Değeri &amp; K/Z</th>
                <th className="py-3.5 px-4 text-amber-700 font-bold">Satış Arındırma Bedeli</th>
                <th className="py-3.5 px-5 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {portfolioAnalysis.rows.map((row) => {
                const tick = priceTickDirections[row.ticker];
                const isBreached = row.riskAssessment.riskLevel === "BREACHED";
                const isAtRisk = row.riskAssessment.riskLevel === "AT_RISK";
                const isExpanded = expandedAlternativeRowId === row.id;

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`transition-colors duration-150 ${
                        isBreached
                          ? "bg-rose-50/60 hover:bg-rose-50"
                          : isAtRisk
                          ? "bg-amber-50/50 hover:bg-amber-50"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Ticker & Sector */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <Link
                            href={`/companies/${row.ticker}`}
                            className="font-bold text-sm text-slate-900 hover:text-emerald-700 font-mono transition flex items-center gap-1"
                          >
                            <span>{row.ticker}</span>
                            <ArrowUpRight size={12} className="text-slate-400" />
                          </Link>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {row.summary.sector}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 truncate max-w-[150px] block mt-0.5">
                          {row.summary.name}
                        </span>
                      </td>

                      {/* Katılım Risk Status Pill */}
                      <td className="py-3.5 px-4">
                        {isBreached ? (
                          <span className="badge-apple-rose">
                            <AlertOctagon size={11} />
                            <span>Katılımdan Çıktı</span>
                          </span>
                        ) : isAtRisk ? (
                          <span className="badge-apple-amber">
                            <AlertTriangle size={11} />
                            <span>Riskli Eşik (%{row.riskAssessment.debtMarginPercent.toFixed(1)} Marj)</span>
                          </span>
                        ) : (
                          <span className="badge-apple-emerald">
                            <CheckCircle2 size={11} />
                            <span>%100 Katılım Uygun</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1 font-mono tabular-nums">
                          Borç: %{row.summary.debtRatioPercent.toFixed(1)} &bull; Gelir: %{row.summary.impureIncomePercent.toFixed(2)}
                        </span>
                      </td>

                      {/* Purchase Date & Auto-Computed Days */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 font-mono tabular-nums">
                          {row.formattedPurchaseDate}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-mono mt-0.5 tabular-nums font-medium">
                          {row.totalDaysHeld} Gün ({row.daysHeldInQuarter}/90 Pro-Rata)
                        </div>
                      </td>

                      {/* Lots */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        {row.lots} Lot
                      </td>

                      {/* Live Price with subtle tick animation & MiniSparkline */}
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        <div className="flex items-center gap-3">
                          <div>
                            <div
                              className={`font-bold transition-all duration-300 ${
                                tick === "up"
                                  ? "text-emerald-700 animate-tick-up"
                                  : tick === "down"
                                  ? "text-rose-700 animate-tick-down"
                                  : "text-slate-900"
                              }`}
                            >
                              {formatTRY(row.livePrice, 2)}
                            </div>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              Maliyet: {row.avgCostTRY} ₺
                            </span>
                          </div>
                          <MiniSparkline
                            ticker={row.ticker}
                            trend={
                              tick === "down"
                                ? "down"
                                : row.pnlTRY.gte(0)
                                ? "up"
                                : "down"
                            }
                            width={54}
                            height={22}
                          />
                        </div>
                      </td>

                      {/* Market Value & Real-time PnL */}
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        <div className="font-bold text-slate-900">
                          {formatTRY(row.marketValue, 2)}
                        </div>
                        <div
                          className={`text-[10px] font-semibold ${
                            row.pnlTRY.gte(0) ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {row.pnlTRY.gte(0) ? "+" : ""}
                          {formatTRY(row.pnlTRY, 2)} ({row.pnlTRY.gte(0) ? "+" : ""}
                          {row.pnlPercent.toFixed(1)}%)
                        </div>
                      </td>

                      {/* Sell Purification Fee Due */}
                      <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-amber-700 text-sm">
                        {formatTRY(row.exitPurificationPayable, 2)}
                        <span className="text-[9px] text-slate-400 block font-normal">
                          {formatTRY(row.purificationPerShare, 4)}/pay
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sell / Exit Simulator Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setSellModalHolding({
                                id: row.id,
                                ticker: row.ticker,
                                companyName: row.summary.name,
                                lots: row.lots,
                                avgCostTRY: row.avgCostTRY,
                                purchaseDate: row.purchaseDate,
                                currentPriceTRY: row.livePrice.toFixed(2),
                                impureIncomeQuarterTRY:
                                  row.detail.purificationMetrics.impureIncomeIsolatedQuarterTRY,
                                totalSharesOutstanding:
                                  row.detail.purificationMetrics.totalSharesOutstanding,
                              })
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition active:scale-[0.98]"
                            title="Pozisyonu Sat veya Arındırma Ücretini Hesapla"
                          >
                            Sat / Arındır
                          </button>

                          {/* Smart Alternative Expand Button if not safe */}
                          {(isBreached || isAtRisk) && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAlternativeRowId(
                                  isExpanded ? null : row.id
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition active:scale-[0.98]"
                            >
                              Yerine Hisse?
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveHolding(row.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Pozisyonu Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline SmartAlternativeCard expansion when clicked */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={8} className="p-4 border-l-4 border-emerald-500">
                          <SmartAlternativeCard
                            sourceTicker={row.ticker}
                            sourceCompanyName={row.summary.name}
                            sourceSector={row.summary.sector}
                            sourceDebtRatioPercent={row.summary.debtRatioPercent}
                            sourceMarketValueTRY={row.marketValue.toFixed(2)}
                            alternatives={row.alternatives}
                            compact
                            onSwapPosition={(targetTicker, eqLots, targetPrice) =>
                              handleSwapHolding(
                                row.id,
                                targetTicker,
                                eqLots,
                                targetPrice
                              )
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Asset Form */}
        <div className="p-5 bg-slate-50/80 border-t border-slate-200">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
            <Plus size={13} className="text-emerald-700" />
            <span>Portföye Yeni Hisse Ekle (Alış Tarihi ile Otomatik Gün Hesabı)</span>
          </h3>

          <form
            onSubmit={handleAddHolding}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
          >
            <div className="lg:col-span-2">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1">
                Hisse Senedi
              </label>
              <select
                value={newTicker}
                onChange={(e) => handleSelectNewTicker(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 transition"
              >
                {SAMPLE_COMPANIES_SUMMARY.map((c) => (
                  <option key={c.ticker} value={c.ticker}>
                    {c.ticker} — {c.name} ({c.bistStatus === "COMPLIANT" ? "UYGUN" : "KAPSAM DIŞI"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1">
                Lot Adedi
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={newLots}
                onChange={(e) => setNewLots(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-500 transition tabular-nums"
                placeholder="Örn: 250"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1">
                Alış Maliyeti (₺)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newAvgCost}
                onChange={(e) => setNewAvgCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-500 transition tabular-nums"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1">
                Alış Tarihi
              </label>
              <input
                type="date"
                value={newPurchaseDate}
                onChange={(e) => setNewPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-500 transition tabular-nums"
              />
            </div>

            <div>
              <button
                type="submit"
                className="apple-btn-primary w-full text-xs py-2"
              >
                Varlığı Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Zakat Tracker Module */}
      <ZakatTrackerModule
        positions={portfolioAnalysis.rows.map((r) => ({
          id: r.id,
          ticker: r.ticker,
          companyName: r.summary.name,
          sector: r.summary.sector,
          lots: r.lots,
          currentPriceTRY: r.livePrice.toFixed(2),
          zatableNetAssetsPerShareTRY: r.zatablePerShare,
          zakatIntent: r.zakatIntent,
        }))}
        onChangePositionIntent={(id, intent) =>
          setHoldings((prev) =>
            prev.map((h) => (h.id === id ? { ...h, zakatIntent: intent } : h))
          )
        }
        onApplyBulkIntent={(intent) =>
          setHoldings((prev) =>
            prev.map((h) => ({ ...h, zakatIntent: intent }))
          )
        }
      />

      {/* Non-Intrusive Alarm Slide-Over Drawer */}
      <AlarmNotificationDrawer
        isOpen={isAlarmDrawerOpen}
        onClose={() => setIsAlarmDrawerOpen(false)}
        breachedAlerts={portfolioAnalysis.breachedAlerts}
        atRiskAlerts={portfolioAnalysis.atRiskAlerts}
      />

      {/* Sell & Exit Purification Modal */}
      <SellPurificationModal
        isOpen={sellModalHolding !== null}
        onClose={() => setSellModalHolding(null)}
        holding={sellModalHolding}
        onConfirmSale={handleConfirmSaleFromModal}
      />
      </div>
    </div>
  );
}
