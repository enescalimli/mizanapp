"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { formatTRY } from "@/lib/decimal/decimal";

export type ChartTimeframe = "1G" | "1H" | "1A" | "3A" | "1Y" | "5Y";

interface MidasStockChartProps {
  ticker: string;
  currentPrice: number;
  change24hPercent: number;
  periodicReturns?: {
    daily?: string;
    weekly?: string;
    monthly?: string;
    sixMonths?: string;
    ytd2026?: string;
    oneYear?: string;
    fiveYears?: string;
  };
}

interface PricePoint {
  timeLabel: string;
  price: number;
}

export const MidasStockChart: React.FC<MidasStockChartProps> = ({
  ticker,
  currentPrice,
  change24hPercent,
  periodicReturns,
}) => {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("1G");
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse percentages from periodic returns
  const parsePercent = (val?: string | number, fallback = 0) => {
    if (val == null) return fallback;
    if (typeof val === "number") return isNaN(val) ? fallback : val;
    const cleaned = String(val).replace("%", "").replace("+", "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? fallback : num;
  };

  const returnsMap = useMemo(() => ({
    "1G": parsePercent(periodicReturns?.daily, change24hPercent),
    "1H": parsePercent(periodicReturns?.weekly, change24hPercent * 1.8),
    "1A": parsePercent(periodicReturns?.monthly, change24hPercent * 3.5),
    "3A": periodicReturns?.sixMonths
      ? parsePercent(periodicReturns.sixMonths) * 0.5
      : change24hPercent * 5,
    "1Y": parsePercent(periodicReturns?.oneYear, change24hPercent * 10),
    "5Y": parsePercent(periodicReturns?.fiveYears, change24hPercent * 25),
  }), [periodicReturns, change24hPercent]);

  // Generate realistic smooth price points for selected timeframe
  const points = useMemo<PricePoint[]>(() => {
    const returnPct = returnsMap[timeframe] || 0;
    const startPrice = currentPrice / (1 + returnPct / 100);

    const countMap: Record<ChartTimeframe, number> = {
      "1G": 40,
      "1H": 35,
      "1A": 45,
      "3A": 50,
      "1Y": 52,
      "5Y": 60,
    };
    const count = countMap[timeframe];
    const generated: PricePoint[] = [];

    // Deterministic pseudo-random seed based on ticker + timeframe
    let seed = 0;
    for (let i = 0; i < ticker.length; i++) seed += ticker.charCodeAt(i);
    const pseudoRandom = (i: number) => {
      const x = Math.sin(seed + i * 9.73) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1); // 0 to 1
      // Base trend
      const trendPrice = startPrice + (currentPrice - startPrice) * progress;
      // Natural fluctuation
      const noise = (pseudoRandom(i) - 0.48) * (currentPrice * 0.015);
      let p = trendPrice + noise;
      if (i === count - 1) p = currentPrice;
      if (i === 0) p = startPrice;

      let timeLabel = "";
      if (timeframe === "1G") {
        const hour = 10 + Math.floor(progress * 8);
        const minute = Math.floor((progress * 8 * 60) % 60);
        timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      } else if (timeframe === "1H") {
        const days = ["Pzt", "Sal", "Çar", "Per", "Cum"];
        timeLabel = days[Math.min(Math.floor(progress * 5), 4)];
      } else if (timeframe === "1A" || timeframe === "3A") {
        const day = 1 + Math.floor(progress * 28);
        timeLabel = `${day} Gün önce`;
      } else {
        timeLabel = `${(1 - progress).toFixed(1)} yıl önce`;
      }

      generated.push({ timeLabel, price: Number(p.toFixed(2)) });
    }

    return generated;
  }, [ticker, currentPrice, timeframe, returnsMap]);

  // Compute SVG coordinates
  const { pathD, areaD, minPrice, maxPrice, isPositive, currentReturnPercent } = useMemo(() => {
    if (!points.length) {
      return { pathD: "", areaD: "", minPrice: 0, maxPrice: 0, isPositive: true, currentReturnPercent: 0 };
    }

    const prices = points.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const padding = range * 0.08;
    const yMin = min - padding;
    const yMax = max + padding;
    const yRange = yMax - yMin;

    const width = 800;
    const height = 220;

    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p.price - yMin) / yRange) * height;
      return { x, y };
    });

    // Smooth bezier curve generator
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const area = `${d} L ${width} ${height} L 0 ${height} Z`;
    const startPrice = points[0].price;
    const endPrice = points[points.length - 1].price;
    const retPct = ((endPrice - startPrice) / startPrice) * 100;
    const pos = retPct >= 0;

    return {
      pathD: d,
      areaD: area,
      minPrice: min,
      maxPrice: max,
      isPositive: pos,
      currentReturnPercent: retPct,
    };
  }, [points]);

  // Cursor move handler
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!containerRef.current || !points.length) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const relX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const ratio = relX / rect.width;
      const idx = Math.min(Math.floor(ratio * points.length), points.length - 1);
      setHoveredPoint(points[idx]);
    },
    [points]
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  const displayPrice = hoveredPoint ? hoveredPoint.price : currentPrice;
  const startPrice = points[0]?.price || currentPrice;
  const displayDiffTRY = displayPrice - startPrice;
  const displayDiffPercent = startPrice > 0 ? (displayDiffTRY / startPrice) * 100 : 0;
  const displayIsPositive = displayDiffPercent >= 0;

  // Active theme colors
  const strokeColor = displayIsPositive ? "#059669" : "#E11D48";
  const gradientId = `midas-gradient-${ticker}`;

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#161F32] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4 transition-colors">
      
      {/* Top Price & Period Change Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>BIST:{ticker} Canlı Fiyat</span>
            {hoveredPoint && (
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                <Clock size={10} />
                {hoveredPoint.timeLabel}
              </span>
            )}
          </div>
          
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#182542] dark:text-white tabular-nums">
              ₺{displayPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            
            <div
              className={`flex items-center gap-1 font-mono text-sm font-extrabold px-2.5 py-0.5 rounded-lg tabular-nums ${
                displayIsPositive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
              }`}
            >
              {displayIsPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>
                {displayIsPositive ? "+" : ""}
                ₺{Math.abs(displayDiffTRY).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs opacity-90">
                ({displayIsPositive ? "+" : ""}
                {displayDiffPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Min / Max summary tags */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400 dark:text-slate-500">
          <div>
            <span className="text-[10px] uppercase font-bold block">En Düşük</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ₺{minPrice.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold block">En Yüksek</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ₺{maxPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full h-[180px] sm:h-[210px] cursor-crosshair select-none touch-none"
      >
        <svg
          viewBox="0 0 800 220"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.22} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Main price line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Scrubber vertical line & point on hover */}
          {hoveredPoint && (
            (() => {
              const idx = points.indexOf(hoveredPoint);
              const x = (idx / (points.length - 1)) * 800;
              const prices = points.map((p) => p.price);
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              const range = max - min || 1;
              const yMin = min - range * 0.08;
              const yMax = max + range * 0.08;
              const y = 220 - ((hoveredPoint.price - yMin) / (yMax - yMin)) * 220;

              return (
                <g>
                  {/* Subtle vertical indicator line */}
                  <line
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={220}
                    stroke={strokeColor}
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    opacity={0.6}
                  />
                  {/* Pulse dot */}
                  <circle cx={x} cy={y} r="7" fill={strokeColor} opacity={0.25} />
                  <circle cx={x} cy={y} r="4" fill={strokeColor} />
                  <circle cx={x} cy={y} r="2" fill="#FFFFFF" />
                </g>
              );
            })()
          )}
        </svg>
      </div>

      {/* Timeframe Selector Pills (Midas Style) */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {(["1G", "1H", "1A", "3A", "1Y", "5Y"] as ChartTimeframe[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  setTimeframe(tf);
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? "bg-[#182542] dark:bg-white text-white dark:text-[#182542] shadow-xs scale-105"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:block">
          Borsa İstanbul Veri Akışı
        </div>
      </div>

    </div>
  );
};
