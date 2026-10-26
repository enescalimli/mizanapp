"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  BarChart3,
  Briefcase,
  Scale,
  Calculator,
  Calendar,
  Bell,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { AnimatedMizanLogo } from "./AnimatedMizanLogo";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut, isDemoUser } = useAuth();

  const navLinks = [
    { href: "/", label: "Hisse Tarayıcı", icon: BarChart3 },
    { href: "/ipo", label: "Halka Arzlar", icon: Calendar, count: "Yeni" },
    { href: "/portfolio", label: "Portföy & Arındırma", icon: Briefcase },
    { href: "/rehber", label: "Fıkıh & Cevazlar", icon: Scale },
  ];

  return (
    <header className="sticky top-0 z-50 pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Sol: Payno Tarzı Minimalist Geometrik Marka & Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 mizan-logo-pressable">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-orbix-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <AnimatedMizanLogo
              variant="squircle-dark"
              motionStyle="polish"
              size={40}
              showWordmark={false}
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-[#273869]">
              mizan
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
          </div>
        </Link>

        {/* Orta: Payno Yüzen Buzlu Cam (Frosted Pill) Navigasyon */}
        <nav className="hidden lg:flex items-center payno-glass-pill p-1.5 gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white text-[#273869] font-bold shadow-orbix-sm"
                    : "text-[#405881] hover:text-[#273869] font-medium hover:bg-white/50"
                }`}
              >
                <span>{link.label}</span>
                {link.count && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-[#273869] text-white"
                        : "bg-[#EDF1F4] text-[#273869]"
                    }`}
                  >
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sağ: Payno Beyaz Pill Aksiyon Butonu / Kullanıcı Profili */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 payno-glass-pill p-1.5 pl-3">
              <div className="w-7 h-7 rounded-full bg-[#273869] text-white flex items-center justify-center text-xs font-bold">
                {user.email ? user.email.charAt(0).toUpperCase() : "M"}
              </div>
              <div className="flex flex-col pr-1">
                <span className="text-xs font-bold text-[#182542] max-w-[120px] truncate leading-tight">
                  {profile?.full_name || user.email?.split("@")[0]}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Aktif Hesap</span>
                </span>
              </div>
              <button
                onClick={() => signOut()}
                title="Çıkış Yap"
                className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 text-[#405881] hover:text-rose-600 flex items-center justify-center transition-colors shadow-2xs"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#405881] hover:text-[#273869] hover:bg-white/50 transition"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 rounded-full bg-[#273869] text-white text-xs font-bold shadow-orbix-sm hover:bg-[#1e2c54] hover:scale-[1.02] transition flex items-center gap-1.5"
              >
                <span>Hesap Oluştur</span>
                <ArrowUpRight size={14} className="text-white" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobil Menü Butonu */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white text-[#182542] flex items-center justify-center shadow-sm"
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobil Açılır Menü */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 max-w-7xl mx-auto rounded-[28px] bg-white/95 backdrop-blur-xl border border-white p-4 shadow-xl space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold ${
                    isActive
                      ? "bg-[#182542] text-white font-bold"
                      : "text-[#182542] hover:bg-[#EEF3F9]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent size={16} />
                    <span>{link.label}</span>
                  </div>
                  {link.count && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#EEF3F9] text-[#182542]"
                      }`}
                    >
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-[#F3F6FB] rounded-2xl text-xs">
                <span className="font-semibold text-[#182542]">{user.email}</span>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-rose-600 font-bold"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full border border-[#DCE5F2] text-xs font-bold text-[#182542] bg-white"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#182542] text-white text-xs font-bold"
                >
                  Hesap Oluştur
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
