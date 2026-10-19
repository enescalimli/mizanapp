-- ==============================================================================
-- MizanApp.tr - Katılım Finansmanı & Piyasa Takip Platformu
-- Supabase (PostgreSQL 16) Veritabanı Şeması
-- 
-- Tablolar:
-- 1. profiles            : Kullanıcı profil ve şer'i tercih ayarları (auth.users bağlantılı)
-- 2. portfolios          : Kullanıcı portföy başlıkları ve meta verileri
-- 3. portfolio_holdings  : Portföydeki hisse pozisyonları (lot, maliyet, tarih, zekat niyeti)
-- 4. stocks_data         : BIST Katılım & AAOIFI şirket verileri, rasyolar ve arındırma oranları
-- 5. ipo_calendar        : Halka Arz Takvimi (Katılım İzahname ve Fon Kullanım Uygunluğu)
--
-- Finansal Kural: Kayan nokta (float) kesinlikle kullanılmamıştır. Tüm tutar ve
-- oran alanları NUMERIC veri tipleriyle kuruşu kuruşuna modellenmiştir.
-- ==============================================================================

-- Gerekli eklentiler
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLO: profiles
-- Supabase Auth (auth.users) tablosu ile 1:1 ilişkili kullanıcı profili.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    preferred_standard VARCHAR(32) NOT NULL DEFAULT 'BIST_KATILIM_DIB' 
        CHECK (preferred_standard IN ('BIST_KATILIM_DIB', 'AAOIFI_STD_21')),
    purification_ceiling_rounding BOOLEAN NOT NULL DEFAULT TRUE, -- İhtiyatlılık için ROUND_CEIL
    zakat_calculation_preference VARCHAR(32) NOT NULL DEFAULT 'AUTO' 
        CHECK (zakat_calculation_preference IN ('AUTO', 'TRADING_ONLY', 'DIVIDEND_ONLY')),
    alert_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles İndeksleri
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- 2. TABLO: portfolios
-- Kullanıcının oluşturduğu portföyler (Birden fazla portföy desteklenir).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Ana Portföy',
    description TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'TRY',
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolios İndeksleri
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);

-- ==============================================================================
-- 2.1 TABLO: portfolio_holdings
-- Portföydeki tekil hisse varlıkları (Kuruş bazlı alış maliyeti ve alış tarihi).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticker VARCHAR(16) NOT NULL,
    lots NUMERIC(18, 4) NOT NULL CHECK (lots > 0),
    avg_cost_try NUMERIC(18, 4) NOT NULL CHECK (avg_cost_try >= 0),
    purchase_date DATE NOT NULL,
    zakat_intent VARCHAR(32) NOT NULL DEFAULT 'LONG_TERM_DIVIDEND' 
        CHECK (zakat_intent IN ('TRADING_SHORT_TERM', 'LONG_TERM_DIVIDEND')),
    purification_method VARCHAR(32) NOT NULL DEFAULT 'HOLDING_PRORATA' 
        CHECK (purification_method IN ('HOLDING_PRORATA', 'DIVIDEND_BASED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio Holdings İndeksleri
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON public.portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON public.portfolio_holdings(ticker);

-- ==============================================================================
-- 3. TABLO: stocks_data
-- BIST hisselerinin katılım uygunluk rasyoları, canlı fiyatları ve arındırma verileri.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stocks_data (
    ticker VARCHAR(16) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    sub_sector VARCHAR(100),
    is_bist_katilim_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    is_aaoifi_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_status VARCHAR(32) NOT NULL DEFAULT 'COMPLIANT' 
        CHECK (compliance_status IN ('COMPLIANT', 'AT_RISK', 'NON_COMPLIANT', 'IN_GRACE_PERIOD')),
    last_price_try NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (last_price_try >= 0),
    change_24h_percent NUMERIC(8, 4) NOT NULL DEFAULT 0,
    market_cap_try NUMERIC(24, 2) NOT NULL DEFAULT 0,
    debt_ratio_percent NUMERIC(8, 4) NOT NULL DEFAULT 0, -- Faizli Borç / Piyasa Değeri
    cash_ratio_percent NUMERIC(8, 4) NOT NULL DEFAULT 0, -- Faizli Nakit / Piyasa Değeri
    impure_income_percent NUMERIC(8, 4) NOT NULL DEFAULT 0, -- Uygun Olmayan Gelir / Hasılat
    purification_per_share_try NUMERIC(18, 6) NOT NULL DEFAULT 0, -- Pay başına arındırma bedeli
    zatable_net_assets_per_share_try NUMERIC(18, 4) NOT NULL DEFAULT 0, -- Pay başına zekata tabi varlık
    total_shares_outstanding NUMERIC(24, 0) NOT NULL DEFAULT 0,
    quarter_impure_income_try NUMERIC(20, 2) NOT NULL DEFAULT 0,
    last_screening_date DATE NOT NULL DEFAULT CURRENT_DATE,
    fiscal_period VARCHAR(16) NOT NULL DEFAULT '2026-Q2',
    historical_sparkline JSONB DEFAULT '[]'::jsonb,
    compliance_reasons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stocks Data İndeksleri
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON public.stocks_data(sector);
CREATE INDEX IF NOT EXISTS idx_stocks_compliance_status ON public.stocks_data(compliance_status);
CREATE INDEX IF NOT EXISTS idx_stocks_bist_compliant ON public.stocks_data(is_bist_katilim_compliant);

-- ==============================================================================
-- 4. TABLO: ipo_calendar (Halka Arz Takvimi)
-- BIST Halka Arzlarının Katılım Finans İlkelerine ve İzahname Şer'i Şartlarına Uygunluğu.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ipo_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    ticker VARCHAR(16) NOT NULL,
    ipo_date_range VARCHAR(64) NOT NULL,
    ipo_start_date DATE,
    ipo_end_date DATE,
    ipo_price_try NUMERIC(18, 4) NOT NULL CHECK (ipo_price_try > 0),
    total_shares_offered NUMERIC(20, 0) NOT NULL CHECK (total_shares_offered > 0),
    issue_size_try NUMERIC(24, 2) NOT NULL CHECK (issue_size_try > 0),
    distribution_method VARCHAR(64) NOT NULL DEFAULT 'EŞİT DAĞITIM',
    lead_consortium VARCHAR(255),
    katilim_status VARCHAR(32) NOT NULL DEFAULT 'COMPLIANT' 
        CHECK (katilim_status IN ('COMPLIANT', 'NON_COMPLIANT', 'EVALUATING', 'COMPLIANT_WITH_PURIFICATION')),
    is_bist_katilim_suitable BOOLEAN NOT NULL DEFAULT TRUE,
    prospectus_shariah_decision TEXT, -- İzahname Katılım Finans İlkeleri Raporu Özeti
    fund_usage_shariah_compliant BOOLEAN NOT NULL DEFAULT TRUE, -- Halka arz fonunun kullanım amacı caiz mi?
    interest_debt_ratio_percent NUMERIC(8, 4),
    impure_income_ratio_percent NUMERIC(8, 4),
    prospectus_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IPO Calendar İndeksleri
CREATE INDEX IF NOT EXISTS idx_ipo_ticker ON public.ipo_calendar(ticker);
CREATE INDEX IF NOT EXISTS idx_ipo_katilim_status ON public.ipo_calendar(katilim_status);
CREATE INDEX IF NOT EXISTS idx_ipo_start_date ON public.ipo_calendar(ipo_start_date);

-- ==============================================================================
-- GÜNCELLEME ZAMAN DAMGASI TETİKLEYİCİSİ (Auto-Updated At Trigger)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_portfolios_updated_at ON public.portfolios;
CREATE TRIGGER trg_portfolios_updated_at
    BEFORE UPDATE ON public.portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_portfolio_holdings_updated_at ON public.portfolio_holdings;
CREATE TRIGGER trg_portfolio_holdings_updated_at
    BEFORE UPDATE ON public.portfolio_holdings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_stocks_data_updated_at ON public.stocks_data;
CREATE TRIGGER trg_stocks_data_updated_at
    BEFORE UPDATE ON public.stocks_data
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_ipo_calendar_updated_at ON public.ipo_calendar;
CREATE TRIGGER trg_ipo_calendar_updated_at
    BEFORE UPDATE ON public.ipo_calendar
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ==============================================================================
-- KULLANICI KAYDI OTOMATİK PROFİL OLUŞTURMA TETİKLEYİCİSİ (Supabase Auth Trigger)
-- auth.users tablosuna yeni kullanıcı eklendiğinde profiles tablosuna satır ekler.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_portfolio_id UUID;
BEGIN
    -- 1. Kullanıcı Profili Oluştur
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        preferred_standard
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'BIST_KATILIM_DIB'
    );

    -- 2. Otomatik İlk Portföy ("Ana Portföy") Oluştur
    INSERT INTO public.portfolios (
        user_id,
        name,
        currency,
        is_default
    ) VALUES (
        NEW.id,
        'Ana Portföy',
        'TRY',
        TRUE
    ) RETURNING id INTO new_portfolio_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- Kullanıcıların yalnızca kendi portföy ve profil verilerine erişmesini garanti eder.
-- ==============================================================================

-- 1. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Portfolios RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi portföylerini görebilir"
    ON public.portfolios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar yeni portföy oluşturabilir"
    ON public.portfolios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi portföylerini güncelleyebilir"
    ON public.portfolios FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi portföylerini silebilir"
    ON public.portfolios FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Portfolio Holdings RLS
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi pozisyonlarını görebilir"
    ON public.portfolio_holdings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar portföylerine hisse ekleyebilir"
    ON public.portfolio_holdings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar hisse pozisyonlarını güncelleyebilir"
    ON public.portfolio_holdings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar hisse pozisyonlarını silebilir"
    ON public.portfolio_holdings FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Stocks Data RLS (Genel okuma serbest, yazma sadece yetkili servis)
ALTER TABLE public.stocks_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hisse verileri herkese açıktır"
    ON public.stocks_data FOR SELECT
    USING (TRUE);

-- 5. IPO Calendar RLS (Genel okuma serbest)
ALTER TABLE public.ipo_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Halka arz takvimi herkese açıktır"
    ON public.ipo_calendar FOR SELECT
    USING (TRUE);

-- ==============================================================================
-- BAŞLANGIÇ VERİLERİ (SEED DATA)
-- Platform kurulduğunda hemen görüntülenebilecek zengin şirket ve halka arz verisi.
-- ==============================================================================

-- 1. Stocks Data Seed (BIST Katılım & AAOIFI Veritabanı)
INSERT INTO public.stocks_data (
    ticker, company_name, sector, is_bist_katilim_compliant, is_aaoifi_compliant, 
    compliance_status, last_price_try, change_24h_percent, market_cap_try, 
    debt_ratio_percent, cash_ratio_percent, impure_income_percent, 
    purification_per_share_try, zatable_net_assets_per_share_try, 
    total_shares_outstanding, quarter_impure_income_try, fiscal_period, historical_sparkline
) VALUES
('BIMAS', 'BİM Birleşik Mağazalar A.Ş.', 'Perakende Ticaret', TRUE, TRUE, 'COMPLIANT', 482.50, 0.42, 292877500000.00, 14.80, 11.20, 1.45, 0.084200, 48.50, 607200000, 51126240.00, '2026-Q2', '[478.0, 479.5, 481.0, 480.0, 482.5]'::jsonb),
('ASELS', 'Aselsan Elektronik San. ve Tic. A.Ş.', 'Savunma & Teknoloji', TRUE, TRUE, 'COMPLIANT', 68.40, -0.29, 311904000000.00, 22.10, 16.50, 2.10, 0.024500, 18.20, 4560000000, 111720000.00, '2026-Q2', '[68.9, 68.5, 68.0, 68.2, 68.4]'::jsonb),
('THYAO', 'Türk Hava Yolları A.O.', 'Havacılık & Ulaştırma', FALSE, FALSE, 'NON_COMPLIANT', 312.00, 1.15, 430560000000.00, 36.80, 14.20, 4.20, 0.285000, 110.00, 1380000000, 393300000.00, '2026-Q2', '[308.0, 309.5, 310.0, 311.5, 312.0]'::jsonb),
('PGSUS', 'Pegasus Hava Taşımacılığı A.Ş.', 'Havacılık & Ulaştırma', TRUE, FALSE, 'AT_RISK', 234.50, -0.64, 117250000000.00, 31.40, 18.50, 3.80, 0.142000, 42.00, 500000000, 71000000.00, '2026-Q2', '[236.0, 235.0, 234.0, 235.5, 234.5]'::jsonb),
('TOASO', 'Tofaş Türk Otomobil Fabrikası A.Ş.', 'Otomotiv', TRUE, TRUE, 'COMPLIANT', 214.00, 0.94, 107000000000.00, 18.50, 12.30, 1.80, 0.061000, 36.50, 500000000, 30500000.00, '2026-Q2', '[211.0, 212.5, 213.0, 212.0, 214.0]'::jsonb),
('FROTO', 'Ford Otomotiv Sanayi A.Ş.', 'Otomotiv', TRUE, TRUE, 'COMPLIANT', 985.00, 0.20, 345646350000.00, 20.40, 10.80, 1.65, 0.210000, 125.00, 350910000, 73691100.00, '2026-Q2', '[980.0, 982.0, 984.0, 983.0, 985.0]'::jsonb),
('TUPRS', 'Tüpraş Türkiye Petrol Rafinerileri A.Ş.', 'Enerji & Petrol', TRUE, TRUE, 'COMPLIANT', 174.50, 0.58, 336262445000.00, 16.20, 15.40, 2.30, 0.048000, 52.00, 1926982000, 92495136.00, '2026-Q2', '[173.0, 173.5, 174.0, 173.8, 174.5]'::jsonb),
('EREGL', 'Ereğli Demir ve Çelik Fabrikaları T.A.Ş.', 'Demir Çelik & Metal', TRUE, TRUE, 'COMPLIANT', 52.80, -0.38, 184800000000.00, 24.50, 9.80, 1.95, 0.018000, 22.00, 3500000000, 63000000.00, '2026-Q2', '[53.2, 53.0, 52.6, 52.9, 52.8]'::jsonb),
('SISE', 'Türkiye Şişe ve Cam Fabrikaları A.Ş.', 'Cam & Kimya', TRUE, TRUE, 'COMPLIANT', 46.20, -0.86, 141445020000.00, 28.20, 14.60, 2.80, 0.021000, 19.50, 3061688000, 64295448.00, '2026-Q2', '[46.8, 46.5, 46.0, 46.4, 46.2]'::jsonb),
('ALARK', 'Alarko Holding A.Ş.', 'Holding & Enerji', TRUE, TRUE, 'COMPLIANT', 106.40, 1.33, 46284000000.00, 12.40, 19.80, 1.10, 0.032000, 44.00, 435000000, 13920000.00, '2026-Q2', '[104.5, 105.0, 105.8, 106.0, 106.4]'::jsonb),
('BERA', 'Bera Holding A.Ş.', 'Holding & Üretim', TRUE, TRUE, 'COMPLIANT', 24.80, 0.81, 16900000000.00, 8.50, 7.20, 0.90, 0.006500, 12.80, 681600000, 4430400.00, '2026-Q2', '[24.5, 24.6, 24.7, 24.6, 24.8]'::jsonb),
('MAVI', 'Mavi Giyim Sanayi ve Ticaret A.Ş.', 'Tekstil & Perakende', TRUE, TRUE, 'COMPLIANT', 94.75, -0.26, 18817350000.00, 15.60, 12.90, 1.25, 0.028000, 26.00, 198600000, 5560800.00, '2026-Q2', '[95.5, 95.0, 94.8, 95.0, 94.75]'::jsonb),
('ALBRK', 'Albaraka Türk Katılım Bankası A.Ş.', 'Katılım Bankacılığı', TRUE, TRUE, 'COMPLIANT', 6.42, 0.63, 16050000000.00, 0.00, 0.00, 0.50, 0.001200, 4.80, 2500000000, 3000000.00, '2026-Q2', '[6.35, 6.38, 6.40, 6.39, 6.42]'::jsonb)
ON CONFLICT (ticker) DO UPDATE SET
    last_price_try = EXCLUDED.last_price_try,
    change_24h_percent = EXCLUDED.change_24h_percent,
    debt_ratio_percent = EXCLUDED.debt_ratio_percent,
    cash_ratio_percent = EXCLUDED.cash_ratio_percent,
    impure_income_percent = EXCLUDED.impure_income_percent,
    compliance_status = EXCLUDED.compliance_status,
    updated_at = NOW();

-- 2. IPO Calendar Seed (Örnek Halka Arzlar ve Şer'i Değerlendirme Sonuçları)
INSERT INTO public.ipo_calendar (
    company_name, ticker, ipo_date_range, ipo_start_date, ipo_end_date, 
    ipo_price_try, total_shares_offered, issue_size_try, distribution_method, 
    lead_consortium, katilim_status, is_bist_katilim_suitable, 
    prospectus_shariah_decision, fund_usage_shariah_compliant, 
    interest_debt_ratio_percent, impure_income_ratio_percent, prospectus_url
) VALUES
(
    'Mizan Yenilenebilir Enerji A.Ş.', 'MIZAN', '22-24 Ekim 2026', '2026-10-22', '2026-10-24',
    42.50, 45000000, 1912500000.00, 'EŞİT DAĞITIM', 'Vakıf Yatırım Menkul Değerler',
    'COMPLIANT', TRUE,
    'İzahnamenin 2.4 ve 8.1 maddeleri incelenmiş olup, şirketin faaliyet alanı güneş ve rüzgar enerjisi santralleri yatırımıdır. Faizli borç oranı %14.2 olup TKBB ve BIST Katılım kriterlerine (%33) tam uygundur.',
    TRUE, 14.20, 0.85, 'https://kap.gov.tr/mizan-izahname'
),
(
    'Anadolu Katılım Lojistik A.Ş.', 'AKLOG', '28-30 Ekim 2026', '2026-10-28', '2026-10-30',
    28.00, 60000000, 1680000000.00, 'EŞİT DAĞITIM', 'Halk Yatırım Menkul Değerler',
    'COMPLIANT', TRUE,
    'Şirket uluslararası kara ve demiryolu taşımacılığı yapmaktadır. Halka arzdan elde edilecek net gelirin %80''i elektrikli çekici filosu alımında kullanılacaktır. Faizli kredi kapama payı sınır içindedir.',
    TRUE, 19.80, 1.40, 'https://kap.gov.tr/aklog-izahname'
),
(
    'Neo Finans Faktoring A.Ş.', 'NEOFA', '5-7 Kasım 2026', '2026-11-05', '2026-11-07',
    18.50, 30000000, 555000000.00, 'ORANSAL DAĞITIM', 'Garanti BBVA Yatırım',
    'NON_COMPLIANT', FALSE,
    'Ana faaliyet konusu geleneksel faktoring ve iskonto/faizli alacak temliki olduğundan TKBB ve AAOIFI standartlarına göre katılım endeksine UYGUN DEĞİLDİR.',
    FALSE, 84.50, 92.00, 'https://kap.gov.tr/neofa-izahname'
),
(
    'Bereket Tarım ve Gıda Sanayi A.Ş.', 'BERKT', '12-14 Kasım 2026', '2026-11-12', '2026-11-14',
    34.70, 25000000, 867500000.00, 'EŞİT DAĞITIM', 'Ziraat Yatırım',
    'COMPLIANT_WITH_PURIFICATION', TRUE,
    'Sera ve organik tarım faaliyeti yürütmektedir. Faizli borç oranı %24.6, faizli nakit oranı %12.1 ile eşik altındadır. Vadeli mevduattan elde edilen %1.85 faiz geliri için pay başına 0.042 ₺ arındırma şartı bulunmaktadır.',
    TRUE, 24.60, 1.85, 'https://kap.gov.tr/berkt-izahname'
)
ON CONFLICT (id) DO NOTHING;
