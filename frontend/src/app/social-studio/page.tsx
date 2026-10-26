import { notFound } from "next/navigation";
import { SocialStudioClient } from "./SocialStudioClient";

export const metadata = {
  title: "Mizan Social Studio | Instagram Gönderi Üretici (Geliştirici Modu)",
  description: "Mizan App için 1080x1350 Instagram kart ve carousel üretim stüdyosu.",
  robots: { index: false, follow: false },
};

export default async function SocialStudioPage(props: {
  searchParams?: Promise<{ devKey?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const isDev = process.env.NODE_ENV === "development";
  const hasDevSecret = searchParams?.devKey === "mizan-dev-2026";

  // Sadece geliştirme (development) ortamında veya devKey parametresi ile erişilebilir
  if (!isDev && !hasDevSecret) {
    notFound();
  }

  return <SocialStudioClient />;
}
