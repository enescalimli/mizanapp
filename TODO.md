# KATILIM FİNANSMANI PLATFORMU — 4 FAZLI GELİŞTİRME YOL HARİTASI (`TODO.md`)

> [!IMPORTANT]
> **MODEL GÖREVLENDİRME PROTOKOLÜ:**
> Bu yol haritasındaki her görev, bilişsel karmaşıklık ve finansal hata toleransına göre iki model sınıfından birine atanmıştır:
> - **`[MODEL: FLASH]` (Gemini 3.8 Flash):** Boilerplate kurulumlar, CRUD endpoint'leri, veritabanı tabloları/migration dosyaları, temel UI bileşenleri ve standart şema tanımları.
> - **`[MODEL: ARGON]` (Gemini 4 Argon):** Katılım uygunluk matematiksel motoru, KAP/PDF dipnot ayrıştırma ve muhasebe denklik algoritmaları, FIFO arındırma/zekat hesaplamaları, SMC/Price Action durum makineleri ve uç durum (edge-case) doğrulamaları.

---

## FAZ 1: TEMEL ALTYAPI, VERİTABANI ŞEMASI VE SIFIR-FLOAT ÇEKİRDEĞİ
**Hedef:** Monorepo iskeletinin kurulması, PostgreSQL + TimescaleDB veritabanı şemasının `NUMERIC` hassasiyetiyle ayağa kaldırılması ve `Decimal` tabanlı çekirdek değer nesnelerinin (Value Objects) inşası.

### 1.1. Proje İskeleti ve Konteyner Altyapısı
- [x] **[MODEL: FLASH]** Monorepo klasör ağacının (`backend/`, `frontend/`, `docker/`, `docs/`) `ARCHITECTURE.md` spesifikasyonuna birebir uygun olarak oluşturulması.
- [x] **[MODEL: FLASH]** `docker-compose.yml` dosyasının hazırlanması (PostgreSQL 16 + TimescaleDB imajı, Redis 7, FastAPI backend ve Next.js 15 servis tanımları).
- [x] **[MODEL: FLASH]** Backend `pyproject.toml`, `.env.example`, `app/core/config.py` (Pydantic Settings) ve asenkron veritabanı bağlantı katmanının (`app/infrastructure/database/session.py`) kodlanması.

### 1.2. Finansal Hassasiyet Çekirdeği (Zero-Float Value Objects)
- [x] **[MODEL: ARGON]** `app/core/decimal_utils.py` ve `app/domain/value_objects/` altında `Money`, `Ratio`, `BasisPoints`, `ShareQuantity` ve `FiscalPeriod` değer nesnelerinin geliştirilmesi:
  - `float` tipinde girdi geldiğinde `TypeError` fırlatan katı doğrulayıcılar (`StrictDecimalValidator`).
  - İhtiyatlılık yuvarlama modları (`ROUND_HALF_UP` ve arındırma için `ROUND_CEILING`).
- [x] **[MODEL: FLASH]** Pydantic v2 özel serileştiricilerinin (`StringifiedDecimal`) yazılması; tüm API JSON çıktılarında parasal ve oransal değerlerin `"1234.5600"` formatında string olarak dönmesinin garanti altına alınması.

### 1.3. Veritabanı Modelleri ve Alembic Göçleri (Migrations)
- [x] **[MODEL: FLASH]** `app/infrastructure/database/models.py` içinde `companies`, `screening_standards`, `company_sector_assessments`, `portfolios`, `portfolio_transactions`, `dividend_distributions` ORM modellerinin `NUMERIC(24,4)` ve `NUMERIC(12,8)` tipleriyle tanımlanması.
- [x] **[MODEL: ARGON]** `financial_statements`, `financial_statement_footnotes`, `market_valuations` (TimescaleDB Hypertable), `screening_results`, `ohlcv_candles` ve `smc_signals` tablolarının ilişkisel bütünlük kısıtları (`CHECK`, `UNIQUE`, kısmi indeksler) ve TimescaleDB bölümleme (chunking) ayarlarıyla modellenmesi.
- [x] **[MODEL: FLASH]** İlk Alembic migration dosyasının üretilmesi ve başlangıç tohum verilerinin (`seed_standards.py`: `BIST_KATILIM_DIB` ve `AAOIFI_STD_21` standart parametrelerinin) veritabanına yazılması.

---

## FAZ 2: MODÜL A (TARAMA MOTORU) & MODÜL B (KAP/PDF DİPNOT AYRIŞTIRMA MOTORU)
**Hedef:** Bilanço ve dipnotların okunması, muhasebe denkliğinin doğrulanması, kümülatif gelir tablolarının tekil çeyreklere ayrıştırılması ve BIST Katılım / AAOIFI standartlarına göre tarama motorunun tamamlanması.

### 2.1. Modül B: Dipnot Ayrıştırma, Muhasebe Denkliği ve Çeyrek İzolasyonu
- [x] **[MODEL: ARGON]** `app/domain/financial_parser/identity_validator.py` modülünün geliştirilmesi:
  - Ana bilançodaki `Nakit ve Nakit Benzerleri`, `Finansal Yatırımlar` ve `Finansal Borçlar` toplamlarının dipnot alt kırılımlarıyla kuruşu kuruşuna (`Decimal('0.0000')`) denkliğinin kontrolü.
  - Açıklanmayan pozitif farkların **İhtiyatlılık İlkesi (Prudence Principle)** gereği otomatik olarak faizli/uygunsuz sepete (`other_cash_unclassified`) aktarılması ve `used_conservative_fallback = True` işaretlenmesi.
- [x] **[MODEL: ARGON]** `app/domain/financial_parser/quarter_isolator.py` modülünün geliştirilmesi:
  - KAP kümülatif gelir tablolarından (Q1=3A, Q2=6A, Q3=9A, Q4=12A) tekil çeyrek (`isolated_quarter`) ve son 12 aylık (`TTM`) hasılat, faiz geliri ve uygunsuz yan faaliyet gelirlerinin ayrıştırılması.
  - TMS 29 enflasyon muhasebesi revizyonları ve kur farkı geri dönüşleri (`EC-07`) için negatif çeyrek korumasının kodlanması.
- [x] **[MODEL: ARGON]** `app/infrastructure/parsers/kap_xbrl_parser.py` ve `pdf_footnote_extractor.py` adaptörlerinin geliştirilmesi:
  - KAP HTML/XBRL tablolarından ana bilanço kalemlerinin çekilmesi.
  - PDF dipnotlarından vadeli/vadesiz mevduat, katılım hesabı, sukuk, ters repo ve katılım bankası kredilerinin yapılandırılmış olarak (`llm_footnote_structurer.py` + deterministik regex/tablo doğrulayıcı ile) çıkarılması.

### 2.2. Modül A: Çoklu Standart Katılım Uygunluk Motoru
- [x] **[MODEL: FLASH]** `app/domain/screening/sector_filter.py` modülünün geliştirilmesi (Faizli finans, sigorta, alkol, tütün, kumar, domuz ürünleri, eğlence ve parametrik silah/savunma sanayii filtreleri).
- [x] **[MODEL: ARGON]** `app/application/services/mcap_moving_average.py` servisinin geliştirilmesi:
  - Günlük kapanış fiyatı ve toplam pay sayısından `spot_market_cap` ile 12, 24 ve 36 aylık hareketli ortalama piyasa değerlerinin (`mcap_ma_12m`, `mcap_ma_24m`, `mcap_ma_36m`) hesaplanması.
- [x] **[MODEL: ARGON]** `app/domain/screening/ratio_calculator.py` ve `grace_period_fsm.py` modüllerinin geliştirilmesi:
  - `BIST_KATILIM_DIB` (`<%33`, `<%33`, `<%5`) ve `AAOIFI_STD_21` (`<%30`, `<%30`, `<%5`) oranlarının hesaplanması.
  - Piyasa değeri çöküşlerinde (`EC-01`) hareketli ortalama payda seçimi ve Tampon Bölge / Hoşgörü Süresi Durum Makinesi (`COMPLIANT` $\leftrightarrow$ `GRACE_PERIOD_TOLERANCE` $\leftrightarrow$ `NON_COMPLIANT`) geçişlerinin kodlanması.
  - Sıfır hasılatlı şirketler (`EC-06`) için `DivisionByZero` koruması.
- [x] **[MODEL: FLASH]** Şirket tarama sonuçlarını ve dipnot X-Ray kırılımlarını sunan REST endpoint'lerinin (`GET /api/v1/screening/{ticker}`, `GET /api/v1/screening/standards-comparison`) yazılması.
- [x] **[MODEL: ARGON]** Faz 2 Birim ve Uç Durum Testlerinin (`test_screening_engine.py`, `test_footnote_identity.py` — `EC-01`, `EC-02`, `EC-06`, `EC-07`) yazılması ve doğrulanması.

---

## FAZ 3: MODÜL C (ARINDIRMA VE ZEKAT MOTORU) & MODÜL D (KATILIM İÇİ SMC TARAYICI)
**Hedef:** Yatırımcı portföyleri için FIFO lot eşleştirmeli kuruşu kuruşuna arındırma, niyet bazlı hisse zekatı hesaplayıcısı ve sadece katılım uygun hisselerde çalışan SMC / Price Action tarayıcısının inşası.

### 3.1. Modül C: Kuruşu Kuruşuna Arındırma (Purification) ve Zekat Motoru
- [x] **[MODEL: ARGON]** `app/domain/purification_zakat/fifo_lot_matcher.py` algoritmasının geliştirilmesi:
  - Yatırımcının alım (`BUY`), satım (`SELL`) ve bedelsiz sermaye artırımı (`BONUS_ISSUE` / `EC-05`) işlemlerini FIFO (First-In, First-Out) kuyruğu ile eşleştirerek her bir bilanço çeyreği içinde her lot diliminin tam olarak kaç gün (`days_held_in_quarter`) elde tutulduğunun hesaplanması.
- [x] **[MODEL: ARGON]** `app/domain/purification_zakat/holding_purifier.py` ve `dividend_purifier.py` motorlarının geliştirilmesi:
  - Yöntem 1 (Hisse Başına / Dönem Bazlı): `(Toplam Uygunsuz Gelir / Toplam Pay Sayısı) * Lot * (Eldeki Gün / Dönem Günü)` formülünün çalıştırılması; zarar eden şirketlerde dahi (`EC-03`) pozitif uygunsuz gelirin arındırılması.
  - Yöntem 2 (Temettü Bazlı): `Dağıtılan Temettü * (Toplam Uygunsuz Gelir / Toplam Hasılat)` hesabının brüt ve net seçenekleriyle kodlanması.
- [x] **[MODEL: ARGON]** `app/domain/purification_zakat/zakat_calculator.py` motorunun geliştirilmesi:
  - `TRADING_SHORT_TERM` niyeti için tam piyasa değeri üzerinden `%2,5` (Hicri) / `%2,577` (Miladi) zekat hesabı.
  - `LONG_TERM_DIVIDEND` niyeti için şirketin `Zekata Tabi Net Dönen Varlıkları` (`Nakit + Kısa Vadeli Alacaklar + Stoklar - Kısa Vadeli Yükümlülükler`) üzerinden hisse başı zekat hesabı ve negatif net dönen varlık (`EC-04`) koruması (`max(0, A_zatable)`).
  - 85 gram altın nisap kontrolü ve detaylı JSON dökümü üretimi.
- [x] **[MODEL: FLASH]** Portföy işlemleri, arındırma raporları ve zekat hesaplama REST endpoint'lerinin (`POST /api/v1/portfolios/{id}/purification`, `POST /api/v1/portfolios/{id}/zakat`) oluşturulması.

### 3.2. Modül D: Katılım İçi Price Action / SMC Tarayıcısı
- [ ] **[MODEL: ARGON]** `app/domain/smc_scanner/halal_gatekeeper.py` güvenlik katmanının geliştirilmesi:
  - Tarama motoruna sadece seçili standartta `COMPLIANT` veya `GRACE_PERIOD_TOLERANCE` olan hisselerin girmesini sağlayan sorgu ve çalışma zamanı doğrulaması.
  - Yeni bilançoda uygunluktan çıkan hisselerin (`EC-08`) mevcut SMC sinyallerini otomatik olarak `ARCHIVED_DUE_TO_NON_COMPLIANCE` statüsüne çeken olay dinleyicisi (event handler).
- [ ] **[MODEL: ARGON]** `app/domain/smc_scanner/` altındaki `Decimal` tabanlı algoritmaların geliştirilmesi:
  - `swing_detector.py`: $L$-bar sağ/sol onaylı fraktal `Swing High` ve `Swing Low` tespiti.
  - `fvg_detector.py`: Bullish/Bearish **Fair Value Gap (FVG)** boşluklarının ATR filtreli tespiti ve kısmi/tam doldurulma (`Mitigation`) durum takibi.
  - `structure_analyzer.py`: Mum gövdesi (`Close`) kapanış onaylı **BOS (Break of Structure)** ve **CHoCH (Change of Character)** tespiti.
  - `liquidity_detector.py`: Eşit tepe/dip (**BSL/SSL Equal Highs & Lows**) havuzları ve fitil (wick) ile yapılan **Liquidity Sweep (SFP)** tespiti.
- [ ] **[MODEL: FLASH]** SMC tarama sonuçlarını filtreleyen REST endpoint'i (`GET /api/v1/scanner/signals`) ve anlık alarm üreten WebSocket kanalının (`app/presentation/websockets/alerts_ws.py`) kodlanması.
- [ ] **[MODEL: ARGON]** Faz 3 Birim ve Uç Durum Testlerinin (`test_purification_math.py`, `test_zakat_math.py`, `test_smc_algorithms.py` — `EC-03`, `EC-04`, `EC-05`, `EC-08`) yazılması.

---

## FAZ 4: FRONTEND (NEXT.JS 15), GÖRSELLEŞTİRME VE UÇTAN UCA ENTEGRASYON
**Hedef:** Kullanıcı arayüzünün `decimal.js` hassasiyetiyle geliştirilmesi, Dipnot X-Ray ekranlarının, Arındırma/Zekat sihirbazının ve TradingView Lightweight Charts tabanlı SMC grafiklerinin tamamlanması.

### 4.1. Frontend Altyapısı ve `decimal.js` Entegrasyonu
- [x] **[MODEL: FLASH]** Next.js 15 (App Router) + TypeScript (Strict) + Tailwind CSS + Lucide Icons kurulumunun yapılması (`mizanapp.tr` fintech tasarım dili, koyu lacivert / zümrüt yeşili `emerald-600` teması).
- [x] **[MODEL: ARGON]** `src/lib/decimal/decimal.ts` altında API'den gelen stringified `Decimal` verilerini `decimal.js` nesnelerine dönüştüren istemci sarmalayıcısının, Zero-Float para/yüzde formatlayıcılarının ve istemci arındırma hesaplayıcılarının yazılması.

### 4.2. Katılım Tarama, Şirket X-Ray ve Dipnot Doğrulama Ekranları
- [x] **[MODEL: FLASH]** Çoklu Standart Katılım Tarama ve Ana Sayfa (`src/app/page.tsx`): Hızlı hisse arama çubuğu (autocomplete), tek tıkla `BIST Katılım (DİB)` ve `AAOIFI` standartları arasında geçiş, Spot MCAP vs. 24 Aylık Ortalama MCAP ve sektör filtreleri.
- [x] **[MODEL: FLASH]** Şirket Detay ve **Bilanço Dipnot X-Ray** Sayfası (`src/app/companies/[ticker]/page.tsx`):
  - Borç (`<%33/%30`), Nakit (`<%33/%30`) ve Uygunsuz Gelir (`<%5`) görsel progress bar göstergeleri (`RatioProgressBar.tsx`) ve Tampon Bölge (Grace Period) rozetleri (`ComplianceBadge.tsx`).
  - Ana bilanço Nakit/Borç kalemlerinin dipnot alt kırılımlarını (Katılım Hesabı vs. Vadeli Mevduat, Sukuk vs. Tahvil) gösteren etkileşimli ağaç görünümü ve "Muhasebe Denkliği Doğrulandı (`Δ = 0.00 TL`)" mührü (`FootnoteXRayCard.tsx`).

### 4.3. Portföy Yönetim Paneli, Arındırma, Zekat, Katılımdan Çıkma Alarmları ve Akıllı Alternatif Motoru
- [x] **[MODEL: FLASH]** Kullanıcı Portföy Paneli (`src/app/portfolio/page.tsx`) & Analiz API'si (`src/app/api/portfolio/analyze/route.ts`):
  - Hisse kodu, lot adedi, alış maliyeti ve elde tutma süresiyle varlık ekleme/düzenleme, portföy genel uygunluk oranı (% Helal Ağırlık) ve kâr/zarar özet kartları.
- [x] **[MODEL: ARGON]** Portföy Bazlı Arındırma (`PurificationEngine`) ve Zekat Takip Modülü (`src/components/ZakatTrackerModule.tsx`):
  - Kuruşu kuruşuna (Zero-Float) lot ve gün bazlı Pro-Rata arındırma, temettü arındırması, `Al-Sat (Ticari %2,5)` vs. `Uzun Vadeli Temettü (Dönen Varlık %2,5 - EC-04 Korumalı)` zekat niyet seçimi, 85g altın nisap kontrolü ve Şer'i ihtiyat tavan yuvarlama (`ROUND_CEIL`).
- [x] **[MODEL: ARGON]** Katılımdan Çıkma Alarm Paneli (`src/components/ComplianceAlertWidget.tsx`) ve **"Yerine Hangi Hisse?" Akıllı Alternatif Modülü** (`src/components/SmartAlternativeCard.tsx`):
  - Bilanço döneminde `%33` (BIST) / `%30` (AAOIFI) borç/nakit veya `%5` uygunsuz gelir eşiğini aşarak uygunsuz duruma düşen hisseler için acil durum alarm kartı ve aynı sektörde faaliyet gösteren `%100 Katılım Uygun` alternatiflerle tek tıkla ikame (Swap) özelliği.
- [ ] **[MODEL: ARGON]** TradingView Lightweight Charts üzerinde özel **Katılım İçi SMC Grafik Katmanı** (`src/components/charts/HalalSMCChart.tsx`):
  - Grafik üzerinde Bullish/Bearish FVG kutularının (mitigation durumuna göre yarı saydam uzayan dikdörtgenler), BOS/CHoCH kırılım çizgilerinin ve BSL/SSL likidite havuzu seviyelerinin çizdirilmesi.
  - Grafiğin alt bandında şirketin tarihsel çeyreklik katılım uygunluk durumunun (`COMPLIANT` = Yeşil, `GRACE_PERIOD` = Kehribar, `NON_COMPLIANT` = Kırmızı) zaman serisi şeridi olarak gösterilmesi.
- [ ] **[MODEL: FLASH]** Katılım İçi SMC Radar Sayfası (`src/app/(dashboard)/scanner/page.tsx`) ve canlı WebSocket bildirim bileşeninin entegrasyonu.
- [ ] **[MODEL: ARGON]** Tüm sistemin uçtan uca entegrasyon testlerinin, performans/yük testlerinin ve finansal denetim (Audit Trail) doğrulamalarının tamamlanması.
