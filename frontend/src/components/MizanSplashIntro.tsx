"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatedMizanLogo, MizanLogoVariant, MizanMotionStyle } from "./AnimatedMizanLogo";

const SESSION_SPLASH_KEY = "mizan_opening_intro_seen_v1";

export interface SplashReplayDetail {
  motionStyle?: MizanMotionStyle;
  variant?: MizanLogoVariant;
}

export const triggerMizanSplashReplay = (detail?: SplashReplayDetail) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mizan:replay-splash", { detail }));
  }
};

export const MizanSplashIntro: React.FC = () => {
  const [phase, setPhase] = useState<"hidden" | "entering" | "exiting">("hidden");
  const [motionStyle, setMotionStyle] = useState<MizanMotionStyle>("cinematic");
  const [variant, setVariant] = useState<MizanLogoVariant>("emblem-auto");
  const [replaySeed, setReplaySeed] = useState(0);

  const dismissSplash = useCallback(() => {
    setPhase((current) => {
      if (current === "hidden" || current === "exiting") return current;
      return "exiting";
    });
  }, []);

  // Initial session-gated opening animation
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      sessionStorage.setItem(SESSION_SPLASH_KEY, "1");
      return;
    }

    const alreadySeen = sessionStorage.getItem(SESSION_SPLASH_KEY);
    if (alreadySeen) return;

    sessionStorage.setItem(SESSION_SPLASH_KEY, "1");
    setMotionStyle("cinematic");
    setVariant("emblem-auto");
    setPhase("entering");
  }, []);

  // Listen for manual replay triggers (Polish or Cinematic)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleReplay = (e: Event) => {
      const customEvent = e as CustomEvent<SplashReplayDetail>;
      const nextStyle = customEvent.detail?.motionStyle || "cinematic";
      const nextVariant = customEvent.detail?.variant || "emblem-auto";
      setMotionStyle(nextStyle);
      setVariant(nextVariant);
      setReplaySeed((s) => s + 1);
      setPhase("entering");
    };

    window.addEventListener("mizan:replay-splash", handleReplay);
    return () => window.removeEventListener("mizan:replay-splash", handleReplay);
  }, []);

  // Auto-transition from entering -> subtle exit -> hidden (Extended 3.8s cinematic / 2.6s polish)
  useEffect(() => {
    if (phase === "entering") {
      const holdDuration = motionStyle === "cinematic" ? 3900 : 2600;
      const timer = window.setTimeout(() => {
        setPhase("exiting");
      }, holdDuration);
      return () => window.clearTimeout(timer);
    }

    if (phase === "exiting") {
      const exitDuration = 540;
      const timer = window.setTimeout(() => {
        setPhase("hidden");
      }, exitDuration);
      return () => window.clearTimeout(timer);
    }
  }, [phase, motionStyle, replaySeed]);

  // Escape key instant dismiss (Emil: keyboard actions are immediate)
  useEffect(() => {
    if (phase === "hidden") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        setPhase("hidden");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  if (phase === "hidden") return null;

  const isExiting = phase === "exiting";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Mizan Katılım Yükleniyor"
      onClick={dismissSplash}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#EEF0F4]/95 dark:bg-[#020617]/95 backdrop-blur-2xl cursor-pointer select-none mizan-splash-container"
      style={{
        animation: isExiting
          ? "mizanSplashSubtleExit 520ms var(--ease-subtle-exit) forwards"
          : undefined,
        willChange: "transform, opacity, filter",
      }}
    >
      {/* Subtle Ambient Radial Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#182542]/15 via-[#273869]/10 to-emerald-500/10 dark:from-blue-500/15 dark:via-[#273869]/20 dark:to-emerald-500/10 blur-3xl"
      />

      {/* Center High-Resolution Pure Animated Icon & Brand (No Square Box) */}
      <div className="relative flex flex-col items-center gap-5">
        <AnimatedMizanLogo
          key={replaySeed}
          variant={variant}
          motionStyle={motionStyle}
          size={136}
          showWordmark={false}
        />

        {/* Brand Typography & Subtitle */}
        <div
          className="flex flex-col items-center gap-1.5 mizan-anim-item"
          style={{
            animation:
              motionStyle === "cinematic"
                ? "mizanContainerPolishIn 1400ms var(--ease-cinematic-unfold) 950ms both"
                : "mizanContainerPolishIn 1000ms var(--ease-spring-polish) 550ms both",
          }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#182542] dark:text-white">
              mizan
            </span>
            <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
            <span className="text-sm sm:text-base font-bold text-[#273869] dark:text-slate-300">
              katılım
            </span>
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#6E81A0] dark:text-slate-400">
            BIST Katılım &bull; Fıkhi Finans Radarı
          </span>
        </div>
      </div>
    </div>
  );
};
