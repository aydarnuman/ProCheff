# İhale & Şartname Merkezi - Teslimat Paketi
## Acceptance Kriterleri & Implementation Checklist

---

## 📦 Teslimat Paketi İçeriği

Bu teslimat paketi 4 ayrı ekibe verilecek:

### 1. UI/UX Ekibi
- **`IHALE_SARTNAME_MERKEZI_UI_SPEC.md`** - Tam UI/UX spesifikasyonu
- **`REVIEW_UI_MOCKUP.md`** - Detaylı wireframe guide

### 2. Sonnet AI Ekibi  
- **`SONNET_FEW_SHOT_EXAMPLES.md`** - 8 adet few-shot training example
- **`SONNET_DELIVERY_SPEC.md`** - Teknik API spesifikasyonu (önceden hazırlandı)

### 3. Backend Development Ekibi
- **`lib/services/sonnet-extraction.ts`** - ProCheff integration service
- **`app/api/sonnet-extraction/`** - API endpoints
- **`lib/types/sonnet-extraction.ts`** - TypeScript types

### 4. QA/Test Ekibi
- **`lib/tests/sonnet-integration.ts`** - Test suite
- **Bu dosya** - Acceptance kriterleri

---

## ✅ Functional Acceptance Criteria

### Core Functionality (Must Have)

#### FA-001: Dosya Yükleme & İşleme
- [ ] **Upload Performance:** Dosya yükleme → extraction task kuyruğa < 5 saniye
- [ ] **Supported Formats:** PDF, Word, Image dosyaları desteklenir
- [ ] **File Size Limit:** Maksimum 50MB dosya kabul edilir
- [ ] **OCR Fallback:** Taranmış PDF'ler için OCR otomatik devreye girer

#### FA-002: Sonnet Ekstraksiyon Entegrasyonu
- [ ] **API Integration:** Sonnet API'sine başarılı request gönderir
- [ ] **Schema Compliance:** Response JSON schema validation geçer (≥98%)
- [ ] **Error Handling:** API hataları graceful handle edilir
- [ ] **Timeout Management:** 30s timeout ile retry mechanism çalışır

#### FA-003: Form & UI Davranışları
- [ ] **Form Population:** Extraction sonuçları form alanlarında görünür
- [ ] **Confidence Display:** Her alan için renk kodlu confidence bar
- [ ] **Inline Editing:** Form alanları click-to-edit fonksiyonel
- [ ] **Auto-save:** Değişiklikler otomatik kaydedilir (500ms debounce)

#### FA-004: İdare/Kurum Tespit Sistemi
- [ ] **Detection Display:** Tespit edilen kurum ana kart'ta gösterilir
- [ ] **Candidate List:** 3 alternatif candidate listelenir
- [ ] **Confidence Threshold:** < 0.60 confidence'ta onay kilidi devreye girer
- [ ] **Manual Override:** Manuel kurum girişi mümkündür

#### FA-005: Snippet & Kaynak Gösterimi
- [ ] **Snippet List:** Her field için kaynak snippet'ler listelenir
- [ ] **Document Navigation:** Snippet tıklandığında PDF viewer o sayfaya gider
- [ ] **Highlight:** Kaynak metin PDF'de highlight edilir
- [ ] **Copy Function:** Snippet metni kopyalanabilir

#### FA-006: Approval Workflow
- [ ] **Approval Button:** "Onayla ve Devam Et" butonu fonksiyonel
- [ ] **Validation:** Zorunlu alanlar dolu olmadan approve edilemez
- [ ] **Status Update:** Approval sonrası status "Approved"'a güncellenir
- [ ] **Cost Engine Trigger:** Approve sonrası cost engine otomatik tetiklenir

#### FA-007: Export Fonksiyonları
- [ ] **PDF Export:** Proposal PDF formatında indirilebilir
- [ ] **Excel Export:** Maliyet kırılımı Excel formatında indirilebilir
- [ ] **JSON Export:** Raw extraction data JSON olarak indirilebilir
- [ ] **Metadata:** Export'larda extraction_id ve timestamp yer alır

### Quality Acceptance (Should Have)

#### QA-001: Performans Kriterleri
- [ ] **Page Load:** Sayfa ilk yüklenme < 2 saniye
- [ ] **Form Response:** Form etkileşimleri < 100ms response
- [ ] **PDF Rendering:** Doküman görüntüleme < 3 saniye
- [ ] **Export Speed:** Dosya export işlemleri < 10 saniye

#### QA-002: Accuracy Benchmarks
- [ ] **Institution Detection:** 10 test case'den ≥9'unda doğru idare tespit
- [ ] **Field Extraction:** Kritik alanlar (porsiyon, kurum) 90% accuracy
- [ ] **Confidence Calibration:** Confidence score'lar gerçek accuracy'yi yansıtır
- [ ] **False Positive Rate:** Auto-approve edilen extractions'da < 5% hata

#### QA-003: UI/UX Quality
- [ ] **Responsive Design:** 768px, 1024px, 1400px breakpoint'lerde düzgün görünüm
- [ ] **Mobile Usability:** Touch interface'de tüm fonksiyonlar kullanılabilir
- [ ] **Accessibility:** WCAG 2.1 AA compliance
- [ ] **Browser Support:** Chrome, Firefox, Safari, Edge son 2 versiyon

#### QA-004: Güvenlik & Compliance
- [ ] **RBAC:** Rol bazlı erişim kontrolü çalışır
- [ ] **Audit Trail:** Tüm kullanıcı müdahaleleri loglanır
- [ ] **Data Privacy:** PII masking kuralları uygulanır
- [ ] **File Security:** Original dosyalar sadece yetkili erişim

---

## 🔍 Test Scenarios & Validation

### Test Scenario Set A: Temel Fonksiyonlar

#### TS-A1: Standard Hastane Şartnamesi
```
Input: "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi — İhale Şartnamesi"
Expected Results:
- project_name: "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi"
- institution_type: "Şehir Hastanesi" (confidence ≥ 0.90)
- servings_per_day: extracted accurately
- meal_types: 2-3 meal types identified
- Overall confidence: ≥ 0.80
```

#### TS-A2: Belediye İhalesi
```
Input: "İhale Sahibi: Çankaya Belediyesi - Sağlık Tesisleri"
Expected Results:
- institution_type: "Belediye" (confidence ≥ 0.90)
- location: "Ankara/Çankaya"
- İdare detection: "Çankaya Belediyesi" as primary candidate
```

#### TS-A3: Üniversite Kantini
```
Input: Complex table-based specification
Expected Results:
- Tablo verilerinin doğru parse edilmesi
- meal_types: Tablo'dan portion sizes extract
- High confidence for table-derived data (≥ 0.90)
```

### Test Scenario Set B: Edge Cases

#### TS-B1: Düşük Kalite Taranmış PDF
```
Input: OCR-processed poor quality document
Expected Results:
- OCR fallback devreye girer
- Confidence appropriately lower (0.40-0.70)
- Review mode tetiklenir
- Snippet'ler yine de referans verir
```

#### TS-B2: Eksik Bilgi Durumu
```
Input: Minimal information specification
Expected Results:
- null fields for missing data
- No hallucination (boş alanlar null kalır)
- Available bilgiler doğru extract edilir
- User review gerekli olarak işaretlenir
```

#### TS-B3: Karışık Dil (TR-EN)
```
Input: Bilingual specification
Expected Results:
- Türkçe alanlar öncelikle kullanılır
- İngilizce'den çeviri yapılmaz (original text)
- Language mixing handle edilir
```

### Test Scenario Set C: Workflow Tests

#### TS-C1: End-to-End Approval Flow
```
Workflow:
1. Upload document
2. Wait for extraction (< 60s)
3. Review extracted fields
4. Approve institution detection
5. Submit approval
6. Verify cost engine trigger
7. Export PDF proposal

Success Criteria: Tüm adımlar başarıyla tamamlanır
```

#### TS-C2: Review & Correction Flow
```
Workflow:
1. Low confidence extraction (< 0.60)
2. Manual field corrections
3. Institution candidate selection
4. Add reviewer notes
5. Submit corrections
6. Verify audit trail

Success Criteria: Düzeltmeler kaydedilir ve audit'e yansır
```

#### TS-C3: Batch Processing
```
Workflow:
1. Upload 5 different specification types
2. Process in parallel
3. Review results in dashboard
4. Bulk approval eligible documents

Success Criteria: All successful, no data mixing
```

---

## 📊 Monitoring & Success Metrics

### Performance KPIs
| Metric | Target | Measurement |
|--------|---------|-------------|
| Upload Success Rate | ≥ 99.5% | Upload completion ratio |
| Extraction Success Rate | ≥ 90% | Successful API responses |
| Page Load Time | < 2s | Performance monitoring |
| Form Response Time | < 100ms | UI interaction latency |
| Export Success Rate | ≥ 98% | Download completion ratio |

### Quality KPIs
| Metric | Target | Measurement |
|--------|---------|-------------|
| Institution Detection Accuracy | ≥ 90% | Manual validation sample |
| Critical Field F1 Score | ≥ 0.90 | Automated test suite |
| False Positive Auto-Approval | < 5% | Post-approval audit |
| User Correction Rate | < 15% | Edit frequency tracking |
| Review Completion Time | < 5 min | User behavior analytics |

### Business KPIs
| Metric | Target | Measurement |
|--------|---------|-------------|
| End-to-End Process Time | < 10 min | Upload to approval |
| User Satisfaction Score | ≥ 4.5/5 | Post-usage survey |
| Error Resolution Time | < 2h | Support ticket metrics |
| System Uptime | ≥ 99.9% | Infrastructure monitoring |

---

## 🚀 Deployment & Go-Live Checklist

### Pre-Production Testing
- [ ] **Load Testing:** 50 concurrent users, 100 documents/hour
- [ ] **Security Testing:** Penetration test completed
- [ ] **Backup & Recovery:** Database backup/restore tested
- [ ] **Monitoring Setup:** Dashboards and alerts configured

### Production Deployment
- [ ] **Blue-Green Deployment:** Zero-downtime deployment
- [ ] **Database Migration:** Schema updates with rollback plan
- [ ] **Environment Variables:** All production configs set
- [ ] **SSL Certificates:** HTTPS properly configured

### Post-Launch Validation
- [ ] **Smoke Tests:** Core functionality verified
- [ ] **Real Document Tests:** Production data processing
- [ ] **User Training:** Documentation and training completed
- [ ] **24h Monitoring:** Stability period completed

### Success Criteria for Go-Live
1. **All Functional Acceptance Criteria passed**
2. **Performance benchmarks met**
3. **Security review approved**
4. **User acceptance testing completed**
5. **Monitoring systems operational**
6. **Support documentation ready**

---

## 📞 Rollback Plan

### Rollback Triggers
- System uptime < 95% in first 24h
- Error rate > 10% 
- Critical functionality broken
- Data corruption detected

### Rollback Procedure
1. **Immediate:** Switch traffic to previous version
2. **Database:** Restore from pre-deployment snapshot
3. **Verification:** Confirm old system operational
4. **Communication:** Notify stakeholders
5. **Post-mortem:** Schedule incident review

---

**Target Go-Live:** Mart 2025  
**Success Definition:** All acceptance criteria met + stable production operation