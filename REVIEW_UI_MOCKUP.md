# Review UI Mockup - Tasarım Ekibi İçin
## İhale & Şartname Merkezi - Wireframe Guide

---

## 📱 Page Layout (Desktop 1400px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏠 ProCheff   [Proje Seçici ▼]    [Extracted ●] [Düzenle] [Onayla] │
│ Ankara Şehir Hastanesi — İhale & Şartname Merkezi                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ DOSYA GÖRÜNTÜLEYICI ─┐  ┌─ KURUM TESPİTİ (KRİTİK) ───────────┐ │
│ │ [1][2][3]    │ PDF    │  │ 🎯 Tespit: Ankara Şehir Hastanesi  │ │
│ │ [4][5][6]    │ Sayfa  │  │ Confidence: ████████░░ 0.92        │ │
│ │ [7][8][9]    │ 1      │  │                                     │ │
│ │              │ Zoom:  │  │ 📋 Alternatifler:                  │ │
│ │              │ + - %  │  │ • Çankaya Belediyesi (0.45) [Seç] │ │
│ │              │ ⬇ İndir │  │ • Sağlık Bakanlığı (0.23)   [Seç] │ │
│ └──────────────┴────────┘  │ • Manuel giriş              [Yaz] │ │
│                            └─────────────────────────────────────┘ │
│                                                                     │
│ ┌─ ÇIKARILAN BİLGİLER - FORM ────────────────────────────────────┐ │
│ │ Proje Adı*     [Ankara Şehir Hastanesi...] 🟢 0.95 [?][📋]   │ │
│ │ Lokasyon       [Ankara/Çankaya           ] 🟡 0.75 [?][📋]   │ │
│ │ Kurum Tipi*    [Şehir Hastanesi    ▼    ] 🟢 0.92 [?][📋]   │ │
│ │ Günlük Porsiyon [3000] kişi               🟢 0.95 [?][📋]   │ │
│ │                                                               │ │
│ │ ┌─ ÖĞÜN TİPLERİ ─────────────────────────────────────────┐   │ │
│ │ │ [+ Öğün Ekle]                                          │   │ │
│ │ │ 1. Kahvaltı  Hafta:[7] Porsiyon:[250]g [🗑]          │   │ │
│ │ │    Menü: peynir, zeytin, simit                        │   │ │
│ │ │ 2. Öğle      Hafta:[7] Porsiyon:[500]g [🗑]          │   │ │  
│ │ │    Menü: etli yemek, pilav, salata                    │   │ │
│ │ └───────────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ KANIT KAYNAKLARI ──┐ ┌─ MALİYET ÖNİZLEME ───┐ ┌─ NOTLAR ─────┐ │
│ │ 🔍 project_name     │ │ Günlük: 75.000 TRY   │ │ 💬 Admin:    │ │
│ │ (S.1): "Ankara..."  │ │ Aylık: 2.250.000 TRY │ │ "Ramazan     │ │
│ │                     │ │ Toplam: 54.750.000   │ │ ayında özel  │ │
│ │ 🔍 servings_per_day │ │                      │ │ menü"        │ │
│ │ (S.3): "Günlük..."  │ │ [🧮 Detaylı Hesapla] │ │              │ │
│ │                     │ │ [📊 Analiz]          │ │ [Yeni not..] │ │
│ └─────────────────────┘ └──────────────────────┘ └──────────────┘ │
│                                                                     │
│ ┌─ GEÇMİŞ & DEĞİŞİKLİKLER ──────────────────────────────────────┐ │
│ │ ⏰ 15.10.2025 14:45 - Sonnet v4.2 ekstraksiyon                │ │
│ │ ⏰ 15.10.2025 15:12 - User123: servings_per_day düzeltmesi    │ │
│ │ ⏰ 15.10.2025 15:30 - Admin456: İdare onaylandı               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ ANA İŞLEMLER ─────────────────────────────────────────────────┐ │
│ │ [🔄 Geri Gönder] [✅ Onayla ve Devam Et] [📤 Export PDF/Excel] │ │
│ │                 [📋 Tender Package Oluştur]                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Component Specifications

### Header Section
```
Component: PageHeader
├─ Logo + Navigation (left)
├─ Project Selector (dropdown, current project)
├─ Status Badge (color-coded: extracted/needs_review/approved)
└─ Action Buttons (edit, approve, download, export)

Props:
- currentProject: string
- status: 'uploaded' | 'extracted' | 'needs_review' | 'approved'
- onProjectChange: (projectId) => void
- onEdit: () => void
- onApprove: () => void
```

### Document Viewer
```
Component: DocumentViewer
├─ Thumbnail Navigation (left sidebar)
├─ Main Viewer (PDF.js integration)
├─ Zoom Controls
├─ Download Button
└─ Page Highlight (when snippet clicked)

Props:
- documentUrl: string
- currentPage: number
- highlightedAreas: Array<{page, x, y, width, height}>
- onPageChange: (page) => void
```

### Institution Detection Widget
```
Component: InstitutionDetector
├─ Primary Detection (with confidence)
├─ Alternative Candidates List
├─ Manual Input Option
└─ Approval Lock (if confidence < 0.60)

Props:
- detectedInstitution: {name, confidence}
- candidates: Array<{name, confidence}>
- isLocked: boolean
- onSelect: (institution) => void
- onManualInput: (custom) => void

Styling:
- High confidence (>0.90): Green border
- Medium confidence (0.60-0.90): Yellow border  
- Low confidence (<0.60): Red border + lock icon
```

### Extraction Form
```
Component: ExtractionForm
├─ Field Groups (Basic Info, Service Details, Meal Types)
├─ Confidence Indicators (color-coded bars)
├─ Source Links (open snippet modal)
├─ Inline Editing
└─ Auto-save

Field Component:
├─ Label + Required indicator
├─ Input/Select/Textarea
├─ Confidence Bar (green/yellow/red)
├─ Tooltip (source type)
└─ Source Link Button

Props per field:
- value: any
- confidence: number (0-1)
- sourceType: 'table' | 'paragraph' | 'inference'
- snippet: {page, text}
- onChange: (value) => void
```

### Snippet Modal
```
Component: SnippetModal
├─ Document Page View (specific page)
├─ Highlighted Text
├─ Copy Button
├─ Field Context
└─ Close Button

Props:
- isOpen: boolean
- snippet: {field, page, text}
- documentUrl: string
- onClose: () => void
```

### Cost Preview
```
Component: CostPreview
├─ Quick Calculations (daily/monthly/total)
├─ Currency Display
├─ Detail Button (opens cost engine)
└─ Analysis Button

Props:
- servingsPerDay: number
- currency: string
- unitPrice: number (estimated)
- contractDays: number
- onDetailedCalculation: () => void
```

### Notes Panel
```
Component: NotesPanel
├─ Existing Notes List
├─ New Note Input
├─ User Avatar + Timestamp
└─ Send Button

Props:
- notes: Array<{user, timestamp, content}>
- currentUser: string
- onAddNote: (content) => void
```

### Audit Timeline
```
Component: AuditTimeline  
├─ Event List (chronological)
├─ User Information
├─ Action Types (extraction, edit, approval)
├─ Timestamps
└─ Expand/Collapse

Props:
- events: Array<{timestamp, user, action, details}>
- maxVisible: number
- onExpand: () => void
```

---

## 📱 Mobile Responsive (768px breakpoint)

```
┌─────────────────────────────┐
│ 🏠 [Proje ▼] [Status] [⋮]   │ ← Collapsed header
├─────────────────────────────┤
│ 🎯 KURUM TESPİTİ           │ ← Priority first
│ Ankara Şehir Hastanesi     │
│ Confidence: ████████░░ 0.92 │
│ [Seç] [Alternatifler ▼]    │
├─────────────────────────────┤
│ 📋 FORM BİLGİLERİ         │ ← Stacked form
│ Proje Adı: [............] │
│ Lokasyon:  [............] │
│ etc...                     │
├─────────────────────────────┤
│ 📄 DOKÜMAN [Göster/Gizle]  │ ← Collapsible
│ [PDF thumbnail grid]       │
├─────────────────────────────┤
│ 💰 MALİYET ÖZETİ          │ ← Summary only
│ Günlük: 75.000 TRY        │
│ [Detay] [Hesapla]         │
├─────────────────────────────┤
│ [Geri Gönder] [Onayla]     │ ← Sticky footer
└─────────────────────────────┘
```

---

## 🎭 Interaction Patterns

### Confidence Visual Language
```
High (0.90+):   🟢 ████████████ 0.95  (Green, solid)
Medium (0.60+): 🟡 ██████░░░░░░ 0.75  (Yellow, striped) 
Low (<0.60):    🔴 ███░░░░░░░░░ 0.45  (Red, danger)
```

### Tooltip Content Examples
```
Confidence Tooltip:
"Kaynak: Tablo hücresi
Güven: 0.95 (Çok yüksek)
Doğrulama: Gerekmiyor"

Source Tooltip:
"Sayfa 2, Tablo
Metin: 'Ankara Şehir Hastanesi...'
Tıklayarak kaynağı görüntüle"
```

### Loading States
```
Form Loading:
- Skeleton placeholders
- Confidence bars animated
- "Sonnet ekstraksiyon yapıyor..." message

Document Loading:  
- PDF viewer spinner
- Thumbnail loading indicators
- Progressive image loading
```

### Error States
```
High Priority Errors:
- Red banner: "Kurum tespiti gerekli - Onaylanamaz"
- Field validation: "Bu alan zorunlu"
- Upload errors: "Dosya yüklenemedi, tekrar deneyin"

Warning States:
- Yellow banner: "Düşük güven alanları kontrol edin"
- Confidence warnings: "Manuel doğrulama önerilir"
```

---

## 🔧 Technical Implementation Notes

### State Management
```typescript
interface PageState {
  document: DocumentMeta
  extraction: ExtractionData
  institutionCandidates: Array<Institution>
  editMode: boolean
  selectedInstitution: Institution | null
  formData: FormFields
  auditLog: Array<AuditEvent>
  costPreview: CostData | null
}
```

### API Integration Points
```
GET /api/specifications/{id}/extraction
POST /api/specifications/{id}/review
PUT /api/specifications/{id}/approval
POST /api/cost-engine/preview
GET /api/audit/{spec_id}/timeline
```

### Performance Optimizations
```
- PDF.js worker for document rendering
- Virtual scrolling for large audit logs
- Debounced auto-save (500ms)
- Lazy loading for cost calculations
- Image optimization for thumbnails
```

### Accessibility (WCAG 2.1 AA)
```
- Semantic HTML structure
- ARIA labels for confidence indicators
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratios >4.5:1
- Focus management for modals
```

Bu mockup tasarım ekibinin direkt wireframe ve UI kit'e çevirmesi için hazır!