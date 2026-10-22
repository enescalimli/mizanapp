"use client";

import React, { useMemo, useState } from "react";
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
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { PaynoShell } from "@/components/PaynoShell";
import { StockLogo } from "@/components/StockLogo";
import { useAuth } from "@/lib/auth/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { companies, updatedAt } = useLiveMarketData(45000);

  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [currency, setCurrency] = useState<"TRY" | "USD">("TRY");

  // Quick stock screener inline state
  const [quickSearch, setQuickSearch] = useState<string>("");

  const userDisplayName = useMemo(() => {
    return profile?.full_name || (user?.user_metadata?.full_name as string) || "Mustafa Çalımlı";
  }, [profile?.full_name, user?.user_metadata?.full_name]);

  // Greeting according to local hour
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Hayırlı Sabahlar";
    if (hour >= 12 && hour < 18) return "Hayırlı Günler";
    return "Hayırlı Akşamlar";
  }, []);

  // Formatted balance
  const formattedBalance = useMemo(() => {
    if (!balanceVisible) return "•••••••• ₺";
    if (currency === "USD") return "$26,480.00";
    return "₺842.500,00";
  }, [balanceVisible, currency]);

  // Monthly income chart data (Aylık Kâr Payı & Temettü)
  const chartData = [
    { month: "Oca", profit: 65, label: "₺6.500" },
    { month: "Şub", profit: 45, label: "₺4.500" },
    { month: "Mar", profit: 80, label: "₺8.000" },
    { month: "Nis", profit: 95, label: "₺9.500", active: true },
    { month: "May", profit: 70, label: "₺7.000" },
    { month: "Haz", profit: 85, label: "₺8.500" },
  ];

  // Son Katılım İşlemleri ve KAP Bildirimleri (Gerçek BIST hisseleri ve logoları)
  const recentActivities = [
    {
      ticker: "BIMAS",
      name: "BİM Birleşik Mağazalar A.Ş.",
      type: "Temettü Tahakkuku",
      amount: "+₺4.850,00",
      date: "Bugün, 14:32",
      status: "DİB Uyumlu",
      compliant: true,
    },
    {
      ticker: "THYAO",
      name: "Türk Hava Yolları A.O.",
      type: "KAP Fıkhi Denetim Raporu",
      amount: "İcazetli",
      date: "Dün, 16:45",
      status: "Borç %18.2",
      compliant: true,
    },
    {
      ticker: "ASELS",
      name: "Aselsan Elektronik Sanayi",
      type: "Arındırma Oranı Güncellemesi",
      amount: "-%0.85",
      date: "20 Nis",
      status: "DİB Uyumlu",
      compliant: true,
    },
    {
      ticker: "KCHOL",
      name: "Koç Holding A.Ş.",
      type: "Katılım Dışı Uyarısı",
      amount: "Uygunsuz",
      date: "19 Nis",
      status: "Finans/Faiz Geliri > %5",
      compliant: false,
    },
    {
      ticker: "TUPRS",
      name: "Türkiye Petrol Rafinerileri",
      type: "KAP Bilanço Uygunluk Onayı",
      amount: "Onaylandı",
      date: "18 Nis",
      status: "DİB Uyumlu",
      compliant: true,
    },
    {
      ticker: "FROTO",
      name: "Ford Otomotiv Sanayi A.Ş.",
      type: "Temettü & Kâr Payı Dağıtımı",
      amount: "+₺3.200,00",
      date: "17 Nis",
      status: "DİB Uyumlu",
      compliant: true,
    },
  ];

  // Quick filtered stocks for fast search
  const quickFilteredStocks = useMemo(() => {
    if (!quickSearch.trim()) return companies.slice(0, 5);
    const q = quickSearch.toUpperCase().trim();
    return companies.filter(
      (c) => c.ticker.includes(q) || c.name.toUpperCase().includes(q)
    ).slice(0, 5);
  }, [companies, quickSearch]);

  return (
    <PaynoShell badge="katılım">
      <div className="space-y-5 sm:space-y-6">
        
        {/* ================================================================= */}
        {/* KARŞILAMA VE PORTFÖY BAŞLIĞI (Türkçe, Kurumsal & Mobil Uyumlu)     */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#182542] dark:text-white">
              {greetingText}, {userDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E81A0] dark:text-[#94A3B8]">
              BIST Katılım portföyünüzün DİB fıkhi uyumunu, arındırma oranlarını ve kâr paylarını canlı takip edin.
            </p>
          </div>

          {/* Hızlı Eylem Butonu (Mobilde de tam genişlik) */}
          <div className="flex items-center gap-2">
            <Link
              href="/tarayici"
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs active:scale-95"
            >
              <Search size={14} />
              <span>626 BIST Hisse Tara</span>
            </Link>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 1. SATIR: 3 BENTO KOLONU (Lacivert/Zümrüt Paleti)                 */}
        {/* 1. Toplam Varlık | 2. 2x2 Bento Metrik | 3. Temettü & Kâr Grafiği */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* =============================================================== */}
          {/* KOLON 1: TOPLAM PORTFÖY BAKİYESİ (lg:col-span-4)                 */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 bg-white dark:bg-[#161F32] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5 transition-colors">
            
            {/* Üst Satır: Başlık + Para Birimi Değiştirici */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  Toplam Portföy Değeri
                </span>
                
                {/* Döviz Kapsülü */}
                <button
                  type="button"
                  onClick={() => setCurrency((c) => (c === "TRY" ? "USD" : "TRY"))}
                  className="bg-[#F4F5F7] dark:bg-white/10 hover:bg-[#E9EBEF] dark:hover:bg-white/15 text-[#182542] dark:text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>{currency === "USD" ? "🇺🇸 USD" : "🇹🇷 TRY ₺"}</span>
                  <ChevronDown size={12} className="text-[#6E81A0] dark:text-[#94A3B8]" />
                </button>
              </div>

              {/* Tutar & Gizleme Butonu */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#182542] dark:text-white font-mono tracking-tight">
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

              {/* Trend Rozeti (Zümrüt Yeşili) */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 text-[11px] font-bold">
                <span>▲ Geçen aya göre +%5,2</span>
              </div>
            </div>

            {/* Anlamlı Katılım Eylemleri: Hisse Ekle / Arındır */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/portfolio#yeni-pozisyon"
                className="rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white py-2.5 px-3 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition text-center"
              >
                <Plus size={14} />
                <span>Hisse Ekle</span>
              </Link>

              <Link
                href="/portfolio?tab=arindirma"
                className="rounded-full bg-[#F4F5F7] dark:bg-white/10 hover:bg-[#EAECEF] dark:hover:bg-white/15 text-[#182542] dark:text-white py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center"
              >
                <Scale size={14} />
                <span>Arındır</span>
              </Link>
            </div>

            {/* Varlık Dağılımı Cüzdanları */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                <span className="font-bold">Varlık Dağılımı</span>
                <span className="text-[11px]">2 Varlık Grubu</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Cüzdan: BIST Hisseleri */}
                <div className="bg-[#F8F9FA] dark:bg-white/5 rounded-2xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#182542] dark:bg-[#273869] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ₺
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#182542] dark:text-white truncate">
                      Katılım Hisseleri
                    </div>
                    <div className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-mono">
                      ₺710.000
                    </div>
                  </div>
                </div>

                {/* 2. Cüzdan: Sukuk & Fon */}
                <div className="bg-[#F8F9FA] dark:bg-white/5 rounded-2xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0D8B52] dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    S
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#182542] dark:text-white truncate">
                      Sukuk &amp; Fon
                    </div>
                    <div className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-mono">
                      ₺132.500
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* =============================================================== */}
          {/* KOLON 2: 2x2 BENTO METRİK KARTLARI (Lacivert İmzalı)            */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
            
            {/* KART 1: PORTFÖY GETİRİSİ (Lacivert Çeyrek Daire Köşe Dolgusu) */}
            <div className="relative overflow-hidden bg-white dark:bg-[#161F32] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[150px] sm:min-h-[160px] group transition-colors">
              {/* Orijinal Lacivert İmza Köşe Vurgusu */}
              <div className="absolute -top-1 -left-1 w-24 h-24 rounded-br-[42px] bg-gradient-to-br from-[#182542] via-[#24375d] to-[#273869] p-3 text-white flex flex-col justify-start pointer-events-none shadow-xs">
                <span className="text-[11px] font-bold leading-tight">
                  Portföy<br />Getirisi
                </span>
              </div>

              <div className="h-9" />

              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-[#182542] dark:text-white font-mono tracking-tight">
                  ₺118.420
                </div>
                <div className="text-[11px] font-bold text-[#0D8B52] dark:text-emerald-400 flex items-center gap-0.5">
                  <span>▲ +%18,4</span>
                  <span className="text-[#6E81A0] dark:text-[#94A3B8] font-normal ml-1">net getiri</span>
                </div>
              </div>
            </div>

            {/* KART 2: ARINDIRMA YÜKÜ (Terazi) */}
            <div className="bg-white dark:bg-[#161F32] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[150px] sm:min-h-[160px] group transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  Arındırma Yükü
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#182542] dark:text-white">
                  <Scale size={12} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-[#182542] dark:text-white font-mono tracking-tight">
                  ₺1.240,50
                </div>
                <div className="text-[11px] font-bold text-[#273869] dark:text-blue-400 flex items-center gap-0.5">
                  <span>%0,14</span>
                  <span className="text-[#6E81A0] dark:text-[#94A3B8] font-normal ml-1">pro-rata pay</span>
                </div>
              </div>
            </div>

            {/* KART 3: YILLIK TEMETTÜ GELİRİ */}
            <div className="bg-white dark:bg-[#161F32] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[150px] sm:min-h-[160px] group transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  Temettü Geliri
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#182542] dark:text-white">
                  <TrendingUp size={12} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-[#182542] dark:text-white font-mono tracking-tight">
                  ₺34.680
                </div>
                <div className="text-[11px] font-bold text-[#0D8B52] dark:text-emerald-400 flex items-center gap-0.5">
                  <span>▲ +%8</span>
                  <span className="text-[#6E81A0] dark:text-[#94A3B8] font-normal ml-1">yıllık kâr</span>
                </div>
              </div>
            </div>

            {/* KART 4: KATILIM ENDEKSİ SKORU */}
            <div className="bg-white dark:bg-[#161F32] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[150px] sm:min-h-[160px] group transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  Katılım Uyumu
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={12} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-[#182542] dark:text-white font-mono tracking-tight">
                  %100 Helal
                </div>
                <div className="text-[11px] font-bold text-[#0D8B52] dark:text-emerald-400 flex items-center gap-0.5">
                  <span>24/24 Kriter</span>
                  <span className="text-[#6E81A0] dark:text-[#94A3B8] font-normal ml-1">DİB Onay</span>
                </div>
              </div>
            </div>

          </div>

          {/* =============================================================== */}
          {/* KOLON 3: TEMETTÜ & GELİR SEYRİ GRAFİĞİ (lg:col-span-4)           */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 bg-white dark:bg-[#161F32] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 transition-colors">
            
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Aylık Kâr Payı &amp; Temettü Seyri
                  </h3>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Son 6 aylık kâr payı ve getiri dağılımı
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                  <span className="w-2 h-2 rounded-full bg-[#182542] dark:bg-blue-400" />
                  <span>Kâr Payı</span>
                </div>
              </div>
            </div>

            {/* Dikey Bar Grafiği */}
            <div className="pt-3 pb-1">
              <div className="flex items-end justify-between h-32 sm:h-36 gap-2 sm:gap-3 px-1">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                    
                    {item.active && (
                      <span className="text-[10px] font-bold font-mono bg-[#182542] dark:bg-[#273869] text-white px-1.5 py-0.5 rounded-md shadow-xs animate-pulse">
                        {item.label}
                      </span>
                    )}

                    <div className="w-full max-w-[24px] sm:max-w-[28px] h-full flex flex-col justify-end items-center">
                      <div
                        className={`w-full rounded-full transition-all duration-300 ${
                          item.active
                            ? "bg-[#182542] dark:bg-[#273869] shadow-xs"
                            : "bg-[#EAECEF] dark:bg-white/10 group-hover:bg-slate-300 dark:group-hover:bg-white/20"
                        }`}
                        style={{ height: `${item.profit}%` }}
                      />
                    </div>

                    <span className={`text-[11px] font-semibold ${
                      item.active ? "text-[#182542] dark:text-white font-bold" : "text-[#6E81A0] dark:text-[#94A3B8]"
                    }`}>
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#6E81A0] dark:text-[#94A3B8] text-[11px]">Nisan temettü dönemi</span>
              <Link
                href="/portfolio"
                className="font-bold text-[#182542] dark:text-blue-400 hover:text-blue-600 transition flex items-center gap-1 text-[11px]"
              >
                <span>Detaylı Rapor</span>
                <ChevronRight size={12} />
              </Link>
            </div>

          </div>

        </div>

        {/* ================================================================= */}
        {/* 2. SATIR: SON KATILIM İŞLEMLERİ & FIKHİ PİYASA BAKIŞI             */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* =============================================================== */}
          {/* SOL: SON KATILIM İŞLEMLERİ & KAP BİLDİRİMLERİ (lg:col-span-8)   */}
          {/* =============================================================== */}
          <div className="lg:col-span-8 bg-white dark:bg-[#161F32] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 transition-colors">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                  Son Katılım İşlemleri &amp; KAP Bildirimleri
                </h3>
                <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                  BIST hisselerinin çeyreklik arındırma, temettü ve icazet takibi
                </p>
              </div>

              <Link
                href="/tarayici"
                className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white transition flex items-center gap-1"
              >
                <span>Tümünü Gör (626)</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* Gerçek Logolu Hisse Listesi */}
            <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/5">
              {recentActivities.map((act) => (
                <div
                  key={act.ticker}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-3 group"
                >
                  {/* Sol: Gerçek Hisse Logosu + Detaylar */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <StockLogo
                      ticker={act.ticker}
                      name={act.name}
                      size="sm"
                      className="group-hover:scale-105 transition"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/companies/${act.ticker}`}
                          className="text-xs font-extrabold text-[#182542] dark:text-white hover:text-blue-500 transition truncate"
                        >
                          {act.ticker}
                        </Link>
                        <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] truncate hidden sm:inline">
                          &bull; {act.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] flex items-center gap-1.5">
                        <span>{act.type}</span>
                        <span>&bull;</span>
                        <span className="text-[10px]">{act.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sağ: Tutar + Uygunluk Rozeti */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-[#182542] dark:text-white">
                      {act.amount}
                    </div>
                    <div className={`text-[10px] font-bold mt-0.5 ${
                      act.compliant ? "text-[#0D8B52] dark:text-emerald-400" : "text-[#E03131] dark:text-rose-400"
                    }`}>
                      {act.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alt Canlı Piyasa Çubuğu */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                Canlı BIST Verisi: {updatedAt ? new Date(updatedAt).toLocaleTimeString("tr-TR") : "Güncel"}
              </span>

              <Link
                href="/tarayici"
                className="px-4 py-1.5 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold shadow-xs transition"
              >
                Hisse Taramaya Git &rarr;
              </Link>
            </div>

          </div>

          {/* =============================================================== */}
          {/* SAĞ: BİST KATILIM PİYASASI & FIKHİ ÖZET (lg:col-span-4)          */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 bg-white dark:bg-[#161F32] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 transition-colors">
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                  BIST Katılım Standartları
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 text-[10px] font-bold">
                  DİB &amp; TKBB
                </span>
              </div>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                Borsa İstanbul 3 Altın Rasyo Denetimi
              </p>
            </div>

            {/* 3 Rasyo Özeti */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#182542] dark:text-white block">Faizli Borç Eşiği</span>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Toplam Piyasa Değeri Oranı</span>
                </div>
                <span className="text-xs font-mono font-black text-[#182542] dark:text-white bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 rounded-lg">
                  ≤ %33
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#182542] dark:text-white block">Faizli Nakit &amp; Menkul</span>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Faiz Getirili Varlık Oranı</span>
                </div>
                <span className="text-xs font-mono font-black text-[#182542] dark:text-white bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 rounded-lg">
                  ≤ %33
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#182542] dark:text-white block">Uygun Olmayan Gelir</span>
                  <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Hasılat &amp; Yan Gelir Oranı</span>
                </div>
                <span className="text-xs font-mono font-black text-[#182542] dark:text-white bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 rounded-lg">
                  ≤ %5
                </span>
              </div>
            </div>

            {/* Hızlı Aksiyon */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
              <Link
                href="/portfolio?tab=arindirma"
                className="text-xs font-bold text-[#0D8B52] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Arındırma Hesapla &rarr;</span>
              </Link>

              <Link
                href="/rehber"
                className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white transition"
              >
                Metodoloji &rarr;
              </Link>
            </div>

          </div>

        </div>

      </div>
    </PaynoShell>
  );
}