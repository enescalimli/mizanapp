"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Database, LineChart, Scale, FileText } from "lucide-react";

export const InstitutionalLogosSection: React.FC = () => {
  const institutions = [
    {
      id: "bist",
      name: "Borsa İstanbul",
      shortName: "BIST",
      role: "Piyasa & Seans Veri Sağlayıcısı",
      badgeText: "Canlı Veri Lisansı",
      status: "7/24 Aktif Akış",
      url: "https://www.borsaistanbul.com",
      accentColor: "from-rose-500/10 to-red-600/5",
      borderColor: "hover:border-rose-500/40",
      badgeColor: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50",
      logo: (
        <svg viewBox="0 0 200 48" className="h-8 w-auto fill-current" aria-label="Borsa İstanbul Logosu">
          {/* BIST Modern Geometric Tulip Emblem */}
          <g>
            <circle cx="24" cy="24" r="20" fill="#E11D48" opacity="0.12" />
            <path
              d="M24 8 C16 12 12 18 12 25 C12 32 17 38 24 40 C31 38 36 32 36 25 C36 18 32 12 24 8 Z"
              fill="#E11D48"
            />
            <path
              d="M24 12 C28 16 30 20 30 25 C30 30 27 34 24 36 C21 34 18 30 18 25 C18 20 20 16 24 12 Z"
              fill="#FFFFFF"
            />
            <circle cx="24" cy="24" r="3" fill="#E11D48" />
          </g>
          {/* Typography */}
          <text x="52" y="22" className="fill-slate-900 dark:fill-white font-black tracking-tight" fontSize="14" fontFamily="system-ui, sans-serif">
            BORSA İSTANBUL
          </text>
          <text x="52" y="34" className="fill-slate-500 dark:fill-slate-400 font-bold uppercase tracking-wider" fontSize="8" fontFamily="system-ui, sans-serif">
            BIST 100 • KATILIM (XKTUM)
          </text>
        </svg>
      ),
      description:
        "BIST 100, BIST Katılım Tüm (XKTUM), Katılım 50 ve Katılım 30 endeksleri dahil 626 pay senedinin anlık seans fiyatları, piyasa değerleri ve işlem hacimleri.",
      dataItems: ["626 Pay Senedi", "XKTUM Katılım Endeksi", "Anlık Hacim & Piyasa Değeri", "52H Dip/Zirve & Pazar"],
    },
    {
      id: "kap",
      name: "Kamuyu Aydınlatma Platformu",
      shortName: "KAP",
      role: "Resmi Şirket Bilançoları & KAFİF Kaynağı",
      badgeText: "Resmi XBRL Bildirimleri",
      status: "Anlık KAP Dinleyicisi",
      url: "https://www.kap.org.tr",
      accentColor: "from-sky-500/10 to-blue-600/5",
      borderColor: "hover:border-sky-500/40",
      badgeColor: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/50",
      logo: (
        <svg viewBox="0 0 200 48" className="h-8 w-auto fill-current" aria-label="KAP Logosu">
          {/* KAP Emblem */}
          <g>
            <rect x="6" y="8" width="32" height="32" rx="9" fill="#0284C7" />
            <path
              d="M16 16 L22 24 L16 32 M24 16 L24 32 M24 24 L30 16 M24 24 L30 32"
              stroke="#FFFFFF"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          {/* Typography */}
          <text x="46" y="22" className="fill-slate-900 dark:fill-white font-black tracking-tight" fontSize="16" fontFamily="system-ui, sans-serif">
            KAP
          </text>
          <text x="46" y="34" className="fill-slate-500 dark:fill-slate-400 font-bold uppercase tracking-wider" fontSize="7.5" fontFamily="system-ui, sans-serif">
            KAMUYU AYDINLATMA PLATFORMU
          </text>
        </svg>
      ),
      description:
        "Şirketlerin zorunlu yayımladığı Katılım Finansı İlkeleri Bilgi Formu (KAFİF), çeyreklik resmi bilanço dipnotları, kâr payı dağıtım kararları ve özel durum açıklamaları.",
      dataItems: ["KAFİF Bilgi Formu", "Faizli Borç/Varlık Beyanı", "Çeyreklik XBRL Bilançolar", "Özel Durum Açıklamaları (ÖDA)"],
    },
    {
      id: "tkbb",
      name: "Türkiye Katılım Bankaları Birliği",
      shortName: "TKBB",
      role: "Danışma Kurulu & Fıkhi Katılım Standartları",
      badgeText: "1 Nolu Katılım Standardı",
      status: "Resmi Karar Sicili",
      url: "https://tkbb.org.tr",
      accentColor: "from-emerald-500/10 to-teal-600/5",
      borderColor: "hover:border-emerald-500/40",
      badgeColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
      logo: (
        <svg viewBox="0 0 200 48" className="h-8 w-auto fill-current" aria-label="TKBB Logosu">
          {/* TKBB Islamic Finance Motif */}
          <g>
            <rect x="6" y="8" width="32" height="32" rx="9" fill="#059669" />
            <path
              d="M22 14 L26 18 L31 18 L31 23 L35 27 L31 31 L31 36 L26 36 L22 40 L18 36 L13 36 L13 31 L9 27 L13 23 L13 18 L18 18 Z"
              fill="#FFFFFF"
              opacity="0.3"
            />
            <path
              d="M22 17 C26 17 29 20 29 24 C29 28 26 31 22 31 C19.5 31 17.5 29.5 16.5 27.5 C18 28.5 20 28.5 21.5 27.5 C23.5 26 24 23.5 23 21.5 C22.5 20.5 21.5 19.5 20.5 19 C21 17.8 21.5 17 22 17 Z"
              fill="#FFFFFF"
            />
          </g>
          {/* Typography */}
          <text x="46" y="21" className="fill-slate-900 dark:fill-white font-black tracking-tight" fontSize="15" fontFamily="system-ui, sans-serif">
            TKBB
          </text>
          <text x="46" y="33" className="fill-slate-500 dark:fill-slate-400 font-bold uppercase tracking-wider" fontSize="7" fontFamily="system-ui, sans-serif">
            TÜRKİYE KATILIM BANKALARI BİRLİĞİ
          </text>
        </svg>
      ),
      description:
        "Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu ve TKBB Danışma Kurulu standartları: %33 faizli borç eşiği, %5 gayrimeşru gelir tavanı ve kuruş bazlı fıkhi arındırma (Tathir).",
      dataItems: ["1 Nolu Katılım Standardı", "Danışma Kurulu Kararları", "Onaylı Katılım Listesi", "Kuruş Hassasiyetli Arındırma"],
    },
    {
      id: "tradingview",
      name: "TradingView",
      shortName: "TradingView",
      role: "İleri Düzey Finansal Grafikler & Teknik Analiz",
      badgeText: "İnteraktif Grafik Motoru",
      status: "Canlı BIST Scanner",
      url: "https://www.tradingview.com",
      accentColor: "from-indigo-500/10 to-violet-600/5",
      borderColor: "hover:border-indigo-500/40",
      badgeColor: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50",
      logo: (
        <svg viewBox="0 0 200 48" className="h-8 w-auto fill-current" aria-label="TradingView Logosu">
          {/* TradingView Icon */}
          <g>
            <rect x="6" y="8" width="32" height="32" rx="9" fill="#131722" />
            <path
              d="M13 28 L19 28 L19 16 L13 16 Z M20 28 L26 28 L26 12 L20 12 Z M27 28 L33 28 L33 20 L27 20 Z"
              fill="#2962FF"
            />
            <circle cx="23" cy="24" r="2" fill="#FFFFFF" />
          </g>
          {/* Typography */}
          <text x="46" y="23" className="fill-slate-900 dark:fill-white font-black tracking-tight" fontSize="15" fontFamily="system-ui, sans-serif">
            TradingView
          </text>
          <text x="46" y="34" className="fill-slate-500 dark:fill-slate-400 font-bold uppercase tracking-wider" fontSize="7.5" fontFamily="system-ui, sans-serif">
            CANLI BİST GRAFİK &amp; RASYOLAR
          </text>
        </svg>
      ),
      description:
        "BIST pay senetleri için 40+ temel bilanço rasyosu (F/K, PD/DD, FD/FAVÖK, ROE), RSI ve MACD osilatörleri, hareketli ortalamalar ve interaktif canlı mum grafikleri.",
      dataItems: ["40+ Bilanço Rasyosu", "İnteraktif Canlı Grafikler", "RSI / MACD Osilatörleri", "Teknik Al/Sat Sinyalleri"],
    },
  ];

  return (
    <section className="py-20 sm:py-24 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-[#070B14] transition-colors relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase tracking-wider text-[10px]">Resmi Veri &amp; Fıkhi Standart Entegrasyonları</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[#182542] dark:text-white tracking-tight leading-tight">
            Gücünü Türkiye’nin ve Dünyanın Lider Finans Altyapılarından Alır.
          </h2>

          <p className="text-xs sm:text-sm text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
            Mizan Katılım; tek bir kaynaktan değil, resmi borsa seans ağları, kamu bildirim platformları, fıkhi danışma kurulları ve uluslararası teknik analiz motorlarının ortak veri hattından 7/24 beslenir.
          </p>
        </div>

        {/* 4 Institution Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {institutions.map((inst) => (
            <div
              key={inst.id}
              className={`rounded-3xl p-6 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/10 ${inst.borderColor} transition-all duration-200 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-lg hover:-translate-y-1 group`}
            >
              {/* Card Top: Logo & Status Badge */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-9 flex items-center">
                    {inst.logo}
                  </div>
                  <a
                    href={inst.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white flex items-center justify-center transition shrink-0"
                    aria-label={`${inst.name} resmi sitesi`}
                  >
                    <ArrowUpRight size={14} />
                  </a>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${inst.badgeColor}`}>
                      {inst.badgeText}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {inst.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#182542] dark:text-white">
                    {inst.name}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">
                    {inst.role}
                  </span>
                </div>

                <p className="text-xs text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
                  {inst.description}
                </p>
              </div>

              {/* Card Bottom: Data Points Pulled */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Entegre Edilen Canlı Veriler:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {inst.dataItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#182542] dark:text-slate-300 font-medium">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Unified Data Pipeline Flow Banner */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Database size={20} />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Mizan Katılım 7/24 Kesintisiz Veri Hattı Aktif</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold">
                  TAM ENTEGRASYON
                </span>
              </div>
              <p className="text-[#6E81A0] dark:text-[#94A3B8] text-[11px] mt-0.5">
                Borsa İstanbul fiyat akışı &bull; KAP KAFİF bilgi formları &bull; TKBB fıkhi standartları &bull; TradingView teknik osilatörleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/tarayici"
              className="px-4 py-2 rounded-xl bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <span>Canlı 626 Hissede İncele</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
