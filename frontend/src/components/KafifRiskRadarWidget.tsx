"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, ArrowRight, ShieldCheck, Scale, Info } from "lucide-react";
import { SAMPLE_COMPANIES_SUMMARY } from "@/lib/data/sampleCompanies";
import { BIST_COMPREHENSIVE_UNIVERSE } from "@/lib/data/bistUniverse";

export interface BorderlineRiskStock {
  ticker: string;
  name: string;
  sector: string;
  priceTRY: string;
  change24h: string;
  riskType: "DEBT_RISK" | "CASH_RISK" | "INCOME_RISK";
  metricLabel: string;
  currentValue: number;
  thresholdValue: number;
  safetyMargin: number;
  ratioString: string;
}

interface KafifRiskRadarWidgetProps {
  portfolioTickers?: string[];
  mode?: "compact" | "full" | "banner";
  className?: string;
}

export function KafifRiskRadarWidget({
  portfolioTickers,
  mode = "full",
  className = "",
}: KafifRiskRadarWidgetProps) {
  // Borderline şirketleri tespit et
  const borderlineStocks = useMemo(() => {
    // Tarama evreni
    const universe = SAMPLE_COMPANIES_SUMMARY.concat(
      BIST_COMPREHENSIVE_UNIVERSE.filter(
        (u) => !SAMPLE_COMPANIES_SUMMARY.some((s) => s.ticker === u.ticker)
      )
    );

    const candidates = portfolioTickers
      ? universe.filter((c) => portfolioTickers.includes(c.ticker))
      : universe;

    const results: BorderlineRiskStock[] = [];

    for (const stock of candidates) {
      // Yalnızca şu an Katılım Endeksi'nde (COMPLIANT) olan ama sınıra çok yaklaşanlar
      if (stock.bistStatus !== "COMPLIANT") continue;

      const debt = stock.debtRatioPercent || 0;
      const cash = stock.cashRatioPercent || 0;
      const income = stock.impureIncomePercent || 0;

      // 1. Faizli Borç Riski: %30.00 - %33.00
      if (debt >= 30.0 && debt <= 33.0) {
        results.push({
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          priceTRY: stock.priceTRY || "0.00",
          change24h: stock.change24h || "0.00%",
          riskType: "DEBT_RISK",
          metricLabel: "Faizli Borç / Piyasa Değeri",
          currentValue: debt,
          thresholdValue: 33.0,
          safetyMargin: Number((33.0 - debt).toFixed(2)),
          ratioString: `%${debt.toFixed(2)}`,
        });
        continue;
      }

      // 2. Faizli Nakit/Mevduat Riski: %30.00 - %33.00
      if (cash >= 30.0 && cash <= 33.0) {
        results.push({
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          priceTRY: stock.priceTRY || "0.00",
          change24h: stock.change24h || "0.00%",
          riskType: "CASH_RISK",
          metricLabel: "Faiz Getiren Varlık / Piyasa Değeri",
          currentValue: cash,
          thresholdValue: 33.0,
          safetyMargin: Number((33.0 - cash).toFixed(2)),
          ratioString: `%${cash.toFixed(2)}`,
        });
        continue;
      }

      // 3. Mahzurlu / Uygunsuz Gelir Riski: %4.00 - %5.00
      if (income >= 4.0 && income <= 5.0) {
        results.push({
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          priceTRY: stock.priceTRY || "0.00",
          change24h: stock.change24h || "0.00%",
          riskType: "INCOME_RISK",
          metricLabel: "Mahzurlu / Faiz Geliri / Hasılat",
          currentValue: income,
          thresholdValue: 5.0,
          safetyMargin: Number((5.0 - income).toFixed(2)),
          ratioString: `%${income.toFixed(2)}`,
        });
        continue;
      }
    }

    return results;
  }, [portfolioTickers]);

  // Portföy modunda ve riskli hisse yoksa
  if (portfolioTickers && borderlineStocks.length === 0) {
    if (mode === "banner") return null;
    return (
      <div className={`p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-xl flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>KAFİF Risk Radarı: Tam Güvenli Bölge</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                {portfolioTickers.length} Varlık Taraması
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Portföyünüzdeki hiçbir hisse KAFİF kritik tolerans bandına (%30-%33 borç/nakit, %4-%5 mahzurlu gelir) girmiyor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Banner Modu (Kompakt Alert)
  if (mode === "banner" && borderlineStocks.length > 0) {
    return (
      <div className={`p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={15} />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <span>KAFİF Erken Uyarı Uyarısı</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                {borderlineStocks.length} Sınır Hisse
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/70">
              {borderlineStocks.map((s) => s.ticker).join(", ")} hisseleri endeks eşik sınırına yaklaşıyor.
            </p>
          </div>
        </div>
        <Link
          href="/tarayici?tab=radar"
          className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          <span>İncele</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    );
  }

  // Full & Compact Modu (Kapsamlı Bento Kartı)
  return (
    <div className={`rounded-2xl p-4 sm:p-5 bg-white/80 dark:bg-[#0E1015] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4 transition-colors ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#182542] dark:text-white">
                KAFİF Erken Uyarı Risk Radarı
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                {borderlineStocks.length} Şirket Risk Bandında
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Katılım Endeksi azami sınırlarına yaklaşan ve gelecek bilanço revizyonunda endeks dışı kalma riski taşıyan hisseler.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
          Kritik Aralık: %30-%33 Borç/Nakit | %4-%5 Mahzurlu
        </div>
      </div>

      {/* Grid of Borderline Stocks */}
      {borderlineStocks.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Şu an fıkhi tolerans sınırına giren şirket tespit edilmedi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {borderlineStocks.map((stock) => {
            const pct = Math.min(
              100,
              Math.max(0, (stock.currentValue / stock.thresholdValue) * 100)
            );

            return (
              <div
                key={stock.ticker}
                className="rounded-xl p-3.5 bg-slate-50/70 dark:bg-white/5 border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/companies/${stock.ticker}`}
                        className="font-bold text-sm text-[#182542] dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                      >
                        {stock.ticker}
                      </Link>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                        Tolerans Bandı
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {stock.name}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-white block">
                      ₺{stock.priceTRY}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        stock.change24h.startsWith("+")
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {stock.change24h}
                    </span>
                  </div>
                </div>

                {/* Metric Detail */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                      <Scale size={12} className="text-amber-500" />
                      {stock.metricLabel}
                    </span>
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400">
                      {stock.ratioString} / %{stock.thresholdValue.toFixed(2)}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="relative w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Kalan Güvenlik Marjı: +%{stock.safetyMargin.toFixed(2)}</span>
                    <Link
                      href={`/companies/${stock.ticker}`}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-sans font-semibold"
                    >
                      <span>Röntgen</span>
                      <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
