import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata: Metadata = {
  title: "mizanapp.tr — Modern Katılım Finans, Bilanço X-Ray & Arındırma Terminali",
  description:
    "BIST Katılım (DİB/TKBB) ve AAOIFI standartlarında hisse uygunluk tarama, KAP bilanço dipnot analizi, kuruşu kuruşuna arındırma ve hisse zekatı hesaplayıcı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        data-theme="sapphire"
        className="antialiased min-h-screen theme-bg flex flex-col selection:bg-sky-500/30 selection:text-sky-300"
      >
        <AuthProvider>
          <Navbar>
            <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
              <div className="flex-1">{children}</div>
              <footer className="border-t border-[var(--border-col)] py-6 px-6 text-center text-xs theme-muted">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p className="font-semibold">
                    mizanapp.tr &copy; {new Date().getFullYear()} — Katılım Finansmanı &amp; AAOIFI No. 21 Denetim Terminali
                  </p>
                  <p className="text-xs opacity-80">
                    Sıfır-Float (Decimal) Finansal Motor • Canlı BIST &amp; KAP Otomatik Senkronizasyon
                  </p>
                </div>
              </footer>
            </div>
          </Navbar>
        </AuthProvider>
      </body>
    </html>
  );
}
