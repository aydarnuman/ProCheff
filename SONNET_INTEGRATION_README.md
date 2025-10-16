# Sonnet Integration Quick Start Guide

Bu README, Sonnet ekibinin ProCheff sistemine nasıl entegre olacağını açıklar.

## 📋 Teslimat Paketi İçeriği

1. **`SONNET_DELIVERY_SPEC.md`** - Kapsamlı teknik spesifikasyon
2. **`lib/types/sonnet-extraction.ts`** - TypeScript tipler ve validasyon fonksiyonları  
3. **`lib/services/sonnet-extraction.ts`** - ProCheff'in Sonnet API'sini çağıran service
4. **`app/api/sonnet-extraction/`** - API endpoint'leri (extract, batch)
5. **`lib/tests/sonnet-integration.ts`** - Test suite ve validation
6. **`lib/services/sonnet-monitoring.ts`** - Monitoring ve alerting sistemi
7. **`.env.sonnet.example`** - Environment configuration

## 🚀 Hızlı Başlangıç

### 1. Sonnet API Endpoint'i Implement Edin

ProCheff sistemi aşağıdaki endpoint'e POST request gönderecek:

```
POST https://api.sonnet.ai/v1/extract-specification
Authorization: Bearer {api_key}
Content-Type: application/json
```

**Request Body:**
```typescript
{
  document_text: string,
  document_metadata: {
    filename: string,
    pages: number,
    file_type: "pdf" | "word" | "image",
    ocr_used: boolean
  },
  extraction_hints?: {
    institution_type_hint?: string,
    expected_servings_range?: [number, number],
    expected_currency?: string  
  }
}
```

**Response:** SONNET_DELIVERY_SPEC.md'deki JSON schema formatında

### 2. Test Case'leri Çalıştırın

Test suite'ini kullanarak implementasyonunuzu validate edin:

```typescript
import { testRunner } from '@/lib/tests/sonnet-integration';

// Tek test çalıştırma
const result = await testRunner.runSingleTest(testCases[0]);

// Tüm test suite çalıştırma  
const results = await testRunner.runAllTests();
```

### 3. Environment Variables Ayarlayın

`.env.sonnet.example` dosyasını `.env.local` olarak kopyalayın ve doldurun:

```bash
SONNET_API_KEY=your_provided_api_key
SONNET_API_URL=https://your-sonnet-endpoint.com/v1
SONNET_TIMEOUT_MS=30000
```

### 4. Monitoring Kurulumu

Monitoring dashboard'u için gerekli webhook'ları ayarlayın:

```bash
PAGERDUTY_INTEGRATION_KEY=your_pagerduty_key
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## 🧪 Test Scenarios

Test suite 5 farklı senaryo içerir:

1. **Standard Hospital Specification** - Net ve açık şartname
2. **Scanned Poor Quality PDF** - OCR gerektiren düşük kalite
3. **Multi-table Complex** - Karmaşık tablo yapıları
4. **Missing Critical Information** - Eksik bilgi durumları
5. **Mixed Language Content** - Türkçe-İngilizce karışık içerik

Her test case için confidence threshold'ları ve field validation'ları tanımlı.

## 📊 Quality Metrics

### Gerekli Performans Hedefleri:

- **Schema Validation Pass Rate:** ≥ 98%
- **Critical Field F1 Score:** ≥ 0.90
- **Processing Time:** Median < 60s, P95 < 120s
- **Confidence Accuracy:** Auto-approved extractions error rate < 5%

### Confidence Hesaplama:

```javascript
FinalConfidence = 0.2 * ModelSelfConfidence + 0.5 * SourceEvidence + 0.3 * ParsingConfidence
```

**SourceEvidence Skorları:**
- Table cell: 1.0
- Explicit paragraph match: 0.9
- Multiple overlapping snippets: 0.85
- Single sentence inference: 0.55
- Model inferred (no source): 0.10

## 🔧 Development Workflow

### 1. Mock Development

Development sırasında mock responses kullanın:

```typescript
import { createMockSonnetResponse } from '@/lib/tests/sonnet-integration';

const mockResponse = createMockSonnetResponse(testCase);
```

### 2. Integration Testing

ProCheff tarafında test endpoint'i:

```bash
curl -X POST http://localhost:3000/api/sonnet-extraction/extract \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

### 3. Health Check

Health endpoint implement edin:

```
GET https://api.sonnet.ai/v1/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "latency_ms": 45
}
```

## 🚨 Error Handling

### Retry Policy

ProCheff şu durumlarda otomatik retry yapacak:

- `TIMEOUT` - API timeout'u
- `RATE_LIMIT_EXCEEDED` - Rate limit aşımı  
- `TEMPORARY_API_ERROR` - Geçici API hatası

### Error Response Format

```json
{
  "error": "Detailed error message",
  "error_code": "EXTRACTION_FAILED",
  "timestamp": "2025-01-15T10:30:00Z",
  "retry_after_seconds": 60
}
```

## 📈 Monitoring Integration

### Metrics Tracked

ProCheff tarafında takip edilecek metrikler:

- `extraction_job_count` - Toplam ekstraksiyon sayısı
- `extraction_success_rate` - Başarı oranı
- `avg_latency_seconds` - Ortalama latency
- `needs_review_rate` - Manuel inceleme oranı
- `validation_failure_rate` - Schema validation hata oranı

### Alert Thresholds

- **Critical:** Success rate < 90% veya validation failure > 2%
- **Warning:** Needs review rate > 5% veya latency > 120s

## 🔐 Güvenlik Gereksinimleri

### API Authentication

- Bearer token authentication
- Request ID tracking (`X-Request-ID` header)
- Rate limiting: 100 req/min, 1000 req/hour

### Data Privacy

- Ham text loglanmaz
- Snippet'ler max 1000 karakter
- Kişisel veri masking (TC, telefon, email)
- GCS bucket private ve versioned

## 📞 Support & Communication

### Integration Process

1. **Week 1:** API endpoint development + basic testing
2. **Week 2:** Complex test cases + edge case handling  
3. **Week 3:** Performance optimization + monitoring setup
4. **Week 4:** Production deployment + monitoring validation

### Expected Deliverables

- ✅ API endpoint implementation
- ✅ All test cases passing (≥95% success rate)
- ✅ Performance benchmarks met
- ✅ Monitoring integration working
- ✅ Documentation and deployment guide

## 🔄 Deployment Checklist

### Pre-deployment

- [ ] All test cases passing
- [ ] Performance benchmarks validated
- [ ] Security review completed
- [ ] Monitoring dashboards active
- [ ] Error handling tested
- [ ] Rollback plan documented

### Production Deployment

- [ ] Blue-green deployment
- [ ] Gradual traffic ramp (10% → 50% → 100%)
- [ ] Real-time monitoring active
- [ ] Alert channels verified
- [ ] 24h stability monitoring

---

**İletişim:** ProCheff Development Team  
**Integration Timeline:** 4 weeks  
**Go-Live Target:** Mart 2025