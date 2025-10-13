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
