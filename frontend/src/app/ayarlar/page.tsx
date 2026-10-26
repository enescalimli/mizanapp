"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Scale,
  Bell,
  SlidersHorizontal,
  CheckCircle2,
  Check,
  Lock,
  Download,
  Trash2,
  Save,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Coins,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  CreditCard,
  Building2,
} from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";
import { ChurnSurveyModal } from "@/components/ChurnSurveyModal";
import { useAuth } from "@/lib/auth/AuthContext";

type SettingsTab = "PROFIL" | "BILDIRIM" | "GIZLILIK";

interface UserSettingsState {
  fullName: string;
  email: string;
  phone: string;
  investorLevel: "BASLANGIC" | "ORTA" | "ILERI";
  // Fıkıh
  standard: "BIST" | "TKBB";
  useCeilingRounding: boolean;
  purificationMethod: "PRO_RATA" | "DIVIDEND";
  zakatStrategy: "LONG_TERM_DIVIDEND" | "SHORT_TERM_TRADING";
  calendarBasis: "GREGORIAN_365" | "HIJRI_354";
  // Piyasa
  liveRefreshInterval: number; // seconds
  defaultCurrency: "TRY" | "USD" | "EUR";
  numberFormat: "TR" | "EN";
  compactView: boolean;
  // Bildirim
  alertNonCompliantBreach: boolean;
  alertNewIpo: boolean;
  alertDailyNewsletter: boolean;
  alertKapDisclosures: boolean;
  // Gizlilik
  maskBalances: boolean;
}

const DEFAULT_SETTINGS: UserSettingsState = {
  fullName: "Mustafa Enes Çalımlı",
  email: "mustafaenescalimli@gmail.com",
  phone: "+90 555 123 4567",
  investorLevel: "ILERI",
  standard: "BIST",
  useCeilingRounding: true,
  purificationMethod: "PRO_RATA",
  zakatStrategy: "LONG_TERM_DIVIDEND",
  calendarBasis: "GREGORIAN_365",
  liveRefreshInterval: 30,
  defaultCurrency: "TRY",
  numberFormat: "TR",
  compactView: false,
  alertNonCompliantBreach: true,
  alertNewIpo: true,
  alertDailyNewsletter: false,
  alertKapDisclosures: true,
  maskBalances: false,
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, isDemoUser } = useAuth();

  useEffect(() => {
    if (!loading && !user && !isDemoUser) {
      router.replace("/auth/login");
    }
  }, [loading, user, isDemoUser, router]);

  const [activeTab, setActiveTab] = useState<SettingsTab>("PROFIL");
  const [settings, setSettings] = useState<UserSettingsState>(DEFAULT_SETTINGS);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<"FREE" | "PRO" | "PLUS">("PRO");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [isChurnModalOpen, setIsChurnModalOpen] = useState(false);
  const [showPortalDetails, setShowPortalDetails] = useState(false);
  const [planToast, setPlanToast] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mizan_user_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings((prev) => ({ ...prev, ...parsed }));
          if (parsed.subscriptionPlan === "PLUS") setSubscriptionPlan("PLUS");
          else if (parsed.subscriptionPlan === "FREE") setSubscriptionPlan("FREE");
          else setSubscriptionPlan("PRO");
          if (parsed.billingCycle) setBillingCycle(parsed.billingCycle);
        } catch {
          // ignore
        }
      } else if (profile) {
        setSettings((prev) => ({
          ...prev,
          fullName: profile.full_name || prev.fullName,
          email: profile.email || prev.email,
        }));
      }
    }
  }, [profile]);

  const handleSelectPlan = (newPlan: "FREE" | "PRO" | "PLUS") => {
    setSubscriptionPlan(newPlan);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mizan_user_settings");
      let current: Record<string, any> = {};
      try {
        if (saved) current = JSON.parse(saved);
      } catch {}
      const updated = {
        ...current,
        subscriptionPlan: newPlan,
        billingCycle,
        isPro: newPlan === "PRO" || newPlan === "PLUS",
        isPlus: newPlan === "PLUS",
      };
      localStorage.setItem("mizan_user_settings", JSON.stringify(updated));
    }
    const label = newPlan === "PLUS" ? "Mizan Plus" : newPlan === "PRO" ? "Mizan Pro" : "Ücretsiz Plan";
    setPlanToast(`${label} başarıyla güncellendi!`);
    setTimeout(() => setPlanToast(null), 3500);
  };

  const handleSaveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mizan_user_settings", JSON.stringify(settings));
    }
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleExportPortfolioData = () => {
    setIsExporting(true);
    setTimeout(() => {
      const holdings = localStorage.getItem("mizan_user_holdings") || "[]";
      const positions = localStorage.getItem("mizan_purification_positions") || "[]";
      const exportData = {
        app: "Mizan Katılım Finans",
        exportDate: new Date().toISOString(),
        settings,
        holdings: JSON.parse(holdings),
        purificationPositions: JSON.parse(positions),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mizan-katilim-yedek-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 600);
  };

  const handleClearLocalData = () => {
    if (
      window.confirm(
        "Dikkat: Yerel portföy ve arındırma kayıtlarınız sıfırlanacaktır. Bu işlem geri alınamaz. Onaylıyor musunuz?"
      )
    ) {
      const userEmail = user?.email?.toLowerCase().trim() || "";
      if (userEmail) {
        localStorage.removeItem(`mizan_holdings_${userEmail}`);
        fetch("/api/portfolio/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, holdings: [] }),
        }).catch(() => {});
      }
      localStorage.removeItem("mizan_user_holdings");
      localStorage.removeItem("mizan_katilim_holdings_v2");
      localStorage.removeItem("mizan_purification_positions");
      localStorage.removeItem("mizan_user_settings");
      alert("Tüm yerel veriler sıfırlandı.");
      window.location.reload();
    }
  };

  return (
    <PaynoShell badge="ayarlar">
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* =================================================================== */}
        {/* HEADER: Apple Frosted Hero & Pro Membership Badge                   */}
        {/* =================================================================== */}
        <div className="bg-white/70 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[24px] border border-white/85 dark:border-white/10 p-4 sm:p-6 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#182542]/10 dark:border-white/10 pb-3">
            <span className="text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8]">
              Hesap &amp; Tercih Yönetimi
            </span>

            {/* Plan Status Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              subscriptionPlan === "PLUS"
                ? "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-300"
                : subscriptionPlan === "PRO"
                ? "bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-amber-900 dark:text-amber-300"
                : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
            }`}>
              <Sparkles size={13} className={subscriptionPlan === "PLUS" ? "text-purple-600 dark:text-purple-400" : subscriptionPlan === "PRO" ? "text-amber-600 dark:text-amber-400" : "text-slate-500"} />
              <span>
                {subscriptionPlan === "PLUS" ? "MİZAN KATILIM PLUS • Aktif" : subscriptionPlan === "PRO" ? "MİZAN KATILIM PRO • Aktif" : "MİZAN KATILIM ÜCRETSİZ"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#182542] dark:text-white tracking-tight">
                Kullanıcı Tercihleri
              </h1>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] font-normal leading-relaxed">
                Profil bilgilerinizi, aboneliğinizi, bildirim alarmlarınızı ve veri güvenliğinizi yönetin.
              </p>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-4 py-2 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95 shrink-0"
            >
              <Save size={14} />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>

          {/* Toast Notification */}
          {isSavedToast && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Ayarlarınız başarıyla kaydedildi!</span>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* SETTINGS NAVIGATION TABS (Sadece Profil, Bildirim, Gizlilik)         */}
        {/* =================================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "PROFIL", label: "Profil & Üyelik", icon: User },
            { id: "BILDIRIM", label: "Bildirimler & Alarmlar", icon: Bell },
            { id: "GIZLILIK", label: "Gizlilik & Dışa Aktarma", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                  isActive
                    ? "bg-[#182542] dark:bg-[#273869] text-white shadow-md shadow-[#182542]/20 scale-100"
                    : "bg-white/80 dark:bg-[#0E1015] hover:bg-white dark:hover:bg-white/10 text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white border border-white/90 dark:border-white/10 shadow-2xs"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =================================================================== */}
        {/* TAB 1: PROFİL & ÜYELİK (Musaffa & Fintables Stili)                  */}
        {/* =================================================================== */}
        {activeTab === "PROFIL" && (
          <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6">
            <div className="flex items-center gap-3 border-b border-[#EDF1F7] dark:border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#182542] to-[#273869] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {settings.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#182542] dark:text-white">{settings.fullName}</h3>
                <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] font-mono">{settings.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] uppercase tracking-wider block">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={settings.fullName}
                  onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 text-xs font-semibold text-[#182542] dark:text-white focus:border-[#182542] dark:focus:border-blue-400 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] uppercase tracking-wider block">
                  E-Posta Adresi
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 text-xs font-semibold font-mono text-[#182542] dark:text-white focus:border-[#182542] dark:focus:border-blue-400 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] uppercase tracking-wider block">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 text-xs font-semibold font-mono text-[#182542] dark:text-white focus:border-[#182542] dark:focus:border-blue-400 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] uppercase tracking-wider block">
                  Katılım Yatırım Deneyimi
                </label>
                <select
                  value={settings.investorLevel}
                  onChange={(e) => setSettings({ ...settings, investorLevel: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 text-xs font-semibold text-[#182542] dark:text-white focus:border-[#182542] dark:focus:border-blue-400 outline-none transition"
                >
                  <option value="BASLANGIC" className="dark:bg-[#0E1015]">Başlangıç (BIST Katılım Kriterlerini Yeni Öğreniyor)</option>
                  <option value="ORTA" className="dark:bg-[#0E1015]">Orta Düzey (Düzenli Halka Arz ve Hisse Yatırımcısı)</option>
                  <option value="ILERI" className="dark:bg-[#0E1015]">İleri Düzey (Kapsamlı Bilanço &amp; Arındırma Uzmanı)</option>
                </select>
              </div>
            </div>

            {/* 3-Aşamalı Fiyatlandırma & Abonelik Yönetimi (Ücretsiz / Pro / Plus) */}
            <div className="space-y-5 pt-3 border-t border-[#EDF1F7] dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] dark:text-white">
                    Abonelik Planı &amp; Fiyatlandırma
                  </h4>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    İhtiyacınıza uygun planı seçin veya kurumsal icazet özelliklerine yükseltin.
                  </p>
                </div>

                {/* Billing Cycle Switcher */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200/60 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("MONTHLY")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      billingCycle === "MONTHLY"
                        ? "bg-white dark:bg-[#182542] text-[#182542] dark:text-white shadow-xs"
                        : "text-[#6E81A0] dark:text-[#94A3B8]"
                    }`}
                  >
                    Aylık
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("ANNUAL")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      billingCycle === "ANNUAL"
                        ? "bg-[#182542] text-white shadow-xs"
                        : "text-[#6E81A0] dark:text-[#94A3B8]"
                    }`}
                  >
                    <span>Yıllık</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-extrabold">
                      2 Ay Bedava
                    </span>
                  </button>
                </div>
              </div>

              {planToast && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{planToast}</span>
                </div>
              )}

              {/* 3 Tier Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. ÜCRETSİZ PLAN */}
                <div className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                  subscriptionPlan === "FREE"
                    ? "bg-white dark:bg-white/10 border-[#182542] dark:border-blue-400 shadow-md ring-2 ring-[#182542]/10"
                    : "bg-slate-50/70 dark:bg-white/5 border-slate-200/80 dark:border-white/10"
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8]">
                        Ücretsiz Plan
                      </span>
                      {subscriptionPlan === "FREE" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-2xl font-black font-mono text-[#182542] dark:text-white">₺0</div>
                      <div className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8]">Sonsuza dek ücretsiz</div>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-white/10">
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Tüm hisselerde BIST Katılım uygunluk sorgusu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>1 portföy takibi ve temel arındırma</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>BIMAS örnek Şirket Karnesi &amp; AI raporu</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-400 dark:text-slate-500">
                        <span className="shrink-0 text-sm leading-none">&bull;</span>
                        <span>Diğer hisselerde karne &amp; AI kilitli</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan("FREE")}
                    disabled={subscriptionPlan === "FREE"}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                      subscriptionPlan === "FREE"
                        ? "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 cursor-default"
                        : "bg-white dark:bg-white/10 hover:bg-slate-100 text-[#182542] dark:text-white border border-slate-300 dark:border-white/20"
                    }`}
                  >
                    {subscriptionPlan === "FREE" ? "Mevcut Planınız" : "Ücretsiz Plana Geç"}
                  </button>
                </div>

                {/* 2. MİZAN PRO */}
                <div className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 relative ${
                  subscriptionPlan === "PRO"
                    ? "bg-white dark:bg-[#0E1015] border-amber-500 shadow-lg ring-2 ring-amber-500/20"
                    : "bg-white dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-amber-400"
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Sparkles size={13} />
                        <span>Mizan Pro</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {subscriptionPlan === "PRO" ? "Aktif" : "En Popüler"}
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-mono text-[#182542] dark:text-white">
                        {billingCycle === "ANNUAL" ? "₺1.490" : "₺149"}
                        <span className="text-xs font-normal text-[#6E81A0] dark:text-[#94A3B8]">
                          {billingCycle === "ANNUAL" ? " / yıl" : " / ay"}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {billingCycle === "ANNUAL" ? "Yıllık peşin (aylık ~₺124)" : "Aylık faturalandırma"}
                      </div>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-white/10">
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Tüm hisselerde Şirket Karnesi 2.0</strong> (24 kriter)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Mizan AI 2.0</strong> Fıkhi &amp; Finansal Bilanço Sentezi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>DİB Onaylı Hisse Zekâtı</strong> (Uzun/Kısa Vade)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Fıkhi Stres Testi Simülasyonu &amp; Ek Kredi Marjı</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>5 Portföy takibi ve günlük arındırma arşivi</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan("PRO")}
                    disabled={subscriptionPlan === "PRO"}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                      subscriptionPlan === "PRO"
                        ? "bg-amber-500 text-white cursor-default"
                        : "bg-[#182542] hover:bg-[#273869] text-white"
                    }`}
                  >
                    {subscriptionPlan === "PRO" ? "Aktif Planınız" : "Mizan Pro'ya Geç"}
                  </button>
                </div>

                {/* 3. MİZAN PLUS */}
                <div className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 relative ${
                  subscriptionPlan === "PLUS"
                    ? "bg-gradient-to-br from-[#182542] via-[#213054] to-[#2d4170] text-white border-purple-400 shadow-xl ring-2 ring-purple-400/30"
                    : "bg-white dark:bg-white/5 border-purple-200 dark:border-purple-900/50 hover:border-purple-400"
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        <span>Mizan Plus</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200">
                        {subscriptionPlan === "PLUS" ? "Aktif" : "Süper Katılım"}
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-mono text-[#182542] dark:text-white">
                        {billingCycle === "ANNUAL" ? "₺2.990" : "₺299"}
                        <span className="text-xs font-normal text-[#6E81A0] dark:text-[#94A3B8]">
                          {billingCycle === "ANNUAL" ? " / yıl" : " / ay"}
                        </span>
                      </div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-300 font-bold">
                        {billingCycle === "ANNUAL" ? "Yıllık peşin (aylık ~₺249)" : "Aylık faturalandırma"}
                      </div>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200 pt-2 border-t border-slate-200/60 dark:border-white/10">
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Mizan Pro&apos;daki TÜM özellikler</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Katılım Dışı Hisseler İçin Sektörel İkame</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Resmi Fıkhi Arındırma &amp; Zekât Belgesi (PDF)</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Portföy Eşik Aşımı Anlık SMS &amp; E-Posta Alarmları</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>XKTUM Endeks Giriş/Çıkış KAP Erken Bildirimleri</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Sınırsız Portföy &amp; Öncelikli WhatsApp Desteği</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan("PLUS")}
                    disabled={subscriptionPlan === "PLUS"}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                      subscriptionPlan === "PLUS"
                        ? "bg-purple-600 text-white cursor-default"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                    }`}
                  >
                    {subscriptionPlan === "PLUS" ? "Aktif Planınız" : "Mizan Plus'a Yükselt"}
                  </button>
                </div>

              </div>

              {/* Portal & Fatura Butonları */}
              {subscriptionPlan !== "FREE" && (
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-[#182542] dark:text-white">
                      {subscriptionPlan === "PLUS" ? "Mizan Plus Yıllık Planı" : "Mizan Pro Yıllık Planı"}
                    </span>
                    <span className="text-[#6E81A0] dark:text-[#94A3B8]">&bull; Kart: &bull;&bull;&bull;&bull; 4242</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPortalDetails(!showPortalDetails)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-[#182542] dark:text-white font-bold hover:bg-slate-200 transition"
                    >
                      {showPortalDetails ? "Gizle" : "Fatura Bilgileri"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChurnModalOpen(true)}
                      className="text-xs text-rose-500 hover:text-rose-600 underline font-semibold transition"
                    >
                      Aboneliği İptal Et
                    </button>
                  </div>
                </div>
              )}

              {showPortalDetails && subscriptionPlan !== "FREE" && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6E81A0] dark:text-[#94A3B8]">Kayıtlı Ödeme Yöntemi:</span>
                    <span className="font-mono font-bold text-[#182542] dark:text-white">Mastercard &bull;&bull;&bull;&bull; 4242 (SKT: 10/29)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6E81A0] dark:text-[#94A3B8]">Son Fatura No:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">MZN-2026-INV-8491 ({billingCycle === "ANNUAL" ? (subscriptionPlan === "PLUS" ? "₺2.990" : "₺1.490") : (subscriptionPlan === "PLUS" ? "₺299" : "₺149")})</span>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => alert("Son dönem e-arşiv faturanız (PDF) indirildi.")}
                      className="text-[11px] text-blue-600 dark:text-blue-400 underline font-bold"
                    >
                      E-Arşiv Faturayı İndir (PDF)
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: BİLDİRİMLER & ALARMLAR                                       */}
        {/* =================================================================== */}
        {activeTab === "BILDIRIM" && (
          <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#182542] dark:text-white">Fıkhi Alarmlar ve KAP Bildirimleri</h3>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] mt-0.5">
                Portföyünüzdeki hisselerin katılım durumunda bir değişiklik olduğunda anında haberdar olun.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: "alertNonCompliantBreach",
                  title: "Katılım Dışına Düşüş Alarmı (Kritik)",
                  desc: "Portföyünüzde bulunan herhangi bir hisse katılım kriterlerini ihlal edip endeks dışı kaldığında anında sesli ve push bildirim gönder.",
                  critical: true,
                },
                {
                  key: "alertNewIpo",
                  title: "Yeni Katılım Halka Arzı Bildirimi",
                  desc: "SPK tarafından yeni bir şirket halka arzı onaylandığında ve katılım uygunluğu tespit edildiğinde bildirim gönder.",
                },
                {
                  key: "alertKapDisclosures",
                  title: "KAP Çeyreklik Bilanço ve KAFİF Raporları",
                  desc: "Şirketlerin 3 aylık yeni mali tabloları açıklandığında rasyo değişimlerini özet olarak ilet.",
                },
                {
                  key: "alertDailyNewsletter",
                  title: "Günlük Helal Borsa & Portföy Özeti",
                  desc: "Her sabah seans açılmadan önce günün katılım bültenini ve arındırma durumunu e-posta ile gönder.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#182542] dark:text-white">{item.title}</span>
                      {item.critical && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                          Önemli
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] font-normal leading-relaxed max-w-2xl">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        [item.key]: !settings[item.key as keyof UserSettingsState],
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                      settings[item.key as keyof UserSettingsState] ? "bg-[#182542] dark:bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        settings[item.key as keyof UserSettingsState] ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: GİZLİLİK & VERİ DIŞA AKTARMA (Data Export & Privacy)         */}
        {/* =================================================================== */}
        {activeTab === "GIZLILIK" && (
          <div className="bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#182542] dark:text-white">Gizlilik ve Veri Güvenliği</h3>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] mt-0.5">
                Portföy gizleme modunu yönetin, verilerinizi yedekleyin veya yerel kayıtları temizleyin.
              </p>
            </div>

            {/* Privacy Mode */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {settings.maskBalances ? <EyeOff size={16} className="dark:text-white" /> : <Eye size={16} className="dark:text-white" />}
                  <span className="text-xs font-bold text-[#182542] dark:text-white">
                    Portföy Bakiye Maskeleme (Gizlilik Modu)
                  </span>
                </div>
                <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] font-normal">
                  Ana ekranda ve portföy sayfasında toplam varlık tutarlarını ve hisse adetlerini gizle (Örn: &bull;&bull;&bull;&bull; ₺).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, maskBalances: !settings.maskBalances })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  settings.maskBalances ? "bg-[#182542] dark:bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.maskBalances ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Export & Reset Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-[#182542] dark:text-white" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Verileri Dışa Aktar (JSON Yedek)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Kayıtlı hisse portföyünüzü, arındırma pozisyonlarınızı ve fıkhi ayarlarınızı güvenli bir dosya olarak indirin.
                </p>
                <button
                  type="button"
                  onClick={handleExportPortfolioData}
                  disabled={isExporting}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 text-xs font-bold text-[#182542] dark:text-white flex items-center gap-2 shadow-xs transition"
                >
                  {isExporting ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
                  <span>{isExporting ? "Hazırlanıyor..." : "JSON Yedeği İndir"}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Trash2 size={16} className="text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                    Yerel Verileri Sıfırla
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed font-normal">
                  Tarayıcınızda kayıtlı olan tüm portföy pozisyonlarını, arındırma hesaplarını ve önbelleği kalıcı olarak sıfırlar.
                </p>
                <button
                  type="button"
                  onClick={handleClearLocalData}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white flex items-center gap-2 shadow-xs transition"
                >
                  <Trash2 size={13} />
                  <span>Verileri Temizle</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Churn Retention Survey Modal */}
        <ChurnSurveyModal
          isOpen={isChurnModalOpen}
          onClose={() => setIsChurnModalOpen(false)}
          onApplyRetentionOffer={(offerType) => {
            setIsChurnModalOpen(false);
            if (offerType === "DISCOUNT_30") {
              setPlanToast("%30 indirim sonraki 3 döneminize başarıyla tanımlandı!");
            } else if (offerType === "PAUSE_2_MONTHS") {
              setPlanToast("Aboneliğiniz 60 gün boyunca donduruldu. Ücret kesilmeyecek.");
            }
            setTimeout(() => setPlanToast(null), 4000);
          }}
          onConfirmCancel={(reason, feedback) => {
            setIsChurnModalOpen(false);
            setSubscriptionPlan("FREE");
            setPlanToast("Aboneliğiniz iptal edildi. Dönem sonuna kadar PRO haklarınız devam eder.");
            setTimeout(() => setPlanToast(null), 4000);
          }}
        />

      </div>
    </PaynoShell>
  );
}
