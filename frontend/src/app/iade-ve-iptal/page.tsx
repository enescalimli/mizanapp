import React from "react";
import Link from "next/link";
import { RotateCcw, AlertCircle, CheckCircle2, ArrowLeft, Mail, Clock } from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";

export const metadata = {
  title: "İptal ve İade Politikası — Mizan Katılım",
  description: "Mizan abonelik iptali, dijital ürünlerde yasal cayma hakkı istisnaları ve ilk 7 gün koşulsuz iade güvencesi.",
};

export default function RefundPolicyPage() {
  return (
    <PaynoShell badge="iade">
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6E81A0]">
          <Link href="/" className="hover:text-[#182542] flex items-center gap-1 transition">
            <ArrowLeft size={13} />
            <span>Ana Sayfa</span>
          </Link>
          <span>/</span>
          <span className="text-[#182542] font-semibold">İptal ve İade Politikası</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#0D8B52] text-xs font-bold">
            <RotateCcw size={14} />
            <span>6502 Sayılı Tüketici Hakları &bull; Mizan Güvencesi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] tracking-tight">
            Abonelik İptali ve <span className="font-serif italic text-[#405881]">İade Politikası</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#6E81A0] leading-relaxed">
            Mizan olarak kullanıcı memnuniyetini en üst düzeyde tutmayı taahhüt ediyoruz. Dijital abonelikleriniz ve Mizan PRO paketlerinizle ilgili tüm iptal ve iade süreçleri bu metinde şeffafça açıklanmıştır.
          </p>
        </div>

        {/* 7-Day Guarantee Callout */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Clock size={15} className="text-emerald-600" />
              <span>İlk 7 Gün Koşulsuz İade Güvencesi</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Mizan PRO aboneliğinizi satın aldıktan sonraki ilk 7 takvim günü içerisinde platformdan memnun kalmazsanız, hiçbir gerekçe göstermeksizin tam ücret iadesi talep edebilirsiniz.
            </p>
          </div>
          <Link
            href="mailto:destek@mizanapp.tr?subject=İade%20Talebi"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shrink-0 shadow-xs"
          >
            İade Talebi Aç
          </Link>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">1. Yasal Dayanak ve Cayma Hakkı İstisnası</h2>
            <p>
              6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin (ğ) bendi uyarınca; <em>&ldquo;Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde tüketici cayma hakkını kullanamaz.&rdquo;</em>
            </p>
            <p>
              Bununla birlikte, Mizan olarak müşteri memnuniyeti ilkemiz gereği kullanıcılarımıza yasal sınırların ötesinde <strong>7 günlük koşulsuz iade</strong> hakkı tanımaktayız.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">2. Abonelik İptali Nasıl Yapılır?</h2>
            <p>
              Aboneliğinizi dilediğiniz an tek tıkla iptal edebilirsiniz:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600">
              <li>Mizan hesabınızla giriş yapın ve <strong>Ayarlar &gt; Profil &amp; Üyelik</strong> sekmesine gidin.</li>
              <li><strong>&ldquo;Aboneliği Yönet&rdquo;</strong> butonuna tıklayarak Stripe / Ödeme Portaline geçin veya doğrudan Mizan iptal anketini doldurun.</li>
              <li>İptal işlemi tamamlandığında, fatura kesim tarihine kadar mevcut PRO özelliklerinizi kullanmaya devam edersiniz; bir sonraki dönem kartınızdan hiçbir ücret tahsil edilmez.</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">3. İade Süreci ve Para Aktarımı</h2>
            <p>
              İlk 7 gün içerisinde onaylanan iadeler, ödemenin yapıldığı kredi kartına / banka hesabına 3 ila 10 iş günü içerisinde yansıtılır. Bu süre bankanızın takas prosedürlerine bağlı olarak değişebilmektedir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">4. İletişim</h2>
            <p>
              Her türlü soru ve iade talebiniz için destek ekibimize <a href="mailto:destek@mizanapp.tr" className="font-bold underline text-[#182542]">destek@mizanapp.tr</a> üzerinden 7/24 ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </PaynoShell>
  );
}
