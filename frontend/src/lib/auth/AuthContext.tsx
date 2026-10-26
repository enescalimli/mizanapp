"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  Profile,
} from "@/lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isDemoUser: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string, name?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loginAsDemoUser: () => void;
  loginWithDetails: (email: string, fullName: string) => void;
}

const DEMO_USER: User = {
  id: "user-katilim-001",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Mustafa Çalımlı" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "yatirimci@mizanapp.tr",
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
};

const DEMO_PROFILE: Profile = {
  id: "user-katilim-001",
  email: "yatirimci@mizanapp.tr",
  full_name: "Mustafa Çalımlı",
  avatar_url: null,
  phone_number: "+90 555 123 4567",
  preferred_standard: "BIST_KATILIM_DIB",
  purification_ceiling_rounding: true,
  zakat_calculation_preference: "AUTO",
  alert_notifications_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  // Profile yükleme fonksiyonu
  const loadProfile = async (userId: string, email: string) => {
    if (!isSupabaseConfigured()) {
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data as Profile);
      } else {
        // Profil henüz oluşmadıysa geçici profil objesi ata
        setProfile({
          id: userId,
          email: email,
          full_name: email.split("@")[0],
          avatar_url: null,
          phone_number: null,
          preferred_standard: "BIST_KATILIM_DIB",
          purification_ceiling_rounding: true,
          zakat_calculation_preference: "AUTO",
          alert_notifications_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Profil yüklenirken hata:", err);
    }
  };

  useEffect(() => {
    // 1. Sadece kullanıcı bilerek oturum açtıysa ve oturumu sakladıysa geri yükle
    let hasLocalAuth = false;
    if (typeof window !== "undefined") {
      try {
        const savedDemo = localStorage.getItem("mizanapp_demo_auth");
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo);
          if (parsed && parsed.email) {
            loginWithDetails(parsed.email, parsed.fullName || parsed.email.split("@")[0]);
            hasLocalAuth = true;
          }
        }
      } catch {
        localStorage.removeItem("mizanapp_demo_auth");
      }
    }

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // 2. Gerçek Supabase oturumu kontrol et (Var olan yerel oturumu ezme)
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const activeSession = data?.session ?? null;
      if (activeSession?.user) {
        setSession(activeSession);
        setUser(activeSession.user);
        setIsDemoUser(false);
        loadProfile(activeSession.user.id, activeSession.user.email || "");
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, authSession: Session | null) => {
      if (authSession?.user) {
        setSession(authSession);
        setUser(authSession.user);
        setIsDemoUser(false);
        loadProfile(authSession.user.id, authSession.user.email || "");
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        if (!hasLocalAuth) {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured()) {
      return {
        error: new Error(
          "Kimlik doğrulama sunucusu ile bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol ediniz."
        ),
      };
    }
    const res = await signInWithEmail(email, pass);
    if (!res.error && res.data.user) {
      setIsDemoUser(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("mizanapp_demo_auth");
      }
    }
    return { error: res.error };
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    if (!isSupabaseConfigured()) {
      return {
        error: new Error(
          "Kimlik doğrulama sunucusu ile bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol ediniz."
        ),
      };
    }
    const res = await signUpWithEmail(email, pass, name);
    return { error: res.error };
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mizanapp_demo_auth");
    }
    if (isDemoUser) {
      setUser(null);
      setProfile(null);
      setIsDemoUser(false);
      return;
    }
    await signOutUser();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const signInWithGoogle = async (): Promise<{ error: any }> => {
    if (!isSupabaseConfigured()) {
      return {
        error: new Error(
          "Google kimlik doğrulama servisi henüz yapılandırılmadı. Lütfen e-posta ve şifrenizle giriş yapınız."
        ),
      };
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/portfolio` : undefined,
        },
      });
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  const loginAsDemoUser = () => {
    loginWithDetails("yatirimci@mizanapp.tr", "Mustafa Çalımlı");
  };

  const loginWithDetails = (email: string, fullName: string) => {
    const customUser: User = {
      id: `usr-${Date.now()}`,
      app_metadata: { provider: "google" },
      user_metadata: { full_name: fullName },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: email,
      phone: "",
      role: "authenticated",
      updated_at: new Date().toISOString(),
    };
    const customProfile: Profile = {
      id: customUser.id,
      email: email,
      full_name: fullName,
      avatar_url: null,
      phone_number: "+90 555 123 4567",
      preferred_standard: "BIST_KATILIM_DIB",
      purification_ceiling_rounding: true,
      zakat_calculation_preference: "AUTO",
      alert_notifications_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(customUser);
    setProfile(customProfile);
    setIsDemoUser(true);
    setLoading(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("mizanapp_demo_auth", JSON.stringify({ email, fullName }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isDemoUser,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        loginAsDemoUser,
        loginWithDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
