"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  LayoutGrid,
  Calendar,
  Mail,
  FileText,
  PieChart,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  Layers,
} from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useAuth } from "@/lib/auth/AuthContext";

export const LeftDockSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, isDark } = useTheme();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Çıkış hatası:", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mizanapp_demo_auth");
        localStorage.removeItem("mizan_user_session");
      }
      router.push("/");
    }
  };

  const navItems = [
    {
      label: "Genel Bakış",
      href: "/dashboard",
      icon: LayoutGrid,
      isActive: pathname === "/dashboard" || pathname === "/",
    },
    {
      label: "Hisse Tarayıcı",
      href: "/tarayici",
      icon: FileText,
      isActive: pathname.startsWith("/tarayici"),
    },
    {
      label: "Portföy & Arındırma",
      href: "/portfolio",
      icon: PieChart,
      isActive: pathname.startsWith("/portfolio"),
    },
    {
      label: "Halka Arz Takvimi",
      href: "/ipo",
      icon: Calendar,
      isActive: pathname.startsWith("/ipo"),
    },
    {
      label: "TEFAS Fon Röntgeni",
      href: "/tefas",
      icon: Layers,
      isActive: pathname.startsWith("/tefas"),
    },
    {
      label: "Mizan AI Asistan",
      href: "/asistan",
      icon: Sparkles,
      isActive: pathname.startsWith("/asistan"),
    },
    {
      label: "Ayarlar",
      href: "/ayarlar",
      icon: Settings,
      isActive: pathname.startsWith("/ayarlar"),
    },
  ];

  return (
    <aside className="fixed left-3 lg:left-5 top-8 bottom-8 z-40 hidden md:flex flex-col justify-between items-center select-none pointer-events-auto transition-colors duration-200">
      {/* 1. Üst Mini Kapsül: Açık / Koyu Tema Anahtarı (Şeffaf Cam) */}
      <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-white/80 dark:border-white/10 flex flex-col items-center gap-1.5 transition-colors">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            !isDark
              ? "bg-[#182542] text-white shadow-xs"
              : "text-[#8C93A3] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
          }`}
          title="Açık Tema"
        >
          <Sun size={14} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isDark
              ? "bg-white text-[#182542] shadow-xs"
              : "text-[#8C93A3] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
          }`}
          title="Karanlık Tema"
        >
          <Moon size={14} strokeWidth={2.2} />
        </button>
      </div>

      {/* 2. Ana Navigasyon Kapsülü: Dikey İkon Dock (Şeffaf Cam) */}
      <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-full py-3.5 px-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)] border border-white/80 dark:border-white/10 flex flex-col items-center gap-3 transition-colors">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="group relative flex items-center">
              <Link
                href={item.href}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${
                  item.isActive
                    ? "bg-[#182542] text-white dark:bg-white dark:text-[#182542] shadow-sm scale-105"
                    : "text-[#8C93A3] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={16} strokeWidth={item.isActive ? 2.4 : 1.9} />
              </Link>

              {/* Hover Tooltip */}
              <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-xl bg-[#182542] dark:bg-[#0A0B0E] border border-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-lg opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-1">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Alt Mini Kapsül: Fıkhi Rehber ve Güvenli Çıkış (Şeffaf Cam) */}
      <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-full py-2 px-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-white/80 dark:border-white/10 flex flex-col items-center gap-2 transition-colors">
        <div className="group relative flex items-center">
          <Link
            href="/rehber"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              pathname.startsWith("/rehber")
                ? "bg-[#182542] dark:bg-[#182542] text-white shadow-xs border border-white/15"
                : "text-[#8C93A3] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
            }`}
            title="Fıkhi Standart & Rehber"
          >
            <HelpCircle size={15} strokeWidth={2} />
          </Link>
          <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-xl bg-[#182542] dark:bg-[#0A0B0E] border border-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-lg opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-1">
            Fıkhi Standart &amp; SSS
          </span>
        </div>

        <div className="group relative flex items-center">
          <button
            type="button"
            onClick={handleLogout}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#8C93A3] dark:text-[#94A3B8] hover:text-[#E03131] hover:bg-red-50/70 dark:hover:bg-red-950/30 transition-all cursor-pointer"
            title="Oturumu Kapat"
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
          <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-xl bg-[#182542] dark:bg-[#0F172A] border border-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-lg opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-1">
            Çıkış Yap
          </span>
        </div>
      </div>
    </aside>
  );
};