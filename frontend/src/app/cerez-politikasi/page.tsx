"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Check, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";

export default function CookiePolicyPage() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true and locked
    analytics: true,
    functional: true,
  });
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mizan_cookie_preferences");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPreferences({
            essential: true,
            analytics: !!parsed.analytics,
            functional: !!parsed.functional,
          });
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleSavePreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mizan_cookie_preferences", JSON.stringify(preferences));
      localStorage.setItem("mizan_cookie_consent_given", "true");
    }
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleResetConsent = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mizan_cookie_preferences");
      localStorage.removeItem("mizan_cookie_consent_given");
      window.location.reload();
    }
  };

  return (
    <PaynoShell badge="çerezler">
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6E81A0]">
          <Link href="/" className="hover:text-[#182542] flex items-center gap-1 transition">
            <ArrowLeft size={13} />
            <span>Ana Sayfa</span>
          </Link>
          <span>/</span>
          <span className="text-[#182542] font-semibold">Çerez Politikası &amp; İzin Yönetimi</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-bold">
            <Cookie size={14} className="text-amber-600" />
            <span>GDPR Consent Mode v2 &bull; Granüler İzin Yönetimi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] tracking-tight">
            Çerez Politikası ve <span className="font-serif italic text-[#405881]">İzin Tercihleri</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#6E81A0] leading-relaxed">
            Mizan olarak kullanıcı deneyiminizi geliştirmek, sitemizin teknik güvenliğini sağlamak ve fıkhi arındırma tercihlerinizi hatırlayabilmek amacıyla çerezler (cookies) kullanmaktayız. Tercihlerinizi aşağıdan dilediğiniz gibi özelleştirebilirsiniz.
          </p>
        </div>

        {/* Interactive Consent Management Panel */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-5">
          <div className="flex items-center justify-between border-b border-[#EDF1F7] pb-4">
            <div>
              <h2 className="text-sm font-bold text-[#182542]">Çerez İzinlerinizi Özelleştirin</h2>
              <p className="text-xs text-[#6E81A0]">Değişiklikler anında tarayıcınıza kaydedilir.</p>
            </div>
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-4 py-2 rounded-xl bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold shadow-xs transition"
            >
              Tercihleri Kaydet
            </button>
          </div>

          {savedNotification && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Çerez tercihleriniz başarıyla güncellendi!</span>
            </div>
          )}

          {/* Cookie Types */}
          <div className="space-y-4">
            {/* Essential Cookies */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#182542]">1. Zorunlu ve Güvenlik Çerezleri</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Her Zaman Aktif
                  </span>
                </div>
                <p className="text-[11px] text-[#6E81A0] leading-relaxed">
                  Platformun temel işlevlerini yerine getirebilmesi, oturumun güvenliği ve CSRF saldırılarına karşı korunma için teknik olarak zorunludur. Devre dışı bırakılamaz.
                </p>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="w-4 h-4 text-[#182542] accent-[#182542] cursor-not-allowed mt-1"
              />
            </div>

            {/* Functional Cookies */}
            <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#182542]">2. İşlevsel &amp; Tercih Çerezleri</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Önerilen
                  </span>
                </div>
                <p className="text-[11px] text-[#6E81A0] leading-relaxed">
                  Seçtiğiniz fıkhi standart (DİB / AAOIFI), portföy gizleme durumu ve arındırma hesaplama tercihlerinizi bir sonraki ziyaretinizde anımsamak için kullanılır.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                className="w-4 h-4 text-[#182542] accent-[#182542] cursor-pointer mt-1"
              />
            </div>

            {/* Analytics Cookies */}
            <div className="p-4 rounded-2xl bg-white border border-[#EDF1F7] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#182542]">3. Performans ve Analitik Çerezleri</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    İsteğe Bağlı
                  </span>
                </div>
                <p className="text-[11px] text-[#6E81A0] leading-relaxed">
                  Hangi hisselerin daha sık incelendiğini, platform hızını ve teknik hata noktalarını tespit ederek sistemi optimize etmemize yardımcı olur. Kişisel veriler anonimleştirilir.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="w-4 h-4 text-[#182542] accent-[#182542] cursor-pointer mt-1"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleResetConsent}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline transition"
            >
              Çerez İzinlerini Sıfırla ve Banner&apos;ı Yeniden Göster
            </button>
          </div>
        </div>
      </div>
    </PaynoShell>
  );
}
