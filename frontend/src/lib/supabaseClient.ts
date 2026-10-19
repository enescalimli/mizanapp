import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ==============================================================================
// 1. Ortam Değişkenleri & Güvenli İstemci Başlatma (Safe Build-Time Fallback)
// ==============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mizanapp-fallback.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy-anon-key-for-build";

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project") && !url.includes("fallback"));
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ==============================================================================
// 2. TypeScript Veritabanı Tipleri (Strict Decimal / Numeric Uyumu)
// ==============================================================================
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  preferred_standard: "BIST_KATILIM_DIB" | "AAOIFI_STD_21";
  purification_ceiling_rounding: boolean;
  zakat_calculation_preference: "AUTO" | "TRADING_ONLY" | "DIVIDEND_ONLY";
  alert_notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  currency: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioHolding {
  id: string;
  portfolio_id: string;
  user_id: string;
  ticker: string;
  lots: string; // Numeric string (Zero-float)
  avg_cost_try: string; // Numeric string (Zero-float)
  purchase_date: string; // YYYY-MM-DD
  zakat_intent: "TRADING_SHORT_TERM" | "LONG_TERM_DIVIDEND";
  purification_method: "HOLDING_PRORATA" | "DIVIDEND_BASED";
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StockData {
  ticker: string;
  company_name: string;
  sector: string;
  sub_sector: string | null;
  is_bist_katilim_compliant: boolean;
  is_aaoifi_compliant: boolean;
  compliance_status: "COMPLIANT" | "AT_RISK" | "NON_COMPLIANT" | "IN_GRACE_PERIOD";
  last_price_try: string;
  change_24h_percent: number;
  market_cap_try: string;
  debt_ratio_percent: number;
  cash_ratio_percent: number;
  impure_income_percent: number;
  purification_per_share_try: string;
  zatable_net_assets_per_share_try: string;
  total_shares_outstanding: string;
  quarter_impure_income_try: string;
  last_screening_date: string;
  fiscal_period: string;
  historical_sparkline?: number[];
  compliance_reasons?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface IpoCalendarItem {
  id: string;
  company_name: string;
  ticker: string;
  ipo_date_range: string;
  ipo_start_date: string | null;
  ipo_end_date: string | null;
  ipo_price_try: string;
  total_shares_offered: string;
  issue_size_try: string;
  distribution_method: string;
  lead_consortium: string | null;
  katilim_status: "COMPLIANT" | "NON_COMPLIANT" | "EVALUATING" | "COMPLIANT_WITH_PURIFICATION";
  is_bist_katilim_suitable: boolean;
  prospectus_shariah_decision: string | null;
  fund_usage_shariah_compliant: boolean;
  interest_debt_ratio_percent: number | null;
  impure_income_ratio_percent: number | null;
  prospectus_url: string | null;
  created_at?: string;
  updated_at?: string;
}

// ==============================================================================
// 3. Supabase Auth Servis Yardımcıları
// ==============================================================================
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split("@")[0],
      },
    },
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// ==============================================================================
// 4. Veritabanı Okuma & Yazma Yardımcıları
// ==============================================================================
export async function fetchStocksDataFromSupabase(): Promise<{ data: StockData[] | null; error: any }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("SUPABASE_NOT_CONFIGURED") };
  }
  const { data, error } = await supabase
    .from("stocks_data")
    .select("*")
    .order("ticker", { ascending: true });
  return { data: data as StockData[], error };
}

export async function fetchIpoCalendarFromSupabase(): Promise<{ data: IpoCalendarItem[] | null; error: any }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("SUPABASE_NOT_CONFIGURED") };
  }
  const { data, error } = await supabase
    .from("ipo_calendar")
    .select("*")
    .order("ipo_start_date", { ascending: false });
  return { data: data as IpoCalendarItem[], error };
}

export async function fetchUserPortfolios(userId: string): Promise<{ data: Portfolio[] | null; error: any }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("SUPABASE_NOT_CONFIGURED") };
  }
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return { data: data as Portfolio[], error };
}

export async function fetchPortfolioHoldings(portfolioId: string): Promise<{ data: PortfolioHolding[] | null; error: any }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("SUPABASE_NOT_CONFIGURED") };
  }
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: true });
  return { data: data as PortfolioHolding[], error };
}
