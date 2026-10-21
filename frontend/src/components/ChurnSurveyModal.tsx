"use client";

import React, { useState } from "react";
import { X, AlertCircle, Sparkles, PauseCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface ChurnSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (reason: string, feedback: string) => void;
  onApplyRetentionOffer: (offerType: "DISCOUNT_30" | "PAUSE_2_MONTHS") => void;
}

export const ChurnSurveyModal: React.FC<ChurnSurveyModalProps> = ({
  isOpen,
  onClose,
  onConfirmCancel,
  onApplyRetentionOffer,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [showOffer, setShowOffer] = useState<"DISCOUNT" | "PAUSE" | null>(null);

  if (!isOpen) return null;

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    if (reason === "PRICE") {
      setShowOffer("DISCOUNT");
    } else if (reason === "USAGE") {
      setShowOffer("PAUSE");
    } else {
      setShowOffer(null);
    }
  };

  const handleFinalCancel = () => {
    onConfirmCancel(selectedReason, feedback);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-white/90 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full inline-block">
              Abonelik İptal Adımı
            </span>
            <h3 className="text-lg font-extrabold text-[#182542] tracking-tight">
              Ayrılmadan Önce Bize Geri Bildirim Verin
            </h3>
            <p className="text-xs text-[#6E81A0]">
              Mizan PRO deneyiminizi sonlandırmadan önce eksik gördüklerinizi paylaşırsanız platformu geliştirmemize yardımcı olabilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-[#6E81A0] flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Survey Reasons */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[#182542] block">
            Ayrılma Sebebiniz Nedir?
          </label>
          {[
            { id: "PRICE", text: "Fiyatı yüksek buluyorum / Bütçeme uymuyor" },
            { id: "USAGE", text: "Şu an yeterince aktif borsa işlemi yapmıyorum" },
            { id: "FEATURE", text: "İhtiyacım olan bazı fıkhi özellikler veya veriler eksik" },
            { id: "OTHER", text: "Diğer bir sebep / Geçici ihtiyaç" },
          ].map((item) => (
            <label
              key={item.id}
              onClick={() => handleReasonSelect(item.id)}
              className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition ${
                selectedReason === item.id
                  ? "bg-[#182542]/5 border-[#182542] font-bold text-[#182542]"
                  : "bg-slate-50/70 hover:bg-white border-slate-200 text-slate-700"
              }`}
            >
              <span>{item.text}</span>
              <input
                type="radio"
                name="churnReason"
                checked={selectedReason === item.id}
                onChange={() => {}}
                className="w-4 h-4 accent-[#182542]"
              />
            </label>
          ))}
        </div>

        {/* Retention Offer: Discount */}
        {showOffer === "DISCOUNT" && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Sparkles size={16} className="text-amber-600 shrink-0" />
              <span>Size Özel Teklif: Sonraki 3 Ay Boyunca %30 İndirim!</span>
            </div>
            <p className="text-[11px] text-amber-950/80 leading-relaxed">
              Katılım finans analizlerinizi aksatmamak için PRO aboneliğinizi aylık ₺149 yerine yalnızca <strong>₺99/ay</strong> ile devam ettirebilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => onApplyRetentionOffer("DISCOUNT_30")}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>%30 İndirimi Tanımla ve Devam Et</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Retention Offer: Pause */}
        {showOffer === "PAUSE" && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
              <PauseCircle size={16} className="text-blue-600 shrink-0" />
              <span>Aboneliğinizi İptal Etmek Yerine 2 Ay Ücretsiz Dondurun</span>
            </div>
            <p className="text-[11px] text-blue-950/80 leading-relaxed">
              Portföy kayıtlarınızı ve geçmiş arındırma verilerinizi kaybetmeden aboneliğinizi 60 gün boyunca askıya alabilirsiniz. Bu sürede hiçbir ücret kesilmez.
            </p>
            <button
              type="button"
              onClick={() => onApplyRetentionOffer("PAUSE_2_MONTHS")}
              className="w-full py-2.5 rounded-xl bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Aboneliği 60 Gün Dondur</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Freeform Feedback */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#6E81A0] block">
            Eklemek İstediğiniz Not (Opsiyonel)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            placeholder="Hangi özelliği ekleseydik Mizan'da kalmayı tercih ederdiniz?"
            className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#182542] focus:border-[#182542] outline-none transition resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#182542] text-xs font-bold transition"
          >
            Vazgeç, Aboneliği Koru
          </button>
          <button
            type="button"
            disabled={!selectedReason}
            onClick={handleFinalCancel}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
              selectedReason
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Aboneliği Kesin Olarak İptal Et
          </button>
        </div>

      </div>
    </div>
  );
};
