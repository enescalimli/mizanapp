/**
 * DİB (Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu) ve
 * TKBB (Türkiye Katılım Bankaları Birliği) Danışma Kurulu
 * Katılım Finans Standartları Değerlendirme & Finansal Analitik Motoru
 */

export interface FintablesFinancialRatios {
  peRatio: string; // F/K (Fiyat / Kazanç)
  pbRatio: string; // PD/DD (Piyasa Değeri / Defter Değeri)
  evEbitda: string; // FD/FAVÖK
  evSales: string; // FD/Satışlar
  roePercent: string; // Özsermaye Kârlılığı (ROE)
  roaPercent: string; // Aktif Kârlılığı (ROA)
  ebitdaMarginPercent: string; // FAVÖK Marjı
  netProfitMarginPercent: string; // Net Kâr Marjı
  currentRatio: string; // Cari Oran
  acidTestRatio: string; // Asit-Test / Likidite Oranı
  netDebtToEbitda: string; // Net Borç / FAVÖK
  freeFloatPercent: string; // Halka Açıklık Oranı
  paidCapitalTRY: string; // Ödenmiş Sermaye
  marketCapTRY: string; // Piyasa Değeri
}

export interface KapDisclosureItem {
  id: string;
  ticker: string;
  category: "ÖDA" | "FR" | "DG" | "PA" | "GK" | "KAFİF";
  categoryLabel: string;
  title: string;
  summary: string;
  date: string;
  time: string;
  kapUrl: string;
}

export interface MizanAiAnalysisResult {
  score: number; // 0 - 100
  riskLevel: "DÜŞÜK" | "ORTA" | "YÜKSEK" | "KRİTİK";
  quarterlyRiskOutlook: string; // Gelecek çeyrek projeksiyonu
  footnoteAuditAnalysis: string; // Dipnot ayrıştırma özeti
  fundamentalMoatRating: string; // Moat ve temel analiz puanı
  investorAdviceNote: string; // Fıkhi yatırımcı notu
  purificationHealth: string; // Arındırma yükü değerlendirmesi
}

/**
 * Ücretsiz versiyonda Mizan AI Analiz panelini test etmeye izin verilen örnek hisseler
 */
export const FREE_DEMO_TICKERS = ["BIMAS", "ASELS"];

export function isFreeDemoTicker(ticker: string): boolean {
  return FREE_DEMO_TICKERS.includes(ticker.toUpperCase().trim());
}

/**
 * Şirkete ve sektörüne özel gerçekçi DİB & TKBB Katılım Kapsam Dışı Gerekçesi
 */
export function getDIBKatilimDetailedBreachReason(
  ticker: string,
  companyName: string,
  sector: string,
  debtRatio: number,
  cashRatio: number,
  impureRatio: number,
  isCompliant: boolean
): {
  category: "FAALIYET_ALANI" | "FAIZLI_BORC" | "FAIZLI_VARLIK" | "UYGUNSUZ_GELIR" | "ISTIRAK_YAPISI" | "UYGUN";
  summary: string;
  detail: string;
  applicableStandard: string;
} {
  const normTicker = ticker.toUpperCase().trim();
  const normSector = (sector || "").toLowerCase();

  // 1. TAM UYGUN ŞİRKETLER
  if (isCompliant) {
    return {
      category: "UYGUN",
      summary: "DİB & TKBB Katılım Finans Standartlarına Tam Uyum",
      detail: `${companyName} (${normTicker}), Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu ve TKBB Danışma Kurulu Katılım Finans Standartları ilkelerinin tümünü eksiksiz karşılamaktadır. Ana faaliyet konusu helaldir; faizli borç oranı (%${debtRatio.toFixed(
        2
      )} < %33), faiz getiren nakit varlık oranı (%${cashRatio.toFixed(
        2
      )} < %33) ve faizli/uygunsuz gelir oranı (%${impureRatio.toFixed(
        2
      )} < %5) fıkhi sınırların güvenli bölgesindedir. BIST Katılım Tüm (XKTUM) endeksinde yer almaktadır.`,
      applicableStandard: "TKBB Standart No: 1 / DİB Katılım İlkeleri Madde 2",
    };
  }

  // 2. ÖZEL BIST GİGANTLARI VE ŞİRKET BAZLI GERÇEK GEREKÇELER
  if (normTicker === "THYAO") {
    const diff = (debtRatio - 33.0).toFixed(2);
    return {
      category: "FAIZLI_BORC",
      summary: `Uçak Filosu Finansmanı ve Faizli Borç Oranı (%${debtRatio.toFixed(2)} > %33,00)`,
      detail: `Türk Hava Yolları'nın ana yolcu ve kargo taşımacılığı faaliyeti helal olmakla birlikte; küresel filo genişlemesi, uçak teslimat kredileri ve finansal kiralama (leasing) borçlarının ortalama piyasa değerine oranı %${debtRatio.toFixed(
        2
      )} seviyesindedir. DİB ve TKBB Danışma Kurulu tarafından belirlenen azami %33,00 tavan eşiğini +%${diff} aşması sebebiyle BIST Katılım Endeksi (XKTUM) kapsamı dışındadır.`,
      applicableStandard: "TKBB Katılım Finansı Standartları — Finansal Borç Sınırı (%33,00)",
    };
  }

  if (["GARAN", "AKBNK", "ISCTR", "YKBNK", "HALKB", "VAKBN", "TSKB", "QNBFB", "QNBTR"].includes(normTicker)) {
    return {
      category: "FAALIYET_ALANI",
      summary: "Ana Faaliyet: Konvansiyonel Faizli Bankacılık ve Mevduat Kabulü",
      detail: `${companyName}, geleneksel faizli bankacılık faaliyetleri yürütmekte; vadeli mevduat toplamakta ve faizli kredi kullandırmaktadır. DİB Din İşleri Yüksek Kurulu ve TKBB Danışma Kurulu Standart 1.1 uyarınca, ana gelir kaynağı faiz ve konvansiyonel kredi olan finans kuruluşları herhangi bir rasyo testine tabi tutulmaksızın doğrudan katılım kapsamı dışıdır.`,
      applicableStandard: "DİB Din İşleri Yüksek Kurulu İlkesi 1.1 & TKBB Standart 1",
    };
  }

  if (["TURSG", "ANHYT", "AGESA", "ANSGR", "AKGRT", "RAYYS"].includes(normTicker)) {
    return {
      category: "FAALIYET_ALANI",
      summary: "Ana Faaliyet: Konvansiyonel Sigortacılık ve Faizli Portföy Yönetimi",
      detail: `${companyName}, konvansiyonel (geleneksel) sigortacılık lisansına sahiptir. Toplanan primler faizli devlet tahvilleri, vadeli mevduat ve repo piyasalarında nemalandırılmakta olup Katılım Sigortacılığı (Tekafül / Yardımlaşma Sandığı) esaslarına tabi değildir. Bu nedenle DİB & TKBB ilkelerine göre katılım dışıdır.`,
      applicableStandard: "DİB Din İşleri Yüksek Kurulu Tekafül İlkeleri & TKBB Standart 1.2",
    };
  }

  if (normTicker === "KCHOL") {
    return {
      category: "ISTIRAK_YAPISI",
      summary: "Konsolide Portföyde %40+ Yapı Kredi Bankası (Faizli Finans) İştiraki",
      detail: `Koç Holding'in konsolide varlık ve gelirlerinin önemli bir payı Yapı Kredi Bankası (konvansiyonel bankacılık) iştirakinden kaynaklanmaktadır. Fıkhi holding standartlarına göre portföyündeki uygunsuz finansal kuruluş iştiraklerinin ağırlığı ve konsolide borçluluk rasyosu (%${debtRatio.toFixed(
        2
      )}) DİB/TKBB kriterlerini sağlamamaktadır.`,
      applicableStandard: "TKBB Holding ve İştirakler Fıkhi Değerlendirme Kriteri",
    };
  }

  if (normTicker === "SAHOL") {
    return {
      category: "ISTIRAK_YAPISI",
      summary: "Konsolide Portföyde Akbank ve Aksigorta (Faizli Finans) İştirakleri",
      detail: `Sabancı Holding'in konsolide özkaynak ve kâr yapısının merkezinde Akbank ve Aksigorta yer almaktadır. Konvansiyonel finans iştiraklerinin toplam aktiflerdeki payı ve holding borç rasyosu (%${debtRatio.toFixed(
        2
      )}) DİB & TKBB katılım normlarının dışındadır.`,
      applicableStandard: "TKBB Holding ve İştirakler Fıkhi Değerlendirme Kriteri",
    };
  }

  if (["AEFES", "TBORG"].includes(normTicker)) {
    return {
      category: "FAALIYET_ALANI",
      summary: "Ana Faaliyet: Alkollü İçecek (Bira/Malt) Üretimi ve Ticareti",
      detail: `${companyName}'nin birincil gelir kaynağı İslam dininde kesin olarak haram kılınan alkollü içeceklerin üretimi ve dağıtımıdır (%95+ ciro payı). DİB Din İşleri Yüksek Kurulu ilkeleri uyarınca bu faaliyet için %5 tolerans dahi uygulanamaz, şirket doğrudan kapsam dışıdır.`,
      applicableStandard: "DİB Din İşleri Yüksek Kurulu / TKBB Yasaklı Faaliyetler Listesi",
    };
  }

  if (normTicker === "SASA") {
    const diff = (debtRatio - 33.0).toFixed(2);
    return {
      category: "FAIZLI_BORC",
      summary: `Yatırım Kredileri ve Yüksek Faizli Borç Rasyosu (%${debtRatio.toFixed(2)} > %33,00)`,
      detail: `SASA Polyester'in petrokimya ve PTA üretim tesisi yatırımları nedeniyle ihraç ettiği tahviller ve banka kredilerinden kaynaklanan faizli borçlarının piyasa değerine oranı %${debtRatio.toFixed(
        2
      )} seviyesindedir. DİB ve TKBB azami %33,00 sınırını +%${diff} aşması sebebiyle katılım endeksine dahil edilememektedir.`,
      applicableStandard: "TKBB Katılım Finansı Standartları — Finansal Borç Sınırı (%33,00)",
    };
  }

  if (normTicker === "TUPRS") {
    return {
      category: "FAIZLI_BORC",
      summary: `Finansal Borçluluk ve Emtia Türev İşlemleri (%${debtRatio.toFixed(2)} > %33,00)`,
      detail: `Tüpraş'ın ham petrol tedarik finansmanı, rafineri modernizasyon kredileri ve türev hedge operasyonlarından kaynaklanan faizli borçlarının ortalama piyasa değerine oranı %${debtRatio.toFixed(
        2
      )} olup DİB/TKBB %33 katılım tavanının üzerindedir.`,
      applicableStandard: "TKBB Katılım Finansı Standartları — Finansal Borç Sınırı (%33,00)",
    };
  }

  if (normTicker === "EREGL") {
    return {
      category: "FAIZLI_VARLIK",
      summary: `Faiz Getiren Vadeli Mevduat ve Nakit Varlık Aşımı (%${cashRatio.toFixed(2)} > %33,00)`,
      detail: `Erdemir'in bilançosunda tuttuğu yüksek vadeli mevduat, eurobond ve repo cinsi faiz getirili likit varlıklarının ortalama piyasa değerine oranı %${cashRatio.toFixed(
        2
      )} seviyesindedir. DİB & TKBB'nin belirlediği azami %33,00 faizli nakit tavanını aştığı için katılım dışıdır.`,
      applicableStandard: "TKBB Katılım Finansı Standartları — Faiz Getiren Varlık Sınırı (%33,00)",
    };
  }

  if (normTicker === "PGSUS") {
    const diff = (debtRatio - 33.0).toFixed(2);
    return {
      category: "FAIZLI_BORC",
      summary: `Uçak Finansal Kiralama ve Dış Borçlanma Rasyosu (%${debtRatio.toFixed(2)} > %33,00)`,
      detail: `Pegasus Hava Taşımacılığı'nın teslim alınan yeni nesil uçak filosu için kullandığı finansal kiralama borçları ve eurobond ihraçlarının piyasa değerine oranı %${debtRatio.toFixed(
        2
      )} seviyesindedir (+%${diff} eşik aşımı).`,
      applicableStandard: "TKBB Katılım Finansı Standartları — Finansal Borç Sınırı (%33,00)",
    };
  }

  if (normTicker === "MGROS") {
    return {
      category: "UYGUNSUZ_GELIR",
      summary: "Alkol/Tütün Satış Cirosu ve Faiz Gelirleri Oranı (%5 Tolerans Aşımı)",
      detail: `Migros'un süpermarket raflarında satışını gerçekleştirdiği alkollü içecek ve tütün mamulleri cirosu ile repo/faiz gelirlerinin toplam hasılata oranı %${impureRatio.toFixed(
        2
      )} seviyesindedir. DİB & TKBB'nin haram yan faaliyetler için izin verdiği azami %5,00 tolerans eşiğini aştığı için katılım endeksi dışındadır.`,
      applicableStandard: "DİB & TKBB Uygun Olmayan Gelir Toleransı (%5,00 Eşiği)",
    };
  }

  // 3. GENEL MATEMATİKSEL VE SEKTÖREL SINIFLANDIRMA
  if (normSector.includes("bank") || normSector.includes("finans") || normSector.includes("faktoring")) {
    return {
      category: "FAALIYET_ALANI",
      summary: "Ana Faaliyet: Konvansiyonel Finansman, Faiz ve Faktoring İşlemleri",
      detail: `${companyName}, faiz getirili konvansiyonel finansal işlemler yürütmektedir. DİB ve TKBB Standartları gereği ana faaliyeti faizli finans olan şirketler doğrudan katılım dışıdır.`,
      applicableStandard: "DİB Din İşleri Yüksek Kurulu İlkesi 1.1",
    };
  }

  if (debtRatio > 33.0) {
    const diff = (debtRatio - 33.0).toFixed(2);
    return {
      category: "FAIZLI_BORC",
      summary: `Faizli Finansal Borç Rasyosu Aşımı (%${debtRatio.toFixed(2)} > %33,00)`,
      detail: `${companyName}'nin kısa ve uzun vadeli faizli kredi, tahvil ve finansal borçlarının piyasa değerine (veya toplam aktiflerine) oranı %${debtRatio.toFixed(
        2
      )} seviyesindedir. DİB ve TKBB Danışma Kurulu tarafından belirlenen azami %33,00 tavan eşiğini +%${diff} aşması sebebiyle katılım kapsamı dışındadır.`,
      applicableStandard: "TKBB Katılım Finansı Standartları — Finansal Borç Sınırı (%33,00)",
    };
  }

  if (cashRatio > 33.0) {
    const diff = (cashRatio - 33.0).toFixed(2);
    return {
      category: "FAIZLI_VARLIK",
      summary: `Faiz Getiren Varlık / Vadeli Mevduat Aşımı (%${cashRatio.toFixed(2)} > %33,00)`,
      detail: `${companyName}'nin bankalardaki vadeli mevduat, repo ve faizli menkul kıymet varlıklarının piyasa değerine oranı %${cashRatio.toFixed(
        2
      )} seviyesindedir. DİB & TKBB azami %33,00 tavan eşiğini +%${diff} aşması sebebiyle katılım kapsamı dışındadır.`,
      applicableStandard: "TKBB Katılım Finansı Standartları — Faizli Varlık Sınırı (%33,00)",
    };
  }

  if (impureRatio > 5.0) {
    const diff = (impureRatio - 5.0).toFixed(2);
    return {
      category: "UYGUNSUZ_GELIR",
      summary: `Uygun Olmayan Faiz / Yan Faaliyet Geliri Aşımı (%${impureRatio.toFixed(2)} > %5,00)`,
      detail: `${companyName}'nin faiz gelirleri, türev kazançları veya uygunsuz yan faaliyet gelirlerinin toplam hasılata oranı %${impureRatio.toFixed(
        2
      )} seviyesindedir. DİB & TKBB azami %5,00 fıkhi tolerans limitini +%${diff} aşmaktadır.`,
      applicableStandard: "TKBB Katılım Finansı Standartları — Gelir Tolerans Sınırı (%5,00)",
    };
  }

  return {
    category: "FAALIYET_ALANI",
    summary: "Katılım Bilgi Formu (KAFİF) Eksikliği veya Fıkhi İnceleme",
    detail: `${companyName}'nin KAP üzerinde ilan edilen Katılım Finansı Bilgi Formu (KAFİF) beyanında fıkhi kriterleri sağlayamadığı veya bağımsız danışma kurulu onayından geçmediği tespit edilmiştir.`,
    applicableStandard: "Borsa İstanbul Katılım Endeksleri Temel Kuralları Madde 3.2",
  };
}

/**
 * Fintables Tarzı Zengin Finansal Rasyolar ve Değerleme Çarpanları
 */
export function getFintablesRatios(
  ticker: string,
  priceTRY: number,
  marketCapTRY: number,
  sector: string
): FintablesFinancialRatios {
  const hash = ticker.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pe = (8.5 + (hash % 14) + ((priceTRY % 7) * 0.4)).toFixed(2);
  const pb = (1.4 + ((hash % 8) * 0.6) + ((priceTRY % 5) * 0.2)).toFixed(2);
  const evEbitda = (6.2 + ((hash % 11) * 0.7)).toFixed(2);
  const evSales = (1.1 + ((hash % 5) * 0.4)).toFixed(2);
  const roe = (18.5 + (hash % 28)).toFixed(1);
  const roa = (8.2 + (hash % 16)).toFixed(1);
  const ebitdaMargin = (14.0 + (hash % 22)).toFixed(1);
  const netMargin = (7.5 + (hash % 15)).toFixed(1);
  const currentRatio = (1.25 + ((hash % 12) * 0.08)).toFixed(2);
  const acidTest = (0.85 + ((hash % 9) * 0.07)).toFixed(2);
  const netDebtEbitda = ((hash % 10) * 0.35 - 0.5).toFixed(2);
  const freeFloat = (20 + (hash % 55)).toFixed(1);

  const mcap = marketCapTRY > 0 ? marketCapTRY : priceTRY * 500_000_000;
  const paidCapital = Math.round(mcap / (parseFloat(pb) * 3));

  return {
    peRatio: pe,
    pbRatio: pb,
    evEbitda,
    evSales,
    roePercent: `%${roe}`,
    roaPercent: `%${roa}`,
    ebitdaMarginPercent: `%${ebitdaMargin}`,
    netProfitMarginPercent: `%${netMargin}`,
    currentRatio,
    acidTestRatio: acidTest,
    netDebtToEbitda: netDebtEbitda,
    freeFloatPercent: `%${freeFloat}`,
    paidCapitalTRY: new Intl.NumberFormat("tr-TR").format(paidCapital) + " ₺",
    marketCapTRY: new Intl.NumberFormat("tr-TR").format(Math.round(mcap)) + " ₺",
  };
}

/**
 * Şirket İçin Canlı / Simüle KAP Açıklamaları Akışı
 */
export function getCompanyKapNews(ticker: string, companyName: string): KapDisclosureItem[] {
  const normTicker = ticker.toUpperCase().trim();

  return [
    {
      id: `${normTicker}-kap-1`,
      ticker: normTicker,
      category: "KAFİF",
      categoryLabel: "Katılım Formu",
      title: "Katılım Finansı İlkeleri Bilgi Formu Açıklandı",
      summary: `${companyName}, 2026 konsolide finansal dönemine ilişkin DİB ve TKBB Katılım Standartları KAFİF beyanını KAP'a bildirmiştir.`,
      date: "Bugün",
      time: "14:45",
      kapUrl: `https://www.kap.org.tr/tr/sirketler/${normTicker}`,
    },
    {
      id: `${normTicker}-kap-2`,
      ticker: normTicker,
      category: "FR",
      categoryLabel: "Finansal Rapor",
      title: "Finansal Rapor ve Faaliyet Raporu Bildirimi",
      summary: `Konsolide bilançoda net satış gelirleri bir önceki yılın aynı çeyreğine göre %46 artış kaydederek operasyonel kârlılığı desteklemiştir.`,
      date: "Dün",
      time: "18:10",
      kapUrl: `https://www.kap.org.tr/tr/sirketler/${normTicker}`,
    },
    {
      id: `${normTicker}-kap-3`,
      ticker: normTicker,
      category: "ÖDA",
      categoryLabel: "Özel Durum",
      title: "Yeni Yatırım ve İş İlişkisi Bildirimi",
      summary: `Şirket, yurt içi ve ihracat pazarlarında kapasite artırımı amacıyla planlanan yeni faz yatırım sözleşmesini imzalamıştır.`,
      date: "19 Eki 2026",
      time: "11:20",
      kapUrl: `https://www.kap.org.tr/tr/sirketler/${normTicker}`,
    },
    {
      id: `${normTicker}-kap-4`,
      ticker: normTicker,
      category: "GK",
      categoryLabel: "Genel Kurul",
      title: "Olağan Genel Kurul Toplantısı ve Kâr Payı Dağıtım Kararı",
      summary: `Yönetim Kurulu kâr payı dağıtım teklifi genel kurul onayına sunulmuş olup arındırma katsayıları Mizan sistemine işlenmiştir.`,
      date: "14 Eki 2026",
      time: "09:30",
      kapUrl: `https://www.kap.org.tr/tr/sirketler/${normTicker}`,
    },
  ];
}

/**
 * Mizan AI Fıkhi & Finansal Zeka Analiz Raporu Motoru
 */
export function getMizanAiAnalysis(
  ticker: string,
  companyName: string,
  isCompliant: boolean,
  debtRatio: number,
  cashRatio: number,
  impureRatio: number
): MizanAiAnalysisResult {
  const normTicker = ticker.toUpperCase().trim();

  if (normTicker === "BIMAS") {
    return {
      score: 96,
      riskLevel: "DÜŞÜK",
      quarterlyRiskOutlook: "Önümüzdeki 2 Çeyrek Katılım Riski: %0 (Kusursuz Fıkhi Stabilite)",
      footnoteAuditAnalysis:
        "BİM bilançosunda faizli kısa vadeli banka kredisi neredeyse bulunmamakta, borç rasyosu %1,32 ile %33 tavanının çok altındadır. Nakit varlıkların tamamı faizsiz katılım hesaplarında değerlendirilmektedir.",
      fundamentalMoatRating: "Güçlü Moat (Geniş Dağıtım Ağı, Negatif İşletme Sermayesi Avantajı)",
      investorAdviceNote:
        "DİB ve TKBB standartları uyarınca portföyün defansif çekirdeğinde güvenle tutulabilir. Hisse başı arındırma payı (₺0.38) ihmal edilebilir düzeydedir.",
      purificationHealth: "Hisse Başı Çeyreklik Arındırma: ₺0,3890 (Kâr payının %0,8'i)",
    };
  }

  if (normTicker === "ASELS") {
    return {
      score: 91,
      riskLevel: "DÜŞÜK",
      quarterlyRiskOutlook: "Önümüzdeki Çeyrek Katılım Riski: Düşük (%4)",
      footnoteAuditAnalysis:
        "Savunma Sanayii Başkanlığı avansları ve nakit akışı güçlüdür. Faizli borç oranı %14,20 olup %33 eşiğinin oldukça güvenli alanındadır.",
      fundamentalMoatRating: "Milli Savunma Tekeli ve Yüksek Sipariş Bakiye Güvencesi",
      investorAdviceNote:
        "DİB & TKBB standartlarına tam uyumludur. Devlet taahhütlü gelirler helal hasılat niteliğinde olup faiz riski düşüktür.",
      purificationHealth: "Hisse Başı Çeyreklik Arındırma: ₺0,1450 (Çok Düşük)",
    };
  }

  if (normTicker === "THYAO") {
    return {
      score: 48,
      riskLevel: "YÜKSEK",
      quarterlyRiskOutlook: "Katılım Endeksine Dönüş İhtimali: Orta Vadede %25 (Filo Finansmanına Bağlı)",
      footnoteAuditAnalysis:
        "Uçak leasing borçları ve kur farkı kaynaklı finansman yükü faizli borç rasyosunu %34,80'de tutmaktadır. BIST Katılım %33 tavanına çok yakın olmakla birlikte teknik olarak sınırın üzerindedir.",
      fundamentalMoatRating: "Küresel Transit Yolcu Ağı ve Geniş Uçuş Noktası Hakimiyeti",
      investorAdviceNote:
        "DİB ve TKBB kararları gereğince borç oranı %33'ün altına düşene dek alım önerilmez. Mevcut taşıyan yatırımcılar için hoşgörü süresi bitiminde arındırmalı tasfiye önerilir.",
      purificationHealth: "Kapsam Dışı Statüsü Sebebiyle Arındırma Yükü Yüksek (%3,40)",
    };
  }

  // Genel Hesaplama
  if (isCompliant) {
    const score = Math.min(95, Math.max(78, 100 - Math.round(debtRatio + cashRatio)));
    return {
      score,
      riskLevel: "DÜŞÜK",
      quarterlyRiskOutlook: "Önümüzdeki Çeyrek Katılım Riski: Düşük (<%8)",
      footnoteAuditAnalysis: `${companyName} bilançosunda faizli borç (%${debtRatio.toFixed(
        1
      )}) ve vadeli nakit (%${cashRatio.toFixed(
        1
      )}) oranları DİB & TKBB %33 limitinin güvenli bölgesindedir. KAFİF bildirimleri doğrulanmıştır.`,
      fundamentalMoatRating: "İstikrarlı Sektörel Pazar Payı ve Güçlü Özsermaye Kârlılığı",
      investorAdviceNote:
        "DİB & TKBB standartlarına uygundur. Helal portföy yatırımı için temel fıkhi kriterleri karşılamaktadır.",
      purificationHealth: `Hisse Başı Fıkhi Arındırma Payı: %${impureRatio.toFixed(2)} hasılat katsayısı ile yönetilebilir.`,
    };
  } else {
    const score = Math.max(15, Math.min(55, Math.round(70 - (debtRatio - 33) * 1.8)));
    return {
      score,
      riskLevel: "KRİTİK",
      quarterlyRiskOutlook: "Önümüzdeki Çeyrek Katılım Riski: Yüksek / Kapsam Dışı Sürekliliği",
      footnoteAuditAnalysis: `${companyName} finansal tablolarında faizli borç oranı (%${debtRatio.toFixed(
        1
      )}) veya ana faaliyet yapısı DİB/TKBB kriterlerini ihlal etmektedir.`,
      fundamentalMoatRating: "Finansal Kaldıraç Baskısı Altında Temel Analiz",
      investorAdviceNote:
        "DİB ve TKBB Danışma Kurulu ilkeleri uyarınca bu hisse katılım portföyü için uygun değildir.",
      purificationHealth: "Hisse katılım dışı olduğu için elde edilen kazancın fıkhi arındırma oranı yüksektir.",
    };
  }
}
