"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Home, BarChart3, Calendar, HelpCircle } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/tarayici?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/tarayici");
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF0F4] dark:bg-[#000000] text-[#14151A] dark:text-[#F1F3F7] selection:bg-[#E6F8EF] selection:text-[#0D8B52] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden transition-colors">
      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="text-xl font-black tracking-tight text-black dark:text-white">
            mizan<span className="text-slate-500 dark:text-zinc-400 font-serif italic ml-1">katılım</span>
          </span>
        </Link>

        <Link
          href="mailto:destek@mizanapp.tr"
          className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition"
        >
          <HelpCircle size={15} />
          <span>Yardım &amp; Destek</span>
        </Link>
      </header>

      {/* Central Bento 404 Card */}
      <main className="relative z-10 max-w-xl mx-auto w-full my-auto py-10 space-y-6 text-center">
        <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-3xl border border-black/10 dark:border-white/10 p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <span>404 &bull; Sayfa Bulunamadı</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
              Aradığınız Sayfa Bulunamadı
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Ulaşmaya çalıştığınız hisse senedi veya bağlantı taşınmış, silinmiş ya da geçici olarak yayından kaldırılmış olabilir.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="BIST hisse kodu veya şirket ara (Örn: BIMAS, ASELS)..."
              className="w-full pl-10 pr-20 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-semibold text-black dark:text-white placeholder-slate-400 outline-none focus:border-black dark:focus:border-white transition"
            />
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold transition hover:opacity-90 cursor-pointer"
            >
              Ara
            </button>
          </form>

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-black/5 dark:border-white/10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Home size={13} />
              <span>Ana Sayfa</span>
            </Link>
            <Link
              href="/tarayici"
              className="px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <BarChart3 size={13} />
              <span>Hisse Tarayıcı</span>
            </Link>
            <Link
              href="/portfolio"
              className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center gap-1.5 transition hover:opacity-90 cursor-pointer"
            >
              <span>Portföyüm</span>
            </Link>
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
