"use client";

import React, { useState } from "react";
import Image from "next/image";

interface StockLogoProps {
  ticker: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-xs",
  lg: "w-12 h-12 text-sm",
  xl: "w-14 h-14 text-base",
};

const dimensionMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
};

export const StockLogo: React.FC<StockLogoProps> = ({
  ticker,
  name,
  size = "md",
  className = "",
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const cleanTicker = (ticker || "BIST").trim().toUpperCase();

  // BIST CDN Logo URL
  const logoUrl = `https://cdn.jsdelivr.net/gh/ahmeterenodaci/Istanbul-Stock-Exchange--BIST--including-symbols-and-logos/logos/${cleanTicker}.png`;

  const sizeClass = sizeMap[size] || sizeMap.md;
  const dimension = dimensionMap[size] || 40;

  // Fallback initial generator
  const initials = cleanTicker.slice(0, 2);

  if (hasError) {
    return (
      <div
        className={`${sizeClass} rounded-2xl bg-gradient-to-tr from-[#182542] to-[#273869] dark:from-[#1E293B] dark:to-[#334155] text-white font-mono font-bold flex items-center justify-center shrink-0 shadow-xs border border-white/10 ${className}`}
        title={`${cleanTicker} - ${name || ""}`}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-2xl bg-white dark:bg-slate-800 p-1 border border-slate-200/70 dark:border-white/10 shadow-xs flex items-center justify-center shrink-0 overflow-hidden relative ${className}`}
      title={`${cleanTicker} - ${name || ""}`}
    >
      <img
        src={logoUrl}
        alt={`${cleanTicker} Logo`}
        width={dimension}
        height={dimension}
        className="w-full h-full object-contain"
        loading={priority ? "eager" : "lazy"}
        onError={() => setHasError(true)}
      />
    </div>
  );
};