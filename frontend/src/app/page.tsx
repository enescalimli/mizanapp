"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { ComplianceBadge } from "@/components/ComplianceBadge";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import {
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  Layers,
  Search,
  Radio,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

export default function HomePage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const {
    companies,
    kapDisclosures,
    updatedAt,
    source,
    isRefreshing,
    refreshNow,
  } = useLiveMarketData(30000);

  const filteredCompanies = companies.filter((c) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "COMPLIANT") return c.bistStatus === "COMPLIANT";
    if (filterStatus === "GRACE")
      return (
        c.aaoifiStatus === "GRACE_PERIOD_TOLERANCE" ||
        c.bistStatus === "GRACE_PERIOD_TOLERANCE"
      );
    if (filterStatus === "NON_COMPLIANT") return c.bistStatus === "NON_COMPLIANT";
    return true;
  });

  return (
    <main className="min-h-screen text-slate-100 pb-24 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Apple-grade Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06]">
        {/* Luminous Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-teal-900/5 to-transparent pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl text-emerald-400 text-xs font-semibold shadow-[0_2px_12px_rgba(16,185,129,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-tight">KAP Bilanço &amp; Dipnot X-Ray Motoru</span>
          </div>

          {/* Display Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-[-0.035em] text-white leading-[1.08]">
            Helal Kazancınızı Koruyun:{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300 bg-clip-text text-transparent">
              Katılım Uygunluk &amp; Arındırma
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            BIST Katılım (DİB / TKBB) ve AAOIFI Shariah No. 21 standartlarında
            bilançoların dipnotlarını tarar, şüpheli gelirleri kuruşu kuruşuna
            arındırır ve zekatınızı hesaplar.
          </p>

          {/* Spotlight Search */}
          <div className="pt-4 max-w-2xl mx-auto">
            <SearchBar placeholder="Hisse kodu veya şirket adı arayın (BIMAS, THYAO, ASELS, FROTO...)" />
          </div>

          {/* Popular shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-2">
            <span className="text-slate-500 text-[11px] font-medium tracking-tight">Hızlı Arama:</span>
            {["BIMAS", "THYAO", "ASELS", "TUPRS", "EREGL", "SISE", "FROTO"].map(
              (ticker) => (
                <Link
                  key={ticker}
                  href={`/companies/${ticker}`}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-white/[0.07] transition-all font-mono text-xs text-slate-300"
                >
                  {ticker}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Index Metrics Section (Taste-Skill: Type-driven KPIs, No icons in circles) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="apple-card p-5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">
              TARANAN BİST HİSSELERİ
            </span>
            <div className="text-3xl font-bold text-white tracking-tight font-mono tabular-nums">
              542
            </div>
            <span className="text-[11px] text-slate-500 block mt-1 font-medium">
              Son KAP 2026-Q2 Dönemi
            </span>
          </div>

          <div className="apple-card p-5 border-emerald-500/20 hover:border-emerald-500/35">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest block">
                KATILIMA UYGUN
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-3xl font-bold text-emerald-400 tracking-tight font-mono tabular-nums">
              388{" "}
              <span className="text-xs font-normal text-slate-400">
                (%71.6)
              </span>
            </div>
            <span className="text-[11px] text-emerald-400/80 block mt-1 font-medium">
              BIST Katılım Kriterlerini Geçenler
            </span>
          </div>

          <div className="apple-card p-5 border-amber-500/20 hover:border-amber-500/35">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-widest block">
                HOŞGÖRÜ SÜRESİNDE (İZLEME)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-300 tracking-tight font-mono tabular-nums">
              16{" "}
              <span className="text-xs font-normal text-slate-400">
                (%2.9)
              </span>
            </div>
            <span className="text-[11px] text-amber-400/80 block mt-1 font-medium">
              %1.5 Tampon Bölgede (Grace Period)
            </span>
          </div>

          <div className="apple-card p-5 border-rose-500/20 hover:border-rose-500/35">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-widest block">
                KAPSAM DIŞI / UYGUN DEĞİL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-400 tracking-tight font-mono tabular-nums">
              138{" "}
              <span className="text-xs font-normal text-slate-400">
                (%25.5)
              </span>
            </div>
            <span className="text-[11px] text-rose-400/80 block mt-1 font-medium">
              Faizli Finans veya Rasyo Aşımı
            </span>
          </div>
        </div>

        {/* Portfolio & Smart Alternative Callout Banner */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950/80 border border-emerald-500/25 p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Yeni • Portföy &amp; Akıllı İkame Sistemi</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Portföyünüzdeki Hisseler Katılımdan Çıktığında Haberdar Olun &amp; Helal Alternatiflerle İkame Edin
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Hisse kodu, lot ve alış tarihiyle varlıklarınızı kaydedin; borç veya faiz eşiğini aşan hisseler için anında alarm alın, aynı sektördeki %100 uygun benzer hisselerle tek tıkla ikame yapın ve kuruşu kuruşuna arındırma ücretini hesaplayın.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="apple-btn-primary shrink-0 text-xs py-2.5 px-4 shadow-lg shadow-emerald-950/80"
          >
            <span>Portföy Paneline Git</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Canlı KAP Bildirim & Otomatik Tarama Akışı */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="apple-glass rounded-2xl border border-white/[0.08] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold">
                <Radio size={12} className="animate-pulse" />
                <span>CANLI KAP &amp; BIST OTO-SENKRON</span>
              </span>
              <span className="text-xs text-slate-400">
                Yeni bilanço ve katılım bilgi formları düştüğünde oranlar otomatik güncellenir
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>
                Kaynak:{" "}
                <strong className="text-slate-200">
                  {source === "LIVE_HYBRID"
                    ? "BIST Canlı + KAP"
                    : source === "SUPABASE_DB"
                    ? "Supabase + KAP"
                    : "KAP 2026-Q2"}
                </strong>
              </span>
              {updatedAt && <span>Son Güncelleme: {updatedAt}</span>}
              <button
                onClick={() => refreshNow()}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 transition-colors disabled:opacity-50"
                title="Şimdi Yenile"
              >
                <RefreshCw size={12} className={isRefreshing ? "animate-spin text-emerald-400" : ""} />
                <span>Yenile</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kapDisclosures.slice(0, 3).map((disc) => (
              <div
                key={disc.disclosureId}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/companies/${disc.ticker}`}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs hover:bg-emerald-500/25"
                      >
                        {disc.ticker}
                      </Link>
                      <span className="text-[10px] font-mono text-slate-400">
                        {disc.publishedAt}
                      </span>
                    </div>
                    {disc.triggersRescreening && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-[10px] font-medium">
                        <FileSpreadsheet size={10} />
                        Oto-Tarama
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-100 line-clamp-1">
                    {disc.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {disc.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Stock Table Section */}
      <section id="endeks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <TrendingUp className="text-emerald-400" size={20} />
              BIST Katılım Endeksi Şirketleri
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Şirketlerin canlı fiyatları (30 sn oto-güncelleme), finansal oranları ve hisse başı arındırma tutarları.
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="apple-segmented-group">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`apple-segmented-item ${
                filterStatus === "ALL" ? "active" : ""
              }`}
            >
              Tümü ({companies.length})
            </button>
            <button
              onClick={() => setFilterStatus("COMPLIANT")}
              className={`apple-segmented-item ${
                filterStatus === "COMPLIANT" ? "active text-emerald-400" : ""
              }`}
            >
              Uygun
            </button>
            <button
              onClick={() => setFilterStatus("GRACE")}
              className={`apple-segmented-item ${
                filterStatus === "GRACE" ? "active text-amber-300" : ""
              }`}
            >
              Hoşgörüde
            </button>
            <button
              onClick={() => setFilterStatus("NON_COMPLIANT")}
              className={`apple-segmented-item ${
                filterStatus === "NON_COMPLIANT" ? "active text-rose-300" : ""
              }`}
            >
              Kapsam Dışı
            </button>
          </div>
        </div>

        {/* Floating Frosted Glass Table */}
        <div className="apple-glass rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  <th className="py-3.5 px-5">ŞİRKET</th>
                  <th className="py-3.5 px-4">BİST KATILIM</th>
                  <th className="py-3.5 px-4">AAOIFI</th>
                  <th className="py-3.5 px-4 text-right">FAİZLİ BORÇ (&lt;%33)</th>
                  <th className="py-3.5 px-4 text-right">FAİZLİ NAKİT (&lt;%33)</th>
                  <th className="py-3.5 px-4 text-right">UYGUNSUZ GELİR (&lt;%5)</th>
                  <th className="py-3.5 px-4 text-right">HİSSE BAŞI ARINDIRMA</th>
                  <th className="py-3.5 px-5 text-center">DETAY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm font-normal">
                {filteredCompanies.map((c) => (
                  <tr
                    key={c.ticker}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/companies/${c.ticker}`}
                        className="flex items-center gap-3.5"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.09] flex items-center justify-center font-bold text-slate-200 text-xs font-mono group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-colors shadow-sm">
                          {c.ticker}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors tracking-tight">
                            {c.name}
                          </div>
                          <div className="text-xs text-slate-400 font-mono tabular-nums">
                            {c.sector} &bull; ₺{c.priceTRY} ({c.change24h})
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <ComplianceBadge status={c.bistStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <ComplianceBadge status={c.aaoifiStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <span
                        className={
                          c.debtRatioPercent > 33
                            ? "text-rose-400 font-bold"
                            : c.debtRatioPercent > 30
                            ? "text-amber-300 font-semibold"
                            : "text-slate-300"
                        }
                      >
                        %{c.debtRatioPercent.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <span
                        className={
                          c.cashRatioPercent > 33
                            ? "text-rose-400 font-bold"
                            : "text-slate-300"
                        }
                      >
                        %{c.cashRatioPercent.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <span
                        className={
                          c.impureIncomePercent >= 5.0
                            ? "text-rose-400 font-bold"
                            : "text-slate-300"
                        }
                      >
                        %{c.impureIncomePercent.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                      ₺{c.purificationPerShareTRY}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <Link
                        href={`/companies/${c.ticker}`}
                        className="apple-btn-secondary text-xs py-1 px-2.5 rounded-lg text-slate-300 hover:text-white"
                      >
                        <span>İncele</span>
                        <ArrowUpRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Katılım Finansmanı Uygunluk Kriterleri Nasıl Hesaplanır?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-normal">
            Platformumuz, Diyanet İşleri Başkanlığı, TKBB ve AAOIFI standartları gereğince finansal tabloları kuruşu kuruşuna denetler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="apple-card p-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
              1
            </div>
            <h4 className="text-sm font-bold text-white mb-2 tracking-tight">
              Faaliyet Alanı (Sektör) Filtresi
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Faizli bankacılık/sigortacılık, alkol, tütün, şans oyunları, domuz ürünleri ve uygunsuz eğlence faaliyetleri yürüten şirketler finansal rasyolarına bakılmaksızın doğrudan elenir.
            </p>
          </div>

          <div className="apple-card p-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
              2
            </div>
            <h4 className="text-sm font-bold text-white mb-2 tracking-tight">
              Borç ve Nakit Rasyoları (&lt;%33 / &lt;%30)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Faizli borçların ve faizli nakit/mevduat varlıklarının piyasa değerine (veya toplam varlıklara) oranı BIST Katılım için &lt;%33, AAOIFI için &lt;%30 olmak zorundadır. %1.5 tampon bölge mekanizmasıyla piyasa çöküşleri filtrelenir.
            </p>
          </div>

          <div className="apple-card p-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
              3
            </div>
            <h4 className="text-sm font-bold text-white mb-2 tracking-tight">
              Uygunsuz Gelir ve Arındırma (&lt;%5)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Şirketin faiz gelirleri toplam hasılatın %5&apos;ini aşamaz. %5&apos;in altında kalan uygunsuz gelirler ise yatırımcının portföyündeki lot sayısına ve tutma gününe göre kuruşu kuruşuna arındırılır.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
