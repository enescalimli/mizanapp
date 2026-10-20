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
}

const DEMO_USER: User = {
  id: "demo-user-katilim-001",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Katılım Yatırımcısı (Demo)" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "demo@mizanapp.tr",
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
};

const DEMO_PROFILE: Profile = {
  id: "demo-user-katilim-001",
  email: "demo@mizanapp.tr",
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
    // Demo oturumu yerel depodan kontrol et
    const savedDemo = typeof window !== "undefined" ? localStorage.getItem("mizanapp_demo_auth") : null;
    if (savedDemo === "true") {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Gerçek Supabase oturumu kontrol et
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const activeSession = data?.session ?? null;
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      if (activeSession?.user) {
        loadProfile(activeSession.user.id, activeSession.user.email || "");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, authSession: Session | null) => {
      setSession(authSession);
      setUser(authSession?.user ?? null);
      if (authSession?.user) {
        loadProfile(authSession.user.id, authSession.user.email || "");
      } else if (!isDemoUser) {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemoUser]);

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured()) {
      // Supabase yapılandırılmamışsa bilgilendirme hatası
      return {
        error: new Error(
          "Supabase henüz yapılandırılmamış. Lütfen .env.local dosyasına NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ekleyin veya 'Hızlı Demo Girişi' butonunu kullanın."
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
          "Supabase henüz yapılandırılmamış. Lütfen .env.local dosyasına Supabase anahtarlarınızı ekleyin veya 'Hızlı Demo Girişi' ile devam edin."
        ),
      };
    }
    const res = await signUpWithEmail(email, pass, name);
    return { error: res.error };
  };

  const signOut = async () => {
    if (isDemoUser) {
      setUser(null);
      setProfile(null);
      setIsDemoUser(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("mizanapp_demo_auth");
      }
      return;
    }
    await signOutUser();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const signInWithGoogle = async (): Promise<{ error: any }> => {
    if (!isSupabaseConfigured()) {
      // Supabase OAuth bağlı olmadığında güvenli demo girişini tetikle
      loginAsDemoUser();
      return { error: null };
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
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setIsDemoUser(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("mizanapp_demo_auth", "true");
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
