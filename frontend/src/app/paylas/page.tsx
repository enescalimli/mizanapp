"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Search,
  Square,
  Smartphone,
  LayoutTemplate,
  Moon,
  Sun,
  ShieldCheck,
  TrendingUp,
  Scale,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";
import { SAMPLE_COMPANIES_SUMMARY, getCompanySummary } from "@/lib/data/sampleCompanies";

type CardFormat = "square" | "story" | "landscape";
type CardTheme = "dark" | "light";

export default function SocialShareStudioPage() {
  const [selectedTicker, setSelectedTicker] = useState<string>("BIMAS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [format, setFormat] = useState<CardFormat>("square");
  const [theme, setTheme] = useState<CardTheme>("dark");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stock summary data
  const company = getCompanySummary(selectedTicker) || SAMPLE_COMPANIES_SUMMARY[0];

  const drawRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 1080;
    let height = 1080;
    if (format === "story") {
      width = 1080;
      height = 1920;
    } else if (format === "landscape") {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;

    const isDark = theme === "dark";
    const isCompliant = company.bistStatus === "COMPLIANT";

    // 1. Background Gradient
    if (isDark) {
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#08090C");
      bgGrad.addColorStop(0.45, "#0E131F");
      bgGrad.addColorStop(1, "#182542");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const glow1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, width * 0.45);
      glow1.addColorStop(0, isCompliant ? "rgba(13, 139, 82, 0.24)" : "rgba(220, 38, 38, 0.22)");
      glow1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(width * 0.15, height * 0.85, 30, width * 0.15, height * 0.85, width * 0.5);
      glow2.addColorStop(0, "rgba(37, 99, 235, 0.18)");
      glow2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#F8FAFC");
      bgGrad.addColorStop(0.5, "#EEF2F6");
      bgGrad.addColorStop(1, "#E2E8F0");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const glow1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 10, width * 0.8, height * 0.2, width * 0.4);
      glow1.addColorStop(0, isCompliant ? "rgba(13, 139, 82, 0.1)" : "rgba(220, 38, 38, 0.08)");
      glow1.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);
    }

    // Border
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 4;
    drawRoundRect(ctx, 16, 16, width - 32, height - 32, 36);
    ctx.stroke();

    const padX = format === "landscape" ? 70 : 64;
    let currY = format === "landscape" ? 60 : 70;

    // 2. HEADER
    ctx.fillStyle = isDark ? "#FFFFFF" : "#182542";
    drawRoundRect(ctx, padX, currY, 52, 52, 16);
    ctx.fill();

    ctx.fillStyle = isDark ? "#182542" : "#FFFFFF";
    ctx.font = "bold 30px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("M", padX + 26, currY + 37);

    ctx.textAlign = "left";
    ctx.font = "900 32px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = isDark ? "#FFFFFF" : "#182542";
    ctx.fillText("mizan", padX + 68, currY + 36);

    const mizanW = ctx.measureText("mizan").width;
    ctx.fillStyle = isDark ? "#94A3B8" : "#273869";
    ctx.font = "400 32px system-ui, -apple-system, sans-serif";
    ctx.fillText("katılım", padX + 74 + mizanW, currY + 36);

    const stdText = "DİB & TKBB STANDARTLARI";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    const stdWidth = ctx.measureText(stdText).width;
    const stdPillX = width - padX - stdWidth - 36;

    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(24, 37, 66, 0.06)";
    drawRoundRect(ctx, stdPillX, currY + 6, stdWidth + 36, 40, 20);
    ctx.fill();
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(24, 37, 66, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = isDark ? "#E2E8F0" : "#182542";
    ctx.fillText(stdText, stdPillX + 18, currY + 31);

    currY += format === "landscape" ? 75 : 95;

    // 3. MAIN HERO
    const heroH = format === "landscape" ? 170 : 210;
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.85)";
    drawRoundRect(ctx, padX, currY, width - padX * 2, heroH, 28);
    ctx.fill();
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = isDark ? "#FFFFFF" : "#182542";
    ctx.font = "900 58px system-ui, -apple-system, sans-serif";
    ctx.fillText(company.ticker, padX + 32, currY + 65);

    ctx.fillStyle = isDark ? "#94A3B8" : "#64748B";
    ctx.font = "600 21px system-ui, -apple-system, sans-serif";
    const truncName = company.name.length > 36 ? company.name.slice(0, 36) + "..." : company.name;
    ctx.fillText(`${truncName} • ${company.sector}`, padX + 34, currY + 100);

    const priceFormatted = company.priceTRY.startsWith("₺") ? company.priceTRY : `₺${company.priceTRY}`;
    ctx.fillStyle = isDark ? "#F8FAFC" : "#0F172A";
    ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${priceFormatted} (${company.change24h})`, padX + 34, currY + 140);

    const badgeText = isCompliant ? "✓ BIST KATILIM UYUMLU" : "✕ KATILIM DIŞI";
    ctx.font = "900 20px system-ui, -apple-system, sans-serif";
    const bW = ctx.measureText(badgeText).width;
    const bX = width - padX - 32 - bW - 40;
    const bY = currY + 36;

    if (isCompliant) {
      ctx.fillStyle = isDark ? "rgba(13, 139, 82, 0.25)" : "rgba(13, 139, 82, 0.15)";
      drawRoundRect(ctx, bX, bY, bW + 40, 52, 26);
      ctx.fill();
      ctx.strokeStyle = isDark ? "#10B981" : "#0D8B52";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = isDark ? "#34D399" : "#0D8B52";
      ctx.fillText(badgeText, bX + 20, bY + 33);
    } else {
      ctx.fillStyle = isDark ? "rgba(220, 38, 38, 0.25)" : "rgba(220, 38, 38, 0.15)";
      drawRoundRect(ctx, bX, bY, bW + 40, 52, 26);
      ctx.fill();
      ctx.strokeStyle = isDark ? "#F87171" : "#DC2626";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = isDark ? "#FCA5A5" : "#DC2626";
      ctx.fillText(badgeText, bX + 20, bY + 33);
    }

    currY += heroH + (format === "landscape" ? 22 : 36);

    // 4. BENTO 4'LÜ RASYOLAR
    const cardGap = 18;
    const gridCols = format === "landscape" ? 4 : 2;
    const gridRows = format === "landscape" ? 1 : 2;
    const colW = (width - padX * 2 - (gridCols - 1) * cardGap) / gridCols;
    const colH = format === "landscape" ? 150 : 160;

    const metrics = [
      {
        title: "Faizli Borç / Piyasa Değ.",
        value: `%${company.debtRatioPercent.toFixed(1)}`,
        ceiling: "Azami %33,0",
        pass: company.debtRatioPercent <= 33,
      },
      {
        title: "Faizli Nakit & Menkul",
        value: `%${company.cashRatioPercent.toFixed(1)}`,
        ceiling: "Azami %33,0",
        pass: company.cashRatioPercent <= 33,
      },
      {
        title: "Uygunsuz Faaliyet Geliri",
        value: `%${company.impureIncomePercent.toFixed(1)}`,
        ceiling: "Azami %5,0",
        pass: company.impureIncomePercent <= 5,
      },
      {
        title: "Fıkhi Arındırma İnfakı",
        value: `₺${company.purificationPerShareTRY} / hisse`,
        ceiling: "Pro-Rata Çeyreklik",
        pass: true,
      },
    ];

    metrics.forEach((m, idx) => {
      const colIdx = idx % gridCols;
      const rowIdx = Math.floor(idx / gridCols);
      const cardX = padX + colIdx * (colW + cardGap);
      const cardY = currY + rowIdx * (colH + cardGap);

      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.9)";
      drawRoundRect(ctx, cardX, cardY, colW, colH, 22);
      ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.07)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = isDark ? "#94A3B8" : "#64748B";
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      ctx.fillText(m.title, cardX + 20, cardY + 36);

      ctx.fillStyle = isDark ? "#FFFFFF" : "#182542";
      ctx.font = "900 32px system-ui, -apple-system, sans-serif";
      ctx.fillText(m.value, cardX + 20, cardY + 82);

      ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
      if (m.pass) {
        ctx.fillStyle = isDark ? "#34D399" : "#0D8B52";
        ctx.fillText(`✓ ${m.ceiling}`, cardX + 20, cardY + 124);
      } else {
        ctx.fillStyle = isDark ? "#F87171" : "#DC2626";
        ctx.fillText(`✕ ${m.ceiling} Aşıldı`, cardX + 20, cardY + 124);
      }
    });

    currY += gridRows * (colH + cardGap) + (format === "landscape" ? 8 : 20);

    // 5. CALLOUT
    if (format !== "landscape") {
      const calloutH = format === "story" ? 280 : 170;
      ctx.fillStyle = isDark ? "rgba(37, 99, 235, 0.08)" : "rgba(37, 99, 235, 0.06)";
      drawRoundRect(ctx, padX, currY, width - padX * 2, calloutH, 24);
      ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(96, 165, 250, 0.25)" : "rgba(37, 99, 235, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = isDark ? "#60A5FA" : "#2563EB";
      ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
      ctx.fillText("✦ MİZAN AI FIKHİ DEĞERLENDİRME & BİLANÇO RÖNTGENİ", padX + 24, currY + 38);

      ctx.fillStyle = isDark ? "#E2E8F0" : "#334155";
      ctx.font = "500 17px system-ui, -apple-system, sans-serif";
      const verdict = isCompliant
        ? `${company.ticker} payları Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu 2021/11 kararı ve TKBB Danışma Kurulu standartlarını %100 karşılamaktadır. Katılım yatırımcısı helal portföyüne ekleyebilir.`
        : `${company.ticker} hissesi faizli finansal borç veya uygunsuz gelir tolerans tavanını aştığından BIST Katılım Endeksi dışındadır. Sektörel ikame alternatifleri incelenmelidir.`;

      const words = verdict.split(" ");
      let line = "";
      let lineY = currY + 74;
      const maxLineW = width - padX * 2 - 48;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const testW = ctx.measureText(testLine).width;
        if (testW > maxLineW && n > 0) {
          ctx.fillText(line, padX + 24, lineY);
          line = words[n] + " ";
          lineY += 28;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, padX + 24, lineY);
    }

    // 6. FOOTER
    const footerY = height - (format === "landscape" ? 42 : 55);
    ctx.textAlign = "left";
    ctx.fillStyle = isDark ? "#64748B" : "#94A3B8";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("mizanapp.tr • Borsa İstanbul Helal Hisse Tarama & Arındırma Platformu", padX, footerY);

    ctx.textAlign = "right";
    ctx.font = "600 14px system-ui, -apple-system, sans-serif";
    ctx.fillText("SPK Uyarısı: Yatırım Tavsiyesi Değildir (YTD)", width - padX, footerY);
  }, [selectedTicker, company, format, theme]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `mizan-${company.ticker.toLowerCase()}-${format}-${Date.now()}.png`;
      a.href = dataUrl;
      a.click();
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  const generatePostText = () => {
    const isCompliant = company.bistStatus === "COMPLIANT";
    const statusEmoji = isCompliant ? "✅" : "⚠️";
    const statusText = isCompliant ? "BIST Katılım Endeksi (XKTUM) Uyumlu" : "Katılım Endeksi Dışında";
    return `📊 #${company.ticker} Fıkhi & Finansal Analiz Raporu\n\n` +
      `${statusEmoji} Durum: ${statusText}\n` +
      `📌 Faizli Borç: %${company.debtRatioPercent.toFixed(1)} (Azami %33)\n` +
      `📌 Faizli Nakit: %${company.cashRatioPercent.toFixed(1)} (Azami %33)\n` +
      `📌 Uygunsuz Gelir: %${company.impureIncomePercent.toFixed(1)} (Azami %5)\n` +
      `📌 Çeyreklik Arındırma: ₺${company.purificationPerShareTRY} / hisse\n\n` +
      `Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu & TKBB standartlarında kuruşu kuruşuna arındırma infakı ve detaylı bilanço röntgeni:\n` +
      `🔗 https://mizanapp.tr/companies/${company.ticker}\n\n` +
      `#BIST100 #KatilimEndeksi #HelalFinans #Borsaİstanbul #${company.ticker}`;
  };

  const handleCopyCaption = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(generatePostText());
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(generatePostText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generatePostText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(`https://mizanapp.tr/companies/${company.ticker}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const filteredCompanies = SAMPLE_COMPANIES_SUMMARY.filter(
    (c) =>
      c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PaynoShell badge="paylas">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Üst Başlık */}
        <div className="bg-white/75 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[28px] border border-white/80 dark:border-white/10 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#182542] via-[#273869] to-[#0D8B52] text-white flex items-center justify-center shadow-md">
              <Share2 size={22} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-[#182542] dark:text-white tracking-tight">
                  Sosyal Medya Paylaşım Stüdyosu
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Otomatik Render
                </span>
              </div>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                X (Twitter), Instagram Gönderi/Story ve LinkedIn için hazır grafik kartları ve metinler üretin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-bold text-[#182542] dark:text-white hover:bg-slate-200 transition"
            >
              &larr; Genel Bakışa Dön
            </Link>
          </div>
        </div>

        {/* Ana Stüdyo Izgarası */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sol Kolon: Hisse Seçimi, Format ve Eylemler */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Hisse Seçimi */}
            <div className="bg-white/75 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[26px] p-5 border border-white/80 dark:border-white/10 shadow-xs space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] block">
                Paylaşılacak Hisseli Seçin
              </label>

              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hisse ara (örn: BIMAS, THYAO, ASELS)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-[#182542] dark:text-white placeholder:text-slate-400 outline-none focus:border-[#182542]"
                />
              </div>

              {/* Hızlı Seçim Hapları */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["BIMAS", "THYAO", "ASELS", "EREGL", "TUPRS", "TABGD", "FROTO", "PGSUS"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTicker(t)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      selectedTicker === t
                        ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Format & Tema */}
            <div className="bg-white/75 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[26px] p-5 border border-white/80 dark:border-white/10 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] block mb-2">
                  Format Seçimi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "square", label: "Kare (1:1)", icon: Square, sub: "Instagram/X" },
                    { id: "story", label: "Story (9:16)", icon: Smartphone, sub: "Hikaye/Reels" },
                    { id: "landscape", label: "Yatay (16:9)", icon: LayoutTemplate, sub: "X/LinkedIn" },
                  ].map((f) => {
                    const Icon = f.icon;
                    const isActive = format === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormat(f.id as CardFormat)}
                        className={`p-3 rounded-2xl border transition text-center flex flex-col items-center gap-1 ${
                          isActive
                            ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869] shadow-sm"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-xs font-bold block">{f.label}</span>
                        <span className="text-[9px] opacity-70 block">{f.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] block mb-2">
                  Tema Seçimi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-2.5 rounded-2xl border transition flex items-center justify-center gap-2 text-xs font-bold ${
                      theme === "dark"
                        ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869]"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Moon size={14} />
                    <span>OLED Koyu Mod</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-2.5 rounded-2xl border transition flex items-center justify-center gap-2 text-xs font-bold ${
                      theme === "light"
                        ? "bg-[#182542] dark:bg-[#273869] text-white border-[#182542] dark:border-[#273869]"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Sun size={14} />
                    <span>Açık Cam Mod</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="bg-white/75 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[26px] p-5 border border-white/80 dark:border-white/10 shadow-xs space-y-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0D8B52] hover:bg-[#0b7444] text-white text-xs font-black shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Download size={16} />
                <span>Görsel Kartı İndir (Retina PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCaption}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-[#182542] dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                {copiedCaption ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copiedCaption ? "Gönderi Metni Kopyalandı!" : "Paylaşım Metnini Kopyala"}</span>
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex gap-2">
                <button
                  type="button"
                  onClick={handleShareTwitter}
                  className="flex-1 py-2 px-3 rounded-xl bg-black text-white hover:bg-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>𝕏 / Twitter</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba59] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#0A66C2] text-white hover:bg-[#084e96] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>LinkedIn</span>
                </button>
              </div>
            </div>

          </div>

          {/* Sağ Kolon: Canlı Önizleme & Hazır Gönderi Şablonu */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Canlı Render Kartı */}
            <div className="p-5 sm:p-6 rounded-[28px] bg-slate-100/70 dark:bg-black/60 border border-slate-200/60 dark:border-white/10 flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between text-xs font-mono text-[#6E81A0] dark:text-[#94A3B8] mb-4 px-2">
                <span>CANLI ÖNİZLEME • {format.toUpperCase()}</span>
                <span>1080px Retina Render</span>
              </div>

              <div className="w-full flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="max-h-[550px] w-auto max-w-full rounded-2xl shadow-2xl border border-slate-300/40 dark:border-white/15"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>

            {/* Hazır Sosyal Medya Metni Önizlemesi */}
            <div className="bg-white/75 dark:bg-[#0E1015]/80 backdrop-blur-2xl rounded-[26px] p-5 border border-white/80 dark:border-white/10 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8]">
                  Örnek Sosyal Medya Gönderi Metni
                </span>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Copy size={12} />
                  <span>Kopyala</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                {generatePostText()}
              </pre>
            </div>

          </div>

        </div>

      </div>
    </PaynoShell>
  );
}
