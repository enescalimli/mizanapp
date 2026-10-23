"use client";

import React, { useEffect, useRef, memo } from "react";
import { useTheme } from "@/lib/theme/ThemeContext";

interface TradingViewWidgetProps {
  ticker: string;
  mode?: "chart" | "technical" | "mini";
  height?: number | string;
  interval?: "D" | "W" | "M" | "60" | "15";
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(
  ({ ticker, mode = "chart", height = 500, interval = "D" }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { isDark } = useTheme();

    const cleanTicker = ticker.replace(".IS", "").trim().toUpperCase();
    const formattedSymbol = cleanTicker.startsWith("X") ? `BIST:${cleanTicker}` : `BIST:${cleanTicker}`;
    const themeName = isDark ? "dark" : "light";

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Clean previous script/widgets
      container.innerHTML = "";

      const widgetContainer = document.createElement("div");
      widgetContainer.className = "tradingview-widget-container__widget";
      widgetContainer.style.height = "100%";
      widgetContainer.style.width = "100%";
      container.appendChild(widgetContainer);

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;

      if (mode === "technical") {
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
        script.innerHTML = JSON.stringify({
          interval: interval === "D" ? "1D" : interval === "W" ? "1W" : "1M",
          width: "100%",
          isTransparent: true,
          height: height || 420,
          symbol: formattedSymbol,
          showIntervalTabs: true,
          displayMode: "single",
          locale: "tr",
          colorTheme: themeName,
        });
      } else if (mode === "mini") {
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
        script.innerHTML = JSON.stringify({
          symbol: formattedSymbol,
          width: "100%",
          height: height || 220,
          locale: "tr",
          dateRange: "12M",
          colorTheme: themeName,
          isTransparent: true,
          autosize: false,
          largeChartUrl: "",
        });
      } else {
        // Advanced Candlestick Chart
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.innerHTML = JSON.stringify({
          autosize: true,
          symbol: formattedSymbol,
          interval: interval,
          timezone: "Europe/Istanbul",
          theme: themeName,
          style: "1",
          locale: "tr",
          enable_publishing: false,
          allow_symbol_change: true,
          calendar: false,
          hide_side_toolbar: false,
          hide_top_toolbar: false,
          save_image: false,
          studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
          support_host: "https://www.tradingview.com",
        });
      }

      container.appendChild(script);

      return () => {
        if (container) {
          container.innerHTML = "";
        }
      };
    }, [formattedSymbol, mode, height, interval, themeName]);

    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#161F32]/80 backdrop-blur-md shadow-xs">
        <div
          ref={containerRef}
          className="tradingview-widget-container"
          style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}
        />
      </div>
    );
  }
);

TradingViewWidget.displayName = "TradingViewWidget";
