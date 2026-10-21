"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";

/**
 * Payno split-tone price component: ₺482,50
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

  // Filtrelenmiş 626 şirket
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

  const displayedCompanies = useMemo(
    () => filteredCompanies.slice(0, visibleLimit),
    [filteredCompanies, visibleLimit]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 space-y-8">
      {/* ===================================================================== */}
      {/* 1. SLIDE 06 & 09: BALANCE FIRST — ONE CARD EVERY TOKEN                 */}
      {/* "Balance is the largest thing on screen. 4 quick actions, never more" */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SOL: BALANCE FIRST CARD (Slide 06 & 09) */}
        <div className="lg:col-span-7 orbix-card p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white border border-[#E2E8F0]">
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

          {/* Large Balance Figure (Slide 03 Type Scale: 44px) */}
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

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F8EF] text-[#0D8B52] text-xs font-bold font-mono">
                <ArrowUpRight size={13} />
                <span>+%1,42 Günlük</span>
              </span>
            </div>
          </div>

          {/* Slide 09: 4 Quick Actions, Never More */}
          <div className="pt-4 border-t border-[#EDF1F4]">
            <div className="text-[11px] font-bold text-[#6E81A0] mb-3">
              Hızlı İşlemler
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <a
                href="#screener-table"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EDF1F4] border border-[#E2E8F0] transition group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] text-[#273869] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
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
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EDF1F4] border border-[#E2E8F0] transition group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] text-[#0D8B52] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-xs font-bold text-[#273869] mt-2 leading-tight">
                  Katılım Payı
                </span>
              </button>

              <Link
                href="/ipo"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EDF1F4] border border-[#E2E8F0] transition group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] text-[#273869] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                  <Calendar size={18} />
                </div>
                <span className="text-xs font-bold text-[#273869] mt-2 leading-tight">
                  Halka Arz
                </span>
              </Link>

              <Link
                href="/rehber"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EDF1F4] border border-[#E2E8F0] transition group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] text-[#273869] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                  <BookOpen size={18} />
                </div>
                <span className="text-xs font-bold text-[#273869] mt-2 leading-tight">
                  Fıkıh &amp; SSS
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* SAĞ: SLIDE 08 SIMPLE FINANCIAL OVERVIEW */}
        <div className="lg:col-span-5 orbix-card p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white border border-[#E2E8F0]">
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

          {/* Slide 08 Dual Subcards: Total Revenue & Monthly Expense style */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
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

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
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

          {/* Slide 08 Single Navy Line Indicator */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#405881]">Katılım Endeksi Kapsamı</span>
              <span className="text-[#273869] font-mono font-bold">
                %{((compliantCount / (totalCount || 1)) * 100).toFixed(1)} Uyum Oranı
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EDF1F4] overflow-hidden">
              <div
                className="h-full bg-[#273869] rounded-full transition-all duration-500"
                style={{ width: `${(compliantCount / (totalCount || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

      </section>

      {/* ===================================================================== */}
      {/* 2. SLIDE 11: ONE ROW SHAPE, REUSED EVERYWHERE (FULL-WIDTH TABLE)       */}
      {/* ===================================================================== */}
      <section
        id="screener-table"
        className="orbix-card p-6 sm:p-8 space-y-6 bg-white border border-[#E2E8F0]"
      >
        {/* Üst Bar: Başlık, Arama, Sektör ve Standart Seçici */}
        <div className="space-y-4 border-b border-[#EDF1F4] pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#273869] tracking-tight">
                  Tüm Borsa İstanbul Hisseleri
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EDF1F4] text-[#273869] text-xs font-mono font-bold">
                  {filteredCompanies.length} / {totalCount} Pay
                </span>
                {updatedAt && (
                  <span className="text-xs font-mono text-[#8B9BB4] hidden sm:inline">
                    (Son Güncelleme: {updatedAt})
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E81A0] mt-1 font-medium">
                Hisselerin canlı fiyatı, fıkhi katılım durumu, faizli borç ve varlık rasyoları.
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
                className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F3F6FB] border border-[#E2E8F0] text-xs font-semibold text-[#273869] placeholder:text-[#8B9BB4] focus:outline-none focus:bg-white focus:border-[#273869]"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={sectorFilter}
                onChange={(e) => {
                  setSectorFilter(e.target.value);
                  setVisibleLimit(80);
                }}
                className="w-full px-4 py-3 rounded-full bg-[#F3F6FB] border border-[#E2E8F0] text-xs font-bold text-[#273869] focus:outline-none focus:bg-white"
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
                      : "bg-[#F3F6FB] text-[#405881] hover:bg-[#E5EAF2]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FULL-WIDTH RESPONSIVE TABLE (NO HORIZONTAL SCROLL NEEDED) */}
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDF1F4] text-[11px] font-bold uppercase tracking-wider text-[#6E81A0]">
                <th className="py-3.5 pr-4">Hisse &amp; Şirket</th>
                <th className="py-3.5 px-3 text-right">Canlı Fiyat</th>
                <th className="py-3.5 px-4 text-center">Katılım Uygunluğu</th>
                <th className="py-3.5 px-4">Faizli Borç Oranı</th>
                <th className="py-3.5 px-3 text-right">Faizli Varlık</th>
                <th className="py-3.5 px-3 text-right">Şüpheli Gelir</th>
                <th className="py-3.5 pl-4 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F4] text-xs">
              {displayedCompanies.map((comp) => {
                const status =
                  standard === "BIST" ? comp.bistStatus : comp.aaoifiStatus;
                const isCompliant = status === "COMPLIANT";
                const isNegative = comp.change24h.startsWith("-");
                const debtRatio = comp.debtRatioPercent || 0;
                const threshold = standard === "BIST" ? 33 : 30;
                const debtFillPercent = Math.min(100, (debtRatio / threshold) * 100);

                return (
                  <tr
                    key={comp.ticker}
                    onClick={() => router.push(`/companies/${comp.ticker}`)}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                  >
                    {/* 1. Hisse & Şirket — Slide 11 One Row Shape */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border shadow-2xs transition-transform group-hover:scale-105 ${
                            isCompliant
                              ? "bg-[#E6F8EF] border-[#BCEBD2] text-[#0D8B52]"
                              : "bg-[#F3F6FB] border-[#E2E8F0] text-[#273869]"
                          }`}
                        >
                          {comp.ticker.slice(0, 5)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#273869] group-hover:text-[#405881] transition-colors flex items-center gap-1.5">
                            <span className="font-mono text-sm">{comp.ticker}</span>
                            {isCompliant && (
                              <span className="px-1.5 py-0.2 rounded-full bg-[#E6F8EF] text-[#0D8B52] text-[10px] font-bold">
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

                    {/* 2. Canlı Fiyat & 24s Değişim (Trend Colors Strictly Red/Green) */}
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

                    {/* 3. Katılım Durumu Rozeti */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {isCompliant ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full payno-badge-mint text-xs font-bold shadow-2xs">
                          <CheckCircle2 size={13} />
                          <span>Katılıma Uygun</span>
                        </span>
                      ) : status === "GRACE_PERIOD_TOLERANCE" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full payno-badge-amber text-xs font-bold">
                          <AlertTriangle size={13} />
                          <span>İzlemede</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full payno-badge-coral text-xs font-bold shadow-2xs">
                          <XCircle size={13} />
                          <span>Kapsam Dışı</span>
                        </span>
                      )}
                    </td>

                    {/* 4. Faizli Borç Oranı (Clean Single Navy Fill) */}
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
                      <div className="w-full h-2 rounded-full bg-[#EDF1F4] overflow-hidden">
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
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white group-hover:bg-[#273869] text-[#273869] group-hover:text-white border border-[#E2E8F0] text-xs font-bold transition shadow-2xs">
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
        {visibleLimit < filteredCompanies.length && (
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-[#EDF1F4]">
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + 100)}
              className="payno-btn-secondary text-xs px-6 py-2.5"
            >
              +100 Şirket Daha Yükle ({displayedCompanies.length} /{" "}
              {filteredCompanies.length})
            </button>

            <button
              type="button"
              onClick={() => setVisibleLimit(filteredCompanies.length)}
              className="payno-btn-primary text-xs px-6 py-2.5"
            >
              Tümünü Göster ({filteredCompanies.length} Şirket)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
