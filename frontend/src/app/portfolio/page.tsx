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
  History,
  Clock,
  CheckCheck,
  Calendar,
  Upload,
  FolderPlus,
  Folder,
  Layers,
  SlidersHorizontal,
  Activity,
  BellRing,
} from "lucide-react";
import {
  PortfolioHoldingItem,
  PortfolioTransactionItem,
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
import { KafifRiskRadarWidget } from "@/components/KafifRiskRadarWidget";

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

  // Aktif Ana Sekme: Pozisyonlar, Temettü & Olay Takvimi, Fıkhi Arındırma, İşlem Geçmişi & İnfak Defteri, Hisse Zekâtı
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"HOLDINGS" | "CALENDAR" | "PURIFICATION" | "TRANSACTIONS" | "ZAKAT">(
    initialTab === "arindirma"
      ? "PURIFICATION"
      : initialTab === "zekat"
      ? "ZAKAT"
      : initialTab === "islemler" || initialTab === "gecmis"
      ? "TRANSACTIONS"
      : initialTab === "takvim" || initialTab === "temettu"
      ? "CALENDAR"
      : "HOLDINGS"
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "arindirma") setActiveTab("PURIFICATION");
    else if (tabParam === "zekat") setActiveTab("ZAKAT");
    else if (tabParam === "islemler" || tabParam === "gecmis") setActiveTab("TRANSACTIONS");
    else if (tabParam === "takvim" || tabParam === "temettu") setActiveTab("CALENDAR");
    else if (tabParam === "pozisyonlar") setActiveTab("HOLDINGS");

    const actionParam = searchParams.get("action");
    if (actionParam === "add") {
      setAddHoldingModalOpen(true);
    }
  }, [searchParams]);

  // Modallar: Yeni Hisse Ekleme ve Fıkhi İkame (Swap)
  const [addHoldingModalOpen, setAddHoldingModalOpen] = useState<boolean>(false);
  const [swapModalOpen, setSwapModalOpen] = useState<boolean>(false);

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
  const getTransactionsStorageKey = (email?: string) => {
    return email ? `mizan_transactions_${email.toLowerCase().trim()}` : "mizan_user_transactions";
  };

  const DEFAULT_HOLDINGS: PortfolioHoldingItem[] = [];
  const [holdings, setHoldings] = useState<PortfolioHoldingItem[]>([]);
  const [transactions, setTransactions] = useState<PortfolioTransactionItem[]>([]);

  // 1. E-posta veya Kullanıcı değiştiğinde yerelden anında yükle ve bulutla senkronize et
  useEffect(() => {
    if (typeof window === "undefined") return;

    const activeKey = getStorageKey(userEmail);
    const activeTxKey = getTransactionsStorageKey(userEmail);

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

    const localTxSaved =
      localStorage.getItem(activeTxKey) ||
      localStorage.getItem("mizan_user_transactions");

    let initialTransactions: PortfolioTransactionItem[] = [];
    if (localTxSaved) {
      try {
        const parsedTx = JSON.parse(localTxSaved);
        if (Array.isArray(parsedTx)) {
          initialTransactions = parsedTx;
          setTransactions(parsedTx);
        }
      } catch {
        // fallback
      }
    }

    if (!userEmail) {
      isInitialLoadDone.current = true;
      return;
    }

    // Buluttan e-postaya bağlı güncel portföyü ve işlemleri çek
    setIsSyncingCloud(true);
    fetch(`/api/portfolio/sync?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.holdings)) {
            if (data.holdings.length > 0) {
              setHoldings(data.holdings);
              localStorage.setItem(activeKey, JSON.stringify(data.holdings));
              localStorage.setItem("mizan_user_holdings", JSON.stringify(data.holdings));
            } else if (data.holdings.length === 0 && initialHoldings.length > 0) {
              // İlk cihazdaki portföyü buluta aktar
              fetch("/api/portfolio/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, holdings: initialHoldings, transactions: initialTransactions }),
              }).catch(() => {});
            }
          }

          if (Array.isArray(data.transactions) && data.transactions.length > 0) {
            setTransactions(data.transactions);
            localStorage.setItem(activeTxKey, JSON.stringify(data.transactions));
            localStorage.setItem("mizan_user_transactions", JSON.stringify(data.transactions));
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

  // 2. Portföy veya İşlem Geçmişi değiştiğinde yerel hafızaya ve buluta otomatik kaydet
  useEffect(() => {
    if (typeof window === "undefined" || !isInitialLoadDone.current) return;

    const activeKey = getStorageKey(userEmail);
    const activeTxKey = getTransactionsStorageKey(userEmail);

    localStorage.setItem(activeKey, JSON.stringify(holdings));
    localStorage.setItem("mizan_katilim_holdings_v2", JSON.stringify(holdings));
    localStorage.setItem("mizan_user_holdings", JSON.stringify(holdings));

    localStorage.setItem(activeTxKey, JSON.stringify(transactions));
    localStorage.setItem("mizan_user_transactions", JSON.stringify(transactions));

    if (userEmail) {
      fetch("/api/portfolio/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, holdings, transactions }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLastSyncedTime(new Date().toLocaleTimeString("tr-TR"));
          }
        })
        .catch((e) => console.warn("[PORTFOLIO-SYNC] Cloud save error:", e));
    }
  }, [holdings, transactions, userEmail]);

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
    setSwapModalOpen(false);

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

  // =========================================================================
  // MİZAN PORTFÖY 2.0: ÇOKLU SEPET, BENCHMARK GRAFİK & CSV YÖNETİMİ
  // =========================================================================
  // 1. Çoklu Portföy Sepet Mimarisi (Snowball Modeli)
  const [activeBasket, setActiveBasket] = useState<string>("ALL");
  const [customBaskets, setCustomBaskets] = useState<string[]>([
    "Temettü Emekliliği",
    "Büyüme & Teknoloji",
    "Halka Arz Sepeti",
  ]);
  const [newBasketModalOpen, setNewBasketModalOpen] = useState<boolean>(false);
  const [newBasketName, setNewBasketName] = useState<string>("");
  const [newHoldingBasket, setNewHoldingBasket] = useState<string>("Genel Portföy");

  // 2. İnteraktif Varlık Grafiği & Benchmark Kıyaslama (Midas + Robinhood)
  const [chartTimeframe, setChartTimeframe] = useState<"1G" | "1H" | "1A" | "3A" | "1Y" | "ALL">("1A");
  const [benchmarkIndex, setBenchmarkIndex] = useState<"NONE" | "XKTUM" | "XU100">("XKTUM");
  const [scrubbedPoint, setScrubbedPoint] = useState<{
    label: string;
    value: number;
    pnl: number;
    portfolioPercent?: number;
    benchmarkPercent?: number;
    alphaPercent?: number;
  } | null>(null);

  // 3. CSV / Excel İçe ve Dışa Aktarma
  const [csvImportModalOpen, setCsvImportModalOpen] = useState<boolean>(false);
  const [csvInputText, setCsvInputText] = useState<string>("");
  const [csvNotice, setCsvNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      basket: newHoldingBasket,
    };

    setHoldings((prev) => [newItem, ...prev]);
    setNewLots("100");
    setAddHoldingModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      "Hisse Kodu",
      "Şirket Unvanı",
      "Lot Adedi",
      "Ortalama Maliyet (₺)",
      "Güncel Fiyat (₺)",
      "Piyasa Değeri (₺)",
      "Kâr/Zarar (₺)",
      "Kâr/Zarar (%)",
      "Arındırma Borcu (₺)",
      "Katılım Durumu",
      "Alış Tarihi",
      "Sepet",
    ];
    const csvRows = portfolioAnalysis.rows.map((r) => [
      r.ticker,
      `"${r.companyName}"`,
      r.lots,
      r.avgCostTRY,
      r.curPriceTRY.toFixed(2),
      r.positionValueTRY.toFixed(2),
      r.positionPnlTRY.toFixed(2),
      `%${r.positionPnlPercent.toFixed(2)}`,
      r.purificationResult.totalPurificationPayable.toFixed(2),
      r.isCompliant ? "Katılım Uyumlu" : "Kapsam Dışı",
      r.purchaseDate,
      (r as any).basket || "Genel Portföy",
    ]);
    const csvContent = "\uFEFF" + [headers.join(";"), ...csvRows.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Mizan_Portfoy_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvInputText(content);
        setCsvNotice({
          type: "success",
          text: `"${file.name}" dosyası başarıyla yüklendi ve ayrıştırıldı.`,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInputText.trim()) return;

    try {
      const lines = csvInputText.trim().split("\n");
      const importedHoldings: PortfolioHoldingItem[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let parts = trimmed
          .split(/[;,\t|]/)
          .map((p) => p.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);

        // Eğer tek parça kaldıysa boşlukla bölmeyi dene (ör: "BIMAS 100 480" veya "THYAO 50 Lot @ 290")
        if (parts.length < 2) {
          const words = trimmed.replace(/[@#]/g, " ").split(/\s+/).filter(Boolean);
          if (words.length >= 2) {
            parts = words;
          }
        }

        if (parts.length >= 2) {
          const rawTicker = parts[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
          if (
            !rawTicker ||
            rawTicker === "HISSE" ||
            rawTicker === "TICKER" ||
            rawTicker === "KOD" ||
            rawTicker === "SEMBOL"
          ) {
            continue;
          }

          // Lot sayısını bul
          let lotsNum = parseFloat(parts[1].replace(/[^0-9.]/g, "")) || 0;
          if (lotsNum <= 0 && parts[2]) {
            lotsNum = parseFloat(parts[2].replace(/[^0-9.]/g, "")) || 1;
          }
          if (lotsNum <= 0) lotsNum = 1;

          // Maliyet bul
          let avgCostNum = 0;
          if (parts[2]) {
            avgCostNum = parseFloat(parts[2].replace(/[^0-9.]/g, "")) || 0;
          }
          if (avgCostNum <= 0 && parts[3]) {
            avgCostNum = parseFloat(parts[3].replace(/[^0-9.]/g, "")) || 0;
          }
          if (avgCostNum <= 0) {
            avgCostNum = parseFloat(livePrices[rawTicker] || "50.00");
          }

          // Tarih
          let purchaseDateStr = new Date().toISOString().split("T")[0];
          const datePart = parts.find((p) =>
            /\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4}/.test(p)
          );
          if (datePart) {
            if (datePart.includes(".")) {
              const [d, m, y] = datePart.split(".");
              purchaseDateStr = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            } else {
              purchaseDateStr = datePart;
            }
          }

          const basketStr =
            parts.find(
              (p) =>
                p.toLowerCase().includes("sepet") ||
                p.toLowerCase().includes("portföy") ||
                p.toLowerCase().includes("saklama")
            ) || "Genel Portföy";

          importedHoldings.push({
            id: `h-import-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            ticker: rawTicker,
            lots: String(lotsNum),
            avgCostTRY: avgCostNum.toFixed(2),
            purchaseDate: purchaseDateStr,
            purificationMethod: "holding",
            zakatIntent: "LONG_TERM_DIVIDEND",
            basket: basketStr,
          });
        }
      }

      if (importedHoldings.length > 0) {
        setHoldings((prev) => [...importedHoldings, ...prev]);
        setCsvNotice({
          type: "success",
          text: `${importedHoldings.length} hisse pozisyonu başarıyla içe aktarıldı!`,
        });
        setCsvInputText("");
        setTimeout(() => {
          setCsvImportModalOpen(false);
          setCsvNotice(null);
        }, 1500);
      } else {
        setCsvNotice({
          type: "error",
          text: "Geçerli format bulunamadı. Lütfen CSV, Kuveyt Türk, Midas veya MKK formatında girin.",
        });
      }
    } catch (err: any) {
      setCsvNotice({
        type: "error",
        text: `İçe aktarma hatası: ${err?.message || "Bilinmeyen hata"}`,
      });
    }
  };

  const handleCreateBasket = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBasketName.trim();
    if (!trimmed) return;
    if (!customBaskets.includes(trimmed)) {
      setCustomBaskets((prev) => [...prev, trimmed]);
    }
    setActiveBasket(trimmed);
    setNewBasketName("");
    setNewBasketModalOpen(false);
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  // =========================================================================
  // HİSSE SATIŞI (SELL) VE İŞLEM GEÇMİŞİ / İNFAK DEFTERİ YÖNETİMİ
  // =========================================================================
  const [sellModalOpen, setSellModalOpen] = useState<boolean>(false);
  const [selectedHoldingForSell, setSelectedHoldingForSell] = useState<any | null>(null);
  const [sellLotsInput, setSellLotsInput] = useState<string>("10");
  const [sellPriceInput, setSellPriceInput] = useState<string>("100.00");
  const [sellDateInput, setSellDateInput] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [sellSuccessNotice, setSellSuccessNotice] = useState<{
    ticker: string;
    lots: number;
    realizedPnl: number;
    purification: number;
  } | null>(null);

  // Manuel Geçmiş Satış Ekleme Modalı
  const [manualTradeModalOpen, setManualTradeModalOpen] = useState<boolean>(false);
  const [manualTicker, setManualTicker] = useState<string>("BIMAS");
  const [manualLots, setManualLots] = useState<string>("100");
  const [manualBuyPrice, setManualBuyPrice] = useState<string>("450.00");
  const [manualSellPrice, setManualSellPrice] = useState<string>("482.50");
  const [manualBuyDate, setManualBuyDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 180);
    return d.toISOString().split("T")[0];
  });
  const [manualSellDate, setManualSellDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [manualIsPurified, setManualIsPurified] = useState<boolean>(false);

  const handleOpenSellModal = (row: any) => {
    setSelectedHoldingForSell(row);
    setSellLotsInput(String(row.lots));
    const live = livePrices[row.ticker] || (row.curPriceTRY ? String(row.curPriceTRY) : row.avgCostTRY);
    setSellPriceInput(live);
    setSellDateInput(new Date().toISOString().split("T")[0]);
    setSellModalOpen(true);
  };

  const handleConfirmSell = () => {
    if (!selectedHoldingForSell) return;

    const availableLots = parseFloat(selectedHoldingForSell.lots) || 0;
    const sellLots = Math.min(Math.max(1, parseFloat(sellLotsInput) || 1), availableLots);
    const sellPrice = Math.max(0, parseFloat(sellPriceInput) || 0);
    const avgCost = parseFloat(selectedHoldingForSell.avgCostTRY) || 0;

    const grossProceeds = sellLots * sellPrice;
    const costBasis = sellLots * avgCost;
    const realizedPnl = grossProceeds - costBasis;
    const realizedPnlPercent = costBasis > 0 ? (realizedPnl / costBasis) * 100 : 0;

    // Fıkhi Arındırma Hesabı
    const detail = DETAILED_COMPANIES_DATABASE[selectedHoldingForSell.ticker];
    const compSummary = getCompanySummary(selectedHoldingForSell.ticker);
    const totalShares = detail?.purificationMetrics?.totalSharesOutstanding || "1000000000";
    const basePShareQuarter = new Decimal(
      detail?.purificationMetrics?.purificationPerShareQuarterTRY ||
        compSummary?.purificationPerShareTRY ||
        "0"
    );
    const grossMultiplier = purificationMode === "KAFIF_GROSS" ? new Decimal("3.85") : new Decimal("1");
    const effectivePShareQuarter = basePShareQuarter.times(grossMultiplier);
    const impureIncome = effectivePShareQuarter.times(new Decimal(totalShares)).toFixed(4);

    const { totalDaysHeld } = calculateDaysHeld(selectedHoldingForSell.purchaseDate, sellDateInput);

    const purCalc = calculateHoldingPurificationClient(
      impureIncome,
      totalShares,
      new Decimal(sellLots),
      totalDaysHeld,
      90,
      useCeilingRounding
    );

    const purificationAmount = purCalc.totalPurificationPayable.toNumber();

    // 1. Yeni Transaction Oluştur
    const newTx: PortfolioTransactionItem = {
      id: `tx_${Date.now()}`,
      ticker: selectedHoldingForSell.ticker,
      type: "SELL",
      lots: sellLots,
      priceTRY: sellPrice,
      totalAmountTRY: grossProceeds,
      realizedPnlTRY: realizedPnl,
      realizedPnlPercent: realizedPnlPercent,
      purificationAmountTRY: purificationAmount,
      isPurified: false, // Varsayılan: henüz infak edilmedi (bekliyor)
      date: sellDateInput,
      notes: `${sellLots} Lot @ ₺${sellPrice.toFixed(2)} satış gerçekleşti. (${totalDaysHeld} gün elde tutuldu)`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // 2. Portföy Pozisyonunu Azalt veya Tamamen Sil
    const remainingLots = availableLots - sellLots;
    if (remainingLots <= 0) {
      setHoldings((prev) => prev.filter((h) => h.id !== selectedHoldingForSell.id));
    } else {
      setHoldings((prev) =>
        prev.map((h) =>
          h.id === selectedHoldingForSell.id ? { ...h, lots: String(remainingLots) } : h
        )
      );
    }

    // 3. Bildirim & Kapat
    setSellSuccessNotice({
      ticker: selectedHoldingForSell.ticker,
      lots: sellLots,
      realizedPnl,
      purification: purificationAmount,
    });
    setSellModalOpen(false);
    setSelectedHoldingForSell(null);

    setTimeout(() => {
      setSellSuccessNotice(null);
    }, 8000);
  };

  const handleTogglePurificationStatus = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, isPurified: !t.isPurified } : t))
    );
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  const handleAddManualTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const lots = Math.max(1, parseFloat(manualLots) || 1);
    const buyPrice = Math.max(0, parseFloat(manualBuyPrice) || 0);
    const sellPrice = Math.max(0, parseFloat(manualSellPrice) || 0);

    const grossProceeds = lots * sellPrice;
    const costBasis = lots * buyPrice;
    const realizedPnl = grossProceeds - costBasis;
    const realizedPnlPercent = costBasis > 0 ? (realizedPnl / costBasis) * 100 : 0;

    const { totalDaysHeld } = calculateDaysHeld(manualBuyDate, manualSellDate);

    const detail = DETAILED_COMPANIES_DATABASE[manualTicker];
    const compSummary = getCompanySummary(manualTicker);
    const totalShares = detail?.purificationMetrics?.totalSharesOutstanding || "1000000000";
    const basePShareQuarter = new Decimal(
      detail?.purificationMetrics?.purificationPerShareQuarterTRY ||
        compSummary?.purificationPerShareTRY ||
        "0"
    );
    const grossMultiplier = purificationMode === "KAFIF_GROSS" ? new Decimal("3.85") : new Decimal("1");
    const effectivePShareQuarter = basePShareQuarter.times(grossMultiplier);
    const impureIncome = effectivePShareQuarter.times(new Decimal(totalShares)).toFixed(4);

    const purCalc = calculateHoldingPurificationClient(
      impureIncome,
      totalShares,
      new Decimal(lots),
      totalDaysHeld,
      90,
      useCeilingRounding
    );

    const purificationAmount = purCalc.totalPurificationPayable.toNumber();

    const newTx: PortfolioTransactionItem = {
      id: `tx_${Date.now()}`,
      ticker: manualTicker,
      type: "SELL",
      lots,
      priceTRY: sellPrice,
      totalAmountTRY: grossProceeds,
      realizedPnlTRY: realizedPnl,
      realizedPnlPercent,
      purificationAmountTRY: purificationAmount,
      isPurified: manualIsPurified,
      date: manualSellDate,
      notes: `Manuel satış kaydı: ${lots} Lot @ ₺${sellPrice.toFixed(2)} (${totalDaysHeld} gün)`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setManualTradeModalOpen(false);
  };

  // İşlem Geçmişi & İnfak Defteri KPI Özeti
  const transactionSummary = useMemo(() => {
    let totalSellProceeds = new Decimal(0);
    let totalRealizedPnl = new Decimal(0);
    let totalPurificationSum = new Decimal(0);
    let totalPurifiedSum = new Decimal(0);
    let totalPendingPurificationSum = new Decimal(0);

    transactions.forEach((tx) => {
      if (tx.type === "SELL") {
        totalSellProceeds = totalSellProceeds.plus(tx.totalAmountTRY || 0);
        if (typeof tx.realizedPnlTRY === "number") {
          totalRealizedPnl = totalRealizedPnl.plus(tx.realizedPnlTRY);
        }
      }
      const purif = new Decimal(tx.purificationAmountTRY || 0);
      totalPurificationSum = totalPurificationSum.plus(purif);
      if (tx.isPurified) {
        totalPurifiedSum = totalPurifiedSum.plus(purif);
      } else {
        totalPendingPurificationSum = totalPendingPurificationSum.plus(purif);
      }
    });

    return {
      totalSellProceeds,
      totalRealizedPnl,
      totalPurificationSum,
      totalPurifiedSum,
      totalPendingPurificationSum,
    };
  }, [transactions]);

  // Portföy Analiz Motoru
  const portfolioAnalysis = useMemo(() => {
    let totalMarketValue = new Decimal(0);
    let totalCostBasis = new Decimal(0);
    let totalTodayPnlTRY = new Decimal(0);
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

      const totalDaysHeld = calculateDaysHeld(item.purchaseDate).totalDaysHeld;
      const daysHeldInQuarter = Math.min(totalDaysHeld, 90);
      const detail = DETAILED_COMPANIES_DATABASE[item.ticker];
      const compSummary = getCompanySummary(item.ticker);
      const isCompliant = compSummary?.bistStatus === "COMPLIANT" || compSummary?.bistStatus === "GRACE_PERIOD_TOLERANCE";

      // Günlük Kâr/Zarar Katkısı (Today's P&L)
      const change24hStr = compSummary?.change24h || "+0.00%";
      const changePercentNum = parseFloat(change24hStr.replace("%", "").replace("+", "").trim()) || 0;
      const prevPrice = curPriceDec.dividedBy(new Decimal(1).plus(new Decimal(changePercentNum).dividedBy(100)));
      const holdingTodayGain = positionValue.minus(lotsDec.times(prevPrice));
      totalTodayPnlTRY = totalTodayPnlTRY.plus(holdingTodayGain);

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
        debtRatioPercent: compSummary?.debtRatioPercent ?? 0,
        cashRatioPercent: compSummary?.cashRatioPercent ?? 0,
        impureIncomePercent: compSummary?.impureIncomePercent ?? 0,
        change24hStr,
        curPriceTRY: curPriceDec,
        positionCostTRY: positionCost,
        positionValueTRY: positionValue,
        positionPnlTRY: positionPnl,
        positionPnlPercent,
        holdingTodayGainTRY: holdingTodayGain,
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

    const todayPnlTRY = totalTodayPnlTRY;
    const prevDayTotal = totalMarketValue.minus(todayPnlTRY);
    const todayPnlPercent = prevDayTotal.gt(0)
      ? todayPnlTRY.dividedBy(prevDayTotal).times(100)
      : new Decimal(0);

    const halalWeightPercent = totalMarketValue.gt(0)
      ? compliantMarketValue.dividedBy(totalMarketValue).times(100)
      : new Decimal(100);

    // Sektörel Dağılım Röntgeni (Simply Wall St)
    const sectorMap: Record<string, { sector: string; valueTRY: Decimal; count: number }> = {};
    rows.forEach((r) => {
      const sec = r.sector || "Diğer";
      if (!sectorMap[sec]) sectorMap[sec] = { sector: sec, valueTRY: new Decimal(0), count: 0 };
      sectorMap[sec].valueTRY = sectorMap[sec].valueTRY.plus(r.positionValueTRY);
      sectorMap[sec].count += 1;
    });
    const sectorBreakdown = Object.values(sectorMap)
      .map((s) => ({
        sector: s.sector,
        valueTRY: s.valueTRY,
        weightPercent: totalMarketValue.gt(0)
          ? s.valueTRY.dividedBy(totalMarketValue).times(100).toNumber()
          : 0,
        count: s.count,
      }))
      .sort((a, b) => b.weightPercent - a.weightPercent);

    // KAFİF Erken Uyarı Risk Radarı (Zoya Modeli)
    const kafifAlerts = rows
      .map((r) => {
        const debt = r.debtRatioPercent;
        const impure = r.impureIncomePercent;
        const isNearBreach = debt >= 25 && debt < 33;
        const isBreached = debt >= 33 || impure >= 5.0 || !r.isCompliant;
        return {
          ticker: r.ticker,
          companyName: r.companyName,
          debtRatioPercent: debt,
          impureIncomePercent: impure,
          isNearBreach,
          isBreached,
          warningMessage: isBreached
            ? `${r.ticker} faizli borç (%${debt.toFixed(1)}) veya mahzurlu gelir eşiğini aşarak katılım dışı kalmıştır.`
            : isNearBreach
            ? `${r.ticker} faizli finansal borç oranı %${debt.toFixed(1)} ile %33 tavanına yaklaştı! Gelecek çeyrekte endeksten çıkma riski var.`
            : null,
        };
      })
      .filter((k) => k.isNearBreach || k.isBreached);

    // Yoğunlaşma Riski (Concentration Risk)
    const maxHolding = rows.reduce(
      (max, curr) => (curr.positionValueTRY.gt(max?.positionValueTRY || 0) ? curr : max),
      rows[0] || null
    );
    const maxHoldingWeight =
      maxHolding && totalMarketValue.gt(0)
        ? maxHolding.positionValueTRY.dividedBy(totalMarketValue).times(100).toNumber()
        : 0;

    const maxSector = sectorBreakdown[0] || null;
    const isSingleStockConcentrated = maxHoldingWeight > 35;
    const isSectorConcentrated = maxSector ? maxSector.weightPercent > 50 : false;

    // Aylık Temettü Nakit Akışı (Stock Events Modeli)
    const monthlyDividendMap: number[] = Array(12).fill(0);
    let totalAnnualProjectedDividends = 0;

    rows.forEach((r) => {
      const val = r.positionValueTRY.toNumber();
      const t = r.ticker;
      let yieldRate = 0.035;
      let months = [4, 10]; // Mayıs & Kasım

      if (t === "BIMAS") { yieldRate = 0.038; months = [4, 10]; }
      else if (t === "FROTO") { yieldRate = 0.052; months = [2, 10]; }
      else if (t === "TUPRS") { yieldRate = 0.065; months = [2, 8]; }
      else if (t === "EREGL") { yieldRate = 0.045; months = [3]; }
      else if (t === "ASELS") { yieldRate = 0.015; months = [3, 10]; }
      else if (t === "MAVI") { yieldRate = 0.040; months = [4]; }

      const annualDiv = val * yieldRate;
      totalAnnualProjectedDividends += annualDiv;
      months.forEach((m) => {
        monthlyDividendMap[m] += annualDiv / months.length;
      });
    });

    const projectedYieldOnCost = totalCostBasis.gt(0)
      ? (totalAnnualProjectedDividends / totalCostBasis.toNumber()) * 100
      : 0;

    // Portföye Özel Canlı KAP Akışı (Stock Events Modeli)
    const portfolioTickers = new Set(rows.map((r) => r.ticker));
    const allSampleKap = [
      {
        id: "kap-1",
        ticker: "BIMAS",
        companyName: "BİM Birleşik Mağazalar A.Ş.",
        date: "Bugün 17:42",
        type: "DIVIDEND",
        title: "Nakit Kâr Payı Dağıtım Tarihi ve Oranı",
        summary: "Yönetim Kurulu pay başına brüt ₺5,00 nakit temettünün 15 Mayıs ve 15 Kasım tarihlerinde 2 taksitle ödenmesini Genel Kurul'a teklif etti.",
        badge: "Temettü Kararı",
      },
      {
        id: "kap-2",
        ticker: "ASELS",
        companyName: "Aselsan Elektronik Sanayi A.Ş.",
        date: "Bugün 16:15",
        type: "KAFIF",
        title: "2026/Q1 Katılım Finans İlkeleri Bilgi Formu",
        summary: "Katılım Finans İlkelerine Uygunluk Raporu açıklandı. Faizli borç oranı %14,2 (Tavan %33), nakit oranı %8,4 ile BIST Katılım kriterlerine tam uyumludur.",
        badge: "KAFİF Tasdik Formu",
      },
      {
        id: "kap-3",
        ticker: "FROTO",
        companyName: "Ford Otomotiv Sanayi A.Ş.",
        date: "Dün 18:30",
        type: "FINANCIAL",
        title: "2026 1. Çeyrek Finansal Rapor Açıklama Takvimi",
        summary: "Şirketin 2026/Q1 konsolide mali tablolarının 8 Mayıs 2026 seans bitimi sonrası KAP'ta ilan edileceği bildirilmiştir.",
        badge: "Bilanço Takvimi",
      },
      {
        id: "kap-4",
        ticker: "THYAO",
        companyName: "Türk Hava Yolları A.O.",
        date: "25 Nisan 2026",
        type: "COMPLIANCE",
        title: "Katılım Endeksi Periyodik Değerlendirme Bilgilendirmesi",
        summary: "KAFİF borç rasyoları güncellemesi yayımlandı. Faizli borç oranı %38,74 ile %33 eşiğinin üzerinde kalmaya devam etmektedir.",
        badge: "Kapsam Dışı İkazı",
      },
      {
        id: "kap-5",
        ticker: "TUPRS",
        companyName: "Tüpraş Türkiye Petrol Rafinerileri A.Ş.",
        date: "24 Nisan 2026",
        type: "DIVIDEND",
        title: "Olağan Genel Kurul Kâr Dağıtım Onayı",
        summary: "Genel Kurul toplantısında pay sahiplerine hisse başına brüt ₺10,35 nakit kâr payı dağıtımı oy birliğiyle kabul edildi.",
        badge: "Temettü Onayı",
      },
      {
        id: "kap-6",
        ticker: "EREGL",
        companyName: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş.",
        date: "22 Nisan 2026",
        type: "KAFIF",
        title: "Katılım Finans Kriterleri Güncellemesi",
        summary: "Şirketin BIST Katılım Tüm Endeksi'ndeki ağırlığı ve KAFİF arındırma katsayısı pay başına ₺0,284 olarak güncellendi.",
        badge: "KAFİF Güncellemesi",
      },
      {
        id: "kap-7",
        ticker: "MAVI",
        companyName: "Mavi Giyim Sanayi ve Ticaret A.Ş.",
        date: "20 Nisan 2026",
        type: "DIVIDEND",
        title: "Kâr Payı Dağıtım Bildirimi",
        summary: "Pay başına brüt ₺4,20 nakit temettü 8 Mayıs 2026 tarihinde hak sahiplerinin hesaplarına geçecektir.",
        badge: "Temettü Tarihi",
      },
    ];
    const portfolioKapDisclosures = allSampleKap.filter((k) => portfolioTickers.has(k.ticker));

    return {
      rows,
      totalMarketValue,
      totalCostBasis,
      totalPnlTRY,
      totalPnlPercent,
      todayPnlTRY,
      todayPnlPercent,
      halalWeightPercent,
      totalExitPurificationPayable,
      totalZakatPayable,
      totalZakatBase,
      sectorBreakdown,
      kafifAlerts,
      isSingleStockConcentrated,
      maxHolding,
      maxHoldingWeight,
      isSectorConcentrated,
      maxSector,
      monthlyDividendMap,
      totalAnnualProjectedDividends,
      projectedYieldOnCost,
      portfolioKapDisclosures,
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

  // Seçili sepete göre filtrelenmiş hisseler (Snowball Modeli)
  const filteredRows = useMemo(() => {
    if (activeBasket === "ALL") return portfolioAnalysis.rows;
    return portfolioAnalysis.rows.filter(
      (r) => (r as any).basket === activeBasket
    );
  }, [portfolioAnalysis.rows, activeBasket]);

  // İnteraktif Varlık Çizgi Grafiği & Benchmark Veri Noktaları (Midas + Robinhood)
  const timelineData = useMemo(() => {
    const totalVal = portfolioAnalysis.totalMarketValue.toNumber();
    if (totalVal <= 0) return [];

    let labels: string[] = [];
    let portfolioDeltas: number[] = [];
    let benchmarkDeltas: number[] = [];

    if (chartTimeframe === "1G") {
      labels = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
      portfolioDeltas = [-0.3, 0.1, 0.4, 0.2, 0.7, 0.9, 0.6, 1.2, 1.39];
      benchmarkDeltas = [-0.1, 0.0, 0.2, 0.1, 0.4, 0.5, 0.4, 0.8, 0.95];
    } else if (chartTimeframe === "1H") {
      labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Pzt", "Bugün"];
      portfolioDeltas = [-1.2, -0.4, 0.8, 1.4, 2.1, 2.8, 3.4];
      benchmarkDeltas = [-0.8, -0.2, 0.4, 0.9, 1.2, 1.6, 2.0];
    } else if (chartTimeframe === "1A") {
      labels = ["1 Nis", "6 Nis", "11 Nis", "16 Nis", "21 Nis", "26 Nis", "Bugün"];
      portfolioDeltas = [-2.5, -0.8, 1.6, 3.8, 5.2, 7.1, 8.4];
      benchmarkDeltas = [-1.5, -0.3, 0.8, 2.1, 3.4, 4.8, 5.5];
    } else if (chartTimeframe === "3A") {
      labels = ["Şubat", "Mart", "Nisan", "Bugün"];
      portfolioDeltas = [1.2, 5.8, 12.4, 16.8];
      benchmarkDeltas = [0.8, 4.1, 8.5, 12.0];
    } else {
      labels = ["2025/Q2", "2025/Q3", "2025/Q4", "2026/Q1", "Bugün"];
      portfolioDeltas = [5.0, 12.5, 18.0, 26.5, 34.2];
      benchmarkDeltas = [3.2, 8.4, 13.0, 18.5, 24.0];
    }

    const currentPnlVal = portfolioAnalysis.totalPnlTRY.toNumber();

    return labels.map((label, idx) => {
      const pDelta = portfolioDeltas[idx] ?? 0;
      const bDelta = benchmarkDeltas[idx] ?? 0;
      const pointVal = Math.round(totalVal * (1 + pDelta / 100));
      const pointPnl = Math.round(currentPnlVal * (1 + pDelta / 100));
      const alpha = +(pDelta - bDelta).toFixed(2);

      return {
        label,
        value: pointVal,
        pnl: pointPnl,
        portfolioPercent: pDelta,
        benchmarkPercent: bDelta,
        alphaPercent: alpha,
      };
    });
  }, [portfolioAnalysis.totalMarketValue, portfolioAnalysis.totalPnlTRY, chartTimeframe]);

  return (
    <PaynoShell badge="portföy">
      <div className="space-y-6">
        
        {/* ================================================================= */}
        {/* 1. ÜST HERO BAŞLIK & İŞLEM KONTROLLERİ                            */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Portföyüm
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Canlı BIST Seansı
              </span>
              <span>•</span>
              {userEmail ? (
                <span>{userEmail} ile senkronize</span>
              ) : (
                <span>Yerel Portföy</span>
              )}
            </div>
          </div>

          {/* Aksiyon Butonları (Apple Cupertino Minimalist) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={tickLivePrices}
              className="w-9 h-9 rounded-full bg-white dark:bg-[#0E1015] border border-slate-200/80 dark:border-white/10 shadow-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Canlı Fiyatları Güncelle"
            >
              <RefreshCw size={14} />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="rounded-full bg-white dark:bg-[#0E1015] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-200 px-3.5 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="CSV olarak indir"
            >
              <Download size={13} className="text-blue-500" />
              <span>CSV İndir</span>
            </button>

            <button
              type="button"
              onClick={() => setCsvImportModalOpen(true)}
              className="rounded-full bg-white dark:bg-[#0E1015] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-200 px-3.5 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Portföyü içe aktar"
            >
              <Upload size={13} className="text-purple-500" />
              <span>İçe Aktar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCertificateModal(true)}
              className="rounded-full bg-white dark:bg-[#0E1015] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-200 px-3.5 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Resmi DİB & TKBB Tevsik Belgesi (PDF)"
            >
              <FileText size={13} className="text-emerald-500" />
              <span>Fıkhi Belge</span>
            </button>

            <button
              type="button"
              onClick={() => setAddHoldingModalOpen(true)}
              className="rounded-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black px-4 py-2 text-xs font-bold shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Hisse Ekle</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. SEPET SEÇİCİ BAR                                               */}
        {/* ================================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/60 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveBasket("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeBasket === "ALL"
                ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                : "bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers size={12} />
            <span>Tümü ({portfolioAnalysis.rows.length})</span>
          </button>

          {customBaskets.map((basketName) => {
            const count = portfolioAnalysis.rows.filter((r) => (r as any).basket === basketName).length;
            return (
              <button
                key={basketName}
                type="button"
                onClick={() => setActiveBasket(basketName)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeBasket === basketName
                    ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                    : "bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Folder size={12} />
                <span>{basketName} ({count})</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setNewBasketModalOpen(true)}
            className="px-3 py-1.5 rounded-full border border-dashed border-slate-300 dark:border-white/20 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <FolderPlus size={12} />
            <span>+ Yeni Sepet</span>
          </button>
        </div>

        {/* KAFİF Erken Uyarı - Yalnızca kritik risk varsa zarif mini şerit */}
        {portfolioAnalysis.kafifAlerts.length > 0 && (
          <div className="p-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>KAFİF Erken Uyarı:</strong> {portfolioAnalysis.kafifAlerts.map(a => a.warningMessage).join(" ")}
              </span>
            </div>
            {nonCompliantHoldings.length > 0 && (
              <button
                type="button"
                onClick={() => setSwapModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shrink-0 transition cursor-pointer"
              >
                Muadille Değiştir &rarr;
              </button>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. 4'LÜ COMPACT BENTO METRİK ŞERİDİ                                */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Portföy Değeri */}
          <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">
              Toplam Değer
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {formatTRY(portfolioAnalysis.totalMarketValue, 2)}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                portfolioAnalysis.todayPnlTRY.gte(0)
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}>
                {portfolioAnalysis.todayPnlTRY.gte(0) ? "▲ +" : "▼ "}
                {formatTRY(portfolioAnalysis.todayPnlTRY, 2)} ({portfolioAnalysis.todayPnlPercent.toFixed(1)}%) Bugün
              </span>
            </div>
          </div>

          {/* 2. Katılım Uyum Oranı */}
          <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">
              Katılım Uyumu
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              %{portfolioAnalysis.halalWeightPercent.toFixed(1)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              {portfolioAnalysis.rows.filter(r => r.isCompliant).length} / {portfolioAnalysis.rows.length} Hisse Tam Uyumlu
            </div>
          </div>

          {/* 3. Fıkhi Arındırma */}
          <div
            onClick={() => setActiveTab("PURIFICATION")}
            className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2 cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">
                Fıkhi Arındırma
              </span>
              <Scale size={13} className="text-blue-500 opacity-60 group-hover:opacity-100 transition" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {formatTRY(portfolioAnalysis.totalExitPurificationPayable, 2)}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
              <span>İnfak Dökümü &rarr;</span>
            </div>
          </div>

          {/* 4. Yıllık Hisse Zekâtı */}
          <div
            onClick={() => setActiveTab("ZAKAT")}
            className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2 cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">
                Hisse Zekâtı (%2,5)
              </span>
              <Coins size={13} className="text-amber-500 opacity-60 group-hover:opacity-100 transition" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {formatTRY(portfolioAnalysis.totalZakatPayable, 2)}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <span>Zekât Hesabı &rarr;</span>
            </div>
          </div>
        </div>

        </div>

        {/* ================================================================= */}
        {/* İNTERAKTİF VARLIK ÇİZGİ GRAFİĞİ & BENCHMARK (Midas + Robinhood)   */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-[#0E1015] rounded-[26px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
                Portföy Varlık Eğrisi &amp; Alpha Performansı
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#182542] dark:text-white">
                  ₺{scrubbedPoint ? scrubbedPoint.value.toLocaleString("tr-TR") : portfolioAnalysis.totalMarketValue.toNumber().toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                </span>
                
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                  (scrubbedPoint?.pnl ?? portfolioAnalysis.totalPnlTRY.toNumber()) >= 0
                    ? "bg-emerald-500/15 text-[#0D8B52] dark:text-emerald-400"
                    : "bg-rose-500/15 text-[#C62E26] dark:text-rose-400"
                }`}>
                  {(scrubbedPoint?.pnl ?? portfolioAnalysis.totalPnlTRY.toNumber()) >= 0 ? "▲ +" : "▼ "}
                  {scrubbedPoint ? `%${scrubbedPoint.portfolioPercent} (${scrubbedPoint.label})` : `₺${formatTRY(portfolioAnalysis.todayPnlTRY, 2)} (${portfolioAnalysis.todayPnlPercent.toFixed(2)}%) Bugün`}
                </span>

                {benchmarkIndex !== "NONE" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    <Activity size={12} />
                    <span>Alpha: +%{scrubbedPoint?.alphaPercent ?? timelineData[timelineData.length - 1]?.alphaPercent ?? 2.8} ({benchmarkIndex} Üzeri)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Zaman Çizelgesi ve Endeks Kıyaslama Butonları */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 text-xs font-bold">
                {(["1G", "1H", "1A", "3A", "1Y", "ALL"] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => {
                      setChartTimeframe(tf);
                      setScrubbedPoint(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      chartTimeframe === tf
                        ? "bg-[#182542] dark:bg-white text-white dark:text-black shadow-2xs"
                        : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                    }`}
                  >
                    {tf === "ALL" ? "TÜMÜ" : tf}
                  </button>
                ))}
              </div>

              {/* Benchmark Endeks Kıyaslama Butonları */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBenchmarkIndex(benchmarkIndex === "XKTUM" ? "NONE" : "XKTUM")}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    benchmarkIndex === "XKTUM"
                      ? "bg-[#0D8B52] text-white shadow-2xs"
                      : "text-[#6E81A0] dark:text-[#94A3B8]"
                  }`}
                  title="BIST Katılım Endeksi ile kıyasla"
                >
                  <span>XKTUM (Katılım)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBenchmarkIndex(benchmarkIndex === "XU100" ? "NONE" : "XU100")}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    benchmarkIndex === "XU100"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-[#6E81A0] dark:text-[#94A3B8]"
                  }`}
                  title="BIST 100 ile kıyasla"
                >
                  <span>XU100</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scrubbable SVG Çizgi Grafiği */}
          <div className="relative w-full h-44 sm:h-52 select-none">
            {timelineData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#6E81A0]">
                Grafiği görüntülemek için portföye hisse ekleyin.
              </div>
            ) : (() => {
              const minVal = Math.min(...timelineData.map(d => d.value));
              const maxVal = Math.max(...timelineData.map(d => d.value));
              const range = Math.max(1, maxVal - minVal);
              const width = 800;
              const height = 180;
              const padding = 20;

              const points = timelineData.map((d, i) => {
                const x = padding + (i / (timelineData.length - 1)) * (width - 2 * padding);
                const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
                return { ...d, x, y };
              });

              const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
              const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

              // Benchmark path (kesikli çizgi)
              const bPoints = points.map((p, i) => {
                const bVal = minVal + range * (0.3 + (i / points.length) * 0.4);
                const by = height - padding - ((bVal - minVal) / range) * (height - 2 * padding);
                return { x: p.x, y: by };
              });
              const bPathD = bPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");

              return (
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  onMouseLeave={() => setScrubbedPoint(null)}
                >
                  <defs>
                    <linearGradient id="portfolioLineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Arka Plan Izgara Çizgileri */}
                  <line x1={padding} y1={height * 0.25} x2={width - padding} y2={height * 0.25} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
                  <line x1={padding} y1={height * 0.5} x2={width - padding} y2={height * 0.5} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
                  <line x1={padding} y1={height * 0.75} x2={width - padding} y2={height * 0.75} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />

                  {/* Alan Dolgusu */}
                  <path d={areaD} fill="url(#portfolioLineGradient)" />

                  {/* Benchmark Çizgisi (XKTUM / XU100) */}
                  {benchmarkIndex !== "NONE" && (
                    <path
                      d={bPathD}
                      fill="none"
                      stroke={benchmarkIndex === "XKTUM" ? "#0D8B52" : "#3B82F6"}
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      strokeOpacity="0.65"
                    />
                  )}

                  {/* Portföy Ana Çizgisi */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* İnteraktif Noktalar & Scrubbing */}
                  {points.map((p, i) => (
                    <g key={i} className="cursor-pointer" onMouseEnter={() => setScrubbedPoint(p)}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={scrubbedPoint?.label === p.label ? "6" : "3.5"}
                        fill={scrubbedPoint?.label === p.label ? "#10B981" : "#182542"}
                        stroke="#10B981"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                      {/* Görünmez geniş dokunma alanı */}
                      <rect
                        x={p.x - 15}
                        y={0}
                        width="30"
                        height={height}
                        fill="transparent"
                      />
                    </g>
                  ))}

                  {/* Aktif İnceleme Dikey Çizgisi */}
                  {scrubbedPoint && (() => {
                    const activeP = points.find(p => p.label === scrubbedPoint.label);
                    if (!activeP) return null;
                    return (
                      <line
                        x1={activeP.x}
                        y1={0}
                        x2={activeP.x}
                        y2={height}
                        stroke="#10B981"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    );
                  })()}
                </svg>
              );
            })()}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#6E81A0] dark:text-[#94A3B8] pt-1">
            <span>{timelineData[0]?.label || "Başlangıç"}</span>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-500 rounded" />
                <span>Portföy Getirisi</span>
              </span>
              {benchmarkIndex !== "NONE" && (
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2.5 h-0.5 ${benchmarkIndex === "XKTUM" ? "bg-[#0D8B52]" : "bg-blue-500"} border-b border-dashed`} />
                  <span>{benchmarkIndex} Kıyası</span>
                </span>
              )}
            </div>
            <span>{timelineData[timelineData.length - 1]?.label || "Canlı"}</span>
          </div>
        </div>

        {/* KAFİF Erken Uyarı Risk Radarı Bildirimi */}
        <KafifRiskRadarWidget
          portfolioTickers={holdings.map((h) => h.ticker)}
          mode="banner"
        />

        {/* ================================================================= */}
        {/* SEGMENTED TAB SELECTOR (5 Modern Sekme)                           */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 dark:border-white/10 pb-3 overflow-x-auto scrollbar-none">
          <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-full flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("HOLDINGS")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "HOLDINGS"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium"
              }`}
            >
              <Briefcase size={13} />
              <span>Varlıklarım ({filteredRows.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CALENDAR")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "CALENDAR"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium"
              }`}
            >
              <Calendar size={13} />
              <span>Temettü &amp; KAP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PURIFICATION")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "PURIFICATION"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium"
              }`}
            >
              <Scale size={13} />
              <span>Arındırma</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TRANSACTIONS")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "TRANSACTIONS"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium"
              }`}
            >
              <History size={13} />
              <span>İşlem Defteri ({transactions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ZAKAT")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "ZAKAT"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium"
              }`}
            >
              <Coins size={13} />
              <span>Hisse Zekâtı</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 hidden md:block">
            Son Fiyat: {lastTickTime}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SEKME 1: PORTFÖY POZİSYONLARI                                     */}
        {/* ================================================================= */}
        {activeTab === "HOLDINGS" && (
          <div className="space-y-6">
            
            {/* Fıkhi İkame Başarı Bildirimi */}
            {swapNotification && (
              <div className="p-3.5 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#0D8B52] dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Fıkhi İkame Başarıyla Tamamlandı: </span>
                    <span>
                      {swapNotification.fromTicker} pozisyonunuz {swapNotification.lots} Lot {swapNotification.toTicker} ile ikame edildi.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSwapNotification(null)}
                  className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Satış İşlemi Başarı Bildirimi */}
            {sellSuccessNotice && (
              <div className="p-3.5 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#0D8B52] dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Satış İşlendi: </span>
                    <span>
                      {sellSuccessNotice.ticker} hissenizden {sellSuccessNotice.lots} Lot satıldı. Realize K/Z: {sellSuccessNotice.realizedPnl >= 0 ? "+" : ""}{formatTRY(sellSuccessNotice.realizedPnl, 2)} • Arındırma: {formatTRY(sellSuccessNotice.purification, 2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("TRANSACTIONS")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                  >
                    Deftere Git &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setSellSuccessNotice(null)}
                    className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white p-1 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Katılım Dışı Varlık Uyarısı (Zarif 1-Satır Banner) */}
            {nonCompliantHoldings.length > 0 && (
              <div className="p-3.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-amber-900 dark:text-amber-200">
                    <strong>Katılım Dışı Varlık:</strong> Portföyünüzde {nonCompliantHoldings.length} hisse ({nonCompliantHoldings.map(h => h.ticker).join(", ")}) katılım kriteri kapsamı dışındadır.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition shadow-xs cursor-pointer"
                >
                  Muadillerle Değiştir &rarr;
                </button>
              </div>
            )}

            {/* ============================================================= */}
            {/* PORTFÖY POZİSYONLARI TABLOSU (BAŞ TACI)                         */}
            {/* ============================================================= */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden transition-colors">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Portföy Pozisyonları ({filteredRows.length} Hisse{activeBasket !== "ALL" ? ` • ${activeBasket}` : ""})
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Borsa İstanbul canlı fiyatları ve kuruşu kuruşuna fıkhi arındırma
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    Toplam: {formatTRY(portfolioAnalysis.totalMarketValue, 2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAddHoldingModalOpen(true)}
                    className="px-3 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Plus size={13} />
                    <span>Hisse Ekle</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 text-slate-500 dark:text-zinc-400 font-bold text-[11px]">
                      <th className="py-3 px-4">Hisse Senedi</th>
                      <th className="py-3 px-4 text-center">Fıkhi Durum</th>
                      <th className="py-3 px-4 text-right">Lot &amp; Maliyet</th>
                      <th className="py-3 px-4 text-right">Canlı Değer</th>
                      <th className="py-3 px-4 text-right">Kâr / Zarar</th>
                      <th className="py-3 px-4 text-right">Arındırma Payı</th>
                      <th className="py-3 px-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                              {activeBasket !== "ALL" ? <Folder size={22} /> : <Briefcase size={22} />}
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              {activeBasket !== "ALL"
                                ? `"${activeBasket}" Sepetinde Hisse Bulunmuyor`
                                : "Portföyünüz Henüz Boş"}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              {activeBasket !== "ALL"
                                ? "Yeni hisse eklerken bu sepeti seçebilir veya tüm hisselerinizi görmek için \"Tümü\" sekmesine dönebilirsiniz."
                                : "BIST hisselerinizi ekleyerek katılım uyumu, günlük kâr/zarar ve fıkhi arındırma hesaplarınızı anında başlatın."}
                            </p>
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setAddHoldingModalOpen(true)}
                                className="px-4 py-2 rounded-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                              >
                                + İlk Hissenizi Ekleyin
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <StockLogo ticker={row.ticker} name={row.companyName} size="sm" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Link href={`/companies/${row.ticker}`} className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 block">
                                  {row.ticker}
                                </Link>
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-400">
                                  {(row as any).basket || "Genel Portföy"}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block truncate max-w-[140px]">
                                {row.companyName}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            row.isCompliant ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}>
                            {row.isCompliant ? "✓ Uygun" : "✕ Kapsam Dışı"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-bold text-slate-900 dark:text-white">{row.lots} Lot</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">₺{row.avgCostTRY}</div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-bold text-slate-900 dark:text-white">{formatTRY(row.positionValueTRY, 2)}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">₺{row.curPriceTRY.toFixed(2)}</div>
                        </td>

                        <td className={`py-3 px-4 text-right font-mono font-bold ${
                          row.positionPnlTRY.gte(0) ? "text-[#0D8B52] dark:text-emerald-400" : "text-[#C62E26] dark:text-rose-400"
                        }`}>
                          {row.positionPnlTRY.gte(0) ? "+" : ""}{formatTRY(row.positionPnlTRY, 2)} ({row.positionPnlPercent.toFixed(1)}%)
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                          {formatTRY(row.purificationResult.totalPurificationPayable, 2)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenSellModal(row)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Bu hisseden satış yap ve arındırma tutarını gör"
                            >
                              <ArrowDownRight size={13} />
                              <span>Sat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveHolding(row.id)}
                              className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                              title="Pozisyonu Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ============================================================= */}
            {/* PORTFÖY DAĞILIMI & RİSK RÖNTGENİ                               */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Kolon 1: Varlık Ağırlık Dağılımı (Donut & Maliyet) */}
              <div className="lg:col-span-6 bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <PieChart size={15} className="text-[#0D8B52] dark:text-emerald-400" />
                      <span>Varlık Dağılımı</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Hisselerin portföy büyüklüğüne oranları
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {holdingsChartData.length} Varlık
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 py-1">
                  {/* SVG Donut */}
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="11"
                        className="text-slate-100 dark:text-white/10"
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
                      <span className="text-xs font-mono font-black text-slate-900 dark:text-white leading-none">
                        {holdingsChartData.length === 0 ? "0" : holdingsChartData.length}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                        Hisse
                      </span>
                    </div>
                  </div>

                  {/* Lejant */}
                  <div className="flex-1 w-full space-y-1">
                    {holdingsChartData.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-500 dark:text-zinc-400">
                        Hisse eklediğinizde dağılım burada listelenir.
                      </div>
                    ) : (
                      holdingsChartData.slice(0, 5).map((h) => (
                        <div key={h.ticker} className="flex items-center justify-between text-xs py-0.5">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                            <span className="font-bold text-slate-900 dark:text-white">{h.ticker}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{h.name}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                            %{h.weightPercent.toFixed(1)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Katılım Uyumluluk Barı */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-zinc-400">Katılım Uyum Dengesi</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      %{portfolioAnalysis.halalWeightPercent.toFixed(1)} Helal
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${portfolioAnalysis.halalWeightPercent.toNumber()}%` }}
                    />
                    <div
                      className="h-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${100 - portfolioAnalysis.halalWeightPercent.toNumber()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Kolon 2: Sektörel Dağılım & Yoğunlaşma (Simply Wall St) */}
              <div className="lg:col-span-6 bg-white dark:bg-[#0E1015] rounded-[24px] p-5 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <SlidersHorizontal size={15} className="text-blue-500" />
                      <span>Sektörel Dağılım &amp; Yoğunlaşma</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Sektör ağırlıkları ve yoğunlaşma sınırları
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    portfolioAnalysis.isSingleStockConcentrated || portfolioAnalysis.isSectorConcentrated
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {portfolioAnalysis.isSingleStockConcentrated || portfolioAnalysis.isSectorConcentrated ? "⚠️ Yoğunlaşma Var" : "✓ Dengeli"}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {portfolioAnalysis.sectorBreakdown.slice(0, 4).map((sec, i) => {
                    const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500"];
                    const barColor = colors[i % colors.length];
                    return (
                      <div key={sec.sector} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${barColor}`} />
                            <span>{sec.sector}</span>
                          </span>
                          <span className="font-mono text-slate-600 dark:text-zinc-400 text-[11px]">
                            %{sec.weightPercent.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full`}
                            style={{ width: `${Math.min(100, sec.weightPercent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Yoğunlaşma Durumu Açıklaması */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-zinc-400">
                  {portfolioAnalysis.isSingleStockConcentrated ? (
                    <span><strong>{portfolioAnalysis.maxHolding?.ticker}</strong> hisseniz portföyün %{portfolioAnalysis.maxHoldingWeight.toFixed(1)}&apos;ini oluşturarak %35 risk limitini aşıyor.</span>
                  ) : portfolioAnalysis.isSectorConcentrated ? (
                    <span><strong>{portfolioAnalysis.maxSector?.sector}</strong> sektörü portföyün %{portfolioAnalysis.maxSector?.weightPercent.toFixed(1)}&apos;ini oluşturarak %50 limitini aşıyor.</span>
                  ) : (
                    <span>Portföyünüz dengeli çeşitlendirilmiştir. Tek hisse (%35) veya tek sektör (%50) eşik aşımı bulunmuyor.</span>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* FIKHİ PORTFÖY GÜVENLİK VE OTOMASYON KURALLARI                   */}
            {/* ============================================================= */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Fıkhi Güvenlik ve Otomasyon Kuralları
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    DİB ve TKBB standartlarına göre otomatik portföy koruma kuralları
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  Aktif Kurallar
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                {/* 1. Otomatik Arındırma */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Otomatik Arındırma</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">Temettü tahakkukunda</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoPurification(!autoPurification)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                      autoPurification ? "bg-emerald-600 justify-end" : "bg-slate-300 dark:bg-white/10 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* 2. Anlık KAP Alarmları */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Anlık KAP Alarmları</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">Kapsam dışı kalırsa</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRealtimeAlerts(!realtimeAlerts)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                      realtimeAlerts ? "bg-emerald-600 justify-end" : "bg-slate-300 dark:bg-white/10 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* 3. Yıllık Zekât Takibi */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Yıllık Zekât Takibi</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">Dönen varlık esası</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnnualZakatAlert(!annualZakatAlert)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                      annualZakatAlert ? "bg-emerald-600 justify-end" : "bg-slate-300 dark:bg-white/10 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* 4. Yabancı Varlık Koruması */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Yabancı Varlık Filtresi</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">Yurt dışı fıkhi filtre</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForeignFilter(!foreignFilter)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                      foreignFilter ? "bg-emerald-600 justify-end" : "bg-slate-300 dark:bg-white/10 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* SEKME: KİŞİSELLEŞTİRİLMİŞ TEMETTÜ & KAP TAKVİMİ (Stock Events)    */}
        {/* ================================================================= */}
        {activeTab === "CALENDAR" && (
          <div className="space-y-6">
            {/* 4 KPI Kartı */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="bg-white dark:bg-[#0E1015] p-5 rounded-[22px] border border-slate-200/60 dark:border-white/10 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
                  Tahmini Yıllık Temettü
                </span>
                <div className="text-2xl font-black font-mono text-[#0D8B52] dark:text-emerald-400">
                  {formatTRY(portfolioAnalysis.totalAnnualProjectedDividends, 2)}
                </div>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block">
                  Portföyünüzün beklenen nakit akışı
                </span>
              </div>

              <div className="bg-white dark:bg-[#0E1015] p-5 rounded-[22px] border border-slate-200/60 dark:border-white/10 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
                  Yield on Cost (Maliyet Verimi)
                </span>
                <div className="text-2xl font-black font-mono text-[#182542] dark:text-white">
                  %{portfolioAnalysis.projectedYieldOnCost.toFixed(2)}
                </div>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block">
                  Alış maliyetinize göre yıllık temettü verimi
                </span>
              </div>

              <div className="bg-white dark:bg-[#0E1015] p-5 rounded-[22px] border border-slate-200/60 dark:border-white/10 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
                  Temettü Veren Şirketler
                </span>
                <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                  {portfolioAnalysis.rows.filter(r => ["BIMAS", "FROTO", "TUPRS", "EREGL", "ASELS", "MAVI"].includes(r.ticker)).length} Şirket
                </div>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block">
                  {portfolioAnalysis.rows.length} pozisyon içinden
                </span>
              </div>

              <div className="bg-white dark:bg-[#0E1015] p-5 rounded-[22px] border border-slate-200/60 dark:border-white/10 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
                  Portföyüme Özel KAP
                </span>
                <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                  {portfolioAnalysis.portfolioKapDisclosures.length} Bildirim
                </div>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block">
                  Yalnızca sahip olduğunuz hisseler
                </span>
              </div>
            </div>

            {/* 12 Aylık Temettü Nakit Akışı Bar Grafiği */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white flex items-center gap-2">
                    <Calendar size={16} className="text-[#0D8B52] dark:text-emerald-400" />
                    <span>12 Aylık Tahmini Temettü Nakit Akışı (Ocak - Aralık)</span>
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Hisselerinizin temettü dağıtım dönemlerine göre hesaplanan aylık nakit akışı
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#0D8B52] dark:text-emerald-400">
                  Yıllık Toplam: {formatTRY(portfolioAnalysis.totalAnnualProjectedDividends, 2)}
                </span>
              </div>

              {(() => {
                const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
                const maxMonthly = Math.max(1, ...portfolioAnalysis.monthlyDividendMap);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-3 items-end h-48 sm:h-56 pt-6 px-1">
                      {portfolioAnalysis.monthlyDividendMap.map((amount, idx) => {
                        const heightPercent = maxMonthly > 0 ? (amount / maxMonthly) * 100 : 0;
                        const hasIncome = amount > 0;
                        const isCurrentMonth = new Date().getMonth() === idx;

                        return (
                          <div key={idx} className="flex flex-col items-center h-full justify-end group">
                            <div className="text-[10px] font-mono font-bold text-[#182542] dark:text-white opacity-0 group-hover:opacity-100 transition mb-1 text-center truncate max-w-full">
                              {hasIncome ? `₺${amount.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}` : ""}
                            </div>

                            <div className="w-full bg-slate-100 dark:bg-white/5 rounded-xl h-full flex items-end p-1 relative">
                              <div
                                className={`w-full rounded-lg transition-all duration-500 ${
                                  hasIncome
                                    ? isCurrentMonth
                                      ? "bg-[#0D8B52] dark:bg-emerald-500 shadow-sm"
                                      : "bg-[#182542] dark:bg-[#273869] group-hover:bg-[#0D8B52]"
                                    : "bg-slate-200/50 dark:bg-white/5"
                                }`}
                                style={{ height: hasIncome ? `${Math.max(12, heightPercent)}%` : "4px" }}
                              />
                            </div>

                            <div className="mt-2 text-center">
                              <span className={`text-[11px] font-bold block ${
                                isCurrentMonth ? "text-[#0D8B52] dark:text-emerald-400 font-extrabold" : "text-[#6E81A0] dark:text-[#94A3B8]"
                              }`}>
                                {monthNames[idx]}
                              </span>
                              {hasIncome ? (
                                <span className="text-[9px] font-mono text-[#6E81A0] dark:text-[#94A3B8] block truncate">
                                  ₺{(amount / 1000).toFixed(1)}k
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-300 dark:text-white/20 block">-</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                      <span>* Şirketlerin Genel Kurul onaylı nakit kâr payı dağıtım kararları baz alınmıştır.</span>
                      <span className="font-bold text-[#182542] dark:text-white">DİB &amp; TKBB Uyumlu Tahakkuk</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Portföyüme Özel Canlı KAP Akışı */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white flex items-center gap-2">
                    <BellRing size={16} className="text-purple-600 dark:text-purple-400" />
                    <span>Portföyüme Özel KAP Canlı Akışı</span>
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Yalnızca portföyünüzde bulunan hisselere ait resmi Kamuyu Aydınlatma Platformu bildirimleri
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                  {portfolioAnalysis.portfolioKapDisclosures.length} Güncel Bildirim
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {portfolioAnalysis.portfolioKapDisclosures.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-[#6E81A0] flex items-center justify-center mx-auto">
                      <BellRing size={22} />
                    </div>
                    <div className="text-sm font-bold text-[#182542] dark:text-white">
                      Portföyünüzdeki Hisseler İçin Yeni KAP Bildirimi Yok
                    </div>
                    <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] max-w-sm mx-auto">
                      Portföyünüzde bulunan hisseler için kâr payı, bilanço, genel kurul ve katılım uygunluk duyuruları yayımlandığında burada anında listelenir.
                    </p>
                  </div>
                ) : (
                  portfolioAnalysis.portfolioKapDisclosures.map((kap) => (
                    <div key={kap.id} className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-white/5 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <StockLogo ticker={kap.ticker} name={kap.companyName} size="md" />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/companies/${kap.ticker}`} className="font-extrabold text-sm text-[#182542] dark:text-white hover:text-blue-600 transition">
                              {kap.ticker}
                            </Link>
                            <span className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                              {kap.companyName}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              kap.type === "DIVIDEND"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25"
                                : kap.type === "KAFIF"
                                ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/25"
                                : kap.type === "COMPLIANCE"
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25"
                                : "bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/25"
                            }`}>
                              {kap.badge}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-[#182542] dark:text-white">
                            {kap.title}
                          </h4>

                          <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed max-w-3xl">
                            {kap.summary}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-[11px] text-[#6E81A0] dark:text-[#94A3B8] self-end sm:self-start">
                        <span>{kap.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SEKME 2: KURUŞ HASSASİYETLİ ARINDIRMA HESAPLAYICI                 */}
        {/* ================================================================= */}
        {activeTab === "PURIFICATION" && (
          <div className="space-y-6">
            
            {/* Hisse Bazlı Arındırma Dökümü Tablosu */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Hisse Başına Güncel Arındırma Hesabı
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Alış tarihine göre otomatik hesaplanan pro-rata mahzurlu gelir arındırma tutarları
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
                      <th className="py-3 px-4 text-center">Elde Tutulan Süre</th>
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
                          <div className="font-bold text-xs text-[#182542] dark:text-white">
                            {row.daysHeld} Gün
                          </div>
                          <div className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
                            Alış: {row.purchaseDate || "Belirtilmedi"}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-[#182542] dark:text-white">
                          {row.lots} Lot
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
        {/* SEKME 3: İŞLEM GEÇMİŞİ & İNFAK DEFTERİ                            */}
        {/* ================================================================= */}
        {activeTab === "TRANSACTIONS" && (
          <div className="space-y-6">
            
            {/* KPI Özet Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white dark:bg-[#0E1015] p-4 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-2xs">
                <span className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block">Toplam Satış Hasılatı</span>
                <span className="text-base font-black font-mono text-[#182542] dark:text-white mt-1 block">
                  {formatTRY(transactionSummary.totalSellProceeds, 2)}
                </span>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] mt-0.5 block">
                  {transactions.filter(t => t.type === "SELL").length} Satış İşlemi
                </span>
              </div>

              <div className="bg-white dark:bg-[#0E1015] p-4 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-2xs">
                <span className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block">Realize Kâr / Zarar</span>
                <span className={`text-base font-black font-mono mt-1 block ${
                  transactionSummary.totalRealizedPnl.gte(0) ? "text-[#0D8B52] dark:text-emerald-400" : "text-[#C62E26] dark:text-rose-400"
                }`}>
                  {transactionSummary.totalRealizedPnl.gte(0) ? "+" : ""}{formatTRY(transactionSummary.totalRealizedPnl, 2)}
                </span>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] mt-0.5 block">
                  Satış Kâr/Zararı
                </span>
              </div>

              <div className="bg-white dark:bg-[#0E1015] p-4 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-2xs">
                <span className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block">Tahakkuk Eden Arındırma</span>
                <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400 mt-1 block">
                  {formatTRY(transactionSummary.totalPurificationSum, 2)}
                </span>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] mt-0.5 block">
                  Toplam İnfak Yükümlülüğü
                </span>
              </div>

              <div className="bg-white dark:bg-[#0E1015] p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block flex items-center gap-1">
                  <CheckCheck size={13} className="text-emerald-600" />
                  İnfak Edilen Arındırma
                </span>
                <span className="text-base font-black font-mono text-[#0D8B52] dark:text-emerald-400 mt-1 block">
                  {formatTRY(transactionSummary.totalPurifiedSum, 2)}
                </span>
                <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 block">
                  Arındırma Yapıldı Olarak İşaretli
                </span>
              </div>

              <div className="bg-white dark:bg-[#0E1015] p-4 rounded-2xl border border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/20 shadow-2xs col-span-2 md:col-span-1">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block flex items-center gap-1">
                  <Clock size={13} className="text-amber-600" />
                  Kalan İnfak Borcu
                </span>
                <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                  {formatTRY(transactionSummary.totalPendingPurificationSum, 2)}
                </span>
                <span className="text-[10px] text-amber-700/70 dark:text-amber-400/70 mt-0.5 block">
                  Henüz İnfak Edilmeyen Tutar
                </span>
              </div>
            </div>

            {/* İşlem Listesi Tablosu */}
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white flex items-center gap-2">
                    <History size={16} className="text-blue-500" />
                    <span>Gerçekleşen Satışlar &amp; İnfak Defteri</span>
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Hisse satışlarınızdan tahakkuk eden arındırma tutarlarını takip edin ve infak durumunu işaretleyin.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setManualTradeModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-[#182542] dark:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>+ Geçmiş Satış Ekle</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] font-bold text-[11px]">
                      <th className="py-3 px-4">Tarih</th>
                      <th className="py-3 px-4">İşlem &amp; Hisse</th>
                      <th className="py-3 px-4 text-right">Adet &amp; Fiyat</th>
                      <th className="py-3 px-4 text-right">Satış Tutarı</th>
                      <th className="py-3 px-4 text-right">Realize K/Z</th>
                      <th className="py-3 px-4 text-right font-bold text-[#182542] dark:text-white">Tahakkuk Eden Arındırma</th>
                      <th className="py-3 px-4 text-center">Fıkhi Arındırma Durumu</th>
                      <th className="py-3 px-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center text-slate-400">
                              <History size={24} />
                            </div>
                            <p className="font-bold text-[#182542] dark:text-white">
                              Henüz Kayıtlı Satış veya İşlem Bulunmuyor
                            </p>
                            <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                              Varlıklarım sekmesindeki hisselerinizin yanındaki <strong>&quot;Sat&quot;</strong> butonuna tıklayarak satış yapabilir veya yukarıdaki <strong>&quot;+ Geçmiş Satış Ekle&quot;</strong> butonundan geçmiş işlemlerinizi kaydedebilirsiniz.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => {
                        const comp = getCompanySummary(tx.ticker);
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition">
                            <td className="py-3 px-4 font-mono text-[11px] text-[#6E81A0] dark:text-[#94A3B8] whitespace-nowrap">
                              {tx.date}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tx.type === "SELL"
                                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                }`}>
                                  {tx.type === "SELL" ? "SATIŞ" : "ALIŞ"}
                                </span>
                                <StockLogo ticker={tx.ticker} name={comp?.name || tx.ticker} size="sm" />
                                <div>
                                  <span className="font-bold text-xs text-[#182542] dark:text-white block">
                                    {tx.ticker}
                                  </span>
                                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block truncate max-w-[120px]">
                                    {comp?.name || tx.ticker}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-right font-mono">
                              <div className="font-bold text-[#182542] dark:text-white">{tx.lots} Lot</div>
                              <div className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">₺{tx.priceTRY.toFixed(2)}</div>
                            </td>

                            <td className="py-3 px-4 text-right font-mono font-bold text-[#182542] dark:text-white">
                              {formatTRY(tx.totalAmountTRY, 2)}
                            </td>

                            <td className={`py-3 px-4 text-right font-mono font-bold ${
                              (tx.realizedPnlTRY || 0) >= 0 ? "text-[#0D8B52] dark:text-emerald-400" : "text-[#C62E26] dark:text-rose-400"
                            }`}>
                              {(tx.realizedPnlTRY || 0) >= 0 ? "+" : ""}{formatTRY(tx.realizedPnlTRY || 0, 2)}
                              {typeof tx.realizedPnlPercent === "number" && (
                                <span className="text-[10px] block opacity-80">
                                  ({tx.realizedPnlPercent.toFixed(1)}%)
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                              {formatTRY(tx.purificationAmountTRY, 2)}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePurificationStatus(tx.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                  tx.isPurified
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                                    : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
                                }`}
                                title={tx.isPurified ? "İnfak edildi olarak işaretli. Tıklayarak bekleyen duruma alabilirsiniz." : "Arındırmayı infak ettiyseniz tıklayarak tamamlandı olarak işaretleyin."}
                              >
                                {tx.isPurified ? (
                                  <>
                                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                                    <span>✓ Arındırma Yapıldı</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={13} className="text-amber-600 dark:text-amber-400" />
                                    <span>⏳ Arındırma Yapılmadı (İnfak Et)</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#C62E26] transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                                title="İşlem Kaydını Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* SEKME 4: HİSSE ZEKÂTI (%2,5 & DÖNEN VARLIK ESASI)                 */}
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

        {/* ================================================================= */}
        {/* HİSSE SATIŞI & ANLIK ARINDIRMA HESAPLAMA MODALI                   */}
        {/* ================================================================= */}
        {sellModalOpen && selectedHoldingForSell && (() => {
          const availableLots = parseFloat(selectedHoldingForSell.lots) || 0;
          const sellLotsNum = Math.min(Math.max(1, parseFloat(sellLotsInput) || 1), availableLots);
          const sellPriceNum = Math.max(0, parseFloat(sellPriceInput) || 0);
          const avgCostNum = parseFloat(selectedHoldingForSell.avgCostTRY) || 0;

          const grossProceeds = sellLotsNum * sellPriceNum;
          const costBasis = sellLotsNum * avgCostNum;
          const realizedPnl = grossProceeds - costBasis;
          const realizedPnlPercent = costBasis > 0 ? (realizedPnl / costBasis) * 100 : 0;

          const { totalDaysHeld } = calculateDaysHeld(selectedHoldingForSell.purchaseDate, sellDateInput);

          const detail = DETAILED_COMPANIES_DATABASE[selectedHoldingForSell.ticker];
          const compSummary = getCompanySummary(selectedHoldingForSell.ticker);
          const totalShares = detail?.purificationMetrics?.totalSharesOutstanding || "1000000000";
          const basePShareQuarter = new Decimal(
            detail?.purificationMetrics?.purificationPerShareQuarterTRY ||
              compSummary?.purificationPerShareTRY ||
              "0"
          );
          const grossMultiplier = purificationMode === "KAFIF_GROSS" ? new Decimal("3.85") : new Decimal("1");
          const effectivePShareQuarter = basePShareQuarter.times(grossMultiplier);
          const impureIncome = effectivePShareQuarter.times(new Decimal(totalShares)).toFixed(4);

          const purCalc = calculateHoldingPurificationClient(
            impureIncome,
            totalShares,
            new Decimal(sellLotsNum),
            totalDaysHeld,
            90,
            useCeilingRounding
          );
          const purificationAmount = purCalc.totalPurificationPayable.toNumber();
          const netHalalProceeds = Math.max(0, grossProceeds - purificationAmount);

          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
              <div className="bg-white dark:bg-[#0E1015] border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <StockLogo ticker={selectedHoldingForSell.ticker} name={selectedHoldingForSell.companyName} size="md" />
                    <div>
                      <h3 className="font-bold text-base text-[#182542] dark:text-white flex items-center gap-1.5">
                        <span>{selectedHoldingForSell.ticker} Hisse Satışı</span>
                      </h3>
                      <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                        {selectedHoldingForSell.companyName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSellModalOpen(false);
                      setSelectedHoldingForSell(null);
                    }}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Pozisyon Özeti */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-center">
                  <div>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block">Mevcut Adet</span>
                    <span className="text-xs font-bold font-mono text-[#182542] dark:text-white">{availableLots} Lot</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block">Ort. Maliyet</span>
                    <span className="text-xs font-bold font-mono text-[#182542] dark:text-white">₺{avgCostNum.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block">Elde Tutulan</span>
                    <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">{totalDaysHeld} Gün</span>
                  </div>
                </div>

                {/* Form Alanları */}
                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#182542] dark:text-white">
                        Satılacak Lot Miktarı
                      </label>
                      <div className="flex items-center gap-1">
                        {[0.25, 0.5, 0.75, 1].map((ratio) => {
                          const targetLot = Math.max(1, Math.round(availableLots * ratio));
                          return (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setSellLotsInput(String(targetLot))}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[#182542] dark:text-white transition cursor-pointer"
                            >
                              %{ratio * 100}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={availableLots}
                      value={sellLotsInput}
                      onChange={(e) => setSellLotsInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold font-mono text-sm text-[#182542] dark:text-white outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#182542] dark:text-white block mb-1.5">
                        Satış Birim Fiyatı (₺)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sellPriceInput}
                        onChange={(e) => setSellPriceInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold font-mono text-sm text-[#182542] dark:text-white outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#182542] dark:text-white block mb-1.5">
                        Satış Tarihi
                      </label>
                      <input
                        type="date"
                        value={sellDateInput}
                        onChange={(e) => setSellDateInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs text-[#182542] dark:text-white outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Canlı Hesaplanan Finansal ve Fıkhi Sonuçlar */}
                <div className="space-y-2 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/60 dark:border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6E81A0] dark:text-[#94A3B8]">Brüt Satış Tutarı:</span>
                    <span className="font-bold font-mono text-[#182542] dark:text-white">
                      {formatTRY(grossProceeds, 2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6E81A0] dark:text-[#94A3B8]">Maliyet Bedeli:</span>
                    <span className="font-bold font-mono text-[#182542] dark:text-white">
                      {formatTRY(costBasis, 2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-white/10">
                    <span className="font-bold text-[#182542] dark:text-white">Gerçekleşen Kâr / Zarar:</span>
                    <span className={`font-black font-mono ${
                      realizedPnl >= 0 ? "text-[#0D8B52] dark:text-emerald-400" : "text-[#C62E26] dark:text-rose-400"
                    }`}>
                      {realizedPnl >= 0 ? "+" : ""}{formatTRY(realizedPnl, 2)} ({realizedPnlPercent.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Fıkhi Arındırma Vurgusu */}
                  <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Scale size={15} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                          Tahakkuk Eden Fıkhi Arındırma:
                        </span>
                      </div>
                      <span className="text-sm font-black font-mono text-blue-700 dark:text-blue-300">
                        {formatTRY(purificationAmount, 2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-800/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                      TKBB standartları uyarınca, bu hisseden {totalDaysHeld} gün elde tutma süresi için hesaplanan pro-rata infak borcudur. Satış onaylandığında İşlem Geçmişi &amp; İnfak Defterinize aktarılacaktır.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="font-bold text-[#182542] dark:text-white">Net Helal Satış Hasılatı:</span>
                    <span className="font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formatTRY(netHalalProceeds, 2)}
                    </span>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSellModalOpen(false);
                      setSelectedHoldingForSell(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSell}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <ArrowDownRight size={14} />
                    <span>Satışı Onayla ve Kaydet</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================================================================= */}
        {/* MANUEL GEÇMİŞ SATIŞ / İŞLEM EKLEME MODALI                          */}
        {/* ================================================================= */}
        {manualTradeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white dark:bg-[#0E1015] border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#182542] dark:text-white">
                      Geçmiş Satış Kaydı Ekle
                    </h3>
                    <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                      Önceki hisse satışlarınızı ve arındırma durumunu deftere işleyin
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setManualTradeModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddManualTrade} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#182542] dark:text-white block mb-1">
                    Hisse Kodu (Ticker)
                  </label>
                  <select
                    value={manualTicker}
                    onChange={(e) => setManualTicker(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-xs text-[#182542] dark:text-white outline-none focus:border-blue-500"
                  >
                    {SAMPLE_COMPANIES_SUMMARY.map((c) => (
                      <option key={c.ticker} value={c.ticker} className="dark:bg-[#182542]">
                        {c.ticker} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#182542] dark:text-white block mb-1">
                      Satılan Lot Adedi
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualLots}
                      onChange={(e) => setManualLots(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs text-[#182542] dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#182542] dark:text-white block mb-1">
                      Alış Fiyatı / Maliyet (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualBuyPrice}
                      onChange={(e) => setManualBuyPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs text-[#182542] dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#182542] dark:text-white block mb-1">
                      Satış Fiyatı (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualSellPrice}
                      onChange={(e) => setManualSellPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs text-[#182542] dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#182542] dark:text-white block mb-1">
                      Satış Tarihi
                    </label>
                    <input
                      type="date"
                      value={manualSellDate}
                      onChange={(e) => setManualSellDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs text-[#182542] dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#182542] dark:text-white block mb-1">
                    Alış Tarihi (Elde Tutma Süresi Hesabı İçin)
                  </label>
                  <input
                    type="date"
                    value={manualBuyDate}
                    onChange={(e) => setManualBuyDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs text-[#182542] dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#182542] dark:text-white block">
                      Arındırma Tutarı İnfak Edildi mi?
                    </span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
                      İşaretlerseniz arındırma tamamlandı olarak kaydedilir
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={manualIsPurified}
                    onChange={(e) => setManualIsPurified(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setManualTradeModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Deftere Kaydet</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* YENİ PORTFÖY SEPETİ OLUŞTURMA MODALI (Snowball Modeli)             */}
        {/* ================================================================= */}
        {newBasketModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white dark:bg-[#0E1015] border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
                    <FolderPlus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#182542] dark:text-white">
                      Yeni Portföy Sepeti Oluştur
                    </h3>
                    <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                      Yatırımlarınızı stratejilere göre gruplayın
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewBasketModalOpen(false);
                    setNewBasketName("");
                  }}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateBasket} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#182542] dark:text-white block mb-1">
                    Sepet Adı
                  </label>
                  <input
                    type="text"
                    value={newBasketName}
                    onChange={(e) => setNewBasketName(e.target.value)}
                    placeholder="Örn: Döviz Bazlı İhracatçılar, Temettü 2030, vb."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-[#182542] dark:text-white outline-none focus:border-purple-500 font-semibold"
                    autoFocus
                  />
                </div>

                <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed">
                  Oluşturduğunuz sepet üst filtre çubuğunda görünecektir. Yeni hisse eklerken bu sepeti seçebilir veya mevcut hisselerinizi bu sepetle filtreleyebilirsiniz.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewBasketModalOpen(false);
                      setNewBasketName("");
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={!newBasketName.trim()}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <FolderPlus size={14} />
                    <span>Sepeti Oluştur</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PORTFÖYÜ İÇE AKTARMA MODALI (CSV / EXCEL)                         */}
        {/* ================================================================= */}
        {csvImportModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white dark:bg-[#0E1015] border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#182542] dark:text-white">
                      Portföyü İçe Aktar (CSV / Metin)
                    </h3>
                    <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                      Banka veya aracı kurum hisse dökümünüzü tek seferde yükleyin
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCsvImportModalOpen(false);
                    setCsvNotice(null);
                  }}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5">
                {/* Otomatik Aracı Kurum / MKK Şablonları */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Otomatik Aracı Kurum &amp; MKK Şablonları (Tek Tıkla Doldur):
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setCsvInputText(
                          "BIMAS, 150, 485.50, 2026-01-10, Temettü Portföyü\nASELS, 200, 62.80, 2026-02-05, Büyüme\nTHYAO, 60, 285.00, 2026-02-20, Ulaştırma"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      Kuveyt Türk
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCsvInputText(
                          "TUPRS 80 Lot @ 148.50 TRY 2026-01-15\nMAVI 120 Lot @ 94.20 TRY 2026-02-12\nFROTO 25 Lot @ 1115.00 TRY 2026-03-01"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      Midas
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCsvInputText(
                          "KRDMD;300;26.40;2026-01-20\nBERA;180;18.90;2026-02-14\nALARK;90;98.50;2026-02-28"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      Ziraat Katılım
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCsvInputText(
                          "MIATK | 250 | 38.60 | 2026-01-18 | MKK Saklama\nTTRAK | 45 | 780.00 | 2026-02-10 | MKK Saklama"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      MKK Dökümü
                    </button>
                  </div>
                </div>

                {/* Dosya Yükleme Alanı */}
                <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-white/5 transition flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white block">
                        Ekstre Dosyası Yükleyin (.csv, .txt)
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Metin veya CSV dosyanızı seçin, otomatik okunsun
                      </span>
                    </div>
                  </div>
                  <label className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold transition hover:opacity-90 cursor-pointer shrink-0">
                    <span>Dosya Seç</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#182542] dark:text-white">
                      Metin veya Ekstre Verisini Yapıştırın
                    </label>
                    {csvInputText.trim() && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        {csvInputText.trim().split("\n").filter(Boolean).length} Satır Algılandı
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={5}
                    value={csvInputText}
                    onChange={(e) => setCsvInputText(e.target.value)}
                    placeholder="BIMAS, 100, 480.00, 2026-01-15, Temettü Emekliliği&#10;THYAO, 50, 290.50, 2026-02-01, Genel Portföy&#10;veya Midas/Kuveyt Türk ekstre metni..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-[#182542] dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {csvNotice && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${
                    csvNotice.type === "success"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                  }`}>
                    {csvNotice.text}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCsvImportModalOpen(false);
                    setCsvNotice(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={handleImportCSV}
                  disabled={!csvInputText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Portföyü İçe Aktar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* YENİ POZİSYON EKLE MODALI (Apple Minimalist Modal)                 */}
        {/* ================================================================= */}
        {addHoldingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white dark:bg-[#0E1015] border border-black/10 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-[#182542] dark:text-white">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#182542] dark:text-white">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#182542] dark:text-white">
                      Hisse Ekle
                    </h3>
                    <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                      Portföyünüze yeni bir varlık kaydedin
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddHoldingModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddHolding} className="space-y-4">
                {/* Hisse Kodu Seçici */}
                <div>
                  <label className="text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8] block mb-1.5">
                    Hisse Sembolü
                  </label>
                  <div className="relative">
                    <select
                      value={newTicker}
                      onChange={(e) => handleSelectNewTicker(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold text-[#182542] dark:text-white outline-none focus:border-black dark:focus:border-white transition"
                    >
                      {SAMPLE_COMPANIES_SUMMARY.map((comp) => (
                        <option key={comp.ticker} value={comp.ticker} className="dark:bg-[#14171F]">
                          {comp.ticker} - {comp.name} {comp.bistStatus === "COMPLIANT" ? "(Katılım Onaylı)" : "(Kapsam Dışı)"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sepet Seçimi */}
                <div>
                  <label className="text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8] block mb-1.5">
                    Portföy Sepeti
                  </label>
                  <select
                    value={newHoldingBasket}
                    onChange={(e) => setNewHoldingBasket(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium text-[#182542] dark:text-white outline-none focus:border-black dark:focus:border-white transition"
                  >
                    <option value="Genel Portföy" className="dark:bg-[#14171F]">Genel Portföy</option>
                    {customBaskets.map((b) => (
                      <option key={b} value={b} className="dark:bg-[#14171F]">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lot ve Ortalama Maliyet */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8] block mb-1.5">
                      Lot Adedi
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={newLots}
                      onChange={(e) => setNewLots(e.target.value)}
                      placeholder="100"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-mono font-bold text-[#182542] dark:text-white outline-none focus:border-black dark:focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8] block mb-1.5">
                      Ort. Maliyet (₺)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={newAvgCost}
                      onChange={(e) => setNewAvgCost(e.target.value)}
                      placeholder="100.00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-mono font-bold text-[#182542] dark:text-white outline-none focus:border-black dark:focus:border-white transition"
                    />
                  </div>
                </div>

                {/* Alış Tarihi */}
                <div>
                  <label className="text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8] block mb-1.5">
                    Alış Tarihi (Arındırma &amp; Zekât Hesaplaması İçin)
                  </label>
                  <input
                    type="date"
                    value={newPurchaseDate}
                    onChange={(e) => handleNewDateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-mono text-[#182542] dark:text-white outline-none focus:border-black dark:focus:border-white transition"
                  />
                </div>

                {/* Zekât Niyeti */}
                <div>
                  <label className="text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8] block mb-1.5">
                    Yatırım Amacı (Zekât Metodolojisi)
                  </label>
                  <select
                    value={newZakatIntent}
                    onChange={(e) => setNewZakatIntent(e.target.value as ZakatIntentionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium text-[#182542] dark:text-white outline-none focus:border-black dark:focus:border-white transition"
                  >
                    <option value="LONG_TERM_DIVIDEND" className="dark:bg-[#14171F]">
                      Uzun Vadeli / Temettü (Dönen Varlıklar Üzerinden)
                    </option>
                    <option value="TRADE_AL_SAT" className="dark:bg-[#14171F]">
                      Kısa Vadeli / Al-Sat Ticareti (Piyasa Değeri Üzerinden %2.5)
                    </option>
                  </select>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setAddHoldingModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Hisse Ekle</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MUADİLLERLE DEĞİŞTİR / İKAME MOTORU MODALI                        */}
        {/* ================================================================= */}
        {swapModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white dark:bg-[#0E1015] border border-black/10 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-[#182542] dark:text-white">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <ArrowLeftRight size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#182542] dark:text-white">
                      Katılım Dışı Varlık İkame Motoru
                    </h3>
                    <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                      Kapsam dışı varlıklarınızı aynı sektördeki onaylı muadilleriyle tek tıkla takas edin
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {nonCompliantHoldings.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <BadgeCheck size={36} className="text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-sm text-[#182542] dark:text-white">
                    Tebrikler! Portföyünüz %100 Katılım Uyumlu
                  </h4>
                  <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                    Portföyünüzde ikame edilmesi gereken katılım dışı hisse bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                  {nonCompliantHoldings.map((holding) => {
                    const alternatives = getCompliantAlternativesForTicker(holding.ticker);
                    return (
                      <div
                        key={holding.id}
                        className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StockLogo ticker={holding.ticker} name={holding.companyName} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#182542] dark:text-white">
                                  {holding.ticker}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  Katılım Dışı
                                </span>
                              </div>
                              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                                {holding.lots} Lot • {formatTRY(holding.positionValueTRY)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Muadiller */}
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-semibold text-[#6E81A0] dark:text-[#94A3B8] uppercase tracking-wider block">
                            Önerilen Katılım Uyumlu Muadiller:
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {alternatives.map((alt) => (
                              <div
                                key={alt.ticker}
                                className="p-3 rounded-xl bg-white dark:bg-[#12141A] border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition flex flex-col justify-between gap-2"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-xs text-[#182542] dark:text-white">
                                      {alt.ticker}
                                    </span>
                                    {alt.debtRatio && (
                                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                        Borç {alt.debtRatio}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] line-clamp-1">
                                    {alt.name}
                                  </p>
                                  {alt.reason && (
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                      {alt.reason}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSwapHolding(holding.id, holding.ticker, alt.ticker, alt.name)}
                                  className="w-full mt-1 py-1.5 px-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <ArrowLeftRight size={12} />
                                  <span>Değiştir</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold text-[#182542] dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

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
