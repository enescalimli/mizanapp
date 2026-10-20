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
      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex gap-0.5 p-0.5 border border-slate-200">
        {items.map((item) => {
          const colorClass =
            item.status === "COMPLIANT"
              ? "bg-emerald-500 hover:bg-emerald-600"
              : item.status === "AT_RISK"
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-rose-500 hover:bg-rose-600";

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
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-500">
        {items.map((item) => (
          <div
            key={item.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.status === "COMPLIANT"
                  ? "bg-emerald-500"
                  : item.status === "AT_RISK"
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            />
            <span className="font-semibold text-slate-900">{item.ticker}</span>
            <span className="text-slate-500 tabular-nums">
              %{item.weightPercent.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
