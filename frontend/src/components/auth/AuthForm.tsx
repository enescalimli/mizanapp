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
      <div className="p-7 sm:p-9 border border-slate-200 rounded-3xl shadow-xl bg-white space-y-6">
        {/* Header / Brand */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <ShieldCheck size={14} />
            <span>Mizan Güvenli Giriş</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === "login" ? "Hesabınıza Giriş Yapın" : "Yeni Katılım Hesabı Aç"}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 font-normal">
            {mode === "login"
              ? "Bilanço analizlerinize ve kuruşu kuruşuna arındırma verilerinize erişin."
              : "TKBB ve AAOIFI standartlarında şer'i portföy takibine hemen başlayın."}
          </p>
        </div>

        {/* Apple Segmented Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-900"
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
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Notifications & Warnings */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{successMessage}</div>
          </div>
        )}

        {!isConfigured && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
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
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1.5">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1.5">
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                Şifre
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => alert("Şifre sıfırlama bağlantısı için lütfen sistem yöneticisiyle iletişime geçin veya demo modunu kullanın.")}
                  className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold"
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
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1.5">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1.5">
                Varsayılan Katılım Standardı
              </label>
              <select
                value={standardPreference}
                onChange={(e) => setStandardPreference(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="BIST_KATILIM_DIB">
                  BIST Katılım Standardı (%33 Borç / %33 Nakit / %5 Gelir)
                </option>
                <option value="AAOIFI_STD_21">
                  AAOIFI Shariah Standard No. 21 (%30 Borç / %30 Nakit / %5 Gelir)
                </option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 rounded-full bg-slate-950 text-white hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-bold transition shadow-sm"
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
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold">
            <span className="bg-white px-3 text-slate-400">veya</span>
          </div>
        </div>

        {/* 1-Click Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 px-4 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition duration-150 active:scale-[0.98]"
        >
          <Sparkles size={14} className="text-amber-600" />
          <span>Hızlı Demo Hesabı ile Devam Et</span>
        </button>

        {/* Security / Privacy Footnote */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
            Portföy verileriniz Supabase PostgreSQL üzerinde{" "}
            <span className="text-slate-600 font-mono">Row Level Security (RLS)</span>{" "}
            ile izole edilerek kuruş hassasiyetinde saklanır.
          </p>
        </div>
      </div>
    </div>
  );
};
