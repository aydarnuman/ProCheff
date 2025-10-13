# 🚀 Vercel Deployment Rehberi - ProCheff

Bu doküman, ProCheff uygulamasını Vercel'e deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

1. GitHub hesabı (repository'niz GitHub'da olmalı)
2. Vercel hesabı (https://vercel.com - GitHub ile giriş yapabilirsiniz)
3. Gerekli API anahtarları (Gemini API vs.)

## 🎯 Vercel Deployment Formu Ayarları

Vercel'de yeni proje oluştururken aşağıdaki ayarları kullanın:

### Temel Ayarlar

| Alan | Değer | Açıklama |
|------|-------|----------|
| **Framework Preset** | Next.js | Otomatik algılanır |
| **Root Directory** | `./ProCheff` | Monorepo yapısı olduğu için |
| **Build Command** | `next build` | Varsayılan Next.js build komutu |
| **Output Directory** | `.next` | Next.js default output |
| **Install Command** | `npm install` | Varsayılan package manager |

### 🔐 Environment Variables (Ortam Değişkenleri)

Vercel dashboard'da aşağıdaki environment variable'ları ekleyin:

#### Frontend için (NEXT_PUBLIC prefix ile):

```
NEXT_PUBLIC_API_URL=https://procheff.app/api
```

#### Backend için (eğer server'ı da deploy ediyorsanız):

```
GEMINI_API_KEY=your-actual-gemini-api-key-here
PORT=3001
NODE_ENV=production
```

> **Not**: `NEXT_PUBLIC_` prefix'i ile başlayan değişkenler client-side'da kullanılabilir. Gizli API anahtarları için bu prefix kullanmayın!

## 📝 Adım Adım Deployment

### 1. GitHub Repository Hazırlığı

```bash
# Tüm değişiklikleri commit edin
git add .
git commit -m "Vercel deployment için yapılandırma eklendi"
git push origin main
```

### 2. Vercel'e Import Etme

1. https://vercel.com/new adresine gidin
2. "Import Git Repository" seçeneğini seçin
3. GitHub'dan `aydarnuman/ProCheff` repository'sini seçin
4. "Import" butonuna tıklayın

### 3. Proje Yapılandırması

Vercel yapılandırma sayfasında:

```
Project Name: pro-cheff
Framework: Next.js (otomatik algılanır)
Root Directory: ./ProCheff
```

#### Build Settings:
```
Build Command: next build
Output Directory: .next (Next.js default)
Install Command: npm install
```

### 4. Environment Variables Ekleme

"Environment Variables" bölümünde:

1. **NEXT_PUBLIC_API_URL** ekleyin:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://procheff.app/api` (veya API endpoint'iniz)

2. Eğer backend'i de aynı yerde deploy ediyorsanız:
   - Key: `GEMINI_API_KEY`
   - Value: Gerçek API key'iniz

> **Güvenlik Uyarısı**: Asla gerçek API anahtarlarını `.env` dosyalarına commit etmeyin!

### 5. Deploy Başlatma

1. "Deploy" butonuna tıklayın
2. Build process'i izleyin (yaklaşık 2-3 dakika sürer)
3. Deployment tamamlandığında otomatik URL alırsınız (örn: `pro-cheff.vercel.app`)

## 🔧 Build Sürecini İzleme

Vercel build sürecinde:

1. Dependencies yükleme (`npm install`)
2. Next.js build (`next build`)
3. Static assets optimize etme
4. Deployment finalize etme

### Olası Build Hataları ve Çözümleri

#### TypeScript Hataları
```bash
# Lokal olarak kontrol edin:
npm run lint
npm run build
```

#### Missing Dependencies
```bash
# Package.json'ı kontrol edin
npm install
```

## 🌍 Domain Ayarları

### Custom Domain Ekleme

1. Vercel dashboard → Project Settings → Domains
2. "Add" butonuna tıklayın
3. `procheff.app` domain'ini ekleyin
4. DNS ayarlarını Vercel'in verdiği şekilde yapılandırın:

```
Type: A Record
Name: @
Value: 76.76.21.21
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 🔄 Otomatik Deployment

Vercel otomatik olarak:
- `main` branch'e her push'ta production deploy
- Pull request'lerde preview deploy oluşturur

### Branch Deployment Ayarları

```
Production Branch: main
Preview Branches: Tüm branch'ler
```

## 📊 Monitoring ve Analytics

Vercel dashboard'da izleyebilirsiniz:
- Deployment history
- Build logs
- Runtime logs
- Performance metrics
- Bandwidth usage

## 🚨 Önemli Notlar

### Backend Server Hakkında

ProCheff'te ayrı bir Express server (`/server` dizini) var. İki seçeneğiniz var:

#### Seçenek 1: Next.js API Routes'a Taşıma (Önerilen)
Express endpoint'lerini Next.js API routes'a taşıyın:
- `server/index.js` → `app/api/` dizinine taşınabilir
- Tam entegre tek deployment

#### Seçenek 2: Ayrı Backend Deployment
Backend'i ayrı bir servise deploy edin:
- Railway.app
- Render.com
- Fly.io
- Heroku

### Environment Variables Güvenliği

✅ **Güvenli**:
```javascript
// Client-side
process.env.NEXT_PUBLIC_API_URL
```

❌ **Güvensiz** (Client bundle'da görünür):
```javascript
// Backend API keys - asla NEXT_PUBLIC_ ile başlamayan
process.env.GEMINI_API_KEY // Server-side only
```

## 🧪 Deployment Sonrası Test

```bash
# Production URL'yi test edin
curl https://pro-cheff.vercel.app

# Health check
curl https://pro-cheff.vercel.app/api/health

# Lighthouse ile performance testi
npx lighthouse https://pro-cheff.vercel.app --view
```

## 📱 Rollback (Geri Alma)

Bir deployment'ta sorun olursa:

1. Vercel dashboard → Deployments
2. Önceki başarılı deployment'ı bulun
3. "Promote to Production" tıklayın

## 🆘 Sorun Giderme

### Build Başarısız Olursa

1. Build logs'u inceleyin
2. Lokal olarak test edin: `npm run build`
3. Dependencies'i kontrol edin: `npm install`
4. TypeScript hatalarını düzeltin: `npm run lint`

### Runtime Hataları

1. Vercel dashboard → Runtime Logs
2. Browser console'u kontrol edin
3. Environment variables'ları doğrulayın

## 🔗 Faydalı Linkler

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)

## 💡 Pro İpuçları

1. **Preview Deployments**: Her PR otomatik preview URL alır
2. **Environment Variables**: Production, Preview, Development için ayrı ayarlanabilir
3. **Custom Headers**: `vercel.json`'da HTTP headers tanımlanabilir
4. **Redirects**: SEO için redirects eklenebilir
5. **Analytics**: Vercel Analytics ile kullanıcı davranışını izleyin

---

**Deployment sürecinde sorun yaşarsanız:**
- Vercel support: https://vercel.com/support
- GitHub Issues: Repository'de issue açın
- Community: Vercel Discord server
