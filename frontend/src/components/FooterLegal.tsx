import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock, Mail, Scale, Sparkles, AlertCircle } from "lucide-react";

export const FooterLegal: React.FC = () => {
  return (
    <footer className="mt-16 pt-10 pb-16 border-t border-[#182542]/10 text-xs text-[#6E81A0] space-y-8">
      {/* Top Footer Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Brand & Identity */}
        <div className="space-y-3 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#182542] flex items-center justify-center p-0.5">
              <Image
                src="/brand/logo.svg"
                alt="Mizan"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-base font-extrabold text-[#182542] tracking-tight">
              mizan<span className="text-emerald-600 font-serif italic ml-1">katılım</span>
            </span>
          </Link>
          <p className="text-[11px] text-[#6E81A0] leading-relaxed">
            Borsa İstanbul (BIST) helal hisse tarama, çeyreklik bilanço dipnot analizi, kuruşu kuruşuna fıkhi arındırma ve hisse zekâtı SaaS platformu.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl w-fit">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>DİB Din İşleri Yüksek Kurulu &amp; TKBB Uyumlu</span>
          </div>
        </div>

        {/* Column 2: Platform Ürünleri */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-[#182542] uppercase tracking-wider">
            Platform Araçları
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link href="/tarayici" className="hover:text-[#182542] transition flex items-center gap-1.5">
                <span>626 BIST Hisse Tarayıcı</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#182542]/10 text-[#182542] rounded-md">Canlı</span>
              </Link>
            </li>
            <li>
              <Link href="/ipo" className="hover:text-[#182542] transition">
                2026 Katılım Halka Arz Takvimi
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="hover:text-[#182542] transition">
                Katılım Portföy Takibi &amp; Maskeleme
              </Link>
            </li>
            <li>
              <Link href="/purification" className="hover:text-[#182542] transition">
                Kuruşu Kuruşuna Arındırma Hesaplayıcı
              </Link>
            </li>
            <li>
              <Link href="/rehber" className="hover:text-[#182542] transition">
                Fıkhi Standartlar &amp; İcazet Rehberi
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Hukuki & Sözleşmeler */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-[#182542] uppercase tracking-wider">
            Hukuk &amp; Regülasyon
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link href="/kullanim-kosullari" className="hover:text-[#182542] transition">
                Kullanım Koşulları &amp; Hizmet Şartları
              </Link>
            </li>
            <li>
              <Link href="/gizlilik-politikasi" className="hover:text-[#182542] transition">
                Gizlilik Politikası &amp; KVKK Metni
              </Link>
            </li>
            <li>
              <Link href="/cerez-politikasi" className="hover:text-[#182542] transition">
                Çerez Politikası &amp; İzin Yönetimi
              </Link>
            </li>
            <li>
              <Link href="/iade-ve-iptal" className="hover:text-[#182542] transition">
                İptal ve İade Şartları (7 Gün Güvencesi)
              </Link>
            </li>
            <li>
              <Link href="/mesafeli-satis" className="hover:text-[#182542] transition">
                Mesafeli Satış Sözleşmesi (Ön Bilgilendirme)
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: İletişim & Kurumsal Künye */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-[#182542] uppercase tracking-wider">
            İletişim &amp; Destek
          </h4>
          <div className="space-y-1.5 text-[11px] leading-relaxed">
            <p className="font-semibold text-[#182542]">Mizan Katılım Finans Teknolojileri</p>
            <p>Levent Mah. Büyükdere Cad. Beşiktaş / İstanbul</p>
            <p className="flex items-center gap-1.5 text-[#182542] font-mono">
              <Mail size={12} className="text-[#6E81A0]" />
              <a href="mailto:destek@mizanapp.tr" className="hover:underline font-bold">
                destek@mizanapp.tr
              </a>
            </p>
            <div className="pt-1">
              <Link
                href="/ayarlar"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#EDF1F7] text-[10px] font-bold text-[#182542] hover:bg-slate-50 transition shadow-2xs"
              >
                <span>Abonelik &amp; Müşteri Portali</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Mandatory Regulatory Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950/90 leading-relaxed flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-amber-950">SPK Yasal Uyarısı (YTD):</strong> Mizan platformundaki veriler, katılım filtreleme rasyoları, arındırma oranları ve analizler hiçbir surette 6362 sayılı Sermaye Piyasası Kanunu kapsamında yatırım danışmanlığı veya al-sat tavsiyesi teşkil etmez. Mizan bağımsız bir fıkhi ve finansal hesaplama yazılımı olup, resmi bir icazet ya da fetva kurumu değildir.
        </div>
      </div>

      {/* Bottom Copyright & Security Badges */}
      <div className="pt-4 border-t border-[#182542]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px]">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Mizan Finans Teknolojileri. Tüm hakları saklıdır.</span>
          <span>&bull;</span>
          <span className="font-mono">v2.4.0 (Canlı)</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <Lock size={11} />
            <span>256-Bit TLS 1.3 Uçtan Uca Şifreli</span>
          </span>
          <span>&bull;</span>
          <span>Resend &amp; Supabase Altyapısı</span>
        </div>
      </div>
    </footer>
  );
};
