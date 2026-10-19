import React from "react";
import { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Hesap Aç | MizanApp.tr - Katılım Finansmanı",
  description: "MizanApp hesabı açarak BIST Katılım ve AAOIFI standartlarında hisse ve portföy takibine başlayın.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm initialMode="register" />
    </div>
  );
}
