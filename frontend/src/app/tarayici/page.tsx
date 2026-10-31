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
  Building2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { CompanySummary } from "@/types/katilim";
import { PaynoShell } from "@/components/PaynoShell";
import { StockLogo } from "@/components/StockLogo";
import { KafifRiskRadarWidget } from "@/components/KafifRiskRadarWidget";
import { AlertTriangle } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLIANT" | "NON_COMPLIANT" | "FAV" | "RADAR">("ALL");
  const [sectorFilter, setSectorFilter] = useState("TÜMÜ");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [visibleLimit, setVisibleLimit] = useState(60);
  const [sortField, setSortField] = useState<SortField>("ticker");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [favorites, setFavorites] = useState<string[]>(["BIMAS", "THYAO", "ASELS", "TUPRS", "FROTO"]);

  const toggleFavorite = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  // Unique sector list
  const sectorList = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.sector) set.add(c.sector);
    });
    return ["TÜMÜ", ...Array.from(set).sort()];
  }, [companies]);

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
    } else if (activeTab === "FAV") {
      list = list.filter((c) => favorites.includes(c.ticker));
    }

    if (sectorFilter !== "TÜMÜ") {
      list = list.filter((c) => c.sector === sectorFilter);
    }

    return list;
  }, [companies, searchQuery, activeTab, sectorFilter, favorites]);

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
      <ChevronUp size={14} className="text-[#182542] dark:text-white" />
    ) : (
      <ChevronDown size={14} className="text-[#182542] dark:text-white" />
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

  return (
    <PaynoShell badge="tarayıcı">
      <div className="space-y-5 sm:space-y-6">
        
        {/* ================================================================= */}
        {/* BAŞLIK VE GÖRÜNÜM KONTROLLERİ                                     */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#182542] dark:text-white">
              Borsa İstanbul Katılım Hisseleri
            </h1>
            <p className="text-xs sm:text-sm text-[#6E81A0] dark:text-[#94A3B8]">
              Diyanet İşleri Başkanlığı ve TKBB standartlarına göre BIST hisselerinin anlık uygunluk denetimi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Görünüm Seçici: Kart Izgarası vs Tablo */}
            <div className="bg-white dark:bg-[#0E1015] rounded-full p-1 border border-slate-200/60 dark:border-white/10 shadow-xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-full transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                }`}
                title="Kart Izgarası Görünümü"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-full transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                }`}
                title="Detaylı Tablo Görünümü"
              >
                <List size={15} />
              </button>
            </div>

            {/* Yenileme Butonu */}
            <button
              type="button"
              onClick={() => refreshNow()}
              disabled={isRefreshing}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 shadow-xs text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white flex items-center justify-center transition"
              title="KAP Bilanço Verilerini Yenile"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#0D8B52]" : ""} />
            </button>

            {/* Portföye Git */}
            <Link
              href="/portfolio?action=add"
              className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-4 sm:px-5 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus size={14} />
              <span>Portföye Ekle</span>
            </Link>
          </div>
        </div>

        {/* ================================================================= */}
        {/* FİLTRE KAPSÜLLERİ, SEKTÖR VE ARAMA ÇUBUĞU                         */}
        {/* ================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Kategori Filtre Kapsülleri */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-xs font-bold"
                  : "bg-white dark:bg-[#0E1015] text-[#646A78] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white border border-slate-200/60 dark:border-white/10"
              }`}
            >
              <span>Tüm Hisseler</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/10 text-[#6E81A0] dark:text-[#94A3B8]"
              }`}>
                {stats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("COMPLIANT")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "COMPLIANT"
                  ? "bg-[#0D8B52] text-white shadow-xs"
                  : "bg-white dark:bg-[#0E1015] text-[#646A78] dark:text-[#94A3B8] hover:text-[#0D8B52] border border-slate-200/60 dark:border-white/10"
              }`}
            >
              <span>✓ Katılıma Uygun</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "COMPLIANT" ? "bg-white/20 text-white" : "bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400"
              }`}>
                {stats.compliant}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NON_COMPLIANT")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "NON_COMPLIANT"
                  ? "bg-[#C62E26] text-white shadow-xs"
                  : "bg-white dark:bg-[#0E1015] text-[#646A78] dark:text-[#94A3B8] hover:text-[#C62E26] border border-slate-200/60 dark:border-white/10"
              }`}
            >
              <span>✕ Katılım Dışı</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "NON_COMPLIANT" ? "bg-white/20 text-white" : "bg-rose-50 dark:bg-rose-950/40 text-[#C62E26] dark:text-rose-400"
              }`}>
                {stats.nonCompliant}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("FAV")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "FAV"
                  ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                  : "bg-white dark:bg-[#0E1015] text-[#646A78] dark:text-[#94A3B8] hover:text-amber-500 border border-slate-200/60 dark:border-white/10"
              }`}
            >
              <span>Favorilerim</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "FAV" ? "bg-white/20 text-white" : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
              }`}>
                {favorites.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("RADAR")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "RADAR"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-white dark:bg-[#0E1015] text-[#646A78] dark:text-[#94A3B8] hover:text-amber-500 border border-slate-200/60 dark:border-white/10"
              }`}
            >
              <AlertTriangle size={12} className={activeTab === "RADAR" ? "text-slate-950" : "text-amber-500"} />
              <span>KAFİF Risk Radarı</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "RADAR" ? "bg-black/20 text-slate-950 font-bold" : "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold"
              }`}>
                Erken Uyarı
              </span>
            </button>
          </div>

          {/* Sektör Seçici & Arama Kutusu */}
          <div className="flex items-center gap-2">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 text-xs font-bold text-[#182542] dark:text-white outline-none shadow-xs max-w-[160px] sm:max-w-[220px] truncate cursor-pointer"
            >
              {sectorList.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === "TÜMÜ" ? "Tüm Sektörler" : sec}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3.5 top-2.5 text-[#6E81A0] dark:text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BIST Hisse Ara (örn: BIMAS, THYAO)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 text-xs text-[#182542] dark:text-white placeholder-[#6E81A0] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#182542] dark:focus:border-blue-400 shadow-xs"
              />
            </div>
          </div>

        </div>

        {/* RADAR MODU: KAFİF Erken Uyarı Risk Radarı */}
        {activeTab === "RADAR" ? (
          <KafifRiskRadarWidget mode="full" />
        ) : (
          <>
            {/* Diğer sekmelerde kompakt erken uyarı bandı */}
            <KafifRiskRadarWidget mode="banner" />

            {/* ================================================================= */}
            {/* GÖRÜNÜM 1: BENTO KART IZGARASI (Gerçek Logolarla!)                */}
            {/* ================================================================= */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {displayedCompanies.map((comp) => {
              const isFav = favorites.includes(comp.ticker);
              const isCompliant = comp.bistStatus === "COMPLIANT";

              return (
                <div
                  key={comp.ticker}
                  onClick={() => router.push(`/companies/${comp.ticker}`)}
                  className="bg-white dark:bg-[#0E1015] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between space-y-3.5 group cursor-pointer relative"
                >
                  {/* Üst: Favori Yıldızı */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(comp.ticker, e)}
                      className="text-slate-300 dark:text-slate-600 hover:text-amber-400 transition"
                      title={isFav ? "Favorilerden Kaldır" : "Favorilere Ekle"}
                    >
                      <Star
                        size={15}
                        className={isFav ? "fill-amber-400 text-amber-400" : ""}
                      />
                    </button>
                  </div>

                  {/* Merkez: Gerçek Şirket Logosu + Kod + Şirket Adı */}
                  <div className="flex flex-col items-center text-center space-y-2">
                    <StockLogo
                      ticker={comp.ticker}
                      name={comp.name}
                      size="xl"
                      className="group-hover:scale-105 transition"
                    />

                    <div className="space-y-0.5">
                      <span className="font-mono font-black text-sm text-[#182542] dark:text-white group-hover:text-[#273869] dark:group-hover:text-blue-400 transition block">
                        {comp.ticker}
                      </span>
                      <h4 className="text-[11px] font-semibold text-[#6E81A0] dark:text-[#94A3B8] truncate max-w-[150px]">
                        {comp.name}
                      </h4>
                    </div>

                    {/* Sektör Rozeti */}
                    <span className="text-[10px] font-medium text-[#6E81A0] dark:text-[#94A3B8] bg-[#F8F9FA] dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-slate-100 dark:border-white/5 truncate max-w-[140px]">
                      {comp.sector || "BIST Katılım"}
                    </span>
                  </div>

                  {/* Alt: Fiyat & Fıkhi Borç Rasyoları */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 text-center space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#6E81A0] dark:text-[#94A3B8]">Fiyat:</span>
                      <span className="font-bold text-[#182542] dark:text-white">{comp.priceTRY}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6E81A0] dark:text-[#94A3B8]">Faizli Borç:</span>
                      <span className={`font-mono font-bold ${
                        comp.debtRatioPercent > 33 ? "text-[#C62E26] dark:text-rose-400" : "text-[#0D8B52] dark:text-emerald-400"
                      }`}>
                        %{comp.debtRatioPercent.toFixed(1)}
                      </span>
                    </div>

                    {/* Fıkhi Uygunluk Rozeti */}
                    <div className="pt-1.5 flex justify-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompliant
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-950/40 text-[#C62E26] dark:text-rose-400"
                      }`}>
                        {isCompliant ? "✓ Katılıma Uygun" : "✕ Katılım Dışı"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* GÖRÜNÜM 2: DETAYLI TABLO GÖRÜNÜMÜ                                 */}
        {/* ================================================================= */}
        {viewMode === "table" && (
          <div className="bg-white dark:bg-[#0E1015] rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] font-bold text-[11px]">
                    <th onClick={() => handleSort("ticker")} className="py-3 px-4 cursor-pointer hover:text-[#182542] dark:hover:text-white">
                      <div className="flex items-center gap-1">
                        <span>Hisse Kodu &amp; Şirket</span>
                        {getSortIcon("ticker")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("priceTRY")} className="py-3 px-4 cursor-pointer hover:text-[#182542] dark:hover:text-white text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Fiyat</span>
                        {getSortIcon("priceTRY")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("change24h")} className="py-3 px-4 cursor-pointer hover:text-[#182542] dark:hover:text-white text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Değişim</span>
                        {getSortIcon("change24h")}
                      </div>
                    </th>
                    <th className="py-3 px-4">Fıkhi Durum</th>
                    <th onClick={() => handleSort("debtRatioPercent")} className="py-3 px-4 cursor-pointer hover:text-[#182542] dark:hover:text-white text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Borç Oranı (&lt;%33)</span>
                        {getSortIcon("debtRatioPercent")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("impureIncomePercent")} className="py-3 px-4 cursor-pointer hover:text-[#182542] dark:hover:text-white text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Arındırma (&lt;%5)</span>
                        {getSortIcon("impureIncomePercent")}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">İncele</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {displayedCompanies.map((comp) => {
                    const isCompliant = comp.bistStatus === "COMPLIANT";
                    return (
                      <tr
                        key={comp.ticker}
                        onClick={() => router.push(`/companies/${comp.ticker}`)}
                        className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <StockLogo ticker={comp.ticker} name={comp.name} size="sm" />
                            <div>
                              <span className="font-bold text-xs text-[#182542] dark:text-white block">{comp.ticker}</span>
                              <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block truncate max-w-[180px]">{comp.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#182542] dark:text-white">
                          {comp.priceTRY}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${
                          String(comp.change24h).startsWith("+") ? "text-[#0D8B52] dark:text-emerald-400" : "text-[#C62E26] dark:text-rose-400"
                        }`}>
                          {comp.change24h}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompliant
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400"
                              : "bg-rose-50 dark:bg-rose-950/40 text-[#C62E26] dark:text-rose-400"
                          }`}>
                            {isCompliant ? "✓ Katılıma Uygun" : "✕ Katılım Dışı"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className={comp.debtRatioPercent > 33 ? "text-[#C62E26] dark:text-rose-400 font-bold" : "text-[#182542] dark:text-white font-bold"}>
                            %{comp.debtRatioPercent.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className={comp.impureIncomePercent > 5 ? "text-[#C62E26] dark:text-rose-400 font-bold" : "text-[#182542] dark:text-white font-bold"}>
                            %{comp.impureIncomePercent.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-[#182542] dark:hover:bg-[#273869] hover:text-white inline-flex items-center justify-center transition">
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

        {/* Daha Fazla Göster Butonu */}
        {visibleLimit < sortedCompanies.length && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setVisibleLimit((v) => v + 60)}
              className="px-6 py-2 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold shadow-xs transition"
            >
              Daha Fazla Göster (+60 / Toplam: {sortedCompanies.length})
            </button>
          </div>
        )}
          </>
        )}

      </div>
    </PaynoShell>
  );
}