"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Calendar,
  Wallet,
  Calculator,
  BookOpen,
  Settings,
  User,
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
      label: "BIST Hisse Tarayıcı",
      href: "/#screener-table",
      icon: BarChart3,
      isActive: false,
    },
    {
      label: "Halka Arz Takvimi",
      href: "/ipo",
      icon: Calendar,
      isActive: pathname.startsWith("/ipo"),
    },
    {
      label: "Portföy & Cüzdan",
      href: "/portfolio",
      icon: Wallet,
      isActive: pathname.startsWith("/portfolio"),
    },
    {
      label: "Fıkhi Arındırma",
      href: "/purification",
      icon: Calculator,
      isActive: pathname.startsWith("/purification"),
    },
    {
      label: "Fıkhi Cevazlar & SSS",
      href: "/rehber",
      icon: BookOpen,
      isActive: pathname.startsWith("/rehber"),
    },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between items-center py-2 shrink-0 select-none z-20">
      {/* Üst Navigasyon Grubu */}
      <div className="flex flex-col items-center gap-3.5">
        {navItems.map((item) => (
          <div key={item.label} className="group relative flex items-center">
            <Link
              href={item.href}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                item.isActive
                  ? "bg-[#182542] text-white shadow-md shadow-[#182542]/25 scale-105"
                  : "bg-white/70 hover:bg-white text-[#6E81A0] hover:text-[#182542] border border-white/80 shadow-xs hover:scale-105"
              }`}
            >
              <item.icon size={18} strokeWidth={item.isActive ? 2.4 : 1.9} />
            </Link>

            {/* Hover Tooltip (Yalnızca üstüne gelindiğinde yazı çıkar) */}
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-xl bg-[#182542] px-3 py-1.5 text-xs font-bold text-white shadow-xl opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Alt Grup: Ayarlar & Giriş */}
      <div className="flex flex-col items-center gap-3.5">
        <div className="group relative flex items-center">
          <Link
            href="/ayarlar"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              pathname.startsWith("/ayarlar")
                ? "bg-[#182542] text-white shadow-md shadow-[#182542]/25 scale-105"
                : "bg-white/70 hover:bg-white text-[#6E81A0] hover:text-[#182542] border border-white/80 shadow-xs hover:scale-105"
            }`}
          >
            <Settings size={18} strokeWidth={pathname.startsWith("/ayarlar") ? 2.4 : 1.9} />
          </Link>
          <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-xl bg-[#182542] px-3 py-1.5 text-xs font-bold text-white shadow-xl opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
            Ayarlar &amp; Tercihler
          </span>
        </div>

        <div className="group relative flex items-center">
          <Link
            href="/auth/login"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              pathname.startsWith("/auth")
                ? "bg-[#182542] text-white shadow-md shadow-[#182542]/25 scale-105"
                : "bg-white/70 hover:bg-white text-[#6E81A0] hover:text-[#182542] border border-white/80 shadow-xs hover:scale-105"
            }`}
          >
            <User size={18} strokeWidth={pathname.startsWith("/auth") ? 2.4 : 1.9} />
          </Link>
          <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-xl bg-[#182542] px-3 py-1.5 text-xs font-bold text-white shadow-xl opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
            Giriş Yap / Hesap
          </span>
        </div>
      </div>
    </aside>
  );
};
