"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  ChevronRight,
  Check,
} from "lucide-react";

export interface MizanNotification {
  id: string;
  category: "FIKHI_ALARM" | "HALKA_ARZ" | "TEMETTU" | "KAP_BILANCO";
  title: string;
  ticker?: string;
  summary: string;
  time: string;
  isUnread: boolean;
  linkHref?: string;
}

const INITIAL_NOTIFICATIONS: MizanNotification[] = [
  {
    id: "notif-1",
    category: "FIKHI_ALARM",
    ticker: "THYAO",
    title: "Katılım Eşiği Aşımı Alarmı",
    summary:
      "Faizli borç rasyosu %34,2 seviyesine yükselerek BIST Katılım %33 tavan eşiğini aşmıştır. Portföyünüzde varsa fıkhi arındırma incelemesi önerilir.",
    time: "10 dk önce",
    isUnread: true,
    linkHref: "/companies/THYAO",
  },
  {
    id: "notif-2",
    category: "HALKA_ARZ",
    ticker: "SSAAT",
    title: "Yeni Halka Arz Talep Topluyor",
    summary:
      "Saat ve Saat Sanayi SPK onaylı halka arzında talep toplama süreci başlamıştır. Katılım Finansı Bilgi Formuna uygundur.",
    time: "25 dk önce",
    isUnread: true,
    linkHref: "/ipo",
  },
  {
    id: "notif-3",
    category: "KAP_BILANCO",
    ticker: "BIMAS",
    title: "Katılım Bilgi Formu (KAFİF) Onaylandı",
    summary:
      "2026 konsolide finansal tablolar uyarınca faizli borç oranı %14,80 olup BIST Katılım ve DİB kriterlerini eksiksiz karşılamaktadır.",
    time: "1 saat önce",
    isUnread: true,
    linkHref: "/companies/BIMAS",
  },
  {
    id: "notif-4",
    category: "TEMETTU",
    ticker: "FROTO",
    title: "Nakit Kâr Payı Arındırma Oranı",
    summary:
      "Nakit temettü dağıtımında hisse başı fıkhi arındırma tutarı ₺0,0420 olarak güncellenmiştir.",
    time: "3 saat önce",
    isUnread: false,
    linkHref: "/portfolio?tab=arindirma",
  },
  {
    id: "notif-5",
    category: "HALKA_ARZ",
    ticker: "NETGL",
    title: "BIST Katılım Endeksine Dahil Edildi",
    summary:
      "Net Global Endüstriyel (NETGL) hisseleri işlem görmeye başlayarak BIST Katılım Tüm (XKTUM) endeksine eklenmiştir.",
    time: "5 saat önce",
    isUnread: false,
    linkHref: "/ipo",
  },
  {
    id: "notif-6",
    category: "KAP_BILANCO",
    ticker: "XKTUM",
    title: "Haftalık Katılım Endeksi Bülteni",
    summary:
      "BIST Katılım 100 endeksi haftalık bazda %2.4 artışla 10.842 puana ulaşmıştır. Toplam katılım hacmi 84.2 Milyar TL olarak kaydedildi.",
    time: "1 gün önce",
    isUnread: false,
    linkHref: "/tarayici",
  },
];

export const NotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "ALARM" | "IPO" | "KAP">("ALL");
  const [notifications, setNotifications] = useState<MizanNotification[]>(INITIAL_NOTIFICATIONS);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "ALARM") return n.category === "FIKHI_ALARM";
    if (activeTab === "IPO") return n.category === "HALKA_ARZ";
    if (activeTab === "KAP") return n.category === "KAP_BILANCO" || n.category === "TEMETTU";
    return true;
  });

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all duration-200 flex items-center justify-center relative ${
          isOpen
            ? "bg-[#182542] dark:bg-[#182542] text-white border-[#182542] dark:border-white/20 shadow-md scale-105"
            : "bg-white dark:bg-[#0E1015] hover:bg-slate-50 dark:hover:bg-[#151720] text-[#646A78] dark:text-[#94A3B8] hover:text-[#182542] dark:hover:text-white border-slate-200/60 dark:border-white/10 shadow-xs"
        }`}
        title="Canlı Bildirimler & Fıkhi Alarmlar"
        aria-label="Bildirimler"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#12B76A] border-2 border-white dark:border-[#0E1015]"></span>
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2.5 w-auto sm:w-[400px] max-w-[calc(100vw-24px)] bg-white/95 dark:bg-[#0E1015]/98 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_20px_60px_rgba(24,37,66,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#182542] dark:bg-[#273869] text-white flex items-center justify-center shadow-xs">
                <Bell size={15} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#182542] dark:text-white">
                  Bildirimler &amp; Canlı Akış
                </h3>
                <span className="text-[10px] text-[#6E81A0] dark:text-[#94A3B8] font-mono">
                  {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : "Tüm bildirimler güncel"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-[#182542] dark:text-white text-[11px] font-bold transition flex items-center gap-1"
                  title="Tümünü Okundu Say"
                >
                  <Check size={12} />
                  <span>Okundu</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-100 dark:border-white/10 overflow-x-auto text-[11px] font-bold">
            {[
              { id: "ALL", label: `Tümü (${notifications.length})` },
              { id: "ALARM", label: "Fıkhi Alarm" },
              { id: "IPO", label: "Halka Arz" },
              { id: "KAP", label: "KAP / Bilanço" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[#182542] dark:bg-[#273869] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-[#6E81A0] dark:text-[#94A3B8]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 p-2">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                Bu kategoride henüz yeni bildirim bulunmuyor.
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markSingleAsRead(notif.id)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-white/[0.04] ${
                    notif.isUnread ? "bg-slate-50/50 dark:bg-white/[0.02]" : ""
                  }`}
                >
                  {/* Category Icon */}
                  <div className="shrink-0 mt-0.5">
                    {notif.category === "FIKHI_ALARM" && (
                      <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                        <AlertTriangle size={15} />
                      </div>
                    )}
                    {notif.category === "HALKA_ARZ" && (
                      <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                        <Calendar size={15} />
                      </div>
                    )}
                    {notif.category === "TEMETTU" && (
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                        <DollarSign size={15} />
                      </div>
                    )}
                    {notif.category === "KAP_BILANCO" && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                        <CheckCircle2 size={15} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        {notif.ticker && (
                          <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded-md bg-[#182542] dark:bg-[#273869] text-white">
                            {notif.ticker}
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#182542] dark:text-white truncate">
                          {notif.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">
                        {notif.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6E81A0] dark:text-[#94A3B8] leading-snug line-clamp-2">
                      {notif.summary}
                    </p>

                    {notif.linkHref && (
                      <Link
                        href={notif.linkHref}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#182542] dark:text-blue-400 hover:underline mt-1.5"
                      >
                        <span>Detayları İncele</span>
                        <ChevronRight size={10} />
                      </Link>
                    )}
                  </div>

                  {/* Unread dot */}
                  {notif.isUnread && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50/80 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 text-center">
            <Link
              href="/ayarlar"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#182542] dark:text-blue-400 hover:underline"
            >
              Bildirim ve Alarm Tercihlerini Düzenle &rarr;
            </Link>
          </div>

        </div>
      )}
    </div>
  );
};
