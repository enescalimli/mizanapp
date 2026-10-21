import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FloatingBottomBar } from "@/components/FloatingBottomBar";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const viewport: Viewport = {
  themeColor: "#182542",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mizanapp.tr"),
  title: {
    default: "mizan katılım — Borsa İstanbul Helal Hisse Tarama & Arındırma Platformu",
    template: "%s | Mizan Katılım Finans",
  },
  description:
    "BIST Katılım (DİB/TKBB) ve AAOIFI standartlarında 626 hisse uygunluk tarama, çeyreklik KAP bilanço dipnot analizi, kuruşu kuruşuna arındırma ve hisse zekâtı SaaS platformu.",
  keywords: [
    "bist katılım",
    "helal hisse",
    "katılım endeksi",
    "fıkhi arındırma",
    "hisse zekatı",
    "diyanet hisse fetvası",
    "borsa istanbul helal hisseler",
    "mizan app",
  ],
  authors: [{ name: "Mizan Finans Teknolojileri", url: "https://mizanapp.tr" }],
  creator: "Mizan Finans",
  icons: {
    icon: "/brand/logo.svg",
    apple: "/brand/logo-180.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://mizanapp.tr",
    siteName: "Mizan Katılım Finans",
    title: "mizan katılım — Borsa İstanbul Helal Hisse Tarama & Arındırma Platformu",
    description:
      "BIST Katılım (DİB/TKBB) standartlarında 626 hisse tarama, anlık arındırma hesabı ve hisse zekâtı platformu.",
    images: [
      {
        url: "/brand/logo-180.png",
        width: 180,
        height: 180,
        alt: "Mizan Katılım Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mizan katılım — Borsa İstanbul Helal Hisse Tarama & Arındırma",
    description:
      "BIST Katılım standartlarında 626 hisse uygunluk tarama ve kuruşu kuruşuna arındırma platformu.",
    images: ["/brand/logo-180.png"],
  },
  robots: {
    index: true,
    follow: true,
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

          {/* Granüler Çerez İzin Banner'ı */}
          <CookieConsentBanner />

          {/* Mobil Alt Menü Barı */}
          <FloatingBottomBar />
        </AuthProvider>
      </body>
    </html>
  );
}
