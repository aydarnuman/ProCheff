# 📋 Vercel Deployment Form - Hızlı Referans

Bu dosya, Vercel deployment formunu doldurmak için gerekli tüm bilgileri içerir.

## 🎯 Form Değerleri

### Repository Seçimi
```
Repository: aydarnuman/ProCheff
Branch: main
```

### Proje Ayarları
```
Project Name: pro-cheff
```

### Build Ayarları

| Alan | Değer |
|------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `./ProCheff` |
| **Build Command** | `next build` |
| **Output Directory** | `.next` (Next.js default) |
| **Install Command** | `npm install` |

### 🔐 Environment Variables

Formda "Environment Variables" bölümüne aşağıdaki değerleri ekleyin:

#### Frontend (Public)
```
Key: NEXT_PUBLIC_API_URL
Value: https://procheff.app/api
```

#### Backend (Private - Eğer gerekiyorsa)
```
Key: GEMINI_API_KEY
Value: [Sizin gerçek API key'iniz]
```

> **Önemli**: `EXAMPLE_NAME` yerine yukarıdaki gerçek key isimlerini kullanın!

## 🎨 Ekran Görüntüsü Referansı

Vercel formunda göreceğiniz alanlar:

```
┌─────────────────────────────────────────────┐
│ Import Git Repository                       │
│ ✓ aydarnuman/ProCheff (main)               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Configure Project                           │
│                                             │
│ Project Name: pro-cheff                     │
│                                             │
│ Framework Preset: Next.js [Auto-detected]   │
│                                             │
│ Root Directory: ./ProCheff                  │
│                                             │
│ Build Command: next build                   │
│                                             │
│ Output Directory: .next (default)           │
│                                             │
│ Install Command: npm install                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Environment Variables                       │
│                                             │
│ Key: NEXT_PUBLIC_API_URL                    │
│ Value: https://procheff.app/api             │
│                                             │
│ [+ Add another]                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│             [Deploy]                        │
└─────────────────────────────────────────────┘
```

## ✅ Deployment Checklist

Deploy etmeden önce kontrol edin:

- [ ] Repository GitHub'da mevcut ve erişilebilir
- [ ] `./ProCheff` dizini root directory olarak ayarlandı
- [ ] Next.js framework preset seçildi
- [ ] Environment variables doğru şekilde eklendi
- [ ] Build command `next build` olarak ayarlandı
- [ ] Install command `npm install` olarak ayarlandı

## 🚀 Deploy Sonrası

Deployment başarılı olduktan sonra:

1. Vercel size otomatik bir URL verir: `https://pro-cheff.vercel.app`
2. Custom domain ekleyebilirsiniz: `procheff.app`
3. Her commit otomatik deploy tetikler
4. Preview deployments PR'lerde otomatik oluşur

## 📞 Destek

Deployment sorunları için:
- [Vercel Docs](https://vercel.com/docs)
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Detaylı rehber
- [GitHub Issues](https://github.com/aydarnuman/ProCheff/issues)
