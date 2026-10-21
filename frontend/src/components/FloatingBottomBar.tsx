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
} from "lucide-react";

export const FloatingBottomBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
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

  const navItems = [
    {
      label: "Ana Sayfa",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Hisseler",
      href: "/#screener-table",
      icon: BarChart3,
      isActive: pathname === "/" && typeof window !== "undefined" && window.location.hash === "#screener-table",
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

          {/* Quick Action Modal */}
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl shadow-[#273869]/25 border border-[#E2E8F0] space-y-5 animate-in fade-in zoom-in-95 duration-200 z-10 mb-20 sm:mb-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EDF1F4] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#273869] text-white flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#182542]">Hızlı Katılım İşlemleri</h3>
                  <p className="text-xs text-[#6E81A0]">7/24 BIST Katılım &amp; Arındırma Araçları</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickActionOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3F6FB] hover:bg-[#E5EAF2] text-[#405881] flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Action Items List */}
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setQuickActionOpen(false);
                  router.push("/#screener-table");
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F4FA] border border-[#E2E8F0] transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#273869] flex items-center justify-center shadow-xs">
                    <Search size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] group-hover:text-[#273869]">
                      Hisse Uygunluk Sorgula
                    </div>
                    <div className="text-[11px] text-[#6E81A0]">
                      626 BIST hissesi için DİB/TKBB &amp; AAOIFI rasyoları
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] group-hover:text-[#273869] transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickActionOpen(false);
                  router.push("/ipo");
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F4FA] border border-[#E2E8F0] transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#273869] flex items-center justify-center shadow-xs">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] group-hover:text-[#273869]">
                      Halka Arz Lot Simülatörü
                    </div>
                    <div className="text-[11px] text-[#6E81A0]">
                      Kişi sayısına göre düşecek tahmini lot ve katılım cevazı
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] group-hover:text-[#273869] transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickActionOpen(false);
                  router.push("/purification");
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F4FA] border border-[#E2E8F0] transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#273869] flex items-center justify-center shadow-xs">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] group-hover:text-[#273869]">
                      Kuruş Hassasiyetli Arındırma
                    </div>
                    <div className="text-[11px] text-[#6E81A0]">
                      Temettü ve sermaye kazancındaki şüpheli payı arındır
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] group-hover:text-[#273869] transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickActionOpen(false);
                  router.push("/portfolio");
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F4FA] border border-[#E2E8F0] transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#273869] flex items-center justify-center shadow-xs">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] group-hover:text-[#273869]">
                      Portföy &amp; Zekât Takibi
                    </div>
                    <div className="text-[11px] text-[#6E81A0]">
                      Dönen varlık bazlı 1/40 hisse zekâtı ve portföy sağlığı
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] group-hover:text-[#273869] transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickActionOpen(false);
                  router.push("/rehber");
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F4FA] border border-[#E2E8F0] transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#273869] flex items-center justify-center shadow-xs">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182542] group-hover:text-[#273869]">
                      Fıkhi Cevazlar &amp; SSS
                    </div>
                    <div className="text-[11px] text-[#6E81A0]">
                      DİB Din İşleri Yüksek Kurulu ve TKBB danışma kararları
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#8B9BB4] group-hover:text-[#273869] transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickActionOpen(false);
                  router.push("/auth/login");
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#273869]/8 to-[#182542]/5 hover:from-[#273869]/15 hover:to-[#182542]/10 border border-[#273869]/15 transition group text-left mt-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#273869] text-white flex items-center justify-center shadow-xs">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#273869]">
                      Giriş Yap &amp; Hesap Yönetimi
                    </div>
                    <div className="text-[11px] text-[#6E81A0]">
                      Portföyünüzü ve alarmlarınızı bulutta güvenle saklayın
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#273869] transition" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SLIDE 15: FLOATING BAR WITH ONE RAISED ACTION (ALT BAR)             */}
      {/* "Active tab: filled navy icon + label. Center FAB breaks grid"      */}
      {/* =================================================================== */}
      <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
        <div className="flex items-center bg-white/85 backdrop-blur-2xl border border-white/80 rounded-full px-4 sm:px-6 py-2 shadow-2xl shadow-[#273869]/20 ring-1 ring-black/5 transition-all duration-300">
          
          {/* 1. Ana Sayfa */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center px-3.5 py-1 min-w-[60px] sm:min-w-[68px] rounded-full transition-all duration-150 ${
              pathname === "/"
                ? "text-[#273869]"
                : "text-[#8B9BB4] hover:text-[#405881]"
            }`}
          >
            <div className="relative">
              <Home
                size={22}
                strokeWidth={pathname === "/" ? 2.5 : 1.8}
                className={pathname === "/" ? "fill-[#273869]/15" : ""}
              />
              {pathname === "/" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#273869]" />
              )}
            </div>
            <span
              className={`text-[11px] mt-1 transition-all ${
                pathname === "/" ? "font-bold text-[#273869]" : "font-medium text-[#8B9BB4]"
              }`}
            >
              Ana Sayfa
            </span>
          </Link>

          {/* 2. Hisseler */}
          <Link
            href="/#screener-table"
            className={`flex flex-col items-center justify-center px-3.5 py-1 min-w-[60px] sm:min-w-[68px] rounded-full transition-all duration-150 ${
              pathname === "/"
                ? "text-[#405881] hover:text-[#273869]"
                : "text-[#8B9BB4] hover:text-[#405881]"
            }`}
          >
            <BarChart3 size={22} strokeWidth={1.8} />
            <span className="text-[11px] mt-1 font-medium text-[#8B9BB4]">
              Hisseler
            </span>
          </Link>

          {/* 3. CENTER RAISED ACTION FAB (Breaks the grid on purpose) */}
          <div className="relative px-2 sm:px-3 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setQuickActionOpen((prev) => !prev)}
              aria-label="Hızlı İşlemler"
              className={`w-13 h-13 sm:w-14 sm:h-14 -mt-6 sm:-mt-7 rounded-full bg-[#273869] text-white flex items-center justify-center shadow-lg shadow-[#273869]/40 border-4 border-[#F3F6FB] transition-all duration-200 hover:scale-105 active:scale-95 ${
                quickActionOpen ? "rotate-45 bg-[#182542]" : ""
              }`}
            >
              <Plus size={24} strokeWidth={2.6} className="transition-transform duration-200" />
            </button>
            <span className="text-[10px] mt-1 font-semibold text-[#6E81A0] hidden sm:block">
              Hızlı İşlem
            </span>
          </div>

          {/* 4. Halka Arz */}
          <Link
            href="/ipo"
            className={`flex flex-col items-center justify-center px-3.5 py-1 min-w-[60px] sm:min-w-[68px] rounded-full transition-all duration-150 ${
              pathname.startsWith("/ipo")
                ? "text-[#273869]"
                : "text-[#8B9BB4] hover:text-[#405881]"
            }`}
          >
            <div className="relative">
              <Calendar
                size={22}
                strokeWidth={pathname.startsWith("/ipo") ? 2.5 : 1.8}
                className={pathname.startsWith("/ipo") ? "fill-[#273869]/15" : ""}
              />
              {pathname.startsWith("/ipo") && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#273869]" />
              )}
            </div>
            <span
              className={`text-[11px] mt-1 transition-all ${
                pathname.startsWith("/ipo")
                  ? "font-bold text-[#273869]"
                  : "font-medium text-[#8B9BB4]"
              }`}
            >
              Halka Arz
            </span>
          </Link>

          {/* 5. Portföy */}
          <Link
            href="/portfolio"
            className={`flex flex-col items-center justify-center px-3.5 py-1 min-w-[60px] sm:min-w-[68px] rounded-full transition-all duration-150 ${
              pathname.startsWith("/portfolio")
                ? "text-[#273869]"
                : "text-[#8B9BB4] hover:text-[#405881]"
            }`}
          >
            <div className="relative">
              <Briefcase
                size={22}
                strokeWidth={pathname.startsWith("/portfolio") ? 2.5 : 1.8}
                className={pathname.startsWith("/portfolio") ? "fill-[#273869]/15" : ""}
              />
              {pathname.startsWith("/portfolio") && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#273869]" />
              )}
            </div>
            <span
              className={`text-[11px] mt-1 transition-all ${
                pathname.startsWith("/portfolio")
                  ? "font-bold text-[#273869]"
                  : "font-medium text-[#8B9BB4]"
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
