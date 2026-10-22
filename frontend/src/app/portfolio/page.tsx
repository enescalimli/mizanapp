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
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Copy,
  RotateCw,
  Snowflake,
  CreditCard,
  Sliders,
  DollarSign,
  PieChart,
} from "lucide-react";
import {
  PortfolioHoldingItem,
  ScreeningStandardCode,
  ZakatIntentionType,
} from "@/types/katilim";
import {
  SAMPLE_COMPANIES_SUMMARY,
  DETAILED_COMPANIES_DATABASE,
  getCompanySummary,
} from "@/lib/data/sampleCompanies";
import { BIST_COMPREHENSIVE_UNIVERSE } from "@/lib/data/bistUniverse";
import { PaynoShell } from "@/components/PaynoShell";
import {
  Decimal,
  formatTRY,
  calculateDaysHeld,
  calculateHoldingPurificationClient,
  calculateZakatForPositionClient,
} from "@/lib/decimal/decimal";

export default function PortfolioManagementPage() {
  const [useCeilingRounding, setUseCeilingRounding] = useState<boolean>(true);

  // Card Controls iOS switches (From Frame 06)
  const [onlinePayments, setOnlinePayments] = useState<boolean>(true);
  const [contactless, setContactless] = useState<boolean>(true);
  const [atmWithdrawals, setAtmWithdrawals] = useState<boolean>(true);
  const [useAbroad, setUseAbroad] = useState<boolean>(false);
  const [isCardFrozen, setIsCardFrozen] = useState<boolean>(false);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);

  // Monthly spending limit slider (From Frame 06)
  const [spendingLimit, setSpendingLimit] = useState<number>(5500);
  const [spendingUsed, setSpendingUsed] = useState<number>(1400);

  // Canlı Fiyatlar
  const [livePrices, setLivePrices] = useState<Record<string, string>>({
    BIMAS: "482.50",
    ASELS: "68.40",
    THYAO: "312.00",
    PGSUS: "234.50",
    FROTO: "985.00",
    TUPRS: "174.50",
    EREGL: "52.80",
    TABGD: "164.00",
  });
  const [lastTickTime, setLastTickTime] = useState<string>("Canlı");

  const tickLivePrices = async () => {
    try {
      const res = await fetch("/api/live-market", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.quotes && typeof data.quotes === "object") {
          setLivePrices((prev) => {
            const updated: Record<string, string> = { ...prev };
            for (const [ticker, quoteObj] of Object.entries<any>(data.quotes)) {
              if (quoteObj?.priceTRY) {
                updated[ticker] = quoteObj.priceTRY;
              }
            }
            return updated;
          });
          setLastTickTime(new Date().toLocaleTimeString("tr-TR"));
        }
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    tickLivePrices();
    const interval = setInterval(tickLivePrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Portföy Pozisyonları
  const DEFAULT_HOLDINGS: PortfolioHoldingItem[] = [
    {
      id: "h-1",
      ticker: "BIMAS",
      lots: "300",
      avgCostTRY: "420.00",
      purchaseDate: "2024-06-15",
      purificationMethod: "holding",
      zakatIntent: "LONG_TERM_DIVIDEND",
    },
    {
      id: "h-2",
      ticker: "ASELS",
      lots: "1500",
      avgCostTRY: "58.20",
      purchaseDate: "2024-04-10",
      purificationMethod: "holding",
      zakatIntent: "LONG_TERM_DIVIDEND",
    },
    {
      id: "h-3",
      ticker: "THYAO",
      lots: "250",
      avgCostTRY: "320.00",
      purchaseDate: "2024-08-01",
      purificationMethod: "holding",
      zakatIntent: "TRADING_SHORT_TERM",
    },
    {
      id: "h-4",
      ticker: "FROTO",
      lots: "80",
      avgCostTRY: "890.00",
      purchaseDate: "2024-02-20",
      purificationMethod: "holding",
      zakatIntent: "LONG_TERM_DIVIDEND",
    },
    {
      id: "h-5",
      ticker: "TUPRS",
      lots: "600",
      avgCostTRY: "155.00",
      purchaseDate: "2024-05-18",
      purificationMethod: "holding",
      zakatIntent: "LONG_TERM_DIVIDEND",
    },
  ];

  const [holdings, setHoldings] = useState<PortfolioHoldingItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mizan_katilim_holdings_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_HOLDINGS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mizan_katilim_holdings_v2", JSON.stringify(holdings));
    }
  }, [holdings]);

  // Yeni Pozisyon Ekle Form State
  const [newTicker, setNewTicker] = useState<string>("BIMAS");
  const [newLots, setNewLots] = useState<string>("100");
  const [newAvgCost, setNewAvgCost] = useState<string>("482.50");
  const [newPurchaseDate, setNewPurchaseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [newZakatIntent, setNewZakatIntent] =
    useState<ZakatIntentionType>("LONG_TERM_DIVIDEND");

  const handleSelectNewTicker = (ticker: string) => {
    setNewTicker(ticker);
    const live = livePrices[ticker];
    if (live) {
      setNewAvgCost(live);
    } else {
      const comp = getCompanySummary(ticker);
      if (comp?.priceTRY) {
        setNewAvgCost(comp.priceTRY.replace("₺", "").trim());
      }
    }
  };

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker || !newLots || !newAvgCost) return;

    const newItem: PortfolioHoldingItem = {
      id: `h-${Date.now()}`,
      ticker: newTicker,
      lots: newLots,
      avgCostTRY: newAvgCost,
      purchaseDate: newPurchaseDate,
      purificationMethod: "holding",
      zakatIntent: newZakatIntent,
    };

    setHoldings((prev) => [newItem, ...prev]);
    setNewLots("100");
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  // Portföy Analiz Motoru
  const portfolioAnalysis = useMemo(() => {
    let totalMarketValue = new Decimal(0);
    let totalCostBasis = new Decimal(0);
    let compliantMarketValue = new Decimal(0);
    let totalExitPurificationPayable = new Decimal(0);
    let totalZakatPayable = new Decimal(0);

    const rows = holdings.map((item) => {
      const lotsDec = new Decimal(item.lots || 0);
      const costDec = new Decimal(item.avgCostTRY || 0);
      const curPriceDec = new Decimal(livePrices[item.ticker] || "100.00");

      const positionCost = lotsDec.times(costDec);
      const positionValue = lotsDec.times(curPriceDec);
      const positionPnl = positionValue.minus(positionCost);
      const positionPnlPercent = positionCost.gt(0)
        ? positionPnl.dividedBy(positionCost).times(100)
        : new Decimal(0);

      totalMarketValue = totalMarketValue.plus(positionValue);
      totalCostBasis = totalCostBasis.plus(positionCost);

      const { totalDaysHeld, daysHeldInQuarter } = calculateDaysHeld(item.purchaseDate);
      const detail = DETAILED_COMPANIES_DATABASE[item.ticker];
      const compSummary = getCompanySummary(item.ticker);

      // Fıkhi arındırma
      const impureIncome = detail?.purificationMetrics?.impureIncomeIsolatedQuarterTRY || "500000";
      const totalShares = detail?.purificationMetrics?.totalSharesOutstanding || "100000000";

      const purCalc = calculateHoldingPurificationClient(
        impureIncome,
        totalShares,
        lotsDec,
        daysHeldInQuarter,
        90,
        useCeilingRounding
      );

      // Zekât
      const zatableNetAssets =
        detail?.purificationMetrics?.zatableNetCurrentAssetsPerShareTRY ||
        compSummary?.zatableNetAssetsPerShareTRY ||
        "0";

      const zakCalc = calculateZakatForPositionClient({
        quantityLots: lotsDec,
        currentPriceTRY: curPriceDec,
        zatableNetAssetsPerShareTRY: zatableNetAssets,
        intent: item.zakatIntent,
      });

      totalExitPurificationPayable = totalExitPurificationPayable.plus(
        purCalc.totalPurificationPayable
      );
      totalZakatPayable = totalZakatPayable.plus(zakCalc.zakatPayableTRY);

      const isCompliant = compSummary?.bistStatus === "COMPLIANT";

      if (isCompliant) {
        compliantMarketValue = compliantMarketValue.plus(positionValue);
      }

      return {
        ...item,
        companyName: compSummary?.name || item.ticker,
        sector: compSummary?.sector || "BIST",
        isCompliant,
        curPriceTRY: curPriceDec,
        positionCostTRY: positionCost,
        positionValueTRY: positionValue,
        positionPnlTRY: positionPnl,
        positionPnlPercent,
        daysHeld: totalDaysHeld,
        purificationResult: purCalc,
        zakatResult: zakCalc,
      };
    });

    const totalPnlTRY = totalMarketValue.minus(totalCostBasis);
    const totalPnlPercent = totalCostBasis.gt(0)
      ? totalPnlTRY.dividedBy(totalCostBasis).times(100)
      : new Decimal(0);

    const halalWeightPercent = totalMarketValue.gt(0)
      ? compliantMarketValue.dividedBy(totalMarketValue).times(100)
      : new Decimal(100);

    return {
      rows,
      totalMarketValue,
      totalCostBasis,
      totalPnlTRY,
      totalPnlPercent,
      halalWeightPercent,
      totalExitPurificationPayable,
      totalZakatPayable,
    };
  }, [holdings, livePrices, useCeilingRounding]);

  // Savings & Goals List (From Frame 04)
  const savingsGoals = [
    { title: "Helal Portföy Hedefi", target: 1000000, current: 740000, percent: 74, color: "text-[#FF5B26]" },
    { title: "Arındırma Havuzu", target: 2500, current: 1200, percent: 48, color: "text-[#2563EB]" },
    { title: "Yıllık Hisse Zekâtı", target: 40000, current: 34000, percent: 85, color: "text-[#059669]" },
    { title: "Sukuk & Katılım Fonu", target: 165000, current: 132000, percent: 80, color: "text-[#7C3AED]" },
  ];

  return (
    <PaynoShell badge="portföy">
      <div className="space-y-6">
        
        {/* ================================================================= */}
        {/* HEADER (Replicating Frame 06: Manage Header)                      */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14151A]">
              Manage &amp; Portföy
            </h1>
            <p className="text-xs sm:text-sm text-[#8C93A3]">
              Freeze cards, fine-tune limits and decide which wallets stay switched on.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={tickLivePrices}
              className="w-8 h-8 rounded-full bg-white border border-slate-200/60 shadow-xs text-[#8C93A3] hover:text-[#14151A] flex items-center justify-center transition"
              title="Canlı Fiyatları Yenile"
            >
              <RefreshCw size={14} />
            </button>

            <a
              href="#yeni-pozisyon"
              className="rounded-full bg-[#15161A] hover:bg-[#2A2B33] text-white px-5 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus size={14} />
              <span>+ New card / Pozisyon</span>
            </a>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ROW 1: 2 COLUMNS (Exact match to Frame 06: Your Cards & Controls) */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* =============================================================== */}
          {/* LEFT: YOUR CARDS CARD (lg:col-span-6)                            */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5">
            
            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#14151A]">
                Your cards
              </span>
              <span className="text-xs font-semibold text-[#8C93A3]">
                2 cards
              </span>
            </div>

            {/* Simulated Physical / Virtual Card Mockup (From Frame 06) */}
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="relative w-full aspect-[1.65/1] rounded-2xl bg-[#17171C] text-white p-5 sm:p-6 flex flex-col justify-between shadow-xl cursor-pointer select-none transition-transform duration-300 hover:scale-[1.01]"
            >
              {/* Card Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white/70" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-semibold backdrop-blur-xs">
                    {isCardFrozen ? "Frozen" : "Active"}
                  </span>
                </div>

                {/* Mastercard / TROY circles */}
                <div className="flex items-center -space-x-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500/90" />
                  <span className="w-6 h-6 rounded-full bg-amber-400/90" />
                </div>
              </div>

              {/* Card Middle: Chip & Contactless */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-6 rounded-md bg-amber-200/40 border border-amber-300/60 flex items-center justify-center">
                  <div className="w-5 h-3 border border-amber-300/40 rounded-xs" />
                </div>
              </div>

              {/* Card Bottom Row: Number + Exp + CVV */}
              <div>
                <div className="text-base sm:text-lg font-mono font-bold tracking-widest text-white/90">
                  {showCardNumber ? "5401 2345 6782 9104" : "•••• •••• •••• 6782"}
                </div>

                <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-white/70">
                  <div>
                    <span className="text-[9px] block text-white/40 uppercase">Card Holder</span>
                    <span className="font-semibold text-white/90">MIZAN KATILIM</span>
                  </div>
                  <div>
                    <span className="text-[9px] block text-white/40 uppercase">EXP</span>
                    <span className="font-semibold text-white/90">09/29</span>
                  </div>
                  <div>
                    <span className="text-[9px] block text-white/40 uppercase">CVV</span>
                    <span className="font-semibold text-white/90">{showCardNumber ? "611" : "•••"}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-[#8C93A3]">
              Tap the card to flip it
            </p>

            {/* Card Switcher Pills (From Frame 06) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-[#15161A] text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5B26]" />
                <span>•• 6782</span>
              </button>

              <button
                type="button"
                className="px-3 py-1 rounded-full bg-[#F4F5F7] text-[#14151A] hover:bg-[#E9EBEF] text-xs font-mono font-semibold flex items-center gap-1.5 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>•• 4356</span>
              </button>

              <button
                type="button"
                className="w-7 h-7 rounded-full border border-dashed border-slate-300 hover:border-slate-500 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-semibold transition"
              >
                +
              </button>
            </div>

            {/* 4 Card Action Pill Buttons (From Frame 06) */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {/* 1. Freeze */}
              <button
                type="button"
                onClick={() => setIsCardFrozen(!isCardFrozen)}
                className={`py-2 px-1 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                  isCardFrozen
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-[#F8F9FA] hover:bg-slate-100 border-slate-100 text-[#14151A]"
                }`}
              >
                <Snowflake size={14} className={isCardFrozen ? "text-blue-600" : "text-[#8C93A3]"} />
                <span className="text-[10px] font-semibold">{isCardFrozen ? "Unfreeze" : "Freeze"}</span>
              </button>

              {/* 2. Show number */}
              <button
                type="button"
                onClick={() => setShowCardNumber(!showCardNumber)}
                className="py-2 px-1 rounded-2xl bg-[#F8F9FA] hover:bg-slate-100 border border-slate-100 text-[#14151A] text-center transition flex flex-col items-center gap-1"
              >
                {showCardNumber ? <EyeOff size={14} className="text-[#8C93A3]" /> : <Eye size={14} className="text-[#8C93A3]" />}
                <span className="text-[10px] font-semibold">{showCardNumber ? "Hide" : "Show number"}</span>
              </button>

              {/* 3. Copy number */}
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText("5401234567829104")}
                className="py-2 px-1 rounded-2xl bg-[#F8F9FA] hover:bg-slate-100 border border-slate-100 text-[#14151A] text-center transition flex flex-col items-center gap-1"
              >
                <Copy size={14} className="text-[#8C93A3]" />
                <span className="text-[10px] font-semibold">Copy number</span>
              </button>

              {/* 4. Flip card */}
              <button
                type="button"
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="py-2 px-1 rounded-2xl bg-[#F8F9FA] hover:bg-slate-100 border border-slate-100 text-[#14151A] text-center transition flex flex-col items-center gap-1"
              >
                <RotateCw size={14} className="text-[#8C93A3]" />
                <span className="text-[10px] font-semibold">Flip card</span>
              </button>
            </div>

          </div>

          {/* =============================================================== */}
          {/* RIGHT: CARD CONTROLS & SPENDING LIMIT (lg:col-span-6)            */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5">
            
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#14151A]">
                  Card controls
                </h3>
                <p className="text-[11px] text-[#8C93A3]">
                  Fine-tune security and fıkhi screening rules
                </p>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-[#EBF9F1] text-[#10B981] text-[10px] font-semibold">
                Active
              </span>
            </div>

            {/* 4 iOS-style Toggle Switches (From Frame 06) */}
            <div className="space-y-3.5 divide-y divide-slate-100">
              
              {/* Toggle 1: Online payments */}
              <div className="pt-3.5 first:pt-0 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14151A] block">Online payments</span>
                  <span className="text-[10px] text-[#8C93A3]">Shops, subscriptions and in-app purchases</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOnlinePayments(!onlinePayments)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                    onlinePayments ? "bg-[#FF5B26] justify-end" : "bg-slate-200 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Toggle 2: Contactless */}
              <div className="pt-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14151A] block">Contactless</span>
                  <span className="text-[10px] text-[#8C93A3]">Tap to pay up to $250 per payment</span>
                </div>
                <button
                  type="button"
                  onClick={() => setContactless(!contactless)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                    contactless ? "bg-[#FF5B26] justify-end" : "bg-slate-200 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Toggle 3: ATM withdrawals */}
              <div className="pt-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14151A] block">ATM withdrawals</span>
                  <span className="text-[10px] text-[#8C93A3]">Up to $1,000 per day</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAtmWithdrawals(!atmWithdrawals)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                    atmWithdrawals ? "bg-[#FF5B26] justify-end" : "bg-slate-200 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Toggle 4: Use abroad */}
              <div className="pt-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14151A] block">Use abroad</span>
                  <span className="text-[10px] text-[#8C93A3]">Payments outside Turkey</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseAbroad(!useAbroad)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                    useAbroad ? "bg-[#FF5B26] justify-end" : "bg-slate-200 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

            </div>

            {/* Monthly spending limit slider (From Frame 06) */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8C93A3]">Monthly spending limit</span>
                <span className="text-lg font-black text-[#14151A] font-mono">
                  ${spendingLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <input
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#FF5B26]"
              />

              {/* Progress track */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#FF5B26] font-semibold">
                    ${spendingUsed.toLocaleString("en-US", { minimumFractionDigits: 2 })} used
                  </span>
                  <span className="text-[#8C93A3]">
                    {Math.round((spendingUsed / spendingLimit) * 100)}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF5B26] to-amber-500"
                    style={{ width: `${Math.min(100, (spendingUsed / spendingLimit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ================================================================= */}
        {/* ROW 2: SAVINGS & GOALS (From Frame 04)                            */}
        {/* ================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#14151A]">
                Savings &amp; Goals
              </h2>
              <p className="text-xs text-[#8C93A3]">
                Portföy hedefleri, arındırma havuzu ve zekât fonu ilerleme durumu
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {savingsGoals.map((goal, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[24px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div>
                  <span className="text-xs font-bold text-[#14151A] block">
                    {goal.title}
                  </span>
                  <span className="text-[11px] font-mono text-[#8C93A3]">
                    ₺{goal.current.toLocaleString("tr-TR")} / ₺{goal.target.toLocaleString("tr-TR")}
                  </span>
                </div>

                {/* Circular Progress Ring Mockup */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-20 h-20 rounded-full border-4 border-slate-100 flex items-center justify-center">
                    <span className="text-base font-extrabold font-mono text-[#14151A]">
                      {goal.percent}%
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2 rounded-full bg-[#F4F5F7] hover:bg-[#EAECEF] text-[#14151A] text-xs font-semibold transition"
                >
                  + Add money
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================= */}
        {/* ROW 3: YENİ POZİSYON EKLEME VE MEVCUT POZİSYONLAR TABLOSU        */}
        {/* ================================================================= */}
        <div id="yeni-pozisyon" className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#14151A]">
                Portföye Yeni Hisse Ekle
              </h3>
              <p className="text-[11px] text-[#8C93A3]">
                626 BIST hissesi arasından dilediğinizi portföyünüze ekleyin
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAddHolding}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
          >
            <div>
              <label className="text-[11px] font-semibold text-[#8C93A3] block mb-1">
                Hisse Kodu
              </label>
              <select
                value={newTicker}
                onChange={(e) => handleSelectNewTicker(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-slate-200 text-xs font-semibold text-[#14151A] outline-none"
              >
                {(BIST_COMPREHENSIVE_UNIVERSE.length > 0 ? BIST_COMPREHENSIVE_UNIVERSE : SAMPLE_COMPANIES_SUMMARY).map((c) => (
                  <option key={c.ticker} value={c.ticker}>
                    {c.ticker} — {c.name.slice(0, 24)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8C93A3] block mb-1">
                Lot Adedi
              </label>
              <input
                type="number"
                min="1"
                value={newLots}
                onChange={(e) => setNewLots(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-slate-200 text-xs font-mono font-semibold text-[#14151A] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8C93A3] block mb-1">
                Ort. Maliyet (₺)
              </label>
              <input
                type="number"
                step="0.01"
                value={newAvgCost}
                onChange={(e) => setNewAvgCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-slate-200 text-xs font-mono font-semibold text-[#14151A] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8C93A3] block mb-1">
                Alış Tarihi
              </label>
              <input
                type="date"
                value={newPurchaseDate}
                onChange={(e) => setNewPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-slate-200 text-xs font-mono font-semibold text-[#14151A] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8C93A3] block mb-1">
                Zekât Niyeti
              </label>
              <select
                value={newZakatIntent}
                onChange={(e) => setNewZakatIntent(e.target.value as ZakatIntentionType)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-slate-200 text-xs font-semibold text-[#14151A] outline-none"
              >
                <option value="LONG_TERM_DIVIDEND">Uzun Vade (Temettü)</option>
                <option value="TRADING_SHORT_TERM">Kısa Vade (Al-Sat)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#15161A] hover:bg-[#2A2B33] text-white text-xs font-semibold shadow-xs transition"
              >
                + Portföye Ekle
              </button>
            </div>
          </form>
        </div>

        {/* ================================================================= */}
        {/* ROW 4: AKTİF PORTFÖY VARLIKLARI TABLOSU                           */}
        {/* ================================================================= */}
        <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#14151A]">
              Portföy Pozisyonları ({holdings.length} Hisse)
            </h3>
            <span className="text-xs font-mono font-semibold text-[#10B981]">
              Toplam Değer: {formatTRY(portfolioAnalysis.totalMarketValue, 2)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F8F9FA] text-[#8C93A3] font-semibold text-[11px]">
                  <th className="py-3 px-4">Hisse Senedi</th>
                  <th className="py-3 px-4 text-center">Fıkhi Durum</th>
                  <th className="py-3 px-4 text-right">Lot &amp; Maliyet</th>
                  <th className="py-3 px-4 text-right">Canlı Değer</th>
                  <th className="py-3 px-4 text-right">Kâr / Zarar</th>
                  <th className="py-3 px-4 text-right text-[#FF5B26]">Satış Arındırma</th>
                  <th className="py-3 px-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {portfolioAnalysis.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#15161A] text-white flex items-center justify-center font-bold text-xs font-mono">
                          {row.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <Link href={`/companies/${row.ticker}`} className="font-bold text-xs text-[#14151A] hover:text-[#FF5B26] block">
                            {row.ticker}
                          </Link>
                          <span className="text-[10px] text-[#8C93A3] block truncate max-w-[140px]">
                            {row.companyName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        row.isCompliant ? "bg-[#EBF9F1] text-[#10B981]" : "bg-[#FFF0F0] text-[#E03131]"
                      }`}>
                        {row.isCompliant ? "✓ Uygun" : "✕ Kapsam Dışı"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-[#14151A]">{row.lots} Lot</div>
                      <div className="text-[10px] text-[#8C93A3]">₺{row.avgCostTRY}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-[#14151A]">{formatTRY(row.positionValueTRY, 2)}</div>
                      <div className="text-[10px] text-[#8C93A3]">₺{row.curPriceTRY.toFixed(2)}</div>
                    </td>

                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      row.positionPnlTRY.gte(0) ? "text-[#10B981]" : "text-[#E03131]"
                    }`}>
                      {row.positionPnlTRY.gte(0) ? "+" : ""}{formatTRY(row.positionPnlTRY, 2)} ({row.positionPnlPercent.toFixed(1)}%)
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#FF5B26]">
                      {formatTRY(row.purificationResult.totalPurificationPayable, 2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveHolding(row.id)}
                        className="text-[#8C93A3] hover:text-[#E03131] transition p-1"
                        title="Pozisyonu Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PaynoShell>
  );
}