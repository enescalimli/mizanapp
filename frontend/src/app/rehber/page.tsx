"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Coins,
  Building2,
  Calculator,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "GENEL" | "HALKA_ARZ" | "ARINDIRMA" | "ZEKAT" | "ENDEKS";
  question: string;
  answer: string;
  reference: string;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "GENEL",
    question: "Borsada hisse senedi alıp satmak dinen caiz midir?",
    answer:
      "Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu ve İslam Fıkıh Akademisi kararlarına göre; şirketin ana faaliyet alanı helal ise (alkol, domuz eti, faizli finansman, kumar, tütün vb. haram unsurlar içermiyorsa) ve finansal tablolarında faizli borç ve gelirler belirlenen fıkhi eşikleri aşmıyorsa, hisse senedi almak o şirkete ortak olmak demektir ve dinen caizdir.",
    reference: "Diyanet Din İşleri Yüksek Kurulu Fetvaları & AAOIFI Şer'i Standart No: 21",
  },
  {
    id: "faq-2",
    category: "GENEL",
    question: "Açığa satış (Short Sale) ve kredili hisse alımı neden haramdır?",
    answer:
      "Açığa satışta yatırımcı henüz mülkiyetine sahip olmadığı (kabz etmediği) bir hisseyi ödünç alarak satmaktadır; Peygamber Efendimiz (s.a.v.) 'Sahip olmadığın bir şeyi satma' (Ebû Dâvûd, Büyû', 68) buyurmuştur. Kredili işlemde ise aracı kurumdan faizli borç alınarak alım yapıldığından doğrudan faiz (riba) yasağı kapsamına girer.",
    reference: "TKBB Danışma Kurulu Kararı & Tirmizî, Büyû', 19",
  },
  {
    id: "faq-3",
    category: "GENEL",
    question: "VİOP ve vadeli işlemler / opsiyonlar neden katılım ilkelerine aykırıdır?",
    answer:
      "Vadeli işlem ve opsiyon sözleşmelerinde fiziki teslimat veya ortaklık amacı olmaksızın sadece fiyat farkından kâr elde etme (nakdi uzlaşma) esastır. Bu yapı fıkıhta 'garar' (aşırı belirsizlik) ve 'meysir' (kumar benzeri spekülasyon) olarak nitelendirilir. Gerçek bir varlığın mülkiyeti el değiştirmediği için caiz görülmez.",
    reference: "İslam İşbirliği Teşkilatı Fıkıh Akademisi Kararı No: 63",
  },
  {
    id: "faq-4",
    category: "ENDEKS",
    question: "BIST Katılım Endeksi kriterleri nelerdir?",
    answer:
      "Borsa İstanbul ve TKBB Danışma Kurulu tarafından belirlenen 3 temel finansal oran vardır: 1) Faizli borçların piyasa değerine oranı %33'ü geçmemelidir. 2) Faiz getirili nakit ve menkul kıymetlerin piyasa değerine oranı %33'ü geçmemelidir. 3) Uygun olmayan yan faaliyet veya faiz gelirlerinin toplam hasılata oranı %5'i aşmamalıdır. Şirketler yılda 4 kez çeyreklik bilançolarla denetlenir.",
    reference: "BIST Katılım Endeksleri Temel Kuralları (Borsa İstanbul & TKBB)",
  },
  {
    id: "faq-5",
    category: "ENDEKS",
    question: "BIST Katılım Endeksinde olan bir hisse neden sonradan çıkarılabilir?",
    answer:
      "Şirketlerin finansal yapıları her çeyrekte değişir. Örneğin şirket yeni bir fabrika yatırımı için konvansiyonel faizli kredi çektiğinde faizli borç oranı %33 sınırını aşabilir veya vadeli mevduat faiz gelirleri %5 eşiğinin üstüne çıkabilir. Bu durumda Borsa İstanbul dönemsel incelemesinde hisse endeksten çıkarılır. Mizan bu değişiklikleri KAP üzerinden anlık takip eder.",
    reference: "TKBB Danışma Kurulu Dönemsel Değerlendirme Esasları",
  },
  {
    id: "faq-6",
    category: "HALKA_ARZ",
    question: "Halka arzlarda katılım uygunluğu nasıl tespit edilir?",
    answer:
      "Halka arz izahnamesi ile birlikte SPK ve Borsa İstanbul onaylı 'Katılım Finansı İlkeleri Bilgi Formu (KAFİF)' yayımlanır. Bağımsız denetimden geçmiş mali tablolar üzerinden şirketin faaliyet konusu ve 3 altın rasyosu denetlenir. Formda 'Katılım Endeksi Kriterlerini Karşılamaktadır' ibaresi yer alan arzlar katılıma uygundur.",
    reference: "SPK Halka Arz İzahname Standartları & KAFİF Formu",
  },
  {
    id: "faq-7",
    category: "ARINDIRMA",
    question: "Hisse senedi arındırması (Purification) nedir ve nasıl hesaplanır?",
    answer:
      "Katılım endeksindeki şirketler ana faaliyeti helal olsa dahi cüzi oranda (en fazla %5) mevduat faizi veya repo geliri elde edebilirler. Yatırımcı, şirketten elde ettiği kâr payından (temettüden) veya hissenin elde tutulduğu süreye isabet eden bu faizli geliri hesaplayıp sevap beklemeksizin ihtiyaç sahiplerine veya hayır kurumlarına bağışlamalıdır.",
    reference: "AAOIFI Şer'i Standart No: 21, Madde 3/4 & TKBB İlke Kararları",
  },
  {
    id: "faq-8",
    category: "ARINDIRMA",
    question: "Arındırılan tutar zekat yerine geçer mi?",
    answer:
      "Hayır, arındırma işlemi gayrimeşru (faiz vb.) unsurların mülkiyetten çıkarılmasıdır. Zekat ise helal ve nisap miktarına ulaşmış malın farz olan ibadetidir. Dolayısıyla arındırma tutarı zekata sayılamaz; zekat ayrıca helal net varlık üzerinden verilmelidir.",
    reference: "Diyanet Din İşleri Yüksek Kurulu & Fıkıh Ansiklopedisi",
  },
  {
    id: "faq-9",
    category: "ZEKAT",
    question: "Hisse senetlerinin zekatı nasıl hesaplanır?",
    answer:
      "İki niyet ayrımı vardır: 1) Al-sat (kısa vadeli ticaret) amacıyla tutulan hisselerde, zekat günü itibarıyla hisselerin piyasa değeri üzerinden %2.5 verilir. 2) Uzun vadeli ortaklık ve temettü amacıyla tutulan hisselerde ise fabrikanın bina ve makineleri zekattan muaftır; şirketin 'Dönen Varlıklar - Kısa Vadeli Borçlar' matrahı hisse başına oranlanır. Mizan, her hisse için hisse başı net zekat matrahını otomatik hesaplar.",
    reference: "İslam Fıkıh Akademisi Zekat Kararları (Cidde)",
  },
  {
    id: "faq-10",
    category: "HALKA_ARZ",
    question: "Halka arzda 'T1-T2 Bakiye ile Katılım' caiz midir?",
    answer:
      "Satılan hissenin takası (T+2) henüz tamamlanmamış olsa bile BIST takasbank nezdinde mülkiyet taahhüdü ve teminat sağlandığından, nakit karşılığı hisse satışı neticesinde doğan bakiye ile halka arza katılmakta fıkhen bir sakınca bulunmamaktadır.",
    reference: "TKBB Danışma Kurulu Halka Arz Katılım Esasları",
  },
];

interface GlossaryTerm {
  term: string;
  arabicName: string;
  shortDesc: string;
  fullDesc: string;
  tag: string;
}

const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Sukuk (Kira Sertifikası)",
    arabicName: "صكوك",
    shortDesc: "Varlığa dayalı faizsiz borçlanma ve getiri sertifikası.",
    fullDesc:
      "Geleneksel faizli tahvilin aksine, somut bir gayrimenkul veya altyapı varlığının mülkiyetini veya intifa hakkını temsil eder. Yatırımcı sabit faiz değil, o varlığın kira getirisinden pay alır.",
    tag: "Finansal Enstrüman",
  },
  {
    term: "Arındırma (Purification)",
    arabicName: "تطهير",
    shortDesc: "Hisse gelirindeki faizli veya gayrimeşru kısmın hayra bağışlanması.",
    fullDesc:
      "Şirketin kazancına karışan düşük oranlı (azami %5) faiz veya uygunsuz gelirlerin, yatırımcının temettü veya değer kazancından hesaplanarak sevap beklemeksizin ihtiyaç sahiplerine dağıtılması fıkhi yükümlülüğüdür.",
    tag: "Fıkhi Yükümlülük",
  },
  {
    term: "Mudaraba (Emek-Sermaye Ortaklığı)",
    arabicName: "مضاربة",
    shortDesc: "Bir tarafın sermaye, diğer tarafın emek koyduğu kâr ortaklığı.",
    fullDesc:
      "Katılım bankalarının katılma hesaplarında uygulanan temel modeldir. Kâr önceden anlaşılan oranlarda paylaşılır, ticari zarar durumunda ise kusur yoksa sermaye sahibi paradan, işletmeci ise emeğinden kaybeder.",
    tag: "Akid Türü",
  },
  {
    term: "Müşaraka (Kâr-Zarar Ortaklığı)",
    arabicName: "مشاركة",
    shortDesc: "Her iki tarafın da sermaye koyduğu tam ortaklık modeli.",
    fullDesc:
      "Hisse senetlerinin temel fıkhi zeminidir. Taraflar şirketin sermayesine hisseleri oranında ortak olur, kâr ve zarara birlikte katlanırlar.",
    tag: "Akid Türü",
  },
  {
    term: "Murabaha",
    arabicName: "مرابحة",
    shortDesc: "Maliyet üzerine kâr eklenerek yapılan vadeli mal satışı.",
    fullDesc:
      "Katılım bankasının müşterinin istediği malı peşin satın alıp, üzerine kâr marjı ekleyerek vadeli olarak müşteriye satmasıdır. Paranın parayla değil, gerçek bir malın ticaretiyle kazanç sağlanır.",
    tag: "Finansman Yöntemi",
  },
  {
    term: "Riba (Faiz)",
    arabicName: "ربا",
    shortDesc: "Borç karşılığında veya parada fazlalık şart koşulan karşılıksız kazanç.",
    fullDesc:
      "Kur'an-ı Kerim'de kesin olarak haram kılınan, paranın zaman değerinden risksiz fazlalık talep etme işlemidir. Şirketlerin faizli kredileri veya vadeli mevduatları bu kapsama girer.",
    tag: "Temel Yasak",
  },
  {
    term: "Gharar (Belirsizlik)",
    arabicName: "غرر",
    shortDesc: "Sonucu belirsiz, aşırı risk ve aldatma içeren akidler.",
    fullDesc:
      "Fiyatı, teslimatı veya varlığı kesin olmayan spekülatif işlemlerdir. VİOP, türev araçlar, kaldıraçlı işlemler ve açığa satış garar içerdiği için caiz görülmez.",
    tag: "Temel Yasak",
  },
  {
    term: "Kabz (Mülkiyet ve Teslim Alma)",
    arabicName: "قبض",
    shortDesc: "Satın alınan bir malın hukuki tasarruf yetkisine geçmesi.",
    fullDesc:
      "Hisse senedi alımında Takasbank nezdinde mülkiyetin tescil edilmesidir. Kabz gerçekleşmeden yapılan satışlar dinen caiz değildir.",
    tag: "Fıkhi İlke",
  },
  {
    term: "KAFİF (Katılım Finansı Bilgi Formu)",
    arabicName: "نموذج الإفصاح المالي الإسلامي",
    shortDesc: "BIST şirketlerinin faizsiz standartlara uygunluk beyan formu.",
    fullDesc:
      "Kamuyu Aydınlatma Platformu'nda (KAP) yayımlanan, şirketin faizli borç, faizli varlık ve uygun olmayan gelir oranlarını resmi olarak teyit eden yasal ve fıkhi belgedir.",
    tag: "Resmi Belge",
  },
];

export default function RehberPage() {
  const [activeTab, setActiveTab] = useState<"CEVAZLAR" | "TERIMLER" | "SSS" | "RASYO">("CEVAZLAR");
  const [faqCategory, setFaqCategory] = useState<string>("TÜMÜ");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat = faqCategory === "TÜMÜ" || faq.category === faqCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 space-y-8">
      {/* Apple Design Navy Hero Header */}
      <div className="apple-glass-card p-6 sm:p-10 space-y-6">
        {/* Top Brand Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#273869]/10 pb-5">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-orbix-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform">
              <Image
                src="/brand/logo.svg"
                alt="Mizan Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-[#273869]">
                  MİZAN
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#273869] text-white tracking-widest uppercase">
                  REHBER
                </span>
              </div>
              <span className="text-[11px] text-[#6E81A0] font-medium block">
                İslami Yatırım, Fıkhi Cevazlar &amp; Terimler
              </span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#273869]/8 text-[#273869] text-xs font-bold">
            <Scale size={14} className="text-[#0D8B52]" />
            <span>Diyanet, TKBB ve AAOIFI Standartları</span>
          </div>
        </div>

        <div className="max-w-3xl space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#273869] tracking-tight">
            İslami Finans &amp;{" "}
            <span className="font-orbix-serif italic text-[#405881]">Fıkhi Cevazlar</span>{" "}
            Rehberi
          </h1>
          <p className="text-sm text-[#6E81A0] leading-relaxed font-normal">
            Borsa İstanbul&apos;da helal kazanç esasları, yetkili kurulların fıkhi cevazları,
            faizsiz finans terimleri ve yatırımcıların en çok merak ettiği sorular.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab("CEVAZLAR")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "CEVAZLAR"
                ? "bg-[#273869] text-white shadow-orbix-sm"
                : "bg-white text-[#405881] border border-[#E2E8F0] hover:text-[#273869]"
            }`}
          >
            <ShieldCheck size={14} />
            <span>Fıkhi Cevazlar &amp; Kurallar</span>
          </button>
          <button
            onClick={() => setActiveTab("TERIMLER")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "TERIMLER"
                ? "bg-[#273869] text-white shadow-orbix-sm"
                : "bg-white text-[#405881] border border-[#E2E8F0] hover:text-[#273869]"
            }`}
          >
            <BookOpen size={14} />
            <span>Finans Terimleri Sözlüğü</span>
          </button>
          <button
            onClick={() => setActiveTab("SSS")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "SSS"
                ? "bg-[#273869] text-white shadow-orbix-sm"
                : "bg-white text-[#405881] border border-[#E2E8F0] hover:text-[#273869]"
            }`}
          >
            <HelpCircle size={14} />
            <span>Sıkça Sorulan Sorular (SSS)</span>
          </button>
          <button
            onClick={() => setActiveTab("RASYO")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "RASYO"
                ? "bg-[#273869] text-white shadow-orbix-sm"
                : "bg-white text-[#405881] border border-[#E2E8F0] hover:text-[#273869]"
            }`}
          >
            <Calculator size={14} />
            <span>3 Altın Rasyo Metodolojisi</span>
          </button>
        </div>
      </div>

      <div>
        {/* TAB 1: CEVAZLAR VE KURALLAR */}
        {activeTab === "CEVAZLAR" && (
          <div className="space-y-8">
            {/* Top Authorities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                  DİB
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Diyanet İşleri Başkanlığı
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Din İşleri Yüksek Kurulu
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Faaliyeti helal olan şirketlere ortak olmak caizdir. Açığa satış,
                  kaldıraç ve faizli borçlanma içeren işlemler ise kesinlikle yasaklanmıştır.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                  TKBB
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Türkiye Katılım Bankaları Birliği
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Merkezi Danışma Kurulu
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Borsa İstanbul Katılım Endeksi metodolojisini belirler. %33 faizli borç ve
                  %5 gayrimeşru gelir sınırlarını denetler.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
                  AAOIFI
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  AAOIFI Standart No: 21
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Uluslararası Şer&apos;i Standartlar
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Küresel İslami finans kurumlarının çatı standardıdır. Piyasa değeri üzerinden
                  %30 borç tavanı ve kuruşu kuruşuna arındırmayı şart koşar.
                </p>
              </div>
            </div>

            {/* Permitted vs Prohibited Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Borsa İşlem Türlerine Göre Fıkhi Hükümler
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Hangi borsa işlemleri dinen caizdir, hangileri kesinlikle haram kılınmıştır?
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-3 px-4">İşlem Türü</th>
                      <th className="py-3 px-4">Fıkhi Hüküm</th>
                      <th className="py-3 px-4">Temel Gerekçe / Fıkhi Dayanak</th>
                      <th className="py-3 px-4">Yetkili Kurul Kararı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        Spot Hisse Senedi Alımı
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>CAİZ (HELAL)</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        Şirketin faaliyeti ve rasyoları uygunsa gerçek bir ticari ortaklıktır (müşaraka).
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        Diyanet &amp; TKBB
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        Sukuk (Kira Sertifikası) Alımı
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>CAİZ (HELAL)</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        Gerçek bir gayrimenkul veya altyapı varlığının kira gelirine ortaklıktır.
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        TKBB &amp; AAOIFI
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        Temettü (Kâr Payı) Geliri
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>CAİZ (Arındırma ile)</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        Ticari kâr payıdır. Varsa cüzi faiz geliri oranı kadar arındırılmalıdır.
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        AAOIFI Standart No: 21
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        Açığa Satış (Short Selling)
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                          <XCircle size={12} className="text-rose-600" />
                          <span>HARAM (YASAK)</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        Mülkiyetine sahip olunmayan malın satışıdır. Hz. Peygamber (s.a.v.) yasaklamıştır.
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        Diyanet &amp; TKBB
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        Kredili Hisse Alımı (Margin)
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                          <XCircle size={12} className="text-rose-600" />
                          <span>HARAM (YASAK)</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        Aracı kurumdan faizle borç para alınarak işlem yapılır; doğrudan faizdir.
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        Tüm Fıkıh Kurulları
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        VİOP &amp; Vadeli İşlemler / Kaldıraç
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                          <XCircle size={12} className="text-rose-600" />
                          <span>HARAM (YASAK)</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        Fiziki varlık ve teslimat yoktur; garar (aşırı belirsizlik) ve kumar niteliğindedir.
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        İslam Fıkıh Akademisi
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TERİMLER SÖZLÜĞÜ */}
        {activeTab === "TERIMLER" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {GLOSSARY.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {item.tag}
                      </span>
                      <span className="font-serif text-sm text-slate-400">
                        {item.arabicName}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {item.term}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700">
                      {item.shortDesc}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {item.fullDesc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SSS */}
        {activeTab === "SSS" && (
          <div className="space-y-6">
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
                {["TÜMÜ", "GENEL", "ENDEKS", "HALKA_ARZ", "ARINDIRMA", "ZEKAT"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFaqCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      faqCategory === cat
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {cat === "TÜMÜ" ? "Tüm Sorular" : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Sorularda ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50"
                    >
                      <span className="text-sm font-bold text-slate-900">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs space-y-3 text-slate-600 leading-relaxed font-normal">
                        <p>{faq.answer}</p>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Scale size={13} className="text-emerald-600 shrink-0" />
                          <span>Kaynak / Referans: {faq.reference}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: 3 ALTIN RASYO METODOLOJİSİ */}
        {activeTab === "RASYO" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                BIST Katılım ve AAOIFI 3 Altın Rasyo Metodolojisi
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-normal">
                Bir şirketin hissesinin caiz sayılabilmesi için sağlaması gereken üç temel matematiksel eşik.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ratio 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Maksimum %33
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-bold">Rasyo 1</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Toplam Faizli Borç Oranı
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Şirketin kısa ve uzun vadeli tüm banka kredileri ile ihraç ettiği tahvillerin toplamının,
                  şirketin piyasa değerine veya aktif toplamına oranı %33&apos;ü geçemez.
                </p>
                <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                  Formül = Faizli Borçlar / Piyasa Değeri &le; %33.00
                </div>
              </div>

              {/* Ratio 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Maksimum %33
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-bold">Rasyo 2</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Faiz Getirili Varlık Oranı
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Şirketin kasasındaki vadeli mevduat, repo ve faizli tahvil gibi menkul kıymetlerin toplamının,
                  şirket piyasa değerine oranı %33 eşiğinin altında olmalıdır.
                </p>
                <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                  Formül = Vadeli Mevduat + Repo / Piyasa Değeri &le; %33.00
                </div>
              </div>

              {/* Ratio 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                    Maksimum %5.00
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-bold">Rasyo 3</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Uygunsuz Gelir / Hasılat Oranı
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Şirketin brüt faiz gelirleri ve ana faaliyet dışı haram yan gelirlerinin toplam hasılata oranı
                  kesinlikle %5&apos;i aşamaz. Bu gelir arındırılmak zorundadır.
                </p>
                <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                  Formül = Faiz Gelirleri / Toplam Satış Hasılatı &le; %5.00
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Hisselerinizin Bu Kurallara Uygunluğunu Test Edin
                </h4>
                <p className="text-xs text-emerald-800 font-normal mt-0.5">
                  Borsa İstanbul&apos;daki 540+ hissenin güncel rasyolarını anlık olarak tarayabilirsiniz.
                </p>
              </div>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shrink-0 transition-colors shadow-xs"
              >
                <span>Katılım Taramasına Git</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
