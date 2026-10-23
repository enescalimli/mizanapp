import { BIST_COMPREHENSIVE_UNIVERSE } from "./bistUniverse";
import { SAMPLE_COMPANIES_SUMMARY } from "./sampleCompanies";

// Sektörel Katılım Uyumlu Muadil Eşleştirmeleri (Akıllı İkame Motoru)
export const SECTOR_COMPLIANT_ALTERNATIVES: Record<
  string,
  { ticker: string; name: string; sector: string; priceTRY?: string; debtRatio?: string; reason: string }[]
> = {
  THYAO: [
    { ticker: "RYSAS", name: "Reysaş Taşımacılık & Lojistik", sector: "Taşımacılık / Lojistik", priceTRY: "48.20", debtRatio: "%18.4", reason: "Faizli borç oranı %18.4 (Düşük) & BIST Katılım Tam Onaylı" },
    { ticker: "GRSEL", name: "Gürsel Taşımacılık", sector: "Ulaşım & Servis", priceTRY: "168.50", debtRatio: "%12.1", reason: "Borç rasyosu %12.1 ile güvenli, DİB/TKBB tam uyumlu" },
    { ticker: "TUREX", name: "Tureks Turizm Taşımacılık", sector: "Ulaştırma / Servis", priceTRY: "54.80", debtRatio: "%9.2", reason: "Sıfıra yakın faiz yükü (%9.2) ve güçlü net nakit akışı" },
  ],
  PGSUS: [
    { ticker: "RYSAS", name: "Reysaş Taşımacılık & Lojistik", sector: "Taşımacılık", priceTRY: "48.20", debtRatio: "%18.4", reason: "Katılım onaylı lojistik ve taşımacılık lideri" },
    { ticker: "GRSEL", name: "Gürsel Taşımacılık", sector: "Ulaşım & Servis", priceTRY: "168.50", debtRatio: "%12.1", reason: "BIST Katılım Endeksi onaylı ulaştırma alternatifi" },
    { ticker: "TUREX", name: "Tureks Turizm Taşımacılık", sector: "Ulaştırma", priceTRY: "54.80", debtRatio: "%9.2", reason: "Borç yükü düşük katılım ulaştırma şirketi" },
  ],
  KCHOL: [
    { ticker: "SISE", name: "Türkiye Şişecam Fabrikaları", sector: "Sanayi & Cam", priceTRY: "51.40", debtRatio: "%24.1", reason: "Borç oranı %24 ile katılım sınırları içinde küresel sanayi devi" },
    { ticker: "TKFEN", name: "Tekfen Holding", sector: "Holding & Müteahhitlik", priceTRY: "74.80", debtRatio: "%14.8", reason: "Faizli borç oranı %14.8, BIST Katılım onaylı holding" },
    { ticker: "PETKM", name: "Petkim Petrokimya", sector: "Kimya & Sanayi", priceTRY: "22.60", debtRatio: "%26.5", reason: "BIST Katılım Endeksi sanayi bileşeni" },
  ],
  SAHOL: [
    { ticker: "TKFEN", name: "Tekfen Holding", sector: "Holding", priceTRY: "74.80", debtRatio: "%14.8", reason: "BIST Katılım tam onaylı köklü holding" },
    { ticker: "BERA", name: "Bera Holding", sector: "Holding", priceTRY: "18.30", debtRatio: "%8.4", reason: "Katılım prensiplerine tam uyumlu holding yatırımı" },
    { ticker: "ALARK", name: "Alarko Holding", sector: "Holding", priceTRY: "98.20", debtRatio: "%16.2", reason: "BIST Katılım Endeksi holding alternatifi" },
  ],
  EREGL: [
    { ticker: "KRDMD", name: "Kardemir Karabük D.Ç.", sector: "Demir & Çelik", priceTRY: "28.40", debtRatio: "%21.0", reason: "Katılım uyumlu demir-çelik üreticisi" },
    { ticker: "CEMTS", name: "Çemtaş Çelik Makina", sector: "Çelik Sanayi", priceTRY: "12.80", debtRatio: "%11.5", reason: "Düşük borçluluk ve katılım uyumlu bilanço" },
  ],
  GARAN: [
    { ticker: "ALBRK", name: "Albaraka Türk Katılım Bankası", sector: "Katılım Bankacılığı", priceTRY: "7.15", debtRatio: "%0.0", reason: "Faizsiz katılım bankacılığı esasına tam uygun" },
    { ticker: "KLKIM", name: "Kalekim Kimyevi Maddeler", sector: "Sanayi / Katılım", priceTRY: "32.40", debtRatio: "%4.2", reason: "Güçlü nakit ve sıfır faiz modeli" },
  ],
  AKBNK: [
    { ticker: "ALBRK", name: "Albaraka Türk Katılım Bankası", sector: "Katılım Bankacılığı", priceTRY: "7.15", debtRatio: "%0.0", reason: "Faizsiz katılım bankacılığı esasına tam uygun" },
  ],
  ISCTR: [
    { ticker: "ALBRK", name: "Albaraka Türk Katılım Bankası", sector: "Katılım Bankacılığı", priceTRY: "7.15", debtRatio: "%0.0", reason: "Faizsiz katılım bankacılığı esasına tam uygun" },
  ],
  YKBNK: [
    { ticker: "ALBRK", name: "Albaraka Türk Katılım Bankası", sector: "Katılım Bankacılığı", priceTRY: "7.15", debtRatio: "%0.0", reason: "Faizsiz katılım bankacılığı esasına tam uygun" },
  ],
};

export function getCompliantAlternativesForTicker(ticker: string, sector?: string) {
  const upper = ticker.toUpperCase();
  if (SECTOR_COMPLIANT_ALTERNATIVES[upper]) {
    return SECTOR_COMPLIANT_ALTERNATIVES[upper];
  }
  // Dinamik arama: Aynı sektörden katılım uyumlular
  const universe = BIST_COMPREHENSIVE_UNIVERSE.length > 0 ? BIST_COMPREHENSIVE_UNIVERSE : SAMPLE_COMPANIES_SUMMARY;
  const filtered = universe.filter(
    (c) => c.ticker !== upper && c.bistStatus === "COMPLIANT" && (sector ? c.sector === sector : true)
  ).slice(0, 3);

  if (filtered.length > 0) {
    return filtered.map((c) => ({
      ticker: c.ticker,
      name: c.name,
      sector: c.sector || "BIST",
      priceTRY: c.priceTRY?.replace("₺", "").trim() || "50.00",
      debtRatio: `%${(c.debtRatioPercent || 15).toFixed(1)}`,
      reason: "BIST Katılım Endeksi tam onaylı sektör muadili",
    }));
  }

  // Backup katılım yıldızları
  return [
    { ticker: "BIMAS", name: "BİM Birleşik Mağazalar", sector: "Perakende", priceTRY: "482.50", debtRatio: "%11.8", reason: "Düşük faizli borç ve güçlü nakit akışı" },
    { ticker: "ASELS", name: "Aselsan Elektronik", sector: "Savunma", priceTRY: "68.40", debtRatio: "%19.2", reason: "BIST Katılım Endeksi amiral gemisi" },
    { ticker: "TABGD", name: "TAB Gıda", sector: "Gıda & Hizmet", priceTRY: "164.00", debtRatio: "%8.6", reason: "Yüksek fıkhi güvenlik tamponu" },
  ];
}
