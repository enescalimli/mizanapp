-- ==============================================================================
-- Mizan Katılım - Bulut Portföy Senkronizasyonu Tabloları
-- Supabase Dashboard -> SQL Editor alanına yapıştırıp "Run" butonuna basın.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLOSU
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    preferred_standard VARCHAR(32) NOT NULL DEFAULT 'BIST_KATILIM_DIB',
    purification_ceiling_rounding BOOLEAN NOT NULL DEFAULT TRUE,
    zakat_calculation_preference VARCHAR(32) NOT NULL DEFAULT 'AUTO',
    alert_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. PORTFOLIOS TABLOSU
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Ana Portföy',
    description TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'TRY',
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);

-- 3. PORTFOLIO HOLDINGS TABLOSU (Hisse Pozisyonları)
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ticker VARCHAR(16) NOT NULL,
    lots NUMERIC(18, 4) NOT NULL CHECK (lots > 0),
    avg_cost_try NUMERIC(18, 4) NOT NULL CHECK (avg_cost_try >= 0),
    purchase_date DATE NOT NULL,
    zakat_intent VARCHAR(32) NOT NULL DEFAULT 'LONG_TERM_DIVIDEND',
    purification_method VARCHAR(32) NOT NULL DEFAULT 'HOLDING_PRORATA',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON public.portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON public.portfolio_holdings(ticker);

-- RLS (Row Level Security) - Güvenlik Politikaları
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Okuma ve yazma politikaları (Herkese açık / API anahtarı ile erişilebilir)
DROP POLICY IF EXISTS "Public access to profiles" ON public.profiles;
CREATE POLICY "Public access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to portfolios" ON public.portfolios;
CREATE POLICY "Public access to portfolios" ON public.portfolios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to portfolio_holdings" ON public.portfolio_holdings;
CREATE POLICY "Public access to portfolio_holdings" ON public.portfolio_holdings FOR ALL USING (true) WITH CHECK (true);
