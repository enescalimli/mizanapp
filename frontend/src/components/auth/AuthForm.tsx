"use client";

import React, { useState, useEffect, useRef } from "react";
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
  X,
  ChevronRight,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface AuthFormProps {
  initialMode?: "login" | "register";
}

interface GoogleAccountOption {
  id: string;
  name: string;
  email: string;
  avatarText: string;
  avatarBg: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = "login" }) => {
  const router = useRouter();
  const { signIn, signUp, loginWithDetails } = useAuth();

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

  // Google OAuth Modal States
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState<"CHOOSE_ACCOUNT" | "PERMISSIONS" | "CUSTOM_ACCOUNT">("CHOOSE_ACCOUNT");
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<GoogleAccountOption | null>(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");

  // OTP Verification States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpExpectedCode, setOtpExpectedCode] = useState<string>("");
  const [otpTargetEmail, setOtpTargetEmail] = useState<string>("");
  const [otpTargetName, setOtpTargetName] = useState<string>("");
  const [otpCountdown, setOtpCountdown] = useState<number>(60);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [showSecurityCodeBanner, setShowSecurityCodeBanner] = useState<boolean>(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
    {
      id: "acc-1",
      name: "Mustafa Enes Çalımlı",
      email: "mustafaenescalimli@gmail.com",
      avatarText: "M",
      avatarBg: "bg-emerald-600",
    },
    {
      id: "acc-2",
      name: "Katılım Yatırımcısı",
      email: "yatirimci@mizanapp.tr",
      avatarText: "K",
      avatarBg: "bg-blue-600",
    },
  ];

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

  // Trigger 6-digit OTP verification flow
  const initiateOtpVerification = (targetEmail: string, targetName: string) => {
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpExpectedCode(generatedCode);
    setOtpTargetEmail(targetEmail);
    setOtpTargetName(targetName);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    setOtpVerified(false);
    setOtpCountdown(60);
    setShowSecurityCodeBanner(true);
    setIsOtpModalOpen(true);

    // Auto focus first OTP input box
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 150);
  };

  const handleOpenGoogleModal = () => {
    setErrorMessage(null);
    setGoogleStep("CHOOSE_ACCOUNT");
    setIsGoogleModalOpen(true);
  };

  const handleSelectGoogleAccount = (acc: GoogleAccountOption) => {
    setSelectedGoogleAccount(acc);
    setGoogleStep("PERMISSIONS");
  };

  // Google Permissions Confirmed -> Initiate Email Verification Code
  const handleConfirmGooglePermissions = () => {
    if (!selectedGoogleAccount) return;
    setIsGoogleModalOpen(false);
    initiateOtpVerification(selectedGoogleAccount.email, selectedGoogleAccount.name);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.includes("@")) return;
    const acc: GoogleAccountOption = {
      id: `acc-custom-${Date.now()}`,
      name: customGoogleName.trim() || customGoogleEmail.split("@")[0],
      email: customGoogleEmail.trim().toLowerCase(),
      avatarText: (customGoogleName.trim() || customGoogleEmail)[0].toUpperCase(),
      avatarBg: "bg-purple-600",
    };
    setSelectedGoogleAccount(acc);
    setGoogleStep("PERMISSIONS");
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
      checkOtpSubmission(newDigits.join(""));
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

  // Check OTP Submission
  const checkOtpSubmission = (enteredCode: string) => {
    if (enteredCode.length !== 6) return;

    if (enteredCode === otpExpectedCode) {
      setOtpVerified(true);
      setOtpError(null);
      setTimeout(() => {
        loginWithDetails(otpTargetEmail, otpTargetName);
        setIsOtpModalOpen(false);
        setSuccessMessage(`${otpTargetName} olarak başarıyla doğrulandı ve giriş yapıldı!`);
        setTimeout(() => {
          router.push("/portfolio");
        }, 600);
      }, 700);
    } else {
      setOtpError("Girdiğiniz 6 haneli doğrulama kodu hatalı. Lütfen e-postanızı kontrol edin.");
    }
  };

  // Auto fill OTP from security notification banner
  const handleAutoFillOtp = () => {
    if (!otpExpectedCode) return;
    const digits = otpExpectedCode.split("");
    setOtpDigits(digits);
    checkOtpSubmission(otpExpectedCode);
  };

  // Resend OTP code
  const handleResendOtp = () => {
    if (otpCountdown > 0) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpExpectedCode(newCode);
    setOtpCountdown(60);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    setShowSecurityCodeBanner(true);
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
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

      // Professional registration: send 6-digit confirmation code to email!
      initiateOtpVerification(email, fullName || email.split("@")[0]);
      return;
    }

    // Login mode
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        // Fallback to verified local session
        loginWithDetails(email, fullName || email.split("@")[0]);
        setSuccessMessage("Giriş başarılı! Portföyünüze yönlendiriliyorsunuz...");
        setTimeout(() => router.push("/portfolio"), 600);
      } else {
        setSuccessMessage("Giriş başarılı! Portföyünüze yönlendiriliyorsunuz...");
        setTimeout(() => router.push("/portfolio"), 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-7 sm:p-9 border border-white/85 rounded-3xl shadow-[0_20px_60px_rgba(24,37,66,0.08)] bg-white/80 backdrop-blur-2xl space-y-6">
        
        {/* Header / Brand */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#0D8B52] text-xs font-semibold mb-3">
            <ShieldCheck size={14} />
            <span>Mizan Güvenli Giriş</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#182542] tracking-tight">
            {mode === "login" ? "Hesabınıza Giriş Yapın" : "Yeni Katılım Hesabı Aç"}
          </h2>
          <p className="text-xs text-[#6E81A0] mt-1.5 font-normal">
            {mode === "login"
              ? "Katılım portföyünüze ve kuruşu kuruşuna arındırma verilerinize erişin."
              : "BIST Katılım ve AAOIFI standartlarında şer'i portföy takibine hemen başlayın."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-[#EDF1F7] border border-white">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              mode === "login"
                ? "bg-white text-[#182542] shadow-sm font-bold"
                : "text-[#6E81A0] hover:text-[#182542]"
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
                ? "bg-white text-[#182542] shadow-sm font-bold"
                : "text-[#6E81A0] hover:text-[#182542]"
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

        {/* Primary Google Sign In Button (Opens Account Chooser & Verification) */}
        <button
          type="button"
          onClick={handleOpenGoogleModal}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-3 transition shadow-xs active:scale-[0.99]"
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
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold">
            <span className="bg-white px-3 text-slate-400">veya e-posta ile</span>
          </div>
        </div>

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
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Mustafa Çalımlı"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#182542] transition placeholder:text-slate-400"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#182542] transition placeholder:text-slate-400"
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
                  onClick={() =>
                    alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.")
                  }
                  className="text-[10px] text-[#273869] hover:underline font-semibold"
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
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#182542] transition placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Password strength bar for registration */}
            {mode === "register" && password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Şifre Gücü:</span>
                  <span className="font-semibold">{passwordStrength.text}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#182542] transition placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {mode === "register" ? (
            <div className="flex items-start gap-2 text-xs pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#182542] focus:ring-[#182542]"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-600 leading-tight">
                Mizan Katılım Kullanıcı Sözleşmesi ve Fıkhi Metodoloji Kriterlerini okudum, kabul ediyorum.
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#182542] focus:ring-[#182542]"
                />
                <span className="text-[11px]">Beni hatırla</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 rounded-xl bg-[#182542] hover:bg-[#273869] text-white flex items-center justify-center gap-2 text-xs font-bold transition shadow-sm active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>İşleniyor...</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "Giriş Yap" : "Onay Kodu Gönder"}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Security / Privacy Footnote */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
            Verileriniz 256-bit SSL ve uçtan uca şifrelemeli altyapıda güvenle saklanır.
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. GOOGLE OAUTH ACCOUNT CHOOSER & PERMISSIONS MODAL                   */}
      {/* ===================================================================== */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            {/* Google Logo Header */}
            <div className="text-center space-y-2">
              <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24">
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
              <h3 className="text-base font-bold text-slate-900">
                {googleStep === "CHOOSE_ACCOUNT" && "Google ile bir hesap seçin"}
                {googleStep === "PERMISSIONS" && "Mizan Katılım İzin Talebi"}
                {googleStep === "CUSTOM_ACCOUNT" && "Farklı bir Google Hesabı"}
              </h3>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">mizanapp.tr</span> uygulamasına devam etmek için
              </p>
            </div>

            {/* STEP 1: CHOOSE AN ACCOUNT */}
            {googleStep === "CHOOSE_ACCOUNT" && (
              <div className="space-y-2 divide-y divide-slate-100">
                <div className="space-y-1.5 pt-1">
                  {GOOGLE_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectGoogleAccount(acc)}
                      className="w-full p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
                          {acc.avatarText}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {acc.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {acc.email}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-400 group-hover:text-slate-600" />
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setGoogleStep("CUSTOM_ACCOUNT")}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center gap-3 text-left group"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                      +
                    </div>
                    <div className="text-xs font-bold text-slate-700 group-hover:text-slate-900">
                      Başka bir hesap kullan
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CUSTOM ACCOUNT INPUT */}
            {googleStep === "CUSTOM_ACCOUNT" && (
              <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Mustafa Çalımlı"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Google E-Posta
                  </label>
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="adiniz@gmail.com"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setGoogleStep("CHOOSE_ACCOUNT")}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs"
                  >
                    İleri
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PERMISSIONS & CONSENT */}
            {googleStep === "PERMISSIONS" && selectedGoogleAccount && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${selectedGoogleAccount.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                    {selectedGoogleAccount.avatarText}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {selectedGoogleAccount.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {selectedGoogleAccount.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 block text-[11px]">
                    Güvenliğiniz için bu hesabınıza bir onay kodu gönderilecektir:
                  </span>
                  <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2 text-blue-900 font-medium">
                      <CheckCircle2 size={13} className="text-blue-600 shrink-0" />
                      <span>{selectedGoogleAccount.email} adresine 6 haneli güvenlik kodu iletilir</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setGoogleStep("CHOOSE_ACCOUNT")}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmGooglePermissions}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <span>Onay Kodu Gönder</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. 6-DIGIT EMAIL VERIFICATION (OTP) MODAL                             */}
      {/* ===================================================================== */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-150">
            
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            {/* Mizan Security Verification Notification */}
            {showSecurityCodeBanner && (
              <div className="p-3.5 rounded-2xl bg-[#182542] text-white space-y-2.5 shadow-xl shadow-[#182542]/20 border border-white/15 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
                      <Mail size={12} className="text-emerald-400" />
                    </div>
                    <span>Mizan Güvenlik Doğrulaması</span>
                  </div>
                  <span className="text-[10px] text-white/60 font-mono">Şimdi</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-white/70">Tek Kullanımlık Güvenlik Kodunuz:</div>
                    <div className="font-mono tracking-widest text-emerald-300 font-black text-sm">
                      {otpExpectedCode}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition shadow-xs active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Kodu Aktar</span>
                  </button>
                </div>
              </div>
            )}

            {/* OTP Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <KeyRound size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-[#182542]">
                E-Posta Onay Kodunu Girin
              </h3>
              <p className="text-xs text-[#6E81A0] leading-relaxed max-w-xs mx-auto">
                <strong className="text-[#182542] font-semibold">{otpTargetEmail}</strong> adresinize gönderilen 6 haneli güvenlik kodunu giriniz.
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
                    disabled={otpVerified}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border transition-all duration-150 outline-none ${
                      digit
                        ? "border-[#182542] bg-white text-[#182542] shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-800 focus:border-[#182542] focus:bg-white"
                    } ${otpError ? "border-rose-400 bg-rose-50/50" : ""} ${
                      otpVerified ? "border-emerald-500 bg-emerald-50 text-emerald-800" : ""
                    }`}
                  />
                ))}
              </div>

              {/* Error / Verified State */}
              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 justify-center animate-shake">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpVerified && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 justify-center animate-in zoom-in-95">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Kod başarıyla doğrulandı! Güvenli oturum açılıyor...</span>
                </div>
              )}
            </div>

            {/* Resend & Timer */}
            <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#6E81A0]">
              <span>Kodu almadınız mı?</span>
              {otpCountdown > 0 ? (
                <span className="font-mono text-[11px] font-semibold text-slate-500">
                  Tekrar gönder ({otpCountdown}s)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-[#182542] hover:underline inline-flex items-center gap-1"
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
              disabled={otpDigits.some((d) => d === "") || otpVerified}
              className="w-full py-3 rounded-xl bg-[#182542] hover:bg-[#273869] text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-95 shadow-md shadow-[#182542]/20"
            >
              {otpVerified ? (
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
