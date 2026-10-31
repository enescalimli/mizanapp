"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortfolioPurificationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portfolio?tab=arindirma");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#EEF0F4] dark:bg-[#000000] flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          Arındırma Defteri yükleniyor...
        </span>
      </div>
    </div>
  );
}
