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
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";

/**
 * Payno split-tone price component: ₺371,00
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
      <span className="font-extrabold text-[#182542]">
        {prefix}
        {whole},
      </span>
      <span className="font-normal text-[#7B8FA8]">{fraction || "00"}</span>
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
      {/* 1. SADE VE FERAH PAYNO HERO ALANI                                     */}
      {/* ===================================================================== */}
      <section className="payno-sky-hero p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-white text-[#182542] text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0D9F6E] animate-pulse" />
            <span>TKBB &amp; AAOIFI No. 21 Standartlarında 7/24 Canlı Denetim</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#182542] tracking-tight leading-tight">
            Borsa İstanbul Katılım &amp; Arındırma Platformu
          </h1>

          <p className="text-sm sm:text-base text-[#6E81A0] font-medium leading-relaxed">
            Borsa İstanbul&apos;daki tüm <strong className="text-[#182542]">{totalCount} hisse senedini</strong>,{" "}
            resmi <strong className="text-[#0D9F6E]">{compliantCount} BIST Katılım (XKTUM)</strong> şirketini
            ve yeni halka arzları fıkhi rasyolarıyla tek bir ekranda, şeffafça inceleyin.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#screener-table"
              className="payno-btn-primary text-xs px-6 py-3"
            >
              <span>Hisseleri İncele ({totalCount} Pay)</span>
              <ChevronRight size={14} />
            </a>

            <Link
              href="/ipo"
              className="payno-btn-secondary text-xs px-5 py-3"
            >
              <span>Yeni Halka Arz Takvimi</span>
              <ArrowUpRight size={14} />
            </Link>

            <Link
              href="/rehber"
              className="payno-btn-secondary text-xs px-5 py-3"
            >
              <span>Fıkıh &amp; Cevazlar</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. 4'LÜ SADELEŞTİRİLMİŞ PAYNO METRİK KARTLARI                          */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="payno-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#6E81A0] uppercase tracking-wider block">
            BIST Şirket Evreni
          </span>
          <div className="text-3xl font-black text-[#182542] font-mono">
            {totalCount} <span className="text-xs text-[#7B8FA8] font-normal">Hisse</span>
          </div>
          <span className="text-[11px] text-[#2E6CF6] font-bold block">
            ● 7/24 Canlı BIST Verisi
          </span>
        </div>

        <div className="payno-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#0D9F6E] uppercase tracking-wider block">
            Katılıma Uygun (XKTUM)
          </span>
          <div className="text-3xl font-black text-[#0D9F6E] font-mono">
            {compliantCount} <span className="text-xs text-[#0D9F6E]/80 font-normal">Hisse</span>
          </div>
          <span className="text-[11px] text-[#0D9F6E] font-bold block">
            ✓ Resmi Katılım Endeksi
          </span>
        </div>

        <div className="payno-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#E11D48] uppercase tracking-wider block">
            Kapsam Dışı Paylar
          </span>
          <div className="text-3xl font-black text-[#E11D48] font-mono">
            {nonCompliantCount} <span className="text-xs text-[#E11D48]/80 font-normal">Hisse</span>
          </div>
          <span className="text-[11px] text-[#BE123C] font-bold block">
            Borç/Faiz Eşiği Üstü
          </span>
        </div>

        <div className="payno-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider block">
            Yeni Halka Arzlar
          </span>
          <div className="text-3xl font-black text-[#F59E0B] font-mono">
            Aktif <span className="text-xs text-[#F59E0B]/80 font-normal">Takvim</span>
          </div>
          <Link
            href="/ipo"
            className="text-[11px] text-[#2E6CF6] hover:underline font-bold block"
          >
            Tahmini Lot Hesabı →
          </Link>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. TÜM SAYFA (FULL WIDTH) HİSSE LİSTESİ — YANA KAYDIRMA OLMADAN        */}
      {/* ===================================================================== */}
      <section
        id="screener-table"
        className="payno-card p-6 sm:p-8 space-y-6"
      >
        {/* Üst Bar: Başlık, Arama, Sektör ve Standart Seçici */}
        <div className="space-y-4 border-b border-[#E6ECF5] pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#182542] tracking-tight">
                  Tüm Borsa İstanbul Hisseleri
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F8EF] text-[#0F7A43] text-xs font-mono font-bold">
                  {filteredCompanies.length} / {totalCount} Pay
                </span>
                {updatedAt && (
                  <span className="text-xs font-mono text-[#6E81A0] hidden sm:inline">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E81A0]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleLimit(80);
                }}
                placeholder="Hisse kodu, şirket adı veya sektör ara (Örn: BIMAS, ASELS, THYAO, EREGL)..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-semibold text-[#182542] placeholder:text-[#6E81A0] focus:outline-none focus:bg-white focus:border-[#182542]"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={sectorFilter}
                onChange={(e) => {
                  setSectorFilter(e.target.value);
                  setVisibleLimit(80);
                }}
                className="w-full px-4 py-3 rounded-full bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-bold text-[#182542] focus:outline-none focus:bg-white"
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
                      ? "bg-[#182542] text-white shadow-xs"
                      : "bg-[#F3F6FB] text-[#5B6E8C] hover:bg-[#E8EEF6]"
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
              <tr className="border-b border-[#E6ECF5] text-[11px] font-bold uppercase tracking-wider text-[#6E81A0]">
                <th className="py-3.5 pr-4">Hisse &amp; Şirket</th>
                <th className="py-3.5 px-3 text-right">Canlı Fiyat</th>
                <th className="py-3.5 px-4 text-center">Katılım Uygunluğu</th>
                <th className="py-3.5 px-4">Faizli Borç Oranı</th>
                <th className="py-3.5 px-3 text-right">Faizli Varlık</th>
                <th className="py-3.5 px-3 text-right">Şüpheli Gelir</th>
                <th className="py-3.5 pl-4 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F9] text-xs">
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
                    className="hover:bg-[#F6F9FD] cursor-pointer transition-colors group"
                  >
                    {/* 1. Hisse & Şirket */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-sm shrink-0 border shadow-2xs ${
                            isCompliant
                              ? "bg-[#E6F8EF] border-[#BCEBD2] text-[#0D9F6E]"
                              : "bg-[#F3F6FB] border-[#DCE5F2] text-[#182542]"
                          }`}
                        >
                          {comp.ticker.slice(0, 5)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#182542] group-hover:text-[#2E6CF6] transition-colors flex items-center gap-1.5">
                            <span className="font-mono text-sm">{comp.ticker}</span>
                            {isCompliant && (
                              <span className="px-1.5 py-0.2 rounded-full bg-[#E6F8EF] text-[#0D9F6E] text-[10px] font-bold">
                                XKTUM
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#6E81A0] truncate max-w-[190px] sm:max-w-[260px] font-medium">
                            {comp.name}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] font-medium">
                            {comp.sector}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Canlı Fiyat & 24s Değişim */}
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <div>
                        <PaynoSplitPrice
                          value={comp.priceTRY}
                          className="text-sm font-bold"
                        />
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold mt-0.5 ${
                          isNegative ? "text-[#E11D48]" : "text-[#0D9F6E]"
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

                    {/* 4. Faizli Borç Oranı (Payno Hatch Bar) */}
                    <td className="py-4 px-4 min-w-[150px]">
                      <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                        <span
                          className={
                            debtRatio <= threshold ? "text-[#182542]" : "text-[#E11D48]"
                          }
                        >
                          %{debtRatio.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#7B8FA8] font-normal">
                          / %{threshold} Eşik
                        </span>
                      </div>
                      <div className="w-full h-2.5 payno-hatch-track">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            debtRatio <= threshold ? "bg-[#0D9F6E]" : "bg-[#E11D48]"
                          }`}
                          style={{ width: `${debtFillPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* 5. Faizli Varlık Oranı */}
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#182542]">
                        %{comp.cashRatioPercent.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-[#7B8FA8] font-mono">
                        / %{threshold}
                      </span>
                    </td>

                    {/* 6. Uygunsuz Gelir Oranı */}
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-xs ${
                          comp.impureIncomePercent <= 5
                            ? "text-[#0D9F6E]"
                            : "text-[#E11D48]"
                        }`}
                      >
                        %{comp.impureIncomePercent.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-[#7B8FA8] font-mono">
                        / %5
                      </span>
                    </td>

                    {/* 7. Detay Aksiyon Butonu */}
                    <td className="py-4 pl-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white group-hover:bg-[#182542] text-[#182542] group-hover:text-white border border-[#DCE5F2] text-xs font-bold transition shadow-xs">
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
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-[#EEF3F9]">
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
