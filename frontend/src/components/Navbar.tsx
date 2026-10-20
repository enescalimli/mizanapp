"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  LogOut,
  User,
  BarChart3,
  Briefcase,
  Scale,
  Calculator,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut, isDemoUser } = useAuth();

  const navLinks = [
    { href: "/", label: "Katılım Taraması", icon: BarChart3 },
    { href: "/ipo", label: "Halka Arzlar", icon: Calendar, badge: "Canlı" },
    { href: "/rehber", label: "Fıkıh & Rehber", icon: Scale, badge: "Cevazlar" },
    { href: "/purification", label: "Arındırma & Zekât", icon: Calculator },
    { href: "/portfolio", label: "Portföyüm", icon: Briefcase },
  ];

  return (
    <>
      {/* 1. ÜST DUYURU VE KAP DURUM BANDI */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>BIST Katılım Endeksi &amp; KAP KAFİF Bildirimleri Anlık Senkronize Edilmektedir</span>
          <span className="text-slate-500 hidden sm:inline">&bull;</span>
          <span className="text-emerald-300 hidden sm:inline font-mono">TKBB &amp; AAOIFI Uyumlu</span>
        </div>
      </div>

      {/* 2. ANA SİTE BAŞLIĞI (MUSAFFA TARZI TEMİZ VE FERAH) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Marka */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs p-1 flex items-center justify-center transition-transform group-hover:scale-105">
                <Image
                  src="/brand/logo.svg"
                  alt="Mizan Logo"
                  width={34}
                  height={34}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  mizan<span className="text-emerald-600">.</span>
                </span>
                <span className="text-xs text-slate-500 font-medium mt-1">
                  Katılım Finans &amp; Arındırma
                </span>
              </div>
            </Link>

            {/* Masaüstü Menü Linkleri */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors flex items-center gap-1.5 py-1 ${
                      isActive
                        ? "text-slate-950 font-bold border-b-2 border-slate-950 -mb-0.5"
                        : "hover:text-slate-950"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sağ Eylemler: Giriş Yap / Profil */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/portfolio"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </span>
                  {isDemoUser && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                      Demo
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => signOut()}
                  title="Çıkış Yap"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="fintech-btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
                >
                  <span>Ücretsiz Başla</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobil Menü Butonu */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobil Açılır Menü */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
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
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                      isActive
                        ? "bg-slate-100 text-slate-950 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent size={16} className="text-slate-500" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl text-xs">
                    <span className="font-semibold text-slate-800">
                      {user.email}
                    </span>
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
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                  >
                    Ücretsiz Başla
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
