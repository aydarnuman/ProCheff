# Sonnet Implementation Update - Table-First Rules
## Implementation Kuralları Güncellemesi

---

## 🚨 KRİTİK DEĞİŞİKLİKLER

### 1. Table-First Strategy (ZORUNLU)
Sonnet artık şu öncelik sırasıyla işleme yapmalı:
1. **Tablolar** (confidence 1.0)
2. **Başlıklar** (confidence 0.9)  
3. **Listeler** (confidence 0.8)
4. **Paragraflar** (confidence 0.6)

### 2. OCR Fallback Logic
```javascript
if (text.length < 500 || highNonAsciiRatio) {
    triggerCloudVisionOCR();
    sourceConfidence *= 0.8; // OCR penalty
}
```

### 3. İdare Detection Priority
Mutlaka şu sırayla ara:
- "İhale Sahibi:" 
- "İşveren:"
- "İdare:" 
- "Kurum:"
- Project name içinde kurum

### 4. Institution Candidates (YENİ)
- Maksimum 3 candidate döndür
- Her candidate için: name, confidence, source_snippet
- UI'da kullanıcıya gösterilecek

---

## 📊 UPDATED JSON SCHEMA

```json
{
  // ... existing fields ...
  "institution_candidates": {
    "type": "array",
    "maxItems": 3,
    "items": {
      "type": "object", 
      "properties": {
        "name": {"type": "string"},
        "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0},
        "source_snippet": {"type": "string", "maxLength": 500}
      },
      "required": ["name", "confidence", "source_snippet"]
    }
  }
}
```

---

## 🎯 CONFIDENCE FORMULA UPDATE

```javascript
FinalConfidence = 0.5 * SourceEvidence + 0.3 * ParsingConfidence + 0.2 * ModelConfidence

SourceEvidence Values:
- table_cell: 1.0      // EN YÜKSEK
- heading: 0.9         // İKİNCİ
- list_item: 0.8       // ÜÇÜNCÜ  
- paragraph: 0.6       // DÖRDÜNCÜ
- inferred: 0.2        // EN DÜŞÜK
- ocr_fallback: base * 0.8  // OCR PENALTY
```

---

## 🔐 SECURITY UPDATES

### PII Masking (Zorunlu)
```javascript
const maskPII = (text) => {
  return text
    .replace(/\b\d{11}\b/g, '[TC_MASKED]')           // TC Kimlik
    .replace(/\b\d{3}[\s\-]\d{3}[\s\-]\d{4}\b/g, '[PHONE_MASKED]')  // Telefon
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_MASKED]'); // Email
};
```

### Logging Policy
- ❌ Ham text loglanmaz
- ✅ Sadece extraction JSON + snippets
- ✅ Metadata (processing_time, model_version)
- ✅ Audit trail (user changes)

---

## ⚡ PERFORMANCE REQUIREMENTS

### SLA Targets (Değişmedi)
- Extraction median: < 60 seconds
- Extraction P95: < 120 seconds
- Retry: 3 attempts with exponential backoff

### New Validation Rules
```javascript
// Table extraction priority test
if (hasTableData && !tableDataExtracted) {
    confidence *= 0.5; // Major penalty
}

// Institution confidence blocking
if (institutionConfidence < 0.60) {
    blockApproval = true;
    requireManualSelection = true;
}
```

---

## 🧪 UPDATED TEST CASES

### New Test: Table-First Priority
```
Input: Paragraf says "1500 porsiyon", Table says "2500 porsiyon"
Expected: servings_per_day = 2500 (table wins)
Confidence: ≥ 0.90 (table source)
```

### New Test: Institution Candidates
```
Input: Multiple institution mentions
Expected: 3 candidates with confidences
Requirement: Primary candidate confidence affects approval
```

### New Test: OCR Fallback
```
Input: Low quality text / high non-ASCII ratio
Expected: OCR triggered, confidence penalty applied
Processing: sourceConfidence *= 0.8
```

---

## 🔄 IMPLEMENTATION CHECKLIST

### Sonnet Team Must Update:
- [ ] Table-first processing order implemented
- [ ] OCR fallback logic active
- [ ] Institution candidates generation (max 3)
- [ ] Updated confidence formula
- [ ] PII masking in logs
- [ ] JSON schema compliance with new fields

### ProCheff Team Updated:
- [x] Service layer supports new response format
- [x] API endpoints handle institution_candidates
- [x] Test cases include table-first scenarios
- [x] Type definitions updated

### UI Team Needs:
- Institution candidates display widget
- Confidence-based approval blocking
- Table source priority indication
- OCR processing status

---

## 📋 VALIDATION REQUIREMENTS

### Pre-Production Testing:
1. **Table Priority Test:** Ensure table data overrides paragraph data
2. **Institution Detection:** 3 candidates generated when multiple found
3. **OCR Fallback:** Triggers correctly on poor quality documents  
4. **Confidence Blocking:** Low institution confidence blocks approval
5. **PII Masking:** Sensitive data masked in logs

### Success Criteria:
- Table-extracted fields have confidence ≥ 0.90
- Institution detection accuracy ≥ 90% on test set
- OCR fallback reduces confidence appropriately
- All new test cases pass
- No PII leakage in logs

---

## 🚀 DEPLOYMENT TIMELINE

### Phase 1 (Week 1): Core Updates
- Table-first processing
- Updated confidence formula
- Institution candidates

### Phase 2 (Week 2): Quality & Security  
- OCR fallback implementation
- PII masking
- Enhanced error handling

### Phase 3 (Week 3): Integration Testing
- End-to-end testing
- Performance validation
- UI integration

### Phase 4 (Week 4): Production
- Production deployment
- Monitoring validation
- Performance benchmarking

---

**Critical:** Bu güncellemeler Sonnet API'sinin mevcut JSON schema'sını genişletir ama geriye uyumluluğu korur. Mevcut çalışan sistem etkilenmez.