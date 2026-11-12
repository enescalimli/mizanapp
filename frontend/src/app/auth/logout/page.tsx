"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { RefreshCw } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await signOut();
      } catch (err) {
        console.error("Çıkış hatası:", err);
      } finally {
        if (typeof window !== "undefined") {
          localStorage.removeItem("mizanapp_demo_auth");
          localStorage.removeItem("mizan_user_session");
        }
        router.replace("/");
      }
    };

    doLogout();
  }, [signOut, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F4F5F7] dark:bg-[#08080C] text-[#08080C] dark:text-white">
      <div className="flex items-center gap-3 p-6 rounded-2xl bg-white/80 dark:bg-[#101118]/95 border border-slate-200 dark:border-white/10 shadow-lg">
        <RefreshCw size={18} className="animate-spin text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-semibold">Oturumunuz kapatılıyor, lütfen bekleyiniz...</span>
      </div>
    </div>
  );
}
