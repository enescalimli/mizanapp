"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Clock,
  Flame,
} from "lucide-react";
import { ComplianceAlertItem, ScreeningStandardCode } from "@/types/katilim";
import { formatTRY } from "@/lib/decimal/decimal";
import { SmartAlternativeCard } from "@/components/SmartAlternativeCard";

interface ComplianceAlertWidgetProps {
  alerts: ComplianceAlertItem[];
  standard: ScreeningStandardCode;
  onSwapHolding?: (
    holdingId: string,
    targetTicker: string,
    equivalentLots: string,
    targetPriceTRY: string
  ) => void;
}

export const ComplianceAlertWidget: React.FC<ComplianceAlertWidgetProps> = ({
  alerts,
  standard,
  onSwapHolding,
}) => {
  const [expandedAlertIds, setExpandedAlertIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedAlertIds((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const standardLabel =
    standard === "BIST_KATILIM_DIB"
      ? "BIST Katılım (DİB/TKBB <%33 Borç/Nakit, <%5 Gelir)"
      : "AAOIFI Std No. 21 (<%30 Borç/Nakit, <%5 Gelir)";

  // All compliant state
  if (alerts.length === 0) {
    return (
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <span>PORTFÖY UYGUNLUK KALKANI AKTİF</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-100 mt-1">
              Portföyünüzdeki Tüm Varlıklar Katılım Kriterlerine Uygundur
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Seçili Standart: <strong className="text-slate-200">{standardLabel}</strong> • Hiçbir hissenizde bilanço eşik ihlali bulunmamaktadır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter(
    (a) => a.alertType === "EXITED_COMPLIANCE"
  ).length;
  const warningCount = alerts.filter(
    (a) => a.alertType === "GRACE_PERIOD_WARNING"
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Alert Summary Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/40 p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
              <AlertOctagon size={26} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <Flame size={12} />
                  Katılımdan Çıkma & Eşik İhlali Alarm Paneli
                </span>
                <span className="text-xs text-slate-400">
                  Bilanço Dönemi: <strong className="text-slate-200">2026-Q2</strong>
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1.5">
                Portföyünüzde {criticalCount > 0 ? `${criticalCount} Katılımdan Çıkan (Uygunsuz)` : ""}
                {criticalCount > 0 && warningCount > 0 ? " ve " : ""}
                {warningCount > 0 ? `${warningCount} Tampon Bölgede (Hoşgörü Süresinde)` : ""} Hisse Tespit Edildi!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Aşağıdaki hisseler son bilanço döneminde{" "}
                <strong className="text-rose-300">{standardLabel}</strong> rasyolarını ihlal etmiştir.
                Birikmiş şüpheli gelirleri arındırabilir ve aynı sektördeki{" "}
                <strong className="text-emerald-400">%100 Katılım Uygun</strong> alternatiflerle tek tıkla ikame edebilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {criticalCount > 0 && (
              <div className="px-4 py-2.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-center">
                <span className="text-[10px] uppercase tracking-wider text-rose-300 font-bold block">
                  Kapsam Dışı
                </span>
                <span className="text-lg font-black text-rose-400">
                  {criticalCount} Hisse
                </span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="px-4 py-2.5 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-center">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                  Hoşgörüde
                </span>
                <span className="text-lg font-black text-amber-400">
                  {warningCount} Hisse
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Alert Cards + Embedded SmartAlternativeCard */}
      <div className="space-y-5">
        {alerts.map((alert) => {
          const isCritical = alert.alertType === "EXITED_COMPLIANCE";
          const isExpanded =
            expandedAlertIds[alert.holdingId] === undefined
              ? true
              : expandedAlertIds[alert.holdingId];

          return (
            <div
              key={alert.holdingId}
              className={`rounded-3xl border shadow-xl overflow-hidden transition-all ${
                isCritical
                  ? "bg-slate-900/95 border-rose-500/40"
                  : "bg-slate-900/95 border-amber-500/40"
              }`}
            >
              {/* Alert Card Top Bar */}
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                        isCritical
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {isCritical ? (
                        <AlertOctagon size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}
                      <span>
                        {isCritical
                          ? "KATILIMDAN ÇIKTI (UYGUN DEĞİL)"
                          : `HOŞGÖRÜ SÜRESİNDE (${alert.consecutiveBreachQuarters}/${alert.maxGraceQuarters} Çeyrek)`}
                      </span>
                    </span>

                    <Link
                      href={`/companies/${alert.ticker}`}
                      className="text-xl font-black text-white hover:text-emerald-400 transition flex items-center gap-1"
                    >
                      <span>{alert.ticker}</span>
                      <ArrowUpRight size={16} className="text-slate-400" />
                    </Link>

                    <span className="text-sm font-semibold text-slate-300">
                      {alert.companyName}
                    </span>

                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {alert.sector}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {alert.reasonText}
                  </p>

                  {/* Breached Metrics Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {alert.breachedMetrics.map((bm, idx) => (
                      <div
                        key={idx}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border ${
                          bm.severity === "CRITICAL"
                            ? "bg-rose-950/60 border-rose-500/30 text-rose-200"
                            : "bg-amber-950/60 border-amber-500/30 text-amber-200"
                        }`}
                      >
                        <span className="font-sans font-semibold text-slate-300">
                          {bm.metricName}:
                        </span>
                        <strong
                          className={
                            bm.severity === "CRITICAL"
                              ? "text-rose-400"
                              : "text-amber-400"
                          }
                        >
                          {bm.currentValuePercent}
                        </strong>
                        <span className="text-slate-400">
                          (Limit: {bm.thresholdPercent})
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            bm.severity === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {bm.excessPercent}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Metrics & Toggle */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">
                      Pozisyon Değeri
                    </span>
                    <span className="text-sm font-bold text-slate-100 font-mono">
                      {formatTRY(alert.positionMarketValueTRY, 2)}
                    </span>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 uppercase block">
                      Birikmiş Arındırma
                    </span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {formatTRY(alert.accruedPurificationTRY, 2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(alert.holdingId)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    <span>Yerine Hangi Hisse?</span>
                    {isExpanded ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Guidance Bar */}
              <div className="px-6 py-2.5 bg-slate-950/90 border-t border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock size={14} className="text-amber-400 shrink-0" />
                  <span>
                    <strong>Fıkhi Aksiyon Rehberi:</strong> {alert.actionRequiredText}
                  </span>
                </div>
                <Link
                  href={`/companies/${alert.ticker}`}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold shrink-0"
                >
                  Dipnot X-Ray Raporunu İncele &rarr;
                </Link>
              </div>

              {/* Embedded SmartAlternativeCard right below the non-compliant stock */}
              {isExpanded && (
                <div className="p-4 sm:p-6 bg-slate-950/50">
                  <SmartAlternativeCard
                    sourceTicker={alert.ticker}
                    sourceCompanyName={alert.companyName}
                    sourceSector={alert.sector}
                    sourceDebtRatioPercent={
                      parseFloat(
                        alert.breachedMetrics[0]?.currentValuePercent.replace(
                          "%",
                          ""
                        ) || "35"
                      ) || 35
                    }
                    sourceMarketValueTRY={alert.positionMarketValueTRY}
                    alternatives={alert.alternatives}
                    onSwapPosition={
                      onSwapHolding
                        ? (targetTicker, eqLots, targetPriceTRY) =>
                            onSwapHolding(
                              alert.holdingId,
                              targetTicker,
                              eqLots,
                              targetPriceTRY
                            )
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
