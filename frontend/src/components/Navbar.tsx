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
  Radio,
  BarChart3,
  Briefcase,
  ShieldCheck,
  Calculator,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut, isDemoUser } = useAuth();

  const navLinks = [
    { href: "/", label: "Hisseler & Tarayıcı", icon: BarChart3 },
    { href: "/portfolio", label: "Portföy Paneli", icon: Briefcase },
    { href: "/companies/BIMAS", label: "Bilanço X-Ray", icon: ShieldCheck },
    { href: "/purification", label: "Arındırma & Zekât", icon: Calculator },
    { href: "/ipo", label: "Halka Arz Takvimi", icon: Calendar, badge: "Yeni" },
  ];

  return (
    <>
      {/* 1. ÜST DUYURU VE KAP DURUM BANDI */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>2026-Q2 Dönemi KAP Bilanço ve Katılım Bilgi Formları Taranmıştır</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-emerald-300 hidden sm:inline font-mono">542 Şirket Güncellendi</span>
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
                      <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sağ Aksiyon Butonları & Kullanıcı Durumu */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/portfolio"
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {profile?.full_name
                      ? profile.full_name[0].toUpperCase()
                      : user.email
                      ? user.email[0].toUpperCase()
                      : "U"}
                  </div>
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </span>
                  {isDemoUser && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-xs font-mono">
                      Demo
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Çıkış Yap"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-2"
              >
                Giriş Yap
              </Link>
            )}

            <Link
              href="/#hisseler"
              className="px-5 py-2.5 rounded-full bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 shadow-sm transition-all hover:shadow-md inline-flex items-center gap-1.5"
            >
              <span>Ücretsiz Tara</span>
              <ArrowRight size={14} />
            </Link>

            {/* Mobil Menü Tetikleyici */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobil Menü Çekmecesi */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 animate-in fade-in duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl text-sm font-semibold ${
                    isActive
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-slate-500" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-100">
              {user ? (
                <div className="flex items-center justify-between py-2 px-3">
                  <span className="text-sm font-semibold text-slate-700">
                    {profile?.full_name || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 rounded-2xl bg-slate-100 text-slate-900 font-bold text-center text-sm"
                >
                  Giriş Yap / Kayıt Ol
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
