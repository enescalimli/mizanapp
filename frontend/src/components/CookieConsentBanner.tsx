"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Shield, Check, X, SlidersHorizontal } from "lucide-react";

export const CookieConsentBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [functional, setFunctional] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consentGiven = localStorage.getItem("mizan_cookie_consent_given");
      if (!consentGiven) {
        // Small delay so it transitions in smoothly
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mizan_cookie_consent_given", "true");
      localStorage.setItem(
        "mizan_cookie_preferences",
        JSON.stringify({ essential: true, analytics: true, functional: true })
      );
    }
    setIsOpen(false);
  };

  const handleRejectNonEssential = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mizan_cookie_consent_given", "true");
      localStorage.setItem(
        "mizan_cookie_preferences",
        JSON.stringify({ essential: true, analytics: false, functional: false })
      );
    }
    setIsOpen(false);
  };

  const handleSaveCustom = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mizan_cookie_consent_given", "true");
      localStorage.setItem(
        "mizan_cookie_preferences",
        JSON.stringify({ essential: true, analytics, functional })
      );
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-auto lg:right-8 lg:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_20px_50px_rgba(24,37,66,0.15)] space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0">
              <Cookie size={17} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#182542]">
                Çerez Tercihleriniz ve Gizlilik
              </h3>
              <p className="text-[10px] text-[#6E81A0] font-medium">
                KVKK &amp; GDPR Çerez İzin Yönetimi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRejectNonEssential}
            className="w-6 h-6 rounded-full hover:bg-slate-100 text-[#6E81A0] hover:text-[#182542] flex items-center justify-center transition shrink-0"
            title="Kapat ve Yalnızca Zorunluları Kabul Et"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <p className="text-[11px] text-[#182542]/80 leading-relaxed font-normal">
          Mizan, güvenli oturum sağlamak, fıkhi tercihlerinizi hatırlamak ve kullanıcı deneyimini optimize etmek için çerezleri kullanır. Ayrıntılar için{" "}
          <Link href="/cerez-politikasi" className="font-bold underline text-[#182542]">
            Çerez Politikamızı
          </Link>{" "}
          ve{" "}
          <Link href="/gizlilik-politikasi" className="font-bold underline text-[#182542]">
            KVKK Metnimizi
          </Link>{" "}
          inceleyebilirsiniz.
        </p>

        {/* Granular Settings Drawer */}
        {showDetails && (
          <div className="space-y-2.5 pt-2 border-t border-[#EDF1F7] text-[11px]">
            <div className="flex items-center justify-between py-1">
              <div className="space-y-0.5">
                <span className="font-bold text-[#182542] block">Zorunlu ve Güvenlik Çerezleri</span>
                <span className="text-[10px] text-[#6E81A0] block">Oturum güvenliği ve CSRF koruması</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Zorunlu</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="space-y-0.5">
                <span className="font-bold text-[#182542] block">İşlevsel Çerezler</span>
                <span className="text-[10px] text-[#6E81A0] block">Fıkhi standart ve bakiye maskeleme tercihleri</span>
              </div>
              <input
                type="checkbox"
                checked={functional}
                onChange={(e) => setFunctional(e.target.checked)}
                className="w-4 h-4 accent-[#182542] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="space-y-0.5">
                <span className="font-bold text-[#182542] block">Performans &amp; Analitik</span>
                <span className="text-[10px] text-[#6E81A0] block">Sayfa hız analizi ve hata tespiti (Anonim)</span>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="w-4 h-4 accent-[#182542] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EDF1F7]/70">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] font-bold text-[#6E81A0] hover:text-[#182542] flex items-center gap-1 transition"
          >
            <SlidersHorizontal size={12} />
            <span>{showDetails ? "Özeti Gizle" : "Özelleştir"}</span>
          </button>

          <div className="flex items-center gap-2">
            {showDetails ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-3.5 py-1.5 rounded-xl bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold transition shadow-xs"
              >
                Seçimi Kaydet
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#182542] text-xs font-bold transition"
                >
                  Yalnızca Zorunlu
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-1.5 rounded-xl bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold transition shadow-xs"
                >
                  Tümünü Kabul Et
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
