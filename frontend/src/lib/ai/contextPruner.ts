/**
 * Mizan AI Context Window Pruning & Token Budget Manager
 * 
 * Google Gemini 65K TPM (Tokens Per Minute) sınırına çarpmamak,
 * gecikmeyi minimize etmek ve çok turlu konuşmalarda şirket/konu
 * bağlamını kaybetmeden hafızayı kompakt tutmak için geliştirilmiş
 * akıllı bellek yöneticisi.
 */

export interface ChatMessageContext {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PrunedContextResult {
  prunedHistoryText: string;
  retainedTicker: string | null;
  approximateTokens: number;
  prunedCount: number;
}

/**
 * Türkçe ve finansal terimler için yaklaşık token hesabı (~3.5 karakter/token)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3.5);
}

const TURKISH_NON_TICKER_WORDS = new Set([
  "EVET", "HAYIR", "NEDEN", "NASIL", "SELAM", "ZEKAT", "ZEKÂT", "INFAK",
  "BORCU", "FIYAT", "HEPSİ", "BORSA", "FAIZ", "CAIZ", "HELAL", "HARAM",
  "HISSE", "KREDI", "ORTAK", "NEDIR", "HANGI", "NEREDE", "ZAMAN", "KADAR",
  "BUNUN", "YERINE", "UYGUN", "SENCE", "SÖYLE", "ANLAT", "BILGI", "TAMAM",
  "AL", "CAN", "DUR", "GEN", "INFO", "KART", "SAN", "TAT", "TEK", "YAT",
  "SU", "FON", "TUR", "PAR", "BAG", "SUR", "TAB", "BAY", "GEL", "GIT"
]);

/**
 * Çok turlu konuşmalarda geçmişten gerçek hisse kodunu (ticker) kurtarma
 */
export function extractStickyTicker(messages: ChatMessageContext[]): string | null {
  const tickerRegex = /\b([A-Z]{4,5})\b/g;
  for (let i = messages.length - 1; i >= 0; i--) {
    const text = messages[i].content.toUpperCase();
    const matches = text.match(tickerRegex);
    if (matches && matches.length > 0) {
      const candidate = matches.find((m) => !TURKISH_NON_TICKER_WORDS.has(m));
      if (candidate) return candidate;
    }
  }
  return null;
}

/**
 * 3 Kademeli Context Pruning Motoru:
 * 1. Kayan Pencere (Sliding Window): Son 4 mesajı tam detaylı tut
 * 2. Asistan Yanıtı Sıkıştırma (Content Truncation): Uzun tablolu yanıtları 250 karaktere kırp
 * 3. Rolling Summary: Eski mesajlardan anahtar kelimeleri ve konuşulan şirketleri tek cümlelik hafıza notu yap
 */
export function pruneConversationHistory(
  messages: ChatMessageContext[],
  maxTokensTarget: number = 600
): PrunedContextResult {
  if (!messages || messages.length <= 1) {
    return {
      prunedHistoryText: "",
      retainedTicker: null,
      approximateTokens: 0,
      prunedCount: 0,
    };
  }

  // Son kullanıcı mesajını hariç tut (çünkü o doğrudan soru olarak gidecek)
  const pastMessages = messages.slice(0, -1);
  const retainedTicker = extractStickyTicker(pastMessages);

  // Kayan pencere: En son 4 mesajı al
  const WINDOW_SIZE = 4;
  const recentWindow = pastMessages.slice(-WINDOW_SIZE);
  const olderMessages = pastMessages.slice(0, -WINDOW_SIZE);

  let rollingSummary = "";
  if (olderMessages.length > 0) {
    const mentionedTickers = new Set<string>();
    olderMessages.forEach((m) => {
      const match = m.content.toUpperCase().match(/\b[A-Z]{4,5}\b/g);
      if (match) {
        match.forEach((t) => {
          if (!["EVET", "HAYIR", "NEDEN", "NASIL", "SELAM", "ZEKAT"].includes(t)) {
            mentionedTickers.add(t);
          }
        });
      }
    });

    const tickerList = Array.from(mentionedTickers).join(", ");
    rollingSummary = `[ÖNCEKİ DİYALOG HAFIZA ÖZETİ: Kullanıcı daha önce ${olderMessages.length} mesajlık diyalog yürüttü. Bahsi geçen hisseler: ${tickerList || "Genel Fıkhi Sorular"}].\n`;
  }

  // Yakın mesajları biçimlendir ve uzun asistan metinlerini kırp
  const formattedRecent = recentWindow
    .map((m) => {
      const roleLabel = m.role === "user" ? "KULLANICI" : "ASİSTAN";
      // Asistan yanıtını 250 karaktere kırparak token patlamasını önle
      const content =
        m.role === "assistant" && m.content.length > 250
          ? `${m.content.slice(0, 250)}... [özetlendi]`
          : m.content;
      return `${roleLabel}: ${content.trim()}`;
    })
    .join("\n\n");

  const combinedText = (rollingSummary + formattedRecent).trim();
  const tokens = estimateTokens(combinedText);

  return {
    prunedHistoryText: combinedText,
    retainedTicker,
    approximateTokens: tokens,
    prunedCount: olderMessages.length,
  };
}
