"use client";

import React, { useEffect, useRef } from "react";

export const ScrollBackgroundMizanLogo: React.FC = () => {
  const stageWrapperRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const masterEmblemRef = useRef<SVGGElement | null>(null);
  const leftWingRef = useRef<SVGPathElement | null>(null);
  const rightWingGroupRef = useRef<SVGGElement | null>(null);
  const wordmarkGroupRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let rafId = 0;
    let currentScrollY = window.scrollY;
    let targetScrollY = window.scrollY;

    const updateTargetScroll = () => {
      targetScrollY = window.scrollY;
    };

    // Gentle, unhurried sine easing so movement is smooth from start to finish
    const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

    const tick = () => {
      // Smooth, responsive scroll tracking without excessive lag at the bottom
      currentScrollY += (targetScrollY - currentScrollY) * 0.065;
      if (Math.abs(targetScrollY - currentScrollY) < 0.5) {
        currentScrollY = targetScrollY;
      }

      const viewportCenterY = window.innerHeight / 2;
      const stageEl = document.getElementById("mizan-logo-merge-stage");
      const subtitleEl = document.getElementById("mizan-hero-subtitle");

      // Measure actual rendered SVG height scale (viewBox height is 1024)
      const svgRect = svgRef.current ? svgRef.current.getBoundingClientRect() : null;
      const svgHeightPx = svgRect ? svgRect.height : window.innerHeight * 0.72;
      const pxPerViewBoxUnit = svgHeightPx / 1024;
      // 1 local unit inside <g scale(1.62)> in screen pixels:
      const localToPx = 1.62 * pxPerViewBoxUnit;

      // Measure Hero subtitle (<p max-w-2xl>) so leaves sit cleanly in the left & right open spaces
      let subtitleHalfWidthPx = Math.min(336, window.innerWidth * 0.3);
      let convergenceStartScrollY = 120;

      if (subtitleEl) {
        const subRect = subtitleEl.getBoundingClientRect();
        subtitleHalfWidthPx = subRect.width / 2;
        const subDocBottom = window.scrollY + subRect.bottom;
        convergenceStartScrollY = Math.max(
          80,
          subDocBottom - viewportCenterY - 40
        );
      }

      // Compute horizontal spread in local SVG units:
      // At spread = 0, Left Leaf inner edge is 13 local units from center, outer edge is 188 local units from center.
      // 1) Guarantee outer edge NEVER goes off-screen (keep at least 36px inside viewport border)
      const halfViewportW = window.innerWidth / 2;
      const maxSpreadForScreen = Math.max(
        140,
        (halfViewportW - Math.max(32, window.innerWidth * 0.045)) /
          Math.max(0.2, localToPx) -
          188
      );
      // 2) Clear the subtitle's half-width by at least 28px
      const minSpreadForText =
        (subtitleHalfWidthPx + 28) / Math.max(0.2, localToPx) - 13;

      // Place leaf comfortably in the open margin between subtitle and screen edge, strictly clamped inside screen
      const idealSpread =
        minSpreadForText + Math.max(0, (maxSpreadForScreen - minSpreadForText) * 0.45);
      const maxSpreadLocal = Math.min(
        maxSpreadForScreen,
        Math.max(200, idealSpread)
      );

      // Calculate scroll distance where the open merge stage comes into view
      const maxPageScroll = Math.max(
        1200,
        document.documentElement.scrollHeight - window.innerHeight
      );
      let mergeScrollY = maxPageScroll * 0.82;
      let stageOffsetY = 0;

      if (stageEl) {
        const rect = stageEl.getBoundingClientRect();
        const stageCenterY = rect.top + rect.height / 2;
        const stageDocCenterY = window.scrollY + stageCenterY;

        // Finish merging right as the open stage enters the lower-middle of the viewport (65% height)
        // so the logo is already 100% united when looking at the open space
        mergeScrollY = Math.min(
          maxPageScroll * 0.9,
          Math.max(
            convergenceStartScrollY + 900,
            stageDocCenterY - window.innerHeight * 0.65
          )
        );

        // Lock the vertical position of the logo inside #mizan-logo-merge-stage once it reaches center
        // so neither the "7/24 Kesintisiz Veri Hattı" banner above nor the Footer below overlaps it
        if (stageCenterY < viewportCenterY) {
          stageOffsetY = stageCenterY - viewportCenterY;
        }
      }

      if (stageWrapperRef.current) {
        stageWrapperRef.current.style.transform = `translate3d(0px, ${stageOffsetY.toFixed(
          2
        )}px, 0px)`;
      }

      const effectiveScroll = Math.max(0, currentScrollY - convergenceStartScrollY);
      const effectiveSpan = Math.max(700, mergeScrollY - convergenceStartScrollY);
      const rawAssembly = Math.min(1, Math.max(0, effectiveScroll / effectiveSpan));
      const assembled = easeInOutSine(rawAssembly);

      // separation = 1 at top of page (two leaves standing apart outside Hero text),
      // separation = 0 when united inside #mizan-logo-merge-stage
      const separation = 1 - assembled;

      // Keep the united emblem + "mizan katılım" wordmark slightly larger (0.90x) and slightly lower
      // inside #mizan-logo-merge-stage
      if (masterEmblemRef.current) {
        const endScale = 1 - assembled * 0.1;
        const endShiftY = -assembled * 8;
        masterEmblemRef.current.setAttribute(
          "transform",
          `translate(512, ${(512 + endShiftY).toFixed(2)}) scale(${endScale.toFixed(
            4
          )}) translate(-512, -512)`
        );
      }

      // 1. SOL YAPRAK: Uses native SVG transform with explicit (420, 510) pivot so Safari never shifts origin.
      // At top of page (separation = 1), ly = +115 places the leaf lower down beside the subtitle and CTA buttons.
      if (leftWingRef.current) {
        const lx = -maxSpreadLocal * separation;
        const ly = 115 * separation;
        const lRot = -13 * separation;
        leftWingRef.current.setAttribute(
          "transform",
          `translate(${lx.toFixed(2)}, ${ly.toFixed(2)}) rotate(${lRot.toFixed(
            2
          )}, 420, 510)`
        );
      }

      // 2. SAĞ YAPRAK (Taban + Üstündeki Küçük Katlama Parçası Tek Bütün Halinde)
      if (rightWingGroupRef.current) {
        const rx = maxSpreadLocal * separation;
        const ry = 115 * separation;
        const rRot = 13 * separation;
        rightWingGroupRef.current.setAttribute(
          "transform",
          `translate(${rx.toFixed(2)}, ${ry.toFixed(2)}) rotate(${rRot.toFixed(
            2
          )}, 600, 510)`
        );
      }

      // 3. "mizan katılım" WORDMARK (Inside SVG at y=858 right below the united emblem):
      if (wordmarkGroupRef.current) {
        const wordmarkProgress = Math.min(
          1,
          Math.max(0, (assembled - 0.82) / 0.16)
        );
        const wmEase = easeInOutSine(wordmarkProgress);
        const wmY = 858 + (1 - wmEase) * 22;
        wordmarkGroupRef.current.style.opacity = wmEase.toFixed(3);
        wordmarkGroupRef.current.setAttribute(
          "transform",
          `translate(512, ${wmY.toFixed(2)})`
        );
      }

      rafId = window.requestAnimationFrame(tick);
    };

    updateTargetScroll();
    window.addEventListener("scroll", updateTargetScroll, { passive: true });
    window.addEventListener("resize", updateTargetScroll, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", updateTargetScroll);
      window.removeEventListener("resize", updateTargetScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none"
    >
      {/* Full-Viewport Wide Stage — 100% Crisp Opacity (No Fading / No Dimming / No Blur) */}
      <div
        ref={stageWrapperRef}
        style={{ willChange: "transform" }}
        className="w-screen h-screen flex items-center justify-center opacity-100"
      >
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-500 0 2024 1024"
          preserveAspectRatio="xMidYMid meet"
          className="w-auto shrink-0 h-[72vh] sm:h-[78vh] lg:h-[84vh] max-h-[820px] opacity-100 overflow-visible"
        >
          <defs>
            {/* LIGHT MODE: Crisp Pure Black / Obsidian Leaves (logo-dark.svg) */}
            <linearGradient
              id="scrollLeftWingLight"
              x1="320"
              y1="350"
              x2="500"
              y2="660"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient
              id="scrollRightWingLight"
              x1="565"
              y1="630"
              x2="690"
              y2="360"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#475569" />
              <stop offset="30%" stopColor="#334155" />
              <stop offset="65%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient
              id="scrollFlapLight"
              x1="525"
              y1="520"
              x2="574"
              y2="520"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* DARK MODE: Crisp Pure White / Silver Leaves (logo-white.svg) */}
            <linearGradient
              id="scrollLeftWingDark"
              x1="320"
              y1="350"
              x2="500"
              y2="660"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f8fafc" />
              <stop offset="80%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <linearGradient
              id="scrollRightWingDark"
              x1="565"
              y1="630"
              x2="690"
              y2="360"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="25%" stopColor="#cbd5e1" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            <linearGradient
              id="scrollFlapDark"
              x1="525"
              y1="520"
              x2="574"
              y2="520"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          {/* High-Resolution 2-Leaf Mizan Emblem + Wordmark — 100% Sharp & Unfaded */}
          <g ref={masterEmblemRef}>
            <g transform="translate(-317.44, -311.77) scale(1.62)">
              {/* 1. SOL YAPRAK (Native SVG transform around exact 420,510 pivot) */}
              <path
                ref={leftWingRef}
                transform="translate(-310, 115) rotate(-13, 420, 510)"
                className="fill-[url(#scrollLeftWingLight)] dark:fill-[url(#scrollLeftWingDark)]"
                d="M 324 349
                   L 444 421
                   C 492 449.8 499 500 499 510
                   L 499 668
                   L 379 596
                   C 366 588.2 324 565 324 519
                   Z"
              />

              {/* 2. SAĞ YAPRAK (Taban + Üstündeki Küçük Katlama Parçası Tek Bütün Halinde, 600,510 pivot) */}
              <g
                ref={rightWingGroupRef}
                transform="translate(310, 115) rotate(13, 600, 510)"
              >
                <path
                  className="fill-[url(#scrollRightWingLight)] dark:fill-[url(#scrollRightWingDark)]"
                  d="M 700 349
                     L 580 421
                     C 532 449.8 525 500 525 510
                     L 525 668
                     L 645 596
                     C 658 588.2 700 565 700 519
                     Z"
                />
                <path
                  className="fill-[url(#scrollFlapLight)] dark:fill-[url(#scrollFlapDark)]"
                  d="M 603 407
                     C 581 429 574 453 574 475
                     L 574 580
                     C 574 607 569 641.6 525 668
                     L 525 510
                     C 525 500 532 449.8 580 421
                     Z"
                />
              </g>
            </g>

            {/* 3. "mizan katılım" WORDMARK — En sonda birleştiğinde logonun tam altında (y=858) belirir */}
            <g
              ref={wordmarkGroupRef}
              transform="translate(512, 880)"
              style={{ opacity: 0 }}
            >
              <text
                x="0"
                y="0"
                textAnchor="middle"
                style={{
                  fontFamily:
                    '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                <tspan
                  className="fill-[#020617] dark:fill-white"
                  fontWeight="900"
                  fontSize="72"
                  letterSpacing="-0.03em"
                >
                  mizan
                </tspan>
                <tspan dx="16" />
                <tspan
                  className="fill-[#273869] dark:fill-[#cbd5e1]"
                  fontWeight="700"
                  fontSize="42"
                  letterSpacing="-0.01em"
                >
                  katılım
                </tspan>
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
