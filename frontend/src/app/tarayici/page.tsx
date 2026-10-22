"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  Scale,
  Star,
  LayoutGrid,
  List,
  Plus,
  Send,
  Building2,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { CompanySummary } from "@/types/katilim";
import { PaynoShell } from "@/components/PaynoShell";

type SortField =
  | "ticker"
  | "name"
  | "priceTRY"
  | "change24h"
  | "status"
  | "debtRatioPercent"
  | "cashRatioPercent"
  | "impureIncomePercent";

type SortDirection = "asc" | "desc";

export default function TarayiciPage() {
  const router = useRouter();
  const {
    companies,
    updatedAt,
    isRefreshing,
    refreshNow,
  } = useLiveMarketData(30000);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLIANT" | "NON_COMPLIANT" | "KATILIM100">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [visibleLimit, setVisibleLimit] = useState(60);
  const [sortField, setSortField] = useState<SortField>("ticker");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [favorites, setFavorites] = useState<string[]>(["BIMAS", "THYAO", "ASELS", "TUPRS"]);

  // Quick transfer / simulation box state (From Frame 03)
  const [selectedQuickStock, setSelectedQuickStock] = useState<string>("BIMAS");
  const [quickAmount, setQuickAmount] = useState<string>("100");

  const quickFavoritesList = [
    { ticker: "BIMAS", name: "BİM Mağazalar", initials: "AK", color: "bg-[#FF5B26]" },
    { ticker: "THYAO", name: "Türk Hava Yolları", initials: "RA", color: "bg-[#2563EB]" },
    { ticker: "ASELS", name: "Aselsan", initials: "PS", color: "bg-[#7C3AED]" },
    { ticker: "FROTO", name: "Ford Otomotiv", initials: "TH", color: "bg-[#D97706]" },
    { ticker: "TUPRS", name: "Tüpraş", initials: "GL", color: "bg-[#059669]" },
  ];

  const toggleFavorite = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  // Filtering
  const filteredCompanies = useMemo(() => {
    let list = [...companies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.ticker.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q)
      );
    }

    if (activeTab === "COMPLIANT") {
      list = list.filter((c) => c.bistStatus === "COMPLIANT");
    } else if (activeTab === "NON_COMPLIANT") {
      list = list.filter((c) => c.bistStatus === "NON_COMPLIANT");
    } else if (activeTab === "KATILIM100") {
      list = list.filter((c) => c.bistStatus === "COMPLIANT").slice(0, 100);
    }

    return list;
  }, [companies, searchQuery, activeTab]);

  // Sorting
  const sortedCompanies = useMemo(() => {
    const list = [...filteredCompanies];
    list.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (sortField === "status") {
        valA = a.bistStatus;
        valB = b.bistStatus;
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
  }, [filteredCompanies, sortField, sortDirection]);

  const displayedCompanies = useMemo(
    () => sortedCompanies.slice(0, visibleLimit),
    [sortedCompanies, visibleLimit]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-[#8C9BB0]" />;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="text-[#14151A]" />
    ) : (
      <ChevronDown size={14} className="text-[#14151A]" />
    );
  };

  const stats = useMemo(() => {
    const total = companies.length;
    const compliant = companies.filter((c) => c.bistStatus === "COMPLIANT").length;
    const nonCompliant = total - compliant;
    return {
      total,
      compliant,
      nonCompliant,
    };
  }, [companies]);

  // Color generator for stock cards
  const getStockAvatarColor = (ticker: string) => {
    const colors = [
      "from-[#FF5B26] to-[#FF8C66]",
      "from-[#2563EB] to-[#60A5FA]",
      "from-[#7C3AED] to-[#A78BFA]",
      "from-[#E11D48] to-[#FB7185]",
      "from-[#059669] to-[#34D399]",
      "from-[#D97706] to-[#FBBF24]",
    ];
    let hash = 0;
    for (let i = 0; i < ticker.length; i++) {
      hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <PaynoShell badge="tarayıcı">
      <div className="space-y-6">
        
        {/* ================================================================= */}
        {/* HEADER (Replicating Frame 03: Contacts / Tarayıcı Header)         */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14151A]">
              Contacts &amp; Hisseler
            </h1>
            <p className="text-xs sm:text-sm text-[#8C93A3]">
              The companies and assets in Borsa İstanbul, one tap away. (626 BIST Katılım)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle: Grid vs Table */}
            <div className="bg-white rounded-full p-1 border border-slate-200/60 shadow-xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-full transition ${
                  viewMode === "grid"
                    ? "bg-[#15161A] text-white"
                    : "text-[#8C93A3] hover:text-[#14151A]"
                }`}
                title="Kart Izgarası"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-full transition ${
                  viewMode === "table"
                    ? "bg-[#15161A] text-white"
                    : "text-[#8C93A3] hover:text-[#14151A]"
                }`}
                title="Detaylı Tablo"
              >
                <List size={15} />
              </button>
            </div>

            {/* Refresh Live Data */}
            <button
              type="button"
              onClick={() => refreshNow()}
              disabled={isRefreshing}
              className="w-8 h-8 rounded-full bg-white border border-slate-200/60 shadow-xs text-[#8C93A3] hover:text-[#14151A] flex items-center justify-center transition"
              title="KAP Bilanço Verilerini Yenile"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#FF5B26]" : ""} />
            </button>

            {/* Add Contact / Portföye Ekle Pill Button */}
            <Link
              href="/portfolio"
              className="rounded-full bg-[#15161A] hover:bg-[#2A2B33] text-white px-4 sm:px-5 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus size={14} />
              <span>Add contact</span>
            </Link>
          </div>
        </div>

        {/* ================================================================= */}
        {/* QUICK TRANSFER / SIMULATION PANEL (From Frame 03)                 */}
        {/* ================================================================= */}
        <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Sol Kolon: Quick Transfer Avatars (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[#14151A]">
                Quick transfer
              </h3>
              <p className="text-[11px] text-[#8C93A3]">
                Pick a favourite, choose an amount, done.
              </p>
            </div>

            {/* Horizontal avatar list with New button */}
            <div className="flex items-center gap-4 overflow-x-auto py-2 scrollbar-none">
              {quickFavoritesList.map((item) => (
                <button
                  key={item.ticker}
                  type="button"
                  onClick={() => setSelectedQuickStock(item.ticker)}
                  className="flex flex-col items-center gap-1.5 group shrink-0"
                >
                  <div className={`w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs transition group-hover:scale-105 ${
                    selectedQuickStock === item.ticker ? "ring-2 ring-offset-2 ring-[#15161A]" : ""
                  }`}>
                    {item.initials}
                  </div>
                  <span className="text-[11px] font-semibold text-[#14151A] truncate max-w-[64px]">
                    {item.ticker}
                  </span>
                </button>
              ))}

              {/* + New Button (From Frame 03) */}
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className="flex flex-col items-center gap-1.5 group shrink-0"
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 hover:border-slate-400 text-[#8C93A3] flex items-center justify-center text-lg font-light transition">
                  +
                </div>
                <span className="text-[11px] font-semibold text-[#8C93A3]">
                  New
                </span>
              </button>
            </div>
          </div>

          {/* Sağ Kolon: Quick Amount Box (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-[#F8F9FA] rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#FF5B26] text-white flex items-center justify-center font-bold text-[10px] font-mono">
                {selectedQuickStock.slice(0, 2)}
              </div>
              <div className="text-xs">
                <span className="text-[#8C93A3] text-[10px] block">Sending to</span>
                <span className="font-bold text-[#14151A]">{selectedQuickStock} Katılım İncelemesi</span>
              </div>
            </div>

            {/* Input field */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-lg font-black text-[#14151A] font-mono">₺</span>
                <input
                  type="text"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  className="text-lg font-black text-[#14151A] font-mono bg-transparent outline-none w-24"
                />
              </div>
              <span className="text-xs font-bold text-[#8C93A3]">USD / TRY</span>
            </div>

            {/* Chips */}
            <div className="flex items-center gap-2">
              {["50", "100", "250", "500"].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQuickAmount(amt)}
                  className={`flex-1 py-1 rounded-full text-xs font-semibold transition ${
                    quickAmount === amt
                      ? "bg-[#15161A] text-white shadow-xs"
                      : "bg-white text-[#14151A] border border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => router.push(`/companies/${selectedQuickStock}`)}
              className="w-full py-2.5 rounded-full bg-[#15161A] hover:bg-[#2A2B33] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <Send size={12} />
              <span>Send ${quickAmount}.00</span>
            </button>
          </div>

        </div>

        {/* ================================================================= */}
        {/* FILTER CATEGORY PILLS & SEARCH (From Frame 03)                    */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Category Filter Pills (All 10, Favourites 4, Businesses 4) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-[#15161A] text-white shadow-xs"
                  : "bg-white text-[#646A78] hover:text-[#15161A] border border-slate-200/60"
              }`}
            >
              <span>All</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 text-[#8C93A3]"
              }`}>
                {stats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("COMPLIANT")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "COMPLIANT"
                  ? "bg-[#15161A] text-white shadow-xs"
                  : "bg-white text-[#646A78] hover:text-[#15161A] border border-slate-200/60"
              }`}
            >
              <span>Katılıma Uygun</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "COMPLIANT" ? "bg-white/20 text-white" : "bg-emerald-50 text-[#10B981]"
              }`}>
                {stats.compliant}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NON_COMPLIANT")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "NON_COMPLIANT"
                  ? "bg-[#15161A] text-white shadow-xs"
                  : "bg-white text-[#646A78] hover:text-[#15161A] border border-slate-200/60"
              }`}
            >
              <span>Katılım Dışı</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "NON_COMPLIANT" ? "bg-white/20 text-white" : "bg-rose-50 text-[#E03131]"
              }`}>
                {stats.nonCompliant}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("KATILIM100")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "KATILIM100"
                  ? "bg-[#15161A] text-white shadow-xs"
                  : "bg-white text-[#646A78] hover:text-[#15161A] border border-slate-200/60"
              }`}
            >
              <span>Katılım 100</span>
            </button>
          </div>

          {/* Search Box (Search contacts) */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-3 text-[#8C93A3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-slate-200/60 text-xs text-[#14151A] placeholder-[#8C93A3] focus:outline-none focus:border-[#15161A] shadow-xs"
            />
          </div>

        </div>

        {/* ================================================================= */}
        {/* VIEW 1: CONTACT CARDS GRID (Exact match to Frame 03!)             */}
        {/* ================================================================= */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayedCompanies.map((comp) => {
              const isFav = favorites.includes(comp.ticker);
              const isCompliant = comp.bistStatus === "COMPLIANT";

              return (
                <div
                  key={comp.ticker}
                  onClick={() => router.push(`/companies/${comp.ticker}`)}
                  className="bg-white rounded-[24px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group cursor-pointer relative"
                >
                  {/* Top: Star Favorite Icon */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(comp.ticker, e)}
                      className="text-slate-300 hover:text-amber-400 transition"
                      title={isFav ? "Favorilerden Kaldır" : "Favorilere Ekle"}
                    >
                      <Star
                        size={15}
                        className={isFav ? "fill-amber-400 text-amber-400" : ""}
                      />
                    </button>
                  </div>

                  {/* Center: Large Avatar Circle + Name + Handle */}
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${getStockAvatarColor(comp.ticker)} text-white flex items-center justify-center text-sm font-bold font-mono shadow-sm group-hover:scale-105 transition`}>
                      {comp.ticker.slice(0, 2)}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[#14151A] group-hover:text-[#FF5B26] transition truncate max-w-[150px]">
                        {comp.name}
                      </h4>
                      <p className="text-[11px] font-mono text-[#8C93A3]">
                        @{comp.ticker.toLowerCase()}
                      </p>
                    </div>

                    {/* Sector / Type Pill */}
                    <span className="text-[10px] font-semibold text-[#8C93A3] bg-[#F8F9FA] px-2.5 py-0.5 rounded-full border border-slate-100 truncate max-w-[140px]">
                      {comp.sector || "BIST Katılım"}
                    </span>
                  </div>

                  {/* Bottom: Ratios & Price Details */}
                  <div className="pt-3 border-t border-slate-100 text-center space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#8C93A3]">Fiyat:</span>
                      <span className="font-bold text-[#14151A]">{comp.priceTRY}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8C93A3]">Faizli Borç:</span>
                      <span className={`font-mono font-bold ${
                        comp.debtRatioPercent > 33 ? "text-[#E03131]" : "text-[#10B981]"
                      }`}>
                        %{comp.debtRatioPercent.toFixed(1)}
                      </span>
                    </div>

                    {/* Compliance Pill */}
                    <div className="pt-1.5 flex justify-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompliant
                          ? "bg-[#EBF9F1] text-[#10B981]"
                          : "bg-[#FFF0F0] text-[#E03131]"
                      }`}>
                        {isCompliant ? "✓ Katılıma Uygun" : "✕ Kapsam Dışı"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: DETAILED TABLE VIEW                                       */}
        {/* ================================================================= */}
        {viewMode === "table" && (
          <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F8F9FA] text-[#8C93A3] font-semibold text-[11px]">
                    <th onClick={() => handleSort("ticker")} className="py-3 px-4 cursor-pointer hover:text-[#14151A]">
                      <div className="flex items-center gap-1">
                        <span>Hisse Kodu &amp; Şirket</span>
                        {getSortIcon("ticker")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("priceTRY")} className="py-3 px-4 cursor-pointer hover:text-[#14151A] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Fiyat</span>
                        {getSortIcon("priceTRY")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("change24h")} className="py-3 px-4 cursor-pointer hover:text-[#14151A] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Değişim</span>
                        {getSortIcon("change24h")}
                      </div>
                    </th>
                    <th className="py-3 px-4">Fıkhi Durum</th>
                    <th onClick={() => handleSort("debtRatioPercent")} className="py-3 px-4 cursor-pointer hover:text-[#14151A] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Borç Oranı (&lt;%33)</span>
                        {getSortIcon("debtRatioPercent")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("impureIncomePercent")} className="py-3 px-4 cursor-pointer hover:text-[#14151A] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Arındırma (&lt;%5)</span>
                        {getSortIcon("impureIncomePercent")}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">İncele</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedCompanies.map((comp) => {
                    const isCompliant = comp.bistStatus === "COMPLIANT";
                    return (
                      <tr
                        key={comp.ticker}
                        onClick={() => router.push(`/companies/${comp.ticker}`)}
                        className="hover:bg-slate-50/70 transition cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#15161A] text-white flex items-center justify-center font-mono font-bold text-xs">
                              {comp.ticker.slice(0, 2)}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-[#14151A] block">{comp.ticker}</span>
                              <span className="text-[10px] text-[#8C93A3] block truncate max-w-[180px]">{comp.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#14151A]">
                          {comp.priceTRY}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${
                          String(comp.change24h).startsWith("+") ? "text-[#10B981]" : "text-[#E03131]"
                        }`}>
                          {comp.change24h}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompliant ? "bg-[#EBF9F1] text-[#10B981]" : "bg-[#FFF0F0] text-[#E03131]"
                          }`}>
                            {isCompliant ? "✓ Katılıma Uygun" : "✕ Kapsam Dışı"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className={comp.debtRatioPercent > 33 ? "text-[#E03131] font-bold" : "text-[#14151A]"}>
                            %{comp.debtRatioPercent.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className={comp.impureIncomePercent > 5 ? "text-[#E03131] font-bold" : "text-[#14151A]"}>
                            %{comp.impureIncomePercent.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-[#15161A] hover:text-white inline-flex items-center justify-center transition">
                            <ArrowUpRight size={12} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {visibleLimit < sortedCompanies.length && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setVisibleLimit((v) => v + 60)}
              className="px-6 py-2 rounded-full bg-[#15161A] hover:bg-[#2A2B33] text-white text-xs font-semibold shadow-xs transition"
            >
              Daha Fazla Göster (+60 / Toplam: {sortedCompanies.length})
            </button>
          </div>
        )}

      </div>
    </PaynoShell>
  );
}