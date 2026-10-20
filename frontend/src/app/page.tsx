"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Decimal from "decimal.js";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  ChevronRight,
  Calculator,
  Calendar,
  Scale,
  Briefcase,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";

/**
 * Payno tarzı tam sayı ve ondalık kısmı ayrı renklendiren yardımcı bileşen
 * Örn: ₺371.00 -> "₺371." (#182542) + "00" (#6E81A0)
 */
function PaynoSplitPrice({
  value,
  prefix = "₺",
  className = "text-lg",
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
    <span className={`font-mono tabular tracking-tight ${className}`}>
      <span className="font-bold text-[#182542]">
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

  // Hero vitrininde seçili hisse
  const [heroTicker, setHeroTicker] = useState<string>("BIMAS");

  // Tarayıcı filtreleri
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "COMPLIANT" | "NON_COMPLIANT" | "IPO"
  >("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("TÜMÜ");
  const [standard, setStandard] = useState<"BIST" | "AAOIFI">("BIST");
  const [visibleLimit, setVisibleLimit] = useState<number>(60);

  // Hızlı Arındırma Widget State
  const [calcTicker, setCalcTicker] = useState<string>("BIMAS");
  const [calcLots, setCalcLots] = useState<string>("100");
  const [calcDays, setCalcDays] = useState<string>("90");

  // Tüm sektörlerin listesi
  const allSectors = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.sector) set.add(c.sector);
    });
    return ["TÜMÜ", ...Array.from(set).sort((a, b) => a.localeCompare(b, "tr"))];
  }, [companies]);

  // İstatistikler
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
  const ipoCount = useMemo(
    () =>
      companies.filter((c) => (c as { isXharzIpo?: boolean }).isXharzIpo).length || 57,
    [companies]
  );

  // Hero'da gösterilen aktif hisse objesi
  const heroCompany = useMemo(() => {
    return (
      companies.find((c) => c.ticker === heroTicker) ||
      companies.find((c) => c.ticker === "BIMAS") ||
      companies[0]
    );
  }, [companies, heroTicker]);

  // Filtrelenmiş şirket listesi (626 hisse içinde anlık arama & filtreleme)
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    return companies.filter((c) => {
      const st = standard === "BIST" ? c.bistStatus : c.aaoifiStatus;
      const isIpo = Boolean((c as { isXharzIpo?: boolean }).isXharzIpo);

      if (statusFilter === "COMPLIANT" && st !== "COMPLIANT") return false;
      if (statusFilter === "NON_COMPLIANT" && st === "COMPLIANT") return false;
      if (statusFilter === "IPO" && !isIpo) return false;

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

  // Hızlı Arındırma Hesabı
  const selectedCalcCompany = useMemo(
    () => companies.find((c) => c.ticker === calcTicker) || companies[0],
    [companies, calcTicker]
  );

  const calculatedPurification = useMemo(() => {
    try {
      if (!selectedCalcCompany) return "0.00";
      const lots = new Decimal(calcLots || "0");
      const days = new Decimal(calcDays || "0");
      const perShare = new Decimal(
        selectedCalcCompany.purificationPerShareTRY || "0"
      );
      if (lots.lte(0) || days.lte(0) || perShare.lte(0)) return "0.00";
      return lots.mul(perShare).mul(days.div(90)).toFixed(2);
    } catch {
      return "0.00";
    }
  }, [selectedCalcCompany, calcLots, calcDays]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-24 space-y-8">
      {/* ===================================================================== */}
      {/* 1. PAYNO BY ORBIX STUDIO — SKY-MIST VITRIN & INTERACTIVE PHONE HERO   */}
      {/* ===================================================================== */}
      <section className="payno-sky-hero p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Yumuşak bulut / ışık efektleri */}
        <div className="absolute -bottom-24 -left-20 w-96 h-96 rounded-full bg-white/70 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-white/70 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* SOL SÜTUN: Payno Büyük İnce Tipografi & Yüzen İstatistik Kartları */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-white text-[#182542] text-xs font-semibold mb-4 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
                <span>Borsa İstanbul 7/24 Canlı Katılım Ekosistemi</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-light text-[#182542] tracking-tight leading-[1.12]">
                Hisselerinizi <br />
                <span className="font-normal italic font-serif">Katılımla</span>{" "}
                Yönetin
              </h1>
            </div>

            {/* Payno Sol Yüzen Mini Grafik Kartı (1,235 / 456 stili) */}
            <div className="bg-white/65 backdrop-blur-xl border border-white rounded-[24px] p-4 shadow-[0_12px_32px_rgba(24,37,66,0.06)] max-w-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#182542]/10 pb-2.5">
                <svg className="w-16 h-7" viewBox="0 0 64 28" fill="none">
                  <path
                    d="M2 22C10 20 14 10 22 14C30 18 36 6 46 8C54 10 58 4 62 3"
                    stroke="#12B76A"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="62" cy="3" r="2.5" fill="#12B76A" />
                </svg>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#182542] font-mono">
                    {compliantCount}{" "}
                    <span className="text-[#12B76A] text-xs">↑</span>
                  </div>
                  <div className="text-[11px] text-[#6E81A0]">
                    XKTUM Katılım Uygun Şirket
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <svg className="w-16 h-7" viewBox="0 0 64 28" fill="none">
                  <path
                    d="M2 18C12 22 20 12 28 16C36 20 44 8 52 12C58 14 60 7 62 6"
                    stroke="#3B5BDB"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="62" cy="6" r="2.5" fill="#3B5BDB" />
                </svg>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#182542] font-mono">
                    {totalCount}{" "}
                    <span className="text-[#3B5BDB] text-xs">●</span>
                  </div>
                  <div className="text-[11px] text-[#6E81A0]">
                    Toplam Borsa İstanbul Payı
                  </div>
                </div>
              </div>
            </div>

            {/* Payno Sol Alt Yüzen "Transaction Limit / Halka Arz" Kartı */}
            <Link
              href="/ipo"
              className="bg-white/80 backdrop-blur-xl border border-white rounded-[22px] p-4 shadow-[0_12px_32px_rgba(24,37,66,0.06)] max-w-xs flex items-center justify-between hover:scale-[1.02] transition"
            >
              <div>
                <div className="text-[11px] font-semibold text-[#182542]">
                  BIST Halka Arz Endeksi
                </div>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#254EDA] font-mono">
                    {ipoCount} Şirket
                  </span>
                  <span className="text-[11px] text-[#6E81A0]">XHARZ Canlı</span>
                </div>
              </div>
              <div className="flex -space-x-2">
                {["ALTNY", "OBAMS", "LMKDC"].map((t, i) => (
                  <div
                    key={t}
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold font-mono text-white ${
                      i === 0
                        ? "bg-[#182542]"
                        : i === 1
                        ? "bg-[#12B76A]"
                        : "bg-[#254EDA]"
                    }`}
                  >
                    {t.slice(0, 3)}
                  </div>
                ))}
              </div>
            </Link>
          </div>

          {/* ORTA SÜTUN: Payno İnteraktif Telefon / Hisse Karne Vitrini */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Hızlı Hisse Seçici Haplar */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
              {["BIMAS", "ASELS", "TUPRS", "ENKAI", "THYAO", "GARAN"].map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setHeroTicker(t)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition ${
                      heroTicker === t
                        ? "bg-[#182542] text-white shadow-sm"
                        : "bg-white/70 text-[#182542] hover:bg-white"
                    }`}
                  >
                    {t}
                  </button>
                )
              )}
            </div>

            {heroCompany && (
              <div className="w-full max-w-[330px] rounded-[42px] border-[7px] border-[#182542] bg-gradient-to-b from-[#F9FBFE] via-[#EDF3FB] to-[#4A6495] p-5 shadow-[0_28px_60px_rgba(24,37,66,0.28)] text-[#182542] relative">
                {/* Üst Ada (Dynamic Island) & Saat */}
                <div className="flex items-center justify-between text-[11px] font-bold text-[#182542] mb-4 px-1">
                  <span>BIST</span>
                  <div className="w-20 h-4 rounded-full bg-[#182542]" />
                  <span className="font-mono text-[10px] text-[#12B76A]">
                    ● CANLI
                  </span>
                </div>

                {/* Kart Başlığı: Hisse Kodu & Uygunluk */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/companies/${heroCompany.ticker}`)
                    }
                    className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-[#182542]"
                  >
                    ‹
                  </button>
                  <div className="text-center">
                    <div className="text-base font-bold tracking-tight text-[#182542]">
                      {heroCompany.ticker}
                    </div>
                    <div className="text-[10px] text-[#6E81A0] max-w-[160px] truncate">
                      {heroCompany.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => refreshNow()}
                    className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-[#182542]"
                  >
                    <RefreshCw
                      size={13}
                      className={isRefreshing ? "animate-spin" : ""}
                    />
                  </button>
                </div>

                {/* Durum Rozeti */}
                <div className="flex justify-center mb-2">
                  {heroCompany.bistStatus === "COMPLIANT" ? (
                    <span className="px-3 py-1 rounded-full bg-[#E6F8EF] border border-[#BCEBD2] text-[#0F7A43] text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>BIST Katılım Endeksi (XKTUM) Uygun</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-[#FEECEB] border border-[#FAC9C6] text-[#C62E26] text-[11px] font-bold flex items-center gap-1">
                      <XCircle size={12} />
                      <span>Katılım Endeksi Kapsam Dışı</span>
                    </span>
                  )}
                </div>

                {/* Payno Dev Ayrık Tonlu Fiyat Gösterimi ($56.75 stili) */}
                <div className="text-center py-4">
                  <div className="text-[11px] font-medium text-[#6E81A0] mb-1">
                    Anlık Borsa İstanbul Fiyatı
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <PaynoSplitPrice
                      value={heroCompany.priceTRY}
                      className="text-4xl sm:text-[42px]"
                    />
                    <span
                      className={`text-sm font-bold font-mono ${
                        heroCompany.change24h.startsWith("-")
                          ? "text-[#F04438]"
                          : "text-[#12B76A]"
                      }`}
                    >
                      {heroCompany.change24h.startsWith("-") ? "↘" : "↗"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-center gap-3 text-[11px] text-[#6E81A0]">
                    <span>Günlük: {heroCompany.change24h}</span>
                    <span>•</span>
                    <span>Arındırma: ₺{heroCompany.purificationPerShareTRY}</span>
                  </div>
                </div>

                {/* İkili İç Kutu (Total Revenue / Monthly Expense stili) */}
                <div className="grid grid-cols-2 gap-2.5 mt-2">
                  <div className="bg-white/85 backdrop-blur-md rounded-2xl p-3 border border-white shadow-xs">
                    <span className="text-[10px] text-[#6E81A0] block">
                      Faizli Borç / PD
                    </span>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold font-mono text-[#182542]">
                        %{heroCompany.debtRatioPercent.toFixed(2)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          heroCompany.debtRatioPercent <= 33
                            ? "bg-[#E6F8EF] text-[#0F7A43]"
                            : "bg-[#FEECEB] text-[#C62E26]"
                        }`}
                      >
                        &lt;%33
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/85 backdrop-blur-md rounded-2xl p-3 border border-white shadow-xs">
                    <span className="text-[10px] text-[#6E81A0] block">
                      Uygunsuz Gelir
                    </span>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold font-mono text-[#182542]">
                        %{heroCompany.impureIncomePercent.toFixed(2)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          heroCompany.impureIncomePercent <= 5
                            ? "bg-[#E6F8EF] text-[#0F7A43]"
                            : "bg-[#FEECEB] text-[#C62E26]"
                        }`}
                      >
                        &lt;%5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alt Yuvarlak + Aksiyon Butonu (Add Money Your Bank stili) */}
                <div className="mt-5 pt-2 flex flex-col items-center text-white">
                  <Link
                    href={`/companies/${heroCompany.ticker}`}
                    className="w-11 h-11 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-white transition shadow-md"
                  >
                    <Plus size={20} />
                  </Link>
                  <span className="text-[11px] font-medium text-white/95 mt-1.5">
                    {heroCompany.ticker} Fıkhi Karnesini Aç
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SAĞ SÜTUN: Açıklama, Aksiyon ve Payno Donut Dağılım Kartı */}
          <div className="lg:col-span-4 space-y-6 flex flex-col items-start lg:items-end">
            <div className="max-w-xs space-y-4">
              <p className="text-sm text-[#182542]/85 leading-relaxed font-normal">
                Tüm <strong>{totalCount} Borsa İstanbul şirketini</strong>,{" "}
                <strong>{compliantCount} resmi XKTUM katılım hissesini</strong>{" "}
                ve <strong>{ipoCount} halka arzı</strong> tek bir ekranda
                şeffafça inceleyin, portföyünüzü güvenle arındırın.
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="#bist-screener"
                  className="px-6 py-2.5 rounded-full bg-white/80 hover:bg-white border border-[#182542]/20 text-[#182542] text-xs font-bold shadow-xs transition"
                >
                  Tüm {totalCount} Hisseyi Gör
                </a>
                <Link
                  href="/rehber"
                  className="px-5 py-2.5 rounded-full bg-[#182542] text-white text-xs font-semibold hover:bg-[#253861] transition"
                >
                  Fıkıh Rehberi
                </Link>
              </div>
            </div>

            {/* Payno Sağ Alt Donut Dağılım Kartı (65% / 20% / 15% stili) */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[26px] p-5 shadow-[0_16px_40px_rgba(24,37,66,0.08)] w-full max-w-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#182542]">
                  BIST Katılım Dağılımı
                </span>
                <span className="text-[10px] font-mono text-[#6E81A0]">
                  CANLI ENDEKS
                </span>
              </div>

              {/* SVG Donut Chart */}
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#254EDA"
                    strokeWidth="5"
                    strokeDasharray="38 62"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#F4A27E"
                    strokeWidth="5"
                    strokeDasharray="15 85"
                    strokeDashoffset="-40"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-[#182542] font-mono">
                    %38
                  </span>
                  <span className="text-[9px] text-[#6E81A0] font-semibold">
                    XKTUM Oranı
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#182542]">
                    <span className="w-2 h-2 rounded-full bg-[#254EDA]" />
                    <span>Katılım Uygun (XKTUM)</span>
                  </span>
                  <span className="font-mono font-bold text-[#182542]">
                    {compliantCount} Pay
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#182542]">
                    <span className="w-2 h-2 rounded-full bg-[#F4A27E]" />
                    <span>Halka Arz Endeksi (XHARZ)</span>
                  </span>
                  <span className="font-mono font-bold text-[#182542]">
                    {ipoCount} Pay
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#6E81A0]">
                    <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                    <span>Kapsam Dışı Paylar</span>
                  </span>
                  <span className="font-mono font-bold text-[#6E81A0]">
                    {nonCompliantCount} Pay
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. ORBIX ANALYTICS — 5'Lİ BENTO KPI SATIRI                            */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="payno-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#182542]">
              Toplam BIST Payı
            </span>
            <span className="w-7 h-7 rounded-full bg-[#EEF3F9] text-[#254EDA] flex items-center justify-center text-xs font-bold">
              B
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-bold text-[#182542] font-mono">
                {totalCount}
              </span>
              <span className="text-sm text-[#7B8FA8] font-mono">.00</span>
            </div>
            <span className="text-[11px] font-bold text-[#12B76A] flex items-center gap-0.5">
              ↑ %100 Canlı
            </span>
          </div>
        </div>

        <div className="payno-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#182542]">
              Katılım Uygun (XKTUM)
            </span>
            <span className="w-7 h-7 rounded-full bg-[#E6F8EF] text-[#12B76A] flex items-center justify-center text-xs font-bold">
              ✓
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-bold text-[#182542] font-mono">
                {compliantCount}
              </span>
              <span className="text-sm text-[#7B8FA8] font-mono">.00</span>
            </div>
            <span className="text-[11px] font-bold text-[#12B76A]">
              ↑ Resmi Endeks
            </span>
          </div>
        </div>

        <div className="payno-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#182542]">
              Kapsam Dışı Paylar
            </span>
            <span className="w-7 h-7 rounded-full bg-[#FEECEB] text-[#F04438] flex items-center justify-center text-xs font-bold">
              ✕
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-bold text-[#182542] font-mono">
                {nonCompliantCount}
              </span>
              <span className="text-sm text-[#7B8FA8] font-mono">.00</span>
            </div>
            <span className="text-[11px] font-bold text-[#F04438]">
              Eşik Üstü
            </span>
          </div>
        </div>

        <div className="payno-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#182542]">
              Halka Arzlar (XHARZ)
            </span>
            <span className="w-7 h-7 rounded-full bg-[#FEF4E6] text-[#B56107] flex items-center justify-center text-xs font-bold">
              ★
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-bold text-[#182542] font-mono">
                {ipoCount}
              </span>
              <span className="text-sm text-[#7B8FA8] font-mono">.00</span>
            </div>
            <Link
              href="/ipo"
              className="text-[11px] font-bold text-[#254EDA] hover:underline"
            >
              Takvimi Aç →
            </Link>
          </div>
        </div>

        <div className="payno-card p-5 space-y-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#182542]">
              Fıkhi Standart
            </span>
            <span className="w-7 h-7 rounded-full bg-[#EEF3F9] text-[#182542] flex items-center justify-center text-xs font-bold">
              ⚖
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-base font-extrabold text-[#182542]">
              TKBB &amp; AAOIFI
            </span>
            <Link
              href="/rehber"
              className="text-[11px] font-bold text-[#12B76A] hover:underline"
            >
              Cevazlar →
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. ANA BENTO ÇALIŞMA ALANI: SOL (626 HİSSE TARAYICI) + SAĞ (ARAÇLAR)   */}
      {/* ===================================================================== */}
      <section
        id="bist-screener"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* SOL ANA PANEL (8 SÜTUN): TÜM 626 BORSA İSTANBUL HİSSESİ TARAYICISI */}
        <div className="lg:col-span-8 payno-card p-5 sm:p-7 space-y-5">
          {/* Üst Başlık ve Standart Seçici */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6ECF5] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#182542] tracking-tight">
                  Tüm Borsa İstanbul Hisseleri ({filteredCompanies.length} /{" "}
                  {totalCount})
                </h2>
                {updatedAt && (
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F8EF] text-[#0F7A43] text-[10px] font-mono font-bold">
                    Canlı • {updatedAt}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E81A0] mt-0.5">
                Borsa İstanbul&apos;da işlem gören tüm şirketlerin anlık fiyatı,
                faizli borç rasyosu ve XKTUM katılım durumu.
              </p>
            </div>

            {/* BIST vs AAOIFI Switcher */}
            <div className="apple-segmented-group shrink-0">
              <button
                type="button"
                onClick={() => setStandard("BIST")}
                className={`apple-segmented-item ${
                  standard === "BIST" ? "active" : ""
                }`}
              >
                BIST XKTUM (&lt;%33)
              </button>
              <button
                type="button"
                onClick={() => setStandard("AAOIFI")}
                className={`apple-segmented-item ${
                  standard === "AAOIFI" ? "active" : ""
                }`}
              >
                AAOIFI (&lt;%30)
              </button>
            </div>
          </div>

          {/* Arama Çubuğu & Sektör Seçici */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E81A0]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleLimit(80);
                }}
                placeholder={`626 BIST hissesi içinde ara (Örn: ASELS, BIMAS, EREGL, SASA, KCHOL)...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-medium text-[#182542] placeholder:text-[#6E81A0] focus:outline-none focus:bg-white focus:border-[#273B69]"
              />
            </div>

            <div className="sm:col-span-5">
              <select
                value={sectorFilter}
                onChange={(e) => {
                  setSectorFilter(e.target.value);
                  setVisibleLimit(80);
                }}
                className="w-full px-4 py-2.5 rounded-full bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-semibold text-[#182542] focus:outline-none focus:bg-white"
              >
                {allSectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec === "TÜMÜ" ? "Tüm Sektörler (626 Şirket)" : sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Durum Filtre Hapları */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: `Tüm Paylar (${totalCount})` },
              {
                id: "COMPLIANT",
                label: `Katılım Uygun (${compliantCount})`,
              },
              {
                id: "NON_COMPLIANT",
                label: `Kapsam Dışı (${nonCompliantCount})`,
              },
              { id: "IPO", label: `Halka Arz Endeksi (${ipoCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id as typeof statusFilter);
                  setVisibleLimit(80);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? "bg-[#182542] text-white shadow-xs"
                    : "bg-[#F3F6FB] text-[#5B6E8C] hover:text-[#182542]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* HİSSE TABLOSU (Payno Diagonal Hatch Bar ve Split-Price ile) */}
          <div className="overflow-x-auto -mx-5 sm:-mx-7 px-5 sm:px-7">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6ECF5] text-[10px] font-bold uppercase tracking-wider text-[#6E81A0]">
                  <th className="py-3 pr-3">Şirket / Kod</th>
                  <th className="py-3 px-3 text-right">Canlı Fiyat</th>
                  <th className="py-3 px-3">Faizli Borç Rasyosu</th>
                  <th className="py-3 px-3">Katılım Durumu</th>
                  <th className="py-3 pl-3 text-right">Arındırma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F9] text-xs">
                {displayedCompanies.map((comp) => {
                  const status =
                    standard === "BIST" ? comp.bistStatus : comp.aaoifiStatus;
                  const isCompliant = status === "COMPLIANT";
                  const isNegative = comp.change24h.startsWith("-");
                  const debtPct = Math.min(100, (comp.debtRatioPercent / 33) * 100);

                  return (
                    <tr
                      key={comp.ticker}
                      onClick={() => router.push(`/companies/${comp.ticker}`)}
                      className="hover:bg-[#F6F9FD] cursor-pointer transition-colors group"
                    >
                      {/* Şirket */}
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                              isCompliant
                                ? "bg-[#E6F8EF]/70 border-[#BCEBD2] text-[#0F7A43]"
                                : "bg-[#F3F6FB] border-[#DCE5F2] text-[#182542]"
                            }`}
                          >
                            {comp.ticker.slice(0, 5)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#182542] group-hover:text-[#254EDA] transition-colors flex items-center gap-1.5">
                              <span className="font-mono">{comp.ticker}</span>
                              {(comp as { isXharzIpo?: boolean }).isXharzIpo && (
                                <span className="px-1.5 py-0.2 rounded bg-[#EEF3F9] text-[#254EDA] text-[9px] font-bold">
                                  XHARZ
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#6E81A0] truncate max-w-[180px] sm:max-w-[230px]">
                              {comp.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Canlı Fiyat & Değişim */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div>
                          <PaynoSplitPrice
                            value={comp.priceTRY}
                            className="text-xs sm:text-sm"
                          />
                        </div>
                        <span
                          className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold ${
                            isNegative ? "text-[#F04438]" : "text-[#12B76A]"
                          }`}
                        >
                          {isNegative ? (
                            <ArrowDownRight size={11} />
                          ) : (
                            <ArrowUpRight size={11} />
                          )}
                          {comp.change24h}
                        </span>
                      </td>

                      {/* Payno Diagonal Hatch Bar ile Borç Rasyosu */}
                      <td className="py-3.5 px-3 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="font-bold text-[#182542]">
                            %{comp.debtRatioPercent.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-[#6E81A0]">
                            /{standard === "BIST" ? "%33" : "%30"}
                          </span>
                        </div>
                        <div className="w-full h-2 payno-hatch-track">
                          <div
                            className={`h-full rounded-full ${
                              comp.debtRatioPercent <=
                              (standard === "BIST" ? 33 : 30)
                                ? "bg-[#12B76A]"
                                : "bg-[#F04438]"
                            }`}
                            style={{ width: `${Math.min(100, debtPct)}%` }}
                          />
                        </div>
                      </td>

                      {/* Katılım Durumu */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isCompliant ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full payno-badge-mint text-[11px]">
                            <CheckCircle2 size={12} />
                            <span>Katılım Uygun</span>
                          </span>
                        ) : status === "GRACE_PERIOD_TOLERANCE" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full payno-badge-amber text-[11px]">
                            <AlertTriangle size={12} />
                            <span>Hoşgörüde</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full payno-badge-coral text-[11px]">
                            <XCircle size={12} />
                            <span>Kapsam Dışı</span>
                          </span>
                        )}
                      </td>

                      {/* Arındırma */}
                      <td className="py-3.5 pl-3 text-right font-mono whitespace-nowrap">
                        <span className="font-semibold text-[#182542]">
                          ₺{comp.purificationPerShareTRY}
                        </span>
                        <span className="block text-[10px] text-[#6E81A0]">
                          /hisse
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Daha Fazla Göster / Tüm 626 Hisseyi Aç */}
          {visibleLimit < filteredCompanies.length && (
            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 100)}
                className="payno-btn-secondary text-xs"
              >
                +100 Şirket Daha Yükle ({displayedCompanies.length} /{" "}
                {filteredCompanies.length})
              </button>
              <button
                type="button"
                onClick={() => setVisibleLimit(filteredCompanies.length)}
                className="payno-btn-primary text-xs"
              >
                Tümünü Göster ({filteredCompanies.length} Şirket)
              </button>
            </div>
          )}
        </div>

        {/* SAĞ BENTO SÜTUNU (4 SÜTUN): PAYNO PLATINUM KART & PRATİK PANELLER */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. PAYNO PLATINUM KART + HIZLI ARINDIRMA PANELİ */}
          <div className="payno-card p-6 space-y-5">
            <div className="payno-platinum-card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/75 block">
                    Mizan Platinum Arındırma
                  </span>
                  <span className="text-lg font-bold tracking-tight">
                    Kuruşu Kuruşuna Hesapla
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Calculator size={16} />
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-white/80 block">
                  Hesaplanan Çeyreklik Arındırma Tutarı
                </span>
                <div className="text-3xl font-extrabold font-mono tracking-tight mt-0.5">
                  ₺{calculatedPurification.replace(".", ",")}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-white/80 pt-1 border-t border-white/20">
                <span>Seçili Pay: {calcTicker}</span>
                <span>Süre: {calcDays} Gün</span>
              </div>
            </div>

            {/* Hesaplama Girdileri */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#182542] block mb-1">
                  Hisse Seçin ({totalCount} BIST Şirketi)
                </label>
                <select
                  value={calcTicker}
                  onChange={(e) => setCalcTicker(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-bold text-[#182542] focus:outline-none"
                >
                  {companies.slice(0, 150).map((c) => (
                    <option key={c.ticker} value={c.ticker}>
                      {c.ticker} — {c.name.slice(0, 28)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#182542] block mb-1">
                    Lot Adedi
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={calcLots}
                    onChange={(e) => setCalcLots(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-mono font-bold text-[#182542]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#182542] block mb-1">
                    Elde Tutma (Gün)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={calcDays}
                    onChange={(e) => setCalcDays(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-mono font-bold text-[#182542]"
                  />
                </div>
              </div>

              <Link
                href="/purification"
                className="w-full payno-btn-primary text-xs py-2.5 mt-1"
              >
                <span>Detaylı Zekât &amp; Arındırma Paneli</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* 2. PAYNO DIAGONAL PROGRESS BARLI KATILIM KRİTERLERİ KARTI */}
          <div className="payno-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#182542]">
                TKBB &amp; XKTUM Eşik Limitleri
              </h3>
              <Link
                href="/rehber"
                className="text-xs font-bold text-[#254EDA] hover:underline"
              >
                Detaylar
              </Link>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="payno-inner-box p-3.5 space-y-2">
                <div className="flex justify-between font-semibold text-[#182542]">
                  <span>Faizli Borç / Piyasa Değeri</span>
                  <span className="font-mono">Maks. %33,00</span>
                </div>
                <div className="w-full h-3 payno-hatch-track p-0.5">
                  <div
                    className="h-full payno-hatch-fill"
                    style={{ width: "33%" }}
                  />
                </div>
              </div>

              <div className="payno-inner-box p-3.5 space-y-2">
                <div className="flex justify-between font-semibold text-[#182542]">
                  <span>Faizli Nakit &amp; Menkul / PD</span>
                  <span className="font-mono">Maks. %33,00</span>
                </div>
                <div className="w-full h-3 payno-hatch-track p-0.5">
                  <div
                    className="h-full payno-hatch-fill"
                    style={{ width: "33%" }}
                  />
                </div>
              </div>

              <div className="payno-inner-box p-3.5 space-y-2">
                <div className="flex justify-between font-semibold text-[#182542]">
                  <span>Uygun Olmayan Gelir / Hasılat</span>
                  <span className="font-mono text-[#0F7A43]">Maks. %5,00</span>
                </div>
                <div className="w-full h-3 payno-hatch-track p-0.5">
                  <div
                    className="h-full bg-[#12B76A] rounded-full"
                    style={{ width: "15%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. SON KAP BİLDİRİMLERİ & DUYURULAR */}
          <div className="payno-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#182542]">
                Canlı KAP KAFİF Akışı
              </h3>
              <span className="text-[10px] font-mono text-[#12B76A] font-bold">
                ● 7/24 Aktif
              </span>
            </div>

            <div className="space-y-2.5">
              {kapDisclosures.slice(0, 4).map((kap) => (
                <Link
                  key={kap.disclosureId}
                  href={`/companies/${kap.ticker}`}
                  className="block p-3 rounded-2xl bg-[#F7F9FC] hover:bg-[#EEF3F9] border border-[#E6ECF5] transition space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#182542]">
                      {kap.ticker}
                    </span>
                    <span className="text-[10px] font-mono text-[#6E81A0]">
                      {kap.publishedAt}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6E8C] line-clamp-2">
                    {kap.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
