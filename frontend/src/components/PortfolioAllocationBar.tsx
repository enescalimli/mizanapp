"use client";

import React from "react";
import { formatTRY } from "@/lib/decimal/decimal";

export interface AllocationBarItem {
  id: string;
  ticker: string;
  companyName: string;
  weightPercent: number; // e.g. 35.5
  marketValueTRY: string;
  status: "COMPLIANT" | "AT_RISK" | "BREACHED";
}

interface PortfolioAllocationBarProps {
  items: AllocationBarItem[];
  totalMarketValueTRY: string;
}

export const PortfolioAllocationBar: React.FC<PortfolioAllocationBarProps> = ({
  items,
  totalMarketValueTRY,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Portföy Ağırlık Spektrumu
        </span>
        <span className="text-[11px] font-mono text-slate-400 tabular-nums">
          {items.length} Pozisyon &bull; {formatTRY(totalMarketValueTRY, 0)}
        </span>
      </div>

      {/* Segmented Proportional Stream Bar */}
      <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden flex gap-0.5 p-0.5 border border-white/[0.06]">
        {items.map((item) => {
          const colorClass =
            item.status === "COMPLIANT"
              ? "bg-emerald-500/80 hover:bg-emerald-400"
              : item.status === "AT_RISK"
              ? "bg-amber-400/80 hover:bg-amber-300"
              : "bg-rose-400/80 hover:bg-rose-300";

          return (
            <div
              key={item.id}
              style={{ width: `${Math.max(item.weightPercent, 2)}%` }}
              className={`h-full rounded-sm transition-all duration-200 cursor-pointer ${colorClass}`}
              title={`${item.ticker}: %${item.weightPercent.toFixed(1)} (${formatTRY(
                item.marketValueTRY,
                0
              )})`}
            />
          );
        })}
      </div>

      {/* Ticker Weight Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
        {items.map((item) => (
          <div
            key={item.id}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.status === "COMPLIANT"
                  ? "bg-emerald-400"
                  : item.status === "AT_RISK"
                  ? "bg-amber-400"
                  : "bg-rose-400"
              }`}
            />
            <span className="font-semibold text-slate-200">{item.ticker}</span>
            <span className="text-slate-400 tabular-nums">
              %{item.weightPercent.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
