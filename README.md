# MizanApp.tr — Katılım Finansmanı Screening & Arındırma Platformu

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Python FastAPI](https://img.shields.io/badge/Python-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Zero-Float Strict](https://img.shields.io/badge/IEEE%20754-Zero--Float%20Decimal-10b981?style=flat-square)](https://github.com/enescalimli/mizanapp)

Katılım hassasiyeti olan kurumsal ve bireysel yatırımcılar için uçtan uca **Katılım Uygunluk Tarama (Screening), Bilanço & Dipnot Analizi, Kuruşu Kuruşuna Portföy Arındırma (Purification) ve Piyasa Takip Platformu**.

---

## 🏛️ Desteklenen Standartlar

| Standart | Faizli Borç Eşiği | Faizli Nakit/Menkul Eşiği | Uygunsuz Gelir Eşiği |
| :--- | :---: | :---: | :---: |
| **BIST Katılım (TKBB / DİB)** | `< %33.0` | `< %33.0` | `< %5.0` |
| **AAOIFI Shariah Standard No. 21** | `< %30.0` | `< %30.0` | `< %5.0` |

---

## ⚡ Çekirdek Özellikler

- **Çoklu Standart Katılım Motoru:** BIST Katılım ve AAOIFI No.21 standartları arasında tek tıkla geçiş ve dinamik rasyo analizi.
- **Dipnot & Bilanço X-Ray:** Vadeli faizli mevduat ile katılım hesaplarını dipnotlardan ayıran ihtiyatlılık filtresi.
- **Kuruşu Kuruşuna Arındırma (Purification):** IEEE 754 kayan nokta hatası olmaksızın (`Decimal.js`), otomatik takvim günü hesabı ve temettü arındırma motoru.
- **Zekat Takip Modülü:** Al-Sat (Ticari Emtia - %2.5) ve Uzun Vadeli Temettü (Dönen Varlıklar - %2.5) zekat hesaplaması.
- **Katılım Halka Arz Takvimi:** SPK izahnamelerindeki katılım finans ilkeleri ve fon kullanım yeri uygunluk analizleri.
- **Supabase PostgreSQL & RLS:** Satır düzeyinde güvenlik (Row Level Security) ile izole portföy yönetimi.
- **İsviçre Saati Mizan Komplikasyonu:** Helal varlık ağırlığı, borç güvenlik marjı ve gelir temizliğini gösteren konsantrik SVG halkaları.

---

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### 3. Backend Testlerini Çalıştırın
```bash
npm run backend:test
```

---

## 📂 Mimari Yapı

```text
mizanapp/
├── frontend/                # Next.js 15 (App Router) + Tailwind CSS + Lucide Icons
│   ├── src/app/             # Sayfa rotaları (portfolio, purification, ipo, auth)
│   ├── src/components/      # Apple HIG & Linear spotlight bileşenleri
│   └── src/lib/             # Supabase istemcisi, Auth Context ve Decimal motoru
├── backend/                 # Python 3.12 + FastAPI + Pytest birim testleri
│   ├── app/domain/          # Katılım tarama, arındırma ve bilanço motorları
│   └── tests/               # 28/28 geçen uç durum birim testleri
├── supabase/                # PostgreSQL şeması, RLS politikaları ve göç dosyaları
└── vercel.json              # Vercel dağıtım ve derleme yapılandırması
```

---

## 📄 Lisans
MIT &copy; [Mustafa Enes Çalımlı](https://github.com/enescalimli)
