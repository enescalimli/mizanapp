"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calculator,
  Plus,
  Trash2,
  ShieldCheck,
  Coins,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  formatTRY,
  formatPercent,
  toDecimal,
  Decimal,
  calculateDaysHeld,
} from "@/lib/decimal/decimal";
import { SAMPLE_COMPANIES_SUMMARY, DETAILED_COMPANIES_DATABASE } from "@/lib/data/sampleCompanies";

interface PortfolioPosition {
  id: string;
  ticker: string;
  lots: string;
  purchaseDate: string;
  receivedDividendTRY: string;
  method: "holding" | "dividend";
}

export default function PortfolioPurificationPage() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([
    {
      id: "pos-1",
      ticker: "BIMAS",
      lots: "500",
      purchaseDate: "2026-04-15",
      receivedDividendTRY: "12500",
      method: "holding",
    },
    {
      id: "pos-2",
      ticker: "THYAO",
      lots: "1000",
      purchaseDate: "2026-08-01",
      receivedDividendTRY: "0",
      method: "holding",
    },
    {
      id: "pos-3",
      ticker: "ASELS",
      lots: "2500",
      purchaseDate: "2026-06-10",
      receivedDividendTRY: "3750",
      method: "dividend",
    },
  ]);

  const [zakatIntent, setZakatIntent] = useState<"trading" | "long_term">("long_term");
  const [useCeilingRounding, setUseCeilingRounding] = useState<boolean>(true);
  const [selectedAddTicker, setSelectedAddTicker] = useState<string>("TUPRS");

  // Calculate detailed figures for each position using Decimal.js
  const analyzedPositions = useMemo(() => {
    return positions.map((pos) => {
      const summary = SAMPLE_COMPANIES_SUMMARY.find((c) => c.ticker === pos.ticker);
      const detail = DETAILED_COMPANIES_DATABASE[pos.ticker];

      const price = toDecimal(summary?.priceTRY || "100.00");
      const lots = toDecimal(pos.lots || "0");
      const marketValue = lots.times(price);

      // Purification calculation
      const impureQuarter = toDecimal(detail?.purificationMetrics.impureIncomeIsolatedQuarterTRY || "1000000");
      const totalShares = toDecimal(detail?.purificationMetrics.totalSharesOutstanding || "10000000");
      const pShareQuarter = impureQuarter.dividedBy(totalShares);
      const divPurificationRatio = toDecimal(detail?.purificationMetrics.dividendPurificationRatio || "0.01");

      // Automatically calculate days held from purchaseDate
      const { totalDaysHeld, daysHeldInQuarter, formattedPurchaseDate } =
        calculateDaysHeld(pos.purchaseDate || "2026-06-01");

      let rawPurification = new Decimal(0);

      if (pos.method === "holding") {
        const factor = toDecimal(daysHeldInQuarter).dividedBy(90);
        rawPurification = pShareQuarter.times(lots).times(factor);
      } else {
        const divAmount = toDecimal(pos.receivedDividendTRY || "0");
        rawPurification = divAmount.times(divPurificationRatio);
      }

      const roundingMode = useCeilingRounding ? Decimal.ROUND_CEIL : Decimal.ROUND_HALF_UP;
      const payablePurification = rawPurification.toDecimalPlaces(2, roundingMode);

      // Zakat calculation
      let zakatBaseTRY = new Decimal(0);
      if (zakatIntent === "trading") {
        zakatBaseTRY = marketValue;
      } else {
        const zatablePerShare = toDecimal(detail?.purificationMetrics.zatableNetCurrentAssetsPerShareTRY || "10.00");
        zakatBaseTRY = lots.times(zatablePerShare);
      }
      const zakatPayable = zakatBaseTRY.times("0.025").toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      return {
        ...pos,
        totalDaysHeld,
        daysHeldInQuarter,
        formattedPurchaseDate,
        summary,
        detail,
        price,
        lotsDec: lots,
        marketValue,
        pShareQuarter,
        divPurificationRatio,
        payablePurification,
        zakatBaseTRY,
        zakatPayable,
      };
    });
  }, [positions, zakatIntent, useCeilingRounding]);

  // Aggregate Portfolio Totals
  const portfolioTotals = useMemo(() => {
    let totalMarketValue = new Decimal(0);
    let totalPurification = new Decimal(0);
    let totalZakat = new Decimal(0);

    for (const item of analyzedPositions) {
      totalMarketValue = totalMarketValue.plus(item.marketValue);
      totalPurification = totalPurification.plus(item.payablePurification);
      totalZakat = totalZakat.plus(item.zakatPayable);
    }

    const purificationRatioOfPortfolio = totalMarketValue.isZero()
      ? new Decimal(0)
      : totalPurification.dividedBy(totalMarketValue).times(100);

    return {
      totalMarketValue,
      totalPurification,
      totalZakat,
      purificationRatioOfPortfolio,
    };
  }, [analyzedPositions]);

  const addPosition = () => {
    const newPos: PortfolioPosition = {
      id: `pos-${Date.now()}`,
      ticker: selectedAddTicker,
      lots: "100",
      purchaseDate: "2026-08-01",
      receivedDividendTRY: "1000",
      method: "holding",
    };
    setPositions([...positions, newPos]);
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  const updatePosition = (id: string, field: keyof PortfolioPosition, value: any) => {
    setPositions(
      positions.map((p) => {
        if (p.id === id) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  return (
    <div className="min-h-screen text-[#273869] pb-28">
      {/* Apple Design Header */}
      <section className="pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="apple-glass-card p-6 sm:p-8 relative overflow-hidden space-y-6">
            {/* Top Brand Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#273869]/10 pb-5">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-orbix-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform">
                  <Image
                    src="/brand/logo.svg"
                    alt="Mizan Logo"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-tight text-[#273869]">
                      MİZAN
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#273869] text-white tracking-widest uppercase">
                      ARINDIRMA
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6E81A0] font-medium block">
                    Zero-Float Kuruş Hassasiyetli Fıkhi Arındırma
                  </span>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#0D8B52] text-xs font-extrabold">
                  <ShieldCheck size={14} />
                  <span>TKBB &amp; AAOIFI No. 21 Uyumlu</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-full bg-white/80 border border-[#E2E8F0] hover:bg-white text-xs font-bold text-[#273869] flex items-center gap-1.5 shadow-2xs backdrop-blur-md transition"
                >
                  <Download size={14} />
                  <span>PDF / Yazdır</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#273869] tracking-tight">
                Arındırma (Taharet) &amp; <span className="font-orbix-serif italic text-[#405881]">Hisse Zekâtı</span> Merkezi
              </h1>
              <p className="text-sm text-[#6E81A0] max-w-3xl leading-relaxed font-medium">
                Katılım hassasiyeti taşıyan yatırımcılar için portföydeki hisselerin
                uygunsuz faiz ve şüpheli gelirlerini kuruşu kuruşuna (<span className="text-[#0D8B52] font-bold">Zero-Float Precision</span>)
                arındırın ve niyetinize göre hisse senedi zekâtınızı kesin tutarlarla hesaplayın.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-8 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="orbix-card p-5 bg-white border border-[#E2E8F0]">
          <span className="text-[10px] font-bold text-[#6E81A0] uppercase tracking-wider block mb-2">
            TOPLAM PORTFÖY DEĞERİ
          </span>
          <div className="text-3xl font-extrabold text-[#273869] tracking-tight font-mono tabular-nums">
            {formatTRY(portfolioTotals.totalMarketValue, 2)}
          </div>
          <p className="text-[11px] text-[#6E81A0] mt-2 font-normal">
            {positions.length} hisse pozisyonu
          </p>
        </div>

        <div className="orbix-card p-5 bg-white border border-[#E2E8F0]">
          <span className="text-[10px] font-bold text-[#405881] uppercase tracking-wider block mb-2">
            ÖDENECEK TOPLAM ARINDIRMA
          </span>
          <div className="text-3xl font-extrabold text-[#273869] tracking-tight font-mono tabular-nums">
            {formatTRY(portfolioTotals.totalPurification, 2)}
          </div>
          <p className="text-[11px] text-[#6E81A0] mt-2 font-normal">
            Portföyün %{portfolioTotals.purificationRatioOfPortfolio.toFixed(4)} kadarı
          </p>
        </div>

        <div className="orbix-card p-5 bg-white border border-[#E2E8F0]">
          <span className="text-[10px] font-bold text-[#0D8B52] uppercase tracking-wider block mb-2">
            HİSSE ZEKATI TUTARI (%2.5)
          </span>
          <div className="text-3xl font-extrabold text-[#0D8B52] tracking-tight font-mono tabular-nums">
            {formatTRY(portfolioTotals.totalZakat, 2)}
          </div>
          <p className="text-[11px] text-[#6E81A0] mt-2 font-normal">
            {zakatIntent === "trading" ? "Ticari Al-Sat Matrahı" : "Dönen Varlıklar Matrahı"}
          </p>
        </div>

        <div className="orbix-card p-5 bg-white border border-[#E2E8F0]">
          <span className="text-[10px] font-bold text-[#6E81A0] uppercase tracking-wider block mb-2">
            FIKHİ İHTİYAT &amp; YUVARLAMA
          </span>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#273869]">
                {useCeilingRounding ? "Tavan Yuvarlama" : "Standart"}
              </span>
              <p className="text-[11px] text-[#6E81A0] font-normal">
                {useCeilingRounding ? "Kuruşlar yukarı tamamlanır" : "En yakın kuruşa"}
              </p>
            </div>
            <button
              onClick={() => setUseCeilingRounding(!useCeilingRounding)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                useCeilingRounding
                  ? "bg-[#273869] text-white border-[#273869]"
                  : "bg-white text-[#6E81A0] border-[#E2E8F0]"
              }`}
            >
              {useCeilingRounding ? "Aktif" : "Pasif"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Portfolio Table & Management */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-700" size={17} />
              <span>Portföy Pozisyonları ve Arındırma Dağılımı</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Alış tarihi ile otomatik gün hesabı, pay adedi ve tercih edilen arındırma usulü.
            </p>
          </div>

          {/* Add Stock Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedAddTicker}
              onChange={(e) => setSelectedAddTicker(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              {SAMPLE_COMPANIES_SUMMARY.map((c) => (
                <option key={c.ticker} value={c.ticker}>
                  {c.ticker} - {c.name.split(" ")[0]} ({c.sector})
                </option>
              ))}
            </select>
            <button
              onClick={addPosition}
              className="apple-btn-primary text-xs py-2 px-3"
            >
              <Plus size={13} />
              <span>Hisse Ekle</span>
            </button>
          </div>
        </div>

        {/* Positions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                <th className="py-3.5 px-5">Hisse Senedi</th>
                <th className="py-3.5 px-4">Yöntem</th>
                <th className="py-3.5 px-4">Lot Adedi</th>
                <th className="py-3.5 px-4">Süre / Temettü</th>
                <th className="py-3.5 px-4">Piyasa Değeri</th>
                <th className="py-3.5 px-4 text-amber-700">Arındırma Borcu</th>
                <th className="py-3.5 px-4 text-emerald-700">Hisse Zekatı (%2.5)</th>
                <th className="py-3.5 px-5 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {analyzedPositions.map((pos) => (
                <tr key={pos.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/companies/${pos.ticker}`}
                        className="font-bold text-slate-900 hover:text-emerald-700 transition font-mono"
                      >
                        {pos.ticker}
                      </Link>
                      <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {pos.summary?.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono tabular-nums">
                      Fiyat: {formatTRY(pos.price, 2)} • Çeyreklik: {formatTRY(pos.pShareQuarter, 4)} / pay
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="apple-segmented-group text-[10px]">
                      <button
                        onClick={() => updatePosition(pos.id, "method", "holding")}
                        className={`apple-segmented-item ${
                          pos.method === "holding" ? "active text-emerald-700" : ""
                        }`}
                      >
                        Gün Bazlı
                      </button>
                      <button
                        onClick={() => updatePosition(pos.id, "method", "dividend")}
                        className={`apple-segmented-item ${
                          pos.method === "dividend" ? "active text-emerald-700" : ""
                        }`}
                      >
                        Temettü
                      </button>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={pos.lots}
                      onChange={(e) => updatePosition(pos.id, "lots", e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-mono tabular-nums focus:outline-none focus:border-emerald-500"
                      min="1"
                    />
                  </td>

                  <td className="py-4 px-4">
                    {pos.method === "holding" ? (
                      <div className="space-y-1">
                        <input
                          type="date"
                          value={pos.purchaseDate}
                          onChange={(e) =>
                            updatePosition(pos.id, "purchaseDate", e.target.value)
                          }
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-mono tabular-nums focus:outline-none focus:border-emerald-500"
                        />
                        <div className="text-[10px] text-emerald-700 font-mono tabular-nums font-semibold">
                          {pos.totalDaysHeld} Gün ({pos.daysHeldInQuarter}/90 Pro-Rata)
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={pos.receivedDividendTRY}
                            onChange={(e) =>
                              updatePosition(pos.id, "receivedDividendTRY", e.target.value)
                            }
                            className="w-24 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-mono tabular-nums focus:outline-none focus:border-emerald-500"
                            placeholder="Temettü TRY"
                          />
                          <span className="text-slate-400 font-mono">₺</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                          Oran: {formatPercent(pos.divPurificationRatio, 2)}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 font-mono tabular-nums font-semibold text-slate-900">
                    {formatTRY(pos.marketValue, 2)}
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm font-bold text-amber-700 font-mono tabular-nums">
                      {formatTRY(pos.payablePurification, 2)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {pos.method === "holding" ? "Kâr payı arındırması" : "Temettü arındırması"}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                      {formatTRY(pos.zakatPayable, 2)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                      Matrah: {formatTRY(pos.zakatBaseTRY, 0)}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-center">
                    <button
                      onClick={() => removePosition(pos.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Pozisyonu Kaldır"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {analyzedPositions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-normal">
                    Henüz portföy pozisyonu eklenmedi. Yukarıdaki açılır kutudan hisse ekleyebilirsiniz.
                  </td>
                </tr>
              )}
            </tbody>
            {analyzedPositions.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                  <td colSpan={4} className="py-4 px-5 text-slate-700 uppercase tracking-wider">
                    Genel Portföy Toplamı
                  </td>
                  <td className="py-4 px-4 text-slate-900 font-mono tabular-nums">
                    {formatTRY(portfolioTotals.totalMarketValue, 2)}
                  </td>
                  <td className="py-4 px-4 text-amber-700 text-base font-mono tabular-nums">
                    {formatTRY(portfolioTotals.totalPurification, 2)}
                  </td>
                  <td className="py-4 px-4 text-emerald-700 text-base font-mono tabular-nums">
                    {formatTRY(portfolioTotals.totalZakat, 2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Zakat Intent & Jurisprudence Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zakat Strategy Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="text-emerald-700" size={18} />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Hisse Senedi Zekatı Hesaplama Yöntemi (Niyet Modeli)
            </h3>
          </div>

          <div className="space-y-3">
            <label
              onClick={() => setZakatIntent("long_term")}
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                zakatIntent === "long_term"
                  ? "bg-emerald-50/50 border-emerald-300 text-slate-900"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="zakatIntent"
                checked={zakatIntent === "long_term"}
                onChange={() => setZakatIntent("long_term")}
                className="mt-1 accent-emerald-600"
              />
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900">
                  Uzun Vadeli Temettü &amp; Ortaklık Yatırımı (Tavsiye Edilen)
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Şirketin bina, fabrika, makine gibi zekata tabi olmayan duran varlıkları hariç tutulur.
                  Yalnızca şirketin <strong>Zekata Tabi Dönen Varlıkları (Nakit, Ticari Alacak, Stoklar - Kısa Vadeli Borçlar)</strong> üzerinden %2,5 zekat hesaplanır.
                </p>
              </div>
            </label>

            <label
              onClick={() => setZakatIntent("trading")}
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                zakatIntent === "trading"
                  ? "bg-emerald-50/50 border-emerald-300 text-slate-900"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="zakatIntent"
                checked={zakatIntent === "trading"}
                onChange={() => setZakatIntent("trading")}
                className="mt-1 accent-emerald-600"
              />
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900">
                  Kısa Vadeli Al-Sat / Ticari Emtia Niyeti
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Hisseleri kâr payı için değil, fiyat artışından yararlanıp satmak üzere alan yatırımcılar için.
                  Hisseler ticaret malı hükmünde kabul edilir ve <strong>Cari Piyasa Değeri (Portföy Tutarı)</strong> üzerinden %2,5 oranında tam zekat tahakkuk eder.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Fıkhi Arındırma Hükümleri Rehberi */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="text-emerald-700" size={18} />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Fıkhi Arındırma (Purification / Taharet) Esasları
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-normal">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-amber-800 block mb-1">1. Arındırma Bedeli Zekat Yerine Geçmez:</strong>
              Arındırılması gereken faiz veya gayrimeşru gelir, hissedarın mülkü olmayan şüpheli bir fondur.
              Bu sebeple bu tutar doğrudan hayır kurumlarına, kamu yararına veya yoksullara infak edilmeli; zekat borcundan düşülmemelidir.
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-emerald-800 block mb-1">2. Şahsi Menfaat İçin Kullanılamaz:</strong>
              Arındırma bedeli vergi, ceza veya harç gibi şahsi mükellefiyetleri ödemek için harcanamaz.
              MizanApp, şüphelerden kaçınmak adına kuruş küsuratlarını Şer'i ihtiyat kuralı (Ceiling Rounding) gereği bir üst tam kuruşa tamamlar.
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-800 block mb-1">3. Dönem Gün Sayısı (Pro-Rata Kuralı):</strong>
              Hisseler çeyrek yıl içinde 90 gün boyunca elde tutulmadıysa, hissedar yalnızca hisseyi elinde bulundurduğu gün oranında (Örn: 45 gün ise %50) arındırma öder.
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
