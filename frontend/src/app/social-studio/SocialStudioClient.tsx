"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import {
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Eye,
  Grid3X3,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  Calculator,
  RefreshCw,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

// ============================================================================
// MIZAN EMBLEM (Kusursuz Platin/Gümüş Vektör Amblemi)
// ============================================================================
function MizanEmblem({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="292 288.5 440 440"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="silverLeft" x1="320" y1="350" x2="500" y2="660" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#f8fafc" />
          <stop offset="75%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="silverRight" x1="565" y1="630" x2="690" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="25%" stopColor="#94a3b8" />
          <stop offset="60%" stopColor="#cbd5e1" />
          <stop offset="85%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="silverFlap" x1="525" y1="520" x2="574" y2="520" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <filter id="emblemHalo" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#38bdf8" floodOpacity="0.22" />
          <feDropShadow dx="0" dy="10" stdDeviation="16" floodColor="#000000" floodOpacity="0.65" />
        </filter>
        <filter id="creaseShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
          <feOffset in="blur" dx="3" dy="1" result="offset" />
          <feFlood floodColor="#020617" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="offset" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#emblemHalo)">
        <path
          d="M 324 349 L 444 421 C 492 449.8 499 500 499 510 L 499 668 L 379 596 C 366 588.2 324 565 324 519 Z"
          fill="url(#silverLeft)"
        />
        <path
          d="M 700 349 L 580 421 C 532 449.8 525 500 525 510 L 525 668 L 645 596 C 658 588.2 700 565 700 519 Z"
          fill="url(#silverRight)"
        />
        <path
          d="M 603 407 C 581 429 574 453 574 475 L 574 580 C 574 607 569 641.6 525 668 L 525 510 C 525 500 532 449.8 580 421 Z"
          fill="url(#silverFlap)"
          filter="url(#creaseShadow)"
        />
      </g>
    </svg>
  );
}

// ============================================================================
// SLIDE VERİ MODELLERİ (LACİVERT & PLATİN PRESTİJ PALETİ)
// ============================================================================
interface SlideData {
  id: number;
  category: string;
  eyebrow: string;
  titlePrimary: string;
  titleSerif: string;
  titleSecondary?: string;
  subtitle: string;
  renderBody: () => React.ReactNode;
  footerNote?: string;
}

const SLIDES: SlideData[] = [
  // --------------------------------------------------------------------------
  // SLAYT 1: KAPAK (Mizan Nedir?)
  // --------------------------------------------------------------------------
  {
    id: 1,
    category: "KURUMSAL LANSMAN",
    eyebrow: "BORSA İSTANBUL FİNANSAL STANDARTLARI",
    titlePrimary: "Helal Yatırımın",
    titleSerif: "Dijital Pusulası:",
    titleSecondary: "Mizan",
    subtitle:
      "Borsa İstanbul Katılım Endeksi hisselerini şüpheye yer bırakmadan anlık takip edin, çeyreklik bilançoları röntgenleyin ve kuruşu kuruşuna arındırma payınızı öğrenin.",
    renderBody: () => (
      <div className="flex flex-col gap-6 w-full">
        {/* Ana Hero Bento Vitrini - Apple Glass Card */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/[0.12] bg-[#0E1526]/75 p-9 shadow-[0_24px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          {/* İç Hairline Ring */}
          <div className="absolute inset-0 rounded-[32px] border border-white/[0.05] pointer-events-none" />

          {/* Üst Durum Çubuğu */}
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400"></span>
              </span>
              <span className="font-mono text-xs font-semibold tracking-wider text-slate-200 uppercase">
                BIST Katılım (XKTUM) Canlı Analiz
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] font-mono font-medium text-slate-300">
              TKBB STANDART NO:1 &bull; DİYANET
            </div>
          </div>

          {/* 3'lü Bento Grid */}
          <div className="grid grid-cols-3 gap-5 mt-7">
            <div className="rounded-2xl border border-white/[0.08] bg-[#141C30]/80 p-5 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white mb-3">
                <ShieldCheck size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-white tracking-tight">%100</div>
                <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider mt-1">Fıkhi Uyum</div>
                <div className="text-xs text-slate-400 mt-1.5 leading-snug">DİB ve TKBB standartlarına tam sadakat</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#141C30]/80 p-5 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white mb-3">
                <TrendingUp size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-white tracking-tight">600+</div>
                <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider mt-1">Şirket Taraması</div>
                <div className="text-xs text-slate-400 mt-1.5 leading-snug">3 çeyreklik bilanço ve gelir filtresi</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#141C30]/80 p-5 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white mb-3">
                <Calculator size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-white tracking-tight">0.00 ₺</div>
                <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider mt-1">Sıfır Hata Payı</div>
                <div className="text-xs text-slate-400 mt-1.5 leading-snug">Kuruşu kuruşuna pro-rata arındırma</div>
              </div>
            </div>
          </div>

          {/* Alt Hisse Ticker Bandı */}
          <div className="mt-7 pt-5 border-t border-white/[0.08] flex items-center justify-between font-mono text-xs text-slate-300">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">THYAO</span>
                <span className="text-slate-400">314.50 ₺</span>
                <span className="text-sky-300 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">
                  UYGUN
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">ASELS</span>
                <span className="text-slate-400">68.20 ₺</span>
                <span className="text-sky-300 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">
                  UYGUN
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">BIMAS</span>
                <span className="text-slate-400">495.00 ₺</span>
                <span className="text-sky-300 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">
                  UYGUN
                </span>
              </div>
            </div>
            <span className="font-bold text-sky-400 tracking-wider">mizanapp.tr</span>
          </div>
        </div>

        {/* Swipe Callout */}
        <div className="flex items-center justify-between px-7 py-4 rounded-2xl border border-white/[0.1] bg-[#0E1526]/50 text-slate-300">
          <span className="text-sm font-medium">
            Katılım yatırımcısının neden Mizan'a ihtiyacı var? Keşfetmek için kaydırın
          </span>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
            <span>Kaydırın</span>
            <ArrowRight size={15} />
          </div>
        </div>
      </div>
    ),
    footerNote: "Kaydırın →",
  },

  // --------------------------------------------------------------------------
  // SLAYT 2: NEDEN MİZAN? (Sorun & İhtiyaç)
  // --------------------------------------------------------------------------
  {
    id: 2,
    category: "FİNANSAL GERÇEKLER",
    eyebrow: "MEVCUT BORSA UYGULAMALARININ EKSİKLİĞİ",
    titlePrimary: "Geleneksel Borsa Ekranları",
    titleSerif: "Neden Yetersiz?",
    subtitle:
      "Standart borsa platformları sadece hisse fiyatı ve grafik gösterir; şirketin arka plandaki faiz yükünü ve fıkhi uygunluk sınırlarını saklar.",
    renderBody: () => (
      <div className="flex flex-col gap-4 w-full">
        {/* Bento 1: Bilanço Dönemleri */}
        <div className="rounded-[24px] border border-white/[0.09] bg-[#0E1526]/75 p-6 backdrop-blur-2xl">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white shrink-0 mt-0.5">
              <span className="font-mono font-bold text-base">01</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                  Bilanço Dönemlerinde Geciken Kararlar
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                  Kritik Risk
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mt-1.5">
                Şirketler çeyreklik dönemlerde katılım kriterlerinin dışına çıkabilir
              </h4>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Şirketler yeni finansal rapor açıkladığında faizli borçları veya faiz gelirleri yasal eşiği aşabilir.
                Yatırımcılar bunu aylar sonra resmi liste güncellenene kadar fark edemez.
              </p>
              <div className="mt-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 flex items-center gap-2">
                <ShieldCheck size={16} className="text-sky-300 shrink-0" />
                <span>
                  <strong className="text-white">Mizan Çözümü:</strong> KAP'a düşen ilk bilanço dipnotlarıyla eşikler
                  anında test edilir ve risk anında yatırımcıya bildirilir.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 2: Manuel Arındırma */}
        <div className="rounded-[24px] border border-white/[0.09] bg-[#0E1526]/75 p-6 backdrop-blur-2xl">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white shrink-0 mt-0.5">
              <span className="font-mono font-bold text-base">02</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                  Manuel Arındırma Matematiğinin İmkânsızlığı
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                  Matematiksel Zorluk
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mt-1.5">
                Her hissenin faizli gelir payı ve sizin elde tuttuğunuz gün süresi farklıdır
              </h4>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Temettü ve hisse kazancından ne kadarının arındırılacağını hesaplamak karmaşık bilanço oranları ve pro-rata
                gün hesabı gerektirir.
              </p>
              <div className="mt-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 flex items-center gap-2">
                <Calculator size={16} className="text-sky-300 shrink-0" />
                <span>
                  <strong className="text-white">Mizan Çözümü:</strong> Alış tarihinize ve lot miktarınıza göre kuruşu
                  kuruşuna net arındırma tutarı üretilir.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 3: Gizli Dipnotlar */}
        <div className="rounded-[24px] border border-white/[0.09] bg-[#0E1526]/75 p-6 backdrop-blur-2xl">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white shrink-0 mt-0.5">
              <span className="font-mono font-bold text-base">03</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                  Bilanço Dipnotlarındaki Kör Noktalar
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                  Şeffaflık İhtiyacı
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mt-1.5">
                Faizli vadeli mevduat ve türev işlemler dipnotlarda saklıdır
              </h4>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Şirketin ana faaliyeti helal görünse de kasadaki paranın vadeli mevduatta tutulması veya döviz türevleri
                katılım eşiğini aşabilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    footerNote: "2 / 5",
  },

  // --------------------------------------------------------------------------
  // SLAYT 3: 3 ALTIN KURAL (Katılım Endeksi Filtreleri)
  // --------------------------------------------------------------------------
  {
    id: 3,
    category: "BİST KATILIM METODOLOJİSİ",
    eyebrow: "TKBB STANDART NO:1 ESASLARI",
    titlePrimary: "Katılım Endeksi'nin",
    titleSerif: "3 Altın Kuralı",
    subtitle:
      "Bir şirketin BIST Katılım Endeksi'ne dahil olabilmesi için sadece helal sektörde olması yetmez; 3 temel mali eşiği aşmaması zorunludur:",
    renderBody: () => (
      <div className="flex flex-col gap-5 w-full">
        {/* Oran 1: Faizli Borçlar */}
        <div className="rounded-[24px] border border-white/[0.09] bg-[#0E1526]/80 p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-sm text-white">
                1
              </div>
              <h4 className="text-lg font-bold text-white">Faizli Borçlar Oranı</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Yasal Eşik:</span>
              <span className="font-mono text-sm font-bold px-3 py-1 rounded-md bg-white/[0.08] text-white border border-white/[0.12]">
                ≤ %33
              </span>
            </div>
          </div>

          {/* Progress Bar Visual */}
          <div className="w-full bg-[#1A2338] rounded-full h-3 relative overflow-hidden my-3">
            <div className="bg-gradient-to-r from-sky-400 to-blue-500 h-3 rounded-full w-[43%]" />
            <div className="absolute top-0 bottom-0 left-[66%] w-0.5 bg-rose-400 z-10" />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 mt-2 font-mono">
            <span>
              Örnek Şirket Ölçümü: <strong className="text-white">%14.2</strong> (Güvenli Alan)
            </span>
            <span className="text-slate-400">Üst Sınır: %33</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Şirketin kısa ve uzun vadeli toplam faiz getiren borçlarının piyasa değerine oranı %33'ü kesinlikle geçemez.
          </p>
        </div>

        {/* Oran 2: Faiz Getiren Varlıklar */}
        <div className="rounded-[24px] border border-white/[0.09] bg-[#0E1526]/80 p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-sm text-white">
                2
              </div>
              <h4 className="text-lg font-bold text-white">Faiz Getiren Varlıklar Oranı</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Yasal Eşik:</span>
              <span className="font-mono text-sm font-bold px-3 py-1 rounded-md bg-white/[0.08] text-white border border-white/[0.12]">
                ≤ %33
              </span>
            </div>
          </div>

          {/* Progress Bar Visual */}
          <div className="w-full bg-[#1A2338] rounded-full h-3 relative overflow-hidden my-3">
            <div className="bg-gradient-to-r from-sky-400 to-blue-500 h-3 rounded-full w-[26%]" />
            <div className="absolute top-0 bottom-0 left-[66%] w-0.5 bg-rose-400 z-10" />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 mt-2 font-mono">
            <span>
              Örnek Şirket Ölçümü: <strong className="text-white">%8.6</strong> (Güvenli Alan)
            </span>
            <span className="text-slate-400">Üst Sınır: %33</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Vadeli mevduat, tahvil, bono ve faizli nakit benzerlerinin toplam varlıklara veya piyasa değerine oranı %33'ü
            aşamaz.
          </p>
        </div>

        {/* Oran 3: Uygun Olmayan Gelirler */}
        <div className="rounded-[24px] border border-white/[0.09] bg-[#0E1526]/80 p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-sm text-white">
                3
              </div>
              <h4 className="text-lg font-bold text-white">Uygun Olmayan Gelirler Oranı</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Kritik Tavan:</span>
              <span className="font-mono text-sm font-bold px-3 py-1 rounded-md bg-white/[0.08] text-white border border-white/[0.12]">
                ≤ %5
              </span>
            </div>
          </div>

          {/* Progress Bar Visual */}
          <div className="w-full bg-[#1A2338] rounded-full h-3 relative overflow-hidden my-3">
            <div className="bg-gradient-to-r from-sky-400 to-blue-500 h-3 rounded-full w-[22%]" />
            <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-rose-400 z-10" />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 mt-2 font-mono">
            <span>
              Örnek Şirket Ölçümü: <strong className="text-white">%1.1</strong> (Güvenli Alan)
            </span>
            <span className="text-rose-400">Hassas Tavan: %5</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Faiz gelirleri ve katılım kriterlerine uymayan faaliyetlerden elde edilen hasılat payı %5'i geçemez.
          </p>
        </div>

        {/* Bilgi Çubuğu */}
        <div className="px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs text-slate-300 font-mono">
          <span>Mizan algoritması 600+ şirketi her çeyrekte insan hatası olmadan otomatik tarar.</span>
          <span className="text-sky-300 font-bold uppercase tracking-wider">Otomasyon</span>
        </div>
      </div>
    ),
    footerNote: "3 / 5",
  },

  // --------------------------------------------------------------------------
  // SLAYT 4: ARINDIRMA MOTORU (Kuruşu Kuruşuna)
  // --------------------------------------------------------------------------
  {
    id: 4,
    category: "ARINDIRMA MOTORU",
    eyebrow: "VİCDANİ HUZUR & ŞEFFAF HESAPLAMA",
    titlePrimary: "Hisse Başına Arındırma",
    titleSerif: "Artık Bilmece Değil",
    subtitle:
      "Şirketin elde ettiği kaçınılmaz faiz gelirleri temettü ve hisse kazancınıza yansır. Mizan, vicdani huzurunuz için bu payı pro-rata gün hesabıyla netleştirir.",
    renderBody: () => (
      <div className="flex flex-col gap-5 w-full">
        {/* Canlı Hesaplama Ledger Kartı */}
        <div className="rounded-[28px] border border-white/[0.12] bg-[#0E1526]/85 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-white text-sm">
                THY
              </div>
              <div>
                <h4 className="font-bold text-white text-base">THYAO &bull; Türk Hava Yolları A.O.</h4>
                <div className="text-xs text-slate-400 font-mono">BIST Katılım Endeksi Şirketi</div>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-slate-200 text-xs font-mono font-bold">
              ✓ Katılıma Uygun
            </div>
          </div>

          {/* Hesap Parametreleri */}
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-xl bg-[#141C30]/80 border border-white/[0.08]">
              <span className="text-xs text-slate-400 block font-mono">Portföyünüz</span>
              <span className="font-mono font-bold text-white text-xl mt-1 block">250 Lot</span>
            </div>
            <div className="p-4 rounded-xl bg-[#141C30]/80 border border-white/[0.08]">
              <span className="text-xs text-slate-400 block font-mono">Elde Tutma</span>
              <span className="font-mono font-bold text-white text-xl mt-1 block">94 Gün</span>
            </div>
            <div className="p-4 rounded-xl bg-[#141C30]/80 border border-white/[0.08]">
              <span className="text-xs text-slate-400 block font-mono">Arındırma Oranı</span>
              <span className="font-mono font-bold text-sky-300 text-xl mt-1 block">%0.0014</span>
            </div>
          </div>

          {/* Büyük Net Tutar Kutusu */}
          <div className="p-6 rounded-2xl bg-[#090D18] border border-white/[0.14] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-mono">
                Arındırılması Gereken Tutar
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">
                Pro-rata gün ve kâr payı esasına göre tam hesaplama
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-4xl font-extrabold text-white tracking-tight">
                35.50 ₺
              </span>
            </div>
          </div>
        </div>

        {/* 2 Alt Bilgi Kartı */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0E1526]/70 p-5 backdrop-blur-2xl">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white mb-2.5">
              <TrendingUp size={18} />
            </div>
            <h5 className="font-bold text-white text-sm">Pro-Rata Gün Hesabı</h5>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Tüm yılın değil; hisseyi elinizde tuttuğunuz gün kadar faiz payı hesaplanır. Haksız kesinti yapılmaz.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0E1526]/70 p-5 backdrop-blur-2xl">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white mb-2.5">
              <ShieldCheck size={18} />
            </div>
            <h5 className="font-bold text-white text-sm">Arındırma Nereye Verilir?</h5>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Arındırılan tutar sevap beklenmeksizin kamu yararına, ihtiyaç sahiplerine veya vakıflara aktarılır.
            </p>
          </div>
        </div>
      </div>
    ),
    footerNote: "4 / 5",
  },

  // --------------------------------------------------------------------------
  // SLAYT 5: SONUÇ & ÇAĞRI (Lansman CTA)
  // --------------------------------------------------------------------------
  {
    id: 5,
    category: "MİZAN'A KATILIN",
    eyebrow: "DİJİTAL KATILIM ÇAĞI BAŞLADI",
    titlePrimary: "Yatırımlarınızın",
    titleSerif: "Vicdani Pusulası",
    subtitle:
      "Borsa İstanbul'da helal kazanç arayışındaki yatırımcılar için geliştirilen en kapsamlı ve bağımsız katılım finans platformu.",
    renderBody: () => (
      <div className="flex flex-col gap-6 w-full">
        {/* 4'lü Bento Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0E1526]/80 p-5 backdrop-blur-2xl">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white mb-3">
              <ShieldCheck size={20} />
            </div>
            <h5 className="font-bold text-white text-sm">600+ Şirket Katılım Taraması</h5>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Tüm Borsa İstanbul şirketlerinin güncel katılım statüsü anlık elinizin altında.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0E1526]/80 p-5 backdrop-blur-2xl">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white mb-3">
              <Calculator size={20} />
            </div>
            <h5 className="font-bold text-white text-sm">Otomatik Arındırma & Zekât</h5>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Portföyünüze özel gün bazlı kuruşu kuruşuna arındırma ve hisse zekâtı motoru.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0E1526]/80 p-5 backdrop-blur-2xl">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white mb-3">
              <AlertTriangle size={20} />
            </div>
            <h5 className="font-bold text-white text-sm">KAP & Bilanço Alarmları</h5>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Kriter sınırına yaklaşan veya endeksten çıkma riski taşıyan hisseler için anlık uyarı.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0E1526]/80 p-5 backdrop-blur-2xl">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white mb-3">
              <FileSpreadsheet size={20} />
            </div>
            <h5 className="font-bold text-white text-sm">Bilanço Dipnot Röntgeni</h5>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Faizli borç, varlık ve gayrimeşru gelirlerin şeffaf, filtrelenmiş analitik grafiği.
            </p>
          </div>
        </div>

        {/* Büyük Vitrin CTA Kartı - Apple Monokrom Buton */}
        <div className="rounded-[32px] border border-white/[0.12] bg-[#0E1526]/90 p-9 backdrop-blur-2xl text-center shadow-2xl relative overflow-hidden">
          <span className="text-xs font-mono font-bold tracking-widest text-sky-300 uppercase">
            HEMEN BAŞLAYIN &bull; ÜCRETSİZ PORTFÖY
          </span>
          <h3 className="text-2xl font-bold text-white mt-2">
            Portföyünüzü Ekleyin, Katılım Durumunuzu Saniyeler İçinde Öğrenin
          </h3>
          <p className="text-xs text-slate-300 mt-2.5 max-w-lg mx-auto leading-relaxed">
            Kurulum gerekmez. Web ve mobil tarayıcınızdan doğrudan erişin.
          </p>

          <div className="mt-7 flex items-center justify-center">
            <div className="px-9 py-4 rounded-full bg-white hover:bg-slate-100 text-[#0A0E1A] font-extrabold text-base shadow-[0_12px_28px_rgba(0,0,0,0.4)] flex items-center gap-3 active:scale-95 transition-all cursor-pointer">
              <span>mizanapp.tr'yi Keşfet</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-6 text-[11px] font-mono text-slate-400">
            DİB & TKBB Standart No:1 &bull; Sıfır Float Toleransı &bull; mizanapp.tr
          </div>
        </div>
      </div>
    ),
    footerNote: "mizanapp.tr",
  },
];

// ============================================================================
// INSTAGRAM CAPTION (AÇIKLAMA METNİ)
// ============================================================================
const INSTAGRAM_CAPTION = `Borsa İstanbul’da hisse alırken Katılım Endeksi’ne gerçekten uygun olup olmadığını nasıl takip ediyorsunuz? 📊

Bir hissenin katılım kriterlerini sağlaması için sadece ana faaliyet konusu yetmez; faizli borçları, faiz getiren varlıkları ve faiz gelirlerinin belirli oranları (≤ %33 ve ≤ %5) aşmaması gerekir. Üstelik her bilanço döneminde bu oranlar değişebilir!

Mizan (mizanapp.tr) ile:
▪️ 600+ BIST şirketinin Katılım Endeksi uygunluğunu anlık takip edin.
▪️ Şirketlerin çeyreklik bilanço ve dipnotlarındaki gizli faiz kalemlerini görün.
▪️ Portföyünüzdeki hisseleri ne kadar süre tuttuğunuza göre kuruşu kuruşuna arındırma tutarınızı hesaplayın.
▪️ Kriter sınırına yaklaşan hisseler için erken uyarı alın.

Helal kazanç hassasiyetinizde teknoloji yanınızda. Portföyünüzü ekleyin, vicdani huzurla yatırım yapın 🧭

👉 mizanapp.tr

⚠️ Yasal Uyarı: Burada yer alan bilgiler yatırım tavsiyesi kapsamında değildir. Kamuya açık finansal raporlar ve Katılım Finans İlkeleri çerçevesinde bilgilendirme amacıyla hazırlanmıştır.

#Mizan #KatılımEndeksi #Borsaİstanbul #KatılımFinans #TemettüYatırımı #XKTUM #HelalYatırım #BIST100 #HisseArındırma #FinansalOkuryazarlık`;

// ============================================================================
// 1080x1350 TEKİL SLAYT BİLEŞENİ (PRESTİJ LACİVERT & PLATİN)
// ============================================================================
interface SlideRendererProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  showSafeZone?: boolean;
}

const SlideCard: React.FC<SlideRendererProps> = ({
  slide,
  slideIndex,
  totalSlides,
  showSafeZone = false,
}) => {
  return (
    <div
      className="relative select-none text-white overflow-hidden"
      style={{
        width: 1080,
        height: 1350,
        backgroundColor: "#070A12",
        fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif',
      }}
    >
      {/* Derin Atmosferik Lacivert Degrade Işıması */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 82% 14%, rgba(39, 56, 105, 0.35) 0%, transparent 60%),
            radial-gradient(circle at 18% 86%, rgba(24, 37, 66, 0.38) 0%, transparent 55%),
            radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.04) 0%, transparent 70%),
            linear-gradient(180deg, #06080F 0%, #0A0E1A 50%, #0E1528 100%)
          `,
        }}
      />

      {/* İnce İsviçre Izgara Deseni (Atmosphere) */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* İsteğe Bağlı: 64px Güvenli Alan Çerçevesi */}
      {showSafeZone && (
        <div className="absolute inset-[64px] border border-dashed border-sky-400/40 pointer-events-none z-50">
          <span className="absolute top-2 left-2 text-[10px] font-mono text-sky-300 bg-black/60 px-2 py-0.5 rounded">
            64px Güvenli Alan
          </span>
        </div>
      )}

      {/* Ana İçerik Konteyneri (64px Padding) */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-[64px]">
        {/* ==========================================
            ÜST BAŞLIK (HEADER BAR)
            ========================================== */}
        <header className="flex items-center justify-between w-full">
          {/* Sol: Mizan Platin Logo + Marka Başlığı */}
          <div className="flex items-center gap-4">
            <MizanEmblem size={52} />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-white leading-none">mizan</span>
                <span className="text-2xl font-semibold tracking-wide text-slate-300 leading-none">katılım</span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-1">
                Finansal Standartlar
              </span>
            </div>
          </div>

          {/* Sağ: Kategori Rozeti + Slayt Numarası */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-[#182542]/60 border border-white/[0.12] text-slate-200">
              <span className="text-xs font-mono font-bold tracking-wider uppercase">
                {slide.category}
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold text-slate-300">
              0{slideIndex + 1} / 0{totalSlides}
            </div>
          </div>
        </header>

        {/* ==========================================
            ORTA ALAN (EDİTÖRYAL BAŞLIK & BODY)
            ========================================== */}
        <main className="flex-1 flex flex-col justify-center my-6">
          {/* Başlık Bölümü */}
          <div className="mb-8">
            <span className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase block mb-2.5">
              {slide.eyebrow}
            </span>
            <h2 className="text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
              {slide.titlePrimary}{" "}
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-200">
                {slide.titleSerif}
              </span>{" "}
              {slide.titleSecondary && <span>{slide.titleSecondary}</span>}
            </h2>
            <p className="text-lg text-slate-300 font-normal leading-relaxed mt-4 max-w-3xl">
              {slide.subtitle}
            </p>
          </div>

          {/* Slayt Gövdesi */}
          <div className="w-full">{slide.renderBody()}</div>
        </main>

        {/* ==========================================
            ALT BİLGİ (FOOTER BAR)
            ========================================== */}
        <footer className="w-full pt-6 border-t border-white/[0.1] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-sky-400">&bull;</span>
            <span>DİB Din İşleri Yüksek Kurulu & TKBB Standart No:1</span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.15] text-white font-bold text-xs">
              mizanapp.tr
            </div>
            {slide.footerNote && (
              <span className="text-xs font-semibold text-slate-300">
                {slide.footerNote}
              </span>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

// ============================================================================
// ANA İSTEMCİ STÜDYO BİLEŞENİ
// ============================================================================
export function SocialStudioClient() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoom, setZoom] = useState<number>(0.5);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Offscreen export referansları
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Klavye ok tuşları ile gezinim
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "single") return;
      if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => (prev < SLIDES.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode]);

  // Tek slaytı 1080x1350 PNG olarak indir
  const handleDownloadSlide = async (slideIdx: number) => {
    const node = exportRefs.current[slideIdx];
    if (!node) {
      alert("Slayt bileşeni bulunamadı.");
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(`Slayt 0${slideIdx + 1} hazırlanıyor...`);

      const dataUrl = await toPng(node, {
        width: 1080,
        height: 1350,
        pixelRatio: 1,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `mizan-lansman-slayt-0${slideIdx + 1}.png`;
      link.href = dataUrl;
      link.click();

      setExportProgress("İndirme tamamlandı!");
      setTimeout(() => setExportProgress(null), 2000);
    } catch (err) {
      console.error("Görsel dışa aktarma hatası:", err);
      alert("Görsel üretilirken bir hata oluştu: " + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // Tüm 5 slaytı sırayla indir
  const handleDownloadAll = async () => {
    try {
      setIsExporting(true);

      for (let i = 0; i < SLIDES.length; i++) {
        setExportProgress(`Slayt 0${i + 1} / 0${SLIDES.length} dışa aktarılıyor...`);
        const node = exportRefs.current[i];
        if (!node) continue;

        const dataUrl = await toPng(node, {
          width: 1080,
          height: 1350,
          pixelRatio: 1,
          cacheBust: true,
        });

        const link = document.createElement("a");
        link.download = `mizan-lansman-slayt-0${i + 1}.png`;
        link.href = dataUrl;
        link.click();

        await new Promise((res) => setTimeout(res, 400));
      }

      setExportProgress("Tüm 5 slayt başarıyla indirildi!");
      setTimeout(() => setExportProgress(null), 2500);
    } catch (err) {
      console.error("Toplu dışa aktarma hatası:", err);
      alert("Toplu görsel indirme sırasında hata: " + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // Caption kopyalama
  const handleCopyCaption = () => {
    navigator.clipboard.writeText(INSTAGRAM_CAPTION);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col selection:bg-white selection:text-[#0A0E1A]">
      {/* ====================================================================
          STÜDYO ÜST GEZİNİM (TOP TOOLBAR)
          ==================================================================== */}
      <header className="sticky top-0 z-50 h-16 border-b border-white/[0.08] bg-[#0A0D16]/90 backdrop-blur-xl px-6 flex items-center justify-between">
        {/* Sol: Logo & Başlık */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <MizanEmblem size={32} />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">mizan</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-200 border border-white/[0.12]">
                SOCIAL STUDIO
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                PREMIUM NAVY
              </span>
            </div>
          </Link>
        </div>

        {/* Orta: Görünüm & Zoom Araçları */}
        <div className="flex items-center gap-3">
          {/* Tekil vs Izgara Butonları */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.05] border border-white/[0.08]">
            <button
              onClick={() => setViewMode("single")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "single"
                  ? "bg-white text-[#0A0E1A] shadow-sm font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Eye size={14} />
              <span>Tekli İncele</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#0A0E1A] shadow-sm font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Grid3X3 size={14} />
              <span>5'li Izgara</span>
            </button>
          </div>

          <div className="h-5 w-px bg-white/[0.1]" />

          {/* Zoom Kontrolleri */}
          <div className="flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] rounded-xl p-1 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.3, Number((z - 0.05).toFixed(2))))}
              title="Uzaklaştır"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition"
            >
              <ZoomOut size={14} />
            </button>
            <span className="font-mono text-xs text-slate-300 px-2 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.0, Number((z + 0.05).toFixed(2))))}
              title="Yakınlaştır"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoom(0.5)}
              className="text-[11px] font-mono px-2 py-1 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition ml-1"
            >
              50%
            </button>
          </div>

          {/* Güvenli Alan Kılavuzu */}
          <button
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
              showSafeZone
                ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
                : "bg-white/[0.05] text-slate-400 border-white/[0.08] hover:text-white"
            }`}
            title="64px Güvenli Kenar Alanını Göster"
          >
            <Layers size={14} />
            <span>Güvenli Alan</span>
          </button>
        </div>

        {/* Sağ: İndirme & Aksiyon Butonları */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuideModal(true)}
            className="p-2 text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl transition"
            title="Tasarım Standartları & Palet"
          >
            <Info size={16} />
          </button>

          {/* Caption Kopyala */}
          <button
            onClick={handleCopyCaption}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-xs font-medium text-slate-200 transition"
          >
            {copiedCaption ? (
              <>
                <Check size={14} className="text-sky-300" />
                <span className="text-sky-300 font-semibold">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Caption Kopyala</span>
              </>
            )}
          </button>

          {/* Bu Slaytı İndir */}
          <button
            onClick={() => handleDownloadSlide(currentSlide)}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] text-xs font-semibold text-white transition disabled:opacity-50"
          >
            <Download size={14} />
            <span>Aktif Slaytı İndir</span>
          </button>

          {/* Tüm Carousel'i İndir (High-Contrast White Button) */}
          <button
            onClick={handleDownloadAll}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0A0E1A] hover:bg-slate-100 text-xs font-bold shadow-lg shadow-black/40 transition active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Tüm Carousel'i İndir (5 PNG)</span>
          </button>
        </div>
      </header>

      {/* İlerleme Çubuğu */}
      {exportProgress && (
        <div className="bg-[#182542]/80 border-b border-white/[0.12] py-2 px-6 text-center text-xs font-mono font-medium text-slate-200 flex items-center justify-center gap-2">
          <RefreshCw size={12} className="animate-spin text-sky-400" />
          <span>{exportProgress}</span>
        </div>
      )}

      {/* ====================================================================
          ANA ÇALIŞMA ALANI (WORKSPACE CANVAS)
          ==================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* SOL: Slayt Seçici & Caption Yan Paneli */}
        <aside className="w-80 border-r border-white/[0.08] bg-[#080B14] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/[0.08]">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Carousel Slaytları ({SLIDES.length})
            </span>
            <div className="flex flex-col gap-2">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setViewMode("single");
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                    currentSlide === idx && viewMode === "single"
                      ? "bg-white/[0.1] border-white/30 text-white font-bold"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                      0{slide.id}
                    </span>
                    <span className="truncate max-w-[170px]">{slide.category}</span>
                  </div>
                  {currentSlide === idx && viewMode === "single" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Instagram Caption Paneli */}
          <div className="flex-1 p-4 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Instagram Caption
              </span>
              <button
                onClick={handleCopyCaption}
                className="text-[11px] font-mono text-sky-400 hover:underline flex items-center gap-1"
              >
                {copiedCaption ? "Kopyalandı!" : "Kopyala"}
              </button>
            </div>
            <div className="flex-1 p-3.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap select-text overflow-y-auto max-h-[360px]">
              {INSTAGRAM_CAPTION}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400">
              💎 <strong>Prestij Notu:</strong> Tasarımda yeşil yerine Mizan'ın kurumsal gece laciverti (`#182542`, `#273869`), platin beyaz ve saf cam katmanları kullanılmıştır.
            </div>
          </div>
        </aside>

        {/* SAĞ: ÖNİZLEME ALANI (CANVAS VIEWPORT) */}
        <main className="flex-1 bg-[#05070E] overflow-auto flex flex-col items-center justify-start p-8 relative">
          {viewMode === "single" ? (
            /* ==========================================
               TEKİL SLAYT ÖNİZLEMESİ
               ========================================== */
            <div className="flex flex-col items-center gap-6 my-auto">
              {/* Slayt Önizleme Konteyneri */}
              <div
                className="relative shadow-[0_30px_70px_rgba(0,0,0,0.7)] rounded-2xl overflow-hidden border border-white/[0.14]"
                style={{
                  width: 1080 * zoom,
                  height: 1350 * zoom,
                }}
              >
                <div
                  style={{
                    width: 1080,
                    height: 1350,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                >
                  <SlideCard
                    slide={SLIDES[currentSlide]}
                    slideIndex={currentSlide}
                    totalSlides={SLIDES.length}
                    showSafeZone={showSafeZone}
                  />
                </div>
              </div>

              {/* Alt Slayt Gezinim Çubuğu */}
              <div className="flex items-center gap-4 bg-[#0A0D16]/85 backdrop-blur-xl border border-white/[0.1] px-5 py-2.5 rounded-2xl shadow-2xl">
                <button
                  onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlide === 0}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition disabled:opacity-30"
                  title="Önceki Slayt (←)"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2">
                  {SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2.5 rounded-full transition-all ${
                        currentSlide === idx ? "w-8 bg-white" : "w-2.5 bg-white/20 hover:bg-white/40"
                      }`}
                      title={`Slayt ${idx + 1}`}
                    />
                  ))}
                </div>

                <span className="font-mono text-xs text-slate-300 px-2">
                  0{currentSlide + 1} / 0{SLIDES.length}
                </span>

                <button
                  onClick={() => setCurrentSlide((prev) => Math.min(SLIDES.length - 1, prev + 1))}
                  disabled={currentSlide === SLIDES.length - 1}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition disabled:opacity-30"
                  title="Sonraki Slayt (→)"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="h-4 w-px bg-white/[0.1] mx-1" />

                <button
                  onClick={() => handleDownloadSlide(currentSlide)}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.15] text-xs font-semibold transition"
                >
                  <Download size={14} />
                  <span>Bu Slaytı İndir</span>
                </button>
              </div>
            </div>
          ) : (
            /* ==========================================
               5'Lİ IZGARA (GRID) ÖNİZLEMESİ
               ========================================== */
            <div className="w-full max-w-7xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Carousel Genel Bakış</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    5 Slaytlık "Mizan Nedir?" prestij lansman serisi (1080x1350 Dikey 4:5).
                  </p>
                </div>
                <button
                  onClick={handleDownloadAll}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0A0E1A] hover:bg-slate-100 text-xs font-extrabold transition shadow-lg"
                >
                  <Download size={14} />
                  <span>Tümünü İndir (5 PNG)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {SLIDES.map((slide, idx) => {
                  const gridScale = 0.28;
                  return (
                    <div
                      key={slide.id}
                      onClick={() => {
                        setCurrentSlide(idx);
                        setViewMode("single");
                      }}
                      className="group flex flex-col gap-2 cursor-pointer"
                    >
                      <div
                        className="relative rounded-2xl overflow-hidden border border-white/[0.1] group-hover:border-white/40 transition shadow-xl bg-black"
                        style={{
                          width: 1080 * gridScale,
                          height: 1350 * gridScale,
                        }}
                      >
                        <div
                          style={{
                            width: 1080,
                            height: 1350,
                            transform: `scale(${gridScale})`,
                            transformOrigin: "top left",
                            pointerEvents: "none",
                          }}
                        >
                          <SlideCard
                            slide={slide}
                            slideIndex={idx}
                            totalSlides={SLIDES.length}
                            showSafeZone={showSafeZone}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="font-mono text-slate-400 font-bold">0{slide.id}</span>
                        <span className="font-medium text-slate-300 truncate">{slide.category}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSlide(idx);
                          }}
                          className="p-1 text-slate-400 hover:text-white transition"
                          title="İndir"
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ====================================================================
          GÖRÜNMEYEN (OFFSCREEN) 1080x1350 EKSPORT AĞACI
          ==================================================================== */}
      <div
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          pointerEvents: "none",
        }}
      >
        {SLIDES.map((slide, idx) => (
          <div
            key={`export-${slide.id}`}
            ref={(el) => {
              exportRefs.current[idx] = el;
            }}
            style={{ width: 1080, height: 1350 }}
          >
            <SlideCard
              slide={slide}
              slideIndex={idx}
              totalSlides={SLIDES.length}
              showSafeZone={false}
            />
          </div>
        ))}
      </div>

      {/* ====================================================================
          STANDARTLAR & KILAVUZ MODALI
          ==================================================================== */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-[#0B0E18] border border-white/[0.12] rounded-3xl p-7 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <MizanEmblem size={28} />
                <h3 className="text-lg font-bold text-white">Mizan Tasarım Sistemi & Palet Standartları</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.05] transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h4 className="font-bold text-white mb-1">🏛️ Kurumsal Renk Disiplini (Yeşilsiz Prestij Paleti)</h4>
                <p>
                  Projedeki <code>tailwind.config.ts</code> paletine sadık kalınarak <strong>Derin Gece Mürekkebi</strong>{" "}
                  (<code>#06080F</code>), <strong>Kurumsal Orbix Laciverti</strong> (<code>#182542</code>,{" "}
                  <code>#273869</code>), <strong>Platin Beyaz</strong> (<code>#FFFFFF</code>) ve ince safir buz ışıltıları
                  kullanılmıştır.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h4 className="font-bold text-white mb-1">✒️ Tipografi Çifti (Editorial Hierarchy)</h4>
                <p>
                  Ana başlıklarda yüksek yoğunluklu sans-serif ile birlikte İtalyan/İsviçre editoryal şıklığı katan{" "}
                  <em className="font-serif italic text-white text-sm">Newsreader Serif İtalik</em> vurgular
                  kullanılmıştır. Rakamlar ve katsayılar için daima <code>font-mono</code> tabular rakamlar geçerlidir.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h4 className="font-bold text-white mb-1">📐 4:5 Dikey Instagram Formatı & 64px Güvenli Alan</h4>
                <p>
                  Her slayt <strong>1080x1350px</strong> piksel standardındadır. Kenarlardan 64 piksel güvenli mesafe
                  bırakılarak Instagram profil ve aksiyon butonlarının içeriği kesmesi önlenir.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-6 py-2.5 rounded-full bg-white text-[#0A0E1A] font-extrabold text-xs transition hover:bg-slate-100"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
