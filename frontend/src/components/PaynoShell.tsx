"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { LeftDockSidebar } from "./LeftDockSidebar";

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

  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      router.push("/#screener-table");
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEEF2] text-[#182542] py-3 sm:py-6 px-2 sm:px-4 md:px-6 flex justify-center selection:bg-[#E6F8EF] selection:text-[#0D8B52]">
      {/* ===================================================================== */}
      {/* ORBIX STUDIO / PAYNO CANVAS WRAPPER                                   */}
      {/* ===================================================================== */}
      <div className="w-full max-w-[1360px] bg-white/90 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] shadow-[0_25px_80px_rgba(24,37,66,0.08)] border border-white/95 overflow-hidden relative flex flex-col">
        
        {/* Atmospheric Navy Mist Gradient (Top Area in Screenshot) */}
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-r from-transparent via-[#87A8CD]/28 to-[#476B9B]/22 pointer-events-none blur-3xl -z-0" />

        {/* =================================================================== */}
        {/* TOP HEADER: Logo, Search, Notifications, Avatar                     */}
        {/* =================================================================== */}
        <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-7 pb-4">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#182542] text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-mono text-sm leading-none">p</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tracking-tight text-[#182542]">
                payno
              </span>
              <span className="text-[11px] font-semibold text-[#6E81A0] font-sans">
                {badge}
              </span>
            </div>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSearch}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-white/90 text-[#6E81A0] hover:text-[#182542] flex items-center justify-center shadow-xs transition"
              title="Hisse Ara"
            >
              <Search size={16} />
            </button>

            <button
              type="button"
              onClick={() => router.push("/#screener-table")}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-white/90 text-[#6E81A0] hover:text-[#182542] flex items-center justify-center shadow-xs transition relative"
              title="7/24 Canlı KAP Veri Akışı"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
            </button>

            {/* User Profile Avatar */}
            <Link
              href="/portfolio"
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs relative shrink-0 hover:ring-2 hover:ring-[#182542]/20 transition"
              title="Profil & Portföy"
            >
              <div className="w-full h-full bg-gradient-to-tr from-[#182542] to-[#405881] flex items-center justify-center text-white text-xs font-bold font-mono">
                MK
              </div>
            </Link>
          </div>
        </header>

        {/* =================================================================== */}
        {/* MAIN BODY: Left Vertical Dock + Page Content                        */}
        {/* =================================================================== */}
        <div className="relative z-10 flex flex-1 px-4 sm:px-8 pb-8 pt-2 gap-5 sm:gap-7">
          {/* Left Vertical Dock (Desktop only) */}
          <LeftDockSidebar />

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>

        {/* =================================================================== */}
        {/* CANVAS FOOTER: Minimalist Legal & Regulatory Strip                  */}
        {/* =================================================================== */}
        <footer className="relative z-10 border-t border-white/80 bg-white/50 backdrop-blur-md px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8C9BB0]">
          <div>
            &copy; {new Date().getFullYear()} Payno Katılım Finans &bull; DİB, TKBB ve AAOIFI Standartlarına Uygundur.
          </div>
          <div className="font-mono text-[10px]">
            BIST &amp; KAP 7/24 Canlı Motor &bull; Zero-Float Decimal Precision
          </div>
        </footer>

      </div>
    </div>
  );
};
