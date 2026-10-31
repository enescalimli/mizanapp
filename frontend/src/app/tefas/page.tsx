"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Scale,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Users,
  Coins,
  FileText,
  X,
  AlertCircle,
  Building,
} from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";
import {
  TEFAS_KATILIM_FUNDS,
  TefasKatilimFund,
} from "@/lib/data/tefasKatilimFunds";
import { formatTRY } from "@/lib/decimal/decimal";

export default function TefasKatilimPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TÜMÜ");
  const [activeFund, setActiveFund] = useState<TefasKatilimFund | null>(TEFAS_KATILIM_FUNDS[0]);

  const categories = useMemo(() => {
    const list = ["TÜMÜ"];
    TEFAS_KATILIM_FUNDS.forEach((f) => {
      if (!list.includes(f.category)) list.push(f.category);
    });
    return list;
  }, []);

  const filteredFunds = useMemo(() => {
    return TEFAS_KATILIM_FUNDS.filter((fund) => {
      const matchCat =
        selectedCategory === "TÜMÜ" || fund.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        fund.code.toLowerCase().includes(q) ||
        fund.name.toLowerCase().includes(q) ||
        fund.managementCompany.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Toplam İstatistikler
  const totalAum = useMemo(() => {
    return TEFAS_KATILIM_FUNDS.reduce((sum, f) => sum + f.totalFundValueTRY, 0);
  }, []);

  const totalInvestors = useMemo(() => {
    return TEFAS_KATILIM_FUNDS.reduce((sum, f) => sum + f.investorCount, 0);
  }, []);

  return (
    <PaynoShell badge="TEFAS FONLARI">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* =================================================================== */}
        {/* HERO BAŞLIK & FIKHİ RÖNTGEN VİZYONU                                 */}
        {/* =================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-emerald-500/10 via-slate-500/5 to-transparent border border-emerald-500/20 backdrop-blur-xl">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono">
                TEFAS Şeffaf Look-Through Röntgeni
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono">
                DİB &amp; TKBB Standartları
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#182542] dark:text-white tracking-tight">
              TEFAS Katılım Fonları Röntgeni
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Türkiye&apos;nin en büyük katılım fonlarının perde arkasını açın. Altındaki hisse senetlerini, kira sertifikalarını (sukuk), fıkhi arılık oranlarını ve icazet belgelerini tek tıkla şeffafça denetleyin.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 shadow-xs text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Toplam Katılım Fon Büyüklüğü</span>
              <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                {formatTRY(totalAum, 0)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 shadow-xs text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Toplam Yatırımcı</span>
              <span className="font-mono text-base font-black text-[#182542] dark:text-white">
                {totalInvestors.toLocaleString("tr-TR")}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* ARAMA & KATEGORİ FİLTRELERİ                                         */}
        {/* =================================================================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#182542] dark:bg-white text-white dark:text-black shadow-xs"
                    : "bg-white dark:bg-[#0E1015] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-200/60 dark:border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fon Kodu veya Kurucu Ara (KHA, ZPF)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white dark:bg-[#0E1015] border border-slate-200/60 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* =================================================================== */}
        {/* ANA BENTO IZGARASI: SOLDA FON LİSTESİ, SAĞDA LOOK-THROUGH RÖNTGENİ  */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* SOL: FON LİSTESİ (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Katılım Fonları ({filteredFunds.length})
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                TEFAS Günlük Veri
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredFunds.map((fund) => {
                const isSelected = activeFund?.code === fund.code;
                return (
                  <div
                    key={fund.code}
                    onClick={() => setActiveFund(fund)}
                    className={`rounded-2xl p-4 transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-white dark:bg-[#0E1015] border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                        : "bg-white/60 dark:bg-[#0E1015]/60 hover:bg-white dark:hover:bg-[#0E1015] border-slate-200/60 dark:border-white/10 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm font-mono text-[#182542] dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                            {fund.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {fund.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1.5 line-clamp-1">
                          {fund.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {fund.managementCompany}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                          ₺{fund.navPriceTRY.toFixed(4)}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold ${
                            fund.dailyReturnPercent >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {fund.dailyReturnPercent >= 0 ? "+" : ""}
                          %{fund.dailyReturnPercent.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <ShieldCheck size={13} className="text-emerald-500" />
                        <span>Fıkhi Uyum: %{fund.shariahCompliancePercent.toFixed(0)}</span>
                      </span>
                      <span className="text-slate-500 font-mono">
                        Yıllık: <strong className="text-emerald-600 dark:text-emerald-400">%{fund.yearlyReturnPercent.toFixed(1)}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SAĞ: SEÇİLİ FONUN LOOK-THROUGH RÖNTGENİ (lg:col-span-7) */}
          <div className="lg:col-span-7 sticky top-6">
            {activeFund ? (
              <div className="rounded-[28px] p-5 sm:p-6 bg-white dark:bg-[#0E1015] border border-slate-200/80 dark:border-white/10 shadow-lg space-y-5 transition-colors">
                
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black font-mono text-[#182542] dark:text-white bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-xl">
                        {activeFund.code}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {activeFund.category}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck size={13} />
                        <span>%100 Helal İcazetli</span>
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2">
                      {activeFund.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeFund.managementCompany}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Birim Pay Değeri</span>
                    <span className="text-xl font-black font-mono text-[#182542] dark:text-white">
                      ₺{activeFund.navPriceTRY.toFixed(4)}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 block font-bold">
                      Yıllık Getiri: +%{activeFund.yearlyReturnPercent.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Varlık Dağılımı Çubuğu */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <PieChart size={14} className="text-emerald-500" />
                      <span>Varlık Sınıfı Dağılımı</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Fon Büyüklüğü: {formatTRY(activeFund.totalFundValueTRY, 0)}
                    </span>
                  </div>

                  {/* Multi-segment Progress Bar */}
                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex">
                    {activeFund.assetAllocation.map((asset, i) => (
                      <div
                        key={i}
                        style={{
                          width: `${asset.percent}%`,
                          backgroundColor: asset.color,
                        }}
                        title={`${asset.label}: %${asset.percent}`}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                      />
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                    {activeFund.assetAllocation.map((asset, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: asset.color }}
                        />
                        <span>{asset.label}</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200">
                          %{asset.percent.toFixed(1)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Perde Arkası: Altındaki Hisseler / Varlıklar (Look-Through Röntgeni) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers size={14} className="text-emerald-500" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                        Perde Arkası: Altındaki Hisseler &amp; Varlıklar
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Röntgen Aktif
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/60 dark:border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Hisse / Varlık</th>
                          <th className="py-2.5 px-3">Sektör</th>
                          <th className="py-2.5 px-3 text-right">Ağırlık</th>
                          <th className="py-2.5 px-3 text-center">Fıkhi Uyum</th>
                          <th className="py-2.5 px-3 text-right">Arındırma</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {activeFund.holdingsLookThrough.map((item) => (
                          <tr
                            key={item.ticker}
                            className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/companies/${item.ticker}`}
                                  className="font-mono font-bold text-[#182542] dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
                                >
                                  <span>{item.ticker}</span>
                                  {item.isKatilimCompliant && !item.ticker.includes("-") && (
                                    <ExternalLink size={10} className="text-slate-400" />
                                  )}
                                </Link>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] hidden sm:inline">
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                              {item.sector}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-white">
                              %{item.weightPercent.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                <ShieldCheck size={11} />
                                <span>Uyumlu</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-600 dark:text-slate-300">
                              {item.purificationRatio}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* İcazet & Danışma Kurulu Kararı */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#182542] dark:text-white">
                    <Sparkles size={14} className="text-emerald-500" />
                    <span>Danışma Kurulu &amp; Fıkhi İcazet Beyanı</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeFund.icazetBelgesiSummary}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Onaylayan Mercii: {activeFund.danismaKuruluApproval}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Ort. Arındırma: %{activeFund.purificationRatioPercent.toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                Lütfen incelemek istediğiniz katılım fonunu soldaki listeden seçin.
              </div>
            )}
          </div>

        </div>

      </div>
    </PaynoShell>
  );
}
