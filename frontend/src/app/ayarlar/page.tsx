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

type SettingsTab = "PROFIL" | "FIKIH" | "PIYASA" | "BILDIRIM" | "GIZLILIK";

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
  const [subscriptionPlan, setSubscriptionPlan] = useState<"PRO" | "FREE">("PRO");
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
      localStorage.removeItem("mizan_user_holdings");
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
        <div className="bg-white/70 dark:bg-[#161F32]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#182542]/10 dark:border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#0D8B52] dark:text-emerald-400 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>Fintables, Musaffa &amp; Zoya Entegre Tercih Merkezi</span>
            </div>

            {/* Pro Plan Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-bold">
              <Sparkles size={13} className="text-amber-600 dark:text-amber-400" />
              <span>MİZAN KATILIM PRO &bull; Aktif</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] dark:text-white tracking-tight">
                Kullanıcı Tercihleri &amp; <span className="font-serif italic text-[#405881] dark:text-indigo-300">Fıkhi Standartlar</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6E81A0] dark:text-[#94A3B8] font-normal leading-relaxed">
                Fıkhi arındırma metodolojinizi, BIST tarama filtrelerinizi, veri akışını ve güvenlik ayarlarınızı yönetin.
              </p>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-5 py-2.5 rounded-full bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#182542]/20 transition active:scale-95 shrink-0"
            >
              <Save size={15} />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>

          {/* Toast Notification */}
          {isSavedToast && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Ayarlarınız başarıyla kaydedildi! Tüm hesaplamalar anında güncellendi.</span>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* SETTINGS NAVIGATION TABS                                            */}
        {/* =================================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "PROFIL", label: "Profil & Üyelik", icon: User },
            { id: "FIKIH", label: "Fıkhi Standart & İcazet", icon: Scale },
            { id: "PIYASA", label: "Piyasa & Canlı Veri", icon: SlidersHorizontal },
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
                    : "bg-white/80 dark:bg-[#161F32] hover:bg-white dark:hover:bg-white/10 text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white border border-white/90 dark:border-white/10 shadow-2xs"
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
          <div className="bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6">
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
                  <option value="BASLANGIC" className="dark:bg-[#161F32]">Başlangıç (BIST Katılım Kriterlerini Yeni Öğreniyor)</option>
                  <option value="ORTA" className="dark:bg-[#161F32]">Orta Düzey (Düzenli Halka Arz ve Hisse Yatırımcısı)</option>
                  <option value="ILERI" className="dark:bg-[#161F32]">İleri Düzey (Kapsamlı Bilanço &amp; Arındırma Uzmanı)</option>
                </select>
              </div>
            </div>

            {/* Self-Service Müşteri Portali & Abonelik Yönetimi */}
            <div className="space-y-4 pt-2 border-t border-[#EDF1F7] dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#182542] dark:text-white">
                    Abonelik &amp; Fatura Merkezi
                  </h4>
                  <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                    Planınızı yönetin, faturalarınızı indirin veya iptal sürecini başlatın.
                  </p>
                </div>
                {planToast && (
                  <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-xl">
                    {planToast}
                  </div>
                )}
              </div>

              {subscriptionPlan === "PRO" ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#182542] via-[#24375d] to-[#3a5282] text-white space-y-4 shadow-md shadow-[#182542]/15 border border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                        <Sparkles size={11} className="text-amber-300" />
                        <span>MİZAN PRO AKTİF</span>
                      </div>
                      <h4 className="text-sm font-bold">Mizan Katılım Pro &bull; Yıllık Plan</h4>
                      <p className="text-xs text-white/80 font-normal">
                        626 BIST hissesi için anlık KAP bildirimleri, limitsiz arındırma ve hisse zekâtı arşivi.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold font-mono text-emerald-300">₺1.490 / yıl</div>
                      <div className="text-[10px] text-white/70">Yenilenme: 2027-10-20</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPortalDetails(!showPortalDetails)}
                      className="px-4 py-2 rounded-xl bg-white text-[#182542] text-xs font-bold hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5"
                    >
                      <CreditCard size={13} />
                      <span>{showPortalDetails ? "Detayları Gizle" : "Müşteri Portali & Fatura"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsChurnModalOpen(true)}
                      className="text-xs text-white/70 hover:text-white underline font-semibold transition"
                    >
                      Aboneliği İptal Et
                    </button>
                  </div>

                  {showPortalDetails && (
                    <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-3 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white/70">Kayıtlı Ödeme Yöntemi:</span>
                        <span className="font-mono font-bold text-white">Mastercard &bull;&bull;&bull;&bull; 4242 (SKT: 10/29)</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white/70">Son Fatura No:</span>
                        <span className="font-mono text-emerald-300">MZN-2026-INV-8491 (₺1.490)</span>
                      </div>
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => alert("Son dönem e-faturanız (PDF) indirildi.")}
                          className="text-[10px] text-white underline font-bold"
                        >
                          E-Arşiv Faturayı İndir (PDF)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      ÜCRETSİZ PLAN
                    </span>
                    <h4 className="text-xs font-bold text-[#182542] dark:text-white">Mizan Katılım Temel Sürüm</h4>
                    <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                      Yalnızca 3 hisse arındırma ve temel tarama limitindesiniz.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriptionPlan("PRO");
                      setPlanToast("Mizan PRO üyeliğiniz aktif edildi!");
                      setTimeout(() => setPlanToast(null), 3500);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white text-xs font-bold transition shadow-xs"
                  >
                    Mizan PRO&apos;ya Yükselt (₺149/ay)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: FIKHİ STANDARTLAR & İCAZET (Musaffa & Zoya Inspired)        */}
        {/* =================================================================== */}
        {activeTab === "FIKIH" && (
          <div className="bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#182542] dark:text-white">Birincil Fıkhi Standart Tercihi</h3>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] mt-0.5">
                Hisselerin uygunluk durumunun ve tolerans bantlarının hesaplanmasında hangi metodolojinin esas alınacağını seçin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "BIST",
                  title: "DİB & BIST Katılım Kriteri",
                  subtitle: "Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu",
                  desc: "Faizli Borç < %33, Faizli Nakit < %33, Uygunsuz Gelir < %5. Borsa İstanbul resmi helal tarama standardıdır.",
                  badge: "Resmi Standart",
                },
                {
                  id: "TKBB",
                  title: "TKBB Merkezi Danışma Kurulu",
                  subtitle: "Türkiye Katılım Bankaları Birliği",
                  desc: "KAP Katılım Finansı İlkeleri Bilgi Formu (KAFİF) ve 3 altın rasyo denetim metodolojisi.",
                  badge: "KAP Uyumlu",
                },
              ].map((std) => (
                <div
                  key={std.id}
                  onClick={() => setSettings({ ...settings, standard: std.id as any })}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                    settings.standard === std.id
                      ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869] shadow-md shadow-[#182542]/20 scale-[1.01]"
                      : "bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-[#182542] dark:text-white border-[#EDF1F7] dark:border-white/10"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        settings.standard === std.id ? "bg-white/20 text-white" : "bg-[#EDF1F7] dark:bg-white/10 text-[#6E81A0] dark:text-[#94A3B8]"
                      }`}>
                        {std.badge}
                      </span>
                      {settings.standard === std.id && (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold leading-tight">{std.title}</h4>
                    <p className={`text-[10px] ${settings.standard === std.id ? "text-white/80" : "text-[#6E81A0] dark:text-[#94A3B8]"}`}>
                      {std.subtitle}
                    </p>
                  </div>
                  <p className={`text-[11px] leading-relaxed font-normal ${
                    settings.standard === std.id ? "text-white/90" : "text-slate-600 dark:text-slate-300"
                  }`}>
                    {std.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Ceiling Rounding Toggle (Şer'i İhtiyat) */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    Şer&apos;i İhtiyat Kuralı (Ceiling Rounding / Yukarı Yuvarlama)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-normal leading-relaxed max-w-2xl">
                  Arındırma ve zekât hesaplamalarında kuruş küsuratları yatırımcı lehine değil, şüpheden korunmak adına daima bir üst tam kuruşa tamamlanır.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, useCeilingRounding: !settings.useCeilingRounding })}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  settings.useCeilingRounding ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.useCeilingRounding ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Arındırma ve Zekât Stratejisi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 space-y-2">
                <span className="text-xs font-bold text-[#182542] dark:text-white block">
                  Varsayılan Arındırma Modeli
                </span>
                <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                  Hisseleri portföyünüzde tuttuğunuz gün sayısına göre mi yoksa temettü nakdi bazında mı hesaplansın?
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, purificationMethod: "PRO_RATA" })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                      settings.purificationMethod === "PRO_RATA"
                        ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869]"
                        : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
                    }`}
                  >
                    Pro-Rata (Gün Sayısı)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, purificationMethod: "DIVIDEND" })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                      settings.purificationMethod === "DIVIDEND"
                        ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869]"
                        : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
                    }`}
                  >
                    Temettü Bazlı
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 space-y-2">
                <span className="text-xs font-bold text-[#182542] dark:text-white block">
                  Hisse Senedi Zekât Niyeti
                </span>
                <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                  Niyet modeline göre şirketin net dönen varlıkları mı yoksa cari portföy tutarı mı matrah alınsın?
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, zakatStrategy: "LONG_TERM_DIVIDEND" })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                      settings.zakatStrategy === "LONG_TERM_DIVIDEND"
                        ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869]"
                        : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
                    }`}
                  >
                    Ortaklık / Temettü
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, zakatStrategy: "SHORT_TERM_TRADING" })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                      settings.zakatStrategy === "SHORT_TERM_TRADING"
                        ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869]"
                        : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
                    }`}
                  >
                    Ticaret / Al-Sat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: PİYASA & CANLI VERİ (Fintables Stili)                        */}
        {/* =================================================================== */}
        {activeTab === "PIYASA" && (
          <div className="bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#182542] dark:text-white">Piyasa Veri Motoru &amp; Arayüz</h3>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] mt-0.5">
                BIST ve KAP canlı veri akış sıklığını ve para birimi tercihlerini yapılandırın.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] uppercase tracking-wider block">
                  Canlı Fiyat Yenileme Sıklığı
                </label>
                <select
                  value={settings.liveRefreshInterval}
                  onChange={(e) => setSettings({ ...settings, liveRefreshInterval: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 text-xs font-semibold text-[#182542] dark:text-white focus:border-[#182542] dark:focus:border-blue-400 outline-none transition"
                >
                  <option value={15} className="dark:bg-[#161F32]">15 Saniyede Bir (Ultra Hızlı / Fintables Modu)</option>
                  <option value={30} className="dark:bg-[#161F32]">30 Saniyede Bir (Dengeli / Önerilen)</option>
                  <option value={60} className="dark:bg-[#161F32]">60 Saniyede Bir (Veri Tasarruflu)</option>
                  <option value={0} className="dark:bg-[#161F32]">Yalnızca Manuel (Butona Tıklandığında)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] uppercase tracking-wider block">
                  Varsayılan Para Birimi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["TRY", "USD", "EUR"] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setSettings({ ...settings, defaultCurrency: curr })}
                      className={`py-2 text-xs font-bold rounded-2xl border transition ${
                        settings.defaultCurrency === curr
                          ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869]"
                          : "bg-white dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] border-[#EDF1F7] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10"
                      }`}
                    >
                      {curr === "TRY" ? "🇹🇷 TRY ₺" : curr === "USD" ? "🇺🇸 USD $" : "🇪🇺 EUR €"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] uppercase tracking-wider block">
                  Sayı &amp; Küsurat Formatı
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, numberFormat: "TR" })}
                    className={`py-2 text-xs font-bold rounded-2xl border transition ${
                      settings.numberFormat === "TR"
                        ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869]"
                        : "bg-white dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] border-[#EDF1F7] dark:border-white/10"
                    }`}
                  >
                    10.000,50 ₺ (Türkçe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, numberFormat: "EN" })}
                    className={`py-2 text-xs font-bold rounded-2xl border transition ${
                      settings.numberFormat === "EN"
                        ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869]"
                        : "bg-white dark:bg-white/5 text-[#6E81A0] dark:text-[#94A3B8] border-[#EDF1F7] dark:border-white/10"
                    }`}
                  >
                    10,000.50 $ (Uluslararası)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] uppercase tracking-wider block">
                  Kompakt Tablo Görünümü
                </label>
                <div className="p-2.5 rounded-2xl bg-white dark:bg-white/5 border border-[#EDF1F7] dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-[#182542] dark:text-white font-semibold">
                    Satır aralıklarını daralt (Daha çok hisse göster)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, compactView: !settings.compactView })}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                      settings.compactView ? "bg-[#182542] dark:bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        settings.compactView ? "left-6" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: BİLDİRİMLER & ALARMLAR                                       */}
        {/* =================================================================== */}
        {activeTab === "BILDIRIM" && (
          <div className="bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
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
          <div className="bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-2xl rounded-[28px] border border-white/85 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6">
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
