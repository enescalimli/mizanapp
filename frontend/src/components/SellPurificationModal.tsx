"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Calculator,
  ArrowRight,
  ShieldAlert,
  Coins,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  formatTRY,
  formatPercent,
  toDecimal,
  Decimal,
  calculateDaysHeld,
  calculateHoldingPurificationClient,
} from "@/lib/decimal/decimal";

interface SellPurificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: {
    id: string;
    ticker: string;
    companyName: string;
    lots: string;
    avgCostTRY: string;
    purchaseDate: string;
    currentPriceTRY: string;
    impureIncomeQuarterTRY: string;
    totalSharesOutstanding: string;
  } | null;
  onConfirmSale: (
    holdingId: string,
    lotsSold: string,
    netHalalProceedsTRY: string,
    purificationFeeTRY: string
  ) => void;
}

export const SellPurificationModal: React.FC<SellPurificationModalProps> = ({
  isOpen,
  onClose,
  holding,
  onConfirmSale,
}) => {
  if (!isOpen || !holding) return null;

  const totalLotsNumber = parseInt(holding.lots) || 1;
  const [selectedLots, setSelectedLots] = useState<number>(totalLotsNumber);
  const [useCeiling, setUseCeiling] = useState<boolean>(true);

  const { totalDaysHeld, daysHeldInQuarter, formattedPurchaseDate } =
    calculateDaysHeld(holding.purchaseDate);

  const simulation = useMemo(() => {
    const lotsDec = new Decimal(selectedLots);
    const priceDec = toDecimal(holding.currentPriceTRY);
    const costDec = toDecimal(holding.avgCostTRY);

    const grossProceeds = lotsDec.times(priceDec);
    const costBasis = lotsDec.times(costDec);
    const realizedPnl = grossProceeds.minus(costBasis);

    const purif = calculateHoldingPurificationClient(
      holding.impureIncomeQuarterTRY,
      holding.totalSharesOutstanding,
      lotsDec,
      totalDaysHeld,
      90,
      useCeiling
    );

    const netHalalProceeds = grossProceeds.minus(purif.totalPurificationPayable);
    const purifDeductionPercent = grossProceeds.gt(0)
      ? purif.totalPurificationPayable.dividedBy(grossProceeds).times(100)
      : new Decimal(0);

    return {
      lotsDec,
      grossProceeds,
      costBasis,
      realizedPnl,
      purificationPerShare: purif.purificationPerShare,
      purificationPayable: purif.totalPurificationPayable,
      netHalalProceeds,
      purifDeductionPercent,
    };
  }, [selectedLots, holding, totalDaysHeld, useCeiling]);

  const handleApplyPreset = (ratio: number) => {
    const count = Math.max(1, Math.round(totalLotsNumber * ratio));
    setSelectedLots(count);
  };

  const handleConfirm = () => {
    onConfirmSale(
      holding.id,
      String(selectedLots),
      simulation.netHalalProceeds.toFixed(2),
      simulation.purificationPayable.toFixed(2)
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/60 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Calculator size={16} />
              </span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Satış Anı Arındırma Hesaplayıcısı
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              <strong className="text-slate-900 font-mono">{holding.ticker}</strong> — {holding.companyName} pozisyonunuzu satarken infak edilecek net şüpheli kazanç.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Date & Day Calculation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5 tracking-wider">
              Alış Tarihi
            </span>
            <span className="font-semibold text-slate-800 font-mono flex items-center gap-1.5 tabular-nums">
              <Calendar size={12} className="text-emerald-600" />
              {formattedPurchaseDate}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5 tracking-wider">
              Elde Tutulan Süre
            </span>
            <span className="font-mono font-bold text-emerald-700 tabular-nums">
              {totalDaysHeld} Gün ({totalDaysHeld}/365 Yıllık Pro-Rata)
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5 tracking-wider">
              Canlı Piyasa Fiyatı
            </span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {formatTRY(holding.currentPriceTRY, 2)}
            </span>
          </div>
        </div>

        {/* Lot Selection Slider & Apple Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Satılacak Pay (Lot) Miktarı
            </span>
            <span className="font-mono font-bold text-emerald-700 text-sm tabular-nums">
              {selectedLots} / {totalLotsNumber} Lot
            </span>
          </div>

          <input
            type="range"
            min="1"
            max={totalLotsNumber}
            value={selectedLots}
            onChange={(e) => setSelectedLots(parseInt(e.target.value) || 1)}
            className="w-full h-1.5 rounded-lg bg-slate-200 accent-emerald-600 cursor-pointer"
          />

          <div className="flex items-center gap-2">
            {[
              { label: "%25", val: 0.25 },
              { label: "%50", val: 0.5 },
              { label: "%75", val: 0.75 },
              { label: "Tümü (%100)", val: 1.0 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p.val)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  selectedLots === Math.round(totalLotsNumber * p.val)
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Calculation Receipt Breakdown */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Brüt Satış Tutarı (Hasılat):</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {formatTRY(simulation.grossProceeds, 2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Alış Maliyeti ({holding.avgCostTRY} ₺/pay):</span>
            <span className="font-mono tabular-nums">
              {formatTRY(simulation.costBasis, 2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Gerçekleşen Kâr / Zarar:</span>
            <span
              className={`font-mono tabular-nums ${
                simulation.realizedPnl.gte(0)
                  ? "text-emerald-700"
                  : "text-rose-700"
              }`}
            >
              {simulation.realizedPnl.gte(0) ? "+" : ""}
              {formatTRY(simulation.realizedPnl, 2)}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 block">
                Ödenecek Arındırma Borcu (Düşülecek)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {totalDaysHeld} günlük oransal pay ({formatPercent(simulation.purifDeductionPercent, 2)})
              </span>
            </div>
            <span className="text-lg font-bold font-mono text-amber-700 tabular-nums">
              - {formatTRY(simulation.purificationPayable, 2)}
            </span>
          </div>

          <div className="border-t border-emerald-200 pt-3 flex items-center justify-between bg-emerald-50 -mx-5 -mb-5 p-4 rounded-b-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Net Ele Geçecek Helal Tutar
              </span>
              <span className="text-[10px] text-emerald-700">
                Arındırma bedeli düşüldükten sonraki bakiye
              </span>
            </div>
            <span className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
              {formatTRY(simulation.netHalalProceeds, 2)}
            </span>
          </div>
        </div>

        {/* Shariah Guidance Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed font-normal">
          <Coins size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Fıkhi Hatırlatma:</strong> Satış hasılatından ayrılan{" "}
            <strong className="text-amber-800 font-mono tabular-nums">
              {formatTRY(simulation.purificationPayable, 2)}
            </strong>{" "}
            tutarındaki şüpheli gelir, yatırımcının kendi mülkü kabul edilmez ve şahsi harcamalar (vergi, ceza vb.) için kullanılamaz. İhtiyaç sahiplerine veya kamu yararına doğrudan infak edilmelidir.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="apple-btn-secondary text-xs"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="apple-btn-primary text-xs"
          >
            <span>Satışı Onayla &amp; Arındır</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
