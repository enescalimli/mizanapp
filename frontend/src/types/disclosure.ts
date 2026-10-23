export type DisclosureSource = "KAP" | "SPK";

export type DisclosureCategory =
  | "Devre Kesici"
  | "Hak Kullanımı / Temettü"
  | "Özel Durum Açıklaması"
  | "SPK Bülteni"
  | "İdari Yaptırım & Tedbir"
  | "Halka Arz & İzahname"
  | "Finansal Rapor & Bilanço"
  | "Genel Açıklama";

export interface DisclosureItem {
  id: string;
  source: DisclosureSource;
  title: string;
  rawTitle?: string;
  summary: string;
  category: DisclosureCategory;
  categoryColor: "amber" | "emerald" | "blue" | "rose" | "purple" | "indigo" | "slate";
  publisher: string;
  ticker?: string;
  companyName?: string;
  pubDate: string;
  isoDate?: string;
  timeAgo: string;
  url: string;
  isCompliant: boolean | null;
  islamicFinanceNote?: string;
  isNew?: boolean;
}

export interface DisclosuresApiResponse {
  success: boolean;
  updatedAt: string;
  counts: {
    total: number;
    kap: number;
    spk: number;
  };
  items: DisclosureItem[];
}
