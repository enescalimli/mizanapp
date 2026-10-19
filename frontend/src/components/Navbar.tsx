"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Calculator,
  BarChart3,
  Briefcase,
  Menu,
  X,
  ArrowUpRight,
  Calendar,
  LogIn,
  LogOut,
  Palette,
  Radio,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export type FintechThemeId = "sapphire" | "emerald-light" | "cyber-lime";

export const Navbar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<FintechThemeId>("sapphire");
  const pathname = usePathname();
  const { user, profile, signOut, isDemoUser } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("mizan-fintech-theme") as FintechThemeId | null;
    const initial: FintechThemeId =
      saved && ["sapphire", "emerald-light", "cyber-lime"].includes(saved)
        ? saved
        : "sapphire";
    setTheme(initial);
    document.body.setAttribute("data-theme", initial);
  }, []);

  const handleSelectTheme = (nextTheme: FintechThemeId) => {
    setTheme(nextTheme);
    document.body.setAttribute("data-theme", nextTheme);
    localStorage.setItem("mizan-fintech-theme", nextTheme);
  };

  const navLinks = [
    {
      href: "/",
      label: "Dashboard & Tarayıcı",
      icon: BarChart3,
      badge: "Canlı",
      badgeColor: "sky",
    },
    {
      href: "/portfolio",
      label: "Portföy & Cüzdan",
      icon: Briefcase,
      badge: "2 Alarm",
      badgeColor: "rose",
    },
    {
      href: "/companies/BIMAS",
      label: "KAP Bilanço X-Ray",
      icon: ShieldCheck,
    },
    {
      href: "/purification",
      label: "Arındırma & Zekât",
      icon: Calculator,
    },
    {
      href: "/ipo",
      label: "Halka Arz Takvimi",
      icon: Calendar,
      badge: "Yeni",
      badgeColor: "emerald",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col theme-bg">
      {/* ÜST FINTECH TEMA VE KONTROL ÇUBUĞU */}
      <header className="sticky top-0 z-50 w-full theme-sidebar border-b px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl theme-subtle"
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-xl accent-pill flex items-center justify-center text-slate-950 font-black text-sm">
              M
            </div>
            <span className="font-bold text-sm tracking-tight">mizanapp.tr</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 text-xs theme-muted">
            <Radio size={13} className="text-emerald-400 animate-pulse" />
            <span>BIST &amp; KAP Otomatik Veri Boru Hattı Aktif (2026-Q2)</span>
          </div>
        </div>

        {/* Sağ: 3'lü Tema Seçici + Kullanıcı Durumu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 p-1 rounded-2xl theme-subtle border border-[var(--border-col)]">
            <span className="hidden md:inline-flex items-center gap-1 px-2 text-xs theme-muted font-medium">
              <Palette size={12} />
              Tema:
            </span>
            <button
              type="button"
              onClick={() => handleSelectTheme("sapphire")}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                theme === "sapphire"
                  ? "bg-sky-400 text-slate-950 shadow-sm"
                  : "theme-muted hover:opacity-100"
              }`}
            >
              Sapphire Dark
            </button>
            <button
              type="button"
              onClick={() => handleSelectTheme("emerald-light")}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                theme === "emerald-light"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "theme-muted hover:opacity-100"
              }`}
            >
              Emerald Light
            </button>
            <button
              type="button"
              onClick={() => handleSelectTheme("cyber-lime")}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                theme === "cyber-lime"
                  ? "bg-lime-300 text-slate-950 shadow-sm"
                  : "theme-muted hover:opacity-100"
              }`}
            >
              Cyber Lime
            </button>
          </div>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl theme-subtle text-xs">
                <div className="w-5 h-5 rounded-full accent-pill text-slate-950 flex items-center justify-center text-xs font-bold">
                  {profile?.full_name
                    ? profile.full_name[0].toUpperCase()
                    : user.email
                    ? user.email[0].toUpperCase()
                    : "U"}
                </div>
                <span className="font-semibold max-w-[110px] truncate">
                  {profile?.full_name || user.email?.split("@")[0]}
                </span>
                {isDemoUser && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-xs font-mono">
                    Demo
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={signOut}
                className="p-2 rounded-xl theme-subtle hover:text-rose-400 transition"
                title="Çıkış Yap"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-2xl theme-subtle hover:opacity-90 transition"
            >
              <LogIn size={13} />
              <span>Giriş</span>
            </Link>
          )}
        </div>
      </header>

      {/* MOBİL ÇEKMECE MENÜ */}
      {mobileMenuOpen && (
        <div className="lg:hidden theme-sidebar border-b px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium ${
                  isActive
                    ? "accent-pill text-slate-950 font-bold"
                    : "theme-muted hover:opacity-100"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {link.label}
                </span>
                {link.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/15 font-semibold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* ANA GÖVDE: SOL SIDEBAR + SAĞ BENTO İÇERİK ALANI */}
      <div className="flex flex-1">
        <aside className="hidden lg:flex w-64 flex-col justify-between theme-sidebar border-r p-5 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]">
          <div className="space-y-7">
            {/* Marka Başlığı */}
            <Link href="/" className="flex items-center gap-3 px-2 group">
              <div className="w-10 h-10 rounded-2xl accent-pill flex items-center justify-center text-slate-950 font-black text-lg shadow-lg transition-transform group-hover:scale-105">
                M
              </div>
              <div>
                <div className="font-bold text-base tracking-tight leading-none">
                  mizanapp<span className="opacity-70">.tr</span>
                </div>
                <div className="text-xs theme-muted mt-1">
                  Katılım Finans Terminali
                </div>
              </div>
            </Link>

            {/* Sol Navigasyon Menüsü */}
            <nav className="space-y-1.5 text-sm font-medium">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all ${
                      isActive
                        ? "accent-pill text-slate-950 font-bold shadow-md"
                        : "theme-muted hover:opacity-100 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{link.label}</span>
                    </span>
                    {link.badge && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? "bg-black/15 text-slate-950"
                            : link.badgeColor === "rose"
                            ? "bg-rose-500/15 text-rose-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Alt KAP Durum ve Hızlı Portföy Kartı */}
          <div className="space-y-3">
            <div className="theme-subtle rounded-2xl p-4 space-y-2 border border-[var(--border-col)]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">KAP &amp; TKBB Otonom</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs theme-muted leading-relaxed">
                BIST fiyatları ve KAP finansal dipnotları sıfır-float Decimal motoruyla denetleniyor.
              </p>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-1.5 text-xs font-bold pt-1 hover:underline"
              >
                <span>Portföy Cüzdanına Git</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </aside>

        {/* SAĞ İÇERİK BÖLGESİ */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
};
