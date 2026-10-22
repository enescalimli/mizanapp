"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
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
    { label: "Overview", labelTr: "Genel Bakış", href: "/" },
    { label: "Activity", labelTr: "Tarayıcı", href: "/tarayici" },
    { label: "Manage", labelTr: "Portföy", href: "/portfolio" },
    { label: "Program", labelTr: "Arındırma", href: "/purification" },
    { label: "Account", labelTr: "Halka Arz", href: "/ipo" },
    { label: "Reports", labelTr: "Rehber", href: "/rehber" },
  ];

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#EEF0F4] text-[#14151A] selection:bg-[#FFE8E0] selection:text-[#FF5B26] relative antialiased py-3 sm:py-6 px-2 sm:px-4 lg:px-6">
      {/* Fixed Left Vertical Dock (Desktop only) */}
      <LeftDockSidebar />

      {/* Main Floating Rounded Bento Canvas (V14 Style) */}
      <div className="relative z-10 md:ml-16 lg:ml-20 max-w-[1540px] mx-auto bg-[#F7F8FA] rounded-[28px] sm:rounded-[36px] border border-white/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-4 sm:p-6 lg:p-7 space-y-6">
        
        {/* ================================================================= */}
        {/* V14 TOP HEADER BAR                                               */}
        {/* ================================================================= */}
        <header className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
          
          {/* Sol Logo & Marka Adı */}
          <Link href="/" className="inline-flex items-center gap-2.5 group shrink-0">
            {/* V14 Vibrant Orange Squircle Logo */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#FF5B26] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-sm group-hover:scale-105 transition-transform shrink-0">
              M
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#14151A]">
                mizan
              </span>
              <span className="text-[11px] font-semibold text-[#8C93A3] hidden sm:inline">
                {badge}
              </span>
            </div>
          </Link>

          {/* Orta Kapsül Navigasyon (V14 Pill Segmented Navbar) */}
          <nav className="order-3 lg:order-2 w-full lg:w-auto flex items-center justify-center overflow-x-auto py-1 scrollbar-none">
            <div className="bg-white rounded-full p-1 border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center gap-0.5 sm:gap-1 shrink-0">
              {navItems.map((item) => {
                const active = isNavActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                      active
                        ? "bg-[#15161A] text-white shadow-xs"
                        : "text-[#646A78] hover:text-[#15161A] hover:bg-slate-100/60"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="opacity-60 text-[10px] ml-1 hidden xl:inline font-normal">
                      ({item.labelTr})
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sağ Eylem İkonları ve Kullanıcı Profili (V14 Style) */}
          <div className="order-2 lg:order-3 flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Arama Butonu */}
            <button
              type="button"
              onClick={handleSearch}
              className="w-8 h-8 rounded-full bg-white border border-slate-200/60 shadow-xs text-[#646A78] hover:text-[#15161A] hover:border-slate-300 flex items-center justify-center transition"
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
              className="w-8 h-8 rounded-full bg-white border border-slate-200/60 shadow-xs text-[#646A78] hover:text-[#15161A] hover:border-slate-300 flex items-center justify-center transition"
              title="Mizan Fıkhi Standartları Bilgisi"
            >
              <Info size={15} strokeWidth={2.2} />
            </button>

            {/* Kullanıcı Profil Kapsülü (V14 Style) */}
            <Link
              href="/ayarlar"
              className="bg-white border border-slate-200/60 shadow-xs hover:border-slate-300 rounded-full pl-1 pr-3 py-1 flex items-center gap-2 transition group"
              title="Hesap ve Ayarlar"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#15161A] to-[#40434F] text-white flex items-center justify-center text-[11px] font-bold font-mono shrink-0">
                {userInitials}
              </div>

              {/* Kullanıcı Bilgisi */}
              <div className="hidden sm:flex flex-col text-left leading-none max-w-[120px]">
                <span className="text-xs font-bold text-[#14151A] truncate group-hover:text-[#FF5B26] transition">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-[#8C93A3] truncate mt-0.5">
                  {userEmail}
                </span>
              </div>

              <ChevronDown size={12} className="text-[#8C93A3] shrink-0" />
            </Link>
          </div>
        </header>

        {/* Fıkhi Bilgi Modal (Info) */}
        {showInfoModal && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-md text-xs text-[#646A78] space-y-2 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between font-bold text-[#14151A]">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#FF5B26]" />
                Diyanet İşleri Başkanlığı (DİB) &amp; TKBB Katılım Standartları
              </span>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
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
