"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { ComplianceBadge } from "@/components/ComplianceBadge";
import { useLiveMarketData } from "@/lib/hooks/useLiveMarketData";
import {
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Scale,
  Sparkles,
  Calculator,
  Search,
  Radio,
  FileSpreadsheet,
  Coins,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [standard, setStandard] = useState<"BIST" | "AAOIFI">("BIST");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [screenerSearch, setScreenerSearch] = useState("");

  // Interactive quick purification state
  const [calcTicker, setCalcTicker] = useState("BIMAS");
  const [calcLots, setCalcLots] = useState(500);

  const {
    companies,
    kapDisclosures,
    updatedAt,
    source,
    isRefreshing,
    refreshNow,
  } = useLiveMarketData(30000);

  // Screener filtering
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      // Search filter
      if (screenerSearch.trim()) {
        const query = screenerSearch.toLowerCase().trim();
        const matchesQuery =
          c.ticker.toLowerCase().includes(query) ||
          c.name.toLowerCase().includes(query) ||
          c.sector.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Status filter
      const activeStatus = standard === "BIST" ? c.bistStatus : c.aaoifiStatus;
      if (filterStatus === "ALL") return true;
      if (filterStatus === "COMPLIANT") return activeStatus === "COMPLIANT";
      if (filterStatus === "GRACE") {
        return (
          c.aaoifiStatus === "GRACE_PERIOD_TOLERANCE" ||
          c.bistStatus === "GRACE_PERIOD_TOLERANCE" ||
          (c.debtRatioPercent >= 28 && c.debtRatioPercent < 33)
        );
      }
      if (filterStatus === "NON_COMPLIANT") return activeStatus === "NON_COMPLIANT";
      return true;
    });
  }, [companies, screenerSearch, standard, filterStatus]);

  const compliantCount = useMemo(() => {
    return companies.filter((c) =>
      standard === "BIST"
        ? c.bistStatus === "COMPLIANT"
        : c.aaoifiStatus === "COMPLIANT"
    ).length;
  }, [companies, standard]);

  const nonCompliantCount = useMemo(() => {
    return companies.filter((c) =>
      standard === "BIST"
        ? c.bistStatus === "NON_COMPLIANT"
        : c.aaoifiStatus === "NON_COMPLIANT"
    ).length;
  }, [companies, standard]);

  // Rates for calculator
  const calcRates: Record<string, { rate: number; name: string }> = {
    BIMAS: { rate: 0.0842, name: "BİM Birleşik Mağazalar" },
    ASELS: { rate: 0.0245, name: "Aselsan" },
    FROTO: { rate: 0.21, name: "Ford Otomotiv" },
    TUPRS: { rate: 0.048, name: "Tüpraş" },
    PGSUS: { rate: 0.142, name: "Pegasus Hava Taşımacılığı" },
    BERA: { rate: 0.012, name: "Bera Holding" },
  };

  const currentRate = calcRates[calcTicker]?.rate ?? 0.0842;
  const calculatedPurification = (currentRate * (Number(calcLots) || 0)).toFixed(2);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* ===================================================================== */}
      {/* 1. HERO SECTION (MUSAFFA TARZI FERAH VE GÜVEN VERİCİ)                 */}
      {/* ===================================================================== */}
      <section className="relative pt-10 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 bg-grid-pattern border-b border-slate-100 overflow-hidden">
        {/* Soft emerald glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[380px] bg-emerald-100/40 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Eyebrow Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TKBB &amp; AAOIFI No. 21 Standartlarında İslami Finans Platformu</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
            Borsa İstanbul&apos;da Helal Yatırımın <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
              En Güvenilir &amp; Net Adresi
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            500&apos;den fazla BIST hissesinin çeyreklik KAP bilançolarını kuruşu kuruşuna denetleyin, şüpheli faiz gelirlerini tek tıkla arındırın ve hisse zekâtınızı hatasız hesaplayın.
          </p>

          {/* Musaffa Tarzı Canlı Arama Çubuğu */}
          <div className="pt-2 max-w-2xl mx-auto space-y-3">
            <SearchBar placeholder="Hisse kodu veya şirket adı arayın (BIMAS, THYAO, ASELS...)" />

            {/* Hızlı Seçim Etiketleri */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-1">
              <span className="text-slate-400 font-medium">Hızlı Örnekler:</span>
              <button
                onClick={() => router.push("/companies/BIMAS")}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 font-mono font-medium flex items-center gap-1.5 shadow-xs transition"
              >
                <span>BIMAS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-sans text-xs">Uygun</span>
              </button>
              <button
                onClick={() => router.push("/companies/THYAO")}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-400 text-slate-700 font-mono font-medium flex items-center gap-1.5 shadow-xs transition"
              >
                <span>THYAO</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-rose-700 font-sans text-xs">Kapsam Dışı</span>
              </button>
              <button
                onClick={() => router.push("/companies/PGSUS")}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-700 font-mono font-medium flex items-center gap-1.5 shadow-xs transition"
              >
                <span>PGSUS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-amber-700 font-sans text-xs">Sınırda</span>
              </button>
              <button
                onClick={() => router.push("/companies/ASELS")}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 font-mono font-medium flex items-center gap-1.5 shadow-xs transition"
              >
                <span>ASELS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-sans text-xs">Uygun</span>
              </button>
            </div>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-8 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular">542+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Taranan BIST Şirketi</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular">%100</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Sıfır-Float Decimal Hassasiyeti</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular">4x / Gün</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Otomatik KAP Senkronu</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular">2 Standart</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">TKBB &amp; AAOIFI No. 21</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. CANLI HİSSE VE UYGUNLUK KARTLARI (BIMAS vs THYAO KARŞILAŞTIRMASI) */}
      {/* ===================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            Şüpheye Yer Bırakmayan Şeffaf Analiz
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Bir şirketin katılım endeksine neden uygun olduğunu veya hangi rasyoyu aştığını tüm bilanço dipnotlarıyla görün.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. KART: UYGUN HİSSE (BIMAS) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-200/40 hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm font-mono shadow-xs">
                    BIM
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>BIMAS</span>
                      <span className="text-xs font-normal text-slate-500">BİM Birleşik Mağazalar</span>
                    </h3>
                    <div className="text-xs text-slate-400 font-medium">Perakende Ticaret &bull; 2026-Q2 KAP Bilançosu</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Katılım Uygun
                </span>
              </div>

              {/* Canlı Fiyat */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular text-slate-900">₺482,50</span>
                <span className="text-xs font-semibold text-emerald-600 font-mono tabular">+0,42% (Canlı BIST)</span>
              </div>

              {/* 3 Temel Katılım Kriter Çubuğu */}
              <div className="mt-6 space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Toplam Faizli Borç / Piyasa Değeri</span>
                    <span className="text-emerald-700 font-mono tabular">%14,80 (Eşik: &lt;%33)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "44.8%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Faizli Nakit &amp; Mevduat / Piyasa Değeri</span>
                    <span className="text-emerald-700 font-mono tabular">%11,20 (Eşik: &lt;%33)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "33.9%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Uygun Olmayan Gelirler / Toplam Hasılat</span>
                    <span className="text-emerald-700 font-mono tabular">%1,45 (Eşik: &lt;%5)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "29%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Dipnot ve Arındırma */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Hisse Başına Arındırma:</span>
                <span className="text-sm font-bold font-mono text-emerald-700 tabular">₺0,0842 / Pay</span>
              </div>
              <Link
                href="/companies/BIMAS"
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 transition flex items-center gap-1"
              >
                <span>Katılım Karnesi</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* 2. KART: KAPSAM DIŞI HİSSE (THYAO) + HELAL İKAME */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-200/40 hover:border-rose-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-rose-800 text-sm font-mono shadow-xs">
                    THY
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>THYAO</span>
                      <span className="text-xs font-normal text-slate-500">Türk Hava Yolları</span>
                    </h3>
                    <div className="text-xs text-slate-400 font-medium">Havacılık &amp; Taşımacılık &bull; 2026-Q2 KAP Bilançosu</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/90 flex items-center gap-1.5">
                  <XCircle size={13} className="text-rose-600" />
                  Kapsam Dışı
                </span>
              </div>

              {/* Canlı Fiyat */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular text-slate-900">₺312,00</span>
                <span className="text-xs font-semibold text-emerald-600 font-mono tabular">+1,15% (Canlı BIST)</span>
              </div>

              {/* Rasyolar & İhlal */}
              <div className="mt-6 space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Toplam Faizli Borç / Piyasa Değeri</span>
                    <span className="text-rose-700 font-bold font-mono tabular">%36,80 (Eşik: &lt;%33 Aşıldı!)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Faizli Nakit &amp; Mevduat / Piyasa Değeri</span>
                    <span className="text-emerald-700 font-mono tabular">%14,20 (Eşik: &lt;%33)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "43%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Uygun Olmayan Gelirler / Toplam Hasılat</span>
                    <span className="text-emerald-700 font-mono tabular">%4,20 (Eşik: &lt;%5)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "84%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* İkame Önerisi Kutusu */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/80 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 p-4 sm:p-5 rounded-b-3xl">
              <div>
                <span className="text-slate-500 block font-medium">Ulaştırma Sektöründe Alternatif:</span>
                <span className="text-xs font-bold text-slate-800">PGSUS (%31,40 Borç ile BIST Uygun)</span>
              </div>
              <Link
                href="/companies/PGSUS"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition flex items-center gap-1"
              >
                <span>İkameyi İncele</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. 4 TEMEL KATILIM HİZMETİ (CORE VALUE PILLARS)                       */}
      {/* ===================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">NEDEN MİZAN?</span>
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Helal Yatırımın Her Adımında Yanınızda
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Diyanet İşleri Başkanlığı, TKBB ve AAOIFI standartlarını modern teknolojiyle birleştiren 4 temel sütun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sütun 1: Çift Standart Tarama */}
          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-lg hover:border-slate-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Scale size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">BIST &amp; AAOIFI Çift Standart</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              BIST Katılım (%33) ve uluslararası AAOIFI Shariah Standard No. 21 (%30) kurallarını tek ekranda yan yana karşılaştırın.
            </p>
          </div>

          {/* Sütun 2: Kuruşu Kuruşuna Arındırma */}
          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-lg hover:border-slate-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Coins size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Kuruşu Kuruşuna Arındırma</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Tuttuğunuz gün ve lot sayısına göre çeyreklik arındırma tutarınızı kuruş hassasiyetli Decimal motoru ile kesin olarak hesaplayın.
            </p>
          </div>

          {/* Sütun 3: Hisse Zekâtı Hesaplayıcı */}
          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-lg hover:border-slate-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Calculator size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hisse Zekâtı Hesaplayıcı</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Hissenizi kısa vadeli al-sat için mi yoksa uzun vadeli temettü için mi tuttuğunuza göre net dönen varlık bazlı zekât matrahınızı görün.
            </p>
          </div>

          {/* Sütun 4: Canlı KAP ve Halka Arz */}
          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-lg hover:border-slate-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Canlı KAP &amp; Halka Arz</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              KAP bildirim akışı ve yeni halka arz izahnameleri çıktığı anda katılım finans uygunluk durumlarını anında öğrenin.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. CANLI HİSSE TARAYICI TABLOSU (SCREENER)                            */}
      {/* ===================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
              <Radio size={12} className="text-emerald-500 animate-pulse" />
              <span>
                {source === "LIVE_HYBRID"
                  ? "BIST Canlı Fiyat + KAP Akışı"
                  : source === "SUPABASE_DB"
                  ? "Supabase Canlı Veritabanı"
                  : "KAP 2026-Q2 Bilanço Boru Hattı"}
              </span>
              {updatedAt && <span className="font-mono text-slate-400">• {updatedAt}</span>}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Borsa İstanbul Katılım Hisseleri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {filteredCompanies.length} şirket listeleniyor &bull; {compliantCount} Uygun, {nonCompliantCount} Kapsam Dışı
            </p>
          </div>

          {/* Standart Seçici & Yenileme */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStandard("BIST")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  standard === "BIST"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                BIST Katılım (&lt;%33)
              </button>
              <button
                type="button"
                onClick={() => setStandard("AAOIFI")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  standard === "AAOIFI"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                AAOIFI (&lt;%30)
              </button>
            </div>

            <button
              onClick={refreshNow}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Verileri Yenile"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
            </button>
          </div>
        </div>

        {/* Tablo Filtre Çubuğu */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={screenerSearch}
              onChange={(e) => setScreenerSearch(e.target.value)}
              placeholder="Tablo içinde ara (kod, şirket veya sektör)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === "ALL"
                  ? "bg-slate-950 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tümü ({companies.length})
            </button>
            <button
              onClick={() => setFilterStatus("COMPLIANT")}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === "COMPLIANT"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              Uygun ({compliantCount})
            </button>
            <button
              onClick={() => setFilterStatus("GRACE")}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === "GRACE"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              İzleme / Hoşgörü
            </button>
            <button
              onClick={() => setFilterStatus("NON_COMPLIANT")}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === "NON_COMPLIANT"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-800 hover:bg-rose-100"
              }`}
            >
              Kapsam Dışı ({nonCompliantCount})
            </button>
          </div>
        </div>

        {/* Tablo */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5">Şirket / Kod</th>
                  <th className="py-4 px-4">Canlı Fiyat</th>
                  <th className="py-4 px-4">BIST Durumu</th>
                  <th className="py-4 px-4">AAOIFI</th>
                  <th className="py-4 px-4">Faizli Borç Oranı</th>
                  <th className="py-4 px-4">Faiz Gelir Oranı</th>
                  <th className="py-4 px-4">Arındırma / Pay</th>
                  <th className="py-4 px-5 text-right">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map((c) => {
                  const isChangePositive = c.change24h.startsWith("+");
                  return (
                    <tr
                      key={c.ticker}
                      onClick={() => router.push(`/companies/${c.ticker}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs font-mono group-hover:border-emerald-400 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition">
                            {c.ticker}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition">
                              {c.name}
                            </div>
                            <div className="text-xs text-slate-400 font-normal">{c.sector}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-slate-900 tabular">
                          ₺{c.priceTRY}
                        </div>
                        <div
                          className={`text-xs font-mono tabular font-semibold ${
                            isChangePositive ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {c.change24h}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <ComplianceBadge status={c.bistStatus} size="sm" />
                      </td>

                      <td className="py-4 px-4">
                        <ComplianceBadge status={c.aaoifiStatus} size="sm" />
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-mono font-semibold tabular text-slate-900">
                          %{c.debtRatioPercent.toFixed(1)}
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              c.debtRatioPercent > 33
                                ? "bg-rose-500"
                                : c.debtRatioPercent > 28
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(100, (c.debtRatioPercent / 33) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-mono tabular text-slate-700">
                          %{c.impureIncomePercent.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-emerald-700 tabular">
                          ₺{c.purificationPerShareTRY}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <span className="inline-flex items-center text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition gap-1">
                          İncele <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. HIZLI ARINDIRMA SİMÜLATÖRÜ (İNTERAKTİF DENEME ARACI)                */}
      {/* ===================================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Calculator size={20} className="text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">Canlı Arındırma Hesaplayıcı</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Elinizdeki hisseyi ve lot miktarını seçin, 2026-Q2 arındırma tutarını anında görün.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Kuruş Hassasiyetli (Zero-Float)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hisse Senedi</label>
              <select
                value={calcTicker}
                onChange={(e) => setCalcTicker(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
              >
                {Object.entries(calcRates).map(([tick, data]) => (
                  <option key={tick} value={tick}>
                    {tick} — {data.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lot Miktarı</label>
              <input
                type="number"
                min="1"
                value={calcLots}
                onChange={(e) => setCalcLots(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold font-mono text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hesaplanan Çeyreklik Arındırma
              </label>
              <div className="py-2.5 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-bold font-mono text-emerald-800 flex items-center justify-between">
                <span>₺{calculatedPurification.replace(".", ",")}</span>
                <span className="text-xs font-normal text-emerald-700">Yoksullara İnfak</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-xl">
              * Bu tutar, şirketin çeyreklik döneminde elde ettiği faiz ve katılım dışı yan gelirlerin hissenize düşen payıdır. Kişisel servetinizden değil, şirketin arındırılması gereken gelirinden kaynaklanır.
            </p>
            <Link
              href="/purification"
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold transition shrink-0 flex items-center gap-1.5"
            >
              <span>Tüm Portföyü Arındır</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. CANLI KAP BİLDİRİM VE DUYURU AKIŞI                                  */}
      {/* ===================================================================== */}
      {kapDisclosures && kapDisclosures.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Son KAP Katılım &amp; Bilanço Bildirimleri
              </h3>
            </div>
            <span className="text-xs text-slate-400">Canlı Otomatik Tarama</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {kapDisclosures.slice(0, 3).map((kap) => (
              <div
                key={kap.disclosureId}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {kap.ticker}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{kap.publishedAt}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                  {kap.title}
                </p>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1 border-t border-slate-100 flex items-center gap-1">
                  <span>{kap.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 7. CTA (SON ÇAĞRI BANNERI)                                             */}
      {/* ===================================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-emerald-950/40 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
              <ShieldCheck size={14} />
              <span>Gönül Rahatlığıyla Yatırım Yapın</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Portföyünüzü İslami Finans İlkeleriyle Yönetin
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tek tıkla portföyünüzün katılım uyumluluğunu test edin, faizli gelirleri arındırın ve hisse zekâtınızı kuruşu kuruşuna öğrenin.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/portfolio"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition"
              >
                Portföyümü Analiz Et →
              </Link>
              <Link
                href="/purification"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition border border-white/20"
              >
                Arındırma Hesapla
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
