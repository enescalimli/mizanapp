"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Send,
  Trash2,
  ArrowRight,
  ShieldCheck,
  ArrowLeftRight,
} from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";
import { StockLogo } from "@/components/StockLogo";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

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
  tokenMetrics?: {
    historyTokens: number;
    prunedMessages: number;
  };
  timestamp: string;
}

const STARTER_PROMPTS = [
  "THYAO neden katılım endeksi dışı kaldı?",
  "BIMAS için bu çeyrek arındırma infakı ne kadar?",
  "Halka arz tavan serisi bozulunca satmak helal mi?",
  "Hisse zekâtında fabrika ve duran varlıklar düşülür mü?",
];

function AsistanContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("q");

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "asistan-welcome",
      role: "assistant",
      content:
        "Selamün aleyküm! Ben **Mizan AI**.\n\nDiyanet İşleri Başkanlığı (DİB 2021/11 Kararı) ve TKBB Katılım Standart 1 metodolojisine göre hisselerin fıkhi uygunluğunu, faizli borç eşiklerini, arındırma infakını ve hisse zekâtını analiz edebilirim.\n\nBana Borsa İstanbul'daki herhangi bir hisseyi veya aklınıza takılan fıkhi bir konuyu sorabilirsiniz.",
      suggestedQuestions: STARTER_PROMPTS,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // URL'den gelen başlangıç sorusu varsa çalıştır
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
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
        }),
      });

      if (!res.ok) throw new Error("API call failed");

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.text || "Fıkhi analiz tamamlandı.",
        stockData: data.stockData,
        compliantAlternatives: data.compliantAlternatives,
        purificationCalculation: data.purificationCalculation,
        zakatCalculation: data.zakatCalculation,
        suggestedQuestions: data.suggestedQuestions,
        modelUsed: data.modelUsed,
        tokenMetrics: data.tokenMetrics,
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Asistan yanıt üretirken bir aksaklık oluştu. Lütfen tekrar deneyiniz.",
          timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm("Sohbet geçmişini sıfırlamak istiyor musunuz?")) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: "Sohbet temizlendi. Yeni bir hisse veya fıkhi konu sorabilirsiniz.",
          suggestedQuestions: STARTER_PROMPTS,
          timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <PaynoShell badge="asistan">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-125px)]">
        
        {/* ================================================================= */}
        {/* SADE & ŞIK ÜST BAŞLIK BAR                                         */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#182542] to-[#0D8B52] dark:from-[#273869] dark:to-[#0D8B52] text-white flex items-center justify-center shadow-md">
              <Sparkles size={20} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#182542] dark:text-white">
                  Mizan AI Asistan
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                DİB &amp; TKBB Standartlarında BIST Fıkhi Analiz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-[#0E1015] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-[#6E81A0] dark:text-[#94A3B8] hover:text-rose-600 shadow-xs transition flex items-center gap-1.5"
              title="Sohbeti Temizle"
            >
              <Trash2 size={13} />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ODAKLANMIŞ CHATBOT MESAJ AKIŞI                                    */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-1 sm:px-4 py-4 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 space-y-3 ${
                  msg.role === "user"
                    ? "bg-black text-white dark:bg-white dark:text-black rounded-br-xs shadow-xs"
                    : "bg-white dark:bg-[#0E1015] text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/70 dark:border-white/10 shadow-sm"
                }`}
              >
                {/* Mesaj Metni: Zengin Markdown Ayrıştırıcı (Raw markdown sembolleri yok) */}
                {msg.role === "assistant" ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <div className="leading-relaxed whitespace-pre-wrap text-sm">
                    {msg.content}
                  </div>
                )}

                {/* GENERATIVE UI 1: Hisse Durum Özeti Kartı (Yalnızca hisse sorulduysa) */}
                {msg.stockData && (
                  <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0A0B0E] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <StockLogo ticker={msg.stockData.ticker} name={msg.stockData.name} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#182542] dark:text-white">
                              {msg.stockData.ticker}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              {msg.stockData.priceTRY}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 block truncate max-w-[200px]">
                            {msg.stockData.name} • {msg.stockData.sector}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          msg.stockData.isCompliant
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400"
                        }`}
                      >
                        {msg.stockData.isCompliant ? "✓ Katılım Endeksine Uygun" : "✕ Katılım Dışıdır"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Faizli Borç Oranı</span>
                        <strong className={msg.stockData.isCompliant ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}>
                          {msg.stockData.debtRatio}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Nakit/Mevduat</span>
                        <strong className="text-slate-700 dark:text-slate-300">{msg.stockData.cashRatio}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Şüpheli Hasılat</span>
                        <strong className="text-slate-700 dark:text-slate-300">{msg.stockData.impureIncomeRatio}</strong>
                      </div>
                    </div>

                    <Link
                      href={`/companies/${msg.stockData.ticker}`}
                      className="w-full py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-center text-xs font-semibold block transition"
                    >
                      24 Kriterli Şirket Karnesi Detayını Aç &rarr;
                    </Link>
                  </div>
                )}

                {/* GENERATIVE UI 2: Sektörel Muadiller Kartı */}
                {msg.compliantAlternatives && msg.compliantAlternatives.length > 0 && (
                  <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D8B52] dark:text-emerald-400">
                      <ArrowLeftRight size={14} />
                      <span>Katılım Uyumlu Sektörel İkame Tavsiyeleri:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.compliantAlternatives.map((alt: any) => (
                        <div
                          key={alt.ticker}
                          className="p-2.5 rounded-xl bg-white dark:bg-[#0E1015] border border-slate-200/80 dark:border-white/10 flex items-center justify-between shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <StockLogo ticker={alt.ticker} name={alt.name} size="sm" />
                            <div>
                              <strong className="text-xs text-[#182542] dark:text-white block">{alt.ticker}</strong>
                              <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] truncate block max-w-[110px]">
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
                              className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                            >
                              İncele &rarr;
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mesaj Alt Çubuğu (Model Durumu, Pruning, Sesli Dinle, Saat) */}
              <div className="flex items-center justify-between w-full max-w-[92%] sm:max-w-[85%] text-[10px] text-slate-400 mt-1 px-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {msg.role === "assistant" && msg.modelUsed?.includes("Canlı") ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{msg.modelUsed}</span>
                    </span>
                  ) : msg.role === "assistant" && msg.modelUsed ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      <span className="text-amber-600 dark:text-amber-400">{msg.modelUsed}</span>
                    </span>
                  ) : null}

                  {/* Token Pruning Güvenlik Rozeti */}
                  {msg.tokenMetrics && msg.tokenMetrics.prunedMessages > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      title={`${msg.tokenMetrics.prunedMessages} eski mesaj budandı (~${msg.tokenMetrics.historyTokens} token)`}
                    >
                      🛡️ Pruned ({msg.tokenMetrics.historyTokens}t)
                    </span>
                  )}

                  </div>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Devam Sorusu Önerileri */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%] sm:max-w-[85%]">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="px-3 py-1 rounded-full bg-white/70 dark:bg-[#0E1015]/80 hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-200/70 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 transition text-left backdrop-blur-sm shadow-2xs"
                      >
                        {q} &rarr;
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-[#0E1015]/70 backdrop-blur-md border border-slate-200/60 dark:border-white/10 max-w-[70%] shadow-xs">
                <div className="w-4 h-4 border-2 border-[#0D8B52] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium animate-pulse">
                  Mizan AI fıkhi ve finansal verileri analiz ediyor...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ================================================================= */}
          {/* TEMİZ VE KULLANIMI KOLAY MESAJ GİRİŞ ALANI                        */}
          {/* ================================================================= */}
          <div className="pt-2 pb-1 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-white/80 dark:bg-[#0E1015]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-[#0D8B52] shadow-sm transition-all"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Bir hisse veya fıkhi konu sorun (örn: THYAO caiz mi?, BIMAS arındırması ne kadar?)..."
                disabled={loading}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-[#0D8B52] hover:bg-[#0b7444] disabled:bg-slate-200 dark:disabled:bg-white/10 disabled:text-slate-400 text-white flex items-center justify-center shrink-0 shadow-xs transition"
              >
                <Send size={15} />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-2">
              <span>DİB 2021/11 &amp; TKBB Standart 1 Esaslıdır</span>
              <span>SPK Uyarısı: Yatırım Tavsiyesi Değildir (YTD)</span>
            </div>
          </div>

        </div>
      </PaynoShell>
  );
}

export default function AsistanPage() {
  return (
    <Suspense
      fallback={
        <PaynoShell badge="asistan">
          <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
            Asistan yükleniyor...
          </div>
        </PaynoShell>
      }
    >
      <AsistanContent />
    </Suspense>
  );
}
