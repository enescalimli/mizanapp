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
} from "lucide-react";
import {
  BistIpoItem,
  UPCOMING_AND_ACTIVE_BIST_IPOS,
} from "@/lib/data/realBistIpos";

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

  // Lot Dağıtım Simülasyonu
  const [selectedSimTicker, setSelectedSimTicker] = useState<string>("DURKN");
  const [simParticipants, setSimParticipants] = useState<number>(2_000_000);

  // 7/24 Live Sync function
  const fetchIpos = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch("/api/ipo", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ipos && Array.isArray(data.ipos) && data.ipos.length > 0) {
          setIpos(data.ipos);
          setLastSyncTime(
            new Date().toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          );
        }
      }
    } catch (err) {
      console.warn("Live IPO fetch failed, using fallback:", err);
    } finally {
      if (isInitial) setLoading(false);
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

  const selectedIpo = useMemo(() => {
    return (
      ipos.find((i) => i.ticker === selectedSimTicker) ||
      ipos[0] ||
      UPCOMING_AND_ACTIVE_BIST_IPOS[0]
    );
  }, [ipos, selectedSimTicker]);

  // Simülatörden hesaplanan tahmini lot
  const simulatedLotCount = useMemo(() => {
    if (!selectedIpo || simParticipants <= 0) return 0;
    return Math.max(
      1,
      Math.round(selectedIpo.totalLotCount / simParticipants)
    );
  }, [selectedIpo, simParticipants]);

  const simulatedAmountTRY = useMemo(() => {
    if (!selectedIpo) return 0;
    return simulatedLotCount * selectedIpo.ipoPriceTRY;
  }, [selectedIpo, simulatedLotCount]);

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

      if (q) {
        return (
          item.ticker.toUpperCase().includes(q) ||
          item.companyName.toUpperCase().includes(q) ||
          item.sector.toUpperCase().includes(q)
        );
      }
      return true;
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "boolean") {
        const numA = valA ? 1 : 0;
        const numB = (valB as boolean) ? 1 : 0;
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      if (typeof valA === "string") {
        return sortDirection === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      }
      return sortDirection === "asc"
        ? Number(valA || 0) - Number(valB || 0)
        : Number(valB || 0) - Number(valA || 0);
    });

    return list;
  }, [ipos, activeTab, searchQuery, sortField, sortDirection]);

  const stats = useMemo(() => {
    const total = ipos.length;
    const compliant = ipos.filter((i) => i.isKatilimCompliant).length;
    const drafts = ipos.filter((i) => i.ipoStatus === "TASLAK_SPK").length;
    const nonCompliant = ipos.filter((i) => !i.isKatilimCompliant).length;
    return { total, compliant, drafts, nonCompliant };
  }, [ipos]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 space-y-8">
      {/* ===================================================================== */}
      {/* 1. APPLE DESIGN NAVY HERO HEADER (Integrated Brand & Live Sync)       */}
      {/* ===================================================================== */}
      <section className="apple-glass-card p-6 sm:p-10 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#273869]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#0D8B52]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Top Brand Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#273869]/10 pb-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-orbix-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform">
                <Image
                  src="/brand/logo.svg"
                  alt="Mizan Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-tight text-[#273869]">
                    MİZAN
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#273869] text-white tracking-widest uppercase">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-[#6E81A0] font-medium block">
                  BIST Katılım Finans &amp; Halka Arz Radarı
                </span>
              </div>
            </Link>

            {/* Live 7/24 Sync Status */}
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#0D8B52] text-xs font-bold shadow-2xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D8B52]"></span>
                </span>
                <span>7/24 Otomatik Canlı Senkronize</span>
                <span className="text-[10px] text-[#0D8B52]/70 font-mono">
                  ({lastSyncTime})
                </span>
              </div>

              <button
                type="button"
                onClick={() => fetchIpos(true)}
                disabled={loading}
                title="Şimdi Yenile"
                className="p-2 rounded-xl bg-white/80 border border-[#E2E8F0] text-[#273869] hover:bg-white hover:shadow-xs transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Title and Intro */}
          <div className="max-w-3xl space-y-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#273869]/8 text-[#273869] text-xs font-bold">
              <ShieldCheck size={14} className="text-[#0D8B52]" />
              <span>SPK Onaylı İzahname &amp; Katılım Finans İlkeleri Bilgi Formu</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#273869] tracking-tight">
              Halka Arz Edilecek <span className="text-[#405881] font-normal italic">Yeni Hisseler</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#6E81A0] font-medium leading-relaxed">
              SPK&apos;ya başvuran taslak şirketler ve onaylanan yeni halka arzlar anında listelenir.
              Tahmini kaç lot düşeceği, talep tarihleri ve <strong className="text-[#273869]">katılım dışı kalma gerekçeleri</strong> şeffaf olarak açıklanır.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. APPLE GLASS KPI KARTLARI                                           */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="apple-glass-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#6E81A0] uppercase tracking-wider block">
            Toplam Halka Arz
          </span>
          <div className="text-3xl font-black text-[#273869] font-mono">
            {stats.total}{" "}
            <span className="text-xs text-[#8B9BB4] font-normal">Şirket</span>
          </div>
          <span className="text-[11px] text-[#405881] font-bold block flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#273869]"></span>
            KAP &amp; SPK Pipeline
          </span>
        </div>

        <div className="apple-glass-card p-5 space-y-2 border-emerald-500/20 bg-emerald-500/5">
          <span className="text-xs font-bold text-[#0D8B52] uppercase tracking-wider block">
            Katılıma Uygun (Helal)
          </span>
          <div className="text-3xl font-black text-[#0D8B52] font-mono">
            {stats.compliant}{" "}
            <span className="text-xs text-[#0D8B52]/80 font-normal">Şirket</span>
          </div>
          <span className="text-[11px] text-[#0D8B52] font-bold block flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            DİB &amp; TKBB Onaylı
          </span>
        </div>

        <div className="apple-glass-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#405881] uppercase tracking-wider block">
            Taslak İzahname (SPK&apos;da)
          </span>
          <div className="text-3xl font-black text-[#273869] font-mono">
            {stats.drafts}{" "}
            <span className="text-xs text-[#8B9BB4] font-normal">Beklenen</span>
          </div>
          <span className="text-[11px] text-[#405881] font-bold block">
            Onay Sürecinde
          </span>
        </div>

        <div className="apple-glass-card p-5 space-y-2 border-rose-500/20 bg-rose-500/5">
          <span className="text-xs font-bold text-[#C62E26] uppercase tracking-wider block">
            Kapsam Dışı Şirketler
          </span>
          <div className="text-3xl font-black text-[#C62E26] font-mono">
            {stats.nonCompliant}{" "}
            <span className="text-xs text-[#C62E26]/80 font-normal">Şirket</span>
          </div>
          <span className="text-[11px] text-[#C62E26] font-bold block flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Faiz / Borç Eşiği Üstü
          </span>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. TAHMİNİ KAÇ LOT DÜŞER? HESAPLAMA SİMÜLATÖRÜ                        */}
      {/* ===================================================================== */}
      <section className="apple-glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273869]/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#273869]/10 text-[#273869] flex items-center justify-center font-bold">
                🎯
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#273869] tracking-tight">
                Tahmini Kaç Lot Düşer? Simülatörü
              </h2>
            </div>
            <p className="text-xs text-[#6E81A0] mt-1 font-medium">
              Katılımcı sayısına göre hesabınıza geçecek tahmini hisse adedini ve gereken nakit tutarı anında simüle edin.
            </p>
          </div>

          {/* Şirket Seçici */}
          <div className="shrink-0 w-full sm:w-auto">
            <select
              value={selectedSimTicker}
              onChange={(e) => setSelectedSimTicker(e.target.value)}
              className="w-full sm:w-72 px-4 py-2.5 rounded-2xl bg-white/90 border border-[#E2E8F0] text-xs font-bold text-[#273869] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#273869]/20"
            >
              {ipos.map((item) => (
                <option key={item.ticker} value={item.ticker}>
                  {item.ticker} — {item.companyName.slice(0, 32)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Simülasyon Kontrolleri ve Sonuç */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sol: Katılımcı Sayısı Butonları */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-[#273869] block">
              Beklenen Başvuru / Katılımcı Sayısı:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: "1.5 Milyon Kişi", val: 1_500_000 },
                { label: "2.0 Milyon Kişi", val: 2_000_000 },
                { label: "2.5 Milyon Kişi", val: 2_500_000 },
                { label: "3.0 Milyon Kişi", val: 3_000_000 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => setSimParticipants(btn.val)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold transition text-center ${
                    simParticipants === btn.val
                      ? "bg-[#273869] text-white shadow-orbix-sm ring-2 ring-[#273869]/20"
                      : "bg-white/80 text-[#405881] border border-[#E2E8F0] hover:bg-white"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-[#6E81A0] flex items-center gap-1.5 pt-1 font-medium">
              <Info size={13} className="text-[#405881]" />
              <span>
                {selectedIpo.ticker} için toplam dağıtılacak pay:{" "}
                <strong className="text-[#273869] font-mono">
                  {selectedIpo.totalLotCount.toLocaleString("tr-TR")} Lot
                </strong>{" "}
                ({selectedIpo.distributionMethod})
              </span>
            </div>
          </div>

          {/* Sağ: Apple Navy Hero Kart */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#273869] via-[#1b2749] to-[#0f172a] text-white rounded-3xl p-6 shadow-xl space-y-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="font-bold">{selectedIpo.ticker} Tahmini Dağıtım</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                  selectedIpo.isKatilimCompliant
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {selectedIpo.isKatilimCompliant ? "✓ Katılıma Uygun" : "✕ Kapsam Dışı"}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-xs text-white/70 block">Düşecek Tahmini Lot</span>
                <span className="text-4xl font-black font-mono tracking-tight text-white">
                  ~{simulatedLotCount}
                </span>
                <span className="text-sm text-white/80 font-bold ml-1">Lot</span>
              </div>

              <div className="text-right">
                <span className="text-xs text-white/70 block">Gereken Nakit Tutar</span>
                <span className="text-2xl font-bold font-mono text-emerald-300">
                  ₺{simulatedAmountTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-white/75">
              <span>Halka Arz Fiyatı: ₺{selectedIpo.ipoPriceTRY.toFixed(2)}</span>
              <span>T1-T2: {selectedIpo.t1t2Available ? "Kullanılabilir" : "Kullanılamaz"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. HALKA ARZ LİSTESİ — FİLTRE, ARAMA & GÖRÜNÜM SEÇİCİ                 */}
      {/* ===================================================================== */}
      <section className="space-y-6">
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
                className={`px-4 py-2 rounded-full text-xs font-bold transition backdrop-blur-md ${
                  activeTab === tab.id
                    ? "bg-[#273869] text-white shadow-orbix-sm ring-2 ring-[#273869]/20"
                    : "bg-white/80 text-[#405881] border border-[#E2E8F0] hover:text-[#273869] hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle: Cards vs Table */}
            <div className="inline-flex items-center bg-white/80 border border-[#E2E8F0] rounded-2xl p-1 shadow-2xs backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  viewMode === "cards"
                    ? "bg-[#273869] text-white shadow-2xs"
                    : "text-[#6E81A0] hover:text-[#273869]"
                }`}
                title="Kart Görünümü"
              >
                <LayoutGrid size={15} />
                <span className="hidden sm:inline">Kart</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  viewMode === "table"
                    ? "bg-[#273869] text-white shadow-2xs"
                    : "text-[#6E81A0] hover:text-[#273869]"
                }`}
                title="Şeffaf Tablo Görünümü"
              >
                <TableIcon size={15} />
                <span className="hidden sm:inline">Tablo</span>
              </button>
            </div>

            {/* Arama Input */}
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9BB4]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hisse / şirket ara..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white/90 border border-[#E2E8F0] text-xs font-semibold text-[#273869] placeholder:text-[#8B9BB4] focus:outline-none focus:ring-2 focus:ring-[#273869]/20 backdrop-blur-md"
              />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* VIEW 1: KART GÖRÜNÜMÜ                                               */}
        {/* =================================================================== */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedIpos.map((item) => (
              <div
                key={item.id}
                className={`apple-glass-card p-6 sm:p-7 space-y-5 transition duration-200 hover:shadow-orbix-md ${
                  !item.isKatilimCompliant ? "border-rose-200/70" : ""
                }`}
              >
                {/* Üst Satır: Ticker, Durum ve Katılım Rozeti */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#273869] to-[#182542] text-white flex items-center justify-center font-mono font-bold text-base shadow-orbix-sm">
                      {item.ticker}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#273869] text-base tracking-tight leading-snug">
                        {item.companyName}
                      </h3>
                      <span className="text-xs text-[#6E81A0] font-medium">
                        {item.sector}
                      </span>
                    </div>
                  </div>

                  {/* Katılım Durumu Rozeti */}
                  <div>
                    {item.isKatilimCompliant ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#0D8B52] text-xs font-extrabold shadow-2xs backdrop-blur-md">
                        <CheckCircle2 size={13} />
                        <span>Katılıma Uygun</span>
                      </span>
                    ) : item.complianceStatus === "UNDER_REVIEW" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 text-xs font-extrabold backdrop-blur-md">
                        <HelpCircle size={13} />
                        <span>İnceleniyor</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[#C62E26] text-xs font-extrabold shadow-2xs backdrop-blur-md">
                        <XCircle size={13} />
                        <span>✕ Kapsam Dışı</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Katılım Dışı İse: Öne Çıkarılmış Gerekçe Kutusu */}
                {!item.isKatilimCompliant && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#C62E26]">
                      <AlertTriangle size={14} />
                      <span>Katılım Dışı Olma Gerekçesi (Fıkhi Engel):</span>
                    </div>
                    <p className="text-xs text-rose-900/90 font-medium leading-relaxed">
                      {item.complianceReason}
                    </p>
                  </div>
                )}

                {/* Temel Bilgiler Şeridi (Fiyat, Tarih, Dağıtım) */}
                <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-white/70 border border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-[10px] text-[#6E81A0] font-bold uppercase block">
                      Halka Arz Fiyatı
                    </span>
                    <span className="text-base font-extrabold text-[#273869] font-mono">
                      {item.ipoPriceTRY > 0 ? `₺${item.ipoPriceTRY.toFixed(2)}` : "Belirlenecek"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#6E81A0] font-bold uppercase block">
                      Talep Tarihleri
                    </span>
                    <span className="font-bold text-[#273869] text-[11px] leading-tight block">
                      {item.ipoDates}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#6E81A0] font-bold uppercase block">
                      Toplam Pay (Lot)
                    </span>
                    <span className="text-sm font-bold text-[#273869] font-mono block">
                      {item.totalLotCount.toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>

                {/* Tahmini Lot Dağıtım Tablosu */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#273869] block">
                    Tahmini Katılımcıya Göre Düşecek Lot Sayısı:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {item.estimatedLots.map((s) => (
                      <div
                        key={s.participants}
                        className="p-2.5 rounded-xl bg-white/80 border border-[#E2E8F0] text-center shadow-2xs"
                      >
                        <span className="text-[10px] text-[#6E81A0] font-bold block">
                          {s.participantsLabel}
                        </span>
                        <span className="text-sm font-black text-[#273869] font-mono block mt-0.5">
                          ~{s.lots} Lot
                        </span>
                        <span className="text-[10px] text-[#0D8B52] font-mono font-bold block">
                          ₺{s.amountTRY}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Katılıma Uygun İse: Olumlu İzahname Değerlendirmesi */}
                {item.isKatilimCompliant && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-[#0D8B52] block tracking-wide">
                      Katılım Finans İlkeleri Değerlendirmesi:
                    </span>
                    <p className="text-xs text-[#273869]/90 leading-relaxed font-medium">
                      {item.complianceReason}
                    </p>
                  </div>
                )}

                {/* Alt Bilgi: Konsorsiyum & Fon Kullanımı */}
                <div className="text-[11px] text-[#6E81A0] space-y-1 pt-2 border-t border-[#EDF1F4] font-medium">
                  <div>
                    <strong className="text-[#273869]">Konsorsiyum Lideri:</strong> {item.consortiumLead}
                  </div>
                  <div>
                    <strong className="text-[#273869]">Fon Kullanımı:</strong> {item.fundUsage}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong className="text-[#273869]">T1 - T2 Bakiye:</strong>{" "}
                      {item.t1t2Available ? (
                        <span className="text-[#0D8B52] font-bold">Kullanılabilir</span>
                      ) : (
                        <span className="text-[#C62E26] font-bold">Kullanılamaz</span>
                      )}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#273869]/10 text-[#273869] font-bold">
                      {item.statusBadgeText}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 2: APPLE-DESIGN ŞEFFAF TABLO GÖRÜNÜMÜ                           */}
        {/* =================================================================== */}
        {viewMode === "table" && (
          <div className="apple-glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#273869]/10 bg-white/40 text-[11px] font-black uppercase tracking-wider text-[#405881]">
                    <th
                      onClick={() => handleSort("ticker")}
                      className="py-3.5 px-4 cursor-pointer hover:text-[#273869] transition"
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
                      className="py-3.5 px-4 cursor-pointer hover:text-[#273869] transition"
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
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-[#273869] transition"
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
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-[#273869] transition"
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

                <tbody className="divide-y divide-[#273869]/5 text-xs">
                  {filteredAndSortedIpos.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-white/60 transition duration-150"
                    >
                      {/* Ticker & Şirket */}
                      <td className="py-4 px-4 font-mono">
                        <div className="flex items-center gap-2.5">
                          <span className="w-9 h-9 rounded-xl bg-[#273869] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                            {item.ticker}
                          </span>
                          <div>
                            <span className="font-extrabold text-[#273869] block font-sans">
                              {item.companyName}
                            </span>
                            <span className="text-[11px] text-[#6E81A0] font-sans">
                              {item.sector}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Katılım Durumu */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {item.isKatilimCompliant ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-[#0D8B52] font-black text-[11px] border border-emerald-500/30">
                            <CheckCircle2 size={12} />
                            Uygun
                          </span>
                        ) : item.complianceStatus === "UNDER_REVIEW" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 font-black text-[11px] border border-amber-500/30">
                            <HelpCircle size={12} />
                            İnceleniyor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-[#C62E26] font-black text-[11px] border border-rose-500/30">
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
                              ? "text-rose-700 font-semibold"
                              : "text-[#405881]"
                          }`}
                        >
                          {item.complianceReason}
                        </p>
                      </td>

                      {/* Fiyat */}
                      <td className="py-4 px-4 text-right font-mono font-bold text-[#273869] whitespace-nowrap">
                        {item.ipoPriceTRY > 0 ? `₺${item.ipoPriceTRY.toFixed(2)}` : "—"}
                      </td>

                      {/* Lot */}
                      <td className="py-4 px-4 text-right font-mono text-[#405881] whitespace-nowrap">
                        {item.totalLotCount.toLocaleString("tr-TR")}
                      </td>

                      {/* Tarihler */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#273869]/8 text-[#273869] font-bold text-[11px]">
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
    </main>
  );
}
