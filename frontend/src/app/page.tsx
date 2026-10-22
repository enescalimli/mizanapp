"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Info,
  CreditCard,
  TrendingUp,
  Wallet,
  PiggyBank,
  Scale,
  Sparkles,
  ArrowRightLeft,
  Plus,
  Sliders,
  Building2,
  DollarSign,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { PaynoShell } from "@/components/PaynoShell";
import { useAuth } from "@/lib/auth/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { companies, updatedAt } = useLiveMarketData(45000);

  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [currency, setCurrency] = useState<"TRY" | "USD">("TRY");
  const [monthlyLimit, setMonthlyLimit] = useState<number>(5500);
  const [limitUsed, setLimitUsed] = useState<number>(1400);

  // Quick Transfer / Screener Modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferAmount, setTransferAmount] = useState<string>("100");
  const [selectedContact, setSelectedContact] = useState<{ name: string; tag: string; ticker?: string }>({
    name: "BİM Birleşik Mağazalar",
    tag: "BIMAS",
    ticker: "BIMAS",
  });

  const userDisplayName = useMemo(() => {
    return profile?.full_name || (user?.user_metadata?.full_name as string) || "Code XR";
  }, [profile?.full_name, user?.user_metadata?.full_name]);

  // Balance calculation according to currency
  const formattedBalance = useMemo(() => {
    if (!balanceVisible) return "••••••••";
    if (currency === "USD") return "$102,419.86";
    return "₺842.500,00";
  }, [balanceVisible, currency]);

  // Monthly income chart data
  const chartData = [
    { month: "Oca", profit: 65, loss: 12, label: "₺6.500" },
    { month: "Şub", profit: 45, loss: 8, label: "₺4.500" },
    { month: "Mar", profit: 80, loss: 15, label: "₺8.000" },
    { month: "Nis", profit: 95, loss: 18, label: "₺9.500", active: true },
    { month: "May", profit: 70, loss: 10, label: "₺7.000" },
    { month: "Haz", profit: 85, loss: 14, label: "₺8.500" },
  ];

  // Recent activities list
  const recentActivities = [
    {
      ticker: "BIMAS",
      name: "BİM Birleşik Mağazalar",
      type: "Temettü Tahakkuku",
      amount: "+₺4.850,00",
      date: "Bugün, 14:32",
      status: "Uygun (DİB)",
      compliant: true,
      color: "from-orange-500 to-amber-500",
    },
    {
      ticker: "THYAO",
      name: "Türk Hava Yolları",
      type: "Fıkhi İnceleme & Tarama",
      amount: "İcazetli",
      date: "Dün, 16:45",
      status: "Borç %18.2",
      compliant: true,
      color: "from-blue-600 to-indigo-600",
    },
    {
      ticker: "ASELS",
      name: "Aselsan Elektronik",
      type: "Fıkhi Arındırma Kesintisi",
      amount: "-₺142,50",
      date: "20 Nis",
      status: "%0.85 Arındırma",
      compliant: true,
      color: "from-purple-600 to-indigo-700",
    },
    {
      ticker: "KCHOL",
      name: "Koç Holding",
      type: "Katılım Dışı Uyarısı",
      amount: "Uygunsuz",
      date: "19 Nis",
      status: "Finans/Faiz > %5",
      compliant: false,
      color: "from-rose-500 to-red-600",
    },
    {
      ticker: "TUPRS",
      name: "Tüpraş Petrol Rafinerileri",
      type: "KAP Bilanço Güncellemesi",
      amount: "+%1.4 Kâr Payı",
      date: "18 Nis",
      status: "Uygun (DİB)",
      compliant: true,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const quickContacts = [
    { name: "BİM Mağazalar", tag: "BIMAS", ticker: "BIMAS", bg: "bg-orange-500" },
    { name: "THY Havacılık", tag: "THYAO", ticker: "THYAO", bg: "bg-blue-600" },
    { name: "Aselsan Savunma", tag: "ASELS", ticker: "ASELS", bg: "bg-purple-600" },
    { name: "Ford Otomotiv", tag: "FROTO", ticker: "FROTO", bg: "bg-amber-500" },
    { name: "Tüpraş Rafineri", tag: "TUPRS", ticker: "TUPRS", bg: "bg-emerald-600" },
  ];

  return (
    <PaynoShell badge="Dashboard V14">
      <div className="space-y-6">
        
        {/* ================================================================= */}
        {/* HERO GREETING BANNER (V14 Style)                                  */}
        {/* ================================================================= */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14151A]">
            Good morning, {userDisplayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#8C93A3]">
            Stay on top of your halal portfolio, monitor compliance, and track purification.
          </p>
        </div>

        {/* ================================================================= */}
        {/* ROW 1: 3 BENTO COLUMNS (V14 Overview)                             */}
        {/* 1. Total Balance | 2. 2x2 Bento Metrics | 3. Total Income Chart   */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* =============================================================== */}
          {/* COLUMN 1: TOTAL BALANCE CARD (lg:col-span-4)                     */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
            
            {/* Top Row: Title + Currency Selector Pill */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8C93A3]">
                  Total Balance
                </span>
                
                {/* Currency Switcher Pill */}
                <button
                  type="button"
                  onClick={() => setCurrency((c) => (c === "TRY" ? "USD" : "TRY"))}
                  className="bg-[#F4F5F7] hover:bg-[#E9EBEF] text-[#14151A] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>{currency === "USD" ? "🇺🇸 USD" : "🇹🇷 TRY"}</span>
                  <ChevronDown size={12} className="text-[#8C93A3]" />
                </button>
              </div>

              {/* Amount + Visibility Toggle */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#14151A] font-mono tracking-tight">
                  {formattedBalance}
                </span>
                <button
                  type="button"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-[#8C93A3] hover:text-[#14151A] transition"
                  title="Bakiyeyi Gizle / Göster"
                >
                  {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Subtitle Trend Badge */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF9F1] text-[#10B981] text-[11px] font-semibold">
                <span>▲ +5% than last month</span>
              </div>
            </div>

            {/* Action Buttons: ⇄ Transfer & + Request (V14 Pill Buttons) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(true)}
                className="rounded-full bg-[#15161A] hover:bg-[#2A2B33] text-white py-2.5 px-4 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
              >
                <ArrowRightLeft size={13} />
                <span>Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/purification")}
                className="rounded-full bg-[#F4F5F7] hover:bg-[#EAECEF] text-[#14151A] py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Plus size={14} />
                <span>Request</span>
              </button>
            </div>

            {/* Wallets Section (V14 Wallets sub-cards) */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#8C93A3]">
                <span className="font-semibold">Wallets</span>
                <span className="text-[11px]">Total 2 wallets</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Wallet 1 */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#15161A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ₺
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#14151A] truncate">
                      Katılım Portföy
                    </div>
                    <div className="text-[10px] text-[#8C93A3] font-mono">
                      ₺710.000
                    </div>
                  </div>
                </div>

                {/* Wallet 2 */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    S
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#14151A] truncate">
                      Sukuk &amp; Fon
                    </div>
                    <div className="text-[10px] text-[#8C93A3] font-mono">
                      ₺132.500
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* =============================================================== */}
          {/* COLUMN 2: 2x2 BENTO METRIC CARDS (lg:col-span-4)                 */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            
            {/* CARD 1: TOTAL EARNINGS (With iconic V14 top-left corner fill) */}
            <div className="relative overflow-hidden bg-white rounded-[24px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[160px] group hover:border-slate-300 transition">
              {/* V14 Iconic Quarter-Circle Top-Left Accent Fill */}
              <div className="absolute -top-1 -left-1 w-24 h-24 rounded-br-[42px] bg-[#FF5B26] p-3 text-white flex flex-col justify-start pointer-events-none shadow-sm">
                <span className="text-[11px] font-bold leading-tight">
                  Total<br />Earnings
                </span>
              </div>

              {/* Empty placeholder to push content down */}
              <div className="h-10" />

              {/* Amount and Subtitle */}
              <div className="space-y-1">
                <div className="text-2xl font-black text-[#14151A] font-mono tracking-tight">
                  ₺118.420
                </div>
                <div className="text-[11px] font-semibold text-[#10B981] flex items-center gap-0.5">
                  <span>▲ +18.4%</span>
                  <span className="text-[#8C93A3] font-normal ml-1">total profit</span>
                </div>
              </div>
            </div>

            {/* CARD 2: TOTAL SPENDING / ARINDIRMA YÜKÜ */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[160px] group hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8C93A3]">
                  Total Spending
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[#8C93A3]">
                  <Scale size={12} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-black text-[#14151A] font-mono tracking-tight">
                  ₺1.240
                </div>
                <div className="text-[11px] font-semibold text-[#FF5B26] flex items-center gap-0.5">
                  <span>▲ +5%</span>
                  <span className="text-[#8C93A3] font-normal ml-1">This month</span>
                </div>
              </div>
            </div>

            {/* CARD 3: TOTAL INCOME / TEMETTÜ */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[160px] group hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8C93A3]">
                  Total Income
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[#8C93A3]">
                  <PiggyBank size={12} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-black text-[#14151A] font-mono tracking-tight">
                  ₺34.680
                </div>
                <div className="text-[11px] font-semibold text-[#10B981] flex items-center gap-0.5">
                  <span>▲ +8%</span>
                  <span className="text-[#8C93A3] font-normal ml-1">This month</span>
                </div>
              </div>
            </div>

            {/* CARD 4: TOTAL REVENUE / KATILIM ENDEKSİ UYUMU */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[160px] group hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8C93A3]">
                  Total Revenue
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[#8C93A3]">
                  <ShieldCheck size={12} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-black text-[#14151A] font-mono tracking-tight">
                  %100 Helal
                </div>
                <div className="text-[11px] font-semibold text-[#10B981] flex items-center gap-0.5">
                  <span>▲ 24/24 Kriter</span>
                  <span className="text-[#8C93A3] font-normal ml-1">DİB Onay</span>
                </div>
              </div>
            </div>

          </div>

          {/* =============================================================== */}
          {/* COLUMN 3: TOTAL INCOME CHART CARD (lg:col-span-4)                */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
            
            {/* Header + Subtitle + Legend */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#14151A]">
                    Total Income
                  </h3>
                  <p className="text-[11px] text-[#8C93A3]">
                    View your income in a certain period of time
                  </p>
                </div>

                {/* Legend Chips */}
                <div className="flex items-center gap-3 text-[10px] font-semibold text-[#8C93A3]">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#15161A]" />
                    <span>Profit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-200" />
                    <span>Loss</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Bar Chart Graphic */}
            <div className="pt-4 pb-2">
              <div className="flex items-end justify-between h-36 gap-2 sm:gap-3 px-2">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                    
                    {/* Tooltip on active */}
                    {item.active && (
                      <span className="text-[10px] font-bold font-mono bg-[#15161A] text-white px-1.5 py-0.5 rounded-md shadow-xs animate-pulse">
                        {item.label}
                      </span>
                    )}

                    {/* Bar Pill Container */}
                    <div className="w-full max-w-[28px] h-full flex flex-col justify-end items-center">
                      <div
                        className={`w-full rounded-full transition-all duration-300 ${
                          item.active
                            ? "bg-[#15161A] shadow-xs"
                            : "bg-[#EAECEF] group-hover:bg-slate-300"
                        }`}
                        style={{ height: `${item.profit}%` }}
                      />
                    </div>

                    {/* Month Label */}
                    <span className={`text-[11px] font-semibold ${
                      item.active ? "text-[#14151A] font-bold" : "text-[#8C93A3]"
                    }`}>
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Insight Pill */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[#8C93A3] text-[11px]">Nisan kâr payı zirve yaptı</span>
              <Link
                href="/portfolio"
                className="font-bold text-[#14151A] hover:text-[#FF5B26] transition flex items-center gap-1 text-[11px]"
              >
                <span>Detaylı Rapor</span>
                <ChevronRight size={12} />
              </Link>
            </div>

          </div>

        </div>

        {/* ================================================================= */}
        {/* ROW 2: BOTTOM BENTO (Monthly Spending Limit & Recent Activities)  */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* =============================================================== */}
          {/* BOTTOM LEFT: MONTHLY SPENDING LIMIT CARD (lg:col-span-5)         */}
          {/* =============================================================== */}
          <div className="lg:col-span-5 bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#14151A]">
                  Monthly Spending Limit
                </h3>
                <p className="text-[11px] text-[#8C93A3]">
                  Aylık fıkhi arındırma &amp; risk limit takibi
                </p>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-[#EBF9F1] text-[#10B981] text-[10px] font-bold">
                Active Limit
              </div>
            </div>

            {/* Amount display */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-[#8C93A3]">
                Tanımlı Tavan Limit
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#14151A] font-mono">
                ${monthlyLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* V14 Signature Orange Slider Bar with Circle Thumb */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={500}
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#FF5B26]"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#8C93A3]">
                <span>$1,000</span>
                <span>$20,000</span>
              </div>
            </div>

            {/* Spending progress bar */}
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#FF5B26] font-mono font-bold">
                  ${limitUsed.toLocaleString("en-US", { minimumFractionDigits: 2 })} used
                </span>
                <span className="text-[#8C93A3] text-[11px]">
                  {Math.round((limitUsed / monthlyLimit) * 100)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF5B26] to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (limitUsed / monthlyLimit) * 100)}%` }}
                />
              </div>
            </div>

            {/* Controls Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#8C93A3] text-[11px]">Otomatik arındırma limiti kilidi</span>
              <div className="w-10 h-6 bg-[#FF5B26] rounded-full p-1 cursor-pointer flex items-center justify-end shadow-xs">
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>

          </div>

          {/* =============================================================== */}
          {/* BOTTOM RIGHT: RECENT ACTIVITIES CARD (lg:col-span-7)             */}
          {/* =============================================================== */}
          <div className="lg:col-span-7 bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
            
            {/* Header + View All */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#14151A]">
                  Recent Activities
                </h3>
                <p className="text-[11px] text-[#8C93A3]">
                  Son BIST katılım işlemleri, arındırma ve KAP bildirimleri
                </p>
              </div>

              <Link
                href="/tarayici"
                className="text-xs font-semibold text-[#8C93A3] hover:text-[#14151A] transition flex items-center gap-1"
              >
                <span>See all</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* Activities Rows */}
            <div className="space-y-2.5 divide-y divide-slate-100">
              {recentActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group"
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${act.color} text-white flex items-center justify-center text-xs font-bold font-mono shrink-0 shadow-xs group-hover:scale-105 transition`}>
                      {act.ticker.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/companies/${act.ticker}`}
                          className="text-xs font-bold text-[#14151A] hover:text-[#FF5B26] transition truncate"
                        >
                          {act.ticker}
                        </Link>
                        <span className="text-[10px] text-[#8C93A3] truncate hidden sm:inline">
                          &bull; {act.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8C93A3] flex items-center gap-1.5">
                        <span>{act.type}</span>
                        <span>&bull;</span>
                        <span className="text-[10px]">{act.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount + Status Pill */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-[#14151A]">
                      {act.amount}
                    </div>
                    <div className={`text-[10px] font-semibold mt-0.5 ${
                      act.compliant ? "text-[#10B981]" : "text-[#E03131]"
                    }`}>
                      {act.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Fast Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-[#8C93A3]">
                Canlı BIST Verisi: {updatedAt ? new Date(updatedAt).toLocaleTimeString("tr-TR") : "Güncel"}
              </span>

              <Link
                href="/tarayici"
                className="px-4 py-1.5 rounded-full bg-[#15161A] hover:bg-[#2A2B33] text-white text-xs font-semibold shadow-xs transition"
              >
                626 Hisse Tara &rarr;
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* =================================================================== */}
      {/* QUICK TRANSFER / TRANSACTIONS MODAL (Replicating Frame 03)         */}
      {/* =================================================================== */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14151A]">
                  Quick Transfer &amp; Screen
                </h3>
                <p className="text-xs text-[#8C93A3]">
                  Pick a favourite, choose an amount, done.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[#14151A] flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Quick Contacts Avatar Row (From Frame 03) */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#8C93A3]">
                Hızlı Katılım Şirketleri
              </span>
              <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-none">
                {quickContacts.map((contact) => (
                  <button
                    key={contact.tag}
                    type="button"
                    onClick={() => setSelectedContact(contact)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                  >
                    <div className={`w-12 h-12 rounded-full ${contact.bg} text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs group-hover:scale-105 transition ring-offset-2 ${
                      selectedContact.tag === contact.tag ? "ring-2 ring-[#15161A]" : ""
                    }`}>
                      {contact.tag.slice(0, 2)}
                    </div>
                    <span className="text-[11px] font-semibold text-[#14151A] truncate max-w-[60px]">
                      {contact.tag}
                    </span>
                  </button>
                ))}

                {/* + New Button */}
                <button
                  type="button"
                  onClick={() => router.push("/tarayici")}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 hover:border-slate-500 text-slate-400 flex items-center justify-center text-lg font-light transition">
                    +
                  </div>
                  <span className="text-[11px] font-semibold text-[#8C93A3]">
                    New
                  </span>
                </button>
              </div>
            </div>

            {/* Transaction Box (From Frame 03) */}
            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-100 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold font-mono">
                  {selectedContact.tag.slice(0, 2)}
                </div>
                <div>
                  <div className="text-[10px] text-[#8C93A3]">Sending to / İnceleme</div>
                  <div className="text-xs font-bold text-[#14151A]">{selectedContact.name} ({selectedContact.tag})</div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black text-[#14151A] font-mono">₺</span>
                  <input
                    type="text"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    className="text-xl font-black text-[#14151A] font-mono bg-transparent outline-none w-32"
                  />
                </div>
                <span className="text-xs font-bold text-[#8C93A3]">TRY</span>
              </div>

              {/* Amount Chips */}
              <div className="flex items-center gap-2">
                {["50", "100", "250", "500", "1000"].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setTransferAmount(chip)}
                    className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition ${
                      transferAmount === chip
                        ? "bg-[#15161A] text-white"
                        : "bg-white text-[#14151A] border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    ₺{chip}
                  </button>
                ))}
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => {
                  setIsTransferModalOpen(false);
                  router.push(`/companies/${selectedContact.ticker}`);
                }}
                className="w-full py-3 rounded-full bg-[#15161A] hover:bg-[#2A2B33] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>Fıkhi Raporu Aç (₺{transferAmount})</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}
    </PaynoShell>
  );
}