"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers,
  Scale,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { CompanySummary } from "@/types/katilim";
import { LeftDockSidebar } from "@/components/LeftDockSidebar";
import { NotificationPopover } from "@/components/NotificationPopover";
import { useAuth } from "@/lib/auth/AuthContext";

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
  const { user, profile } = useAuth();
  const {
    companies,
    updatedAt,
    isRefreshing,
    refreshNow,
  } = useLiveMarketData(30000);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLIANT" | "NON_COMPLIANT">("ALL");
  const [sectorFilter, setSectorFilter] = useState("TÜMÜ");
  const [visibleLimit, setVisibleLimit] = useState(80);
  const [sortField, setSortField] = useState<SortField>("ticker");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const userInitials = useMemo(() => {
    const name = profile?.full_name || (user?.user_metadata?.full_name as string) || "Mustafa Çalımlı";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [profile?.full_name, user?.user_metadata?.full_name]);

  // Unique sectors
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

    if (statusFilter === "COMPLIANT") {
      list = list.filter((c) => c.bistStatus === "COMPLIANT");
    } else if (statusFilter === "NON_COMPLIANT") {
      list = list.filter((c) => c.bistStatus === "NON_COMPLIANT");
    }

    if (sectorFilter !== "TÜMÜ") {
      list = list.filter((c) => c.sector === sectorFilter);
    }

    return list;
  }, [companies, searchQuery, statusFilter, sectorFilter]);

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
      <ChevronUp size={14} className="text-[#182542]" />
    ) : (
      <ChevronDown size={14} className="text-[#182542]" />
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
      ratio: total > 0 ? ((compliant / total) * 100).toFixed(1) : "0",
    };
  }, [companies]);

  const getComplianceReason = (comp: CompanySummary) => {
    const isComp = comp.bistStatus === "COMPLIANT";
    if (isComp) {
      return "BIST Katılım Kriterlerine Uygundur (Finansal rasyolar eşik altındadır).";
    }
    const sector = (comp.sector || "").toLowerCase();
    if (sector.includes("banka")) return "Ana Faaliyet: Konvansiyonel faizli bankacılık ve mevduat.";
    if (sector.includes("sigorta")) return "Ana Faaliyet: Konvansiyonel sigortacılık primi faizlendirimi.";
    if (sector.includes("alkol") || sector.includes("bira")) return "Ana Faaliyet: Alkollü içecek üretimi / satışı.";
    if (comp.debtRatioPercent > 33.0) {
      return `Faizli Borç Aşımı: %${comp.debtRatioPercent.toFixed(1)} (Eşik: %33,0 — Fark: +%${(comp.debtRatioPercent - 33.0).toFixed(1)})`;
    }
    if (comp.cashRatioPercent > 33.0) {
      return `Faizli Menkul / Nakit Aşımı: %${comp.cashRatioPercent.toFixed(1)} (Eşik: %33,0)`;
    }
    return "Fıkhi finansal rasyo eşikleri aşılmıştır.";
  };

  return (
    <div className="min-h-screen bg-[#EBEEF2] text-[#182542] selection:bg-[#E6F8EF] selection:text-[#0D8B52] relative">
      {/* Background Aura */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-r from-transparent via-[#87A8CD]/20 to-[#476B9B]/15 pointer-events-none blur-3xl -z-0" />

      {/* Fixed Left Vertical Dock */}
      <LeftDockSidebar />

      {/* Main Responsive Body Container */}
      <div className="relative z-10 md:pl-20 lg:pl-28 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Top Header Floating Glass Bar */}
        <header className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 p-4 sm:px-8 sm:py-5 shadow-[0_8px_30px_rgba(24,37,66,0.04)] flex items-center justify-between gap-4">
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
                tarayıcı
              </span>
            </div>
          </Link>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-[#182542]">
            <span>626 BIST Şirketi</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-bold">{stats.compliant} Uygun</span>
            <span>&bull;</span>
            <span className="text-rose-700 font-bold">{stats.nonCompliant} Kapsam Dışı</span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refreshNow()}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-xs font-bold text-[#182542] flex items-center gap-1.5 shadow-2xs transition active:scale-95"
              title="KAP ve BIST Verilerini Yenile"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
              <span className="hidden sm:inline">{isRefreshing ? "Yenileniyor..." : "Piyasa Canlı"}</span>
            </button>

            <NotificationPopover />

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

        {/* Screener Controls Frosted Panel */}
        <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/85 p-5 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#182542] tracking-tight">
                Borsa İstanbul Katılım Hisseleri
              </h1>
              <p className="text-xs text-[#6E81A0] mt-1 font-medium">
                Diyanet İşleri Başkanlığı ve TKBB Fıkhi Standartlarında 626 BIST hissesinin kuruşu kuruşuna uygunluk denetimi.
              </p>
            </div>

            {/* Resmi Fıkhi Standart Rozeti */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs shrink-0 self-start md:self-auto text-xs font-bold text-[#182542]">
              <Scale size={13} className="text-emerald-600" />
              <span>DİB &amp; BIST Katılım Standartları (&lt;%33)</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* Search Input */}
            <div className="sm:col-span-6 lg:col-span-5 relative">
              <Search size={15} className="absolute left-3.5 top-3.5 text-[#8C9BB0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kod, şirket adı veya sektör ara (örn: BIMAS, THYAO, Enerji)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200 text-xs text-[#182542] placeholder-[#8C9BB0] focus:outline-none focus:border-[#182542] shadow-2xs transition"
              />
            </div>

            {/* Status Segmented Buttons */}
            <div className="sm:col-span-6 lg:col-span-4 flex p-1 rounded-2xl bg-white/90 border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                  statusFilter === "ALL"
                    ? "bg-[#182542] text-white shadow-xs"
                    : "text-[#6E81A0] hover:text-[#182542]"
                }`}
              >
                Tümü ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("COMPLIANT")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                  statusFilter === "COMPLIANT"
                    ? "bg-[#0D8B52] text-white shadow-xs"
                    : "text-[#0D8B52] hover:bg-emerald-50"
                }`}
              >
                ✓ Uygun ({stats.compliant})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("NON_COMPLIANT")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                  statusFilter === "NON_COMPLIANT"
                    ? "bg-[#C62E26] text-white shadow-xs"
                    : "text-[#C62E26] hover:bg-rose-50"
                }`}
              >
                ✕ Kapsam Dışı ({stats.nonCompliant})
              </button>
            </div>

            {/* Sector Selector */}
            <div className="sm:col-span-12 lg:col-span-3">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 border border-slate-200 text-xs font-bold text-[#182542] shadow-2xs focus:outline-none focus:border-[#182542]"
              >
                {sectorList.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec === "TÜMÜ" ? "Tüm Sektörler" : sec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Screener Data Table Frosted Panel */}
        <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/85 shadow-[0_8px_30px_rgba(24,37,66,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-white/60 text-[#6E81A0] font-bold uppercase tracking-wider text-[10px]">
                  <th
                    onClick={() => handleSort("ticker")}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#182542] transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Hisse Kodu &amp; Şirket</span>
                      {getSortIcon("ticker")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("priceTRY")}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#182542] transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Son Fiyat</span>
                      {getSortIcon("priceTRY")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("change24h")}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#182542] transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>24s Değişim</span>
                      {getSortIcon("change24h")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#182542] transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Fıkhi Durum</span>
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("debtRatioPercent")}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#182542] transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Faizli Borç / PD</span>
                      {getSortIcon("debtRatioPercent")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("cashRatioPercent")}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#182542] transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Faizli Nakit / PD</span>
                      {getSortIcon("cashRatioPercent")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("impureIncomePercent")}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#182542] transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Uygunsuz Gelir</span>
                      {getSortIcon("impureIncomePercent")}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">
                    <span>Gerekçe &amp; Rasyo Durumu</span>
                  </th>
                  <th className="py-3.5 px-4 text-center">
                    <span>Rapor</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedCompanies.map((comp) => {
                  const isCompliant = comp.bistStatus === "COMPLIANT";
                  const isPositiveChange = String(comp.change24h).startsWith("+");

                  return (
                    <tr
                      key={comp.ticker}
                      onClick={() => router.push(`/companies/${comp.ticker}`)}
                      className="hover:bg-white/80 transition cursor-pointer group"
                    >
                      {/* Ticker & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#182542] text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs group-hover:scale-105 transition">
                            {comp.ticker.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-mono font-black text-xs text-[#182542] group-hover:text-blue-700 transition">
                              {comp.ticker}
                            </div>
                            <div className="text-[11px] text-[#6E81A0] truncate max-w-[180px] sm:max-w-[220px]">
                              {comp.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#182542]">
                        {comp.priceTRY}
                      </td>

                      {/* 24h Change */}
                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold ${
                          isPositiveChange ? "text-[#12B76A]" : "text-[#F04438]"
                        }`}
                      >
                        {comp.change24h}
                      </td>

                      {/* Compliance Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isCompliant
                              ? "bg-emerald-500/10 text-[#0D8B52] border border-emerald-500/20"
                              : "bg-rose-500/10 text-[#C62E26] border border-rose-500/20"
                          }`}
                        >
                          {isCompliant ? (
                            <>
                              <CheckCircle2 size={13} className="text-[#0D8B52]" />
                              <span>Katılıma Uygun</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} className="text-[#C62E26]" />
                              <span>Katılım Dışı</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Debt Ratio */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span
                          className={`font-bold ${
                            comp.debtRatioPercent > 33.0
                              ? "text-rose-600"
                              : "text-[#182542]"
                          }`}
                        >
                          %{comp.debtRatioPercent.toFixed(1)}
                        </span>
                      </td>

                      {/* Cash Ratio */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span
                          className={`font-bold ${
                            comp.cashRatioPercent > 33.0
                              ? "text-rose-600"
                              : "text-[#182542]"
                          }`}
                        >
                          %{comp.cashRatioPercent.toFixed(1)}
                        </span>
                      </td>

                      {/* Impure Income */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span
                          className={`font-bold ${
                            comp.impureIncomePercent > 5.0 ? "text-rose-600" : "text-[#182542]"
                          }`}
                        >
                          %{comp.impureIncomePercent.toFixed(1)}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-[11px] text-[#6E81A0] max-w-xs truncate">
                        {getComplianceReason(comp)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#182542] hover:text-white text-slate-600 inline-flex items-center justify-center transition">
                          <ArrowUpRight size={13} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {visibleLimit < sortedCompanies.length && (
            <div className="p-4 border-t border-slate-100 text-center bg-white/40">
              <button
                type="button"
                onClick={() => setVisibleLimit((v) => v + 80)}
                className="px-6 py-2.5 rounded-2xl bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold transition shadow-xs active:scale-95"
              >
                Daha Fazla Hisse Yükle (+80 / Toplam: {sortedCompanies.length})
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
