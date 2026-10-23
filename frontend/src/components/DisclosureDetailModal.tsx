"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  Radio,
} from "lucide-react";
import { DisclosureItem } from "@/types/disclosure";
import { StockLogo } from "./StockLogo";

interface DisclosureDetailModalProps {
  disclosure: DisclosureItem | null;
  onClose: () => void;
}

export function DisclosureDetailModal({ disclosure, onClose }: DisclosureDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (disclosure) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [disclosure, onClose]);

  if (!disclosure) return null;

  const isKAP = disclosure.source === "KAP";
  const aiQueryPrompt = disclosure.ticker
    ? `${disclosure.ticker} şirketinin ${disclosure.category} konulu "${disclosure.title}" bildirimini fıkhi ve finansal açıdan analiz et. Katılım yatırımcısı için bir sakınca veya arındırma yükümlülüğü doğurur mu?`
    : `SPK'nın "${disclosure.title}" duyurusunu fıkhi ve piyasa perspektifinden analiz et. Katılım yatırımcıları neye dikkat etmeli?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#161F32] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-10 p-5 sm:p-7 flex flex-col space-y-5 animate-in zoom-in-95 fade-in duration-200">
        
        {/* Top bar: Source badge + Live indicator + Close button */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase ${
                isKAP
                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                  : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
              }`}
            >
              <Radio size={12} className="animate-pulse" />
              <span>{isKAP ? "KAP • Kamuyu Aydınlatma" : "SPK • Kurul Kararı"}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Canlı Akış</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 flex items-center justify-center transition"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Company Identity Block (if company associated) */}
        {disclosure.ticker && (
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-3.5 min-w-0">
              <StockLogo
                ticker={disclosure.ticker}
                name={disclosure.companyName || disclosure.ticker}
                size="md"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/companies/${disclosure.ticker}`}
                    className="text-base font-black text-[#182542] dark:text-white hover:text-blue-500 transition"
                  >
                    {disclosure.ticker}
                  </Link>
                  <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-xs text-[#6E81A0] dark:text-[#94A3B8] truncate">
                    {disclosure.companyName || "BIST Şirketi"}
                  </span>
                </div>
                <div className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] flex items-center gap-1 mt-0.5">
                  <Building2 size={12} />
                  <span>Borsa İstanbul Kotasyonu</span>
                </div>
              </div>
            </div>

            {/* Katılım Durumu Rozeti */}
            <div className="text-right shrink-0">
              {disclosure.isCompliant === true ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0D8B52] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 size={13} />
                  <span>Katılım Uyumlu</span>
                </span>
              ) : disclosure.isCompliant === false ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/40">
                  <XCircle size={13} />
                  <span>Katılım Dışı</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-lg">
                  <span>Resmi Kurul Kaydı</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Category & Time Information */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/30">
            {disclosure.category}
          </span>

          <div className="flex items-center gap-2 text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
            <Calendar size={12} />
            <span>{disclosure.pubDate ? new Date(disclosure.pubDate).toLocaleString("tr-TR") : disclosure.timeAgo}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{disclosure.publisher}</span>
          </div>
        </div>

        {/* Full Headline / Title */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-black text-[#182542] dark:text-white leading-snug">
            {disclosure.title}
          </h2>
          {disclosure.rawTitle && disclosure.rawTitle !== disclosure.title && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              Orijinal Başlık: {disclosure.rawTitle}
            </p>
          )}
        </div>

        {/* Summary / Body */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-2 text-sm text-[#182542] dark:text-slate-200 leading-relaxed">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] flex items-center gap-1.5">
            <FileText size={12} />
            <span>Bildirim Detayı &amp; Açıklama Metni</span>
          </div>
          <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
            {disclosure.summary}
          </p>
        </div>

        {/* Fıkhi & Katılım Analiz Kutusu */}
        <div className="p-4 rounded-2xl bg-amber-500/[0.07] dark:bg-amber-400/[0.05] border border-amber-300/40 dark:border-amber-400/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-300">
            <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Mizan Fıkhi Denetim &amp; Katılım Değerlendirmesi</span>
          </div>
          <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
            {disclosure.islamicFinanceNote ||
              "Bu bildirim Kamuyu Aydınlatma Platformu veya SPK resmi veritabanından anlık çekilmiştir. Bildirim şirketlerin bilanço ve kâr payı dağıtım kriterlerini etkileyebilir."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between flex-wrap gap-3">
          {/* Mizan AI Shortcut */}
          <Link
            href={`/asistan?q=${encodeURIComponent(aiQueryPrompt)}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition group"
          >
            <Sparkles size={14} className="group-hover:rotate-12 transition transform" />
            <span>Mizan AI ile Analiz Et</span>
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* External Official Source Link */}
            {disclosure.url && (
              <a
                href={disclosure.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-[#182542] dark:text-white text-xs font-bold transition"
              >
                <span>Resmi Kaynakta Gör</span>
                <ExternalLink size={13} />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
