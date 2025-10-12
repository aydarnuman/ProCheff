# ProCheff – AI Coding Agent Guide

## Big Picture

**Frontend:** Next.js 14 + TypeScript + Tailwind, App Router (/app). Ana modüller: DashboardTab, RecipesTab, PricesTab, PlanTab.

**Backend:** Express (/server) + /api-proxy (Gemini istekleri), CORS ve rate-limit katmanı.

**AI:** GoogleGenAI (Gemini 2.5 Flash). Yanıtlar JSON şemalı ve doğrulanır.

**Shared:** hooks/ (state & form), utils/ (API yardımcıları, tarif hesap/format), brandUtils (logo/marka eşleştirme).

## Dev Akışları

**FE:** `cd ProCheff && npm run dev`

**BE:** `cd ProCheff/server && npm run dev`

**Build:** `npm run build`

**Env:** `.env` → API_KEY / GEMINI_API_KEY (asla koda gömme)

## Proje-Özel Kalıplar

**AI çağrıları:** GoogleGenAI + `responseMimeType:"application/json"` + `responseSchema` (zorunlu).

**Payload küçültme:** Analizlerde yalnız ilgili tarif/fiyatları gönder (bkz. `performGeminiAnalysis`).

**Dayanıklılık:** Ağ çağrılarını `safeCall(fn,{ timeoutMs,retries })` ile sarmala.

**FE↔BE sınırı:** BE kodunu FE'ye import etme; sadece HTTP/Proxy.

**Marka/Logo:** `utils/brandUtils.ts` → `/public/logos/*.`

## Kod Standartları

**İsimlendirme:** Bileşen PascalCase, hook/util camelCase.

**Export:** Bileşenlerde default, util/hook'larda named tercih.

**Tipler:** TS strict; her prop/dönüş tipi yazılı.

**Stil:** Tailwind utility; inline stil yok.

**Alias:** `@/components|hooks|utils|server`.

## Entegrasyon & Veri Akışı

**PricesTab** → Gemini ile fiyat araştırma/öneri; sonuç UI modalları ve geçmişe yazılır.

**PlanTab** → `performGeminiAnalysis(scope, recipes, priceList, monthlyPlan)` ile maliyet analizi; sonucu ekranda özetleyip grafik/tabloları sürer.

**API çağrıları** `utils/apiHelpers.ts` üzerinden (tek yerden hata/süre yönetimi).

## Örnek Kullanımlar

**Güvenli çağrı:**
```typescript
const res = await safeCall(async () => 
  fetch('/api/recipes').then(r => r.json()), 
  { timeoutMs: 8000, retries: 1 }
);
```

**Tipli bileşen:**
```typescript
interface LayoutProps { 
  children: React.ReactNode; 
  title?: string; 
  description?: string; 
}

export default function Layout({ 
  children, 
  title='ProCheff', 
  description='AI-assisted' 
}: LayoutProps) { 
  /* … */ 
}
```

## Claude/Copilot Beklentisi

**Plan → Patch → Test** formatında öneri üret.

**package.json** dışı bağımlılık önermeyi bırak.

**AI işlerinde** şema doğrulama ekle, payload'ı küçült.

**Tailwind** ve alias kurallarına uy, diff üretirken dosya yollarını doğru ver.

---

**Last updated:** Oct 2025

**Key Reminder:** Bu proje Türkiye kullanıcıları için tasarlandığından, yerel mutfak kültürü, malzeme isimleri ve fiyat analizlerinde Türkiye pazarı göz önünde bulundurulmalıdır.
