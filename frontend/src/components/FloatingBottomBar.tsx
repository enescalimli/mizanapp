"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BarChart3,
  Calendar,
  Briefcase,
  Plus,
  X,
  Search,
  Calculator,
  ShieldCheck,
  BookOpen,
  ArrowUpRight,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useAuth } from "@/lib/auth/AuthContext";

export const FloatingBottomBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { user, isDemoUser, loading } = useAuth();
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  // Close modal on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickActionOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scroll when modal open
  useEffect(() => {
    if (quickActionOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [quickActionOpen]);

  // Mobil barın gizleneceği sayfalar:
  // 1. Giriş, Kayıt, Çıkış gibi Yetkilendirme (/auth/*) sayfaları
  // 2. Yasal / Sözleşme sayfaları
  // 3. Sosyal Medya Studio
  const isExcludedPath =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/social-studio") ||
    pathname.startsWith("/gizlilik") ||
    pathname.startsWith("/kullanim") ||
    pathname.startsWith("/cerez") ||
    pathname.startsWith("/mesafeli") ||
    pathname.startsWith("/iade");

  if (isExcludedPath) return null;

  const handleProtectedAction = (href: string) => {
    setQuickActionOpen(false);
    if (!user && !isDemoUser) {
      router.push("/auth/login");
      return;
    }
    router.push(href);
  };

  const navItems = [
    {
      label: "Genel Bakış",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/" || pathname === "/dashboard",
    },
    {
      label: "Tarayıcı",
      href: "/tarayici",
      icon: BarChart3,
      isActive: pathname.startsWith("/tarayici"),
    },
    // Center FAB is rendered in the middle
    {
      label: "Halka Arz",
      href: "/ipo",
      icon: Calendar,
      isActive: pathname.startsWith("/ipo"),
    },
    {
      label: "Portföy",
      href: "/portfolio",
      icon: Briefcase,
      isActive: pathname.startsWith("/portfolio"),
    },
  ];

  return (
    <>
      {/* =================================================================== */}
      {/* QUICK ACTION DRAWER / PALETTE (Triggered by Center FAB)              */}
      {/* =================================================================== */}
      {quickActionOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#182542]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setQuickActionOpen(false)}
          />

          {/* Quick Action Modal (Karanlık Mod & Şeffaf Cam Tasarımı) */}
          <div className="relative w-full max-w-md bg-white/95 dark:bg-[#0E1015]/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-200 z-10 mb-20 sm:mb-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#182542] dark:bg-white text-white dark:text-[#182542] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#182542] dark:text-white">Hızlı Katılım İşlemleri</h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">BIST Katılım &amp; Arındırma Araçları</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickActionOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Action Items List */}
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleProtectedAction("/tarayici")}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 text-[#273869] dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <Search size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] dark:text-white group-hover:text-[#273869] dark:group-hover:text-blue-400">
                      Hisse Uygunluk Sorgula
                    </div>
                    <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      BIST hisseleri için DİB &amp; TKBB rasyoları
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] dark:text-[#94A3B8] group-hover:text-[#273869] dark:group-hover:text-blue-400 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleProtectedAction("/ipo")}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 hover:bg-[#F0F4FA] dark:hover:bg-white/10 border border-[#E2E8F0] dark:border-white/10 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E1015] border border-[#E2E8F0] dark:border-white/10 text-[#273869] dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] dark:text-white group-hover:text-[#273869] dark:group-hover:text-blue-400">
                      Halka Arz Dağıtım &amp; Lot Hesaplayıcı
                    </div>
                    <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Kişi sayısına göre düşecek tahmini lot ve katılım cevazı
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] dark:text-[#94A3B8] group-hover:text-[#273869] dark:group-hover:text-blue-400 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleProtectedAction("/portfolio?tab=arindirma")}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 hover:bg-[#F0F4FA] dark:hover:bg-white/10 border border-[#E2E8F0] dark:border-white/10 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E1015] border border-[#E2E8F0] dark:border-white/10 text-[#273869] dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] dark:text-white group-hover:text-[#273869] dark:group-hover:text-blue-400">
                      Kuruş Hassasiyetli Arındırma
                    </div>
                    <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Temettü ve sermaye kazancındaki şüpheli payı arındır
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] dark:text-[#94A3B8] group-hover:text-[#273869] dark:group-hover:text-blue-400 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleProtectedAction("/portfolio")}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 hover:bg-[#F0F4FA] dark:hover:bg-white/10 border border-[#E2E8F0] dark:border-white/10 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E1015] border border-[#E2E8F0] dark:border-white/10 text-[#273869] dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] dark:text-white group-hover:text-[#273869] dark:group-hover:text-blue-400">
                      Portföy &amp; Zekât Takibi
                    </div>
                    <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Dönen varlık bazlı 1/40 hisse zekâtı ve portföy sağlığı
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] dark:text-[#94A3B8] group-hover:text-[#273869] dark:group-hover:text-blue-400 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleProtectedAction("/rehber")}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 hover:bg-[#F0F4FA] dark:hover:bg-white/10 border border-[#E2E8F0] dark:border-white/10 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E1015] border border-[#E2E8F0] dark:border-white/10 text-[#273869] dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] dark:text-white group-hover:text-[#273869] dark:group-hover:text-blue-400">
                      Fıkhi Cevazlar &amp; SSS
                    </div>
                    <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      DİB Din İşleri Yüksek Kurulu ve TKBB danışma kararları
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] dark:text-[#94A3B8] group-hover:text-[#273869] dark:group-hover:text-blue-400 transition" />
              </button>

              {/* Tema Değiştirme Butonu (Mobil) */}
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setQuickActionOpen(false);
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 hover:bg-[#F0F4FA] dark:hover:bg-white/10 border border-[#E2E8F0] dark:border-white/10 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-white/10 text-[#182542] dark:text-white flex items-center justify-center shadow-xs">
                    {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-[#182542]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] dark:text-white">
                      {isDark ? "Açık Temaya Geç" : "Karanlık Temaya Geç"}
                    </div>
                    <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Göz yormayan karanlık veya aydınlık arayüz
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-[#6E81A0] dark:text-[#94A3B8]">
                  {isDark ? "Koyu" : "Açık"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickActionOpen(false);
                  router.push("/auth/login");
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#273869]/10 to-[#182542]/5 dark:from-blue-950/40 dark:to-slate-900/40 border border-[#273869]/15 dark:border-white/10 transition group text-left mt-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#182542] dark:bg-[#273869] text-white flex items-center justify-center shadow-xs">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] dark:text-white">
                      Giriş Yap &amp; Hesap Yönetimi
                    </div>
                    <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Portföyünüzü ve alarmlarınızı bulutta güvenle saklayın
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#182542] dark:text-white transition" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* V14 FLOATING MOBILE BAR                                             */}
      {/* =================================================================== */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 select-none md:hidden w-[94%] max-w-sm">
        <div className="flex items-center justify-between bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-full px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-all duration-300">
          
          {/* 1. Ana Sayfa */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] rounded-full transition-all duration-150 ${
              pathname === "/dashboard" || pathname === "/"
                ? "text-[#182542] dark:text-white"
                : "text-[#8C93A3] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
            }`}
          >
            <div className="relative">
              <Home
                size={20}
                strokeWidth={pathname === "/dashboard" || pathname === "/" ? 2.5 : 1.8}
              />
              {(pathname === "/dashboard" || pathname === "/") && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#182542] dark:bg-white" />
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 transition-all ${
                pathname === "/dashboard" || pathname === "/" ? "font-bold text-[#182542] dark:text-white" : "font-medium text-[#8C93A3] dark:text-[#94A3B8]"
              }`}
            >
              Ana Sayfa
            </span>
          </Link>

          {/* 2. Tarayıcı */}
          <Link
            href="/tarayici"
            className={`flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] rounded-full transition-all duration-150 ${
              pathname.startsWith("/tarayici")
                ? "text-[#182542] dark:text-white"
                : "text-[#8C93A3] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
            }`}
          >
            <BarChart3 size={20} strokeWidth={pathname.startsWith("/tarayici") ? 2.5 : 1.8} />
            <span className={`text-[10px] mt-0.5 transition-all ${
              pathname.startsWith("/tarayici") ? "font-bold text-[#182542] dark:text-white" : "font-medium text-[#8C93A3] dark:text-[#94A3B8]"
            }`}>
              Tarayıcı
            </span>
          </Link>

          {/* 3. CENTER RAISED ACTION FAB (Lacivert) */}
          <div className="relative px-1 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setQuickActionOpen((prev) => !prev)}
              aria-label="Hızlı İşlemler"
              className={`w-12 h-12 -mt-6 rounded-full bg-[#182542] dark:bg-[#273869] text-white flex items-center justify-center shadow-lg shadow-[#182542]/30 border-4 border-[#EEF0F4] dark:border-[#000000] transition-all duration-200 hover:scale-105 active:scale-95 ${
                quickActionOpen ? "rotate-45" : ""
              }`}
            >
              <Plus size={22} strokeWidth={2.6} className="transition-transform duration-200" />
            </button>
            <span className="text-[9px] mt-0.5 font-bold text-[#6E81A0] dark:text-[#94A3B8]">
              Hızlı İşlem
            </span>
          </div>

          {/* 4. Halka Arz */}
          <Link
            href="/ipo"
            className={`flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] rounded-full transition-all duration-150 ${
              pathname.startsWith("/ipo")
                ? "text-[#182542] dark:text-white"
                : "text-[#8C93A3] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
            }`}
          >
            <div className="relative">
              <Calendar
                size={20}
                strokeWidth={pathname.startsWith("/ipo") ? 2.5 : 1.8}
              />
              {pathname.startsWith("/ipo") && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#182542] dark:bg-white" />
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 transition-all ${
                pathname.startsWith("/ipo") ? "font-bold text-[#182542] dark:text-white" : "font-medium text-[#8C93A3] dark:text-[#94A3B8]"
              }`}
            >
              Halka Arz
            </span>
          </Link>

          {/* 5. Portföy */}
          <Link
            href="/portfolio"
            className={`flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] rounded-full transition-all duration-150 ${
              pathname.startsWith("/portfolio")
                ? "text-[#182542] dark:text-white"
                : "text-[#8C93A3] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
            }`}
          >
            <div className="relative">
              <Briefcase
                size={20}
                strokeWidth={pathname.startsWith("/portfolio") ? 2.5 : 1.8}
              />
              {pathname.startsWith("/portfolio") && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#182542] dark:bg-white" />
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 transition-all ${
                pathname.startsWith("/portfolio") ? "font-bold text-[#182542] dark:text-white" : "font-medium text-[#8C93A3] dark:text-[#94A3B8]"
              }`}
            >
              Portföy
            </span>
          </Link>

        </div>
      </div>
    </>
  );
};
