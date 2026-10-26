"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Sparkles,
  Layers,
  Film,
  Maximize2,
  Eye,
  CheckCircle2,
  Sliders,
  Sun,
  Moon,
  Smartphone,
  Monitor,
} from "lucide-react";
import {
  AnimatedMizanLogo,
  MizanLogoVariant,
  MizanMotionStyle,
} from "@/components/AnimatedMizanLogo";
import { triggerMizanSplashReplay } from "@/components/MizanSplashIntro";
import { StockLogo } from "@/components/StockLogo";
import { useTheme } from "@/lib/theme/ThemeContext";

const VARIANT_OPTIONS: {
  id: MizanLogoVariant;
  label: string;
  sourceFile: string;
  desc: string;
}[] = [
  {
    id: "squircle-dark",
    label: "Midnight Dark Squircle",
    sourceFile: "icon_midnight_dark_squircle.svg",
    desc: "1024×1024 iOS/macOS Squircle (rx=224), derin gece mavisi yüzey ve 3 katmanlı amblem gölgesi.",
  },
  {
    id: "squircle-light",
    label: "Pure Light Squircle",
    sourceFile: "icon_pure_light_squircle.svg",
    desc: "1024×1024 Açık tema Squircle (rx=224), saf beyaz/buzlu yüzey üzerinde lacivert 3B kanatlar.",
  },
  {
    id: "square-dark",
    label: "Midnight Dark Square",
    sourceFile: "icon_midnight_dark_square.svg",
    desc: "1024×1024 Keskin kurumsal ikon (rx=96), koyu tema uygulama ve sosyal medya rozeti.",
  },
  {
    id: "square-light",
    label: "Pure Light Square",
    sourceFile: "icon_pure_light_square.svg",
    desc: "1024×1024 Açık tema kurumsal kare ikon (rx=96), ince kontur ve katlama gölgesi.",
  },
  {
    id: "emblem-auto",
    label: "Şeffaf Vektör Amblem (Oto Tema)",
    sourceFile: "logo-dark.svg / logo-white.svg",
    desc: "440×440 saf geometrik amblem; açık ve koyu temaya göre yüzey gradyanlarını otomatik uyarlar.",
  },
  {
    id: "4k-hybrid",
    label: "4K Ultra-HD + Vektör Hibrit",
    sourceFile: "logo-dark-4k.png / logo-white-4k.png",
    desc: "Vektörel kanat açılışının ardından 4K çözünürlüklü master PNG dokusuna pürüzsüz geçiş.",
  },
];

const SHOWCASE_BIST_TICKERS = [
  { ticker: "BIMAS", name: "BİM Mağazalar" },
  { ticker: "ASELS", name: "Aselsan" },
  { ticker: "TUPRS", name: "Tüpraş" },
  { ticker: "FROTO", name: "Ford Otosan" },
  { ticker: "MAVI", name: "Mavi Giyim" },
  { ticker: "THYAO", name: "Türk Hava Yolları" },
];

export default function LogoAnimationStudioPage() {
  const { isDark, toggleTheme } = useTheme();
  const [selectedVariant, setSelectedVariant] = useState<MizanLogoVariant>("squircle-dark");
  const [selectedMotion, setSelectedMotion] = useState<MizanMotionStyle>("cinematic");
  const [stageFormat, setStageFormat] = useState<"widescreen" | "reels" | "exploded">("widescreen");
  const [replayCounter, setReplayCounter] = useState(1);
  const [showWordmark, setShowWordmark] = useState(true);

  const handleReplay = () => {
    setReplayCounter((c) => c + 1);
  };

  return (
    <div className="min-h-screen bg-[#EEF0F4] dark:bg-[#000000] text-[#14151A] dark:text-[#F1F3F7] py-6 px-4 sm:px-6 lg:px-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4 bg-white/80 dark:bg-[#0A0B0E]/90 backdrop-blur-2xl rounded-[28px] border border-white/80 dark:border-white/10 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 flex items-center justify-center text-[#182542] dark:text-white transition mizan-logo-pressable"
              title="Ana Sayfaya Dön"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#182542] dark:text-white">
                  Mizan Logo Açılış Animasyonu Stüdyosu
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                  4K &amp; Master SVG
                </span>
              </div>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                Jakub Krehel + Emil Kowalski (Polish) &amp; Jhey Tompkins (Cinematic 3D) hareket prensipleriyle tasarlandı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                triggerMizanSplashReplay({
                  motionStyle: "polish",
                  variant: selectedVariant,
                })
              }
              className="px-3.5 py-2 rounded-full bg-white dark:bg-[#141720] border border-slate-200 dark:border-white/10 text-xs font-bold text-[#182542] dark:text-white hover:border-[#273869] transition flex items-center gap-1.5 mizan-logo-pressable"
            >
              <Maximize2 size={13} />
              <span>Splash Test (Polish)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                triggerMizanSplashReplay({
                  motionStyle: "cinematic",
                  variant: selectedVariant,
                })
              }
              className="px-4 py-2 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#182542] text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm mizan-logo-pressable"
            >
              <Film size={13} />
              <span>Tam Ekran Sinematik Açılış</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#182542] dark:text-white transition mizan-logo-pressable"
              title="Tema Değiştir"
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* MAIN GRID: CONTROLS + INTERACTIVE STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: MOTION & ICON CONTROLS */}
          <div className="lg:col-span-4 space-y-5 bg-white/85 dark:bg-[#0A0B0E]/90 backdrop-blur-2xl rounded-[28px] border border-white/90 dark:border-white/10 p-5 shadow-sm">
            {/* 1. Motion Weighting Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-500" />
                <span>1. Hareket Karakteri (Motion Mode)</span>
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMotion("polish");
                    setReplayCounter((c) => c + 1);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition mizan-logo-pressable ${
                    selectedMotion === "polish"
                      ? "bg-[#182542] text-white border-[#182542] dark:bg-white dark:text-[#182542] dark:border-white shadow-sm"
                      : "bg-slate-50/80 dark:bg-white/5 border-slate-200/70 dark:border-white/10 text-[#182542] dark:text-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">
                      Jakub Krehel + Emil Kowalski
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 dark:text-emerald-600">
                      420ms &bull; Spring
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 leading-relaxed ${
                      selectedMotion === "polish"
                        ? "text-slate-200 dark:text-slate-600"
                        : "text-[#6E81A0] dark:text-[#94A3B8]"
                    }`}
                  >
                    Blur(4px→0) + translateY(8px→0) + scale(0.92→1). Bounce: 0 yay fiziğiyle kurumsal, hızlı ve fark edilmeden kusursuzlaşan üretim cilası.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMotion("cinematic");
                    setReplayCounter((c) => c + 1);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition mizan-logo-pressable ${
                    selectedMotion === "cinematic"
                      ? "bg-[#182542] text-white border-[#182542] dark:bg-white dark:text-[#182542] dark:border-white shadow-sm"
                      : "bg-slate-50/80 dark:bg-white/5 border-slate-200/70 dark:border-white/10 text-[#182542] dark:text-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">
                      Jhey Tompkins + Jakub Krehel
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 dark:text-sky-600">
                      950ms &bull; 3D &amp; Shimmer
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 leading-relaxed ${
                      selectedMotion === "cinematic"
                        ? "text-slate-200 dark:text-slate-600"
                        : "text-[#6E81A0] dark:text-[#94A3B8]"
                    }`}
                  >
                    3B perspektif (1000px), squircle kontur çizimi (stroke-dashoffset), origami kanat katlanması ve yüzey ışık süpürmesi (@property).
                  </p>
                </button>
              </div>
            </div>

            {/* 2. High-Res Icon Variant Selector */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] flex items-center gap-1.5">
                <Layers size={13} className="text-sky-500" />
                <span>2. Yüksek Kaliteli İkon Kaynağı</span>
              </label>

              <div className="space-y-2">
                {VARIANT_OPTIONS.map((item) => {
                  const active = selectedVariant === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(item.id);
                        setReplayCounter((c) => c + 1);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left transition flex items-start gap-3 mizan-logo-pressable ${
                        active
                          ? "bg-slate-900/5 dark:bg-white/10 border-[#273869] dark:border-white/40"
                          : "bg-white/60 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/10 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-0.5">
                        <AnimatedMizanLogo
                          variant={item.id}
                          motionStyle="instant"
                          size={32}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-[#182542] dark:text-white truncate">
                            {item.label}
                          </span>
                          {active && (
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[#273869] dark:text-sky-400 block truncate">
                          {item.sourceFile}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Stage View Mode */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] flex items-center gap-1.5">
                <Sliders size={13} className="text-purple-500" />
                <span>3. Sahne &amp; Format Seçimi</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "widescreen", label: "16:9 Sahne", icon: Monitor },
                  { id: "reels", label: "9:16 Reels", icon: Smartphone },
                  { id: "exploded", label: "Katman Analizi", icon: Eye },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const active = stageFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => {
                        setStageFormat(fmt.id as any);
                        setReplayCounter((c) => c + 1);
                      }}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition mizan-logo-pressable ${
                        active
                          ? "bg-[#182542] text-white border-[#182542] dark:bg-white dark:text-[#182542]"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/10 text-[#525E75] dark:text-slate-300"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{fmt.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-[#525E75] dark:text-slate-300">
                  Tipografi (&ldquo;mizan katılım&rdquo;) Göster
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowWordmark((w) => !w);
                    setReplayCounter((c) => c + 1);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                    showWordmark ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                      showWordmark ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE ANIMATION STAGE */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stage Card */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/90 dark:border-white/10 bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#020617] text-white shadow-[0_28px_80px_-15px_rgba(24,37,66,0.35)] p-6 sm:p-10">
              {/* Ambient Glows */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[320px] rounded-full bg-gradient-to-b from-sky-500/15 via-[#273869]/20 to-transparent blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[460px] h-[260px] rounded-full bg-gradient-to-t from-emerald-500/12 via-transparent to-transparent blur-3xl"
              />

              {/* Top Stage Bar */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    {selectedMotion === "polish"
                      ? "Jakub + Emil • Production Spring (420ms)"
                      : "Jhey + Jakub • 3D Origami & Specular Sweep (950ms)"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleReplay}
                  className="px-4 py-2 rounded-full bg-white text-[#0F172A] hover:bg-slate-100 text-xs font-extrabold flex items-center gap-1.5 shadow-md mizan-logo-pressable"
                >
                  <Play size={13} className="fill-current" />
                  <span>Animasyonu Tekrar Oynat</span>
                </button>
              </div>

              {/* STAGE BODY BY FORMAT */}
              {stageFormat === "widescreen" && (
                <div className="relative z-10 py-14 sm:py-20 flex flex-col items-center justify-center text-center gap-8">
                  <AnimatedMizanLogo
                    variant={selectedVariant}
                    motionStyle={selectedMotion}
                    size={168}
                    showWordmark={false}
                    replayKey={replayCounter}
                    replayOnClick
                  />

                  {showWordmark && (
                    <div
                      key={`wm-${replayCounter}`}
                      className="space-y-2 mizan-anim-item"
                      style={{
                        animation:
                          selectedMotion === "cinematic"
                            ? "mizanContainerPolishIn 680ms var(--ease-cinematic-unfold) 360ms both"
                            : "mizanContainerPolishIn 420ms var(--ease-spring-polish) 130ms both",
                      }}
                    >
                      <div className="flex items-baseline justify-center gap-2.5">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                          mizan
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#12B76A]" />
                        <span className="text-lg sm:text-xl font-bold text-slate-300">
                          katılım
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
                        Borsa İstanbul Helal Yatırım &amp; Fıkhi Arındırma Platformu
                      </p>
                    </div>
                  )}

                  {/* High-Res BIST Ecosystem Badges assembling below */}
                  <div
                    key={`bist-${replayCounter}`}
                    className="pt-4 flex flex-wrap items-center justify-center gap-2.5"
                  >
                    {SHOWCASE_BIST_TICKERS.map((s, idx) => (
                      <div
                        key={s.ticker}
                        className="px-3 py-1.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center gap-2 mizan-anim-item"
                        style={{
                          animation: `mizanContainerPolishIn ${
                            selectedMotion === "cinematic" ? 560 : 360
                          }ms var(--ease-spring-polish) ${
                            (selectedMotion === "cinematic" ? 460 : 180) + idx * 55
                          }ms both`,
                        }}
                      >
                        <StockLogo ticker={s.ticker} name={s.name} size="xs" />
                        <span className="text-[11px] font-mono font-bold text-slate-200">
                          {s.ticker}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stageFormat === "reels" && (
                <div className="relative z-10 py-6 flex justify-center">
                  {/* 9:16 Vertical Phone / Reels Frame */}
                  <div className="w-[310px] sm:w-[340px] aspect-[9/16] rounded-[40px] border-4 border-white/15 bg-gradient-to-b from-[#0F172A] via-[#090D16] to-[#020617] shadow-2xl p-6 flex flex-col items-center justify-between relative overflow-hidden">
                    <div className="w-20 h-1.5 rounded-full bg-white/15" />

                    <div className="my-auto flex flex-col items-center text-center gap-6">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>DİB &amp; TKBB Standartlarında</span>
                      </div>

                      <AnimatedMizanLogo
                        variant={selectedVariant}
                        motionStyle={selectedMotion}
                        size={132}
                        showWordmark={false}
                        replayKey={replayCounter}
                        replayOnClick
                      />

                      <div
                        key={`reels-wm-${replayCounter}`}
                        className="space-y-1.5 mizan-anim-item"
                        style={{
                          animation:
                            "mizanContainerPolishIn 600ms var(--ease-cinematic-unfold) 340ms both",
                        }}
                      >
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-3xl font-black tracking-tight text-white">
                            mizan
                          </span>
                          <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
                          <span className="text-sm font-bold text-slate-300">
                            katılım
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-[220px] leading-relaxed">
                          Canlı KAP &amp; SPK Radarı, Fıkhi Hisse Tarama ve Kuruşu Kuruşuna Arındırma
                        </p>
                      </div>
                    </div>

                    <div className="w-full pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>mizanapp.tr</span>
                      <span className="text-emerald-400 font-bold">XKTUM • BIST</span>
                    </div>
                  </div>
                </div>
              )}

              {stageFormat === "exploded" && (
                <div className="relative z-10 py-10 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        step: "Katman 01 • Sol Kanat",
                        timing: selectedMotion === "polish" ? "45ms gecikme • 400ms" : "140ms gecikme • 720ms",
                        desc: "Mizan terazisinin sol kefesini temsil eden dikey geometrik kanat (translate3d + blur -> 0).",
                      },
                      {
                        step: "Katman 02 • Sağ Kanat Tabanı",
                        timing: selectedMotion === "polish" ? "95ms gecikme • 420ms" : "240ms gecikme • 760ms",
                        desc: "Derinlik algısı veren metalik-arduvaz sağ kanat gövdesi, simetrik dengeyi kurar.",
                      },
                      {
                        step: "Katman 03 • Katlama Kulağı (Crease)",
                        timing: selectedMotion === "polish" ? "160ms gecikme • 380ms" : "380ms gecikme • 780ms",
                        desc: "feGaussianBlur + feOffset alt gölgesiyle (creaseShadow) merkeze kilitlenen origami katlaması.",
                      },
                    ].map((layer, idx) => (
                      <div
                        key={layer.step}
                        className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2"
                      >
                        <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                          {layer.timing}
                        </span>
                        <h3 className="text-xs font-extrabold text-white">
                          {layer.step}
                        </h3>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {layer.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-2">
                    <AnimatedMizanLogo
                      variant={selectedVariant}
                      motionStyle={selectedMotion}
                      size={136}
                      showWordmark={false}
                      replayKey={replayCounter}
                      replayOnClick
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SIDE-BY-SIDE COMPARISON STRIP (ALL 4 MASTER SVG ICONS) */}
            <div className="bg-white/85 dark:bg-[#0A0B0E]/90 backdrop-blur-2xl rounded-[28px] border border-white/90 dark:border-white/10 p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-[#182542] dark:text-white">
                    Yüksek Çözünürlüklü Master İkon Koleksiyonu (`logolar/` &amp; `public/brand/`)
                  </h2>
                  <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                    Herhangi bir ikona tıklayarak açılış animasyonunu üzerinde canlı test edebilirsiniz
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(
                  [
                    { id: "squircle-dark", title: "Midnight Squircle", bg: "bg-slate-900" },
                    { id: "squircle-light", title: "Pure Light Squircle", bg: "bg-slate-100 dark:bg-slate-800" },
                    { id: "square-dark", title: "Midnight Square", bg: "bg-slate-900" },
                    { id: "square-light", title: "Pure Light Square", bg: "bg-slate-100 dark:bg-slate-800" },
                  ] as const
                ).map((card) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedVariant(card.id);
                      setReplayCounter((c) => c + 1);
                    }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 hover:border-[#273869] dark:hover:border-white/30 transition flex flex-col items-center gap-3 cursor-pointer mizan-logo-pressable"
                  >
                    <AnimatedMizanLogo
                      variant={card.id}
                      motionStyle={selectedMotion}
                      size={76}
                      replayKey={replayCounter}
                    />
                    <span className="text-xs font-bold text-[#182542] dark:text-white text-center">
                      {card.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
