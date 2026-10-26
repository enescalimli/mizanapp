"use client";

import React, { useEffect, useId, useState } from "react";

export type MizanLogoVariant =
  | "squircle-dark"
  | "squircle-light"
  | "square-dark"
  | "square-light"
  | "emblem-auto"
  | "emblem-dark"
  | "emblem-white"
  | "4k-hybrid";

export type MizanMotionStyle = "polish" | "cinematic" | "instant";

export interface AnimatedMizanLogoProps {
  /** Which high-resolution icon / emblem geometry to render */
  variant?: MizanLogoVariant;
  /**
   * Motion personality:
   * - "polish": Jakub Krehel + Emil Kowalski (360-460ms, blur(4px)->0, scale 0.92->1, spring cubic-bezier(0.22,1,0.36,1))
   * - "cinematic": Jhey Tompkins + Jakub Krehel (850-1050ms, 3D perspective, squircle stroke draw, origami flap fold, light sweep)
   * - "instant": Static / high-frequency zero-animation state
   */
  motionStyle?: MizanMotionStyle;
  /** Pixel dimension of the icon (width & height) */
  size?: number;
  /** Show "mizan katılım" wordmark beside or below the icon */
  showWordmark?: boolean;
  /** Wordmark layout direction */
  wordmarkDirection?: "row" | "column";
  /** Badge text next to mizan */
  badgeText?: string;
  /** Show emerald dot next to mizan */
  showDot?: boolean;
  /** External key to re-trigger the opening animation on demand */
  replayKey?: number;
  /** Allow clicking the logo to replay the animation (useful in showcases) */
  replayOnClick?: boolean;
  /** Additional wrapper className */
  className?: string;
  /** Callback when opening animation finishes */
  onAnimationComplete?: () => void;
}

export const AnimatedMizanLogo: React.FC<AnimatedMizanLogoProps> = ({
  variant = "squircle-dark",
  motionStyle = "polish",
  size = 44,
  showWordmark = false,
  wordmarkDirection = "row",
  badgeText = "katılım",
  showDot = false,
  replayKey = 0,
  replayOnClick = false,
  className = "",
  onAnimationComplete,
}) => {
  const uniqueId = useId().replace(/:/g, "");
  const [internalKey, setInternalKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [is4kLoaded, setIs4kLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const effectiveMotion: MizanMotionStyle = reducedMotion ? "instant" : motionStyle;

  useEffect(() => {
    if (!onAnimationComplete) return;
    const totalMs =
      effectiveMotion === "instant"
        ? 50
        : effectiveMotion === "polish"
          ? 520
          : 1150;
    const timer = window.setTimeout(() => {
      onAnimationComplete();
    }, totalMs);
    return () => window.clearTimeout(timer);
  }, [effectiveMotion, replayKey, internalKey, onAnimationComplete]);

  const isSquircle = variant === "squircle-dark" || variant === "squircle-light";
  const isSquare = variant === "square-dark" || variant === "square-light";
  const hasAppIconFrame = isSquircle || isSquare;
  const isLightIcon = variant === "squircle-light" || variant === "square-light";
  const cornerRadius = isSquircle ? 224 : isSquare ? 96 : 0;

  // Timing tokens per designer weighting
  const containerAnimStyle: React.CSSProperties =
    effectiveMotion === "polish"
      ? {
          animation: `mizanContainerPolishIn 420ms var(--ease-spring-polish) both`,
          willChange: "transform, opacity, filter",
        }
      : effectiveMotion === "cinematic"
        ? {
            animation: `mizanContainerCinematicIn 820ms var(--ease-cinematic-unfold) both`,
            willChange: "transform, opacity, filter",
          }
        : {};

  const leftWingAnimStyle: React.CSSProperties =
    effectiveMotion === "polish"
      ? {
          animation: `mizanLeftWingPolish 400ms var(--ease-spring-polish) 45ms both`,
          transformOrigin: "420px 510px",
          willChange: "transform, opacity, filter",
        }
      : effectiveMotion === "cinematic"
        ? {
            animation: `mizanLeftWingCinematic 720ms var(--ease-cinematic-unfold) 140ms both`,
            transformOrigin: "420px 510px",
            willChange: "transform, opacity, filter",
          }
        : {};

  const rightWingAnimStyle: React.CSSProperties =
    effectiveMotion === "polish"
      ? {
          animation: `mizanRightWingPolish 420ms var(--ease-spring-polish) 95ms both`,
          transformOrigin: "600px 510px",
          willChange: "transform, opacity, filter",
        }
      : effectiveMotion === "cinematic"
        ? {
            animation: `mizanRightWingCinematic 760ms var(--ease-cinematic-unfold) 240ms both`,
            transformOrigin: "600px 510px",
            willChange: "transform, opacity, filter",
          }
        : {};

  const flapAnimStyle: React.CSSProperties =
    effectiveMotion === "polish"
      ? {
          animation: `mizanFlapCreasePolish 380ms var(--ease-spring-polish) 160ms both`,
          transformOrigin: "525px 540px",
          willChange: "transform, opacity, filter",
        }
      : effectiveMotion === "cinematic"
        ? {
            animation: `mizanFlapOrigamiFold 780ms var(--ease-cinematic-unfold) 380ms both`,
            transformOrigin: "525px 540px",
            willChange: "transform, opacity, filter",
          }
        : {};

  const strokeDrawStyle: React.CSSProperties =
    effectiveMotion === "cinematic"
      ? {
          strokeDasharray: 3600,
          animation: `mizanSquircleStrokeDraw 950ms var(--ease-cinematic-unfold) 60ms both`,
        }
      : {};

  const wordmarkAnimStyle: React.CSSProperties =
    effectiveMotion === "polish"
      ? {
          animation: `mizanContainerPolishIn 420ms var(--ease-spring-polish) 140ms both`,
        }
      : effectiveMotion === "cinematic"
        ? {
            animation: `mizanContainerPolishIn 680ms var(--ease-cinematic-unfold) 360ms both`,
          }
        : {};

  return (
    <div
      key={`${replayKey}-${internalKey}`}
      onClick={
        replayOnClick
          ? () => {
              setInternalKey((k) => k + 1);
            }
          : undefined
      }
      className={`inline-flex ${
        wordmarkDirection === "column"
          ? "flex-col items-center text-center gap-3"
          : "items-center gap-2.5"
      } select-none ${replayOnClick ? "cursor-pointer mizan-logo-pressable" : ""} ${className}`}
      title={replayOnClick ? "Animasyonu tekrar oynatmak için tıklayın" : undefined}
    >
      {/* ICON / EMBLEM CONTAINER */}
      <div
        className="relative shrink-0 flex items-center justify-center mizan-anim-item"
        style={{
          width: size,
          height: size,
          ...containerAnimStyle,
        }}
      >
        {hasAppIconFrame ? (
          /* =============================================================== */
          /* HIGH-QUALITY SQUIRCLE / SQUARE APP ICON (1024x1024 Master SVG)  */
          /* =============================================================== */
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              borderRadius: isSquircle ? `${Math.round(size * 0.22)}px` : `${Math.round(size * 0.12)}px`,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              className="w-full h-full block"
              aria-label="Mizan Katılım İkonu"
            >
              <defs>
                {isLightIcon ? (
                  <>
                    <linearGradient id={`bgGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#f1f5f9" />
                    </linearGradient>
                    <linearGradient id={`borderGrad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.45" />
                    </linearGradient>
                    <linearGradient
                      id={`emblemSurface-${uniqueId}`}
                      x1="320"
                      y1="350"
                      x2="500"
                      y2="660"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#182542" />
                      <stop offset="55%" stopColor="#273869" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient
                      id={`rightBaseSurface-${uniqueId}`}
                      x1="565"
                      y1="630"
                      x2="690"
                      y2="360"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="35%" stopColor="#334155" />
                      <stop offset="75%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient
                      id={`flapSurface-${uniqueId}`}
                      x1="525"
                      y1="520"
                      x2="574"
                      y2="520"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#273869" />
                      <stop offset="100%" stopColor="#182542" />
                    </linearGradient>
                    <filter id={`emblemFloat-${uniqueId}`} x="-40%" y="-40%" width="180%" height="180%">
                      <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="#182542" floodOpacity="0.2" />
                      <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#182542" floodOpacity="0.12" />
                    </filter>
                    <filter id={`creaseShadow-${uniqueId}`} x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                      <feOffset in="blur" dx="3" dy="1" result="offset" />
                      <feFlood floodColor="#020617" floodOpacity="0.32" result="color" />
                      <feComposite in="color" in2="offset" operator="in" result="shadow" />
                      <feMerge>
                        <feMergeNode in="shadow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </>
                ) : (
                  <>
                    <linearGradient id={`bgGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#111827" />
                      <stop offset="50%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#020617" />
                    </linearGradient>
                    <linearGradient id={`borderGrad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.42" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
                    </linearGradient>
                    <linearGradient
                      id={`emblemSurface-${uniqueId}`}
                      x1="320"
                      y1="350"
                      x2="500"
                      y2="660"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="40%" stopColor="#f8fafc" />
                      <stop offset="75%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                    <linearGradient
                      id={`rightBaseSurface-${uniqueId}`}
                      x1="565"
                      y1="630"
                      x2="690"
                      y2="360"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="20%" stopColor="#cbd5e1" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                      <stop offset="80%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                    <linearGradient
                      id={`flapSurface-${uniqueId}`}
                      x1="525"
                      y1="520"
                      x2="574"
                      y2="520"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="75%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f1f5f9" />
                    </linearGradient>
                    <filter id={`emblemFloat-${uniqueId}`} x="-40%" y="-40%" width="180%" height="180%">
                      <feDropShadow dx="0" dy="20" stdDeviation="24" floodColor="#000000" floodOpacity="0.6" />
                      <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.35" />
                    </filter>
                    <filter id={`creaseShadow-${uniqueId}`} x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                      <feOffset in="blur" dx="4" dy="1" result="offset" />
                      <feFlood floodColor="#020617" floodOpacity="0.4" result="color" />
                      <feComposite in="color" in2="offset" operator="in" result="shadow" />
                      <feMerge>
                        <feMergeNode in="shadow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </>
                )}
              </defs>

              {/* Base Squircle / Square Surface */}
              <rect width="1024" height="1024" rx={cornerRadius} fill={`url(#bgGrad-${uniqueId})`} />

              {/* Animated Precision Hairline Contour */}
              <rect
                width="1020"
                height="1020"
                x="2"
                y="2"
                rx={cornerRadius - 1}
                fill="none"
                stroke={`url(#borderGrad-${uniqueId})`}
                strokeWidth={effectiveMotion === "cinematic" ? "6" : "3"}
                className="mizan-anim-stroke"
                style={strokeDrawStyle}
              />

              {/* Three-Part Geometric Mizan Emblem */}
              <g transform="translate(-317.44, -311.77) scale(1.62)" filter={`url(#emblemFloat-${uniqueId})`}>
                {/* 1. Left Wing */}
                <path
                  className="mizan-anim-wing-left"
                  style={leftWingAnimStyle}
                  d="M 324 349
                     L 444 421
                     C 492 449.8 499 500 499 510
                     L 499 668
                     L 379 596
                     C 366 588.2 324 565 324 519
                     Z"
                  fill={`url(#emblemSurface-${uniqueId})`}
                />

                {/* 2. Right Wing Base */}
                <path
                  className="mizan-anim-wing-right"
                  style={rightWingAnimStyle}
                  d="M 700 349
                     L 580 421
                     C 532 449.8 525 500 525 510
                     L 525 668
                     L 645 596
                     C 658 588.2 700 565 700 519
                     Z"
                  fill={`url(#rightBaseSurface-${uniqueId})`}
                />

                {/* 3. Right Wing Origami Fold Flap */}
                <path
                  className="mizan-anim-wing-flap"
                  style={flapAnimStyle}
                  d="M 603 407
                     C 581 429 574 453 574 475
                     L 574 580
                     C 574 607 569 641.6 525 668
                     L 525 510
                     C 525 500 532 449.8 580 421
                     Z"
                  fill={`url(#flapSurface-${uniqueId})`}
                  filter={`url(#creaseShadow-${uniqueId})`}
                />
              </g>
            </svg>

            {/* Specular Light Sweep Overlay (Cinematic Jhey + Jakub Mode) */}
            {effectiveMotion === "cinematic" && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 mizan-anim-sweep"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%)",
                  animation: "mizanLightSweep 900ms var(--ease-cinematic-unfold) 420ms both",
                }}
              />
            )}
          </div>
        ) : (
          /* =============================================================== */
          /* TRANSPARENT EMBLEM (logo-dark.svg / logo-white.svg / 4K Hybrid) */
          /* =============================================================== */
          <div className="relative w-full h-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="292 288.5 440 440"
              className={`w-full h-full block transition-opacity duration-300 ${
                variant === "4k-hybrid" && is4kLoaded ? "opacity-0" : "opacity-100"
              } ${
                variant === "emblem-auto"
                  ? "text-[#0f172a] dark:text-white"
                  : variant === "emblem-white"
                    ? "text-white"
                    : "text-[#0f172a]"
              }`}
              aria-label="Mizan Katılım Amblemi"
            >
              <defs>
                {/* Dark Mode / White Emblem Surface Gradients */}
                <linearGradient
                  id={`whiteLeft-${uniqueId}`}
                  x1="320"
                  y1="350"
                  x2="500"
                  y2="660"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#f8fafc" />
                  <stop offset="75%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient
                  id={`whiteRightBase-${uniqueId}`}
                  x1="565"
                  y1="630"
                  x2="690"
                  y2="360"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="20%" stopColor="#cbd5e1" />
                  <stop offset="50%" stopColor="#e2e8f0" />
                  <stop offset="80%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                <linearGradient
                  id={`whiteFlap-${uniqueId}`}
                  x1="525"
                  y1="520"
                  x2="574"
                  y2="520"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="75%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>

                {/* Light Mode / Navy Emblem Surface Gradients */}
                <linearGradient
                  id={`navyRightBase-${uniqueId}`}
                  x1="565"
                  y1="630"
                  x2="685"
                  y2="370"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="25%" stopColor="#334155" />
                  <stop offset="60%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                <filter id={`emblemCrease-${uniqueId}`} x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
                  <feOffset in="blur" dx="3" dy="1" result="offset" />
                  <feFlood floodColor="#020617" floodOpacity="0.38" result="color" />
                  <feComposite in="color" in2="offset" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Light-theme Navy Group (shown when emblem-dark or light mode in emblem-auto) */}
              <g
                className={
                  variant === "emblem-auto"
                    ? "block dark:hidden"
                    : variant === "emblem-white"
                      ? "hidden"
                      : "block"
                }
              >
                <path
                  className="mizan-anim-wing-left"
                  style={leftWingAnimStyle}
                  d="M 324 349 L 444 421 C 492 449.8 499 500 499 510 L 499 668 L 379 596 C 366 588.2 324 565 324 519 Z"
                  fill="#0f172a"
                />
                <path
                  className="mizan-anim-wing-right"
                  style={rightWingAnimStyle}
                  d="M 700 349 L 580 421 C 532 449.8 525 500 525 510 L 525 668 L 645 596 C 658 588.2 700 565 700 519 Z"
                  fill={`url(#navyRightBase-${uniqueId})`}
                />
                <path
                  className="mizan-anim-wing-flap"
                  style={flapAnimStyle}
                  d="M 603 407 C 581 429 574 453 574 475 L 574 580 C 574 607 569 641.6 525 668 L 525 510 C 525 500 532 449.8 580 421 Z"
                  fill="#1e293b"
                  filter={`url(#emblemCrease-${uniqueId})`}
                />
              </g>

              {/* Dark-theme White Group (shown when emblem-white or dark mode in emblem-auto) */}
              <g
                className={
                  variant === "emblem-auto"
                    ? "hidden dark:block"
                    : variant === "emblem-white"
                      ? "block"
                      : "hidden"
                }
              >
                <path
                  className="mizan-anim-wing-left"
                  style={leftWingAnimStyle}
                  d="M 324 349 L 444 421 C 492 449.8 499 500 499 510 L 499 668 L 379 596 C 366 588.2 324 565 324 519 Z"
                  fill={`url(#whiteLeft-${uniqueId})`}
                />
                <path
                  className="mizan-anim-wing-right"
                  style={rightWingAnimStyle}
                  d="M 700 349 L 580 421 C 532 449.8 525 500 525 510 L 525 668 L 645 596 C 658 588.2 700 565 700 519 Z"
                  fill={`url(#whiteRightBase-${uniqueId})`}
                />
                <path
                  className="mizan-anim-wing-flap"
                  style={flapAnimStyle}
                  d="M 603 407 C 581 429 574 453 574 475 L 574 580 C 574 607 569 641.6 525 668 L 525 510 C 525 500 532 449.8 580 421 Z"
                  fill={`url(#whiteFlap-${uniqueId})`}
                  filter={`url(#emblemCrease-${uniqueId})`}
                />
              </g>
            </svg>

            {/* Optional 4K Ultra-HD PNG Layer for "4k-hybrid" after vector assembly */}
            {variant === "4k-hybrid" && (
              <>
                <img
                  src="/brand/logo-dark-4k.png"
                  alt="Mizan 4K Dark"
                  onLoad={() => setIs4kLoaded(true)}
                  className={`absolute inset-0 w-full h-full object-contain dark:hidden transition-opacity duration-500 ${
                    is4kLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
                <img
                  src="/brand/logo-white-4k.png"
                  alt="Mizan 4K White"
                  onLoad={() => setIs4kLoaded(true)}
                  className={`absolute inset-0 w-full h-full object-contain hidden dark:block transition-opacity duration-500 ${
                    is4kLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* OPTIONAL WORDMARK ("mizan katılım") */}
      {showWordmark && (
        <div
          className={`flex items-baseline gap-1.5 mizan-anim-item ${
            wordmarkDirection === "column" ? "justify-center" : ""
          }`}
          style={wordmarkAnimStyle}
        >
          <span
            className="font-black tracking-tight text-[#182542] dark:text-white leading-none"
            style={{
              fontSize: Math.max(18, Math.round(size * 0.56)),
            }}
          >
            mizan
          </span>
          {showDot && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] inline-block shrink-0" />
          )}
          {badgeText && (
            <span
              className="font-bold text-[#273869] dark:text-slate-300 leading-none"
              style={{
                fontSize: Math.max(11, Math.round(size * 0.3)),
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
