"use client";

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Calendar,
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Split,
  Eye,
  Search,
  Maximize2,
  Coins,
  ShieldCheck,
} from "lucide-react";
import {
  FINANCIAL_PERIODS,
  PeriodFinancialStatement,
  FinancialStatementRow,
  getCompanyMultiPeriodFinancials,
  buildBalanceSheetRows,
  buildIncomeStatementRows,
  buildCashFlowRows,
  buildKafifRows,
} from "@/lib/data/financialReportsDatabase";

type StatementType = "BILANCO" | "GELIR" | "NAKIT_AKIM" | "KAFIF" | "DUPONT";
type ScaleUnit = "MN" | "BIN" | "RAW";

interface FinancialReportsTabProps {
  ticker: string;
  companyName: string;
  isCompliant: boolean;
  liveScreeningData?: any;
}

export function FinancialReportsTab({
  ticker,
  companyName,
  isCompliant,
  liveScreeningData,
}: FinancialReportsTabProps) {
  const [statementType, setStatementType] = useState<StatementType>("BILANCO");
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([
    "2026/09",
    "2026/06",
    "2026/03",
    "2025/12",
  ]);
  const [activeSinglePeriod, setActiveSinglePeriod] = useState<string>("2026/09");
  const [unit, setUnit] = useState<ScaleUnit>("MN");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [showGrowthDeltas, setShowGrowthDeltas] = useState<boolean>(true);

  // Load all historical periods for this ticker anchored to live KAP screening data
  const allPeriodsData = useMemo(() => {
    return getCompanyMultiPeriodFinancials(ticker, liveScreeningData);
  }, [ticker, liveScreeningData]);

  // Format currency according to scale unit
  const formatAmount = (num: number, isPercent: boolean = false) => {
    if (isPercent) {
      return `%${num.toFixed(2)}`;
    }
    if (num === 0) return "-";
    const isNegative = num < 0;
    const abs = Math.abs(num);

    let displayVal = "";
    if (unit === "MN") {
      displayVal = (abs / 1_000_000).toLocaleString("tr-TR", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      });
      return isNegative ? `(₺${displayVal} Mn)` : `₺${displayVal} Mn`;
    } else if (unit === "BIN") {
      displayVal = (abs / 1_000).toLocaleString("tr-TR", {
        maximumFractionDigits: 0,
      });
      return isNegative ? `(₺${displayVal} B)` : `₺${displayVal} B`;
    } else {
      displayVal = abs.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
      return isNegative ? `(₺${displayVal})` : `₺${displayVal}`;
    }
  };

  // Get rows based on selected statement type
  const statementRows: FinancialStatementRow[] = useMemo(() => {
    if (statementType === "BILANCO") {
      return buildBalanceSheetRows(allPeriodsData, selectedPeriods);
    } else if (statementType === "GELIR") {
      return buildIncomeStatementRows(allPeriodsData, selectedPeriods);
    } else if (statementType === "NAKIT_AKIM") {
      return buildCashFlowRows(allPeriodsData, selectedPeriods);
    } else if (statementType === "KAFIF") {
      return buildKafifRows(allPeriodsData, selectedPeriods);
    }
    return [];
  }, [statementType, allPeriodsData, selectedPeriods]);

  // Filter rows by user search query
  const filteredRows = useMemo(() => {
    if (!searchFilter.trim()) return statementRows;
    const q = searchFilter.toLowerCase().trim();
    return statementRows.filter(
      (r) => r.isHeader || r.isTotal || r.label.toLowerCase().includes(q)
    );
  }, [statementRows, searchFilter]);

  // Calculate DuPont data for the active single period
  const activeDupont = useMemo(() => {
    const p = allPeriodsData[activeSinglePeriod] || allPeriodsData["2026/09"];
    if (!p) return null;

    const netMarginPercent = p.revenue > 0 ? (p.netIncome / p.revenue) * 100 : 0;
    const assetTurnover = p.totalAssets > 0 ? p.revenue / p.totalAssets : 0;
    const leverageMultiplier = p.equity > 0 ? p.totalAssets / p.equity : 0;
    const calculatedRoe = (netMarginPercent / 100) * assetTurnover * leverageMultiplier * 100;

    return {
      period: activeSinglePeriod,
      netMarginPercent: Number(netMarginPercent.toFixed(2)),
      assetTurnover: Number(assetTurnover.toFixed(2)),
      leverageMultiplier: Number(leverageMultiplier.toFixed(2)),
      calculatedRoePercent: Number(calculatedRoe.toFixed(2)),
      revenue: p.revenue,
      netIncome: p.netIncome,
      totalAssets: p.totalAssets,
      equity: p.equity,
      ebitda: p.ebitda,
    };
  }, [allPeriodsData, activeSinglePeriod]);

  // Toggle period selection
  const handleTogglePeriod = (periodId: string) => {
    if (selectedPeriods.includes(periodId)) {
      if (selectedPeriods.length > 1) {
        setSelectedPeriods((prev) => prev.filter((p) => p !== periodId));
      }
    } else {
      setSelectedPeriods((prev) => [...prev, periodId].slice(0, 5));
    }
  };

  // CSV export
  const handleExportCsv = () => {
    let csv = `Kalem Adı;${selectedPeriods.join(";")}\n`;
    for (const r of statementRows) {
      if (r.isHeader) {
        csv += `${r.label};;\n`;
      } else {
        const vals = selectedPeriods.map((p) => r.values[p] || 0).join(";");
        csv += `${r.label};${vals}\n`;
      }
    }
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ticker}_Finansal_Rapor_${statementType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* =================================================================== */}
      {/* 1. ÜST SEÇİM VE KONTROL PANELİ                                      */}
      {/* =================================================================== */}
      <div className="bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-5 sm:p-6 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
        
        {/* Başlık & İndir */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDF1F7] dark:border-white/10 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#182542] dark:text-white flex items-center gap-2">
              <FileSpreadsheet size={17} className="text-indigo-600 dark:text-indigo-400" />
              <span>Ayrıntılı Finansal Tablolar &amp; KAP Raporları</span>
            </h3>
            <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
              {companyName} ({ticker}) için çeyreklik resmi bilanço, gelir tablosu, nakit akım ve KAFİF katılım dökümü.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Birim Seçici: Mn ₺ / Bin ₺ / Tam */}
            <div className="bg-slate-100 dark:bg-white/5 rounded-full p-1 border border-slate-200/60 dark:border-white/10 flex items-center gap-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setUnit("MN")}
                className={`px-2.5 py-1 rounded-full transition ${
                  unit === "MN"
                    ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                    : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                }`}
              >
                Mn ₺
              </button>
              <button
                type="button"
                onClick={() => setUnit("BIN")}
                className={`px-2.5 py-1 rounded-full transition ${
                  unit === "BIN"
                    ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                    : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                }`}
              >
                Bin ₺
              </button>
              <button
                type="button"
                onClick={() => setUnit("RAW")}
                className={`px-2.5 py-1 rounded-full transition ${
                  unit === "RAW"
                    ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                    : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                }`}
              >
                Tam ₺
              </button>
            </div>

            {/* CSV Dışa Aktar */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-[#182542] dark:text-white flex items-center gap-1.5 transition shadow-2xs"
              title="Tabloyu Excel / CSV olarak indir"
            >
              <Download size={13} />
              <span className="hidden sm:inline">CSV İndir</span>
            </button>
          </div>
        </div>

        {/* Tablo Türü Seçici (Bilanço, Gelir, Nakit, KAFİF, DuPont) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "BILANCO", label: "Bilanço (Aktif/Pasif)", icon: Layers },
            { id: "GELIR", label: "Gelir Tablosu", icon: TrendingUp },
            { id: "NAKIT_AKIM", label: "Nakit Akım Tablosu", icon: Coins },
            { id: "KAFIF", label: "KAP Katılım İlkeleri Formu (KAFİF)", icon: Scale },
            { id: "DUPONT", label: "DuPont Kârlılık Modeli", icon: Split },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = statementType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatementType(tab.id as StatementType)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                  isActive
                    ? "bg-[#182542] dark:bg-[#273869] text-white shadow-md shadow-[#182542]/15"
                    : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white border border-slate-200/60 dark:border-white/5"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dönem Seçici Kapsülleri (Çoklu Sütun veya Tek Dönem) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <span className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] mr-1 flex items-center gap-1">
              <Calendar size={13} />
              <span>Dönemler:</span>
            </span>
            {FINANCIAL_PERIODS.map((p) => {
              const isSelected = selectedPeriods.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    handleTogglePeriod(p.id);
                    setActiveSinglePeriod(p.id);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs"
                      : "bg-white dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] border border-slate-200/60 dark:border-white/5 hover:border-slate-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-indigo-600 dark:bg-indigo-400" : "bg-slate-300 dark:bg-slate-600"}`} />
                  <span>{p.id}</span>
                  {p.isYearEnd && (
                    <span className="text-[9px] font-sans font-normal px-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      Yıllık
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Kalem Arama Çubuğu */}
          {statementType !== "DUPONT" && (
            <div className="relative w-full sm:w-56">
              <Search size={13} className="absolute left-3 top-2.5 text-[#6E81A0] dark:text-[#94A3B8]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Kalem ara (örn: nakit, faiz)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-xs text-[#182542] dark:text-white placeholder-[#6E81A0] dark:placeholder-[#94A3B8] outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}
        </div>

      </div>

      {/* =================================================================== */}
      {/* 2. GÖRÜNÜM A: ÇOK DÖNEMLİ TABLOLAR (Bilanço, Gelir, Nakit, KAFİF)   */}
      {/* =================================================================== */}
      {statementType !== "DUPONT" && (
        <div className="bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 shadow-[0_8px_30px_rgba(24,37,66,0.04)] overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] font-bold text-[11px]">
                  <th className="py-3.5 px-5 min-w-[260px] sm:min-w-[320px]">
                    Finansal Kalem (KAP XBRL Standardı)
                  </th>
                  {selectedPeriods.map((p) => (
                    <th key={p} className="py-3.5 px-4 text-right font-mono min-w-[120px]">
                      <div className="space-y-0.5">
                        <span className="text-[#182542] dark:text-white block font-extrabold">{p}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {p.endsWith("/12") ? "12 Aylık" : p.endsWith("/09") ? "3. Çeyrek" : p.endsWith("/06") ? "2. Çeyrek" : "1. Çeyrek"}
                        </span>
                      </div>
                    </th>
                  ))}
                  {selectedPeriods.length >= 2 && showGrowthDeltas && (
                    <th className="py-3.5 px-4 text-right font-mono min-w-[100px] text-indigo-700 dark:text-indigo-400">
                      Değişim (Δ%)
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredRows.map((row) => {
                  const isHeader = row.isHeader;
                  const isTotal = row.isTotal;
                  const indent = row.indent || 0;

                  // Calculate delta between first two selected periods
                  let deltaPercent: number | null = null;
                  if (selectedPeriods.length >= 2) {
                    const latest = row.values[selectedPeriods[0]] || 0;
                    const prev = row.values[selectedPeriods[1]] || 0;
                    if (prev !== 0 && !row.isHeader && !row.label.includes("(%)")) {
                      deltaPercent = ((latest - prev) / Math.abs(prev)) * 100;
                    }
                  }

                  const isPercentRow = row.label.includes("(%)");

                  return (
                    <tr
                      key={row.key}
                      className={`transition ${
                        isHeader
                          ? "bg-slate-100/70 dark:bg-white/[0.04] font-bold text-[#182542] dark:text-white"
                          : isTotal
                          ? "bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-[#182542] dark:text-white border-t border-b border-indigo-100 dark:border-indigo-900/40"
                          : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Kalem Adı */}
                      <td className="py-2.5 px-5">
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingLeft: `${indent * 16}px` }}
                        >
                          {indent > 0 && (
                            <span className="text-slate-300 dark:text-slate-600 select-none">&bull;</span>
                          )}
                          <span
                            className={`${
                              isHeader
                                ? "text-xs font-black uppercase text-[#182542] dark:text-white"
                                : isTotal
                                ? "text-xs font-extrabold text-[#182542] dark:text-white"
                                : indent === 2
                                ? "text-[11px] text-[#6E81A0] dark:text-[#94A3B8]"
                                : "text-xs text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {row.label}
                          </span>
                        </div>
                      </td>

                      {/* Dönem Sütunları */}
                      {selectedPeriods.map((p) => {
                        const val = row.values[p] || 0;
                        return (
                          <td
                            key={p}
                            className={`py-2.5 px-4 text-right font-mono ${
                              isHeader
                                ? "font-bold text-[#182542] dark:text-white"
                                : isTotal
                                ? "font-black text-[#182542] dark:text-white"
                                : val < 0
                                ? "text-rose-600 dark:text-rose-400 font-semibold"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {isPercentRow ? `%${val.toFixed(2)}` : formatAmount(val)}
                          </td>
                        );
                      })}

                      {/* Değişim Δ% */}
                      {selectedPeriods.length >= 2 && showGrowthDeltas && (
                        <td className="py-2.5 px-4 text-right font-mono text-xs">
                          {deltaPercent !== null ? (
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md font-bold text-[10px] ${
                                deltaPercent > 0
                                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                                  : deltaPercent < 0
                                  ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
                                  : "text-slate-500 bg-slate-100 dark:bg-white/5"
                              }`}
                            >
                              {deltaPercent > 0 ? "+" : ""}
                              {deltaPercent.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dipnot Açıklama Notu */}
          <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-200/70 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6E81A0] dark:text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>
                Veriler KAP XBRL finansal raporlarından ve KAFİF katılım beyanlarından derlenmiştir. TFRS 16 operasyonel kira borçları fıkhen finansal borçtan tenzil edilmektedir.
              </span>
            </div>
            <span className="font-mono text-[10px]">Birim: {unit === "MN" ? "Milyon TL" : unit === "BIN" ? "Bin TL" : "Tam TL"}</span>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. GÖRÜNÜM B: DUPONT ANALİZİ & KÂRLILIK ANATOMİSİ                    */}
      {/* =================================================================== */}
      {statementType === "DUPONT" && activeDupont && (
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDF1F7] dark:border-white/10 pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#182542] dark:text-white flex items-center gap-2">
                  <Split size={17} className="text-indigo-600 dark:text-indigo-400" />
                  <span>DuPont Analiz Modeli &bull; {activeDupont.period} Dönemi</span>
                </h3>
                <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                  Özkaynak kârlılığının (ROE) 3 temel bileşenine dekompozisyonu: Satış Kârlılığı &times; Varlık Verimliliği &times; Finansal Kaldıraç.
                </p>
              </div>

              {/* ROE Hero Badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-900 to-[#182542] text-white px-5 py-2.5 rounded-2xl shadow-sm border border-white/10">
                <span className="text-xs text-white/70">Hesaplanan ROE:</span>
                <span className="font-mono font-extrabold text-lg text-emerald-300">
                  %{activeDupont.calculatedRoePercent}
                </span>
              </div>
            </div>

            {/* DuPont 3 Motor + Sonuç Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-center text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
                  1. Net Kâr Marjı
                </span>
                <div className="text-2xl font-mono font-black text-[#182542] dark:text-white">
                  %{activeDupont.netMarginPercent}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  <div>Net Kâr / Hasılat</div>
                  <div className="font-mono text-[10px] text-slate-400">
                    ₺{(activeDupont.netIncome / 1_000_000_000).toFixed(1)}B / ₺{(activeDupont.revenue / 1_000_000_000).toFixed(1)}B
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
                  2. Aktif Devir Hızı
                </span>
                <div className="text-2xl font-mono font-black text-[#182542] dark:text-white">
                  {activeDupont.assetTurnover}x
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  <div>Hasılat / Toplam Aktif</div>
                  <div className="font-mono text-[10px] text-slate-400">
                    Varlık Verimliliği
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
                  3. Finansal Kaldıraç
                </span>
                <div className="text-2xl font-mono font-black text-[#182542] dark:text-white">
                  {activeDupont.leverageMultiplier}x
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  <div>Toplam Aktif / Özkaynak</div>
                  <div className="font-mono text-[10px] text-slate-400">
                    Borçlanma Çarpanı
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-900 dark:text-indigo-200 block">
                  Özkaynak Kârlılığı (ROE)
                </span>
                <div className="text-2xl font-mono font-black text-indigo-700 dark:text-indigo-400">
                  %{activeDupont.calculatedRoePercent}
                </div>
                <div className="text-[11px] text-indigo-800 dark:text-indigo-300 font-semibold space-y-0.5">
                  <div>1 &times; 2 &times; 3 Çarpımı</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                    Hissedara Yaratılan Değer
                  </div>
                </div>
              </div>
            </div>

            {/* DuPont Tarihsel Karşılaştırma Tablosu */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/10">
              <h4 className="text-xs font-bold text-[#182542] dark:text-white uppercase tracking-wider mb-2">
                Çeyreklik DuPont Gelişim Trendi
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-[#6E81A0] dark:text-[#94A3B8] text-[10px] uppercase">
                      <th className="py-2 px-3 font-sans">Dönem</th>
                      <th className="py-2 px-3 text-right">Net Kâr Marjı</th>
                      <th className="py-2 px-3 text-right">Aktif Devri</th>
                      <th className="py-2 px-3 text-right">Kaldıraç</th>
                      <th className="py-2 px-3 text-right text-indigo-700 dark:text-indigo-400 font-bold">Hesaplanan ROE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {FINANCIAL_PERIODS.map((p) => {
                      const f = allPeriodsData[p.id];
                      if (!f) return null;
                      const nm = f.revenue > 0 ? (f.netIncome / f.revenue) * 100 : 0;
                      const at = f.totalAssets > 0 ? f.revenue / f.totalAssets : 0;
                      const lm = f.equity > 0 ? f.totalAssets / f.equity : 0;
                      const roe = (nm / 100) * at * lm * 100;
                      const isCur = p.id === activeSinglePeriod;

                      return (
                        <tr
                          key={p.id}
                          onClick={() => setActiveSinglePeriod(p.id)}
                          className={`cursor-pointer transition ${
                            isCur
                              ? "bg-indigo-50/50 dark:bg-indigo-950/30 font-bold"
                              : "hover:bg-slate-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <td className="py-2 px-3 font-sans font-bold text-[#182542] dark:text-white flex items-center gap-1.5">
                            {isCur && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                            <span>{p.label}</span>
                          </td>
                          <td className="py-2 px-3 text-right">%{nm.toFixed(1)}</td>
                          <td className="py-2 px-3 text-right">{at.toFixed(2)}x</td>
                          <td className="py-2 px-3 text-right">{lm.toFixed(2)}x</td>
                          <td className="py-2 px-3 text-right text-indigo-700 dark:text-indigo-400 font-bold">
                            %{roe.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
