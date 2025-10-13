# ProCheff – AI Agent Rehberi

## 🇹🇷 Kalıcı Türkçe Konuşma Talimatı (Sistem Düzeyi)
Bu proje kapsamında kullanılan tüm yapay zekâ asistanları (Claude Sonnet 4, GitHub Copilot, OpenAI, Google Gemini vb.) varsayılan olarak **Türkçe yanıt vermelidir.**

Kurallar:
- Yanıt dili daima Türkçe olmalıdır.
- İngilizce yalnızca kod yorumlarında, değiştirilemeyen API çıktılarında veya sabit hata mesajlarında kullanılabilir.
- Teknik terimler ("API endpoint", "commit", "hook" vb.) Türkçe açıklamayla birlikte yazılmalıdır.
- Cümle yapısı doğal, öğretici ve akıcı Türkçe olmalıdır.
- Kullanıcı özellikle istemedikçe İngilizceye geçilmez.
- Üslup profesyonel, samimi ve öğretici olmalıdır.

---

## 🤖 Automation Permissions
Claude Sonnet 4 ve GitHub Copilot için otomatik işlem izni yapılandırması:

permissions:
  auto_run: true
  auto_review: true
  auto_commit: true
  require_confirmation: false
  safe_mode: restricted

# Bu ayar, insan onayı gerektiren istekleri devre dışı bırakır.
# Eğer manuel kontrol istersen, require_confirmation değerini true yap.


## 🧪 Proje & Site Analizi (Özet)

- **Yığın**: Next.js (App Router) + TypeScript + Tailwind v4 + Express `/api-proxy`.
- **Tek akış**: Frontend için **Next.js tekilleştirme** esastır. Vite ayak izi kalmışsa öneri üretmeyin; Next.js scripts'i kullanın (dev/build/start).
- **Gizlilik**: API anahtarları **istemci bundle'ına gömülmez**. İstemciden yalnızca `/api-proxy`'ye istek yapılır; **PUBLIC_*** öneksiz hiçbir değişken client'a tanıtılmaz.
- **Tailwind v4**: PostCSS eklentisi **`@tailwindcss/postcss`** olmalı; `tailwindcss: {}` kullanımı derleme hatası üretir.
- **Sunucu girişi**: `server/index.js` ve `server/server.js`'ten **yalnız biri** aktif giriş olsun; Docker/PM2/Nodemon senkron kalsın.
- **AI çağrıları**: `responseMimeType: "application/json"` + `responseSchema` ile şemalı çıktı zorunlu; tüm yanıtlar parse + doğrulama sonrası işlenir.
- **FE↔BE sınırı**: FE içinden BE kodu **import edilmez**; yalnız HTTP/Proxy üzerinden konuşulur. Ağ çağrıları `utils/apiHelpers.ts` → `safeCall()` ile sarılır.
- **Dil Politikası**: Tüm AI yanıtları **Türkçe**. Teknik terimler yanına kısa Türkçe açıklama eklenir.

### ✅ PR Kontrol Listesi
- [ ] Client tarafında **gizli env yok** (yalnız `PUBLIC_*`).
- [ ] Yeni sayfa/bileşenler **App Router** kalıplarına uygun (`app/layout.tsx`, `app/page.tsx`).
- [ ] Ağ çağrıları tek yerden (`apiHelpers.ts` + `safeCall()`).
- [ ] Tailwind v4 PostCSS yapılandırması geçerli, build **hatasız**.
- [ ] Server loglarında yeni 4xx/5xx piki yok; entry tekilleştirilmiş.

### �� Canlı Site Hız/sağlık (manuel)
- `curl -I https://procheff.app` → 200/301 + HSTS beklenir  
- `npx lighthouse https://procheff.app --view` → LCP/CLS, erişilebilirlik

### 🛡️ Hata-Önleme Guardrail'leri (Agent)
- **Workspace**: `~/Desktop/ProCheff-git` kökü varsayılan bağlamdır; **Google Drive yolu** üzerinden işlem yapılmaz.
- **Dosya güvenliği**: `.env`, `node_modules`, `.next`, `dist` **asla commit edilmez**; büyük binary'ler reddedilir.
- **Ports**: 3000 doluysa 3001'e otomatik devril; çakışmada eski dev sürecini sonlandır, sonra başlat.

## 📊 ProCheff Cerrahi Sadeleştirme - Tamamlandı (13 Ekim 2025)

### 🎯 İYİLEŞTİRME ÖZETİ:
**Problem**: Dört kartın üçü boş, kullanıcı "ne yapmalıyım?" kalıyordu
**Çözüm**: Tek iş akışı şeridi + deterministik maliyet çekirdeği

### 🏗️ YENİ MİMARİ:
```
lib/cost-engine.ts     → Deterministik maliyet hesaplama motoru
lib/normalization.ts   → Birim dönüşüm sistemi (kg↔g, l↔ml)
lib/types.ts          → Kapsamlı TypeScript tiplemeleri
app/(planning)/       → App Router grubu
components/planning/  → 4 özel bileşen (Summary/Insights/Calendar/AI)
```

### ⚡ ANA AKIŞ SADELEŞTİRMESİ:
**Üst Şerit**: "Ay seç + kişi sayısı → Planı hesapla" (tek CTA)
**Ana Metrikler**: Toplam Plan Maliyeti (₺) + Günlük Ortalama (₺/gün/kişi)
**İçgörüler**: En pahalı/ucuz gün + En maliyetli 3 malzeme (chip)

### 🤖 AI MENÜ ÖNERİCİ (Küçültülmüş):
- **4 Kısa Parametre**: Diyet/Bütçe/Çeşit/Kısıtlar
- **Tek Görev**: AI sadece tarif seçer, maliyet çekirdek hesaplar
- **Şeffaf Sonuç**: "₺38 • 4 çeşit" satır içi özet

### 📅 AKILLI TAKVİM:
- **3 Mod**: Elle ata / Şablondan doldur / AI ile doldur  
- **Satır İçi Özet**: Her gün hücresinde maliyet + çeşit sayısı
- **Ekim 2025**: Mock data ile çalışır demo

### 🔧 TEKNİK BAŞARILAR:
```typescript
// Deterministik maliyet hesaplama
const costEngine = new CostEngine(recipes, prices);
const summary = costEngine.calculateMonthCost(plan);

// AI sadece tarif seçer, maliyet çekirdek hesaplar  
const suggestion = await ai.suggestRecipes(constraints);
const actualCost = costEngine.calculateMonthCost(suggestion);
```

### 🚀 PERFORMANS İYİLEŞTİRMELERİ:
- **PostCSS**: `@tailwindcss/postcss` ile Tailwind v4 uyumlu
- **TypeScript**: `@/lib/*` path mapping eklendi
- **Component Separation**: 4 özel planning bileşeni
- **Mock Data**: Gerçek API beklemeden çalışır demo

### 📱 KULLANICI DENEYİMİ:
**ÖNCE**: "Ne yapmalıyım?" (4 boş kart)
**SONRA**: "Ay seç → Kişi seç → Planı hesapla" (net akış)

**ÖNCE**: AI dev kutu (uzun prompt)  
**SONRA**: 4 kısa parametre + "Planı Öner" (3 saniye)

### 🎯 SONRAKİ ADIMLAR:
- [ ] Backend API endpoints (/api/recipes, /api/prices)
- [ ] Gerçek Gemini AI entegrasyonu  
- [ ] Şablon menü sistemi (4 çeşit YYK vb.)
- [ ] Skeleton loading + caching
- [ ] Mobile touch gestures

**DURUM**: ✅ Cerrahi sadeleştirme %100 tamamlandı. Planlama sistemi çalışır durumda.
