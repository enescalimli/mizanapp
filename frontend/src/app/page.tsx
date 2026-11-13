"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  BarChart3,
  TrendingUp,
  Coins,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  ExternalLink,
  ChevronDown,
  Layers,
  Award,
  Zap,
  Lock,
  PieChart,
  ArrowUpRight,
  Sun,
  Moon,
  Smartphone,
  ChevronRight,
  Calendar,
  Building2,
  Radio,
  FileText,
  Activity,
  Bot,
  Bell,
} from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";
import { StockLogo } from "@/components/StockLogo";
import { AnimatedMizanLogo } from "@/components/AnimatedMizanLogo";
import { ScrollBackgroundMizanLogo } from "@/components/landing/ScrollBackgroundMizanLogo";
import { InstitutionalLogosSection } from "@/components/landing/InstitutionalLogosSection";

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();

  // Sadece Android APK içinden açıldığında uygulama karşılama veya panosuna yönlendir
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      navigator.userAgent.includes("MizanAppAndroid") ||
      window.location.search.includes("mode=app")
    ) {
      try {
        const savedAuth = localStorage.getItem("mizanapp_demo_auth");
        if (savedAuth && JSON.parse(savedAuth)?.email) {
          window.location.replace("/dashboard");
          return;
        }
      } catch {
        // ignore
      }
      window.location.replace("/mobile");
    }
  }, []);

  // Active interactive showcase tab
  const [activeFeatureTab, setActiveFeatureTab] = useState<
    "KAP_SPK" | "AI_ASISTAN" | "TARAYICI" | "ARINDIRMA" | "KARNE" | "HALKA_ARZ"
  >("KAP_SPK");

  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Sample stocks for live ticker ribbon
  const ribbonStocks = useMemo(() => {
    const list = [
      { ticker: "BIMAS", name: "BİM Birleşik Mağazalar", price: "540.00", change: "+2.40%", isOk: true, ratio: "%1.32 Borç" },
      { ticker: "THYAO", name: "Türk Hava Yolları", price: "259.00", change: "-2.26%", isOk: false, ratio: "Katılım Dışı" },
      { ticker: "ASELS", name: "Aselsan Elektronik", price: "64.20", change: "+0.85%", isOk: true, ratio: "%8.45 Borç" },
      { ticker: "AAGYO", name: "Ağaoğlu Avrasya GYO", price: "7.41", change: "-0.40%", isOk: false, ratio: "Gelir %29.28" },
      { ticker: "TUPRS", name: "Tüpraş Rafinerileri", price: "172.80", change: "+3.10%", isOk: true, ratio: "%4.10 Borç" },
      { ticker: "FROTO", name: "Ford Otomotiv", price: "1085.00", change: "+1.65%", isOk: true, ratio: "%19.4 Borç" },
      { ticker: "KCHOL", name: "Koç Holding", price: "188.50", change: "-1.20%", isOk: false, ratio: "İştirak İhlali" },
      { ticker: "MAVI", name: "Mavi Giyim", price: "114.30", change: "+0.90%", isOk: true, ratio: "%4.10 Borç" },
      { ticker: "BETAE", name: "Beta Enerji", price: "47.00", change: "+4.20%", isOk: true, ratio: "%0.00 Borç" },
      { ticker: "GARAN", name: "Garanti BBVA", price: "118.00", change: "+1.05%", isOk: false, ratio: "Faizli Finans" },
    ];
    return [...list, ...list]; // duplicate for seamless ticker
  }, []);

  const faqs = [
    {
      q: "BIST Katılım Endeksi (XKTUM) nedir ve hisseler nasıl seçilir?",
      a: "Borsa İstanbul Katılım Endeksi, Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu ve Türkiye Katılım Bankaları Birliği (TKBB) Danışma Kurulu standartlarına göre oluşturulan resmi borsa endeksidir. Şirketlerin ana faaliyet alanlarının helal olması (faizli finans, alkol, kumar, domuz mamulleri içermemesi), faizli borçlarının toplam aktiflere oranının <%33, faiz getiren nakit varlıklarının <%33 ve gayrimeşru gelirlerinin <%5 olması şartı aranır.",
    },
    {
      q: "Temettü ve hisse arındırması (Tathir) zorunlu mudur, nasıl hesaplanır?",
      a: "Katılım finans fıkhına göre, şirketin ana faaliyeti meşru olsa bile ticari mevduatından veya gecikme cezalarından kaynaklanan cüzi faiz/nema gelirleri bulunabilir. Yatırımcı, elde ettiği temettü ve sermaye kazancının şirketin KAP Katılım Formu'ndaki uygunsuz gelir oranına tekabül eden kısmını mülkiyet iddia etmeksizin hayır kurumlarına aktararak arındırır. Mizan, portföyünüzdeki bu tutarı kuruşu kuruşuna otomatik hesaplar.",
    },
    {
      q: "Mizan platformunu kullanmak ücretli mi?",
      a: "Temel BIST Katılım tarayıcısı, hisselerin fıkhi uygunluk durumu, örnek hisse incelemeleri ve halka arz takvimi tamamen ücretsizdir. Kapsamlı kuruşu kuruşuna portföy arındırma defteri, Fintables düzeyinde 24 kriterli şirket karnesi ve derinlemesine bilanço dipnot analizleri ise Mizan PRO abonelerine sunulmaktadır.",
    },
    {
      q: "Bilanço ve hisse verileri ne sıklıkla güncellenir?",
      a: "Mizan, Borsa İstanbul canlı seans verilerini ve KAP (Kamuyu Aydınlatma Platformu) XBRL şirket bildirimlerini 7/24 anlık olarak dinler. Şirketlerin 3, 6, 9 ve 12 aylık finansal tabloları yayımlandığı anda fıkhi rasyolar ve şirket karneleri otomatik olarak güncellenir.",
    },
    {
      q: "Katılım dışı bir hisse sonradan helal olabilir mi?",
      a: "Evet. Şirketler faizli banka kredilerini kapattıklarında, mevduatlarını faizsiz katılım hesaplarına taşıdıklarında veya piyasa değerleri yükselip borç oranları %33 tavanının altına indiğinde bir sonraki çeyrekte yeniden Katılım Endeksi'ne (XKTUM) dahil olabilirler.",
    },
    {
      q: "AAGYO gibi yeni halka arzlarda rasyolar neden özel inceleniyor?",
      a: "Yeni halka arz edilen şirketlerin geçmiş verileri kısıtlı olduğundan Mizan, doğrudan şirketin KAP'ta yayımlanan Katılım Finansı İlkeleri Bilgi Formu (KAFİF) ve izahname bilançosunu baz alır. Örneğin AAGYO'nun sıfır faizli borcu ve 0.31 PD/DD değeri resmi defter kayıtlarıyla doğrulanarak fıkhi ve finansal teşhisi yapılır.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#F4F5F7] dark:bg-[#08080C] text-[#08080C] dark:text-white selection:bg-[#C6F432] selection:text-[#08080C] transition-colors duration-200">
      {/* =================================================================== */}
      {/* 0. SCROLL-DRIVEN 3D BACKGROUND MIZAN LOGO CANVAS                    */}
      {/* =================================================================== */}
      <ScrollBackgroundMizanLogo />

      {/* =================================================================== */}
      {/* 1. NORTHLINE 60-30-10 FROSTED NAVBAR                                */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-[#08080C]/85 border-b border-black/[0.06] dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Marka */}
          <Link href="/" className="inline-flex items-center gap-3 group shrink-0 mizan-logo-pressable">
            <div className="w-9 h-9 sm:w-10 sm:h-10 overflow-visible group-hover:scale-105 transition-transform duration-200 shrink-0 flex items-center justify-center">
              <AnimatedMizanLogo
                variant="emblem-auto"
                motionStyle="polish"
                size={36}
                showWordmark={false}
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#08080C] dark:text-white">
                mizan
              </span>
              <span className="text-xs font-bold text-[#10B981] dark:text-slate-300">
                katılım
              </span>
            </div>
          </Link>

          {/* Menü Linkleri (Masaüstü - Landing Tanıtım ve Önizleme Bölümleri) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { label: "KAP & SPK", href: "#ozellikler", tab: "KAP_SPK" },
              { label: "AI Asistan", href: "#ozellikler", tab: "AI_ASISTAN" },
              { label: "Hisse Tarayıcı", href: "#ozellikler", tab: "TARAYICI" },
              { label: "Halka Arzlar", href: "#ozellikler", tab: "HALKA_ARZ" },
              { label: "Arındırma & Zekat", href: "#ozellikler", tab: "ARINDIRMA" },
              { label: "Fıkhi Standartlar", href: "#standartlar" },
              { label: "SSS", href: "#sss" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (item.tab) setActiveFeatureTab(item.tab as any);
                }}
                className="px-3.5 py-2 rounded-full text-xs xl:text-sm font-semibold text-[#525E75] dark:text-[#94A3B8] hover:text-[#08080C] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Sağ Aksiyonlar */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Dark Mode Butonu */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-[#08080C] dark:text-white transition cursor-pointer"
              title={isDark ? "Açık Moda Geç" : "Koyu Moda Geç"}
              aria-label="Tema Değiştir"
            >
              {isDark ? <Sun size={17} className="text-[#C6F432]" /> : <Moon size={17} />}
            </button>

            {/* Giriş Yap */}
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-bold text-[#08080C] dark:text-white hover:opacity-80 transition"
            >
              Giriş Yap
            </Link>

            {/* 60-30-10 Single Dominant Accent CTA */}
            <Link
              href="/auth/login"
              className="px-4 sm:px-5 py-2.5 rounded-full mizan-accent-btn text-xs sm:text-sm font-extrabold flex items-center gap-1.5"
            >
              <span>Uygulamaya Git</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. HERO SECTION (Northline 60-30-10 Editorial & Lime Glow)          */}
      {/* =================================================================== */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-24">
        
        {/* 60-30-10 Atmosferik Arka Plan Işığı (%10 Northline Lime Glow) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[540px] mizan-glow-bg rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col items-center">
            {/* Flanking Northline KPI Metrics (Desktop Left) */}
            <div className="hidden lg:flex flex-col gap-10 absolute left-0 top-12 text-left select-none">
              <div>
                <div className="text-3xl font-black font-mono tracking-tight text-[#08080C] dark:text-white">
                  450+
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E81A0] dark:text-zinc-400">
                  BIST Şirket Taraması
                </div>
              </div>
              <div>
                <div className="text-3xl font-black font-mono tracking-tight text-[#10B981] dark:text-[#C6F432]">
                  %100
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E81A0] dark:text-zinc-400">
                  DİB &amp; TKBB Standartı
                </div>
              </div>
            </div>

            {/* Flanking Northline KPI Metrics (Desktop Right) */}
            <div className="hidden lg:flex flex-col gap-10 absolute right-0 top-12 text-right select-none">
              <div>
                <div className="text-3xl font-black font-mono tracking-tight text-[#08080C] dark:text-white">
                  &lt; 1sn
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E81A0] dark:text-zinc-400">
                  Canlı KAP &amp; SPK Akışı
                </div>
              </div>
              <div>
                <div className="text-3xl font-black font-mono tracking-tight text-[#10B981] dark:text-[#C6F432]">
                  7/24
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E81A0] dark:text-zinc-400">
                  Mizan AI Analiz Motoru
                </div>
              </div>
            </div>

            <div
              id="mizan-hero-text-block"
              className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-5 sm:space-y-6"
            >
              {/* Hero Centerpiece Pure Mizan Emblem Icon */}
              <div className="flex flex-col items-center gap-3">
                <AnimatedMizanLogo
                  variant="emblem-auto"
                  motionStyle="cinematic"
                  size={64}
                  showWordmark={false}
                  replayOnClick
                />

                {/* Top Pill Eyebrow with Lime Beacon */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 dark:bg-[#101118] backdrop-blur-md border border-slate-200/80 dark:border-white/[0.1] shadow-sm text-[11px] font-bold tracking-wide text-[#08080C] dark:text-white">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: "var(--mizan-accent-10)" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: "var(--mizan-accent-10)" }}
                    />
                  </span>
                  <span>CANLI KAP &bull; MİZAN AI &bull; BIST KATILIM TARAMASI</span>
                </div>
              </div>

              {/* Bold Editorial Headline (Northline: Sans-Serif + İtalik Serif %10 Lime Vurgu) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-[-0.035em] text-[#08080C] dark:text-white leading-[1.06]">
                Borsa İstanbul’da{" "}
                <span className="font-orbix-serif italic font-semibold text-[#10B981] dark:text-[#C6F432]">
                  Helal Yatırımın
                </span>{" "}
                Dijital Zekâsı.
              </h1>

              {/* Subtitle */}
              <p
                id="mizan-hero-subtitle"
                className="text-sm sm:text-lg text-[#525E75] dark:text-zinc-400 max-w-xl font-normal leading-relaxed"
              >
                DİB ve TKBB standartlarıyla BIST hisselerini canlı tarayın, resmi KAP &amp; SPK bültenlerini anlık izleyin ve arındırmanızı kuruşu kuruşuna hesaplayın.
              </p>

              {/* Dual CTA Buttons (Northline: Electric Lime Primary + Dark Glass Secondary) */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-1">
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full mizan-accent-btn text-sm sm:text-base font-extrabold flex items-center justify-center gap-2"
                >
                  <span>Ücretsiz Başla</span>
                  <ArrowRight size={17} strokeWidth={2.5} />
                </Link>

                <Link
                  href="/tarayici"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white dark:bg-[#101118] hover:bg-slate-50 dark:hover:bg-[#181A24] text-[#08080C] dark:text-white border border-slate-200/80 dark:border-white/[0.12] text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Search size={16} />
                  <span>Hisse Tarayıcısı</span>
                </Link>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* NORTHLINE 3-CARD BENTO SHOWCASE (With Under-Card Lime Radial Glow)  */}
          {/* =================================================================== */}
          <div className="mt-12 sm:mt-16 max-w-6xl mx-auto relative">
            {/* Signature Northline Intense Radial Lime Glow Behind Cards */}
            <div className="pointer-events-none absolute -inset-x-8 -top-10 -bottom-6 mizan-hero-glow blur-2xl -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
              {/* Card 1: Canlı Katılım Taraması */}
              <div className="p-5 rounded-2xl bg-white/95 dark:bg-[#101118]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.1] shadow-xl space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.07] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] dark:bg-[#C6F432]" />
                    <span className="text-xs font-bold text-[#08080C] dark:text-white">
                      Canlı Katılım Taraması
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#10B981]/10 dark:bg-[#C6F432]/15 text-[#10B981] dark:text-[#C6F432]">
                    XKTUM
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { ticker: "BIMAS", name: "BİM Mağazalar", ratio: "%1,32", ok: true },
                    { ticker: "ASELS", name: "Aselsan", ratio: "%8,40", ok: true },
                    { ticker: "THYAO", name: "Türk Hava Yolları", ratio: "%34,2", ok: false },
                  ].map((row) => (
                    <div
                      key={row.ticker}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]"
                    >
                      <div className="flex items-center gap-2.5">
                        <StockLogo ticker={row.ticker} name={row.name} size="sm" />
                        <div>
                          <span className="text-xs font-mono font-extrabold text-[#08080C] dark:text-white block">
                            {row.ticker}
                          </span>
                          <span className="text-[10px] text-[#6E81A0] dark:text-zinc-400">
                            Borç: {row.ratio}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          row.ok
                            ? "bg-[#10B981]/15 text-[#10B981] dark:bg-[#C6F432] dark:text-[#08080C]"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {row.ok ? "UYGUN" : "EŞİK ÜSTÜ"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.07] text-[11px]">
                  <span className="text-[#6E81A0] dark:text-zinc-400">Otomatik KAFİF Kontrolü</span>
                  <strong className="font-mono font-bold text-[#08080C] dark:text-[#C6F432]">Aktif</strong>
                </div>
              </div>

              {/* Card 2 (Centerpiece): Northline Signature Score & Lime Chart */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101118] border border-slate-200 dark:border-[#C6F432]/30 shadow-2xl space-y-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E81A0] dark:text-zinc-400 block">
                      Portföy Helal Sağlığı
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl font-black font-mono tracking-tighter text-[#08080C] dark:text-white">
                        94
                      </span>
                      <span className="text-xs font-bold text-[#10B981] dark:text-[#C6F432]">
                        / 100
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/portfolio"
                    className="px-3 py-1.5 rounded-full mizan-accent-btn text-[11px] font-extrabold"
                  >
                    Detaylı Rapor
                  </Link>
                </div>

                {/* Northline Lime Area Chart */}
                <div className="relative h-28 w-full pt-2">
                  <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="northlineLimeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C6F432" stopOpacity="0.38" />
                        <stop offset="100%" stopColor="#C6F432" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,78 L45,70 L90,74 L135,54 L180,58 L225,36 L265,28 L300,14 L300,100 L0,100 Z"
                      fill="url(#northlineLimeFill)"
                    />
                    <path
                      d="M0,78 L45,70 L90,74 L135,54 L180,58 L225,36 L265,28 L300,14"
                      fill="none"
                      stroke="#C6F432"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="300" cy="14" r="4.5" fill="#C6F432" />
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.07] text-[11px]">
                  <div>
                    <span className="text-[#6E81A0] dark:text-zinc-400 block">Arındırma Oranı</span>
                    <strong className="text-[#08080C] dark:text-white font-mono font-bold">%0,23</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[#6E81A0] dark:text-zinc-400 block">Endeks Durumu</span>
                    <strong className="text-[#10B981] dark:text-[#C6F432] font-bold">Tam Uyumlu</strong>
                  </div>
                </div>
              </div>

              {/* Card 3: KAP & SPK + Mizan AI Timeline */}
              <div className="p-5 rounded-2xl bg-white/95 dark:bg-[#101118]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.1] shadow-xl space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.07] pb-3">
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-[#10B981] dark:text-[#C6F432] animate-pulse" />
                    <span className="text-xs font-bold text-[#08080C] dark:text-white">
                      KAP &amp; Mizan AI Akışı
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#10B981] dark:text-[#C6F432]">
                    CANLI
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-[#10B981] dark:text-[#C6F432]">SPK 2026/16</span>
                      <span className="text-zinc-500 font-mono">14:15</span>
                    </div>
                    <p className="text-[11px] font-bold text-[#08080C] dark:text-white line-clamp-1">
                      Yeni Halka Arz &amp; İcazet İncelemesi
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div className="h-full w-4/5 rounded-full bg-[#10B981] dark:bg-[#C6F432]" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#10B981]/10 dark:bg-[#C6F432]/10 border border-[#10B981]/25 dark:border-[#C6F432]/25 space-y-1">
                    <span className="text-[10px] font-extrabold text-[#10B981] dark:text-[#C6F432] flex items-center gap-1">
                      <Sparkles size={11} />
                      Mizan AI Özeti
                    </span>
                    <p className="text-[11px] text-[#08080C] dark:text-zinc-200 leading-snug">
                      Faizli borç rasyosu %1,32 ile tavan (%33) altında. Fıkhi uygunluk korundu.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.07] text-[11px]">
                  <span className="text-[#6E81A0] dark:text-zinc-400">Anlık Bildirim</span>
                  <strong className="font-mono font-bold text-[#08080C] dark:text-white">7/24 Aktif</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. INFINITE LIVE TICKER RIBBON (Midas-style market marquee)         */}
      {/* =================================================================== */}
      <div className="relative z-10 border-y border-slate-200/70 dark:border-white/10 bg-white/40 dark:bg-[#08080C]/50 backdrop-blur-md overflow-hidden py-3">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
          {ribbonStocks.map((s, idx) => (
            <Link
              key={`${s.ticker}-${idx}`}
              href={`/companies/${s.ticker}`}
              className="inline-flex items-center gap-3 px-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition shrink-0"
            >
              <StockLogo ticker={s.ticker} name={s.name} size="sm" />
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-extrabold text-xs text-[#08080C] dark:text-white">
                  {s.ticker}
                </span>
                <span className="font-mono text-xs text-[#525E75] dark:text-[#94A3B8]">
                  ₺{s.price}
                </span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    s.change.startsWith("+")
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {s.change}
                </span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                  s.isOk
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                }`}
              >
                {s.isOk ? "Uyumlu" : "Katılım Dışı"}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. VALUE PROPOSITION: NEDEN MİZAN? (Midas-style Modern Grid)        */}
      {/* =================================================================== */}
      <section className="relative z-10 py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Profesyonel Fıkhi Çözümler
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#08080C] dark:text-white tracking-tight">
            Neden Mizan ile Yatırım Yapmalısınız?
          </h2>
          <p className="text-sm sm:text-base text-[#525E75] dark:text-[#94A3B8]">
            Sıradan borsa uygulamaları sadece fiyatı gösterir. Mizan ise hissenin
            fıkhi meşruiyetini, KAP &amp; SPK resmi bildirimlerini, yapay zekâ danışmanlığını ve arındırma payını kuruşu kuruşuna sunar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Canlı KAP & SPK Bildirim Akışı */}
          <div className="p-7 rounded-[28px] bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Radio size={24} className="animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-[#08080C] dark:text-white">
              Canlı KAP &amp; SPK Bildirim Akışı
            </h3>
            <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Devre kesiciler, sermaye artırımları, temettü kararları ve haftalık SPK bültenleri anlık olarak ekranınıza düşer. Fıkhi uygunluğa etkisini tek tıkla görün.
            </p>
          </div>

          {/* Card 2: Mizan AI Katılım Danışmanı */}
          <div className="p-7 rounded-[28px] bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#08080C] dark:text-white">
              Mizan AI Fıkhi &amp; Finansal Asistan
            </h3>
            <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Gemini 3.8 Flash tabanlı akıllı asistan; DİB ve TKBB fetvalarıyla eğitilmiş olup bilanço dipnotlarını analiz eder ve sesli/yazılı sorularınızı yanıtlar.
            </p>
          </div>

          {/* Card 3: BIST Katılım 7/24 Radar */}
          <div className="p-7 rounded-[28px] bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-[#C6F432]/15 text-blue-700 dark:text-[#C6F432] flex items-center justify-center">
              <Scale size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#08080C] dark:text-white">
              BIST Katılım 7/24 Fıkhi Radar
            </h3>
            <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Borsa İstanbul’daki tüm hisseleri DİB Din İşleri Yüksek Kurulu kriterlerine göre anlık tarayın.
              Faizli borç (%33), faizli nakit (%33) ve uygunsuz gelir (%5) sınırları anında denetlenir.
            </p>
          </div>

          {/* Card 4: Kuruşu Kuruşuna Arındırma Motoru */}
          <div className="p-7 rounded-[28px] bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-[#C6F432]/15 text-indigo-700 dark:text-[#C6F432] flex items-center justify-center">
              <Coins size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#08080C] dark:text-white">
              Kuruşu Kuruşuna Arındırma Motoru
            </h3>
            <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Şirketlerin açıkladığı temettü veya alım-satım kârlarından arındırılması gereken gayrimeşru nema payını
              KAP dipnotlarına göre kuruşu kuruşuna hesaplayın ve arındırma defterinizde saklayın.
            </p>
          </div>

          {/* Card 5: Fintables Düzeyinde Şirket Karnesi */}
          <div className="p-7 rounded-[28px] bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#08080C] dark:text-white">
              24 Kriterli Şirket Karnesi
            </h3>
            <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Sadece helal mi değil mi sorusuyla yetinmeyin. 24 puanlık şirket karnesi, F/K, PD/DD,
              FD/FAVÖK ve DuPont kârlılık modeli ile hem fıkhen hem finansal olarak en güçlü şirketleri keşfedin.
            </p>
          </div>

          {/* Card 6: Halka Arz Radarı */}
          <div className="p-7 rounded-[28px] bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#08080C] dark:text-white">
              Halka Arz (XHARZ) Takvimi
            </h3>
            <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Yeni halka arzlarda SPK onaylı izahname ve KAP KAFİF raporunu anında inceleyin; katılım uygunluğunu ve kişi başı tahmini lot dağıtımını anında simüle edin.
            </p>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. INTERACTIVE FEATURE DEEP-DIVE (Midas Product Showcase)           */}
      {/* =================================================================== */}
      <section id="ozellikler" className="relative z-10 py-16 sm:py-24 bg-slate-100/25 dark:bg-white/[0.015] backdrop-blur-xs border-y border-slate-200/70 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#10B981] dark:text-[#C6F432] block">
                Platform Özellikleri
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#08080C] dark:text-white tracking-tight">
                Yatırım Kararlarınızı{" "}
                <span className="font-orbix-serif italic font-semibold text-[#10B981] dark:text-[#C6F432]">
                  Fıkhi ve Finansal
                </span>{" "}
                Güçle Donatın.
              </h2>
            </div>

            {/* Feature Tab Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#101118] rounded-full border border-slate-200/80 dark:border-white/10 shadow-sm overflow-x-auto scrollbar-none">
              {[
                { id: "KAP_SPK", label: "KAP & SPK Akışı", isNew: true },
                { id: "AI_ASISTAN", label: "Mizan AI Asistan", isNew: true },
                { id: "TARAYICI", label: "Hisse Tarayıcı" },
                { id: "ARINDIRMA", label: "Arındırma & Zekât" },
                { id: "KARNE", label: "Şirket Karnesi" },
                { id: "HALKA_ARZ", label: "Halka Arz" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                    activeFeatureTab === tab.id
                      ? "bg-[#08080C] text-[#C6F432] dark:bg-[#C6F432] dark:text-[#08080C] shadow-xs"
                      : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#08080C] dark:hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.isNew && (
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      activeFeatureTab === tab.id
                        ? "bg-white/20 dark:bg-[#08080C]/15 text-current"
                        : "bg-[#08080C]/10 dark:bg-white/10 text-[#08080C] dark:text-white"
                    }`}>
                      YENİ
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Feature Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/45 dark:bg-[#101118]/90 backdrop-blur-xl rounded-[32px] border border-white/80 dark:border-white/10 p-6 sm:p-10 shadow-sm">
            
            <div className="lg:col-span-5 space-y-5">
              {activeFeatureTab === "KAP_SPK" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 dark:bg-[#C6F432]/15 text-[#10B981] dark:text-[#C6F432] text-xs font-bold">
                    <Radio size={13} className="animate-pulse" />
                    <span>Canlı KAP &amp; SPK Bildirim Motoru</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#08080C] dark:text-white">
                    Devre Kesici, Sermaye Artırımı ve SPK Bültenleri Anlık Ekranınızda.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
                    Kamuyu Aydınlatma Platformu (KAP) ve SPK resmi verilerini 7/24 kesintisiz tarar. Borsa devre kesicileri, temettü kararları, sermaye artırımları ve KAFİF uygunluk formları yayımlandığı anda fıkhi etki teşhisiyle önünüze gelir.
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-[#08080C] dark:text-[#C6F432] hover:underline pt-2"
                  >
                    <span>Canlı Bildirimleri Panoda İncele</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}

              {activeFeatureTab === "AI_ASISTAN" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-[#C6F432]/15 text-blue-800 dark:text-[#C6F432] text-xs font-bold">
                    <Sparkles size={13} />
                    <span>Gemini 3.8 Flash Fıkhi Danışman</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#08080C] dark:text-white">
                    Akıllı İcazet Denetimi ve Bilanço Dipnot Danışmanı.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
                    DİB Din İşleri Yüksek Kurulu ve TKBB standartlarına hâkim yapay zekâ. Hisselerin bilanço dipnotlarındaki faizli nema ve haram faaliyet risklerini tespit eder, sesli veya yazılı sorularınıza anında yanıt verir.
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-[#08080C] dark:text-[#C6F432] hover:underline pt-2"
                  >
                    <span>Mizan AI ile Şimdi Konuş</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}

              {activeFeatureTab === "TARAYICI" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-[#C6F432]/15 text-blue-800 dark:text-[#C6F432] text-xs font-bold">
                    <Search size={13} />
                    <span>Canlı BIST Katılım Tarayıcısı</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#08080C] dark:text-white">
                    Borsa İstanbul’daki Her Hissenin Fıkhi Röntgeni.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
                    Sektör filtreleri, katılım durumu, faizli borç oranları ve anlık fiyat değişimleri tek bir dinamik tabloda.
                    Hissenin neden katılım dışı olduğunu kök neden analiziyle anında öğrenin.
                  </p>
                  <Link
                    href="/tarayici"
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-[#08080C] dark:text-[#C6F432] hover:underline pt-2"
                  >
                    <span>Tarayıcıyı Şimdi Deneyin</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}

              {activeFeatureTab === "ARINDIRMA" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-[#C6F432]/15 text-indigo-800 dark:text-indigo-300 text-xs font-bold">
                    <Coins size={13} />
                    <span>Hassas Tathir &amp; Arındırma</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#08080C] dark:text-white">
                    Portföyünüzün Kuruşu Kuruşuna Fıkhi Temizliği.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
                    Şirketlerin açıkladığı temettü veya hisse alım-satım kârlarından arındırılması gereken gayrimeşru faiz payını
                    otomatik hesaplayın, yıllık zekât matrahınızı tek tıkla görün.
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-[#08080C] dark:text-[#C6F432] hover:underline pt-2"
                  >
                    <span>Portföyünüzü Ekleyin</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}

              {activeFeatureTab === "KARNE" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold">
                    <Award size={13} />
                    <span>24 Kriterli Şirket Karnesi</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#08080C] dark:text-white">
                    Kârlılık, Büyüme, Borçluluk ve Fıkıh Puanı.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
                    Fintables kalitesinde F/K, PD/DD, FD/FAVÖK ve DuPont özkaynak analizi.
                    Şirketinizin finansal dayanıklılığını ve büyüme kalitesini A+ ile F arasında puanlayın.
                  </p>
                  <Link
                    href="/companies/BIMAS"
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
                  >
                    <span>Örnek Şirket Karnesini İncele</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}

              {activeFeatureTab === "HALKA_ARZ" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <Calendar size={13} />
                    <span>Halka Arz (XHARZ) Radarı</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#08080C] dark:text-white">
                    Yeni Arzların Katılım Uygunluğu ve Lot Dağıtımı.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
                    Halka arz edilecek şirketlerin izahname ve KAFİF beyanları uzman fıkhi süzgeçten geçer.
                    Katılımcı sayısına göre tahmini kaç lot düşeceğini anında simüle edin.
                  </p>
                  <Link
                    href="/ipo"
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
                  >
                    <span>Halka Arz Takvimine Git</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>

            {/* Right Screen Graphic (Dynamic by Tab) */}
            <div className="lg:col-span-7 bg-white/40 dark:bg-[#101118] backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/80 dark:border-white/10 space-y-4">
              
              {activeFeatureTab === "KAP_SPK" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Radio size={14} className="text-purple-600 dark:text-purple-400 animate-pulse" />
                      <span className="text-xs font-bold text-[#08080C] dark:text-white">
                        Resmi KAP &amp; SPK Canlı Akış Önizlemesi
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Canlı 7/24
                    </span>
                  </div>

                  {/* Disclosure Item 1 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#141720] border border-slate-200/60 dark:border-white/10 space-y-1.5 hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                        SPK BÜLTENİ
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">18:45</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-[#08080C] dark:text-white">
                      SPK Haftalık Bülteni 2026/16 Yayımlandı
                    </h4>
                    <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Yeni izahname onayları, bedelsiz sermaye artırımları ve idari para cezaları kararları kurul tarafından ilan edildi.
                    </p>
                  </div>

                  {/* Disclosure Item 2 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#141720] border border-slate-200/60 dark:border-white/10 space-y-1.5 hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-[#10B981] dark:text-[#C6F432]">
                        KAP • DEVRE KESİCİ
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">14:15</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StockLogo ticker="REEDR" name="Reeder Teknoloji" size="sm" />
                      <h4 className="text-xs font-extrabold text-[#08080C] dark:text-white">
                        REEDR Pay Piyasasında Devre Kesici Tetiklendi
                      </h4>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Fıkhi Uygunluk: Etkilenmedi (XKTUM Kapsamında)</span>
                      <span className="font-mono text-slate-400">BIST 100</span>
                    </div>
                  </div>

                  {/* Disclosure Item 3 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#141720] border border-slate-200/60 dark:border-white/10 space-y-1.5 hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        KAP • KAFİF FORMU
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">11:30</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StockLogo ticker="BIMAS" name="BİM" size="sm" />
                      <h4 className="text-xs font-extrabold text-[#08080C] dark:text-white">
                        BIMAS Katılım Finansı İlkeleri Bilgi Formu Beyanı
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block">
                      Faizli borç %1,32 • Faizli nakit %2,10 • Uygunsuz gelir %0,23 (Tam Uyumlu)
                    </span>
                  </div>
                </div>
              )}

              {activeFeatureTab === "AI_ASISTAN" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-[#08080C] dark:text-white">
                        Mizan AI Asistan Canlı Sorgulama
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                      Gemini 3.8 Flash
                    </span>
                  </div>

                  {/* Chat Dialog 1 */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-xs bg-[#08080C] text-white text-xs space-y-1 shadow-xs">
                      <span className="text-[9px] text-slate-300 block font-mono">Yatırımcı Sorusu:</span>
                      <p>Beton ve çimento hisseleri katılım endeksine uygun mudur, arındırma gerekir mi?</p>
                    </div>
                  </div>

                  {/* AI Response 1 */}
                  <div className="flex justify-start">
                    <div className="max-w-[92%] p-3.5 rounded-2xl rounded-tl-xs bg-white dark:bg-[#141720] border border-emerald-500/20 text-[#08080C] dark:text-white text-xs space-y-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-black font-mono font-black text-[9px]">Mizan AI</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">DİB &amp; TKBB Metodolojisi</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#525E75] dark:text-[#CBD5E1]">
                        Çimento ve hazır beton imalatı fıkhen <strong>helal ve meşru</strong> bir faaliyet alanıdır. Ancak hissenin Katılım Endeksi’ne girebilmesi için konvansiyonel faizli banka borçlarının toplam aktiflere oranının <strong>&lt;%33</strong> olması şarttır.
                      </p>
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/30 text-[10px] text-emerald-800 dark:text-emerald-300">
                        Örneğin BETAE sıfır faizli borçla (%0) tam uygundur. Temettü arındırma payı ise KAFİF nema oranına göre hesaplanır.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeFeatureTab === "TARAYICI" || activeFeatureTab === "KARNE") && (
                <>
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                    <span className="text-xs font-bold text-[#08080C] dark:text-white">
                      Mizan Finansal Radar Önizlemesi
                    </span>
                    <span className="text-[10px] font-mono text-[#6E81A0] dark:text-[#94A3B8]">
                      Canlı Senkronize
                    </span>
                  </div>

                  {/* Tabular Data */}
                  <div className="space-y-2 text-xs font-medium">
                    {[
                      { ticker: "BIMAS", sector: "Perakende", pe: "14.2", pb: "3.10", evEbitda: "6.8", status: "COMPLIANT", score: "22/24" },
                      { ticker: "THYAO", sector: "Ulaştırma", pe: "5.4", pb: "0.85", evEbitda: "4.2", status: "NON_COMPLIANT", score: "12/24" },
                      { ticker: "AAGYO", sector: "GYO", pe: "A/D", pb: "0.31", evEbitda: "A/D", status: "NON_COMPLIANT", score: "14/24" },
                      { ticker: "BETAE", sector: "Elektrik", pe: "25.6", pb: "3.24", evEbitda: "19.9", status: "COMPLIANT", score: "19/24" },
                    ].map((row) => (
                      <div
                        key={row.ticker}
                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#141720] border border-slate-200/50 dark:border-white/5"
                      >
                        <div className="flex items-center gap-2.5">
                          <StockLogo ticker={row.ticker} name={row.ticker} size="sm" />
                          <div>
                            <span className="font-mono font-bold text-[#08080C] dark:text-white block">{row.ticker}</span>
                            <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">{row.sector}</span>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-4 text-center font-mono text-[11px]">
                          <div>
                            <span className="text-[#6E81A0] dark:text-[#94A3B8] block text-[9px]">F/K</span>
                            <strong>{row.pe}</strong>
                          </div>
                          <div>
                            <span className="text-[#6E81A0] dark:text-[#94A3B8] block text-[9px]">PD/DD</span>
                            <strong className="text-emerald-600 dark:text-emerald-400">{row.pb}</strong>
                          </div>
                          <div>
                            <span className="text-[#6E81A0] dark:text-[#94A3B8] block text-[9px]">Karne</span>
                            <strong>{row.score}</strong>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            row.status === "COMPLIANT"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                          }`}
                        >
                          {row.status === "COMPLIANT" ? "Uyumlu" : "Katılım Dışı"}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeFeatureTab === "ARINDIRMA" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                    <span className="text-xs font-bold text-[#08080C] dark:text-white">
                      Kuruşu Kuruşuna Tathir &amp; Arındırma Simülatörü
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Canlı Hesaplama
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-slate-200/70 dark:border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6E81A0] dark:text-[#94A3B8]">Toplam Portföy Temettü Hasılatı:</span>
                      <strong className="font-mono text-base font-black text-[#08080C] dark:text-white">₺100.000,00</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-emerald-800 dark:text-emerald-300">Helal Net Yatırımcı Payı:</span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">₺99.640,00</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-rose-700 dark:text-rose-300">Arındırılacak Nema Tutarı:</span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">₺360,00 (%0,36)</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed">
                      * Arındırma tutarı şirketin ticari mevduatından kaynaklanan cüzi faiz geliridir; yatırımcı mülkiyet iddia etmeksizin hayır kuruluşlarına aktarmalıdır.
                    </p>
                  </div>
                </div>
              )}

              {activeFeatureTab === "HALKA_ARZ" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                    <span className="text-xs font-bold text-[#08080C] dark:text-white">
                      Halka Arz Lot Dağıtım Simülasyonu
                    </span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                      XHARZ Radarı
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-slate-200/70 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#08080C] dark:text-white block font-mono">BETAE</span>
                        <span className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">Beta Enerji ve Teknoloji A.Ş.</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        Katılım Uyumlu
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-200/50 dark:border-white/5">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                        <span className="text-[10px] text-slate-400 block">1.5M Katılımcı</span>
                        <strong className="font-mono text-[#08080C] dark:text-white">~35 Lot (₺1.645)</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                        <span className="text-[10px] text-slate-400 block">2.0M Katılımcı</span>
                        <strong className="font-mono text-[#08080C] dark:text-white">~26 Lot (₺1.222)</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                        <span className="text-[10px] text-slate-400 block">2.5M Katılımcı</span>
                        <strong className="font-mono text-[#08080C] dark:text-white">~21 Lot (₺987)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 6. FIKHI STANDARTLAR (DİB & TKBB DAYANAKLARI)                         */}
      {/* =================================================================== */}
      <section className="relative z-10 py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Fıkhi Metodoloji &amp; Standartlar
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#08080C] dark:text-white tracking-tight">
            İcazetli ve Şeffaf Kurallar Üzerine İnşa Edildi.
          </h2>
          <p className="text-sm sm:text-base text-[#525E75] dark:text-[#94A3B8]">
            Mizan, keyfi yorumlara yer vermez. Türkiye’nin en yetkili fıkhi mercilerinin
            yayımladığı resmi standartları ve Borsa İstanbul Katılım Endeksi kurallarını uygular.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-2xl bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 space-y-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">≤ %33,00</span>
            <h4 className="text-sm font-bold text-[#08080C] dark:text-white">Faizli Borç Oranı</h4>
            <p className="text-xs text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Şirketin konvansiyonel banka borçlarının toplam aktif büyüklüğüne veya ortalama piyasa değerine azami oranı.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 space-y-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-[#C6F432] font-mono block">≤ %33,00</span>
            <h4 className="text-sm font-bold text-[#08080C] dark:text-white">Faizli Nakit Varlıklar</h4>
            <p className="text-xs text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Vadeli mevduat, repo ve faizli menkul kıymetlerin toplam varlıklara azami izin verilen tolerans tavanı.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 space-y-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono block">≤ %5,00</span>
            <h4 className="text-sm font-bold text-[#08080C] dark:text-white">Uygunsuz Gelir Limiti</h4>
            <p className="text-xs text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Şirket hasılatı içinde faiz ve meşru olmayan yan faaliyet gelirlerinin azami payı (arındırmaya tabidir).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/45 dark:bg-[#101118] backdrop-blur-xl border border-white/80 dark:border-white/10 space-y-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono block">0 Tolerans</span>
            <h4 className="text-sm font-bold text-[#08080C] dark:text-white">Haram Faaliyetler</h4>
            <p className="text-xs text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
              Faizli bankacılık, alkollü içecekler, kumar, şans oyunları, domuz mamulleri ve tütün doğrudan kapsam dışıdır.
            </p>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 7. SIKÇA SORULAN SORULAR (Accordion FAQ)                           */}
      {/* =================================================================== */}
      <section id="sss" className="relative z-10 py-20 bg-slate-100/25 dark:bg-white/[0.015] backdrop-blur-xs border-y border-slate-200/70 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Merak Edilenler
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#08080C] dark:text-white tracking-tight">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/50 dark:bg-[#101118]/60 backdrop-blur-xl border border-white/80 dark:border-white/10 overflow-hidden transition shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#08080C] dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#6E81A0] dark:text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 8. PRE-FOOTER CTA BANNER (Midas "Hemen Başla")                     */}
      {/* =================================================================== */}
      <section className="relative z-10 py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[36px] overflow-hidden bg-gradient-to-br from-[#08080C]/90 via-[#1c2c4d]/85 to-[#0d1627]/90 backdrop-blur-xl text-white p-8 sm:p-14 lg:p-16 text-center space-y-6 shadow-2xl shadow-[#08080C]/30 border border-white/10">
          
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300 block">
              Geleceğinizi Helal Kazançla İnşa Edin
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Borsa İstanbul’da Helal Birikim Yapmaya Bugün Başlayın.
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Borsa İstanbul hisselerini inceleyin, canlı SPK &amp; KAP bildirimlerini anında takip edin ve fıkhi arındırma payınızı kuruşu kuruşuna öğrenin.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#08080C] font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-black/20 active:scale-95 transition-all"
            >
              <span>Uygulamayı Aç — Ücretsiz</span>
              <ArrowRight size={18} strokeWidth={2.4} />
            </Link>

            <Link
              href="/tarayici"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-base flex items-center justify-center gap-2 transition"
            >
              <span>Canlı Tarayıcı</span>
            </Link>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 8.5 OFFICIAL DATA & STANDARDS INTEGRATIONS (BIST, KAP, TKBB, TV)   */}
      {/* =================================================================== */}
      <InstitutionalLogosSection />

      {/* =================================================================== */}
      {/* 8.8 MIZAN LOGO MERGE SHOWCASE STAGE (Açık Birleşme Alanı)          */}
      {/* =================================================================== */}
      <div
        id="mizan-logo-merge-stage"
        aria-hidden="true"
        className="relative z-0 w-full h-[520px] sm:h-[560px] lg:h-[600px] pointer-events-none select-none"
      />

      {/* =================================================================== */}
      {/* 9. COMPREHENSIVE MIDAS-STYLE FOOTER                                 */}
      {/* =================================================================== */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-white/10 bg-white/55 dark:bg-[#08080C]/65 backdrop-blur-xl text-xs text-[#525E75] dark:text-[#94A3B8] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          
          {/* Top Row: Brand & Multi-column sitemap */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#08080C] dark:bg-[#0F172A] border border-white/20 p-0.5 flex items-center justify-center">
                  <Image src="/brand/logo.svg" alt="Mizan" width={32} height={32} className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-black text-[#08080C] dark:text-white">mizan katılım</span>
              </Link>
              <p className="text-xs text-[#6E81A0] dark:text-[#8C9BB0] leading-relaxed max-w-sm">
                Borsa İstanbul pay senetleri için Diyanet İşleri Başkanlığı ve TKBB Danışma Kurulu standartlarında fıkhi tarama, KAFİF denetimi ve temettü arındırma teknolojisi.
              </p>
              <span className="text-[11px] font-mono text-[#6E81A0] dark:text-[#8C9BB0] block">
                Mizan Finans Teknolojileri A.Ş. &bull; Levent, İstanbul
              </span>
            </div>

            {/* Col 1: Ürünler */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#08080C] dark:text-white">
                Ürünler
              </h4>
              <ul className="space-y-2">
                <li><Link href="/tarayici" className="hover:text-emerald-600 dark:hover:text-white transition">BIST Katılım Tarayıcısı</Link></li>
                <li><Link href="/ipo" className="hover:text-emerald-600 dark:hover:text-white transition">Halka Arz Takvimi</Link></li>
                <li><Link href="/portfolio" className="hover:text-emerald-600 dark:hover:text-white transition">Arındırma Motoru</Link></li>
                <li><Link href="/companies/BIMAS" className="hover:text-emerald-600 dark:hover:text-white transition">Şirket Karnesi</Link></li>
                <li><Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-white transition">Mizan Portföyüm</Link></li>
              </ul>
            </div>

            {/* Col 2: Fıkhi Kaynaklar */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#08080C] dark:text-white">
                Fıkhi Kaynaklar
              </h4>
              <ul className="space-y-2">
                <li><Link href="/rehber" className="hover:text-emerald-600 dark:hover:text-white transition">DİB Katılım Standartları</Link></li>
                <li><Link href="/rehber" className="hover:text-emerald-600 dark:hover:text-white transition">TKBB Danışma Kurulu İlkeleri</Link></li>
                <li><Link href="/rehber" className="hover:text-emerald-600 dark:hover:text-white transition">Fıkhi Cevazlar &amp; Kurallar</Link></li>
                <li><Link href="/rehber" className="hover:text-emerald-600 dark:hover:text-white transition">Helal Finans Terimleri</Link></li>
                <li><Link href="/rehber" className="hover:text-emerald-600 dark:hover:text-white transition">Hisse Zekâtı Rehberi</Link></li>
              </ul>
            </div>

            {/* Col 3: Kurumsal & Yasal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#08080C] dark:text-white">
                Yasal &amp; Sözleşmeler
              </h4>
              <ul className="space-y-2">
                <li><Link href="/kullanim-kosullari" className="hover:text-emerald-600 dark:hover:text-white transition">Kullanım Koşulları</Link></li>
                <li><Link href="/gizlilik-politikasi" className="hover:text-emerald-600 dark:hover:text-white transition">Gizlilik Politikası</Link></li>
                <li><Link href="/cerez-politikasi" className="hover:text-emerald-600 dark:hover:text-white transition">Çerez Politikası</Link></li>
                <li><Link href="/mesafeli-satis" className="hover:text-emerald-600 dark:hover:text-white transition">Mesafeli Satış Sözleşmesi</Link></li>
                <li><Link href="/iade-ve-iptal" className="hover:text-emerald-600 dark:hover:text-white transition">İptal ve İade Şartları</Link></li>
              </ul>
            </div>

          </div>

          {/* SPK Legal Disclaimer Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[11px] leading-relaxed text-[#6E81A0] dark:text-[#8C9BB0] space-y-1.5">
            <span className="font-bold text-[#08080C] dark:text-white block uppercase tracking-wider text-[10px]">
              Yasal Uyarı (SPK Mevzuatı):
            </span>
            <p>
              Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir.
              Yatırım danışmanlığı hizmeti; aracı kurumlar, portföy yönetim şirketleri, mevduat kabul etmeyen bankalar ile müşteri arasında imzalanacak yatırım danışmanlığı sözleşmesi çerçevesinde sunulmaktadır.
              Mizan Katılım, Kamuyu Aydınlatma Platformu (KAP) ve Borsa İstanbul kamuya açık verilerini fıkhi metodoloji süzgecinden geçirerek sunan bir finansal teknoloji yazılımıdır.
            </p>
          </div>

          {/* Bottom Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-white/5 text-[11px] text-[#6E81A0] dark:text-[#8C9BB0]">
            <span>© 2026 Mizan Finans Teknolojileri A.Ş. Tüm hakları saklıdır.</span>
            <div className="flex items-center gap-4">
              <span>Borsa İstanbul Veri Lisansı</span>
              <span>&bull;</span>
              <span>KAP XBRL Entegrasyonu</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
