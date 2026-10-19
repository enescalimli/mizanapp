"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  BellRing,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRightLeft,
} from "lucide-react";
import { ComplianceAlertItem, KatilimRiskAssessment } from "@/types/katilim";
import { formatTRY } from "@/lib/decimal/decimal";

interface AlarmNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  breachedAlerts: ComplianceAlertItem[]; // Katılımdan çıkanlar
  atRiskAlerts: KatilimRiskAssessment[]; // Çıkma ihtimali olanlar (Riskli eşikte)
  onSelectAlternativeSwap?: (
    sourceTicker: string,
    targetTicker: string,
    eqLots: string,
    targetPriceTRY: string
  ) => void;
}

export const AlarmNotificationDrawer: React.FC<AlarmNotificationDrawerProps> = ({
  isOpen,
  onClose,
  breachedAlerts,
  atRiskAlerts,
  onSelectAlternativeSwap,
}) => {
  const [activeTab, setActiveTab] = useState<"BREACHED" | "AT_RISK">("BREACHED");

  if (!isOpen) return null;

  const totalAlertsCount = breachedAlerts.length + atRiskAlerts.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-full bg-[#080d1a] border-l border-white/[0.08] shadow-apple-elevated flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                <BellRing size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Katılım Alarm Merkezi</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono">
                    {totalAlertsCount} Bildirim
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-normal">
                  Katılımdan çıkan veya çıkma riski taşıyan hisseleriniz
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Apple Segmented Control */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07]">
            <button
              type="button"
              onClick={() => setActiveTab("BREACHED")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === "BREACHED"
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <AlertOctagon size={13} />
              <span>Katılımdan Çıkanlar ({breachedAlerts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("AT_RISK")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === "AT_RISK"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <AlertTriangle size={13} />
              <span>Çıkma İhtimali ({atRiskAlerts.length})</span>
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "BREACHED" && (
            <div className="space-y-4">
              {breachedAlerts.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 space-y-2">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                  <p className="font-bold text-slate-200">
                    Portföyünüzde katılımdan çıkan hisse bulunmuyor.
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Tüm varlıklarınız son bilanço döneminde katılım kriterlerini karşılamaktadır.
                  </p>
                </div>
              ) : (
                breachedAlerts.map((b) => (
                  <div
                    key={b.holdingId}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-rose-500/25 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white font-mono">
                            {b.ticker}
                          </span>
                          <span className="badge-apple-rose">
                            KATILIMDAN ÇIKTI
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-normal">
                          {b.companyName} &bull; {b.sector}
                        </span>
                      </div>
                      <div className="text-right font-mono text-xs text-slate-300 tabular-nums">
                        Pozisyon: {formatTRY(b.positionMarketValueTRY, 0)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.06] leading-relaxed font-normal">
                      {b.reasonText}
                    </p>

                    {/* Breached Metrics Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {b.breachedMetrics.map((bm, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        >
                          {bm.metricName}: {bm.currentValuePercent} ({bm.excessPercent})
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-mono tabular-nums">
                        Arındırma: {formatTRY(b.accruedPurificationTRY, 2)}
                      </span>
                      <Link
                        href={`/companies/${b.ticker}`}
                        onClick={onClose}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
                      >
                        <span>X-Ray İncele</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "AT_RISK" && (
            <div className="space-y-4">
              {atRiskAlerts.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 space-y-2">
                  <ShieldCheck size={32} className="mx-auto text-emerald-400" />
                  <p className="font-bold text-slate-200">
                    Sınırda veya çıkma riski taşıyan hisseniz yok.
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Tüm şirketler %33 / %30 sınırlarına güvenli mesafede faaliyet göstermektedir.
                  </p>
                </div>
              ) : (
                atRiskAlerts.map((r) => (
                  <div
                    key={r.ticker}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-amber-500/25 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white font-mono">
                            {r.ticker}
                          </span>
                          <span className="badge-apple-amber">
                            ÇIKMA İHTİMALİ
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-normal">
                          Eşiğe Kalan Marj:{" "}
                          <strong className="text-amber-300 font-mono tabular-nums">
                            %{r.debtMarginPercent.toFixed(1)}
                          </strong>
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300 tabular-nums">
                        Borç: %{r.debtRatioPercent.toFixed(1)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.06] leading-relaxed font-normal">
                      {r.explanation}
                    </p>

                    <div className="text-[11px] text-amber-300/90 font-medium">
                      💡 <strong>Tavsiye:</strong> {r.actionRecommendation}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Limit: &lt;%{r.debtThresholdPercent}
                      </span>
                      <Link
                        href={`/companies/${r.ticker}`}
                        onClick={onClose}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
                      >
                        <span>Rasyo Detayı</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/[0.07] bg-white/[0.01] text-xs text-center text-slate-400 font-mono">
          TKBB &amp; AAOIFI No. 21 Otomatik Bilanço Takip Sistemi
        </div>
      </div>
    </div>
  );
};
