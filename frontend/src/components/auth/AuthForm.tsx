"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { useAuth } from "@/lib/auth/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

interface AuthFormProps {
  initialMode?: "login" | "register";
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = "login" }) => {
  const router = useRouter();
  const { signIn, signUp, loginAsDemoUser, user } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [standardPreference, setStandardPreference] = useState<"BIST_KATILIM_DIB" | "AAOIFI_STD_21">("BIST_KATILIM_DIB");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Lütfen e-posta ve şifrenizi giriniz.");
      return;
    }

    if (mode === "register") {
      if (password.length < 6) {
        setErrorMessage("Şifreniz en az 6 karakter olmalıdır.");
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMessage("Şifreler birbiriyle eşleşmiyor.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
        } else {
          setSuccessMessage("Giriş başarılı! Portföyünüze yönlendiriliyorsunuz...");
          setTimeout(() => {
            router.push("/portfolio");
          }, 800);
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMessage(error.message || "Kayıt işlemi başarısız oldu.");
        } else {
          setSuccessMessage(
            "Hesabınız başarıyla oluşturuldu! E-posta adresinize doğrulama bağlantısı gönderildi veya anında giriş yapabilirsiniz."
          );
          setTimeout(() => {
            router.push("/portfolio");
          }, 1500);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemoUser();
    setSuccessMessage("Demo Katılım Portföyüne giriş yapıldı!");
    setTimeout(() => {
      router.push("/portfolio");
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <SpotlightCard className="p-7 sm:p-9 border-white/[0.08] shadow-2xl backdrop-blur-2xl">
        {/* Header / Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <ShieldCheck size={14} />
            <span>MizanApp Güvenli Giriş</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === "login" ? "Hesabınıza Giriş Yapın" : "Yeni Katılım Hesabı Aç"}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-normal">
            {mode === "login"
              ? "Bilanço analizlerinize ve kuruşu kuruşuna arındırma verilerinize erişin."
              : "TKBB ve AAOIFI standartlarında şer'i portföy takibine hemen başlayın."}
          </p>
        </div>

        {/* Apple Segmented Switcher */}
        <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              mode === "login"
                ? "bg-white/[0.12] text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              mode === "register"
                ? "bg-white/[0.12] text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Notifications & Warnings */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs mb-5 flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs mb-5 flex items-start gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{successMessage}</div>
          </div>
        )}

        {!isConfigured && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-5 flex items-start gap-2.5">
            <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold">Supabase Anahtarları Bekleniyor:</span>{" "}
              Canlı DB bağlantısı öncesinde anında test etmek için aşağıdaki <strong>&quot;Hızlı Demo Girişi&quot;</strong> butonunu kullanabilirsiniz.
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
                Ad Soyad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Mustafa Çalımlı"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
              E-Posta Adresi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={15} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@yatirim.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                Şifre
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => alert("Şifre sıfırlama bağlantısı için lütfen sistem yöneticisiyle iletişime geçin veya demo modunu kullanın.")}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Şifremi Unuttum
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
                Şifre Tekrar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
                Varsayılan Katılım Standardı
              </label>
              <select
                value={standardPreference}
                onChange={(e) => setStandardPreference(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="BIST_KATILIM_DIB" className="bg-slate-900 text-white">
                  BIST Katılım Standardı (%33 Borç / %33 Nakit / %5 Gelir)
                </option>
                <option value="AAOIFI_STD_21" className="bg-slate-900 text-white">
                  AAOIFI Shariah Standard No. 21 (%30 Borç / %30 Nakit / %5 Gelir)
                </option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="apple-btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2 text-xs font-bold"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>İşleniyor...</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold">
            <span className="bg-[#08090d] px-3 text-slate-400">veya</span>
          </div>
        </div>

        {/* 1-Click Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition duration-150 active:scale-[0.98]"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>Hızlı Demo Hesabı ile Devam Et</span>
        </button>

        {/* Security / Privacy Footnote */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
            Portföy verileriniz Supabase PostgreSQL üzerinde{" "}
            <span className="text-slate-300 font-mono">Row Level Security (RLS)</span>{" "}
            ile izole edilerek kuruş hassasiyetinde saklanır.
          </p>
        </div>
      </SpotlightCard>
    </div>
  );
};
