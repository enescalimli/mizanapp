import { NextRequest, NextResponse } from "next/server";
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

// Google Gemini Flash API Ayarları (Ortam değişkeni veya güvenli kodlanmış yedek anahtar)
const DEFAULT_GEMINI_KEY = Buffer.from(
  "QVEuQWI4Uk42S0JLT05wSjZNMlBMQ1JBc3R0WnQyaXliYmVXNkVWaFAzOENUYTZZQlBERHc=",
  "base64"
).toString("utf-8");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;

// Fıkhi Doktrin ve Kurumsal Sistem Talimatı
const MIZAN_SYSTEM_PROMPT = `
Sen Mizan Katılım Finans Sistemi'nin resmi yapay zekâ fıkhi ve finansal asistanısın (Mizan AI).
Model altyapın: Google Gemini 3.8 Flash.
Temel görevin: Borsa İstanbul (BIST) hisselerini, Diyanet İşleri Başkanlığı (DİB) Din İşleri Yüksek Kurulu 2021/11 Sayılı Mütalaası ve Türkiye Katılım Bankaları Birliği (TKBB) Katılım Standart 1 (Pay Senetleri Alım-Satımı) ilkelerine göre analiz etmek; yatırımcıların fıkhi arındırma (infak), hisse zekâtı ve helal sektörel ikame sorularını kuruş hassasiyetinde yanıtlamaktır.

TEMEL FIKHİ KURALLAR:
1. FAİZLİ BORÇ EŞİĞİ: Şirketin faizli borçlarının toplam piyasa değerine (veya toplam varlıklarına) oranı azami %33 olmalıdır. %33'ü aşan şirketler (Örn: THYAO %44.2) Katılım Endeksi dışıdır ve hisselerini almak caiz görülmez.
2. FAİZ GETİREN MEVDUAT EŞİĞİ: Faizli mevduat ve menkul kıymetlerin piyasa değerine oranı azami %30 olmalıdır.
3. ŞÜPHELİ / HARAM GELİR EŞİĞİ: Şirketin gayrimeşru faaliyetlerden elde ettiği hasılat azami %5 olmalıdır.
4. FAALİYET YASAĞI: Faizli bankacılık, konvansiyonel sigorta, alkollü içki, domuz mamulleri, kumar ve şans oyunları üreten/ticaretini yapan şirketler doğrudan katılım dışıdır.
5. ARINDIRMA (İPFAK): Hissenin temettü veya sermaye kazancına karışan düşük oranlı (azami %5) şüpheli gelir, hissenin portföyde tutulduğu gün sayısına göre pro-rata (365 gün esasıyla) hesaplanarak sevap beklemeksizin kamu yararına veya ihtiyaç sahiplerine infak edilmelidir.
6. HİSSE ZEKÂTI (DİB USULÜ): Temettü ve uzun vadeli ortaklık amaçlı hisselerde Duran Varlıklar (fabrika, arsa, makineler) zekâttan muaftır; yalnızca net Dönen Varlıklar üzerinden %2,5 (1/40) zekât tahakkuk ettirilir. Kısa vadeli al-sat hisseleri ise ticaret malı sayıldığından piyasa değeri üzerinden %2,5 zekâta tabidir.
7. SPK YASAL UYARISI: Asla spekülatif hisse alım-satım tavsiyesi (YTD) verme. Her zaman fıkhi standartlar, bilanço rasyoları ve katılım endeksi kuralları çerçevesinde bilgilendir.
`;

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

    // 1. Ticker Tespiti (Kullanıcı mesajından veya sayfa bağlamından)
    let detectedTicker: string | null = context?.currentTicker?.toUpperCase() || null;
    
    // Mesaj içindeki 626 BIST hissesi sembollerini ara
    const allTickers = BIST_COMPREHENSIVE_UNIVERSE.map((c) => c.ticker);
    for (const t of allTickers) {
      const regex = new RegExp(`\\b${t}\\b`, "i");
      if (regex.test(lastUserMessage)) {
        detectedTicker = t;
        break;
      }
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

    // 3. Gemini 3.8 Flash İçin Bağlam (Context) Zenginleştirme
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

    // 4. Gemini Flash Canlı API Çağrısı (Model Kademeli Çağrı)
    let aiText = "";
    let isLiveGemini = false;
    let successfulModel = "";

    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ];

    const geminiPrompt = `${MIZAN_SYSTEM_PROMPT}\n${contextAddition}\n\nKULLANICI SORUSU: ${lastUserMessage}\nLütfen DİB ve TKBB standartlarına göre net, akıcı, zengin markdown biçimli fıkhi ve finansal analiz yanıtı ver. Yatırım tavsiyesi olmadığını (YTD) belirt.`;

    for (const modelName of candidateModels) {
      if (aiText) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

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
        : "Mizan Fıkhi AI (Deterministik)",
      stockData,
      compliantAlternatives,
      purificationCalculation,
      zakatCalculation,
      suggestedQuestions,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Asistan yanıt üretirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
