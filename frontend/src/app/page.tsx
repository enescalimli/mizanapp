"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Calculator,
  Scale,
  Zap,
  Wifi,
  Droplets,
  Smartphone,
  ChevronDown,
  Info,
  CreditCard,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { CompanySummary } from "@/types/katilim";
import { LeftDockSidebar } from "@/components/LeftDockSidebar";
import { NotificationPopover } from "@/components/NotificationPopover";
import { useAuth } from "@/lib/auth/AuthContext";

/**
 * Split-tone price component: ₺482,50
 */
function MizanSplitPrice({
  value,
  prefix = "₺",
  className = "text-base",
}: {
  value: string | number;
  prefix?: string;
  className?: string;
}) {
  const str = String(value).replace("₺", "").trim();
  const parts = str.split(",");
  const integerPart = parts[0] || "0";
  const decimalPart = parts[1] || "00";

  return (
    <span className={`font-mono font-bold tracking-tight inline-flex items-baseline ${className}`}>
      <span className="text-[#182542]">{prefix}{integerPart}</span>
      <span className="text-[#6E81A0] text-[0.8em]">,{decimalPart}</span>
    </span>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const {
    companies,
    updatedAt,
  } = useLiveMarketData(45000);

  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);

  // Quick Screen Form State
  const [selectedQuickTicker, setSelectedQuickTicker] = useState<string>("BIMAS");
  const [sendAmountInput, setSendAmountInput] = useState<string>("10.000");
  const [currencyCode, setCurrencyCode] = useState<"TRY" | "LOT">("TRY");
  const [isQuickPickerOpen, setIsQuickPickerOpen] = useState<boolean>(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>("");

  const userInitials = useMemo(() => {
    const name = profile?.full_name || (user?.user_metadata?.full_name as string) || "Mustafa Çalımlı";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [profile?.full_name, user?.user_metadata?.full_name]);

  // Seçili Hızlı Tarama Şirketi
  const selectedQuickCompany = useMemo(() => {
    const found = companies.find((c) => c.ticker === selectedQuickTicker);
    if (found) return found;
    return (
      companies[0] || {
        ticker: "BIMAS",
        name: "BİM Birleşik Mağazalar A.Ş.",
        sector: "Perakende Ticaret",
        bistStatus: "COMPLIANT" as const,
        aaoifiStatus: "COMPLIANT" as const,
        debtRatioPercent: 12.4,
        cashRatioPercent: 8.2,
        impureIncomePercent: 1.1,
        priceTRY: "₺482.50",
        change24h: "+1.25%",
      }
    );
  }, [companies, selectedQuickTicker]);

  // Hızlı Arama Listesi (Picker)
  const quickFilteredList = useMemo(() => {
    if (!quickSearchQuery.trim()) return companies.slice(0, 10);
    const q = quickSearchQuery.toUpperCase().trim();
    return companies
      .filter(
        (c) =>
          c.ticker.toUpperCase().includes(q) ||
          c.name.toUpperCase().includes(q)
      )
      .slice(0, 10);
  }, [companies, quickSearchQuery]);

  // Tutar Hesabı
  const numericSendAmount = useMemo(() => {
    const clean = sendAmountInput.replace(/\./g, "").replace(",", ".");
    return parseFloat(clean) || 0;
  }, [sendAmountInput]);

  const quickCalculatedLot = useMemo(() => {
    if (currencyCode === "LOT") return numericSendAmount;
    const priceVal = parseFloat(String(selectedQuickCompany.priceTRY).replace(/[^0-9.-]+/g, "")) || 1;
    return priceVal > 0 ? Math.floor(numericSendAmount / priceVal) : 0;
  }, [numericSendAmount, currencyCode, selectedQuickCompany]);

  const quickCalculatedTRY = useMemo(() => {
    if (currencyCode === "TRY") return numericSendAmount;
    const priceVal = parseFloat(String(selectedQuickCompany.priceTRY).replace(/[^0-9.-]+/g, "")) || 0;
    return numericSendAmount * priceVal;
  }, [numericSendAmount, currencyCode, selectedQuickCompany]);

  return (
    <div className="min-h-screen bg-[#EBEEF2] text-[#182542] selection:bg-[#E6F8EF] selection:text-[#0D8B52] relative">
      {/* Soft Atmospheric Navy Mist Gradient Background */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-r from-transparent via-[#87A8CD]/20 to-[#476B9B]/15 pointer-events-none blur-3xl -z-0" />

      {/* FIXED Left Vertical Dock (Desktop only, stays fixed when scrolling) */}
      <LeftDockSidebar />

      {/* Main Responsive Body Container (Fluid & Edge-to-Edge Responsive) */}
      <div className="relative z-10 md:pl-20 lg:pl-28 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* =================================================================== */}
        {/* TOP FLOATING HEADER: Logo, Live Ticker, Notifications, Profile     */}
        {/* =================================================================== */}
        <header className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 p-4 sm:px-8 sm:py-5 shadow-[0_8px_30px_rgba(24,37,66,0.04)] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform shrink-0 bg-[#182542] flex items-center justify-center p-0.5">
              <Image
                src="/brand/logo.svg"
                alt="Mizan Katılım"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black tracking-tight text-[#182542]">
                mizan
              </span>
              <span className="text-xs font-semibold text-[#6E81A0]">
                katılım
              </span>
            </div>
          </Link>

          {/* Center Search Pill -> Navigates to Dedicated Screener */}
          <Link
            href="/tarayici"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-[#6E81A0] transition shadow-2xs max-w-xs w-full"
          >
            <Search size={14} className="text-[#8C9BB0]" />
            <span className="truncate">626 BIST Katılım Hissesi Ara...</span>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/tarayici")}
              className="sm:hidden w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-white/90 text-[#6E81A0] hover:text-[#182542] flex items-center justify-center shadow-xs transition"
              title="Hisse Ara"
            >
              <Search size={16} />
            </button>

            {/* Interactive Real Notification Popover */}
            <NotificationPopover />

            {/* User Profile Avatar */}
            <Link
              href="/ayarlar"
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs relative shrink-0 hover:ring-2 hover:ring-[#182542]/20 transition"
              title="Profil & Ayarlar"
            >
              <div className="w-full h-full bg-gradient-to-tr from-[#182542] to-[#405881] flex items-center justify-center text-white text-xs font-bold font-mono">
                {userInitials}
              </div>
            </Link>
          </div>
        </header>

        {/* =================================================================== */}
        {/* EXECUTIVE BENTO DASHBOARD: 3 Translucent Frosted Glass Columns     */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ================================================================= */}
          {/* COLUMN 1 (LEFT, col-span-4): Bakiye + Son Taranan Katılım Hisseleri */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* PANEL 1: KATILIM PORTFÖY & CÜZDAN */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-5">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#6E81A0]">
                  <div className="w-5 h-5 rounded-md bg-white/80 border border-white flex items-center justify-center text-[#182542] shadow-2xs">
                    <CreditCard size={12} />
                  </div>
                  <span>Katılım Portföy &amp; Bakiye</span>
                </div>

                <Link
                  href="/portfolio"
                  className="w-7 h-7 rounded-full bg-[#182542] text-white flex items-center justify-center hover:bg-[#273869] transition shadow-xs"
                  title="Portföy Paneline Git"
                >
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              {/* Amount Typography */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#182542] font-mono tracking-tight">
                    {balanceVisible ? "₺56.751,23" : "•••••••• ₺"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="text-[#8C9BB0] hover:text-[#182542] transition"
                    aria-label="Bakiyeyi Gizle / Göster"
                  >
                    {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Micro Pill */}
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 hover:bg-white border border-white/90 text-[11px] font-medium text-[#6E81A0] transition shadow-2xs"
                >
                  <CheckCircle2 size={12} className="text-[#0D8B52]" />
                  <span>Katılım Uyum Oranı • %94.2 Uyumlu</span>
                  <ChevronRight size={12} className="text-[#8C9BB0]" />
                </Link>
              </div>

              {/* Quick Actions (4 Circular Buttons) */}
              <div className="pt-2">
                <span className="text-xs font-bold text-[#182542] mb-3 block">
                  Hızlı İşlemler
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => router.push("/tarayici")}
                    className="flex flex-col items-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/90 border border-white/90 text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#182542] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                      <Search size={16} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5 group-hover:text-[#182542] transition">
                      Hisse Ara
                    </span>
                  </button>

                  <Link
                    href="/ipo"
                    className="flex flex-col items-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/90 border border-white/90 text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#182542] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                      <Calendar size={16} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5 group-hover:text-[#182542] transition">
                      Halka Arz
                    </span>
                  </Link>

                  <Link
                    href="/purification"
                    className="flex flex-col items-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/90 border border-white/90 text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#182542] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                      <Calculator size={16} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5 group-hover:text-[#182542] transition">
                      Arındır
                    </span>
                  </Link>

                  <Link
                    href="/purification"
                    className="flex flex-col items-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/90 border border-white/90 text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#182542] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                      <Scale size={16} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5 group-hover:text-[#182542] transition">
                      Zekât
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* PANEL 2: SON TARANAN KATILIM HİSSELERİ */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#182542]">
                  Piyasa Özeti &amp; Hisseler
                </h3>
                <Link
                  href="/tarayici"
                  className="text-xs font-bold text-[#182542] hover:text-blue-700 transition flex items-center gap-1"
                >
                  <span>Tümünü Gör (626)</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {/* 6 Real BIST Stocks List */}
              <div className="space-y-3">
                {[
                  { ticker: "BIMAS", name: "BİM Birleşik Mağazalar", price: "₺482.50", change: "+%1.8", isPos: true, compliant: true, sector: "Perakende Ticaret" },
                  { ticker: "THYAO", name: "Türk Hava Yolları", price: "₺312.00", change: "-%0.8", isPos: false, compliant: false, sector: "Ulaştırma & Havacılık" },
                  { ticker: "ASELS", name: "Aselsan Elektronik", price: "₺68.40", change: "+%2.4", isPos: true, compliant: true, sector: "Savunma & Teknoloji" },
                  { ticker: "DURKN", name: "Durukan Şekerleme", price: "₺21.80", change: "+%4.2", isPos: true, compliant: true, sector: "Gıda Sanayii" },
                  { ticker: "FROTO", name: "Ford Otomotiv Sanayi", price: "₺985.00", change: "-%0.5", isPos: false, compliant: true, sector: "Otomotiv" },
                  { ticker: "TUPRS", name: "Türkiye Petrol Rafineleri", price: "₺174.50", change: "+%1.1", isPos: true, compliant: true, sector: "Enerji & Petrol" },
                ].map((st, idx) => (
                  <Link
                    key={idx}
                    href={`/companies/${st.ticker}`}
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/60 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#182542] to-[#273869] text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs group-hover:scale-105 transition">
                        {st.ticker.slice(0, 3)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#182542] group-hover:text-[#273869] transition">
                          {st.ticker} — {st.name.slice(0, 20)}
                        </div>
                        <div className="text-[11px] text-[#8C9BB0] flex items-center gap-1.5">
                          <span>{st.sector}</span>
                          <span>•</span>
                          <span className={st.compliant ? "text-[#0D8B52] font-semibold" : "text-[#C62E26] font-semibold"}>
                            {st.compliant ? "✓ Uygun" : "✕ Kapsam Dışı"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#182542]">
                        {st.price}
                      </div>
                      <div className={`text-[11px] font-mono font-bold ${st.isPos ? "text-[#12B76A]" : "text-[#F04438]"}`}>
                        {st.change}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom CTA to dedicated screener */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/tarayici"
                  className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#182542] flex items-center justify-center gap-2 transition shadow-2xs"
                >
                  <BarChart3 size={14} />
                  <span>Gelişmiş Hisse Tarayıcıyı Aç</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* COLUMN 2 (CENTER, col-span-5): 2 KPIs + Hacim Trendi + Halka Arz  */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* ROW 1: TWO KPI CARDS */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* KPI 1: BIST Katılım 100 Endeksi */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/85 p-5 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-3">
                <span className="text-[11px] font-semibold text-[#6E81A0] block">
                  BIST Katılım 100 (XKTUM)
                </span>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-xl sm:text-2xl font-black text-[#182542] font-mono tracking-tight">
                    10.842,50
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F8EF] text-[#0D8B52] text-[10px] font-bold">
                    +%2.4
                  </span>
                </div>
              </div>

              {/* KPI 2: Arındırma & Zekât Payı */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/85 p-5 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-3">
                <span className="text-[11px] font-semibold text-[#6E81A0] block">
                  Arındırma &amp; Zekât Payı
                </span>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-xl sm:text-2xl font-black text-[#182542] font-mono tracking-tight">
                    ₺1.240,80
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FEE4E2] text-[#D92D20] text-[10px] font-bold">
                    -%1.2
                  </span>
                </div>
              </div>
            </div>

            {/* PANEL 3: KATILIM ENDEKSİ HAFTALIK HACİM */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6E81A0]">
                  Katılım Endeksi Haftalık Hacim
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[11px] font-semibold text-[#6E81A0] shadow-2xs"
                >
                  <span>Bu Hafta</span>
                  <ChevronDown size={12} />
                </button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#182542] font-mono tracking-tight">
                  ₺84.2 Mr
                </span>
                <span className="text-xs font-bold text-[#12B76A] flex items-center">
                  <ArrowUpRight size={13} />
                  <span>+%4.2 Büyüme</span>
                </span>
              </div>

              {/* 7 Days Bar Chart */}
              <div className="pt-2">
                <div className="flex items-end justify-between h-28 px-2 gap-2">
                  {[
                    { day: "P", height: "45%", isActive: false },
                    { day: "S", height: "65%", isActive: false },
                    { day: "Ç", height: "50%", isActive: false },
                    { day: "P", height: "95%", isActive: true },
                    { day: "C", height: "60%", isActive: false },
                    { day: "C", height: "40%", isActive: false },
                    { day: "P", height: "30%", isActive: false },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div
                        className={`w-full max-w-[28px] rounded-full transition-all duration-300 relative flex items-start justify-center pt-1.5 ${
                          bar.isActive
                            ? "bg-[#182542] shadow-sm"
                            : "bg-[#E5EEF8] hover:bg-[#D5E3F2]"
                        }`}
                        style={{ height: bar.height }}
                      >
                        {bar.isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-[#8C9BB0]">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PANEL 4: YAKLAŞAN HALKA ARZLAR */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#182542]">
                  Yaklaşan &amp; Aktif Halka Arzlar
                </h3>
                <Link
                  href="/ipo"
                  className="text-xs font-bold text-[#182542] hover:text-blue-700 transition"
                >
                  Takvimi Aç &rarr;
                </Link>
              </div>

              {/* 4 Real BIST IPO Rows */}
              <div className="space-y-2.5">
                {[
                  { icon: Zap, name: "SSAAT — Saat ve Saat Sanayi", desc: "SPK Onaylandı / Talep Toplama", price: "₺56.00", status: "✓ Katılıma Uygun", isCompliant: true },
                  { icon: Wifi, name: "NETGL — Net Global Endüstriyel", desc: "BIST'te Yeni İşlem Görüyor", price: "₺25.52", status: "✓ Katılıma Uygun", isCompliant: true },
                  { icon: Droplets, name: "INTET — İntetra Teknoloji", desc: "Akıllı Ulaşım Sistemleri", price: "₺53.60", status: "✓ Katılıma Uygun", isCompliant: true },
                  { icon: Smartphone, name: "DNYVA — Dünya Varlık Yönetim", desc: "Faizli Varlık / Alacak Tahsilatı", price: "₺38.44", status: "✕ Katılım Dışı", isCompliant: false },
                ].map((ipo, idx) => (
                  <Link
                    key={idx}
                    href="/ipo"
                    className="p-3 rounded-2xl bg-white/70 hover:bg-white border border-white/90 flex items-center justify-between shadow-2xs transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] text-[#182542] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                        <ipo.icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#182542] group-hover:text-[#273869] transition">
                          {ipo.name}
                        </div>
                        <div className="text-[10px] text-[#8C9BB0]">
                          {ipo.desc}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#182542]">
                        {ipo.price}
                      </div>
                      <div className={`text-[10px] font-bold ${
                        ipo.isCompliant ? "text-[#0D8B52]" : "text-[#C62E26]"
                      }`}>
                        {ipo.status}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* COLUMN 3 (RIGHT, col-span-3): Hızlı Fıkhi Denetim + Sertifika     */}
          {/* ================================================================= */}
          <div className="lg:col-span-3 space-y-5">
            
            {/* PANEL 5: HIZLI FIKHİ DENETİM */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-4">
              <h3 className="text-sm font-bold text-[#182542]">
                Hızlı Katılım Denetimi
              </h3>

              {/* Stock Selector Row */}
              {isQuickPickerOpen ? (
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/95 border border-[#182542]/15 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#182542]">Hisse Seçin (626 BIST)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickPickerOpen(false);
                        setQuickSearchQuery("");
                      }}
                      className="text-[11px] font-bold text-[#8C9BB0] hover:text-[#182542]"
                    >
                      Kapat
                    </button>
                  </div>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-[#8C9BB0]" />
                    <input
                      type="text"
                      value={quickSearchQuery}
                      onChange={(e) => setQuickSearchQuery(e.target.value)}
                      placeholder="Kod veya şirket ara..."
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F4F6F9] border border-transparent focus:border-[#182542]/20 outline-none text-[#182542]"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-[#EDF1F7] pr-1">
                    {quickFilteredList.map((c) => (
                      <button
                        key={c.ticker}
                        type="button"
                        onClick={() => {
                          setSelectedQuickTicker(c.ticker);
                          setIsQuickPickerOpen(false);
                          setQuickSearchQuery("");
                        }}
                        className="w-full text-left py-2 px-1 hover:bg-[#F4F6F9] rounded-lg transition flex items-center justify-between group"
                      >
                        <div>
                          <span className="text-xs font-bold text-[#182542] block group-hover:text-[#273869]">
                            {c.ticker}
                          </span>
                          <span className="text-[10px] text-[#8C9BB0] block truncate max-w-[150px]">
                            {c.name}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            c.bistStatus === "COMPLIANT"
                              ? "bg-[#0D8B52]/10 text-[#0D8B52]"
                              : "bg-[#DC2626]/10 text-[#DC2626]"
                          }`}
                        >
                          {c.bistStatus === "COMPLIANT" ? "Uygun" : "Kapsam Dışı"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-white/80 border border-white/95 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#182542] to-[#273869] text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                      {selectedQuickCompany.ticker.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#182542] leading-tight truncate">
                        {selectedQuickCompany.ticker} — {selectedQuickCompany.name}
                      </div>
                      <div className="text-[10px] text-[#8C9BB0] truncate">
                        {selectedQuickCompany.sector} &bull; {selectedQuickCompany.priceTRY}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuickPickerOpen(true)}
                    className="text-[11px] font-bold text-[#405881] hover:text-[#182542] shrink-0 ml-2"
                  >
                    Değiştir
                  </button>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#8C9BB0]">
                    Yatırım Tutarı / Lot Hesabı
                  </span>
                  <span className="text-[10px] font-bold text-[#405881] font-mono">
                    {currencyCode === "TRY"
                      ? `≈ ${quickCalculatedLot.toLocaleString("tr-TR")} Lot`
                      : `≈ ₺${quickCalculatedTRY.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#EDF1F7] pb-2">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-2xl font-black text-[#182542] font-mono">
                      {currencyCode === "TRY" ? "₺" : "#"}
                    </span>
                    <input
                      type="text"
                      value={sendAmountInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9.,]/g, "");
                        setSendAmountInput(clean);
                      }}
                      placeholder={currencyCode === "TRY" ? "10.000" : "100"}
                      className="w-full text-2xl font-black text-[#182542] font-mono tracking-tight bg-transparent border-none outline-none focus:ring-0 p-0 text-[#182542]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrencyCode((c) => (c === "TRY" ? "LOT" : "TRY"))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 border border-white/90 text-[11px] font-bold text-[#182542] shadow-2xs hover:bg-[#F4F6F9] transition shrink-0 ml-2"
                  >
                    <span>{currencyCode === "TRY" ? "🇹🇷 TRY ₺" : "📊 LOT"}</span>
                    <ChevronDown size={11} className="text-[#8C9BB0]" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-[11px] text-[#8C9BB0] pt-1">
                <div className="flex items-center gap-1">
                  <Info size={11} />
                  <span>Fıkhi Durum</span>
                </div>
                {selectedQuickCompany.bistStatus === "COMPLIANT" ? (
                  <span className="font-bold text-[#0D8B52] flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Katılıma Uygun
                  </span>
                ) : (
                  <span className="font-bold text-[#DC2626] flex items-center gap-1">
                    <XCircle size={12} />
                    Katılım Dışı
                  </span>
                )}
              </div>

              {/* Report Action Button */}
              <button
                type="button"
                onClick={() => router.push(`/companies/${selectedQuickCompany.ticker}`)}
                className="w-full py-3.5 rounded-2xl bg-[#182542] hover:bg-[#273869] text-white font-bold text-xs shadow-md shadow-[#182542]/20 transition active:scale-95 text-center flex items-center justify-center gap-1.5"
              >
                <span>{selectedQuickCompany.ticker} Fıkhi Raporu</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            {/* PANEL 6: MİZAN FIKHİ İCAZET & STANDART SERTİFİKASI */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#182542] block">
                Fıkhi Standart &amp; İcazet Sertifikası
              </span>

              <div className="w-full aspect-[1.58/1] rounded-3xl p-5 relative overflow-hidden text-white flex flex-col justify-between shadow-xl shadow-[#182542]/20 border border-white/20 bg-gradient-to-br from-[#182542] via-[#24375d] to-[#3a5282]">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,transparent_60%)] pointer-events-none" />
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />

                {/* Top */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="font-bold text-base tracking-tight text-white/90">
                    mizan • katılım
                  </span>
                  <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-300/30 border border-amber-300/40 text-amber-200 text-[10px] font-bold flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck size={12} className="text-amber-300" />
                    <span>Fıkhi İcazet Onaylı</span>
                  </div>
                </div>

                {/* Middle */}
                <div className="relative z-10 py-1 space-y-1">
                  <div className="text-xs font-extrabold text-white tracking-tight">
                    BIST Katılım (XKTUM) &amp; AAOIFI No: 21
                  </div>
                  <div className="text-[10px] text-white/75 leading-relaxed">
                    Faizli Borç Oranı: <strong className="text-emerald-300">&lt; %33</strong> &bull; Uygunsuz Gelir: <strong className="text-emerald-300">&lt; %5</strong>
                  </div>
                </div>

                {/* Bottom */}
                <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/15">
                  <div className="space-y-0.5">
                    <div className="text-[9px] text-white/60 uppercase font-mono tracking-wider">
                      Sertifika Lisans No
                    </div>
                    <div className="text-[11px] font-mono font-bold tracking-widest text-emerald-300">
                      MZ-2026-XKTUM-01
                    </div>
                  </div>

                  <Link
                    href="/rehber"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold transition backdrop-blur-xs border border-white/15"
                  >
                    <span>Standartları İncele</span>
                    <ArrowUpRight size={11} />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
