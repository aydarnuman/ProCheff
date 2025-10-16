// lib/services/specificationAnalyzer.ts
// 🤖 Şartname AI Analiz Servisi

import { ExtractedData, SpecificationUpload } from '@/lib/types/proposal'

export class SpecificationAnalyzer {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || ''
  }

  /**
   * 📋 Şartname dosyasını AI ile analiz eder
   */
  async analyzeSpecification(file: File): Promise<ExtractedData> {
    try {
      // 1. Dosya adından akıllı çıkarım yap
      const smartAnalysis = this.analyzeFileName(file.name)
      
      // 2. Dosyayı text'e çevir (PDF/Word parser gerekecek)
      const textContent = await this.extractTextFromFile(file)
      
      // 3. Claude API ile analiz et veya akıllı mock döndür
      const aiResponse = await this.callClaudeAPI(textContent, smartAnalysis)
      
      // 4. Structured data'ya çevir
      const extractedData = this.parseAIResponse(aiResponse)
      
      return extractedData
    } catch (error) {
      console.error('Şartname analizi hatası:', error)
      throw new Error('Şartname analizi başarısız oldu')
    }
  }

  /**
   * 📄 Dosyadan text çıkarma (PDF/Word için)
   */
  private async extractTextFromFile(file: File): Promise<string> {
    // Bu örnekte sadece text dosyası simülasyonu
    // Gerçekte PDF/Word parser kullanılacak (pdf-parse, mammoth vb.)
    
    if (file.type === 'text/plain') {
      return await file.text()
    }
    
    // Simülasyon için örnek şartname text'i
    return this.getSampleSpecificationText()
  }

  /**
   * � Dosya adından akıllı çıkarım yap
   */
  private analyzeFileName(fileName: string): any {
    const name = fileName.toLowerCase()
    
    // Şehir/kurum analizi
    let location = "Bilinmeyen Şehir"
    let institution = "Genel Kurum"
    let projectName = "Yemekhane İşletmesi"
    let dailyServings = 1000
    
    // Şehir tespiti
    const cities = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana', 'konya', 'gaziantep', 'kayseri', 'mersin']
    const foundCity = cities.find(city => name.includes(city))
    if (foundCity) {
      location = foundCity.charAt(0).toUpperCase() + foundCity.slice(1)
    }
    
    // Kurum tipi tespiti
    if (name.includes('hastane') || name.includes('hospital')) {
      institution = 'Hastane'
      projectName = `${location} Hastanesi Yemekhane İşletmesi`
      dailyServings = 2500
    } else if (name.includes('üniversite') || name.includes('university')) {
      institution = 'Üniversite'
      projectName = `${location} Üniversitesi Yemekhane İşletmesi`
      dailyServings = 4000
    } else if (name.includes('okul') || name.includes('school')) {
      institution = 'Okul'
      projectName = `${location} Okulu Yemekhane İşletmesi`
      dailyServings = 800
    } else if (name.includes('fabrika') || name.includes('factory')) {
      institution = 'Fabrika'
      projectName = `${location} Fabrikası Yemekhane İşletmesi`
      dailyServings = 1200
    } else if (name.includes('askeriye') || name.includes('military')) {
      institution = 'Askeri Birlik'
      projectName = `${location} Askeri Birlik Yemekhane İşletmesi`
      dailyServings = 2000
    }
    
    return {
      location,
      institution,
      projectName,
      dailyServings
    }
  }

  /**
   * 🏢 Kurum tipine göre özel gereksinimler
   */
  private getSpecialRequirements(institution: string): string {
    const requirements: { [key: string]: string } = {
      'Hastane': '["Hasta diyetleri", "Hijyen protokolü", "7/24 servis", "Medikal beslenme"]',
      'Üniversite': '["Öğrenci menüsü", "Vejetaryen seçenekler", "Kantinle entegrasyon"]',
      'Okul': '["Çocuk beslenmesi", "Allerji kontrolü", "Beslenme eğitimi"]',
      'Askeri Birlik': '["Yüksek kalori", "Pratik servis", "Dayanıklılık menüsü"]',
      'Fabrika': '["Vardiya sistemi", "Hızlı servis", "Enerji yoğun menüler"]'
    }
    return requirements[institution] || '["Genel hijyen", "Kaliteli malzeme", "Düzenli servis"]'
  }

  /**
   * �🤖 Claude API çağrısı
   */
  private async callClaudeAPI(textContent: string, smartAnalysis?: any): Promise<string> {
    if (!this.apiKey) {
      // API key yoksa akıllı mock response döndür
      return this.getMockAIResponse(smartAnalysis)
    }

    const prompt = this.buildAnalysisPrompt(textContent)
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      })

      const data = await response.json()
      return data.content[0].text
    } catch (error) {
      console.error('Claude API hatası:', error)
      return this.getMockAIResponse()
    }
  }

  /**
   * 📝 AI analiz prompt'u oluştur
   */
  private buildAnalysisPrompt(textContent: string): string {
    return `
Aşağıdaki yemekhane/catering şartnamesini analiz et ve JSON formatında bilgileri çıkar:

${textContent}

Çıkarılacak bilgiler:
1. Proje Bilgileri (ad, yer, kurum, süre)
2. Servis Detayları (günlük porsiyon, öğün sayısı)
3. Porsiyon Boyutları (ana yemek, yan yemek gramajları)
4. Beslenme Gereksinimleri (kalori, protein vb.)
5. Kalite Standartları (sertifikalar, hijyen)
6. Bütçe Bilgileri (tahmini bütçe, ödeme şartları)

JSON formatında yanıt ver:
{
  "projectInfo": {
    "name": "proje adı",
    "location": "şehir/bölge",
    "institution": "kurum tipi",
    "contractPeriod": "süre",
    "startDate": "başlangıç tarihi",
    "endDate": "bitiş tarihi"
  },
  "servingDetails": {
    "dailyServings": sayı,
    "mealsPerDay": sayı,
    "totalServings": sayı,
    "specialRequirements": ["özel gereksinimler"]
  },
  "portionSizes": {
    "lunch": {
      "mainCourse": gram,
      "side": gram,
      "soup": gram,
      "dessert": gram,
      "bread": gram
    }
  },
  "nutritionalRequirements": {
    "calories": sayı,
    "protein": gram,
    "carbs": gram,
    "fat": gram,
    "specialDiets": ["diyet türleri"]
  },
  "qualityStandards": {
    "certifications": ["sertifikalar"],
    "hygiene": ["hijyen kuralları"],
    "storage": ["saklama koşulları"],
    "service": ["servis kuralları"]
  },
  "budgetInfo": {
    "estimatedBudget": sayı,
    "maxPricePerServing": sayı,
    "paymentTerms": "ödeme şartları"
  },
  "aiConfidence": 0.85,
  "warnings": ["uyarılar"]
}

Sadece JSON yanıtı ver, başka açıklama ekleme.
`
  }

  /**
   * 🔄 AI yanıtını structured data'ya çevir
   */
  private parseAIResponse(aiResponse: string): ExtractedData {
    try {
      // JSON parse et
      const parsed = JSON.parse(aiResponse)
      
      return {
        ...parsed,
        extractedAt: new Date()
      }
    } catch (error) {
      console.error('AI yanıtı parse hatası:', error)
      // Fallback olarak örnek data döndür
      return this.getSampleExtractedData()
    }
  }

  /**
   * 📋 Örnek şartname text'i (test için)
   */
  private getSampleSpecificationText(): string {
    return `
ANKARA ŞEHİR HASTANESİ YEMEKHANESİ İŞLETME İHALESİ ŞARTNAME

1. GENEL BİLGİLER
- Proje Adı: Ankara Şehir Hastanesi Ana Yemekhane İşletmesi
- Yer: Ankara/Çankaya
- İhale Sahibi: Ankara Şehir Hastanesi Başhekimliği
- Sözleşme Süresi: 24 ay (2 yıl)
- Başlangıç Tarihi: 01.01.2025
- Bitiş Tarihi: 31.12.2026

2. SERVİS KAPASITESI
- Günlük porsiyon sayısı: 3000 kişi
- Öğün sayısı: Günde 3 öğün (kahvaltı, öğle, akşam)
- Toplam aylık porsiyon: 90.000 porsiyon

3. PORSİYON BOYUTLARI
- Ana yemek: 350 gram
- Yan yemek (pilav/makarna): 150 gram
- Çorba: 200 ml
- Salata: 100 gram
- Tatlı: 80 gram
- Ekmek: 100 gram

4. BESLENME GEREKSİNİMLERİ
- Günlük kalori: 650 kcal/porsiyon
- Protein: 25 gram/porsiyon
- Karbonhidrat: 80 gram/porsiyon
- Yağ: 20 gram/porsiyon
- Özel diyetler: Diyabetik, hipertansiyon, böbrek hastası menüleri

5. KALİTE STANDARTLARI
- TSE, ISO 22000 sertifikası zorunlu
- HACCP sistemi uygulanacak
- Günlük taze malzeme kullanımı
- Soğuk zincir korunacak
- Hijyen kurallarına tam uyum

6. BÜTÇE BİLGİLERİ
- Tahmini aylık bütçe: 2.160.000 TL
- Maksimum porsiyon fiyatı: 24 TL
- Ödeme: Aylık, fatura karşılığı 30 gün vade
`
  }

  /**
   * 🤖 Mock AI yanıtı (API key yokken) - Akıllı dinamik
   */
  private getMockAIResponse(smartAnalysis?: any): string {
    const analysis = smartAnalysis || {
      location: "Ankara",
      institution: "Genel Kurum", 
      projectName: "Yemekhane İşletmesi",
      dailyServings: 1000
    }
    
    const monthlyServings = analysis.dailyServings * 30
    const pricePerServing = analysis.institution === 'Hastane' ? 28 : 
                          analysis.institution === 'Üniversite' ? 18 :
                          analysis.institution === 'Askeri Birlik' ? 25 : 22
    
    return `{
  "projectInfo": {
    "name": "${analysis.projectName}",
    "location": "${analysis.location}",
    "institution": "${analysis.institution}",
    "contractPeriod": "24 ay",
    "startDate": "01.01.2025",
    "endDate": "31.12.2026"
  },
  "servingDetails": {
    "dailyServings": ${analysis.dailyServings},
    "mealsPerDay": 3,
    "totalServings": ${monthlyServings},
    "specialRequirements": ${this.getSpecialRequirements(analysis.institution)}
  },
  "portionSizes": {
    "lunch": {
      "mainCourse": 350,
      "side": 150,
      "soup": 200,
      "dessert": 80,
      "bread": 100
    }
  },
  "nutritionalRequirements": {
    "calories": 650,
    "protein": 25,
    "carbs": 80,
    "fat": 20,
    "specialDiets": ["Diyabetik", "Hipertansiyon", "Böbrek hastası"]
  },
  "qualityStandards": {
    "certifications": ["TSE", "ISO 22000", "HACCP"],
    "hygiene": ["Günlük temizlik", "Personel hijyeni", "Ekipman dezenfeksiyonu"],
    "storage": ["Soğuk zincir", "Kuru depolama", "Günlük taze malzeme"],
    "service": ["Sıcak servis", "Porsiyon kontrolü", "Sunum standartları"]
  },
  "budgetInfo": {
    "estimatedBudget": ${monthlyServings * pricePerServing},
    "maxPricePerServing": ${pricePerServing},
    "paymentTerms": "Aylık, 30 gün vade"
  },
  "aiConfidence": 0.92,
  "warnings": ["Özel diyet menüleri ekstra maliyet gerektirebilir", "Hijyen sertifikaları düzenli yenilenmeli"]
}`
  }

  /**
   * 📊 Örnek extracted data (fallback)
   */
  private getSampleExtractedData(): ExtractedData {
    return {
      projectInfo: {
        name: "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi",
        location: "Ankara/Çankaya",
        institution: "Şehir Hastanesi",
        contractPeriod: "24 ay",
        startDate: "01.01.2025",
        endDate: "31.12.2026"
      },
      servingDetails: {
        dailyServings: 3000,
        mealsPerDay: 3,
        totalServings: 90000,
        specialRequirements: ["Hasta diyetleri", "Hijyen protokolü", "7/24 servis"]
      },
      portionSizes: {
        lunch: {
          mainCourse: 350,
          side: 150,
          soup: 200,
          dessert: 80,
          bread: 100
        }
      },
      nutritionalRequirements: {
        calories: 650,
        protein: 25,
        carbs: 80,
        fat: 20,
        specialDiets: ["Diyabetik", "Hipertansiyon", "Böbrek hastası"]
      },
      qualityStandards: {
        certifications: ["TSE", "ISO 22000", "HACCP"],
        hygiene: ["Günlük temizlik", "Personel hijyeni", "Ekipman dezenfeksiyonu"],
        storage: ["Soğuk zincir", "Kuru depolama", "Günlük taze malzeme"],
        service: ["Sıcak servis", "Porsiyon kontrolü", "Sunum standartları"]
      },
      budgetInfo: {
        estimatedBudget: 2160000,
        maxPricePerServing: 24,
        paymentTerms: "Aylık, 30 gün vade"
      },
      aiConfidence: 0.92,
      warnings: ["Özel diyet menüleri ekstra maliyet gerektirebilir", "Hijyen sertifikaları düzenli yenilenmeli"],
      extractedAt: new Date()
    }
  }
}

// Singleton instance
export const specificationAnalyzer = new SpecificationAnalyzer()