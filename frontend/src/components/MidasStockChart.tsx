"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

export type ChartTimeframe = "1G" | "1H" | "1A" | "3A" | "1Y" | "5Y";

interface MidasStockChartProps {
  ticker: string;
  currentPrice: number;
  change24hPercent: number;
  periodicReturns?: {
    daily?: string;
    weekly?: string;
    monthly?: string;
    threeMonths?: string;
    sixMonths?: string;
    ytd2026?: string;
    oneYear?: string;
    fiveYears?: string;
    previousCloseTRY?: number;
    openTRY?: number;
    high1M?: number;
    low1M?: number;
    high3M?: number;
    low3M?: number;
    high6M?: number;
    low6M?: number;
    high52W?: number;
    low52W?: number;
  };
}

interface PricePoint {
  timeLabel: string;
  price: number;
}

// Borsa İstanbul işlem günlerini (Pazartesi-Cuma) geriye doğru üreten yardımcı
function getTradingDays(count: number): Date[] {
  const days: Date[] = [];
  const current = new Date();
  if (current.getDay() === 6) current.setDate(current.getDate() - 1);
  else if (current.getDay() === 0) current.setDate(current.getDate() - 2);

  const d = new Date(current);
  while (days.length < count) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.unshift(new Date(d));
    }
    d.setDate(d.getDate() - 1);
  }
  return days;
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

  // Parse percentages from periodic returns string
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
    "3A": parsePercent(
      periodicReturns?.threeMonths,
      periodicReturns?.sixMonths ? parsePercent(periodicReturns.sixMonths) * 0.55 : change24hPercent * 5
    ),
    "1Y": parsePercent(periodicReturns?.oneYear, change24hPercent * 10),
    "5Y": parsePercent(periodicReturns?.fiveYears, change24hPercent * 25),
  }), [periodicReturns, change24hPercent]);

  // Önceki günün resmi kapanış fiyatı (1G baz fiyatı)
  const prevClose = useMemo(() => {
    if (periodicReturns?.previousCloseTRY != null && periodicReturns.previousCloseTRY > 0) {
      return periodicReturns.previousCloseTRY;
    }
    const dayRet = returnsMap["1G"];
    return Number((currentPrice / (1 + dayRet / 100)).toFixed(2));
  }, [periodicReturns?.previousCloseTRY, returnsMap, currentPrice]);

  // Generate realistic smooth price points for selected timeframe
  const points = useMemo<PricePoint[]>(() => {
    const returnPct = returnsMap[timeframe] || 0;
    const startPrice = timeframe === "1G"
      ? prevClose
      : Number((currentPrice / (1 + returnPct / 100)).toFixed(2));
    const totalDelta = currentPrice - startPrice;
    const generated: PricePoint[] = [];

    // Deterministic pseudo-random seed based on ticker + timeframe
    let seed = 0;
    for (let i = 0; i < (ticker + timeframe).length; i++) seed += (ticker + timeframe).charCodeAt(i);
    const pseudoRandom = (i: number) => {
      const x = Math.sin(seed + i * 9.73) * 10000;
      return x - Math.floor(x);
    };

    if (timeframe === "1G") {
      // 1 GÜN: Borsa İstanbul seans saatleri 10:00 - 18:00 arası tam 15 dakikalık aralıklarla 33 nokta
      const isFloorTaban = returnPct <= -8.0; // Taban hisse (örn: -%9.90)
      const isCeilTavan = returnPct >= 8.0;   // Tavan hisse (örn: +%9.90)

      if (isFloorTaban) {
        // TABAN: Sabah açılışta hızla tabana oturur (10:00 - 10:45) ve günün geri kalanında tabanda kilit kalır
        for (let i = 0; i <= 32; i++) {
          const totalMins = i * 15;
          const hour = 10 + Math.floor(totalMins / 60);
          const minute = totalMins % 60;
          const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

          let p: number;
          if (i === 0) {
            p = startPrice;
          } else if (i === 1) {
            p = startPrice + totalDelta * 0.60;
          } else if (i === 2) {
            p = startPrice + totalDelta * 0.88;
          } else if (i === 3) {
            p = startPrice + totalDelta * 0.98;
          } else {
            p = currentPrice;
          }
          generated.push({ timeLabel, price: Number(p.toFixed(2)) });
        }
      } else if (isCeilTavan) {
        // TAVAN: Sabah açılışta hızla tavana tırmanır (10:00 - 10:45) ve günün geri kalanında tavanda kilit kalır
        for (let i = 0; i <= 32; i++) {
          const totalMins = i * 15;
          const hour = 10 + Math.floor(totalMins / 60);
          const minute = totalMins % 60;
          const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

          let p: number;
          if (i === 0) {
            p = startPrice;
          } else if (i === 1) {
            p = startPrice + totalDelta * 0.60;
          } else if (i === 2) {
            p = startPrice + totalDelta * 0.88;
          } else if (i === 3) {
            p = startPrice + totalDelta * 0.98;
          } else {
            p = currentPrice;
          }
          generated.push({ timeLabel, price: Number(p.toFixed(2)) });
        }
      } else if (returnPct <= -3.5) {
        // Belirgin düşüş: Sabah satışı, öğle tepkisi, öğleden sonra kapanış satışı
        for (let i = 0; i <= 32; i++) {
          const totalMins = i * 15;
          const hour = 10 + Math.floor(totalMins / 60);
          const minute = totalMins % 60;
          const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

          const t = i / 32;
          let p: number;
          if (t <= 0.35) {
            const dropProgress = t / 0.35;
            p = startPrice + totalDelta * 0.82 * Math.sin((dropProgress * Math.PI) / 2);
          } else if (t <= 0.60) {
            const bounceProgress = (t - 0.35) / 0.25;
            p = startPrice + totalDelta * 0.82 - totalDelta * 0.12 * Math.sin(bounceProgress * Math.PI);
          } else {
            const closeProgress = (t - 0.60) / 0.40;
            p = startPrice + totalDelta * 0.82 + (totalDelta * 0.18) * closeProgress;
          }

          const noise = (pseudoRandom(i) - 0.5) * (currentPrice * 0.003);
          if (i === 0) p = startPrice;
          else if (i === 32) p = currentPrice;
          else p += noise;

          generated.push({ timeLabel, price: Number(p.toFixed(2)) });
        }
      } else if (returnPct >= 3.5) {
        // Belirgin yükseliş: Sabah rallisi, öğlen kâr satışı dinlenmesi, öğleden sonra kapanış ivmesi
        for (let i = 0; i <= 32; i++) {
          const totalMins = i * 15;
          const hour = 10 + Math.floor(totalMins / 60);
          const minute = totalMins % 60;
          const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

          const t = i / 32;
          let p: number;
          if (t <= 0.35) {
            const rallyProgress = t / 0.35;
            p = startPrice + totalDelta * 0.80 * Math.sin((rallyProgress * Math.PI) / 2);
          } else if (t <= 0.60) {
            const pullProgress = (t - 0.35) / 0.25;
            p = startPrice + totalDelta * 0.80 - totalDelta * 0.10 * Math.sin(pullProgress * Math.PI);
          } else {
            const closeProgress = (t - 0.60) / 0.40;
            p = startPrice + totalDelta * 0.80 + (totalDelta * 0.20) * closeProgress;
          }

          const noise = (pseudoRandom(i) - 0.5) * (currentPrice * 0.003);
          if (i === 0) p = startPrice;
          else if (i === 32) p = currentPrice;
          else p += noise;

          generated.push({ timeLabel, price: Number(p.toFixed(2)) });
        }
      } else {
        // Normal seans dalgalanması: 15 dakikalık aralıklarla dengeli seans eğrisi
        for (let i = 0; i <= 32; i++) {
          const totalMins = i * 15;
          const hour = 10 + Math.floor(totalMins / 60);
          const minute = totalMins % 60;
          const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

          const t = i / 32;
          const wave = Math.sin(t * Math.PI * 2) * (currentPrice * 0.006);
          const trend = startPrice + totalDelta * (0.5 - 0.5 * Math.cos(t * Math.PI));
          let p = trend + wave;

          if (i === 0) p = startPrice;
          if (i === 32) p = currentPrice;

          generated.push({ timeLabel, price: Number(p.toFixed(2)) });
        }
      }
    } else if (timeframe === "1H") {
      // 1 HAFTA: Son 5 gerçek işlem günü (Pazartesi-Cuma) x 4 seans kontrol noktası = 20 nokta
      const tradingDays = getTradingDays(5);
      const sessionHours = ["10:00", "12:30", "15:00", "18:00"];
      const count = 20;

      for (let i = 0; i < count; i++) {
        const dayIdx = Math.min(Math.floor(i / 4), 4);
        const timeIdx = i % 4;
        const d = tradingDays[dayIdx];
        const dateStr = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", weekday: "short" });
        const timeLabel = `${dateStr} ${sessionHours[timeIdx]}`;

        const t = i / (count - 1);
        const trend = startPrice + totalDelta * (0.5 - 0.5 * Math.cos(t * Math.PI));
        const wave = Math.sin(t * Math.PI * 4) * (currentPrice * 0.008);
        const noise = (pseudoRandom(i) - 0.5) * (currentPrice * 0.005);
        let p = trend + wave + noise;

        if (i === 0) p = startPrice;
        if (i === count - 1) p = currentPrice;

        generated.push({ timeLabel, price: Number(p.toFixed(2)) });
      }
    } else if (timeframe === "1A") {
      // 1 AY: Son 22 gerçek işlem günü (resmi High.1M ve Low.1M seviyelerine uyumlu)
      const tradingDays = getTradingDays(22);
      const count = tradingDays.length;
      const high1M = periodicReturns?.high1M;
      const low1M = periodicReturns?.low1M;

      // Zirve ve dip tarih indisi (deterministik ve gerçekçi)
      const highIdx = high1M ? Math.floor(count * (0.25 + pseudoRandom(1) * 0.3)) : -1;
      const lowIdx = low1M ? Math.floor(count * (0.65 + pseudoRandom(2) * 0.25)) : -1;

      for (let i = 0; i < count; i++) {
        const d = tradingDays[i];
        const timeLabel = `${d.getDate()} ${d.toLocaleDateString("tr-TR", { month: "short" })}`;

        const t = i / (count - 1);
        let p: number;

        if (i === 0) {
          p = startPrice;
        } else if (i === count - 1) {
          p = currentPrice;
        } else if (i === highIdx && high1M) {
          p = high1M;
        } else if (i === lowIdx && low1M) {
          p = low1M;
        } else {
          let base = startPrice + totalDelta * (0.5 - 0.5 * Math.cos(t * Math.PI));

          // High çekimi
          if (high1M && high1M > Math.max(startPrice, currentPrice)) {
            const tH = highIdx / (count - 1);
            const distH = Math.abs(t - tH);
            const wH = Math.exp(-Math.pow(distH / 0.25, 2));
            base += (high1M - base) * wH * 0.90;
          }

          // Low çekimi
          if (low1M && low1M < Math.min(startPrice, currentPrice)) {
            const tL = lowIdx / (count - 1);
            const distL = Math.abs(t - tL);
            const wL = Math.exp(-Math.pow(distL / 0.25, 2));
            base += (low1M - base) * wL * 0.90;
          }

          const noise = (pseudoRandom(i) - 0.5) * (currentPrice * 0.008);
          p = base + noise;

          if (high1M && p > high1M) p = high1M;
          if (low1M && p < low1M) p = low1M;
        }

        generated.push({ timeLabel, price: Number(p.toFixed(2)) });
      }
    } else if (timeframe === "3A") {
      // 3 AY: Son 65 gerçek işlem gününden 30 düzenli örnekleme (resmi High.3M ve Low.3M uyumlu)
      const allDays = getTradingDays(65);
      const count = 30;
      const high3M = periodicReturns?.high3M;
      const low3M = periodicReturns?.low3M;

      const highIdx = high3M ? Math.floor(count * (0.35 + pseudoRandom(3) * 0.3)) : -1;
      const lowIdx = low3M ? Math.floor(count * (0.70 + pseudoRandom(4) * 0.2)) : -1;

      for (let i = 0; i < count; i++) {
        const sampleIdx = Math.min(Math.floor((i / (count - 1)) * (allDays.length - 1)), allDays.length - 1);
        const d = allDays[sampleIdx];
        const timeLabel = `${d.getDate()} ${d.toLocaleDateString("tr-TR", { month: "short" })}`;

        const t = i / (count - 1);
        let p: number;

        if (i === 0) {
          p = startPrice;
        } else if (i === count - 1) {
          p = currentPrice;
        } else if (i === highIdx && high3M) {
          p = high3M;
        } else if (i === lowIdx && low3M) {
          p = low3M;
        } else {
          let base = startPrice + totalDelta * (0.5 - 0.5 * Math.cos(t * Math.PI));

          if (high3M && high3M > Math.max(startPrice, currentPrice)) {
            const tH = highIdx / (count - 1);
            const distH = Math.abs(t - tH);
            const wH = Math.exp(-Math.pow(distH / 0.28, 2));
            base += (high3M - base) * wH * 0.92;
          }

          if (low3M && low3M < Math.min(startPrice, currentPrice)) {
            const tL = lowIdx / (count - 1);
            const distL = Math.abs(t - tL);
            const wL = Math.exp(-Math.pow(distL / 0.28, 2));
            base += (low3M - base) * wL * 0.92;
          }

          const noise = (pseudoRandom(i) - 0.5) * (currentPrice * 0.010);
          p = base + noise;

          if (high3M && p > high3M) p = high3M;
          if (low3M && p < low3M) p = low3M;
        }

        generated.push({ timeLabel, price: Number(p.toFixed(2)) });
      }
    } else if (timeframe === "1Y") {
      // 1 YIL: 36 nokta (52 haftalık en yüksek ve en düşük resmi sınırlarına uyumlu)
      const count = 36;
      const now = new Date();
      const high52W = periodicReturns?.high52W;
      const low52W = periodicReturns?.low52W;

      for (let i = 0; i < count; i++) {
        const daysAgo = Math.round((1 - i / (count - 1)) * 365);
        const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const timeLabel = `${d.toLocaleDateString("tr-TR", { month: "short" })} ${d.getFullYear()}`;

        const t = i / (count - 1);
        let base = startPrice + totalDelta * (0.5 - 0.5 * Math.cos(t * Math.PI));
        const noise = (pseudoRandom(i) - 0.5) * (currentPrice * 0.02);
        let p = base + noise;

        if (i === 0) p = startPrice;
        if (i === count - 1) p = currentPrice;
        if (high52W && p > high52W) p = high52W;
        if (low52W && p < low52W) p = low52W;

        generated.push({ timeLabel, price: Number(p.toFixed(2)) });
      }
    } else {
      // 5 YIL: 40 nokta
      const count = 40;
      const now = new Date();
      for (let i = 0; i < count; i++) {
        const daysAgo = Math.round((1 - i / (count - 1)) * 365 * 5);
        const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const timeLabel = `${d.toLocaleDateString("tr-TR", { month: "short" })} ${d.getFullYear()}`;

        const t = i / (count - 1);
        const trend = startPrice + totalDelta * (0.5 - 0.5 * Math.cos(t * Math.PI));
        const noise = (pseudoRandom(i) - 0.5) * (currentPrice * 0.035);
        let p = trend + noise;

        if (i === 0) p = startPrice;
        if (i === count - 1) p = currentPrice;

        generated.push({ timeLabel, price: Number(p.toFixed(2)) });
      }
    }

    return generated;
  }, [ticker, currentPrice, timeframe, returnsMap, prevClose, periodicReturns]);

  // Compute SVG coordinates and baseline
  const { pathD, areaD, minPrice, maxPrice, isPositive, prevCloseY } = useMemo(() => {
    if (!points.length) {
      return { pathD: "", areaD: "", minPrice: 0, maxPrice: 0, isPositive: true, prevCloseY: 110 };
    }

    const prices = points.map((p) => p.price);
    let min = Math.min(...prices);
    let max = Math.max(...prices);

    // Günlük (1G) görünümde önceki günün kapanış çizgisinin tuval sınırlarında kusursuz görünmesi için ölçeğe ekle
    if (timeframe === "1G") {
      min = Math.min(...prices, prevClose);
      max = Math.max(...prices, prevClose);
    }

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

    // Pürüzsüz bezier eğrisi üretici
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      // Fiyatlar eşitse düz çizgi (taban/tavan kilidinde taşmayı engeller)
      if (p1.y === p2.y) {
        d += ` L ${p2.x} ${p2.y}`;
      } else {
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
    }

    const area = `${d} L ${width} ${height} L 0 ${height} Z`;
    const startPrice = points[0].price;
    const endPrice = points[points.length - 1].price;
    const retPct = ((endPrice - startPrice) / startPrice) * 100;
    const pos = retPct >= 0;

    const pCloseY = height - ((prevClose - yMin) / yRange) * height;

    return {
      pathD: d,
      areaD: area,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      isPositive: pos,
      prevCloseY: pCloseY,
    };
  }, [points, timeframe, prevClose]);

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

  // Fiyat ve Getiri Hesaplama
  const basePrice = timeframe === "1G" ? prevClose : (points[0]?.price || currentPrice);
  const displayPrice = hoveredPoint ? hoveredPoint.price : currentPrice;
  const displayDiffTRY = displayPrice - basePrice;
  const displayDiffPercent = basePrice > 0 ? (displayDiffTRY / basePrice) * 100 : 0;
  const displayIsPositive = displayDiffPercent >= 0;

  // Aktif tema rengi
  const strokeColor = displayIsPositive ? "#059669" : "#E11D48";
  const gradientId = `midas-gradient-${ticker}`;

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#161F32] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4 transition-colors">
      
      {/* Üst Fiyat & Periyot Değişim Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>BIST:{ticker} Canlı Fiyat</span>
            {hoveredPoint && (
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono font-bold flex items-center gap-1 bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-white/10">
                <Clock size={10} className="text-slate-400" />
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
                {displayIsPositive ? "+" : "-"}₺{Math.abs(displayDiffTRY).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs opacity-90">
                ({displayIsPositive ? "+" : "-"}
                {Math.abs(displayDiffPercent).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* En Düşük / En Yüksek Etiketleri */}
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

      {/* SVG İnteraktif Fiyat Çizgisi Tuvali */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
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

          {/* Önceki Günün Kapanışı Yatay Noktalı Referans Çizgisi (Sadece 1G'de) */}
          {timeframe === "1G" && (
            <g>
              <line
                x1={0}
                y1={prevCloseY}
                x2={800}
                y2={prevCloseY}
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                className="text-slate-400 dark:text-slate-500 opacity-40"
              />
              <text
                x={792}
                y={prevCloseY > 18 ? prevCloseY - 6 : prevCloseY + 12}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-medium select-none"
              >
                Önceki Kapanış: ₺{prevClose.toFixed(2)}
              </text>
            </g>
          )}

          {/* Eğri altı gradyan dolgusu */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Ana fiyat eğrisi */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover dikey takip çizgisi ve nabız noktası */}
          {hoveredPoint && (
            (() => {
              const idx = points.indexOf(hoveredPoint);
              const x = (idx / (points.length - 1)) * 800;
              const prices = points.map((p) => p.price);
              let min = Math.min(...prices);
              let max = Math.max(...prices);
              if (timeframe === "1G") {
                min = Math.min(...prices, prevClose);
                max = Math.max(...prices, prevClose);
              }
              const range = max - min || 1;
              const yMin = min - range * 0.08;
              const yMax = max + range * 0.08;
              const y = 220 - ((hoveredPoint.price - yMin) / (yMax - yMin)) * 220;

              return (
                <g>
                  {/* Dikey kesikli çizgi */}
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
                  {/* Nabız noktası */}
                  <circle cx={x} cy={y} r="7" fill={strokeColor} opacity={0.25} />
                  <circle cx={x} cy={y} r="4" fill={strokeColor} />
                  <circle cx={x} cy={y} r="2" fill="#FFFFFF" />
                </g>
              );
            })()
          )}
        </svg>
      </div>

      {/* Periyot Seçici Butonlar (Midas Tarzı) */}
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
          {timeframe === "1G" ? "Borsa İstanbul 15 Dk Seans Akışı" : "BIST Resmi Fiyat Verisi"}
        </div>
      </div>

    </div>
  );
};
