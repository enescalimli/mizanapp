"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCw, Home, Mail } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Mizan App Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#EEF0F4] dark:bg-[#000000] text-[#14151A] dark:text-[#F1F3F7] selection:bg-[#E6F8EF] selection:text-[#0D8B52] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden transition-colors">
      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="text-xl font-black tracking-tight text-black dark:text-white">
            mizan<span className="text-slate-500 dark:text-zinc-400 font-serif italic ml-1">katılım</span>
          </span>
        </Link>
      </header>

      {/* Central Bento 500 Error Card */}
      <main className="relative z-10 max-w-lg mx-auto w-full my-auto py-10 space-y-6 text-center">
        <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-3xl border border-black/10 dark:border-white/10 p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertOctagon size={24} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight">
              Beklenmeyen Bir Hata Oluştu
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Sistem bu işlemi tamamlarken geçici bir aksaklıkla karşılaştı. Portföy verileriniz güvendedir.
            </p>
          </div>

          {error?.digest && (
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 font-mono text-[10px] text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
              Hata Kimliği: {error.digest}
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center gap-2 shadow-xs transition hover:opacity-90 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Tekrar Dene</span>
            </button>

            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Home size={13} />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-black/5 dark:border-white/10">
            <a
              href="mailto:destek@mizanapp.tr"
              className="text-xs text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Mail size={13} />
              <span>Teknik destek ekibine bildirin</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs text-slate-500 dark:text-zinc-400">
        <span>&copy; {new Date().getFullYear()} Mizan Finans Teknolojileri.</span>
      </footer>
    </div>
  );
}
