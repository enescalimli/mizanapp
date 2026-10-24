"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PaynoShell } from "@/components/PaynoShell";
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
  Layers,
  Award,
  Compass,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "GENEL" | "HALKA_ARZ" | "ARINDIRMA" | "ZEKAT" | "ENDEKS";
  question: string;
  answer: string;
  reference: string;
}

const FAQS: FAQItem[] = [
  // ==========================================
  // KATEGORİ: GENEL BORSA & FIKHİ HÜKÜMLER
  // ==========================================
  {
    id: "faq-1",
    category: "GENEL",
    question: "Borsada hisse senedi alıp satmak dinen caiz midir?",
    answer:
      "Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu ve İslam Fıkıh Akademisi kararlarına göre; şirketin ana faaliyet alanı helal ise (alkol, domuz eti, faizli finansman, kumar, şans oyunları, tütün gibi dinen yasak unsurlar içermiyorsa) ve şirketin finansal tablolarında faizli borç ve gelirler belirlenen fıkhi eşikleri aşmıyorsa, hisse senedi almak o şirkete sermaye ortaklığı (müşaraka) tesis etmek demektir ve dinen caizdir.",
    reference: "Diyanet Din İşleri Yüksek Kurulu Fetvaları & TKBB Danışma Kurulu İlke Kararları",
  },
  {
    id: "faq-2",
    category: "GENEL",
    question: "Açığa satış (Short Sale) ve kredili hisse alımı neden haramdır?",
    answer:
      "Açığa satışta yatırımcı henüz mülkiyetine sahip olmadığı (kabz etmediği) bir hisseyi ödünç alarak satmaktadır; Peygamber Efendimiz (s.a.v.) 'Sahip olmadığın bir şeyi satma' (Ebû Dâvûd, Büyû', 68) buyurmuştur. Kredili işlemde ise aracı kurumdan faizli borç alınarak kaldıraçlı alım yapıldığından doğrudan faiz (riba) yasağı kapsamına girer ve tüm fıkıh meclislerince haram kabul edilmiştir.",
    reference: "TKBB Danışma Kurulu Kararı & Tirmizî, Büyû', 19",
  },
  {
    id: "faq-3",
    category: "GENEL",
    question: "VİOP ve vadeli işlemler / opsiyonlar neden katılım ilkelerine aykırıdır?",
    answer:
      "Vadeli işlem ve opsiyon sözleşmelerinde fiziki teslimat veya ortaklık amacı olmaksızın sadece fiyat farkından kâr elde etme (nakdi uzlaşma) esastır. Bu yapı fıkıhta 'garar' (aşırı belirsizlik) ve 'meysir' (kumar benzeri spekülasyon) olarak nitelendirilir. Ortada gerçek bir ticari mal veya mülkiyet el değiştirmediği için caiz görülmez.",
    reference: "İslam İşbirliği Teşkilatı (İİT) Fıkıh Akademisi Kararı No: 63",
  },
  {
    id: "faq-4",
    category: "GENEL",
    question: "Günlük al-sat (Day Trading / Scalping) yapmak caiz midir, kumar sayılır mı?",
    answer:
      "Katılım endeksine uygun bir hissede, Takasbank nezdinde mülkiyet tescili (hukuki kabz) oluştuktan sonra hisseyi aynı gün veya ertesi gün kâr veya zararla satmak fıkhen caizdir. Ticarette malı kısa sürede satmak haram değildir. Ancak şirketin temelini incelemeksizin, sırf spekülatif dalgalanmalar üzerinden aşırı risk alarak kumar psikolojisiyle işlem yapmaktan sakınılması tavsiye edilir.",
    reference: "Diyanet Din İşleri Yüksek Kurulu Borsa Değerlendirmeleri",
  },
  {
    id: "faq-5",
    category: "GENEL",
    question: "Kaldıraçlı forex, swap ve CFD işlemleri neden caiz değildir?",
    answer:
      "Forex piyasalarındaki kaldıraçlı işlemlerde pozisyonun geceye taşınmasında 'swap' adı altında faiz tahakkuk ettirilmektedir. Ayrıca aracı kurumun sağladığı teminat kredisi faiz şartlıdır ve spot piyasada gerçek bir teslimat (kabz) gerçekleşmemektedir. Bu sebeplerle katılım finans ilkelerine kökten aykırıdır.",
    reference: "Diyanet Din İşleri Yüksek Kurulu Karar No: 2017/24",
  },
  {
    id: "faq-6",
    category: "GENEL",
    question: "Zararda olan bir hisseyi satmak caiz midir?",
    answer:
      "Evet, hisse senedi alım-satımı meşru bir ticaret ortaklığıdır. Ticarette kâr etmek kadar zarar etmek de doğaldır. Yatırımcının kendi hür iradesiyle zararını durdurmak (stop-loss) veya nakde dönmek amacıyla hissesini zararına satmasında hiçbir fıkhi sakınca yoktur.",
    reference: "Mecelle, Madde 97 (Zarar ve Ziyan Esasları)",
  },

  // ==========================================
  // KATEGORİ: BIST KATILIM ENDEKSİ & KRİTERLER
  // ==========================================
  {
    id: "faq-7",
    category: "ENDEKS",
    question: "BIST Katılım Endeksi kriterleri nelerdir?",
    answer:
      "Borsa İstanbul ve TKBB Danışma Kurulu tarafından belirlenen 3 temel finansal oran vardır: 1) Faizli borçların şirket toplam piyasa değerine (veya aktifine) oranı %33'ü geçmemelidir. 2) Faiz getirili nakit ve menkul kıymetlerin oranı %33'ü geçmemelidir. 3) Uygun olmayan yan faaliyet veya faiz gelirlerinin toplam hasılata oranı %5'i aşmamalıdır. Şirketler yılda 4 kez çeyreklik bilançolarla KAP üzerinden denetlenir.",
    reference: "BIST Katılım Endeksleri Temel Kuralları (Borsa İstanbul & TKBB)",
  },
  {
    id: "faq-8",
    category: "ENDEKS",
    question: "Payda kuralı nedir? Rasyolarda hangi değer kullanılır?",
    answer:
      "TKBB ve Borsa İstanbul metodolojisine göre; faizli borç ve faizli nakit oranları hesaplanırken paydada 'Şirketin son 20 günlük piyasa değeri ortalaması' ile 'Toplam Varlıkları (Aktif Büyüklüğü)' kıyaslanır; hangisi daha büyükse payda olarak o değer seçilir. Bu kural piyasa düşüşlerinde suni rasyo bozulmalarını engelleyen adil bir denge mekanizmasıdır.",
    reference: "BIST Katılım Endeksi Kriterleri Madde 3.2",
  },
  {
    id: "faq-9",
    category: "ENDEKS",
    question: "BIST Katılım Endeksinde olan bir hisse neden sonradan çıkarılabilir?",
    answer:
      "Şirketlerin finansal yapıları her çeyrekte değişir. Örneğin şirket yeni bir fabrika yatırımı için konvansiyonel faizli kredi çektiğinde faizli borç oranı %33 sınırını aşabilir veya vadeli mevduat faiz gelirleri %5 eşiğinin üstüne çıkabilir. Bu durumda Borsa İstanbul dönemsel incelemesinde hisse endeksten çıkarılır. Mizan bu değişiklikleri KAP üzerinden anlık takip eder.",
    reference: "TKBB Danışma Kurulu Dönemsel Değerlendirme Esasları",
  },
  {
    id: "faq-10",
    category: "ENDEKS",
    question: "Katılım endeksinden çıkarılan bir hissede yatırımcı ne yapmalıdır?",
    answer:
      "Hisse endeksten çıktığında derhal fahiş zararla panik satışı yapmak zorunlu değildir. Fıkhi ilkelere göre yatırımcıya makul bir süre tanınır; ana sermayesini koruyarak piyasa şartlarına göre uygun bir zamanda pozisyondan çıkış planlamalıdır. Hissede kalınan süre boyunca elde edilen temettü ve faiz kaynaklı kazançlar ise arındırma amacıyla bağışlanmalıdır.",
    reference: "TKBB İlke Kararı: Endeksten Çıkan Hisselerin Tasfiyesi",
  },
  {
    id: "faq-11",
    category: "ENDEKS",
    question: "Katılım endeksinde olmayan bir hisseyi almak caiz midir?",
    answer:
      "Katılım endeksi dışındaki hisseler iki gruptur: 1) Ana faaliyeti haram olanlar (Banka, alkol, kumar vb.): Bunlara ortak olmak kesinlikle caiz değildir. 2) Faaliyeti helal ancak finansal rasyosu (%33 borç/nakit) aşılmış olanlar: DİB ve fıkıh meclisleri rasyoları aşan şirketlere yatırım yapılmasını da caiz görmemektedir.",
    reference: "Diyanet Din İşleri Yüksek Kurulu Fetvaları",
  },
  {
    id: "faq-12",
    category: "ENDEKS",
    question: "Şirket banka kredisi çekerse doğrudan endeksten düşer mi?",
    answer:
      "Her kredi şirketi endeksten düşürmez. Şirketin çektiği faizli kredilerin toplamı, şirketin piyasa değerinin veya toplam varlıklarının %33'ünün altında kaldığı müddetçe hisse katılım endeksinde kalmaya devam eder. Eğer kredi miktarı bu eşiği aşarsa ilk çeyreklik bilanço döneminde endeksten çıkarılır.",
    reference: "BIST Katılım Endeksleri Temel Kuralları",
  },

  // ==========================================
  // KATEGORİ: HALKA ARZ & KAFİF
  // ==========================================
  {
    id: "faq-13",
    category: "HALKA_ARZ",
    question: "Halka arzlarda katılım uygunluğu nasıl tespit edilir?",
    answer:
      "Halka arz izahnamesi ile birlikte SPK ve Borsa İstanbul onaylı 'Katılım Finansı İlkeleri Bilgi Formu (KAFİF)' yayımlanır. Bağımsız denetimden geçmiş mali tablolar üzerinden şirketin faaliyet konusu ve 3 altın rasyosu denetlenir. Formda 'Katılım Endeksi Kriterlerini Karşılamaktadır' ibaresi yer alan arzlar katılıma uygundur.",
    reference: "SPK Halka Arz İzahname Standartları & KAFİF Formu",
  },
  {
    id: "faq-14",
    category: "HALKA_ARZ",
    question: "Katılım Finansı İlkeleri Bilgi Formu (KAFİF) nedir, nerede yayımlanır?",
    answer:
      "KAFİF, halka arz edilecek veya borsada işlem gören şirketlerin bağımsız denetçiler ve danışma komiteleri tarafından doldurulan resmi uygunluk belgesidir. Şirketin esas sözleşmesi, faizli borçları, vadeli mevduatları ve uygunsuz gelirleri KAP (Kamuyu Aydınlatma Platformu) bildirimlerinde 'Katılım Finansı Bilgi Formu' başlığıyla ilan edilir.",
    reference: "KAP & SPK Mevzuatı",
  },
  {
    id: "faq-15",
    category: "HALKA_ARZ",
    question: "Halka arzda 'T1-T2 Bakiye ile Katılım' caiz midir?",
    answer:
      "Satılan hissenin takası (T+2) henüz tamamlanmamış olsa bile BIST Takasbank nezdinde mülkiyet taahhüdü ve tescili sağlandığından, nakit karşılığı hisse satışı neticesinde doğan bakiye ile halka arza katılmakta fıkhen bir sakınca bulunmamaktadır.",
    reference: "TKBB Danışma Kurulu Halka Arz Katılım Esasları",
  },
  {
    id: "faq-16",
    category: "HALKA_ARZ",
    question: "Halka arz tavan serisi bozulduğunda hisseyi satmak caiz midir?",
    answer:
      "Evet, halka arzdan alınan hisse yatırımcının mülkiyetindedir. Tavan serisinin devam etmesi veya bozulması piyasa fiyatlama dinamikleridir. Yatırımcının dilediği gün kârını realize ederek hisseyi satması tamamen caizdir.",
    reference: "İslam Fıkıh Akademisi Menkul Kıymet Kararları",
  },

  // ==========================================
  // KATEGORİ: ARINDIRMA (PURIFICATION)
  // ==========================================
  {
    id: "faq-17",
    category: "ARINDIRMA",
    question: "Hisse senedi arındırması (Purification) nedir ve kimlere vaciptir?",
    answer:
      "Katılım endeksindeki şirketler ana faaliyeti helal olsa dahi cüzi oranda (en fazla %5) vadeli mevduat faizi veya repo geliri elde edebilirler. Yatırımcı, şirketten elde ettiği temettüden veya hissenin elde tutulduğu süreye isabet eden bu faizli geliri hesaplayıp sevap beklemeksizin ihtiyaç sahiplerine veya hayır kurumlarına bağışlamalıdır. Bu işlem helal kazancı korumak için fıkhi bir yükümlülüktür.",
    reference: "TKBB Danışma Kurulu İlke Kararları & DİB Fetvaları",
  },
  {
    id: "faq-18",
    category: "ARINDIRMA",
    question: "Arındırma tutarı nasıl hesaplanır? (Temettü ve Pro-Rata)",
    answer:
      "İki yöntem uygulanır: 1) Temettü Arındırması: Şirketin o mali yıldaki 'Faiz Geliri / Toplam Hasılat' oranı kadar, alınan brüt temettüden düşülür (Örn: %1 faiz geliri varsa 1.000 ₺ temettünün 10 ₺'si bağışlanır). 2) Pro-Rata (Günlük) Arındırma: Hisse başına çeyreklik arındırma tutarı, hissenin portföyde tutulduğu gün sayısıyla çarpılarak hesaplanır. Mizan her iki yöntemi de kuruşu kuruşuna sunar.",
    reference: "TKBB Katılım İlkeleri Temettü Arındırma Rehberi",
  },
  {
    id: "faq-19",
    category: "ARINDIRMA",
    question: "Temettü vermeyen hissede arındırma yapmak gerekir mi?",
    answer:
      "Şirket o yıl temettü dağıtmadıysa ve kârını bünyesinde tuttuysa, yatırımcı sermaye kazancı (hisse fiyat artışı) elde ettiğinde ihtiyatlı görüşe göre hisse başına düşen cüzi faiz payını pro-rata olarak hesaplayıp arındırabilir. Ancak yaygın fetva, arındırmanın öncelikli olarak nakit tahsil edilen kâr payı (temettü) üzerinden yapılacağı yönündedir.",
    reference: "İslam Fıkıh Akademisi Taharet Kararları",
  },
  {
    id: "faq-20",
    category: "ARINDIRMA",
    question: "Arındırılan tutar zekat veya vergi yerine geçer mi?",
    answer:
      "Hayır. Arındırma işlemi gayrimeşru (faiz vb.) unsurların mülkiyetten çıkarılmasıdır; yatırımcının kendi mülkü değildir. Zekat ise helal ve nisap miktarına ulaşmış malın farz olan ibadetidir. Dolayısıyla arındırma tutarı zekata sayılamaz, devlete ödenen vergi yerine de ikame edilemez.",
    reference: "Diyanet Din İşleri Yüksek Kurulu Fetvası",
  },
  {
    id: "faq-21",
    category: "ARINDIRMA",
    question: "Arındırma parası kimlere ve nerelere bağışlanmalıdır?",
    answer:
      "Arındırma tutarı, sevap beklenmeksizin yoksullara, maddi sıkıntı çeken öğrencilere, yetimlere veya kamu yararına çalışan hayır kurumlarına bağışlanmalıdır. Cami veya Kur'an kursu inşası gibi ibadethane yapımında kullanılması tavsiye edilmez; doğrudan ihtiyaç sahibinin temel ihtiyaçlarında kullanılması esastır.",
    reference: "Fıkıh Ansiklopedisi: Gayrimeşru Kazancın Tasfiyesi",
  },

  // ==========================================
  // KATEGORİ: HİSSE SENEDİ ZEKÂTI
  // ==========================================
  {
    id: "faq-22",
    category: "ZEKAT",
    question: "Hisse senetlerinin zekatı nasıl hesaplanır?",
    answer:
      "İki niyet ayrımı vardır: 1) Al-sat (kısa vadeli ticaret) amacıyla tutulan hisselerde, zekat günü itibarıyla hisselerin piyasa değeri üzerinden %2.5 verilir. 2) Uzun vadeli ortaklık ve temettü amacıyla tutulan hisselerde ise fabrikanın bina ve makineleri zekattan muaftır; şirketin 'Dönen Varlıklar - Kısa Vadeli Borçlar' matrahı hisse başına oranlanır. Mizan her hisse için hisse başı net zekat matrahını otomatik hesaplar.",
    reference: "İslam Fıkıh Akademisi Zekat Kararları (Cidde)",
  },
  {
    id: "faq-23",
    category: "ZEKAT",
    question: "Şirketin fabrika, bina ve makineleri zekâta tabi midir?",
    answer:
      "Hayır. Fıkıhta üretim araçları, fabrikalar, iş makineleri, hizmet binaları ve gayrimenkuller 'kaside' (asli ihtiyaç ve üretim aracı) sayılır ve zekâttan muaftır. Yalnızca şirketin nakit parası, alacakları ve satılmak üzere bekleyen ticari malları (Dönen Varlıklar) borçlar düşüldükten sonra zekât matrahını oluşturur.",
    reference: "Diyanet Din İşleri Yüksek Kurulu Zekat Rehberi",
  },
  {
    id: "faq-24",
    category: "ZEKAT",
    question: "Zararda olan hisse senedi için zekât ödenir mi?",
    answer:
      "Zekât kâr üzerinden değil, elde bulunan net zekâta tabi varlığın nisap miktarını aşması üzerinden hesaplanır. Eğer yatırımcının elindeki hisselerin güncel değeri (veya net dönen varlık payı) diğer birikimleriyle birlikte nisap miktarını (80.18 gram altın) aşıyorsa, hisse geçmişte zararda olsa dahi mevcut piyasa değeri üzerinden zekât tahakkuk eder.",
    reference: "Diyanet Din İşleri Yüksek Kurulu",
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
  // ==========================================
  // AKİD TÜRLERİ & ORTAKLIK MODELLERİ
  // ==========================================
  {
    term: "Müşaraka (Kâr-Zarar Ortaklığı)",
    arabicName: "مشاركة",
    shortDesc: "Tarafların sermaye koyarak kâr ve zarara birlikte ortak olduğu temel model.",
    fullDesc:
      "Hisse senetlerinin fıkhi zeminini oluşturan ortaklık modelidir. Taraflar şirketin sermayesine hisseleri oranında ortak olur; kâr önceden belirlenen oranlarda, zarar ise sermaye payları nispetinde paylaşılır.",
    tag: "Akid Türü",
  },
  {
    term: "Mudaraba (Emek-Sermaye Ortaklığı)",
    arabicName: "مضاربة",
    shortDesc: "Bir tarafın sermaye, diğer tarafın emek koyduğu kâr ortaklığı akdi.",
    fullDesc:
      "Katılım bankalarının katılma hesaplarında ve İslami fonlarda uygulanan modeldir. Sermaye sahibi (rabbü'l-mal) parayı koyar, işletmeci (mudarib) emeğini sunar. Kâr anlaşmaya göre bölüşülür; ticari zarar halinde işletmecinin kusuru yoksa para sahibi sermayesinden, işletmeci ise emeğinden kaybeder.",
    tag: "Akid Türü",
  },
  {
    term: "Murabaha (Kâr Eklenerek Vadeli Satış)",
    arabicName: "مرابحة",
    shortDesc: "Malın maliyeti açıkça belirtilerek üzerine kâr marjı eklenip vadeli satılması.",
    fullDesc:
      "Katılım bankalarının en yaygın finansman yöntemidir. Banka müşterinin talep ettiği malı peşin satın alır, üzerine anlaşılan kâr payını ekleyerek müşteriye vadeli olarak devreder. Para borcu üzerinden faiz değil, gerçek bir malın ticaretiyle meşru kâr elde edilir.",
    tag: "Finansman Yöntemi",
  },
  {
    term: "İcare (Kiralama & İntifa Hakkı)",
    arabicName: "إجارة",
    shortDesc: "Bir malın veya mülkün kullanım hakkının belirli bir bedel karşılığı kiralanması.",
    fullDesc:
      "Kira sertifikalarının (Sukuk) temel dayanağıdır. Varlığın mülkiyeti veya menfaati yatırımcılara aittir; yatırımcılar bu varlığın dönemsel kira getirisinden pay alırlar.",
    tag: "Akid Türü",
  },
  {
    term: "Selem (Peşin Para ile Vadeli Mal Alımı)",
    arabicName: "سلم",
    shortDesc: "Bedeli peşin ödenerek cinsi, kalitesi ve vadesi belirlenmiş malın sonradan teslim alınması.",
    fullDesc:
      "Tarım ve sanayi üretimini finanse etmek amacıyla Hz. Peygamber (s.a.v.) tarafından istisnai olarak ruhsatlandırılan bir akiddir. Üreticiye peşin likidite sağlanır, teslimat belirlenen tarihte fiziksel olarak yapılır.",
    tag: "Akid Türü",
  },
  {
    term: "İstisna' (Eser & İmalat Sözleşmesi)",
    arabicName: "استصناع",
    shortDesc: "Henüz mevcut olmayan bir projenin şartnameye göre üretilmesi için yapılan akid.",
    fullDesc:
      "Gemi yapımı, konut projeleri, sanayi tesisleri ve altyapı projelerinin faizsiz finansmanında kullanılan üretim ve imalat sözleşmesidir.",
    tag: "Akid Türü",
  },
  {
    term: "Vekalet bi'l-İstismar (Yatırım Vekaleti)",
    arabicName: "وكالة بالاستثمار",
    shortDesc: "Yatırımcının fonunun katılım ilkelerine uygun yönetilmesi için kuruma vekalet vermesi.",
    fullDesc:
      "Katılım bankalarında veya portföy yönetim şirketlerinde müşterinin getiri beklentisiyle fonunu kuruma teslim etmesi; kurumun vekil sıfatıyla ücret karşılığı bu fonu helal alanlarda değerlendirmesidir.",
    tag: "Akid Türü",
  },
  {
    term: "Karz-ı Hasen (Güzel Borç)",
    arabicName: "قرض حسن",
    shortDesc: "Hiçbir menfaat veya faiz şart koşulmaksızın yalnızca Allah rızası için verilen borç.",
    fullDesc:
      "İslam iktisadında borç para vermenin yegane meşru biçimidir. Paranın zaman değerinden fazlalık talep etmek haramdır; borç ancak verildiği miktar kadar tahsil edilir.",
    tag: "Fıkhi İlke",
  },
  {
    term: "Teverruk (Nakit Sağlama Amaçlı Üçlü Ticaret)",
    arabicName: "تورق",
    shortDesc: "Nakit ihtiyacını gidermek için vadeli satın alınan bir malın üçüncü şahsa peşin satılması.",
    fullDesc:
      "Katılım finansında nakit ihtiyacını karşılamak için uygulanan bir mekanizmadır. Fıkıh kurulları organize teverrukun faize kılıf olmaması için sıkı kurallar ve gerçek emtia teslimat şartları koymuştur.",
    tag: "Finansman Yöntemi",
  },

  // ==========================================
  // TEMEL FIKHİ İLKELER & YASAKLAR
  // ==========================================
  {
    term: "Riba (Faiz & Haksız Fazlalık)",
    arabicName: "ربا",
    shortDesc: "Borç karşılığında veya para değişiminde şart koşulan karşılıksız kazanç.",
    fullDesc:
      "Kur'an-ı Kerim'de kesin naslarla haram kılınan, paranın risksiz olarak zaman üzerinden kazanç doğurmasıdır. Şirketlerin faizli kredileri, tahvil ihraçları ve vadeli mevduat faizleri bu yasak kapsamındadır.",
    tag: "Temel Yasak",
  },
  {
    term: "Garar (Aşırı Belirsizlik & Aldanma)",
    arabicName: "غرر",
    shortDesc: "Sonucu belirsiz, akibeti meçhul ve taraflardan birinin aldanmasına yol açan risk.",
    fullDesc:
      "Akdin konusunun, fiyatının veya teslimatının kesin olmadığı durumlardır. VİOP, türev araçlar, kaldıraçlı forex ve ikili opsiyonlar garar içerdiği için caiz görülmez.",
    tag: "Temel Yasak",
  },
  {
    term: "Meysir (Kumar & Emeksiz Spekülasyon)",
    arabicName: "ميسر",
    shortDesc: "Taraflardan birinin kazanmasının tamamen diğerinin kaybına dayandığı şans oyunu.",
    fullDesc:
      "Ekonomik bir artı değer ve meşru ticari risk üretmeksizin, sırf fiyat dalgalanmaları üzerinden şans ve bahis mantığıyla kazanç elde etme fiilidir.",
    tag: "Temel Yasak",
  },
  {
    term: "Kabz (Mülkiyet & Hukuki Teslim Alma)",
    arabicName: "قبض",
    shortDesc: "Satın alınan bir malın hukuki ve fiili tasarruf yetkisine geçmesi.",
    fullDesc:
      "Peygamber Efendimiz (s.a.v.) kabz gerçekleşmeden malın satılmasını yasaklamıştır. Borsada Takasbank nezdinde tescil edilen mülkiyet hukuki kabz hükmündedir; açığa satışta ise kabz olmadığı için işlem haramdır.",
    tag: "Fıkhi İlke",
  },
  {
    term: "Bey'u ma leyse indek (Olmayan Malın Satışı)",
    arabicName: "بيع ما ليس عندك",
    shortDesc: "Kişinin mülkiyetinde bulunmayan bir malı üçüncü bir şahsa satması yasağı.",
    fullDesc:
      "Açığa satış (short selling) yasağının temel hadis dayanağıdır. Mal teslim edilememe ve fiyat manipülasyonu riski taşıdığı için yasaklanmıştır.",
    tag: "Temel Yasak",
  },
  {
    term: "Umumu'l-Belve (Kaçınılmaz Genel İbtila)",
    arabicName: "عموم البلوى",
    shortDesc: "Toplumun tamamını kuşatan ve tamamen kaçınması imkansız hale gelen yaygın güçlük.",
    fullDesc:
      "Modern iktisadi düzende şirketlerin faizden tamamen %100 steril kalmasının zorluğu karşısında, fıkıh alimlerinin %33 borç/nakit ve %5 gelir toleranslarını meşru kılmak için dayandığı fıkhi kolaylık prensibidir.",
    tag: "Fıkhi İlke",
  },
  {
    term: "İstihlak (Tüketim & Hükmen Yok Olma)",
    arabicName: "استهلاك",
    shortDesc: "Helal olmayan az miktardaki bir unsurun büyük bir helal kütle içinde eriyip kaybolması.",
    fullDesc:
      "Şirketin devasa hasılatı içerisindeki %1-2 civarındaki önemsiz faiz gelirlerinin şirketin ana helallik vasfını yok etmeyeceği, arındırma yoluyla temizlenebileceği ilkesinin fıkhi temelidir.",
    tag: "Fıkhi İlke",
  },

  // ==========================================
  // BORSA İSTANBUL & KATILIM ENSTRÜMANLARI
  // ==========================================
  {
    term: "Sukuk (Kira Sertifikası)",
    arabicName: "صكوك",
    shortDesc: "Varlığa dayalı faizsiz getiri ve ortaklık sertifikası.",
    fullDesc:
      "Konvansiyonel faizli tahvilin aksine, somut bir gayrimenkul veya altyapı varlığının mülkiyetini ya da intifa hakkını temsil eder. Yatırımcı sabit faiz değil, o varlığın kira ve kâr getirisinden pay alır.",
    tag: "Finansal Enstrüman",
  },
  {
    term: "KAFİF (Katılım Finansı Bilgi Formu)",
    arabicName: "نموذج الإفصاح المالي الإسلامي",
    shortDesc: "BIST şirketlerinin faizsiz standartlara uygunluk beyan belgesi.",
    fullDesc:
      "Kamuyu Aydınlatma Platformu'nda (KAP) yayımlanan; şirketin faaliyet konusunu, faizli borçlarını, faizli nakit varlıklarını ve uygun olmayan gelir oranlarını resmi olarak teyit eden yasal formdur.",
    tag: "Resmi Standart",
  },
  {
    term: "XKTUM (BIST Katılım Tüm Endeksi)",
    arabicName: "مؤشر المشاركة للجميع",
    shortDesc: "Borsa İstanbul Katılım Finans kriterlerini karşılayan tüm hisselerin endeksi.",
    fullDesc:
      "Diyanet İşleri Başkanlığı ve TKBB Merkezi Danışma Kurulu ilke kararlarına göre 3 altın rasyoyu sağlayan ve haram sektörlerde faaliyet göstermeyen tüm Borsa İstanbul hisselerini kapsayan ana şemsiye endekstir.",
    tag: "Resmi Standart",
  },
  {
    term: "Fıkhi Arındırma (Purification)",
    arabicName: "تطهير",
    shortDesc: "Hisse gelirindeki faizli veya gayrimeşru kısmın hayra bağışlanması.",
    fullDesc:
      "Şirketin kazancına karışan düşük oranlı (azami %5) faiz veya uygunsuz gelirlerin, yatırımcının temettü veya değer kazancından hesaplanarak sevap beklemeksizin ihtiyaç sahiplerine dağıtılması fıkhi yükümlülüğüdür.",
    tag: "Zekât & Arındırma",
  },
  {
    term: "Zekat Matrahı (Net Dönen Varlıklar)",
    arabicName: "وعاء الزكاة",
    shortDesc: "Şirketin dönen varlıklarından kısa vadeli borçlarının düşülmesiyle hesaplanan zekât bazı.",
    fullDesc:
      "Uzun vadeli hisse senedi yatırımcıları için fabrikanın bina ve makineleri zekattan muaftır; zekât yalnızca hisse başına düşen net nakit, ticari stok ve alacaklar üzerinden hesaplanır.",
    tag: "Zekât & Arındırma",
  },
  {
    term: "Tekasül (İslami Sigorta)",
    arabicName: "تكافل",
    shortDesc: "Yardımlaşma, karşılıklı sorumluluk ve faizsiz fonlama esasına dayalı sigortacılık.",
    fullDesc:
      "Geleneksel sigortadaki faiz ve kumar unsurlarından arındırılmış; katılımcıların ödediği primlerin ortak bir teberru fonunda toplandığı ve hasarların bu fondan karşılandığı modeldir.",
    tag: "Finansal Enstrüman",
  },
  {
    term: "Rüçhan Hakkı (Öncelikli Pay Alımı)",
    arabicName: "حق الأولوية",
    shortDesc: "Bedelli sermaye artırımında mevcut ortakların yeni payları öncelikle alma hakkı.",
    fullDesc:
      "Mevcut ortaklık oranını korumak için şirketin çıkardığı yeni hisseleri nominal bedelden alma hakkıdır. Fıkhen meşru bir haktır; kullanılabilir veya borsada rüçhan kuponu olarak satılabilir.",
    tag: "Finansal Enstrüman",
  },
  {
    term: "Açığa Satış Yasağı (Short Sale Ban)",
    arabicName: "حظر البيع على المكشوف",
    shortDesc: "Mülkiyette olmayan hissenin borçlanılarak satılmasının katılım ilkelerince yasaklanması.",
    fullDesc:
      "Düşüş beklentisiyle aracı kurumdan ödünç hisse alınıp satılması işlemidir; kabz şartını ihlal ettiği için katılım hesaplarında ve portföylerinde kesinlikle uygulanamaz.",
    tag: "Temel Yasak",
  },
  {
    term: "Kredili İşlem / Marjin (Margin Trading)",
    arabicName: "التداول بالهامش",
    shortDesc: "Aracı kurumdan faizle borç para alınarak özkaynaktan fazla hisse alınması.",
    fullDesc:
      "Doğrudan faizli borçlanma işlemi olduğu için katılım yatırımcıları tarafından kesinlikle kullanılamaz. Katılım yatırımcısı sadece kendi nakit özkaynağı ile işlem yapabilir.",
    tag: "Temel Yasak",
  },
  {
    term: "VİOP (Vadeli İşlem ve Opsiyon Piyasası)",
    arabicName: "سوق العقود الآجلة",
    shortDesc: "Gelecekteki bir tarihte teslim edilmek üzere bugünden fiyatı belirlenen türev kontratlar.",
    fullDesc:
      "Fiziki teslimat olmaksızın nakdi uzlaşma ile sadece fiyat spekülasyonu yapıldığı için İslam fıkıh meclisleri tarafından caiz görülmemektedir.",
    tag: "Temel Yasak",
  },
  {
    term: "Hisse Geri Alımı (Share Buyback)",
    arabicName: "إعادة شراء الأسهم",
    shortDesc: "Şirketin piyasada işlem gören kendi paylarını şirket kaynaklarıyla geri satın alması.",
    fullDesc:
      "Şirketin özkaynak yapısını ve piyasa değerini desteklemek için kendi hisselerini satın alması fıkhen caiz bir tasarruftur. Bu işlem rasyolardaki payda büyüklüğünü etkiler.",
    tag: "Finansal Enstrüman",
  },
  {
    term: "Nisap Miktarı (Zekât Eşiği)",
    arabicName: "نصاب الزكاة",
    shortDesc: "Bir müslümanın zekâtla mükellef olması için sahip olması gereken asgari zenginlik ölçüsü.",
    fullDesc:
      "Klasik fıkıhta 80.18 gram altın veya karşılığı nakit/hisse senedidir. Bu tutarı aşan ve üzerinden 1 kameri yıl geçen helal birikimler için %2.5 zekât verilir.",
    tag: "Zekât & Arındırma",
  },
  {
    term: "Pro-Rata Günlük Arındırma",
    arabicName: "التطهير النسبي اليومي",
    shortDesc: "Hissenin portföyde tutulduğu gün sayısına göre hesaplanan adil arındırma yöntemi.",
    fullDesc:
      "Hisse yılın tamamında değil de örneğin 45 gün tutulduysa, yıllık arındırma tutarının 45/365'i oranında hesaplanması esasına dayanan dinamik arındırma modelidir.",
    tag: "Zekât & Arındırma",
  },
  {
    term: "Temettü Verimi (Dividend Yield)",
    arabicName: "عائد التوزيعات",
    shortDesc: "Şirketin hisse başına ödediği nakit kâr payının hisse fiyatına oranı.",
    fullDesc:
      "Ortaklığın nakit getiri kabiliyetini gösterir. Katılım yatırımcıları temettü ödemesi aldıklarında şirketin faizli gelir oranı nispetinde derhal arındırma yapmalıdır.",
    tag: "Finansal Enstrüman",
  },
  {
    term: "Piyasa Değeri Kuralı (Payda Kuralı)",
    arabicName: "قاعدة القيمة السوقية",
    shortDesc: "Rasyolar hesaplanırken son 20 günlük piyasa değeri veya aktif toplamının seçilmesi kuralı.",
    fullDesc:
      "Borsa İstanbul ve TKBB tarafından belirlenen kuraldır. Şirketin piyasa dalgalanmalarından haksız etkilenmesini önlemek için 20 günlük piyasa değeri ile toplam aktif büyüklüğünden yüksek olanı payda kabul edilir.",
    tag: "Resmi Standart",
  },
  {
    term: "Bedelsiz Sermaye Artırımı",
    arabicName: "أسهم المنحة",
    shortDesc: "Şirketin geçmiş yıl kârlarını sermayeye ekleyerek ortaklara ücretsiz hisse dağıtması.",
    fullDesc:
      "Şirketin iç kaynaklarının sermayeye dönüşmesidir; ortakların cebinden para çıkmaz, şirket değeri değişmez, sadece hisse adedi artar. Fıkhen tamamen caizdir.",
    tag: "Finansal Enstrüman",
  },
  {
    term: "İcazet Belgesi (Şer'i Uygunluk Onayı)",
    arabicName: "شهادة التوافق الشرعي",
    shortDesc: "Yetkili fıkıh kurulunun bir şirket, fon veya ürün için verdiği helallik sertifikası.",
    fullDesc:
      "TKBB Danışma Kurulu veya bağımsız fıkıh heyetleri tarafından yapılan denetim neticesinde ürünün faizsiz finans ilkelerine uygun olduğunu tasdik eden resmi icazettir.",
    tag: "Resmi Standart",
  },
];

export default function RehberPage() {
  const [activeTab, setActiveTab] = useState<"CEVAZLAR" | "TERIMLER" | "SSS" | "RASYO">("CEVAZLAR");
  const [faqCategory, setFaqCategory] = useState<string>("TÜMÜ");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  // Glossary filter & search
  const [glossaryCategory, setGlossaryCategory] = useState<string>("TÜMÜ");
  const [glossarySearch, setGlossarySearch] = useState("");

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat = faqCategory === "TÜMÜ" || faq.category === faqCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredGlossary = GLOSSARY.filter((item) => {
    const matchesCat = glossaryCategory === "TÜMÜ" || item.tag === glossaryCategory;
    const matchesSearch =
      glossarySearch === "" ||
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.shortDesc.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.fullDesc.toLowerCase().includes(glossarySearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <PaynoShell badge="rehber">
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Apple Design Frosted Hero Header */}
        <div className="bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-[#0D8B52] dark:text-emerald-400 text-xs font-bold">
              <Scale size={14} className="text-[#0D8B52] dark:text-emerald-400" />
              <span>Diyanet İşleri Başkanlığı ve TKBB Standartları</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#6E81A0] dark:text-[#94A3B8]">
              626 BIST Hisse Fıkhi Kütüphanesi
            </span>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] dark:text-white tracking-tight">
              İslami Finans &amp;{" "}
              <span className="italic font-serif text-[#405881] dark:text-blue-400">Fıkhi Cevazlar</span>{" "}
              Bilgi Merkezi
            </h1>
            <p className="text-xs sm:text-sm text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed font-normal">
              Borsa İstanbul&apos;da helal kazanç esasları, yetkili kurulların fıkhi fetvaları,
              33 kapsamlı terimden oluşan faizsiz finans sözlüğü ve yatırımcıların en çok merak ettiği 24 soru-cevap.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("CEVAZLAR")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
              activeTab === "CEVAZLAR"
                ? "bg-[#182542] dark:bg-[#273869] text-white shadow-md shadow-[#182542]/20 scale-100"
                : "bg-white/80 dark:bg-[#0E1015] hover:bg-white dark:hover:bg-[#151720] text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white border border-white/90 dark:border-white/10"
            }`}
          >
            <ShieldCheck size={14} />
            <span>Fıkhi Cevazlar &amp; Kurallar</span>
          </button>
          <button
            onClick={() => setActiveTab("TERIMLER")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
              activeTab === "TERIMLER"
                ? "bg-[#182542] dark:bg-[#273869] text-white shadow-md shadow-[#182542]/20 scale-100"
                : "bg-white/80 dark:bg-[#0E1015] hover:bg-white dark:hover:bg-[#151720] text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white border border-white/90 dark:border-white/10"
            }`}
          >
            <BookOpen size={14} />
            <span>Finans Terimleri Sözlüğü ({GLOSSARY.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("SSS")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
              activeTab === "SSS"
                ? "bg-[#182542] dark:bg-[#273869] text-white shadow-md shadow-[#182542]/20 scale-100"
                : "bg-white/80 dark:bg-[#0E1015] hover:bg-white dark:hover:bg-[#151720] text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white border border-white/90 dark:border-white/10"
            }`}
          >
            <HelpCircle size={14} />
            <span>Sıkça Sorulan Sorular ({FAQS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("RASYO")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
              activeTab === "RASYO"
                ? "bg-[#182542] dark:bg-[#273869] text-white shadow-md shadow-[#182542]/20 scale-100"
                : "bg-white/80 dark:bg-[#0E1015] hover:bg-white dark:hover:bg-[#151720] text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white border border-white/90 dark:border-white/10"
            }`}
          >
            <Calculator size={14} />
            <span>3 Altın Rasyo Metodolojisi</span>
          </button>
        </div>

        {/* TAB 1: CEVAZLAR VE KURALLAR */}
        {activeTab === "CEVAZLAR" && (
          <div className="space-y-6">
            {/* Top Authorities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] p-6 border border-white/85 dark:border-white/10 shadow-2xs space-y-3 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-800 dark:text-emerald-400 font-extrabold text-sm">
                  DİB
                </div>
                <h3 className="text-base font-extrabold text-[#182542] dark:text-white">
                  Diyanet İşleri Başkanlığı
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                  Din İşleri Yüksek Kurulu
                </span>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  Faaliyeti helal olan şirketlere ortak olmak caizdir. Açığa satış,
                  kaldıraç ve faizli borçlanma içeren işlemler ise kesinlikle yasaklanmıştır.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] p-6 border border-white/85 dark:border-white/10 shadow-2xs space-y-3 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-800 dark:text-blue-400 font-extrabold text-sm">
                  TKBB
                </div>
                <h3 className="text-base font-extrabold text-[#182542] dark:text-white">
                  Türkiye Katılım Bankaları Birliği
                </h3>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">
                  Merkezi Danışma Kurulu
                </span>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  Borsa İstanbul Katılım Endeksi metodolojisini belirler. %33 faizli borç, %33 nakit ve
                  %5 gayrimeşru gelir sınırlarını çeyreklik KAP verileriyle denetler.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] p-6 border border-white/85 dark:border-white/10 shadow-2xs space-y-3 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-800 dark:text-indigo-400 font-extrabold text-sm">
                  İİT
                </div>
                <h3 className="text-base font-extrabold text-[#182542] dark:text-white">
                  İslam Fıkıh Akademisi
                </h3>
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block">
                  Uluslararası Fıkıh Meclisi (Cidde)
                </span>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  57 İslam ülkesinin en saygın ulemasının ortak meclisidir. 63 ve 65 sayılı kararlarıyla açığa satış,
                  türev araçlar ve hisse zekâtı matrahını fıkhi hükme bağlamıştır.
                </p>
              </div>
            </div>

            {/* 4 Temel Fıkhi Sütun Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-[28px] bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl border border-white/85 dark:border-white/10 shadow-2xs space-y-2 transition-colors">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                  1. Sütun
                </span>
                <h4 className="text-sm font-extrabold text-[#182542] dark:text-white">Mülkiyet &amp; Kabz Şartı</h4>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  Hz. Peygamber&apos;in &quot;Sahip olmadığın şeyi satma&quot; ilkesi gereği, hisse senedi takası tescil edilmeden (açığa satış) işlem yapılamaz.
                </p>
              </div>

              <div className="p-5 rounded-[28px] bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl border border-white/85 dark:border-white/10 shadow-2xs space-y-2 transition-colors">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg">
                  2. Sütun
                </span>
                <h4 className="text-sm font-extrabold text-[#182542] dark:text-white">Riba (Faiz) Yasağı</h4>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  Paranın borç verilip karşılığında fazlalık istenmesi haramdır. Kredili işlem ve marjin kaldıraçları faiz yasağına girer.
                </p>
              </div>

              <div className="p-5 rounded-[28px] bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl border border-white/85 dark:border-white/10 shadow-2xs space-y-2 transition-colors">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                  3. Sütun
                </span>
                <h4 className="text-sm font-extrabold text-[#182542] dark:text-white">Garar &amp; Meysir Yasağı</h4>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  Aşırı belirsizlik, aldanma ve kumar benzeri spekülasyon haramdır. Fiziki varlığa dayanmayan VİOP ve türev araçlar caiz değildir.
                </p>
              </div>

              <div className="p-5 rounded-[28px] bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl border border-white/85 dark:border-white/10 shadow-2xs space-y-2 transition-colors">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg">
                  4. Sütun
                </span>
                <h4 className="text-sm font-extrabold text-[#182542] dark:text-white">Umumu&apos;l-Belve &amp; Arındırma</h4>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  Modern finans sisteminde kaçınılmaz olan cüzi faiz gelirleri (%5 altı) tolerans dahilindedir ancak kuruşu kuruşuna arındırılmalıdır.
                </p>
              </div>
            </div>

            {/* Permitted vs Prohibited Table (12 İşlem Türü) */}
            <div className="bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] p-6 sm:p-7 border border-white/85 dark:border-white/10 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4 transition-colors">
              <div>
                <h2 className="text-base font-extrabold text-[#182542] dark:text-white tracking-tight">
                  Borsa İşlem Türlerine Göre Kapsamlı Fıkhi Hükümler
                </h2>
                <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] mt-0.5 font-normal">
                  Hangi borsa işlemleri dinen caizdir, hangileri kesinlikle haram kılınmıştır?
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-[#6E81A0] dark:text-[#94A3B8] font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">İşlem Türü</th>
                      <th className="py-3 px-4">Fıkhi Hüküm</th>
                      <th className="py-3 px-4">Temel Gerekçe / Fıkhi Dayanak</th>
                      <th className="py-3 px-4">Yetkili Kurul Kararı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {[
                      {
                        name: "Spot Hisse Senedi Alımı (Katılım Uyumlu)",
                        status: "CAİZ (HELAL)",
                        isHalal: true,
                        reason: "Şirketin faaliyeti ve rasyoları uygunsa gerçek bir ticari sermaye ortaklığıdır (müşaraka).",
                        auth: "Diyanet Din İşleri Yüksek Kurulu & TKBB",
                      },
                      {
                        name: "Sukuk (Kira Sertifikası) Alımı",
                        status: "CAİZ (HELAL)",
                        isHalal: true,
                        reason: "Gerçek bir gayrimenkul veya altyapı varlığının kira ve kâr getirisine oransal ortaklıktır.",
                        auth: "TKBB Merkezi Danışma Kurulu",
                      },
                      {
                        name: "Temettü (Kâr Payı) Geliri",
                        status: "CAİZ (Arındırma ile)",
                        isHalal: true,
                        reason: "Ticari kâr payıdır. İçindeki cüzi faiz geliri oranı kadar hesaplanıp arındırılmalıdır.",
                        auth: "Diyanet & TKBB İlke Kararları",
                      },
                      {
                        name: "Halka Arza Katılım (KAFİF Beyanlı)",
                        status: "CAİZ (HELAL)",
                        isHalal: true,
                        reason: "Şirketin sermaye artırımına birincil piyasada doğrudan ortak olmaktır.",
                        auth: "SPK & TKBB Danışma Kurulu",
                      },
                      {
                        name: "Rüçhan Hakkı Kullanımı ve Satışı",
                        status: "CAİZ (HELAL)",
                        isHalal: true,
                        reason: "Mevcut ortaklık payını koruma hakkıdır; bedelli artırıma katılmak veya hakkı satmak caizdir.",
                        auth: "İslam Fıkıh Akademisi",
                      },
                      {
                        name: "T1 / T2 Bakiye ile Hisse Alımı",
                        status: "CAİZ (HELAL)",
                        isHalal: true,
                        reason: "Satılan hissenin takası tamamlanmamış olsa bile Takasbank nezdinde tescil ve teminat mevcuttur.",
                        auth: "TKBB Danışma Kurulu",
                      },
                      {
                        name: "Hisse Geri Alım Programına Katılım",
                        status: "CAİZ (HELAL)",
                        isHalal: true,
                        reason: "Ortağın kendi hissesini şirkete belirlenen piyasa fiyatından iade etmesidir.",
                        auth: "Fıkıh Meclisleri",
                      },
                      {
                        name: "Katılım Dışı Hisse Alımı (Banka, Alkol vb.)",
                        status: "HARAM (YASAK)",
                        isHalal: false,
                        reason: "Faizli bankacılık veya haram mal üretimi yapan şirkete sermaye ortaklığı tesis edilemez.",
                        auth: "Tüm Fıkıh Kurulları İttifakı",
                      },
                      {
                        name: "Açığa Satış (Short Selling)",
                        status: "HARAM (YASAK)",
                        isHalal: false,
                        reason: "Mülkiyetine sahip olunmayan malın satışıdır. Hz. Peygamber (s.a.v.) yasaklamıştır.",
                        auth: "Diyanet, TKBB ve Fıkıh Akademisi",
                      },
                      {
                        name: "Kredili Hisse Alımı (Margin Trading)",
                        status: "HARAM (YASAK)",
                        isHalal: false,
                        reason: "Aracı kurumdan faizli borç para alınarak işlem yapılır; doğrudan faiz (riba) yasağıdır.",
                        auth: "Diyanet Din İşleri Yüksek Kurulu",
                      },
                      {
                        name: "VİOP & Vadeli Kontratlar (Futures)",
                        status: "HARAM (YASAK)",
                        isHalal: false,
                        reason: "Fiziki varlık ve teslimat yoktur; nakdi uzlaşma ile garar (aşırı belirsizlik) ve kumar niteliğindedir.",
                        auth: "İslam Fıkıh Akademisi Karar No: 63",
                      },
                      {
                        name: "Varant, Opsiyon ve Türev Ürünler",
                        status: "HARAM (YASAK)",
                        isHalal: false,
                        reason: "Ortada gerçek bir mülkiyet olmaksızın sadece fiyat beklentisinin primi alınıp satılır.",
                        auth: "İslam Fıkıh Akademisi Karar No: 65",
                      },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-white/5 transition">
                        <td className="py-3.5 px-4 font-bold text-[#182542] dark:text-white">{row.name}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            row.isHalal
                              ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400"
                              : "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400"
                          }`}>
                            {row.isHalal ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>{row.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-[#94A3B8] font-normal leading-relaxed">{row.reason}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">{row.auth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FINANS TERİMLERİ SÖZLÜĞÜ (33 Terim, Filtreleme ve Arama) */}
        {activeTab === "TERIMLER" && (
          <div className="space-y-6">
            {/* Filter and Search Bar for Glossary */}
            <div className="bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
                {["TÜMÜ", "Akid Türü", "Temel Yasak", "Finansal Enstrüman", "Fıkhi İlke", "Resmi Standart", "Zekât & Arındırma"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setGlossaryCategory(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      glossaryCategory === tag
                        ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/15 text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                    }`}
                  >
                    {tag === "TÜMÜ" ? "Tüm Terimler" : tag}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Terimlerde ara (Örn: sukuk, mudaraba)..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 text-xs text-[#182542] dark:text-white bg-white dark:bg-[#0A0B0E] focus:outline-none focus:ring-2 focus:ring-[#182542] dark:focus:ring-white/20 transition"
                />
              </div>
            </div>

            {/* Glossary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGlossary.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/85 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] p-6 border border-white/90 dark:border-white/10 shadow-2xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                        {item.tag}
                      </span>
                      <span className="font-serif text-sm text-slate-400 dark:text-slate-500 font-bold" dir="rtl">
                        {item.arabicName}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#182542] dark:text-white tracking-tight">
                      {item.term}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {item.shortDesc}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed font-normal">
                      {item.fullDesc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredGlossary.length === 0 && (
              <div className="text-center py-12 bg-white/70 dark:bg-[#0E1015] rounded-3xl border border-slate-200 dark:border-white/10">
                <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">Aramanıza uygun finansal terim bulunamadı.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SIKÇA SORULAN SORULAR (24 Soru, Kategori Filtreli) */}
        {activeTab === "SSS" && (
          <div className="space-y-6">
            {/* Filter and Search */}
            <div className="bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                {["TÜMÜ", "GENEL", "ENDEKS", "HALKA_ARZ", "ARINDIRMA", "ZEKAT"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFaqCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      faqCategory === cat
                        ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
                    }`}
                  >
                    {cat === "TÜMÜ" ? "Tüm Sorular" : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Sorularda ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 text-xs text-[#182542] dark:text-white bg-white dark:bg-[#0A0B0E] focus:outline-none focus:ring-2 focus:ring-[#182542] dark:focus:ring-white/20 transition"
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
                    className="bg-white/85 dark:bg-[#0E1015] backdrop-blur-xl rounded-[24px] border border-white/90 dark:border-white/10 overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition"
                    >
                      <span className="text-sm font-bold text-[#182542] dark:text-white">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-[#182542] dark:text-white shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-white/10 text-xs space-y-3 text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                        <p>{faq.answer}</p>
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 font-mono text-[11px] text-[#6E81A0] dark:text-[#94A3B8] flex items-center gap-1.5">
                          <Scale size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
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

        {/* TAB 4: 3 ALTIN RASYO METODOLOJİSİ (DİB & BIST Katılım) */}
        {activeTab === "RASYO" && (
          <div className="bg-white/80 dark:bg-[#0E1015] backdrop-blur-2xl rounded-[28px] p-6 sm:p-8 border border-white/85 dark:border-white/10 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-8 transition-colors">
            <div>
              <h2 className="text-xl font-extrabold text-[#182542] dark:text-white tracking-tight">
                Diyanet ve BIST Katılım 3 Altın Rasyo Metodolojisi
              </h2>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] mt-1 font-normal">
                Bir şirketin hissesinin caiz sayılabilmesi ve BIST Katılım Endeksinde yer alabilmesi için sağlaması gereken üç temel matematiksel eşik.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ratio 1 */}
              <div className="p-6 rounded-[28px] bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                    Maksimum %33.00
                  </span>
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-bold">Rasyo 1</span>
                </div>
                <h3 className="text-base font-bold text-[#182542] dark:text-white">
                  Toplam Faizli Borç Oranı
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  Şirketin kısa ve uzun vadeli tüm konvansiyonel banka kredileri ile ihraç ettiği faizli tahvillerin toplamının,
                  şirketin piyasa değerine veya aktif toplamına oranı %33&apos;ü geçemez.
                </p>
                <div className="p-3 rounded-2xl bg-white dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/10 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  Formül = Faizli Borçlar / Payda &le; %33.00
                </div>
              </div>

              {/* Ratio 2 */}
              <div className="p-6 rounded-[28px] bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                    Maksimum %33.00
                  </span>
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-bold">Rasyo 2</span>
                </div>
                <h3 className="text-base font-bold text-[#182542] dark:text-white">
                  Faiz Getirili Varlık Oranı
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  Şirketin kasasındaki vadeli mevduat, repo ve faizli tahvil gibi menkul kıymetlerin toplamının,
                  şirket payda değerine oranı %33 eşiğinin altında olmalıdır.
                </p>
                <div className="p-3 rounded-2xl bg-white dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/10 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  Formül = Vadeli Mevduat + Repo / Payda &le; %33.00
                </div>
              </div>

              {/* Ratio 3 */}
              <div className="p-6 rounded-[28px] bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full">
                    Maksimum %5.00
                  </span>
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-bold">Rasyo 3</span>
                </div>
                <h3 className="text-base font-bold text-[#182542] dark:text-white">
                  Uygunsuz Gelir / Hasılat Oranı
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed font-normal">
                  Şirketin brüt faiz gelirleri ve ana faaliyet dışı haram yan gelirlerinin toplam satış hasılatına oranı
                  kesinlikle %5&apos;i aşamaz. Bu oran içerisindeki gelirler arındırılmak zorundadır.
                </p>
                <div className="p-3 rounded-2xl bg-white dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/10 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  Formül = Faiz Gelirleri / Toplam Satış Hasılatı &le; %5.00
                </div>
              </div>
            </div>

            {/* Payda Kuralı Notu */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <span className="font-bold text-[#182542] dark:text-white block">Önemli Payda Kuralı (Borsa İstanbul &amp; TKBB Metodolojisi):</span>
              <p>
                Rasyo 1 ve Rasyo 2 hesaplanırken payda olarak <strong>&quot;Şirketin son 20 günlük piyasa değeri ortalaması&quot;</strong> ile <strong>&quot;Toplam Varlıkları (Aktif Büyüklüğü)&quot;</strong> kıyaslanır ve hangisi daha büyükse o tutar payda olarak seçilir. Böylece piyasa düşüşlerinde suni eşik aşımları engellenir.
              </p>
            </div>

            {/* CTA */}
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  Hisselerinizin Bu Kurallara Uygunluğunu Denetleyin
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 font-normal mt-0.5">
                  Borsa İstanbul&apos;daki 626 hissenin güncel rasyolarını anlık olarak tarayabilirsiniz.
                </p>
              </div>
              <Link
                href="/tarayici"
                className="px-5 py-2.5 rounded-xl bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white font-bold text-xs inline-flex items-center gap-2 shrink-0 transition-colors shadow-xs"
              >
                <span>626 Hisse Taramasına Git</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </PaynoShell>
  );
}
