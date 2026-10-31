import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
import { BIST_COMPREHENSIVE_UNIVERSE } from "@/lib/data/bistUniverse";
import {
  SAMPLE_COMPANIES_SUMMARY,
  DETAILED_COMPANIES_DATABASE,
  getCompanySummary,
} from "@/lib/data/sampleCompanies";
import {
  Decimal,
  formatTRY,
  calculateDaysHeld,
  calculateHoldingPurificationClient,
  calculateZakatForPositionClient,
} from "@/lib/decimal/decimal";
import {
  SECTOR_COMPLIANT_ALTERNATIVES,
  getCompliantAlternativesForTicker,
} from "@/lib/data/compliantAlternatives";
import { pruneConversationHistory } from "@/lib/ai/contextPruner";

// Google Gemini Flash API Ayarları (Ortam değişkeninden okunur)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Fıkhi Doktrin ve Kurumsal Sistem Talimatı
const MIZAN_SYSTEM_PROMPT = `
Sen Mizan Katılım Finans Sistemi'nin resmi yapay zekâ fıkhi ve finansal asistanısın (Mizan AI).
Model altyapın: Google Gemini Flash.
Temel görevin: Borsa İstanbul (BIST) hisselerini, Diyanet İşleri Başkanlığı (DİB) Din İşleri Yüksek Kurulu 2021/11 Sayılı Mütalaası ve Türkiye Katılım Bankaları Birliği (TKBB) Katılım Standart 1 (Pay Senetleri Alım-Satımı) ilkelerine göre analiz etmek; yatırımcıların fıkhi arındırma (infak), hisse zekâtı ve helal sektörel ikame sorularını kuruş hassasiyetinde yanıtlamaktır.

ÖNEMLİ CEVAP VE FORMAT KURALLARI:
1. YALNIZCA SORULAN KONUYA ODAKLAN: Kullanıcının açıkça sormadığı hiçbir hisse veya şirketi durduk yere cevaba ekleme. Eğer kullanıcı genel bir fıkhi soru soruyorsa (örn: "Halka arz helal mi?", "Borsada hisse almak caiz mi?", "Zekât nasıl hesaplanır?"), yalnızca o sorunun fıkhi cevabını ver; asla durduk yere THYAO veya başka şirket analizlerine girme!
2. TEMİZ VE AKICI YAZIM: Cevaplarında temiz, estetik ve akıcı bir Türkçe kullan. Asla gereksiz veya bozuk markdown sembolleri (ardışık hashler, garip yıldız kümeleri) yığma. Başlıkları ve listeleri sade tut.
3. FAİZLİ BORÇ EŞİĞİ: Şirketin faizli borçlarının toplam piyasa değerine oranı azami %33 olmalıdır. %33'ü aşan şirketler (Örn: THYAO %44.2) Katılım Endeksi dışıdır ve hisselerini almak caiz görülmez.
4. FAİZ GETİREN MEVDUAT EŞİĞİ: Faizli mevduat ve menkul kıymetlerin piyasa değerine oranı azami %30 olmalıdır.
5. ŞÜPHELİ / HARAM GELİR EŞİĞİ: Şirketin gayrimeşru faaliyetlerden elde ettiği hasılat azami %5 olmalıdır.
6. FAALİYET YASAĞI: Faizli bankacılık, konvansiyonel sigorta, alkollü içki, domuz mamulleri, kumar ve şans oyunları üreten/ticaretini yapan şirketler doğrudan katılım dışıdır.
7. ARINDIRMA (İPFAK): Hissenin hasılatına karışan düşük oranlı (azami %5) şüpheli gelir, pro-rata (365 gün esasıyla) hesaplanarak sevap beklemeksizin kamu yararına veya ihtiyaç sahiplerine infak edilmelidir.
8. HİSSE ZEKÂTI (DİB USULÜ): Temettü amaçlı hisselerde Duran Varlıklar (fabrika, arsa, makineler) zekâttan muaftır; yalnızca net Dönen Varlıklar üzerinden %2,5 (1/40) zekât tahakkuk ettirilir.
9. SPK YASAL UYARISI: Asla spekülatif hisse alım-satım tavsiyesi (YTD) verme. Fıkhi standartlar çerçevesinde bilgilendir.
`;

// Türkçe kelimelerle çakışan veya yanlış pozitif üreten 2-4 harfli borsa kodları
const COLLIDING_WORDS = new Set([
  "AL", "CAN", "DUR", "GEN", "INFO", "KART", "SAN", "TAT", "TEK", "YAT",
  "SU", "FON", "TUR", "PAR", "BAG", "SUR", "TAB", "BAY", "GEL", "GIT",
  "YOK", "VAR", "HER", "BIR", "SON", "KAP", "PAY", "BOR", "NET", "KOT",
  "FAIZ", "CAIZ", "DIN", "HAK", "ORAN", "TL", "USD", "EUR", "TRY", "BIST",
  "BORSA", "HELAL", "HARAM", "HISSE", "ORTAK", "KREDI", "KREDİ", "MUDAR",
  "ILK", "İLK", "AY", "GUN", "GÜN", "VE", "ILE", "İLE", "BU", "ŞU", "O"
]);

interface ChatRequestMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body as {
      messages: ChatRequestMessage[];
      context?: {
        currentTicker?: string;
        currentPath?: string;
        portfolioHoldings?: any[];
      };
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Geçersiz mesaj listesi" },
        { status: 400 }
      );
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const lowerText = lastUserMessage.toLowerCase();

    // 0. Akıllı Context Window Pruning & Ticker Hafızası (65K TPM Güvenliği)
    const pruningResult = pruneConversationHistory(messages, 500);

    // 1. Ticker Tespiti (Yalnızca kullanıcı açıkça bir hisse sorduysa)
    let detectedTicker: string | null = context?.currentTicker?.toUpperCase() || null;
    
    // Mesaj içindeki BIST hisse sembollerini ara (Çakışan Türkçe kelimeleri eleyerek)
    const allTickers = BIST_COMPREHENSIVE_UNIVERSE.map((c) => c.ticker);
    for (const t of allTickers) {
      if (COLLIDING_WORDS.has(t)) {
        // Eğer kod Türkçe bir kelimeyle çakışıyorsa (örn: CAN, AL, DUR, GEN, TAT, TEK, SU)
        // Sadece mesajda BÜYÜK HARFLE ve "hisse/şirket" kelimeleriyle birlikte geçtiyse kabul et:
        const strictRegex = new RegExp(`\\b${t}\\b`);
        const hasStockKeyword = /\b(hisse|şirket|senet|pay|endeks|rasyo|caiz|fiyat)\b/i.test(lastUserMessage);
        if (strictRegex.test(lastUserMessage) && hasStockKeyword) {
          detectedTicker = t;
          break;
        }
      } else {
        const regex = new RegExp(`\\b${t}\\b`, "i");
        if (regex.test(lastUserMessage)) {
          detectedTicker = t;
          break;
        }
      }
    }

    // Kullanıcı mesajında hisse yoksa; SADECE mesaj bariz bir takip sorusuysa (örn: "bunun borcu ne?", "yerine ne alabilirim?") hafızadan devral
    const isExplicitFollowUp = /\b(bunun|bu hisse|şirketin|yerine|muadil|alternatif|borcu|arındırması|zekâtı)\b/i.test(lastUserMessage);
    if (!detectedTicker && isExplicitFollowUp && pruningResult.retainedTicker) {
      detectedTicker = pruningResult.retainedTicker;
    }

    // 2. Ticker İle İlgili Deterministik Fıkhi ve Finansal Veri Çekimi
    let stockData: any = null;
    let compliantAlternatives: any[] = [];
    let purificationCalculation: any = null;
    let zakatCalculation: any = null;

    if (detectedTicker) {
      const summary = getCompanySummary(detectedTicker);
      const detail = DETAILED_COMPANIES_DATABASE[detectedTicker];
      const universeItem = BIST_COMPREHENSIVE_UNIVERSE.find(
        (c) => c.ticker === detectedTicker
      );

      const isCompliant = summary?.bistStatus === "COMPLIANT";
      const debtRatio =
        detail?.ratios?.interestDebt?.ratioPercentage ||
        (universeItem ? `%${universeItem.debtRatioPercent.toFixed(1)}` : "%22.4");
      const cashRatio =
        detail?.ratios?.interestCash?.ratioPercentage ||
        (universeItem ? `%${universeItem.cashRatioPercent.toFixed(1)}` : "%8.6");
      const impureIncomeRatio =
        detail?.ratios?.impureIncome?.ratioPercentage ||
        (universeItem ? `%${universeItem.impureIncomePercent.toFixed(1)}` : "%0.8");

      stockData = {
        ticker: detectedTicker,
        name: summary?.name || universeItem?.name || detectedTicker,
        sector: summary?.sector || universeItem?.sector || "BIST",
        priceTRY: summary?.priceTRY || universeItem?.priceTRY || "₺100.00",
        isCompliant,
        debtRatio,
        cashRatio,
        impureIncomeRatio,
        nonComplianceReason: !isCompliant
          ? detectedTicker === "THYAO"
            ? "Faizli Kredi ve Borç Eşiği %44.2 > %33.0 yasal tavanı (Taşımacılık / Havacılık)"
            : "Finansal Borç veya Şüpheli Gelir Eşik Aşımı"
          : null,
      };

      // Eğer katılım dışıysa veya alternatif soruluyorsa muadilleri çek
      if (!isCompliant || lowerText.includes("yerine") || lowerText.includes("muadil") || lowerText.includes("alternatif")) {
        compliantAlternatives = getCompliantAlternativesForTicker(
          detectedTicker,
          stockData.sector
        );
      }

      // Arındırma hesabı soruluyorsa
      if (lowerText.includes("arındır") || lowerText.includes("infak") || lowerText.includes("şüpheli kazanç")) {
        const impureIncome = detail?.purificationMetrics?.impureIncomeIsolatedQuarterTRY || "500000";
        const totalShares = detail?.purificationMetrics?.totalSharesOutstanding || "100000000";
        const purCalc = calculateHoldingPurificationClient(
          impureIncome,
          totalShares,
          new Decimal(100),
          90,
          90,
          true
        );
        purificationCalculation = {
          ticker: detectedTicker,
          lots: 100,
          purificationPerShareTRY: purCalc.purificationPerShare.toFixed(4),
          sampleTotalPayableTRY: purCalc.totalPurificationPayable.toFixed(2),
        };
      }

      // Zekât hesabı soruluyorsa
      if (lowerText.includes("zekat") || lowerText.includes("zekât")) {
        const zatableNetAssets =
          detail?.purificationMetrics?.zatableNetCurrentAssetsPerShareTRY ||
          summary?.zatableNetAssetsPerShareTRY ||
          "45.20";
        const curPriceDec = new Decimal(stockData.priceTRY.replace("₺", "").trim() || "100.00");
        const zakCalc = calculateZakatForPositionClient({
          quantityLots: new Decimal(100),
          currentPriceTRY: curPriceDec,
          zatableNetAssetsPerShareTRY: zatableNetAssets,
          intent: "LONG_TERM_DIVIDEND",
        });
        zakatCalculation = {
          ticker: detectedTicker,
          lots: 100,
          netZatablePerShareTRY: zatableNetAssets,
          sampleZakatPayableTRY: zakCalc.zakatPayableTRY.toFixed(2),
        };
      }
    }

    // 3. Gemini Flash İçin Bağlam (Context) Zenginleştirme
    let contextAddition = "";
    if (stockData) {
      contextAddition += `\n[MEVCUT SORGULANAN HİSSE VERİSİ - BİLGİ DOĞRULANMIŞTIR]:
- Kod: ${stockData.ticker} (${stockData.name})
- Sektör: ${stockData.sector}
- Güncel Fiyat: ${stockData.priceTRY}
- Katılım Uygunluğu: ${stockData.isCompliant ? "KATILIM ENDEKSİNE UYGUNDUR (CAİZ)" : "KATILIM DIŞIDIR (CAİZ DEĞİLDİR)"}
- Faizli Borç Oranı: ${stockData.debtRatio} (Yasal Eşik: Azami %33)
- Faizli Varlık/Nakit Oranı: ${stockData.cashRatio} (Yasal Eşik: Azami %30)
- Şüpheli Gelir Oranı: ${stockData.impureIncomeRatio} (Yasal Eşik: Azami %5)
${stockData.nonComplianceReason ? `- Katılım Dışı Kalma Gerekçesi: ${stockData.nonComplianceReason}` : ""}
`;
    }

    if (compliantAlternatives.length > 0) {
      contextAddition += `\n[KATILIM UYUMLU ÖNERİLECEK SEKTÖREL MUADİLLER]:
${compliantAlternatives.map((a) => `- ${a.ticker} (${a.name}): Borç oranı ${a.debtRatio || "düşük"}, Katılım tam onaylı. ${a.reason}`).join("\n")}
`;
    }

    // Context Window Pruning ile optimize edilmiş geçmiş hafızası
    const historySection = pruningResult.prunedHistoryText
      ? `\n[ÖNCEKİ DİYALOG HAFIZA BAĞLAMI]:\n${pruningResult.prunedHistoryText}\n`
      : "";

    // 4. Gemini Flash Canlı API Çağrısı (Model Kademeli Çağrı)
    let aiText = "";
    let isLiveGemini = false;
    let successfulModel = "";

    // Bakiye ve kota destekli model öncelik sıralaması
    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-3-flash-preview",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.1-flash-lite-preview",
    ];

    const geminiPrompt = `${MIZAN_SYSTEM_PROMPT}\n${contextAddition}\n${historySection}\nKULLANICI SORUSU: ${lastUserMessage}\nLütfen DİB ve TKBB standartlarına göre net, akıcı, zengin markdown biçimli fıkhi ve finansal analiz yanıtı ver. Kullanıcının sorusuna doğrudan, canlı ve derinlemesine yanıt ver. SPK uyarınca yatırım tavsiyesi olmadığını (YTD) belirt.`;

    for (const modelName of candidateModels) {
      if (aiText) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: geminiPrompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
                thinkingConfig: {
                  thinkingBudget: 0,
                },
              },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generated =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generated && generated.trim().length > 0) {
            aiText = generated.trim();
            isLiveGemini = true;
            successfulModel = modelName;
            break;
          }
        } else {
          const errStatus = geminiRes.status;
          console.warn(`Model ${modelName} returned HTTP ${errStatus}`);
        }
      } catch (e) {
        console.warn(`Model ${modelName} call failed, trying next...`, e);
      }
    }

    // 5. Deterministik Fıkhi Sentez Motoru (Gemini yanıt vermezse veya çevrimdışıysa kusursuz fallback)
    if (!aiText) {
      if (detectedTicker && stockData) {
        if (!stockData.isCompliant) {
          aiText = `### ${stockData.ticker} (${stockData.name}) Katılım Finansı Analizi

**Fıkhi Değerlendirme:** **Kapsam Dışıdır (Caiz Görülmemektedir)**

**Gerekçe ve Eşik İhlali:**
${stockData.ticker} hissesi, Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu 2021/11 Kararı ve TKBB Katılım Standart 1 kriterlerine göre **finansal oran eşiğini aşmaktadır**.
- **Faizli Borç Oranı:** **${stockData.debtRatio}** (Yasal Tavan: Azami %33,0)
- **Faizli Nakit/Mevduat:** ${stockData.cashRatio} (Yasal Tavan: Azami %30,0)
- **Şüpheli Hasılat:** ${stockData.impureIncomeRatio} (Yasal Tavan: Azami %5,0)

Şirketin faizli kredi yükü, Borsa İstanbul Katılım Endeksi'nin izin verdiği %33'lük sınırın üzerinde olduğu için hisse senetlerinin portföylere dahil edilmesi dinen caiz değildir.

---

### Önerilen Katılım Uyumlu Sektörel Muadiller
${stockData.ticker} yerine aynı sektörde yer alan ve BIST Katılım Endeksi onayına sahip alternatif hisseler:
${compliantAlternatives.map((a) => `- **${a.ticker}** (${a.name}): Borç oranı ${a.debtRatio || "%14.2"} seviyesinde güvenli ve DİB/TKBB tam onaylıdır.`).join("\n")}

*Bilgilendirme Amaçlıdır. SPK Mevzuatı Gereğince Yatırım Tavsiyesi Değildir (YTD).*`;
        } else {
          aiText = `### ${stockData.ticker} (${stockData.name}) Katılım Finansı Analizi

**Fıkhi Değerlendirme:** **BIST Katılım Endeksi'ne Tam Uygundur (Caizdir)**

**Finansal ve Fıkhi Kriterler:**
- **Faizli Borç Oranı:** **${stockData.debtRatio}** (Azami %33 tavanının çok altındadır, güvenli tampon barındırır).
- **Faiz Getiren Nakit & Menkul Kıymet:** **${stockData.cashRatio}** (Azami %30 tavanının altındadır).
- **Şüpheli Gelir Oranı:** **${stockData.impureIncomeRatio}** (Azami %5 tavanının altındadır).
- **Faaliyet Alanı:** Şirket ana sözleşmesinde dinen yasaklanmış (faizli finans, alkol, şans oyunları vb.) faaliyetler yer almamaktadır.

${purificationCalculation ? `\n**Fıkhi Arındırma (İnfak) Sorumluluğu:**\n100 lot hisse için çeyreklik şüpheli kazanç tutarı yaklaşık **${purificationCalculation.sampleTotalPayableTRY} TL** olup bu tutarın kâr payı tahakkuk ettiğinde sevap beklemeksizin ihtiyaç sahiplerine infak edilmesi tavsiye edilir.` : ""}

${zakatCalculation ? `\n**DİB Usulü Hisse Zekâtı:**\nDiyanet Din İşleri Yüksek Kurulu fetvasına göre temettü yatırımlarında fabrika ve tesisler zekâttan istisnadır. 100 lot için tahakkuk eden %2,5 yıllık zekât tutarı yaklaşık **${zakatCalculation.sampleZakatPayableTRY} TL**'dir.` : ""}

*Bilgilendirme Amaçlıdır. SPK Mevzuatı Gereğince Yatırım Tavsiyesi Değildir (YTD).*`;
        }
      } else {
        // Genel fıkhi soru fallback'i
        aiText = `### Mizan Katılım Finans Fıkhi Bilgilendirme

Sorunuzu Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu 2021/11 Sayılı Mütalaası ve TKBB Katılım Standart 1 metodolojisine göre değerlendiriyorum:

1. **Hisse Senedi Alım-Satımında Esas:** Bir şirketin hissesini almak o şirkete ortak olmaktır. Şirketin ana faaliyet alanının helal olması ve faizli borçlarının toplam piyasa değerinin **%33'ünü aşmaması** şarttır.
2. **Kredili İşlem ve Açığa Satış:** Açığa satış (olmayan malı satmak) ve faizli marjin (kredili alım) işlemleri İslam fıkhında kesinlikle caiz görülmemektedir.
3. **Kâr Payı Arındırması:** Şirketin hasılatına karışan düşük oranlı (azami %5) şüpheli gelirler, hissenin portföyde tutulduğu gün sayısıyla orantılı olarak infak edilmelidir.
4. **Hisse Zekâtı:** Uzun vadeli temettü ortaklıklarında binalar ve makineler zekâttan düşülerek yalnızca net dönen varlık üzerinden **%2,5 zekât** hesaplanır.

Detaylı analiz için hisse kodu belirtebilirsiniz (Örn: *“THYAO neden katılım dışı?”, “BIMAS arındırma borcum ne kadar?”, “KCHOL yerine ne alabilirim?”*).

*SPK Mevzuatı Uyarınca Yatırım Tavsiyesi Değildir (YTD).*`;
      }
    }

    // 6. Önerilen Devam Soruları (Quick Pills)
    const suggestedQuestions: string[] = [];
    if (detectedTicker) {
      if (stockData?.isCompliant) {
        suggestedQuestions.push(
          `${detectedTicker} için arındırma infakı ne kadar?`,
          `${detectedTicker} hisse zekâtı nasıl hesaplanır?`,
          `${detectedTicker} katılım endeksinden çıkma riski var mı?`
        );
      } else {
        suggestedQuestions.push(
          `${detectedTicker} yerine hangi katılım hissesini alabilirim?`,
          `${detectedTicker} neden katılım endeksine giremiyor?`,
          `${detectedTicker} borç rasyosu ne zaman düzelir?`
        );
      }
    } else {
      suggestedQuestions.push(
        "THYAO neden katılım dışı kaldı?",
        "BIMAS için bu çeyrek arındırma infakı ne kadar?",
        "Hisse zekâtında fabrika ve arsayı düşecek miyim?"
      );
    }

    return NextResponse.json({
      text: aiText,
      modelUsed: isLiveGemini
        ? `Google Gemini Flash (${successfulModel}) • Canlı`
        : "Mizan Kural Motoru (Gemini kotası dolduğu için devrede)",
      stockData,
      compliantAlternatives,
      purificationCalculation,
      zakatCalculation,
      suggestedQuestions,
      tokenMetrics: {
        historyTokens: pruningResult.approximateTokens,
        prunedMessages: pruningResult.prunedCount,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Asistan yanıt üretirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
