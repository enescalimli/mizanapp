"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Scale,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Coins,
  Info,
} from "lucide-react";
import {
  CalendarBasisType,
  ZakatIntentionType,
} from "@/types/katilim";
import {
  Decimal,
  toDecimal,
  formatTRY,
  calculateZakatForPositionClient,
} from "@/lib/decimal/decimal";

export interface ZakatTrackablePosition {
  id: string;
  ticker: string;
  companyName: string;
  sector: string;
  lots: string;
  currentPriceTRY: string;
  zatableNetAssetsPerShareTRY: string;
  zakatIntent: ZakatIntentionType;
}

interface ZakatTrackerModuleProps {
  positions: ZakatTrackablePosition[];
  onChangePositionIntent?: (id: string, intent: ZakatIntentionType) => void;
  onApplyBulkIntent?: (intent: ZakatIntentionType) => void;
}

export const ZakatTrackerModule: React.FC<ZakatTrackerModuleProps> = ({
  positions,
  onChangePositionIntent,
  onApplyBulkIntent,
}) => {
  const [calendarBasis, setCalendarBasis] =
    useState<CalendarBasisType>("HIJRI_354");
  const [gold85gNisabTRY, setGold85gNisabTRY] = useState<string>("255000");
  const [otherCashAndGoldTRY, setOtherCashAndGoldTRY] = useState<string>("0");

  const breakdown = useMemo(() => {
    let totalTradingBase = new Decimal(0);
    let totalLongTermBase = new Decimal(0);
    let totalPortfolioMarketValue = new Decimal(0);
    let totalStockZakat = new Decimal(0);

    const rows = positions.map((pos) => {
      const calc = calculateZakatForPositionClient({
        quantityLots: pos.lots,
        currentPriceTRY: pos.currentPriceTRY,
        zatableNetAssetsPerShareTRY: pos.zatableNetAssetsPerShareTRY,
        intent: pos.zakatIntent,
        calendarBasis,
      });

      totalPortfolioMarketValue = totalPortfolioMarketValue.plus(
        calc.marketValueTRY
      );
      if (pos.zakatIntent === "TRADING_SHORT_TERM") {
        totalTradingBase = totalTradingBase.plus(calc.zakatBaseTRY);
      } else {
        totalLongTermBase = totalLongTermBase.plus(calc.zakatBaseTRY);
      }
      totalStockZakat = totalStockZakat.plus(calc.zakatPayableTRY);

      return {
        ...pos,
        ...calc,
      };
    });

    const otherWealth = Decimal.max(
      new Decimal(0),
      toDecimal(otherCashAndGoldTRY)
    );
    const rate =
      calendarBasis === "GREGORIAN_365"
        ? new Decimal("0.02577000")
        : new Decimal("0.02500000");

    const otherWealthZakat = otherWealth
      .times(rate)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const grandTotalZakatableBase = totalTradingBase
      .plus(totalLongTermBase)
      .plus(otherWealth);
    const nisabThreshold = Decimal.max(
      new Decimal(0),
      toDecimal(gold85gNisabTRY)
    );
    const isAboveNisab = grandTotalZakatableBase.gte(nisabThreshold);
    const nisabProgressPercent = nisabThreshold.gt(0)
      ? Math.min(
          grandTotalZakatableBase
            .dividedBy(nisabThreshold)
            .times(100)
            .toNumber(),
          100
        )
      : 100;

    const grandTotalZakatPayable = isAboveNisab
      ? totalStockZakat.plus(otherWealthZakat)
      : new Decimal(0);

    return {
      rows,
      totalPortfolioMarketValue,
      totalTradingBase,
      totalLongTermBase,
      otherWealth,
      grandTotalZakatableBase,
      nisabThreshold,
      isAboveNisab,
      nisabProgressPercent,
      totalStockZakat,
      otherWealthZakat,
      grandTotalZakatPayable,
      ratePercentText: calendarBasis === "HIJRI_354" ? "%2,50" : "%2,577",
    };
  }, [positions, calendarBasis, gold85gNisabTRY, otherCashAndGoldTRY]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
      {/* Header & Calendar / Bulk Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>AAOIFI &amp; DİB Uyumlu Hisse Zekatı Motoru</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Zekat Takip ve Hesaplama Modülü ({breakdown.ratePercentText})
          </h3>
          <p className="text-xs text-slate-500 font-normal">
            Portföydeki her hissenin niyetine göre (Ticari Emtia Al-Sat veya Uzun Vadeli Temettü Ortaklığı) kuruşu kuruşuna zekat matrahı.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Calendar Basis Switch */}
          <div className="apple-segmented-group">
            <button
              type="button"
              onClick={() => setCalendarBasis("HIJRI_354")}
              className={`apple-segmented-item ${
                calendarBasis === "HIJRI_354" ? "active text-emerald-700" : ""
              }`}
            >
              Hicri (%2,50)
            </button>
            <button
              type="button"
              onClick={() => setCalendarBasis("GREGORIAN_365")}
              className={`apple-segmented-item ${
                calendarBasis === "GREGORIAN_365" ? "active text-emerald-700" : ""
              }`}
            >
              Miladi (%2,577)
            </button>
          </div>

          {/* Bulk Intention Buttons */}
          {onApplyBulkIntent && (
            <div className="apple-segmented-group">
              <button
                type="button"
                onClick={() => onApplyBulkIntent("LONG_TERM_DIVIDEND")}
                className="apple-segmented-item hover:text-slate-900"
              >
                Tümü Uzun Vadeli
              </button>
              <button
                type="button"
                onClick={() => onApplyBulkIntent("TRADING_SHORT_TERM")}
                className="apple-segmented-item hover:text-slate-900"
              >
                Tümü Al-Sat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary & Nisab Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Nisab Verification Card */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-emerald-700" />
              <span className="text-sm font-bold text-slate-900">
                85 Gram Altın Nisap Kontrolü ve Zekat Matrahı
              </span>
            </div>
            <span
              className={
                breakdown.isAboveNisab
                  ? "badge-apple-emerald"
                  : "badge-apple-amber"
              }
            >
              {breakdown.isAboveNisab ? (
                <>
                  <CheckCircle2 size={12} />
                  <span>Nisap Sınırına Ulaştı (Zekata Tabi)</span>
                </>
              ) : (
                <>
                  <AlertCircle size={12} />
                  <span>Nisap Sınırının Altında</span>
                </>
              )}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">
                Zekata Tabi Matrah:{" "}
                <strong className="text-slate-900 font-mono tabular-nums">
                  {formatTRY(breakdown.grandTotalZakatableBase, 2)}
                </strong>
              </span>
              <span className="text-slate-500">
                85g Altın Nisap Eşiği:{" "}
                <strong className="text-emerald-700 font-mono tabular-nums">
                  {formatTRY(breakdown.nisabThreshold, 2)}
                </strong>
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${breakdown.nisabProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Inputs for Nisab & Additional Cash */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1">
                85g Altın Nisap Tutarı (TRY)
              </label>
              <input
                type="number"
                value={gold85gNisabTRY}
                onChange={(e) => setGold85gNisabTRY(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono tabular-nums focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1">
                Portföy Dışı Nakit / Altın Varlığı (TRY)
              </label>
              <input
                type="number"
                value={otherCashAndGoldTRY}
                onChange={(e) => setOtherCashAndGoldTRY(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono tabular-nums focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Grand Total Zakat Payable Box */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                Net Zekat Yükümlülüğü
              </span>
              <Coins size={16} className="text-emerald-700" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-800 font-mono tabular-nums tracking-tight">
              {formatTRY(breakdown.grandTotalZakatPayable, 2)}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
              {breakdown.isAboveNisab
                ? `${breakdown.ratePercentText} oranında kuruşu kuruşuna hesaplanan toplam hisse zekatı.`
                : "Toplam matrah 85g altın nisabının altında olduğundan zekat farz olmamıştır."}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-emerald-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>Ticari (Al-Sat) Matrahı:</span>
              <span className="font-mono tabular-nums font-semibold">
                {formatTRY(breakdown.totalTradingBase, 2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Uzun Vadeli Dönen Matrah:</span>
              <span className="font-mono tabular-nums font-semibold">
                {formatTRY(breakdown.totalLongTermBase, 2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Position Zakat Breakdown Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              <th className="py-3.5 px-4">Hisse</th>
              <th className="py-3.5 px-4">Lot Adedi</th>
              <th className="py-3.5 px-4">Yatırım Niyeti (Zekat Modeli)</th>
              <th className="py-3.5 px-4">Cari Piyasa Değeri</th>
              <th className="py-3.5 px-4">Pay Başı Dönen Varlık</th>
              <th className="py-3.5 px-4">Zekata Tabi Matrah</th>
              <th className="py-3.5 px-4 text-right text-emerald-700">
                Zekat Tutarı ({breakdown.ratePercentText})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {breakdown.rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 font-mono">{row.ticker}</div>
                  <div className="text-[11px] text-slate-400">
                    {row.companyName}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-slate-800">
                  {row.lots} Lot
                </td>
                <td className="py-3.5 px-4">
                  <div className="apple-segmented-group text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        onChangePositionIntent?.(row.id, "LONG_TERM_DIVIDEND")
                      }
                      className={`apple-segmented-item ${
                        row.zakatIntent === "LONG_TERM_DIVIDEND"
                          ? "active text-emerald-700"
                          : ""
                      }`}
                    >
                      Uzun Vadeli
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangePositionIntent?.(row.id, "TRADING_SHORT_TERM")
                      }
                      className={`apple-segmented-item ${
                        row.zakatIntent === "TRADING_SHORT_TERM"
                          ? "active text-emerald-700"
                          : ""
                      }`}
                    >
                      Ticari (Al-Sat)
                    </button>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono tabular-nums text-slate-800">
                  {formatTRY(row.marketValueTRY, 2)}
                </td>
                <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                  {formatTRY(row.zatableNetAssetsPerShareTRY, 2)} / pay
                </td>
                <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-slate-900">
                  {formatTRY(row.zakatBaseTRY, 2)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                  {formatTRY(row.zakatPayableTRY, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shariah Jurisprudence Footnote */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-500 font-normal">
        <Info size={15} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Fıkhi Metodoloji Notu:</strong>{" "}
          Al-sat (ticari) amacıyla tutulan hisselerde cari piyasa değerinin tamamı (%2,5) zekata tabidir. Uzun vadeli yatırım/temettü ortaklığı niyetinde ise şirketin fabrika, makine ve bina gibi duran varlıkları düşülerek yalnızca{" "}
          <span className="text-emerald-700 font-medium">
            Zekata Tabi Net Dönen Varlıkları (Nakit + Alacaklar + Stoklar - Kısa Vadeli Borçlar)
          </span>{" "}
          matraha dahil edilir.
        </div>
      </div>
    </div>
  );
};
