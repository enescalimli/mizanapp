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
} from "lucide-react";

type CompanyDetailTab = "FIKIH" | "FINANSALLAR" | "CARPANLAR" | "AI_ANALIZ";

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

  // Check if user is PRO or if this is the sample free stock (BIMAS)
  const isSampleFreeStock = ticker === "BIMAS";
  const [isProUser, setIsProUser] = useState(false);

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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#182542] to-[#273869] text-white flex items-center justify-center font-extrabold text-lg font-mono tabular-nums shadow-sm shrink-0">
                {ticker}
              </div>
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

            {/* Standard Switcher (BIST Katılım DİB vs AAOIFI) */}
            <div className="flex items-center bg-[#EBEEF2]/90 p-1 rounded-2xl border border-white/80 shadow-2xs shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStandard("BIST_KATILIM_DIB")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  isBist
                    ? "bg-white text-[#182542] shadow-xs"
                    : "text-[#6E81A0] hover:text-[#182542]"
                }`}
              >
                DİB / BIST Katılım (&lt;%33)
              </button>
              <button
                type="button"
                onClick={() => setStandard("AAOIFI_STD_21")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  !isBist
                    ? "bg-white text-[#182542] shadow-xs"
                    : "text-[#6E81A0] hover:text-[#182542]"
                }`}
              >
                AAOIFI No.21 (&lt;%30)
              </button>
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
        {/* INTERACTIVE NAVIGATION TABS: Fıkıh, Finansallar, Çarpanlar, AI      */}
        {/* =================================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "FIKIH", label: "Fıkhi Katılım Analizi", icon: Scale },
            { id: "FINANSALLAR", label: "Özet Finansallar (Fintables)", icon: FileSpreadsheet },
            { id: "CARPANLAR", label: "Piyasa Çarpanları & Rasyolar", icon: BarChart3 },
            { id: "AI_ANALIZ", label: "Mizan AI Fıkhi Raporu", icon: Sparkles, badge: isSampleFreeStock ? "Açık Demo" : "PRO" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as CompanyDetailTab)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                  isActive
                    ? "bg-[#182542] text-white shadow-md shadow-[#182542]/20 scale-100"
                    : "bg-white/80 hover:bg-white text-[#6E81A0] hover:text-[#182542] border border-white/90 shadow-2xs"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                    isActive ? "bg-amber-400 text-slate-900" : "bg-amber-100 text-amber-800"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
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
        {/* TAB 2: ÖZET FİNANSALLAR (Fintables Inspired Grid)                   */}
        {/* =================================================================== */}
        {activeTab === "FINANSALLAR" && fin && (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6">
            <div className="flex items-center justify-between border-b border-[#EDF1F7] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#182542]">Özet Finansal Tablolar</h3>
                <p className="text-xs text-[#6E81A0]">Son açıklanan çeyreklik KAP mali tablolarına göre hesaplanmıştır.</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#182542] bg-slate-100 px-3 py-1 rounded-xl">
                Birim: TRY (₺)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gelir Tablosu Kalemleri */}
              <div className="p-5 rounded-2xl bg-white border border-[#EDF1F7] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold uppercase text-[#182542]">Gelir Tablosu Kalemleri</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Yıllık Değişim
                  </span>
                </div>
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

              {/* Bilanço Kalemleri */}
              <div className="p-5 rounded-2xl bg-white border border-[#EDF1F7] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold uppercase text-[#182542]">Bilanço Kalemleri</span>
                  <span className="text-[10px] font-bold text-[#182542] bg-slate-100 px-2 py-0.5 rounded-md">
                    Konsolide
                  </span>
                </div>
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
        {/* TAB 3: PİYASA ÇARPANLARI & RASYOLAR (Fintables Multipliers)         */}
        {/* =================================================================== */}
        {activeTab === "CARPANLAR" && fin && (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#182542]">Finansal Rasyolar ve Değerleme Çarpanları</h3>
              <p className="text-xs text-[#6E81A0]">Fiyat/Kazanç, Defter Değeri ve Kârlılık Marjları analizi.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] space-y-1">
                <span className="text-[10px] font-bold text-[#6E81A0] uppercase block">F/K (Fiyat / Kazanç)</span>
                <span className="text-lg font-mono font-extrabold text-[#182542]">{fin.peRatio}</span>
                <span className="text-[10px] text-slate-500 block">Sektör Ort: 8.4</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] space-y-1">
                <span className="text-[10px] font-bold text-[#6E81A0] uppercase block">PD/DD (Defter Değeri)</span>
                <span className="text-lg font-mono font-extrabold text-[#182542]">{fin.pbRatio}</span>
                <span className="text-[10px] text-slate-500 block">Özkaynak Çarpanı</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] space-y-1">
                <span className="text-[10px] font-bold text-[#6E81A0] uppercase block">FD / FAVÖK</span>
                <span className="text-lg font-mono font-extrabold text-[#182542]">{fin.evEbitda}</span>
                <span className="text-[10px] text-slate-500 block">Operasyonel Çarpan</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] space-y-1">
                <span className="text-[10px] font-bold text-[#6E81A0] uppercase block">Net Borç / FAVÖK</span>
                <span className="text-lg font-mono font-extrabold text-emerald-700">{fin.netDebtToEbitda}</span>
                <span className="text-[10px] text-emerald-800 block">Güvenli Kaldıraç</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] space-y-1">
                <span className="text-[10px] font-bold text-[#6E81A0] uppercase block">Brüt Kâr Marjı</span>
                <span className="text-lg font-mono font-extrabold text-[#182542]">{fin.grossMargin}</span>
                <span className="text-[10px] text-slate-500 block">Satış Kârlılığı</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] space-y-1">
                <span className="text-[10px] font-bold text-[#6E81A0] uppercase block">FAVÖK Marjı</span>
                <span className="text-lg font-mono font-extrabold text-emerald-700">{fin.ebitdaMargin}</span>
                <span className="text-[10px] text-slate-500 block">Esas Faaliyet Marjı</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] space-y-1">
                <span className="text-[10px] font-bold text-[#6E81A0] uppercase block">Özsermaye Kârlılığı (ROE)</span>
                <span className="text-lg font-mono font-extrabold text-[#182542]">{fin.roePercent}</span>
                <span className="text-[10px] text-slate-500 block">Yıllıklandırılmış</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] space-y-1">
                <span className="text-[10px] font-bold text-[#6E81A0] uppercase block">Aktif Kârlılığı (ROA)</span>
                <span className="text-lg font-mono font-extrabold text-[#182542]">{fin.roaPercent}</span>
                <span className="text-[10px] text-slate-500 block">Varlık Verimliliği</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: MİZAN AI ANALİZ MODÜLÜ (Freemium & PRO Paywall)              */}
        {/* =================================================================== */}
        {activeTab === "AI_ANALIZ" && ai && (
          <div className="space-y-6">
            
            {/* AI Header Card */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#182542]">Mizan AI &bull; Fıkhi ve Finansal Sağlık Raporu</h3>
                      {isSampleFreeStock && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Örnek Ücretsiz Rapor (BIMAS)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E81A0]">KAP bilanço dipnotları ve DİB/TKBB standartları algoritmik yapay zeka sentezi.</p>
                  </div>
                </div>

                {/* Score Capsule */}
                <div className="flex items-center gap-2 bg-[#182542] text-white px-4 py-2 rounded-2xl shadow-sm">
                  <span className="text-xs font-medium text-white/70">Mizan Skoru:</span>
                  <span className="font-mono font-extrabold text-base text-emerald-300">{ai.score} / 10</span>
                </div>
              </div>

              {/* Verdict Summary Callout */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#182542] leading-relaxed">
                {ai.verdict} &bull; {ai.shariahRiskSummary}
              </div>
            </div>

            {/* UNLOCKED FULL CONTENT (BIMAS or PRO user) */}
            {isUserPro ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Section 1: Financial Health */}
                <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/85 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] flex items-center gap-2">
                    <Activity size={14} className="text-indigo-600" />
                    <span>Finansal Büyüme &amp; Kârlılık Röntgeni</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {ai.financialHealthSummary}
                  </p>
                </div>

                {/* Section 2: Purification Note */}
                <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/85 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] flex items-center gap-2">
                    <Coins size={14} className="text-emerald-600" />
                    <span>Fıkhi Arındırma &amp; Temettü Yükü</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {ai.purificationZakatNote}
                  </p>
                </div>

                {/* Section 3: Pros */}
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

                {/* Section 4: Cons */}
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
            ) : (
              /* LOCKED PAYWALL FOR OTHER STOCKS WHEN ON FREE TIER */
              <div className="relative rounded-[28px] overflow-hidden border border-white/90 shadow-lg">
                {/* Blurred Background Preview */}
                <div className="p-8 space-y-4 filter blur-xs select-none pointer-events-none opacity-40 bg-white">
                  <h4 className="text-sm font-bold">Finansal Büyüme &amp; Kârlılık Röntgeni</h4>
                  <p className="text-xs leading-relaxed">
                    Şirketin 2026 yılı 3. çeyrek finansal tablolarında esas faaliyet kârlılığı güçlü bir ivme sergilemiş olup, faizli borç rasyolarındaki hareketlilik izlenmektedir...
                  </p>
                  <h4 className="text-sm font-bold">Fıkhi Arındırma &amp; Temettü Yükü</h4>
                  <p className="text-xs leading-relaxed">
                    Dağıtılacak kâr payında arındırılması gereken faiz geliri payı ve hisse başı zekât tutarları...
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
