# Sonnet Implementasyon Kuralları - Final
## Table-First Extraction Rules & Prompt Template

---

# 🎯 CORE IMPLEMENTATION RULES

## 1. Processing Priority (ZORUNLU SIRA)

### A) Table-First Strategy
```
1. ÖNCE: Tabloları tara (table cells = SourceEvidence 1.0)
2. SONRA: Başlıkları tara (headings = SourceEvidence 0.9)
3. SONRA: Listeleri tara (lists = SourceEvidence 0.8)
4. SON: Serbest paragrafları tara (paragraphs = SourceEvidence 0.6)
```

### B) OCR Fallback Logic
```javascript
if (extractedText.length < 500 || 
    extractedText.match(/[^\x20-\x7E]/g)?.length > extractedText.length * 0.3) {
    // Trigger OCR fallback
    useCloudVisionOCR = true;
    sourceEvidence *= 0.8; // OCR penalty
}
```

### C) İdare Detection Priority
```
MUTLAKA ARA (bu sıraya göre):
1. "İhale Sahibi:" etiket
2. "İşveren:" etiket  
3. "İdare:" etiket
4. "Kurum:" etiket
5. Project_name içinde kurum adı
6. Tablo satırlarında kurum kolonu
```

---

# 📋 JSON SCHEMA (STRICT)

```json
{
  "type": "object",
  "properties": {
    "project_name": {"type": ["string", "null"], "maxLength": 200},
    "location": {"type": ["string", "null"], "maxLength": 100},
    "institution_type": {"type": ["string", "null"]},
    "contract_duration_days": {"type": ["integer", "null"], "minimum": 1, "maximum": 3650},
    "servings_per_day": {"type": ["integer", "null"], "minimum": 10, "maximum": 50000},
    "meal_types": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "frequency_per_week": {"type": ["integer", "null"], "minimum": 1, "maximum": 7},
          "portion_gram_per_person": {"type": "integer", "minimum": 50, "maximum": 2000},
          "menu_examples": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["name", "portion_gram_per_person"]
      }
    },
    "dietary_restrictions": {"type": "array", "items": {"type": "string"}},
    "critical_requirements": {"type": "array", "items": {"type": "string"}},
    "expected_start_date": {"type": ["string", "null"], "format": "date"},
    "notes": {"type": ["string", "null"], "maxLength": 1000},
    "confidence_score": {"type": "number", "minimum": 0.0, "maximum": 1.0},
    "field_confidences": {
      "type": "object",
      "additionalProperties": {"type": "number", "minimum": 0.0, "maximum": 1.0}
    },
    "snippets": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": {"type": "string"},
          "page": {"type": "integer", "minimum": 1},
          "text": {"type": "string", "maxLength": 1000}
        },
        "required": ["field", "page", "text"]
      }
    },
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
    },
    "error": {"type": ["string", "null"], "maxLength": 500}
  },
  "required": ["confidence_score", "field_confidences", "snippets"]
}
```

---

# 🧮 CONFIDENCE CALCULATION

## Formula (ZORUNLU)
```javascript
FinalConfidence = 0.5 * SourceEvidence + 0.3 * ParsingConfidence + 0.2 * ModelConfidence

SourceEvidence değerleri:
- table_cell: 1.0
- heading: 0.9  
- list_item: 0.8
- paragraph: 0.6
- inferred: 0.2
- ocr_fallback: base_value * 0.8

ParsingConfidence değerleri:
- perfect_parse (integer/date valid): 1.0
- normalized_parse (binlik ayraç): 0.9
- fuzzy_match: 0.7
- parse_failed: 0.0

ModelConfidence:
- Sonnet self-assessment (0.0-1.0)
```

## Threshold Actions
```javascript
if (overall_confidence < 0.60) {
    status = "needs_review";
    manual_review_required = true;
}

if (institution_confidence < 0.60) {
    block_approval = true;
    requires_manual_institution_selection = true;
}
```

---

# 🎯 SONNET PROMPT TEMPLATE

```
SYSTEM: You are a Turkish tender specification extraction AI. Extract structured data from documents with high precision. Follow table-first strategy and provide confidence scores.

RULES:
1. ONLY return valid JSON - no explanations
2. Search tables FIRST, then headings, then lists, then paragraphs
3. Find institution with priority: "İhale Sahibi" > "İşveren" > "İdare" > "Kurum"
4. Generate max 3 institution candidates with confidences
5. Calculate field confidence: 0.5*source + 0.3*parsing + 0.2*model
6. Include source snippets (max 1000 chars) for each extracted field
7. If extraction fails, return {"error": "reason"}

SOURCE EVIDENCE SCORES:
- Table cell: 1.0
- Heading: 0.9
- List item: 0.8
- Paragraph: 0.6
- Inferred: 0.2

INSTITUTION ALIASES:
- "Hastane" includes: Şehir Hastanesi, Devlet Hastanesi, Özel Hastane
- "Belediye" includes: Büyükşehir Belediyesi, İlçe Belediyesi
- "Üniversite" includes: Devlet Üniversitesi, Vakıf Üniversitesi
- "Kamu" includes: Bakanlık, Genel Müdürlük, Kamu Hastaneleri Birliği

MEAL TYPE STANDARDS:
- Kahvaltı: 200-300g typical
- Öğle: 400-600g typical
- Akşam: 300-500g typical
- Ara Öğün: 100-200g typical

FEW-SHOT EXAMPLES:
[Insert the 8 examples from SONNET_FEW_SHOT_EXAMPLES.md here]

USER: Extract from this tender specification:
{DOCUMENT_TEXT}

ASSISTANT: [JSON only - no text before or after]
```

---

# 🔒 SECURITY & PRIVACY

## Data Handling
```javascript
// PII Masking before logging
const maskPII = (text) => {
  return text
    .replace(/\b\d{11}\b/g, '[TC_MASKED]')
    .replace(/\b\d{3}[\s\-]\d{3}[\s\-]\d{4}\b/g, '[PHONE_MASKED]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_MASKED]');
};

// Only log extraction result + metadata
const auditLog = {
  extraction_id: uuid(),
  spec_id: spec_id,
  extracted_fields: extractionResult,
  snippets: maskedSnippets,
  processing_time_ms: processingTime,
  model_version: "sonnet-4.2",
  confidence_overall: confidenceScore,
  timestamp: new Date().toISOString()
};
```

## Infrastructure Requirements
```yaml
secrets:
  - name: "anthropic-api-key"
    version: "pinned-v1"
    secret_manager: true

gcs_bucket:
  name: "procheff-specifications-prod"
  versioning: enabled
  lifecycle: delete_after_365_days
  access: worker_sa_only

service_account:
  name: "sonnet-extraction-worker"
  permissions:
    - storage.objects.get
    - secretmanager.versions.access
    - logging.logEntries.create
```

---

# ⚡ PERFORMANCE & SLA

## Latency Targets
```
- Extraction median: < 60 seconds
- Extraction P95: < 120 seconds  
- API timeout: 30 seconds
- Retry policy: 3 attempts with exponential backoff
```

## Error Handling
```javascript
// Retry conditions
const shouldRetry = (error) => {
  return error.type === 'TIMEOUT' || 
         error.type === 'RATE_LIMIT' || 
         error.type === 'TEMPORARY_API_ERROR';
};

// After 3 failed retries
if (retryCount >= 3) {
  return {
    error: "Extraction failed after 3 attempts",
    status: "error",
    requires_manual_processing: true
  };
}
```

## Validation Pipeline
```javascript
// Strict JSON validation with AJV
const ajv = new Ajv({strict: true});
const validate = ajv.compile(EXTRACTION_SCHEMA);

if (!validate(sonnetResponse)) {
  return {
    error: `Schema validation failed: ${validate.errors}`,
    status: "needs_review"
  };
}
```

---

# 📊 AUDIT & MONITORING

## Immutable Review Records
```javascript
const reviewRecord = {
  review_id: uuid(),
  spec_id: spec_id,
  extraction_id: extraction_id,
  user_id: user_id,
  timestamp: new Date().toISOString(),
  changes: {
    before: originalExtractionData,
    after: userCorrectedData,
    modified_fields: changedFields
  },
  approval_status: "approved" | "rejected" | "needs_more_review",
  reviewer_notes: userNotes
};
```

## Metrics Collection
```javascript
const metrics = {
  extraction_count: counter,
  extraction_success_rate: gauge,
  avg_confidence_score: histogram,
  field_accuracy_rates: gauge_per_field,
  processing_latency: histogram,
  institution_detection_accuracy: gauge,
  manual_correction_rate: gauge
};
```

---

# ✅ VALIDATION CHECKLIST

## Pre-Production Testing
- [ ] All 8 few-shot examples pass validation
- [ ] Table extraction accuracy > 95%
- [ ] Institution detection accuracy > 90%
- [ ] JSON schema validation 100% pass rate
- [ ] Performance benchmarks met (60s median)
- [ ] Error handling tested (timeout, invalid JSON, OCR fallback)

## Production Readiness
- [ ] API endpoint implemented and tested
- [ ] Health check endpoint functional
- [ ] Monitoring dashboards configured
- [ ] Alert thresholds set (success rate < 90%)
- [ ] Audit logging functional
- [ ] Security review completed

---

# 🚀 DEPLOYMENT EXAMPLE

```bash
# Environment setup
export ANTHROPIC_API_KEY=$(gcloud secrets versions access latest --secret="anthropic-api-key")
export GCS_BUCKET="procheff-specifications-prod"
export EXTRACTION_TIMEOUT_MS=30000

# Test extraction
curl -X POST https://api.sonnet.ai/v1/extract-specification \
  -H "Authorization: Bearer ${ANTHROPIC_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "document_text": "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi — İhale Şartnamesi",
    "document_metadata": {
      "filename": "test_spec.pdf",
      "pages": 3,
      "file_type": "pdf",
      "ocr_used": false
    }
  }'

# Expected response (JSON only):
{
  "project_name": "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi",
  "location": "Ankara",
  "institution_type": "Şehir Hastanesi",
  "confidence_score": 0.92,
  "institution_candidates": [
    {
      "name": "Ankara Şehir Hastanesi",
      "confidence": 0.95,
      "source_snippet": "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi"
    }
  ],
  "snippets": [
    {
      "field": "project_name",
      "page": 1,
      "text": "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi — İhale Şartnamesi"
    }
  ],
  "error": null
}
```

Bu spesifikasyon Sonnet ekibinin EXACT olarak nasıl implement edeceğini gösterir!