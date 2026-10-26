"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Info,
  Scale,
  Sparkles,
  Plus,
  BarChart3,
  Search,
  Wallet,
  TrendingUp,
  PieChart,
  RefreshCw,
  Coins,
  Calendar,
  Layers,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { PaynoShell } from "@/components/PaynoShell";
import { StockLogo } from "@/components/StockLogo";
import { useAuth } from "@/lib/auth/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading, isDemoUser } = useAuth();
  const { companies, updatedAt } = useLiveMarketData(45000);

  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [currency, setCurrency] = useState<"TRY" | "USD">("TRY");

  // Kullanıcı Portföyü & E-posta Senkronizasyonu
  const userEmail = user?.email?.toLowerCase().trim() || "";
  const [userHoldings, setUserHoldings] = useState<Array<{ ticker: string; lots: number; avgCostTRY: number }>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = userEmail ? `mizan_holdings_${userEmail}` : "mizan_user_holdings";
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem("mizan_user_holdings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setUserHoldings(parsed);
        }
      }
    } catch {
      // ignore
    }

    if (userEmail) {
      fetch(`/api/portfolio/sync?email=${encodeURIComponent(userEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.holdings) && data.holdings.length > 0) {
            const mapped = data.holdings.map((h: any) => ({
              ticker: h.ticker,
              lots: parseFloat(h.lots) || 0,
              avgCostTRY: parseFloat(h.avgCostTRY) || 0,
            }));
            setUserHoldings(mapped);
            localStorage.setItem(storageKey, JSON.stringify(data.holdings));
          }
        })
        .catch(() => {});
    }
  }, [userEmail]);

  // Portföy Finansal & Fıkhi Metrikleri
  const portfolioMetrics = useMemo(() => {
    if (!userHoldings || userHoldings.length === 0) {
      return {
        totalValueTRY: 0,
        totalCostTRY: 0,
        netReturnTRY: 0,
        netReturnPercent: 0,
        purificationTRY: 0,
        dividendTRY: 0,
        compliantRatioText: "%0 Helal",
        compliantDetailText: "0 Pozisyon",
        count: 0,
      };
    }

    let totalVal = 0;
    let totalCost = 0;
    let compliantCount = 0;
    let totalPurification = 0;

    userHoldings.forEach((h) => {
      const comp = companies.find((c) => c.ticker === h.ticker);
      const rawPrice = comp?.priceTRY ? parseFloat(comp.priceTRY.replace(/[^0-9.]/g, "")) : 100;
      const price = isNaN(rawPrice) || rawPrice <= 0 ? 100 : rawPrice;
      const val = (h.lots || 0) * price;
      const cost = (h.lots || 0) * (h.avgCostTRY || price);

      totalVal += val;
      totalCost += cost;

      if (comp?.bistStatus === "COMPLIANT") {
        compliantCount += 1;
        totalPurification += val * 0.0035; // Ortalama çeyreklik arındırma katsayısı
      } else {
        totalPurification += val * 0.02; // Katılım dışı ihtiyati infak
      }
    });

    const netRet = totalVal - totalCost;
    const netRetPct = totalCost > 0 ? (netRet / totalCost) * 100 : 0;
    const compPct = Math.round((compliantCount / userHoldings.length) * 100);

    return {
      totalValueTRY: totalVal,
      totalCostTRY: totalCost,
      netReturnTRY: netRet,
      netReturnPercent: netRetPct,
      purificationTRY: totalPurification,
      dividendTRY: totalVal * 0.04,
      compliantRatioText: `%${compPct} Helal`,
      compliantDetailText: `${compliantCount}/${userHoldings.length} Kriter Uyumlu`,
      count: userHoldings.length,
    };
  }, [userHoldings, companies]);

  // Portföydeki hisselerin ağırlıkları (Daire grafik için)
  const holdingsWeights = useMemo(() => {
    if (userHoldings.length === 0 || portfolioMetrics.totalValueTRY === 0) {
      return [];
    }

    const palette = ["#182542", "#0D8B52", "#2563EB", "#7C3AED", "#F59E0B", "#0891B2", "#DC2626", "#475569"];

    return userHoldings
      .map((h, idx) => {
        const comp = companies.find((c) => c.ticker === h.ticker);
        const rawPrice = comp?.priceTRY ? parseFloat(comp.priceTRY.replace(/[^0-9.]/g, "")) : 100;
        const price = isNaN(rawPrice) || rawPrice <= 0 ? 100 : rawPrice;
        const val = (h.lots || 0) * price;
        const weight = (val / portfolioMetrics.totalValueTRY) * 100;
        return {
          ticker: h.ticker,
          name: comp?.name || h.ticker,
          valueTRY: val,
          weightPercent: weight,
          color: palette[idx % palette.length],
          isCompliant: comp?.bistStatus === "COMPLIANT",
        };
      })
      .sort((a, b) => b.valueTRY - a.valueTRY);
  }, [userHoldings, companies, portfolioMetrics.totalValueTRY]);

  // Günün Saatine Göre Selamlama
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Hayırlı Sabahlar";
    if (hour >= 12 && hour < 18) return "Hayırlı Günler";
    return "Hayırlı Akşamlar";
  }, []);

  // Formatlı Bakiye
  const formattedBalance = useMemo(() => {
    if (!balanceVisible) return "•••••••• ₺";
    if (currency === "USD") {
      const usdVal = portfolioMetrics.totalValueTRY / 34.5;
      return `$${usdVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₺${portfolioMetrics.totalValueTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [balanceVisible, currency, portfolioMetrics.totalValueTRY]);

  return (
    <PaynoShell badge="genel-bakis">
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        
        {/* =================================================================== */}
        {/* 1. ÜST KARŞILAMA VE HIZLI AKSİYON BARI                               */}
        {/* =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/45 dark:bg-[#0E1015]/55 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/80 dark:border-white/10 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8]">
                {greetingText},
              </span>
              <span className="text-xs font-bold text-[#182542] dark:text-white">
                {profile?.full_name || user?.email?.split("@")[0] || "Yatırımcı"}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[#182542] dark:text-white tracking-tight">
              Katılım Finans Genel Bakış
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tarayici"
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs active:scale-95"
            >
              <Search size={14} />
              <span>BIST Hisse Tara</span>
            </Link>
          </div>
        </div>

        {/* Misafir Kullanıcı Giriş & Senkronizasyon Çağrısı */}
        {!user && !isDemoUser && (
          <div className="bg-gradient-to-r from-[#182542] via-[#273869] to-[#182542] text-white p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold block">
                  Katılım Portföyünüzü ve Cihazlar Arası Senkronizasyonu Başlatın
                </span>
                <span className="text-[11px] text-slate-300">
                  Giriş yaparak hisse pozisyonlarınızı, kuruşu kuruşuna arındırma hesabınızı ve bulut yedeğinizi koruyun.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. ANA METRİKLER (Row 1): PORTFÖY DEĞERİ & DAİRE GRAFİK + 2x2 BENTO   */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* KOLON 1: TOPLAM PORTFÖY BAKİYESİ VE DAİRE GRAFİK (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white/45 dark:bg-[#0E1015]/55 backdrop-blur-xl rounded-[26px] p-4 sm:p-6 border border-white/80 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            
            {/* Üst Satır: Başlık & Döviz Seçimi */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  Toplam Portföy Değeri
                </span>
                
                <button
                  type="button"
                  onClick={() => setCurrency((c) => (c === "TRY" ? "USD" : "TRY"))}
                  className="bg-[#F4F5F7] dark:bg-white/10 hover:bg-[#E9EBEF] dark:hover:bg-white/15 text-[#182542] dark:text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>{currency === "USD" ? "🇺🇸 USD" : "🇹🇷 TRY ₺"}</span>
                  <ChevronDown size={12} className="text-[#6E81A0] dark:text-[#94A3B8]" />
                </button>
              </div>

              {/* Tutar & Gizleme */}
              <div className="mt-2.5 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-[#182542] dark:text-white font-mono tracking-tight">
                  {formattedBalance}
                </span>
                <button
                  type="button"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white transition"
                  title="Bakiyeyi Gizle / Göster"
                >
                  {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {portfolioMetrics.count === 0 ? (
                <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[#6E81A0] dark:text-[#94A3B8] text-[10px] sm:text-[11px] font-bold">
                  <span>0 Aktif Pozisyon • Portföy Boş</span>
                </div>
              ) : (
                <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 text-[10px] sm:text-[11px] font-bold">
                  <span>
                    {portfolioMetrics.netReturnPercent >= 0 ? "▲" : "▼"} Net %{portfolioMetrics.netReturnPercent.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* DAİRE GRAFİK (Portföydeki Hisselerin Ağırlık Dağılımı) */}
            <div className="py-2 px-3 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-[#182542] dark:text-white flex items-center gap-1.5">
                  <PieChart size={13} className="text-[#0D8B52] dark:text-emerald-400" />
                  <span>Hisse Ağırlık Dağılımı</span>
                </span>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-mono">
                  {portfolioMetrics.count === 0 ? "0 Pozisyon" : `${portfolioMetrics.count} Hisse`}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* SVG Donut */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    {/* Arka Plan Çemberi */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-slate-200/70 dark:text-white/10"
                    />

                    {/* Dilimler */}
                    {holdingsWeights.length === 0 ? (
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="10"
                        strokeDasharray="226.19"
                        strokeDashoffset="0"
                        opacity="0.3"
                      />
                    ) : (
                      (() => {
                        let accumulatedPercent = 0;
                        const circumference = 2 * Math.PI * 36; // ~226.19
                        return holdingsWeights.map((h, i) => {
                          const strokeDasharray = `${(h.weightPercent / 100) * circumference} ${circumference}`;
                          const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                          accumulatedPercent += h.weightPercent;
                          return (
                            <circle
                              key={i}
                              cx="50"
                              cy="50"
                              r="36"
                              fill="none"
                              stroke={h.color}
                              strokeWidth="10"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-500"
                            />
                          );
                        });
                      })()
                    )}
                  </svg>

                  {/* Merkez Metin */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-mono font-black text-[#182542] dark:text-white leading-none">
                      {portfolioMetrics.count === 0 ? "0" : portfolioMetrics.count}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] font-bold">
                      Hisse
                    </span>
                  </div>
                </div>

                {/* Lejant (Hisse Ağırlık Listesi) */}
                <div className="flex-1 min-w-0 space-y-1">
                  {holdingsWeights.length === 0 ? (
                    <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] py-2">
                      Portföye hisse ekleyerek ağırlık ve arındırma analizini görün.
                    </div>
                  ) : (
                    holdingsWeights.slice(0, 4).map((h) => (
                      <div key={h.ticker} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                          <span className="font-bold text-[#182542] dark:text-white truncate">{h.ticker}</span>
                        </div>
                        <span className="font-mono font-bold text-[#6E81A0] dark:text-[#94A3B8] text-[11px]">
                          %{h.weightPercent.toFixed(1)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/portfolio#yeni-pozisyon"
                className="rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white py-2 px-3 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition text-center"
              >
                <Plus size={13} />
                <span>Hisse Ekle</span>
              </Link>

              <Link
                href="/portfolio?tab=arindirma"
                className="rounded-full bg-[#F4F5F7] dark:bg-white/10 hover:bg-[#EAECEF] dark:hover:bg-white/15 text-[#182542] dark:text-white py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center"
              >
                <Scale size={13} />
                <span>Arındır</span>
              </Link>
            </div>

          </div>

          {/* KOLON 2: 2x2 BENTO METRİK KARTLARI (lg:col-span-7) */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
            
            {/* KART 1: PORTFÖY GETİRİSİ */}
            <div className="relative overflow-hidden bg-white/45 dark:bg-[#0E1015]/55 backdrop-blur-xl rounded-[24px] p-4 sm:p-5 border border-white/80 dark:border-white/10 shadow-xs flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  Portföy Getirisi
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#182542] dark:text-white">
                  <TrendingUp size={12} />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-lg sm:text-2xl font-black text-[#182542] dark:text-white font-mono tracking-tight">
                  ₺{Math.abs(portfolioMetrics.netReturnTRY).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[11px] font-bold text-[#0D8B52] dark:text-emerald-400 flex items-center gap-0.5">
                  <span>
                    {portfolioMetrics.count === 0
                      ? "%0,0"
                      : `${portfolioMetrics.netReturnTRY >= 0 ? "▲ +" : "▼ -"}%${Math.abs(portfolioMetrics.netReturnPercent).toFixed(1)}`}
                  </span>
                  <span className="text-[#6E81A0] dark:text-[#94A3B8] font-normal ml-1">net kâr/zarar</span>
                </div>
              </div>
            </div>

            {/* KART 2: ARINDIRMA YÜKÜ (Terazi) */}
            <div className="bg-white/45 dark:bg-[#0E1015]/55 backdrop-blur-xl rounded-[24px] p-4 sm:p-5 border border-white/80 dark:border-white/10 shadow-xs flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  Fıkhi Arındırma
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#182542] dark:text-white">
                  <Scale size={12} />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-lg sm:text-2xl font-black text-[#182542] dark:text-white font-mono tracking-tight">
                  ₺{portfolioMetrics.purificationTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] font-bold text-[#273869] dark:text-blue-400 flex items-center gap-0.5">
                  <span>
                    %{portfolioMetrics.totalValueTRY > 0
                      ? ((portfolioMetrics.purificationTRY / portfolioMetrics.totalValueTRY) * 100).toFixed(2)
                      : "0,00"}
                  </span>
                  <span className="text-[#6E81A0] dark:text-[#94A3B8] font-normal ml-1">pro-rata infak</span>
                </div>
              </div>
            </div>

            {/* KART 3: YILLIK TEMETTÜ GELİRİ */}
            <div className="bg-white/45 dark:bg-[#0E1015]/55 backdrop-blur-xl rounded-[24px] p-4 sm:p-5 border border-white/80 dark:border-white/10 shadow-xs flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  Temettü Beklentisi
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#182542] dark:text-white">
                  <Coins size={12} />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-lg sm:text-2xl font-black text-[#182542] dark:text-white font-mono tracking-tight">
                  ₺{portfolioMetrics.dividendTRY.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[11px] font-semibold text-[#6E81A0] dark:text-[#94A3B8]">
                  tahmini yıllık getiri (~%4)
                </div>
              </div>
            </div>

            {/* KART 4: KATILIM STANDARTLARI UYUMU */}
            <div className="bg-white/45 dark:bg-[#0E1015]/55 backdrop-blur-xl rounded-[24px] p-4 sm:p-5 border border-white/80 dark:border-white/10 shadow-xs flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  Katılım Standartları
                </span>
                <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={13} />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-lg sm:text-2xl font-black text-[#0D8B52] dark:text-emerald-400 font-mono tracking-tight">
                  {portfolioMetrics.compliantRatioText}
                </div>
                <div className="text-[11px] font-semibold text-[#6E81A0] dark:text-[#94A3B8]">
                  {portfolioMetrics.compliantDetailText}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* =================================================================== */}
        {/* 3. İKİNCİ SATIR: PORTFÖY POZİSYONLARI & HIZLI KATILIM ARAÇLARI       */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* SOL: PORTFÖY POZİSYONLARI TABLOSU (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white/45 dark:bg-[#0E1015]/55 backdrop-blur-xl rounded-[26px] p-4 sm:p-6 border border-white/80 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                  Portföy Pozisyonları
                </h3>
                <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                  Hisselerinizin DİB &amp; TKBB uyumluluk durumu
                </p>
              </div>

              <Link
                href="/portfolio"
                className="text-xs font-bold text-[#273869] dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Tüm Portföy &rarr;</span>
              </Link>
            </div>

            {userHoldings.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] flex items-center justify-center mx-auto">
                  <Wallet size={18} />
                </div>
                <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] max-w-sm mx-auto">
                  Portföyünüzde henüz hisse bulunmuyor. Katılım standartlarına uygun hisseleri ekleyerek kuruşu kuruşuna arındırma hesabınızı başlatın.
                </p>
                <Link
                  href="/portfolio#yeni-pozisyon"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#182542] dark:bg-[#273869] text-white text-xs font-bold hover:scale-105 transition"
                >
                  <Plus size={13} />
                  <span>İlk Hissenizi Ekleyin</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {userHoldings.slice(0, 5).map((h) => {
                  const comp = companies.find((c) => c.ticker === h.ticker);
                  const rawPrice = comp?.priceTRY ? parseFloat(comp.priceTRY.replace(/[^0-9.]/g, "")) : 100;
                  const price = isNaN(rawPrice) || rawPrice <= 0 ? 100 : rawPrice;
                  const val = (h.lots || 0) * price;
                  return (
                    <div
                      key={h.ticker}
                      className="p-3 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <StockLogo ticker={h.ticker} name={comp?.name || h.ticker} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#182542] dark:text-white">{h.ticker}</span>
                            {comp?.bistStatus === "COMPLIANT" ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                                Katılım
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400">
                                Dışında
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{h.lots} Adet</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-[#182542] dark:text-white block">
                          ₺{val.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                        </span>
                        <Link
                          href={`/companies/${h.ticker}`}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          İncele &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* SAĞ: HIZLI İŞLEMLER & PLATFORM KISAYOLLARI (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white/45 dark:bg-[#0E1015]/55 backdrop-blur-xl rounded-[26px] p-4 sm:p-6 border border-white/80 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
            
            <div>
              <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                Hızlı Katılım Araçları
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                Fıkhi analiz ve portföy yönetim merkezleri
              </p>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/tarayici"
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5 flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#182542] dark:text-white block">
                      BIST Katılım Tarayıcısı
                    </span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
                      3 Altın Rasyo ve anlık fıkhi filtreleme
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#6E81A0] group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/ipo"
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5 flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#182542] dark:text-white block">
                      Halka Arz Takvimi
                    </span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
                      2026 katılım uyumlu halka arzlar
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#6E81A0] group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/portfolio?tab=arindirma"
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5 flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Scale size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#182542] dark:text-white block">
                      Arındırma Defteri
                    </span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Kuruşu kuruşuna infak ve hisse zekâtı
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#6E81A0] group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/asistan"
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5 flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#182542] to-[#0D8B52] text-white flex items-center justify-center">
                    <Sparkles size={16} className="text-emerald-300" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#182542] dark:text-white block">
                      Mizan AI Danışman
                    </span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Gemini 3.8 Flash fıkhi analiz asistanı
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#6E81A0] group-hover:translate-x-0.5 transition" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </PaynoShell>
  );
}
