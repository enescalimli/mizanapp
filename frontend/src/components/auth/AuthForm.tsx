"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  KeyRound,
  RotateCcw,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface AuthFormProps {
  initialMode?: "login" | "register";
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = "login" }) => {
  const router = useRouter();
  const { signIn, loginWithDetails } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP Verification States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpTargetEmail, setOtpTargetEmail] = useState<string>("");
  const [otpTargetName, setOtpTargetName] = useState<string>("");
  const [otpCountdown, setOtpCountdown] = useState<number>(60);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpServerToken, setOtpServerToken] = useState<string>("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpModalOpen && otpCountdown > 0 && !otpVerified) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpModalOpen, otpCountdown, otpVerified]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: "Zayıf", color: "bg-rose-500" };
    if (score <= 3) return { score: 2, text: "Orta", color: "bg-amber-500" };
    return { score: 3, text: "Güçlü", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  // Trigger 6-digit real email OTP verification flow
  const initiateOtpVerification = async (targetEmail: string, targetName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setOtpTargetEmail(targetEmail);
    setOtpTargetName(targetName);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    setOtpVerified(false);
    setOtpCountdown(60);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, fullName: targetName }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || "Doğrulama kodu gönderilemedi.");
        setIsLoading(false);
        return;
      }
      if (data.otpToken) {
        setOtpServerToken(data.otpToken);
      }
      setIsOtpModalOpen(true);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch {
      setErrorMessage("Bağlantı hatası: Doğrulama kodu sunucusuna ulaşılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to ensure Google GIS client is loaded
  const loadGoogleScript = (): Promise<boolean> => {
    if (typeof window === "undefined") return Promise.resolve(false);
    if ((window as any).google?.accounts?.oauth2) return Promise.resolve(true);

    return new Promise((resolve) => {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts > 30) {
            clearInterval(interval);
            resolve(false);
          }
        }, 100);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts > 20) {
            clearInterval(interval);
            resolve(false);
          }
        }, 100);
      };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const handleGoogleSignInClick = async () => {
    setErrorMessage(null);
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "934615365685-jvjo2h1o7k4k9b28945fnmc6he10ibij.apps.googleusercontent.com";

    setIsLoading(true);

    try {
      const isGsiReady = await loadGoogleScript();

      // Gerçek Google OAuth Client ID mevcutsa ve Google SDK yüklüyse resmi Google popup'ını tetikle
      if (clientId && isGsiReady && (window as any).google?.accounts?.oauth2) {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          prompt: "select_account",
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setIsLoading(false);
              if (tokenResponse.error === "popup_closed_by_user" || tokenResponse.error === "access_denied") {
                setErrorMessage("Google ile oturum açma penceresi kapatıldı.");
              } else {
                setErrorMessage(`Google oturum açma hatası: ${tokenResponse.error}`);
              }
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleUser = await userInfoRes.json();
                if (googleUser?.email) {
                  loginWithDetails(googleUser.email, googleUser.name || googleUser.email.split("@")[0]);
                  setSuccessMessage(`${googleUser.name || googleUser.email} olarak Google ile başarıyla giriş yapıldı!`);
                  setTimeout(() => router.push("/dashboard"), 500);
                  return;
                }
              } catch (userInfoErr) {
                console.error("Google kullanıcı bilgileri alınamadı:", userInfoErr);
                setErrorMessage("Google kullanıcı profili doğrulanamadı.");
              } finally {
                setIsLoading(false);
              }
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: "select_account" });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Google SDK init hatası:", err);
    }

    setIsLoading(false);
    setErrorMessage(
      "Google oturum açma servisiyle bağlantı kurulamadı. Lütfen tarayıcınızın açılır pencerelere izin verdiğinden emin olunuz veya e-posta ve şifrenizle giriş yapınız."
    );
  };

  // OTP Digit Change Handler
  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // User pasted or typed multiple chars
      const chars = value.replace(/[^0-9]/g, "").slice(0, 6).split("");
      const newDigits = [...otpDigits];
      chars.forEach((c, idx) => {
        if (index + idx < 6) newDigits[index + idx] = c;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(5, index + chars.length);
      otpInputRefs.current[nextIndex]?.focus();
      if (newDigits.every((d) => d !== "")) {
        checkOtpSubmission(newDigits.join(""));
      }
      return;
    }

    const cleanChar = value.replace(/[^0-9]/g, "");
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);
    setOtpError(null);

    // Advance to next box if char entered
    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== "")) {
      checkOtpSubmission(newDigits.join(""));
    }
  };

  // OTP Keydown (Handling Backspace)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Check OTP Submission via real API endpoint
  const checkOtpSubmission = async (enteredCode: string) => {
    if (enteredCode.length !== 6 || isVerifyingOtp) return;
    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpTargetEmail,
          code: enteredCode,
          token: otpServerToken,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpVerified(true);
        setOtpError(null);

        // Şifreli kayıt modunda şifreyi güvenli parola deposuna kaydet
        if (password && password.length >= 6) {
          try {
            await fetch("/api/auth/password-auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "register",
                email: otpTargetEmail,
                password,
                fullName: otpTargetName,
              }),
            });
          } catch (e) {
            console.error("Şifre kayıt hatası:", e);
          }
        }

        setTimeout(() => {
          loginWithDetails(otpTargetEmail, data.user?.fullName || otpTargetName);
          setIsOtpModalOpen(false);
          setSuccessMessage("E-posta doğrulaması başarılı! Uygulamaya yönlendiriliyorsunuz...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 600);
        }, 600);
      } else {
        setOtpError(data.error || "Girdiğiniz 6 haneli kod hatalı. Lütfen e-postanızı kontrol ediniz.");
      }
    } catch {
      setOtpError("Sunucu bağlantı hatası oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP code via real API endpoint
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpTargetEmail, fullName: otpTargetName }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.otpToken) {
          setOtpServerToken(data.otpToken);
        }
        setOtpCountdown(60);
        otpInputRefs.current[0]?.focus();
      } else {
        setOtpError(data.error || "Yeni kod gönderilemedi.");
      }
    } catch {
      setOtpError("Bağlantı hatası: Yeni kod gönderilemedi.");
    }
  };

  // Submit Email & Password Form
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
      if (!agreeTerms) {
        setErrorMessage("Lütfen kullanıcı sözleşmesi ve fıkhi esasları onaylayınız.");
        return;
      }

      // Kayıt doğrulama: e-postaya gerçek 6 haneli onay kodu gönderilir
      initiateOtpVerification(email, fullName || email.split("@")[0]);
      return;
    }

    // Login mode: Gerçek sunucu tarafı şifre ve kimlik doğrulama kontrolü
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/password-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Girdiğiniz e-posta veya şifre hatalıdır.");
        setIsLoading(false);
        return;
      }

      // Doğrulama başarılı: Oturumu başlat ve panoya yönlendir
      loginWithDetails(data.user.email, data.user.fullName);
      setSuccessMessage("Giriş başarılı! Uygulamaya yönlendiriliyorsunuz...");
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err: any) {
      setErrorMessage("Bağlantı hatası: Kimlik doğrulama sunucusuna ulaşılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-7 sm:p-9 border border-white/85 dark:border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(24,37,66,0.08)] bg-white/80 dark:bg-[#0E1015]/95 backdrop-blur-2xl space-y-6">
        
        {/* Header / Brand */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#0D8B52] dark:text-emerald-400 text-xs font-semibold mb-3">
            <ShieldCheck size={14} />
            <span>Mizan Güvenli Giriş</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#182542] dark:text-white tracking-tight">
            {mode === "login" ? "Hesabınıza Giriş Yapın" : "Yeni Katılım Hesabı Aç"}
          </h2>
          <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] mt-1.5 font-normal">
            {mode === "login"
              ? "Katılım portföyünüze ve kuruşu kuruşuna arındırma verilerinize erişin."
              : "DİB ve BIST Katılım standartlarında şer'i portföy takibine hemen başlayın."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-[#EDF1F7] dark:bg-white/5 border border-white dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              mode === "login"
                ? "bg-[#182542] text-white shadow-xs font-bold"
                : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
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
                ? "bg-[#182542] text-white shadow-xs font-bold"
                : "text-[#6E81A0] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white"
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignInClick}
          className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-3 transition shadow-xs active:scale-[0.99]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{mode === "login" ? "Google ile Giriş Yap" : "Google ile Kaydol"}</span>
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold">
            <span className="bg-white dark:bg-[#0E1015] px-3 text-slate-400 dark:text-[#94A3B8]">veya e-posta ile</span>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-500 dark:text-[#94A3B8] tracking-wider block mb-1.5">
                Ad Soyad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Mustafa Çalımlı"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#182542] dark:focus:border-blue-400 transition placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 dark:text-[#94A3B8] tracking-wider block mb-1.5">
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#182542] dark:focus:border-blue-400 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] uppercase font-semibold text-slate-500 dark:text-[#94A3B8] tracking-wider block">
                Şifre
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() =>
                    alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.")
                  }
                  className="text-[10px] text-[#273869] dark:text-indigo-300 hover:underline font-semibold"
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
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#182542] dark:focus:border-blue-400 transition placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Password strength bar for registration */}
            {mode === "register" && password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Şifre Gücü:</span>
                  <span className="font-semibold">{passwordStrength.text}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {mode === "register" && (
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-500 dark:text-[#94A3B8] tracking-wider block mb-1.5">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#182542] dark:focus:border-blue-400 transition placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Remember me & Terms */}
          <div className="flex items-center justify-between text-xs pt-1">
            {mode === "login" ? (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-white/20 text-[#182542] focus:ring-[#182542]"
                />
                <span className="text-slate-600 dark:text-[#94A3B8]">Beni hatırla</span>
              </label>
            ) : (
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-300 dark:border-white/20 text-[#182542] focus:ring-[#182542] mt-0.5"
                />
                <span className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-tight">
                  <Link href="/rehber" className="text-[#182542] dark:text-blue-400 underline font-semibold">
                    Kullanıcı Sözleşmesi
                  </Link>
                  &apos;ni ve Katılım Finansı İlkelerini kabul ediyorum.
                </span>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-95 shadow-md shadow-[#182542]/20"
          >
            {isLoading ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <>
                <span>{mode === "login" ? "Giriş Yap" : "E-Posta Doğrulaması ile Kaydol"}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-white/10">
          <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] leading-relaxed font-normal">
            Verileriniz 256-bit SSL ve uçtan uca şifrelemeli altyapıda güvenle saklanır.
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. 6-DIGIT EMAIL VERIFICATION (OTP) MODAL                             */}
      {/* ===================================================================== */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0E1015] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 space-y-6 animate-in zoom-in-95 duration-150">
            
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>

            {/* OTP Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs">
                <KeyRound size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-[#182542] dark:text-white">
                E-Posta Onay Kodunu Girin
              </h3>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed max-w-xs mx-auto">
                <strong className="text-[#182542] dark:text-white font-semibold">{otpTargetEmail}</strong> adresinize 6 haneli güvenlik doğrulama kodu gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol ediniz.
              </p>
            </div>

            {/* OTP 6-Digit Input Boxes */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={otpVerified || isVerifyingOtp}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border transition-all duration-150 outline-none ${
                      digit
                        ? "border-[#182542] dark:border-blue-400 bg-white dark:bg-white/10 text-[#182542] dark:text-white shadow-sm"
                        : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white focus:border-[#182542] dark:focus:border-blue-400 focus:bg-white dark:focus:bg-white/10"
                    } ${otpError ? "border-rose-400 bg-rose-50/50 dark:bg-rose-950/40" : ""} ${
                      otpVerified ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300" : ""
                    }`}
                  />
                ))}
              </div>

              {/* Error / Verified State */}
              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 justify-center animate-shake">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpVerified && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 justify-center animate-in zoom-in-95">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Kod başarıyla doğrulandı! Güvenli oturum açılıyor...</span>
                </div>
              )}
            </div>

            {/* Resend & Timer */}
            <div className="text-center pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-[#6E81A0] dark:text-[#94A3B8]">
              <span>Kodu almadınız mı?</span>
              {otpCountdown > 0 ? (
                <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Tekrar gönder ({otpCountdown}s)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-[#182542] dark:text-white hover:underline inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Yeni Kod Gönder</span>
                </button>
              )}
            </div>

            {/* Direct Verification Button */}
            <button
              type="button"
              onClick={() => checkOtpSubmission(otpDigits.join(""))}
              disabled={otpDigits.some((d) => d === "") || otpVerified || isVerifyingOtp}
              className="w-full py-3 rounded-xl bg-[#182542] hover:bg-[#273869] dark:bg-[#273869] dark:hover:bg-[#344b82] text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-95 shadow-md shadow-[#182542]/20"
            >
              {isVerifyingOtp ? (
                <RefreshCw size={15} className="animate-spin text-white" />
              ) : otpVerified ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Doğrulandı</span>
                </>
              ) : (
                <>
                  <span>Doğrula ve Giriş Yap</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
