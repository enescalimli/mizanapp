import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { FloatingBottomBar } from "@/components/FloatingBottomBar";
import { AuthProvider } from "@/lib/auth/AuthContext";
import Link from "next/link";

export const metadata: Metadata = {
  title: "mizanapp.tr — Borsa İstanbul Helal Hisse Tarama & Arındırma Platformu",
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
      <body className="antialiased min-h-screen bg-[#F3F6FB] text-[#182542] flex flex-col selection:bg-[#E6F8EF] selection:text-[#0D8B52]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-24 sm:pb-28">{children}</main>

          {/* SLIDE 15: FLOATING BOTTOM BAR WITH RAISED ACTION */}
          <FloatingBottomBar />

          {/* ORBIX / MUSAFFA CLEAN WHITE FOOTER */}
          <footer className="bg-white border-t border-[#E2E8F0] pt-12 pb-28 px-4 sm:px-6 lg:px-8 text-xs text-[#6E81A0]">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#EDF1F4]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg tracking-tight text-[#182542]">
                      mizan<span className="text-[#273869]">.</span>
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EDF1F4] text-[#273869] font-semibold">
                      Katılım Finans Terminali
                    </span>
                  </div>
                  <p className="text-xs text-[#6E81A0] max-w-md">
                    Borsa İstanbul yatırımcıları için şeffaf, kuruş hassasiyetli İslami finans denetim ve arındırma platformu.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 font-semibold text-xs text-[#405881]">
                  <Link href="/#screener-table" className="hover:text-[#273869] transition">
                    Hisseler &amp; Tarayıcı
                  </Link>
                  <Link href="/ipo" className="hover:text-[#273869] transition">
                    Halka Arz Takvimi
                  </Link>
                  <Link href="/portfolio" className="hover:text-[#273869] transition">
                    Portföy Paneli
                  </Link>
                  <Link href="/purification" className="hover:text-[#273869] transition">
                    Arındırma &amp; Zekât
                  </Link>
                  <Link href="/rehber" className="hover:text-[#273869] transition">
                    Fıkıh &amp; Rehber
                  </Link>
                </div>
              </div>

              <div className="space-y-3 text-[#8B9BB4] font-normal leading-relaxed text-xs">
                <p>
                  <strong className="text-[#405881] font-semibold">Standart &amp; Metodoloji Referansları:</strong> mizanapp.tr; Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu kararları, Türkiye Katılım Bankaları Birliği (TKBB) Danışma Kurulu standartları ve Accounting and Auditing Organization for Islamic Financial Institutions (AAOIFI) Shariah Standard No. 21 kriterlerini referans alır.
                </p>
                <p>
                  <strong className="text-[#405881] font-semibold">Yasal Uyarı:</strong> Bu platformdaki finansal analizler, uygunluk durumları ve arındırma hesaplamaları Kamuyu Aydınlatma Platformu (KAP) resmi finansal tablolarından çekilmekte olup yatırım tavsiyesi niteliği taşımaz.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#8B9BB4] border-t border-[#EDF1F4]">
                  <p>&copy; {new Date().getFullYear()} mizanapp.tr. Tüm hakları saklıdır.</p>
                  <p className="font-mono text-xs">Payno Design System • IEEE 754 Zero-Float (Decimal)</p>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
