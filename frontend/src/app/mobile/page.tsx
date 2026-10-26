"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Radio,
  Coins,
  ArrowRight,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Scale,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function MobileAppEntryPage() {
  const router = useRouter();
  const { user, profile, isDemoUser, loginWithDetails } = useAuth();

  const [viewMode, setViewMode] = useState<"welcome" | "login" | "register">("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkingSavedSession, setCheckingSavedSession] = useState(true);

  // Zaten giriş yapmış kullanıcıyı doğrudan Dashboard'a yönlendir
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem("mizanapp_demo_auth");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          loginWithDetails(parsed.email, parsed.fullName || parsed.email.split("@")[0]);
          router.replace("/dashboard");
          return;
        }
      }
    } catch {
      // ignore
    }

    if (user || isDemoUser) {
      router.replace("/dashboard");
      return;
    }

    setCheckingSavedSession(false);
  }, [user, isDemoUser, router, loginWithDetails]);

  // Giriş Yap İşlemi
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Lütfen e-posta ve şifrenizi giriniz.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/password-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Girdiğiniz e-posta veya şifre hatalı.");
        setIsLoading(false);
        return;
      }

      loginWithDetails(data.user.email, data.user.fullName || data.user.email.split("@")[0]);
      setSuccessMessage("Giriş başarılı! Uygulama açılıyor...");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 400);
    } catch {
      setErrorMessage("Bağlantı hatası: Sunucuya ulaşılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  // Yeni Kayıt İşlemi
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Lütfen tüm alanları doldurunuz.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/password-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          email,
          password,
          fullName: fullName.trim() || email.split("@")[0],
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Kayıt oluşturulamadı.");
        setIsLoading(false);
        return;
      }

      loginWithDetails(data.user.email, data.user.fullName);
      setSuccessMessage("Hesabınız oluşturuldu! Uygulama açılıyor...");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 400);
    } catch {
      setErrorMessage("Bağlantı hatası: Kayıt servisine ulaşılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hızlı Demo / Yatırımcı Girişi (Tek Dokunuşla)
  const handleFastDemoLogin = () => {
    loginWithDetails("yatirimci@mizanapp.tr", "Mustafa Enes Çalımlı");
    router.replace("/dashboard");
  };

  if (checkingSavedSession) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#182542] via-[#273869] to-[#0D8B52]/40 p-3 border border-white/10 flex items-center justify-center animate-pulse">
          <Image src="/brand/logo-white.svg" alt="Mizan" width={40} height={40} className="object-contain" priority />
        </div>
        <span className="text-xs font-bold text-slate-400 mt-4 tracking-wider uppercase">
          Mizan Katılım Yükleniyor...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between p-5 sm:p-8 relative overflow-hidden select-none">
      {/* Arka Plan Atmosferik Parlamalar */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#273869]/20 rounded-full blur-3xl pointer-events-none" />

      {/* =================================================================== */}
      {/* 1. ÜST MARKA VE LOGO ALANI                                           */}
      {/* =================================================================== */}
      <div className="relative z-10 pt-4 flex flex-col items-center text-center">
        {/* Logo Kutusu */}
        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-[#182542] via-[#273869] to-[#0D8B52]/30 p-3.5 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex items-center justify-center mb-4 transition-transform active:scale-95">
          <Image
            src="/brand/logo-white.svg"
            alt="Mizan Katılım"
            width={52}
            height={52}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        {/* Marka İsmi */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            mizan
          </span>
          <span className="text-xs font-extrabold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 uppercase tracking-wider">
            katılım
          </span>
        </div>

        <p className="text-xs text-slate-400 max-w-xs mt-1.5 font-medium leading-relaxed">
          Borsa İstanbul Helal Hisse Tarama, Canlı KAP &amp; Arındırma Platformu
        </p>
      </div>

      {/* =================================================================== */}
      {/* 2. ORTA ALAN: MOD'A GÖRE DEĞİŞEN İÇERİK                               */}
      {/* =================================================================== */}
      <div className="relative z-10 w-full max-w-sm mx-auto my-auto py-4">
        {/* MOD 1: WELCOME (Açılış Karşılama Ekranı) */}
        {viewMode === "welcome" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* 3 Öne Çıkan Özellik Kartı */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">3 Altın Rasyo Fıkhi Denetim</span>
                  <span className="text-[11px] text-slate-400">DİB ve TKBB standartlarında BIST hisse uygunluk filtresi</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                  <Radio size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Canlı KAP &amp; SPK Akışı</span>
                  <span className="text-[11px] text-slate-400">KAFİF beyanları, devre kesiciler ve sermaye artırımları</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <Scale size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Kuruşu Kuruşuna Tathir</span>
                  <span className="text-[11px] text-slate-400">Temettü arındırma ve hisse zekâtı hesap defteri</span>
                </div>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="pt-2 space-y-2.5">
              {/* Giriş Yap */}
              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setErrorMessage(null);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#273869] hover:bg-[#324884] text-white text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Giriş Yap</span>
                <ArrowRight size={16} />
              </button>

              {/* Yeni Hesap Aç */}
              <button
                type="button"
                onClick={() => {
                  setViewMode("register");
                  setErrorMessage(null);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Yeni Hesap Oluştur</span>
              </button>

              {/* Giriş Yapmadan İncele / Misafir Girişi */}
              <button
                type="button"
                onClick={() => router.replace("/dashboard")}
                className="w-full py-2.5 text-center text-xs font-semibold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                <span>Giriş Yapmadan Piyasayı İncele</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* MOD 2: GİRİŞ YAP FORMU */}
        {viewMode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setViewMode("welcome")}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={14} />
                <span>Geri</span>
              </button>
              <span className="text-xs font-bold text-white">Hesabınıza Giriş Yapın</span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                {successMessage}
              </div>
            )}

            {/* E-posta */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">E-posta</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Şifre</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-emerald-400 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#273869] hover:bg-[#324884] disabled:opacity-50 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Kontrol Ediliyor...</span>
                </>
              ) : (
                <span>Giriş Yap</span>
              )}
            </button>

            {/* Hızlı Demo Girişi (Tek Dokunuşla) */}
            <button
              type="button"
              onClick={handleFastDemoLogin}
              className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Tek Dokunuşla Hızlı Yatırımcı Girişi</span>
            </button>

            {/* Alt Linkler */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setViewMode("register")}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Hesabınız yok mu? <span className="text-emerald-400 font-bold">Kayıt Olun</span>
              </button>
            </div>
          </form>
        )}

        {/* MOD 3: YENİ KAYIT FORMU */}
        {viewMode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setViewMode("welcome")}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={14} />
                <span>Geri</span>
              </button>
              <span className="text-xs font-bold text-white">Yeni Katılım Hesabı Aç</span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Ad Soyad */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Ad Soyad</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Mustafa Çalımlı"
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* E-posta */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">E-posta</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Şifre (En az 6 karakter)</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Şifre Tekrar */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Şifre Tekrar</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] border border-white/15 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Kayıt Butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Kayıt Oluşturuluyor...</span>
                </>
              ) : (
                <span>Hesap Aç ve Başla</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setViewMode("login")}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Zaten hesabınız var mı? <span className="text-emerald-400 font-bold">Giriş Yapın</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. ALT GÜVENLİK VE STANDART İMZASI                                   */}
      {/* =================================================================== */}
      <div className="relative z-10 text-center pb-2">
        <div className="inline-flex items-center gap-2 text-[10px] text-slate-400">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span>Diyanet İşleri Başkanlığı &amp; TKBB Standartları</span>
        </div>
      </div>
    </div>
  );
}
