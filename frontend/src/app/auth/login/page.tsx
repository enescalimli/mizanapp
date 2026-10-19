import React from "react";
import { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Giriş Yap | MizanApp.tr - Katılım Finansmanı",
  description: "MizanApp hesabınıza giriş yaparak katılım uygunluk, arındırma ve zekat hesaplarınızı yönetin.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm initialMode="login" />
    </div>
  );
}
