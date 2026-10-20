"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Calculator,
  ShieldCheck,
  Building2,
  Coins,
  RefreshCw,
} from "lucide-react";
import { BistIpoItem } from "@/lib/data/realBistIpos";
import { formatTRY } from "@/lib/decimal/decimal";

export default function IpoCalendarPage() {
  const [ipos, setIpos] = useState<BistIpoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "COMPLIANT" | "NON_COMPLIANT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalCount: 0,
    compliantCount: 0,
    nonCompliantCount: 0,
    complianceRatePercent: 0,
  });

  // Lot Hesaplama Modülü State'leri
  const [targetIpo, setTargetIpo] = useState<BistIpoItem | null>(null);
  const [expectedParticipants, setExpectedParticipants] = useState<number>(2_500_000);
  const [calculatedLots, setCalculatedLots] = useState<number>(0);
  const [requiredCapitalTRY, setRequiredCapitalTRY] = useState<number>(0);

  useEffect(() => {
    async function fetchIpos() {
      setLoading(true);
      try {
        const res = await fetch("/api/ipo");
        if (res.ok) {
          const json = await res.json();
          setIpos(json.ipos || []);
          setStats(json.stats || {});
          if (json.ipos && json.ipos.length > 0) {
            setTargetIpo(json.ipos[0]);
          }
        }
      } catch (err) {
        console.error("IPO fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchIpos();
  }, []);

  // Hedef IPO veya katılımcı sayısı değiştiğinde lot hesapla
  useEffect(() => {
    if (targetIpo && expectedParticipants > 0) {
      // Bireysele eşit dağıtımda tahmini lot = Toplam Lot / Tahmini Katılımcı
      const approxLots = Math.max(1, Math.round(targetIpo.totalLotCount / expectedParticipants));
      setCalculatedLots(approxLots);
      setRequiredCapitalTRY(approxLots * targetIpo.ipoPriceTRY);
    }
  }, [targetIpo, expectedParticipants]);

  const filteredIpos = ipos.filter((item) => {
    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "COMPLIANT"
        ? item.isKatilimCompliant
        : !item.isKatilimCompliant;

    const matchesSearch =
      searchQuery === ""
        ? true
        : item.ticker.includes(searchQuery.toUpperCase()) ||
          item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sector.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>SPK İzahname &amp; KAFİF Onaylı Resmi Veriler</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Borsa İstanbul Halka Arz Katılım Takvimi
            </h1>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Yeni halka arz edilen tüm şirketlerin Katılım Finansı İlkeleri Bilgi Formu (KAFİF)
              ve faizsiz finans standartlarına uygunluğu anlık olarak taranır.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Toplam Taranan Arz
              </span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                {stats.totalCount} Şirket
              </span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Katılım Endeksine Uygun
              </span>
              <span className="text-2xl font-extrabold text-emerald-800 font-mono mt-1 block">
                {stats.compliantCount} Arz (%{stats.complianceRatePercent})
              </span>
            </div>
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
                Kapsam Dışı (Uygun Değil)
              </span>
              <span className="text-2xl font-extrabold text-rose-800 font-mono mt-1 block">
                {stats.nonCompliantCount} Arz
              </span>
            </div>
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                Canlı Fiyat Senkronizasyonu
              </span>
              <span className="text-2xl font-extrabold text-blue-800 font-mono mt-1 block flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                7/24 Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Interactive Lot Calculator Tool */}
        {targetIpo && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Calculator size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Halka Arz Katılım ve Tahmini Lot Hesaplayıcı
                  </h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Tahmini katılımcı sayısına göre hesabınıza kaç lot düşeceğini ve gereken nakit tutarı anında hesaplayın.
                  </p>
                </div>
              </div>

              {/* Company Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Şirket Seçin:</label>
                <select
                  value={targetIpo.ticker}
                  onChange={(e) => {
                    const found = ipos.find((i) => i.ticker === e.target.value);
                    if (found) setTargetIpo(found);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ipos.map((i) => (
                    <option key={i.ticker} value={i.ticker}>
                      {i.ticker} - {i.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {/* Slider Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Tahmini Katılımcı Sayısı:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {expectedParticipants.toLocaleString("tr-TR")} Kişi
                  </span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="4500000"
                  step="100000"
                  value={expectedParticipants}
                  onChange={(e) => setExpectedParticipants(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>500 Bin</span>
                  <span>2.5 Milyon (Ort.)</span>
                  <span>4.5 Milyon</span>
                </div>
              </div>

              {/* Result 1: Calculated Lots */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Kişi Başı Tahmini Dağıtım
                </span>
                <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                  ~{calculatedLots} Lot
                  <span className="text-xs font-normal text-slate-500 ml-2">
                    (@{targetIpo.ipoPriceTRY.toFixed(2)} ₺)
                  </span>
                </div>
              </div>

              {/* Result 2: Required Capital */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  Gereken Yaklaşık Teminat
                </span>
                <div className="text-2xl font-extrabold text-emerald-900 font-mono mt-1">
                  {formatTRY(requiredCapitalTRY, 2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tüm Halka Arzlar ({ipos.length})
            </button>
            <button
              onClick={() => setFilter("COMPLIANT")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === "COMPLIANT"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Katılım Uygun ({stats.compliantCount})</span>
            </button>
            <button
              onClick={() => setFilter("NON_COMPLIANT")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === "NON_COMPLIANT"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-rose-700"
              }`}
            >
              <XCircle size={13} />
              <span>Kapsam Dışı ({stats.nonCompliantCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Hisse kodu, şirket veya sektör..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* IPO Cards Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500 font-mono">
              BIST Halka Arz Verileri Taranıyor...
            </span>
          </div>
        ) : filteredIpos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <HelpCircle size={40} className="mx-auto text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900">Sonuç Bulunamadı</h3>
            <p className="text-xs text-slate-500 mt-1">
              Arama kriterlerinize uyan halka arz kaydı bulunamadı.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIpos.map((ipo) => {
              const isGain = ipo.changeSinceIpoPercent >= 0;
              return (
                <div
                  key={ipo.id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 hover:shadow-md ${
                    ipo.isKatilimCompliant
                      ? "border-slate-200 hover:border-emerald-300"
                      : "border-slate-200 hover:border-rose-300"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-slate-900 font-mono text-base shadow-xs">
                        {ipo.ticker}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">
                            {ipo.companyName}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-500 font-normal block mt-0.5">
                          {ipo.sector} &bull; {ipo.distributionMethod}
                        </span>
                      </div>
                    </div>

                    {/* Katılım Status Badge */}
                    {ipo.isKatilimCompliant ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Katılıma Uygun</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold shrink-0">
                        <XCircle size={13} className="text-rose-600" />
                        <span>Kapsam Dışı</span>
                      </span>
                    )}
                  </div>

                  {/* Pricing and Return Stats */}
                  <div className="grid grid-cols-3 gap-3 my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Arz Fiyatı
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                        {ipo.ipoPriceTRY.toFixed(2)} ₺
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Güncel Fiyat
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                        {ipo.currentPriceTRY.toFixed(2)} ₺
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Halka Arz Getirisi
                      </span>
                      <span
                        className={`text-sm font-bold font-mono mt-0.5 flex items-center gap-1 ${
                          isGain ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {isGain ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {isGain ? "+" : ""}
                        {ipo.changeSinceIpoPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* KAFİF Analysis Box */}
                  <div
                    className={`p-4 rounded-2xl text-xs space-y-2 ${
                      ipo.isKatilimCompliant
                        ? "bg-emerald-50/60 border border-emerald-200 text-emerald-950"
                        : "bg-rose-50/60 border border-rose-200 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className={ipo.isKatilimCompliant ? "text-emerald-700" : "text-rose-700"} />
                        KAFİF Fıkhi Uygunluk Analizi
                      </span>
                      <span className="font-mono text-[11px] opacity-80">
                        Borç: {ipo.kafifSummary.interestDebtRatio}
                      </span>
                    </div>
                    <p className="font-normal text-[11.5px] leading-relaxed opacity-90">
                      {ipo.complianceReason}
                    </p>
                  </div>

                  {/* Footer details */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-600">
                      {ipo.consortiumLead}
                    </span>
                    <Link
                      href={`/companies/${ipo.ticker}`}
                      className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                    >
                      <span>Fıkhi Detay</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
