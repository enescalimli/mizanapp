import React from "react";
import Link from "next/link";
import { Building2, FileCheck, ArrowLeft, Shield } from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi — Mizan Katılım",
  description: "6502 sayılı Tüketicinin Korunması Kanunu uyarınca Mizan PRO aboneliklerine ilişkin mesafeli satış sözleşmesi ve ön bilgilendirme formu.",
};

export default function DistanceSalesPage() {
  return (
    <PaynoShell badge="sözleşme">
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6E81A0]">
          <Link href="/" className="hover:text-[#182542] flex items-center gap-1 transition">
            <ArrowLeft size={13} />
            <span>Ana Sayfa</span>
          </Link>
          <span>/</span>
          <span className="text-[#182542] font-semibold">Mesafeli Satış Sözleşmesi</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/10 border border-slate-900/20 text-[#182542] text-xs font-bold">
            <FileCheck size={14} />
            <span>Tüketici Mevzuatı &bull; Ön Bilgilendirme ve Mesafeli Satış</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] tracking-tight">
            Mesafeli Satış Sözleşmesi ve <span className="font-serif italic text-[#405881]">Ön Bilgilendirme Formu</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#6E81A0] leading-relaxed">
            İşbu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca, elektronik ortamda sunulan Mizan PRO dijital abonelik hizmetinin satışına ilişkin hak ve yükümlülükleri düzenler.
          </p>
        </div>

        {/* Parties Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E81A0] block">SATICI BİLGİLERİ</span>
            <div className="space-y-1 text-xs text-[#182542]">
              <p className="font-bold">Mizan Katılım Finans Teknolojileri</p>
              <p className="text-slate-600">Adres: Levent Mah. Büyükdere Cad. No: 193 Beşiktaş / İstanbul</p>
              <p className="text-slate-600">E-Posta: <a href="mailto:destek@mizanapp.tr" className="underline font-bold">destek@mizanapp.tr</a></p>
              <p className="text-slate-600">Web: https://mizanapp.tr</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E81A0] block">ALICI (TÜKETİCİ) BİLGİLERİ</span>
            <div className="space-y-1 text-xs text-[#182542]">
              <p className="font-bold">Platforma Kayıtlı Kullanıcı</p>
              <p className="text-slate-600">Ödeme anında alıcı tarafından beyan edilen ad, soyad ve e-posta bilgileri esas alınır.</p>
              <p className="text-slate-600">Hizmet ifa adresi: Kayıtlı e-posta ve çevrimiçi kullanıcı paneli.</p>
            </div>
          </div>
        </div>

        {/* Detailed Contract Clauses */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">Madde 1: Konu ve Kapsam</h2>
            <p>
              İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait www.mizanapp.tr internet sitesi üzerinden elektronik ortamda siparişini verdiği dijital içerik ve yazılım abonelik hizmetinin (Mizan PRO) satışı, teslimi ve tarafların hak ve borçlarının belirlenmesidir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">Madde 2: Hizmetin Bedeli ve Ödeme Şekli</h2>
            <p>
              Hizmet bedeli; satın alma aşamasında belirtilen aylık veya yıllık abonelik ücreti olup tüm yasal vergiler (KDV) dahildir. Ödeme, ALICI&apos;nın seçeceği kredi kartı veya banka kartı ile güvenli ödeme ağ geçidi üzerinden tahsil edilir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">Madde 3: İfa ve Teslim Şekli</h2>
            <p>
              Sözleşme konusu hizmet dijital nitelikte olup; ödemenin başarıyla tamamlanmasının ardından ALICI&apos;nın hesabına anında tanımlanır. Fiziki bir teslimat veya kargo gönderimi söz konusu değildir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">Madde 4: Cayma Hakkı ve İstisnası</h2>
            <p>
              Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca, elektronik ortamda anında ifa edilen hizmetlerde cayma hakkı bulunmamakla birlikte, SATICI müşteri memnuniyeti ilkesi gereği ilk 7 gün içerisinde tam iade garantisi uygulamaktadır.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">Madde 5: Uyuşmazlıkların Çözümü</h2>
            <p>
              İşbu sözleşmeden doğan ihtilaflarda, Ticaret Bakanlığı&apos;nca her yıl ilan edilen parasal sınırlar dâhilinde ALICI&apos;nın yerleşim yerindeki İl veya İlçe Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
            </p>
          </section>
        </div>
      </div>
    </PaynoShell>
  );
}
