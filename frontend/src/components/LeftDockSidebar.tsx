"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Calendar,
  Briefcase,
  Calculator,
  BookOpen,
  Settings,
  Scale,
} from "lucide-react";

export const LeftDockSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Ana Sayfa",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Hisse Tarayıcı (626 BIST)",
      href: "/tarayici",
      icon: BarChart3,
      isActive: pathname.startsWith("/tarayici"),
    },
    {
      label: "Halka Arz Takvimi (2026)",
      href: "/ipo",
      icon: Calendar,
      isActive: pathname.startsWith("/ipo"),
    },
    {
      label: "Katılım Portföyüm",
      href: "/portfolio",
      icon: Briefcase,
      isActive: pathname.startsWith("/portfolio"),
    },
    {
      label: "Fıkhi Arındırma",
      href: "/purification",
      icon: Calculator,
      isActive: pathname === "/purification",
    },
    {
      label: "Zekât Hesaplayıcı",
      href: "/purification",
      icon: Scale,
      isActive: false,
    },
    {
      label: "Fıkhi Standart & İcazetler",
      href: "/rehber",
      icon: BookOpen,
      isActive: pathname.startsWith("/rehber"),
    },
  ];

  return (
    <aside className="fixed left-3 lg:left-6 top-24 bottom-6 z-40 hidden md:flex flex-col justify-between items-center py-4 px-2 bg-white/75 dark:bg-[#111A2E]/75 backdrop-blur-2xl rounded-3xl border border-white/85 dark:border-white/10 shadow-[0_12px_40px_rgba(24,37,66,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] select-none pointer-events-auto transition-all">
      {/* Üst Navigasyon Grubu */}
      <div className="flex flex-col items-center gap-2.5">
        {navItems.map((item) => (
          <div key={item.label} className="group relative flex items-center">
            <Link
              href={item.href}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                item.isActive
                  ? "bg-[#182542] dark:bg-emerald-600 text-white shadow-md shadow-[#182542]/25 dark:shadow-emerald-900/30 scale-105"
                  : "bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 text-[#6E81A0] dark:text-slate-300 hover:text-[#182542] dark:hover:text-white border border-white/80 dark:border-white/10 shadow-2xs hover:scale-105"
              }`}
            >
              <item.icon size={18} strokeWidth={item.isActive ? 2.4 : 1.9} />
            </Link>

            {/* Hover Tooltip (Yalnızca üstüne gelindiğinde yazı çıkar) */}
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-xl bg-[#182542] dark:bg-slate-900 dark:border dark:border-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-xl opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Alt Grup: Ayarlar */}
      <div className="flex flex-col items-center gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 w-full">
        <div className="group relative flex items-center">
          <Link
            href="/ayarlar"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              pathname.startsWith("/ayarlar")
                ? "bg-[#182542] dark:bg-emerald-600 text-white shadow-md shadow-[#182542]/25 dark:shadow-emerald-900/30 scale-105"
                : "bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 text-[#6E81A0] dark:text-slate-300 hover:text-[#182542] dark:hover:text-white border border-white/80 dark:border-white/10 shadow-2xs hover:scale-105"
            }`}
          >
            <Settings size={18} strokeWidth={pathname.startsWith("/ayarlar") ? 2.4 : 1.9} />
          </Link>
          <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-xl bg-[#182542] px-3 py-1.5 text-xs font-bold text-white shadow-xl opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
            Ayarlar &amp; Tercihler
          </span>
        </div>
      </div>
    </aside>
  );
};
