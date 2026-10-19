"use client";

import React, { useState, useMemo } from "react";
import { formatTRY, toDecimal, Decimal } from "@/lib/decimal/decimal";
import { Calculator, Sparkles, HelpCircle, ArrowRight, Check } from "lucide-react";

interface PurificationCalculatorCardProps {
  ticker: string;
  purificationPerShareTRY: string;
  dividendPurificationRatio: string;
  impureIncomeQuarterTRY: string;
  totalSharesOutstanding: string;
  currentPriceTRY?: string;
  zatableNetAssetsPerShareTRY?: string;
}

export const PurificationCalculatorCard: React.FC<PurificationCalculatorCardProps> = ({
  ticker,
  purificationPerShareTRY,
  dividendPurificationRatio,
  impureIncomeQuarterTRY,
  totalSharesOutstanding,
  currentPriceTRY = "482.50",
  zatableNetAssetsPerShareTRY = "14.82500000",
}) => {
  const [method, setMethod] = useState<"holding" | "dividend">("holding");
  const [lotCount, setLotCount] = useState<string>("1000");
  const [daysHeld, setDaysHeld] = useState<number>(90);
  const [periodDays, setPeriodDays] = useState<number>(90);
  const [dividendAmountTRY, setDividendAmountTRY] = useState<string>("10000");
  const [useCeiling, setUseCeiling] = useState<boolean>(true);
  const [showZakat, setShowZakat] = useState<boolean>(false);

  // Pure Decimal calculations
  const calculation = useMemo(() => {
    try {
      if (method === "dividend") {
        const divAmount = toDecimal(dividendAmountTRY || "0");
        const ratio = toDecimal(dividendPurificationRatio || "0");
        const raw = divAmount.times(ratio);
        const payable = useCeiling
          ? raw.toDecimalPlaces(2, Decimal.ROUND_CEIL)
          : raw.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        return {
          rawPurification: raw,
          payablePurification: payable,
          pShare: toDecimal(0),
          proRata: toDecimal(1),
        };
      }

      // Holding Period Pro-Rata
      const lots = toDecimal(lotCount || "0");
      const impureQuarter = toDecimal(impureIncomeQuarterTRY || "0");
      const shares = toDecimal(totalSharesOutstanding || "1");
      const pShare = impureQuarter.dividedBy(shares);
      const factor = toDecimal(daysHeld).dividedBy(periodDays || 90);
      const raw = pShare.times(lots).times(factor);

      const payable = useCeiling
        ? raw.toDecimalPlaces(2, Decimal.ROUND_CEIL)
        : raw.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      return {
        rawPurification: raw,
        payablePurification: payable,
        pShare,
        proRata: factor,
      };
    } catch {
      return {
        rawPurification: toDecimal(0),
        payablePurification: toDecimal(0),
        pShare: toDecimal(0),
        proRata: toDecimal(0),
      };
    }
  }, [
    method,
    lotCount,
    daysHeld,
    periodDays,
    dividendAmountTRY,
    dividendPurificationRatio,
    impureIncomeQuarterTRY,
    totalSharesOutstanding,
    useCeiling,
  ]);

  // Zakat calculations
  const zakat = useMemo(() => {
    try {
      const lots = toDecimal(lotCount || "0");
      const price = toDecimal(currentPriceTRY || "0");
      const tradingMarketValue = lots.times(price);
      const tradingZakat = tradingMarketValue.times("0.025");

      const zatablePerShare = toDecimal(zatableNetAssetsPerShareTRY || "0");
      const longTermBase = lots.times(zatablePerShare);
      const longTermZakat = longTermBase.times("0.025");

      return {
        tradingMarketValue,
        tradingZakat,
        longTermBase,
        longTermZakat,
      };
    } catch {
      return {
        tradingMarketValue: toDecimal(0),
        tradingZakat: toDecimal(0),
        longTermBase: toDecimal(0),
        longTermZakat: toDecimal(0),
      };
    }
  }, [lotCount, currentPriceTRY, zatableNetAssetsPerShareTRY]);

  const addLots = (amount: number) => {
    const current = parseFloat(lotCount) || 0;
    setLotCount(String(Math.max(current + amount, 0)));
  };

  return (
    <div className="apple-glass rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="text-emerald-400" size={18} />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Kuruşu Kuruşuna Arındırma (Purification) Hesaplayıcı
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Yatırımcının {ticker} hissesindeki payı ve elde tuttuğu gün sayısına göre arındırılması gereken şüpheli gelir tutarı.
          </p>
        </div>

        {/* Method Switcher */}
        <div className="apple-segmented-group">
          <button
            onClick={() => setMethod("holding")}
            className={`apple-segmented-item ${
              method === "holding" ? "active text-emerald-400" : ""
            }`}
          >
            Hisse Başı / Gün Bazlı
          </button>
          <button
            onClick={() => setMethod("dividend")}
            className={`apple-segmented-item ${
              method === "dividend" ? "active text-emerald-400" : ""
            }`}
          >
            Temettü Bazlı
          </button>
        </div>
      </div>

      {/* Form Controls */}
      {method === "holding" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Input controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5">
                Sahip Olunan Lot / Pay Adedi
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={lotCount}
                  onChange={(e) => setLotCount(e.target.value)}
                  placeholder="Örn: 1000"
                  className="w-full bg-slate-900/90 border border-white/[0.1] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm tabular-nums outline-none transition-colors"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-500">
                  LOT
                </span>
              </div>
              {/* Preset buttons */}
              <div className="flex items-center gap-1.5 mt-2">
                {[100, 500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setLotCount(String(preset))}
                    className="px-2.5 py-1 text-[11px] font-mono bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 rounded-lg transition-colors border border-white/[0.06]"
                  >
                    {preset} lot
                  </button>
                ))}
                <button
                  onClick={() => addLots(500)}
                  className="px-2.5 py-1 text-[11px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/25"
                >
                  +500
                </button>
              </div>
            </div>

            {/* Days Held Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Elde Tutulan Gün Sayısı (Çeyrek İçinde)</span>
                <span className="text-emerald-400 font-mono tabular-nums font-bold">
                  {daysHeld} / {periodDays} Gün
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={periodDays}
                value={daysHeld}
                onChange={(e) => setDaysHeld(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-white/[0.08] h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>1 Gün (Al-Sat)</span>
                <span>45 Gün (Ara Dönem)</span>
                <span>{periodDays} Gün (Tam Dönem)</span>
              </div>
            </div>

            {/* Prudence Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.07]">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    İhtiyatlı Yukarı Yuvarlama (ROUND_CEIL)
                  </span>
                  <span className="text-[11px] text-slate-400 block font-normal">
                    Şüpheli kazançtan tam arınmak için kuruşu bir üste tamamlar.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useCeiling}
                onChange={(e) => setUseCeiling(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Right: Output result card */}
          <div className="apple-card p-5 border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  HESAPLANAN ARINDIRMA TUTARI
                </span>
                <span className="badge-apple-emerald text-[9px]">
                  Kuruşu Kuruşuna
                </span>
              </div>
              <div className="text-3xl font-bold text-emerald-400 tracking-tight my-2 font-mono tabular-nums">
                {formatTRY(calculation.payablePurification)}
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Bu tutar, yatırımcının kârından veya sermayesinden hayır/bağış amacıyla arındırılmalıdır.
              </p>
            </div>

            <div className="border-t border-white/[0.07] pt-3 mt-4 space-y-2 text-xs text-slate-400 font-normal">
              <div className="flex items-center justify-between">
                <span>Hisse Başı Çeyreklik Uygunsuz Gelir:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {formatTRY(purificationPerShareTRY, 4)} / pay
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Elde Tutma Oranı (Pro-Rata):</span>
                <span className="font-mono tabular-nums text-slate-200">
                  %{(calculation.proRata.toNumber() * 100).toFixed(2)} ({daysHeld}/{periodDays} gün)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ham Hesaplama:</span>
                <span className="font-mono tabular-nums text-slate-400">
                  {calculation.rawPurification.toFixed(4)} TL
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dividend Method */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5">
                Hesaba Yatan Brüt/Net Nakit Temettü Tutarı
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={dividendAmountTRY}
                  onChange={(e) => setDividendAmountTRY(e.target.value)}
                  placeholder="Örn: 10000"
                  className="w-full bg-slate-900/90 border border-white/[0.1] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm tabular-nums outline-none transition-colors"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-500 font-mono">
                  TL
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {[5000, 10000, 25000, 50000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setDividendAmountTRY(String(preset))}
                    className="px-2.5 py-1 text-[11px] font-mono bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 rounded-lg transition-colors border border-white/[0.06]"
                  >
                    {formatTRY(preset, 0)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] text-xs text-slate-400 space-y-1.5">
              <span className="font-semibold text-slate-300 block">
                Temettü Arındırma Oranı
              </span>
              <p className="font-normal">
                Şirketin yıllık toplam hasılatı içindeki faiz ve uygunsuz yan faaliyet gelirleri oranı:
                <strong className="text-emerald-400 ml-1 font-mono tabular-nums">
                  %{(parseFloat(dividendPurificationRatio) * 100).toFixed(4)}
                </strong>
              </p>
            </div>
          </div>

          <div className="apple-card p-5 border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  TEMETTÜDEN ARINDIRILACAK TUTAR
                </span>
                <span className="badge-apple-emerald text-[9px]">
                  Temettü Bazlı
                </span>
              </div>
              <div className="text-3xl font-bold text-emerald-400 tracking-tight my-2 font-mono tabular-nums">
                {formatTRY(calculation.payablePurification)}
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Alınan {formatTRY(dividendAmountTRY || 0)} temettü üzerinden hesaplanmıştır.
              </p>
            </div>

            <div className="border-t border-white/[0.07] pt-3 mt-4 space-y-2 text-xs text-slate-400 font-normal">
              <div className="flex items-center justify-between">
                <span>Temettü Arındırma Oranı:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {dividendPurificationRatio}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Net Kalan Helal Temettü:</span>
                <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                  {formatTRY(toDecimal(dividendAmountTRY || 0).minus(calculation.payablePurification))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zakat Toggle & Preview */}
      <div className="border-t border-white/[0.07] pt-4">
        <button
          onClick={() => setShowZakat(!showZakat)}
          className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Sparkles size={13} />
          <span>
            {showZakat
              ? "Hisse Zekatı Önizlemesini Gizle"
              : `Bu Pozisyon İçin Hisse Zekatı Hesapla (${lotCount} Lot)`}
          </span>
        </button>

        {showZakat && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.07]">
            {/* Trading intent */}
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-xs font-semibold text-slate-200 block">
                Niyet 1: Al-Sat (Ticari Emtia)
              </span>
              <span className="text-[11px] text-slate-400 block mb-2 font-normal">
                Tam Piyasa Değeri üzerinden %2.5
              </span>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Piyasa Değeri:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {formatTRY(zakat.tradingMarketValue)}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-white/[0.06]">
                <span className="text-xs font-semibold text-emerald-400">Zekat (%2.5):</span>
                <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
                  {formatTRY(zakat.tradingZakat)}
                </span>
              </div>
            </div>

            {/* Long term intent */}
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-xs font-semibold text-slate-200 block">
                Niyet 2: Uzun Vadeli Temettü Yatırımı
              </span>
              <span className="text-[11px] text-slate-400 block mb-2 font-normal">
                Net Dönen Varlıklar üzerinden %2.5 (AAOIFI No. 35)
              </span>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Zekata Tabi Matrah:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {formatTRY(zakat.longTermBase)}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-white/[0.06]">
                <span className="text-xs font-semibold text-emerald-400">Zekat (%2.5):</span>
                <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
                  {formatTRY(zakat.longTermZakat)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
