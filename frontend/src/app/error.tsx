"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertOctagon, RefreshCw, Home, Mail } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or telemetry service
    console.error("Mizan App Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#EBEEF2] text-[#182542] selection:bg-[#E6F8EF] selection:text-[#0D8B52] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Background Mist */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-r from-transparent via-[#87A8CD]/20 to-[#476B9B]/15 pointer-events-none blur-3xl -z-0" />

      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl overflow-hidden bg-[#182542] flex items-center justify-center p-0.5">
            <Image
              src="/brand/logo.svg"
              alt="Mizan"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-black tracking-tight text-[#182542]">
            mizan<span className="text-emerald-600 font-serif italic ml-1">katılım</span>
          </span>
        </Link>
      </header>

      {/* Central Bento 500 Error Card */}
      <main className="relative z-10 max-w-xl mx-auto w-full my-auto py-10 space-y-6 text-center">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white/90 p-8 sm:p-12 shadow-[0_20px_50px_rgba(24,37,66,0.06)] space-y-6">
          <div className="w-14 h-14 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertOctagon size={28} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] tracking-tight">
              Beklenmeyen Bir Hata Oluştu
            </h1>
            <p className="text-xs sm:text-sm text-[#6E81A0] leading-relaxed max-w-md mx-auto">
              Sistem bu işlemi tamamlarken geçici bir aksaklıkla karşılaştı. Oturum verileriniz güvendedir. Sayfayı yenileyerek tekrar deneyebilirsiniz.
            </p>
          </div>

          {error?.digest && (
            <div className="p-2.5 rounded-xl bg-slate-100 font-mono text-[10px] text-slate-500 max-w-xs mx-auto">
              Hata Kimliği: {error.digest}
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-2xl bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#182542]/20 transition active:scale-95"
            >
              <RefreshCw size={14} />
              <span>Tekrar Dene</span>
            </button>

            <Link
              href="/"
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#182542] text-xs font-bold flex items-center gap-2 transition"
            >
              <Home size={14} />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-[#EDF1F7]">
            <a
              href="mailto:destek@mizanapp.tr"
              className="text-xs text-[#6E81A0] hover:text-[#182542] font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Mail size={13} />
              <span>Sorun devam ediyorsa teknik desteğe bildirin</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs text-[#6E81A0]">
        <span>&copy; {new Date().getFullYear()} Mizan Finans Teknolojileri. BIST Katılım &amp; Fıkhi Arındırma Platformu.</span>
      </footer>
    </div>
  );
}
