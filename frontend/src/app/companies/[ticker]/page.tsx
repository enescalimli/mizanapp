"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ComplianceBadge } from "@/components/ComplianceBadge";
import { RatioProgressBar } from "@/components/RatioProgressBar";
import { SmartAlternativeCard } from "@/components/SmartAlternativeCard";
import { getSmartAlternativesForTicker } from "@/lib/data/sampleCompanies";
import { CompanyDetailScreening, ScreeningStandardCode } from "@/types/katilim";
import { formatTRY } from "@/lib/decimal/decimal";
import { PaynoShell } from "@/components/PaynoShell";
import { StockLogo } from "@/components/StockLogo";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  ArrowLeft,
  Share2,
  Calendar,
  Building2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  Lock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Scale,
  Activity,
  FileSpreadsheet,
  Coins,
  Cpu,
  Award,
  Zap,
  Split,
  Users2,
  PieChart,
  Target,
  Compass,
} from "lucide-react";

type CompanyDetailTab = "FIKIH" | "KARNE" | "RASYOLAR" | "FINANSALLAR" | "TEMETTU_RAKIP" | "AI_ANALIZ";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params?.ticker as string)?.toUpperCase() || "BIMAS";
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<CompanyDetailTab>("FIKIH");
  const [standard, setStandard] = useState<ScreeningStandardCode>("BIST_KATILIM_DIB");
  const [data, setData] = useState<CompanyDetailScreening | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addedToPortfolio, setAddedToPortfolio] = useState(false);
  const [isProUser, setIsProUser] = useState(false);

  // Check if user is PRO or if this is the sample free stock (BIMAS)
  const isSampleFreeStock = ticker === "BIMAS";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("mizan_user_settings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.isPro || parsed.subscriptionPlan === "PRO") {
            setIsProUser(true);
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const isUserPro = isSampleFreeStock || isProUser || profile?.is_pro === true;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/screening/${ticker}?standard=${standard}`);
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
  }, [ticker, standard]);

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
            avgCostTRY: data?.ratios?.spotMarketCapTRY ? String(parseFloat(data.ratios.denominatorValueTRY) / 1000000) : "100.00",
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
      <div className="min-h-screen flex items-center justify-center bg-[#EBEEF2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#182542] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#6E81A0] font-mono">
            {ticker} Katılım &amp; Fintables Finansalları Yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#EBEEF2]">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-white/85 shadow-lg">
          <HelpCircle size={36} className="mx-auto text-[#6E81A0]" />
          <h2 className="text-lg font-bold text-[#182542]">Şirket Bulunamadı</h2>
          <p className="text-xs text-[#6E81A0]">
            &quot;{ticker}&quot; kodlu şirket için henüz veri kaydı bulunamadı.
          </p>
          <Link
            href="/tarayici"
            className="px-4 py-2.5 rounded-full bg-[#182542] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs"
          >
            <ArrowLeft size={13} />
            <span>626 Hisse Tarayıcısına Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const isBist = standard === "BIST_KATILIM_DIB";
  const ret = data.periodicReturns;
  const fin = data.financials;
  const ai = data.aiAnalysis;
  const breach = data.detailedBreach;
  const scorecard = data.scorecard;
  const dRatios = data.detailedRatios;
  const dupont = data.dupont;
  const divHist = data.dividendHistory;
  const peers = data.peers;

  return (
    <PaynoShell badge={ticker}>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* =================================================================== */}
        {/* TOP BREADCRUMB & HEADER ACTIONS                                     */}
        {/* =================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6E81A0]">
          <div className="flex items-center gap-2">
            <Link href="/tarayici" className="hover:text-[#182542] transition flex items-center gap-1.5 font-bold">
              <ArrowLeft size={13} />
              <span>626 BIST Tarayıcı</span>
            </Link>
            <span>/</span>
            <span>Şirketler</span>
            <span>/</span>
            <span className="text-[#182542] font-mono font-extrabold">{ticker}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToPortfolio}
              className="px-3.5 py-1.5 rounded-full bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <PlusCircle size={13} />
              <span>{addedToPortfolio ? "Eklendi!" : "Portföye Ekle"}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#182542] border border-white/90 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs backdrop-blur-md"
            >
              <Share2 size={12} />
              <span>{copied ? "Kopyalandı!" : "Paylaş"}</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* FINTABLES-GRADE COMPANY HERO BANNER                                 */}
        {/* =================================================================== */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Ticker & Info */}
            <div className="flex items-start gap-4">
              <StockLogo
                ticker={ticker}
                name={data.companyName}
                size="xl"
                priority
                className="shadow-sm"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#182542] tracking-tight">
                    {data.companyName}
                  </h1>
                  <ComplianceBadge status={data.overallStatus} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E81A0] font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 size={12} className="text-[#182542]" />
                    {data.sector} &bull; {data.subSector}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar size={12} className="text-[#182542]" />
                    {data.fiscalPeriod} &bull; Değerleme: {data.valuationDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Resmi Fıkhi Standart Rozeti */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#EBEEF2]/90 border border-white/80 shadow-2xs shrink-0 text-xs font-bold text-[#182542]">
              <Scale size={13} className="text-emerald-600" />
              <span>DİB &amp; BIST Katılım Standartları (&lt;%33)</span>
            </div>
          </div>

          {/* FINTABLES-STYLE RETURN RIBBON (Çoklu Periyot Getiri Barı) */}
          {ret && (
            <div className="pt-3 border-t border-[#EDF1F7] grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-xs">
              {[
                { label: "Günlük", val: ret.daily },
                { label: "1 Hafta", val: ret.weekly },
                { label: "1 Ay", val: ret.monthly },
                { label: "6 Ay", val: ret.sixMonths },
                { label: "2026 (YTD)", val: ret.ytd2026 },
                { label: "1 Yıl", val: ret.oneYear },
                { label: "5 Yıl", val: ret.fiveYears },
              ].map((item) => {
                const isPos = !item.val.startsWith("-");
                return (
                  <div key={item.label} className="p-2 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-0.5">
                    <span className="text-[10px] font-semibold text-[#6E81A0] block uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span
                      className={`font-mono font-bold text-xs flex items-center justify-center gap-0.5 ${
                        isPos ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      <span>{item.val}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* DOĞRU VE OTOMATİK KATILIM DIŞI TEŞHİS RÖNTGENİ                      */}
        {/* =================================================================== */}
        {data.overallStatus !== "COMPLIANT" && breach && (
          <div className="bg-white/90 backdrop-blur-2xl rounded-[28px] border-2 border-rose-500/25 p-6 shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800">
                      {breach.categoryLabel}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900">
                      Katılım Dışı
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6E81A0] font-medium">
                    Dayanak: {breach.regulatoryStandard}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1.5">
              <h4 className="text-sm font-extrabold text-rose-950">
                {breach.primaryReason}
              </h4>
              <p className="text-xs text-rose-900/90 leading-relaxed font-normal">
                {breach.detailExplanation}
              </p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 6 INTERACTIVE NAVIGATION TABS (V14 Pill Container)                  */}
        {/* =================================================================== */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto py-1 scrollbar-none">
          <div className="bg-white rounded-full p-1 border border-slate-200/60 shadow-xs flex items-center gap-1 shrink-0">
            {[
              { id: "FIKIH", label: "Fıkhi Analiz", icon: Scale },
              { id: "KARNE", label: "Şirket Karnesi", icon: Award, badge: scorecard ? `${scorecard.totalScore}/24` : undefined },
              { id: "RASYOLAR", label: "Detaylı Rasyolar", icon: BarChart3 },
              { id: "FINANSALLAR", label: "Finansallar & DuPont", icon: FileSpreadsheet },
              { id: "TEMETTU_RAKIP", label: "Temettü & Rakipler", icon: Users2 },
              { id: "AI_ANALIZ", label: "Mizan AI Raporu", icon: Sparkles, badge: isSampleFreeStock ? "Demo" : "PRO" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as CompanyDetailTab)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                    isActive
                      ? "bg-[#15161A] text-white shadow-xs"
                      : "text-[#646A78] hover:text-[#15161A] hover:bg-slate-100/60"
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                      isActive ? "bg-[#FF5B26] text-white" : "bg-amber-100 text-amber-900"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: FIKHİ KATILIM ANALİZİ                                        */}
        {/* =================================================================== */}
        {activeTab === "FIKIH" && (
          <div className="space-y-6">
            {/* 3 Core Ratio Progress Bars */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#182542] flex items-center gap-2">
                  <Scale size={16} className="text-emerald-600" />
                  <span>DİB / TKBB Fıkhi Oran Eşikleri</span>
                </h3>
                <span className="text-xs text-[#6E81A0]">
                  Payda Değeri: <strong className="text-[#182542] font-mono">{formatTRY(data.ratios.denominatorValueTRY, 0)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RatioProgressBar
                  label="Faizli Borç Oranı"
                  subLabel="Toplam Faizli Borçlar / Payda"
                  detail={data.ratios.interestDebt}
                  maxScalePercent={isBist ? 45 : 40}
                  isDebtOrCash={true}
                />

                <RatioProgressBar
                  label="Faizli Varlık Oranı"
                  subLabel="Vadeli Mevduat + Faizli Menkul / Payda"
                  detail={data.ratios.interestCash}
                  maxScalePercent={isBist ? 45 : 40}
                  isDebtOrCash={true}
                />

                <RatioProgressBar
                  label="Uygun Olmayan Gelir Oranı"
                  subLabel="Faiz Gelirleri / Toplam Hasılat"
                  detail={data.ratios.impureIncome}
                  maxScalePercent={8}
                  isDebtOrCash={false}
                />
              </div>
            </div>

            {/* Smart Alternatives if non-compliant */}
            {data.overallStatus !== "COMPLIANT" && (
              <SmartAlternativeCard
                sourceTicker={ticker}
                sourceCompanyName={data.companyName}
                sourceSector={data.sector}
                sourceDebtRatioPercent={
                  parseFloat(data.ratios.interestDebt.ratioPercentage.replace("%", "")) || 35
                }
                sourceMarketValueTRY="100000.00"
                alternatives={getSmartAlternativesForTicker(ticker, standard)}
              />
            )}

            {/* Purification & Zakat Fast Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/85 shadow-2xs text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6E81A0] tracking-wider block mb-1">
                  Piyasa Değeri
                </span>
                <span className="font-mono tabular-nums font-bold text-[#182542] text-sm">
                  {formatTRY(data.ratios.spotMarketCapTRY, 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6E81A0] tracking-wider block mb-1">
                  Hisse Başı Çeyreklik Arındırma
                </span>
                <span className="font-mono tabular-nums font-bold text-emerald-700 text-sm">
                  ₺{data.purificationMetrics.purificationPerShareQuarterTRY}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6E81A0] tracking-wider block mb-1">
                  Temettü Arındırma Oranı
                </span>
                <span className="font-mono tabular-nums font-bold text-amber-700 text-sm">
                  %{(parseFloat(data.purificationMetrics.dividendPurificationRatio) * 100).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6E81A0] tracking-wider block mb-1">
                  Hisse Başı Zekât Matrahı
                </span>
                <span className="font-mono tabular-nums font-bold text-[#182542] text-sm">
                  ₺{data.purificationMetrics.zatableNetCurrentAssetsPerShareTRY}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: ŞİRKET KARNESİ (Fintables 18 Kriter + Mizan 6 Fıkhi Kriter)  */}
        {/* =================================================================== */}
        {activeTab === "KARNE" && scorecard && (
          <div className="space-y-6">
            {/* Header Score Banner */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6E81A0]">
                    Fintables &amp; Mizan Entegre Sağlık Karnesi
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#182542]">
                  {ticker} Şirket Yatırım &amp; Fıkıh Karnesi
                </h3>
                <p className="text-xs text-[#6E81A0]">
                  Kârlılık, Büyüme, Borçluluk ve Fıkhi Uyum olmak üzere toplam 24 objektif kriterin denetimidir.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-mono font-extrabold text-[#182542]">
                    {scorecard.totalScore} <span className="text-sm text-[#6E81A0]">/ 24</span>
                  </div>
                  <div className="text-[10px] text-[#6E81A0] font-bold">Toplam Karne Puanı</div>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ${
                  scorecard.ratingLetter === "A+" || scorecard.ratingLetter === "A"
                    ? "bg-emerald-600 text-white"
                    : scorecard.ratingLetter.startsWith("B")
                    ? "bg-blue-600 text-white"
                    : "bg-rose-600 text-white"
                }`}>
                  {scorecard.ratingLetter}
                </div>
              </div>
            </div>

            {/* 4 Scorecard Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1: Kârlılık */}
              <div className="p-5 rounded-[28px] bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold uppercase text-[#182542] flex items-center gap-1.5">
                    <Activity size={14} className="text-blue-600" />
                    <span>1. Kârlılık Karnesi</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">
                    {scorecard.profitabilityScore} / 6
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {scorecard.profitabilityItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                      <div className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={15} className="text-rose-500 shrink-0" />
                        )}
                        <span className="text-slate-700">{item.label}</span>
                      </div>
                      <span className="font-mono font-bold text-[#182542] text-[11px] shrink-0 ml-2">
                        {item.value || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 2: Büyüme */}
              <div className="p-5 rounded-[28px] bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold uppercase text-[#182542] flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-600" />
                    <span>2. Büyüme Karnesi</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {scorecard.growthScore} / 6
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {scorecard.growthItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                      <div className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={15} className="text-rose-500 shrink-0" />
                        )}
                        <span className="text-slate-700">{item.label}</span>
                      </div>
                      <span className="font-mono font-bold text-[#182542] text-[11px] shrink-0 ml-2">
                        {item.value || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 3: Borçluluk */}
              <div className="p-5 rounded-[28px] bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold uppercase text-[#182542] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    <span>3. Borçluluk &amp; Kaldıraç Karnesi</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                    {scorecard.debtScore} / 6
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {scorecard.debtItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                      <div className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={15} className="text-rose-500 shrink-0" />
                        )}
                        <span className="text-slate-700">{item.label}</span>
                      </div>
                      <span className="font-mono font-bold text-[#182542] text-[11px] shrink-0 ml-2">
                        {item.value || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 4: Fıkhi Katılım */}
              <div className="p-5 rounded-[28px] bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold uppercase text-[#182542] flex items-center gap-1.5">
                    <Scale size={14} className="text-emerald-600" />
                    <span>4. Mizan Fıkhi Katılım Karnesi</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {scorecard.shariahScore} / 6
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {scorecard.shariahItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                      <div className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={15} className="text-rose-500 shrink-0" />
                        )}
                        <span className="text-slate-700">{item.label}</span>
                      </div>
                      <span className="font-mono font-bold text-[#182542] text-[11px] shrink-0 ml-2">
                        {item.value || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: DETAYLI RASYOLAR (4 Kategori: Değerleme, Kârlılık, Likidite) */}
        {/* =================================================================== */}
        {activeTab === "RASYOLAR" && dRatios && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category 1: Değerleme Çarpanları */}
              <div className="p-5 rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/85 shadow-2xs space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#182542] border-b border-slate-100 pb-2">
                  1. Değerleme Çarpanları
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">F/K (Fiyat/Kazanç)</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.valuation.pe}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">PD / DD (Defter Değeri)</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.valuation.pb}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">FD / FAVÖK</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.valuation.evEbitda}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Fiyat / Serbest Nakit</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.valuation.priceToFcf}x</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Hisse Başına Kâr (EPS)</span>
                    <span className="text-base font-mono font-extrabold text-emerald-700">{dRatios.valuation.epsTRY}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Temettü Verimi</span>
                    <span className="text-base font-mono font-extrabold text-emerald-700">{dRatios.valuation.dividendYield}</span>
                  </div>
                </div>
              </div>

              {/* Category 2: Kârlılık Oranları */}
              <div className="p-5 rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/85 shadow-2xs space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#182542] border-b border-slate-100 pb-2">
                  2. Kârlılık Marjları
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Brüt Kâr Marjı</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.profitability.grossMargin}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">FAVÖK Marjı</span>
                    <span className="text-base font-mono font-extrabold text-emerald-700">{dRatios.profitability.ebitdaMargin}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Net Kâr Marjı</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.profitability.netMargin}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Özkaynak Kârlılığı (ROE)</span>
                    <span className="text-base font-mono font-extrabold text-indigo-700">{dRatios.profitability.roe}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Varlık Kârlılığı (ROA)</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.profitability.roa}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Yatırılan Sermaye (ROIC)</span>
                    <span className="text-base font-mono font-extrabold text-purple-700">{dRatios.profitability.roic}</span>
                  </div>
                </div>
              </div>

              {/* Category 3: Likidite & Çalışma Sermayesi */}
              <div className="p-5 rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/85 shadow-2xs space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#182542] border-b border-slate-100 pb-2">
                  3. Likidite ve Çalışma Sermayesi
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Cari Oran (Current Ratio)</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.liquidity.currentRatio}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Likit Oran (Asit-Test)</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.liquidity.quickRatio}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Nakit Oranı</span>
                    <span className="text-base font-mono font-extrabold text-emerald-700">{dRatios.liquidity.cashRatio}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Net Çalışma Sermayesi</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.liquidity.workingCapitalTRY}</span>
                  </div>
                </div>
              </div>

              {/* Category 4: Borçluluk & Finansal Yapı */}
              <div className="p-5 rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/85 shadow-2xs space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#182542] border-b border-slate-100 pb-2">
                  4. Borçluluk ve Kaldıraç
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Finansal Borç / Özkaynak</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.debt.debtToEquity}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Net Borç / FAVÖK</span>
                    <span className="text-base font-mono font-extrabold text-indigo-700">{dRatios.debt.netDebtToEbitda}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Kaldıraç (Borç / Aktif)</span>
                    <span className="text-base font-mono font-extrabold text-[#182542]">{dRatios.debt.debtToAssets}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-[#6E81A0] font-semibold block">Toplam Finansal Borç</span>
                    <span className="text-base font-mono font-extrabold text-rose-700">{dRatios.debt.financialDebtTRY}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: FINANSALLAR & DUPONT ANALİZİ                                 */}
        {/* =================================================================== */}
        {activeTab === "FINANSALLAR" && fin && dupont && (
          <div className="space-y-6">
            {/* DuPont Analizi Kartı */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#EDF1F7] pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-[#182542] flex items-center gap-2">
                    <Split size={16} className="text-indigo-600" />
                    <span>DuPont Analizi (Özkaynak Kârlılığının Anatomisi)</span>
                  </h3>
                  <p className="text-xs text-[#6E81A0]">ROE = Net Kâr Marjı &times; Aktif Devir Hızı &times; Finansal Kaldıraç</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                  ROE: %{dupont.calculatedRoePercent}
                </span>
              </div>

              {/* DuPont Flow Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6E81A0] block">1. Net Kâr Marjı</span>
                  <div className="text-lg font-mono font-extrabold text-[#182542]">%{dupont.netMarginPercent.toFixed(1)}</div>
                  <span className="text-[10px] text-slate-500">Satış Kârlılığı</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6E81A0] block">2. Aktif Devir Hızı</span>
                  <div className="text-lg font-mono font-extrabold text-[#182542]">{dupont.assetTurnover}x</div>
                  <span className="text-[10px] text-slate-500">Varlık Verimliliği</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6E81A0] block">3. Finansal Kaldıraç</span>
                  <div className="text-lg font-mono font-extrabold text-[#182542]">{dupont.leverageMultiplier}x</div>
                  <span className="text-[10px] text-slate-500">Aktif / Özkaynak</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-900 block">Hesaplanan ROE</span>
                  <div className="text-lg font-mono font-extrabold text-indigo-700">%{dupont.calculatedRoePercent}</div>
                  <span className="text-[10px] text-indigo-800 font-semibold">Özkaynak Getirisi</span>
                </div>
              </div>
            </div>

            {/* Bilanço ve Gelir Tabloları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/85 shadow-2xs space-y-3">
                <span className="text-xs font-extrabold uppercase text-[#182542] block border-b border-slate-100 pb-2">
                  Gelir Tablosu Kalemleri
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Satış Gelirleri (Hasılat)</span>
                    <span className="font-mono font-bold text-[#182542]">₺{fin.revenueTRY}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Brüt Kâr</span>
                    <span className="font-mono font-bold text-[#182542]">₺{fin.grossProfitTRY}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">FAVÖK (EBITDA)</span>
                    <span className="font-mono font-bold text-emerald-700">₺{fin.ebitdaTRY}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Net Dönem Kârı</span>
                    <span className="font-mono font-bold text-[#182542]">₺{fin.netIncomeTRY}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/85 shadow-2xs space-y-3">
                <span className="text-xs font-extrabold uppercase text-[#182542] block border-b border-slate-100 pb-2">
                  Bilanço Kalemleri
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Dönen Varlıklar</span>
                    <span className="font-mono font-bold text-[#182542]">₺{fin.currentAssetsTRY}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Duran Varlıklar</span>
                    <span className="font-mono font-bold text-[#182542]">₺{fin.nonCurrentAssetsTRY}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Finansal Borçlar (Toplam)</span>
                    <span className="font-mono font-bold text-rose-700">₺{fin.financialDebtTRY}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Özkaynaklar (Ana Ortaklık)</span>
                    <span className="font-mono font-bold text-emerald-700">₺{fin.equityTRY}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: TEMETTÜ & RAKİP KIYASLAMA TABLOSU                             */}
        {/* =================================================================== */}
        {activeTab === "TEMETTU_RAKIP" && (
          <div className="space-y-6">
            {/* Temettü Geçmişi & Fıkhi Arındırma Tablosu */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#EDF1F7] pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-[#182542] flex items-center gap-2">
                    <Coins size={16} className="text-emerald-600" />
                    <span>Temettü Geçmişi ve Temettü Başına Fıkhi Arındırma</span>
                  </h3>
                  <p className="text-xs text-[#6E81A0]">
                    Dağıtılan brüt temettüler ve içerisindeki fıkhi faiz arındırma payı.
                  </p>
                </div>
              </div>

              {divHist && divHist.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[#6E81A0] text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-3">Yıl</th>
                        <th className="py-2.5 px-3">Hisse Başı Brüt</th>
                        <th className="py-2.5 px-3">Temettü Verimi</th>
                        <th className="py-2.5 px-3 text-amber-700">Fıkhi Arındırma Payı</th>
                        <th className="py-2.5 px-3 text-right">Ödeme Tarihi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {divHist.map((d) => (
                        <tr key={d.year} className="hover:bg-slate-50/50 transition">
                          <td className="py-2.5 px-3 font-bold text-[#182542]">{d.year}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{d.grossPerShareTRY}</td>
                          <td className="py-2.5 px-3 text-emerald-700 font-bold">{d.dividendYieldPercent}</td>
                          <td className="py-2.5 px-3 font-bold text-amber-700">{d.purificationPerShareTRY}</td>
                          <td className="py-2.5 px-3 text-right text-slate-500 font-sans text-[11px]">{d.paymentDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[#6E81A0]">Kayıtlı temettü geçmişi bulunamadı.</p>
              )}
            </div>

            {/* Sektörel Rakip Kıyaslama Tablosu */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#EDF1F7] pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-[#182542] flex items-center gap-2">
                    <Users2 size={16} className="text-indigo-600" />
                    <span>Sektörel Rakip Kıyaslaması ({data.sector})</span>
                  </h3>
                  <p className="text-xs text-[#6E81A0]">Aynı sektörde işlem gören diğer hisselerle çarpan ve katılım kıyası.</p>
                </div>
              </div>

              {peers && peers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[#6E81A0] text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-3">Hisse</th>
                        <th className="py-2.5 px-3">Fiyat &amp; Değişim</th>
                        <th className="py-2.5 px-3">Katılım</th>
                        <th className="py-2.5 px-3">F/K</th>
                        <th className="py-2.5 px-3">PD/DD</th>
                        <th className="py-2.5 px-3">FD/FAVÖK</th>
                        <th className="py-2.5 px-3">ROE</th>
                        <th className="py-2.5 px-3">Faizli Borç</th>
                        <th className="py-2.5 px-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {peers.map((p) => (
                        <tr key={p.ticker} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                          <td className="py-2.5 px-3 font-bold text-[#182542] dark:text-white">
                            <div className="flex items-center gap-2">
                              <StockLogo ticker={p.ticker} name={p.name} size="xs" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span>{p.ticker}</span>
                                  {p.ticker === ticker && (
                                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.2 rounded font-sans">Mevcut</span>
                                  )}
                                </div>
                                <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400 font-normal truncate max-w-[130px]">{p.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800 block">{p.priceTRY}</span>
                            <span className={`text-[10px] font-semibold ${p.change24h.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
                              {p.change24h}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              p.isCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {p.isCompliant ? "Uyumlu" : "Dışı"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-700">{p.peRatio}</td>
                          <td className="py-2.5 px-3">{p.pbRatio}</td>
                          <td className="py-2.5 px-3">{p.evEbitda}</td>
                          <td className="py-2.5 px-3 text-indigo-700 font-semibold">{p.roePercent || "-"}</td>
                          <td className="py-2.5 px-3">%{p.debtRatioPercent.toFixed(1)}</td>
                          <td className="py-2.5 px-3 text-right">
                            <Link
                              href={`/companies/${p.ticker}`}
                              className="px-2.5 py-1 rounded-lg bg-[#182542] hover:bg-[#273869] text-white text-[10px] font-bold font-sans transition inline-flex items-center gap-1"
                            >
                              <span>İncele</span>
                              <ArrowRight size={10} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[#6E81A0]">Bu sektörde kayıtlı rakip şirket bulunamadı.</p>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 6: GELİŞMİŞ MİZAN AI ANALİZ MODÜLÜ (Freemium & PRO Paywall)      */}
        {/* =================================================================== */}
        {activeTab === "AI_ANALIZ" && ai && (
          <div className="space-y-6">
            
            {/* AI Header Card */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-[#182542] text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#182542]">Mizan AI &bull; Fıkhi ve Finansal Sağlık Sentezi</h3>
                      {isSampleFreeStock && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Örnek Ücretsiz Rapor (BIMAS)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E81A0]">KAP bilanço dipnotları, DİB/TKBB standartları ve piyasa çarpanlarının algoritmik yapay zekâ sentezi.</p>
                  </div>
                </div>

                {/* Score Capsule */}
                <div className="flex items-center gap-2 bg-[#182542] text-white px-4 py-2 rounded-2xl shadow-sm">
                  <span className="text-xs font-medium text-white/70">Mizan Skoru:</span>
                  <span className="font-mono font-extrabold text-base text-emerald-300">{ai.score} / 10</span>
                </div>
              </div>

              {/* Verdict Summary Callout */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#182542] leading-relaxed flex items-start gap-2.5">
                <Compass size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-[#182542]">{ai.verdict}: </span>
                  <span className="text-slate-700 font-normal">{ai.shariahRiskSummary}</span>
                </div>
              </div>

              {/* 4-Pill Component Scores Bar */}
              {ai.scoresBreakdown && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold text-[#6E81A0] block uppercase tracking-wider">
                      1. Fıkhi Güvenlik
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono font-extrabold text-base text-emerald-700">
                        {ai.scoresBreakdown.shariahSafety.score} <span className="text-xs font-normal text-slate-400">/ 10</span>
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800">
                        {ai.scoresBreakdown.shariahSafety.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {ai.scoresBreakdown.shariahSafety.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold text-[#6E81A0] block uppercase tracking-wider">
                      2. Finansal Dayanıklılık
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono font-extrabold text-base text-indigo-700">
                        {ai.scoresBreakdown.financialResilience.score} <span className="text-xs font-normal text-slate-400">/ 10</span>
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800">
                        {ai.scoresBreakdown.financialResilience.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {ai.scoresBreakdown.financialResilience.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold text-[#6E81A0] block uppercase tracking-wider">
                      3. Kârlılık &amp; Büyüme
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono font-extrabold text-base text-purple-700">
                        {ai.scoresBreakdown.profitabilityGrowth.score} <span className="text-xs font-normal text-slate-400">/ 10</span>
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-800">
                        {ai.scoresBreakdown.profitabilityGrowth.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {ai.scoresBreakdown.profitabilityGrowth.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold text-[#6E81A0] block uppercase tracking-wider">
                      4. Değerleme Cazibesi
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono font-extrabold text-base text-amber-700">
                        {ai.scoresBreakdown.valuationAttractiveness.score} <span className="text-xs font-normal text-slate-400">/ 10</span>
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800">
                        {ai.scoresBreakdown.valuationAttractiveness.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {ai.scoresBreakdown.valuationAttractiveness.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Endekste Kalma Güvenlik Tamponu Banner */}
              {ai.shariahSafetyBufferPercent != null && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-700" />
                      <span>Katılım Endeksi Güvenlik Tamponu: %{ai.shariahSafetyBufferPercent}</span>
                    </span>
                    <p className="text-emerald-950 font-normal leading-relaxed text-[11px]">
                      {ai.nextQuarterRiskOutlook}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`px-3 py-1 rounded-xl font-bold font-mono text-xs ${
                      ai.nextQuarterRiskLevel === "DÜŞÜK"
                        ? "bg-emerald-600 text-white"
                        : ai.nextQuarterRiskLevel === "ORTA"
                        ? "bg-amber-500 text-white"
                        : "bg-rose-600 text-white"
                    }`}>
                      Gelecek Çeyrek Riski: {ai.nextQuarterRiskLevel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* UNLOCKED FULL CONTENT (BIMAS or PRO user) */}
            {isUserPro ? (
              <div className="space-y-6">
                
                {/* 6 In-Depth Analysis Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Section 1: Financial Health */}
                  <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/85 shadow-2xs space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] flex items-center gap-2">
                      <Activity size={14} className="text-indigo-600" />
                      <span>1. Finansal Büyüme &amp; Kârlılık Röntgeni</span>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {ai.financialHealthSummary}
                    </p>
                  </div>

                  {/* Section 2: Purification Note */}
                  <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/85 shadow-2xs space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] flex items-center gap-2">
                      <Coins size={14} className="text-emerald-600" />
                      <span>2. Fıkhi Arındırma &amp; Temettü Yükü</span>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {ai.purificationZakatNote}
                    </p>
                  </div>

                  {/* Section 3: DuPont & ROE Quality */}
                  {ai.dupontAiSynthesis && (
                    <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/85 shadow-2xs space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] flex items-center gap-2">
                        <Split size={14} className="text-purple-600" />
                        <span>3. DuPont Model &amp; ROE Kalitesi Sentezi</span>
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {ai.dupontAiSynthesis}
                      </p>
                    </div>
                  )}

                  {/* Section 4: Valuation & Peer Benchmarking */}
                  {ai.valuationInsight && (
                    <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/85 shadow-2xs space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] flex items-center gap-2">
                        <BarChart3 size={14} className="text-amber-600" />
                        <span>4. Sektörel Değerleme &amp; Çarpan Kıyaslaması</span>
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {ai.valuationInsight}
                      </p>
                    </div>
                  )}

                  {/* Section 5: Target Investor Profile */}
                  {ai.targetInvestorProfile && (
                    <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/85 shadow-2xs space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] flex items-center gap-2">
                        <Target size={14} className="text-rose-600" />
                        <span>5. Hedef Yatırımcı Profili &amp; Uygunluk</span>
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {ai.targetInvestorProfile}
                      </p>
                    </div>
                  )}

                  {/* Section 6: Action Plan */}
                  {ai.shariahActionPlan && (
                    <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/85 shadow-2xs space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] flex items-center gap-2">
                        <Scale size={14} className="text-emerald-600" />
                        <span>6. Mizan Fıkhi Aksiyon Rehberi</span>
                      </h4>
                      <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-normal">
                        {ai.shariahActionPlan.split("\n").map((step, idx) => (
                          <p key={idx} className="flex items-start gap-1.5">
                            <span className="font-bold text-[#182542] shrink-0">&bull;</span>
                            <span>{step.replace(/^[0-9]+\.\s*/, "")}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pros & Cons Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Section: Pros */}
                  <div className="p-6 rounded-[28px] bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>Öne Çıkan Güçlü Yönler</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-emerald-950 font-medium pl-4 list-disc">
                      {ai.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section: Cons */}
                  <div className="p-6 rounded-[28px] bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
                      <AlertTriangle size={15} className="text-amber-600" />
                      <span>Takip Edilmesi Gereken Riskler</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-amber-950 font-medium pl-4 list-disc">
                      {ai.cons.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            ) : (
              /* LOCKED PAYWALL FOR OTHER STOCKS WHEN ON FREE TIER */
              <div className="relative rounded-[28px] overflow-hidden border border-white/90 shadow-lg">
                {/* Blurred Background Preview */}
                <div className="p-8 space-y-4 filter blur-xs select-none pointer-events-none opacity-40 bg-white">
                  <h4 className="text-sm font-bold">1. Finansal Büyüme &amp; Kârlılık Röntgeni</h4>
                  <p className="text-xs leading-relaxed">
                    Şirketin 2026 yılı 3. çeyrek finansal tablolarında esas faaliyet kârlılığı güçlü bir ivme sergilemiş olup, faizli borç rasyolarındaki hareketlilik izlenmektedir...
                  </p>
                  <h4 className="text-sm font-bold">2. Fıkhi Arındırma &amp; Temettü Yükü</h4>
                  <p className="text-xs leading-relaxed">
                    Dağıtılacak kâr payında arındırılması gereken faiz geliri payı ve hisse başı zekât tutarları...
                  </p>
                  <h4 className="text-sm font-bold">3. DuPont Model &amp; ROE Kalitesi</h4>
                  <p className="text-xs leading-relaxed">
                    Özkaynak kârlılığının aktif devir hızı ve net kâr marjı çarpanları analizi...
                  </p>
                </div>

                {/* Centered Frosted Conversion Modal Overlay */}
                <div className="absolute inset-0 bg-[#182542]/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg">
                    <Sparkles size={24} />
                  </div>

                  <div className="space-y-1 max-w-md">
                    <h4 className="text-lg font-extrabold tracking-tight">
                      {ticker} İçin Tam Yapay Zekâ Analizini Açın
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed font-normal">
                      Mizan PRO ile 626 hissenin tamamında anlık yapay zeka bilanço özetine, temettü arındırma projeksiyonuna ve risk alarmlarına erişin.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <Link
                      href="/ayarlar"
                      className="px-5 py-2.5 rounded-full bg-white text-[#182542] hover:bg-slate-100 text-xs font-bold transition shadow-md flex items-center gap-1.5 active:scale-95"
                    >
                      <Sparkles size={13} className="text-amber-600" />
                      <span>Mizan PRO&apos;ya Geç (₺149/ay)</span>
                      <ArrowRight size={13} />
                    </Link>

                    <Link
                      href="/companies/BIMAS"
                      className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition backdrop-blur-xs border border-white/20"
                    >
                      Örnek Analiz: BIMAS AI Raporunu Gör
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </PaynoShell>
  );
}
