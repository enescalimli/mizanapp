import React from "react";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, Scale, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";

export const metadata = {
  title: "Kullanım Koşulları ve Hizmet Şartları — Mizan Katılım",
  description: "Mizan platformu kullanım koşulları, yasal sorumluluk reddi, SPK uyarısı ve fıkhi hesaplama motoru şartları.",
};

export default function TermsOfServicePage() {
  return (
    <PaynoShell badge="hukuk">
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6E81A0]">
          <Link href="/" className="hover:text-[#182542] flex items-center gap-1 transition">
            <ArrowLeft size={13} />
            <span>Ana Sayfa</span>
          </Link>
          <span>/</span>
          <span className="text-[#182542] font-semibold">Kullanım Koşulları &amp; Yasal Uyarı</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#0D8B52] text-xs font-bold">
            <FileText size={14} />
            <span>Yasal Sözleşme &bull; Son Güncelleme: 2026-10-20</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] tracking-tight">
            Kullanım Koşulları ve <span className="font-serif italic text-[#405881]">Hizmet Şartları</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#6E81A0] leading-relaxed">
            Lütfen Mizan Katılım platformunu (mizanapp.tr) kullanmadan önce bu kullanım koşullarını dikkatle okuyunuz. Sitemizi ziyaret ederek, üye olarak veya hizmetlerimizden yararlanarak bu koşulları kayıtsız şartsız kabul etmiş sayılırsınız.
          </p>
        </div>

        {/* MANDATORY REGULATORY CALLOUT: SPK & YTD */}
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-amber-950 uppercase tracking-wider">
                Yasal Uyarı: Sermaye Piyasası Kurulu (SPK) Yatırım Tavsiyesi Değildir (YTD)
              </h2>
              <p className="text-[11px] text-amber-900/80 font-medium">
                6362 Sayılı Sermaye Piyasası Kanunu ve İlgili Mevzuat Gereğince Zorunlu Beyan
              </p>
            </div>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed">
            Mizan platformunda sunulan tüm veri, rasyo, katılım uygunluk sınıflandırmaları, arındırma yüzdeleri, hisse zekâtı hesaplamaları ve yapay zeka özetleri <strong>yalnızca bilgilendirme, araştırma ve fıkhi takip amaçlıdır</strong>. Platformumuz bir aracı kurum, yatırım danışmanlığı şirketi veya portföy yönetim şirketi değildir. Sitede yer alan hiçbir içerik alım-satım tavsiyesi, yatırım danışmanlığı veya finansal getiri taahhüdü olarak değerlendirilemez. Yatırım kararlarınızı SPK yetkili aracı kurum ve danışmanları vasıtasıyla kendi risk ve getiri tercihlerinize göre vermeniz gerekmektedir.
          </p>
        </div>

        {/* MANDATORY SHARIAH DISCLAIMER: DIB & TKBB */}
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-3xl p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider">
                Fıkhi Hesaplama Motoru ve İcazet Çerçevesi
              </h2>
              <p className="text-[11px] text-emerald-900/80 font-medium">
                Diyanet İşleri Başkanlığı (DİB) Din İşleri Yüksek Kurulu ve TKBB Danışma Kurulu Kriterleri
              </p>
            </div>
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed">
            Mizan, Borsa İstanbul (BIST) Katılım Endeksi metodolojisini, şirketlerin Kamuyu Aydınlatma Platformu’nda (KAP) ilan ettikleri bağımsız denetimden geçmiş çeyreklik mali tablolarını ve Katılım Finans İlkeleri Bilgi Formlarını (KAFİF) algoritmik olarak tarayarak rasyo analizi yapar. <strong>Mizan, resmi bir fetva veya icazet makamı olmayıp</strong>, yetkili kurulların belirlediği kuralları matematiksel olarak işleten bağımsız bir finansal teknoloji aracıdır.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#182542] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#182542] text-white inline-flex items-center justify-center text-[10px]">1</span>
              Hizmet Kapsamı ve Abonelik Modelleri
            </h3>
            <p>
              Mizan, kullanıcılarına Freemium (ücretsiz) ve Mizan PRO (aylık/yıllık ücretli abonelik) modelleri sunar. Freemium hesaplar temel BIST Katılım filtrelerine ve kısıtlı arındırma hesaplarına erişebilirken; Mizan PRO üyeleri tüm hisseler için anlık KAP bildirimleri, limitsiz arındırma arşivleme, bilanço dipnot röntgeni ve PDF raporlama özelliklerine sahip olur.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#182542] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#182542] text-white inline-flex items-center justify-center text-[10px]">2</span>
              Kullanıcı Hesabı ve Güvenlik
            </h3>
            <p>
              Kullanıcılar, oturum açarken sağladıkları e-posta ve doğrulama kodlarının (OTP) gizliliğinden bizzat sorumludur. Hesabınızın yetkisiz kişilerce kullanıldığını fark ettiğiniz anda durumu <a href="mailto:destek@mizanapp.tr" className="font-bold underline text-[#182542]">destek@mizanapp.tr</a> adresine bildirmelisiniz. Şifresiz güvenli oturum (Stateless HMAC OTP) altyapımız parola sızıntılarını önlemek için tasarlanmıştır.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#182542] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#182542] text-white inline-flex items-center justify-center text-[10px]">3</span>
              Fikri Mülkiyet Hakları ve Tersine Mühendislik Yasağı
            </h3>
            <p>
              Mizan platformunda yer alan yazılım kodları, arayüz tasarımları, arındırma algoritmaları, logolar ve grafik varlıkları Mizan Katılım Finans Teknolojileri’ne aittir. Platformun verilerini otomatik botlarla (scraping, crawling) çekmek, tersine mühendislik uygulamak veya ticari amaçla kopyalayarak yeniden dağıtmak kesinlikle yasaktır ve yasal kovuşturmaya tabidir.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#182542] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#182542] text-white inline-flex items-center justify-center text-[10px]">4</span>
              Sorumluluğun Sınırlandırılması
            </h3>
            <p>
              Mizan, BIST veri yayıncıları veya KAP sistemlerindeki olası gecikmelerden, üçüncü parti API kesintilerinden veya kullanıcıların bu verilere dayanarak aldıkları yatırım kararlarından doğabilecek maddi ya da manevi zararlardan hiçbir şart altında sorumlu tutulamaz.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#182542] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#182542] text-white inline-flex items-center justify-center text-[10px]">5</span>
              Yürürlük ve Yetkili Mahkeme
            </h3>
            <p>
              Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Sözleşmenin uygulanmasından doğabilecek her türlü uyuşmazlığın çözümünde İstanbul (Çağlayan) Merkez Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>
          </section>
        </div>
      </div>
    </PaynoShell>
  );
}
