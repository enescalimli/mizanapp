import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, ArrowLeft, Mail, Database, UserCheck } from "lucide-react";
import { PaynoShell } from "@/components/PaynoShell";

export const metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni — Mizan Katılım",
  description: "6698 sayılı KVKK ve GDPR uyumlu kişisel veri işleme, saklama ve unutulma hakkı aydınlatma metni.",
};

export default function PrivacyPolicyPage() {
  return (
    <PaynoShell badge="gizlilik">
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6E81A0]">
          <Link href="/" className="hover:text-[#182542] flex items-center gap-1 transition">
            <ArrowLeft size={13} />
            <span>Ana Sayfa</span>
          </Link>
          <span>/</span>
          <span className="text-[#182542] font-semibold">Gizlilik Politikası &amp; KVKK</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#182542] text-xs font-bold">
            <ShieldCheck size={14} className="text-[#0D8B52]" />
            <span>KVKK &bull; 6698 Sayılı Kanun Uyumlu Aydınlatma Metni</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182542] tracking-tight">
            Gizlilik Politikası ve <span className="font-serif italic text-[#405881]">Kişisel Verilerin Korunması</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#6E81A0] leading-relaxed">
            Mizan Katılım Finans Teknolojileri (&ldquo;Mizan&rdquo;, &ldquo;mizanapp.tr&rdquo;) olarak kişisel verilerinizin gizliliğine ve güvenliğine en üst düzeyde önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (&ldquo;GDPR&rdquo;) uyarınca veri sorumlusu sıfatıyla sizleri aydınlatıyoruz.
          </p>
        </div>

        {/* Data Protection Highlights Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lock size={16} />
            </div>
            <h3 className="text-xs font-bold text-[#182542]">Parolasız Sıfır-Bilgi Doğrulama</h3>
            <p className="text-[11px] text-[#6E81A0] leading-relaxed">
              Veritabanımızda hiçbir zaman düz metin veya hash şifre tutulmaz. Girişler anlık tek kullanımlık kriptografik OTP kodları ile gerçekleştirilir.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database size={16} />
            </div>
            <h3 className="text-xs font-bold text-[#182542]">Uçtan Uca Şifreli Portföy</h3>
            <p className="text-[11px] text-[#6E81A0] leading-relaxed">
              Portföy büyüklüğünüz ve fıkhi arındırma pozisyonlarınız gizlilik moduyla maskelenebilir ve doğrudan tarayıcınızda izole edilir.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
            <h3 className="text-xs font-bold text-[#182542]">Unutulma Hakkı &amp; Veri Silme</h3>
            <p className="text-[11px] text-[#6E81A0] leading-relaxed">
              Dilediğiniz an tüm verilerinizi tek tıkla dışa aktarabilir (JSON) veya veritabanımızdan kalıcı olarak silinmesini talep edebilirsiniz.
            </p>
          </div>
        </div>

        {/* Detailed KVKK Sections */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,37,66,0.04)] space-y-6 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">1. Veri Sorumlusunun Kimliği</h2>
            <p>
              6698 sayılı Kanun uyarınca veri sorumlusu: <strong>Mizan Katılım Finans Teknolojileri</strong> (İstanbul, Türkiye). İletişim: <a href="mailto:kvkk@mizanapp.tr" className="font-bold underline text-[#182542]">kvkk@mizanapp.tr</a> / <a href="mailto:destek@mizanapp.tr" className="font-bold underline text-[#182542]">destek@mizanapp.tr</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">2. İşlenen Kişisel Veriler ve Toplanma Yöntemi</h2>
            <p>
              Platformumuzda aşağıdaki kategorilerde kişisel veriler toplanmaktadır:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, e-posta adresi (üyelik ve OTP doğrulama için).</li>
              <li><strong>İşlem Güvenliği ve Teknik Veriler:</strong> IP adresi, erişim logları, tarayıcı türü, oturum çerezleri.</li>
              <li><strong>Kullanıcı Tercihleri:</strong> Seçilen fıkhi standart (DİB / AAOIFI), arındırma yöntemi (temettü/hisse oranı), bildirim tercihleri.</li>
              <li><strong>Ödeme Bilgileri:</strong> Kart numaralarınız Mizan sunucularında asla saklanmaz. Ödemeler PCI-DSS Seviye 1 sertifikalı lisanslı sağlayıcılar (Stripe/iyzico) üzerinden tokenize edilerek işlenir.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">3. Veri İşlemenin Hukuki Sebepleri</h2>
            <p>
              Verileriniz KVKK Madde 5/2-c (Sözleşmenin kurulması veya ifası), Madde 5/2-ç (Hukuki yükümlülüğün yerine getirilmesi) ve Madde 5/2-f (İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri) hukuki sebeplerine dayalı olarak işlenir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">4. Üçüncü Taraflara Veri Aktarımı</h2>
            <p>
              Kişisel verileriniz hiçbir surette ticari amaçlarla üçüncü kişi veya reklam ağlarına satılmaz. Verileriniz yalnızca teknik altyapının çalışması için zorunlu olan hizmet sağlayıcılarla (Vercel barındırma, Supabase veri tabanı, Resend e-posta iletimi) sınırlı olarak paylaşılmaktadır.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#182542]">5. KVKK Madde 11 Kapsamındaki Haklarınız &amp; Unutulma Talebi</h2>
            <p>
              Her kullanıcı KVKK Madde 11 uyarınca; verilerinin işlenip işlenmediğini öğrenme, yanlış verileri düzelttirme ve dilediği zaman <strong>verilerinin kalıcı olarak silinmesini (unutulma hakkı)</strong> talep etme hakkına sahiptir. Taleplerinizi kayıtlı e-postanız üzerinden <a href="mailto:kvkk@mizanapp.tr" className="font-bold underline text-[#182542]">kvkk@mizanapp.tr</a> adresine ilettiğinizde yasal 30 günlük süre beklenmeksizin 48 saat içerisinde tüm verileriniz sistemlerimizden kalıcı olarak temizlenir.
            </p>
          </section>
        </div>
      </div>
    </PaynoShell>
  );
}
