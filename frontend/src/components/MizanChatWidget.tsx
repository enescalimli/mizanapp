"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  Maximize2,
  Send,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Coins,
  Bot,
  User,
  ChevronDown,
} from "lucide-react";
import { StockLogo } from "./StockLogo";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  stockData?: any;
  compliantAlternatives?: any[];
  purificationCalculation?: any;
  zakatCalculation?: any;
  suggestedQuestions?: string[];
  modelUsed?: string;
  timestamp: string;
}

export const MizanChatWidget: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sayfa bağlamından hisse kodu tespiti (Örn: /companies/THYAO -> THYAO)
  const currentTicker = React.useMemo(() => {
    if (pathname.startsWith("/companies/")) {
      const parts = pathname.split("/");
      return parts[2]?.toUpperCase() || null;
    }
    return null;
  }, [pathname]);

  // Varsayılan hoş geldin mesajı
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Selamün aleyküm! Ben **Mizan AI**; Google Gemini 3.8 Flash ve Diyanet / TKBB Katılım Standartları ile güçlendirilmiş fıkhi ve finansal BIST asistanınızım.\n\nHisselerin helallik durumunu, borç oranlarını, kuruş hassasiyetli arındırma (infak) ve hisse zekâtı yükümlülüklerinizi sorabilirsiniz.",
      suggestedQuestions: [
        "THYAO neden katılım dışı kaldı?",
        "BIMAS için bu çeyrek arındırma infakı ne kadar?",
        "KCHOL yerine hangi katılım holdingini alabilirim?",
      ],
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Otomatik aşağı kaydırma
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            currentTicker,
            currentPath: pathname,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Chat response failed");
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.text || "Sorunuz fıkhi standartlara göre incelendi.",
        stockData: data.stockData,
        compliantAlternatives: data.compliantAlternatives,
        purificationCalculation: data.purificationCalculation,
        zakatCalculation: data.zakatCalculation,
        suggestedQuestions: data.suggestedQuestions,
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Bağlantı sırasında bir aksaklık oluştu. Lütfen tekrar deneyiniz veya sol menüden tam ekran asistan sayfasına geçiniz.",
          timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. SAĞ ALT KAYAN AKILLI TETİKLEYİCİ DÜĞME */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-[#182542] via-[#1f325c] to-[#0D8B52] dark:from-[#273869] dark:via-[#1e3059] dark:to-[#0D8B52] text-white shadow-[0_10px_30px_rgba(13,139,82,0.35)] hover:shadow-[0_15px_40px_rgba(13,139,82,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 select-none"
            title="Mizan AI Fıkhi & Finansal Asistan"
          >
            {/* Animasyonlu Parıltı Halkası */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-[#111726]" />
            </span>

            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-tight leading-none">
                Mizan AI
              </span>
              <span className="text-[10px] text-emerald-300 font-medium leading-tight">
                Gemini 3.8 Flash
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2. AÇILIR MINI ASİSTAN MODAL PENCERESİ */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[600px] max-h-[85vh] bg-white/95 dark:bg-[#111726]/95 backdrop-blur-2xl rounded-[30px] border border-slate-200/90 dark:border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Üst Bar */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#182542] via-[#20345e] to-[#0D8B52] dark:from-[#161F32] dark:to-[#0D8B52] text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles size={16} className="text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight">
                    Mizan AI Katılım Asistanı
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-emerald-200/80 font-mono">
                  Gemini 3.8 Flash • DİB &amp; TKBB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/asistan"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                title="Tam Ekran Çalışma Masasına Git"
              >
                <Maximize2 size={13} />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                title="Pencereyi Kapat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Sayfa Bağlamı Bilgisi (Örn: THYAO hissesi inceleniyorsa) */}
          {currentTicker && (
            <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/60 dark:border-emerald-500/20 text-[11px] text-[#0D8B52] dark:text-emerald-300 flex items-center justify-between shrink-0">
              <span className="truncate">
                Aktif Sayfa: <strong>{currentTicker}</strong> hissesi inceleniyor
              </span>
              <button
                type="button"
                onClick={() => handleSendMessage(`${currentTicker} fıkhi durumu ve borç oranı nedir?`)}
                className="text-[10px] underline font-bold hover:text-emerald-700"
              >
                Hemen Sor &rarr;
              </button>
            </div>
          )}

          {/* Mesaj Akışı */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 space-y-2.5 ${
                    msg.role === "user"
                      ? "bg-[#182542] text-white rounded-br-xs shadow-xs"
                      : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-white/10 shadow-xs"
                  }`}
                >
                  {/* Mesaj Metni */}
                  <div className="leading-relaxed whitespace-pre-wrap prose-xs">
                    {msg.content}
                  </div>

                  {/* GENERATIVE UI 1: Hisse Durum Özeti Kartı */}
                  {msg.stockData && (
                    <div className="mt-2.5 p-3 rounded-xl bg-white dark:bg-[#161F32] border border-slate-200/80 dark:border-white/15 text-slate-800 dark:text-white space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StockLogo ticker={msg.stockData.ticker} name={msg.stockData.name} size="sm" />
                          <div>
                            <span className="font-bold text-xs block">{msg.stockData.ticker}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[130px]">
                              {msg.stockData.name}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            msg.stockData.isCompliant
                              ? "bg-emerald-50 text-[#0D8B52] dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                          }`}
                        >
                          {msg.stockData.isCompliant ? "✓ Katılım Uyumlu" : "✕ Kapsam Dışı"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-100 dark:border-white/10">
                        <div>
                          <span className="text-slate-500 block">Faizli Borç:</span>
                          <strong className={msg.stockData.isCompliant ? "text-slate-800 dark:text-white" : "text-rose-600"}>
                            {msg.stockData.debtRatio}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Güncel Fiyat:</span>
                          <strong className="font-mono">{msg.stockData.priceTRY}</strong>
                        </div>
                      </div>

                      <Link
                        href={`/companies/${msg.stockData.ticker}`}
                        className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-center font-bold text-[10px] text-slate-700 dark:text-slate-200 block transition"
                      >
                        Şirket Karnesi 2.0 Detayını Aç &rarr;
                      </Link>
                    </div>
                  )}

                  {/* GENERATIVE UI 2: Katılım Uyumlu Muadil Kartları */}
                  {msg.compliantAlternatives && msg.compliantAlternatives.length > 0 && (
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-900 dark:text-white space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#0D8B52] dark:text-emerald-400">
                        <span>Önerilen Katılım Uyumlu Muadiller:</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.compliantAlternatives.map((alt: any) => (
                          <div
                            key={alt.ticker}
                            className="p-2 rounded-lg bg-white dark:bg-[#161F32] border border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <StockLogo ticker={alt.ticker} name={alt.name} size="sm" />
                              <div>
                                <strong className="block">{alt.ticker}</strong>
                                <span className="text-[9px] text-slate-500 truncate block max-w-[120px]">
                                  {alt.name}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-[#0D8B52] font-bold block">
                                Borç: {alt.debtRatio || "%14.2"}
                              </span>
                              <Link
                                href={`/companies/${alt.ticker}`}
                                className="text-[9px] text-blue-600 dark:text-blue-400 underline font-bold"
                              >
                                İncele &rarr;
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GENERATIVE UI 3: Fıkhi Arındırma / Zekât Düğmesi */}
                  {(msg.purificationCalculation || msg.zakatCalculation) && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Resmi Tevsik Belgesi
                      </span>
                      <Link
                        href="/portfolio"
                        className="px-2.5 py-1 rounded-full bg-[#0D8B52] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#0b7444] transition"
                      >
                        <span>Portföyde Görüntüle</span>
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between w-full max-w-[88%] text-[9px] text-slate-400 mt-1 px-1">
                  <span className="flex items-center gap-1">
                    {msg.role === "assistant" && msg.modelUsed?.includes("Canlı") ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{msg.modelUsed}</span>
                      </>
                    ) : msg.role === "assistant" && msg.modelUsed ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                        <span className="text-amber-600 dark:text-amber-400">{msg.modelUsed}</span>
                      </>
                    ) : null}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Önerilen Devam Sorusu Hapları */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-[#161F32] hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-[10px] text-slate-700 dark:text-slate-200 transition text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-white/10 max-w-[70%]">
                <div className="w-4 h-4 border-2 border-[#0D8B52] border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium animate-pulse">
                  Gemini 3.8 Flash fıkhi standartları inceliyor...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Mesaj Giriş Alanı */}
          <div className="p-3 bg-white dark:bg-[#111726] border-t border-slate-200/80 dark:border-white/10 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-1.5 focus-within:border-[#0D8B52] transition-colors"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Bir hisse veya fıkhi konu sorun (örn: THYAO caiz mi?)..."
                disabled={loading}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-[#0D8B52] hover:bg-[#0b7444] disabled:bg-slate-300 dark:disabled:bg-white/10 text-white flex items-center justify-center shrink-0 transition"
              >
                <Send size={13} />
              </button>
            </form>
            <p className="text-[9px] text-slate-400 text-center mt-1.5">
              DİB 2021/11 Kararı &amp; TKBB Standart 1 esaslıdır. Yatırım Tavsiyesi Değildir (YTD).
            </p>
          </div>

        </div>
      )}
    </>
  );
};
