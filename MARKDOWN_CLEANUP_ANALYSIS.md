#  Markdown Cleanup Decision Tree Analysis
## 📅 Analiz Tarihi: 16 Ekim 2025

### 📊 Risk Skorlama Sistemi (Markdown Docs)

#### 🔍 Tespit Edilen Problemli Dosyalar

| Dosya | Satır | Lint Hata | Risk Skoru | Karar |
|-------|-------|-----------|------------|-------|
| `TESLIMAT_ACCEPTANCE_CRITERIA.md` | 286 | 70+ | **85** | 🗑️ SİL |
| `SONNET_IMPLEMENTATION_RULES.md` | 383 | 60+ | **80** | 🗑️ SİL |
| `SONNET_UPDATE_TABLE_FIRST.md` | 210 | 50+ | **75** | 🗑️ SİL |
| `REVIEW_UI_MOCKUP.md` | 326 | 25+ | **70** | 🗑️ SİL |
| `SONNET_DELIVERY_SPEC.md` | 621 | 10+ | **45** | 📦 ARŞİV |
| `SONNET_FEW_SHOT_EXAMPLES.md` | 396 | 5+ | **40** | 📦 ARŞİV |
| `SOLO_DEVELOPER_PLAN.md` | 361 | 15+ | **55** | 📦 ARŞİV |
| `SMART_CLEANUP_DECISION_TREE.md` | 133 | 15+ | **35** | ✅ DÜZELt |
| `CLEANUP_ANALYSIS_REPORT.md` | 135 | 20+ | **45** | 📦 ARŞİV |

### 🎯 Decision Tree Kararları

#### ❌ Silinecek Dosyalar (Risk ≥70)
- **TESLIMAT_ACCEPTANCE_CRITERIA.md**: Çok fazla hata, tekrarlayan içerik
- **SONNET_IMPLEMENTATION_RULES.md**: Aşırı detay, okunaksız
- **SONNET_UPDATE_TABLE_FIRST.md**: Geçici implementation guide
- **REVIEW_UI_MOCKUP.md**: Eski mockup, artık kullanılmıyor

#### 📦 Arşivlenecek Dosyalar (Risk: 40-69)
- **SONNET_DELIVERY_SPEC.md**: Referans amaçlı saklanacak
- **SONNET_FEW_SHOT_EXAMPLES.md**: Gelecekte kullanılabilir
- **SOLO_DEVELOPER_PLAN.md**: Tarihsel değer var
- **CLEANUP_ANALYSIS_REPORT.md**: Temizlik geçmişi için

#### ✅ Düzeltilecek Dosyalar (Risk <40)
- **SMART_CLEANUP_DECISION_TREE.md**: Sistemin temel belgesi
- **README.md**: Proje ana belgesi
- **BROWSER_HELP.md**: Kullanıcı yardımı

### 🧮 Risk Hesaplama Kriterleri

| Kriter | Ağırlık | Açıklama |
|--------|---------|----------|
| **Lint Hata Sayısı** | +40 | 50+ hata = max puan |
| **Güncellik** | +25 | 7+ gün eski = yüksek risk |
| **Kullanım Sıklığı** | +20 | Hiç okunmuyor = risk |
| **İçerik Kalitesi** | +10 | Tekrar/gereksiz = risk |
| **Dosya Boyutu** | +5 | 300+ satır = bakım zorluğu |

### 📈 Öngörülen Fayda

#### 💾 Temizlik Sonrası
- **4 dosya silinecek** (~1,200 satır)
- **4 dosya arşivlenecek** (~1,400 satır)  
- **3 dosya düzeltilecek** (~300 satır)
- **Toplam lint hata azalması**: %85

#### ⚡ Kalite İyileştirmesi
- Markdown linting hızlanacak
- Code review daha temiz
- Dokümantasyon netliği artacak
- Maintenance yükü azalacak

### ✅ Aksiyon Planı

1. **Güvenlik commit**
2. **Yüksek riskli dosyaları sil**
3. **Orta riskli dosyaları arşivle**
4. **Kritik dosyaları düzelt**
5. **Lint kontrolü yap**

---

**Status: HAZIR** - Markdown cleanup başlatılabilir 🚀
