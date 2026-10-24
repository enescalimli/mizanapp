import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Radio,
  Sparkles,
  Scale,
  Coins,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Giriş Yap | MizanApp.tr - Katılım Finansmanı",
  description: "MizanApp hesabınıza giriş yaparak katılım uygunluk, canlı KAP & SPK bildirimleri, Mizan AI ve fıkhi arındırma defterinizi yönetin.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#EEF0F4] dark:bg-[#000000] text-[#14151A] dark:text-[#F1F3F7] selection:bg-[#E6F8EF] selection:text-[#0D8B52] transition-colors duration-200 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Bar: Brand & Back to Home */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Ana Sayfaya Dön</span>
        </Link>

        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-[#182542] dark:bg-[#0F172A] border border-white/20 p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/brand/logo.svg"
              alt="Mizan Katılım"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="text-base font-black tracking-tight text-[#182542] dark:text-white">
            mizan <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">katılım</span>
          </span>
        </Link>
      </div>

      {/* Main Split Content: Left Feature Showcase + Right AuthForm */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-4">
        
        {/* Left Column: New Features & Value Proposition */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#0D8B52] dark:text-emerald-400 text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>2026 Yeni Özellikler Yayında</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#182542] dark:text-white tracking-tight leading-[1.18]">
            Borsa İstanbul’da Helal Yatırımın{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              Dijital Zekâsı.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#525E75] dark:text-[#94A3B8] leading-relaxed">
            Mizan Katılım ile portföyünüzün fıkhi meşruiyetini anlık koruyun, resmi regülasyon akışlarını kaçırmayın ve kuruşu kuruşuna arındırmanızı hesaplayın.
          </p>

          {/* Newly Added Features Highlight Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            
            {/* 1. Canlı KAP & SPK Bildirim Akışı */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0E1015] border border-slate-200/70 dark:border-white/10 shadow-xs space-y-2 hover:border-emerald-500/40 transition">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Radio size={16} className="animate-pulse" />
              </div>
              <h3 className="text-xs font-extrabold text-[#182542] dark:text-white">
                Canlı KAP &amp; SPK Akışı
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed">
                Devre kesiciler, sermaye artırımları ve haftalık SPK bültenleri anlık resmi bildirim motoru.
              </p>
            </div>

            {/* 2. Mizan AI Fıkhi & Finansal Asistan */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0E1015] border border-slate-200/70 dark:border-white/10 shadow-xs space-y-2 hover:border-emerald-500/40 transition">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <h3 className="text-xs font-extrabold text-[#182542] dark:text-white">
                Mizan AI Asistan
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed">
                Gemini 3.8 Flash tabanlı akıllı fıkhi danışman; dipnot okuma, icazet denetimi ve sesli sorgulama.
              </p>
            </div>

            {/* 3. 626 BIST Katılım Taraması */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0E1015] border border-slate-200/70 dark:border-white/10 shadow-xs space-y-2 hover:border-emerald-500/40 transition">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Scale size={16} />
              </div>
              <h3 className="text-xs font-extrabold text-[#182542] dark:text-white">
                626 Hisse 3 Altın Rasyo
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed">
                Diyanet ve TKBB standartlarında faizli borç, nakit ve gelir tavanı anlık filtresi.
              </p>
            </div>

            {/* 4. Arındırma & Zekât Motoru */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0E1015] border border-slate-200/70 dark:border-white/10 shadow-xs space-y-2 hover:border-emerald-500/40 transition">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Coins size={16} />
              </div>
              <h3 className="text-xs font-extrabold text-[#182542] dark:text-white">
                Hassas Tathir &amp; Zekât
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed">
                Temettü ve hisse kazançlarının kuruşu kuruşuna arındırılması ve zekât matrahı hesabı.
              </p>
            </div>

          </div>

          {/* Trust Points */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#6E81A0] dark:text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Resmi SPK &amp; KAP Verileri
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              DİB &amp; TKBB Metodolojisi
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              256-Bit SSL Şifreleme
            </span>
          </div>

        </div>

        {/* Right Column: Auth Card */}
        <div className="lg:col-span-6 flex justify-center">
          <AuthForm initialMode="login" />
        </div>

      </div>

      {/* Footer Info */}
      <div className="max-w-7xl w-full mx-auto pt-6 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6E81A0] dark:text-[#8C9BB0]">
        <span>© 2026 Mizan Finans Teknolojileri A.Ş. Tüm hakları saklıdır.</span>
        <div className="flex items-center gap-4">
          <Link href="/gizlilik-politikasi" className="hover:text-emerald-600 dark:hover:text-white transition">
            Gizlilik Politikası
          </Link>
          <span>&bull;</span>
          <Link href="/kullanim-kosullari" className="hover:text-emerald-600 dark:hover:text-white transition">
            Kullanım Koşulları
          </Link>
        </div>
      </div>

    </div>
  );
}
