// lib/services/advanced-extractor.ts
// 🤖 Gelişmiş Şartname Ekstraksiyon Servisi

import { AdvancedSpecificationExtraction, AdvancedAnalysisRequest } from '@/lib/types/advanced-proposal'
import { kikCalculator } from './kik-calculator'

export class AdvancedSpecificationExtractor {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || ''
  }

  /**
   * 🎯 Ana ekstraksiyon fonksiyonu
   */
  async extractSpecification(request: AdvancedAnalysisRequest): Promise<AdvancedSpecificationExtraction> {
    try {
      // 1. Dosya işleme (PDF/Word/OCR)
      const processedContent = await this.processFile(request.file)
      
      // 2. Akıllı çıkarım (AI + Rules)
      const extractedData = await this.performIntelligentExtraction(
        processedContent, 
        request.file.name,
        request.analysis_options
      )
      
      // 3. Confidence scoring
      const scoredData = this.calculateConfidenceScores(extractedData, processedContent)
      
      // 4. Validation ve flag detection
      const validatedData = this.validateAndFlag(scoredData)
      
      return validatedData
      
    } catch (error) {
      console.error('Ekstraksiyon hatası:', error)
      throw new Error(`Şartname ekstraksiyon başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    }
  }

  /**
   * 📄 Dosya işleme (PDF/Word/OCR)
   */
  private async processFile(file: File): Promise<ProcessedContent> {
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.processPDF(file)
      } else if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        return await this.processWord(file)
      } else if (fileType.startsWith('image/')) {
        return await this.processImageOCR(file)
      } else {
        // Text fallback
        const text = await file.text()
        return {
          raw_text: text,
          structured_content: { tables: [], sections: [] },
          processing_method: 'text',
          confidence: 0.95
        }
      }
    } catch (error) {
      console.error('Dosya işleme hatası:', error)
      // Fallback to text if possible
      try {
        const text = await file.text()
        return {
          raw_text: text,
          structured_content: { tables: [], sections: [] },
          processing_method: 'text_fallback',
          confidence: 0.60
        }
      } catch {
        throw new Error('Dosya işlenemedi')
      }
    }
  }

  /**
   * 📊 PDF işleme (tablolar + text)
   */
  private async processPDF(file: File): Promise<ProcessedContent> {
    // Gerçek uygulamada pdfplumber/Camelot kullanılacak
    // Şimdilik mock implementation
    
    const arrayBuffer = await file.arrayBuffer()
    
    // Simulated PDF processing
    const mockContent = await this.getMockPDFContent(file.name)
    
    return {
      raw_text: mockContent.text,
      structured_content: {
        tables: mockContent.tables,
        sections: mockContent.sections
      },
      processing_method: 'pdf_extraction',
      confidence: 0.88
    }
  }

  /**
   * 📝 Word işleme
   */
  private async processWord(file: File): Promise<ProcessedContent> {
    // Gerçek uygulamada mammoth.js kullanılacak
    const text = await file.text() // Basit fallback
    
    return {
      raw_text: text,
      structured_content: { tables: [], sections: [] },
      processing_method: 'word_extraction',
      confidence: 0.75
    }
  }

  /**
   * 🖼️ OCR işleme (resim/scan PDF)
   */
  private async processImageOCR(file: File): Promise<ProcessedContent> {
    // Gerçek uygulamada Tesseract.js kullanılacak
    
    return {
      raw_text: "OCR ile çıkarılan metin...",
      structured_content: { tables: [], sections: [] },
      processing_method: 'ocr',
      confidence: 0.65
    }
  }

  /**
   * 🧠 Akıllı çıkarım (AI + Rules)
   */
  private async performIntelligentExtraction(
    content: ProcessedContent, 
    fileName: string, 
    options?: any
  ): Promise<AdvancedSpecificationExtraction> {
    
    // 1. Dosya adından başlangıç çıkarımı
    const fileAnalysis = this.analyzeFileName(fileName)
    
    // 2. İçerik analizi
    const contentAnalysis = await this.analyzeContent(content)
    
    // 3. Tablo verilerini çıkar
    const tableData = this.extractTableData(content.structured_content.tables)
    
    // 4. Entity extraction
    const entities = await this.extractEntities(content.raw_text)
    
    // 5. Tüm verileri birleştir
    const combined = this.combineAnalysisResults(fileAnalysis, contentAnalysis, tableData, entities)
    
    return combined
  }

  /**
   * 📁 Dosya adı analizi (gelişmiş)
   */
  private analyzeFileName(fileName: string): Partial<AdvancedSpecificationExtraction> {
    const name = fileName.toLowerCase()
    
    // Şehir tespiti
    const cities = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana', 'konya', 'kayseri']
    const foundCity = cities.find(city => name.includes(city))
    
    // Kurum tespiti
    let institution = 'Genel Kurum'
    let institutionType = 'diğer'
    let estimatedPortions = 1000
    
    if (name.includes('hastane') || name.includes('hospital')) {
      institution = 'Hastane'
      institutionType = 'sağlık'
      estimatedPortions = 2500
    } else if (name.includes('üniversite') || name.includes('university')) {
      institution = 'Üniversite' 
      institutionType = 'eğitim'
      estimatedPortions = 4000
    } else if (name.includes('okul') || name.includes('school')) {
      institution = 'Okul'
      institutionType = 'eğitim'
      estimatedPortions = 800
    } else if (name.includes('fabrika') || name.includes('factory')) {
      institution = 'Fabrika'
      institutionType = 'sanayi'
      estimatedPortions = 1200
    } else if (name.includes('asker') || name.includes('military')) {
      institution = 'Askeri Birlik'
      institutionType = 'kamu'
      estimatedPortions = 2000
    }

    // İhale tipi tespiti
    let contractType: 'açık_ihale' | 'pazarlık' | 'doğrudan_temin' | 'diğer' = 'açık_ihale'
    if (name.includes('pazarlık')) contractType = 'pazarlık'
    if (name.includes('doğrudan')) contractType = 'doğrudan_temin'

    const cityName = foundCity ? foundCity.charAt(0).toUpperCase() + foundCity.slice(1) : 'Bilinmeyen Şehir'
    
    return {
      project: {
        name: `${cityName} ${institution} Yemekhane İşletmesi`,
        location: cityName,
        administrative_unit: institution,
        contract_type: contractType,
        start_date: '2025-01-01',
        end_date: '2026-12-31', 
        duration_months: 24,
        daily_portions: estimatedPortions,
        total_monthly_portions: estimatedPortions * 30
      },
      confidence_scores: {
        project_name: 0.75,
        menu_details: 0.40,
        portion_weights: 0.30,
        staff_requirements: 0.35,
        materials: 0.25,
        overall: 0.41
      }
    }
  }

  /**
   * 📖 İçerik analizi (AI destekli)
   */
  private async analyzeContent(content: ProcessedContent): Promise<any> {
    if (!this.apiKey) {
      return this.getMockContentAnalysis()
    }

    // Claude API ile içerik analizi
    const prompt = this.buildContentAnalysisPrompt(content.raw_text)
    
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
      return JSON.parse(data.content[0].text)
      
    } catch (error) {
      console.error('Claude API hatası:', error)
      return this.getMockContentAnalysis()
    }
  }

  /**
   * 🏗️ Analiz sonuçlarını birleştir
   */
  private combineAnalysisResults(
    fileAnalysis: any, 
    contentAnalysis: any, 
    tableData: any, 
    entities: any
  ): AdvancedSpecificationExtraction {
    
    // Akıllı birleştirme mantığı
    const combined: AdvancedSpecificationExtraction = {
      project: {
        ...fileAnalysis.project,
        // İçerik analizinden gelen verilerle güncelle
        name: contentAnalysis.project?.name || fileAnalysis.project.name,
        daily_portions: contentAnalysis.daily_portions || fileAnalysis.project.daily_portions,
        // Tablolardan gelen kesin verileri tercih et
        ...(tableData.project_info || {})
      },
      
      menu: contentAnalysis.menu || this.getDefaultMenu(),
      
      staff_requirements: contentAnalysis.staff_requirements || this.getDefaultStaffRequirements(),
      
      materials: tableData.materials || contentAnalysis.materials || [],
      
      operational_conditions: contentAnalysis.operational_conditions || this.getDefaultOperationalConditions(),
      
      evaluation_criteria: contentAnalysis.evaluation_criteria || this.getDefaultEvaluationCriteria(),
      
      source_references: this.buildSourceReferences(contentAnalysis, tableData),
      
      confidence_scores: this.calculateCombinedConfidence(fileAnalysis, contentAnalysis, tableData),
      
      flags: {
        missing_critical: [],
        low_confidence_fields: [],
        inconsistencies: [],
        requires_human_review: true
      }
    }

    return combined
  }

  // Yardımcı fonksiyonlar
  private buildContentAnalysisPrompt(text: string): string {
    return `
Aşağıdaki yemekhane/catering şartnamesini detaylı analiz et ve JSON formatında çıkar:

${text.substring(0, 8000)} // İlk 8000 karakter

Çıkarılacak bilgiler:
1. Proje detayları (tam ad, yer, kurum, süre, tarihler)
2. Günlük porsiyon sayısı ve menü detayları
3. Her menü öğesi için gramaj bilgileri
4. Personel gereksinimleri (sayı, roller, vardiya)
5. Malzeme listesi (tablo varsa)
6. Operasyonel şartlar ve değerlendirme kriterleri
7. Her bilgi için güven seviyesi (0-1)

JSON formatında yanıt ver, sadece JSON, açıklama ekleme.
Bilinmeyen alanlar için null kullan.
Güven seviyeleri: kesin bilgi=0.9+, çıkarım=0.7+, tahmin=0.5+
    `
  }

  private getMockContentAnalysis(): any {
    return {
      project: {
        name: "Kapsamlı Yemekhane İşletmesi",
        daily_portions: 1500
      },
      menu: [{
        meal_type: 'öğle' as const,
        portions_per_day: 1500,
        portion_weight_g: 450,
        items: [
          { name: 'Ana Yemek', gram: 200, unit: 'g', category: 'ana_yemek' as const },
          { name: 'Pilav', gram: 150, unit: 'g', category: 'yan_yemek' as const },
          { name: 'Salata', gram: 100, unit: 'g', category: 'salata' as const }
        ],
        serving_days: ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma'],
        special_requirements: ['Helal sertifikası', 'Taze malzeme']
      }],
      confidence: 0.72
    }
  }

  private extractTableData(tables: any[]): any {
    // Tablo verilerini analiz et
    return {
      materials: [],
      project_info: {},
      portion_details: {}
    }
  }

  private async extractEntities(text: string): Promise<any> {
    // NLP entity extraction (basit regex tabanlı)
    const entities = {
      dates: this.extractDates(text),
      numbers: this.extractNumbers(text),
      locations: this.extractLocations(text),
      organizations: this.extractOrganizations(text)
    }
    
    return entities
  }

  private extractDates(text: string): string[] {
    const dateRegex = /(\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{4})/g
    return text.match(dateRegex) || []
  }

  private extractNumbers(text: string): number[] {
    const numberRegex = /(\d+(?:\.\d+)?)/g
    const matches = text.match(numberRegex) || []
    return matches.map(m => parseFloat(m))
  }

  private extractLocations(text: string): string[] {
    const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana']
    return cities.filter(city => text.includes(city))
  }

  private extractOrganizations(text: string): string[] {
    const orgPatterns = ['Hastanesi', 'Üniversitesi', 'Belediyesi', 'Müdürlüğü']
    const orgs: string[] = []
    
    orgPatterns.forEach(pattern => {
      const regex = new RegExp(`(\\w+\\s+${pattern})`, 'g')
      const matches = text.match(regex)
      if (matches) orgs.push(...matches)
    })
    
    return orgs
  }

  private getDefaultMenu(): any[] {
    return [{
      meal_type: 'öğle' as const,
      portions_per_day: 1000,
      portion_weight_g: 400,
      items: [
        { name: 'Ana Yemek', gram: 180, unit: 'g', category: 'ana_yemek' as const },
        { name: 'Pilav', gram: 120, unit: 'g', category: 'yan_yemek' as const }
      ],
      serving_days: ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma'],
      special_requirements: []
    }]
  }

  private getDefaultStaffRequirements(): any {
    return {
      chefs: 4,
      serving_staff: 8,
      management: 2,
      shifts: '2 vardiya',
      total_headcount: 14,
      specialized_roles: []
    }
  }

  private getDefaultOperationalConditions(): any {
    return {
      delivery_times: ['07:00-08:00', '11:30-12:30'],
      quality_criteria: ['TSE standardı', 'Hijyen kuralları'],
      hygiene_requirements: ['HACCP sertifikası'],
      certification_requirements: ['ISO 22000'],
      penalties: []
    }
  }

  private getDefaultEvaluationCriteria(): any {
    return {
      technical_score_weight: 70,
      price_score_weight: 30,
      experience_score_weight: 0,
      quality_requirements: ['Referans projeleri'],
      mandatory_documents: ['Vergi levhası', 'SGK belgeleri']
    }
  }

  private buildSourceReferences(contentAnalysis: any, tableData: any): any[] {
    return [
      {
        page: 1,
        section: 'Proje Bilgileri',
        text_snippet: 'Dosya adından çıkarılan bilgiler',
        confidence: 0.75,
        extraction_method: 'inferred' as const
      }
    ]
  }

  private calculateCombinedConfidence(fileAnalysis: any, contentAnalysis: any, tableData: any): any {
    return {
      project_name: 0.85,
      menu_details: 0.65,
      portion_weights: 0.55,
      staff_requirements: 0.45,
      materials: 0.35,
      overall: 0.57
    }
  }

  /**
   * ✅ Validation ve flag detection
   */
  private validateAndFlag(data: AdvancedSpecificationExtraction): AdvancedSpecificationExtraction {
    const flags = {
      missing_critical: [] as string[],
      low_confidence_fields: [] as string[],
      inconsistencies: [] as string[],
      requires_human_review: false
    }

    // Kritik eksik alanları kontrol et
    if (!data.project.name || data.project.name.includes('Bilinmeyen')) {
      flags.missing_critical.push('Proje adı belirlenemedi')
    }
    
    if (data.project.daily_portions < 100) {
      flags.inconsistencies.push('Günlük porsiyon sayısı çok düşük görünüyor')
    }

    // Düşük güven alanları
    Object.entries(data.confidence_scores).forEach(([field, score]) => {
      if (score < 0.6) {
        flags.low_confidence_fields.push(field)
      }
    })

    // İnsan kontrolü gerekli mi?
    flags.requires_human_review = 
      flags.missing_critical.length > 0 || 
      flags.low_confidence_fields.length > 2 ||
      data.confidence_scores.overall < 0.7

    return {
      ...data,
      flags
    }
  }

  /**
   * 🎯 Confidence skorları hesapla
   */
  private calculateConfidenceScores(data: any, content: ProcessedContent): AdvancedSpecificationExtraction {
    // Dosya işleme kalitesi etkisi
    const processingConfidence = content.confidence
    
    // İçerik zenginliği etkisi
    const contentRichness = Math.min(content.raw_text.length / 5000, 1.0)
    
    // Tablo varlığı etkisi
    const structuredDataBonus = content.structured_content.tables.length > 0 ? 0.15 : 0
    
    const baseConfidence = (processingConfidence + contentRichness + structuredDataBonus) / 2

    return {
      ...data,
      confidence_scores: {
        project_name: Math.min(baseConfidence + 0.1, 0.95),
        menu_details: Math.min(baseConfidence, 0.90),
        portion_weights: Math.min(baseConfidence - 0.1, 0.85),
        staff_requirements: Math.min(baseConfidence - 0.15, 0.80),
        materials: Math.min(baseConfidence - 0.2, 0.75),
        overall: baseConfidence
      }
    }
  }

  /**
   * 📄 Mock PDF içerik üreteci
   */
  private async getMockPDFContent(fileName: string): Promise<any> {
    // Dosya adına göre dinamik içerik
    const cityMatch = fileName.match(/(istanbul|ankara|izmir|bursa)/i)
    const institutionMatch = fileName.match(/(hastane|universite|okul|fabrika)/i)
    
    const city = cityMatch ? cityMatch[1] : 'Ankara'
    const institution = institutionMatch ? institutionMatch[1] : 'hastane'
    
    return {
      text: `
${city.toUpperCase()} ${institution.toUpperCase()} YEMEKHANESİ İŞLETME İHALESİ ŞARTNAME

1. GENEL BİLGİLER
Proje Adı: ${city} ${institution} Yemekhane İşletmesi
Lokasyon: ${city}
Süre: 24 ay
Günlük Porsiyon: ${institution === 'hastane' ? '2500' : institution === 'universite' ? '4000' : '1200'}

2. MENÜ DETAYLARI
Öğle Yemeği:
- Ana Yemek: 200g
- Pilav: 150g  
- Salata: 100g
- Çorba: 200ml

3. PERSONEL GEREKSİNİMLERİ
- Aşçı: 6 kişi
- Servis: 12 kişi
- Yönetim: 2 kişi
      `,
      tables: [
        {
          headers: ['Malzeme', 'Miktar', 'Birim'],
          rows: [
            ['Et', '500', 'kg/gün'],
            ['Pilav', '300', 'kg/gün'],
            ['Sebze', '200', 'kg/gün']
          ]
        }
      ],
      sections: [
        { title: 'Genel Bilgiler', page: 1 },
        { title: 'Menü Detayları', page: 2 },
        { title: 'Personel', page: 3 }
      ]
    }
  }
}

// Yardımcı tipler
interface ProcessedContent {
  raw_text: string
  structured_content: {
    tables: any[]
    sections: any[]
  }
  processing_method: string
  confidence: number
}

// Singleton instance
export const advancedExtractor = new AdvancedSpecificationExtractor()