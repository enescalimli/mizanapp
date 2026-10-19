"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { SmartAlternativeStock } from "@/types/katilim";
import {
  formatTRY,
  calculateEquivalentLotsForSwap,
} from "@/lib/decimal/decimal";

interface SmartAlternativeCardProps {
  sourceTicker: string;
  sourceCompanyName: string;
  sourceSector: string;
  sourceDebtRatioPercent: number;
  sourceMarketValueTRY: string;
  alternatives: SmartAlternativeStock[];
  onSwapPosition?: (
    targetTicker: string,
    equivalentLots: string,
    targetPriceTRY: string
  ) => void;
  compact?: boolean;
}

export const SmartAlternativeCard: React.FC<SmartAlternativeCardProps> = ({
  sourceTicker,
  sourceCompanyName,
  sourceSector,
  sourceDebtRatioPercent,
  sourceMarketValueTRY,
  alternatives,
  onSwapPosition,
  compact = false,
}) => {
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl bg-white/[0.02] border border-emerald-500/25 shadow-xl backdrop-blur-xl overflow-hidden ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                Akıllı İkame Motoru
              </span>
              <span className="text-xs text-slate-400 font-normal">
                Sektör: <strong className="text-slate-200">{sourceSector}</strong>
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-100 mt-1 tracking-tight">
              <span className="text-rose-400 font-mono">{sourceTicker}</span> ({sourceCompanyName}) yerine aynı sektörde{" "}
              <span className="text-emerald-400">%100 Katılım Uygun</span> alternatifler
            </h4>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.07] shrink-0 font-mono tabular-nums">
          Pozisyon Değeri:{" "}
          <strong className="text-slate-100">
            {formatTRY(sourceMarketValueTRY, 2)}
          </strong>
        </div>
      </div>

      {/* Alternatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {alternatives.map((alt) => {
          const eqLots = calculateEquivalentLotsForSwap(
            sourceMarketValueTRY,
            alt.priceTRY
          );
          const isPositiveChange = alt.change24h.startsWith("+");

          return (
            <div
              key={alt.ticker}
              className="group apple-card p-4 flex flex-col justify-between transition-all duration-200 hover:border-emerald-500/40"
            >
              <div>
                {/* Top Row: Ticker & Compliance Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/companies/${alt.ticker}`}
                        className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono"
                      >
                        <span>{alt.ticker}</span>
                        <ExternalLink
                          size={11}
                          className="opacity-50 group-hover:opacity-100"
                        />
                      </Link>
                      <span className="badge-apple-emerald text-[9px]">
                        <CheckCircle2 size={10} />
                        %100 UYGUN
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-normal">
                      {alt.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-100 font-mono tabular-nums">
                      {formatTRY(alt.priceTRY, 2)}
                    </div>
                    <span
                      className={`text-[11px] font-semibold font-mono tabular-nums ${
                        isPositiveChange ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {alt.change24h}
                    </span>
                  </div>
                </div>

                {/* Advantage Note */}
                <p className="text-[11px] text-slate-300 bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5 mt-3 leading-relaxed font-normal">
                  {alt.complianceAdvantageNote}
                </p>

                {/* Ratio Comparison Pills */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 text-center">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Faizli Borç
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                      %{alt.debtRatioPercent.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      ({sourceTicker}: %{sourceDebtRatioPercent.toFixed(1)})
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Faizli Nakit
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                      %{alt.cashRatioPercent.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      &lt;%33
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Uygunsuz Gelir
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                      %{alt.impureIncomePercent.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      &lt;%5
                    </span>
                  </div>
                </div>
              </div>

              {/* Swap CTA Button */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400">
                  Eşdeğer:{" "}
                  <strong className="text-emerald-300 font-mono tabular-nums">
                    {eqLots} Lot
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/companies/${alt.ticker}`}
                    className="apple-btn-secondary text-xs py-1 px-2.5 rounded-lg"
                  >
                    X-Ray
                  </Link>

                  {onSwapPosition && (
                    <button
                      type="button"
                      onClick={() =>
                        onSwapPosition(alt.ticker, eqLots, alt.priceTRY)
                      }
                      className="apple-btn-primary text-xs py-1 px-3"
                    >
                      <ArrowRightLeft size={12} />
                      <span>İkame Et</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
