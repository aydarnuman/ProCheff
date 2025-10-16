// Test Suite for Sonnet Integration
// SONNET_DELIVERY_SPEC.md'deki test case'lerinin implementasyonu

import { SonnetExtractionRequest, SonnetExtractionResponse, validateSonnetResponse, validateCriticalFields, createTestResponse } from '@/lib/types/sonnet-extraction';
import { sonnetService } from '@/lib/services/sonnet-extraction';

export interface TestCase {
  name: string;
  description: string;
  input: SonnetExtractionRequest;
  expected: {
    success: boolean;
    project_name?: string | null;
    servings_per_day?: number | null;
    meal_types_count?: number;
    confidence_score_min?: number;
    confidence_score_max?: number;
    has_snippets?: boolean;
    error?: string | null;
    field_confidence_requirements?: Record<string, number>;
    institution_type?: string;
    location?: string;
    institution_candidates_count?: number;
  };
}

export const testCases: TestCase[] = [
  {
    name: "Standard Hospital Specification",
    description: "Típik hastane şartnamesi - tüm alanlar net ve açık",
    input: {
      document_text: `
ANKARA ŞEHİR HASTANESİ YEMEKHANESİ İŞLETME İHALESİ ŞARTNAME

1. GENEL BİLGİLER
- Proje Adı: Ankara Şehir Hastanesi Ana Yemekhane İşletmesi
- Yer: Ankara/Çankaya
- Kurum Tipi: Hastane
- Sözleşme Süresi: 24 ay (2 yıl)
- Başlangıç: 01.01.2025, Bitiş: 31.12.2026

2. SERVİS KAPASITESI
- Günlük porsiyon: 3.000 kişi
- Öğün sayısı: 3 öğün (kahvaltı, öğle, akşam)
- Para birimi: TRY

3. PORSİYON DETAYLARI
Öğün Tipi    | Porsiyon (g) | Öğe Detayları
Kahvaltı     | 200g        | Ekmek 50g, Peynir 30g, Çay
Öğle         | 500g        | Ana yemek 200g, Pilav 150g, Salata 100g
Akşam        | 400g        | Ana yemek 180g, Sebze 120g, Çorba 100g

4. ÖZEL ŞARTLAR
- Helal sertifikalı gıda
- HACCP uyumlu üretim
- Soğuk zincir korunması
      `,
      document_metadata: {
        filename: "ankara_hastane_sartname.pdf",
        pages: 3,
        file_type: "pdf",
        ocr_used: false
      },
      extraction_hints: {
        institution_type_hint: "hastane",
        expected_servings_range: [2000, 5000],
        expected_currency: "TRY"
      }
    },
    expected: {
      success: true,
      project_name: "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi",
      servings_per_day: 3000,
      meal_types_count: 3,
      confidence_score_min: 0.80,
      has_snippets: true,
      field_confidence_requirements: {
        project_name: 0.90,
        servings_per_day: 0.85,
        meal_types: 0.80
      }
    }
  },
  {
    name: "Scanned Poor Quality PDF",
    description: "Düşük kaliteli taranmış PDF - OCR gerekli",
    input: {
      document_text: `
[OCR PROCESSED TEXT - LOWER QUALITY]
IZMIR UNIVERSI7ESI OGRENCI YEMEKHANES1 
YEMEK HiZMETi SARTNAMESI

Proje: lzmir Universitesi Ana Kampüs Yemekhane
Yer: lzmir/Bornova  
Gunluk porsiyon: 2.5OO kisi (yaklasık)
Baslangic tarihi: 15.02.2025
Bitis tarihi: 14.02.2027

Ogun detayları belirsiz - tablo hasarlı
Özel diyet: Vejeteryan seçenek zorunlu
      `,
      document_metadata: {
        filename: "low_quality_scan.pdf",
        pages: 5,
        file_type: "pdf",
        ocr_used: true
      }
    },
    expected: {
      success: true,
      servings_per_day: 2500,
      confidence_score_min: 0.40,
      confidence_score_max: 0.70,
      has_snippets: true,
      error: null
    }
  },
  {
    name: "Multi-table Complex Specification",
    description: "Çoklu tablo içeren karmaşık şartname",
    input: {
      document_text: `
İSTANBUL AYDIN ÜNİVERSİTESİ YEMEKHANESİ İŞLETME ŞARTNAME

TABLO 1: GENEL BİLGİLER
Proje Kodu: IAU-YMK-2025
Proje Adı: İstanbul Aydın Üniversitesi Kampüs Yemekhanesi
Lokasyon: İstanbul/Küçükçekmece
Kurum Tipi: Üniversite
Süre: 36 ay

TABLO 2: PORSIYON BİLGİLERİ
Öğün | Haftalık Sıklık | Porsiyon/Kişi | Menü Örnekleri
Kahvaltı | 7 gün | 180g | Börek, Peynir, Çay
Öğle | 6 gün | 450g | Et yemeği, Pilav, Turşu  
Akşam | 5 gün | 350g | Sebze yemeği, Bulgur, Ayran
Ara Öğün | 3 gün | 100g | Meyve, Kek, Çay

TABLO 3: GÜNLÜK KAPASİTE
Pazartesi-Perşembe: 4.200 porsiyon
Cuma: 3.800 porsiyon  
Cumartesi: 2.100 porsiyon
Pazar: 1.500 porsiyon
Ortalama günlük: 3.400 porsiyon

ÖZEL ŞARTLAR:
- Glütensiz alternatif zorunlu
- Diyabetik menü seçeneği
- Hijyen sertifikası TÜRKAK akrediteli
      `,
      document_metadata: {
        filename: "complex_multi_table.pdf",
        pages: 8,
        file_type: "pdf",
        ocr_used: false
      }
    },
    expected: {
      success: true,
      meal_types_count: 4,
      servings_per_day: 3400,
      confidence_score_min: 0.75,
      field_confidence_requirements: {
        meal_types: 0.70
      },
      has_snippets: true
    }
  },
  {
    name: "Missing Critical Information",
    description: "Kritik bilgilerin eksik olduğu şartname",
    input: {
      document_text: `
GENEL YEMEK HİZMETİ ŞARTNAME

Bu ihale kapsamında yemek hizmeti verilecektir.
Lokasyon belirsiz.
Tarih belirtilmemiş.
Porsiyon sayısı müteahhit teklifine göre belirlenecek.

Genel şartlar:
- Kaliteli hizmet
- Temiz ortam
- Uygun fiyat
      `,
      document_metadata: {
        filename: "incomplete_spec.pdf",
        pages: 2,
        file_type: "pdf",
        ocr_used: false
      }
    },
    expected: {
      success: true,
      project_name: null,
      servings_per_day: null,
      confidence_score_max: 0.40,
      has_snippets: true
    }
  },
  {
    name: "Foreign Language Mixed Content",
    description: "Karışık dil içeriği (Türkçe-İngilizce)",
    input: {
      document_text: `
BURSA TECHNICAL UNIVERSITY CAFETERIA SPECIFICATION
BURSA TEKNİK ÜNİVERSİTESİ KAFETERİA ŞARTNAME

Project Name: BTU Main Campus Cafeteria Services / BTU Ana Kampüs Kafeteria Hizmetleri
Location: Bursa/Osmangazi
Institution Type: University / Üniversite
Duration: 24 months / 24 ay

DAILY CAPACITY / GÜNLÜK KAPASİTE:
- Students: 2,800 portions / Öğrenci: 2.800 porsiyon  
- Staff: 400 portions / Personel: 400 porsiyon
- Total: 3,200 portions / Toplam: 3.200 porsiyon

MEAL TYPES / ÖĞÜN TİPLERİ:
Breakfast/Kahvaltı: 200g per person
Lunch/Öğle: 500g per person  
Dinner/Akşam: 400g per person

Special Requirements / Özel Şartlar:
- Halal certified / Helal sertifikalı
- Vegetarian options / Vejeteryan seçenekler
      `,
      document_metadata: {
        filename: "bilingual_spec.pdf",
        pages: 4,
        file_type: "pdf",  
        ocr_used: false
      }
    },
    expected: {
      success: true,
      project_name: "BTU Ana Kampüs Kafeteria Hizmetleri",
      servings_per_day: 3200,
      meal_types_count: 3,
      confidence_score_min: 0.65
    }
  },
  {
    name: "Table-First Strategy Test",
    description: "Tablo verilerinin paragraf verilerine göre öncelikli işlenmesi",
    input: {
      document_text: `
ANKARA ÜNİVERSİTESİ YEMEKHANESİ ŞARTNAME

Paragraf bilgisi: Günlük yaklaşık 1500 porsiyon hizmeti verilecektir.

TABLO 1: HİZMET DETAYLARI
| Alan           | Değer                    |
|----------------|--------------------------|
| İhale Sahibi   | Ankara Üniversitesi      |
| Lokasyon       | Ankara/Cebeci            |
| Günlük Porsiyon| 2.500 kişi              |
| Öğün Tipi      | Öğle                    |
| Porsiyon/Kişi  | 450g                    |

Ek paragraf: Bu hizmet 1200 öğrenciye verilecektir.

TABLO 2: KURUM BİLGİSİ
| Kurum         | Ankara Üniversitesi Rektörlüğü |
| Adres         | Dögol Caddesi Cebeci/Ankara    |
      `,
      document_metadata: {
        filename: "table_priority_test.pdf",
        pages: 2,
        file_type: "pdf",
        ocr_used: false
      }
    },
    expected: {
      success: true,
      servings_per_day: 2500, // Tablo verisi öncelikli (2500), paragraf değil (1500 or 1200)
      project_name: "Ankara Üniversitesi Yemekhane Hizmeti",
      institution_type: "Üniversite",
      location: "Ankara/Cebeci", // Tablo'dan alınmalı
      confidence_score_min: 0.85, // Tablo verisi yüksek confidence
      field_confidence_requirements: {
        servings_per_day: 0.90, // Tablo'dan geldiği için yüksek
        location: 0.90
      }
    }
  },
  {
    name: "Institution Candidates Test", 
    description: "Birden fazla idare candidate'ının tespit edilmesi",
    input: {
      document_text: `
SAĞLIK BAKANLIĞI İHALE ŞARTNAME

İhale Sahibi: Ankara Şehir Hastanesi
İşveren: Sağlık Bakanlığı Genel Sekreterliği
Faaliyette bulunan kurum: Ankara Üniv. Tıp Fakültesi Hastanesi

Projede bahsedilen: "Çankaya Belediyesi koordinasyonunda yürütülecektir"

Yemek hizmeti 1.800 kişilik kapasitede günlük olarak verilecektir.
Öğle yemeği: 500g porsiyon
Akşam yemeği: 350g porsiyon
      `,
      document_metadata: {
        filename: "multiple_institution_test.pdf", 
        pages: 1,
        file_type: "pdf",
        ocr_used: false
      }
    },
    expected: {
      success: true,
      servings_per_day: 1800,
      institution_candidates_count: 3, // En az 3 candidate olmalı
      field_confidence_requirements: {
        institution_type: 0.50 // Belirsizlik nedeniyle düşük confidence
      },
      confidence_score_max: 0.80 // Overall confidence belirsizlik nedeniyle düşük
    }
  }
];

// Test runner functions
export class SonnetTestRunner {
  
  async runSingleTest(testCase: TestCase): Promise<{
    testName: string;
    passed: boolean;
    actualResult?: any;
    errors: string[];
    processingTime: number;
  }> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      console.log(`\n🧪 Running test: ${testCase.name}`);
      console.log(`📝 Description: ${testCase.description}`);
      
      // Call Sonnet service
      const result = await sonnetService.extractSpecification(testCase.input);
      const processingTime = Date.now() - startTime;
      
      if (!result.success) {
        errors.push(`Extraction failed: ${result.error}`);
        return {
          testName: testCase.name,
          passed: false,
          actualResult: result,
          errors,
          processingTime
        };
      }
      
      const data = result.data!;
      
      // Validate expectations
      if (testCase.expected.project_name !== undefined) {
        if (data.project_name !== testCase.expected.project_name) {
          errors.push(`project_name mismatch: expected '${testCase.expected.project_name}', got '${data.project_name}'`);
        }
      }
      
      if (testCase.expected.servings_per_day !== undefined) {
        if (data.servings_per_day !== testCase.expected.servings_per_day) {
          errors.push(`servings_per_day mismatch: expected ${testCase.expected.servings_per_day}, got ${data.servings_per_day}`);
        }
      }
      
      if (testCase.expected.meal_types_count !== undefined) {
        if (data.meal_types.length !== testCase.expected.meal_types_count) {
          errors.push(`meal_types count mismatch: expected ${testCase.expected.meal_types_count}, got ${data.meal_types.length}`);
        }
      }
      
      if (testCase.expected.confidence_score_min !== undefined) {
        if (data.confidence_score < testCase.expected.confidence_score_min) {
          errors.push(`confidence_score too low: expected >= ${testCase.expected.confidence_score_min}, got ${data.confidence_score}`);
        }
      }
      
      if (testCase.expected.confidence_score_max !== undefined) {
        if (data.confidence_score > testCase.expected.confidence_score_max) {
          errors.push(`confidence_score too high: expected <= ${testCase.expected.confidence_score_max}, got ${data.confidence_score}`);
        }
      }
      
      if (testCase.expected.has_snippets && data.snippets.length === 0) {
        errors.push('Expected snippets but none found');
      }
      
      if (testCase.expected.field_confidence_requirements) {
        Object.entries(testCase.expected.field_confidence_requirements).forEach(([field, minConfidence]) => {
          const actualConfidence = data.field_confidences[field];
          if (!actualConfidence || actualConfidence < minConfidence) {
            errors.push(`Field '${field}' confidence too low: expected >= ${minConfidence}, got ${actualConfidence || 0}`);
          }
        });
      }
      
      // Test new table-first specific fields
      if (testCase.expected.institution_type !== undefined) {
        if (data.institution_type !== testCase.expected.institution_type) {
          errors.push(`institution_type mismatch: expected '${testCase.expected.institution_type}', got '${data.institution_type}'`);
        }
      }
      
      if (testCase.expected.location !== undefined) {
        if (data.location !== testCase.expected.location) {
          errors.push(`location mismatch: expected '${testCase.expected.location}', got '${data.location}'`);
        }
      }
      
      // Test institution candidates (from API response)
      if (testCase.expected.institution_candidates_count !== undefined) {
        // This would come from the API response, not the extraction data
        // For now, we'll simulate this check
        console.log(`[Test] Institution candidates count check: expected ${testCase.expected.institution_candidates_count}`);
      }
      
      const passed = errors.length === 0;
      
      if (passed) {
        console.log(`✅ Test passed in ${processingTime}ms`);
        console.log(`   Confidence: ${data.confidence_score.toFixed(3)}`);
        console.log(`   Snippets: ${data.snippets.length}`);
      } else {
        console.log(`❌ Test failed in ${processingTime}ms`);
        errors.forEach(error => console.log(`   ⚠️  ${error}`));
      }
      
      return {
        testName: testCase.name,
        passed,
        actualResult: data,
        errors,
        processingTime
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      errors.push(`Test execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        testName: testCase.name,
        passed: false,
        errors,
        processingTime
      };
    }
  }
  
  async runAllTests(): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: Array<{
      testName: string;
      passed: boolean;
      errors: string[];
      processingTime: number;
    }>;
    totalTime: number;
  }> {
    console.log(`\n🚀 Starting Sonnet Integration Test Suite (${testCases.length} tests)\n`);
    const overallStartTime = Date.now();
    
    const results = [];
    
    for (const testCase of testCases) {
      const result = await this.runSingleTest(testCase);
      results.push(result);
      
      // Wait between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const totalTime = Date.now() - overallStartTime;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    
    console.log(`\n📊 Test Suite Results:`);
    console.log(`   Total: ${results.length}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${((passedTests / results.length) * 100).toFixed(1)}%`);
    console.log(`   Total Time: ${totalTime}ms`);
    
    return {
      totalTests: results.length,
      passedTests,
      failedTests,
      results,
      totalTime
    };
  }
}

// Helper function to create mock responses for development
export const createMockSonnetResponse = (testCase: TestCase): SonnetExtractionResponse => {
  const mockResponse = createTestResponse();
  
  // Customize based on test case expectations
  if (testCase.expected.project_name !== undefined) {
    mockResponse.project_name = testCase.expected.project_name;
  }
  
  if (testCase.expected.servings_per_day !== undefined) {
    mockResponse.servings_per_day = testCase.expected.servings_per_day;
  }
  
  if (testCase.expected.confidence_score_min !== undefined) {
    mockResponse.confidence_score = Math.max(
      testCase.expected.confidence_score_min,
      testCase.expected.confidence_score_max || 1.0
    );
  }
  
  return mockResponse;
};

// Export test runner instance
export const testRunner = new SonnetTestRunner();