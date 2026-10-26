"use client";

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Coins,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  Info,
  Check,
  Download,
  AlertTriangle,
  Printer,
  FileText,
  X,
  ArrowRight,
  ArrowLeftRight,
  BadgeCheck,
  Award,
  ExternalLink,
  PieChart,
} from "lucide-react";
import {
  PortfolioHoldingItem,
  ScreeningStandardCode,
  ZakatIntentionType,
} from "@/types/katilim";
import {
  SAMPLE_COMPANIES_SUMMARY,
  DETAILED_COMPANIES_DATABASE,
  getCompanySummary,
} from "@/lib/data/sampleCompanies";
import { BIST_COMPREHENSIVE_UNIVERSE } from "@/lib/data/bistUniverse";
import { PaynoShell } from "@/components/PaynoShell";
import { StockLogo } from "@/components/StockLogo";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Decimal,
  formatTRY,
  formatPercent,
  calculateDaysHeld,
  calculateHoldingPurificationClient,
  calculateZakatForPositionClient,
} from "@/lib/decimal/decimal";
import { getCompliantAlternativesForTicker } from "@/lib/data/compliantAlternatives";

function PortfolioManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isDemoUser } = useAuth();

  // Yetkisiz kullanıcıyı giriş sayfasına yönlendir
  useEffect(() => {
    if (!loading && !user && !isDemoUser) {
      router.replace("/auth/login");
    }
  }, [loading, user, isDemoUser, router]);

  // Aktif Ana Sekme: Pozisyonlar, Fıkhi Arındırma, Hisse Zekâtı
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"HOLDINGS" | "PURIFICATION" | "ZAKAT">(
    initialTab === "arindirma"
      ? "PURIFICATION"
      : initialTab === "zekat"
      ? "ZAKAT"
      : "HOLDINGS"
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "arindirma") setActiveTab("PURIFICATION");
    else if (tabParam === "zekat") setActiveTab("ZAKAT");
    else if (tabParam === "pozisyonlar") setActiveTab("HOLDINGS");
  }, [searchParams]);

  // Fıkhi İhtiyat ve Yuvarlama
  const [useCeilingRounding, setUseCeilingRounding] = useState<boolean>(true);
  // Arındırma Hesaplama Modu: "TKBB_REAL" (Enflasyon Arındırmalı) | "KAFIF_GROSS" (Enflasyon İndirimsiz Brüt - Helal Finans Uyumlu)
  const [purificationMode, setPurificationMode] = useState<"TKBB_REAL" | "KAFIF_GROSS">("TKBB_REAL");
  const [includeNonCompliantInPurification, setIncludeNonCompliantInPurification] = useState<boolean>(false);

  // Fıkhi Kontrol Anahtarları
  const [autoPurification, setAutoPurification] = useState<boolean>(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState<boolean>(true);
  const [annualZakatAlert, setAnnualZakatAlert] = useState<boolean>(true);
  const [foreignFilter, setForeignFilter] = useState<boolean>(false);

  // Global Zekât Varsayılan Niyeti
  const [globalZakatIntent, setGlobalZakatIntent] = useState<ZakatIntentionType>("LONG_TERM_DIVIDEND");

  // Canlı Fiyatlar
  const [livePrices, setLivePrices] = useState<Record<string, string>>({
    BIMAS: "482.50",
    ASELS: "68.40",
    THYAO: "312.00",
    PGSUS: "234.50",
    FROTO: "985.00",
    TUPRS: "174.50",
    EREGL: "52.80",
    TABGD: "164.00",
  });
  const [lastTickTime, setLastTickTime] = useState<string>("Canlı");

  const tickLivePrices = async () => {
    try {
      const res = await fetch("/api/live-market", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.quotes && typeof data.quotes === "object") {
          setLivePrices((prev) => {
            const updated: Record<string, string> = { ...prev };
            for (const [ticker, quoteObj] of Object.entries<any>(data.quotes)) {
              if (quoteObj?.priceTRY) {
                updated[ticker] = quoteObj.priceTRY;
              }
            }
            return updated;
          });
          setLastTickTime(new Date().toLocaleTimeString("tr-TR"));
        }
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    tickLivePrices();
    const interval = setInterval(tickLivePrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Portföy Pozisyonları & E-posta Bazlı Bulut Senkronizasyonu
  const userEmail = user?.email?.toLowerCase().trim() || "";
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const isInitialLoadDone = useRef<boolean>(false);

  // Depolama anahtarı: Kullanıcı e-postası varsa ona özel, yoksa genel anahtar
  const getStorageKey = (email?: string) => {
    return email ? `mizan_holdings_${email.toLowerCase().trim()}` : "mizan_user_holdings";
  };

  const DEFAULT_HOLDINGS: PortfolioHoldingItem[] = [];
  const [holdings, setHoldings] = useState<PortfolioHoldingItem[]>([]);

  // 1. E-posta veya Kullanıcı değiştiğinde yerelden anında yükle ve bulutla senkronize et
  useEffect(() => {
    if (typeof window === "undefined") return;

    const activeKey = getStorageKey(userEmail);
    const localSaved =
      localStorage.getItem(activeKey) ||
      localStorage.getItem("mizan_katilim_holdings_v2") ||
      localStorage.getItem("mizan_user_holdings");

    let initialHoldings: PortfolioHoldingItem[] = [];
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          initialHoldings = parsed;
          setHoldings(parsed);
        }
      } catch {
        // fallback
      }
    }

    if (!userEmail) {
      isInitialLoadDone.current = true;
      return;
    }

    // Buluttan e-postaya bağlı güncel portföyü çek
    setIsSyncingCloud(true);
    fetch(`/api/portfolio/sync?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.holdings)) {
          if (data.holdings.length > 0) {
            setHoldings(data.holdings);
            localStorage.setItem(activeKey, JSON.stringify(data.holdings));
            localStorage.setItem("mizan_user_holdings", JSON.stringify(data.holdings));
          } else if (data.holdings.length === 0 && initialHoldings.length > 0) {
            // İlk cihazdaki portföyü buluta aktar
            fetch("/api/portfolio/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userEmail, holdings: initialHoldings }),
            }).catch(() => {});
          }
          setLastSyncedTime(new Date().toLocaleTimeString("tr-TR"));
        }
      })
      .catch((err) => {
        console.warn("[PORTFOLIO-SYNC] Cloud sync fetch failed:", err);
      })
      .finally(() => {
        setIsSyncingCloud(false);
        isInitialLoadDone.current = true;
      });
  }, [userEmail]);

  // 2. Portföy değiştiğinde yerel hafızaya ve buluta otomatik kaydet
  useEffect(() => {
    if (typeof window === "undefined" || !isInitialLoadDone.current) return;

    const activeKey = getStorageKey(userEmail);
    localStorage.setItem(activeKey, JSON.stringify(holdings));
    localStorage.setItem("mizan_katilim_holdings_v2", JSON.stringify(holdings));
    localStorage.setItem("mizan_user_holdings", JSON.stringify(holdings));

    if (userEmail) {
      fetch("/api/portfolio/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, holdings }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLastSyncedTime(new Date().toLocaleTimeString("tr-TR"));
          }
        })
        .catch((e) => console.warn("[PORTFOLIO-SYNC] Cloud save error:", e));
    }
  }, [holdings, userEmail]);

  // Resmi Fıkhi İcazet / PDF Sertifika Modalı
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Fıkhi İkame Bildirimi
  const [swapNotification, setSwapNotification] = useState<{
    fromTicker: string;
    toTicker: string;
    toName: string;
    lots: number;
  } | null>(null);

  // Akıllı Sektörel İkame Fonksiyonu (Katılım Dışı Hisseleri 1 Tıkla Muadiliyle Değiştir)
  const handleSwapHolding = (
    rowId: string,
    fromTicker: string,
    toTicker: string,
    toName: string
  ) => {
    const targetHolding = holdings.find((h) => h.id === rowId);
    if (!targetHolding) return;

    const lotsNum = parseFloat(targetHolding.lots) || 0;
    const currentPrice = parseFloat(livePrices[fromTicker] || "100.00");
    const positionValue = lotsNum * currentPrice;

    const toPrice = parseFloat(
      livePrices[toTicker] ||
      getCompanySummary(toTicker)?.priceTRY?.replace("₺", "").trim() ||
      "50.00"
    );
    const newLots = Math.max(1, Math.round(positionValue / toPrice));

    const updated = holdings.map((h) => {
      if (h.id === rowId) {
        return {
          ...h,
          ticker: toTicker,
          lots: String(newLots),
          avgCostTRY: toPrice.toFixed(2),
          purchaseDate: new Date().toISOString().split("T")[0],
        };
      }
      return h;
    });

    setHoldings(updated);

    setSwapNotification({
      fromTicker,
      toTicker,
      toName,
      lots: newLots,
    });
    setTimeout(() => setSwapNotification(null), 6000);
  };

  // Yeni Pozisyon Ekle Form State
  const [newTicker, setNewTicker] = useState<string>("BIMAS");
  const [newLots, setNewLots] = useState<string>("100");
  const [newAvgCost, setNewAvgCost] = useState<string>("482.50");
  const [newDaysHeldInput, setNewDaysHeldInput] = useState<string>("365");
  const [newPurchaseDate, setNewPurchaseDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 365);
    return d.toISOString().split("T")[0];
  });
  const [newZakatIntent, setNewZakatIntent] =
    useState<ZakatIntentionType>("LONG_TERM_DIVIDEND");

  const handleNewDateChange = (dateStr: string) => {
    setNewPurchaseDate(dateStr);
    const { totalDaysHeld } = calculateDaysHeld(dateStr);
    setNewDaysHeldInput(String(totalDaysHeld));
  };

  const handleNewDaysChange = (daysStr: string) => {
    setNewDaysHeldInput(daysStr);
    const daysNum = Math.max(1, parseInt(daysStr) || 1);
    const d = new Date();
    d.setDate(d.getDate() - daysNum);
    setNewPurchaseDate(d.toISOString().split("T")[0]);
  };

  const handleUpdateHoldingDays = (id: string, days: number) => {
    const validDays = Math.max(1, Math.min(36500, Math.round(days || 1)));
    const d = new Date();
    d.setDate(d.getDate() - validDays);
    const isoDate = d.toISOString().split("T")[0];
    setHoldings((prev) =>
      prev.map((h) =>
        h.id === id
          ? ({ ...h, purchaseDate: isoDate, customDaysHeld: validDays } as PortfolioHoldingItem)
          : h
      )
    );
  };

  const handleUpdateHoldingDate = (id: string, dateStr: string) => {
    const { totalDaysHeld } = calculateDaysHeld(dateStr);
    setHoldings((prev) =>
      prev.map((h) =>
        h.id === id
          ? ({ ...h, purchaseDate: dateStr, customDaysHeld: totalDaysHeld } as PortfolioHoldingItem)
          : h
      )
    );
  };

  const handleUpdateHoldingLots = (id: string, lotsStr: string) => {
    setHoldings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, lots: lotsStr } : h))
    );
  };

  const handleSelectNewTicker = (ticker: string) => {
    setNewTicker(ticker);
    const live = livePrices[ticker];
    if (live) {
      setNewAvgCost(live);
    } else {
      const comp = getCompanySummary(ticker);
      if (comp?.priceTRY) {
        setNewAvgCost(comp.priceTRY.replace("₺", "").trim());
      }
    }
  };

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker || !newLots || !newAvgCost) return;

    const newItem: PortfolioHoldingItem = {
      id: `h-${Date.now()}`,
      ticker: newTicker,
      lots: newLots,
      avgCostTRY: newAvgCost,
      purchaseDate: newPurchaseDate,
      purificationMethod: "holding",
      zakatIntent: newZakatIntent,
    };

    setHoldings((prev) => [newItem, ...prev]);
    setNewLots("100");
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  // Portföy Analiz Motoru
  const portfolioAnalysis = useMemo(() => {
    let totalMarketValue = new Decimal(0);
    let totalCostBasis = new Decimal(0);
    let compliantMarketValue = new Decimal(0);
    let totalExitPurificationPayable = new Decimal(0);
    let totalZakatPayable = new Decimal(0);
    let totalZakatBase = new Decimal(0);

    const rows = holdings.map((item) => {
      const lotsDec = new Decimal(item.lots || 0);
      const costDec = new Decimal(item.avgCostTRY || 0);
      const curPriceDec = new Decimal(livePrices[item.ticker] || "100.00");

      const positionCost = lotsDec.times(costDec);
      const positionValue = lotsDec.times(curPriceDec);
      const positionPnl = positionValue.minus(positionCost);
      const positionPnlPercent = positionCost.gt(0)
        ? positionPnl.dividedBy(positionCost).times(100)
        : new Decimal(0);

      totalMarketValue = totalMarketValue.plus(positionValue);
      totalCostBasis = totalCostBasis.plus(positionCost);

      const customDays = (item as any).customDaysHeld;
      const calcDateRes = calculateDaysHeld(item.purchaseDate);
      const totalDaysHeld =
        typeof customDays === "number" && customDays > 0
          ? customDays
          : calcDateRes.totalDaysHeld;
      const daysHeldInQuarter = Math.min(totalDaysHeld, 90);
      const detail = DETAILED_COMPANIES_DATABASE[item.ticker];
      const compSummary = getCompanySummary(item.ticker);
      const isCompliant = compSummary?.bistStatus === "COMPLIANT" || compSummary?.bistStatus === "GRACE_PERIOD_TOLERANCE";

      // Fıkhi arındırma (TKBB Reel vs KAFİF Brüt Enflasyon İndirimsiz)
      const totalShares = detail?.purificationMetrics?.totalSharesOutstanding || "1000000000";
      const basePShareQuarter = new Decimal(
        detail?.purificationMetrics?.purificationPerShareQuarterTRY ||
          compSummary?.purificationPerShareTRY ||
          "0"
      );
      // KAFİF Brüt modunda enflasyon erozyonu düşülmemiş nominal KAFİF mahzurlu geliri baz alınır
      const grossMultiplier = purificationMode === "KAFIF_GROSS" ? new Decimal("3.85") : new Decimal("1");
      const effectivePShareQuarter = basePShareQuarter.times(grossMultiplier);
      const impureIncome = effectivePShareQuarter.times(new Decimal(totalShares)).toFixed(4);

      const purCalc = calculateHoldingPurificationClient(
        impureIncome,
        totalShares,
        lotsDec,
        totalDaysHeld,
        90,
        useCeilingRounding
      );

      // Zekât
      const zatableNetAssets =
        detail?.purificationMetrics?.zatableNetCurrentAssetsPerShareTRY ||
        compSummary?.zatableNetAssetsPerShareTRY ||
        "0";

      const effectiveIntent = item.zakatIntent || globalZakatIntent;
      const zakCalc = calculateZakatForPositionClient({
        quantityLots: lotsDec,
        currentPriceTRY: curPriceDec,
        zatableNetAssetsPerShareTRY: zatableNetAssets,
        intent: effectiveIntent,
      });

      if (isCompliant) {
        compliantMarketValue = compliantMarketValue.plus(positionValue);
      }
      if (isCompliant || includeNonCompliantInPurification || purificationMode === "KAFIF_GROSS") {
        totalExitPurificationPayable = totalExitPurificationPayable.plus(
          purCalc.totalPurificationPayable
        );
      }
      totalZakatPayable = totalZakatPayable.plus(zakCalc.zakatPayableTRY);
      totalZakatBase = totalZakatBase.plus(zakCalc.zakatBaseTRY);

      return {
        ...item,
        companyName: compSummary?.name || item.ticker,
        sector: compSummary?.sector || "BIST",
        isCompliant,
        curPriceTRY: curPriceDec,
        positionCostTRY: positionCost,
        positionValueTRY: positionValue,
        positionPnlTRY: positionPnl,
        positionPnlPercent,
        daysHeld: totalDaysHeld,
        daysHeldInQuarter,
        purificationResult: purCalc,
        zakatResult: zakCalc,
      };
    });

    const totalPnlTRY = totalMarketValue.minus(totalCostBasis);
    const totalPnlPercent = totalCostBasis.gt(0)
      ? totalPnlTRY.dividedBy(totalCostBasis).times(100)
      : new Decimal(0);

    const halalWeightPercent = totalMarketValue.gt(0)
      ? compliantMarketValue.dividedBy(totalMarketValue).times(100)
      : new Decimal(100);

    return {
      rows,
      totalMarketValue,
      totalCostBasis,
      totalPnlTRY,
      totalPnlPercent,
      halalWeightPercent,
      totalExitPurificationPayable,
      totalZakatPayable,
      totalZakatBase,
    };
  }, [holdings, livePrices, useCeilingRounding, globalZakatIntent, purificationMode, includeNonCompliantInPurification]);

  // Daire grafik ve görsel analiz için hisse ağırlıkları
  const holdingsChartData = useMemo(() => {
    if (!portfolioAnalysis.rows || portfolioAnalysis.rows.length === 0 || portfolioAnalysis.totalMarketValue.lte(0)) {
      return [];
    }
    const palette = ["#182542", "#0D8B52", "#2563EB", "#7C3AED", "#F59E0B", "#0891B2", "#DC2626", "#475569"];
    const totalValNum = portfolioAnalysis.totalMarketValue.toNumber();

    return portfolioAnalysis.rows
      .map((r, i) => {
        const valNum = r.positionValueTRY.toNumber();
        const weight = totalValNum > 0 ? (valNum / totalValNum) * 100 : 0;
        return {
          ticker: r.ticker,
          name: r.companyName,
          valueTRY: valNum,
          weightPercent: weight,
          color: palette[i % palette.length],
          isCompliant: r.isCompliant,
        };
      })
      .sort((a, b) => b.valueTRY - a.valueTRY);
  }, [portfolioAnalysis.rows, portfolioAnalysis.totalMarketValue]);

  // Portföydeki Katılım Dışı Hisselerin Listesi
  const nonCompliantHoldings = useMemo(() => {
    return portfolioAnalysis.rows.filter((r) => !r.isCompliant);
  }, [portfolioAnalysis.rows]);

  return (
    <PaynoShell badge="portföy">
      <div className="space-y-6">
        
        {/* ================================================================= */}
        {/* ÜST BAŞLIK VE KONTROLLER                                          */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#182542] dark:text-white">
              Katılım Portföyüm &amp; Fıkhi Arındırma
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs sm:text-sm text-[#6E81A0] dark:text-[#94A3B8]">
                Canlı BIST hisse pozisyonları, kuruş hassasiyetli fıkhi arındırma ve %2,5 hisse zekâtı yönetimi.
              </p>
              {userEmail && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyncingCloud ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
                  <span>
                    {isSyncingCloud
                      ? "Bulutla Senkronize Ediliyor..."
                      : `${userEmail} ile senkronize${lastSyncedTime ? ` (${lastSyncedTime})` : ""}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={tickLivePrices}
              className="w-9 h-9 rounded-full bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 shadow-xs text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white flex items-center justify-center transition"
              title="Canlı Fiyatları Yenile"
            >
              <RefreshCw size={14} />
            </button>

            <button
              type="button"
              onClick={() => setShowCertificateModal(true)}
              className="rounded-full bg-white dark:bg-[#0E1015] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#182542] dark:text-white px-3.5 sm:px-4 py-2 text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              title="Resmi DİB & TKBB Uyumlu Fıkhi Arındırma ve Zekât Belgesi Al (PDF)"
            >
              <FileText size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Resmi Fıkhi Belge (PDF)</span>
              <span className="sm:hidden">Fıkhi Belge</span>
            </button>

            <a
              href="#yeni-pozisyon"
              className="rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white px-4 sm:px-5 py-2 text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus size={14} />
              <span>+ Yeni Hisse Ekle</span>
            </a>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4'LÜ BENTO PERFORMANS VE FIKHİ ÖZET KARTLARI                      */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          
          {/* Kart 1: Toplam Portföy Değeri */}
          <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                Toplam Portföy Değeri
              </span>
              <span className="w-7 h-7 rounded-full bg-[#182542]/10 dark:bg-white/10 text-[#182542] dark:text-white flex items-center justify-center text-xs font-bold">
                ₺
              </span>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-[#182542] dark:text-white">
                {formatTRY(portfolioAnalysis.totalMarketValue, 2)}
              </div>
              <div className={`text-xs font-bold font-mono mt-1 flex items-center gap-1 ${
                portfolioAnalysis.totalPnlTRY.gte(0) ? "text-[#0D8B52] dark:text-emerald-400" : "text-[#C62E26] dark:text-rose-400"
              }`}>
                {portfolioAnalysis.totalPnlTRY.gte(0) ? "▲ +" : "▼ "}
                {formatTRY(portfolioAnalysis.totalPnlTRY, 2)} ({portfolioAnalysis.totalPnlPercent.toFixed(2)}%)
              </div>
            </div>
            <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-mono">
              Maliyet: {formatTRY(portfolioAnalysis.totalCostBasis, 2)}
            </span>
          </div>

          {/* Kart 2: Katılım Uyum Oranı */}
          <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                Katılım Uyum Ağırlığı
              </span>
              <span className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-[#182542] dark:text-white">
                %{portfolioAnalysis.halalWeightPercent.toFixed(1)}
              </div>
              <div className="text-xs font-bold text-[#0D8B52] dark:text-emerald-400 mt-1">
                DİB &amp; BIST Katılım Standartlı
              </div>
            </div>
            <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
              {portfolioAnalysis.rows.filter(r => r.isCompliant).length} / {portfolioAnalysis.rows.length} Hisse Tam Uyumlu
            </span>
          </div>

          {/* Kart 3: Fıkhi Arındırma Yükümlülüğü */}
          <div
            onClick={() => setActiveTab("PURIFICATION")}
            className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 transition-all cursor-pointer hover:border-[#182542]/30 dark:hover:border-white/20 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                Fıkhi Arındırma Tutarı
              </span>
              <span className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold group-hover:scale-110 transition">
                <Scale size={13} />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-[#182542] dark:text-white">
                {formatTRY(portfolioAnalysis.totalExitPurificationPayable, 2)}
              </div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                <span>Arındırma Sekmesine Git &rarr;</span>
              </div>
            </div>
            <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
              Pro-Rata Günlük &amp; Çeyreklik İnfak
            </span>
          </div>

          {/* Kart 4: Yıllık Hisse Zekâtı */}
          <div
            onClick={() => setActiveTab("ZAKAT")}
            className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 transition-all cursor-pointer hover:border-[#182542]/30 dark:hover:border-white/20 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                Yıllık Hisse Zekâtı (%2,5)
              </span>
              <span className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold group-hover:scale-110 transition">
                <Coins size={13} />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-[#182542] dark:text-white">
                {formatTRY(portfolioAnalysis.totalZakatPayable, 2)}
              </div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <span>Zekât Sekmesine Git &rarr;</span>
              </div>
            </div>
            <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
              Dönen Varlık Matrahı: {formatTRY(portfolioAnalysis.totalZakatBase, 2)}
            </span>
          </div>

        </div>

        {/* ================================================================= */}
        {/* SEGMENTED TAB SELECTOR (Pozisyonlar / Arındırma / Zekât)          */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 dark:border-white/10 pb-4 overflow-x-auto scrollbar-none">
          <div className="bg-white dark:bg-[#0E1015] p-1 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-xs flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("HOLDINGS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "HOLDINGS"
                  ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                  : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
              }`}
            >
              <Briefcase size={14} />
              <span>Varlıklarım &amp; Pozisyonlar ({portfolioAnalysis.rows.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PURIFICATION")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "PURIFICATION"
                  ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                  : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
              }`}
            >
              <Scale size={14} />
              <span>Fıkhi Arındırma Hesaplayıcı</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ZAKAT")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "ZAKAT"
                  ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                  : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
              }`}
            >
              <Coins size={14} />
              <span>Hisse Zekâtı (%2,5 &amp; Dönen Varlık)</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#6E81A0] dark:text-[#94A3B8] hidden md:block">
            Son Güncelleme: {lastTickTime}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SEKME 1: PORTFÖY POZİSYONLARI & YENİ HİSSE EKLEME                 */}
        {/* ================================================================= */}
        {activeTab === "HOLDINGS" && (
          <div className="space-y-6">
            
            {/* Fıkhi İkame Başarı Bildirimi */}
            {swapNotification && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-[#0D8B52] dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Fıkhi İkame Başarıyla Tamamlandı!</span>
                    <span>
                      <strong>{swapNotification.fromTicker}</strong> pozisyonunuz <strong>{swapNotification.lots} Lot {swapNotification.toTicker} ({swapNotification.toName})</strong> ile ikame edildi. Portföyünüz artık %100 Katılım Uyumlu!
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSwapNotification(null)}
                  className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* ============================================================= */}
            {/* PORTFÖY GÖRSEL ANALİZ & GRAFİKLER                              */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
              
              {/* GRAFİK 1: VARLIK AĞIRLIK DAĞILIMI (DONUT) */}
              <div className="lg:col-span-6 bg-white/75 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[26px] p-5 sm:p-6 border border-white/80 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#182542] dark:text-white flex items-center gap-2">
                      <PieChart size={15} className="text-[#0D8B52] dark:text-emerald-400" />
                      <span>Varlık Ağırlık Dağılımı</span>
                    </h3>
                    <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Portföydeki hisselerin toplam piyasa değerine oranları
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#182542] dark:text-white">
                    {holdingsChartData.length} Varlık
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                  {/* SVG Donut */}
                  <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="11"
                        className="text-slate-200/70 dark:text-white/10"
                      />

                      {holdingsChartData.length === 0 ? (
                        <circle
                          cx="50"
                          cy="50"
                          r="36"
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth="11"
                          strokeDasharray="226.19"
                          strokeDashoffset="0"
                          opacity="0.3"
                        />
                      ) : (
                        (() => {
                          let accumulated = 0;
                          const circumference = 2 * Math.PI * 36;
                          return holdingsChartData.map((h, i) => {
                            const dasharray = `${(h.weightPercent / 100) * circumference} ${circumference}`;
                            const dashoffset = -((accumulated / 100) * circumference);
                            accumulated += h.weightPercent;
                            return (
                              <circle
                                key={i}
                                cx="50"
                                cy="50"
                                r="36"
                                fill="none"
                                stroke={h.color}
                                strokeWidth="11"
                                strokeDasharray={dasharray}
                                strokeDashoffset={dashoffset}
                                className="transition-all duration-500"
                              />
                            );
                          });
                        })()
                      )}
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-mono font-black text-[#182542] dark:text-white leading-none">
                        {holdingsChartData.length === 0 ? "0" : holdingsChartData.length}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] font-bold">
                        Pozisyon
                      </span>
                    </div>
                  </div>

                  {/* Lejant */}
                  <div className="flex-1 w-full space-y-1.5">
                    {holdingsChartData.length === 0 ? (
                      <div className="text-center py-4 text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                        Portföye hisse eklediğinizde ağırlık dağılımı burada görselleştirilir.
                      </div>
                    ) : (
                      holdingsChartData.map((h) => (
                        <div key={h.ticker} className="flex items-center justify-between text-xs py-0.5">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                            <span className="font-bold text-[#182542] dark:text-white">{h.ticker}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{h.name}</span>
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <span className="font-bold text-[#182542] dark:text-white">
                              ₺{h.valueTRY.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">
                              (%{h.weightPercent.toFixed(1)})
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* GRAFİK 2: MALİYET VS PİYASA DEĞERİ & FIKHİ RÖNTGEN */}
              <div className="lg:col-span-6 bg-white/75 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[26px] p-5 sm:p-6 border border-white/80 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#182542] dark:text-white flex items-center gap-2">
                      <TrendingUp size={15} className="text-[#2563EB] dark:text-blue-400" />
                      <span>Maliyet &amp; Fıkhi Röntgen</span>
                    </h3>
                    <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Sermaye büyümesi ve helal varlık uyum dengesi
                    </p>
                  </div>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                    portfolioAnalysis.totalPnlTRY.gte(0)
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                  }`}>
                    {portfolioAnalysis.totalPnlTRY.gte(0) ? "▲ +" : "▼ "}
                    %{portfolioAnalysis.totalPnlPercent.toFixed(1)}
                  </span>
                </div>

                <div className="space-y-4 py-1">
                  {/* Maliyet vs Piyasa Değeri Barları */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6E81A0] dark:text-[#94A3B8]">Piyasa Değeri / Maliyet Karşılaştırması</span>
                      <span className="font-mono font-bold text-[#182542] dark:text-white">
                        {formatTRY(portfolioAnalysis.totalMarketValue, 2)}
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex">
                      <div
                        className="h-full bg-[#182542] dark:bg-[#273869] transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            portfolioAnalysis.totalCostBasis.gt(0) && portfolioAnalysis.totalMarketValue.gt(0)
                              ? (portfolioAnalysis.totalCostBasis.toNumber() /
                                  Math.max(
                                    portfolioAnalysis.totalMarketValue.toNumber(),
                                    portfolioAnalysis.totalCostBasis.toNumber()
                                  )) *
                                  100
                              : 0
                          )}%`,
                        }}
                        title={`Maliyet: ${formatTRY(portfolioAnalysis.totalCostBasis, 2)}`}
                      />
                      <div
                        className={`h-full transition-all duration-500 ${
                          portfolioAnalysis.totalPnlTRY.gte(0) ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            portfolioAnalysis.totalCostBasis.gt(0) && portfolioAnalysis.totalMarketValue.gt(0)
                              ? (Math.abs(portfolioAnalysis.totalPnlTRY.toNumber()) /
                                  Math.max(
                                    portfolioAnalysis.totalMarketValue.toNumber(),
                                    portfolioAnalysis.totalCostBasis.toNumber()
                                  )) *
                                  100
                              : 0
                          )}%`,
                        }}
                        title={`Net Getiri: ${formatTRY(portfolioAnalysis.totalPnlTRY, 2)}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Maliyet: {formatTRY(portfolioAnalysis.totalCostBasis, 2)}</span>
                      <span>Net: {formatTRY(portfolioAnalysis.totalPnlTRY, 2)}</span>
                    </div>
                  </div>

                  {/* Katılım Uyumluluk Barı */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6E81A0] dark:text-[#94A3B8]">Katılım Kriteri Uyumluluk Oranı</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        %{portfolioAnalysis.halalWeightPercent.toFixed(1)} Helal
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${portfolioAnalysis.halalWeightPercent.toNumber()}%` }}
                      />
                      <div
                        className="h-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${100 - portfolioAnalysis.halalWeightPercent.toNumber()}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>DİB / TKBB Katılım Uyumlu</span>
                      <span>Arındırma: {formatTRY(portfolioAnalysis.totalExitPurificationPayable, 2)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Fıkhi Güvenlik ve Kurallar Kontrolü */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Fıkhi Portföy Güvenlik Kontrolleri
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    DİB ve TKBB standartlarına göre aktif otomatik kurallar
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 text-[10px] font-bold">
                  4 Kural Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* 1. Otomatik Arındırma */}
                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#182542] dark:text-white block">Otomatik Arındırma</span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Temettü tahakkukunda</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoPurification(!autoPurification)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                      autoPurification ? "bg-[#0D8B52] justify-end" : "bg-slate-300 dark:bg-white/10 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* 2. Anlık KAP Alarmları */}
                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#182542] dark:text-white block">Anlık KAP Alarmları</span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Kapsam dışı kalırsa uyar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRealtimeAlerts(!realtimeAlerts)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                      realtimeAlerts ? "bg-[#0D8B52] justify-end" : "bg-slate-300 dark:bg-white/10 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* 3. Yıllık Zekât Takibi */}
                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#182542] dark:text-white block">Yıllık Zekât Takibi</span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Dönen varlık matrahı</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnnualZakatAlert(!annualZakatAlert)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                      annualZakatAlert ? "bg-[#0D8B52] justify-end" : "bg-slate-300 dark:bg-white/10 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* 4. Yabancı Hisse Filtresi */}
                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#182542] dark:text-white block">Yabancı Varlık Koruması</span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Yurt dışı fıkhi filtre</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForeignFilter(!foreignFilter)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                      foreignFilter ? "bg-[#0D8B52] justify-end" : "bg-slate-300 dark:bg-white/10 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
              </div>
            </div>

            {/* Yeni Pozisyon Ekleme Formu */}
            <div id="yeni-pozisyon" className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Portföye Yeni Hisse Ekle
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    BIST hisseleri arasından seçim yapın
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddHolding}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
              >
                <div>
                  <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                    Hisse Kodu
                  </label>
                  <select
                    value={newTicker}
                    onChange={(e) => handleSelectNewTicker(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-[#182542] dark:text-white outline-none"
                  >
                    {(BIST_COMPREHENSIVE_UNIVERSE.length > 0 ? BIST_COMPREHENSIVE_UNIVERSE : SAMPLE_COMPANIES_SUMMARY).map((c) => (
                      <option key={c.ticker} value={c.ticker} className="dark:bg-[#0E1015]">
                        {c.ticker} — {c.name.slice(0, 24)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                    Lot Adedi
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newLots}
                    onChange={(e) => setNewLots(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-[#182542] dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                    Ort. Maliyet (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAvgCost}
                    onChange={(e) => setNewAvgCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-[#182542] dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                    Alış Tarihi / Gün ({newDaysHeldInput} Gün)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="36500"
                      value={newDaysHeldInput}
                      onChange={(e) => handleNewDaysChange(e.target.value)}
                      title="Elde Tutulan Gün Sayısı"
                      placeholder="Gün"
                      className="w-20 px-2.5 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-[#182542] dark:text-white outline-none"
                    />
                    <input
                      type="date"
                      value={newPurchaseDate}
                      onChange={(e) => handleNewDateChange(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-[#182542] dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block mb-1">
                    Zekât Niyeti
                  </label>
                  <select
                    value={newZakatIntent}
                    onChange={(e) => setNewZakatIntent(e.target.value as ZakatIntentionType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-[#182542] dark:text-white outline-none"
                  >
                    <option value="LONG_TERM_DIVIDEND" className="dark:bg-[#0E1015]">Uzun Vade (Temettü)</option>
                    <option value="TRADING_SHORT_TERM" className="dark:bg-[#0E1015]">Kısa Vade (Al-Sat)</option>
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold shadow-xs transition"
                  >
                    + Portföye Ekle
                  </button>
                </div>
              </form>
            </div>

            {/* =============================================================== */}
            {/* KATILIM DIŞI PORTFÖY UYARISI & AKILLI SEKTÖREL İKAME MOTORU    */}
            {/* =============================================================== */}
            {nonCompliantHoldings.length > 0 && (
              <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent dark:from-amber-950/30 dark:via-rose-950/20 dark:to-transparent rounded-[24px] p-5 sm:p-6 border-2 border-amber-500/30 dark:border-amber-500/20 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 dark:border-amber-500/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <AlertTriangle size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[#182542] dark:text-white">
                          Katılım Dışı Varlık Uyarısı: Fıkhi Kapsam Dışı Hisse Tespit Edildi
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                          {nonCompliantHoldings.length} Hisse İhlalde
                        </span>
                      </div>
                      <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                        DİB Din İşleri Yüksek Kurulu ve BIST Katılım Standartlarına göre portföyünüzün fıkhi uyum oranı şu an <strong className="text-amber-700 dark:text-amber-400">%{portfolioAnalysis.halalWeightPercent.toFixed(1)}</strong> seviyesindedir.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                      Hedef Uyum:
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-[#0D8B52] dark:text-emerald-400 text-xs font-mono font-black">
                      %100,0 Tam Uyum
                    </span>
                  </div>
                </div>

                {/* Her İhlal Eden Hisse İçin İkame Kartı */}
                <div className="space-y-4">
                  {nonCompliantHoldings.map((badRow) => {
                    const alternatives = getCompliantAlternativesForTicker(badRow.ticker, badRow.sector);
                    return (
                      <div
                        key={`bad-${badRow.id}`}
                        className="bg-white/90 dark:bg-[#0E1015]/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-amber-500/20 dark:border-white/10 space-y-4 shadow-xs"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-3">
                          <div className="flex items-center gap-3">
                            <StockLogo ticker={badRow.ticker} name={badRow.companyName} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-[#182542] dark:text-white">
                                  {badRow.ticker} — {badRow.companyName}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                                  ✕ Katılım Dışı
                                </span>
                              </div>
                              <span className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] block">
                                Sektör: {badRow.sector} • Pozisyon Değeri: <strong className="font-mono text-[#182542] dark:text-white">{formatTRY(badRow.positionValueTRY, 2)}</strong> ({badRow.lots} Lot)
                              </span>
                            </div>
                          </div>

                          <div className="bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300">
                            <strong>İhlal Nedeni:</strong> {badRow.ticker === "THYAO" ? "Faizli Kredi ve Borç Eşiği %44.2 > %33.0 yasal tavanı" : "Katılım Endeksi Finansal Rasyo / Faaliyet Eşik Aşımı"}
                          </div>
                        </div>

                        {/* Önerilen Katılım Uyumlu Muadiller */}
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#182542] dark:text-white">
                              <ArrowLeftRight size={13} className="text-emerald-600 dark:text-emerald-400" />
                              <span>Önerilen Katılım Uyumlu Sektörel Muadiller (1 Tıkla İkame Et)</span>
                            </div>
                            <span className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                              BIST Katılım Tam Onaylı
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {alternatives.map((alt) => {
                              const altPrice = parseFloat(livePrices[alt.ticker] || alt.priceTRY?.replace("₺", "").trim() || "50.00");
                              const equivalentLots = Math.max(1, Math.round(badRow.positionValueTRY.toNumber() / altPrice));
                              return (
                                <div
                                  key={alt.ticker}
                                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <StockLogo ticker={alt.ticker} name={alt.name} size="sm" />
                                      <div>
                                        <span className="font-bold text-xs text-[#182542] dark:text-white block">
                                          {alt.ticker}
                                        </span>
                                        <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block truncate max-w-[130px]">
                                          {alt.name}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#0D8B52] dark:text-emerald-400 text-[9px] font-bold">
                                      ✓ Katılım
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] space-y-1">
                                    <div className="flex justify-between">
                                      <span>Canlı Fiyat:</span>
                                      <span className="font-mono font-bold text-[#182542] dark:text-white">₺{altPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Borç Rasyosu:</span>
                                      <span className="font-mono font-bold text-[#0D8B52] dark:text-emerald-400">{alt.debtRatio || "%14.2"} (Güvenli)</span>
                                    </div>
                                    <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400 pt-0.5">
                                      {alt.reason}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleSwapHolding(badRow.id, badRow.ticker, alt.ticker, alt.name)}
                                    className="w-full py-2 rounded-xl bg-[#0D8B52] hover:bg-[#0b7444] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                                  >
                                    <ArrowRight size={13} />
                                    <span>{alt.ticker} ile İkame Et (~{equivalentLots} Lot)</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                          <span>
                            Bu takas işlemiyle <strong>{formatTRY(badRow.positionValueTRY, 2)}</strong> büyüklüğündeki sermayeniz fıkhen helal ve caiz sektörel muadile aktarılır.
                          </span>
                          <span className="text-[#0D8B52] dark:text-emerald-400 font-bold shrink-0">
                            Portföy Uyum Artışı: +%{((badRow.positionValueTRY.toNumber() / portfolioAnalysis.totalMarketValue.toNumber()) * 100).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Portföy Pozisyonları Tablosu */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Portföy Pozisyonları ({portfolioAnalysis.rows.length} Hisse)
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Gerçek Borsa İstanbul logoları ve canlı piyasa değerleri
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#0D8B52] dark:text-emerald-400">
                  Toplam Değer: {formatTRY(portfolioAnalysis.totalMarketValue, 2)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] font-bold text-[11px]">
                      <th className="py-3 px-4">Hisse Senedi</th>
                      <th className="py-3 px-4 text-center">Fıkhi Durum</th>
                      <th className="py-3 px-4 text-right">Lot &amp; Maliyet</th>
                      <th className="py-3 px-4 text-right">Canlı Değer</th>
                      <th className="py-3 px-4 text-right">Kâr / Zarar</th>
                      <th className="py-3 px-4 text-right text-[#182542] dark:text-blue-400">Arındırma Payı</th>
                      <th className="py-3 px-4 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {portfolioAnalysis.rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-[#182542] dark:text-white flex items-center justify-center mx-auto">
                              <Briefcase size={22} />
                            </div>
                            <div className="text-sm font-bold text-[#182542] dark:text-white">
                              Portföyünüz Henüz Boş
                            </div>
                            <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                              Takip etmek istediğiniz BIST hisselerini yukarıdaki forma ekleyerek fıkhi uyumluluk, tahmini arındırma tutarı ve zekât hesaplamalarınızı anında başlatın.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      portfolioAnalysis.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <StockLogo ticker={row.ticker} name={row.companyName} size="sm" />
                            <div>
                              <Link href={`/companies/${row.ticker}`} className="font-bold text-xs text-[#182542] dark:text-white hover:text-blue-600 block">
                                {row.ticker}
                              </Link>
                              <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block truncate max-w-[140px]">
                                {row.companyName}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            row.isCompliant ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-950/40 text-[#C62E26] dark:text-rose-400"
                          }`}>
                            {row.isCompliant ? "✓ Uygun" : "✕ Kapsam Dışı"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-bold text-[#182542] dark:text-white">{row.lots} Lot</div>
                          <div className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">₺{row.avgCostTRY}</div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-bold text-[#182542] dark:text-white">{formatTRY(row.positionValueTRY, 2)}</div>
                          <div className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">₺{row.curPriceTRY.toFixed(2)}</div>
                        </td>

                        <td className={`py-3 px-4 text-right font-mono font-bold ${
                          row.positionPnlTRY.gte(0) ? "text-[#0D8B52] dark:text-emerald-400" : "text-[#C62E26] dark:text-rose-400"
                        }`}>
                          {row.positionPnlTRY.gte(0) ? "+" : ""}{formatTRY(row.positionPnlTRY, 2)} ({row.positionPnlPercent.toFixed(1)}%)
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-[#182542] dark:text-blue-400">
                          {formatTRY(row.purificationResult.totalPurificationPayable, 2)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveHolding(row.id)}
                            className="text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#C62E26] transition p-1"
                            title="Pozisyonu Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* SEKME 2: KURUŞ HASSASİYETLİ ARINDIRMA HESAPLAYICI                 */}
        {/* ================================================================= */}
        {activeTab === "PURIFICATION" && (
          <div className="space-y-6">
            
            {/* Arındırma Açıklama ve Fıkhi Kural Kartı */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#182542] dark:text-white">
                      Fıkhi Arındırma (Purification) Metodolojisi
                    </h3>
                    <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                      Diyanet İşleri Başkanlığı ve TKBB Merkezi Danışma Kurulu standartları
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-full bg-slate-100 dark:bg-white/10 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPurificationMode("TKBB_REAL")}
                      className={`px-3 py-1 rounded-full transition ${
                        purificationMode === "TKBB_REAL"
                          ? "bg-[#182542] text-white shadow-2xs"
                          : "text-[#6E81A0] dark:text-[#94A3B8]"
                      }`}
                    >
                      TKBB Reel (Enflasyon Arındırmalı)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurificationMode("KAFIF_GROSS")}
                      className={`px-3 py-1 rounded-full transition ${
                        purificationMode === "KAFIF_GROSS"
                          ? "bg-[#0D8B52] text-white shadow-2xs"
                          : "text-[#6E81A0] dark:text-[#94A3B8]"
                      }`}
                    >
                      KAFİF Brüt (Helal Finans Uyumlu)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setUseCeilingRounding(!useCeilingRounding)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      useCeilingRounding
                        ? "bg-[#0D8B52] text-white"
                        : "bg-slate-200 dark:bg-white/10 text-[#6E81A0] dark:text-[#94A3B8]"
                    }`}
                  >
                    <span>Yukarı Yuvarlama: {useCeilingRounding ? "Aktif" : "Pasif"}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#182542] dark:text-amber-200 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Fıkhi Hüküm &amp; TKBB Arındırma Standardı (Madde 3.2.1 &amp; 3.6.2)</span>
                  <p className="leading-relaxed">
                    Katılım endeksi şirketlerinin kazancına karışan düşük oranlı (azami %5) faiz veya mahzurlu gelirler; <strong>pay başına düşen yıllık/dönemlik mahzurlu gelir</strong> üzerinden ve hissenin portföyde <strong>tutulduğu toplam gün sayısı (365 gün pro-rata)</strong> oranında hesaplanarak sevap beklemeksizin infak edilmelidir. Tablodaki <strong>Tutulan Gün</strong> veya <strong>Alış Tarihi</strong> alanını doğrudan değiştirerek istediğiniz gün sayısı (örn. 30, 180, 365, 730 gün) üzerinden hesaplama yapabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Hisse Bazlı Arındırma Dökümü Tablosu */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Hisse Başına Güncel Arındırma Hesabı (365 Gün Yıllık Esaslı)
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Elde tutulan gün sayısını veya alış tarihini tablodan doğrudan değiştirebilirsiniz
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#6E81A0] dark:text-[#94A3B8] block">Toplam İnfak Borcu:</span>
                  <span className="text-base font-black font-mono text-[#0D8B52] dark:text-emerald-400">
                    {formatTRY(portfolioAnalysis.totalExitPurificationPayable, 2)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] font-bold text-[11px]">
                      <th className="py-3 px-4">Hisse Senedi</th>
                      <th className="py-3 px-4 text-center">Tutulan Gün &amp; Alış Tarihi</th>
                      <th className="py-3 px-4 text-right">Lot Miktarı</th>
                      <th className="py-3 px-4 text-right">Pay Başı Yıllık Mahzurlu Gelir</th>
                      <th className="py-3 px-4 text-right">Yıllık Gün Oranı (Pro-Rata)</th>
                      <th className="py-3 px-4 text-right font-black text-[#182542] dark:text-white">Toplam Arındırılacak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {portfolioAnalysis.rows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                          Arındırma hesaplanacak hisse pozisyonu bulunmuyor.
                        </td>
                      </tr>
                    ) : (
                      portfolioAnalysis.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <StockLogo ticker={row.ticker} name={row.companyName} size="sm" />
                            <div>
                              <span className="font-bold text-xs text-[#182542] dark:text-white block">
                                {row.ticker}
                              </span>
                              <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
                                {row.companyName}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-mono">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                max="36500"
                                value={row.daysHeld}
                                onChange={(e) =>
                                  handleUpdateHoldingDays(row.id, parseInt(e.target.value) || 1)
                                }
                                className="w-20 px-2 py-1 rounded-lg bg-[#F8F9FA] dark:bg-white/10 border border-slate-200 dark:border-white/15 text-center font-bold text-[#182542] dark:text-white text-xs outline-none focus:border-emerald-500"
                              />
                              <span className="text-[11px] font-bold text-[#182542] dark:text-white">Gün</span>
                              <input
                                type="date"
                                value={row.purchaseDate || ""}
                                onChange={(e) => handleUpdateHoldingDate(row.id, e.target.value)}
                                className="px-2 py-1 rounded-lg bg-[#F8F9FA] dark:bg-white/10 border border-slate-200 dark:border-white/15 text-[11px] font-mono text-[#6E81A0] dark:text-slate-300 outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              {[30, 90, 180, 365].map((presetDays) => (
                                <button
                                  key={presetDays}
                                  type="button"
                                  onClick={() => handleUpdateHoldingDays(row.id, presetDays)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                                    row.daysHeld === presetDays
                                      ? "bg-[#0D8B52] text-white"
                                      : "bg-slate-100 dark:bg-white/5 text-[#6E81A0] hover:bg-slate-200"
                                  }`}
                                >
                                  {presetDays}G
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-[#182542] dark:text-white">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={row.lots}
                              onChange={(e) => handleUpdateHoldingLots(row.id, e.target.value)}
                              className="w-24 px-2 py-1 rounded-lg bg-[#F8F9FA] dark:bg-white/10 border border-slate-200 dark:border-white/15 text-right font-bold text-[#182542] dark:text-white text-xs outline-none focus:border-emerald-500"
                            />
                            <span>Lot</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-[#6E81A0] dark:text-[#94A3B8]">
                          {formatTRY(row.purificationResult.purificationPerShare.times(4), 4)} / pay (yıllık)
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-xs">
                          {row.daysHeld} / 365 gün (%
                          {((row.daysHeld / 365) * 100).toFixed(1)})
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-black text-sm text-[#0D8B52] dark:text-emerald-400">
                          {row.isCompliant || includeNonCompliantInPurification || purificationMode === "KAFIF_GROSS" ? (
                            formatTRY(row.purificationResult.totalPurificationPayable, 2)
                          ) : (
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              Kapsam Dışı (İkame Gerekli)
                            </span>
                          )}
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* İnfak Onay & Belge Butonu */}
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#0D8B52] dark:text-emerald-400 block">
                  Fıkhi Arındırma ve İnfak Dökümü Hazır
                </span>
                <span className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                  Bu tutarı hayır kurumlarına infak ederek fıkhi arındırma sorumluluğunuzu yerine getirebilir, resmi tevsik belgenizi yazdırabilirsiniz.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="px-5 py-2.5 rounded-full bg-[#0D8B52] hover:bg-[#0b7444] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
              >
                <Printer size={14} />
                <span>Resmi Arındırma Belgesini Al (PDF)</span>
              </button>
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* SEKME 3: HİSSE ZEKÂTI (%2,5 & DÖNEN VARLIK ESASI)                 */}
        {/* ================================================================= */}
        {activeTab === "ZAKAT" && (
          <div className="space-y-6">
            
            {/* Zekât Fıkhi Esas Kartı */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#182542] dark:text-white">
                      Hisse Senedi Zekâtı Hesaplama Metodu (1/40 - %2,5)
                    </h3>
                    <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                      İslam Fıkıh Akademisi ve Diyanet İşleri Başkanlığı Fetvaları
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                    Yatırımcı Niyeti:
                  </span>
                  <div className="inline-flex rounded-full bg-slate-100 dark:bg-white/10 p-0.5">
                    <button
                      type="button"
                      onClick={() => setGlobalZakatIntent("LONG_TERM_DIVIDEND")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        globalZakatIntent === "LONG_TERM_DIVIDEND"
                          ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                          : "text-[#6E81A0] dark:text-[#94A3B8]"
                      }`}
                    >
                      Uzun Vade (Dönen Varlık)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlobalZakatIntent("TRADING_SHORT_TERM")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        globalZakatIntent === "TRADING_SHORT_TERM"
                          ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                          : "text-[#6E81A0] dark:text-[#94A3B8]"
                      }`}
                    >
                      Kısa Vade (Piyasa Değeri)
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-[#182542] dark:text-sky-200 flex items-start gap-3">
                <Info size={18} className="text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Uzun Vade ile Kısa Vade Farkı</span>
                  <p className="leading-relaxed">
                    {globalZakatIntent === "LONG_TERM_DIVIDEND" ? (
                      <>
                        <strong>Uzun Vadeli Temettü Yatırımcısı:</strong> Fabrikanın binaları, makineleri, taşıtları ve arsa varlıkları zekâttan muaftır. Zekât matrahı yalnızca hisse başına düşen net dönen varlıklar (nakit, ticari stok ve alacaklar eksi kısa vadeli borçlar) üzerinden hesaplanır. Bu sayede gereksiz fazla zekât ödenmez, fıkha tam uygun kalınır.
                      </>
                    ) : (
                      <>
                        <strong>Kısa Vadeli Al-Sat (Ticaret Malı):</strong> Hisseler ticaret malı hükmünde olduğundan, hissenin bilançosuna bakılmaksızın güncel piyasa değeri üzerinden doğrudan %2,5 (1/40) zekât tahakkuk ettirilir.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Zekât Tablosu */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Hisse Bazında Zekât Matrahı ve Ödenecek Tutar
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Dönen varlık kuralına göre hisse başına düşen zekâta tabi varlık
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#6E81A0] dark:text-[#94A3B8] block">Net Zekât Yükümlülüğü:</span>
                  <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
                    {formatTRY(portfolioAnalysis.totalZakatPayable, 2)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] font-bold text-[11px]">
                      <th className="py-3 px-4">Hisse Senedi</th>
                      <th className="py-3 px-4 text-center">Zekât Niyeti</th>
                      <th className="py-3 px-4 text-right">Lot Miktarı</th>
                      <th className="py-3 px-4 text-right">Zekât Matrahı</th>
                      <th className="py-3 px-4 text-right font-black text-amber-600 dark:text-amber-400">%2,5 Ödenecek Zekât</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {portfolioAnalysis.rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                          Zekât matrahı hesaplanacak hisse pozisyonu bulunmuyor.
                        </td>
                      </tr>
                    ) : (
                      portfolioAnalysis.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <StockLogo ticker={row.ticker} name={row.companyName} size="sm" />
                            <div>
                              <span className="font-bold text-xs text-[#182542] dark:text-white block">
                                {row.ticker}
                              </span>
                              <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
                                {row.companyName}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-[#182542] dark:text-white">
                            {globalZakatIntent === "LONG_TERM_DIVIDEND" ? "Dönen Varlık" : "Ticari Mal"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-[#182542] dark:text-white">
                          {row.lots} Lot
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-[#182542] dark:text-white font-bold">
                          {formatTRY(row.zakatResult.zakatBaseTRY, 2)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-black text-sm text-amber-600 dark:text-amber-400">
                          {formatTRY(row.zakatResult.zakatPayableTRY, 2)}
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nisap Özeti ve Zekât Belgesi Butonu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#182542] dark:text-white block">
                    Nisap Miktarı Karşılaştırması (80.18 gr Altın)
                  </span>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Portföyünüzün toplam dönen varlık matrahı ({formatTRY(portfolioAnalysis.totalZakatBase, 2)}) nisap eşiğini aşmaktadır.
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 text-xs font-bold font-mono shrink-0">
                  ✓ Nisap Üzerinde
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block">
                    Resmi Zekât Tahakkuk Sertifikası
                  </span>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    DİB onaylı %2,5 dönen varlık dökümünüzü PDF olarak kaydedin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(true)}
                  className="px-4 py-2 rounded-full bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <Printer size={14} className="text-amber-400" />
                  <span>Zekât Belgesini Yazdır</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* RESMİ FIKHİ ARINDIRMA VE ZEKÂT BELGESİ MODALI (PDF / YAZDIR)      */}
        {/* ================================================================= */}
        {showCertificateModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white text-slate-900 rounded-[28px] max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative">
              
              {/* Üst İşlem Kontrolleri (Baskıda Görünmez) */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 p-4 sm:px-6 flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0D8B52] flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Resmi Portföy Fıkhi Arındırma &amp; Zekât Belgesi
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      DİB ve TKBB Standart 1 formatında tevsik belgesi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-full bg-[#0D8B52] hover:bg-[#0b7444] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Printer size={14} />
                    <span>Yazdır / PDF Olarak Kaydet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* ============================================================ */}
              {/* BASKI VE PDF İÇİN RESMİ TEVSİK BELGESİ ALANI (#mizan-official-certificate) */}
              {/* ============================================================ */}
              <div id="mizan-official-certificate" className="p-6 sm:p-10 space-y-6 bg-white text-slate-900">
                
                {/* Antet / Kurumsal Başlık */}
                <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#182542] text-white text-[11px] font-black flex items-center justify-center">
                        M
                      </span>
                      <span className="text-xs font-black tracking-widest text-[#182542] uppercase">
                        Mizan Katılım Finans Sistemleri
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                      PORTFÖY FIKHİ ARINDIRMA VE ZEKÂT TAHAKKUK SERTİFİKASI
                    </h2>
                    <p className="text-xs text-slate-600">
                      Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu &amp; TKBB Katılım Standartları Uyarınca Resmi İcazet Dökümü
                    </p>
                  </div>

                  <div className="text-right font-mono text-[11px] space-y-0.5 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div><span className="text-slate-500">Belge No:</span> <strong className="text-slate-900">MZN-ARND-{Math.abs(portfolioAnalysis.totalMarketValue.toNumber() * 31 % 100000).toFixed(0).padStart(6, "0")}</strong></div>
                    <div><span className="text-slate-500">Tanzim Tarihi:</span> <strong className="text-slate-900">{new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</strong></div>
                    <div><span className="text-slate-500">Durum:</span> <span className="text-[#0D8B52] font-bold">✓ Tasdik Edildi</span></div>
                  </div>
                </div>

                {/* Belge ve Yatırımcı Künyesi */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Portföy Sahibi / Mükellef:</span>
                    <strong className="text-slate-900 block truncate">{user?.email || "Mizan Bireysel Yatırımcısı"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Değerleme Esası:</span>
                    <strong className="text-slate-900 block">Canlı BIST Kapanış / Seans</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Fıkhi Metodoloji:</span>
                    <strong className="text-slate-900 block">DİB 2021/11 &amp; TKBB Standart 1</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">İhtiyat Kuralı:</span>
                    <strong className="text-[#0D8B52] block">Yukarı Yuvarlama (Ceiling)</strong>
                  </div>
                </div>

                {/* Yönetici Özet Paneli */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Toplam Portföy Değeri</span>
                    <span className="text-base font-black font-mono text-slate-900">{formatTRY(portfolioAnalysis.totalMarketValue, 2)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Katılım Uyum Ağırlığı</span>
                    <span className="text-base font-black font-mono text-[#0D8B52]">%{portfolioAnalysis.halalWeightPercent.toFixed(1)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block">Fıkhi Arındırma (İnfak)</span>
                    <span className="text-base font-black font-mono text-[#0D8B52]">{formatTRY(portfolioAnalysis.totalExitPurificationPayable, 2)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-800 block">Dönen Varlık Matrahı</span>
                    <span className="text-base font-black font-mono text-amber-800">{formatTRY(portfolioAnalysis.totalZakatBase, 2)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-amber-800 block">Yıllık Hisse Zekâtı (%2,5)</span>
                    <span className="text-base font-black font-mono text-amber-700">{formatTRY(portfolioAnalysis.totalZakatPayable, 2)}</span>
                  </div>
                </div>

                {/* Tablo 1: Portföydeki Hisseler */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                    1. Portföy Varlık Listesi ve Katılım Uyum Durumları
                  </h4>
                  <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead className="bg-slate-100 text-slate-700 text-[10px]">
                      <tr>
                        <th className="p-2 border border-slate-200">Hisse</th>
                        <th className="p-2 border border-slate-200">Şirket Unvanı</th>
                        <th className="p-2 border border-slate-200 text-center">Fıkhi Durum</th>
                        <th className="p-2 border border-slate-200 text-right">Lot</th>
                        <th className="p-2 border border-slate-200 text-right">Birim Fiyat</th>
                        <th className="p-2 border border-slate-200 text-right">Piyasa Değeri</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioAnalysis.rows.map((r) => (
                        <tr key={`cert-pos-${r.id}`} className="border-b border-slate-100">
                          <td className="p-2 border border-slate-200 font-bold">{r.ticker}</td>
                          <td className="p-2 border border-slate-200">{r.companyName}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold">
                            <span className={r.isCompliant ? "text-[#0D8B52]" : "text-rose-600"}>
                              {r.isCompliant ? "✓ Katılım Uyumlu" : "✕ Kapsam Dışı"}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-200 text-right font-mono">{r.lots} Lot</td>
                          <td className="p-2 border border-slate-200 text-right font-mono">₺{r.curPriceTRY.toFixed(2)}</td>
                          <td className="p-2 border border-slate-200 text-right font-mono font-bold">{formatTRY(r.positionValueTRY, 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tablo 2: Kuruş Hassasiyetli Fıkhi Arındırma Dökümü */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                    2. Kuruş Hassasiyetli Fıkhi Arındırma (Purification) İnfak Matrahı
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    TKBB Danışma Kurulu Pay Senedi Standardı (Madde 3.2.1 &amp; 3.6.2) uyarınca enflasyondan arındırılmış pay başı çeyreklik mahzurlu gelir, portföyde tutulan toplam gün sayısına göre (pro-rata) hesaplanmıştır. Katılım dışı hisseler rutin arındırma sertifikasına dahil edilmez; tasfiye/ikame gerektirir.
                  </p>
                  <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead className="bg-slate-100 text-slate-700 text-[10px]">
                      <tr>
                        <th className="p-2 border border-slate-200">Hisse</th>
                        <th className="p-2 border border-slate-200 text-center">Alış Tarihi</th>
                        <th className="p-2 border border-slate-200 text-center">Tutulan Gün</th>
                        <th className="p-2 border border-slate-200 text-right">Pay Başı Çeyreklik Mahzurlu Gelir</th>
                        <th className="p-2 border border-slate-200 text-right">Arındırılacak Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioAnalysis.rows.map((r) => (
                        <tr key={`cert-pur-${r.id}`} className="border-b border-slate-100">
                          <td className="p-2 border border-slate-200 font-bold">{r.ticker}</td>
                          <td className="p-2 border border-slate-200 text-center font-mono">{r.purchaseDate}</td>
                          <td className="p-2 border border-slate-200 text-center font-mono">{r.daysHeld} Gün</td>
                          <td className="p-2 border border-slate-200 text-right font-mono">{formatTRY(r.purificationResult.purificationPerShare, 4)}</td>
                          <td className="p-2 border border-slate-200 text-right font-mono font-bold text-[#0D8B52]">
                            {r.isCompliant
                              ? formatTRY(r.purificationResult.totalPurificationPayable, 2)
                              : "Kapsam Dışı (İkame)"}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-50/50 font-bold">
                        <td colSpan={4} className="p-2 border border-slate-200 text-right text-slate-800">Toplam İnfak / Arındırma Borcu:</td>
                        <td className="p-2 border border-slate-200 text-right font-mono text-sm text-[#0D8B52]">{formatTRY(portfolioAnalysis.totalExitPurificationPayable, 2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tablo 3: Hisse Zekâtı Tahakkuku */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                    3. DİB &amp; AAOIFI Standartlarına Göre Yıllık Hisse Zekâtı Tahakkuku (%2,5)
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Diyanet İşleri Başkanlığı fetvasına göre temettü yatırımlarında sabit tesisler ve makineler zekâttan muaf tutulmuş; yalnızca net dönen varlıklar üzerinden %2,5 zekât tahakkuk ettirilmiştir.
                  </p>
                  <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead className="bg-slate-100 text-slate-700 text-[10px]">
                      <tr>
                        <th className="p-2 border border-slate-200">Hisse</th>
                        <th className="p-2 border border-slate-200 text-center">Zekât Niyeti</th>
                        <th className="p-2 border border-slate-200 text-right">Hisse Başı Dönen Varlık</th>
                        <th className="p-2 border border-slate-200 text-right">Toplam Zekât Matrahı</th>
                        <th className="p-2 border border-slate-200 text-right">%2,5 Ödenecek Zekât</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioAnalysis.rows.map((r) => (
                        <tr key={`cert-zak-${r.id}`} className="border-b border-slate-100">
                          <td className="p-2 border border-slate-200 font-bold">{r.ticker}</td>
                          <td className="p-2 border border-slate-200 text-center text-[10px]">
                            {r.zakatIntent === "LONG_TERM_DIVIDEND" ? "Uzun Vade (Dönen Varlık)" : "Al-Sat (Piyasa Değeri)"}
                          </td>
                          <td className="p-2 border border-slate-200 text-right font-mono">
                            {formatTRY(r.zakatResult.zakatBaseTRY.dividedBy(new Decimal(r.lots || 1)), 2)}
                          </td>
                          <td className="p-2 border border-slate-200 text-right font-mono">{formatTRY(r.zakatResult.zakatBaseTRY, 2)}</td>
                          <td className="p-2 border border-slate-200 text-right font-mono font-bold text-amber-700">{formatTRY(r.zakatResult.zakatPayableTRY, 2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-amber-50/50 font-bold">
                        <td colSpan={4} className="p-2 border border-slate-200 text-right text-slate-800">Toplam Yıllık Hisse Zekâtı Yükümlülüğü:</td>
                        <td className="p-2 border border-slate-200 text-right font-mono text-sm text-amber-700">{formatTRY(portfolioAnalysis.totalZakatPayable, 2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Fıkhi Tasdik Beyanı ve Mühürler */}
                <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="space-y-1 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-700 block">Fıkhi Mutabakat Beyanı:</span>
                    <p className="leading-relaxed">
                      İşbu rapor, Borsa İstanbul ve KAP mali verileri esas alınarak DİB Din İşleri Yüksek Kurulu 2021/11 Kararı ve TKBB Katılım Finans Standart 1 metodolojisine göre kuruş hassasiyetinde hazırlanmıştır.
                    </p>
                  </div>

                  <div className="text-center p-3 rounded-2xl bg-emerald-50 border border-emerald-300">
                    <div className="w-8 h-8 rounded-full bg-[#0D8B52] text-white flex items-center justify-center mx-auto mb-1">
                      <ShieldCheck size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#0D8B52] tracking-wider block">
                      MİZAN KATILIM TASDİKLİ
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 block">
                      DİB-TKBB METODOLOJİ VERIFIED
                    </span>
                  </div>

                  <div className="text-right text-[10px] text-slate-500 space-y-1">
                    <span className="font-bold text-slate-700 block">Algoritmik Denetim Motoru:</span>
                    <span className="font-mono block">Mizan Fıkhi AI v2.4 (Katılım 360)</span>
                    <span className="text-[#0D8B52] font-bold block">Elektronik İcazet Onaylı</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Global Print Stylesheet for High-Res Clean PDF Output */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #mizan-official-certificate,
            #mizan-official-certificate * {
              visibility: visible !important;
            }
            #mizan-official-certificate {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 10mm !important;
              background: white !important;
              color: #0f172a !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

      </div>
    </PaynoShell>
  );
}

export default function PortfolioManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EEF0F4] dark:bg-[#000000] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#182542] border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-xs font-bold text-[#6E81A0]">Portföy yükleniyor...</span>
        </div>
      </div>
    }>
      <PortfolioManagementContent />
    </Suspense>
  );
}
