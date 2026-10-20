"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ComplianceBadge } from "@/components/ComplianceBadge";
import { RatioProgressBar } from "@/components/RatioProgressBar";
import { PurificationCalculatorCard } from "@/components/PurificationCalculatorCard";
import { SmartAlternativeCard } from "@/components/SmartAlternativeCard";
import { getSmartAlternativesForTicker } from "@/lib/data/sampleCompanies";
import { CompanyDetailScreening, ScreeningStandardCode } from "@/types/katilim";
import { formatTRY } from "@/lib/decimal/decimal";
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
} from "lucide-react";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params?.ticker as string)?.toUpperCase() || "BIMAS";

  const [standard, setStandard] = useState<ScreeningStandardCode>("BIST_KATILIM_DIB");
  const [data, setData] = useState<CompanyDetailScreening | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addedToPortfolio, setAddedToPortfolio] = useState(false);

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
    setAddedToPortfolio(true);
    setTimeout(() => {
      router.push("/portfolio");
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {ticker} Katılım ve Fıkhi Verileri Yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-slate-200 shadow-sm">
          <HelpCircle size={36} className="mx-auto text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Şirket Bulunamadı</h2>
          <p className="text-xs text-slate-500 font-normal">
            &quot;{ticker}&quot; kodlu şirket için henüz fıkhi tarama kaydı girilmemiştir.
          </p>
          <Link
            href="/"
            className="fintech-btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
          >
            <ArrowLeft size={13} />
            <span>Katılım Taramasına Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const isBist = standard === "BIST_KATILIM_DIB";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 font-medium">
              <ArrowLeft size={13} />
              <span>Katılım Endeksi</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span>Şirketler</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold font-mono">{ticker}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToPortfolio}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle size={13} />
              <span>{addedToPortfolio ? "Eklendi!" : "Portföye Ekle"}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Share2 size={12} />
              <span>{copied ? "Kopyalandı!" : "Paylaş"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Company Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Title & Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-xl font-mono tabular-nums shadow-xs">
                {ticker}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {data.companyName}
                  </h1>
                  <ComplianceBadge status={data.overallStatus} size="lg" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-normal">
                  <span className="flex items-center gap-1">
                    <Building2 size={13} className="text-slate-400" />
                    {data.sector} &bull; {data.subSector}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-mono tabular-nums">
                    <Calendar size={13} className="text-slate-400" />
                    {data.fiscalPeriod} Bilanço &bull; Değerleme: {data.valuationDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setStandard("BIST_KATILIM_DIB")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isBist
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                BIST Katılım (&lt;%33)
              </button>
              <button
                onClick={() => setStandard("AAOIFI_STD_21")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  !isBist
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                AAOIFI No.21 (&lt;%30)
              </button>
            </div>
          </div>

          {/* Grace Period Alert Banner */}
          {data.gracePeriodInfo.isInGracePeriod && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold text-amber-900 block mb-0.5">
                  Hoşgörü Süresi Devrede ({data.gracePeriodInfo.consecutiveBreachQuarters}/{data.gracePeriodInfo.maxAllowedQuarters} Çeyrek)
                </span>
                <p className="font-normal leading-relaxed text-amber-800">
                  {data.gracePeriodInfo.notes.join(" ")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3 Core Ratio Progress Bars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600" />
              Finansal Oran (Rasyo) Denetimi
            </h2>
            <span className="text-xs text-slate-500 font-normal">
              Payda Kuralı: <strong className="text-slate-900 font-mono tabular-nums">{data.ratios.denominatorRuleUsed}</strong> ({formatTRY(data.ratios.denominatorValueTRY, 0)})
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

        {/* Smart Alternative Card when company is non-compliant or in grace period */}
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

        {/* Reference Metrics Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
              Piyasa Değeri
            </span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
              {formatTRY(data.ratios.spotMarketCapTRY, 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
              Toplam Aktifler
            </span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
              {formatTRY(data.ratios.totalAssetsTRY, 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
              Hisse Başı Arındırma
            </span>
            <span className="font-mono tabular-nums font-bold text-emerald-700 text-sm">
              {data.purificationMetrics.purificationPerShareQuarterTRY} ₺
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
              Hisse Başı Zekat Matrahı
            </span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
              {data.purificationMetrics.zatableNetCurrentAssetsPerShareTRY} ₺
            </span>
          </div>
        </div>

        {/* Embedded Purification & Zakat Calculator Card */}
        <PurificationCalculatorCard
          ticker={ticker}
          purificationPerShareTRY={data.purificationMetrics.purificationPerShareQuarterTRY}
          dividendPurificationRatio={data.purificationMetrics.dividendPurificationRatio}
          impureIncomeQuarterTRY={data.purificationMetrics.impureIncomeIsolatedQuarterTRY}
          totalSharesOutstanding={data.purificationMetrics.totalSharesOutstanding}
          zatableNetAssetsPerShareTRY={data.purificationMetrics.zatableNetCurrentAssetsPerShareTRY}
        />
      </div>
    </main>
  );
}
