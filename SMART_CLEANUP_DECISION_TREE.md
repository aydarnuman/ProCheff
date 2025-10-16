#  ProCheff Smart Cleanup Decision Tree

## Akıllı Temizlik Akışı (Decision Tree)

### 🎯 Amaç
Karmaşık proje klasörlerinde gereksiz dosya ve klasörleri otomatik tespit ederken, hata riskini en aza indirmek. Temizlik süreci sadece dosya silmek değil, işlev, bağlılık ve güncellik üzerinden karar verme algoritmasıdır.

---

## 1. 📁 Dosya Analizi Katmanı (İşlev Odaklı)

### Soru 1: Dosya aktif sistemin parçası mı?
- **Evet**: Kalır → `CORE`
- **Hayır**: Soru 2'ye geç

### Soru 2: Dokümantasyon ya da referans niteliğinde mi?
- **Evet**: `DOCS/` altına taşınır
- **Hayır**: Soru 3'e geç

### Soru 3: Eski, test veya kopya versiyonu mu?
- **Evet**: `ARCHIVE/YYYY-MM-DD/` klasörüne taşınır
- **Hayır**: Soru 4'e geç

### Soru 4: İşlevi belirsiz ama önemli görünüyorsa?
- **Evet**: `CRITICAL_UNDEFINED/` içine alınır, izlemeye alınır
- **Hayır**: Kaldırılabilir aday olarak işaretlenir

---

## 2. 📊 Risk Skorlama Katmanı

Her dosya için otomatik risk skoru (0–100) hesaplanır:

| Kriter | Açıklama | Ağırlık |
|--------|----------|---------|
| **Bağlantısızlık** | Hiçbir dosya tarafından çağrılmıyor | +40 |
| **Eski tarih** | Son değiştirilme >180 gün | +20 |
| **Yinelenme** | Benzer isimli dosya mevcut | +15 |
| **Kod içeriği zayıf** | <20 satır veya sadece log/test | +15 |
| **Açıklama eksikliği** | README veya yorum yok | +10 |

### 🎯 Karar Eşikleri:
- **Toplam Skor ≥ 60**: Silinme adayı
- **Skor 40–59**: Arşiv adayı  
- **Skor < 40**: Dokunma (aktif olabilir)

---

## 3. 📛 İsimlendirme & Sürüm Mantığı

- Dosya adında `final`, `copy`, `test`, `old`, `v2`, `v3` geçiyorsa → **Arşivlenir**
- Dosya uzantısı `.log`, `.tmp`, `.bak`, `.DS_Store`, `.swp` → **Direkt silinir**
- Dokümanlar `.md`, `.docx`, `.pdf` → **docs/ altına taşınır**

---

## 4. 🔗 Bağımlılık Analizi (Çağrım Takibi)

- Kod dosyaları, import/export zinciri ile kontrol edilir
- Bir modül hiçbir yerde import edilmiyorsa **bağlantısız** sayılır
- Ancak dosya adı `config`, `settings`, `env` içeriyorsa **istisna** tanınır (elle kontrol edilir)

---

## 5. 📈 Ölçüm ve Geri Bildirim

Temizlikten sonra kontrol edilecekler:
- Build süresi ≥10% hızlandı mı?
- Image boyutu azaldı mı?
- Deploy hatası çıktı mı?
- Cloud Run health endpoint hâlâ 200 mü?

**Eğer bu metriklerden biri olumsuzsa, son temizlik commit'i geri alınır** (`git revert`)

---

## 6. 📦 Otomatik Arşivleme Politikası

- `ARCHIVE/YYYY-MM-DD/` altına taşınan dosyalar **90 gün** tutulur
- 90 gün boyunca erişilmediyse, kalıcı silme planına alınır
- Cloud Storage lifecycle rule ile otomatik silme sağlanabilir

---

## 7. 📄 Belgeleme

Her temizlik sonrası oluşturulacak rapor:

```bash
Temizlik Tarihi: YYYY-MM-DD
Toplam incelenen dosya: N
Silinen: X
Arşivlenen: Y
Taşınan: Z
Build Sonucu: PASSED / FAILED
Açıklama: (özet)
```bash

Rapor `docs/cleanup_reports/` altına kaydedilir.

---

## 8. ⚠️ Öngörülen Hata Türleri ve Önlemler

| Potansiyel Hata | Önleme |
|-----------------|--------|
| Aktif dosya yanlış silinir | Bağımlılık kontrolü zorunlu |
| Migration dosyası silinir | `migrations/` whitelist |
| Gizli dosya (secret) commitlenir | `.gitignore` doğrulaması |
| Dokümanlar karışır | `docs/` altında kategorik alt klasör |
| Geri alınamaz silme | Önce arşivle, sonra sil |

---

## 9. 🔄 Karar Özeti (Akış Diyagramı Mantığı)

```bash
Dosya analiz et → İşlevi belirle → Risk skorla → (≥60 sil / 40–59 arşiv / <40 tut)
    ↓
Bağımlılığı kontrol et → istisna (config, migration, secret) varsa dur
    ↓
Temizlik raporla → build/test → hata varsa geri al
```bash

---

## 🛡️ Güvenlik Prensipleri

1. **Önce anlamak, sonra kaldırmak**
2. **Hata durumunda geri alabilirlik**
3. **Otomatik doğrulama mekanizmaları**
4. **Temizlik öncesi backup alma**
5. **Risk skorlaması ile kademeli yaklaşım**

Bu karar ağacı, temizlik sürecini otomatikleştirirken mantıksal güvenlik sağlar ve hata riskini minimize eder.
