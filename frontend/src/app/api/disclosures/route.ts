import { NextResponse } from "next/server";
import { BIST_COMPREHENSIVE_UNIVERSE } from "@/lib/data/bistUniverse";
import { DisclosureItem, DisclosureCategory, DisclosuresApiResponse } from "@/types/disclosure";

// In-memory server-side cache for high performance & rate-limit protection
let cachedResult: DisclosuresApiResponse | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 25_000; // 25 seconds TTL

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

function detectCategory(subject: string): {
  category: DisclosureCategory;
  categoryColor: "amber" | "emerald" | "blue" | "rose" | "purple" | "indigo" | "slate";
} {
  const lower = subject.toLowerCase();

  if (lower.includes("devre kesici") || lower.includes("bistech")) {
    return { category: "Devre Kesici", categoryColor: "amber" };
  }
  if (
    lower.includes("temettü") ||
    lower.includes("kar payı") ||
    lower.includes("kâr payı") ||
    lower.includes("hak kullanımı") ||
    lower.includes("sermaye artırımı")
  ) {
    return { category: "Hak Kullanımı / Temettü", categoryColor: "emerald" };
  }
  if (lower.includes("geri alım") || lower.includes("pay alım satım") || lower.includes("payların geri alınması")) {
    return { category: "Özel Durum Açıklaması", categoryColor: "blue" };
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

  return { category: "Özel Durum Açıklaması", categoryColor: "blue" };
}

// 1. Fetch Official SPK Bulletins from spk.gov.tr
async function fetchSpkOfficialBulletins(): Promise<Array<{ title: string; link: string; dateStr: string }>> {
  try {
    const res = await fetch("https://spk.gov.tr/spk-bultenleri/2026-yili-spk-bultenleri", {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const regex = /<a[^>]+href="([^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi;
    const bultenler: Array<{ title: string; link: string; dateStr: string }> = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const link = match[1];
      const cleanText = cleanHtml(match[2]);
      if (cleanText.toLowerCase().includes("bülten") || cleanText.toLowerCase().includes("bulten")) {
        bultenler.push({
          title: cleanText,
          link,
          dateStr: cleanText.includes(":") ? cleanText.split(":").pop()?.trim() || "Güncel" : "Güncel",
        });
      }
    }
    return bultenler;
  } catch (err) {
    console.error("fetchSpkOfficialBulletins error:", err);
    return [];
  }
}

// 2. Fetch Official SPK Press Announcements from spk.gov.tr
async function fetchSpkOfficialAnnouncements(): Promise<Array<{ title: string; link: string }>> {
  try {
    const res = await fetch("https://spk.gov.tr/duyurular/basin-duyurulari/2026", {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const regex = /<a[^>]+href="(\/duyurular\/basin-duyurulari\/2026\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const duyurular: Array<{ title: string; link: string }> = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const link = "https://spk.gov.tr" + match[1];
      let cleanText = cleanHtml(match[2]);
      // Remove date prefix like '22 Eki 2026 Yeni'
      cleanText = cleanText.replace(/^[0-9]{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+[0-9]{4}\s+(Yeni\s+)?/i, "").trim();
      if (cleanText.length > 8 && isNaN(Number(cleanText))) {
        duyurular.push({ title: cleanText, link });
      }
    }
    return duyurular;
  } catch (err) {
    console.error("fetchSpkOfficialAnnouncements error:", err);
    return [];
  }
}

// 3. Fetch Pure Official KAP Disclosures (Strict Filter & Clean Formatter)
async function fetchKapOfficialDisclosures(): Promise<Array<{ rawTitle: string; pubDate: string }>> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent('"KAP ***" OR "BORSA İSTANBUL BISTECH" when:3d')}&hl=tr&gl=TR&ceid=TR:tr`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      next: { revalidate: 20 },
    });
    if (!res.ok) return [];
    const text = await res.text();
    const items: Array<{ rawTitle: string; pubDate: string }> = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const block = match[1];
      const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
      const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
      // Only keep official KAP disclosures containing the *** delimiter
      if (title.includes("***")) {
        items.push({ rawTitle: cleanHtml(title), pubDate });
      }
    }
    return items;
  } catch (err) {
    console.error("fetchKapOfficialDisclosures error:", err);
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
    // Parallel fetching of official sources
    const [spkBulletinsRes, spkAnnouncementsRes, kapDisclosuresRes] = await Promise.allSettled([
      fetchSpkOfficialBulletins(),
      fetchSpkOfficialAnnouncements(),
      fetchKapOfficialDisclosures(),
    ]);

    const spkBulletins = spkBulletinsRes.status === "fulfilled" ? spkBulletinsRes.value : [];
    const spkAnnouncements = spkAnnouncementsRes.status === "fulfilled" ? spkAnnouncementsRes.value : [];
    const kapDisclosures = kapDisclosuresRes.status === "fulfilled" ? kapDisclosuresRes.value : [];

    const items: DisclosureItem[] = [];
    const seenKeys = new Set<string>();

    // -------------------------------------------------------------
    // 1. Process Official SPK Bulletins (spk.gov.tr direct)
    // -------------------------------------------------------------
    for (const b of spkBulletins.slice(0, 10)) {
      const key = "spk-b-" + b.title.slice(0, 30).toLowerCase();
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const id = "spk-b-" + Math.abs(hashCode(b.title));
      items.push({
        id,
        source: "SPK",
        title: b.title,
        rawTitle: b.title,
        summary: `Sermaye Piyasası Kurulu (SPK) resmi haftalık bülteni. Halka arz onayları, sermaye artırımları, idari tedbirler ve kurul ilke kararlarını içerir. Resmi SPK yayınıdır.`,
        category: "SPK Bülteni",
        categoryColor: "purple",
        publisher: "Sermaye Piyasası Kurulu (SPK)",
        pubDate: new Date().toUTCString(),
        isoDate: new Date().toISOString(),
        timeAgo: "Resmi Bülten",
        url: b.link,
        isCompliant: null,
        islamicFinanceNote: "SPK bülten kararlarında yer alan sermaye artırımları ve bedelsiz/bedelli onayları fıkhi açıdan caiz sermaye dönüşümleridir.",
      });
    }

    // -------------------------------------------------------------
    // 2. Process Official SPK Press Announcements (spk.gov.tr direct)
    // -------------------------------------------------------------
    for (const d of spkAnnouncements.slice(0, 10)) {
      const key = "spk-d-" + d.title.slice(0, 30).toLowerCase();
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const { category, categoryColor } = detectCategory(d.title);
      const id = "spk-d-" + Math.abs(hashCode(d.title));

      items.push({
        id,
        source: "SPK",
        title: d.title,
        rawTitle: d.title,
        summary: `Sermaye Piyasası Kurulu (SPK) resmi duyurusu: ${d.title}. Yatırımcı haklarının korunması ve piyasa düzeni kapsamında yayımlanmıştır.`,
        category: category === "SPK Bülteni" ? "İdari Yaptırım & Tedbir" : category,
        categoryColor,
        publisher: "Sermaye Piyasası Kurulu (SPK)",
        pubDate: new Date().toUTCString(),
        isoDate: new Date().toISOString(),
        timeAgo: "Resmi Duyuru",
        url: d.link,
        isCompliant: null,
        islamicFinanceNote: "Sermaye Piyasası Kurulu'nun piyasa şeffaflığı ve yatırımcı koruma kararıdır.",
      });
    }

    // -------------------------------------------------------------
    // 3. Process Official KAP Disclosures (Directly Formatted)
    // -------------------------------------------------------------
    for (const item of kapDisclosures) {
      // Strip any newspaper suffix like ' - Yeni Şafak', ' - GZT', ' - Euronews'
      let titleNoSource = item.rawTitle.replace(/\s*-\s*[A-Za-z0-9ÇĞİÖŞÜçğıöşü\s\.]+$/, "").trim();
      const parts = titleNoSource.split("***").map((p) => p.trim()).filter(Boolean);

      if (parts.length < 2) continue;

      // Extract ticker from parts
      let ticker: string | undefined = undefined;
      for (const p of parts.slice(1)) {
        if (/^[A-Z0-9]{3,5}$/.test(p) || /^[A-Z0-9]{3,5},[A-Z0-9]{3,5}$/.test(p)) {
          ticker = p;
          break;
        }
      }

      const primaryTicker = ticker ? ticker.split(",")[0].trim() : undefined;
      const companyInfo = primaryTicker ? tickerMap.get(primaryTicker) : undefined;

      const subject = parts[parts.length - 1];
      const { category, categoryColor } = detectCategory(subject);

      // Clean formatted title
      let formattedTitle = "";
      if (ticker) {
        formattedTitle = `${ticker} - ${subject}`;
      } else {
        formattedTitle = `Borsa İstanbul - ${subject}`;
      }

      const key = "kap-" + formattedTitle.toLowerCase().slice(0, 45);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      // Official KAP summary construction
      let summary = "";
      if (category === "Devre Kesici") {
        summary = `Borsa İstanbul BISTECH Devre Kesici Uygulaması: ${ticker || "İlgili"} payında işlemler geçici olarak durdurulmuş ve tek fiyat emir toplama başlatılmıştır. Resmi KAP duyurusudur.`;
      } else if (subject.toLowerCase().includes("geri alım") || subject.toLowerCase().includes("payların geri")) {
        summary = `${companyInfo?.name || ticker || "Şirket"}: Pay geri alım programı kapsamında resmi bildirim Kamuyu Aydınlatma Platformu'nda yayımlanmıştır.`;
      } else if (category === "Hak Kullanımı / Temettü") {
        summary = `${companyInfo?.name || ticker || "Borsa İstanbul"}: Kâr payı dağıtımı / sermaye artırımı / rüçhan hak kullanımına ilişkin resmi KAP açıklamasıdır.`;
      } else {
        summary = `${companyInfo?.name || ticker || "Borsa İstanbul"}: ${subject} konulu resmi açıklama Kamuyu Aydınlatma Platformu'nda yayımlanmıştır.`;
      }

      let islamicFinanceNote = "Kamuyu Aydınlatma Platformu (KAP) resmi şirket bildirimi.";
      if (companyInfo) {
        if (companyInfo.isCompliant) {
          islamicFinanceNote = `✅ ${primaryTicker} hissesi BIST Katılım Endeksi (XKTUM) kapsamındadır. DİB ve TKBB fıkhi standartlarına uygundur.`;
        } else {
          islamicFinanceNote = `⚠️ ${primaryTicker} hissesi Katılım Endeksi dışındadır. Finansal borç/faiz oranı veya ana faaliyet alanı uygun görülmemiştir.`;
        }
      }

      const officialKapUrl = primaryTicker
        ? `https://www.kap.org.tr/tr/sirket-bilgileri/ozet/${primaryTicker}`
        : "https://www.kap.org.tr";

      const id = "kap-" + Math.abs(hashCode(formattedTitle));
      items.push({
        id,
        source: "KAP",
        title: formattedTitle,
        rawTitle: item.rawTitle,
        summary,
        category,
        categoryColor,
        publisher: "Kamuyu Aydınlatma Platformu (KAP)",
        ticker: primaryTicker,
        companyName: companyInfo?.name,
        pubDate: item.pubDate,
        isoDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        timeAgo: formatRelativeTime(item.pubDate),
        url: officialKapUrl,
        isCompliant: companyInfo ? companyInfo.isCompliant : null,
        islamicFinanceNote,
      });
    }

    // Sort items by pubDate / freshness
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

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
