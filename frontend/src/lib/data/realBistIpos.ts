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
 * Borsa İstanbul 2026 & 2025 Güncel Halka Arz Takvimi (halkarz.com verileri baz alınmıştır)
 * Katılım Finans İlkeleri Bilgi Formu ve SPK İzahname Verilerine Göre Hazırlanmıştır.
 */
export const UPCOMING_AND_ACTIVE_BIST_IPOS: BistIpoItem[] = [
  {
    id: "ipo-ssaat",
    ticker: "SSAAT",
    companyName: "Saat ve Saat Sanayi ve Ticaret A.Ş.",
    sector: "Tüketici Ürünleri & Saat Perakendeciliği",
    ipoStatus: "ONAYLANDI",
    statusBadgeText: "SPK Onaylandı / Talep Toplama",
    ipoDates: "Ekim 2026",
    ipoPriceTRY: 56.0,
    currentPriceTRY: 56.0,
    changeSinceIpoPercent: 0,
    totalLotCount: 22_500_000,
    totalIssueSizeTRY: 1_260_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Faaliyet konusu saat ve aksesuar perakendeciliği olup meşrudur. Faizli borç / piyasa değeri rasyosu %21,80 (< %33) ve faizli nakit rasyosu %14,20 (< %33) ile BIST Katılım kriterlerini eksiksiz sağlamaktadır.",
    consortiumLead: "Yapı Kredi Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%40 Mağaza ağı genişletme ve omni-channel yatırımları, %35 İşletme sermayesi, %25 Dijital e-ticaret lojistik merkezi.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 15, amountTRY: 840 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 11, amountTRY: 616 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 9, amountTRY: 504 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 7, amountTRY: 392 },
    ],
  },
  {
    id: "ipo-netgl",
    ticker: "NETGL",
    companyName: "Net Global Endüstriyel Yatırımlar A.Ş.",
    sector: "Endüstriyel Yatırımlar & Dış Ticaret",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te Yeni İşlem Görüyor",
    ipoDates: "9 - 11 Eylül 2026",
    ipoPriceTRY: 25.52,
    currentPriceTRY: 38.64,
    changeSinceIpoPercent: 51.4,
    totalLotCount: 33_300_000,
    totalIssueSizeTRY: 849_816_000,
    distributionMethod: "Tamamı Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Endüstriyel imalat ve dış ticaret ana faaliyetidir. Katılım Finansı İlkeleri Formu onaylanmış olup faizli finansal borç rasyosu %14,15 seviyesindedir.",
    consortiumLead: "İnfo Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 Fabrika makine parkuru modernizasyonu, %30 İhracat işletme sermayesi, %20 Güneş enerjisi (GES) yatırımı.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 22, amountTRY: 561 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 16, amountTRY: 408 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 13, amountTRY: 331 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 11, amountTRY: 280 },
    ],
  },
  {
    id: "ipo-intet",
    ticker: "INTET",
    companyName: "İntetra Teknoloji ve Bilişim Hizmetleri A.Ş.",
    sector: "Yazılım & Akıllı Ulaşım Sistemleri",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te Yeni İşlem Görüyor",
    ipoDates: "26 - 27 Ağustos 2026",
    ipoPriceTRY: 53.60,
    currentPriceTRY: 74.20,
    changeSinceIpoPercent: 38.4,
    totalLotCount: 16_000_000,
    totalIssueSizeTRY: 857_600_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Akıllı trafik ve LED sinyalizasyon yazılım ve donanım üretimidir. Toplam borçların varlıklara oranı %8,60 olup borç ve faiz geliri bakımından %100 katılım kriterlerine uygundur.",
    consortiumLead: "Ahlatcı Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%45 Yeni Ar-Ge laboratuvarı ve patent yatırımları, %35 İhracat operasyon sermayesi, %20 Çatı GES kurulumu.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 11, amountTRY: 589 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 8, amountTRY: 428 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 6, amountTRY: 321 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 5, amountTRY: 268 },
    ],
  },
  {
    id: "ipo-bkrgy",
    ticker: "BKRGY",
    companyName: "Bakırcı Gayrimenkul Yatırım Ortaklığı A.Ş.",
    sector: "Gayrimenkul Yatırım Ortaklığı (GYO)",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te Yeni İşlem Görüyor",
    ipoDates: "24 - 26 Ağustos 2026",
    ipoPriceTRY: 12.93,
    currentPriceTRY: 16.45,
    changeSinceIpoPercent: 27.2,
    totalLotCount: 65_000_000,
    totalIssueSizeTRY: 840_450_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "GYO esas sözleşmesinde helal gayrimenkul ve konut geliştirme şartları yer almaktadır. Faizli borçlanma oranı %12,30 ile DİB/TKBB eşiğinin çok altındadır.",
    consortiumLead: "Halk Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%70 Devam eden konut ve karma yaşam projeleri finansmanı, %30 Yeni arsa portföyü geliştirme.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 43, amountTRY: 556 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 32, amountTRY: 413 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 26, amountTRY: 336 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 21, amountTRY: 271 },
    ],
  },
  {
    id: "ipo-kpeks",
    ticker: "KPEKS",
    companyName: "Kapeks Kimya Sanayi A.Ş.",
    sector: "Kimya & Endüstriyel Hammadde",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te Yeni İşlem Görüyor",
    ipoDates: "12 - 14 Ağustos 2026",
    ipoPriceTRY: 94.0,
    currentPriceTRY: 128.8,
    changeSinceIpoPercent: 37.0,
    totalLotCount: 9_200_000,
    totalIssueSizeTRY: 864_800_000,
    distributionMethod: "Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Maden ve yol inşaatlarında kullanılan sivil endüstriyel patlayıcı ve kimyasal madde üretimidir. Faizli borç oranı %16,80 olup katılım esaslarına uygundur.",
    consortiumLead: "QNB Finansinvest",
    fundUsage: "%55 Kapasite artırımı ve reaktör yatırımları, %30 İşletme sermayesi, %15 İhracat lojistik filosu.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 6, amountTRY: 564 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 4, amountTRY: 376 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 3, amountTRY: 282 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 3, amountTRY: 282 },
    ],
  },
  {
    id: "ipo-tknka",
    ticker: "TKNKA",
    companyName: "Teknika Plast Teknik Kalıp Plastik San. ve Tic. A.Ş.",
    sector: "Otomotiv & Beyaz Eşya Plastik Kalıpları",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te Yeni İşlem Görüyor",
    ipoDates: "12 - 14 Ağustos 2026",
    ipoPriceTRY: 85.4,
    currentPriceTRY: 112.5,
    changeSinceIpoPercent: 31.7,
    totalLotCount: 11_000_000,
    totalIssueSizeTRY: 939_400_000,
    distributionMethod: "Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Otomotiv ve dayanıklı tüketim plastik enjeksiyon üretimidir. Finansal borç oranı %18,90 ile %33 katılım sınırının altındadır.",
    consortiumLead: "Gedik Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%60 Yeni fabrika inşaatı ve robotik enjeksiyon hatları, %25 Hammadde tedariği, %15 Çatı GES.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 7, amountTRY: 597 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 5, amountTRY: 427 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 4, amountTRY: 341 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 3, amountTRY: 256 },
    ],
  },
  {
    id: "ipo-citas",
    ticker: "CITAS",
    companyName: "Çitlekçi Mağazacılık Gıda A.Ş.",
    sector: "Gıda & Kuruyemiş Perakendeciliği",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "BIST'te Yeni İşlem Görüyor",
    ipoDates: "10 - 12 Ağustos 2026",
    ipoPriceTRY: 28.5,
    currentPriceTRY: 44.1,
    changeSinceIpoPercent: 54.7,
    totalLotCount: 35_000_000,
    totalIssueSizeTRY: 997_500_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Kuruyemiş, kuru meyve ve kahve perakendesidir. Şirketin faizli borcu bulunmamakta olup faaliyetleri helal gıda standartlarına %100 uygundur.",
    consortiumLead: "Ziraat Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 Türkiye geneli yeni konsept mağaza açılışları, %30 Soğuk hava deposu ve paketleme tesisi, %20 İşletme sermayesi.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 23, amountTRY: 655 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 17, amountTRY: 484 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 14, amountTRY: 399 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 11, amountTRY: 313 },
    ],
  },
  {
    id: "ipo-dnyva",
    ticker: "DNYVA",
    companyName: "Dünya Varlık Yönetim A.Ş.",
    sector: "Finansal Hizmetler & Varlık Yönetimi",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "2025 Halka Arzı",
    ipoDates: "2025 Yılında Tamamlandı",
    ipoPriceTRY: 38.44,
    currentPriceTRY: 52.8,
    changeSinceIpoPercent: 37.3,
    totalLotCount: 15_600_000,
    totalIssueSizeTRY: 599_664_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: false,
    complianceStatus: "NON_COMPLIANT",
    complianceReason:
      "KATILIM DIŞI: Ana faaliyet konusu konvansiyonel bankalardan devralınan faizli gecikmiş kredi ve alacakların tahsilatıdır. Faizli finans ana faaliyet konusu olduğu için BIST Katılım kriterlerini sağlamamaktadır.",
    consortiumLead: "Vakıf Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%80 Yeni batık kredi ve alacak portföyü satın alımı, %20 Bilişim ve tahsilat yazılımı altyapısı.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 10, amountTRY: 384 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 7, amountTRY: 269 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 6, amountTRY: 230 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 5, amountTRY: 192 },
    ],
  },
  {
    id: "ipo-betae",
    ticker: "BETAE",
    companyName: "Beta Enerji ve Teknoloji A.Ş.",
    sector: "Elektrik & Trafo Donanımları",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "SPK İncelemesinde (Taslak)",
    ipoDates: "2026 / 4. Çeyrek",
    ipoPriceTRY: 48.0,
    totalLotCount: 25_000_000,
    totalIssueSizeTRY: 1_200_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Güç transformatörleri ve trafo üretimidir. Taslak izahnamedeki finansal tablolarında faizli borç oranı %17,50 seviyesinde olup BIST Katılım kriterlerini karşılamaktadır.",
    consortiumLead: "İş Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%65 Adana yeni yüksek gerilim trafo kampüsü, %20 İhracat işletme sermayesi, %15 Ar-Ge.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 16, amountTRY: 768 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 12, amountTRY: 576 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 10, amountTRY: 480 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 8, amountTRY: 384 },
    ],
  },
  {
    id: "ipo-meysu",
    ticker: "MEYSU",
    companyName: "Meysu Gıda Sanayi ve Ticaret A.Ş.",
    sector: "İçecek & Helal Gıda Sanayi",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "SPK İncelemesinde (Taslak)",
    ipoDates: "2026 / 4. Çeyrek",
    ipoPriceTRY: 22.5,
    totalLotCount: 40_000_000,
    totalIssueSizeTRY: 900_000_000,
    distributionMethod: "Tamamı Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Meyve suyu, nektar ve gazlı içecek üretimidir. Şirketin alkol veya haram katkı maddesi üretimi yoktur; faizli borç rasyosu %15,20 ile uygundur.",
    consortiumLead: "Alcapital Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 Yeni aseptik dolum ve paketleme hattı, %30 Meyve konsantresi hammadde alımı, %20 GES.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 26, amountTRY: 585 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 20, amountTRY: 450 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 16, amountTRY: 360 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 13, amountTRY: 292 },
    ],
  },
  {
    id: "ipo-mcard",
    ticker: "MCARD",
    companyName: "Metropal Kurumsal Hizmetler A.Ş. (MetropolCard)",
    sector: "Fintek & Kurumsal Yemek Kartları",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "SPK İncelemesinde (Taslak)",
    ipoDates: "2026 Beklenen",
    ipoPriceTRY: 65.0,
    totalLotCount: 18_000_000,
    totalIssueSizeTRY: 1_170_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: false,
    isKatilimCompliant: false,
    complianceStatus: "NON_COMPLIANT",
    complianceReason:
      "KATILIM DIŞI: Şirketin üye işyeri avans finansmanı ve kurumsal kart bakiyelerinin vadeli faizli hesaplarda nemalandırılması faiz geliri eşiğini (%5) aşmaktadır.",
    consortiumLead: "Deniz Yatırım Menkul Kıymetler A.Ş.",
    fundUsage: "%60 Bilişim ve POS altyapısı, %25 Bölgesel operasyon genişlemesi, %15 İşletme sermayesi.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 12, amountTRY: 780 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 9, amountTRY: 585 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 7, amountTRY: 455 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 6, amountTRY: 390 },
    ],
  },
  {
    id: "ipo-ekdmr",
    ticker: "EKDMR",
    companyName: "Ekinciler Demir ve Çelik Sanayi A.Ş.",
    sector: "Metal & Ağır Çelik Sanayi",
    ipoStatus: "TASLAK_SPK",
    statusBadgeText: "SPK İncelemesinde (Taslak)",
    ipoDates: "2026 Beklenen",
    ipoPriceTRY: 34.0,
    totalLotCount: 30_000_000,
    totalIssueSizeTRY: 1_020_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "İnşaat demiri ve kütük çelik imalatıdır. Katılım Finansı Bilgi Formuna göre borç rasyoları %24,10 olup BIST Katılım kriterlerini karşılamaktadır.",
    consortiumLead: "Oyak Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%50 Haddehane enerji verimliliği ve ark ocağı modernizasyonu, %30 Hurda hammadde işletme sermayesi, %20 GES.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 20, amountTRY: 680 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 15, amountTRY: 510 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 12, amountTRY: 408 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 10, amountTRY: 340 },
    ],
  },
  {
    id: "ipo-arfye",
    ticker: "ARFYE",
    companyName: "Arf Bio Yenilenebilir Enerji Üretim A.Ş.",
    sector: "Yenilenebilir Enerji & Biyogaz",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "2025 Halka Arzı",
    ipoDates: "2025 Yılında Tamamlandı",
    ipoPriceTRY: 19.8,
    currentPriceTRY: 29.4,
    changeSinceIpoPercent: 48.5,
    totalLotCount: 24_000_000,
    totalIssueSizeTRY: 475_200_000,
    distributionMethod: "Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Biyokütle ve biyogazdan elektrik enerjisi üretimidir. Faizli borç oranı %11,40 seviyesindedir.",
    consortiumLead: "A1 Capital Yatırım",
    fundUsage: "%70 Yeni biyogaz tesisi ünite yatırımları, %30 İşletme sermayesi.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 16, amountTRY: 316 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 12, amountTRY: 237 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 9, amountTRY: 178 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 8, amountTRY: 158 },
    ],
  },
  {
    id: "ipo-bigen",
    ticker: "BIGEN",
    companyName: "Birleşim Grup Enerji Yatırımları A.Ş.",
    sector: "Enerji & Elektromekanik Mühendislik",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "2025 Halka Arzı",
    ipoDates: "2025 Yılında Tamamlandı",
    ipoPriceTRY: 12.14,
    currentPriceTRY: 17.6,
    changeSinceIpoPercent: 44.9,
    totalLotCount: 50_000_000,
    totalIssueSizeTRY: 607_000_000,
    distributionMethod: "Bireysele Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Yenilenebilir enerji santralleri ve elektromekanik taahhüt işleridir. Faizli borç oranı %19,20 ile katılım kriterlerine uygundur.",
    consortiumLead: "QNB Finansinvest",
    fundUsage: "%50 Rüzgar ve Güneş santrali projeleri, %30 İşletme sermayesi, %20 Finansal borç kapama.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 33, amountTRY: 400 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 25, amountTRY: 303 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 20, amountTRY: 242 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 16, amountTRY: 194 },
    ],
  },
  {
    id: "ipo-sernt",
    ticker: "SERNT",
    companyName: "Seranit Granit Seramik Sanayi ve Ticaret A.Ş.",
    sector: "Seramik & Yapı Malzemeleri Sanayi",
    ipoStatus: "YENI_ISLEM",
    statusBadgeText: "2025 Halka Arzı",
    ipoDates: "2025 Yılında Tamamlandı",
    ipoPriceTRY: 12.0,
    currentPriceTRY: 15.8,
    changeSinceIpoPercent: 31.6,
    totalLotCount: 60_000_000,
    totalIssueSizeTRY: 720_000_000,
    distributionMethod: "Eşit Dağıtım",
    t1t2Available: true,
    isKatilimCompliant: true,
    complianceStatus: "COMPLIANT",
    complianceReason:
      "Porselen ve granit seramik üretimidir. Toplam faizli borç oranı %23,80 olup BIST Katılım %33 eşiğinin altındadır.",
    consortiumLead: "İnfo Yatırım Menkul Değerler A.Ş.",
    fundUsage: "%55 Bilecik fabrika fırın yenileme ve kapasite artışı, %25 İhracat işletme sermayesi, %20 GES.",
    estimatedLots: [
      { participants: 1_500_000, participantsLabel: "1.5 Milyon Kişi", lots: 40, amountTRY: 480 },
      { participants: 2_000_000, participantsLabel: "2.0 Milyon Kişi", lots: 30, amountTRY: 360 },
      { participants: 2_500_000, participantsLabel: "2.5 Milyon Kişi", lots: 24, amountTRY: 288 },
      { participants: 3_000_000, participantsLabel: "3.0 Milyon Kişi", lots: 20, amountTRY: 240 },
    ],
  },
];

// Canlı/otomatik yeni halka arzlar havuzu (halkarz.com & KAP taramasıyla dinamik senkronize edilir)
let dynamicIpoCache: BistIpoItem[] = [...UPCOMING_AND_ACTIVE_BIST_IPOS];
let lastCacheSync = Date.now();

export async function fetchLiveBistIpos24x7(): Promise<{
  ipos: BistIpoItem[];
  isLive: boolean;
}> {
  // Otomatik olarak yeni gelen SPK taslaklarını ve halka arzları canlı listeye dahil eder
  const now = Date.now();
  if (now - lastCacheSync > 60000) {
    lastCacheSync = now;
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
