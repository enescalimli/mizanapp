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
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#08080C] text-[#08080C] dark:text-white selection:bg-[#C6F432] selection:text-[#08080C] transition-colors duration-200 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[480px] mizan-glow-bg z-0" />
      
      {/* Top Bar: Brand & Back to Home */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#08080C] dark:hover:text-white transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Ana Sayfaya Dön</span>
        </Link>

        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl p-0.5 flex items-center justify-center shadow-xs">
            <Image
              src="/brand/logo-dark.svg"
              alt="Mizan Katılım"
              width={32}
              height={32}
              className="w-full h-full object-contain dark:hidden"
              priority
            />
            <Image
              src="/brand/logo-white.svg"
              alt="Mizan Katılım"
              width={32}
              height={32}
              className="w-full h-full object-contain hidden dark:block"
              priority
            />
          </div>
          <span className="text-base font-black tracking-tight text-[#08080C] dark:text-white">
            mizan <span className="text-[#10B981] dark:text-[#C6F432] font-bold text-xs">katılım</span>
          </span>
        </Link>
      </div>

      {/* Main Split Content: Left Feature Showcase + Right AuthForm */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-4 relative z-10">
        
        {/* Left Column: New Features & Value Proposition */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981]/10 dark:bg-[#C6F432]/15 border border-[#10B981]/25 dark:border-[#C6F432]/30 text-[#10B981] dark:text-[#C6F432] text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] dark:bg-[#C6F432] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981] dark:bg-[#C6F432]" />
            </span>
            <span>2026 Yeni Özellikler Yayında</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#08080C] dark:text-white tracking-tight leading-[1.12]">
            Borsa İstanbul’da Helal Yatırımın{" "}
            <span className="font-orbix-serif italic font-semibold text-[#10B981] dark:text-[#C6F432]">
              Dijital Zekâsı.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#525E75] dark:text-zinc-400 leading-relaxed">
            Mizan Katılım ile portföyünüzün fıkhi meşruiyetini anlık koruyun, resmi regülasyon akışlarını kaçırmayın ve kuruşu kuruşuna arındırmanızı hesaplayın.
          </p>

          {/* Newly Added Features Highlight Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            
            {/* 1. Canlı KAP & SPK Bildirim Akışı */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#101118] border border-slate-200/80 dark:border-white/[0.09] shadow-xs space-y-2 hover:border-[#10B981]/40 dark:hover:border-[#C6F432]/30 transition">
              <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 dark:bg-[#C6F432]/15 text-[#10B981] dark:text-[#C6F432] flex items-center justify-center">
                <Radio size={16} className="animate-pulse" />
              </div>
              <h3 className="text-xs font-extrabold text-[#08080C] dark:text-white">
                Canlı KAP &amp; SPK Akışı
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-zinc-400 leading-relaxed">
                Devre kesiciler, sermaye artırımları ve haftalık SPK bültenleri anlık resmi bildirim motoru.
              </p>
            </div>

            {/* 2. Mizan AI Fıkhi & Finansal Asistan */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#101118] border border-slate-200/80 dark:border-white/[0.09] shadow-xs space-y-2 hover:border-[#10B981]/40 dark:hover:border-[#C6F432]/30 transition">
              <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 dark:bg-[#C6F432]/15 text-[#10B981] dark:text-[#C6F432] flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <h3 className="text-xs font-extrabold text-[#08080C] dark:text-white">
                Mizan AI Asistan
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-zinc-400 leading-relaxed">
                Akıllı fıkhi danışman; dipnot okuma, icazet denetimi ve canlı KAP analizi.
              </p>
            </div>

            {/* 3. BIST Katılım Taraması */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#101118] border border-slate-200/80 dark:border-white/[0.09] shadow-xs space-y-2 hover:border-[#10B981]/40 dark:hover:border-[#C6F432]/30 transition">
              <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 dark:bg-[#C6F432]/15 text-[#10B981] dark:text-[#C6F432] flex items-center justify-center">
                <Scale size={16} />
              </div>
              <h3 className="text-xs font-extrabold text-[#08080C] dark:text-white">
                BIST Katılım 3 Altın Rasyo
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-zinc-400 leading-relaxed">
                Diyanet ve TKBB standartlarında faizli borç, nakit ve gelir tavanı anlık filtresi.
              </p>
            </div>

            {/* 4. Arındırma & Zekât Motoru */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#101118] border border-slate-200/80 dark:border-white/[0.09] shadow-xs space-y-2 hover:border-[#10B981]/40 dark:hover:border-[#C6F432]/30 transition">
              <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 dark:bg-[#C6F432]/15 text-[#10B981] dark:text-[#C6F432] flex items-center justify-center">
                <Coins size={16} />
              </div>
              <h3 className="text-xs font-extrabold text-[#08080C] dark:text-white">
                Hassas Tathir &amp; Zekât
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-zinc-400 leading-relaxed">
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
