"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Calendar,
  Coins,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Info,
  RefreshCw,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  X,
  ArrowRight,
} from "lucide-react";
import {
  BistIpoItem,
  UPCOMING_AND_ACTIVE_BIST_IPOS,
} from "@/lib/data/realBistIpos";
import { PaynoShell } from "@/components/PaynoShell";
import { formatTRY } from "@/lib/decimal/decimal";

type ViewMode = "cards" | "table";
type SortField = "ticker" | "ipoPriceTRY" | "totalLotCount" | "isKatilimCompliant";
type SortDirection = "asc" | "desc";

export default function IpoCalendarPage() {
  const [ipos, setIpos] = useState<BistIpoItem[]>(UPCOMING_AND_ACTIVE_BIST_IPOS);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Canlı");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "COMPLIANT" | "DRAFT" | "NON_COMPLIANT"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Table Sorting
  const [sortField, setSortField] = useState<SortField>("isKatilimCompliant");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Tıklanan Halka Arz Detay & Lot Dağıtım Modalı
  const [selectedDetailIpo, setSelectedDetailIpo] = useState<BistIpoItem | null>(null);
  const [modalParticipants, setModalParticipants] = useState<number>(2_000_000);
  const [dataSourceLabel, setDataSourceLabel] = useState<string>("halkarz.com (Canlı Otomatik Akış)");

  // 7/24 Live Sync function with automated halkarz.com scraper
  const fetchIpos = useCallback(async (isInitial = false, forceSync = false) => {
    if (isInitial || forceSync) setLoading(true);
    try {
      const url = forceSync ? "/api/ipo?sync=true" : "/api/ipo";
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ipos && Array.isArray(data.ipos) && data.ipos.length > 0) {
          setIpos(data.ipos);
          setLastSyncTime(
            data.lastScrapedTime ||
            new Date().toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          );
          if (data.source) setDataSourceLabel(data.source);
        }
      }
    } catch (err) {
      console.warn("Live IPO fetch failed, using fallback:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and 30s polling
  useEffect(() => {
    fetchIpos(true);
    const interval = setInterval(() => {
      fetchIpos(false);
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchIpos]);

  // Modal içindeki tahmini lot hesabı
  const modalEstimatedLots = useMemo(() => {
    if (!selectedDetailIpo || modalParticipants <= 0) return 0;
    return Math.max(1, Math.round(selectedDetailIpo.totalLotCount / modalParticipants));
  }, [selectedDetailIpo, modalParticipants]);

  const modalEstimatedAmountTRY = useMemo(() => {
    if (!selectedDetailIpo) return 0;
    return modalEstimatedLots * selectedDetailIpo.ipoPriceTRY;
  }, [selectedDetailIpo, modalEstimatedLots]);

  // Sorting helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filtreleme ve Sıralama
  const filteredAndSortedIpos = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    const list = ipos.filter((item) => {
      if (activeTab === "COMPLIANT" && !item.isKatilimCompliant) return false;
      if (activeTab === "DRAFT" && item.ipoStatus !== "TASLAK_SPK") return false;
      if (activeTab === "NON_COMPLIANT" && item.isKatilimCompliant) return false;

      if (!q) return true;
      return (
        item.ticker.toUpperCase().includes(q) ||
        item.companyName.toUpperCase().includes(q) ||
        item.sector.toUpperCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      let comparison = 0;
      if (sortField === "ticker") {
        comparison = a.ticker.localeCompare(b.ticker);
      } else if (sortField === "ipoPriceTRY") {
        comparison = a.ipoPriceTRY - b.ipoPriceTRY;
      } else if (sortField === "totalLotCount") {
        comparison = a.totalLotCount - b.totalLotCount;
      } else if (sortField === "isKatilimCompliant") {
        comparison = (a.isKatilimCompliant ? 1 : 0) - (b.isKatilimCompliant ? 1 : 0);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [ipos, activeTab, searchQuery, sortField, sortDirection]);

  // Sayısal İstatistikler
  const stats = useMemo(() => {
    return {
      total: ipos.length,
      compliant: ipos.filter((i) => i.isKatilimCompliant).length,
      drafts: ipos.filter((i) => i.ipoStatus === "TASLAK_SPK").length,
      nonCompliant: ipos.filter((i) => !i.isKatilimCompliant).length,
    };
  }, [ipos]);

  return (
    <PaynoShell badge="halka arz">
      <div className="space-y-6">
        
        {/* ===================================================================== */}
        {/* 1. ÜST HERO BAŞLIK                                                    */}
        {/* ===================================================================== */}
        <section className="bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] border border-slate-200/60 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-[#0D8B52] dark:text-emerald-400 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>DİB &amp; TKBB Standartlı Katılım Denetimi</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#6E81A0] dark:text-[#94A3B8]">
                Canlı Akış: <strong className="text-[#182542] dark:text-white">{lastSyncTime}</strong>
              </span>
              <button
                type="button"
                onClick={() => fetchIpos(false, true)}
                disabled={loading}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-[#182542] dark:text-white flex items-center justify-center transition disabled:opacity-50"
                title="Şimdi Yenile"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] dark:text-white tracking-tight">
              2026 BIST Katılım Halka Arz Takvimi
            </h1>
            <p className="text-xs sm:text-sm text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed">
              SPK onaylı ve taslak aşamasındaki tüm halka arzların fıkhi uygunluk analizi. Bir şirkete tıklayarak detaylı izahname bilgilerini ve <strong>Lot Dağıtım Hesaplayıcısını</strong> görüntüleyebilirsiniz.
            </p>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 2. DÖRT BİLEŞENLİ BENTO İSTATİSTİK ŞERİDİ                              */}
        {/* ===================================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2 transition-colors">
            <span className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
              Aktif &amp; Taslak Halka Arz
            </span>
            <div className="text-3xl font-black text-[#182542] dark:text-white font-mono">
              {stats.total}{" "}
              <span className="text-xs text-[#6E81A0] dark:text-[#94A3B8] font-normal">Şirket</span>
            </div>
            <span className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] block font-mono">
              Kaynak: {dataSourceLabel}
            </span>
          </div>

          <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2 transition-colors">
            <span className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
              Katılıma Uygun Bulunan
            </span>
            <div className="text-3xl font-black text-[#0D8B52] dark:text-emerald-400 font-mono">
              {stats.compliant}{" "}
              <span className="text-xs text-[#0D8B52]/80 dark:text-emerald-500 font-normal">Şirket</span>
            </div>
            <span className="text-[11px] text-[#0D8B52] dark:text-emerald-400 font-bold block flex items-center gap-1.5">
              <CheckCircle2 size={12} />
              KAFİF ve İzahname Onaylı
            </span>
          </div>

          <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2 transition-colors">
            <span className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
              Taslak İzahname Aşaması
            </span>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.drafts}{" "}
              <span className="text-xs text-amber-600/80 dark:text-amber-500 font-normal">Şirket</span>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block flex items-center gap-1.5">
              <HelpCircle size={12} />
              SPK Onayı Bekleniyor
            </span>
          </div>

          <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2 transition-colors">
            <span className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
              Katılım Dışı / Kapsam Dışı
            </span>
            <div className="text-3xl font-black text-[#C62E26] dark:text-rose-400 font-mono">
              {stats.nonCompliant}{" "}
              <span className="text-xs text-[#C62E26]/80 dark:text-rose-500 font-normal">Şirket</span>
            </div>
            <span className="text-[11px] text-[#C62E26] dark:text-rose-400 font-bold block flex items-center gap-1.5">
              <AlertTriangle size={12} />
              Faiz / Borç Eşiği Üstü
            </span>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3. HALKA ARZ LİSTESİ — FİLTRE, ARAMA & GÖRÜNÜM SEÇİCİ                 */}
        {/* ===================================================================== */}
        <section className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Tab Filtreleri */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: `Tüm Halka Arzlar (${stats.total})` },
                { id: "COMPLIANT", label: `✓ Katılıma Uygun (${stats.compliant})` },
                { id: "DRAFT", label: `Taslak İzahname (${stats.drafts})` },
                { id: "NON_COMPLIANT", label: `Kapsam Dışı (${stats.nonCompliant})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-xs font-bold"
                      : "bg-white dark:bg-[#0E1015] text-[#6E81A0] dark:text-[#94A3B8] border border-slate-200/60 dark:border-white/10 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle: Cards vs Table */}
              <div className="inline-flex items-center bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 rounded-full p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-xs font-bold"
                      : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-black dark:hover:text-white"
                  }`}
                  title="Kart Görünümü"
                >
                  <LayoutGrid size={15} />
                  <span className="hidden sm:inline">Kart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    viewMode === "table"
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-xs font-bold"
                      : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-black dark:hover:text-white"
                  }`}
                  title="Tablo Görünümü"
                >
                  <TableIcon size={15} />
                  <span className="hidden sm:inline">Tablo</span>
                </button>
              </div>

              {/* Arama Input */}
              <div className="relative w-full sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Şirket, kod veya sektör ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 text-xs font-medium text-[#182542] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#182542]/20 dark:focus:ring-white/20 transition"
                />
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* VIEW 1: KART GÖRÜNÜMÜ                                               */}
          {/* =================================================================== */}
          {viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {filteredAndSortedIpos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedDetailIpo(item)}
                  className={`bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-all duration-200 hover:border-slate-300 dark:hover:border-white/20 hover:scale-[1.008] cursor-pointer group ${
                    !item.isKatilimCompliant ? "border-rose-200/70 dark:border-rose-900/40" : ""
                  }`}
                >
                  {/* Üst Satır: Ticker, Durum ve Katılım Rozeti */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#182542] dark:bg-[#273869] text-white flex items-center justify-center font-mono font-black text-sm shadow-xs group-hover:scale-105 transition">
                        {item.ticker}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#182542] dark:text-white text-base tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {item.companyName}
                        </h3>
                        <span className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                          {item.sector}
                        </span>
                      </div>
                    </div>

                    {/* Katılım Durumu Rozeti */}
                    <div>
                      {item.isKatilimCompliant ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-[#0D8B52] dark:text-emerald-400 text-xs font-extrabold">
                          <CheckCircle2 size={13} />
                          <span>Katılıma Uygun</span>
                        </span>
                      ) : item.complianceStatus === "UNDER_REVIEW" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-extrabold">
                          <HelpCircle size={13} />
                          <span>İnceleniyor</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-[#C62E26] dark:text-rose-400 text-xs font-extrabold">
                          <XCircle size={13} />
                          <span>✕ Kapsam Dışı</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3 Hap Bento Bilgi: Fıkhi Karar, Fon Kullanım Yeri, Tahmini Dağıtım */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs">
                    {/* Hap 1: Fıkhi Karar & Gerekçe */}
                    <div className="p-2 rounded-xl bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/5 space-y-1">
                      <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-bold uppercase tracking-wider block">
                        1. Fıkhi Hüküm
                      </span>
                      <span
                        className={`text-xs font-black block truncate ${
                          item.isKatilimCompliant
                            ? "text-emerald-700 dark:text-emerald-400"
                            : item.complianceStatus === "UNDER_REVIEW"
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-rose-700 dark:text-rose-400"
                        }`}
                      >
                        {item.isKatilimCompliant
                          ? "✓ Katılıma Uygun"
                          : item.complianceStatus === "UNDER_REVIEW"
                          ? "⏳ İnceleniyor"
                          : "✕ Kapsam Dışı"}
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {item.isKatilimCompliant
                          ? "TKBB & DİB Onaylı"
                          : item.complianceReason || "Kriter aşımı"}
                      </p>
                    </div>

                    {/* Hap 2: Fon Kullanım Yeri */}
                    <div className="p-2 rounded-xl bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/5 space-y-1">
                      <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-bold uppercase tracking-wider block">
                        2. Fon Kullanım Yeri
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                        {item.fundUsage ? item.fundUsage.split(/[,;.]/)[0] : "Yatırım & Büyüme"}
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        İşletme sermayesi &amp; tesis
                      </p>
                    </div>

                    {/* Hap 3: Tahmini Kişi Başı Lot */}
                    {(() => {
                      const estLots = Math.max(1, Math.round(item.totalLotCount / 2200000));
                      const estTRY = estLots * (item.ipoPriceTRY > 0 ? item.ipoPriceTRY : 45);
                      return (
                        <div className="p-2 rounded-xl bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/5 space-y-1">
                          <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-bold uppercase tracking-wider block">
                            3. Tahmini Dağıtım
                          </span>
                          <span className="text-xs font-black font-mono text-[#182542] dark:text-white block">
                            ~{estLots} Lot ({formatTRY(estTRY, 0)})
                          </span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            ~2.2M katılımcı bazlı
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Fiyat & Tarih Mini Şeridi */}
                  <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
                    <span className="font-mono">
                      Fiyat: <strong className="text-slate-800 dark:text-white">{item.ipoPriceTRY > 0 ? `₺${item.ipoPriceTRY.toFixed(2)}` : "Taslak"}</strong>
                    </span>
                    <span className="font-mono">
                      Tarih: <strong className="text-slate-800 dark:text-white">{item.ipoDates}</strong>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-1">
                      <span>Simülatör</span>
                      <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 2: TABLO GÖRÜNÜMÜ                                              */}
          {/* =================================================================== */}
          {viewMode === "table" && (
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8]">
                      <th
                        onClick={() => handleSort("ticker")}
                        className="py-3.5 px-4 cursor-pointer hover:text-[#182542] dark:hover:text-white transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Halka Arz / Kod</span>
                          {sortField === "ticker" ? (
                            sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40" />
                          )}
                        </div>
                      </th>

                      <th
                        onClick={() => handleSort("isKatilimCompliant")}
                        className="py-3.5 px-4 cursor-pointer hover:text-[#182542] dark:hover:text-white transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Katılım Durumu</span>
                          {sortField === "isKatilimCompliant" ? (
                            sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40" />
                          )}
                        </div>
                      </th>

                      <th className="py-3.5 px-4">
                        <span>Fıkhi Değerlendirme / Gerekçe</span>
                      </th>

                      <th
                        onClick={() => handleSort("ipoPriceTRY")}
                        className="py-3.5 px-4 text-right cursor-pointer hover:text-[#182542] dark:hover:text-white transition"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Arz Fiyatı</span>
                          {sortField === "ipoPriceTRY" ? (
                            sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40" />
                          )}
                        </div>
                      </th>

                      <th
                        onClick={() => handleSort("totalLotCount")}
                        className="py-3.5 px-4 text-right cursor-pointer hover:text-[#182542] dark:hover:text-white transition"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Toplam Lot</span>
                          {sortField === "totalLotCount" ? (
                            sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40" />
                          )}
                        </div>
                      </th>

                      <th className="py-3.5 px-4 text-center">
                        <span>Talep Tarihleri</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                    {filteredAndSortedIpos.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedDetailIpo(item)}
                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition duration-150 cursor-pointer"
                      >
                        {/* Ticker & Şirket */}
                        <td className="py-4 px-4 font-mono">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-[#182542] dark:bg-[#273869] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                              {item.ticker}
                            </span>
                            <div>
                              <span className="font-extrabold text-[#182542] dark:text-white block font-sans">
                                {item.companyName}
                              </span>
                              <span className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] font-sans">
                                {item.sector}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Katılım Durumu */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {item.isKatilimCompliant ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 font-bold text-[11px]">
                              <CheckCircle2 size={12} />
                              Uygun
                            </span>
                          ) : item.complianceStatus === "UNDER_REVIEW" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                              <HelpCircle size={12} />
                              İnceleniyor
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#C62E26] dark:text-rose-400 font-bold text-[11px]">
                              <XCircle size={12} />
                              Kapsam Dışı
                            </span>
                          )}
                        </td>

                        {/* Gerekçe */}
                        <td className="py-4 px-4 max-w-md">
                          <p
                            className={`text-xs font-medium leading-relaxed line-clamp-2 ${
                              !item.isKatilimCompliant
                                ? "text-rose-700 dark:text-rose-400 font-semibold"
                                : "text-[#6E81A0] dark:text-[#94A3B8]"
                            }`}
                          >
                            {item.complianceReason}
                          </p>
                        </td>

                        {/* Fiyat */}
                        <td className="py-4 px-4 text-right font-mono font-bold text-[#182542] dark:text-white whitespace-nowrap">
                          {item.ipoPriceTRY > 0 ? `₺${item.ipoPriceTRY.toFixed(2)}` : "—"}
                        </td>

                        {/* Lot */}
                        <td className="py-4 px-4 text-right font-mono text-[#6E81A0] dark:text-[#94A3B8] whitespace-nowrap">
                          {item.totalLotCount.toLocaleString("tr-TR")}
                        </td>

                        {/* Tarihler */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-[#182542] dark:text-white font-bold text-[11px]">
                            {item.ipoDates}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ===================================================================== */}
        {/* 4. SEÇİLEN HALKA ARZ DETAY VE LOT DAĞITIM MODALI                      */}
        {/* ===================================================================== */}
        {selectedDetailIpo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className="bg-white dark:bg-[#0E1015] rounded-[32px] border border-slate-200/80 dark:border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.3)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Başlık ve Kapat Butonu */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#182542] dark:bg-[#273869] text-white flex items-center justify-center font-mono font-black text-base shadow-xs">
                    {selectedDetailIpo.ticker}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-[#182542] dark:text-white tracking-tight">
                        {selectedDetailIpo.companyName}
                      </h2>
                    </div>
                    <span className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                      {selectedDetailIpo.sector} &bull; {selectedDetailIpo.statusBadgeText}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDetailIpo(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[#182542] dark:text-white flex items-center justify-center transition shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Katılım Durumu Rozeti & Açıklaması */}
              <div className={`p-4 rounded-2xl border ${
                selectedDetailIpo.isKatilimCompliant
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30"
                  : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {selectedDetailIpo.isKatilimCompliant ? (
                    <>
                      <CheckCircle2 size={16} className="text-[#0D8B52] dark:text-emerald-400" />
                      <span className="text-xs font-bold text-[#0D8B52] dark:text-emerald-400">
                        Katılım Finans İlkelerine Uygundur (KAFİF Onaylı)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} className="text-[#C62E26] dark:text-rose-400" />
                      <span className="text-xs font-bold text-[#C62E26] dark:text-rose-400">
                        Katılım Finans İlkelerine Uygun Değildir (Kapsam Dışı)
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#182542] dark:text-slate-200 leading-relaxed font-medium">
                  {selectedDetailIpo.complianceReason}
                </p>
              </div>

              {/* Halka Arz Temel Metrikleri */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs">
                <div>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-bold block uppercase">
                    Arz Fiyatı
                  </span>
                  <span className="text-base font-extrabold text-[#182542] dark:text-white font-mono">
                    ₺{selectedDetailIpo.ipoPriceTRY.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-bold block uppercase">
                    Talep Tarihleri
                  </span>
                  <span className="text-xs font-bold text-[#182542] dark:text-white">
                    {selectedDetailIpo.ipoDates}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-bold block uppercase">
                    Toplam Pay
                  </span>
                  <span className="text-xs font-bold text-[#182542] dark:text-white font-mono">
                    {selectedDetailIpo.totalLotCount.toLocaleString("tr-TR")} Lot
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-bold block uppercase">
                    Dağıtım Şekli
                  </span>
                  <span className="text-xs font-bold text-[#182542] dark:text-white">
                    {selectedDetailIpo.distributionMethod}
                  </span>
                </div>
              </div>

              {/* ============================================================= */}
              {/* INTERAKTİF LOT DAĞITIM HESAPLAYICI                             */}
              {/* ============================================================= */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#182542] to-[#273869] text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <h3 className="text-sm font-extrabold tracking-tight">
                      Tahmini Kaç Lot Düşer? (Hesaplayıcı)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-white/70">
                    Toplam Pay: {selectedDetailIpo.totalLotCount.toLocaleString("tr-TR")} Lot
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-white/80 block font-medium">
                    Beklenen Başvuru / Katılımcı Sayısını Seçin:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "1.5 Milyon", val: 1_500_000 },
                      { label: "2.0 Milyon", val: 2_000_000 },
                      { label: "2.5 Milyon", val: 2_500_000 },
                      { label: "3.0 Milyon", val: 3_000_000 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => setModalParticipants(btn.val)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-center ${
                          modalParticipants === btn.val
                            ? "bg-white text-[#182542] shadow-xs scale-105"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hesaplanan Sonuç Göstergesi */}
                <div className="pt-3 border-t border-white/15 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-white/70 block">Hesabınıza Geçecek Tahmini:</span>
                    <span className="text-3xl font-black font-mono tracking-tight text-white">
                      ~{modalEstimatedLots}
                    </span>
                    <span className="text-xs text-white/80 font-bold ml-1">Lot</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-white/70 block">Gereken Nakit Tutar:</span>
                    <span className="text-2xl font-black font-mono text-emerald-300">
                      ₺{modalEstimatedAmountTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ek İzahname Bilgileri: Konsorsiyum, Fon Kullanımı, T1-T2 */}
              <div className="text-xs text-[#6E81A0] dark:text-[#94A3B8] space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <div>
                  <strong className="text-[#182542] dark:text-white">Konsorsiyum Lideri:</strong> {selectedDetailIpo.consortiumLead}
                </div>
                <div>
                  <strong className="text-[#182542] dark:text-white">Fon Kullanım Yeri:</strong> {selectedDetailIpo.fundUsage}
                </div>
                <div>
                  <strong className="text-[#182542] dark:text-white">T1-T2 Bakiye:</strong>{" "}
                  {selectedDetailIpo.t1t2Available ? (
                    <span className="text-[#0D8B52] dark:text-emerald-400 font-bold">Kullanılabilir</span>
                  ) : (
                    <span className="text-[#C62E26] dark:text-rose-400 font-bold">Kullanılamaz</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </PaynoShell>
  );
}
