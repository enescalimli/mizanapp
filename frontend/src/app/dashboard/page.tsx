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
  RefreshCw,
  Radio,
  FileText,
} from "lucide-react";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import { useLiveDisclosures } from "@/lib/hooks/useLiveDisclosures";
import { PaynoShell } from "@/components/PaynoShell";
import { StockLogo } from "@/components/StockLogo";
import { DisclosureDetailModal } from "@/components/DisclosureDetailModal";
import { DisclosureItem } from "@/types/disclosure";
import { useAuth } from "@/lib/auth/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading, isDemoUser } = useAuth();
  const { companies, updatedAt } = useLiveMarketData(45000);

  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [currency, setCurrency] = useState<"TRY" | "USD">("TRY");

  // Auth gate: Giriş yapmamış kullanıcıyı anında /auth/login'e yönlendir
  React.useEffect(() => {
    if (!loading && !user && !isDemoUser) {
      router.replace("/auth/login");
    }
  }, [loading, user, isDemoUser, router]);

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

  // Live KAP and SPK Disclosures Hook
  const {
    disclosures,
    kapDisclosures,
    spkDisclosures,
    loading: disclosuresLoading,
    isRefreshing,
    updatedAt: disclosuresUpdatedAt,
    refresh: refreshDisclosures,
  } = useLiveDisclosures(25000);

  const [selectedDisclosure, setSelectedDisclosure] = useState<DisclosureItem | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<"ALL" | "KAP" | "SPK" | "KATILIM">("ALL");

  const displayedDisclosures = useMemo(() => {
    if (activeFeedTab === "KAP") return disclosures.filter((d) => d.source === "KAP");
    if (activeFeedTab === "SPK") return disclosures.filter((d) => d.source === "SPK");
    if (activeFeedTab === "KATILIM") return disclosures.filter((d) => d.isCompliant === true);
    return disclosures;
  }, [disclosures, activeFeedTab]);

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
          <div className="lg:col-span-4 bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5 transition-colors">
            
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
            <div className="relative overflow-hidden bg-white dark:bg-[#0E1015] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[150px] sm:min-h-[160px] group transition-colors">
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
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[150px] sm:min-h-[160px] group transition-colors">
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
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[150px] sm:min-h-[160px] group transition-colors">
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
            <div className="bg-white dark:bg-[#0E1015] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[150px] sm:min-h-[160px] group transition-colors">
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
          {/* KOLON 3: CANLI KAP BİLDİRİMLERİ AKIŞI (lg:col-span-4)            */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 transition-colors">
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Canlı KAP Bildirimleri
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Canlı</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                  Borsa İstanbul anlık şirket açıklamaları
                </p>
              </div>

              <button
                onClick={() => refreshDisclosures()}
                disabled={isRefreshing}
                title="Yenile"
                className="p-1.5 rounded-lg text-[#6E81A0] hover:text-[#182542] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Compact KAP Bildirim Listesi */}
            <div className="space-y-2.5 my-1 flex-1">
              {disclosuresLoading && kapDisclosures.length === 0 ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-20 bg-slate-200 dark:bg-white/10 rounded" />
                        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : kapDisclosures.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                  Henüz yeni KAP bildirimi bulunmuyor
                </div>
              ) : (
                kapDisclosures.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDisclosure(item)}
                    className="p-2.5 rounded-2xl bg-[#F8F9FA] hover:bg-slate-100/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.ticker ? (
                        <StockLogo
                          ticker={item.ticker}
                          name={item.companyName || item.ticker}
                          size="sm"
                          className="group-hover:scale-105 transition shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] font-black shrink-0">
                          KAP
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[#182542] dark:text-white truncate">
                            {item.ticker || "KAP"}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 truncate max-w-[120px]">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] truncate max-w-[180px]">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-[#6E81A0] dark:text-[#94A3B8] block">
                        {item.timeAgo}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition">
                        Ayrıntı &rarr;
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Alt Bilgi & Detaylı Akış Butonu */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#6E81A0] dark:text-[#94A3B8] text-[11px]">
                {kapDisclosures.length} canlı bildirim
              </span>
              <button
                onClick={() => setActiveFeedTab("KAP")}
                className="font-bold text-[#182542] dark:text-blue-400 hover:text-blue-600 transition flex items-center gap-1 text-[11px]"
              >
                <span>Tüm KAP Akışı</span>
                <ChevronRight size={12} />
              </button>
            </div>

          </div>

        </div>

        {/* ================================================================= */}
        {/* 2. SATIR: CANLI KAP & SPK BİLDİRİM AKIŞI VE SPK BÜLTEN KARTI     */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* =============================================================== */}
          {/* SOL: CANLI BİST KAP & SPK BİLDİRİM AKIŞI (lg:col-span-8)         */}
          {/* =============================================================== */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 transition-colors">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Canlı KAP &amp; SPK Bildirim Akışı
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Canlı Akış</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                  KAP şirket açıklamaları, devre kesiciler ve SPK kurul bültenleri (tıklayarak ayrıntıları görün)
                </p>
              </div>

              {/* Filtreleme Sekmeleri */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl text-[11px] font-bold shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setActiveFeedTab("ALL")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeFeedTab === "ALL"
                      ? "bg-white dark:bg-[#273869] text-[#182542] dark:text-white shadow-xs"
                      : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                  }`}
                >
                  Tümü ({disclosures.length})
                </button>
                <button
                  onClick={() => setActiveFeedTab("KAP")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeFeedTab === "KAP"
                      ? "bg-white dark:bg-[#273869] text-[#182542] dark:text-white shadow-xs"
                      : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                  }`}
                >
                  KAP ({kapDisclosures.length})
                </button>
                <button
                  onClick={() => setActiveFeedTab("SPK")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeFeedTab === "SPK"
                      ? "bg-white dark:bg-[#273869] text-[#182542] dark:text-white shadow-xs"
                      : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                  }`}
                >
                  SPK ({spkDisclosures.length})
                </button>
                <button
                  onClick={() => setActiveFeedTab("KATILIM")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeFeedTab === "KATILIM"
                      ? "bg-white dark:bg-[#273869] text-[#0D8B52] dark:text-emerald-400 shadow-xs"
                      : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                  }`}
                >
                  Katılım
                </button>
              </div>
            </div>

            {/* Bildirim Listesi */}
            <div className="space-y-2.5 divide-y divide-slate-100 dark:divide-white/5 flex-1">
              {disclosuresLoading && displayedDisclosures.length === 0 ? (
                <div className="space-y-3 py-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                          <div className="h-2.5 w-64 bg-slate-100 dark:bg-white/5 rounded" />
                        </div>
                      </div>
                      <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : displayedDisclosures.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                    Seçili filtreye uygun bildirim bulunamadı
                  </p>
                  <button
                    onClick={() => setActiveFeedTab("ALL")}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tüm akışı göster
                  </button>
                </div>
              ) : (
                displayedDisclosures.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDisclosure(item)}
                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group transition"
                  >
                    {/* Sol: Logo / Rozet + Başlık + Detay */}
                    <div className="flex items-center gap-3 min-w-0">
                      {item.ticker ? (
                        <StockLogo
                          ticker={item.ticker}
                          name={item.companyName || item.ticker}
                          size="sm"
                          className="group-hover:scale-105 transition shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            item.source === "KAP"
                              ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                              : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                          }`}
                        >
                          {item.source}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-[#182542] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                            {item.ticker || item.source}
                          </span>
                          {item.companyName && (
                            <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] truncate hidden md:inline">
                              • {item.companyName}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.source === "KAP"
                                ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300"
                                : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            {item.category}
                          </span>
                          {item.isNew && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white animate-pulse">
                              YENİ
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] truncate max-w-[280px] sm:max-w-md">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    {/* Sağ: Süre + Katılım Durumu */}
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-mono font-bold text-[#6E81A0] dark:text-[#94A3B8]">
                        {item.timeAgo}
                      </div>
                      <div className="mt-0.5">
                        {item.isCompliant === true ? (
                          <span className="text-[10px] font-bold text-[#0D8B52] dark:text-emerald-400">
                            DİB Uyumlu
                          </span>
                        ) : item.isCompliant === false ? (
                          <span className="text-[10px] font-bold text-[#E03131] dark:text-rose-400">
                            Katılım Dışı
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            Kurul Kararı
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Alt Canlı Piyasa & Senkronizasyon Çubuğu */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  Canlı Senkronizasyon:{" "}
                  {disclosuresUpdatedAt
                    ? new Date(disclosuresUpdatedAt).toLocaleTimeString("tr-TR")
                    : "Aktif"}
                </span>
              </div>

              <Link
                href="/tarayici"
                className="px-4 py-1.5 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold shadow-xs transition"
              >
                Hisse Taramaya Git &rarr;
              </Link>
            </div>

          </div>

          {/* =============================================================== */}
          {/* SAĞ: CANLI SPK BÜLTENLERİ & KURUL KARARLARI (lg:col-span-4)      */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0E1015] rounded-[24px] p-5 sm:p-6 border border-slate-200/60 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 transition-colors">
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#182542] dark:text-white">
                    Canlı SPK Bildirimleri
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-200/50 dark:border-rose-800/30">
                    SPK / BIST
                  </span>
                </div>
                <button
                  onClick={() => refreshDisclosures()}
                  disabled={isRefreshing}
                  title="Yenile"
                  className="p-1 rounded-lg text-[#6E81A0] hover:text-[#182542] dark:hover:text-white transition"
                >
                  <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                </button>
              </div>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                Kurul bültenleri, halka arz onayları &amp; yaptırımlar
              </p>
            </div>

            {/* SPK Bildirim Listesi */}
            <div className="space-y-2.5 my-1 flex-1">
              {disclosuresLoading && spkDisclosures.length === 0 ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-3 rounded-2xl bg-slate-50 dark:bg-white/5 space-y-2">
                      <div className="h-3 w-28 bg-slate-200 dark:bg-white/10 rounded" />
                      <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              ) : spkDisclosures.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                  Yeni SPK bülteni bekleniyor
                </div>
              ) : (
                spkDisclosures.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDisclosure(item)}
                    className="p-3 rounded-2xl bg-[#F8F9FA] hover:bg-slate-100/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 flex flex-col justify-between cursor-pointer group transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-mono">
                        {item.timeAgo}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#182542] dark:text-white line-clamp-2 group-hover:text-blue-500 transition">
                      {item.title}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#6E81A0] dark:text-[#94A3B8] pt-1">
                      <span>{item.publisher}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                        Ayrıntı <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Hızlı Aksiyon & Resmi SPK Bağlantısı */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
              <a
                href="https://spk.gov.tr/spk-bultenleri"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#182542] dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>SPK Resmi Bültenleri &rarr;</span>
              </a>

              <button
                onClick={() => setActiveFeedTab("SPK")}
                className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white transition"
              >
                Tümünü Listele &rarr;
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* KAP & SPK Ayrıntı / Fıkhi Analiz Modalı */}
      <DisclosureDetailModal
        disclosure={selectedDisclosure}
        onClose={() => setSelectedDisclosure(null)}
      />
    </PaynoShell>
  );
}