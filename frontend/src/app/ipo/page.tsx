"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Calendar,
  Coins,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import {
  BistIpoItem,
  UPCOMING_AND_ACTIVE_BIST_IPOS,
} from "@/lib/data/realBistIpos";

export default function IpoCalendarPage() {
  const [ipos, setIpos] = useState<BistIpoItem[]>(UPCOMING_AND_ACTIVE_BIST_IPOS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "COMPLIANT" | "DRAFT" | "NON_COMPLIANT"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Lot Dağıtım Simülasyonu Seçimleri
  const [selectedSimTicker, setSelectedSimTicker] = useState<string>("DURKN");
  const [simParticipants, setSimParticipants] = useState<number>(2_000_000);

  const selectedIpo = useMemo(() => {
    return (
      ipos.find((i) => i.ticker === selectedSimTicker) ||
      ipos[0]
    );
  }, [ipos, selectedSimTicker]);

  // Simülatörden hesaplanan tahmini lot
  const simulatedLotCount = useMemo(() => {
    if (!selectedIpo || simParticipants <= 0) return 0;
    return Math.max(
      1,
      Math.round(selectedIpo.totalLotCount / simParticipants)
    );
  }, [selectedIpo, simParticipants]);

  const simulatedAmountTRY = useMemo(() => {
    if (!selectedIpo) return 0;
    return simulatedLotCount * selectedIpo.ipoPriceTRY;
  }, [selectedIpo, simulatedLotCount]);

  // Filtreleme
  const filteredIpos = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    return ipos.filter((item) => {
      if (activeTab === "COMPLIANT" && !item.isKatilimCompliant) return false;
      if (activeTab === "DRAFT" && item.ipoStatus !== "TASLAK_SPK") return false;
      if (activeTab === "NON_COMPLIANT" && item.isKatilimCompliant) return false;

      if (q) {
        return (
          item.ticker.toUpperCase().includes(q) ||
          item.companyName.toUpperCase().includes(q) ||
          item.sector.toUpperCase().includes(q)
        );
      }
      return true;
    });
  }, [ipos, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const total = ipos.length;
    const compliant = ipos.filter((i) => i.isKatilimCompliant).length;
    const drafts = ipos.filter((i) => i.ipoStatus === "TASLAK_SPK").length;
    const nonCompliant = ipos.filter((i) => !i.isKatilimCompliant && i.complianceStatus === "NON_COMPLIANT").length;
    return { total, compliant, drafts, nonCompliant };
  }, [ipos]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 space-y-8">
      {/* ===================================================================== */}
      {/* 1. PAYNO SKY-MIST HERO HEADER                                         */}
      {/* ===================================================================== */}
      <section className="payno-sky-hero p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-white text-[#182542] text-xs font-bold shadow-xs">
            <ShieldCheck size={14} className="text-[#0D9F6E]" />
            <span>Katılım Finans İlkeleri Bilgi Formuna Göre Doğrulanmıştır</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#182542] tracking-tight">
            Halka Arz Edilecek &amp; Güncel Hisseler
          </h1>

          <p className="text-sm sm:text-base text-[#6E81A0] font-medium leading-relaxed">
            Talep toplama tarihleri, hisse başına halka arz fiyatı, tahmini kaç lot düşeceği
            ve <strong className="text-[#182542]">resmi katılım fıkhi uygunluğu</strong> tek bir şeffaf tabloda.
          </p>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. 4'LÜ TEMİZ PAYNO KPI KARTLARI                                      */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="payno-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#6E81A0] uppercase tracking-wider block">
            Toplam Halka Arz
          </span>
          <div className="text-3xl font-black text-[#182542] font-mono">
            {stats.total} <span className="text-xs text-[#7B8FA8] font-normal">Şirket</span>
          </div>
          <span className="text-[11px] text-[#2E6CF6] font-bold block">
            Güncel Pipeline
          </span>
        </div>

        <div className="payno-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#0D9F6E] uppercase tracking-wider block">
            Katılıma Uygun (Helal)
          </span>
          <div className="text-3xl font-black text-[#0D9F6E] font-mono">
            {stats.compliant} <span className="text-xs text-[#0D9F6E]/80 font-normal">Şirket</span>
          </div>
          <span className="text-[11px] text-[#0D9F6E] font-bold block">
            ✓ Katılım Onaylı
          </span>
        </div>

        <div className="payno-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider block">
            Taslak İzahname (SPK&apos;da)
          </span>
          <div className="text-3xl font-black text-[#F59E0B] font-mono">
            {stats.drafts} <span className="text-xs text-[#F59E0B]/80 font-normal">Beklenen</span>
          </div>
          <span className="text-[11px] text-[#B45309] font-bold block">
            Onay Sürecinde
          </span>
        </div>

        <div className="payno-card p-5 space-y-2">
          <span className="text-xs font-bold text-[#E11D48] uppercase tracking-wider block">
            Kapsam Dışı Paylar
          </span>
          <div className="text-3xl font-black text-[#E11D48] font-mono">
            {stats.nonCompliant} <span className="text-xs text-[#E11D48]/80 font-normal">Şirket</span>
          </div>
          <span className="text-[11px] text-[#BE123C] font-bold block">
            Faiz/Borç Eşiği Üstü
          </span>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. TAHMİNİ KAÇ LOT DÜŞER? HESAPLAMA SİMÜLATÖRÜ                        */}
      {/* ===================================================================== */}
      <section className="payno-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6ECF5] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#EEF3F9] text-[#2E6CF6] flex items-center justify-center font-bold">
                🎯
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#182542] tracking-tight">
                Tahmini Kaç Lot Düşer? Simülatörü
              </h2>
            </div>
            <p className="text-xs text-[#6E81A0] mt-1 font-medium">
              Katılımcı sayısına göre hesabınıza geçecek tahmini hisse adedini ve gereken nakit tutarı anında hesaplayın.
            </p>
          </div>

          {/* Şirket Seçici */}
          <div className="shrink-0 w-full sm:w-auto">
            <select
              value={selectedSimTicker}
              onChange={(e) => setSelectedSimTicker(e.target.value)}
              className="w-full sm:w-72 px-4 py-2.5 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-bold text-[#182542] focus:outline-none focus:bg-white"
            >
              {ipos.map((item) => (
                <option key={item.ticker} value={item.ticker}>
                  {item.ticker} — {item.companyName.slice(0, 32)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Simülasyon Kontrolleri ve Sonuç */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sol: Katılımcı Sayısı Butonları */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-[#182542] block">
              Beklenen Başvuru / Katılımcı Sayısı:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: "1.5 Milyon Kişi", val: 1_500_000 },
                { label: "2.0 Milyon Kişi", val: 2_000_000 },
                { label: "2.5 Milyon Kişi", val: 2_500_000 },
                { label: "3.0 Milyon Kişi", val: 3_000_000 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => setSimParticipants(btn.val)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold transition text-center ${
                    simParticipants === btn.val
                      ? "bg-[#182542] text-white shadow-md"
                      : "bg-[#F3F6FB] text-[#5B6E8C] hover:bg-[#E8EEF6]"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-[#6E81A0] flex items-center gap-1.5 pt-1 font-medium">
              <Info size={13} className="text-[#2E6CF6]" />
              <span>
                {selectedIpo.ticker} için toplam dağıtılacak pay:{" "}
                <strong className="text-[#182542] font-mono">
                  {selectedIpo.totalLotCount.toLocaleString("tr-TR")} Lot
                </strong>{" "}
                ({selectedIpo.distributionMethod})
              </span>
            </div>
          </div>

          {/* Sağ: Hesaplanan Sonuç Kartı */}
          <div className="lg:col-span-5 bg-gradient-to-tr from-[#182542] to-[#273B69] text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span>{selectedIpo.ticker} Tahmini Dağıtım</span>
              <span className="font-mono text-emerald-400 font-bold">
                {selectedIpo.isKatilimCompliant ? "✓ Katılıma Uygun" : "✕ Kapsam Dışı"}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-xs text-white/70 block">Düşecek Lot</span>
                <span className="text-4xl font-black font-mono tracking-tight text-white">
                  ~{simulatedLotCount}
                </span>
                <span className="text-sm text-white/80 font-bold ml-1">Lot</span>
              </div>

              <div className="text-right">
                <span className="text-xs text-white/70 block">Gereken Tutar</span>
                <span className="text-2xl font-bold font-mono text-emerald-300">
                  ₺{simulatedAmountTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-white/75">
              <span>Halka Arz Fiyatı: ₺{selectedIpo.ipoPriceTRY.toFixed(2)}</span>
              <span>T1-T2: {selectedIpo.t1t2Available ? "Kullanılabilir" : "Kullanılamaz"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. HALKA ARZ LİSTESİ — FİLTRE VE ARAMA                                */}
      {/* ===================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab Filtreleri */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: `Tüm Halka Arzlar (${stats.total})` },
              { id: "COMPLIANT", label: `✓ Katılıma Uygunlar (${stats.compliant})` },
              { id: "DRAFT", label: `Taslak İzahname (${stats.drafts})` },
              { id: "NON_COMPLIANT", label: `Kapsam Dışı (${stats.nonCompliant})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-[#182542] text-white shadow-sm"
                    : "bg-white text-[#5B6E8C] border border-[#E6ECF5] hover:text-[#182542]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Arama */}
          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E81A0]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Halka arz ara (Örn: DURKN, GUNDG)..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#DCE5F2] text-xs font-semibold text-[#182542] placeholder:text-[#6E81A0] focus:outline-none"
            />
          </div>
        </div>

        {/* Kartlar Izgarası */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIpos.map((item) => (
            <div
              key={item.id}
              className="payno-card p-6 sm:p-7 space-y-5 hover:border-[#CBD8EC] transition"
            >
              {/* Üst Satır: Ticker, Durum ve Katılım Rozeti */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#182542] text-white flex items-center justify-center font-mono font-bold text-base shadow-xs">
                    {item.ticker}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#182542] text-base tracking-tight leading-snug">
                      {item.companyName}
                    </h3>
                    <span className="text-xs text-[#6E81A0] font-medium">
                      {item.sector}
                    </span>
                  </div>
                </div>

                {/* Katılım Durumu */}
                <div>
                  {item.isKatilimCompliant ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full payno-badge-mint text-xs font-extrabold shadow-2xs">
                      <CheckCircle2 size={13} />
                      <span>Katılıma Uygun</span>
                    </span>
                  ) : item.complianceStatus === "UNDER_REVIEW" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full payno-badge-amber text-xs font-extrabold">
                      <HelpCircle size={13} />
                      <span>İnceleniyor</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full payno-badge-coral text-xs font-extrabold shadow-2xs">
                      <XCircle size={13} />
                      <span>Kapsam Dışı</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Temel Bilgiler Şeridi (Fiyat, Tarih, Dağıtım) */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EEF6] text-xs">
                <div>
                  <span className="text-[10px] text-[#6E81A0] font-bold uppercase block">
                    Halka Arz Fiyatı
                  </span>
                  <span className="text-base font-extrabold text-[#182542] font-mono">
                    {item.ipoPriceTRY > 0 ? `₺${item.ipoPriceTRY.toFixed(2)}` : "Belirlenecek"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#6E81A0] font-bold uppercase block">
                    Talep Tarihleri
                  </span>
                  <span className="font-bold text-[#182542] text-[11px] leading-tight block">
                    {item.ipoDates}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#6E81A0] font-bold uppercase block">
                    Toplam Pay (Lot)
                  </span>
                  <span className="text-sm font-bold text-[#182542] font-mono block">
                    {item.totalLotCount.toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>

              {/* Tahmini Lot Dağıtım Tablosu */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#182542] block">
                  Tahmini Katılımcıya Göre Düşecek Lot Sayısı:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {item.estimatedLots.map((s) => (
                    <div
                      key={s.participants}
                      className="p-2.5 rounded-xl bg-white border border-[#E6ECF5] text-center"
                    >
                      <span className="text-[10px] text-[#6E81A0] font-bold block">
                        {s.participantsLabel}
                      </span>
                      <span className="text-sm font-black text-[#182542] font-mono block mt-0.5">
                        ~{s.lots} Lot
                      </span>
                      <span className="text-[10px] text-[#0D9F6E] font-mono font-bold block">
                        ₺{s.amountTRY}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Katılım Fıkhi Gerekçesi */}
              <div className="p-3.5 rounded-2xl bg-[#F3F6FB] border border-[#E2EAF4] space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[#182542] block tracking-wide">
                  Katılım Finans İlkeleri Değerlendirmesi:
                </span>
                <p className="text-xs text-[#5B6E8C] leading-relaxed font-medium">
                  {item.complianceReason}
                </p>
              </div>

              {/* Alt Bilgi: Konsorsiyum & Fon Kullanımı */}
              <div className="text-[11px] text-[#6E81A0] space-y-1 pt-1 border-t border-[#EEF3F9] font-medium">
                <div>
                  <strong className="text-[#182542]">Konsorsiyum Lideri:</strong> {item.consortiumLead}
                </div>
                <div>
                  <strong className="text-[#182542]">Fon Kullanımı:</strong> {item.fundUsage}
                </div>
                <div>
                  <strong className="text-[#182542]">T1 - T2 Bakiye:</strong>{" "}
                  {item.t1t2Available ? (
                    <span className="text-[#0D9F6E] font-bold">Kullanılabilir</span>
                  ) : (
                    <span className="text-[#E11D48] font-bold">Kullanılamaz</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
