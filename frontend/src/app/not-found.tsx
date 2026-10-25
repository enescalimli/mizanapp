"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Home, BarChart3, Calendar, ArrowRight, HelpCircle } from "lucide-react";

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
    <div className="min-h-screen bg-[#EBEEF2] text-[#182542] selection:bg-[#E6F8EF] selection:text-[#0D8B52] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Background Mist */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-r from-transparent via-[#87A8CD]/20 to-[#476B9B]/15 pointer-events-none blur-3xl -z-0" />

      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl overflow-hidden bg-[#182542] flex items-center justify-center p-0.5 group-hover:scale-105 transition">
            <Image
              src="/brand/logo.svg"
              alt="Mizan"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-black tracking-tight text-[#182542] dark:text-white">
            mizan<span className="text-[#273869] dark:text-slate-300 font-serif italic ml-1">katılım</span>
          </span>
        </Link>

        <Link
          href="mailto:destek@mizanapp.tr"
          className="text-xs font-bold text-[#6E81A0] hover:text-[#182542] flex items-center gap-1.5 transition"
        >
          <HelpCircle size={15} />
          <span>Yardım &amp; Destek</span>
        </Link>
      </header>

      {/* Central Bento 404 Card */}
      <main className="relative z-10 max-w-2xl mx-auto w-full my-auto py-10 space-y-6 text-center">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white/90 p-8 sm:p-12 shadow-[0_20px_50px_rgba(24,37,66,0.06)] space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            <span>Hata Kodu: 404 &bull; Sayfa Bulunamadı</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#182542] tracking-tight">
              Aradığınız Sayfa <span className="font-serif italic text-[#405881]">Mevcut Değil</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6E81A0] max-w-md mx-auto leading-relaxed">
              Ulaşmaya çalıştığınız hisse senedi veya bağlantı taşınmış, silinmiş ya da geçici olarak yayından kaldırılmış olabilir.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="BIST hisse kodu veya şirket ara (Örn: THYAO, BIMAS)..."
              className="w-full pl-10 pr-24 py-3.5 rounded-2xl bg-white border border-[#EDF1F7] text-xs font-semibold text-[#182542] placeholder-[#6E81A0] focus:border-[#182542] focus:ring-2 focus:ring-[#182542]/10 outline-none transition shadow-2xs"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E81A0]" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-xl bg-[#182542] hover:bg-[#273869] text-white text-xs font-bold transition shadow-xs"
            >
              Ara
            </button>
          </form>

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-[#EDF1F7] flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#182542] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Home size={14} />
              <span>Ana Sayfa</span>
            </Link>
            <Link
              href="/tarayici"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#182542] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <BarChart3 size={14} />
              <span>Hisse Tarayıcı</span>
            </Link>
            <Link
              href="/ipo"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#182542] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Calendar size={14} />
              <span>Halka Arz Takvimi</span>
            </Link>
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
