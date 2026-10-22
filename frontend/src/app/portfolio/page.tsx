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
  PieChart,
  Scale,
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
import { StockLogo } from "@/components/StockLogo";
import {
  Decimal,
  formatTRY,
  calculateDaysHeld,
  calculateHoldingPurificationClient,
  calculateZakatForPositionClient,
} from "@/lib/decimal/decimal";

export default function PortfolioManagementPage() {
  const [useCeilingRounding, setUseCeilingRounding] = useState<boolean>(true);

  // Fıkhi Kontrol Anahtarları (iOS tarzı pürüzsüz anahtarlar)
  const [autoPurification, setAutoPurification] = useState<boolean>(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState<boolean>(true);
  const [annualZakat, setAnnualZakat] = useState<boolean>(true);
  const [foreignFilter, setForeignFilter] = useState<boolean>(false);
  const [isCardFrozen, setIsCardFrozen] = useState<boolean>(false);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);

  // Aylık Arındırma & Risk Limiti
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

  // Hedefler ve Birikim Listesi (Türkçe)
  const savingsGoals = [
    { title: "Helal Hisse Hedefi", target: 1000000, current: 740000, percent: 74, color: "text-[#182542] dark:text-blue-400" },
    { title: "Arındırma Havuzu", target: 2500, current: 1200, percent: 48, color: "text-[#0D8B52]" },
    { title: "Yıllık Hisse Zekâtı", target: 40000, current: 34000, percent: 85, color: "text-amber-500" },
    { title: "Sukuk & Katılım Fonu", target: 165000, current: 132000, percent: 80, color: "text-[#273869] dark:text-indigo-400" },
  ];

  return (
    <PaynoShell badge="portföy">
      <div className="space-y-5 sm:space-y-6">
        
        {/* ================================================================= */}
        {/* BAŞLIK VE KONTROLLER                                              */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#182542] dark:text-white">
              Katılım Portföyüm &amp; Varlık Yönetimi
            </h1>
            <p className="text-xs sm:text-sm text-[#6E81A0] dark:text-[#94A3B8]">
              Fıkhi arındırma limitlerini yönetin, canlı BIST portföy getirinizi ve zekâtınızı takip edin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={tickLivePrices}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#161F32] border border-slate-200/60 dark:border-white/10 shadow-xs text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white flex items-center justify-center transition"
              title="Canlı Fiyatları Yenile"
            >
              <RefreshCw size={14} />
            </button>

            <a
              href="#yeni-pozisyon"
              className="rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white px-5 py-2 text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus size={14} />
              <span>+ Yeni Hisse Ekle</span>
            </a>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 1. SATIR: KATILIM KARTI & FIKHİ KONTROLLER                         */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* =============================================================== */}
          {/* SOL: KATILIM KARTI MOCKUP'I (lg:col-span-6)                      */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 bg-white dark:bg-[#161F32] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 sm:space-y-5 transition-colors">
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#182542] dark:text-white">
                Katılım Cüzdan Kartım
              </span>
              <span className="text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8]">
                2 Cüzdan
              </span>
            </div>

            {/* Fiziksel / Sanal Kart Mockup'ı (Lacivert / Gece Mavisi) */}
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="relative w-full aspect-[1.65/1] rounded-2xl bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#020617] text-white p-5 sm:p-6 flex flex-col justify-between shadow-xl cursor-pointer select-none transition-transform duration-300 hover:scale-[1.01] border border-white/10"
            >
              {/* Kart Üst Satır */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white/70" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-semibold backdrop-blur-xs">
                    {isCardFrozen ? "Korumada" : "Aktif Portföy"}
                  </span>
                </div>

                {/* TROY / Katılım Geometrik Logosu */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold font-mono tracking-wider text-emerald-400">DİB ONAYLI</span>
                </div>
              </div>

              {/* Çip & Temassız */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-6 rounded-md bg-amber-200/30 border border-amber-300/50 flex items-center justify-center">
                  <div className="w-5 h-3 border border-amber-300/30 rounded-xs" />
                </div>
              </div>

              {/* Kart Alt Satır: Numara + Son Kullanma */}
              <div>
                <div className="text-base sm:text-lg font-mono font-bold tracking-widest text-white/95">
                  {showCardNumber ? "MZ-8425-6782-9104" : "•••• •••• •••• 6782"}
                </div>

                <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-white/70">
                  <div>
                    <span className="text-[9px] block text-white/40 uppercase">HESAP SAHİBİ</span>
                    <span className="font-semibold text-white/95">MİZAN KATILIM HESABI</span>
                  </div>
                  <div>
                    <span className="text-[9px] block text-white/40 uppercase">DÖNEM</span>
                    <span className="font-semibold text-white/95">2026/Q2</span>
                  </div>
                  <div>
                    <span className="text-[9px] block text-white/40 uppercase">GÜVENLİK</span>
                    <span className="font-semibold text-white/95">{showCardNumber ? "611" : "•••"}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
              Detayları görmek için karta dokunun
            </p>

            {/* Kart Eylem Butonları */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCardFrozen(!isCardFrozen)}
                className={`py-2 px-1 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                  isCardFrozen
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-blue-600"
                    : "bg-[#F8F9FA] dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-100 dark:border-white/5 text-[#182542] dark:text-white"
                }`}
              >
                <Snowflake size={14} className={isCardFrozen ? "text-blue-600" : "text-[#6E81A0] dark:text-[#94A3B8]"} />
                <span className="text-[10px] font-bold">{isCardFrozen ? "Koru Aktif" : "Dondur"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCardNumber(!showCardNumber)}
                className="py-2 px-1 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 text-[#182542] dark:text-white text-center transition flex flex-col items-center gap-1"
              >
                {showCardNumber ? <EyeOff size={14} className="text-[#6E81A0] dark:text-[#94A3B8]" /> : <Eye size={14} className="text-[#6E81A0] dark:text-[#94A3B8]" />}
                <span className="text-[10px] font-bold">{showCardNumber ? "Gizle" : "Göster"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText("MZ-8425-6782-9104")}
                className="py-2 px-1 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 text-[#182542] dark:text-white text-center transition flex flex-col items-center gap-1"
              >
                <Copy size={14} className="text-[#6E81A0] dark:text-[#94A3B8]" />
                <span className="text-[10px] font-bold">Kopyala</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="py-2 px-1 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 text-[#182542] dark:text-white text-center transition flex flex-col items-center gap-1"
              >
                <RotateCw size={14} className="text-[#6E81A0] dark:text-[#94A3B8]" />
                <span className="text-[10px] font-bold">Çevir</span>
              </button>
            </div>

          </div>

          {/* =============================================================== */}
          {/* SAĞ: FIKHİ PORTFÖY KONTROLLERİ & LİMİT (lg:col-span-6)          */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 bg-white dark:bg-[#161F32] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 sm:space-y-5 transition-colors">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                  Fıkhi Portföy Kontrolleri
                </h3>
                <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                  DİB ve TKBB standartlarına göre güvenlik ve arındırma kuralları
                </p>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 text-[10px] font-bold">
                Aktif Denetim
              </span>
            </div>

            {/* 4 iOS-style Toggle Butonu (Lacivert / Zümrüt) */}
            <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/5">
              
              {/* Anahtar 1: Otomatik Arındırma */}
              <div className="pt-3 first:pt-0 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#182542] dark:text-white block">Otomatik Temettü Arındırması</span>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Kâr payı tahakkukunda şüpheli geliri otomatik hesapla</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoPurification(!autoPurification)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                    autoPurification ? "bg-[#0D8B52] justify-end" : "bg-slate-200 dark:bg-white/10 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Anahtar 2: Anlık KAP Bildirimleri */}
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#182542] dark:text-white block">Anlık Fıkhi KAP Bildirimleri</span>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Şirket katılım dışı kalırsa anında SMS ve e-posta gönder</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRealtimeAlerts(!realtimeAlerts)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                    realtimeAlerts ? "bg-[#0D8B52] justify-end" : "bg-slate-200 dark:bg-white/10 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Anahtar 3: Hisse Zekâtı Takibi */}
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#182542] dark:text-white block">Yıllık Hisse Zekâtı Takibi</span>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Dönen varlık bazlı 1/40 (%2,5) zekât matrahını güncelle</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnnualZakat(!annualZakat)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                    annualZakat ? "bg-[#0D8B52] justify-end" : "bg-slate-200 dark:bg-white/10 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Anahtar 4: Yabancı Hisse Filtresi */}
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#182542] dark:text-white block">Yurt Dışı / Yabancı Hisse Filtresi</span>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Borsa İstanbul dışındaki varlıkları fıkhi filtreye al</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForeignFilter(!foreignFilter)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                    foreignFilter ? "bg-[#0D8B52] justify-end" : "bg-slate-200 dark:bg-white/10 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

            </div>

            {/* Aylık Arındırma & Risk Limiti */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">Aylık Arındırma Limiti</span>
                <span className="text-base font-black text-[#182542] dark:text-white font-mono">
                  ₺{spendingLimit.toLocaleString("tr-TR")},00
                </span>
              </div>

              <input
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#182542] dark:accent-[#273869]"
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#0D8B52] dark:text-emerald-400 font-bold">
                    ₺{spendingUsed.toLocaleString("tr-TR")} infak edildi
                  </span>
                  <span className="text-[#6E81A0] dark:text-[#94A3B8]">
                    %{Math.round((spendingUsed / spendingLimit) * 100)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#182542] to-[#273869] dark:from-[#273869] dark:to-blue-500"
                    style={{ width: `${Math.min(100, (spendingUsed / spendingLimit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ================================================================= */}
        {/* 2. SATIR: HEDEFLER & BİRİKİM                                      */}
        {/* ================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#182542] dark:text-white">
                Fıkhi Hedefler &amp; Birikim Havuzları
              </h2>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                Helal hisse birikimi, arındırma havuzu ve zekât fonu ilerleme durumu
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {savingsGoals.map((goal, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#161F32] rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/20 transition-all"
              >
                <div>
                  <span className="text-xs font-bold text-[#182542] dark:text-white block">
                    {goal.title}
                  </span>
                  <span className="text-[11px] font-mono text-[#6E81A0] dark:text-[#94A3B8]">
                    ₺{goal.current.toLocaleString("tr-TR")} / ₺{goal.target.toLocaleString("tr-TR")}
                  </span>
                </div>

                {/* Yüzdesel Dairesel İlerleme Halkası */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-20 h-20 rounded-full border-4 border-slate-100 dark:border-white/10 flex items-center justify-center">
                    <span className="text-base font-extrabold font-mono text-[#182542] dark:text-white">
                      %{goal.percent}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2 rounded-full bg-[#F4F5F7] dark:bg-white/10 hover:bg-[#EAECEF] dark:hover:bg-white/15 text-[#182542] dark:text-white text-xs font-bold transition"
                >
                  + Varlık Ekle
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. SATIR: YENİ POZİSYON EKLEME FORMU                              */}
        {/* ================================================================= */}
        <div id="yeni-pozisyon" className="bg-white dark:bg-[#161F32] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                Portföye Yeni Hisse Ekle
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                626 BIST hissesi arasından seçim yapın
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAddHolding}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
          >
            <div>
              <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                Hisse Kodu
              </label>
              <select
                value={newTicker}
                onChange={(e) => handleSelectNewTicker(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-[#182542] dark:text-white outline-none"
              >
                {(BIST_COMPREHENSIVE_UNIVERSE.length > 0 ? BIST_COMPREHENSIVE_UNIVERSE : SAMPLE_COMPANIES_SUMMARY).map((c) => (
                  <option key={c.ticker} value={c.ticker}>
                    {c.ticker} — {c.name.slice(0, 24)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                Lot Adedi
              </label>
              <input
                type="number"
                min="1"
                value={newLots}
                onChange={(e) => setNewLots(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-[#182542] dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                Ort. Maliyet (₺)
              </label>
              <input
                type="number"
                step="0.01"
                value={newAvgCost}
                onChange={(e) => setNewAvgCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-[#182542] dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                Alış Tarihi
              </label>
              <input
                type="date"
                value={newPurchaseDate}
                onChange={(e) => setNewPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-[#182542] dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                Zekât Niyeti
              </label>
              <select
                value={newZakatIntent}
                onChange={(e) => setNewZakatIntent(e.target.value as ZakatIntentionType)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-[#182542] dark:text-white outline-none"
              >
                <option value="LONG_TERM_DIVIDEND">Uzun Vade (Temettü)</option>
                <option value="TRADING_SHORT_TERM">Kısa Vade (Al-Sat)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold shadow-xs transition"
              >
                + Portföye Ekle
              </button>
            </div>
          </form>
        </div>

        {/* ================================================================= */}
        {/* 4. SATIR: AKTİF PORTFÖY POZİSYONLARI TABLOSU (GERÇEK LOGOLARLA)   */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-[#161F32] rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#182542] dark:text-white">
              Portföy Pozisyonları ({holdings.length} Hisse)
            </h3>
            <span className="text-xs font-mono font-bold text-[#0D8B52] dark:text-emerald-400">
              Toplam Değer: {formatTRY(portfolioAnalysis.totalMarketValue, 2)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] font-bold text-[11px]">
                  <th className="py-3 px-4">Hisse Senedi</th>
                  <th className="py-3 px-4 text-center">Fıkhi Durum</th>
                  <th className="py-3 px-4 text-right">Lot &amp; Maliyet</th>
                  <th className="py-3 px-4 text-right">Canlı Değer</th>
                  <th className="py-3 px-4 text-right">Kâr / Zarar</th>
                  <th className="py-3 px-4 text-right text-[#182542] dark:text-blue-400">Satış Arındırma</th>
                  <th className="py-3 px-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {portfolioAnalysis.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <StockLogo ticker={row.ticker} name={row.companyName} size="sm" />
                        <div>
                          <Link href={`/companies/${row.ticker}`} className="font-bold text-xs text-[#182542] dark:text-white hover:text-blue-600 block">
                            {row.ticker}
                          </Link>
                          <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block truncate max-w-[140px]">
                            {row.companyName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        row.isCompliant ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-950/40 text-[#C62E26] dark:text-rose-400"
                      }`}>
                        {row.isCompliant ? "✓ Uygun" : "✕ Kapsam Dışı"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-[#182542] dark:text-white">{row.lots} Lot</div>
                      <div className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">₺{row.avgCostTRY}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-[#182542] dark:text-white">{formatTRY(row.positionValueTRY, 2)}</div>
                      <div className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">₺{row.curPriceTRY.toFixed(2)}</div>
                    </td>

                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      row.positionPnlTRY.gte(0) ? "text-[#0D8B52] dark:text-emerald-400" : "text-[#C62E26] dark:text-rose-400"
                    }`}>
                      {row.positionPnlTRY.gte(0) ? "+" : ""}{formatTRY(row.positionPnlTRY, 2)} ({row.positionPnlPercent.toFixed(1)}%)
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#182542] dark:text-blue-400">
                      {formatTRY(row.purificationResult.totalPurificationPayable, 2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveHolding(row.id)}
                        className="text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#C62E26] transition p-1"
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