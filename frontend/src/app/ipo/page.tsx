"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Clock,
  Coins,
  ShieldCheck,
  Search,
  ExternalLink,
  Info,
  Sparkles,
} from "lucide-react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { IpoCalendarItem, fetchIpoCalendarFromSupabase } from "@/lib/supabaseClient";
import { formatTRY } from "@/lib/decimal/decimal";

// Fallback Seed Data (Matches Supabase ipo_calendar initial rows)
const INITIAL_IPO_DATA: IpoCalendarItem[] = [
  {
    id: "ipo-1",
    company_name: "Mizan Yenilenebilir Enerji A.Ş.",
    ticker: "MIZAN",
    ipo_date_range: "22-24 Ekim 2026",
    ipo_start_date: "2026-10-22",
    ipo_end_date: "2026-10-24",
    ipo_price_try: "42.50",
    total_shares_offered: "45000000",
    issue_size_try: "1912500000.00",
    distribution_method: "EŞİT DAĞITIM",
    lead_consortium: "Vakıf Yatırım Menkul Değerler",
    katilim_status: "COMPLIANT",
    is_bist_katilim_suitable: true,
    prospectus_shariah_decision:
      "İzahnamenin 2.4 ve 8.1 maddeleri incelenmiş olup, şirketin faaliyet alanı güneş ve rüzgar enerjisi santralleri yatırımıdır. Faizli borç oranı %14.2 olup TKBB ve BIST Katılım kriterlerine (%33) tam uygundur.",
    fund_usage_shariah_compliant: true,
    interest_debt_ratio_percent: 14.2,
    impure_income_ratio_percent: 0.85,
    prospectus_url: "https://kap.gov.tr/mizan-izahname",
  },
  {
    id: "ipo-2",
    company_name: "Anadolu Katılım Lojistik A.Ş.",
    ticker: "AKLOG",
    ipo_date_range: "28-30 Ekim 2026",
    ipo_start_date: "2026-10-28",
    ipo_end_date: "2026-10-30",
    ipo_price_try: "28.00",
    total_shares_offered: "60000000",
    issue_size_try: "1680000000.00",
    distribution_method: "EŞİT DAĞITIM",
    lead_consortium: "Halk Yatırım Menkul Değerler",
    katilim_status: "COMPLIANT",
    is_bist_katilim_suitable: true,
    prospectus_shariah_decision:
      "Şirket uluslararası kara ve demiryolu taşımacılığı yapmaktadır. Halka arzdan elde edilecek net gelirin %80'i elektrikli çekici filosu alımında kullanılacaktır. Faizli kredi kapama payı sınır içindedir.",
    fund_usage_shariah_compliant: true,
    interest_debt_ratio_percent: 19.8,
    impure_income_ratio_percent: 1.4,
    prospectus_url: "https://kap.gov.tr/aklog-izahname",
  },
  {
    id: "ipo-3",
    company_name: "Neo Finans Faktoring A.Ş.",
    ticker: "NEOFA",
    ipo_date_range: "5-7 Kasım 2026",
    ipo_start_date: "2026-11-05",
    ipo_end_date: "2026-11-07",
    ipo_price_try: "18.50",
    total_shares_offered: "30000000",
    issue_size_try: "555000000.00",
    distribution_method: "ORANSAL DAĞITIM",
    lead_consortium: "Garanti BBVA Yatırım",
    katilim_status: "NON_COMPLIANT",
    is_bist_katilim_suitable: false,
    prospectus_shariah_decision:
      "Ana faaliyet konusu geleneksel faktoring ve iskonto/faizli alacak temliki olduğundan TKBB ve AAOIFI standartlarına göre katılım endeksine UYGUN DEĞİLDİR.",
    fund_usage_shariah_compliant: false,
    interest_debt_ratio_percent: 84.5,
    impure_income_ratio_percent: 92.0,
    prospectus_url: "https://kap.gov.tr/neofa-izahname",
  },
  {
    id: "ipo-4",
    company_name: "Bereket Tarım ve Gıda Sanayi A.Ş.",
    ticker: "BERKT",
    ipo_date_range: "12-14 Kasım 2026",
    ipo_start_date: "2026-11-12",
    ipo_end_date: "2026-11-14",
    ipo_price_try: "34.70",
    total_shares_offered: "25000000",
    issue_size_try: "867500000.00",
    distribution_method: "EŞİT DAĞITIM",
    lead_consortium: "Ziraat Yatırım",
    katilim_status: "COMPLIANT_WITH_PURIFICATION",
    is_bist_katilim_suitable: true,
    prospectus_shariah_decision:
      "Sera ve organik tarım faaliyeti yürütmektedir. Faizli borç oranı %24.6, faizli nakit oranı %12.1 ile eşik altındadır. Vadeli mevduattan elde edilen %1.85 faiz geliri için pay başına 0.042 ₺ arındırma şartı bulunmaktadır.",
    fund_usage_shariah_compliant: true,
    interest_debt_ratio_percent: 24.6,
    impure_income_ratio_percent: 1.85,
    prospectus_url: "https://kap.gov.tr/berkt-izahname",
  },
];

export default function IpoCalendarPage() {
  const [ipoList, setIpoList] = useState<IpoCalendarItem[]>(INITIAL_IPO_DATA);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFromSupabase, setIsFromSupabase] = useState<boolean>(false);

  useEffect(() => {
    fetchIpoCalendarFromSupabase().then(({ data, error }) => {
      if (data && data.length > 0) {
        setIpoList(data);
        setIsFromSupabase(true);
      }
    });
  }, []);

  const filteredItems = useMemo(() => {
    return ipoList.filter((item) => {
      const matchesSearch =
        item.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ticker.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "COMPLIANT") {
        return item.katilim_status === "COMPLIANT" || item.katilim_status === "COMPLIANT_WITH_PURIFICATION";
      }
      if (filterStatus === "NON_COMPLIANT") {
        return item.katilim_status === "NON_COMPLIANT";
      }
      return true;
    });
  }, [ipoList, searchQuery, filterStatus]);

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Calendar className="text-emerald-400" />
              <span>Katılım Halka Arz Takvimi</span>
            </h1>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] tabular-nums">
                {isFromSupabase ? "Supabase Canlı DB" : "Aktif İzahname Analizleri"}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            BIST Halka arzlarının SPK onaylı izahnamelerindeki katılım finans ilkeleri, fon kullanım yeri ve arındırma analizleri.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="apple-segmented-group">
            <button
              type="button"
              onClick={() => setFilterStatus("ALL")}
              className={`apple-segmented-item ${
                filterStatus === "ALL" ? "active text-emerald-400" : ""
              }`}
            >
              Tümü ({ipoList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("COMPLIANT")}
              className={`apple-segmented-item ${
                filterStatus === "COMPLIANT" ? "active text-emerald-400" : ""
              }`}
            >
              Katılıma Uygun
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("NON_COMPLIANT")}
              className={`apple-segmented-item ${
                filterStatus === "NON_COMPLIANT" ? "active text-rose-400" : ""
              }`}
            >
              Kapsam Dışı
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={15} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Şirket adı veya hisse kodu ile ara (Örn: MIZAN)..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-500"
        />
      </div>

      {/* IPO Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.map((item) => {
          const isCompliant = item.katilim_status === "COMPLIANT";
          const isWithPurif = item.katilim_status === "COMPLIANT_WITH_PURIFICATION";
          const isNonCompliant = item.katilim_status === "NON_COMPLIANT";

          return (
            <SpotlightCard
              key={item.id}
              className={`p-6 border-white/[0.08] ${
                isNonCompliant
                  ? "border-rose-500/25"
                  : isWithPurif
                  ? "border-amber-500/25"
                  : "border-emerald-500/25"
              }`}
              spotlightColor={
                isNonCompliant
                  ? "rgba(244, 63, 94, 0.08)"
                  : isWithPurif
                  ? "rgba(245, 158, 11, 0.08)"
                  : "rgba(16, 185, 129, 0.08)"
              }
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white font-mono tracking-tight">
                      {item.ticker}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                      {item.distribution_method}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-300 mt-0.5">
                    {item.company_name}
                  </h3>
                </div>

                {/* Katılım Status Badge */}
                <div>
                  {isCompliant ? (
                    <span className="badge-apple-emerald text-[11px] py-1 px-2.5">
                      <CheckCircle2 size={13} />
                      <span>Katılıma Uygun</span>
                    </span>
                  ) : isWithPurif ? (
                    <span className="badge-apple-amber text-[11px] py-1 px-2.5">
                      <AlertTriangle size={13} />
                      <span>Arındırma ile Uygun</span>
                    </span>
                  ) : (
                    <span className="badge-apple-rose text-[11px] py-1 px-2.5">
                      <AlertOctagon size={13} />
                      <span>Katılıma Uygun Değil</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Key IPO Metrics */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-4">
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Halka Arz Fiyatı
                  </span>
                  <span className="text-sm font-bold font-mono text-white mt-0.5 block tabular-nums">
                    {formatTRY(item.ipo_price_try, 2)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Talep Tarihleri
                  </span>
                  <span className="text-xs font-semibold font-mono text-slate-200 mt-1 block">
                    {item.ipo_date_range}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Halka Arz Büyüklüğü
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block tabular-nums">
                    {formatTRY(item.issue_size_try, 0)}
                  </span>
                </div>
              </div>

              {/* Financial Ratios Row */}
              <div className="flex items-center gap-4 text-xs font-mono mb-4 text-slate-400">
                <div>
                  <span className="text-[10px] text-slate-400">Faizli Borç Oranı: </span>
                  <span
                    className={`font-semibold ${
                      (item.interest_debt_ratio_percent || 0) <= 33
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    %{item.interest_debt_ratio_percent?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Uygunsuz Gelir: </span>
                  <span
                    className={`font-semibold ${
                      (item.impure_income_ratio_percent || 0) <= 5
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    %{item.impure_income_ratio_percent?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Fon Yeri: </span>
                  <span
                    className={`font-semibold ${
                      item.fund_usage_shariah_compliant
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {item.fund_usage_shariah_compliant ? "Caiz" : "Uygunsuz"}
                  </span>
                </div>
              </div>

              {/* Shariah Decision Summary */}
              {item.prospectus_shariah_decision && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-300 leading-relaxed font-normal">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                    <Info size={12} className="text-emerald-400" />
                    <span>İzahname Katılım Finans Raporu</span>
                  </div>
                  <p>{item.prospectus_shariah_decision}</p>
                </div>
              )}

              {/* Footer / Lead Consortium */}
              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400">
                <span>Konsorsiyum Lideri: {item.lead_consortium || "Belirtilmedi"}</span>
                {item.prospectus_url && (
                  <a
                    href={item.prospectus_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                  >
                    <span>İzahname (KAP)</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
