"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Info, ChevronDown, Sparkles } from "lucide-react";
import { LeftDockSidebar } from "./LeftDockSidebar";
import { NotificationPopover } from "./NotificationPopover";
import { FooterLegal } from "./FooterLegal";
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
  const { user, profile } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const userDisplayName = useMemo(() => {
    return profile?.full_name || (user?.user_metadata?.full_name as string) || "Mustafa Çalımlı";
  }, [profile?.full_name, user?.user_metadata?.full_name]);

  const userEmail = useMemo(() => {
    return profile?.email || user?.email || "mustafa@mizan.app";
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

  const navItems = [
    { label: "Genel Bakış", href: "/" },
    { label: "Tarayıcı (626)", href: "/tarayici" },
    { label: "Portföy & Arındırma", href: "/portfolio" },
    { label: "Halka Arz", href: "/ipo" },
    { label: "Fıkhi Rehber", href: "/rehber" },
  ];

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#EEF0F4] dark:bg-[#0B0F17] text-[#14151A] dark:text-[#F1F3F7] selection:bg-[#E6F8EF] selection:text-[#0D8B52] relative antialiased py-2.5 sm:py-6 px-2 sm:px-4 lg:px-6 transition-colors duration-200">
      {/* Fixed Left Vertical Dock (Desktop only) */}
      <LeftDockSidebar />

      {/* Main Floating Rounded Bento Canvas */}
      <div className="relative z-10 md:ml-16 lg:ml-20 max-w-[1540px] mx-auto bg-[#F7F8FA] dark:bg-[#111726] rounded-[24px] sm:rounded-[36px] border border-white/90 dark:border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-3.5 sm:p-6 lg:p-7 space-y-5 sm:space-y-6 transition-colors duration-200">
        
        {/* ================================================================= */}
        {/* TOP HEADER BAR (Logo + Segmented Pill Nav + Actions)              */}
        {/* ================================================================= */}
        <header className="flex items-center justify-between gap-2.5 sm:gap-4 flex-wrap">
          
          {/* Sol Logo & Marka Adı (Proje dosyasındaki lacivert squircle logo) */}
          <Link href="/" className="inline-flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform shrink-0 bg-[#182542] dark:bg-[#0F172A] border border-white/20 p-0.5 flex items-center justify-center">
              <Image
                src="/brand/logo.svg"
                alt="Mizan Katılım"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#182542] dark:text-white">
                mizan
              </span>
              <span className="text-[11px] font-semibold text-[#6E81A0] dark:text-[#8C9BB0] hidden sm:inline">
                {badge}
              </span>
            </div>
          </Link>

          {/* Orta Kapsül Navigasyon (Türkçe Kapsül Menü) */}
          <nav className="order-3 lg:order-2 w-full lg:w-auto flex items-center justify-start sm:justify-center overflow-x-auto py-1 scrollbar-none">
            <div className="bg-white dark:bg-[#161F32] rounded-full p-1 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center gap-0.5 sm:gap-1 shrink-0">
              {navItems.map((item) => {
                const active = isNavActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 sm:px-4 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                      active
                        ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                        : "text-[#646A78] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sağ Eylem İkonları ve Kullanıcı Profili */}
          <div className="order-2 lg:order-3 flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Arama Butonu */}
            <button
              type="button"
              onClick={handleSearch}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#161F32] border border-slate-200/60 dark:border-white/10 shadow-xs text-[#646A78] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white flex items-center justify-center transition"
              title="626 BIST Katılım Hissesi Ara..."
            >
              <Search size={15} strokeWidth={2.2} />
            </button>

            {/* Bildirim Popover */}
            <NotificationPopover />

            {/* Bilgi Butonu */}
            <button
              type="button"
              onClick={() => setShowInfoModal(!showInfoModal)}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#161F32] border border-slate-200/60 dark:border-white/10 shadow-xs text-[#646A78] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white flex items-center justify-center transition"
              title="Mizan Fıkhi Standartları Bilgisi"
            >
              <Info size={15} strokeWidth={2.2} />
            </button>

            {/* Kullanıcı Profil Kapsülü */}
            <Link
              href="/ayarlar"
              className="bg-white dark:bg-[#161F32] border border-slate-200/60 dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20 rounded-full pl-1 pr-2.5 sm:pr-3 py-1 flex items-center gap-2 transition group"
              title="Hesap ve Ayarlar"
            >
              {/* Avatar (Lacivert gradient) */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#182542] to-[#273869] text-white flex items-center justify-center text-[11px] font-bold font-mono shrink-0 shadow-xs">
                {userInitials}
              </div>

              {/* Kullanıcı Bilgisi */}
              <div className="hidden sm:flex flex-col text-left leading-none max-w-[110px]">
                <span className="text-xs font-bold text-[#182542] dark:text-white truncate group-hover:text-[#273869] dark:group-hover:text-blue-400 transition">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#8C9BB0] truncate mt-0.5">
                  {userEmail}
                </span>
              </div>

              <ChevronDown size={12} className="text-[#8C93A3] shrink-0" />
            </Link>
          </div>
        </header>

        {/* Fıkhi Bilgi Modal (Info) */}
        {showInfoModal && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#161F32] border border-slate-200/80 dark:border-white/10 shadow-md text-xs text-[#646A78] dark:text-[#94A3B8] space-y-2 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between font-bold text-[#182542] dark:text-white">
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
              Mizan Katılım Finans, Borsa İstanbul bünyesindeki 626 hisseyi Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu ve TKBB Danışma Kurulu standartlarına göre çeyreklik KAP finansal dipnotlarından arındırır ve filtreler.
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <main className="min-w-0">
          {children}
        </main>

        {/* Kurumsal ve Yasal Footer */}
        <FooterLegal />

      </div>
    </div>
  );
};