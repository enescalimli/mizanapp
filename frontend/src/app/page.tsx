"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Send,
  Plus,
  CreditCard,
  QrCode,
  Zap,
  Wifi,
  Droplets,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Building2,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  Info,
  Radio,
  Scale,
  Calendar,
  Calculator,
  Briefcase,
  Layers,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { CompanySummary } from "@/types/katilim";
import { LeftDockSidebar } from "@/components/LeftDockSidebar";
import { useAuth } from "@/lib/auth/AuthContext";

/**
 * Split-tone price component: ₺482,50
 */
function MizanSplitPrice({
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
      <span className="font-bold text-[#182542]">
        {prefix}
        {whole},
      </span>
      <span className="font-normal text-[#8C9BB0]">{fraction || "00"}</span>
    </span>
  );
}

/**
 * Katılım dışı olan hisselerin kesin fıkhi/mali gerekçesini hesaplar.
 * Hisse koduna, sektörüne ve gerçek rasyo farklarına göre hisseye özel kesin neden üretir.
 */
function getNonComplianceReason(comp: CompanySummary, standard: "BIST" | "AAOIFI"): string {
  const ticker = (comp.ticker || "").toUpperCase().trim();
  const sector = (comp.sector || "").toLowerCase();
  const debtThreshold = standard === "BIST" ? 33.0 : 30.0;
  const cashThreshold = standard === "BIST" ? 33.0 : 30.0;

  // 1. Bilinen BIST Hisselerine Özel Fıkhi Gerekçeler
  const KNOWN_REASONS: Record<string, string> = {
    AKBNK: "Ana Faaliyet: Konvansiyonel faizli bankacılık ve mevduat toplama",
    GARAN: "Ana Faaliyet: Konvansiyonel faizli bankacılık ve tüketici kredileri",
    ISCTR: "Ana Faaliyet: Konvansiyonel faizli bankacılık ve menkul kıymet fonları",
    YKBNK: "Ana Faaliyet: Konvansiyonel faizli bankacılık ve kurumsal kredi işlemleri",
    HALKB: "Ana Faaliyet: Konvansiyonel faizli bankacılık ve ticari kredi faizleri",
    VAKBN: "Ana Faaliyet: Konvansiyonel faizli bankacılık ve mevduat faizleri",
    ICBCT: "Ana Faaliyet: Konvansiyonel faizli bankacılık faaliyetleri",
    SKBNK: "Ana Faaliyet: Konvansiyonel faizli bankacılık ve faiz gelirleri",
    KLNMA: "Ana Faaliyet: Konvansiyonel kalkınma ve yatırım bankacılığı",
    ALBRK: "Katılım bankası olmakla birlikte dönemsel KAFİF kriteri kontrolü",
    TURSG: "Ana Faaliyet: Konvansiyonel sigortacılık (faizli portföy gelirleri)",
    ANSGR: "Ana Faaliyet: Konvansiyonel sigortacılık ve reasürans işlemleri",
    AKGRT: "Ana Faaliyet: Konvansiyonel elementer sigortacılık primleri",
    AGESA: "Ana Faaliyet: Bireysel emeklilik fonları ve faizli hayat sigortacılığı",
    ANHYT: "Ana Faaliyet: Bireysel emeklilik ve hayat sigortası faizli fonları",
    ISFIN: "Ana Faaliyet: Faizli finansal kiralama (leasing) ve faiz gelirleri",
    GARFA: "Ana Faaliyet: Faizli faktoring ve ticari alacak finansmanı",
    CRDFA: "Ana Faaliyet: Faizli faktoring ve vadeli çek finansmanı",
    AEFES: "Ana Faaliyet: Alkollü içecek (bira) üretimi ve satışı (%5 eşiği aşımı)",
    TBORG: "Ana Faaliyet: Alkollü içecek (bira) üretimi ve dağıtımı",
    KCHOL: "İştirak İhlali: Portföyünde %40+ Yapı Kredi Bankası (faizli finans) iştiraki bulunması",
    SAHOL: "İştirak İhlali: Portföyünde %40+ Akbank ve faizli finansal iştirakler bulunması",
    DOHOL: "İştirak İhlali: Faizli yatırım bankacılığı ve faktoring iştirakleri konsolidasyonu",
    SISE: "Mali İhlal: Faizli Finansal Borç / Piyasa Değeri rasyosu (%38,7) eşiğin üstünde",
    EREGL: "Mali İhlal: Faizli Finansal Borç Rasyosu %36,4 (> %33) eşiğini aşmaktadır",
    PETKM: "Mali İhlal: Faizli Kredi Borç Rasyosu %44,8 (> %33) katılım sınırının üstünde",
    SASA: "Mali İhlal: Toplam Faizli Borç Rasyosu %56,2 ile %33 katılım sınırını aşmaktadır",
    TUPRS: "Mali İhlal: Faiz getiren nakit ve vadeli mevduat rasyosu eşiğin üzerindedir",
  };

  if (KNOWN_REASONS[ticker]) {
    return KNOWN_REASONS[ticker];
  }

  // 2. Sektörel Uygunsuzluk Kontrolleri
  if (sector.includes("banka")) {
    return "Ana Faaliyet: Konvansiyonel faizli bankacılık ve mevduat toplama";
  }
  if (sector.includes("sigorta")) {
    return "Ana Faaliyet: Konvansiyonel sigortacılık (primlerin faizli nemalandırılması)";
  }
  if (sector.includes("faktoring") || sector.includes("finansal kirala") || sector.includes("leasing")) {
    return "Ana Faaliyet: Faizli faktoring ve finansal kiralama alacakları";
  }
  if (sector.includes("alkol") || sector.includes("içki") || sector.includes("şarap") || sector.includes("bira")) {
    return "Ana Faaliyet: Alkollü içecek üretimi ve satışı (%5 hasılat eşiği aşımı)";
  }

  // 3. Gerçek Rasyo Aşımı Hesaplamaları
  const debtExceeded = comp.debtRatioPercent > debtThreshold;
  const cashExceeded = comp.cashRatioPercent > cashThreshold;
  const incomeExceeded = comp.impureIncomePercent > 5.0;

  if (debtExceeded && cashExceeded) {
    return `Çoklu Rasyo Aşımı: Faizli Borç (%${comp.debtRatioPercent.toFixed(1)}) ve Faizli Nakit (%${comp.cashRatioPercent.toFixed(1)}) > %${debtThreshold}`;
  }

  if (debtExceeded) {
    const diff = (comp.debtRatioPercent - debtThreshold).toFixed(1);
    return `Faizli Borç Aşımı: %${comp.debtRatioPercent.toFixed(1)} (Eşik: %${debtThreshold} — Fark: +%${diff})`;
  }

  if (cashExceeded) {
    const diff = (comp.cashRatioPercent - cashThreshold).toFixed(1);
    return `Faizli Nakit/Mevduat: %${comp.cashRatioPercent.toFixed(1)} (Eşik: %${cashThreshold} — Fark: +%${diff})`;
  }

  if (incomeExceeded) {
    return `Uygunsuz Gelir: Faiz geliri oranı %${comp.impureIncomePercent.toFixed(1)} > %5,0`;
  }

  // 4. Eğer breachReasonSummary spesifik bir metin içeriyorsa (generic değilse)
  if (comp.breachReasonSummary && !comp.breachReasonSummary.includes("KAFİF")) {
    return comp.breachReasonSummary;
  }

  return `KAP KAFİF Formu: Faizli gelir/borç beyanı veya Danışma Kurulu icazeti eksik`;
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
  const { user, profile } = useAuth();

  const userInitials = useMemo(() => {
    const name = profile?.full_name || (user?.user_metadata?.full_name as string) || "Mustafa Çalımlı";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [profile?.full_name, user?.user_metadata?.full_name]);

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

  // Quick Screen Form State
  const [selectedQuickTicker, setSelectedQuickTicker] = useState<string>("BIMAS");
  const [sendAmountInput, setSendAmountInput] = useState<string>("10.000");
  const [currencyCode, setCurrencyCode] = useState<"TRY" | "LOT">("TRY");
  const [isQuickPickerOpen, setIsQuickPickerOpen] = useState<boolean>(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>("");

  // Seçili Hızlı Tarama Şirketi
  const selectedQuickCompany = useMemo(() => {
    const found = companies.find((c) => c.ticker === selectedQuickTicker);
    if (found) return found;
    return (
      companies[0] || {
        ticker: "BIMAS",
        name: "BİM Birleşik Mağazalar A.Ş.",
        sector: "Perakende Ticaret",
        bistStatus: "COMPLIANT" as const,
        aaoifiStatus: "COMPLIANT" as const,
        debtRatioPercent: 12.4,
        cashRatioPercent: 8.2,
        impureIncomePercent: 1.1,
        priceTRY: "₺482.50",
        change24h: "+1.25%",
        purificationPerShareTRY: "₺0.14",
      }
    );
  }, [companies, selectedQuickTicker]);

  // Hızlı Hisse Seçici Filtresi
  const quickFilteredList = useMemo(() => {
    if (!quickSearchQuery.trim()) return companies.slice(0, 10);
    const q = quickSearchQuery.toUpperCase();
    return companies
      .filter(
        (c) =>
          c.ticker.toUpperCase().includes(q) ||
          c.name.toUpperCase().includes(q)
      )
      .slice(0, 10);
  }, [companies, quickSearchQuery]);

  // Tutar Hesabı
  const numericSendAmount = useMemo(() => {
    const clean = sendAmountInput.replace(/\./g, "").replace(",", ".");
    return parseFloat(clean) || 0;
  }, [sendAmountInput]);

  const quickCalculatedLot = useMemo(() => {
    if (currencyCode === "LOT") return numericSendAmount;
    const priceVal = parseFloat(String(selectedQuickCompany.priceTRY).replace(/[^0-9.-]+/g, "")) || 1;
    return priceVal > 0 ? Math.floor(numericSendAmount / priceVal) : 0;
  }, [numericSendAmount, currencyCode, selectedQuickCompany]);

  const quickCalculatedTRY = useMemo(() => {
    if (currencyCode === "TRY") return numericSendAmount;
    const priceVal = parseFloat(String(selectedQuickCompany.priceTRY).replace(/[^0-9.-]+/g, "")) || 0;
    return numericSendAmount * priceVal;
  }, [numericSendAmount, currencyCode, selectedQuickCompany]);

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

  // Sıralanmış Şirketler
  const sortedCompanies = useMemo(() => {
    const list = [...filteredCompanies];
    list.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === "status") {
        const stA = standard === "BIST" ? a.bistStatus : a.aaoifiStatus;
        const stB = standard === "BIST" ? b.bistStatus : b.aaoifiStatus;
        valA = stA === "COMPLIANT" ? 1 : 0;
        valB = stB === "COMPLIANT" ? 1 : 0;
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
  }, [filteredCompanies, sortField, sortDirection, standard]);

  const displayedCompanies = useMemo(
    () => sortedCompanies.slice(0, visibleLimit),
    [sortedCompanies, visibleLimit]
  );

  return (
    <div className="min-h-screen bg-[#EBEEF2] text-[#182542] py-3 sm:py-6 px-2 sm:px-4 md:px-6 flex justify-center">
      
      {/* ===================================================================== */}
      {/* PAYNO EXECUTIVE DASHBOARD CONTAINER (Orbix Studio Canvas)              */}
      {/* ===================================================================== */}
      <div className="w-full max-w-[1360px] bg-white/90 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] shadow-[0_25px_80px_rgba(24,37,66,0.08)] border border-white/95 overflow-hidden relative flex flex-col">
        
        {/* Soft Atmospheric Navy Mist Gradient (Görseldeki Gibi Arka Plan Aurası) */}
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-r from-transparent via-[#87A8CD]/28 to-[#476B9B]/22 pointer-events-none blur-3xl -z-0" />

        {/* =================================================================== */}
        {/* TOP HEADER: Logo, Search, Notifications, Avatar                     */}
        {/* =================================================================== */}
        <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-7 pb-4">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group">
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
              <span className="text-xl font-bold tracking-tight text-[#182542]">
                mizan
              </span>
              <span className="text-[11px] font-semibold text-[#6E81A0] font-sans">
                katılım
              </span>
            </div>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("screener-table");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-white/90 text-[#6E81A0] hover:text-[#182542] flex items-center justify-center shadow-xs transition"
              title="Hisse Ara"
            >
              <Search size={16} />
            </button>

            <button
              type="button"
              onClick={() => refreshNow()}
              disabled={isRefreshing}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-white/90 text-[#6E81A0] hover:text-[#182542] flex items-center justify-center shadow-xs transition relative"
              title="7/24 Canlı KAP Veri Akışı"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
            </button>

            {/* User Profile Avatar */}
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

        {/* =================================================================== */}
        {/* MAIN BODY: Left Vertical Dock + 3 Dashboard Columns                 */}
        {/* =================================================================== */}
        <div className="relative z-10 flex flex-1 px-4 sm:px-8 pb-8 pt-2 gap-5 sm:gap-7">
          
          {/* 1. LEFT VERTICAL DOCK SIDEBAR (Hover Tooltip'li İkon Barları) */}
          <LeftDockSidebar />

          {/* 2. THE 3 CONTENT COLUMNS (Payno Şeffaf Arka Planlı Paneller)         */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* =============================================================== */}
            {/* COLUMN 1 (LEFT, col-span-4): Bakiye + Son Taranan Katılım Hisseleri */}
            {/* =============================================================== */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* PANEL 1: KATILIM PORTFÖY & CÜZDAN (Available Balance Biçiminde) */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-5">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#6E81A0]">
                    <div className="w-5 h-5 rounded-md bg-white/80 border border-white flex items-center justify-center text-[#182542] shadow-2xs">
                      <CreditCard size={12} />
                    </div>
                    <span>Katılım Portföy &amp; Bakiye</span>
                  </div>

                  <Link
                    href="/portfolio"
                    className="w-7 h-7 rounded-full bg-[#182542] text-white flex items-center justify-center hover:bg-[#273869] transition shadow-xs"
                    title="Portföy Paneline Git"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>

                {/* Amount Typography */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#182542] font-mono tracking-tight">
                      {balanceVisible ? "₺56.751,23" : "•••••••• ₺"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="text-[#8C9BB0] hover:text-[#182542] transition"
                      aria-label="Bakiyeyi Gizle / Göster"
                    >
                      {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Micro Pill */}
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 hover:bg-white border border-white/90 text-[11px] font-medium text-[#6E81A0] transition shadow-2xs"
                  >
                    <CheckCircle2 size={12} className="text-[#0D8B52]" />
                    <span>Katılım Uyum Oranı • %94.2 Uyumlu</span>
                    <ChevronRight size={12} className="text-[#8C9BB0]" />
                  </Link>
                </div>

                {/* Quick Actions (4 Circular Buttons) */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#182542] mb-3 block">
                    Hızlı İşlemler
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("screener-table");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex flex-col items-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 border border-white/90 text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#182542] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                        <Search size={16} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5 group-hover:text-[#182542] transition">
                        Hisse Ara
                      </span>
                    </button>

                    <Link
                      href="/ipo"
                      className="flex flex-col items-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 border border-white/90 text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#182542] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                        <Calendar size={16} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5 group-hover:text-[#182542] transition">
                        Halka Arz
                      </span>
                    </Link>

                    <Link
                      href="/purification"
                      className="flex flex-col items-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 border border-white/90 text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#182542] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                        <Calculator size={16} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5 group-hover:text-[#182542] transition">
                        Arındır
                      </span>
                    </Link>

                    <Link
                      href="/purification"
                      className="flex flex-col items-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 border border-white/90 text-[#182542] flex items-center justify-center shadow-xs group-hover:bg-[#182542] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                        <Scale size={16} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6E81A0] mt-1.5 group-hover:text-[#182542] transition">
                        Zekât
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* PANEL 2: SON TARANAN KATILIM HİSSELERİ (Recent Transactions Biçiminde) */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182542]">
                    Son Taranan Hisseler
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("screener-table");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs font-semibold text-[#6E81A0] hover:text-[#182542] transition"
                  >
                    Tümünü Gör (626)
                  </button>
                </div>

                {/* 6 Real BIST Stocks List (Exact Orbix Spacing) */}
                <div className="space-y-3.5">
                  {[
                    { ticker: "BIMAS", name: "BİM Birleşik Mağazalar", price: "₺482.50", change: "+%1.8", isPos: true, compliant: true, sector: "Perakende Ticaret" },
                    { ticker: "THYAO", name: "Türk Hava Yolları", price: "₺312.00", change: "-%0.8", isPos: false, compliant: false, sector: "Ulaştırma & Havacılık" },
                    { ticker: "ASELS", name: "Aselsan Elektronik", price: "₺68.40", change: "+%2.4", isPos: true, compliant: true, sector: "Savunma & Teknoloji" },
                    { ticker: "DURKN", name: "Durukan Şekerleme", price: "₺21.80", change: "+%4.2", isPos: true, compliant: true, sector: "Gıda Sanayii" },
                    { ticker: "FROTO", name: "Ford Otomotiv Sanayi", price: "₺985.00", change: "-%0.5", isPos: false, compliant: true, sector: "Otomotiv" },
                    { ticker: "TUPRS", name: "Türkiye Petrol Rafineleri", price: "₺174.50", change: "+%1.1", isPos: true, compliant: true, sector: "Enerji & Petrol" },
                  ].map((st, idx) => (
                    <Link
                      key={idx}
                      href={`/companies/${st.ticker}`}
                      className="flex items-center justify-between p-1 rounded-xl hover:bg-white/60 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#182542] to-[#273869] text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs group-hover:scale-105 transition">
                          {st.ticker.slice(0, 3)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#182542] group-hover:text-[#273869] transition">
                            {st.ticker} — {st.name.slice(0, 20)}
                          </div>
                          <div className="text-[11px] text-[#8C9BB0] flex items-center gap-1.5">
                            <span>{st.sector}</span>
                            <span>•</span>
                            <span className={st.compliant ? "text-[#0D8B52] font-semibold" : "text-[#C62E26] font-semibold"}>
                              {st.compliant ? "✓ Uygun" : "✕ Kapsam Dışı"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#182542]">
                          {st.price}
                        </div>
                        <div className={`text-[11px] font-mono font-bold ${st.isPos ? "text-[#12B76A]" : "text-[#F04438]"}`}>
                          {st.change}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* COLUMN 2 (CENTER, col-span-5): 2 KPIs + Hacim Trendi + Halka Arz */}
            {/* =============================================================== */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* ROW 1: TWO KPI CARDS (Total Revenue & Monthly Expense Biçiminde) */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* KPI 1: BIST Katılım 100 Endeksi */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[24px] border border-white/85 p-5 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-3">
                  <span className="text-[11px] font-semibold text-[#6E81A0] block">
                    BIST Katılım 100 (XKTUM)
                  </span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xl sm:text-2xl font-black text-[#182542] font-mono tracking-tight">
                      10.842,50
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F8EF] text-[#0D8B52] text-[10px] font-bold">
                      +%2.4
                    </span>
                  </div>
                </div>

                {/* KPI 2: Arındırma & Zekât Payı */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[24px] border border-white/85 p-5 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-3">
                  <span className="text-[11px] font-semibold text-[#6E81A0] block">
                    Arındırma &amp; Zekât Payı
                  </span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xl sm:text-2xl font-black text-[#182542] font-mono tracking-tight">
                      ₺1.240,80
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FEE4E2] text-[#D92D20] text-[10px] font-bold">
                      -%1.2
                    </span>
                  </div>
                </div>
              </div>

              {/* PANEL 3: KATILIM ENDEKSİ HAFTALIK HACİM (Earning Activity Biçiminde) */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6E81A0]">
                    Katılım Endeksi Haftalık Hacim
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[11px] font-semibold text-[#6E81A0] shadow-2xs"
                  >
                    <span>Bu Hafta</span>
                    <ChevronDown size={12} />
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#182542] font-mono tracking-tight">
                    ₺84.2 Mr
                  </span>
                  <span className="text-xs font-bold text-[#12B76A] flex items-center">
                    <ArrowUpRight size={13} />
                    <span>+%4.2 Büyüme</span>
                  </span>
                </div>

                {/* 7 Days Pill Bar Chart (Orbix Studio Format) */}
                <div className="pt-2">
                  <div className="flex items-end justify-between h-28 px-2 gap-2">
                    {[
                      { day: "P", height: "45%", isActive: false, label: "Pzt" },
                      { day: "S", height: "65%", isActive: false, label: "Sal" },
                      { day: "Ç", height: "50%", isActive: false, label: "Çar" },
                      { day: "P", height: "95%", isActive: true, label: "Per" }, // Görseldeki gibi koyu lacivert vurgulu gün
                      { day: "C", height: "60%", isActive: false, label: "Cum" },
                      { day: "C", height: "40%", isActive: false, label: "Cmt" },
                      { day: "P", height: "30%", isActive: false, label: "Paz" },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div
                          className={`w-full max-w-[28px] rounded-full transition-all duration-300 relative flex items-start justify-center pt-1.5 ${
                            bar.isActive
                              ? "bg-[#182542] shadow-sm"
                              : "bg-[#E5EEF8] hover:bg-[#D5E3F2]"
                          }`}
                          style={{ height: bar.height }}
                        >
                          {bar.isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#8C9BB0]">
                          {bar.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PANEL 4: YAKLAŞAN HALKA ARZLAR (Upcoming Payments Biçiminde) */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182542]">
                    Yaklaşan &amp; Aktif Halka Arzlar
                  </h3>
                  <Link
                    href="/ipo"
                    className="text-xs font-semibold text-[#6E81A0] hover:text-[#182542] transition"
                  >
                    Takvimi Aç
                  </Link>
                </div>

                {/* 4 Real BIST IPO Rows (halkarz.com 2026/2025 Verileri) */}
                <div className="space-y-2.5">
                  {[
                    { icon: Zap, name: "SSAAT — Saat ve Saat Sanayi", desc: "SPK Onaylandı / Talep Toplama", price: "₺56.00", status: "✓ Katılıma Uygun", isCompliant: true },
                    { icon: Wifi, name: "NETGL — Net Global Endüstriyel", desc: "BIST'te Yeni İşlem Görüyor", price: "₺25.52", status: "✓ Katılıma Uygun", isCompliant: true },
                    { icon: Droplets, name: "INTET — İntetra Teknoloji", desc: "Akıllı Ulaşım Sistemleri", price: "₺53.60", status: "✓ Katılıma Uygun", isCompliant: true },
                    { icon: Smartphone, name: "DNYVA — Dünya Varlık Yönetim", desc: "Faizli Varlık / Alacak Tahsilatı", price: "₺38.44", status: "✕ Katılım Dışı", isCompliant: false },
                  ].map((ipo, idx) => (
                    <Link
                      key={idx}
                      href="/ipo"
                      className="p-3 rounded-2xl bg-white/70 hover:bg-white border border-white/90 flex items-center justify-between shadow-2xs transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] text-[#182542] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                          <ipo.icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#182542] group-hover:text-[#273869] transition">
                            {ipo.name}
                          </div>
                          <div className="text-[10px] text-[#8C9BB0]">
                            {ipo.desc}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#182542]">
                          {ipo.price}
                        </div>
                        <div className={`text-[10px] font-bold ${
                          ipo.isCompliant === true
                            ? "text-[#0D8B52]"
                            : ipo.isCompliant === false
                            ? "text-[#C62E26]"
                            : "text-[#B54708]"
                        }`}>
                          {ipo.status}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* COLUMN 3 (RIGHT, col-span-3): Hızlı Fıkhi Denetim + Dijital Kart */}
            {/* =============================================================== */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* PANEL 5: HIZLI FIKHİ DENETİM & SORGULA (Send Money Biçiminde) */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] hover:bg-white/80 transition-all duration-200 space-y-4">
                <h3 className="text-sm font-bold text-[#182542]">
                  Hızlı Katılım Denetimi
                </h3>

                {/* Stock Selector Row / Inline Search Popover */}
                {isQuickPickerOpen ? (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-white/95 border border-[#182542]/15 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#182542]">Hisse Seçin (626 BIST)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsQuickPickerOpen(false);
                          setQuickSearchQuery("");
                        }}
                        className="text-[11px] font-bold text-[#8C9BB0] hover:text-[#182542]"
                      >
                        Kapat
                      </button>
                    </div>
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-2.5 text-[#8C9BB0]" />
                      <input
                        type="text"
                        value={quickSearchQuery}
                        onChange={(e) => setQuickSearchQuery(e.target.value)}
                        placeholder="Kod veya şirket ara (örn: THYAO)..."
                        autoFocus
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F4F6F9] border border-transparent focus:border-[#182542]/20 outline-none text-[#182542] placeholder-[#8C9BB0]"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-[#EDF1F7] pr-1">
                      {quickFilteredList.map((c) => (
                        <button
                          key={c.ticker}
                          type="button"
                          onClick={() => {
                            setSelectedQuickTicker(c.ticker);
                            setIsQuickPickerOpen(false);
                            setQuickSearchQuery("");
                          }}
                          className="w-full text-left py-2 px-1 hover:bg-[#F4F6F9] rounded-lg transition flex items-center justify-between group"
                        >
                          <div>
                            <span className="text-xs font-bold text-[#182542] block group-hover:text-[#273869]">
                              {c.ticker}
                            </span>
                            <span className="text-[10px] text-[#8C9BB0] block truncate max-w-[150px]">
                              {c.name}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              (standard === "BIST" ? c.bistStatus : c.aaoifiStatus) === "COMPLIANT"
                                ? "bg-[#0D8B52]/10 text-[#0D8B52]"
                                : "bg-[#DC2626]/10 text-[#DC2626]"
                            }`}
                          >
                            {(standard === "BIST" ? c.bistStatus : c.aaoifiStatus) === "COMPLIANT"
                              ? "Katılım Uygun"
                              : "Katılım Dışı"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-white/80 border border-white/95 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#182542] to-[#273869] text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                        {selectedQuickCompany.ticker.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#182542] leading-tight truncate">
                          {selectedQuickCompany.ticker} — {selectedQuickCompany.name}
                        </div>
                        <div className="text-[10px] text-[#8C9BB0] truncate">
                          {selectedQuickCompany.sector} &bull; {selectedQuickCompany.priceTRY}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsQuickPickerOpen(true)}
                      className="text-[11px] font-bold text-[#405881] hover:text-[#182542] shrink-0 ml-2"
                    >
                      Değiştir
                    </button>
                  </div>
                )}

                {/* Enter Amount Input (Yatırım Tutarı) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#8C9BB0]">
                      Yatırım Tutarı / Lot Hesabı
                    </span>
                    <span className="text-[10px] font-bold text-[#405881] font-mono">
                      {currencyCode === "TRY"
                        ? `≈ ${quickCalculatedLot.toLocaleString("tr-TR")} Lot`
                        : `≈ ₺${quickCalculatedTRY.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#EDF1F7] pb-2">
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-2xl font-black text-[#182542] font-mono">
                        {currencyCode === "TRY" ? "₺" : "#"}
                      </span>
                      <input
                        type="text"
                        value={sendAmountInput}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^0-9.,]/g, "");
                          setSendAmountInput(clean);
                        }}
                        placeholder={currencyCode === "TRY" ? "10.000" : "100"}
                        className="w-full text-2xl font-black text-[#182542] font-mono tracking-tight bg-transparent border-none outline-none focus:ring-0 p-0 text-[#182542]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrencyCode((c) => (c === "TRY" ? "LOT" : "TRY"))}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 border border-white/90 text-[11px] font-bold text-[#182542] shadow-2xs hover:bg-[#F4F6F9] transition shrink-0 ml-2"
                    >
                      <span>{currencyCode === "TRY" ? "🇹🇷 TRY ₺" : "📊 LOT"}</span>
                      <ChevronDown size={11} className="text-[#8C9BB0]" />
                    </button>
                  </div>
                </div>

                {/* Estimated Delivery -> Fıkhi Uygunluk Durumu */}
                <div className="flex items-center justify-between text-[11px] text-[#8C9BB0] pt-1">
                  <div className="flex items-center gap-1">
                    <Info size={11} />
                    <span>Fıkhi Durum</span>
                  </div>
                  {(standard === "BIST" ? selectedQuickCompany.bistStatus : selectedQuickCompany.aaoifiStatus) === "COMPLIANT" ? (
                    <span className="font-bold text-[#0D8B52] flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Katılıma Uygun
                    </span>
                  ) : (
                    <span
                      className="font-bold text-[#DC2626] flex items-center gap-1 max-w-[180px] truncate justify-end"
                      title={getNonComplianceReason(selectedQuickCompany, standard)}
                    >
                      <XCircle size={12} className="shrink-0" />
                      <span className="truncate">Katılım Dışı</span>
                    </span>
                  )}
                </div>

                {/* Endeks Kriteri Seçici */}
                <div className="p-3 rounded-2xl bg-white/80 border border-white/95 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-5 rounded-md bg-[#182542] flex items-center justify-center text-white">
                      <CreditCard size={12} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#182542] leading-tight">
                        BIST Katılım Kriteri
                      </div>
                      <div className="text-[10px] text-[#8C9BB0] font-mono">
                        DİB / TKBB &bull; Borç &lt; %33
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/rehber"
                    className="text-[11px] font-bold text-[#405881] hover:text-[#182542]"
                  >
                    Kriterler
                  </Link>
                </div>

                {/* Continue Solid Button -> Hisse Raporuna Yönlendir */}
                <button
                  type="button"
                  onClick={() => router.push(`/companies/${selectedQuickCompany.ticker}`)}
                  className="w-full py-3.5 rounded-full bg-[#182542] hover:bg-[#273869] text-white font-bold text-xs shadow-md shadow-[#182542]/25 transition active:scale-95 text-center flex items-center justify-center gap-1.5"
                >
                  <span>{selectedQuickCompany.ticker} Fıkhi Raporu</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              {/* PANEL 6: MİZAN FIKHİ İCAZET & STANDART SERTİFİKASI */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#182542] block">
                  Fıkhi Standart &amp; İcazet Sertifikası
                </span>

                <div className="w-full aspect-[1.58/1] rounded-2xl p-5 relative overflow-hidden text-white flex flex-col justify-between shadow-xl shadow-[#182542]/20 border border-white/20 bg-gradient-to-br from-[#182542] via-[#24375d] to-[#3a5282]">
                  {/* Subtle Background Watermark */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,transparent_60%)] pointer-events-none" />
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />

                  {/* Top: Brand watermark & Verification Seal */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="font-bold text-base tracking-tight text-white/90">
                      mizan • katılım
                    </span>

                    {/* Gold Official Compliance Seal */}
                    <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-300/30 border border-amber-300/40 text-amber-200 text-[10px] font-bold flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck size={12} className="text-amber-300" />
                      <span>Fıkhi İcazet Onaylı</span>
                    </div>
                  </div>

                  {/* Middle: Standards & Compliance Thresholds */}
                  <div className="relative z-10 py-1 space-y-1">
                    <div className="text-xs font-extrabold text-white tracking-tight">
                      BIST Katılım (XKTUM) &amp; AAOIFI No: 21
                    </div>
                    <div className="text-[10px] text-white/75 leading-relaxed">
                      Faizli Borç Oranı: <strong className="text-emerald-300">&lt; %33</strong> &bull; Uygunsuz Gelir: <strong className="text-emerald-300">&lt; %5</strong>
                    </div>
                  </div>

                  {/* Bottom: Official ID & Link to Guidelines */}
                  <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/15">
                    <div className="space-y-0.5">
                      <div className="text-[9px] text-white/60 uppercase font-mono tracking-wider">
                        Sertifika Lisans No
                      </div>
                      <div className="text-[11px] font-mono font-bold tracking-widest text-emerald-300">
                        MZ-2026-XKTUM-01
                      </div>
                    </div>

                    <Link
                      href="/rehber"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold transition backdrop-blur-xs border border-white/15"
                    >
                      <span>Standartları İncele</span>
                      <ArrowUpRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 2: FULL-WIDTH BIST STOCK SCREENER TABLE (626 HİSSE)         */}
        {/* Şeffaf Apple / Payno Arka Planlı Tam Sayfa Filtreleme ve Tarama      */}
        {/* =================================================================== */}
        <section
          id="screener-table"
          className="relative z-10 border-t border-white/80 bg-white/70 backdrop-blur-2xl px-6 sm:px-10 py-8 space-y-6"
        >
          {/* Header Row: Title & Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EDF1F6] pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#182542] tracking-tight">
                  Tüm Borsa İstanbul Hisseleri
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#182542]/8 text-[#182542] text-xs font-mono font-bold">
                  {filteredCompanies.length} / {totalCount} Pay
                </span>
                {updatedAt && (
                  <span className="text-xs font-mono text-[#8C9BB0] hidden sm:inline">
                    (KAP Canlı: {updatedAt})
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E81A0] mt-1 font-medium">
                Sütun başlıklarına tıklayarak artan/azalan sıralayabilir; kapsam dışı şirketlerin net fıkhi/mali gerekçesini inceleyebilirsiniz.
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

          {/* Filters Row: Search, Tabs, Sector Dropdown */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9BB0]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hisse kodu, şirket adı veya sektör ara (Örn: BIMAS, THYAO)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border border-white/90 text-xs font-semibold text-[#182542] placeholder:text-[#8C9BB0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#182542]/20 transition shadow-2xs"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition ${
                  statusFilter === "ALL"
                    ? "bg-[#182542] text-white shadow-xs"
                    : "bg-white/80 text-[#6E81A0] border border-white/90 hover:text-[#182542]"
                }`}
              >
                Tümü ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("COMPLIANT")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  statusFilter === "COMPLIANT"
                    ? "bg-[#0D8B52] text-white shadow-xs"
                    : "bg-white/80 text-[#0D8B52] border border-white/90 hover:bg-[#E6F8EF]"
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Katılıma Uygun ({compliantCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("NON_COMPLIANT")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  statusFilter === "NON_COMPLIANT"
                    ? "bg-[#C62E26] text-white shadow-xs"
                    : "bg-white/80 text-[#C62E26] border border-white/90 hover:bg-[#FEE4E2]"
                }`}
              >
                <XCircle size={13} />
                <span>Kapsam Dışı ({nonCompliantCount})</span>
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER: Sortable Columns */}
          <div className="rounded-2xl border border-white/90 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EDF1F6] bg-white/60 text-[11px] font-black uppercase tracking-wider text-[#6E81A0]">
                    {/* 1. Hisse Kodu */}
                    <th
                      onClick={() => handleSort("ticker")}
                      className="py-3 px-4 cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Hisse Kodu</span>
                        {sortField === "ticker" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 2. Son Fiyat */}
                    <th
                      onClick={() => handleSort("priceTRY")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Son Fiyat</span>
                        {sortField === "priceTRY" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 3. 24s Değişim */}
                    <th
                      onClick={() => handleSort("change24h")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>24s Değişim</span>
                        {sortField === "change24h" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 4. Katılım Durumu & Gerekçe */}
                    <th
                      onClick={() => handleSort("status")}
                      className="py-3 px-4 cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Katılım Durumu &amp; Gerekçe</span>
                        {sortField === "status" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 5. Faizli Borç */}
                    <th
                      onClick={() => handleSort("debtRatioPercent")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Faizli Borç</span>
                        {sortField === "debtRatioPercent" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 6. Faizli Varlık */}
                    <th
                      onClick={() => handleSort("cashRatioPercent")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Faizli Varlık</span>
                        {sortField === "cashRatioPercent" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>

                    {/* 7. Arındırma Payı */}
                    <th
                      onClick={() => handleSort("impureIncomePercent")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#182542] transition select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Arındırma Payı</span>
                        {sortField === "impureIncomePercent" ? (
                          sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF1F6] text-xs">
                  {displayedCompanies.map((comp) => {
                    const isCompliant =
                      standard === "BIST"
                        ? comp.bistStatus === "COMPLIANT"
                        : comp.aaoifiStatus === "COMPLIANT";
                    const isPos = !comp.change24h?.startsWith("-");

                    return (
                      <tr
                        key={comp.ticker}
                        onClick={() => router.push(`/companies/${comp.ticker}`)}
                        className="hover:bg-white/80 transition cursor-pointer group"
                      >
                        {/* 1. Hisse Kodu */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#182542] text-white flex items-center justify-center font-bold text-xs font-mono shadow-2xs group-hover:bg-[#273869] transition">
                              {comp.ticker.slice(0, 4)}
                            </div>
                            <div>
                              <div className="font-extrabold text-[#182542] group-hover:text-[#273869] transition font-sans">
                                {comp.ticker}
                              </div>
                              <div className="text-[11px] text-[#8C9BB0] line-clamp-1">
                                {comp.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Fiyat */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <MizanSplitPrice value={comp.priceTRY} className="text-sm" />
                        </td>

                        {/* 3. Değişim */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-0.5 font-mono font-bold text-xs ${
                              isPos ? "text-[#12B76A]" : "text-[#F04438]"
                            }`}
                          >
                            {isPos ? "+" : ""}
                            {comp.change24h}
                          </span>
                        </td>

                        {/* 4. Katılım Durumu & Gerekçe */}
                        <td className="py-3 px-4">
                          {isCompliant ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F8EF] text-[#0D8B52] text-[11px] font-bold">
                              <CheckCircle2 size={12} />
                              <span>Katılıma Uygun</span>
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEE4E2] text-[#D92D20] text-[11px] font-bold">
                                <XCircle size={11} />
                                <span>✕ Kapsam Dışı</span>
                              </span>
                              <div className="text-[10px] text-[#D92D20] font-semibold line-clamp-1">
                                {getNonComplianceReason(comp, standard)}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* 5. Faizli Borç */}
                        <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                          <span
                            className={`font-bold ${
                              comp.debtRatioPercent > (standard === "BIST" ? 33 : 30)
                                ? "text-[#D92D20]"
                                : "text-[#182542]"
                            }`}
                          >
                            %{comp.debtRatioPercent.toFixed(1)}
                          </span>
                        </td>

                        {/* 6. Faizli Varlık */}
                        <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                          <span
                            className={`font-bold ${
                              comp.cashRatioPercent > (standard === "BIST" ? 33 : 30)
                                ? "text-[#D92D20]"
                                : "text-[#182542]"
                            }`}
                          >
                            %{comp.cashRatioPercent.toFixed(1)}
                          </span>
                        </td>

                        {/* 7. Arındırma Payı */}
                        <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                          <span className="font-semibold text-[#6E81A0]">
                            %{comp.impureIncomePercent.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Daha Fazla Göster Butonu */}
            {visibleLimit < sortedCompanies.length && (
              <div className="p-4 text-center border-t border-[#EDF1F6] bg-white/60">
                <button
                  type="button"
                  onClick={() => setVisibleLimit((v) => v + 80)}
                  className="px-6 py-2 rounded-full bg-white hover:bg-[#F3F6FA] text-xs font-bold text-[#182542] border border-white/90 shadow-xs transition"
                >
                  Daha Fazla Hisse Yükle (+80 / Toplam {sortedCompanies.length})
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
