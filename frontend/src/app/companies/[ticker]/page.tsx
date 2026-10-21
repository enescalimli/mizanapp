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
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mizan_user_holdings");
        let list: any[] = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(list) || list.length === 0) {
          list = [
            { id: "h-1", ticker: "BIMAS", lots: "300", avgCostTRY: "420.00", purchaseDate: "2024-05-15", purificationMethod: "holding", zakatIntent: "LONG_TERM_DIVIDEND" },
            { id: "h-2", ticker: "ASELS", lots: "1500", avgCostTRY: "58.00", purchaseDate: "2024-06-20", purificationMethod: "holding", zakatIntent: "LONG_TERM_DIVIDEND" },
            { id: "h-3", ticker: "FROTO", lots: "80", avgCostTRY: "910.00", purchaseDate: "2024-07-10", purificationMethod: "holding", zakatIntent: "LONG_TERM_DIVIDEND" },
            { id: "h-4", ticker: "THYAO", lots: "250", avgCostTRY: "290.00", purchaseDate: "2024-08-01", purificationMethod: "holding", zakatIntent: "TRADING_SHORT_TERM" },
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
            avgCostTRY: "100.00",
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
    <PaynoShell badge={ticker}>
      <div className="space-y-6">
        {/* Breadcrumb & Actions */}
        <div className="flex items-center justify-between text-xs text-[#6E81A0]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#273869] transition-colors flex items-center gap-1.5 font-bold">
              <ArrowLeft size={13} />
              <span>Hisse Tarayıcı (626)</span>
            </Link>
            <span className="text-[#94A3B8]">/</span>
            <span>Şirketler</span>
            <span className="text-[#94A3B8]">/</span>
            <span className="text-[#273869] font-extrabold font-mono">{ticker}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToPortfolio}
              className="px-3.5 py-2 rounded-full bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle size={13} />
              <span>{addedToPortfolio ? "Portföye Eklendi!" : "Portföye Ekle"}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-full bg-white/80 hover:bg-white text-[#273869] border border-[#E2EAF4] text-xs font-bold transition flex items-center gap-1.5 shadow-xs backdrop-blur-md"
            >
              <Share2 size={12} />
              <span>{copied ? "Kopyalandı!" : "Paylaş"}</span>
            </button>
          </div>
        </div>

        {/* Company Header Card */}
        <div className="apple-glass-card p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Title & Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#273869] to-[#182542] text-white flex items-center justify-center font-extrabold text-xl font-mono tabular-nums shadow-orbix-sm ring-1 ring-white/20">
                {ticker}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#273869] tracking-tight">
                    {data.companyName}
                  </h1>
                  <ComplianceBadge status={data.overallStatus} size="lg" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6E81A0] mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 size={13} className="text-[#273869]" />
                    {data.sector} &bull; {data.subSector}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-mono tabular-nums">
                    <Calendar size={13} className="text-[#273869]" />
                    {data.fiscalPeriod} Bilanço &bull; Değerleme: {data.valuationDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Switcher */}
            <div className="apple-segmented-group">
              <button
                onClick={() => setStandard("BIST_KATILIM_DIB")}
                className={`apple-segmented-item ${
                  isBist ? "active" : ""
                }`}
              >
                BIST Katılım (&lt;%33)
              </button>
              <button
                onClick={() => setStandard("AAOIFI_STD_21")}
                className={`apple-segmented-item ${
                  !isBist ? "active" : ""
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

        {/* Katılım Dışı / Kapsam Dışı Gerekçe Kartı */}
        {data.overallStatus !== "COMPLIANT" && (
          <div className="apple-glass-card p-6 border-l-4 border-l-[#F04438] space-y-2 bg-white/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C62E26]">
              <AlertTriangle size={16} />
              <span>Katılım Endeksi Kapsam Dışı Kalma Gerekçesi</span>
            </div>
            <p className="text-sm font-semibold text-[#182542] leading-relaxed">
              {data.ratios.interestDebt.isCompliant === false
                ? `Faizli Borç Oranı: ${data.ratios.interestDebt.ratioPercentage} (İzin verilen azami %${data.ratios.interestDebt.thresholdPercentage} eşiği aşılmıştır).`
                : data.ratios.interestCash.isCompliant === false
                ? `Faizli Varlık Oranı: ${data.ratios.interestCash.ratioPercentage} (İzin verilen azami %${data.ratios.interestCash.thresholdPercentage} eşiği aşılmıştır).`
                : data.ratios.impureIncome.isCompliant === false
                ? `Uygun Olmayan Gelir Oranı: ${data.ratios.impureIncome.ratioPercentage} (İzin verilen azami %5 eşiği aşılmıştır).`
                : data.prohibitedActivitiesFound && data.prohibitedActivitiesFound.length > 0
                ? `Faaliyet Alanı Engeli: ${data.prohibitedActivitiesFound.join(", ")} tespit edilmiştir.`
                : data.gracePeriodInfo?.notes?.length > 0
                ? data.gracePeriodInfo.notes.join(" ")
                : "Şirketin finansal tabloları veya ana faaliyet alanı Katılım Standartları kriterlerini karşılamamaktadır."}
            </p>
          </div>
        )}

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl apple-glass-card text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#6E81A0] tracking-wider block mb-1">
              Piyasa Değeri
            </span>
            <span className="font-mono tabular-nums font-bold text-[#273869] text-sm">
              {formatTRY(data.ratios.spotMarketCapTRY, 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#6E81A0] tracking-wider block mb-1">
              Toplam Aktifler
            </span>
            <span className="font-mono tabular-nums font-bold text-[#273869] text-sm">
              {formatTRY(data.ratios.totalAssetsTRY, 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#6E81A0] tracking-wider block mb-1">
              Faizli Borç Oranı
            </span>
            <span className={`font-mono tabular-nums font-bold text-sm ${data.ratios.interestDebt.isCompliant ? "text-[#0D8B52]" : "text-[#C62E26]"}`}>
              {data.ratios.interestDebt.ratioPercentage}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#6E81A0] tracking-wider block mb-1">
              Hisse Başı Zekat Matrahı
            </span>
            <span className="font-mono tabular-nums font-bold text-[#273869] text-sm">
              {data.purificationMetrics.zatableNetCurrentAssetsPerShareTRY} ₺
            </span>
          </div>
        </div>
      </div>
    </PaynoShell>
  );
}
