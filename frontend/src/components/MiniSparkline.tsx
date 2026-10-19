"use client";

import React, { useMemo } from "react";

interface MiniSparklineProps {
  ticker: string;
  trend?: "up" | "down" | "flat";
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Institutional-grade mini SVG sparkline.
 * Renders a slender, elegant intraday price wave with subtle gradient fill.
 */
export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  ticker,
  trend = "up",
  width = 72,
  height = 24,
  className = "",
}) => {
  // Generate a deterministic and aesthetically pleasing financial curve based on ticker seed
  const { pathD, areaD, strokeColor, fillColor } = useMemo(() => {
    // Deterministic pseudo-random seed from ticker string
    let seed = 0;
    for (let i = 0; i < ticker.length; i++) {
      seed = (seed * 31 + ticker.charCodeAt(i)) % 10000;
    }

    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const pointsCount = 7;
    const padding = 2;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    const step = usableWidth / (pointsCount - 1);

    const values: number[] = [];
    let currentVal = trend === "up" ? 0.35 : trend === "down" ? 0.65 : 0.5;

    for (let i = 0; i < pointsCount; i++) {
      values.push(currentVal);
      const delta = (pseudoRandom() - 0.48) * 0.25;
      const trendBias = trend === "up" ? 0.08 : trend === "down" ? -0.08 : 0;
      currentVal = Math.min(Math.max(currentVal + delta + trendBias, 0.1), 0.9);
    }

    // Force final point to reflect actual trend
    if (trend === "up") values[pointsCount - 1] = Math.max(values[0] + 0.2, 0.75);
    if (trend === "down") values[pointsCount - 1] = Math.min(values[0] - 0.2, 0.25);

    // Map to coordinates
    const coords = values.map((val, idx) => ({
      x: padding + idx * step,
      y: padding + (1 - val) * usableHeight,
    }));

    // Build smooth cubic bezier curve
    let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpX2 = p0.x + (p1.x - p0.x) * 0.55;
      d += ` C ${cpX1.toFixed(1)} ${p0.y.toFixed(1)}, ${cpX2.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }

    const lastX = coords[coords.length - 1].x.toFixed(1);
    const firstX = coords[0].x.toFixed(1);
    const bottomY = (height - padding).toFixed(1);
    const area = `${d} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    const stroke =
      trend === "up" ? "#10b981" : trend === "down" ? "#f43f5e" : "#71717a";
    const fill =
      trend === "up"
        ? "rgba(16, 185, 129, 0.12)"
        : trend === "down"
        ? "rgba(244, 63, 94, 0.12)"
        : "rgba(113, 113, 122, 0.08)";

    return { pathD: d, areaD: area, strokeColor: stroke, fillColor: fill };
  }, [ticker, trend, width, height]);

  const gradientId = `sparkline-grad-${ticker}-${trend}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible select-none shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Subtle Area Fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Slender Smooth Trend Line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
    </svg>
  );
};
