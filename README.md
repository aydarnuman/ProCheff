#  ProCheff - AI Recipe Management System

## 🚀 Kurulum Aşaması

Bu proje şu anda kurulum aşamasında. Otomatik deployment pipeline'ı aktif durumda.

### 📁 Proje Yapısı

```bash
ProCheff/
├── app/                 # Next.js App Router
├── components/          # React componentleri
│   ├── ui/             # Temel UI componentleri
│   ├── layout/         # Layout componentleri
│   ├── forms/          # Form componentleri
│   ├── planning/       # Menü planlama
│   ├── recipes/        # Tarif yönetimi
│   └── prices/         # Maliyet takibi
├── lib/                # Utility fonksiyonlar
├── hooks/              # Custom React hooks
├── utils/              # Helper fonksiyonlar
├── types/              # TypeScript tipleri
└── constants/          # Sabit değerler
```bash

### 🛠️ Teknolojiler

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions

### 📋 Özellikler (Planlanan)

- 📝 Aylık menü planlama
- 🥘 Tarif yönetimi
- 💰 Maliyet hesaplama
- 🤖 AI destekli öneriler
- 📱 Responsive tasarım

### 🔄 Otomatik Deployment

Her main branch'a push otomatik olarak production'a deploy edilir.

### 🚀 Geliştirme

```bash
#  Kurulum
npm install

#  Geliştirme sunucusu
npm run dev

#  VS Code otomatik izinler
#  .vscode/settings.json dosyası mevcut Claude izinlerini otomatik onaylar

#  Non-interactive Claude kullanımı
cp .env.template .env.local
#  .env.local'e ANTHROPIC_API_KEY ekle
npm run claude "Yeni component ekle"
```bash

### 🤖 Claude AI Otomasyonu

```bash
#  API üzerinden otomatik (izin istemiyor)
export ANTHROPIC_API_KEY="your_key"
npm run claude "ProCheff'e recipe form component'i ekle"

#  VS Code eklentisi otomatik onay (workspace ayarlı)
#  Artık hiç "Allow" sormuyor

## 🔐 Workload Identity Federation
ProCheff now uses secure Workload Identity Federation for Google Cloud deployment.

## 🚀 Phase 5.5 - Fiyat Zekâ Derinliği
- AI-powered price predictions with confidence scoring
- Micro UX animations for enhanced user experience
- Learning-based unit conversion engine
- Production-focused batch optimization
```bash
