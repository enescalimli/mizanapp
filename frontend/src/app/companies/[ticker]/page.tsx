"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ComplianceBadge } from "@/components/ComplianceBadge";
import { RatioProgressBar } from "@/components/RatioProgressBar";
import { SmartAlternativeCard } from "@/components/SmartAlternativeCard";
import { getSmartAlternativesForTicker } from "@/lib/data/sampleCompanies";
import { CompanyDetailScreening } from "@/types/katilim";
import { formatTRY } from "@/lib/decimal/decimal";
import { PaynoShell } from "@/components/PaynoShell";
import {
  getDIBKatilimDetailedBreachReason,
  getFintablesRatios,
  getCompanyKapNews,
  getMizanAiAnalysis,
  isFreeDemoTicker,
  FREE_DEMO_TICKERS,
} from "@/lib/data/dibKatilimEngine";
import {
  ArrowLeft,
  Share2,
  Calendar,
  Building2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  Scale,
  Brain,
  Lock,
  Newspaper,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Check,
  ChevronRight,
  X,
  CreditCard,
  Zap,
} from "lucide-react";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params?.ticker as string)?.toUpperCase() || "BIMAS";

  const [data, setData] = useState<CompanyDetailScreening | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addedToPortfolio, setAddedToPortfolio] = useState(false);
  const [activeTab, setActiveTab] = useState<"FIKIH" | "RASYOLAR" | "KAP" | "AI">("FIKIH");

  // SaaS PRO Subscription state
  const [isProUser, setIsProUser] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const proSaved = localStorage.getItem("mizan_is_pro") === "true";
      setIsProUser(proSaved);
    }
  }, []);

  const toggleProPlan = () => {
    const nextState = !isProUser;
    setIsProUser(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("mizan_is_pro", String(nextState));
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/screening/${ticker}?standard=BIST_KATILIM_DIB`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Error loading company screening data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [ticker]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToPortfolio = () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mizan_user_holdings");
        let list: any[] = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(list) || list.length === 0) {
          list = [
            { id: "h-1", ticker: "BIMAS", lots: "300", avgCostTRY: "420.00", purchaseDate: "2024-05-15", purificationMethod: "holding", zakatIntent: "LONG_TERM_DIVIDEND" },
            { id: "h-2", ticker: "ASELS", lots: "1500", avgCostTRY: "58.00", purchaseDate: "2024-06-20", purificationMethod: "holding", zakatIntent: "LONG_TERM_DIVIDEND" },
          ];
        }
        const existingIdx = list.findIndex((h) => h.ticker === ticker);
        if (existingIdx >= 0) {
          list[existingIdx].lots = String(Number(list[existingIdx].lots || 0) + 100);
        } else {
          list.push({
            id: `h-${Date.now()}`,
            ticker,
            lots: "100",
            avgCostTRY: data?.ratios?.spotMarketCapTRY ? "100.00" : "50.00",
            purchaseDate: new Date().toISOString().slice(0, 10),
            purificationMethod: "holding",
            zakatIntent: "LONG_TERM_DIVIDEND",
          });
        }
        localStorage.setItem("mizan_user_holdings", JSON.stringify(list));
      } catch (e) {
        console.error("Local storage error:", e);
      }
    }
    setAddedToPortfolio(true);
    setTimeout(() => {
      router.push("/portfolio");
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ebf2fa] dark:bg-[#0b1120]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {ticker} Katılım ve Fıkhi Verileri Yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#ebf2fa] dark:bg-[#0b1120]">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-white/90 dark:border-white/10 shadow-lg">
          <HelpCircle size={36} className="mx-auto text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Şirket Bulunamadı</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            &quot;{ticker}&quot; kodlu şirket için henüz fıkhi tarama kaydı girilmemiştir.
          </p>
          <Link
            href="/tarayici"
            className="px-4 py-2.5 rounded-full bg-[#182542] dark:bg-emerald-600 hover:bg-[#273869] text-white text-xs font-bold inline-flex items-center gap-2"
          >
            <ArrowLeft size={13} />
            <span>Katılım Taramasına Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  // Derived metrics from engine
  const debtRatioNum = parseFloat(data.ratios.interestDebt.ratioPercentage.replace("%", "")) || 0;
  const cashRatioNum = parseFloat(data.ratios.interestCash.ratioPercentage.replace("%", "")) || 0;
  const impureRatioNum = parseFloat(data.ratios.impureIncome.ratioPercentage.replace("%", "")) || 0;
  const isCompliant = data.overallStatus === "COMPLIANT";

  // Engine outputs
  const breachAnalysis = getDIBKatilimDetailedBreachReason(
    ticker,
    data.companyName,
    data.sector,
    debtRatioNum,
    cashRatioNum,
    impureRatioNum,
    isCompliant
  );

  const fintablesRatios = getFintablesRatios(
    ticker,
    parseFloat(data.ratios.denominatorValueTRY) / 100000000 || 50,
    parseFloat(data.ratios.spotMarketCapTRY) || 10_000_000_000,
    data.sector
  );

  const kapNews = getCompanyKapNews(ticker, data.companyName);

  const aiAnalysis = getMizanAiAnalysis(
    ticker,
    data.companyName,
    isCompliant,
    debtRatioNum,
    cashRatioNum,
    impureRatioNum
  );

  const isDemoStock = isFreeDemoTicker(ticker);
  const isAiUnlocked = isProUser || isDemoStock;

  return (
    <PaynoShell badge={ticker}>
      <div className="space-y-6">
        
        {/* =================================================================== */}
        {/* 1. TOP BREADCRUMB & ACTION BAR                                      */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between text-xs text-[#6E81A0] dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/tarayici" className="hover:text-[#182542] dark:hover:text-white transition-colors flex items-center gap-1.5 font-bold">
              <ArrowLeft size={13} />
              <span>Hisse Tarayıcı (626)</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span>Şirket Analizi</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-[#182542] dark:text-emerald-400 font-extrabold font-mono">{ticker}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToPortfolio}
              className="px-3.5 py-2 rounded-full bg-[#182542] dark:bg-emerald-600 hover:bg-[#273869] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle size={13} />
              <span>{addedToPortfolio ? "Portföye Eklendi!" : "Portföye Ekle"}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-full bg-white/70 dark:bg-slate-800/70 hover:bg-white text-[#182542] dark:text-white border border-white/80 dark:border-white/10 text-xs font-bold transition flex items-center gap-1.5 shadow-xs backdrop-blur-md"
            >
              <Share2 size={12} />
              <span>{copied ? "Kopyalandı!" : "Paylaş"}</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. COMPANY HERO CARD: Window Glass Frosted Header                  */}
        {/* =================================================================== */}
        <div className="apple-glass-card p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Title & Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#182542] to-[#364b6e] dark:from-emerald-600 dark:to-teal-800 text-white flex items-center justify-center font-extrabold text-xl font-mono tabular-nums shadow-md ring-1 ring-white/20">
                {ticker}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] dark:text-white tracking-tight">
                    {data.companyName}
                  </h1>
                  <ComplianceBadge status={data.overallStatus} size="lg" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6E81A0] dark:text-slate-400 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 size={13} className="text-[#182542] dark:text-emerald-400" />
                    {data.sector} &bull; {data.subSector}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-mono tabular-nums">
                    <Calendar size={13} className="text-[#182542] dark:text-emerald-400" />
                    {data.fiscalPeriod} &bull; Değerleme: {data.valuationDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Badge: Exclusively DİB & TKBB Standard */}
            <div className="px-4 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center gap-2">
              <Scale size={15} className="text-[#182542] dark:text-emerald-400" />
              <div className="text-left">
                <span className="block text-[9px] uppercase font-bold text-[#6E81A0] dark:text-slate-400 tracking-wider">
                  Uygulanan Standart
                </span>
                <span className="text-xs font-extrabold text-[#182542] dark:text-white font-mono">
                  DİB &amp; TKBB Katılım Standartları
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. FOUR MODULAR PANELS NAVIGATION TABS                              */}
        {/* =================================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "FIKIH", label: "1. Fıkhi Uygunluk & Katılım", icon: Scale, count: null },
            { id: "RASYOLAR", label: "2. Finansal Rasyolar (Fintables)", icon: BarChart3, count: "12 Rasyo" },
            { id: "KAP", label: "3. KAP Bildirimleri & Bilanço", icon: Newspaper, count: `${kapNews.length} Haber` },
            { id: "AI", label: "4. Mizan AI Analizi", icon: Brain, count: isAiUnlocked ? "Aktif" : "PRO" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? "bg-[#182542] dark:bg-emerald-600 text-white shadow-md scale-[1.02]"
                    : "bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-[#6E81A0] dark:text-slate-300 border border-white/80 dark:border-white/10"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-[#6E81A0] dark:text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* =================================================================== */}
        {/* PANEL 1: FIKHI UYGUNLUK & KATILIM KARNESİ (DİB & TKBB)             */}
        {/* =================================================================== */}
        {activeTab === "FIKIH" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Detailed Reason Card: REAL, Differentiated Reason Generator */}
            <div className={`p-6 rounded-3xl apple-glass-card border-l-4 ${
              isCompliant
                ? "border-l-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                : "border-l-rose-500 bg-rose-50/40 dark:bg-rose-950/20"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isCompliant ? (
                      <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ShieldAlert size={18} className="text-rose-600 dark:text-rose-400" />
                    )}
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${
                      isCompliant ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                    }`}>
                      {isCompliant ? "Katılım Endeksi Uygunluk Beyanı" : "Katılım Endeksi Kapsam Dışı Kalma Sebebi"}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#182542] dark:text-white">
                    {breachAnalysis.summary}
                  </h3>

                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {breachAnalysis.detail}
                  </p>
                </div>

                <div className="hidden sm:block shrink-0 text-right">
                  <span className="text-[10px] font-mono text-[#6E81A0] dark:text-slate-400 block mb-1">
                    Dayanak
                  </span>
                  <span className="text-[11px] font-extrabold text-[#182542] dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 inline-block">
                    {breachAnalysis.applicableStandard}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Core Ratio Progress Bars */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[#182542] dark:text-white tracking-tight flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
                  DİB &amp; TKBB 3 Altın Rasyo Denetimi
                </h2>
                <span className="text-xs text-[#6E81A0] dark:text-slate-400 font-mono">
                  Payda: {formatTRY(data.ratios.denominatorValueTRY, 0)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RatioProgressBar
                  label="Faizli Borç Oranı"
                  subLabel="Toplam Faizli Borçlar / Payda"
                  detail={data.ratios.interestDebt}
                  maxScalePercent={45}
                  isDebtOrCash={true}
                />

                <RatioProgressBar
                  label="Faizli Varlık Oranı"
                  subLabel="Vadeli Mevduat + Repo / Payda"
                  detail={data.ratios.interestCash}
                  maxScalePercent={45}
                  isDebtOrCash={true}
                />

                <RatioProgressBar
                  label="Uygun Olmayan Gelir Oranı"
                  subLabel="Faiz & Uygunsuz Gelir / Hasılat"
                  detail={data.ratios.impureIncome}
                  maxScalePercent={8}
                  isDebtOrCash={false}
                />
              </div>
            </div>

            {/* Fıkhi Arındırma & Zekat Metrikleri */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="apple-glass-card p-5">
                <span className="text-[10px] uppercase font-bold text-[#6E81A0] dark:text-slate-400 tracking-wider block mb-1">
                  Hisse Başı Fıkhi Arındırma Payı
                </span>
                <span className="text-xl font-mono font-extrabold text-[#182542] dark:text-white">
                  ₺{data.purificationMetrics.purificationPerShareQuarterTRY}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                  Çeyreklik kazançtan arındırılması önerilen tutar.
                </span>
              </div>

              <div className="apple-glass-card p-5">
                <span className="text-[10px] uppercase font-bold text-[#6E81A0] dark:text-slate-400 tracking-wider block mb-1">
                  Hisse Başı Zekat Matrahı
                </span>
                <span className="text-xl font-mono font-extrabold text-[#182542] dark:text-white">
                  ₺{data.purificationMetrics.zatableNetCurrentAssetsPerShareTRY}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                  Net Dönen Varlık payı üzerinden zekat matrahı.
                </span>
              </div>

              <div className="apple-glass-card p-5">
                <span className="text-[10px] uppercase font-bold text-[#6E81A0] dark:text-slate-400 tracking-wider block mb-1">
                  Piyasa Değeri (TRY)
                </span>
                <span className="text-xl font-mono font-extrabold text-[#182542] dark:text-white">
                  {formatTRY(data.ratios.spotMarketCapTRY, 0)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                  BIST spot kapanış piyasa değeri.
                </span>
              </div>
            </div>

            {/* Akıllı Alternatifler (Kapsam dışıysa) */}
            {!isCompliant && (
              <SmartAlternativeCard
                sourceTicker={ticker}
                sourceCompanyName={data.companyName}
                sourceSector={data.sector}
                sourceDebtRatioPercent={debtRatioNum}
                sourceMarketValueTRY="100000.00"
                alternatives={getSmartAlternativesForTicker(ticker, "BIST_KATILIM_DIB")}
              />
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* PANEL 2: FINANSAL RASYOLAR (FINTABLES TARZI TEMEL ANALIZ)          */}
        {/* =================================================================== */}
        {activeTab === "RASYOLAR" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#182542] dark:text-white tracking-tight flex items-center gap-2">
                  <BarChart3 size={18} className="text-emerald-600 dark:text-emerald-400" />
                  {ticker} Temel Analiz &amp; Değerleme Rasyoları
                </h2>
                <span className="text-xs text-[#6E81A0] dark:text-slate-400">
                  Fintables standardında canlı çarpanlar ve bilanço performans katsayıları
                </span>
              </div>
            </div>

            {/* 1. Değerleme Çarpanları */}
            <div className="apple-glass-card p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-[#6E81A0] dark:text-slate-400 tracking-wider">
                Değerleme Çarpanları
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    F/K (Fiyat / Kazanç)
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.peRatio}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    Sektör Ort: 14.2
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    PD/DD (Piyasa/Defter)
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.pbRatio}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    Tarihsel Çarpan
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    FD/FAVÖK (EV/EBITDA)
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.evEbitda}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    Operasyonel Güç
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    FD / Satışlar
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.evSales}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    Ciro Katsayısı
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Kârlılık ve Verimlilik Marjları */}
            <div className="apple-glass-card p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-[#6E81A0] dark:text-slate-400 tracking-wider">
                Kârlılık ve Marjlar
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    Özsermaye Kârlılığı (ROE)
                  </span>
                  <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {fintablesRatios.roePercent}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Yıllık Bileşik</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    Aktif Kârlılığı (ROA)
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.roaPercent}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Varlık Verimliliği</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    FAVÖK Marjı
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.ebitdaMarginPercent}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Faaliyet Kârı</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    Net Kâr Marjı
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.netProfitMarginPercent}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Konsolide Net</span>
                </div>
              </div>
            </div>

            {/* 3. Bilanço, Likidite & Sermaye Yapısı */}
            <div className="apple-glass-card p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-[#6E81A0] dark:text-slate-400 tracking-wider">
                Bilanço &amp; Likidite Rasyoları
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    Cari Oran (Likidite)
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.currentRatio}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Güvenli Alan (&gt; 1.2)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    Net Borç / FAVÖK
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.netDebtToEbitda}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Borç Ödeme Kapasitesi</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    Halka Açıklık Oranı
                  </span>
                  <span className="text-xl font-mono font-black text-[#182542] dark:text-white">
                    {fintablesRatios.freeFloatPercent}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">BIST Fiili Dolaşım</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] text-[#6E81A0] dark:text-slate-400 font-bold block mb-1">
                    Ödenmiş Sermaye
                  </span>
                  <span className="text-base font-mono font-black text-[#182542] dark:text-white truncate block">
                    {fintablesRatios.paidCapitalTRY}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Kayıtlı Sermaye Tavanı</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PANEL 3: KAP BİLDİRİMLERİ VE BİLANÇO AKIŞI                         */}
        {/* =================================================================== */}
        {activeTab === "KAP" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#182542] dark:text-white tracking-tight flex items-center gap-2">
                  <Newspaper size={18} className="text-emerald-600 dark:text-emerald-400" />
                  {ticker} Canlı KAP Bildirimleri &amp; Fıkhi Formlar
                </h2>
                <span className="text-xs text-[#6E81A0] dark:text-slate-400">
                  Kamuyu Aydınlatma Platformu (KAP) resmi açıklamaları ve KAFİF beyanları
                </span>
              </div>
              <a
                href={`https://www.kap.org.tr/tr/sirketler/${ticker}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>KAP Profilini Aç</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="space-y-3">
              {kapNews.map((news) => (
                <div
                  key={news.id}
                  className="apple-glass-card p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-[#182542] dark:bg-emerald-600 text-white">
                        {news.categoryLabel}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {news.date} &bull; {news.time}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-[#182542] dark:text-white">
                      {news.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {news.summary}
                    </p>
                  </div>

                  <a
                    href={news.kapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#182542] dark:text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>İncele</span>
                    <ChevronRight size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PANEL 4: MİZAN AI ANALİZİ (PRO ÖZEL & ÜCRETSİZ ÖRNEK HİSSE)        */}
        {/* =================================================================== */}
        {activeTab === "AI" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#182542] dark:text-white tracking-tight flex items-center gap-2">
                  <Brain size={18} className="text-purple-600 dark:text-purple-400" />
                  Mizan AI Fıkhi &amp; Finansal Zeka Raporu
                </h2>
                <span className="text-xs text-[#6E81A0] dark:text-slate-400">
                  Yapay zeka destekli dipnot denetimi, bilanço erken uyarısı ve fıkhi risk projeksiyonu
                </span>
              </div>

              {isDemoStock && !isProUser && (
                <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-700/50 flex items-center gap-1.5">
                  <Sparkles size={12} />
                  <span>Ücretsiz Demo Örnek Hisse</span>
                </div>
              )}
            </div>

            {/* UNLOCKED VIEW: User is PRO OR Current Stock is Demo Stock */}
            {isAiUnlocked ? (
              <div className="space-y-5">
                {/* AI Score & Summary Bento */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left: AI Health Score Gauge */}
                  <div className="md:col-span-4 apple-glass-card p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[11px] font-extrabold uppercase text-[#6E81A0] dark:text-slate-400 tracking-wider">
                      Mizan Fıkhi Güvenlik Skoru
                    </span>

                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200 dark:text-slate-700"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={aiAnalysis.score >= 70 ? "text-emerald-500" : "text-amber-500"}
                          strokeDasharray={`${aiAnalysis.score}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-black font-mono text-[#182542] dark:text-white">
                          {aiAnalysis.score}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">/ 100</span>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-extrabold text-[#182542] dark:text-white">
                      <span>Fıkhi Risk:</span>
                      <strong className={aiAnalysis.riskLevel === "DÜŞÜK" ? "text-emerald-600" : "text-rose-600"}>
                        {aiAnalysis.riskLevel}
                      </strong>
                    </div>
                  </div>

                  {/* Right: AI Projections & Footnote Analysis */}
                  <div className="md:col-span-8 apple-glass-card p-6 space-y-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#6E81A0] dark:text-slate-400 tracking-wider block mb-1">
                        Gelecek Çeyrek Katılım Riski Tahmini
                      </span>
                      <p className="text-sm font-bold text-[#182542] dark:text-white">
                        {aiAnalysis.quarterlyRiskOutlook}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-[10px] font-extrabold uppercase text-[#6E81A0] dark:text-slate-400 tracking-wider block mb-1">
                        Bilanço Dipnotu Ayrıştırma Özeti
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {aiAnalysis.footnoteAuditAnalysis}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-[10px] font-extrabold uppercase text-[#6E81A0] dark:text-slate-400 tracking-wider block mb-1">
                        Moat Gücü &amp; Temel Finansal Değerlendirme
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {aiAnalysis.fundamentalMoatRating}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom AI Investor Advice Note */}
                <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-extrabold">
                    <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                    <span>Mizan AI Fıkhi Yatırımcı Notu</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">
                    {aiAnalysis.investorAdviceNote}
                  </p>
                </div>
              </div>
            ) : (
              /* LOCKED VIEW: Free user on a Non-Demo Stock */
              <div className="relative rounded-3xl overflow-hidden border border-white/80 dark:border-white/10 p-8 sm:p-12 apple-glass-card text-center space-y-6">
                {/* Background blurred dummy layout */}
                <div className="absolute inset-0 filter blur-md opacity-30 select-none pointer-events-none p-6 space-y-4">
                  <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full" />
                  <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl w-3/4 mx-auto" />
                  <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full" />
                </div>

                {/* Lock Foreground Banner */}
                <div className="relative z-10 max-w-lg mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-3xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto shadow-md">
                    <Lock size={24} />
                  </div>

                  <h3 className="text-xl font-extrabold text-[#182542] dark:text-white">
                    {ticker} İçin Mizan AI Analizi Kilitli
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Yapay zeka destekli fıkhi risk skoru, gelecek çeyrek katılım erken uyarısı ve bilanço dipnotu ayrıştırması <strong>Mizan PRO</strong> abonelerine özeldir.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs text-[#182542] dark:text-slate-200 flex items-center justify-between gap-3">
                    <span className="font-semibold text-left">
                      💡 Mizan AI analizini ücretsiz test etmek ister misiniz?
                    </span>
                    <Link
                      href="/companies/BIMAS"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap"
                    >
                      BIMAS Örneğini Gör
                    </Link>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowProModal(true)}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 transition-all inline-flex items-center gap-2"
                    >
                      <Zap size={16} />
                      <span>Mizan PRO&apos;ya Geçin (₺149/ay) — Kilidi Açın</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* SAAS PRO SUBSCRIPTION MODAL                                           */}
      {/* ===================================================================== */}
      {showProModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#111A2E]/95 backdrop-blur-3xl rounded-3xl border border-white/90 dark:border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.4)] max-w-lg w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X size={18} />
            </button>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto">
                <Zap size={22} />
              </div>
              <h3 className="text-xl font-black text-[#182542] dark:text-white">
                Mizan PRO&apos;ya Yükseltin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                626 hissenin tamamında sınırsız AI fıkhi zeka, bilanço alarmları ve kuruş kuruş arındırma.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-2.5 text-xs">
              {[
                "626 BIST hissesinde sınırsız Mizan AI fıkhi risk analizi",
                "KAP bilançosu açıklandığı an SMS & E-posta fıkhi ihlal alarmları",
                "Otomatik portföy arındırma ve hisse senedi zekat matrahı motoru",
                "Halka arz fıkhi izahname inceleme raporları (PDF)",
                "Fintables tarzı tüm değerleme rasyoları ve geçmiş bilanço serileri",
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Aylık Abonelik
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#182542] dark:text-white font-mono">
                    ₺149
                  </span>
                  <span className="text-xs text-slate-500">/ ay</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  Yıllık Plan: ₺1.490
                </span>
                <span className="text-[10px] text-slate-400 font-mono">2 Ay Ücretsiz</span>
              </div>
            </div>

            {/* Activate Button */}
            <button
              onClick={() => {
                toggleProPlan();
                setShowProModal(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              <span>{isProUser ? "PRO Üyeliğini Kapat (Test)" : "Mizan PRO Aboneliğini Başlat (14 Gün Ücretsiz)"}</span>
            </button>
          </div>
        </div>
      )}
    </PaynoShell>
  );
}
