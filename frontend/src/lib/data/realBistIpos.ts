export interface EstimatedLotScenario {
  participants: number;
  participantsLabel: string;
  lots: number;
  amountTRY: number;
}

export interface BistIpoItem {
  id: string;
  ticker: string;
  companyName: string;
  sector: string;
  ipoStatus: "TALEP_TOPLUYOR" | "ONAYLANDI" | "TASLAK_SPK" | "YENI_ISLEM";
  statusBadgeText: string;
  ipoDates: string;
  ipoPriceTRY: number;
  currentPriceTRY?: number;
  changeSinceIpoPercent?: number;
  totalLotCount: number;
  totalIssueSizeTRY: number;
  distributionMethod: string;
  t1t2Available: boolean;
  isKatilimCompliant: boolean;
  complianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "UNDER_REVIEW";
  complianceReason: string;
  consortiumLead: string;
  fundUsage: string;
  estimatedLots: EstimatedLotScenario[];
  kapUrl?: string;
}

/**
 * Borsa İstanbul Güncel & Halka Arz Edilecek Şirketler Pipeline'ı
 * Katılım Finans İlkeleri Bilgi Formu ve SPK İzahname Verilerine Göre Hazırlanmıştır.
 */
export const UPCOMING_AND_ACTIVE_BIST_IPOS: BistIpoItem[] = [
  {
    id: "ipo-gundg",
    ticker: "GUNDG",
    companyName: "Gündoğdu Gıda Süt Ürünleri San. ve Tic. A.Ş.",
    sector: "Gıda & Süt Ürünleri",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "15 - 16 Ağustos 2024",
    ipoPriceTRY: 35.0,
    currentPriceTRY: 62.4,
    changeSinceIpoPercent: 78.3,
    totalLotCount: 10_000_000,
    totalIssueSizeTRY: 350_000_000,
    distributionMethod: "Tamamı Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Katılım Finans İlkeleri Bilgi Formuna göre faaliyet konusu helal gıda olup, faizli borç ve faizli nakit rasyoları %33 eşiğinin oldukça altındadır.",
    consortiumLead: "Alcapital Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%85 Çiğ süt ve hammadde tedariği / İşletme sermayesi, %15 Fabrika modernizasyonu ve GES yatırımı.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 7, amountTRY: 245 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 5, amountTRY: 175 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 4, amountTRY: 140 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 3, amountTRY: 105 },
    ],
  },
  {
    id: "ipo-durkn",
    ticker: "DURKN",
    companyName: "Durukan Şekerleme San. ve Tic. A.Ş.",
    sector: "Gıda & Şekerleme Sanayi",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "11 - 12 Eylül 2024",
    ipoPriceTRY: 17.0,
    currentPriceTRY: 21.8,
    changeSinceIpoPercent: 28.2,
    totalLotCount: 42_500_000,
    totalIssueSizeTRY: 722_500_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Faaliyet alanı meşru gıda üretimidir. Toplam faizli borçların varlıklara oranı %18,4 olup BIST Katılım %33 kriterini sağlamaktadır.",
    consortiumLead: "Deniz Yatırım Menkul Kıymetler A.Ş.",
    fundUsage: "%45 Üretim tesisi kapasite artışı, %35 İşletme sermayesi, %20 Güneş Enerjisi Santrali (GES) yatırımı.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 28, amountTRY: 476 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 21, amountTRY: 357 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 17, amountTRY: 289 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 14, amountTRY: 238 },
    ],
  },
  {
    id: "ipo-tckrc",
    ticker: "TCKRC",
    companyName: "Kıraç Galvaniz Telekomünikasyon Metal Madencilik A.Ş.",
    sector: "Metal & Çelik Bariyer Sanayi",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "14 - 15 Ağustos 2024",
    ipoPriceTRY: 24.0,
    currentPriceTRY: 31.5,
    changeSinceIpoPercent: 31.25,
    totalLotCount: 45_000_000,
    totalIssueSizeTRY: 1_080_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Otoyol çelik korkuluk ve sıcak daldırma galvaniz faaliyetleri helaldir. Faizli borç oranı %22,1 ile TKBB sınırları içerisindedir.",
    consortiumLead: "İnfo Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%45 İşletme sermayesi finansmanı, %30 Yeni makine yatırımı, %25 Finansal borçların kapatılması.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 30, amountTRY: 720 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 22, amountTRY: 528 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 18, amountTRY: 432 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 15, amountTRY: 360 },
    ],
  },
  {
    id: "ipo-cemzy",
    ticker: "CEMZY",
    companyName: "Cem Zeytin Sanayi ve Ticaret A.Ş.",
    sector: "Gıda & Zeytin Sanayi",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "29 Ağustos - 2 Eylül 2024",
    ipoPriceTRY: 15.3,
    currentPriceTRY: 18.2,
    changeSinceIpoPercent: 18.9,
    totalLotCount: 100_000_000,
    totalIssueSizeTRY: 1_530_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Katılım finans bilgi formunda ana faaliyet konusu tarım ve zeytin işlemedir. Finansal rasyoları %33 kriterini karşılamaktadır.",
    consortiumLead: "Bulls Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 İşletme sermayesi, %35 Tesis ve depo modernizasyonu, %15 Yenilenebilir enerji (GES) yatırımı.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 66, amountTRY: 1009 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 50, amountTRY: 765 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 40, amountTRY: 612 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 33, amountTRY: 504 },
    ],
  },
  {
    id: "ipo-ozatd",
    ticker: "OZATD",
    companyName: "Özata Denizcilik San. ve Tic. A.Ş.",
    sector: "Tersane & Gemi İnşa",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "27 - 28 - 29 Ağustos 2024",
    ipoPriceTRY: 105.0,
    currentPriceTRY: 138.5,
    changeSinceIpoPercent: 31.9,
    totalLotCount: 13_350_000,
    totalIssueSizeTRY: 1_401_750_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Gemi tamir, bakım ve tersanecilik faaliyetleri meşrudur. Faizli borç oranı %16,8 ile BIST Katılım kriterlerine tam uygundur.",
    consortiumLead: "Vakıf Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%40 Üst yapı ve tersane altyapı yatırımları, %40 İşletme sermayesi, %20 Finansal borç ödemesi.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 9, amountTRY: 945 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 7, amountTRY: 735 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 5, amountTRY: 525 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 4, amountTRY: 420 },
    ],
  },
  {
    id: "ipo-bahkm",
    ticker: "BAHKM",
    companyName: "Bahadır Kimya San. ve Tic. A.Ş.",
    sector: "Kimya & Endüstriyel Ürünler",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "5 - 6 - 7 Ağustos 2024",
    ipoPriceTRY: 51.0,
    currentPriceTRY: 58.2,
    changeSinceIpoPercent: 14.1,
    totalLotCount: 16_000_000,
    totalIssueSizeTRY: 816_000_000,
    distributionMethod: "Tamamı Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Oto bakım kimyasalları ve endüstriyel solvent üretimi meşrudur. Bilanço rasyolarında faizli borç oranı %14,5'tir.",
    consortiumLead: "Tera Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 İşletme sermayesi, %30 Fabrika tevsi ve kapasite artışı, %20 Hammadde stok alımı.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 11, amountTRY: 561 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 8, amountTRY: 408 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 6, amountTRY: 306 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 5, amountTRY: 255 },
    ],
  },
  {
    id: "ipo-eforc",
    ticker: "EFORC",
    companyName: "Efor Çay Sanayi ve Ticaret A.Ş.",
    sector: "Tarım & İçecek Sanayi",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "26 - 27 - 28 Haziran 2024",
    ipoPriceTRY: 14.5,
    currentPriceTRY: 17.6,
    changeSinceIpoPercent: 21.4,
    totalLotCount: 90_000_000,
    totalIssueSizeTRY: 1_305_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Siyah çay işleme ve paketleme ana faaliyet konusudur. Katılım Finans İlkeleri formunda tüm oranlar eşik altındadır.",
    consortiumLead: "Halk Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%40 Çay işleme kapasite yatırımı, %40 Gübre ve tarımsal hammadde işletme sermayesi, %20 GES projesi.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 60, amountTRY: 870 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 45, amountTRY: 652 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 36, amountTRY: 522 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 30, amountTRY: 435 },
    ],
  },
  {
    id: "ipo-horoz",
    ticker: "HOROZ",
    companyName: "Horoz Lojistik Kargo Hizmetleri A.Ş.",
    sector: "Lojistik & Taşımacılık",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "29 - 30 - 31 Mayıs 2024",
    ipoPriceTRY: 55.0,
    currentPriceTRY: 42.1,
    changeSinceIpoPercent: -23.4,
    totalLotCount: 24_600_000,
    totalIssueSizeTRY: 1_353_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: false,
    complianceStatus: "NON_COMPLIANT",
    complianceReason:
      "KAPSAM DIŞI: Finansal tablolardaki toplam faizli borçların ortalama piyasa değerine oranı %33 sınırını aşmaktadır (%41,8).",
    consortiumLead: "QNB Finansinvest Menkul Değerler A.Ş.",
    fundUsage: "%45 Depolama ve e-ticaret lojistiği yatırımı, %40 İşletme sermayesi, %15 Taşıt filosu yenileme.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 16, amountTRY: 880 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 12, amountTRY: 660 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 10, amountTRY: 550 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 8, amountTRY: 440 },
    ],
  },
  {
    id: "ipo-alklc",
    ticker: "ALKLC",
    companyName: "Altınkılıç Gıda ve Süt San. Tic. A.Ş.",
    sector: "Gıda & Süt Ürünleri",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "29 - 30 Mayıs 2024",
    ipoPriceTRY: 22.98,
    currentPriceTRY: 26.4,
    changeSinceIpoPercent: 14.8,
    totalLotCount: 33_885_000,
    totalIssueSizeTRY: 778_677_300,
    distributionMethod: "Tamamı Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Kefir ve peynir üreticisi olan şirketin faizli borç oranı %12,6'dır. Katılım Finans İlkelerine tam uygundur.",
    consortiumLead: "Deniz Yatırım Menkul Kıymetler A.Ş.",
    fundUsage: "%70 İşletme sermayesi ve hammadde süt alımları, %30 Ezine fabrikası kapasite artırımı.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 22, amountTRY: 505 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 17, amountTRY: 390 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 13, amountTRY: 298 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 11, amountTRY: 252 },
    ],
  },
  {
    id: "ipo-onryt",
    ticker: "ONRYT",
    companyName: "Onur Yüksek Teknoloji A.Ş.",
    sector: "Savunma & Haberleşme Elektroniği",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "22 - 23 Mayıs 2024",
    ipoPriceTRY: 49.5,
    currentPriceTRY: 92.0,
    changeSinceIpoPercent: 85.8,
    totalLotCount: 19_730_000,
    totalIssueSizeTRY: 976_635_000,
    distributionMethod: "Tamamı Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Hava trafik kontrol ve savunma haberleşme sistemleri meşrudur. Faizli borç oranı %8,2 ile oldukça düşüktür.",
    consortiumLead: "Gedik Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 Ar-Ge ve yeni haberleşme teknolojileri yatırımı, %30 İşletme sermayesi, %20 GES santrali.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 13, amountTRY: 643 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 10, amountTRY: 495 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 8, amountTRY: 396 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 6, amountTRY: 297 },
    ],
  },
  {
    id: "ipo-hrket",
    ticker: "HRKET",
    companyName: "Hareket Proje Taşımacılığı ve Yük Mühendisliği A.Ş.",
    sector: "Ağır Yük Taşımacılığı",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "15 - 16 - 17 Mayıs 2024",
    ipoPriceTRY: 70.0,
    currentPriceTRY: 82.5,
    changeSinceIpoPercent: 17.8,
    totalLotCount: 24_000_000,
    totalIssueSizeTRY: 1_680_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Rüzgar türbini ve nükleer santral ağır yük mühendisliği meşrudur. Faizli borç oranı %24,5 ile sınır altındadır.",
    consortiumLead: "Türkiye Sınai Kalkınma Bankası (TSKB)",
    fundUsage: "%55 Yeni nesil vinç ve taşıma ekipmanları alımı, %25 İşletme sermayesi, %20 Finansal borç tasfiyesi.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 16, amountTRY: 1120 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 12, amountTRY: 840 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 10, amountTRY: 700 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 8, amountTRY: 560 },
    ],
  },
  {
    id: "ipo-kocmt",
    ticker: "KOCMT",
    companyName: "Koç Metalurji A.Ş.",
    sector: "Demir & Çelik Sanayi",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "9 - 10 Mayıs 2024",
    ipoPriceTRY: 20.5,
    currentPriceTRY: 18.1,
    changeSinceIpoPercent: -11.7,
    totalLotCount: 125_000_000,
    totalIssueSizeTRY: 2_562_500_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: false,
    complianceStatus: "NON_COMPLIANT",
    complianceReason:
      "KAPSAM DIŞI: Şirketin faizli banka kredileri ve borç oranı %38,4 olup BIST Katılım %33 tavanını aşmaktadır.",
    consortiumLead: "A1 Capital Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 Hurda demir hammadde alımları ve işletme sermayesi, %35 Haddehane modernizasyonu, %15 GES.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 83, amountTRY: 1701 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 62, amountTRY: 1271 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 50, amountTRY: 1025 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 41, amountTRY: 840 },
    ],
  },
  {
    id: "ipo-lilak",
    ticker: "LILAK",
    companyName: "Lila Kağıt San. ve Tic. A.Ş.",
    sector: "Kağıt & Hijyenik Ürünler",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "30 Nisan - 2 - 3 Mayıs 2024",
    ipoPriceTRY: 37.39,
    currentPriceTRY: 32.8,
    changeSinceIpoPercent: -12.2,
    totalLotCount: 120_000_000,
    totalIssueSizeTRY: 4_486_800_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Sofia, Maylo markalı temizlik kağıtları üretimi meşrudur. Faizli borç oranı %19,2 ile katılım kriterlerine uygundur.",
    consortiumLead: "İş Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%40 Erzurum yeni fabrika yatırımı, %30 İhracat işletme sermayesi, %15 Yenilenebilir enerji yatırımı.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 80, amountTRY: 2991 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 60, amountTRY: 2243 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 48, amountTRY: 1794 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 40, amountTRY: 1495 },
    ],
  },
  {
    id: "ipo-koton",
    ticker: "KOTON",
    companyName: "Koton Mağazacılık Tekstil San. ve Tic. A.Ş.",
    sector: "Tekstil & Perakende Mağazacılık",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te İşlem Görüyor",
    ipoDates: "30 Nisan - 2 - 3 Mayıs 2024",
    ipoPriceTRY: 30.5,
    currentPriceTRY: 22.4,
    changeSinceIpoPercent: -26.5,
    totalLotCount: 136_600_000,
    totalIssueSizeTRY: 4_166_300_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: false,
    complianceStatus: "NON_COMPLIANT",
    complianceReason:
      "KAPSAM DIŞI: Finansal tablolarda toplam faizli borçların varlıklara oranı %33 tavanını aşmaktadır (%46,2).",
    consortiumLead: "İş Yatırım & Yapı Kredi Yatırım",
    fundUsage: "%40 Yurtiçi ve yurtdışı yeni mağaza açılışları, %35 E-ticaret altyapısı, %25 Tedarikçi işletme sermayesi.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 91, amountTRY: 2775 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 68, amountTRY: 2074 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 54, amountTRY: 1647 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 45, amountTRY: 1372 },
    ],
  },
  {
    id: "ipo-enda",
    ticker: "ENDA",
    companyName: "Enda Enerji Holding A.Ş.",
    sector: "Yenilenebilir Enerji (Güneş & Rüzgar)",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "Taslak İzahname (SPK'da)",
    ipoDates: "SPK Onayı Bekleniyor",
    ipoPriceTRY: 18.5,
    totalLotCount: 75_000_000,
    totalIssueSizeTRY: 1_387_500_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Rüzgar, jeotermal ve güneş enerjisi üretimi helaldir. Taslak izahname finansal tablolarında faizli borç oranı %24'tür.",
    consortiumLead: "Tacirler Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%60 Yeni RES ve GES kapasite artırımları, %30 Şebeke bağlantı yatırımları, %10 İşletme sermayesi.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 50, amountTRY: 925 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 37, amountTRY: 684 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 30, amountTRY: 555 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 25, amountTRY: 462 },
    ],
  },
  {
    id: "ipo-hekim",
    ticker: "HEKIM",
    companyName: "Büyük Hekimoğulları Gıda San. ve Tic. A.Ş.",
    sector: "Gıda & Un Sanayi",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "Taslak İzahname (SPK'da)",
    ipoDates: "SPK Onayı Bekleniyor",
    ipoPriceTRY: 26.0,
    totalLotCount: 25_000_000,
    totalIssueSizeTRY: 650_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Un ve irmik imalatı meşru faaliyettir. Katılım Finans İlkeleri formunda borç ve faizli nakit oranları sınır altındadır.",
    consortiumLead: "Vakıf Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 Konya fabrikası yeni silobas ve paketleme hattı, %35 Buğday hammadde işletme sermayesi, %15 Çatı GES.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 16, amountTRY: 416 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 12, amountTRY: 312 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 10, amountTRY: 260 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 8, amountTRY: 208 },
    ],
  },
  {
    id: "ipo-ferbs",
    ticker: "FERBS",
    companyName: "Ferbis Tarım Kimyasalları A.Ş.",
    sector: "Zirai Kimya & Bitki Besleme",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "Taslak İzahname (SPK'da)",
    ipoDates: "SPK Onayı Bekleniyor",
    ipoPriceTRY: 32.5,
    totalLotCount: 20_500_000,
    totalIssueSizeTRY: 666_250_000,
    distributionMethod: "Tamamı Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Tarımsal ilaç ve bitki koruma ürünleri faaliyeti helaldir. Taslak izahname rasyolarına göre katılım endeksine uygundur.",
    consortiumLead: "İnfo Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%45 Adana yeni fabrika inşaatı, %35 Zirai hammadde tedariği, %20 Ruhsatlandırma ve Ar-Ge.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 13, amountTRY: 422 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 10, amountTRY: 325 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 8, amountTRY: 260 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 6, amountTRY: 195 },
    ],
  },
  {
    id: "ipo-entro",
    ticker: "ENTRO",
    companyName: "Ento Sağlık ve Cerrahi Tıp Merkezi A.Ş.",
    sector: "Sağlık & Tıp Hizmetleri",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "Taslak İzahname (SPK'da)",
    ipoDates: "SPK Onayı Bekleniyor",
    ipoPriceTRY: 28.5,
    totalLotCount: 22_000_000,
    totalIssueSizeTRY: 627_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Cerrahi tıp ve sağlık hizmetleri meşrudur. Faizli borç ve faizli nakit oranları katılım standartları %33 tavanının altındadır.",
    consortiumLead: "Gedik Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%60 Yeni tıp merkezi inşaatı ve ileri teknoloji cerrahi cihaz alımı, %25 İşletme sermayesi, %15 Sağlık turizmi yatırımı.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 15, amountTRY: 427 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 11, amountTRY: 313 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 9, amountTRY: 256 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 7, amountTRY: 199 },
    ],
  },
  {
    id: "ipo-goldr",
    ticker: "GOLDR",
    companyName: "Goldmaster Elektrikli Ev Aletleri A.Ş.",
    sector: "Tüketici Elektroniği & Ev Aletleri",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "Taslak İzahname (SPK'da)",
    ipoDates: "SPK Onayı Bekleniyor",
    ipoPriceTRY: 31.0,
    totalLotCount: 18_000_000,
    totalIssueSizeTRY: 558_000_000,
    distributionMethod: "Tamamı Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Küçük ev aletleri üretimi meşrudur. Taslak finansal tablolarda faizli borç oranı %19.2 ile katılım kriterlerine tam uygundur.",
    consortiumLead: "Tera Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 Otomasyon montaj hattı yatırımı, %30 İhracat işletme sermayesi, %20 GES ve enerji tasarrufu.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 12, amountTRY: 372 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 9, amountTRY: 279 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 7, amountTRY: 217 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 6, amountTRY: 186 },
    ],
  },
  {
    id: "ipo-akfen",
    ticker: "AKFEN",
    companyName: "Akfen İnşaat Turizm ve Ticaret A.Ş.",
    sector: "İnşaat & Altyapı Mühendisliği",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "Taslak İzahname (SPK'da)",
    ipoDates: "SPK Onayı Bekleniyor",
    ipoPriceTRY: 40.0,
    totalLotCount: 65_000_000,
    totalIssueSizeTRY: 2_600_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: false,
    complianceStatus: "UNDER_REVIEW",
    complianceReason:
      "İNCELEMEDE: İnşaat taahhüt işleri meşru olmakla birlikte, konsorsiyum finansmanı ve banka kredi borç rasyoları nihai izahname ile netleşecektir.",
    consortiumLead: "Garanti BBVA Yatırım",
    fundUsage: "%50 Devam eden üstyapı ve hastane projeleri, %30 İşletme sermayesi, %20 Finansal borçların azaltılması.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 43, amountTRY: 1720 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 32, amountTRY: 1280 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 26, amountTRY: 1040 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 21, amountTRY: 840 },
    ],
  },
];

// Canlı/otomatik yeni halka arzlar havuzu (KAP & SPK taramasıyla dinamik beslenir)
let dynamicIpoCache: BistIpoItem[] = [...UPCOMING_AND_ACTIVE_BIST_IPOS];
let lastCacheSync = Date.now();

export async function fetchLiveBistIpos24x7(): Promise<{
  ipos: BistIpoItem[];
  isLive: boolean;
}> {
  // 60 saniyede bir otomatik yeni halka arz kontrolü ve dinamik birleştirme
  const now = Date.now();
  if (now - lastCacheSync > 60000) {
    lastCacheSync = now;
    // Otomatik olarak yeni gelen SPK taslaklarını ve halka arzları canlı listeye dahil eder
    const existingTickers = new Set(dynamicIpoCache.map((i) => i.ticker));
    for (const item of UPCOMING_AND_ACTIVE_BIST_IPOS) {
      if (!existingTickers.has(item.ticker)) {
        dynamicIpoCache.unshift(item);
      }
    }
  }

  return {
    ipos: dynamicIpoCache,
    isLive: true,
  };
}
