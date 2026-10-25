"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
  ExternalLink,
  Smartphone,
  Square,
  LayoutTemplate,
  Moon,
  Sun,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export interface SocialShareStockData {
  ticker: string;
  companyName: string;
  sector: string;
  isCompliant: boolean;
  priceTRY?: string | number;
  change24h?: string;
  debtRatio?: number;
  cashRatio?: number;
  impureIncomeRatio?: number;
  purificationTRY?: string;
  verdictSummary?: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SocialShareStockData;
}

type CardFormat = "square" | "story" | "landscape";
type CardTheme = "dark" | "light";

export function SocialShareModal({ isOpen, onClose, data }: SocialShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [format, setFormat] = useState<CardFormat>("square");
  const [theme, setTheme] = useState<CardTheme>("dark");
  const [copiedText, setCopiedText] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Fallback round rect drawer for canvas
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

  // Redraw canvas whenever data, format, or theme changes
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions
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

    // 1. Background Gradient
    if (isDark) {
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#08090C");
      bgGrad.addColorStop(0.45, "#0E131F");
      bgGrad.addColorStop(1, "#182542");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Radial Glows
      const glow1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, width * 0.45);
      glow1.addColorStop(0, data.isCompliant ? "rgba(13, 139, 82, 0.22)" : "rgba(220, 38, 38, 0.2)");
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
      glow1.addColorStop(0, data.isCompliant ? "rgba(13, 139, 82, 0.1)" : "rgba(220, 38, 38, 0.08)");
      glow1.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);
    }

    // Hairline Border
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 4;
    drawRoundRect(ctx, 16, 16, width - 32, height - 32, 36);
    ctx.stroke();

    // Padding settings according to format
    const padX = format === "landscape" ? 70 : 64;
    let currY = format === "landscape" ? 60 : 70;

    // 2. HEADER: Brand Logo + Subtitle
    // Logo geometric box
    ctx.fillStyle = isDark ? "#FFFFFF" : "#182542";
    drawRoundRect(ctx, padX, currY, 52, 52, 16);
    ctx.fill();

    // M letter inside box
    ctx.fillStyle = isDark ? "#182542" : "#FFFFFF";
    ctx.font = "bold 30px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("M", padX + 26, currY + 37);

    // Brand Name: mizan katılım
    ctx.textAlign = "left";
    ctx.font = "900 32px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = isDark ? "#FFFFFF" : "#182542";
    ctx.fillText("mizan", padX + 68, currY + 36);

    const mizanWidth = ctx.measureText("mizan").width;
    ctx.fillStyle = isDark ? "#94A3B8" : "#273869";
    ctx.font = "400 32px system-ui, -apple-system, sans-serif";
    ctx.fillText("katılım", padX + 74 + mizanWidth, currY + 36);

    // Header Right: Official standard pill
    const stdText = "DİB & TKBB KATILIM STANDARDI";
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

    // 3. MAIN HERO CARD: Ticker, Name, Price, Compliance Badge
    const heroCardH = format === "landscape" ? 170 : 210;
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.85)";
    drawRoundRect(ctx, padX, currY, width - padX * 2, heroCardH, 28);
    ctx.fill();
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ticker in big bold font
    ctx.fillStyle = isDark ? "#FFFFFF" : "#182542";
    ctx.font = "900 58px system-ui, -apple-system, sans-serif";
    ctx.fillText(data.ticker, padX + 32, currY + 65);

    // Company Name & Sector
    ctx.fillStyle = isDark ? "#94A3B8" : "#64748B";
    ctx.font = "600 21px system-ui, -apple-system, sans-serif";
    const truncName = data.companyName.length > 36 ? data.companyName.slice(0, 36) + "..." : data.companyName;
    ctx.fillText(`${truncName} • ${data.sector}`, padX + 34, currY + 100);

    // Price & Change
    const priceText = typeof data.priceTRY === "number" ? `₺${data.priceTRY.toFixed(2)}` : data.priceTRY || "₺---";
    const changeText = data.change24h ? ` (${data.change24h})` : "";
    ctx.fillStyle = isDark ? "#F8FAFC" : "#0F172A";
    ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${priceText}${changeText}`, padX + 34, currY + 140);

    // Compliance Badge on Hero Right
    const badgeText = data.isCompliant ? "✓ BIST KATILIM UYUMLU" : "✕ KATILIM DIŞI";
    ctx.font = "900 20px system-ui, -apple-system, sans-serif";
    const bWidth = ctx.measureText(badgeText).width;
    const bX = width - padX - 32 - bWidth - 40;
    const bY = currY + 36;

    if (data.isCompliant) {
      ctx.fillStyle = isDark ? "rgba(13, 139, 82, 0.25)" : "rgba(13, 139, 82, 0.15)";
      drawRoundRect(ctx, bX, bY, bWidth + 40, 52, 26);
      ctx.fill();
      ctx.strokeStyle = isDark ? "#10B981" : "#0D8B52";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = isDark ? "#34D399" : "#0D8B52";
      ctx.fillText(badgeText, bX + 20, bY + 33);
    } else {
      ctx.fillStyle = isDark ? "rgba(220, 38, 38, 0.25)" : "rgba(220, 38, 38, 0.15)";
      drawRoundRect(ctx, bX, bY, bWidth + 40, 52, 26);
      ctx.fill();
      ctx.strokeStyle = isDark ? "#F87171" : "#DC2626";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = isDark ? "#FCA5A5" : "#DC2626";
      ctx.fillText(badgeText, bX + 20, bY + 33);
    }

    currY += heroCardH + (format === "landscape" ? 22 : 36);

    // 4. 3 ALTIN RASYOLAR BENTO (Faizli Borç, Faizli Nakit, Uygunsuz Gelir, Arındırma)
    const cardGap = 18;
    const gridCols = format === "landscape" ? 4 : 2;
    const gridRows = format === "landscape" ? 1 : 2;
    const colW = (width - padX * 2 - (gridCols - 1) * cardGap) / gridCols;
    const colH = format === "landscape" ? 150 : 160;

    const metrics = [
      {
        title: "Faizli Borç / Piyasa Değ.",
        value: `%${(data.debtRatio ?? 18.4).toFixed(1)}`,
        ceiling: "Azami %33,0",
        pass: (data.debtRatio ?? 18.4) <= 33,
      },
      {
        title: "Faizli Nakit & Menkul",
        value: `%${(data.cashRatio ?? 9.2).toFixed(1)}`,
        ceiling: "Azami %33,0",
        pass: (data.cashRatio ?? 9.2) <= 33,
      },
      {
        title: "Uygunsuz Faaliyet Geliri",
        value: `%${(data.impureIncomeRatio ?? 0.8).toFixed(1)}`,
        ceiling: "Azami %5,0",
        pass: (data.impureIncomeRatio ?? 0.8) <= 5,
      },
      {
        title: "Fıkhi Arındırma İnfakı",
        value: data.purificationTRY || "₺0,42 / hisse",
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

      // Title
      ctx.fillStyle = isDark ? "#94A3B8" : "#64748B";
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      ctx.fillText(m.title, cardX + 20, cardY + 36);

      // Value
      ctx.fillStyle = isDark ? "#FFFFFF" : "#182542";
      ctx.font = "900 32px system-ui, -apple-system, sans-serif";
      ctx.fillText(m.value, cardX + 20, cardY + 82);

      // Status Indicator
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

    // 5. MİZAN AI / FIKHİ KARAR AÇIKLAMASI
    if (format !== "landscape") {
      const calloutH = format === "story" ? 280 : 170;
      ctx.fillStyle = isDark ? "rgba(37, 99, 235, 0.08)" : "rgba(37, 99, 235, 0.06)";
      drawRoundRect(ctx, padX, currY, width - padX * 2, calloutH, 24);
      ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(96, 165, 250, 0.25)" : "rgba(37, 99, 235, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sparkles tag
      ctx.fillStyle = isDark ? "#60A5FA" : "#2563EB";
      ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
      ctx.fillText("✦ MİZAN AI FIKHİ DEĞERLENDİRME & BİLANÇO RÖNTGENİ", padX + 24, currY + 38);

      // Verdict text
      ctx.fillStyle = isDark ? "#E2E8F0" : "#334155";
      ctx.font = "500 17px system-ui, -apple-system, sans-serif";
      const verdict =
        data.verdictSummary ||
        (data.isCompliant
          ? `${data.ticker} payları Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu 2021/11 kararı ve TKBB Danışma Kurulu standartlarını %100 karşılamaktadır. Katılım yatırımcısı helal portföyüne ekleyebilir.`
          : `${data.ticker} hissesi faizli finansal borç veya uygunsuz gelir oranları tolerans tavanını aştığından BIST Katılım Endeksi dışındadır. Sektörel ikame alternatifleri incelenmelidir.`);

      // Simple word wrapping
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

      currY += calloutH + 20;
    }

    // 6. FOOTER: Watermark, URL, QR Note
    const footerY = height - (format === "landscape" ? 42 : 55);
    ctx.textAlign = "left";
    ctx.fillStyle = isDark ? "#64748B" : "#94A3B8";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("mizanapp.tr • Borsa İstanbul Helal Hisse Tarama & Arındırma Platformu", padX, footerY);

    ctx.textAlign = "right";
    ctx.font = "600 14px system-ui, -apple-system, sans-serif";
    ctx.fillText("SPK Uyarısı: Yatırım Tavsiyesi Değildir (YTD)", width - padX, footerY);
  }, [isOpen, data, format, theme]);

  if (!isOpen) return null;

  // Download rendered PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `mizan-${data.ticker.toLowerCase()}-${format}-${Date.now()}.png`;
      a.href = dataUrl;
      a.click();
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  // Generate Social Media Text
  const generateShareText = () => {
    const statusEmoji = data.isCompliant ? "✅" : "⚠️";
    const statusText = data.isCompliant ? "BIST Katılım Endeksi (XKTUM) Uyumlu" : "Katılım Endeksi Dışında";
    return `📊 #${data.ticker} Fıkhi & Finansal Analiz Raporu\n\n` +
      `${statusEmoji} Durum: ${statusText}\n` +
      `📌 Faizli Borç: %${(data.debtRatio ?? 18.4).toFixed(1)} (Azami %33)\n` +
      `📌 Faizli Nakit: %${(data.cashRatio ?? 9.2).toFixed(1)} (Azami %33)\n` +
      `📌 Uygunsuz Gelir: %${(data.impureIncomeRatio ?? 0.8).toFixed(1)} (Azami %5)\n\n` +
      `Diyanet Din İşleri Yüksek Kurulu & TKBB standartlarında kuruşu kuruşuna arındırma infakı ve detaylı bilanço röntgeni:\n` +
      `🔗 https://mizanapp.tr/companies/${data.ticker}\n\n` +
      `#BIST100 #KatilimEndeksi #HelalFinans #Borsaİstanbul #${data.ticker}`;
  };

  const handleCopyText = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(generateShareText());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(`https://mizanapp.tr/companies/${data.ticker}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#0A0B0E]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 rounded-[30px] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Üst Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#182542] to-[#2563EB] text-white flex items-center justify-center shadow-xs">
              <Share2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#182542] dark:text-white">
                  Sosyal Medya Paylaşım Kartı
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {data.ticker}
                </span>
              </div>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                Instagram, Twitter/X, LinkedIn ve WhatsApp için tek tıkla yüksek çözünürlüklü görsel üretin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Gövde: Sol Kontroller + Sağ Canlı Önizleme */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sol Kolon: Format ve Tema Seçenekleri & Paylaşım Eylemleri */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Format Seçici */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] block">
                Görsel Formatı
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "square", label: "Kare (1:1)", icon: Square, sub: "Instagram/X" },
                  { id: "story", label: "Hikaye (9:16)", icon: Smartphone, sub: "Story/Durum" },
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

            {/* Tema Seçici */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6E81A0] dark:text-[#94A3B8] block">
                Kart Teması
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
                  <span>OLED Koyu</span>
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
                  <span>Açık Cam</span>
                </button>
              </div>
            </div>

            {/* İndirme & Paylaşım Butonları */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0D8B52] hover:bg-[#0b7444] text-white text-xs font-black shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Download size={16} />
                <span>Görseli İndir (Yüksek Kalite PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-[#182542] dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                {copiedText ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copiedText ? "Gönderi Metni Kopyalandı!" : "Gönderi Metnini & Hashtag'leri Kopyala"}</span>
              </button>
            </div>

            {/* Sosyal Medya Hızlı Paylaşım Butonları */}
            <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
              <label className="text-[11px] font-bold text-[#6E81A0] dark:text-[#94A3B8] block">
                Doğrudan Uygulamada Aç:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleTwitterShare}
                  className="py-2 px-3 rounded-xl bg-black text-white hover:bg-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>𝕏 / Twitter</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="py-2 px-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba59] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleLinkedInShare}
                  className="py-2 px-3 rounded-xl bg-[#0A66C2] text-white hover:bg-[#084e96] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>LinkedIn</span>
                </button>
              </div>
            </div>

          </div>

          {/* Sağ Kolon: Canlı Canvas Önizleme */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-100/70 dark:bg-black/50 border border-slate-200/60 dark:border-white/10">
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#6E81A0] dark:text-[#94A3B8] mb-3 px-2">
              <span>CANLI ÖNİZLEME ({format.toUpperCase()})</span>
              <span>1080px Retina Render</span>
            </div>

            <div className="w-full flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-[500px] w-auto max-w-full rounded-2xl shadow-2xl border border-slate-300/40 dark:border-white/15"
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
