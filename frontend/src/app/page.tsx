"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Building2,
  Eye,
  EyeOff,
  Calendar,
  BookOpen,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
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
      <span className="font-bold text-[#273869]">
        {prefix}
        {whole},
      </span>
      <span className="font-normal text-[#8B9BB4]">{fraction || "00"}</span>
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
    return `Faizli Borç Oranı (%${comp.debtRatioPercent.toFixed(1)}) > %${threshold} Eşiği Aşıldı`;
  }

  // 3. Faizli Varlık Oranı Eşiği
  if (comp.cashRatioPercent > threshold) {
    return `Faizli Varlık Oranı (%${comp.cashRatioPercent.toFixed(1)}) > %${threshold} Eşiği Aşıldı`;
  }

  // 4. Uygun Olmayan Gelir Oranı Eşiği
  if (comp.impureIncomePercent > 5) {
    return `Uygunsuz Faiz Geliri (%${comp.impureIncomePercent.toFixed(1)}) > %5 Eşiği Aşıldı`;
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

  // Sıralanmış şirketler
  const sortedCompanies = useMemo(() => {
    const list = [...filteredCompanies];
    list.sort((a, b) => {
      let comp = 0;
      if (sortField === "ticker") {
        comp = a.ticker.localeCompare(b.ticker, "tr");
      } else if (sortField === "priceTRY") {
        comp = parseFloat(a.priceTRY || "0") - parseFloat(b.priceTRY || "0");
      } else if (sortField === "change24h") {
        const aVal = parseFloat(a.change24h.replace("%", "").replace("+", "") || "0");
        const bVal = parseFloat(b.change24h.replace("%", "").replace("+", "") || "0");
        comp = aVal - bVal;
      } else if (sortField === "status") {
        const aSt = standard === "BIST" ? a.bistStatus : a.aaoifiStatus;
        const bSt = standard === "BIST" ? b.bistStatus : b.aaoifiStatus;
        const aScore = aSt === "COMPLIANT" ? 1 : 0;
        const bScore = bSt === "COMPLIANT" ? 1 : 0;
        comp = aScore - bScore;
      } else if (sortField === "debtRatioPercent") {
        comp = (a.debtRatioPercent || 0) - (b.debtRatioPercent || 0);
      } else if (sortField === "cashRatioPercent") {
        comp = (a.cashRatioPercent || 0) - (b.cashRatioPercent || 0);
      } else if (sortField === "impureIncomePercent") {
        comp = (a.impureIncomePercent || 0) - (b.impureIncomePercent || 0);
      }
      return sortDirection === "asc" ? comp : -comp;
    });
    return list;
  }, [filteredCompanies, sortField, sortDirection, standard]);

  const displayedCompanies = useMemo(
    () => sortedCompanies.slice(0, visibleLimit),
    [sortedCompanies, visibleLimit]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 space-y-8">
      
      {/* ===================================================================== */}
      {/* 0. APPLE-STYLE BRAND HEADER WITH NAVY LOGO (ÜST BAR YERİNE ENTEGRE)    */}
      {/* ===================================================================== */}
      <header className="flex items-center justify-between py-2 border-b border-[#273869]/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-[#273869] shadow-orbix-sm p-2 flex items-center justify-center transition-transform group-hover:scale-105 border border-white/20">
            <Image
              src="/brand/logo.svg"
              alt="Mizan Logo"
              width={34}
              height={34}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-[#273869]">
                mizan
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#6E81A0] block -mt-0.5">
              Katılım Finans Terminali
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full apple-glass-card text-xs font-semibold text-[#405881]">
            <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
            <span>7/24 Canlı BIST KAP Akışı</span>
          </div>

          <button
            type="button"
            onClick={() => refreshNow()}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-full apple-glass-card text-[#273869] hover:bg-white flex items-center justify-center transition disabled:opacity-50"
            title="Verileri Yenile"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 1. SLIDE 06 & 09: BALANCE FIRST — APPLE FROSTED GLASS KARTLAR        */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SOL: BALANCE FIRST CARD (Apple Glass Depth) */}
        <div className="lg:col-span-7 apple-glass-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          {/* Card Top: Label & Diagonal Arrow Pill Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#12B76A]" />
              <span className="text-xs font-semibold tracking-wide text-[#405881]">
                BIST Katılım Endeksi (XKTUM)
              </span>
            </div>
            <Link
              href="#screener-table"
              className="w-9 h-9 rounded-full bg-[#273869] text-white flex items-center justify-center hover:bg-[#1e2c54] transition-transform hover:scale-105 shadow-orbix-sm"
              title="Hisseleri İncele"
            >
              <ArrowUpRight size={17} />
            </Link>
          </div>

          {/* Large Balance Figure (44px) */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#273869] font-mono">
                {balanceVisible ? "11.450,20 ₺" : "•••••••• ₺"}
              </span>
              <button
                type="button"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="text-[#8B9BB4] hover:text-[#273869] transition p-1"
                aria-label="Bakiyeyi Gizle / Göster"
              >
                {balanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Slide 06 Micro-Pill Indicator */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="orbix-micro-pill">
                <span>Katılım Hacmi</span>
                <span className="text-[#8B9BB4]">•</span>
                <span className="text-[#273869] font-bold">₺84,2 Milyar</span>
                <span className="text-[#8B9BB4]">&gt;</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#12B76A]/10 text-[#0D8B52] border border-[#12B76A]/25 text-xs font-bold font-mono">
                <ArrowUpRight size={13} />
                <span>+%1,42 Günlük</span>
              </span>
            </div>
          </div>

          {/* Slide 09: 4 Quick Actions, Never More */}
          <div className="pt-4 border-t border-[#273869]/10">
            <div className="text-[11px] font-bold text-[#6E81A0] mb-3 uppercase tracking-wider">
              Hızlı İşlemler
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <a
                href="#screener-table"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs transition group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#273869]/5 border border-[#273869]/10 text-[#273869] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                  <Search size={18} />
                </div>
                <span className="text-xs font-bold text-[#273869] mt-2 leading-tight">
                  Hisse Ara
                </span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter("COMPLIANT");
                  const el = document.getElementById("screener-table");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs transition group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#12B76A]/10 border border-[#12B76A]/20 text-[#0D8B52] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-xs font-bold text-[#273869] mt-2 leading-tight">
                  Katılım Payı
                </span>
              </button>

              <Link
                href="/ipo"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs transition group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#273869]/5 border border-[#273869]/10 text-[#273869] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                  <Calendar size={18} />
                </div>
                <span className="text-xs font-bold text-[#273869] mt-2 leading-tight">
                  Halka Arz
                </span>
              </Link>

              <Link
                href="/rehber"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs transition group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#273869]/5 border border-[#273869]/10 text-[#273869] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                  <BookOpen size={18} />
                </div>
                <span className="text-xs font-bold text-[#273869] mt-2 leading-tight">
                  Fıkıh &amp; SSS
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* SAĞ: SLIDE 08 SIMPLE FINANCIAL OVERVIEW (Apple Glass Depth) */}
        <div className="lg:col-span-5 apple-glass-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="text-xs font-bold text-[#6E81A0] uppercase tracking-wider">
              Finansal Genel Bakış
            </div>
            <h2 className="text-2xl font-bold text-[#273869] tracking-tight mt-1">
              BIST <span className="font-orbix-serif italic text-[#405881]">Katılım</span> &amp; Şeffaflık
            </h2>
            <p className="text-xs text-[#6E81A0] mt-1 leading-relaxed">
              Borsa İstanbul&apos;da işlem gören tüm şirketlerin faizli borç ve gelir rasyoları Kamuyu Aydınlatma Platformu&apos;ndan 7/24 taranır.
            </p>
          </div>

          {/* Dual Subcards */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-white/60 border border-white/90 shadow-2xs space-y-1.5">
              <span className="text-xs font-medium text-[#6E81A0] block">
                Katılıma Uygun (XKTUM)
              </span>
              <div className="text-2xl font-black text-[#273869] font-mono">
                {compliantCount}
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0D8B52]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
                Resmi DİB &amp; TKBB
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 border border-white/90 shadow-2xs space-y-1.5">
              <span className="text-xs font-medium text-[#6E81A0] block">
                Kapsam Dışı Şirketler
              </span>
              <div className="text-2xl font-black text-[#273869] font-mono">
                {nonCompliantCount}
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C62E26]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F04438]" />
                Borç/Faiz Eşiği Üstü
              </span>
            </div>
          </div>

          {/* Single Navy Line Indicator */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#405881]">Katılım Endeksi Kapsamı</span>
              <span className="text-[#273869] font-mono font-bold">
                %{((compliantCount / (totalCount || 1)) * 100).toFixed(1)} Uyum Oranı
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#273869]/10 overflow-hidden">
              <div
                className="h-full bg-[#273869] rounded-full transition-all duration-500"
                style={{ width: `${(compliantCount / (totalCount || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

      </section>

      {/* ===================================================================== */}
      {/* 2. APPLE-DESIGN FROSTED GLASS TABLE — SIRALANABİLİR SÜTUNLAR          */}
      {/* ===================================================================== */}
      <section
        id="screener-table"
        className="apple-glass-table p-6 sm:p-8 space-y-6"
      >
        {/* Üst Kontrol Barı: Başlık, Arama, Sektör ve Standart Seçici */}
        <div className="space-y-4 border-b border-[#273869]/10 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#273869] tracking-tight">
                  Tüm Borsa İstanbul Hisseleri
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#273869]/10 text-[#273869] text-xs font-mono font-bold">
                  {filteredCompanies.length} / {totalCount} Pay
                </span>
                {updatedAt && (
                  <span className="text-xs font-mono text-[#8B9BB4] hidden sm:inline">
                    (Son Güncelleme: {updatedAt})
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E81A0] mt-1 font-medium">
                Sütun başlıklarına tıklayarak artan/azalan şekilde sıralayabilir, kapsam dışı hisselerin gerekçelerini inceleyebilirsiniz.
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

          {/* Arama ve Filtre Kontrolleri */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-6 relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9BB4]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleLimit(80);
                }}
                placeholder="Hisse kodu, şirket adı veya sektör ara (Örn: BIMAS, ASELS, THYAO, EREGL)..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/70 border border-white/90 text-xs font-semibold text-[#273869] placeholder:text-[#8B9BB4] focus:outline-none focus:bg-white focus:border-[#273869] shadow-2xs"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={sectorFilter}
                onChange={(e) => {
                  setSectorFilter(e.target.value);
                  setVisibleLimit(80);
                }}
                className="w-full px-4 py-3 rounded-full bg-white/70 border border-white/90 text-xs font-bold text-[#273869] focus:outline-none focus:bg-white shadow-2xs"
              >
                {allSectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec === "TÜMÜ" ? "Tüm Sektörler (626)" : sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Durum Hapları */}
            <div className="sm:col-span-3 flex items-center gap-1.5">
              {[
                { id: "ALL", label: "Tümü" },
                { id: "COMPLIANT", label: `Uygun (${compliantCount})` },
                { id: "NON_COMPLIANT", label: `Kapsam Dışı` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id as typeof statusFilter);
                    setVisibleLimit(80);
                  }}
                  className={`flex-1 py-3 px-2 rounded-full text-xs font-bold transition text-center whitespace-nowrap ${
                    statusFilter === tab.id
                      ? "bg-[#273869] text-white shadow-orbix-sm"
                      : "bg-white/60 text-[#405881] hover:bg-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SIRALANABİLİR APPLE FROSTED GLASS TABLO                             */}
        {/* =================================================================== */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#273869]/10 text-[11px] font-bold uppercase tracking-wider text-[#6E81A0] select-none">
                
                {/* 1. Hisse & Şirket Sıralama */}
                <th
                  onClick={() => handleSort("ticker")}
                  className="py-3.5 pr-4 cursor-pointer group hover:text-[#273869] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Hisse &amp; Şirket</span>
                    {sortField === "ticker" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp size={14} className="text-[#273869]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#273869]" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* 2. Canlı Fiyat Sıralama */}
                <th
                  onClick={() => handleSort("priceTRY")}
                  className="py-3.5 px-3 text-right cursor-pointer group hover:text-[#273869] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Canlı Fiyat</span>
                    {sortField === "priceTRY" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp size={14} className="text-[#273869]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#273869]" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* 3. Katılım Uygunluğu Sıralama */}
                <th
                  onClick={() => handleSort("status")}
                  className="py-3.5 px-4 text-center cursor-pointer group hover:text-[#273869] transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Katılım Uygunluğu &amp; Gerekçe</span>
                    {sortField === "status" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp size={14} className="text-[#273869]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#273869]" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* 4. Faizli Borç Oranı Sıralama */}
                <th
                  onClick={() => handleSort("debtRatioPercent")}
                  className="py-3.5 px-4 cursor-pointer group hover:text-[#273869] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Faizli Borç Oranı</span>
                    {sortField === "debtRatioPercent" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp size={14} className="text-[#273869]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#273869]" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* 5. Faizli Varlık Sıralama */}
                <th
                  onClick={() => handleSort("cashRatioPercent")}
                  className="py-3.5 px-3 text-right cursor-pointer group hover:text-[#273869] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Faizli Varlık</span>
                    {sortField === "cashRatioPercent" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp size={14} className="text-[#273869]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#273869]" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* 6. Şüpheli Gelir Sıralama */}
                <th
                  onClick={() => handleSort("impureIncomePercent")}
                  className="py-3.5 px-3 text-right cursor-pointer group hover:text-[#273869] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Şüpheli Gelir</span>
                    {sortField === "impureIncomePercent" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp size={14} className="text-[#273869]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#273869]" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* 7. Detay */}
                <th className="py-3.5 pl-4 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273869]/[0.06] text-xs">
              {displayedCompanies.map((comp) => {
                const status =
                  standard === "BIST" ? comp.bistStatus : comp.aaoifiStatus;
                const isCompliant = status === "COMPLIANT";
                const isNegative = comp.change24h.startsWith("-");
                const debtRatio = comp.debtRatioPercent || 0;
                const threshold = standard === "BIST" ? 33 : 30;
                const debtFillPercent = Math.min(100, (debtRatio / threshold) * 100);
                const nonComplianceReason = !isCompliant
                  ? getNonComplianceReason(comp, standard)
                  : "";

                return (
                  <tr
                    key={comp.ticker}
                    onClick={() => router.push(`/companies/${comp.ticker}`)}
                    className="hover:bg-[#273869]/[0.035] cursor-pointer transition-colors group"
                  >
                    {/* 1. Hisse & Şirket */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border shadow-2xs transition-transform group-hover:scale-105 ${
                            isCompliant
                              ? "bg-[#12B76A]/10 border-[#12B76A]/25 text-[#0D8B52]"
                              : "bg-[#273869]/5 border-[#273869]/10 text-[#273869]"
                          }`}
                        >
                          {comp.ticker.slice(0, 5)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#273869] group-hover:text-[#405881] transition-colors flex items-center gap-1.5">
                            <span className="font-mono text-sm">{comp.ticker}</span>
                            {isCompliant && (
                              <span className="px-1.5 py-0.2 rounded-full bg-[#12B76A]/10 text-[#0D8B52] border border-[#12B76A]/20 text-[10px] font-bold">
                                XKTUM
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#6E81A0] truncate max-w-[190px] sm:max-w-[260px] font-medium">
                            {comp.name}
                          </div>
                          <div className="text-[10px] text-[#8B9BB4] font-medium">
                            {comp.sector}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Canlı Fiyat & 24s Değişim (Strictly Red/Green) */}
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <div>
                        <PaynoSplitPrice
                          value={comp.priceTRY}
                          className="text-sm font-bold"
                        />
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold mt-0.5 ${
                          isNegative ? "text-[#C62E26]" : "text-[#0D8B52]"
                        }`}
                      >
                        {isNegative ? (
                          <ArrowDownRight size={12} />
                        ) : (
                          <ArrowUpRight size={12} />
                        )}
                        {comp.change24h}
                      </span>
                    </td>

                    {/* 3. Katılım Durumu Rozeti & KATILIM DIŞI SEBEBİ */}
                    <td className="py-4 px-4 text-center">
                      {isCompliant ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full payno-badge-mint text-xs font-bold shadow-2xs">
                          <CheckCircle2 size={13} />
                          <span>Katılıma Uygun</span>
                        </span>
                      ) : status === "GRACE_PERIOD_TOLERANCE" ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full payno-badge-amber text-xs font-bold">
                            <AlertTriangle size={13} />
                            <span>İzlemede (Tolerans)</span>
                          </span>
                          <span className="text-[10px] font-medium text-[#B56107] max-w-[220px] truncate">
                            {nonComplianceReason}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full payno-badge-coral text-xs font-bold shadow-2xs">
                            <XCircle size={13} />
                            <span>Kapsam Dışı</span>
                          </span>
                          {/* KATILIM DIŞI GEREKÇESİ */}
                          <span
                            className="text-[10px] font-semibold text-[#C62E26] max-w-[220px] truncate leading-tight"
                            title={nonComplianceReason}
                          >
                            {nonComplianceReason}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 4. Faizli Borç Oranı */}
                    <td className="py-4 px-4 min-w-[150px]">
                      <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                        <span
                          className={
                            debtRatio <= threshold ? "text-[#273869]" : "text-[#C62E26]"
                          }
                        >
                          %{debtRatio.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#8B9BB4] font-normal">
                          / %{threshold} Eşik
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#273869]/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            debtRatio <= threshold ? "bg-[#273869]" : "bg-[#F04438]"
                          }`}
                          style={{ width: `${debtFillPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* 5. Faizli Varlık Oranı */}
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#273869]">
                        %{comp.cashRatioPercent.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-[#8B9BB4] font-mono">
                        / %{threshold}
                      </span>
                    </td>

                    {/* 6. Uygunsuz Gelir Oranı */}
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-xs ${
                          comp.impureIncomePercent <= 5
                            ? "text-[#0D8B52]"
                            : "text-[#C62E26]"
                        }`}
                      >
                        %{comp.impureIncomePercent.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-[#8B9BB4] font-mono">
                        / %5
                      </span>
                    </td>

                    {/* 7. Detay Aksiyon Butonu */}
                    <td className="py-4 pl-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 group-hover:bg-[#273869] text-[#273869] group-hover:text-white border border-[#273869]/15 text-xs font-bold transition shadow-2xs">
                        <span>İncele</span>
                        <ChevronRight size={13} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Daha Fazla Şirket Yükle Butonları */}
        {visibleLimit < sortedCompanies.length && (
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-[#273869]/10">
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + 100)}
              className="payno-btn-secondary text-xs px-6 py-2.5"
            >
              +100 Şirket Daha Yükle ({displayedCompanies.length} /{" "}
              {sortedCompanies.length})
            </button>

            <button
              type="button"
              onClick={() => setVisibleLimit(sortedCompanies.length)}
              className="payno-btn-primary text-xs px-6 py-2.5"
            >
              Tümünü Göster ({sortedCompanies.length} Şirket)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
