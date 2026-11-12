"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Info, ChevronDown, Sparkles } from "lucide-react";
import { LeftDockSidebar } from "./LeftDockSidebar";
import { NotificationPopover } from "./NotificationPopover";
import { FooterLegal } from "./FooterLegal";
import { MizanChatWidget } from "./MizanChatWidget";
import { AnimatedMizanLogo } from "./AnimatedMizanLogo";
import { ScrollBackgroundMizanLogo } from "./landing/ScrollBackgroundMizanLogo";
import { useAuth } from "@/lib/auth/AuthContext";

interface PaynoShellProps {
  children: React.ReactNode;
  badge?: string;
  onSearchClick?: () => void;
}

export const PaynoShell: React.FC<PaynoShellProps> = ({
  children,
  badge = "katılım",
  onSearchClick,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isDemoUser } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const userDisplayName = useMemo(() => {
    return profile?.full_name || (user?.user_metadata?.full_name as string) || "Değerli Yatırımcımız";
  }, [profile?.full_name, user?.user_metadata?.full_name]);

  const userEmail = useMemo(() => {
    return profile?.email || user?.email || "yatirimci@mizanapp.tr";
  }, [profile?.email, user?.email]);

  const userInitials = useMemo(() => {
    const parts = userDisplayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return userDisplayName.slice(0, 2).toUpperCase();
  }, [userDisplayName]);

  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      router.push("/tarayici");
    }
  };

  return (
    <div className="min-h-screen mizan-bg-60 selection:bg-[#C6F432] selection:text-[#08080C] relative antialiased py-3 sm:py-5 px-3 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* 60-30-10 Atmosferik Arka Plan Işığı (%10 Northline Lime Glow) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] mizan-glow-bg z-0" />

      {/* Scroll-Driven 3D Background Mizan Emblem (Black in Light Mode, White in Dark Mode) */}
      <ScrollBackgroundMizanLogo />

      {/* Fixed Left Vertical Dock (Desktop only) */}
      <LeftDockSidebar />

      {/* Full-Bleed Northline Workspace Container */}
      <div className="relative z-10 md:ml-16 lg:ml-20 max-w-[1480px] mx-auto space-y-5 sm:space-y-6 transition-colors duration-200">
        
        {/* ================================================================= */}
        {/* TOP UTILITY BAR (Northline Minimal Header)                        */}
        {/* ================================================================= */}
        <header className="flex items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-200/70 dark:border-white/[0.08]">
          
          {/* Sol Logo & Marka Adı (Yüksek çözünürlüklü animasyonlu vektörel logo) */}
          <Link href="/dashboard" className="inline-flex items-center gap-2.5 group shrink-0 mizan-logo-pressable">
            <div className="w-8 h-8 sm:w-9 sm:h-9 overflow-visible group-hover:scale-105 transition-transform duration-200 shrink-0 flex items-center justify-center">
              <AnimatedMizanLogo
                variant="emblem-auto"
                motionStyle="polish"
                size={34}
                showWordmark={false}
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#08080C] dark:text-white">
                mizan
              </span>
              <span className="text-[11px] font-bold text-[#10B981] dark:text-[#C6F432] hidden sm:inline">
                {badge}
              </span>
            </div>
          </Link>

          {/* Sağ Eylem İkonları ve Kullanıcı Profili */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Arama Butonu */}
            <button
              type="button"
              onClick={handleSearch}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#101118] border border-slate-200/60 dark:border-white/10 shadow-xs text-[#646A78] dark:text-[#94A3B8] hover:text-[#08080C] dark:hover:text-white flex items-center justify-center transition"
              title="BIST Katılım Hissesi Ara..."
            >
              <Search size={15} strokeWidth={2.2} />
            </button>

            {/* Bildirim Popover */}
            <NotificationPopover />

            {/* Bilgi Butonu */}
            <button
              type="button"
              onClick={() => setShowInfoModal(!showInfoModal)}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#101118] border border-slate-200/60 dark:border-white/10 shadow-xs text-[#646A78] dark:text-[#94A3B8] hover:text-[#08080C] dark:hover:text-white flex items-center justify-center transition"
              title="Mizan Fıkhi Standartları Bilgisi"
            >
              <Info size={15} strokeWidth={2.2} />
            </button>

            {/* Kullanıcı Profil Kapsülü veya Giriş Yap Butonu */}
            {user || isDemoUser ? (
              <Link
                href="/ayarlar"
                className="bg-white dark:bg-[#101118] border border-slate-200/60 dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20 rounded-full pl-1 pr-2.5 sm:pr-3 py-1 flex items-center gap-2 transition group"
                title="Hesap ve Ayarlar"
              >
                {/* Avatar (Northline %10 Lime Vurgulu) */}
                <div className="w-7 h-7 rounded-full bg-[#08080C] text-[#C6F432] dark:bg-[#C6F432] dark:text-[#08080C] flex items-center justify-center text-[11px] font-black font-mono shrink-0 shadow-xs">
                  {userInitials}
                </div>

                {/* Kullanıcı Bilgisi */}
                <div className="hidden sm:flex flex-col text-left leading-none max-w-[110px]">
                  <span className="text-xs font-bold text-[#08080C] dark:text-white truncate transition">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                    {userEmail}
                  </span>
                </div>

                <ChevronDown size={12} className="text-[#8C93A3] shrink-0" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 rounded-full mizan-accent-btn text-xs font-bold flex items-center gap-1.5"
              >
                <span>Giriş Yap</span>
              </Link>
            )}
          </div>
        </header>

        {/* Fıkhi Bilgi Modal (Info) */}
        {showInfoModal && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#101118] border border-slate-200/80 dark:border-white/10 shadow-md text-xs text-[#646A78] dark:text-[#94A3B8] space-y-2 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between font-bold text-[#08080C] dark:text-white">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#10B981]" />
                Diyanet İşleri Başkanlığı (DİB) &amp; TKBB Katılım Standartları
              </span>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>
            <p>
              Mizan Katılım Finans, Borsa İstanbul bünyesindeki hisseleri Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu ve TKBB Danışma Kurulu standartlarına göre çeyreklik KAP finansal dipnotlarından arındırır ve filtreler.
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <main className="min-w-0">
          {children}
        </main>

        {/* Kurumsal ve Yasal Footer (Asistan sayfasında aşağı kaymayı engellemek için gizlenir) */}
        {pathname !== "/asistan" && <FooterLegal />}

      </div>

      {/* Sağ Alt Kayan Mizan AI Gemini 3.8 Flash Asistan Widget'ı (Asistan sayfasında gizlenir) */}
      {pathname !== "/asistan" && <MizanChatWidget />}
    </div>
  );
};