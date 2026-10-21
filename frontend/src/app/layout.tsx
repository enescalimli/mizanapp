import type { Metadata } from "next";
import "./globals.css";
import { FloatingBottomBar } from "@/components/FloatingBottomBar";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata: Metadata = {
  title: "payno katılım — Borsa İstanbul Helal Hisse Tarama & Arındırma Platformu",
  description:
    "BIST Katılım (DİB/TKBB) ve AAOIFI standartlarında hisse uygunluk tarama, KAP bilanço dipnot analizi, kuruşu kuruşuna arındırma ve hisse zekatı hesaplayıcı.",
  icons: {
    icon: "/brand/logo.svg",
    apple: "/brand/logo-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased min-h-screen bg-[#EBEEF2] text-[#182542] selection:bg-[#E6F8EF] selection:text-[#0D8B52]">
        <AuthProvider>
          {children}

          {/* SLIDE 15: FLOATING BOTTOM BAR WITH RAISED ACTION (Yalnızca Mobil Ekranda) */}
          <FloatingBottomBar />
        </AuthProvider>
      </body>
    </html>
  );
}
