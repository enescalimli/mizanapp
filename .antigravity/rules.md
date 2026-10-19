# ALT MODELLER VE KODLAMA AJANLARI İÇİN KATI MİMARİ VE FİNANSAL KURALLAR (`.antigravity/rules.md`)

> [!CAUTION]
> **BAĞLAYICI ANAYASA KURALI:** Bu projede görev yapan tüm yapay zeka modelleri (`Gemini 3.8 Flash`, `Gemini 4 Argon` ve alt ajanlar), herhangi bir dosya oluşturmadan veya düzenlemeden önce bu kuralları, `ARCHITECTURE.md` belgesini ve `TODO.md` yol haritasını okumak ve **sıfır istisna** ile uygulamak zorundadır.

---

## KURAL 1: SIFIR KAYAN NOKTA HATASI (ZERO-FLOAT POLICY) — TAVİZSİZ YASAK

Finansal tutarlar, hisse pay/lot miktarları, birim fiyatlar, temettüler, uygunluk oranları (rasyolar), arındırma (purification) tutarları ve zekat hesaplamalarında **IEEE 754 kayan nokta (`float`, `double`, `real`) veri tiplerinin kullanımı KESİNLİKLE YASAKTIR.**

### 1.1. Python (Backend) Kuralları
- **YASAK:** `amount: float`, `float(value)`, `round(val, 2)` (standart float round), Pydantic modellerinde `float` alan tanımlamak.
- **ZORUNLU:** Tüm parasal ve oransal değişkenler `decimal.Decimal` olmak zorundadır.
- `Decimal` nesneleri **asla** `float` üzerinden oluşturulmamalıdır:
  ```python
  # YANLIŞ (KESİNLİKLE YASAK):
  rate = Decimal(0.33)  # Bellekte 0.33000000000000001554312234475219... üretir!

  # DOĞRU (ZORUNLU):
  rate = Decimal("0.33000000")
  ```
- **Pydantic v2 Şemaları:** Tüm DTO'larda `Annotated[Decimal, Field(strict=False, max_digits=24, decimal_places=4)]` kullanılmalı ve JSON çıktılarında string olarak (`"1250.4500"`) serileştirilmelidir.
- **Yuvarlama Standardı:**
  - Rasyo hesaplamalarında: `8` ondalık basamak (`Decimal("0.00000001")`, `ROUND_HALF_UP`).
  - Yatırımcının ödeyeceği Arındırma (Purification) ve Zekat tutarlarının son kuruş yuvarlamasında: Şüpheli kazancın portföyde kalmaması (İhtiyatlılık İlkesi) için `Decimal("0.01")` hassasiyetinde **`ROUND_HALF_UP`** (veya kullanıcı tercihine göre yukarı tamamlama **`ROUND_CEILING`**) uygulanır.

### 1.2. PostgreSQL (Veritabanı) Kuralları
- **YASAK:** `FLOAT`, `REAL`, `DOUBLE PRECISION`, `MONEY` sütun tipleri.
- **ZORUNLU:**
  - Bilanço ve portföy tutarları: `NUMERIC(24, 4)`
  - Birim hisse fiyatları ve temettüler: `NUMERIC(18, 6)`
  - Lot / pay adetleri: `NUMERIC(20, 6)`
  - Katılım uygunluk rasyoları: `NUMERIC(12, 8)`

### 1.3. TypeScript / Next.js (Frontend) Kuralları
- **YASAK:** API'den gelen parasal/oransal string değerleri üzerinde `parseFloat()`, `Number(val)` veya standart `+`, `-`, `*`, `/` operatörleri ile doğrudan finansal hesaplama yapmak.
- **ZORUNLU:** Tüm istemci tarafı hesaplamalar `decimal.js` (`new Decimal(val)`) kütüphanesi üzerinden yapılmalıdır.

---

## KURAL 2: İSLAMİ FİNANS İHTİYATLILIK İLKESİ (SHARIAH PRUDENCE PRINCIPLE)

Katılım finansmanı algoritmalarında veri eksikliği veya belirsizlik durumunda sistem **her zaman ihtiyatlı (muhafazakar) tarafı** seçmek zorundadır:

1. **Belirsiz Nakit ve Mevduat Kuralı (`EC-02`):**
   - Ana bilançodaki `Nakit ve Nakit Benzerleri` toplamı ile dipnotta (Footnote) kalem kalem açıklanan (`Kasa + Vadesiz Mevduat + Katılım Hesabı + Vadeli Mevduat + Ters Repo`) toplamlar arasında pozitif bir fark ($\Delta > 0$) varsa, bu açıklanmayan fark **asla "Vadesiz/Helal" varsayılamaz**.
   - Farkın tamamı `other_cash_unclassified` alanına yazılır, faizli varlık payına (`interest_cash_numerator`) eklenir ve `used_conservative_fallback = True` bayrağı kaldırılır.
2. **Muhasebe Denklik Kısıtı (Accounting Identity Constraint):**
   - `identity_validator.py` onayından geçmeyen ($\Delta < 0$ olan, yani alt kalem toplamı ana bilanço kalemini aşan) hiçbir dipnot ayrıştırma çıktısı otomatik olarak `VERIFIED` statüsü alamaz; `EXTRACTION_CONFLICT` fırlatılmalıdır.
3. **Kümülatif Çeyrek İzolasyonu Kuralı:**
   - KAP gelir tabloları yıl içi kümülatiftir (3A, 6A, 9A, 12A). 2., 3. ve 4. çeyreklerde tekil çeyrek (`isolated_quarter`) ayrıştırması yapılmadan 6 veya 9 aylık kümülatif veri doğrudan 3 aylık dönem arındırmasında **kullanılamaz**.
4. **Zarar Eden Şirkette Arındırma Kuralı (`EC-03`):**
   - Bir şirket net dönem zararı açıklamış olsa bile, gelir tablosu dipnotlarında pozitif bir faiz veya uygunsuz yan faaliyet geliri (`impure_income > 0`) varsa arındırma tutarı **sıfırlanamaz**; brüt uygunsuz gelir üzerinden hisse başına arındırma hesaplanır.
5. **Uzun Vadeli Zekat Negatif Matrah Koruması (`EC-04`):**
   - Bir şirketin Kısa Vadeli Yükümlülükleri, Zekata Tabi Dönen Varlıklarından fazlaysa ($A_{\text{zatable}} < 0$), o hissenin zekat matrahı `Decimal("0.0000")` kabul edilir; portföydeki diğer hisselerin pozitif zekat matrahından **mahsup edilemez (düşülemez)**.

---

## KURAL 3: TEMİZ MİMARİ (CLEAN ARCHITECTURE) VE KATMAN İZOLASYONU

Kod tabanı 4 katmandan oluşur ve bağımlılık yönü kesinlikle **Dıştan İçe** doğrudur:
`Presentation (API/WS) -> Application (Use Cases) -> Domain (Pure Business Logic) <- Infrastructure (DB/Parsers)`

1. **`app/domain/` Saflık Kuralı:**
   - `domain/` klasörü altındaki hiçbir dosyada `fastapi`, `sqlalchemy`, `pydantic`, `httpx`, `celery`, `redis` veya `bs4` **import edilemez**.
   - Domain katmanı sadece standart Python kütüphanelerini (`decimal`, `datetime`, `enum`, `dataclasses`, `typing`, `abc`, `uuid`) kullanabilir.
2. **Repository Pattern Zorunluluğu:**
   - `application/` katmanındaki Use Case sınıfları doğrudan SQLAlchemy `AsyncSession` sorguları yazamaz; `domain/repositories/` altında tanımlanan soyut arayüzleri (`Protocol` / `ABC`) çağırır.
3. **Sihirli Sayı (Magic Number) Yasağı:**
   - Kod içinde `Decimal("0.33")`, `Decimal("0.30")`, `Decimal("0.05")` gibi eşik değerler sabit (hardcoded) olarak if-else bloklarına gömülemez. Tüm eşikler `ScreeningStandard` varlığından (Entity) parametrik olarak okunmalıdır.

---

## KURAL 4: MODÜL D — HELAL HAVUZ GÜVENLİK KAPISI (HALAL GATEKEEPER)

Price Action ve Smart Money Concepts (SMC: FVG, BOS, CHoCH, Liquidity Sweep, Order Block) tarayıcısı geliştirilirken şu kurallar mutlaktır:

1. **Zorunlu Uygunluk Kanıtı (`screening_result_id`):**
   - `smc_signals` tablosuna yazılan her kaydın geçerli bir `screening_result_id` Foreign Key referansı olmak zorundadır.
   - Sadece `overall_status IN ('COMPLIANT', 'GRACE_PERIOD_TOLERANCE')` olan şirketler `HalalUniverseSMCScanner` boru hattına (pipeline) girebilir.
2. **Mum Gövdesi vs. Fitil Ayrımı:**
   - `BOS` (Break of Structure) ve `CHoCH` (Change of Character) sinyallerinde kırılım şartı mum kapanışıdır (`Close > Swing_High` veya `Close < Swing_Low`).
   - Sadece fitil (`High` veya `Low`) ile yapılan geçişler yapı kırılımı değil, `LIQUIDITY_SWEEP` olarak sınıflandırılmalıdır.

---

## KURAL 5: MODEL ROL DAĞILIMI VE DOĞRULAMA PROTOKOLÜ

1. **`TODO.md` Görev Etiketlerine Sadakat:**
   - `[MODEL: FLASH]` olarak işaretlenen altyapı, CRUD ve UI iskeleti görevlerinde hız ve şema uyumu esas alınır; ancak `Decimal` ve katman kurallarından taviz verilmez.
   - `[MODEL: ARGON]` olarak işaretlenen finansal motor, dipnot denklik doğrulaması, FIFO lot eşleştirme ve SMC algoritma görevlerinde tüm uç durumlar (`EC-01` .. `EC-08`) matematiksel olarak kanıtlanmalı ve birim testleriyle birlikte teslim edilmelidir.
2. **Test ve Tip Denetimi Zorunluluğu:**
   - Her modül tamamlandığında `ARCHITECTURE.md` Bölüm 4.6'daki ilgili uç durum (Edge-Case) testleri yazılmış olmalıdır.
   - Python kodlarında tam tip anotasyonu (`type hints`) ve TypeScript kodlarında `strict: true` (`any` kullanımı yasaktır) zorunludur.
