export interface TefasFundHoldingItem {
  ticker: string;
  name: string;
  weightPercent: number;
  isKatilimCompliant: boolean;
  purificationRatio: string;
  sector: string;
}

export interface TefasFundAssetAllocation {
  label: string;
  percent: number;
  color: string;
}

export interface TefasKatilimFund {
  code: string;
  name: string;
  managementCompany: string;
  category: "Hisse Senedi" | "Kira Sertifikası (Sukuk)" | "Para Piyasası" | "Kıymetli Madenler" | "Değişken Katılım";
  navPriceTRY: number;
  dailyReturnPercent: number;
  monthlyReturnPercent: number;
  yearlyReturnPercent: number;
  totalFundValueTRY: number;
  investorCount: number;
  shariahCompliancePercent: number;
  purificationRatioPercent: number;
  danismaKuruluApproval: string;
  icazetBelgesiSummary: string;
  assetAllocation: TefasFundAssetAllocation[];
  holdingsLookThrough: TefasFundHoldingItem[];
}

export const TEFAS_KATILIM_FUNDS: TefasKatilimFund[] = [
  {
    code: "KHA",
    name: "KT Portföy Katılım Hisse Senedi (TL) Fonu",
    managementCompany: "Kuveyt Türk Portföy Yönetimi A.Ş.",
    category: "Hisse Senedi",
    navPriceTRY: 14.825,
    dailyReturnPercent: 1.45,
    monthlyReturnPercent: 6.80,
    yearlyReturnPercent: 78.40,
    totalFundValueTRY: 4850000000,
    investorCount: 38240,
    shariahCompliancePercent: 100.0,
    purificationRatioPercent: 0.28,
    danismaKuruluApproval: "TKBB & Kuveyt Türk Danışma Komitesi Tam İcazetli",
    icazetBelgesiSummary:
      "Fon portföyünün asgari %80'i BIST Katılım Endeksi'nde yer alan, fıkhi açıdan caiz hisselere yatırılır. Bilanço dipnotlarındaki arındırma gerektiren mahzurlu gelirler çeyreklik olarak hesaplanıp yatırımcılara bildirilir.",
    assetAllocation: [
      { label: "BIST Katılım Hisseleri", percent: 89.4, color: "#10B981" },
      { label: "Kira Sertifikaları (Sukuk)", percent: 7.2, color: "#3B82F6" },
      { label: "Katılma Hesabı (TL)", percent: 3.4, color: "#F59E0B" },
    ],
    holdingsLookThrough: [
      { ticker: "BIMAS", name: "BİM Birleşik Mağazalar", weightPercent: 9.8, isKatilimCompliant: true, purificationRatio: "%0.23", sector: "Perakende" },
      { ticker: "TUPRS", name: "Tüpraş Türkiye Petrol Rafineleri", weightPercent: 8.5, isKatilimCompliant: true, purificationRatio: "%1.15", sector: "Enerji" },
      { ticker: "ASELS", name: "Aselsan Elektronik Sanayi", weightPercent: 8.1, isKatilimCompliant: true, purificationRatio: "%0.85", sector: "Savunma" },
      { ticker: "FROTO", name: "Ford Otomotiv Sanayi", weightPercent: 6.7, isKatilimCompliant: true, purificationRatio: "%1.20", sector: "Otomotiv" },
      { ticker: "MAVI", name: "Mavi Giyim Sanayi", weightPercent: 5.9, isKatilimCompliant: true, purificationRatio: "%0.65", sector: "Perakende" },
      { ticker: "TTRAK", name: "Türk Traktör ve Ziraat", weightPercent: 5.4, isKatilimCompliant: true, purificationRatio: "%0.90", sector: "Otomotiv" },
      { ticker: "MIATK", name: "Mia Teknoloji A.Ş.", weightPercent: 4.8, isKatilimCompliant: true, purificationRatio: "%0.15", sector: "Teknoloji" },
      { ticker: "ALBRK", name: "Albaraka Türk Katılım Bankası", weightPercent: 4.2, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Katılım Bankası" },
      { ticker: "BERA", name: "Bera Holding A.Ş.", weightPercent: 3.9, isKatilimCompliant: true, purificationRatio: "%0.45", sector: "Holding" },
      { ticker: "RYSAS", name: "Reysaş Lojistik Taşımacılık", weightPercent: 3.6, isKatilimCompliant: true, purificationRatio: "%0.40", sector: "Lojistik" },
    ],
  },
  {
    code: "ZPF",
    name: "Ziraat Portföy Katılım Fonu",
    managementCompany: "Ziraat Portföy Yönetimi A.Ş.",
    category: "Değişken Katılım",
    navPriceTRY: 5.421,
    dailyReturnPercent: 0.62,
    monthlyReturnPercent: 4.25,
    yearlyReturnPercent: 56.10,
    totalFundValueTRY: 6200000000,
    investorCount: 54100,
    shariahCompliancePercent: 100.0,
    purificationRatioPercent: 0.15,
    danismaKuruluApproval: "Ziraat Katılım Danışma Komitesi Onaylı",
    icazetBelgesiSummary:
      "Faizsiz finans ilkeleri doğrultusunda kamu ve özel sektör kira sertifikaları (sukuk), altın ve BIST Katılım Endeksi hisselerinden oluşan çoklu varlık sepeti.",
    assetAllocation: [
      { label: "Kira Sertifikaları (Sukuk)", percent: 52.0, color: "#3B82F6" },
      { label: "BIST Katılım Hisseleri", percent: 34.5, color: "#10B981" },
      { label: "Kıymetli Madenler (Altın)", percent: 8.5, color: "#EAB308" },
      { label: "Katılma Hesabı", percent: 5.0, color: "#F59E0B" },
    ],
    holdingsLookThrough: [
      { ticker: "TRSKKB001", name: "Hazine Müsteşarlığı Varlık Kiralama Sukuk", weightPercent: 28.0, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Kamu Sukuk" },
      { ticker: "BIMAS", name: "BİM Birleşik Mağazalar", weightPercent: 6.2, isKatilimCompliant: true, purificationRatio: "%0.23", sector: "Perakende" },
      { ticker: "ASELS", name: "Aselsan Elektronik", weightPercent: 5.8, isKatilimCompliant: true, purificationRatio: "%0.85", sector: "Savunma" },
      { ticker: "TUPRS", name: "Tüpraş Petrol", weightPercent: 5.1, isKatilimCompliant: true, purificationRatio: "%1.15", sector: "Enerji" },
      { ticker: "KUVEYT-SUKUK", name: "KT Kira Sertifikası A.Ş.", weightPercent: 12.4, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Özel Sektör Sukuk" },
      { ticker: "GLD-FIZIKI", name: "Borsa İstanbul Altın Piyasası Külçe", weightPercent: 8.5, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Kıymetli Maden" },
    ],
  },
  {
    code: "RBH",
    name: "Albaraka Portföy Katılım Hisse Senedi Fonu",
    managementCompany: "Albaraka Portföy Yönetimi A.Ş.",
    category: "Hisse Senedi",
    navPriceTRY: 8.940,
    dailyReturnPercent: 1.20,
    monthlyReturnPercent: 5.90,
    yearlyReturnPercent: 71.30,
    totalFundValueTRY: 2150000000,
    investorCount: 19800,
    shariahCompliancePercent: 100.0,
    purificationRatioPercent: 0.31,
    danismaKuruluApproval: "Albaraka Türk Danışma Komitesi İcazetli",
    icazetBelgesiSummary:
      "Albaraka Türk fıkhi standartlarına göre BIST Katılım 100 endeksi hisseleri ve faizsiz borsa araçlarından oluşan dinamik hisse stratejisi.",
    assetAllocation: [
      { label: "BIST Katılım Hisseleri", percent: 91.2, color: "#10B981" },
      { label: "Katılma Hesabı & Sukuk", percent: 8.8, color: "#3B82F6" },
    ],
    holdingsLookThrough: [
      { ticker: "BIMAS", name: "BİM Birleşik Mağazalar", weightPercent: 9.2, isKatilimCompliant: true, purificationRatio: "%0.23", sector: "Perakende" },
      { ticker: "ASELS", name: "Aselsan", weightPercent: 8.4, isKatilimCompliant: true, purificationRatio: "%0.85", sector: "Savunma" },
      { ticker: "MAVI", name: "Mavi Giyim", weightPercent: 6.8, isKatilimCompliant: true, purificationRatio: "%0.65", sector: "Perakende" },
      { ticker: "FROTO", name: "Ford Otosan", weightPercent: 6.2, isKatilimCompliant: true, purificationRatio: "%1.20", sector: "Otomotiv" },
      { ticker: "TTRAK", name: "Türk Traktör", weightPercent: 5.7, isKatilimCompliant: true, purificationRatio: "%0.90", sector: "Otomotiv" },
      { ticker: "MIATK", name: "Mia Teknoloji", weightPercent: 5.1, isKatilimCompliant: true, purificationRatio: "%0.15", sector: "Yazılım" },
      { ticker: "ALARK", name: "Alarko Holding", weightPercent: 4.5, isKatilimCompliant: true, purificationRatio: "%0.75", sector: "Holding" },
    ],
  },
  {
    code: "KLU",
    name: "KT Portföy Para Piyasası Katılım Fonu",
    managementCompany: "Kuveyt Türk Portföy Yönetimi A.Ş.",
    category: "Para Piyasası",
    navPriceTRY: 1.845,
    dailyReturnPercent: 0.12,
    monthlyReturnPercent: 3.85,
    yearlyReturnPercent: 48.90,
    totalFundValueTRY: 12400000000,
    investorCount: 92400,
    shariahCompliancePercent: 100.0,
    purificationRatioPercent: 0.00,
    danismaKuruluApproval: "TKBB Merkezi Danışma Kurulu Tam Onaylı",
    icazetBelgesiSummary:
      "Vadesine azami 184 gün kalmış kamu ve özel sektör kira sertifikaları ile gecelik katılım bankası kâr-zarar ortaklığı havuzlarından oluşan sıfır faizli likidite fonu.",
    assetAllocation: [
      { label: "Kısa Vadeli Kamu Sukuk", percent: 45.0, color: "#3B82F6" },
      { label: "Kısa Vadeli Banka Sukuk", percent: 35.0, color: "#6366F1" },
      { label: "Gecelik Katılma Hesabı", percent: 20.0, color: "#F59E0B" },
    ],
    holdingsLookThrough: [
      { ticker: "TRSKKB-KV", name: "T.C. Hazine Kısa Vadeli Sukuk", weightPercent: 45.0, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Kamu Kira Sertifikası" },
      { ticker: "VAKIF-KAT-SUK", name: "Vakıf Katılım Varlık Kiralama", weightPercent: 20.0, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Finans Kira Sertifikası" },
      { ticker: "ZIRAAT-KAT-SUK", name: "Ziraat Katılım Varlık Kiralama", weightPercent: 15.0, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Finans Kira Sertifikası" },
      { ticker: "KUVEYT-HAVUZ", name: "Kuveyt Türk Gecelik Katılma Havuzu", weightPercent: 20.0, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Katılma Hesabı" },
    ],
  },
  {
    code: "KZL",
    name: "KT Portföy Kıymetli Madenler Katılım Fonu",
    managementCompany: "Kuveyt Türk Portföy Yönetimi A.Ş.",
    category: "Kıymetli Madenler",
    navPriceTRY: 4.120,
    dailyReturnPercent: 0.85,
    monthlyReturnPercent: 7.40,
    yearlyReturnPercent: 84.20,
    totalFundValueTRY: 5100000000,
    investorCount: 41200,
    shariahCompliancePercent: 100.0,
    purificationRatioPercent: 0.00,
    danismaKuruluApproval: "Kuveyt Türk Danışma Komitesi Fiziki Teslim Şartlı İcazet",
    icazetBelgesiSummary:
      "Borsa İstanbul Kıymetli Madenler Piyasası'nda fiziki olarak saklanan %99.5 saflıkta altın, gümüş ve altına dayalı kira sertifikalarına yatırım yapar.",
    assetAllocation: [
      { label: "Fiziki Külçe Altın (BIST)", percent: 84.0, color: "#EAB308" },
      { label: "Altına Dayalı Sukuk", percent: 12.0, color: "#F59E0B" },
      { label: "Altın Katılma Hesabı", percent: 4.0, color: "#10B981" },
    ],
    holdingsLookThrough: [
      { ticker: "BIST-ALTIN-995", name: "Borsa İstanbul Fiziki Külçe Altın (995/1000)", weightPercent: 84.0, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Fiziki Emtia" },
      { ticker: "HAZINE-ALTIN-SUK", name: "T.C. Hazine Altına Dayalı Kira Sertifikası", weightPercent: 12.0, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Devlet Sukuk" },
      { ticker: "KT-ALTIN-HAVUZ", name: "Kuveyt Türk Altın Katılma Hesabı", weightPercent: 4.0, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Katılma Hesabı" },
    ],
  },
  {
    code: "TLZ",
    name: "Tacirler Portföy Katılım Değişken Fon",
    managementCompany: "Tacirler Portföy Yönetimi A.Ş.",
    category: "Değişken Katılım",
    navPriceTRY: 3.650,
    dailyReturnPercent: 0.95,
    monthlyReturnPercent: 5.10,
    yearlyReturnPercent: 64.80,
    totalFundValueTRY: 1450000000,
    investorCount: 14200,
    shariahCompliancePercent: 100.0,
    purificationRatioPercent: 0.22,
    danismaKuruluApproval: "Danışma Kurulu Fıkhi Denetim Raporu Mevcut",
    icazetBelgesiSummary:
      "Piyasa konjonktürüne göre katılım hisse senetleri ile kira sertifikaları arasında ağırlık değiştiren, risk yönetimi odaklı dinamik katılım stratejisi.",
    assetAllocation: [
      { label: "BIST Katılım Hisseleri", percent: 64.0, color: "#10B981" },
      { label: "Kira Sertifikaları", percent: 28.0, color: "#3B82F6" },
      { label: "Katılma Hesabı", percent: 8.0, color: "#F59E0B" },
    ],
    holdingsLookThrough: [
      { ticker: "BIMAS", name: "BİM Birleşik Mağazalar", weightPercent: 8.5, isKatilimCompliant: true, purificationRatio: "%0.23", sector: "Perakende" },
      { ticker: "TUPRS", name: "Tüpraş Petrol", weightPercent: 7.2, isKatilimCompliant: true, purificationRatio: "%1.15", sector: "Enerji" },
      { ticker: "ASELS", name: "Aselsan", weightPercent: 6.9, isKatilimCompliant: true, purificationRatio: "%0.85", sector: "Savunma" },
      { ticker: "TRSKKB-DEGISKEN", name: "Kamu Kira Sertifikaları Sepeti", weightPercent: 28.0, isKatilimCompliant: true, purificationRatio: "%0.00", sector: "Sukuk" },
      { ticker: "FROTO", name: "Ford Otosan", weightPercent: 5.4, isKatilimCompliant: true, purificationRatio: "%1.20", sector: "Otomotiv" },
    ],
  },
];
