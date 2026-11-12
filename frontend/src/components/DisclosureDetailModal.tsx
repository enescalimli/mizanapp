"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FileCode,
  RotateCcw,
  Send,
  MessageSquare,
  Scale,
} from "lucide-react";
import { DisclosureItem } from "@/types/disclosure";
import { StockLogo } from "./StockLogo";

interface DisclosureDetailModalProps {
  disclosure: DisclosureItem | null;
  onClose: () => void;
}

export function DisclosureDetailModal({ disclosure, onClose }: DisclosureDetailModalProps) {
  const router = useRouter();
  const [inlineAnalysis, setInlineAnalysis] = useState<string | null>(null);
  const [analysisModel, setAnalysisModel] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [customText, setCustomText] = useState("");

  // Modal kapandığında state'i sıfırla
  useEffect(() => {
    setInlineAnalysis(null);
    setAnalysisModel(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setShowPasteBox(false);
    setCustomText("");
  }, [disclosure]);

  // ESC tuşu ile kapatma & body scroll lock
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

  // Modal içinde doğrudan Mizan AI Analizi çalıştırma
  const handleRunInlineAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const fullPayloadText = customText.trim()
      ? `${disclosure.summary}\n\n[Kullanıcı Tarafından Sağlanan Ek Metin / PDF İçeriği]:\n${customText.trim()}`
      : disclosure.summary;

    const savedUserKey =
      typeof window !== "undefined"
        ? localStorage.getItem("mizan_user_gemini_api_key") || ""
        : "";

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (savedUserKey.trim()) {
        headers["x-gemini-api-key"] = savedUserKey.trim();
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Aşağıdaki resmi ${disclosure.source} bildirimini DİB ve TKBB katılım ilkelerine göre analiz et. Şirketin katılım durumuna etkisi nedir? Kâr payı arındırması veya yatırımcı aksiyonu gerekir mi?`,
            },
          ],
          userApiKey: savedUserKey.trim() || undefined,
          context: {
            currentTicker: disclosure.ticker,
            userApiKey: savedUserKey.trim() || undefined,
            disclosure: {
              ...disclosure,
              fullText: fullPayloadText,
            },
          },
        }),
      });

      if (!res.ok) {
        throw new Error("AI yanıt servisi geçici olarak meşgul");
      }

      const data = await res.json();
      if (data.text) {
        setInlineAnalysis(data.text);
        setAnalysisModel(data.modelUsed || "Google Gemini Flash • Canlı");
      } else {
        throw new Error("Boş analiz yanıtı alındı");
      }
    } catch (err: any) {
      console.error("Inline AI analysis error:", err);
      setAnalysisError(err.message || "Fıkhi analiz oluşturulurken bir aksaklık oluştu.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Asistan Sayfasına Metni Eksiksiz Aktararak Yönlendirme
  const handleOpenInAssistant = () => {
    const fullPayloadText = customText.trim()
      ? `${disclosure.summary}\n\n[Ek Metin]:\n${customText.trim()}`
      : disclosure.summary;

    const richPrompt = `[RESMİ ${disclosure.source} BİLDİRİMİ ANALİZİ]
Şirket / Kurum: ${disclosure.companyName || disclosure.ticker || "Borsa İstanbul"}
Başlık: ${disclosure.title}
Kategori: ${disclosure.category}
Tarih: ${disclosure.pubDate || disclosure.timeAgo}
Bildirim Metni / Özeti:
${fullPayloadText}

Soru: Bu açıklamayı Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu ve TKBB Katılım Standart 1 ilkelerine göre analiz et. Katılım endeksi statüsünü bozar mı? Bir fıkhi arındırma veya yatırımcı aksiyonu gerektirir mi?`;

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("mizan_pending_asistan_prompt", richPrompt);
        sessionStorage.setItem("mizan_pending_disclosure_context", JSON.stringify(disclosure));
      } catch {
        // ignore
      }
    }

    onClose();
    router.push("/asistan");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0E1015] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] z-10 p-5 sm:p-7 flex flex-col space-y-4 sm:space-y-5 animate-in zoom-in-95 fade-in duration-200">
        
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
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-[#182542] dark:text-white leading-snug">
            {disclosure.title}
          </h2>
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

        {/* İsteğe Bağlı: PDF veya Detaylı Metin Ekleme Akordiyonu */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="text-xs font-bold text-[#273869] dark:text-blue-400 hover:underline flex items-center gap-1.5"
          >
            <FileCode size={13} />
            <span>{showPasteBox ? "Metin Girişini Gizle" : "PDF İçeriği veya Detaylı Metin Ekleyerek Analiz Et (Opsiyonel)"}</span>
          </button>

          {showPasteBox && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 space-y-2 animate-in fade-in duration-150">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                KAP bildiriminin tam metnini veya SPK bülten maddesini buraya yapıştırabilirsiniz:
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Örn: 'Şirketimiz Yönetim Kurulu 2026 konsolide net dönem kârından pay başına brüt ₺2,40 kâr payı dağıtılmasına karar vermiştir...'"
                rows={3}
                className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#0E1015] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
              />
            </div>
          )}
        </div>

        {/* Canlı Inline AI Analiz Çıktısı (Modal İçinde Doğrudan) */}
        {isAnalyzing && (
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/30 text-center space-y-2.5 animate-pulse">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#182542] dark:text-white">
              Mizan AI Metni DİB ve TKBB Standartlarına Göre İnceliyor...
            </p>
            <span className="text-[11px] text-slate-500 block">
              Faizli borç eşiği, arındırma yükümlülüğü ve fıkhi riskler taranıyor
            </span>
          </div>
        )}

        {analysisError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>{analysisError}</span>
            <button
              type="button"
              onClick={handleRunInlineAnalysis}
              className="font-bold underline ml-2"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {inlineAnalysis && !isAnalyzing && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-emerald-50/40 dark:from-blue-950/30 dark:to-emerald-950/20 border border-blue-200/80 dark:border-blue-800/40 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-blue-200/50 dark:border-blue-800/30 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-[#182542] dark:text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-500" />
                  <span>Mizan AI Fıkhi &amp; Finansal Analizi</span>
                </span>
                {analysisModel && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{analysisModel}</span>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleRunInlineAnalysis}
                className="text-[10px] font-bold text-slate-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                title="Yeniden Analiz Et"
              >
                <RotateCcw size={11} />
                <span>Yenile</span>
              </button>
            </div>

            <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-2 whitespace-pre-line font-normal">
              {inlineAnalysis}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* 1. Modal İçinde Anında AI Analizi */}
            <button
              type="button"
              onClick={handleRunInlineAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl mizan-accent-btn text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>{inlineAnalysis ? "Yeniden Analiz Et" : "Mizan AI ile Bu Haberi Analiz Et"}</span>
            </button>

            {/* 2. Asistanda Devam Et */}
            <button
              type="button"
              onClick={handleOpenInAssistant}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-[#182542] dark:text-white text-xs font-bold transition"
              title="Metni Mizan AI Asistanına Taşı"
            >
              <MessageSquare size={13} />
              <span>Asistanda Sohbet Et</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Orijinal Resmi Bağlantı */}
            {disclosure.url && (
              <a
                href={disclosure.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-[#182542] dark:text-white text-xs font-bold transition"
              >
                <span>
                  {disclosure.source === "SPK"
                    ? "Resmi SPK Bülteni (PDF)"
                    : "KAP Resmi Sayfasında Gör"}
                </span>
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
