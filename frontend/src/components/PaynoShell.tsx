"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { LeftDockSidebar } from "./LeftDockSidebar";
import { NotificationPopover } from "./NotificationPopover";
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
  const { user, profile } = useAuth();

  const userInitials = useMemo(() => {
    const name = profile?.full_name || (user?.user_metadata?.full_name as string) || "Mustafa Çalımlı";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [profile?.full_name, user?.user_metadata?.full_name]);

  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      router.push("/tarayici");
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEEF2] text-[#182542] selection:bg-[#E6F8EF] selection:text-[#0D8B52] relative">
      {/* Background Navy Mist Atmosphere */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-r from-transparent via-[#87A8CD]/20 to-[#476B9B]/15 pointer-events-none blur-3xl -z-0" />

      {/* Fixed Left Vertical Dock (Desktop only, pinned on viewport) */}
      <LeftDockSidebar />

      {/* Main Responsive Body Container */}
      <div className="relative z-10 md:pl-20 lg:pl-28 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Top Header Floating Glass Bar */}
        <header className="relative z-50 bg-white/70 dark:bg-[#111A2E]/70 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/10 p-4 sm:px-8 sm:py-5 shadow-[0_8px_30px_rgba(24,37,66,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform shrink-0 bg-[#182542] flex items-center justify-center p-0.5">
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
              <span className="text-xl font-black tracking-tight text-[#182542]">
                mizan
              </span>
              <span className="text-xs font-semibold text-[#6E81A0]">
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

            {/* Interactive Real Notification Popover */}
            <NotificationPopover />

            {/* User Profile Avatar */}
            <Link
              href="/ayarlar"
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs relative shrink-0 hover:ring-2 hover:ring-[#182542]/20 transition"
              title="Profil & Ayarlar"
            >
              <div className="w-full h-full bg-gradient-to-tr from-[#182542] to-[#405881] flex items-center justify-center text-white text-xs font-bold font-mono">
                {userInitials}
              </div>
            </Link>
          </div>
        </header>

        {/* Content Area (Modular translucent glass panels rendered inside pages) */}
        <main className="min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
};
