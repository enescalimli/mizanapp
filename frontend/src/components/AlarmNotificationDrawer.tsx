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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                <BellRing size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Katılım Alarm Merkezi</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                    {totalAlertsCount} Bildirim
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  Katılımdan çıkan veya çıkma riski taşıyan hisseleriniz
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Apple Segmented Control */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("BREACHED")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === "BREACHED"
                  ? "bg-white text-rose-800 border border-rose-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
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
                  ? "bg-white text-amber-800 border border-amber-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
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
                <div className="text-center py-12 text-xs text-slate-500 space-y-2">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                  <p className="font-bold text-slate-800">
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
                    className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900 font-mono">
                            {b.ticker}
                          </span>
                          <span className="badge-apple-rose">
                            KATILIMDAN ÇIKTI
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-normal">
                          {b.companyName} &bull; {b.sector}
                        </span>
                      </div>
                      <div className="text-right font-mono text-xs text-slate-700 font-semibold tabular-nums">
                        Pozisyon: {formatTRY(b.positionMarketValueTRY, 0)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-rose-100 leading-relaxed font-normal shadow-2xs">
                      {b.reasonText}
                    </p>

                    {/* Breached Metrics Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {b.breachedMetrics.map((bm, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-rose-100 text-rose-800 border border-rose-200"
                        >
                          {bm.metricName}: {bm.currentValuePercent} ({bm.excessPercent})
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between text-xs">
                      <span className="text-amber-700 font-mono font-bold tabular-nums">
                        Arındırma: {formatTRY(b.accruedPurificationTRY, 2)}
                      </span>
                      <Link
                        href={`/companies/${b.ticker}`}
                        onClick={onClose}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                      >
                        <span>Katılım Detayı</span>
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
                <div className="text-center py-12 text-xs text-slate-500 space-y-2">
                  <ShieldCheck size={32} className="mx-auto text-emerald-600" />
                  <p className="font-bold text-slate-800">
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
                    className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900 font-mono">
                            {r.ticker}
                          </span>
                          <span className="badge-apple-amber">
                            ÇIKMA İHTİMALİ
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-normal">
                          Eşiğe Kalan Marj:{" "}
                          <strong className="text-amber-800 font-mono tabular-nums">
                            %{r.debtMarginPercent.toFixed(1)}
                          </strong>
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-800 tabular-nums">
                        Borç: %{r.debtRatioPercent.toFixed(1)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-amber-100 leading-relaxed font-normal shadow-2xs">
                      {r.explanation}
                    </p>

                    <div className="text-[11px] text-amber-900 font-medium">
                      💡 <strong>Tavsiye:</strong> {r.actionRecommendation}
                    </div>

                    <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Limit: &lt;%{r.debtThresholdPercent}
                      </span>
                      <Link
                        href={`/companies/${r.ticker}`}
                        onClick={onClose}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
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
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-center text-slate-500 font-mono">
          TKBB &amp; DİB Otomatik Bilanço Takip Sistemi
        </div>
      </div>
    </div>
  );
};
