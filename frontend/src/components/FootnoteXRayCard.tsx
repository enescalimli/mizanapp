import React, { useState } from "react";
import { FootnoteVerification } from "@/types/katilim";
import { formatTRY } from "@/lib/decimal/decimal";
import { ShieldCheck, AlertTriangle, Layers, ChevronDown, ChevronUp, FileText } from "lucide-react";

interface FootnoteXRayCardProps {
  footnote: FootnoteVerification;
  ticker: string;
}

export const FootnoteXRayCard: React.FC<FootnoteXRayCardProps> = ({
  footnote,
  ticker,
}) => {
  const [activeTab, setActiveTab] = useState<"cash" | "debt">("cash");
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const { cashBreakdown, debtBreakdown } = footnote;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Header with Certified Seal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-emerald-600" size={18} />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              KAP Bilanço &amp; Dipnot X-Ray Görünümü
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {ticker} finansal raporunun dipnotları ayrıştırılmış ve TMS/TFRS muhasebe denkliği denetlenmiştir.
          </p>
        </div>

        {/* Verification Badge */}
        {footnote.isAccountingIdentityVerified ? (
          <div className="badge-apple-emerald text-xs py-1 px-3">
            <ShieldCheck size={14} />
            <span>Muhasebe Denkliği Onaylandı (Δ = 0.00 TL)</span>
          </div>
        ) : (
          <div className="badge-apple-amber text-xs py-1 px-3">
            <AlertTriangle size={14} />
            <span>İhtiyatlılık İlkesi Devrede (Muhafazakar Yaklaşım)</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs (Apple Segmented Control) */}
      <div className="apple-segmented-group">
        <button
          onClick={() => setActiveTab("cash")}
          className={`apple-segmented-item ${
            activeTab === "cash" ? "active text-emerald-700" : ""
          }`}
        >
          Nakit ve Benzerleri (Dipnot 4)
        </button>
        <button
          onClick={() => setActiveTab("debt")}
          className={`apple-segmented-item ${
            activeTab === "debt" ? "active text-emerald-700" : ""
          }`}
        >
          Finansal Borçlar (Dipnot 6)
        </button>
      </div>

      {/* Tab 1: Cash Breakdown */}
      {activeTab === "cash" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">
            <span>BİLANÇO DİPNOT KALEMİ</span>
            <span>TUTAR (TL) / STATÜ</span>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div>
                <span className="text-sm text-slate-800 font-medium">Vadesiz Banka Mevduatları</span>
                <span className="block text-xs text-slate-400 font-normal">Kasa ve vadesiz hesaplar</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatTRY(cashBreakdown.demandDepositsTRY)}
                </span>
                <span className="block text-[11px] text-emerald-700 font-medium">Helal Varlık</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div>
                <span className="text-sm text-slate-800 font-medium">Katılım Hesapları / Fonları</span>
                <span className="block text-xs text-slate-400 font-normal">Katılım bankaları kar payı hesapları</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatTRY(cashBreakdown.participationAccountsTRY)}
                </span>
                <span className="block text-[11px] text-emerald-700 font-medium">Helal Varlık</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5 px-3 hover:bg-rose-50/50 rounded-lg transition-colors bg-rose-50/30">
              <div>
                <span className="text-sm text-rose-800 font-medium">Vadeli (Faizli) Mevduat</span>
                <span className="block text-xs text-slate-500 font-normal">Klasik banka vadeli faizli hesapları</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-rose-700 font-mono tabular-nums">
                  {formatTRY(cashBreakdown.timeDepositsInterestTRY)}
                </span>
                <span className="block text-[11px] text-rose-700 font-semibold font-mono">Faizli Varlık (%33 Eşiğine Dahil)</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div>
                <span className="text-sm text-slate-800 font-medium">Ters Repo ve Para Piyasası</span>
                <span className="block text-xs text-slate-400 font-normal">Kısa vadeli repo alacakları</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatTRY(cashBreakdown.reverseRepoTRY)}
                </span>
                <span className="block text-[11px] text-slate-400">Mevcut Değil</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg font-bold border-t border-slate-200 mt-2">
              <span className="text-sm text-slate-900">Ana Bilanço Toplam Nakit</span>
              <span className="text-sm text-emerald-700 font-mono tabular-nums">
                {formatTRY(footnote.balanceSheetCashTotalTRY)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Debt Breakdown */}
      {activeTab === "debt" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">
            <span>BORÇ KALEMİ</span>
            <span>TUTAR (TL) / STATÜ</span>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div>
                <span className="text-sm text-slate-800 font-medium">Katılım Bankası Finansmanları (Murabaha)</span>
                <span className="block text-xs text-slate-400 font-normal">Faizsiz fon kullanımları</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatTRY(debtBreakdown.participationBankFinancingsTRY)}
                </span>
                <span className="block text-[11px] text-emerald-700 font-medium">Faizsiz Borç (Muaf)</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div>
                <span className="text-sm text-slate-800 font-medium">TFRS 16 Faaliyet Kiralamaları</span>
                <span className="block text-xs text-slate-400 font-normal">Mağaza ve filo operasyonel kiralama</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatTRY(debtBreakdown.operationalLeaseTRY)}
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">Faaliyet Borcu</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5 px-3 hover:bg-rose-50/50 rounded-lg transition-colors bg-rose-50/30">
              <div>
                <span className="text-sm text-rose-800 font-medium">Klasik Banka Kredileri</span>
                <span className="block text-xs text-slate-500 font-normal">Kısa ve uzun vadeli faizli nakit krediler</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-rose-700 font-mono tabular-nums">
                  {formatTRY(debtBreakdown.conventionalBankLoansTRY)}
                </span>
                <span className="block text-[11px] text-rose-700 font-semibold font-mono">Faizli Borç (%33 Eşiğine Dahil)</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg font-bold border-t border-slate-200 mt-2">
              <span className="text-sm text-slate-900">Ana Bilanço Toplam Borçlanmalar</span>
              <span className="text-sm text-rose-700 font-mono tabular-nums">
                {formatTRY(footnote.balanceSheetDebtTotalTRY)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Audit Notes */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => setIsNotesOpen(!isNotesOpen)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
        >
          <span className="flex items-center gap-1.5">
            <FileText size={13} className="text-emerald-600" />
            Denetim ve İslami Finans Metodoloji Notları ({footnote.auditNotes.length})
          </span>
          {isNotesOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {isNotesOpen && (
          <ul className="mt-3 space-y-1.5 text-xs text-slate-600 pl-4 list-disc font-normal leading-relaxed">
            {footnote.auditNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
