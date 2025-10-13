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

- **Yığın**: Next.js (App Router) + Tailwind v4 + Express proxy.
- **Çatallanma uyarısı**: Vite konfigürasyonu ile Next komutları bir arada; tek frontend akışına düşürün.
- **Gizlilik**: API anahtarları asla istemci bundle'ına gömülmez; tüm AI çağrıları `/api-proxy` üstünden.
- **Tailwind v4**: PostCSS eklentisi `@tailwindcss/postcss` olmalı; derleme hatası buradan gelir.
- **Sunucu girişi**: `server/index.js` ve `server/server.js`'ten yalnız biri "gerçek" entry olmalı.
- **AI çağrıları**: `responseMimeType: "application/json"` + şema zorunlu; çıktı mutlaka parse/doğrulanır.
- **PR Kontrol Listesi**:
  - [ ] İstemcide gizli env yok (yalnız PUBLIC_*).
  - [ ] Yeni sayfalar App Router kalıplarını izliyor.
  - [ ] Ağ çağrıları `safeCall()` ve tek `apiHelpers` üzerinden.
  - [ ] Tailwind sınıfları kullanılabilir (build başarıyla geçiyor).
  - [ ] Server loglarında 4xx/5xx pikleri regresyon değil.
- **Canlı Site Hız Testi** (manuel):
  - `curl -I https://procheff.app` → 200/301 + HSTS
  - `npx lighthouse https://procheff.app --view`
- **Hata Sınıflandırma**:
  - Derleme hatası → PostCSS/Tailwind uyumu
  - 401/403 → proxy/auth konfigürasyonu
  - 5xx → server entry/çevre değişkenleri
