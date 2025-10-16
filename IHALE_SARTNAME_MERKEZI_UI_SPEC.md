#  İhale & Şartname Merkezi - UI/UX Spesifikasyonu
## Tek Sayfa Tam Fonksiyonalite

---

## 🎯 Genel Amaç

Tek bir ekranda; şartname dosyalarını, Sonnet-4 ekstraksiyon verilerini, kanıt/snippet'ları, idareleri, maliyet özetini, revizyon akışını ve audit kayıtlarını sunarak hızlı onay & teklif sürecini mümkün kılmak.

---

## 📋 Sayfa Bölümleri ve Layout

### 1. Header / Meta Bölümü

**Sol Üst:**
- Sayfa başlığı: `[Project Short Name] — İhale & Şartname Merkezi`
- Proje seçici dropdown (mevcut projeyi gösterir)

**Sağ Üst:**
- Durum etiketi badge: `Uploaded` / `Extracted` / `Needs Review` / `Approved`
- İşlem düğmeleri:
  - `Düzenle` (edit mode toggle)
  - `Onayla ve Devam Et` (approve → cost engine)
  - `İndir (Orijinal)` (original document)
  - `Export PDF/Excel` (proposal formats)

**Hızlı Kısayollar:**
- `+ Yeni Şartname Yükle`
- `📚 Versiyon Geçmişi`

### 2. Dosya Görüntüleyici (Document Viewer)

**Sol Yarı (Üst):**
```bash
┌─ Sayfa Önizlemeleri ─┐  ┌─ Ana Görüntü ─────┐
│ [1] [2] [3] [4] [5]  │  │                   │
│ ▼                    │  │   Sayfa 1         │
│ [6] [7] [8] [9] [10] │  │   [PDF Content]   │
└──────────────────────┘  │   Zoom: + - 100%  │
                          │   Download ⬇      │
                          └───────────────────┘
```bash

**Sağ Yarı (Üst):**
```bash
📄 Dosya Meta Bilgileri
─────────────────────────
Yükleyen: [User Name]
Tarih: 15.10.2025 14:30
Boyut: 2.4 MB (12 sayfa)
OCR Durumu: ✅ Başarılı / ❌ Başarısız
Versiyon: v1.2
```bash

### 3. Çıkarılan Bilgiler - Edit & Review Formu

**Ana Form Layout:**
```bash
┌─ Temel Bilgiler ─────────────────────────────────────────┐
│ Proje Adı*         [Input Field................] 🟢 0.95 │
│ Lokasyon           [Input Field................] 🟡 0.75 │  
│ Kurum Tipi*        [Dropdown..] 🟢 0.92 [?] [📋 Kaynak]  │
│ Sözleşme Süresi    [123] gün   🟡 0.68 [?] [📋 Kaynak]  │
└─────────────────────────────────────────────────────────┘

┌─ Servis Detayları ──────────────────────────────────────┐
│ Günlük Porsiyon*   [3000] kişi  🟢 0.95 [?] [📋 Kaynak] │
│ Para Birimi        [TRY ▼]      🟢 0.98 [?] [📋 Kaynak] │
│ Başlangıç Tarihi   [01.01.2025] 🟡 0.72 [?] [📋 Kaynak] │
└─────────────────────────────────────────────────────────┘

┌─ Öğün Tipleri (Tekrarlanabilir) ────────────────────────┐
│ [+] Öğün Ekle                                           │
│                                                         │
│ Öğün 1: Kahvaltı     Haftalık: [7] Porsiyon: [250]g   │
│ Menü Örnekleri: [peynir, zeytin, simit]    [🗑 Sil]   │
│                                                         │
│ Öğün 2: Öğle         Haftalık: [7] Porsiyon: [500]g   │
│ Menü Örnekleri: [et yemeği, pilav, salata] [🗑 Sil]   │
└─────────────────────────────────────────────────────────┘
```bash

**Field Durumları:**
- 🟢 **Yeşil (≥0.90):** Otomatik onaylanabilir
- 🟡 **Sarı (0.60-0.89):** İnsan doğrulaması önerilir  
- 🔴 **Kırmızı (<0.60):** Zorunlu manuel inceleme

**Her Alan İçin:**
- Confidence bar (renk kodlu)
- `[?]` tooltip: kaynak tipi (tablo/başlık/paragraf)
- `[📋 Kaynak]` link: snippet modal açar

### 4. İdare/Kurum Widget (Öncelikli)

```bash
┌─ Kurum Tespiti (Kritik) ────────────────────────────────┐
│ 🎯 Tespit Edilen: Ankara Şehir Hastanesi       (0.92)  │
│                                                         │
│ 📋 Alternatif Candidates:                              │
│ • Çankaya Belediyesi (0.45)              [✓ Seç]      │
│ • Sağlık Bakanlığı (0.23)                [✓ Seç]      │
│ • Manuel Giriş                           [✏️ Yaz]      │
│                                                         │
│ ⚠️ Confidence < 0.60: Zorunlu Onay Gerekli            │
│ 🔒 Onaylanmadan ilerlenemez                           │
└─────────────────────────────────────────────────────────┘
```bash

### 5. Kanıt/Snippets Paneli

```bash
┌─ Kanıt Kaynakları ──────────────────────────────────────┐
│ 🔍 project_name (S.1): "Ankara Şehir Hastanesi..."    │
│ 🔍 servings_per_day (S.3): "Günlük 3.000 porsiyon..." │
│ 🔍 meal_types (S.4): "Öğün Detayları: Kahvaltı 250g..." │
│                                                         │
│ [Her satır tıklanabilir → document viewer'da highlight] │
└─────────────────────────────────────────────────────────┘
```bash

### 6. Hızlı Maliyet Özet

```bash
┌─ Maliyet Önizleme ──────────────────────────────────────┐
│ Günlük: 3.000 porsiyon × 25 TRY = 75.000 TRY/gün      │
│ Aylık: ~2.250.000 TRY                                  │
│ Toplam: ~54.750.000 TRY (24 ay)                        │
│                                                         │
│ [🧮 Detaylı Hesapla] [📊 Maliyet Analizi]             │ 
└─────────────────────────────────────────────────────────┘
```bash

### 7. Versiyon & Audit Timeline

```bash
┌─ Geçmiş & Değişiklikler ────────────────────────────────┐
│ ⏰ 15.10.2025 14:45 - Sonnet v4.2 ekstraksiyon        │
│ ⏰ 15.10.2025 15:12 - User123: servings_per_day düzelt │
│ ⏰ 15.10.2025 15:30 - Admin456: İdare onayladı         │
│                                                         │
│ [📚 Tam Geçmişi Görüntüle]                            │
└─────────────────────────────────────────────────────────┘
```bash

### 8. İletişim/Yorum Paneli

```bash
┌─ Notlar & Yorumlar ─────────────────────────────────────┐
│ 💬 Admin: "Ramazan ayında özel menü gerekli"          │
│ 💬 Reviewer: "Portion boyutları kontrol edildi ✓"     │
│                                                         │
│ [Yeni not ekle...                          ] [Gönder]  │
└─────────────────────────────────────────────────────────┘
```bash

### 9. Footer Actions

```bash
┌─ Ana İşlemler ──────────────────────────────────────────┐
│ [🔄 Geri Gönder]  [✅ Onayla ve Devam Et]  [📤 Export] │
│                                                         │
│ [📋 Create Tender Package] (opsiyonel)                 │
└─────────────────────────────────────────────────────────┘
```bash

---

## 🎛️ Davranış Kuralları (UX Rules)

### Validation & Security
1. **Field confidence < 0.60** → Alan kırmızı, zorunlu manuel edit, onay kilidi
2. **İdare detection:** Candidate seçimi zorunluysa approve engellenir
3. **Tüm müdahaleler** spec_reviews tablosuna immutable kaydedilir
4. **Orijinal dosya** sadece yetkili rollerce indirilebilir
5. **Snippet metinleri** PII için maskelenebilir

### Mobile Responsive
- Bölümler stacked layout
- Document viewer collapsible (performans)
- Form alanları tek sütun
- Actions sticky footer

### Interactive Elements
- **Inline editing:** Alanlar click-to-edit
- **Auto-save:** Her değişiklik kaydedilir
- **Real-time validation:** Anlık feedback
- **Progressive disclosure:** Detaylar accordion'da

---

## 📊 Export & Interoperability

### Export Formatları
1. **PDF:** Teklif taslağı (branded template)
2. **Excel:** Maliyet kırılımı (detaylı tablolar)
3. **JSON:** Raw extraction + field_confidences

### Download Metadata
- extraction_id
- spec_id  
- Sonnet_model_version
- export_timestamp
- user_id

---

## 👥 Roller & İzinler

| Role | Upload | Review | Approve | Export | Admin |
|------|--------|--------|---------|--------|-------|
| **Viewer** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Reviewer** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Approver** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |

**Onay Workflow:**
- Approve yalnızca `Approver` veya `Admin` rolü
- Dual approval seçeneği (Approver + Admin)

---

## 📈 Monitoring & Metrics

### Yakalanacak Metrikler
- `extraction_latency` - Ekstraksiyon süresi
- `extraction_success_rate` - Başarı oranı
- `needs_review_rate` - Manuel inceleme oranı
- `idare_detection_recall` - İdare tespit doğruluğu
- `user_corrections_count` - Kullanıcı düzeltme sayısı

### Alert Kuralları
- `needs_review_rate > 5%` (24h) → Operasyon bildirimi
- `idare_detection < 80%` → Sonnet ekibine bildirim
- `extraction_latency > 120s` → Performance alert

---

## ✅ Acceptance Kriterleri

### Functional Requirements
1. **Upload Performance:** Upload → extraction task queued < 5s
2. **UI Responsiveness:** Form alanları extraction sonuçlarını gösterir
3. **İdare Detection:** Auto-candidate 3 öneri görünür
4. **Approval Workflow:** Approve sonrası cost engine tetiklenir
5. **Snippet Navigation:** Tıklama → document viewer highlight

### Quality Gates
1. **Test Coverage:** 10 test şartnameden ≥9'unda doğru idare detection
2. **Performance:** Sayfa yüklenme < 2s
3. **Mobile Compatibility:** Tüm cihazlarda kullanılabilir
4. **Error Handling:** Graceful degradation
5. **Security:** RBAC tam implementasyonu

---

## 🎨 Visual Design Guidelines

### Color Scheme
- **Success (Green):** #10B981 - Yüksek confidence
- **Warning (Yellow):** #F59E0B - Orta confidence  
- **Danger (Red):** #EF4444 - Düşük confidence
- **Primary (Blue):** #3B82F6 - Ana aksiyonlar
- **Secondary (Gray):** #6B7280 - Metadata

### Typography
- **Headers:** Inter Bold 24px/32px
- **Body:** Inter Regular 16px/24px  
- **Small:** Inter Regular 14px/20px
- **Code:** Fira Code 14px/20px

### Icons
- **Confidence:** 🟢🟡🔴 (colored circles)
- **Actions:** ✅❌🔄📤📋🧮
- **Status:** ⏰💬🎯🔍📄

### Layout Spacing
- **Container:** max-width 1400px
- **Grid:** 12-column system
- **Gaps:** 16px/24px/32px
- **Borders:** 1px solid #E5E7EB

---

Bu spesifikasyon UI/UX ekibine tam implementation guideline'ı sağlar. Her bölüm detaylı layout, davranış kuralları ve acceptance kriterleri içerir.
