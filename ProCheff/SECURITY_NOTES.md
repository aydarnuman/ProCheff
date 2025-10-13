# 🔒 Güvenlik Notları - ProCheff

## ⚠️ Bilinen Güvenlik Sorunları

### 1. API Anahtarları Client-Side Kullanımı

**Durum**: 🔴 Kritik  
**Öncelik**: Yüksek

#### Sorun
API anahtarları (GEMINI_API_KEY) client-side React component'lerinde kullanılıyor. Bu, API key'lerin browser bundle'ına gömülmesine ve kullanıcılar tarafından görülebilmesine neden olur.

#### Etkilenen Dosyalar

1. **components/PricesTab.tsx**
   - Satır 750: AI fiyat analizi
   - Satır 789: Tekli ürün fiyat analizi
   ```typescript
   const ai = new GoogleGenerativeAI(process.env.API_KEY || '');
   ```

2. **components/PublicMenuTab.tsx**
   - Satır 36: Public menu generation
   ```typescript
   const ai = new GoogleGenerativeAI(process.env.API_KEY || '');
   ```

3. **utils/analysis.ts**
   - Satır 97: Analysis summary generation
   ```typescript
   const ai = new GoogleGenerativeAI(process.env.API_KEY || '');
   ```

#### Risk Değerlendirmesi

- **Açık API Key**: Browser'da herkes tarafından görülebilir
- **Kötüye Kullanım**: API quota'nız tüketilebilir
- **Maliyet**: Yetkisiz API çağrıları fatura şişmesine neden olur
- **Güvenlik**: API key'in başka servislerde kullanılması

#### Önerilen Çözüm

API çağrılarını **Next.js API Routes** (Server-side) taşıyın:

##### Adım 1: API Route Oluşturma

```typescript
// app/api/ai/price-analysis/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // API key server-side'da kalır
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const body = await request.json();
    
    const model = ai.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: { 
        responseMimeType: "application/json", 
        responseSchema: body.schema 
      }
    });
    
    const result = await model.generateContent(body.prompt);
    const response = await result.response;
    
    return NextResponse.json({ 
      success: true, 
      data: response.text() 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'AI analysis failed' 
    }, { status: 500 });
  }
}
```

##### Adım 2: Client-Side Güncelleme

```typescript
// components/PricesTab.tsx (güvenli versiyon)
const analyzeWithAI = async () => {
  try {
    const response = await fetch('/api/ai/price-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        schema: aiPriceSchema
      })
    });
    
    const result = await response.json();
    if (result.success) {
      // Process result.data
    }
  } catch (error) {
    console.error('AI analysis failed:', error);
  }
};
```

##### Adım 3: Environment Variables

```env
# .env.local (SERVER-SIDE ONLY)
GEMINI_API_KEY=your-actual-api-key-here

# Client'ta kullanılmaz, yalnız Next.js API routes'ta
```

#### Geçici Workaround (Deployment için)

Şu anki deployment için:

1. **Vercel Environment Variables'ta**:
   - `GEMINI_API_KEY` (server-side)
   - `API_KEY` (şimdilik client-side için - GÜVENLİ DEĞİL)

2. **Rate Limiting**:
   - API key'in Google Cloud Console'da rate limit ekleyin
   - Domain restriction ekleyin (sadece procheff.app)
   - Günlük quota limiti ayarlayın

3. **Monitoring**:
   - Google Cloud Console → API & Services → Credentials
   - API key kullanımını günlük kontrol edin
   - Anormal trafik için alert kurun

#### Uygulama Planı

- [ ] Next.js API routes oluştur (`/api/ai/`)
- [ ] PricesTab AI çağrılarını API route'a taşı
- [ ] PublicMenuTab AI çağrılarını API route'a taşı
- [ ] analysis.ts AI çağrılarını API route'a taşı
- [ ] Client-side AI SDK import'larını kaldır
- [ ] API key'leri .env'den temizle
- [ ] Vercel'de environment variables güncelle
- [ ] Test ve deploy

## 🔐 Güvenlik Best Practices

### Environment Variables

✅ **Güvenli - Server-side Only**:
```javascript
// Next.js API Route veya Server Component
const apiKey = process.env.GEMINI_API_KEY;
```

❌ **Güvensiz - Client-side**:
```javascript
// Client Component (Browser'da çalışır)
const apiKey = process.env.API_KEY; // EXPOSED!
```

✅ **Güvenli - Public değerler**:
```javascript
// NEXT_PUBLIC_ prefix ile başlayanlar client'ta kullanılabilir
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### API Routes vs Client Components

| Özellik | API Route | Client Component |
|---------|-----------|------------------|
| API Key Güvenliği | ✅ Güvenli | ❌ Riskli |
| Server Resources | ✅ Erişebilir | ❌ Erişemez |
| Database Access | ✅ Güvenli | ❌ Riskli |
| Rate Limiting | ✅ Kontrol edebilir | ❌ Kontrol edemez |
| Caching | ✅ Kolay | ❌ Zor |

### Next.js 14 App Router Güvenlik

```typescript
// ✅ Server Component (default)
async function SecureComponent() {
  const data = await fetchSecureData(process.env.SECRET_KEY);
  return <div>{data}</div>;
}

// ✅ Server Action
'use server'
async function secureAction() {
  const key = process.env.SECRET_KEY;
  // Güvenli server-side işlem
}

// ✅ API Route
export async function POST(request: Request) {
  const key = process.env.SECRET_KEY;
  // Güvenli API endpoint
}

// ❌ Client Component
'use client'
function InsecureComponent() {
  const key = process.env.SECRET_KEY; // EXPOSED!
  // Bu key browser bundle'ına gömülür
}
```

## 📊 Güvenlik Denetimi Kontrol Listesi

- [ ] Tüm API key'ler server-side'da mı?
- [ ] Client bundle'da gizli bilgi var mı?
- [ ] Environment variables prefix doğru mu? (NEXT_PUBLIC_ sadece public için)
- [ ] API rate limiting aktif mi?
- [ ] Domain restrictions var mı?
- [ ] Error messages hassas bilgi içeriyor mu?
- [ ] HTTPS kullanılıyor mu?
- [ ] CORS doğru yapılandırılmış mı?

## 🔗 Kaynaklar

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js API Routes Security](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Google Cloud API Key Security](https://cloud.google.com/docs/authentication/api-keys)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

**Son Güncelleme**: 13 Ekim 2025  
**Durum**: 🔴 Action Required  
**Tahmini Süre**: 4-6 saat refactoring
