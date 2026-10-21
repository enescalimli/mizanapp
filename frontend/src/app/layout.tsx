import type { Metadata } from "next";
import "./globals.css";
import { FloatingBottomBar } from "@/components/FloatingBottomBar";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata: Metadata = {
  title: "mizan katılım — Borsa İstanbul Helal Hisse Tarama & Arındırma Platformu",
  description:
    "Diyanet (DİB) ve TKBB Danışma Kurulu Katılım Finans Standartlarında 626 BIST hisse uygunluk tarama, finansal rasyolar, KAP bildirimleri ve fıkhi arındırma platformu.",
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
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('mizan_theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'DARK' || (!saved && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen text-[#182542] dark:text-[#F1F5F9] selection:bg-[#E6F8EF] selection:text-[#0D8B52]">
        <AuthProvider>
          {children}

          {/* SLIDE 15: FLOATING BOTTOM BAR WITH RAISED ACTION (Yalnızca Mobil Ekranda) */}
          <FloatingBottomBar />
        </AuthProvider>
      </body>
    </html>
  );
}
