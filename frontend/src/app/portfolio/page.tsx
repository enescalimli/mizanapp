"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
  AlertTriangle,
  RefreshCw,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import {
  PortfolioHoldingItem,
  ScreeningStandardCode,
  ZakatIntentionType,
} from "@/types/katilim";
import {
  SAMPLE_COMPANIES_SUMMARY,
  DETAILED_COMPANIES_DATABASE,
  evaluateCompanyStatusForStandard,
  getCompanySummary,
} from "@/lib/data/sampleCompanies";
import {
  Decimal,
  toDecimal,
  formatTRY,
  calculateDaysHeld,
  calculateHoldingPurificationClient,
  calculateZakatForPositionClient,
} from "@/lib/decimal/decimal";

export default function PortfolioManagementPage() {
  const [standard, setStandard] =
    useState<ScreeningStandardCode>("BIST_KATILIM_DIB");
  const [useCeilingRounding, setUseCeilingRounding] = useState<boolean>(true);

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

  // Portföy Pozisyonları
  const [holdings, setHoldings] = useState<PortfolioHoldingItem[]>([
    {
      id: "h-1",
      ticker: "BIMAS",
      lots: "300",
      avgCostTRY: "420.00",
      purchaseDate: "2024-05-15",
      purificationMethod: "holding",
      zakatIntent: "LONG_TERM_DIVIDEND",
    },
    {
      id: "h-2",
      ticker: "ASELS",
      lots: "1500",
      avgCostTRY: "58.00",
      purchaseDate: "2024-06-20",
      purificationMethod: "holding",
      zakatIntent: "LONG_TERM_DIVIDEND",
    },
    {
      id: "h-3",
      ticker: "FROTO",
      lots: "80",
      avgCostTRY: "910.00",
      purchaseDate: "2024-07-10",
      purificationMethod: "holding",
      zakatIntent: "LONG_TERM_DIVIDEND",
    },
    {
      id: "h-4",
      ticker: "THYAO",
      lots: "250",
      avgCostTRY: "290.00",
      purchaseDate: "2024-08-01",
      purificationMethod: "holding",
      zakatIntent: "TRADING_SHORT_TERM",
    },
  ]);

  // Yeni Pozisyon Formu
  const [newTicker, setNewTicker] = useState<string>("TUPRS");
  const [newLots, setNewLots] = useState<string>("100");
  const [newAvgCost, setNewAvgCost] = useState<string>("174.50");
  const [newPurchaseDate, setNewPurchaseDate] = useState<string>("2024-08-15");
  const [newZakatIntent, setNewZakatIntent] =
    useState<ZakatIntentionType>("LONG_TERM_DIVIDEND");

  const handleSelectNewTicker = (ticker: string) => {
    setNewTicker(ticker);
    const live = livePrices[ticker] || getCompanySummary(ticker)?.priceTRY;
    if (live) setNewAvgCost(live);
  };

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    const lotsDec = toDecimal(newLots);
    if (lotsDec.lte(0)) return;

    const item: PortfolioHoldingItem = {
      id: `h-${Date.now()}`,
      ticker: newTicker.toUpperCase(),
      lots: lotsDec.toString(),
      avgCostTRY: toDecimal(newAvgCost || "100").toFixed(2),
      purchaseDate: newPurchaseDate || "2024-08-15",
      purificationMethod: "holding",
      zakatIntent: newZakatIntent,
    };

    setHoldings((prev) => [...prev, item]);
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  // Portföy Analiz Hesaplamaları
  const portfolioAnalysis = useMemo(() => {
    let totalMarketValue = new Decimal(0);
    let totalCostBasis = new Decimal(0);
    let compliantMarketValue = new Decimal(0);
    let totalExitPurificationPayable = new Decimal(0);
    let totalZakatPayable = new Decimal(0);

    const rows = holdings.map((h) => {
      const summary = getCompanySummary(h.ticker) || {
        ticker: h.ticker,
        name: h.ticker,
        sector: "Diğer",
        bistStatus: "COMPLIANT",
        aaoifiStatus: "COMPLIANT",
        priceTRY: "100.00",
        change24h: "%0.00",
        debtRatioPercent: 15,
        cashRatioPercent: 10,
        impureIncomePercent: 1.5,
        purificationPerShareTRY: "0.05",
        lastScreeningDate: "2024-06-30",
        zatableNetAssetsPerShareTRY: "25.00",
      };

      const detail =
        DETAILED_COMPANIES_DATABASE[h.ticker] ||
        DETAILED_COMPANIES_DATABASE["BIMAS"];

      const livePriceStr = livePrices[h.ticker] || summary.priceTRY;
      const livePrice = toDecimal(livePriceStr);
      const lotsDec = toDecimal(h.lots);
      const avgCostDec = toDecimal(h.avgCostTRY);

      const marketValue = lotsDec.times(livePrice);
      const costValue = lotsDec.times(avgCostDec);
      const pnlTRY = marketValue.minus(costValue);
      const pnlPercent = costValue.gt(0)
        ? pnlTRY.dividedBy(costValue).times(100)
        : new Decimal(0);

      totalMarketValue = totalMarketValue.plus(marketValue);
      totalCostBasis = totalCostBasis.plus(costValue);

      const evalResult = evaluateCompanyStatusForStandard(summary, standard);
      const isCompliant = evalResult.status === "COMPLIANT";
      if (isCompliant) {
        compliantMarketValue = compliantMarketValue.plus(marketValue);
      }

      const { totalDaysHeld, daysHeldInQuarter, formattedPurchaseDate } =
        calculateDaysHeld(h.purchaseDate);

      const purif = calculateHoldingPurificationClient(
        detail.purificationMetrics.impureIncomeIsolatedQuarterTRY,
        detail.purificationMetrics.totalSharesOutstanding,
        lotsDec,
        daysHeldInQuarter,
        90,
        useCeilingRounding
      );

      totalExitPurificationPayable = totalExitPurificationPayable.plus(
        purif.totalPurificationPayable
      );

      const zatablePerShare =
        detail.purificationMetrics.zatableNetCurrentAssetsPerShareTRY ||
        summary.zatableNetAssetsPerShareTRY ||
        "0";

      const zakatCalc = calculateZakatForPositionClient({
        quantityLots: lotsDec,
        currentPriceTRY: livePrice,
        zatableNetAssetsPerShareTRY: zatablePerShare,
        intent: h.zakatIntent,
      });

      totalZakatPayable = totalZakatPayable.plus(zakatCalc.zakatPayableTRY);

      return {
        ...h,
        summary,
        detail,
        livePrice,
        lotsDec,
        avgCostDec,
        marketValue,
        costValue,
        pnlTRY,
        pnlPercent,
        totalDaysHeld,
        daysHeldInQuarter,
        formattedPurchaseDate,
        isCompliant,
        purificationPerShare: purif.purificationPerShare,
        exitPurificationPayable: purif.totalPurificationPayable,
        zakatPayableTRY: zakatCalc.zakatPayableTRY,
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
    };
  }, [holdings, livePrices, standard, useCeilingRounding]);

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-[#182542] pb-24">
      {/* ===================================================================== */}
      {/* 1. PAYNO SKY-MIST PORTFÖY HERO                                        */}
      {/* ===================================================================== */}
      <section className="payno-sky-hero p-8 sm:p-12 border-b border-white/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white text-xs font-bold text-[#182542] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#0D9F6E] animate-pulse" />
              <span>Canlı BIST Fiyat Akışı ({lastTickTime})</span>
              <button
                type="button"
                onClick={tickLivePrices}
                className="hover:text-[#2E6CF6] text-[#6E81A0] transition p-0.5"
                title="Fiyatları Yenile"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#182542] tracking-tight">
              Katılım Portföy &amp; Cüzdan
            </h1>

            <p className="text-xs sm:text-sm text-[#6E81A0] font-medium leading-relaxed">
              Hisselerinizin anlık fıkhi katılım uygunluğu, takvim günü bazlı şüpheli kazanç arındırması ve hisse zekâtı.
            </p>
          </div>

          {/* Standart Seçici */}
          <div className="apple-segmented-group shrink-0">
            <button
              type="button"
              onClick={() => setStandard("BIST_KATILIM_DIB")}
              className={`apple-segmented-item ${
                standard === "BIST_KATILIM_DIB" ? "active" : ""
              }`}
            >
              BIST Katılım (&lt;%33)
            </button>
            <button
              type="button"
              onClick={() => setStandard("AAOIFI_STD_21")}
              className={`apple-segmented-item ${
                standard === "AAOIFI_STD_21" ? "active" : ""
              }`}
            >
              AAOIFI No.21 (&lt;%30)
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. 4'LÜ SADELEŞTİRİLMİŞ PAYNO PORTFÖY KPI KARTLARI                     */}
      {/* ===================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Portföy Değeri */}
          <div className="payno-card p-6 space-y-2">
            <span className="text-xs font-bold text-[#6E81A0] uppercase tracking-wider block">
              Portföy Canlı Değeri
            </span>
            <div className="text-3xl font-black text-[#182542] font-mono tracking-tight">
              {formatTRY(portfolioAnalysis.totalMarketValue, 2)}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
              <span
                className={`inline-flex items-center gap-0.5 ${
                  portfolioAnalysis.totalPnlTRY.gte(0)
                    ? "text-[#0D9F6E]"
                    : "text-[#E11D48]"
                }`}
              >
                {portfolioAnalysis.totalPnlTRY.gte(0) ? (
                  <ArrowUpRight size={13} />
                ) : (
                  <ArrowDownRight size={13} />
                )}
                {portfolioAnalysis.totalPnlTRY.gte(0) ? "+" : ""}
                {formatTRY(portfolioAnalysis.totalPnlTRY, 2)} (
                {portfolioAnalysis.totalPnlPercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* 2. Katılım Uygunluk Ağırlığı */}
          <div className="payno-card p-6 space-y-2">
            <span className="text-xs font-bold text-[#6E81A0] uppercase tracking-wider block">
              Katılım Uygunluk Oranı
            </span>
            <div className="text-3xl font-black text-[#0D9F6E] font-mono tracking-tight">
              %{portfolioAnalysis.halalWeightPercent.toFixed(1)}
            </div>
            <span className="text-xs font-bold text-[#0D9F6E] block">
              {portfolioAnalysis.halalWeightPercent.eq(100)
                ? "✓ Portföyün Tamamı Katılıma Uygun"
                : "⚠️ Bazı Hisseler Kapsam Dışı"}
            </span>
          </div>

          {/* 3. Satış Anı Arındırma Bedeli */}
          <div className="payno-card p-6 space-y-2">
            <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider block">
              Satış Anı Arındırma
            </span>
            <div className="text-3xl font-black text-[#B45309] font-mono tracking-tight">
              {formatTRY(portfolioAnalysis.totalExitPurificationPayable, 2)}
            </div>
            <p className="text-[11px] text-[#6E81A0] font-medium">
              Bugün satılırsa infak edilecek net şüpheli kazanç
            </p>
          </div>

          {/* 4. Hisse Senedi Zekâtı */}
          <div className="payno-card p-6 space-y-2">
            <span className="text-xs font-bold text-[#2E6CF6] uppercase tracking-wider block">
              Hisse Zekâtı (%2,5)
            </span>
            <div className="text-3xl font-black text-[#2E6CF6] font-mono tracking-tight">
              {formatTRY(portfolioAnalysis.totalZakatPayable, 2)}
            </div>
            <p className="text-[11px] text-[#6E81A0] font-medium">
              Al-Sat &amp; Temettü niyetine göre zekata tabi varlık
            </p>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. YENİ HİSSE / POZİSYON EKLEME ÇUBUĞU                                */}
        {/* ===================================================================== */}
        <div className="payno-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
            <h3 className="text-sm font-bold text-[#182542] flex items-center gap-2">
              <Plus size={16} className="text-[#2E6CF6]" />
              <span>Portföye Yeni Hisse Ekle</span>
            </h3>
            <span className="text-xs text-[#6E81A0] font-medium">
              626 BIST hissesi arasından seçin
            </span>
          </div>

          <form
            onSubmit={handleAddHolding}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
          >
            {/* 1. Hisse Kodu */}
            <div>
              <label className="text-[11px] font-bold text-[#182542] block mb-1">
                Hisse Kodu
              </label>
              <select
                value={newTicker}
                onChange={(e) => handleSelectNewTicker(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-bold text-[#182542] focus:outline-none focus:bg-white"
              >
                {SAMPLE_COMPANIES_SUMMARY.map((c) => (
                  <option key={c.ticker} value={c.ticker}>
                    {c.ticker} — {c.name.slice(0, 24)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Lot Adedi */}
            <div>
              <label className="text-[11px] font-bold text-[#182542] block mb-1">
                Lot Adedi
              </label>
              <input
                type="number"
                min="1"
                value={newLots}
                onChange={(e) => setNewLots(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-mono font-bold text-[#182542] focus:outline-none focus:bg-white"
              />
            </div>

            {/* 3. Alış Maliyeti */}
            <div>
              <label className="text-[11px] font-bold text-[#182542] block mb-1">
                Ort. Maliyet (₺)
              </label>
              <input
                type="number"
                step="0.01"
                value={newAvgCost}
                onChange={(e) => setNewAvgCost(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-mono font-bold text-[#182542] focus:outline-none focus:bg-white"
              />
            </div>

            {/* 4. Alış Tarihi */}
            <div>
              <label className="text-[11px] font-bold text-[#182542] block mb-1">
                Alış Tarihi
              </label>
              <input
                type="date"
                value={newPurchaseDate}
                onChange={(e) => setNewPurchaseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-mono font-bold text-[#182542] focus:outline-none focus:bg-white"
              />
            </div>

            {/* 5. Zekât Niyeti */}
            <div>
              <label className="text-[11px] font-bold text-[#182542] block mb-1">
                Zekât Niyeti
              </label>
              <select
                value={newZakatIntent}
                onChange={(e) =>
                  setNewZakatIntent(e.target.value as ZakatIntentionType)
                }
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6FB] border border-[#DCE5F2] text-xs font-bold text-[#182542] focus:outline-none focus:bg-white"
              >
                <option value="LONG_TERM_DIVIDEND">Uzun Vade (Temettü)</option>
                <option value="TRADING_SHORT_TERM">Kısa Vade (Al-Sat)</option>
              </select>
            </div>

            {/* Buton */}
            <div>
              <button
                type="submit"
                className="w-full payno-btn-primary text-xs py-2.5"
              >
                <Plus size={14} />
                <span>Portföye Ekle</span>
              </button>
            </div>
          </form>
        </div>

        {/* ===================================================================== */}
        {/* 4. TÜM SAYFA PORTFÖY VARLIK TABLOSU                                  */}
        {/* ===================================================================== */}
        <div className="payno-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-4">
            <div>
              <h2 className="text-xl font-black text-[#182542] tracking-tight flex items-center gap-2">
                <Briefcase size={18} className="text-[#2E6CF6]" />
                <span>Portföy Pozisyonları ({holdings.length} Hisse)</span>
              </h2>
              <p className="text-xs text-[#6E81A0] mt-1 font-medium">
                Alış tarihi ile otomatik gün hesabı, canlı BIST fiyatları ve anlık satış arındırma bedeli.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6E81A0]">Şer&apos;i Yuvarlama:</span>
              <button
                type="button"
                onClick={() => setUseCeilingRounding(!useCeilingRounding)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                  useCeilingRounding
                    ? "bg-[#182542] text-white border-[#182542]"
                    : "bg-white text-[#6E81A0] border-[#DCE5F2]"
                }`}
              >
                {useCeilingRounding ? "Tavan (İhtiyat)" : "Standart"}
              </button>
            </div>
          </div>

          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6ECF5] text-[11px] font-bold uppercase tracking-wider text-[#6E81A0]">
                  <th className="py-3.5 pr-4">Hisse Senedi</th>
                  <th className="py-3.5 px-3 text-center">Katılım Durumu</th>
                  <th className="py-3.5 px-3">Lot &amp; Maliyet</th>
                  <th className="py-3.5 px-3 text-right">Canlı Değer</th>
                  <th className="py-3.5 px-3 text-right">Kâr / Zarar</th>
                  <th className="py-3.5 px-3">Süre (Pro-Rata)</th>
                  <th className="py-3.5 px-3 text-right text-[#B45309]">Satış Arındırma</th>
                  <th className="py-3.5 pl-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F9] text-xs font-normal">
                {portfolioAnalysis.rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F8FAFD] transition-colors"
                  >
                    {/* Hisse & Sektör */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                            row.isCompliant
                              ? "bg-[#E6F8EF] border-[#BCEBD2] text-[#0D9F6E]"
                              : "bg-[#FEECEB] border-[#FAC9C6] text-[#E11D48]"
                          }`}
                        >
                          {row.ticker}
                        </div>
                        <div>
                          <Link
                            href={`/companies/${row.ticker}`}
                            className="font-bold text-[#182542] hover:text-[#2E6CF6] font-mono text-sm block"
                          >
                            {row.ticker}
                          </Link>
                          <span className="text-[11px] text-[#6E81A0] truncate max-w-[150px] block font-medium">
                            {row.summary.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Katılım Durumu */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      {row.isCompliant ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full payno-badge-mint text-[11px] font-bold">
                          <CheckCircle2 size={12} />
                          <span>Katılım Uygun</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full payno-badge-coral text-[11px] font-bold">
                          <XCircle size={12} />
                          <span>Kapsam Dışı</span>
                        </span>
                      )}
                    </td>

                    {/* Lot & Maliyet */}
                    <td className="py-4 px-3 whitespace-nowrap font-mono">
                      <span className="font-bold text-[#182542]">
                        {row.lots} Lot
                      </span>
                      <span className="block text-[11px] text-[#7B8FA8]">
                        Maliyet: ₺{row.avgCostTRY}
                      </span>
                    </td>

                    {/* Canlı Piyasa Değeri */}
                    <td className="py-4 px-3 text-right whitespace-nowrap font-mono">
                      <span className="font-bold text-sm text-[#182542]">
                        {formatTRY(row.marketValue, 2)}
                      </span>
                      <span className="block text-[11px] text-[#7B8FA8]">
                        Fiyat: {formatTRY(row.livePrice, 2)}
                      </span>
                    </td>

                    {/* Kâr / Zarar */}
                    <td className="py-4 px-3 text-right whitespace-nowrap font-mono">
                      <span
                        className={`font-bold ${
                          row.pnlTRY.gte(0) ? "text-[#0D9F6E]" : "text-[#E11D48]"
                        }`}
                      >
                        {row.pnlTRY.gte(0) ? "+" : ""}
                        {formatTRY(row.pnlTRY, 2)}
                      </span>
                      <span
                        className={`block text-[11px] ${
                          row.pnlTRY.gte(0) ? "text-[#0D9F6E]" : "text-[#E11D48]"
                        }`}
                      >
                        ({row.pnlTRY.gte(0) ? "+" : ""}
                        {row.pnlPercent.toFixed(1)}%)
                      </span>
                    </td>

                    {/* Süre & Pro-Rata */}
                    <td className="py-4 px-3 whitespace-nowrap font-mono text-[11px]">
                      <span className="font-semibold text-[#182542]">
                        {row.totalDaysHeld} Gün
                      </span>
                      <span className="block text-[#0D9F6E] font-medium">
                        {row.daysHeldInQuarter}/90 Pro-Rata
                      </span>
                    </td>

                    {/* Satış Anı Arındırma Tutarı */}
                    <td className="py-4 px-3 text-right whitespace-nowrap font-mono">
                      <span className="font-bold text-sm text-[#B45309]">
                        {formatTRY(row.exitPurificationPayable, 2)}
                      </span>
                      <span className="block text-[10px] text-[#7B8FA8]">
                        {formatTRY(row.purificationPerShare, 4)} /pay
                      </span>
                    </td>

                    {/* İşlem */}
                    <td className="py-4 pl-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleRemoveHolding(row.id)}
                        className="p-1.5 rounded-lg text-[#6E81A0] hover:text-[#E11D48] hover:bg-rose-50 transition"
                        title="Pozisyonu Kaldır"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
