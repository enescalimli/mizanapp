import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata: Metadata = {
  title: "mizanapp.tr — Katılım Uygunluk Tarama & Portföy Arındırma Platformu",
  description:
    "BIST Katılım (DİB/TKBB) ve AAOIFI standartlarında hisse uygunluk tarama, KAP bilanço dipnot analizi, kuruşu kuruşuna arındırma ve hisse zekatı hesaplayıcı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="antialiased min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-white/[0.07] bg-[#02050e]/90 backdrop-blur-xl py-8 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 space-y-2">
              <p className="font-semibold text-slate-300">
                mizanapp.tr &copy; {new Date().getFullYear()} — İslami Finans / Katılım Finansmanı Standartları
              </p>
              <p className="max-w-2xl mx-auto text-[11px] text-slate-400 leading-relaxed font-normal">
                Bu platformdaki tüm finansal ve arındırma hesaplamalarında IEEE 754 kayan nokta hatasını önlemek için kuruş ve baz puan bazlı Decimal mimarisi uygulanmaktadır. BIST Katılım Endeksi (TKBB/DİB) ve AAOIFI Shariah Standard No. 21 kriterleri baz alınmıştır.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
