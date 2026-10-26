"use client";

import React, { useEffect, useRef } from "react";

export const ScrollBackgroundMizanLogo: React.FC = () => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const leftWingRef = useRef<SVGPathElement | null>(null);
  const rightWingRef = useRef<SVGPathElement | null>(null);
  const flapWingRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let rafId = 0;
    let currentProgress = 0;
    let targetProgress = 0;

    const updateTargetScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      targetProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    const tick = () => {
      // Smooth spring-like damping interpolation (60/120fps direct DOM transform)
      const diff = targetProgress - currentProgress;
      currentProgress += diff * 0.065;

      const p = currentProgress;
      // Smooth wave 0 -> 1 -> 0 for graceful 3D wing separation & re-convergence
      const explodeFactor = Math.sin(p * Math.PI);
      // Secondary harmonic wave for subtle "Mizan" (balance scale) motion
      const balanceWave = Math.sin(p * Math.PI * 2);

      if (stageRef.current) {
        const rotX = 14 * explodeFactor - 4 * balanceWave;
        const rotY = -18 * explodeFactor + 8 * Math.sin(p * Math.PI * 1.5);
        const rotZ = (p - 0.5) * 14;
        const scale = 1 + 0.14 * explodeFactor;
        const translateY = (p - 0.5) * -55;

        stageRef.current.style.transform = `perspective(1400px) translate3d(0px, ${translateY.toFixed(
          1
        )}px, 0px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(
          2
        )}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      }

      if (leftWingRef.current) {
        const lx = -48 * explodeFactor - 10 * balanceWave;
        const ly = 20 * explodeFactor + 12 * balanceWave;
        const lRot = -7 * explodeFactor - 2.5 * balanceWave;
        leftWingRef.current.style.transform = `translate3d(${lx.toFixed(
          1
        )}px, ${ly.toFixed(1)}px, 0px) rotate(${lRot.toFixed(2)}deg)`;
      }

      if (rightWingRef.current) {
        const rx = 48 * explodeFactor + 10 * balanceWave;
        const ry = 20 * explodeFactor - 12 * balanceWave;
        const rRot = 7 * explodeFactor + 2.5 * balanceWave;
        rightWingRef.current.style.transform = `translate3d(${rx.toFixed(
          1
        )}px, ${ry.toFixed(1)}px, 0px) rotate(${rRot.toFixed(2)}deg)`;
      }

      if (flapWingRef.current) {
        const fx = 22 * explodeFactor;
        const fy = -32 * explodeFactor + 6 * balanceWave;
        const fRot = 9 * explodeFactor;
        const fScale = 1 + 0.05 * explodeFactor;
        flapWingRef.current.style.transform = `translate3d(${fx.toFixed(
          1
        )}px, ${fy.toFixed(1)}px, 0px) rotate(${fRot.toFixed(
          2
        )}deg) scale(${fScale.toFixed(3)})`;
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
      {/* 3D Scroll-Driven Pure Transparent Mizan Emblem Stage */}
      <div
        ref={stageRef}
        className="relative w-[420px] h-[420px] sm:w-[580px] sm:h-[580px] lg:w-[680px] lg:h-[680px] flex items-center justify-center opacity-[0.13] dark:opacity-[0.16] transition-opacity duration-500"
        style={{ willChange: "transform" }}
      >
        {/* 4.2s Extended Opening Animation Wrapper */}
        <div
          className="w-full h-full relative"
          style={{
            animation:
              "mizanContainerCinematicIn 2600ms var(--ease-cinematic-unfold) both",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="292 288.5 440 440"
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* LIGHT MODE: Pure Obsidian / Black Emblem Gradients (logo-dark.svg) */}
              <linearGradient
                id="mizanBlackLeftGrad"
                x1="320"
                y1="350"
                x2="500"
                y2="660"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#020617" />
                <stop offset="55%" stopColor="#090d16" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient
                id="mizanBlackRightBaseGrad"
                x1="565"
                y1="630"
                x2="685"
                y2="370"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#334155" />
                <stop offset="35%" stopColor="#1e293b" />
                <stop offset="70%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              <linearGradient
                id="mizanBlackFlapGrad"
                x1="525"
                y1="520"
                x2="574"
                y2="520"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* DARK MODE: Pure White / Silver Emblem Gradients (logo-white.svg) */}
              <linearGradient
                id="mizanWhiteLeftGrad"
                x1="320"
                y1="350"
                x2="500"
                y2="660"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>

              <linearGradient
                id="mizanWhiteRightBaseGrad"
                x1="565"
                y1="630"
                x2="690"
                y2="360"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="30%" stopColor="#cbd5e1" />
                <stop offset="75%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              <linearGradient
                id="mizanWhiteFlapGrad"
                x1="525"
                y1="520"
                x2="574"
                y2="520"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>

              <filter id="mizanCreaseDepth" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                <feOffset in="blur" dx="4" dy="2" result="offset" />
                <feFlood floodColor="#000000" floodOpacity="0.38" result="color" />
                <feComposite in="color" in2="offset" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. LEFT WING */}
            <g
              style={{
                animation:
                  "mizanLeftWingCinematic 2400ms var(--ease-cinematic-unfold) 350ms both",
                transformOrigin: "420px 510px",
              }}
            >
              <path
                ref={leftWingRef}
                style={{ transformOrigin: "420px 510px", willChange: "transform" }}
                className="fill-[url(#mizanBlackLeftGrad)] dark:fill-[url(#mizanWhiteLeftGrad)]"
                d="M 324 349
                   L 444 421
                   C 492 449.8 499 500 499 510
                   L 499 668
                   L 379 596
                   C 366 588.2 324 565 324 519
                   Z"
              />
            </g>

            {/* 2. RIGHT WING BASE */}
            <g
              style={{
                animation:
                  "mizanRightWingCinematic 2600ms var(--ease-cinematic-unfold) 850ms both",
                transformOrigin: "600px 510px",
              }}
            >
              <path
                ref={rightWingRef}
                style={{ transformOrigin: "600px 510px", willChange: "transform" }}
                className="fill-[url(#mizanBlackRightBaseGrad)] dark:fill-[url(#mizanWhiteRightBaseGrad)]"
                d="M 700 349
                   L 580 421
                   C 532 449.8 525 500 525 510
                   L 525 668
                   L 645 596
                   C 658 588.2 700 565 700 519
                   Z"
              />
            </g>

            {/* 3. RIGHT WING ORIGAMI FOLD FLAP */}
            <g
              style={{
                animation:
                  "mizanFlapOrigamiFold 2500ms var(--ease-cinematic-unfold) 1450ms both",
                transformOrigin: "525px 540px",
              }}
            >
              <path
                ref={flapWingRef}
                style={{ transformOrigin: "525px 540px", willChange: "transform" }}
                className="fill-[url(#mizanBlackFlapGrad)] dark:fill-[url(#mizanWhiteFlapGrad)]"
                filter="url(#mizanCreaseDepth)"
                d="M 603 407
                   C 581 429 574 453 574 475
                   L 574 580
                   C 574 607 569 641.6 525 668
                   L 525 510
                   C 525 500 532 449.8 580 421
                   Z"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
