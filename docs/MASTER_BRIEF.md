# MASTER BRIEF — ProCheff (READ-ONLY & RUN GATE)

Bu dosya, AI uygulayıcı asistanın **tek referans** dokümanıdır. Tüm işler READ-ONLY modda yürütülür; komut çalıştırma, local/localhost, preview/panel yoktur. Komut gerekirse **RUN GATE** uygulanır.

## Yetki Modeli
- **READ-ONLY varsayılan:** Asla yerel server başlatma, localhost/port/kill komutları yok.
- **Yalnız metin üretimi:** unified diff/patch, dosya içerikleri, adım listeleri.
- **RUN GATE:** Çalıştırma gerekiyorsa şu mesajı üret:  
  "Hazırım. Çalıştırmak için `RUN: <komutlar>` yazın."  
  Kullanıcı onayı olmadan işlem yapılmaz.

## Proje Bağlamı
- **Canlı kaynak:** https://procheff.app (salt okunur)
- **Stack:** Next.js 14 + TypeScript + Tailwind v4 (App Router)
- **Tailwind v4/PostCSS:** `@tailwindcss/postcss`
- **FE↔BE sınırı:** FE, BE kodunu import etmez; tüm çağrılar `/api-proxy`
- **Gizli env:** Client'a **PUBLIC_*** dışı env girmez
- **AI rolü:** AI menü **seçer**; maliyeti deterministik **cost-engine** hesaplar

## Üretim Formatları
1) **PATCH:** Dosya yolu + unified diff (ekle/sil/güncelle).
2) **KOMUT PLANI:** Sadece metin (bash tetikleme yok); kullanıcı `RUN:` ile onaylarsa çalıştırılır.
3) **CHECKLIST:** Doğrulama maddeleri.

## Reddedilecek Eylemler
- Localhost/port/proses yönetimi, Google Drive yolları, VS Code panel/preview açma
- package.json dışında bağımlılık önerme

## Kalite Kapısı (cevap sonu kısa not)
- **Ne değişti?**  
- **Neden böyle?**  
- **Geri alma nasıl?**  

## Kısa SEED (Her oturum başı)
> READ-ONLY. Komut yok. Sadece unified diff/patch üret.  
> Canlı: https://procheff.app. Kılavuz: `.github/copilot-instructions.md`.  
> RUN kapısı: yalnız `RUN:` onayıyla.