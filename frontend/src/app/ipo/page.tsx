"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Search,
  TrendingUp,
  TrendingDown,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { BistIpoItem } from "@/lib/data/realBistIpos";
import { formatTRY } from "@/lib/decimal/decimal";

export default function IpoCalendarPage() {
  const [ipos, setIpos] = useState<BistIpoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "COMPLIANT" | "NON_COMPLIANT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalCount: 57,
    compliantCount: 38,
    nonCompliantCount: 19,
    complianceRatePercent: 66.7,
  });

  // Lot Hesaplama Modülü State'leri
  const [targetIpo, setTargetIpo] = useState<BistIpoItem | null>(null);
  const [expectedParticipants, setExpectedParticipants] = useState<number>(2_200_000);
  const [calculatedLots, setCalculatedLots] = useState<number>(0);
  const [requiredCapitalTRY, setRequiredCapitalTRY] = useState<number>(0);

  useEffect(() => {
    async function fetchIpos() {
      setLoading(true);
      try {
        const res = await fetch("/api/ipo", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          setIpos(json.ipos || []);
          if (json.stats) setStats(json.stats);
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

  useEffect(() => {
    if (targetIpo && expectedParticipants > 0) {
      const approxLots = Math.max(
        1,
        Math.round(targetIpo.totalLotCount / expectedParticipants)
      );
      setCalculatedLots(approxLots);
      setRequiredCapitalTRY(approxLots * targetIpo.currentPriceTRY);
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-24 space-y-8">
      {/* Payno Sky-Mist Hero Header */}
      <section className="payno-sky-hero p-6 sm:p-10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white text-[#182542] text-xs font-semibold">
              <ShieldCheck size={14} className="text-[#12B76A]" />
              <span>Borsa İstanbul Resmi XHARZ &amp; XKTUM 7/24 Canlı Senkron</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-[#182542] tracking-tight">
              Halka Arz{" "}
              <span className="font-normal italic font-serif">Katılım</span>{" "}
              Merkezi
            </h1>
            <p className="text-sm text-[#182542]/80 leading-relaxed">
              BIST Halka Arz Endeksi (XHARZ) kapsamındaki tüm{" "}
              <strong>{stats.totalCount} şirketin</strong> güncel işlem fiyatı,
              halka arz getirisi ve XKTUM Katılım Endeksi uygunluk durumu 7/24
              canlı olarak güncellenir.
            </p>
          </div>

          {/* 4 KPI Mini Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-white/85 backdrop-blur-md border border-white rounded-2xl p-4">
              <span className="text-[10px] font-bold text-[#6E81A0] uppercase">
                XHARZ Endeksi
              </span>
              <span className="text-2xl font-bold text-[#182542] font-mono block mt-1">
                {stats.totalCount}
              </span>
            </div>
            <div className="bg-white/85 backdrop-blur-md border border-white rounded-2xl p-4">
              <span className="text-[10px] font-bold text-[#0F7A43] uppercase">
                Katılım Uygun
              </span>
              <span className="text-2xl font-bold text-[#0F7A43] font-mono block mt-1">
                {stats.compliantCount}
              </span>
            </div>
            <div className="bg-white/85 backdrop-blur-md border border-white rounded-2xl p-4">
              <span className="text-[10px] font-bold text-[#C62E26] uppercase">
                Kapsam Dışı
              </span>
              <span className="text-2xl font-bold text-[#C62E26] font-mono block mt-1">
                {stats.nonCompliantCount}
              </span>
            </div>
            <div className="bg-white/85 backdrop-blur-md border border-white rounded-2xl p-4">
              <span className="text-[10px] font-bold text-[#254EDA] uppercase">
                Uygunluk Oranı
              </span>
              <span className="text-2xl font-bold text-[#254EDA] font-mono block mt-1">
                %{stats.complianceRatePercent}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Payno Lot & Teminat Simülatörü */}
      {targetIpo && (
        <section className="payno-card p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#E6ECF5]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EEF3F9] text-[#182542] flex items-center justify-center">
                <Calculator size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#182542]">
                  Bireysele Eşit Dağıtım Lot &amp; Teminat Hesaplayıcı
                </h2>
                <p className="text-xs text-[#6E81A0]">
                  Katılımcı sayısına göre kişi başı düşecek tahmini lot ve
                  gereken bakiye simülasyonu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#182542]">Şirket:</span>
              <select
                value={targetIpo.ticker}
                onChange={(e) => {
                  const found = ipos.find((i) => i.ticker === e.target.value);
                  if (found) setTargetIpo(found);
                }}
                className="px-4 py-2 rounded-full border border-[#DCE5F2] text-xs font-bold text-[#182542] bg-[#F3F6FB]"
              >
                {ipos.map((i) => (
                  <option key={i.ticker} value={i.ticker}>
                    {i.ticker} — {i.companyName.slice(0, 32)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 items-center">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#182542]">
                  Tahmini Katılımcı:
                </span>
                <span className="font-mono font-bold text-[#254EDA]">
                  {expectedParticipants.toLocaleString("tr-TR")} Kişi
                </span>
              </div>
              <input
                type="range"
                min="500000"
                max="4500000"
                step="100000"
                value={expectedParticipants}
                onChange={(e) =>
                  setExpectedParticipants(Number(e.target.value))
                }
                className="w-full accent-[#182542] cursor-pointer"
              />
              <div className="w-full h-2.5 payno-hatch-track">
                <div
                  className="h-full payno-hatch-fill"
                  style={{
                    width: `${(expectedParticipants / 4_500_000) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="payno-inner-box p-4">
              <span className="text-[10px] font-bold text-[#6E81A0] uppercase">
                Kişi Başı Tahmini Pay
              </span>
              <div className="text-2xl font-bold text-[#182542] font-mono mt-1">
                ~{calculatedLots} Lot
              </div>
            </div>

            <div className="payno-inner-box p-4">
              <span className="text-[10px] font-bold text-[#0F7A43] uppercase">
                Yaklaşık Pozisyon Büyüklüğü
              </span>
              <div className="text-2xl font-bold text-[#0F7A43] font-mono mt-1">
                {formatTRY(requiredCapitalTRY, 2)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filtre ve Arama Barı */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="apple-segmented-group">
          <button
            onClick={() => setFilter("ALL")}
            className={`apple-segmented-item ${filter === "ALL" ? "active" : ""}`}
          >
            Tüm Halka Arzlar ({ipos.length})
          </button>
          <button
            onClick={() => setFilter("COMPLIANT")}
            className={`apple-segmented-item ${
              filter === "COMPLIANT" ? "active" : ""
            }`}
          >
            Katılım Uygun ({stats.compliantCount})
          </button>
          <button
            onClick={() => setFilter("NON_COMPLIANT")}
            className={`apple-segmented-item ${
              filter === "NON_COMPLIANT" ? "active" : ""
            }`}
          >
            Kapsam Dışı ({stats.nonCompliantCount})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E81A0]"
            size={15}
          />
          <input
            type="text"
            placeholder="57 XHARZ halka arz içinde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#DCE5F2] text-xs text-[#182542] bg-white focus:outline-none focus:border-[#182542]"
          />
        </div>
      </div>

      {/* Halka Arz Kartları Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#182542] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#6E81A0] font-mono">
            BIST XHARZ Halka Arz Endeksi Canlı Taranıyor...
          </span>
        </div>
      ) : filteredIpos.length === 0 ? (
        <div className="payno-card p-12 text-center">
          <HelpCircle size={36} className="mx-auto text-[#6E81A0] mb-3" />
          <h3 className="text-base font-bold text-[#182542]">Sonuç Bulunamadı</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIpos.map((ipo) => {
            const isGain = ipo.changeSinceIpoPercent >= 0;
            return (
              <div
                key={ipo.id}
                className="payno-card p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] flex items-center justify-center font-mono font-bold text-xs text-[#182542]">
                        {ipo.ticker}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#182542] truncate max-w-[160px]">
                          {ipo.companyName}
                        </h3>
                        <span className="text-[11px] text-[#6E81A0] block">
                          {ipo.sector}
                        </span>
                      </div>
                    </div>

                    {ipo.isKatilimCompliant ? (
                      <span className="px-2.5 py-1 rounded-full payno-badge-mint text-[10px] flex items-center gap-1 shrink-0">
                        <CheckCircle2 size={11} />
                        <span>XKTUM Uygun</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full payno-badge-coral text-[10px] flex items-center gap-1 shrink-0">
                        <XCircle size={11} />
                        <span>Kapsam Dışı</span>
                      </span>
                    )}
                  </div>

                  {/* Fiyat & Performans */}
                  <div className="grid grid-cols-3 gap-2 my-4 p-3.5 payno-inner-box text-xs">
                    <div>
                      <span className="text-[10px] text-[#6E81A0] block">
                        Ref. Fiyat
                      </span>
                      <span className="font-mono font-bold text-[#182542]">
                        ₺{ipo.ipoPriceTRY.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6E81A0] block">
                        Canlı Fiyat
                      </span>
                      <span className="font-mono font-bold text-[#182542]">
                        ₺{ipo.currentPriceTRY.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6E81A0] block">
                        Performans
                      </span>
                      <span
                        className={`font-mono font-bold flex items-center gap-0.5 ${
                          isGain ? "text-[#12B76A]" : "text-[#F04438]"
                        }`}
                      >
                        {isGain ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {isGain ? "+" : ""}
                        {ipo.changeSinceIpoPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* KAFİF Gerekçesi */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E6ECF5] text-[11px] text-[#5B6E8C] leading-relaxed">
                    <div className="font-bold text-[#182542] mb-1 flex items-center justify-between">
                      <span>KAFİF &amp; Rasyo Özeti</span>
                      <span className="font-mono text-[10px]">
                        Borç: {ipo.kafifSummary.interestDebtRatio}
                      </span>
                    </div>
                    {ipo.complianceReason}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EEF3F9] flex items-center justify-between text-xs">
                  <a
                    href={ipo.kapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6E81A0] hover:text-[#182542] font-medium"
                  >
                    KAP Bildirimleri ↗
                  </a>
                  <Link
                    href={`/companies/${ipo.ticker}`}
                    className="font-bold text-[#254EDA] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Katılım Karnesi</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
