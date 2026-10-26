import { NextResponse } from "next/server";
import { PortfolioHoldingItem } from "@/types/katilim";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface PortfolioStoreEntry {
  email: string;
  holdings: PortfolioHoldingItem[];
  updatedAt: string;
}

// In-memory global store to keep track of user portfolios across requests
const globalForPortfolios = globalThis as unknown as {
  mizanPortfolioStore?: Map<string, PortfolioStoreEntry>;
};

const portfolioStore = globalForPortfolios.mizanPortfolioStore ?? new Map<string, PortfolioStoreEntry>();
if (process.env.NODE_ENV !== "production") globalForPortfolios.mizanPortfolioStore = portfolioStore;

// File-based backup for persistent local development storage
const LOCAL_STORAGE_FILE = path.join(process.cwd(), ".portfolio_cache.json");

function loadLocalFileCache(): void {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const content = fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        for (const [email, data] of Object.entries(parsed)) {
          portfolioStore.set(email.toLowerCase(), data as PortfolioStoreEntry);
        }
      }
    }
  } catch (err) {
    // Non-fatal cache load error
  }
}

function saveLocalFileCache(): void {
  try {
    const obj: Record<string, PortfolioStoreEntry> = {};
    portfolioStore.forEach((v, k) => {
      obj[k] = v;
    });
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    // Non-fatal write error
  }
}

// Initial cache load
loadLocalFileCache();

/**
 * GET /api/portfolio/sync?email=user@example.com
 * E-posta adresine bağlı portföyü buluttan çeker.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    if (!emailParam || !emailParam.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir e-posta adresi belirtilmelidir." },
        { status: 400 }
      );
    }

    const email = emailParam.toLowerCase().trim();

    // 1. Supabase Yapılandırılmışsa Gerçek Supabase Veritabanından Oku
    if (isSupabaseConfigured()) {
      try {
        // Profili veya portföyü çek
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (profile?.id) {
          const { data: portfolios } = await supabase
            .from("portfolios")
            .select("id")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: true })
            .limit(1);

          if (portfolios && portfolios.length > 0) {
            const portfolioId = portfolios[0].id;
            const { data: holdingsData, error: holdingsErr } = await supabase
              .from("portfolio_holdings")
              .select("*")
              .eq("portfolio_id", portfolioId)
              .order("created_at", { ascending: true });

            if (!holdingsErr && holdingsData && holdingsData.length > 0) {
              const mappedHoldings: PortfolioHoldingItem[] = holdingsData.map((row) => ({
                id: row.id,
                ticker: row.ticker,
                lots: String(row.lots),
                avgCostTRY: String(row.avg_cost_try),
                purchaseDate: row.purchase_date || new Date().toISOString().split("T")[0],
                purificationMethod: row.purification_method === "DIVIDEND_BASED" ? "dividend" : "holding",
                zakatIntent: row.zakat_intent === "LONG_TERM_DIVIDEND" ? "LONG_TERM_DIVIDEND" : "TRADING_SHORT_TERM",
              }));

              // In-memory cache'i güncelle
              portfolioStore.set(email, {
                email,
                holdings: mappedHoldings,
                updatedAt: new Date().toISOString(),
              });

              return NextResponse.json({
                success: true,
                source: "supabase",
                email,
                holdings: mappedHoldings,
                lastSyncedAt: new Date().toISOString(),
              });
            }
          }
        }
      } catch (sbErr) {
        console.warn("[PORTFOLIO-SYNC] Supabase read fallback:", sbErr);
      }
    }

    // 2. In-memory / File Store Kontrolü
    const entry = portfolioStore.get(email);
    if (entry) {
      return NextResponse.json({
        success: true,
        source: "cloud-cache",
        email,
        holdings: entry.holdings,
        lastSyncedAt: entry.updatedAt,
      });
    }

    // E-posta için henüz bir portföy kaydedilmemişse boş liste dön
    return NextResponse.json({
      success: true,
      source: "empty-initial",
      email,
      holdings: [],
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[PORTFOLIO-SYNC-GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Portföy senkronizasyon verisi alınamadı." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio/sync
 * Body: { email: string, holdings: PortfolioHoldingItem[] }
 * E-posta adresine bağlı portföyü buluta kaydeder ve günceller.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const holdings: PortfolioHoldingItem[] = body.holdings;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir e-posta adresi belirtilmelidir." },
        { status: 400 }
      );
    }

    if (!Array.isArray(holdings)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz portföy verisi gönderildi." },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    // 1. Sunucu Belleği & Yerel Önbelleği Güncelle
    portfolioStore.set(email, {
      email,
      holdings,
      updatedAt: nowIso,
    });
    saveLocalFileCache();

    // 2. Supabase Yapılandırılmışsa Kalıcı Veritabanına Yaz
    let supabasePersisted = false;
    if (isSupabaseConfigured()) {
      try {
        // Profil var mı kontrol et, yoksa oluştur
        let userId: string | null = null;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (profile?.id) {
          userId = profile.id;
        } else {
          // Yeni profil oluştur
          const { data: newProfile, error: profileErr } = await supabase
            .from("profiles")
            .insert({
              email,
              full_name: email.split("@")[0],
              preferred_standard: "BIST_KATILIM_DIB",
            })
            .select("id")
            .single();

          if (!profileErr && newProfile) {
            userId = newProfile.id;
          }
        }

        if (userId) {
          // Varsayılan portföyü bul veya oluştur
          let portfolioId: string | null = null;
          const { data: existingPortfolios } = await supabase
            .from("portfolios")
            .select("id")
            .eq("user_id", userId)
            .limit(1);

          if (existingPortfolios && existingPortfolios.length > 0) {
            portfolioId = existingPortfolios[0].id;
          } else {
            const { data: newPf, error: pfErr } = await supabase
              .from("portfolios")
              .insert({
                user_id: userId,
                name: "Ana Portföyüm",
                currency: "TRY",
                is_default: true,
              })
              .select("id")
              .single();

            if (!pfErr && newPf) {
              portfolioId = newPf.id;
            }
          }

          if (portfolioId) {
            // Önceki pozisyonları temizle ve yenilerini ekle (Full Sync Replacement)
            await supabase
              .from("portfolio_holdings")
              .delete()
              .eq("portfolio_id", portfolioId);

            if (holdings.length > 0) {
              const rowsToInsert = holdings.map((h) => ({
                portfolio_id: portfolioId,
                user_id: userId,
                ticker: h.ticker.toUpperCase(),
                lots: h.lots,
                avg_cost_try: h.avgCostTRY,
                purchase_date: h.purchaseDate || nowIso.split("T")[0],
                zakat_intent: h.zakatIntent || "TRADING_SHORT_TERM",
                purification_method: h.purificationMethod === "dividend" ? "DIVIDEND_BASED" : "HOLDING_PRORATA",
              }));

              await supabase.from("portfolio_holdings").insert(rowsToInsert);
            }
            supabasePersisted = true;
          }
        }
      } catch (sbErr) {
        console.warn("[PORTFOLIO-SYNC-POST] Supabase persist error:", sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      email,
      count: holdings.length,
      supabasePersisted,
      lastSyncedAt: nowIso,
    });
  } catch (err: any) {
    console.error("[PORTFOLIO-SYNC-POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Portföy senkronizasyonu gerçekleştirilemedi." },
      { status: 500 }
    );
  }
}
