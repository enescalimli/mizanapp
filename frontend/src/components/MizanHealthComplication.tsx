"use client";

import React from "react";
import { SpotlightCard } from "./SpotlightCard";
import { ShieldCheck, AlertTriangle, ArrowUpRight } from "lucide-react";

interface MizanHealthComplicationProps {
  halalWeightPercent: number; // e.g. 75.0
  avgDebtRatioPercent: number; // e.g. 21.4
  debtThresholdPercent: number; // 33.0 or 30.0
  purificationRatioPercent: number; // e.g. 0.15
  totalMarketValueTRY: string;
  breachedCount: number;
  atRiskCount: number;
  standardName: string;
}

/**
 * Institutional "Mizan" Portfolio Health Complication.
 * Designed like a luxury Swiss watch complication / Apple Activity ring:
 * Three concentric precision SVG tracks quantifying Halal Weight, Debt Buffer, and Purification Purity.
 */
export const MizanHealthComplication: React.FC<MizanHealthComplicationProps> = ({
  halalWeightPercent,
  avgDebtRatioPercent,
  debtThresholdPercent,
  purificationRatioPercent,
  totalMarketValueTRY,
  breachedCount,
  atRiskCount,
  standardName,
}) => {
  // SVG Ring Geometry
  const size = 156;
  const strokeWidth = 8;
  const center = size / 2;

  // Ring 1 (Outer): Halal Weight
  const r1 = 64;
  const c1 = 2 * Math.PI * r1;
  const p1 = Math.min(Math.max(halalWeightPercent / 100, 0), 1);
  const offset1 = c1 * (1 - p1);

  // Ring 2 (Middle): Debt Safety Margin (Distance to limit)
  const r2 = 50;
  const c2 = 2 * Math.PI * r2;
  const debtSafetyRatio = Math.max(0, (debtThresholdPercent - avgDebtRatioPercent) / debtThresholdPercent);
  const p2 = Math.min(Math.max(debtSafetyRatio, 0), 1);
  const offset2 = c2 * (1 - p2);

  // Ring 3 (Inner): Revenue Purity (100% - purification deduction ratio)
  const r3 = 36;
  const c3 = 2 * Math.PI * r3;
  const purityRatio = Math.max(0, 1 - purificationRatioPercent / 100);
  const p3 = Math.min(Math.max(purityRatio, 0), 1);
  const offset3 = c3 * (1 - p3);

  // Portfolio Islamic Finance Rating Grade
  const grade =
    halalWeightPercent >= 90
      ? "AAA"
      : halalWeightPercent >= 75
      ? "AA"
      : halalWeightPercent >= 60
      ? "A-"
      : "BBB";

  return (
    <SpotlightCard className="p-6 md:p-7">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Concentric Ring Complication & Grade */}
        <div className="flex items-center gap-6">
          <div className="relative shrink-0 select-none">
            <svg
              width={size}
              height={size}
              className="rotate-[-90deg] overflow-visible"
              aria-label="Mizan Katılım Sağlık Halkaları"
            >
              {/* Outer Ring: Track & Value */}
              <circle
                cx={center}
                cy={center}
                r={r1}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={center}
                cy={center}
                r={r1}
                fill="none"
                stroke="#10b981"
                strokeWidth={strokeWidth}
                strokeDasharray={c1}
                strokeDashoffset={offset1}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* Middle Ring: Debt Safety */}
              <circle
                cx={center}
                cy={center}
                r={r2}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={center}
                cy={center}
                r={r2}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={strokeWidth}
                strokeDasharray={c2}
                strokeDashoffset={offset2}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* Inner Ring: Purity */}
              <circle
                cx={center}
                cy={center}
                r={r3}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={center}
                cy={center}
                r={r3}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                strokeDasharray={c3}
                strokeDashoffset={offset3}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Complication Core Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
                MİZAN
              </span>
              <span className="text-xl font-bold font-mono tracking-tight text-white mt-0.5">
                {grade}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-medium">
                %{halalWeightPercent.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Core Descriptive Text */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Katılım Uygunluk Denge Endeksi</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Portföy Katılım Sağlığı:{" "}
              <span className={breachedCount === 0 ? "text-emerald-400" : "text-amber-400"}>
                {breachedCount === 0 ? "Kusursuz Dengede" : `${breachedCount} Kapsam Dışı Risk`}
              </span>
            </h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed font-normal">
              {standardName} kriterlerine göre portföyün <strong>%{halalWeightPercent.toFixed(1)}</strong>&apos;lik
              kısmı tam uygunluk taşımakta; ortalama faizli borç oranı ise %{avgDebtRatioPercent.toFixed(1)} seviyesindedir.
            </p>
          </div>
        </div>

        {/* Right: Three Whispering Precision Ring Swatches */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/[0.08] lg:pl-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Helal Ağırlık</span>
            </div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              %{halalWeightPercent.toFixed(1)}
            </div>
            <span className="text-[10px] text-slate-400 block font-normal">
              Portföyün payı
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Borç Tamponu</span>
            </div>
            <div className="text-xl font-bold text-sky-400 font-mono tabular-nums">
              +%{Math.max(0, debtThresholdPercent - avgDebtRatioPercent).toFixed(1)}
            </div>
            <span className="text-[10px] text-slate-400 block font-normal">
              Eşiğe güvenli marj
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Temizlik</span>
            </div>
            <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">
              %{purityRatio ? (purityRatio * 100).toFixed(1) : "99.8"}
            </div>
            <span className="text-[10px] text-slate-400 block font-normal">
              Arındırma sonrası net
            </span>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};
