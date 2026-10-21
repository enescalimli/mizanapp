"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Home,
  Wallet,
  Calendar,
  User,
  Settings,
  LogOut,
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Send,
  Plus,
  CreditCard,
  QrCode,
  Zap,
  Wifi,
  Droplets,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Building2,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  Info,
  DollarSign,
  Radio,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { CompanySummary } from "@/types/katilim";

/**
 * Split-tone price component: ₺482,50
 */
function PaynoSplitPrice({
  value,
  prefix = "₺",
  className = "text-base",
}: {
  value: string | number;
  prefix?: string;
  className?: string;
}) {
  const formatted = Number(value || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [whole, fraction] = formatted.split(",");
  return (
    <span className={`font-mono tabular-nums tracking-tight ${className}`}>
      <span className="font-bold text-[#182542]">
        {prefix}
        {whole},
      </span>
      <span className="font-normal text-[#8C9BB0]">{fraction || "00"}</span>
    </span>
  );
}

/**
 * Katılım dışı olan hisselerin kesin fıkhi/mali gerekçesini hesaplar
 */
function getNonComplianceReason(comp: CompanySummary, standard: "BIST" | "AAOIFI"): string {
  if (comp.breachReasonSummary) return comp.breachReasonSummary;

  const threshold = standard === "BIST" ? 33 : 30;

  // 1. Sektörel Uygunsuzluk Kontrolü
  const nonHalalSectors = [
    "Bankacılık",
    "Sigortacılık",
    "Finansal Kiralama ve Faktoring",
    "Alkollü İçecek",
    "Tütün Ürünleri",
    "Şans Oyunları",
    "Savunma Sanayi (Haram mühimmat)",
  ];
  if (nonHalalSectors.some((sec) => comp.sector?.includes(sec))) {
    return "Ana Faaliyet: Konvansiyonel faizli finans / bankacılık";
  }

  // 2. Faizli Borç Oranı Eşiği
  if (comp.debtRatioPercent > threshold) {
    return `Faizli Borç: %${comp.debtRatioPercent.toFixed(1)} > %${threshold}`;
  }

  // 3. Faizli Varlık Oranı Eşiği
  if (comp.cashRatioPercent > threshold) {
    return `Faizli Varlık: %${comp.cashRatioPercent.toFixed(1)} > %${threshold}`;
  }

  // 4. Uygun Olmayan Gelir Oranı Eşiği
  if (comp.impureIncomePercent > 5) {
    return `Uygunsuz Gelir: %${comp.impureIncomePercent.toFixed(1)} > %5`;
  }

  return `Faizli Borç/Varlık Eşiği Üstünde (%${comp.debtRatioPercent.toFixed(1)})`;
}

type SortField =
  | "ticker"
  | "priceTRY"
  | "change24h"
  | "status"
  | "debtRatioPercent"
  | "cashRatioPercent"
  | "impureIncomePercent";

type SortDirection = "asc" | "desc";

export default function HomePage() {
  const router = useRouter();
  const {
    companies,
    kapDisclosures,
    updatedAt,
    isRefreshing,
    refreshNow,
  } = useLiveMarketData(45000);

  // Tarayıcı filtreleri
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "COMPLIANT" | "NON_COMPLIANT"
  >("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("TÜMÜ");
  const [standard, setStandard] = useState<"BIST" | "AAOIFI">("BIST");
  const [visibleLimit, setVisibleLimit] = useState<number>(80);
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);

  // Quick Send/Screen Form State
  const [selectedQuickTicker, setSelectedQuickTicker] = useState<string>("BIMAS");
  const [sendAmountInput, setSendAmountInput] = useState<string>("250.00");
  const [currencyCode, setCurrencyCode] = useState<"USD" | "TRY">("USD");

  // Sütun Sıralama State'i
  const [sortField, setSortField] = useState<SortField>("ticker");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sektör listesi
  const allSectors = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.sector) set.add(c.sector);
    });
    return ["TÜMÜ", ...Array.from(set).sort((a, b) => a.localeCompare(b, "tr"))];
  }, [companies]);

  // Sayılar
  const totalCount = companies.length;
  const compliantCount = useMemo(
    () =>
      companies.filter((c) =>
        standard === "BIST"
          ? c.bistStatus === "COMPLIANT"
          : c.aaoifiStatus === "COMPLIANT"
      ).length,
    [companies, standard]
  );
  const nonCompliantCount = totalCount - compliantCount;

  // Filtrelenmiş şirketler
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    return companies.filter((c) => {
      const st = standard === "BIST" ? c.bistStatus : c.aaoifiStatus;

      if (statusFilter === "COMPLIANT" && st !== "COMPLIANT") return false;
      if (statusFilter === "NON_COMPLIANT" && st === "COMPLIANT") return false;
      if (sectorFilter !== "TÜMÜ" && c.sector !== sectorFilter) return false;

      if (q) {
        return (
          c.ticker.toUpperCase().includes(q) ||
          c.name.toUpperCase().includes(q) ||
          c.sector.toUpperCase().includes(q)
        );
      }
      return true;
    });
  }, [companies, searchQuery, statusFilter, sectorFilter, standard]);

  // Sıralanmış Şirketler
  const sortedCompanies = useMemo(() => {
    const list = [...filteredCompanies];
    list.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === "status") {
        const stA = standard === "BIST" ? a.bistStatus : a.aaoifiStatus;
        const stB = standard === "BIST" ? b.bistStatus : b.aaoifiStatus;
        valA = stA === "COMPLIANT" ? 1 : 0;
        valB = stB === "COMPLIANT" ? 1 : 0;
      } else if (sortField === "priceTRY") {
        valA = parseFloat(String(a.priceTRY).replace(/[^0-9.-]+/g, "")) || 0;
        valB = parseFloat(String(b.priceTRY).replace(/[^0-9.-]+/g, "")) || 0;
      } else if (sortField === "change24h") {
        valA = parseFloat(String(a.change24h).replace(/[^0-9.-]+/g, "")) || 0;
        valB = parseFloat(String(b.change24h).replace(/[^0-9.-]+/g, "")) || 0;
      } else {
        valA = a[sortField as keyof CompanySummary];
        valB = b[sortField as keyof CompanySummary];
      }

      if (typeof valA === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB, "tr")
          : valB.localeCompare(valA, "tr");
      }

      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
    return list;
  }, [filteredCompanies, sortField, sortDirection, standard]);

  const displayedCompanies = useMemo(
    () => sortedCompanies.slice(0, visibleLimit),
    [sortedCompanies, visibleLimit]
  );

  return (
    <div className="min-h-screen bg-[#EBEEF2] text-[#182542] py-4 sm:py-8 px-2 sm:px-4 md:px-6 flex justify-center">
      
      {/* ===================================================================== */}
      {/* PAYNO EXECUTIVE DASHBOARD CONTAINER (Orbix Studio Canvas)              */}
      {/* ===================================================================== */}
      <div className="w-full max-w-[1340px] bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_25px_80px_rgba(24,37,66,0.08)] border border-white/90 overflow-hidden relative flex flex-col">
        
        {/* Soft Atmospheric Navy Mist Gradient (Top Area in Screenshot) */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-transparent via-[#87A8CD]/25 to-[#476B9B]/20 pointer-events-none blur-3xl -z-0" />

        {/* =================================================================== */}
        {/* TOP HEADER: Logo, Search, Notifications, Avatar                     */}
        {/* =================================================================== */}
        <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-7 pb-4">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#182542] text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-mono text-sm leading-none">p</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#182542]">
              payno
            </span>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("screener-table");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E2E8F0] text-[#6E81A0] hover:text-[#182542] flex items-center justify-center shadow-xs transition"
              title="Hisse Ara"
            >
              <Search size={16} />
            </button>

            <button
              type="button"
              onClick={() => refreshNow()}
              disabled={isRefreshing}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E2E8F0] text-[#6E81A0] hover:text-[#182542] flex items-center justify-center shadow-xs transition relative"
              title="Bildirimler & Canlı Veri"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F04438]" />
            </button>

            {/* User Avatar */}
            <Link
              href="/portfolio"
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs relative shrink-0 hover:ring-2 hover:ring-[#182542]/20 transition"
            >
              <div className="w-full h-full bg-gradient-to-tr from-[#273869] to-[#6E81A0] flex items-center justify-center text-white text-xs font-bold font-mono">
                CH
              </div>
            </Link>
          </div>
        </header>

        {/* =================================================================== */}
        {/* MAIN BODY: Left Vertical Dock + 3 Dashboard Columns                 */}
        {/* =================================================================== */}
        <div className="relative z-10 flex flex-1 px-4 sm:px-8 pb-8 pt-2 gap-5 sm:gap-7">
          
          {/* 1. LEFT VERTICAL DOCK (Exact from Payno Mockup) */}
          <aside className="hidden md:flex flex-col justify-between items-center py-2 shrink-0">
            {/* Top Navigation Group */}
            <div className="flex flex-col items-center gap-4">
              {/* Home Active Button */}
              <Link
                href="/"
                className="w-10 h-10 rounded-full bg-[#182542] text-white flex items-center justify-center shadow-sm transition hover:scale-105"
                title="Ana Sayfa"
              >
                <Home size={18} />
              </Link>

              {/* Wallet / Portfolio Button */}
              <Link
                href="/portfolio"
                className="w-10 h-10 rounded-full bg-[#F3F6FA] hover:bg-[#EAEFF6] text-[#6E81A0] hover:text-[#182542] flex items-center justify-center transition"
                title="Portföy & Cüzdan"
              >
                <Wallet size={18} />
              </Link>

              {/* Calendar / IPO Button */}
              <Link
                href="/ipo"
                className="w-10 h-10 rounded-full bg-[#F3F6FA] hover:bg-[#EAEFF6] text-[#6E81A0] hover:text-[#182542] flex items-center justify-center transition"
                title="Halka Arz Takvimi"
              >
                <Calendar size={18} />
              </Link>

              {/* Community / Guide Button */}
              <Link
                href="/rehber"
                className="w-10 h-10 rounded-full bg-[#F3F6FA] hover:bg-[#EAEFF6] text-[#6E81A0] hover:text-[#182542] flex items-center justify-center transition"
                title="Fıkhi Cevazlar & Rehber"
              >
                <User size={18} />
              </Link>
            </div>

            {/* Bottom Group: Settings & Exit */}
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/purification"
                className="w-10 h-10 rounded-full bg-[#F3F6FA] hover:bg-[#EAEFF6] text-[#6E81A0] hover:text-[#182542] flex items-center justify-center transition"
                title="Arındırma Ayarları"
              >
                <Settings size={18} />
              </Link>

              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="w-10 h-10 rounded-full bg-[#F3F6FA] hover:bg-[#EAEFF6] text-[#6E81A0] hover:text-[#182542] flex items-center justify-center transition"
                title="Çıkış / Giriş"
              >
                <LogOut size={18} />
              </button>
            </div>
          </aside>

          {/* 2. THE 3 CONTENT COLUMNS (Exact Payno Architecture) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* =============================================================== */}
            {/* COLUMN 1 (LEFT, col-span-4): Balance + Recent Transactions      */}
            {/* =============================================================== */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* CARD 1: AVAILABLE BALANCE */}
              <div className="bg-white rounded-[28px] border border-[#EDF1F6] p-6 shadow-[0_4px_25px_rgba(24,37,66,0.03)] space-y-5">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#6E81A0]">
                    <div className="w-5 h-5 rounded-md bg-[#F3F6FA] flex items-center justify-center text-[#182542]">
                      <CreditCard size={12} />
                    </div>
                    <span>Available Balance</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("screener-table");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-7 h-7 rounded-full bg-[#182542] text-white flex items-center justify-center hover:bg-[#273869] transition shadow-xs"
                    title="İncele"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>

                {/* Amount Typography */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#182542] font-mono tracking-tight">
                      {balanceVisible ? "$56,751.23" : "••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="text-[#8C9BB0] hover:text-[#182542] transition"
                    >
                      {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Micro Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFD] border border-[#E2E8F0] text-[11px] font-medium text-[#6E81A0]">
                    <Info size={11} className="text-[#8C9BB0]" />
                    <span>Available Limit • 50,000 Left</span>
                    <ChevronRight size={12} className="text-[#8C9BB0]" />
                  </div>
                </div>

                {/* Quick Actions (4 Circular Buttons) */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#182542] block mb-3">
                    Quick Actions
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("screener-table");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex flex-col items-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#F3F6FA] group-hover:scale-105 transition">
                        <Send size={16} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5">
                        Send
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/portfolio")}
                      className="flex flex-col items-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#F3F6FA] group-hover:scale-105 transition">
                        <Plus size={18} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5">
                        Add Funds
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/purification")}
                      className="flex flex-col items-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#F3F6FA] group-hover:scale-105 transition">
                        <CreditCard size={16} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5">
                        Pay Bills
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/ipo")}
                      className="flex flex-col items-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#F3F6FA] group-hover:scale-105 transition">
                        <QrCode size={16} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5">
                        QR
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: RECENT TRANSACTIONS */}
              <div className="bg-white rounded-[28px] border border-[#EDF1F6] p-6 shadow-[0_4px_25px_rgba(24,37,66,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182542]">
                    Recent transactions
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("screener-table");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs font-semibold text-[#6E81A0] hover:text-[#182542] transition"
                  >
                    View All
                  </button>
                </div>

                {/* 6 Transactions List (Exact Typography) */}
                <div className="space-y-3.5">
                  {[
                    { name: "Jerome Bell", time: "Today, 5:32 PM", amount: "+$90.89", isPos: true, initials: "JB", color: "from-amber-400 to-amber-600" },
                    { name: "Cody Fisher", time: "Today, 2:40 PM", amount: "-$10.99", isPos: false, initials: "CF", color: "from-emerald-400 to-emerald-600" },
                    { name: "Kristin Watson", time: "Yesterday, 6:51 PM", amount: "-$15.00", isPos: false, initials: "KW", color: "from-blue-400 to-blue-600" },
                    { name: "Darlene Frazier", time: "Today, 9:15 AM", amount: "+$120.50", isPos: true, initials: "DF", color: "from-violet-400 to-violet-600" },
                    { name: "Leroy Jenkins", time: "Yesterday, 4:30 PM", amount: "-$25.75", isPos: false, initials: "LJ", color: "from-rose-400 to-rose-600" },
                    { name: "Jasmine Cruz", time: "Today, 11:45 AM", amount: "+$45.00", isPos: true, initials: "JC", color: "from-cyan-400 to-cyan-600" },
                  ].map((tx, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${tx.color} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                          {tx.initials}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#182542]">
                            {tx.name}
                          </div>
                          <div className="text-[11px] text-[#8C9BB0]">
                            {tx.time}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-bold ${tx.isPos ? "text-[#182542]" : "text-[#182542]"}`}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* COLUMN 2 (CENTER, col-span-5): 2 KPIs + Chart + Upcoming        */}
            {/* =============================================================== */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* ROW 1: TWO KPI CARDS SIDE-BY-SIDE */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Total Revenue */}
                <div className="bg-white rounded-[24px] border border-[#EDF1F6] p-5 shadow-[0_4px_20px_rgba(24,37,66,0.03)] space-y-3">
                  <span className="text-[11px] font-semibold text-[#6E81A0] block">
                    Total Revenue
                  </span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xl sm:text-2xl font-black text-[#182542] font-mono tracking-tight">
                      $19,270.56
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F8EF] text-[#0D8B52] text-[10px] font-bold">
                      +81%
                    </span>
                  </div>
                </div>

                {/* Monthly Expense */}
                <div className="bg-white rounded-[24px] border border-[#EDF1F6] p-5 shadow-[0_4px_20px_rgba(24,37,66,0.03)] space-y-3">
                  <span className="text-[11px] font-semibold text-[#6E81A0] block">
                    Monthly Expense
                  </span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xl sm:text-2xl font-black text-[#182542] font-mono tracking-tight">
                      $7,142.81
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FEE4E2] text-[#D92D20] text-[10px] font-bold">
                      -12%
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 2: EARNING ACTIVITY & PILL BAR CHART */}
              <div className="bg-white rounded-[28px] border border-[#EDF1F6] p-6 shadow-[0_4px_25px_rgba(24,37,66,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6E81A0]">
                    Earning Activity
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F8FAFD] border border-[#E2E8F0] text-[11px] font-semibold text-[#6E81A0]"
                  >
                    <span>This Week</span>
                    <ChevronDown size={12} />
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#182542] font-mono tracking-tight">
                    $7.3K
                  </span>
                  <span className="text-xs font-bold text-[#12B76A] flex items-center">
                    <ArrowUpRight size={13} />
                    <span>+4.2%</span>
                  </span>
                </div>

                {/* 7 Days Pill Bar Chart */}
                <div className="pt-2">
                  <div className="flex items-end justify-between h-28 px-2 gap-2">
                    {[
                      { day: "S", height: "45%", isActive: false },
                      { day: "M", height: "65%", isActive: false },
                      { day: "T", height: "50%", isActive: false },
                      { day: "W", height: "95%", isActive: true },  // Tall navy pill exactly like screenshot
                      { day: "T", height: "60%", isActive: false },
                      { day: "F", height: "40%", isActive: false },
                      { day: "S", height: "30%", isActive: false },
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
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
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

              {/* CARD 3: UPCOMING PAYMENTS */}
              <div className="bg-white rounded-[28px] border border-[#EDF1F6] p-6 shadow-[0_4px_25px_rgba(24,37,66,0.03)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182542]">
                    Upcoming Payments
                  </h3>
                  <button
                    type="button"
                    onClick={() => router.push("/ipo")}
                    className="text-xs font-semibold text-[#6E81A0] hover:text-[#182542] transition"
                  >
                    View All
                  </button>
                </div>

                {/* 4 Bill Item Rows */}
                <div className="space-y-2.5">
                  {[
                    { icon: Zap, name: "Electricity Bill", ac: "AC: 122 6122 EB12", amount: "$85.00", due: "Due Tomorrow" },
                    { icon: Wifi, name: "Internet Bill", ac: "FiberNet Monthly Plan", amount: "$49.99", due: "Due in 3 days" },
                    { icon: Droplets, name: "Water Bill", ac: "Monthly Usage Charge", amount: "$35.00", due: "Due in 5 days" },
                    { icon: Smartphone, name: "Mobile Phone Bill", ac: "Unlimited Talk & Text Plan", amount: "$45.00", due: "Due in 10 days" },
                  ].map((bill, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#EDF1F7] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] text-[#182542] flex items-center justify-center shadow-2xs">
                          <bill.icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#182542]">
                            {bill.name}
                          </div>
                          <div className="text-[10px] text-[#8C9BB0]">
                            {bill.ac}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#182542]">
                          {bill.amount}
                        </div>
                        <div className="text-[10px] text-[#8C9BB0]">
                          {bill.due}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* COLUMN 3 (RIGHT, col-span-3): Send Money + Credit Card          */}
            {/* =============================================================== */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* CARD 1: SEND MONEY */}
              <div className="bg-white rounded-[28px] border border-[#EDF1F6] p-6 shadow-[0_4px_25px_rgba(24,37,66,0.03)] space-y-4">
                <h3 className="text-sm font-bold text-[#182542]">
                  Send Money
                </h3>

                {/* Recipient Row */}
                <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#EDF1F7] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#273869] to-[#6E81A0] text-white flex items-center justify-center text-xs font-bold">
                      CH
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#182542] leading-tight">
                        Courtney Henry
                      </div>
                      <div className="text-[10px] text-[#8C9BB0]">
                        AC: 122 6122 EB12
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("screener-table");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[11px] font-bold text-[#405881] hover:text-[#182542]"
                  >
                    Change
                  </button>
                </div>

                {/* Enter Amount Input */}
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-[#8C9BB0] block">
                    Enter Amount
                  </span>
                  <div className="flex items-baseline justify-between border-b border-[#EDF1F7] pb-2">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-[#182542] font-mono tracking-tight">
                        ${sendAmountInput}
                      </span>
                      <span className="w-0.5 h-6 bg-[#182542] ml-0.5 animate-pulse" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrencyCode((c) => (c === "USD" ? "TRY" : "USD"))}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F8FAFD] border border-[#E2E8F0] text-[11px] font-bold text-[#182542]"
                    >
                      <span>{currencyCode === "USD" ? "🇺🇸 USD" : "🇹🇷 TRY"}</span>
                      <ChevronDown size={11} className="text-[#8C9BB0]" />
                    </button>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="flex items-center justify-between text-[11px] text-[#8C9BB0] pt-1">
                  <div className="flex items-center gap-1">
                    <Info size={11} />
                    <span>Estimated Delivery</span>
                  </div>
                  <span className="font-semibold text-[#182542]">Instant ~ 10 min</span>
                </div>

                {/* Payno Card Selector */}
                <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#EDF1F7] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-5 rounded-md bg-[#182542] flex items-center justify-center text-white">
                      <CreditCard size={12} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#182542] leading-tight">
                        Payno Card
                      </div>
                      <div className="text-[10px] text-[#8C9BB0] font-mono">
                        ••••  ••••  4125
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] font-bold text-[#405881] hover:text-[#182542]"
                  >
                    Change
                  </button>
                </div>

                {/* Continue Solid Button */}
                <button
                  type="button"
                  onClick={() => router.push("/portfolio")}
                  className="w-full py-3.5 rounded-full bg-[#273869] hover:bg-[#182542] text-white font-bold text-xs shadow-md shadow-[#273869]/25 transition active:scale-95 text-center"
                >
                  Continue
                </button>
              </div>

              {/* CARD 2: CREDIT CARD WIDGET (Orbix Metallic Titanium Card) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#182542] block">
                  Credit Card
                </span>

                <div className="w-full aspect-[1.58/1] rounded-2xl p-5 relative overflow-hidden text-white flex flex-col justify-between shadow-xl shadow-[#182542]/20 border border-white/20 bg-gradient-to-br from-[#182542] via-[#24375d] to-[#3a5282]">
                  {/* Card Background Watermark Graphics */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,transparent_60%)] pointer-events-none" />
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />

                  {/* Top: Payno watermark & EMV Chip */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="font-bold text-base tracking-tight text-white/90">
                      payno
                    </span>

                    {/* EMV Chip graphic */}
                    <div className="w-8 h-6 rounded-md bg-gradient-to-br from-[#E2B96F] via-[#F4D086] to-[#C99C48] border border-amber-300/40 shadow-xs flex items-center justify-center">
                      <div className="w-6 h-4 border border-amber-800/20 rounded-[2px] grid grid-cols-2 gap-0.5 p-0.5">
                        <span className="bg-amber-700/10 rounded-[1px]"></span>
                        <span className="bg-amber-700/10 rounded-[1px]"></span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Contactless symbol & VISA Logo */}
                  <div className="flex items-end justify-between relative z-10 pt-4">
                    <div className="space-y-2">
                      {/* Contactless waves symbol */}
                      <Radio size={16} className="text-white/80 rotate-90" />
                      <div className="text-[11px] font-mono tracking-widest text-white/70">
                        ••••  4125
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black italic tracking-wider text-white font-serif">
                        VISA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 2: FULL-WIDTH BIST STOCK SCREENER TABLE (626 HİSSE)         */}
        {/* Seamlessly integrated inside the Payno architecture                 */}
        {/* =================================================================== */}
        <section
          id="screener-table"
          className="relative z-10 border-t border-[#EDF1F6] bg-white px-6 sm:px-10 py-8 space-y-6"
        >
          {/* Header Row: Title & Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EDF1F6] pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#182542] tracking-tight">
                  Tüm Borsa İstanbul Hisseleri
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#182542]/8 text-[#182542] text-xs font-mono font-bold">
                  {filteredCompanies.length} / {totalCount} Pay
                </span>
                {updatedAt && (
                  <span className="text-xs font-mono text-[#8C9BB0] hidden sm:inline">
                    (KAP Canlı: {updatedAt})
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E81A0] mt-1 font-medium">
                Sütun başlıklarına tıklayarak artan/azalan sıralayabilir; kapsam dışı şirketlerin net fıkhi/mali gerekçesini inceleyebilirsiniz.
              </p>
            </div>

            {/* BIST XKTUM vs AAOIFI Standart Seçici */}
            <div className="apple-segmented-group shrink-0">
              <button
                type="button"
                onClick={() => setStandard("BIST")}
                className={`apple-segmented-item ${
                  standard === "BIST" ? "active" : ""
                }`}
              >
                BIST Katılım (&lt;%33)
              </button>
              <button
                type="button"
                onClick={() => setStandard("AAOIFI")}
                className={`apple-segmented-item ${
                  standard === "AAOIFI" ? "active" : ""
                }`}
              >
                AAOIFI No.21 (&lt;%30)
              </button>
            </div>
          </div>

          {/* Filters Row: Search, Tabs, Sector Dropdown */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9BB0]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hisse kodu, şirket adı veya sektör ara (Örn: BIMAS, THYAO)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] text-xs font-semibold text-[#182542] placeholder:text-[#8C9BB0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#182542]/20 transition"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition ${
                  statusFilter === "ALL"
                    ? "bg-[#182542] text-white shadow-xs"
                    : "bg-[#F8FAFD] text-[#6E81A0] border border-[#E2E8F0] hover:text-[#182542]"
                }`}
              >
                Tümü ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("COMPLIANT")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  statusFilter === "COMPLIANT"
                    ? "bg-[#0D8B52] text-white shadow-xs"
                    : "bg-[#F8FAFD] text-[#0D8B52] border border-[#E2E8F0] hover:bg-[#E6F8EF]"
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Katılıma Uygun ({compliantCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("NON_COMPLIANT")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  statusFilter === "NON_COMPLIANT"
                    ? "bg-[#C62E26] text-white shadow-xs"
                    : "bg-[#F8FAFD] text-[#C62E26] border border-[#E2E8F0] hover:bg-[#FEE4E2]"
                }`}
              >
                <XCircle size={13} />
                <span>Kapsam Dışı ({nonCompliantCount})</span>
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER: Sortable Columns */}
          <div className="rounded-2xl border border-[#EDF1F6] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EDF1F6] bg-[#F8FAFD] text-[11px] font-black uppercase tracking-wider text-[#6E81A0]">
                    {/* 1. Hisse Kodu */}
                    <th
                      onClick={() => handleSort("ticker")}
                      className="py-3 px-4 cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Hisse Kodu</span>
                        {sortField === "ticker" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 2. Son Fiyat */}
                    <th
                      onClick={() => handleSort("priceTRY")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Son Fiyat</span>
                        {sortField === "priceTRY" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 3. 24s Değişim */}
                    <th
                      onClick={() => handleSort("change24h")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>24s Değişim</span>
                        {sortField === "change24h" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 4. Katılım Durumu & Gerekçe */}
                    <th
                      onClick={() => handleSort("status")}
                      className="py-3 px-4 cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Katılım Durumu &amp; Gerekçe</span>
                        {sortField === "status" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 5. Faizli Borç */}
                    <th
                      onClick={() => handleSort("debtRatioPercent")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Faizli Borç</span>
                        {sortField === "debtRatioPercent" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 6. Faizli Varlık */}
                    <th
                      onClick={() => handleSort("cashRatioPercent")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Faizli Varlık</span>
                        {sortField === "cashRatioPercent" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 7. Arındırma Payı */}
                    <th
                      onClick={() => handleSort("impureIncomePercent")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Arındırma Payı</span>
                        {sortField === "impureIncomePercent" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF1F6] text-xs">
                  {displayedCompanies.map((comp) => {
                    const isCompliant =
                      standard === "BIST"
                        ? comp.bistStatus === "COMPLIANT"
                        : comp.aaoifiStatus === "COMPLIANT";
                    const isPos = !comp.change24h?.startsWith("-");

                    return (
                      <tr
                        key={comp.ticker}
                        onClick={() => router.push(`/companies/${comp.ticker}`)}
                        className="hover:bg-[#F8FAFD] transition cursor-pointer group"
                      >
                        {/* 1. Hisse Kodu */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#182542] text-white flex items-center justify-center font-bold text-xs font-mono shadow-2xs group-hover:bg-[#273869] transition">
                              {comp.ticker.slice(0, 4)}
                            </div>
                            <div>
                              <div className="font-extrabold text-[#182542] group-hover:text-[#273869] transition font-sans">
                                {comp.ticker}
                              </div>
                              <div className="text-[11px] text-[#8C9BB0] line-clamp-1">
                                {comp.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Fiyat */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <PaynoSplitPrice value={comp.priceTRY} className="text-sm" />
                        </td>

                        {/* 3. Değişim */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-0.5 font-mono font-bold text-xs ${
                              isPos ? "text-[#12B76A]" : "text-[#F04438]"
                            }`}
                          >
                            {isPos ? "+" : ""}
                            {comp.change24h}
                          </span>
                        </td>

                        {/* 4. Katılım Durumu & Gerekçe */}
                        <td className="py-3 px-4">
                          {isCompliant ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F8EF] text-[#0D8B52] text-[11px] font-bold">
                              <CheckCircle2 size={12} />
                              <span>Katılıma Uygun</span>
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEE4E2] text-[#D92D20] text-[11px] font-bold">
                                <XCircle size={11} />
                                <span>✕ Kapsam Dışı</span>
                              </span>
                              <div className="text-[10px] text-[#D92D20] font-semibold line-clamp-1">
                                {getNonComplianceReason(comp, standard)}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* 5. Faizli Borç */}
                        <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                          <span
                            className={`font-bold ${
                              comp.debtRatioPercent > (standard === "BIST" ? 33 : 30)
                                ? "text-[#D92D20]"
                                : "text-[#182542]"
                            }`}
                          >
                            %{comp.debtRatioPercent.toFixed(1)}
                          </span>
                        </td>

                        {/* 6. Faizli Varlık */}
                        <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                          <span
                            className={`font-bold ${
                              comp.cashRatioPercent > (standard === "BIST" ? 33 : 30)
                                ? "text-[#D92D20]"
                                : "text-[#182542]"
                            }`}
                          >
                            %{comp.cashRatioPercent.toFixed(1)}
                          </span>
                        </td>

                        {/* 7. Arındırma Payı */}
                        <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                          <span className="font-semibold text-[#6E81A0]">
                            %{comp.impureIncomePercent.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Daha Fazla Göster Butonu */}
            {visibleLimit < sortedCompanies.length && (
              <div className="p-4 text-center border-t border-[#EDF1F6] bg-[#F8FAFD]">
                <button
                  type="button"
                  onClick={() => setVisibleLimit((v) => v + 80)}
                  className="px-6 py-2 rounded-full bg-white hover:bg-[#F3F6FA] text-xs font-bold text-[#182542] border border-[#E2E8F0] shadow-xs transition"
                >
                  Daha Fazla Hisse Yükle (+80 / Toplam {sortedCompanies.length})
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
