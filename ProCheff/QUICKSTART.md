# 🚀 HIZLI BAŞLANGIÇ - Vercel Deployment

## ⏱️ 5 Dakikada Deploy Et

### Adım 1: Vercel'e Git (30 saniye)
```
https://vercel.com/new
```

### Adım 2: Repository Import Et (1 dakika)
1. "Import Git Repository" tıklayın
2. `aydarnuman/ProCheff` seçin
3. "Import" tıklayın

### Adım 3: Ayarları Girin (2 dakika)

#### Project Name:
```
pro-cheff
```

#### Root Directory:
```
./ProCheff
```

#### Environment Variables:
Şu değerleri ekleyin:

**Key 1:**
```
NEXT_PUBLIC_API_URL
```
**Value 1:**
```
https://procheff.app/api
```

**Key 2:** (Opsiyonel)
```
GEMINI_API_KEY
```
**Value 2:**
```
[Sizin gerçek API key'iniz - eğer varsa]
```

### Adım 4: Deploy Et! (1.5 dakika)
"Deploy" butonuna tıklayın ve bekleyin.

## ✅ Deploy Tamamlandı!

URL'niz: `https://pro-cheff.vercel.app`

## 📚 Daha Fazla Bilgi İçin

- **Tüm form değerleri**: `VERCEL_COPY_PASTE.txt`
- **Detaylı rehber**: `VERCEL_DEPLOYMENT.md`
- **Görsel referans**: `VERCEL_FORM_REFERENCE.md`
- **Güvenlik notları**: `SECURITY_NOTES.md`

## ⚡ Hızlı Notlar

- ✅ Build otomatik çalışır
- ✅ Framework (Next.js) otomatik algılanır
- ✅ Build command otomatik: `next build`
- ✅ Output directory otomatik: `.next`

## 🔄 Güncellemeler

Her `main` branch'e push:
- ✅ Otomatik production deploy
- ✅ Her PR'de preview deployment
- ✅ Build logs'u Vercel dashboard'da

## 🆘 Sorun mu var?

1. Build logs'u kontrol edin (Vercel dashboard)
2. `VERCEL_DEPLOYMENT.md` → Sorun Giderme bölümü
3. `SECURITY_NOTES.md` → Güvenlik kontrolleri

---

**İyi deploymentlar!** 🚀
