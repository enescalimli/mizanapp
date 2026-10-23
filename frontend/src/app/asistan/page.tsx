"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Send,
  RefreshCw,
  Trash2,
  Printer,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Coins,
  FileText,
  Info,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowLeftRight,
  Plus,
} from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";
import { StockLogo } from "@/components/StockLogo";
import { useAuth } from "@/lib/auth/AuthContext";

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

const STARTER_TOPICS = [
  {
    title: "THYAO Neden Katılım Dışı?",
    desc: "Faizli kredi borç oranı (%44,2) ve yasal %33 tavanı aşım analizi",
    prompt: "THYAO neden katılım dışı kaldı, faizli borç oranı kaç çıktı?",
  },
  {
    title: "Portföyümün Zekâtını Hesapla",
    desc: "DİB fetvasına göre arsa ve fabrikayı düşerek net dönen varlık matrahı",
    prompt: "DİB fetvasına göre temettü hisselerimde zekât nasıl hesaplanır?",
  },
  {
    title: "KCHOL Yerine Katılım Holdingi",
    desc: "TKFEN, SISE ve BERA gibi katılım onaylı sektörel muadiller",
    prompt: "KCHOL yerine katılım uyumlu hangi holding hissesini alabilirim?",
  },
  {
    title: "BIMAS Çeyreklik Arındırma İnfakı",
    desc: "Kuruş hassasiyetli 365 gün pro-rata infak borcu hesabı",
    prompt: "BIMAS hissesi için bu çeyrek ne kadar arındırma infakı ödemeliyim?",
  },
];

function AsistanContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("q");
  const { user } = useAuth();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "asistan-welcome",
      role: "assistant",
      content:
        "Selamün aleyküm! Ben **Mizan AI Fıkhi & Finansal Çalışma Masası**.\n\nAltyapımda **Google Gemini 3.8 Flash** ve Borsa İstanbul'un 626 hissesini tarayan deterministik fıkhi hesaplama motorlarımız çalışmaktadır.\n\nDiyanet İşleri Başkanlığı (DİB 2021/11 Kararı) ve TKBB Katılım Standart 1 metodolojisine göre hisselerin helallik durumunu, borç rasyolarını, arındırma (infak) tutarlarını ve zekât yükümlülüklerini kuruş hassasiyetinde öğrenebilirsiniz.",
      suggestedQuestions: [
        "THYAO neden katılım dışı kaldı?",
        "BIMAS için arındırma infakı ne kadar?",
        "KCHOL yerine hangi katılım holdingini alabilirim?",
        "Halka arz tavan serisi bozulunca satmak helal mi?",
      ],
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
          timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <PaynoShell badge="asistan">
      <div className="space-y-6">
        
        {/* ================================================================= */}
        {/* ÜST BAŞLIK VE MODEL ROZETİ                                        */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#182542] to-[#0D8B52] dark:from-[#273869] dark:to-[#0D8B52] text-white flex items-center justify-center shadow-md">
              <Sparkles size={22} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#182542] dark:text-white">
                  Mizan AI Fıkhi &amp; Finansal Asistan
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0D8B52] dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                  Google Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                DİB Din İşleri Yüksek Kurulu 2021/11 Kararı &amp; TKBB Katılım Standart 1 Rehberliğinde BIST Analizi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-full bg-white dark:bg-[#161F32] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-[#182542] dark:text-white shadow-xs transition flex items-center gap-1.5"
              title="Sohbeti Yazdır veya PDF Kaydet"
            >
              <Printer size={14} className="text-emerald-600" />
              <span>Yazdır (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-full bg-white dark:bg-[#161F32] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-[#6E81A0] dark:text-[#94A3B8] hover:text-rose-600 shadow-xs transition flex items-center gap-1.5"
              title="Sohbeti Temizle"
            >
              <Trash2 size={14} />
              <span>Temizle</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3 SÜTUNLU BENTO ÇALIŞMA MASASI DÜZENİ                             */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* SOL SÜTUN (3 Kolon): Hızlı Fıkhi Konular & Şablonlar */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="bg-white dark:bg-[#161F32] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-xs space-y-3">
              <h3 className="text-xs font-black tracking-wider text-[#182542] dark:text-white uppercase flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#0D8B52]" />
                <span>Hazır Fıkhi Sorgular</span>
              </h3>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8]">
                En sık karşılaşılan fıkhi ikilemleri tek tıkla analiz edin:
              </p>

              <div className="space-y-2 pt-1">
                {STARTER_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(topic.prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200/60 dark:border-white/10 hover:border-emerald-300 transition group space-y-1"
                  >
                    <span className="font-bold text-xs text-[#182542] dark:text-white group-hover:text-[#0D8B52] block">
                      {topic.title}
                    </span>
                    <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] block leading-tight">
                      {topic.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* DİB & TKBB Kurumsal Güvence Kartı */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent dark:from-emerald-950/20 rounded-[24px] p-4 border border-emerald-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#0D8B52] dark:text-emerald-400 font-bold">
                <ShieldCheck size={16} />
                <span>DİB &amp; TKBB Metodolojisi</span>
              </div>
              <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] leading-relaxed">
                Mizan AI, Din İşleri Yüksek Kurulu&apos;nun 2021/11 Sayılı Mütalaası doğrultusunda faizli borç (%33), faizli mevduat (%30) ve gayrimeşru hasılat (%5) tavanlarını anlık kontrol eder.
              </p>
            </div>

          </div>

          {/* ORTA SÜTUN (6 Kolon): Canlı Sohbet Akışı & Generative UI */}
          <div className="lg:col-span-6 bg-white dark:bg-[#161F32] rounded-[28px] border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col h-[750px] overflow-hidden">
            
            {/* Mesaj Alanı */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl p-4 sm:p-5 space-y-3 ${
                      msg.role === "user"
                        ? "bg-[#182542] text-white rounded-br-xs shadow-xs"
                        : "bg-[#F8F9FA] dark:bg-white/5 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-white/10 shadow-xs"
                    }`}
                  >
                    {/* Mesaj Metni */}
                    <div className="leading-relaxed whitespace-pre-wrap text-xs sm:text-[13px] prose dark:prose-invert max-w-none">
                      {msg.content}
                    </div>

                    {/* GENERATIVE UI: Hisse Durum Kartı */}
                    {msg.stockData && (
                      <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StockLogo ticker={msg.stockData.ticker} name={msg.stockData.name} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-[#182542] dark:text-white">
                                  {msg.stockData.ticker}
                                </span>
                                <span className="text-xs text-[#6E81A0] dark:text-[#94A3B8]">
                                  {msg.stockData.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                Sektör: {msg.stockData.sector} • Fiyat: {msg.stockData.priceTRY}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              msg.stockData.isCompliant
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#0D8B52] dark:text-emerald-400"
                                : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                            }`}
                          >
                            {msg.stockData.isCompliant ? "✓ Katılım Uyumlu" : "✕ Kapsam Dışı"}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-center text-xs">
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
                          className="w-full py-2 rounded-xl bg-[#182542] hover:bg-[#273869] text-white text-center text-xs font-bold block transition"
                        >
                          24 Kriterli Şirket Karnesi 2.0 Sayfasına Git &rarr;
                        </Link>
                      </div>
                    )}

                    {/* GENERATIVE UI: Sektörel Muadiller Kartı */}
                    {msg.compliantAlternatives && msg.compliantAlternatives.length > 0 && (
                      <div className="mt-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D8B52] dark:text-emerald-400">
                          <ArrowLeftRight size={14} />
                          <span>Katılım Uyumlu Sektörel İkame Tavsiyeleri:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.compliantAlternatives.map((alt: any) => (
                            <div
                              key={alt.ticker}
                              className="p-3 rounded-xl bg-white dark:bg-[#161F32] border border-slate-200/80 dark:border-white/10 flex items-center justify-between shadow-xs"
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

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp} {msg.modelUsed ? `• ${msg.modelUsed}` : ""}
                  </span>

                  {/* Devam Sorusu Önerileri */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5 max-w-[92%]">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(q)}
                          className="px-3 py-1.5 rounded-full bg-white dark:bg-[#111726] hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 transition text-left shadow-xs"
                        >
                          {q} &rarr;
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-white/10 max-w-[70%]">
                  <div className="w-5 h-5 border-2 border-[#0D8B52] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-700 dark:text-slate-200 font-medium animate-pulse">
                    Google Gemini 3.8 Flash fıkhi ve finansal verileri analiz ediyor...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Yazma Alanı */}
            <div className="p-4 bg-[#F8F9FA] dark:bg-white/5 border-t border-slate-200/80 dark:border-white/10 shrink-0 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-[#0D8B52] shadow-xs transition-colors"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bir hisse veya fıkhi konu sorun (örn: THYAO caiz mi?, BIMAS arındırma borcum ne kadar?)..."
                  disabled={loading}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl bg-[#0D8B52] hover:bg-[#0b7444] disabled:bg-slate-300 dark:disabled:bg-white/10 text-white flex items-center justify-center shrink-0 shadow-xs transition"
                >
                  <Send size={15} />
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-[#6E81A0] dark:text-[#94A3B8] px-1">
                <span>DİB 2021/11 &amp; TKBB Standart 1 Esaslıdır</span>
                <span className="font-semibold">SPK Uyarısı: Yatırım Tavsiyesi Değildir (YTD)</span>
              </div>
            </div>

          </div>

          {/* SAĞ SÜTUN (3 Kolon): Fıkhi Eşikler & Hızlı Hisseler */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Fıkhi Eşikler Panosu */}
            <div className="bg-white dark:bg-[#161F32] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-xs space-y-3">
              <h3 className="text-xs font-black tracking-wider text-[#182542] dark:text-white uppercase flex items-center gap-1.5">
                <Scale size={14} className="text-blue-600" />
                <span>DİB / TKBB Eşik Sınırları</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <strong className="block text-[#182542] dark:text-white">Faizli Kredi Borcu</strong>
                    <span className="text-[10px] text-slate-500">Piyasa değerine oranı</span>
                  </div>
                  <span className="font-mono font-black text-rose-600 text-xs bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                    Azami %33
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <strong className="block text-[#182542] dark:text-white">Faizli Mevduat</strong>
                    <span className="text-[10px] text-slate-500">Nakit &amp; bono varlığı</span>
                  </div>
                  <span className="font-mono font-black text-amber-600 text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                    Azami %30
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <strong className="block text-[#182542] dark:text-white">Şüpheli Hasılat</strong>
                    <span className="text-[10px] text-slate-500">Gayrimeşru gelir payı</span>
                  </div>
                  <span className="font-mono font-black text-emerald-600 text-xs bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    Azami %5
                  </span>
                </div>
              </div>
            </div>

            {/* Hızlı Ticker Hapları */}
            <div className="bg-white dark:bg-[#161F32] rounded-[24px] p-4 sm:p-5 border border-slate-200/60 dark:border-white/10 shadow-xs space-y-3">
              <h3 className="text-xs font-black tracking-wider text-[#182542] dark:text-white uppercase">
                Gözde Hisseleri Sor
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {["BIMAS", "THYAO", "ASELS", "FROTO", "KCHOL", "TUPRS", "EREGL", "PGSUS", "TABGD"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleSend(`${t} caiz mi, güncel borç oranı kaç?`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-[#182542] hover:text-white text-xs font-bold text-[#182542] dark:text-white transition font-mono"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Portföy Entegrasyon Çağrısı */}
            <div className="p-4 rounded-[24px] bg-[#182542] text-white space-y-2">
              <span className="text-xs font-bold text-emerald-300 block">
                Portföyünüzü Fıkhen Arındırın
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Portföy sayfanızdaki hisselerin kuruş hassasiyetinde arındırma ve zekât belgelerini PDF olarak yazdırabilirsiniz.
              </p>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1"
              >
                <span>Portföy Yönetimine Git</span>
                <ArrowRight size={13} />
              </Link>
            </div>

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
        <div className="min-h-screen bg-[#EEF0F4] dark:bg-[#0B0F17] flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#182542] border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-xs font-bold text-[#6E81A0]">Mizan AI Asistan yükleniyor...</span>
          </div>
        </div>
      }
    >
      <AsistanContent />
    </Suspense>
  );
}
