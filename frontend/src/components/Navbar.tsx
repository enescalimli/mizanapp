"use client";

import React, { useState } from "react";
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
  BellRing,
  Sparkles,
  Calendar,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut, isDemoUser } = useAuth();

  const navLinks = [
    { href: "/", label: "Katılım Endeksi", icon: BarChart3 },
    {
      href: "/portfolio",
      label: "Portföy Paneli",
      icon: Briefcase,
      badge: "2 Alarm",
      badgeColor: "rose",
    },
    { href: "/purification", label: "Arındırma & Zekat", icon: Calculator },
    { href: "/companies/BIMAS", label: "Dipnot X-Ray", icon: ShieldCheck },
    {
      href: "/ipo",
      label: "Halka Arz",
      icon: Calendar,
      badge: "Takvim",
      badgeColor: "emerald",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#030712]/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Mark & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-white/20 transition-transform group-hover:scale-105 duration-200">
            <span className="font-bold text-slate-950 text-sm tracking-tighter">
              M
            </span>
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-bold tracking-tight text-white transition-colors group-hover:text-emerald-300">
                mizanapp<span className="text-emerald-400">.tr</span>
              </span>
              <span className="text-[9px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Katılım
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:block tracking-normal font-normal">
              BIST Katılım &amp; AAOIFI Arındırma Platformu
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-2 ${
                  isActive
                    ? "text-white bg-white/[0.08] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-emerald-400" : "text-slate-400"}
                />
                <span>{link.label}</span>

                {link.badge && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold tracking-wide bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Auth Status */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  {profile?.full_name
                    ? profile.full_name[0].toUpperCase()
                    : user.email
                    ? user.email[0].toUpperCase()
                    : "U"}
                </div>
                <span className="font-medium text-slate-200 text-[11px] max-w-[110px] truncate">
                  {profile?.full_name || user.email?.split("@")[0]}
                </span>
                {isDemoUser && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                    Demo
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={signOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.04] transition"
                title="Çıkış Yap"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition"
            >
              <LogIn size={13} className="text-emerald-400" />
              <span>Giriş Yap</span>
            </Link>
          )}

          <Link href="/portfolio" className="apple-btn-primary">
            <span>Portföy Paneli</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/[0.04]"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.07] bg-[#050814]/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in fade-in duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-sm ${
                  isActive
                    ? "text-white bg-white/[0.08] font-semibold"
                    : "text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={16}
                    className={isActive ? "text-emerald-400" : "text-slate-400"}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      link.badgeColor === "emerald"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-slate-300 font-medium">
                  {profile?.full_name || user.email}
                  {isDemoUser && " (Demo)"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400 hover:underline font-semibold"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 rounded-xl bg-white/[0.06] text-center text-xs text-slate-200 font-semibold hover:bg-white/[0.1] transition block"
              >
                Giriş Yap / Kayıt Ol
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
