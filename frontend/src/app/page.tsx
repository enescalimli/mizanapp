"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { ComplianceBadge } from "@/components/ComplianceBadge";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import {
  ArrowUpRight,
  Radio,
  RefreshCw,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Repeat,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const [standard, setStandard] = useState<"BIST" | "AAOIFI">("BIST");
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
    const activeStatus = standard === "BIST" ? c.bistStatus : c.aaoifiStatus;
    if (filterStatus === "ALL") return true;
    if (filterStatus === "COMPLIANT") return activeStatus === "COMPLIANT";
    if (filterStatus === "GRACE")
      return (
        c.aaoifiStatus === "GRACE_PERIOD_TOLERANCE" ||
        c.bistStatus === "GRACE_PERIOD_TOLERANCE" ||
        (c.debtRatioPercent >= 29 && c.debtRatioPercent < 33)
      );
    if (filterStatus === "NON_COMPLIANT") return activeStatus === "NON_COMPLIANT";
    return true;
  });

  const compliantCount = companies.filter((c) =>
    standard === "BIST"
      ? c.bistStatus === "COMPLIANT"
      : c.aaoifiStatus === "COMPLIANT"
  ).length;
  const nonCompliantCount = companies.filter((c) =>
    standard === "BIST"
      ? c.bistStatus === "NON_COMPLIANT"
      : c.aaoifiStatus === "NON_COMPLIANT"
  ).length;

  const barChartStocks = [
    { ticker: "BERA", ratio: 8.5, status: "ok" },
    { ticker: "BIMAS", ratio: 14.8, status: "ok" },
    { ticker: "FROTO", ratio: 20.4, status: "ok" },
    { ticker: "ASELS", ratio: 22.1, status: "ok" },
    {
      ticker: "PGSUS",
      ratio: 31.4,
      status: standard === "AAOIFI" ? "bad" : "warn",
    },
    { ticker: "THYAO", ratio: 36.8, status: "bad" },
  ];

  const complianceScoreStr = standard === "BIST" ? "%85,25" : "%73,22";
  const complianceScoreNum = standard === "BIST" ? 85.25 : 73.22;
  const debtCeilingNum = standard === "BIST" ? 33 : 30;

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      {/* ÜST KARŞILAMA + ARAMA + STANDART SEÇİCİ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full theme-subtle text-xs font-semibold mb-2">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            <span>
              {source === "LIVE_HYBRID"
                ? "BIST Canlı Fiyat + KAP Otomatik Akış"
                : source === "SUPABASE_DB"
                ? "Supabase Canlı Veritabanı + KAP"
                : "KAP 2026-Q2 Finansal Veri Boru Hattı"}
            </span>
            {updatedAt && (
              <span className="font-mono opacity-75">• {updatedAt}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Katılım Finans &amp; Bilanço X-Ray Terminali
          </h1>
          <p className="text-xs sm:text-sm theme-muted mt-1">
            BIST şirketlerinin canlı fiyatlarını, faizli borç/nakit rasyolarını ve kuruşu kuruşuna arındırma tutarlarını takip edin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-80">
            <SearchBar placeholder="Hisse ara (BIMAS, THYAO, PGSUS...)" />
          </div>

          <div className="theme-card rounded-2xl p-1.5 flex items-center gap-1 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setStandard("BIST")}
              className={`px-3 py-2 rounded-xl font-bold transition-all ${
                standard === "BIST"
                  ? "accent-pill text-slate-950 shadow-sm"
                  : "theme-muted hover:opacity-100"
              }`}
            >
              BIST Katılım (&lt;%33)
            </button>
            <button
              type="button"
              onClick={() => setStandard("AAOIFI")}
              className={`px-3 py-2 rounded-xl font-bold transition-all ${
                standard === "AAOIFI"
                  ? "accent-pill text-slate-950 shadow-sm"
                  : "theme-muted hover:opacity-100"
              }`}
            >
              AAOIFI (&lt;%30)
            </button>
          </div>
        </div>
      </div>

      {/* 1. SATIR: 4'LÜ MODERN FINTECH KPI KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="theme-card rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs theme-muted font-medium">
              Örnek Portföy Toplam Değeri
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 tabular">
              +8,95%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular mt-3">
            ₺584.920,00
          </div>
          <div className="text-xs theme-muted mt-2.5 flex items-center justify-between pt-2 border-t border-[var(--border-col)]">
            <span>Net Helal Pay:</span>
            <span className="font-mono font-semibold text-emerald-400 tabular">
              ₺498.650,00
            </span>
          </div>
        </div>

        <div className="theme-card rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs theme-muted font-medium">
              Katılım Uyumluluk Skoru
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400">
              {standard === "BIST" ? "A+ Seviye" : "B+ Sınırda"}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular mt-3">
            {complianceScoreStr}
          </div>
          <div className="w-full h-2.5 rounded-full theme-subtle mt-3 overflow-hidden">
            <div
              className="h-full accent-pill transition-all duration-300 rounded-full"
              style={{ width: `${complianceScoreNum}%` }}
            />
          </div>
        </div>

        <div className="theme-card rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs theme-muted font-medium">
              Ağırlıklı Faizli Borç Oranı
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400">
              Güvenli Bölge
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular mt-3">
            %21,40
          </div>
          <div className="text-xs theme-muted mt-2.5 pt-2 border-t border-[var(--border-col)]">
            {standard} Üst Sınırı: %{debtCeilingNum},00 (Kalan Marjin: %
            {(debtCeilingNum - 21.4).toFixed(2)})
          </div>
        </div>

        <div className="theme-card rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs theme-muted font-medium">
              Çeyreklik Arındırma &amp; Zekât
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400">
              2026-Q2
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular mt-3">
            ₺294,48
          </div>
          <div className="text-xs theme-muted mt-2.5 flex items-center justify-between pt-2 border-t border-[var(--border-col)]">
            <span>Yıllık Zekât (%2,5):</span>
            <span className="font-mono font-semibold tabular">₺4.812,60</span>
          </div>
        </div>
      </div>

      {/* 2. SATIR (3 SÜTUNLU BENTO): CÜZDAN KARTI + SÜTUN GRAFİĞİ + UYUMLULUK HALKASI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sol: Dijital Katılım Portföy Cüzdan Kartı */}
        <div className="lg:col-span-4 hero-wallet-card rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between z-10">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                MİZAN KATILIM PORTFÖY KARTI
              </div>
              <div className="text-sm font-semibold mt-0.5">
                {standard === "BIST"
                  ? "BIST Katılım (DİB/TKBB) Korumalı"
                  : "AAOIFI Shariah No. 21 Korumalı"}
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-mono font-semibold">
              2026-Q2
            </div>
          </div>

          <div className="my-6 z-10">
            <div className="text-xs opacity-80">
              Toplam Arındırılmış Net Varlık
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tabular tracking-tight mt-1">
              ₺584.920,00
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-semibold">
              <span>▲ +₺48.320,00 (+8,95%)</span>
              <span className="opacity-75">• Son 30 Gün</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/15 z-10 text-center">
            <Link
              href="/portfolio"
              className="py-2.5 px-2 rounded-2xl bg-white/15 hover:bg-white/25 text-xs font-semibold transition-all inline-flex items-center justify-center gap-1"
            >
              <Plus size={13} />
              <span>Hisse Ekle</span>
            </Link>
            <Link
              href="/purification"
              className="py-2.5 px-2 rounded-2xl bg-white/15 hover:bg-white/25 text-xs font-semibold transition-all inline-flex items-center justify-center gap-1"
            >
              <Sparkles size={13} />
              <span>Arındır</span>
            </Link>
            <Link
              href="/portfolio"
              className="py-2.5 px-2 rounded-2xl bg-white text-slate-950 hover:opacity-90 text-xs font-bold transition-all inline-flex items-center justify-center gap-1"
            >
              <Repeat size={13} />
              <span>İkame Et</span>
            </Link>
          </div>
        </div>

        {/* Orta: Şirket Borç / Piyasa Değeri Dikey Sütun Grafiği */}
        <div className="lg:col-span-5 theme-card rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold">
                Faizli Borç / Piyasa Değeri Rasyo Analizi
              </h2>
              <p className="text-xs theme-muted">
                {standard} (%{debtCeilingNum}) üst sınırına göre canlı bilanço karşılaştırması
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-xl theme-subtle font-semibold">
              Eşik: %{debtCeilingNum},0
            </span>
          </div>

          <div className="grid grid-cols-6 gap-3 items-end h-44 pt-8 pb-2 px-2 border-b border-[var(--border-col)] relative mt-2">
            {/* Dinamik Eşik Çizgisi */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-rose-400/70 flex justify-end pr-1 transition-all duration-300"
              style={{ bottom: standard === "BIST" ? "78%" : "71%" }}
            >
              <span className="text-xs font-mono text-rose-400 -mt-4 bg-black/50 px-1.5 py-0.5 rounded">
                {standard} %{debtCeilingNum}
              </span>
            </div>

            {barChartStocks.map((item) => {
              const heightPct = Math.min(95, Math.round((item.ratio / 40) * 100));
              const barColorClass =
                item.status === "bad"
                  ? "bg-rose-500"
                  : item.status === "warn"
                  ? "bg-amber-400"
                  : "";
              const labelColorClass =
                item.status === "bad"
                  ? "text-rose-400 font-bold"
                  : item.status === "warn"
                  ? "text-amber-400 font-semibold"
                  : "";

              return (
                <Link
                  key={item.ticker}
                  href={`/companies/${item.ticker}`}
                  className="flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <span className={`text-xs font-mono tabular ${labelColorClass}`}>
                    %{item.ratio}
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 group-hover:opacity-85 ${barColorClass}`}
                    style={{
                      height: `${heightPct}%`,
                      background:
                        item.status === "ok" ? "var(--chart-bar-1)" : undefined,
                    }}
                  />
                  <span className={`text-xs font-bold font-mono ${labelColorClass}`}>
                    {item.ticker}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs theme-muted pt-3">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--chart-bar-1)" }}
              />
              Tam Uygun (&lt;%30)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Sınırda (%30-%33)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Eşik İhlali (&gt;%{debtCeilingNum})
            </span>
          </div>
        </div>

        {/* Sağ: Halka (Donut) Uygunluk & Dağılım Kartı */}
        <div className="lg:col-span-3 theme-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold">Uyumluluk Halkası</h2>
            <p className="text-xs theme-muted">
              Piyasa değerine göre portföy dağılımı
            </p>
          </div>

          <div className="flex items-center justify-center my-3">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="rgba(148,163,184,0.15)"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray="175 240"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="12"
                  strokeDasharray="28 240"
                  strokeDashoffset="-180"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="12"
                  strokeDasharray="32 240"
                  strokeDashoffset="-212"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold font-mono tabular">
                  {complianceScoreStr}
                </span>
                <span className="text-xs theme-muted">Helal Oranı</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Tam Uygun ({compliantCount} Şirket)
              </span>
              <span className="font-mono font-semibold tabular">%73,2</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Sınırda İzlenen
              </span>
              <span className="font-mono font-semibold tabular">%12,0</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Kapsam Dışı ({nonCompliantCount} Şirket)
              </span>
              <span className="font-mono font-semibold tabular">%14,8</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SATIR (2 SÜTUNLU BENTO): CANLI BİST TABLOSU + CANLI KAP BİLDİRİMLERİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sol: BIST Katılım Hisseleri & Bilanço X-Ray Matrisi */}
        <div className="lg:col-span-8 theme-card rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <TrendingUp size={18} className="text-sky-400" />
                <span>BIST Katılım Hisseleri &amp; KAP Bilanço X-Ray</span>
              </h2>
              <p className="text-xs theme-muted mt-0.5">
                Canlı fiyatlar (30 sn oto-senkron), görsel borç/nakit barları ve pay başı arındırma tutarları
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filterStatus === "ALL"
                    ? "accent-pill text-slate-950"
                    : "theme-subtle theme-muted"
                }`}
              >
                Tümü ({companies.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("COMPLIANT")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filterStatus === "COMPLIANT"
                    ? "bg-emerald-500 text-slate-950"
                    : "theme-subtle text-emerald-400"
                }`}
              >
                Uygun ({compliantCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("GRACE")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filterStatus === "GRACE"
                    ? "bg-amber-400 text-slate-950"
                    : "theme-subtle text-amber-400"
                }`}
              >
                Sınırda
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("NON_COMPLIANT")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filterStatus === "NON_COMPLIANT"
                    ? "bg-rose-500 text-white"
                    : "theme-subtle text-rose-400"
                }`}
              >
                İhlal ({nonCompliantCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm tabular">
              <thead>
                <tr className="border-b border-[var(--border-col)] text-xs theme-muted font-semibold">
                  <th className="py-3 px-3">Şirket</th>
                  <th className="py-3 px-3">BIST / AAOIFI</th>
                  <th className="py-3 px-3 text-right">Canlı Fiyat</th>
                  <th className="py-3 px-3">Faizli Borç (&lt;%{debtCeilingNum})</th>
                  <th className="py-3 px-3 text-right">Uygunsuz Gelir</th>
                  <th className="py-3 px-3 text-right">Arındırma / Pay</th>
                  <th className="py-3 px-3 text-center">X-Ray</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-col)]">
                {filteredCompanies.map((c) => {
                  const isPositive = !c.change24h.startsWith("-");
                  const debtBarWidth = Math.min(
                    100,
                    Math.round((c.debtRatioPercent / 38) * 100)
                  );
                  const debtBarColor =
                    c.debtRatioPercent >= 33
                      ? "bg-rose-500"
                      : c.debtRatioPercent >= 30
                      ? "bg-amber-400"
                      : "bg-emerald-400";

                  return (
                    <tr
                      key={c.ticker}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3.5 px-3">
                        <Link
                          href={`/companies/${c.ticker}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-2xl theme-subtle border border-[var(--border-col)] flex items-center justify-center font-mono font-bold text-xs group-hover:border-sky-400/50 transition-colors">
                            {c.ticker.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold group-hover:text-sky-400 transition-colors">
                              {c.ticker}
                            </div>
                            <div className="text-xs theme-muted max-w-[165px] truncate">
                              {c.name}
                            </div>
                          </div>
                        </Link>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1">
                          <ComplianceBadge
                            status={
                              standard === "BIST" ? c.bistStatus : c.aaoifiStatus
                            }
                            size="sm"
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono">
                        <div className="font-bold">₺{c.priceTRY}</div>
                        <div
                          className={`text-xs font-semibold ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {c.change24h}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-24 h-2 rounded-full theme-subtle overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full ${debtBarColor}`}
                              style={{ width: `${debtBarWidth}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-xs ${
                              c.debtRatioPercent >= 33
                                ? "text-rose-400 font-bold"
                                : c.debtRatioPercent >= 30
                                ? "text-amber-400 font-semibold"
                                : ""
                            }`}
                          >
                            %{c.debtRatioPercent.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono">
                        <span
                          className={
                            c.impureIncomePercent >= 5
                              ? "text-rose-400 font-bold"
                              : ""
                          }
                        >
                          %{c.impureIncomePercent.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-emerald-400">
                        ₺{c.purificationPerShareTRY}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <Link
                          href={`/companies/${c.ticker}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl theme-subtle text-xs font-semibold hover:opacity-85 transition"
                        >
                          <span>İncele</span>
                          <ArrowUpRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sağ: Canlı KAP Bildirimleri & Metodoloji Özeti */}
        <div className="lg:col-span-4 space-y-5">
          <div className="theme-card rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold">Canlı KAP Bildirimleri</h2>
                  <p className="text-xs theme-muted">
                    Bilanço düştüğünde otomatik tarama tetiklenir
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refreshNow()}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-subtle text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  <RefreshCw
                    size={12}
                    className={isRefreshing ? "animate-spin text-sky-400" : ""}
                  />
                  <span>Yenile</span>
                </button>
              </div>

              <div className="space-y-3">
                {kapDisclosures.slice(0, 4).map((disc) => (
                  <div
                    key={disc.disclosureId}
                    className="theme-subtle rounded-2xl p-4 space-y-1.5 border border-[var(--border-col)]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/companies/${disc.ticker}`}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold hover:underline"
                        >
                          {disc.ticker}
                        </Link>
                        <span className="font-mono theme-muted">
                          {disc.publishedAt}
                        </span>
                      </div>
                      {disc.triggersRescreening && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-medium text-xs">
                          <FileSpreadsheet size={11} />
                          Oto-Tarama
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold">{disc.title}</div>
                    <p className="text-xs theme-muted leading-relaxed line-clamp-2">
                      {disc.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Katılım Kriterleri Hızlı Bilgi Kartı */}
          <div className="theme-card rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h3 className="text-sm font-bold">
                3 Aşamalı Katılım Denetim Kuralı
              </h3>
            </div>
            <div className="space-y-2 text-xs theme-muted leading-relaxed">
              <p>
                <strong className="text-emerald-400">1. Faizli Borç / PD:</strong>{" "}
                BIST Katılım için &lt;%33, AAOIFI için &lt;%30 olmalıdır.
              </p>
              <p>
                <strong className="text-sky-400">2. Faizli Nakit / PD:</strong>{" "}
                Vadeli mevduat ve faizli menkul kıymetler &lt;%33 (&lt;%30) olmalıdır.
              </p>
              <p>
                <strong className="text-amber-400">
                  3. Uygunsuz Gelir &amp; Arındırma:
                </strong>{" "}
                Toplam hasılatın %5&apos;ini aşamaz; %5 altındaki kısım pay başına kuruşu kuruşuna arındırılır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
