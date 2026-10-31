"use client";

import React, { useMemo } from "react";

export interface SnowflakeScores {
  faizsizlik: number; // 0-100 (Faizli borç ve nakit düşüklüğü)
  hasilatHelalligi: number; // 0-100 (Şüpheli gelir düşüklüğü)
  temettu: number; // 0-100 (Temettü verimi ve nakit akışı)
  bilancoSagligi: number; // 0-100 (Cari oran ve likidite)
  degerleme: number; // 0-100 (F/K, PD/DD iskontosu)
  buyume: number; // 0-100 (Özsermaye kârlılığı / ROE)
}

interface MizanSnowflakeRadarProps {
  scores: SnowflakeScores;
  isCompliant: boolean;
  size?: number;
  interactive?: boolean;
}

export const MizanSnowflakeRadar: React.FC<MizanSnowflakeRadarProps> = ({
  scores,
  isCompliant,
  size = 280,
  interactive = true,
}) => {
  const center = size / 2;
  const radius = size * 0.38;

  // 6 Eksen ve Açıları (Dönüş: -90 dereceden başlar = Saat 12 yönü)
  const axes = useMemo(
    () => [
      { key: "faizsizlik", label: "Faizsizlik", angle: -90, score: scores.faizsizlik },
      { key: "hasilatHelalligi", label: "Hasılat Helalliği", angle: -30, score: scores.hasilatHelalligi },
      { key: "temettu", label: "Temettü", angle: 30, score: scores.temettu },
      { key: "bilancoSagligi", label: "Bilanço Sağlığı", angle: 90, score: scores.bilancoSagligi },
      { key: "degerleme", label: "Değerleme", angle: 150, score: scores.degerleme },
      { key: "buyume", label: "Büyüme & Kâr", angle: 210, score: scores.buyume },
    ],
    [scores]
  );

  // Grid Halka Yarıçapları (%25, %50, %75, %100)
  const rings = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (angleInDegrees: number, dist: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: center + dist * Math.cos(angleInRadians),
      y: center + dist * Math.sin(angleInRadians),
    };
  };

  // Polygon noktalarını hesapla
  const polygonPoints = useMemo(() => {
    return axes
      .map((axis) => {
        const val = Math.max(10, Math.min(100, axis.score));
        const dist = (val / 100) * radius;
        const coords = getCoordinates(axis.angle, dist);
        return `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
      })
      .join(" ");
  }, [axes, radius, center]);

  // Renk Paleti: Katılım Uyumlu ise Zümrüt Yeşili, Değilse Gül Kurusu / Amber
  const themeColor = isCompliant ? "#10B981" : "#F43F5E";
  const themeFill = isCompliant ? "rgba(16, 185, 129, 0.22)" : "rgba(244, 63, 94, 0.22)";

  // Ortalama Skor (0-100)
  const averageScore = Math.round(
    (scores.faizsizlik +
      scores.hasilatHelalligi +
      scores.temettu +
      scores.bilancoSagligi +
      scores.degerleme +
      scores.buyume) /
      6
  );

  return (
    <div className="relative flex flex-col items-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id="snowflakeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={themeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={themeColor} stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Arka Plan Konsantrik Halka / Altıgenler */}
        {rings.map((ringFactor, i) => {
          const hexPoints = axes
            .map((axis) => {
              const coords = getCoordinates(axis.angle, radius * ringFactor);
              return `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
            })
            .join(" ");

          return (
            <polygon
              key={i}
              points={hexPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth={i === rings.length - 1 ? "1.2" : "0.8"}
              strokeDasharray={i === rings.length - 1 ? undefined : "3,3"}
              className="text-slate-200 dark:text-white/10"
            />
          );
        })}

        {/* Merkezden Eksenlere Giden Işın Çizgileri */}
        {axes.map((axis, i) => {
          const outer = getCoordinates(axis.angle, radius);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-200 dark:text-white/15"
            />
          );
        })}

        {/* Snowflake Veri Poligonu (Glow + Dolgu + Çizgi) */}
        <polygon
          points={polygonPoints}
          fill={themeFill}
          stroke={themeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Poligon Köşe Noktaları */}
        {axes.map((axis, i) => {
          const val = Math.max(10, Math.min(100, axis.score));
          const dist = (val / 100) * radius;
          const coords = getCoordinates(axis.angle, dist);

          return (
            <circle
              key={i}
              cx={coords.x}
              cy={coords.y}
              r="4"
              fill={themeColor}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="shadow-sm transition-all duration-700 ease-out"
            />
          );
        })}

        {/* Merkez Ortalama Skor Rozeti */}
        <circle cx={center} cy={center} r="18" fill="currentColor" className="text-white dark:text-[#12141A] shadow-md" />
        <text
          x={center}
          y={center + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fontFamily="ui-monospace, monospace"
          fill="currentColor"
          className="text-[#182542] dark:text-white"
        >
          {averageScore}
        </text>

        {/* Eksen Etiketleri */}
        {axes.map((axis, i) => {
          const labelDist = radius + 22;
          const coords = getCoordinates(axis.angle, labelDist);

          // Yazı hizalaması
          let textAnchor: "middle" | "start" | "end" = "middle";
          if (axis.angle > -60 && axis.angle < 60) textAnchor = "start";
          else if (axis.angle > 120 || axis.angle < -120) textAnchor = "end";

          return (
            <g key={i}>
              <text
                x={coords.x}
                y={coords.y}
                textAnchor={textAnchor}
                fontSize="10"
                fontWeight="600"
                fill="currentColor"
                className="text-slate-600 dark:text-zinc-400"
              >
                {axis.label}
              </text>
              <text
                x={coords.x}
                y={coords.y + 11}
                textAnchor={textAnchor}
                fontSize="9"
                fontWeight="700"
                fontFamily="ui-monospace, monospace"
                fill={themeColor}
              >
                %{axis.score}
              </text>
            </g>
          );
        })}
      </svg>

      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 mt-2 font-mono">
        Mizan 6-Eksenli Şer&apos;i Sağlık Radarı
      </span>
    </div>
  );
};
