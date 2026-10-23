import { NextResponse } from "next/server";
import { BIST_COMPREHENSIVE_UNIVERSE } from "@/lib/data/bistUniverse";
import { DisclosureItem, DisclosureCategory, DisclosuresApiResponse } from "@/types/disclosure";

// In-memory server-side cache for high performance & rate-limit protection
let cachedResult: DisclosuresApiResponse | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 20_000; // 20 seconds TTL

// Build ticker quick lookup set and map
const tickerMap = new Map<string, { name: string; isCompliant: boolean }>();
for (const c of BIST_COMPREHENSIVE_UNIVERSE) {
  tickerMap.set(c.ticker.toUpperCase(), {
    name: c.name,
    isCompliant: c.bistStatus === "COMPLIANT" || c.bistStatus === "GRACE_PERIOD_TOLERANCE",
  });
}

function cleanHtml(raw: string): string {
  if (!raw) return "";
  const decoded = raw
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#199;/g, "Ç")
    .replace(/&#231;/g, "ç")
    .replace(/&#214;/g, "Ö")
    .replace(/&#246;/g, "ö")
    .replace(/&#220;/g, "Ü")
    .replace(/&#252;/g, "ü")
    .replace(/&#304;/g, "İ")
    .replace(/&#305;/g, "ı")
    .replace(/&#350;/g, "Ş")
    .replace(/&#351;/g, "ş")
    .replace(/&#286;/g, "Ğ")
    .replace(/&#287;/g, "ğ");

  return decoded
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Bugün";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Az önce";
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) {
      const timePart = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      return diffHours === 1 ? `1 sa önce (${timePart})` : `${diffHours} sa önce (${timePart})`;
    }
    if (diffDays === 1) {
      return `Dün, ${d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Bugün";
  }
}

function detectTicker(rawTitle: string, cleanSummary: string): string | undefined {
  const text = `${rawTitle} ${cleanSummary}`;

  // First check *** TICKER *** pattern (standard KAP news format)
  const starMatch = text.match(/\*{2,3}\s*([A-Z0-9]{3,5})\s*\*{2,3}/);
  if (starMatch && tickerMap.has(starMatch[1])) {
    return starMatch[1];
  }

  // Check direct comma separated list like OSMEN,SRVGY
  const commaMatch = text.match(/\b([A-Z]{3,5}),([A-Z]{3,5})\b/);
  if (commaMatch && tickerMap.has(commaMatch[1])) {
    return commaMatch[1];
  }

  // Check known universe tickers (words of 3-5 uppercase letters)
  const words = text.match(/\b[A-Z]{3,5}\b/g) || [];
  const noise = new Set(["KAP", "SPK", "BIST", "BORSA", "AŞ", "AS", "BISTECH", "YENI", "SAFAK", "GZT", "TURK", "PARA"]);
  for (const word of words) {
    if (!noise.has(word) && tickerMap.has(word)) {
      return word;
    }
  }

  return undefined;
}

function detectCategory(title: string, summary: string, source: "KAP" | "SPK"): {
  category: DisclosureCategory;
  categoryColor: "amber" | "emerald" | "blue" | "rose" | "purple" | "indigo" | "slate";
} {
  const lower = `${title} ${summary}`.toLowerCase();

  if (lower.includes("devre kesici") || lower.includes("bistech")) {
    return { category: "Devre Kesici", categoryColor: "amber" };
  }
  if (lower.includes("temettü") || lower.includes("kar payı") || lower.includes("kâr payı") || lower.includes("hak kullanımı")) {
    return { category: "Hak Kullanımı / Temettü", categoryColor: "emerald" };
  }
  if (lower.includes("bülten") || lower.includes("bulten")) {
    return { category: "SPK Bülteni", categoryColor: "purple" };
  }
  if (
    lower.includes("yasak") ||
    lower.includes("suç duyurusu") ||
    lower.includes("yaptırım") ||
    lower.includes("tedbir") ||
    lower.includes("ceza")
  ) {
    return { category: "İdari Yaptırım & Tedbir", categoryColor: "rose" };
  }
  if (lower.includes("halka arz") || lower.includes("izahname") || lower.includes("taslak")) {
    return { category: "Halka Arz & İzahname", categoryColor: "indigo" };
  }
  if (lower.includes("bilanço") || lower.includes("finansal rapor") || lower.includes("mali tablo")) {
    return { category: "Finansal Rapor & Bilanço", categoryColor: "blue" };
  }
  if (lower.includes("özel durum") || lower.includes("işlem iptali") || lower.includes("açıklama") || source === "KAP") {
    return { category: "Özel Durum Açıklaması", categoryColor: "blue" };
  }

  return { category: "Genel Açıklama", categoryColor: "slate" };
}

async function fetchGoogleNewsFeed(query: string): Promise<Array<{ title: string; link: string; pubDate: string; description: string }>> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=tr&gl=TR&ceid=TR:tr`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      next: { revalidate: 20 },
    });
    if (!res.ok) return [];
    const text = await res.text();
    const items: Array<{ title: string; link: string; pubDate: string; description: string }> = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const block = match[1];
      const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
      const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
      const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
      const desc = (block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || "";
      items.push({ title, link, pubDate, description: desc });
    }
    return items;
  } catch (err) {
    console.error("fetchGoogleNewsFeed error:", err);
    return [];
  }
}

async function fetchSpkOfficialBulletins(): Promise<Array<{ title: string; link: string; pubDate: string }>> {
  try {
    const res = await fetch("https://spk.gov.tr/spk-bultenleri/2026-yili-spk-bultenleri", {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const regex = /<a[^>]+href="([^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi;
    const bultenler: Array<{ title: string; link: string; pubDate: string }> = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const link = match[1];
      const cleanText = cleanHtml(match[2]);
      if (cleanText.toLowerCase().includes("bülten") || cleanText.toLowerCase().includes("bulten")) {
        bultenler.push({
          title: cleanText,
          link,
          pubDate: new Date().toUTCString(),
        });
      }
    }
    return bultenler;
  } catch (err) {
    console.error("fetchSpkOfficialBulletins error:", err);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filterSource = searchParams.get("source"); // "kap" | "spk" | "all"
  const now = Date.now();

  // Return cached result if fresh
  if (cachedResult && now - lastFetchTime < CACHE_TTL_MS) {
    if (filterSource === "kap") {
      return NextResponse.json({
        ...cachedResult,
        items: cachedResult.items.filter((i) => i.source === "KAP"),
      });
    }
    if (filterSource === "spk") {
      return NextResponse.json({
        ...cachedResult,
        items: cachedResult.items.filter((i) => i.source === "SPK"),
      });
    }
    return NextResponse.json(cachedResult);
  }

  try {
    // Parallel fetching of all live sources with Promise.allSettled
    const [kapNewsRes, spkNewsRes, spkOfficialRes] = await Promise.allSettled([
      fetchGoogleNewsFeed('"KAP" OR "Kamuyu Aydınlatma Platformu" Borsa when:2d'),
      fetchGoogleNewsFeed('"SPK" OR "Sermaye Piyasası Kurulu" Borsa when:7d'),
      fetchSpkOfficialBulletins(),
    ]);

    const kapNewsItems = kapNewsRes.status === "fulfilled" ? kapNewsRes.value : [];
    const spkNewsItems = spkNewsRes.status === "fulfilled" ? spkNewsRes.value : [];
    const spkOfficialItems = spkOfficialRes.status === "fulfilled" ? spkOfficialRes.value : [];

    const items: DisclosureItem[] = [];
    const seenTitles = new Set<string>();

    // 1. Process SPK Official Bulletins first (high authority)
    for (const b of spkOfficialItems.slice(0, 5)) {
      const normalizedTitle = b.title.replace(/\s+/g, " ").trim();
      if (seenTitles.has(normalizedTitle)) continue;
      seenTitles.add(normalizedTitle);

      const id = "spk-bulletin-" + Math.abs(hashCode(normalizedTitle));
      items.push({
        id,
        source: "SPK",
        title: normalizedTitle,
        rawTitle: normalizedTitle,
        summary: `Sermaye Piyasası Kurulu (SPK) resmi haftalık bülteni. Halka arz onayları, sermaye artırımları, idari para cezaları ve kurul ilke kararlarını içerir.`,
        category: "SPK Bülteni",
        categoryColor: "purple",
        publisher: "SPK Resmi Yayın",
        pubDate: b.pubDate,
        isoDate: new Date().toISOString(),
        timeAgo: "Güncel Bülten",
        url: b.link,
        isCompliant: null,
        islamicFinanceNote: "SPK bülten kararlarında yer alan sermaye artırımları ve bedelsiz/bedelli onayları fıkhi açıdan caiz sermaye dönüşümleridir.",
      });
    }

    // 2. Process KAP News Items
    for (const item of kapNewsItems) {
      const rawTitle = cleanHtml(item.title);
      let cleanTitle = rawTitle;
      let publisher = "KAP";

      if (rawTitle.includes(" - ")) {
        const parts = rawTitle.rsplit(" - ");
        cleanTitle = parts[0].trim();
        publisher = parts[1].trim();
      }

      // Skip duplicate or low-value titles
      const key = cleanTitle.toLowerCase().slice(0, 40);
      if (seenTitles.has(key)) continue;
      seenTitles.add(key);

      const cleanSummary = cleanHtml(item.description);
      const ticker = detectTicker(rawTitle, cleanSummary);
      const companyInfo = ticker ? tickerMap.get(ticker) : undefined;
      const { category, categoryColor } = detectCategory(cleanTitle, cleanSummary, "KAP");

      let islamicFinanceNote = "BIST şirket bildirimi.";
      if (companyInfo) {
        if (companyInfo.isCompliant) {
          islamicFinanceNote = `✅ ${ticker} hissesi BIST Katılım Endeksi (XKTUM) kapsamındadır. DİB & TKBB fıkhi kriterlerine uygundur.`;
        } else {
          islamicFinanceNote = `⚠️ ${ticker} hissesi Katılım Endeksi dışındadır. Finansal borç/faiz oranı veya ana faaliyet alanı uygun görülmemiştir.`;
        }
      }

      const id = "kap-" + Math.abs(hashCode(cleanTitle));
      items.push({
        id,
        source: "KAP",
        title: cleanTitle,
        rawTitle,
        summary: cleanSummary || `${cleanTitle} açıklaması Kamuyu Aydınlatma Platformu'nda yayımlandı.`,
        category,
        categoryColor,
        publisher,
        ticker,
        companyName: companyInfo?.name,
        pubDate: item.pubDate,
        isoDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        timeAgo: formatRelativeTime(item.pubDate),
        url: item.link,
        isCompliant: companyInfo ? companyInfo.isCompliant : null,
        islamicFinanceNote,
      });
    }

    // 3. Process SPK News Items
    for (const item of spkNewsItems) {
      const rawTitle = cleanHtml(item.title);
      let cleanTitle = rawTitle;
      let publisher = "SPK";

      if (rawTitle.includes(" - ")) {
        const parts = rawTitle.rsplit(" - ");
        cleanTitle = parts[0].trim();
        publisher = parts[1].trim();
      }

      const key = cleanTitle.toLowerCase().slice(0, 40);
      if (seenTitles.has(key)) continue;
      seenTitles.add(key);

      const cleanSummary = cleanHtml(item.description);
      const ticker = detectTicker(rawTitle, cleanSummary);
      const companyInfo = ticker ? tickerMap.get(ticker) : undefined;
      const { category, categoryColor } = detectCategory(cleanTitle, cleanSummary, "SPK");

      const id = "spk-" + Math.abs(hashCode(cleanTitle));
      items.push({
        id,
        source: "SPK",
        title: cleanTitle,
        rawTitle,
        summary: cleanSummary || `${cleanTitle} duyurusu Sermaye Piyasası Kurulu tarafından paylaşıldı.`,
        category,
        categoryColor,
        publisher,
        ticker,
        companyName: companyInfo?.name,
        pubDate: item.pubDate,
        isoDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        timeAgo: formatRelativeTime(item.pubDate),
        url: item.link,
        isCompliant: companyInfo ? companyInfo.isCompliant : null,
        islamicFinanceNote: "Sermaye Piyasası Kurulu'nun piyasa intizamı ve yatırımcı koruma kararıdır.",
      });
    }

    // Sort items by pubDate descending
    items.sort((a, b) => {
      const timeA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
      const timeB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
      return timeB - timeA;
    });

    const kapCount = items.filter((i) => i.source === "KAP").length;
    const spkCount = items.filter((i) => i.source === "SPK").length;

    const responsePayload: DisclosuresApiResponse = {
      success: true,
      updatedAt: new Date().toISOString(),
      counts: {
        total: items.length,
        kap: kapCount,
        spk: spkCount,
      },
      items,
    };

    // Update server cache
    cachedResult = responsePayload;
    lastFetchTime = now;

    if (filterSource === "kap") {
      return NextResponse.json({
        ...responsePayload,
        items: responsePayload.items.filter((i) => i.source === "KAP"),
      });
    }
    if (filterSource === "spk") {
      return NextResponse.json({
        ...responsePayload,
        items: responsePayload.items.filter((i) => i.source === "SPK"),
      });
    }

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    console.error("Disclosures API error:", err);
    // Return fallback cache if available
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }
    return NextResponse.json(
      {
        success: false,
        updatedAt: new Date().toISOString(),
        counts: { total: 0, kap: 0, spk: 0 },
        items: [],
      },
      { status: 500 }
    );
  }
}

// String helper: split from right
declare global {
  interface String {
    rsplit(separator: string, maxsplit?: number): string[];
  }
}
if (!String.prototype.rsplit) {
  String.prototype.rsplit = function (separator: string, maxsplit = 1): string[] {
    const str = this.toString();
    const parts = str.split(separator);
    if (parts.length <= 1) return parts;
    const left = parts.slice(0, parts.length - maxsplit).join(separator);
    const right = parts.slice(parts.length - maxsplit);
    return [left, ...right];
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
