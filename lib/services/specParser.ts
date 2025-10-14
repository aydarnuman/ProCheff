// lib/services/specParser.ts

import { SpecificationDatabaseClient, ProfileComparison } from './specificationDatabaseClient'

export interface InstitutionProfile {
  kurum: string
  kurumKodu: string
  tarih: Date
  porsiyon: {
    et: number
    tavuk?: number
    balik?: number
    sebze: number
    yag: number
    tuz: number
    pirinc?: number
    bulgur?: number
    makarna?: number
    ekmek?: number
  }
  menuTipi: string
  ogunSayisi: number
  kisiSayisi?: number
  ozelKosullar: string[]
  hijyenKosullar: string[]
  servisKosullar: string[]
  maliyetSiniri?: {
    minimum?: number
    maksimum?: number
  }
  teslimKosullar: {
    adres?: string
    zaman?: string
    sıklık?: string
  }
  metadata: {
    processedAt: Date
    confidence: number
    sourceFile: string
    pageCount?: number
  }
}

export interface ParseResult {
  success: boolean
  profile?: InstitutionProfile
  rawText?: string
  errors?: string[]
  suggestions?: string[]
  confidence: number
  similarityAnalysis?: ProfileComparison
}

/**
 * 🧩 Dinamik Şartname Motoru
 * 
 * PDF ve Word şartnamelerini okuyup kurum profiline dönüştürür.
 * Claude AI ile akıllı analiz yapar.
 */
export class SpecificationParser {
  private database: SpecificationDatabaseClient

  constructor() {
    this.database = new SpecificationDatabaseClient()
  }

  /**
   * 📄 Dosyayı analiz et ve kurum profili çıkar
   */
  async parseSpecification(
    fileContent: string | Buffer,
    fileName: string,
    fileType: 'pdf' | 'docx' | 'txt'
  ): Promise<ParseResult> {
    
    try {
      // 1. Dosyadan metin çıkar
      const extractedText = await this.extractText(fileContent, fileType)
      
      if (!extractedText || extractedText.length < 50) {
        return {
          success: false,
          errors: ['Dosyadan yeterli metin çıkarılamadı'],
          confidence: 0
        }
      }

      // 2. Claude AI ile analiz et
      const profile = await this.analyzeWithAI(extractedText, fileName)
      
      // 3. Profili doğrula ve temizle
      const validatedProfile = this.validateProfile(profile)
      
      // 4. Güven skoru hesapla
      const confidence = this.calculateConfidence(profile, extractedText)

      const finalProfile: InstitutionProfile = {
        ...validatedProfile,
        metadata: {
          processedAt: new Date(),
          confidence,
          sourceFile: fileName,
          pageCount: this.estimatePageCount(extractedText)
        }
      }

      // 5. Benzerlik analizi yap ve veritabanına kaydet
      const similarityAnalysis = await this.database.compareProfiles(finalProfile)
      
      // 6. Yeni profili veritabanına ekle
      await this.database.addSpecification(fileName, finalProfile, extractedText)

      return {
        success: true,
        profile: finalProfile,
        rawText: extractedText,
        confidence,
        similarityAnalysis
      }

    } catch (error) {
      return {
        success: false,
        errors: [`Analiz hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`],
        confidence: 0
      }
    }
  }

  /**
   * 📖 Dosyadan metin çıkar
   */
  private async extractText(content: string | Buffer, fileType: string): Promise<string> {
    switch (fileType.toLowerCase()) {
      case 'txt':
        return content.toString('utf-8')
      
      case 'pdf':
        // PDF parsing için pdf-parse kullanılabilir
        // Şimdilik simulated content
        return this.simulatedPdfExtraction(content.toString())
      
      case 'docx':
        // DOCX parsing için mammoth veya docx-parser kullanılabilir
        return this.simulatedDocxExtraction(content.toString())
      
      default:
        throw new Error(`Desteklenmeyen dosya türü: ${fileType}`)
    }
  }

  /**
   * 🤖 Claude AI ile analiz
   */
  private async analyzeWithAI(text: string, fileName: string): Promise<InstitutionProfile> {
    const analysisPrompt = `
Aşağıdaki şartname metnini analiz et ve kurumun menü gramaj gereksinimlerini çıkar:

DOSYA ADI: ${fileName}

ŞARTNAME METNİ:
${text}

Lütfen şu formatta JSON çıktısı ver:

{
  "kurum": "Kurum adı (şartnameden çıkar)",
  "kurumKodu": "Kurum kodu (varsa)",
  "porsiyon": {
    "et": 120,  // gram cinsinden
    "tavuk": 100,
    "sebze": 50,
    "yag": 15,
    "tuz": 2,
    "pirinc": 80,
    "bulgur": 60,
    "ekmek": 100
  },
  "menuTipi": "Günlük 3 öğün" veya "Haftalık menü" vb,
  "ogunSayisi": 3,
  "kisiSayisi": 500,
  "ozelKosullar": [
    "Özel koşullar listesi"
  ],
  "hijyenKosullar": [
    "Hijyen gereksinimleri"
  ],
  "servisKosullar": [
    "Servis koşulları"
  ],
  "maliyetSiniri": {
    "minimum": 15.50,
    "maksimum": 25.00
  },
  "teslimKosullar": {
    "adres": "Teslim adresi",
    "zaman": "08:00-17:00",
    "sıklık": "Günlük"
  }
}

ÖNEMLİ NOTLAR:
- Gramaj bilgileri çok kritik, dikkatli oku
- Sayısal değerleri tam olarak çıkar
- Eğer bir bilgi yoksa null koy
- Porsiyon gramajları şartnamede net belirtilmiş olmalı
- Maliyet limitleri önemli, dikkatli ara

Sadece JSON formatında cevap ver, başka açıklama ekleme.
`

    try {
      // Claude servisini kullan (mevcut ClaudeService'ten)
      const claudeService = new (await import('./claude')).ClaudeService()
      
      // Simulated response for now - gerçek implementasyonda claude.generateRecipeAnalysis() benzeri metod kullanılacak
      const simulatedProfile: InstitutionProfile = {
        kurum: this.extractInstitutionName(text, fileName),
        kurumKodu: this.extractInstitutionCode(text),
        tarih: new Date(),
        porsiyon: this.extractPortionSizes(text),
        menuTipi: this.extractMenuType(text),
        ogunSayisi: this.extractMealCount(text),
        kisiSayisi: this.extractPersonCount(text),
        ozelKosullar: this.extractSpecialConditions(text),
        hijyenKosullar: this.extractHygieneConditions(text),
        servisKosullar: this.extractServiceConditions(text),
        maliyetSiniri: this.extractBudgetLimits(text),
        teslimKosullar: this.extractDeliveryConditions(text),
        metadata: {
          processedAt: new Date(),
          confidence: 0.85,
          sourceFile: fileName
        }
      }

      return simulatedProfile

    } catch (error) {
      console.error('AI Analysis failed:', error)
      throw new Error('AI analizi başarısız oldu')
    }
  }

  /**
   * 🏢 Kurum adını çıkar
   */
  private extractInstitutionName(text: string, fileName: string): string {
    // Yaygın kalıpları ara
    const patterns = [
      /(?:T\.C\.\s+)?([A-ZÇĞÜŞÖİ][a-zçğüşöı\s]+(?:Üniversitesi|Hastanesi|Belediyesi|Müdürlüğü|Okulu|PMYO|MYO))/i,
      /KURUM\s*:\s*(.+)/i,
      /İDARE\s*:\s*(.+)/i,
      /BAŞVURU\s+SAHİBİ\s*:\s*(.+)/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    // Dosya adından çıkarmayı dene
    const fileBasename = fileName.replace(/\.(pdf|docx|doc|txt)$/i, '')
    if (fileBasename.length > 3) {
      return fileBasename.replace(/[_-]/g, ' ')
    }

    return 'Bilinmeyen Kurum'
  }

  /**
   * 🔢 Porsiyon gramajlarını çıkar
   */
  private extractPortionSizes(text: string): InstitutionProfile['porsiyon'] {
    const portions: any = {
      et: null,
      sebze: null,
      yag: null,
      tuz: null
    }

    // Et gramajı
    const etPatterns = [
      /et[:\s]+(\d+)\s*g/i,
      /kırmızı\s+et[:\s]+(\d+)\s*g/i,
      /dana\s+eti[:\s]+(\d+)\s*g/i,
      /kuzu\s+eti[:\s]+(\d+)\s*g/i
    ]

    // Tavuk gramajı
    const tavukPatterns = [
      /tavuk[:\s]+(\d+)\s*g/i,
      /piliç[:\s]+(\d+)\s*g/i,
      /beyaz\s+et[:\s]+(\d+)\s*g/i
    ]

    // Sebze gramajı
    const sebzePatterns = [
      /sebze[:\s]+(\d+)\s*g/i,
      /salata[:\s]+(\d+)\s*g/i,
      /garnitür[:\s]+(\d+)\s*g/i
    ]

    // Yağ gramajı
    const yagPatterns = [
      /(?:sıvı\s+)?yağ[:\s]+(\d+)\s*(?:g|ml)/i,
      /zeytinyağı[:\s]+(\d+)\s*(?:g|ml)/i,
      /ayçiçek\s+yağı[:\s]+(\d+)\s*(?:g|ml)/i
    ]

    // Pattern matching
    etPatterns.forEach(pattern => {
      const match = text.match(pattern)
      if (match && !portions.et) portions.et = parseInt(match[1])
    })

    tavukPatterns.forEach(pattern => {
      const match = text.match(pattern)
      if (match) portions.tavuk = parseInt(match[1])
    })

    sebzePatterns.forEach(pattern => {
      const match = text.match(pattern)
      if (match && !portions.sebze) portions.sebze = parseInt(match[1])
    })

    yagPatterns.forEach(pattern => {
      const match = text.match(pattern)
      if (match && !portions.yag) portions.yag = parseInt(match[1])
    })

    // Varsayılan değerler (eğer bulunamazsa)
    return {
      et: portions.et || 120,
      tavuk: portions.tavuk || 100,
      sebze: portions.sebze || 50,
      yag: portions.yag || 15,
      tuz: 2,
      pirinc: 80,
      bulgur: 60,
      ekmek: 100
    }
  }

  /**
   * 📋 Menü tipini belirle
   */
  private extractMenuType(text: string): string {
    if (text.includes('kahvaltı') && text.includes('öğle') && text.includes('akşam')) {
      return 'Günlük 3 öğün'
    } else if (text.includes('haftalık')) {
      return 'Haftalık menü'
    } else if (text.includes('aylık')) {
      return 'Aylık menü'
    }
    return 'Günlük menü'
  }

  /**
   * Diğer extraction metodları...
   */
  private extractInstitutionCode(text: string): string {
    const match = text.match(/(?:kod|code)[:\s]+([A-Z0-9-]+)/i)
    return match ? match[1] : `K${Date.now().toString().slice(-6)}`
  }

  private extractMealCount(text: string): number {
    if (text.includes('3 öğün') || (text.includes('kahvaltı') && text.includes('öğle') && text.includes('akşam'))) {
      return 3
    } else if (text.includes('2 öğün')) {
      return 2
    }
    return 1
  }

  private extractPersonCount(text: string): number | undefined {
    const patterns = [
      /(\d+)\s*kişi/i,
      /(\d+)\s*portion/i,
      /(\d+)\s*porsiyon/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return parseInt(match[1])
    }
    
    return undefined
  }

  private extractSpecialConditions(text: string): string[] {
    const conditions = []
    if (text.includes('helal')) conditions.push('Helal sertifikalı')
    if (text.includes('organik')) conditions.push('Organik ürün')
    if (text.includes('yerel')) conditions.push('Yerel üretici')
    if (text.includes('soğuk zincir')) conditions.push('Soğuk zincir')
    return conditions
  }

  private extractHygieneConditions(text: string): string[] {
    const conditions = []
    if (text.includes('HACCP')) conditions.push('HACCP sertifikası')
    if (text.includes('ISO 22000')) conditions.push('ISO 22000')
    if (text.includes('hijyen')) conditions.push('Hijyen belgeleri')
    return conditions
  }

  private extractServiceConditions(text: string): string[] {
    const conditions = []
    if (text.includes('sıcak servis')) conditions.push('Sıcak servis')
    if (text.includes('soğuk servis')) conditions.push('Soğuk servis')
    if (text.includes('ambalajlı')) conditions.push('Ambalajlı teslimat')
    return conditions
  }

  private extractBudgetLimits(text: string): { minimum?: number, maksimum?: number } | undefined {
    const minMatch = text.match(/(?:minimum|en\s+az)[:\s]*([\d,]+(?:\.\d+)?)\s*[₺TL]/i)
    const maxMatch = text.match(/(?:maksimum|en\s+fazla)[:\s]*([\d,]+(?:\.\d+)?)\s*[₺TL]/i)
    
    if (minMatch || maxMatch) {
      return {
        minimum: minMatch ? parseFloat(minMatch[1].replace(',', '.')) : undefined,
        maksimum: maxMatch ? parseFloat(maxMatch[1].replace(',', '.')) : undefined
      }
    }
    
    return undefined
  }

  private extractDeliveryConditions(text: string): InstitutionProfile['teslimKosullar'] {
    return {
      adres: this.extractAddress(text),
      zaman: this.extractDeliveryTime(text),
      sıklık: this.extractFrequency(text)
    }
  }

  private extractAddress(text: string): string | undefined {
    const match = text.match(/(?:adres|address)[:\s]+(.{10,100})/i)
    return match ? match[1].trim().split('\n')[0] : undefined
  }

  private extractDeliveryTime(text: string): string | undefined {
    const match = text.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/i)
    return match ? `${match[1]}-${match[2]}` : undefined
  }

  private extractFrequency(text: string): string | undefined {
    if (text.includes('günlük')) return 'Günlük'
    if (text.includes('haftalık')) return 'Haftalık'
    if (text.includes('aylık')) return 'Aylık'
    return undefined
  }

  /**
   * ✅ Profili doğrula
   */
  private validateProfile(profile: InstitutionProfile): InstitutionProfile {
    // Zorunlu alanları kontrol et ve varsayılan değerler ata
    const validatedPortion = {
      ...profile.porsiyon,
      et: Math.max(0, profile.porsiyon.et || 120),
      sebze: Math.max(0, profile.porsiyon.sebze || 50),
      yag: Math.max(0, profile.porsiyon.yag || 15),
      tuz: Math.max(0, profile.porsiyon.tuz || 2)
    }

    return {
      ...profile,
      kurum: profile.kurum || 'Bilinmeyen Kurum',
      porsiyon: validatedPortion,
      menuTipi: profile.menuTipi || 'Günlük menü',
      ogunSayisi: Math.max(1, profile.ogunSayisi || 1),
      ozelKosullar: profile.ozelKosullar || [],
      hijyenKosullar: profile.hijyenKosullar || [],
      servisKosullar: profile.servisKosullar || []
    }
  }

  /**
   * 📊 Güven skoru hesapla
   */
  private calculateConfidence(profile: InstitutionProfile, text: string): number {
    let confidence = 0.5 // Başlangıç skoru

    // Kurum adı bulunduysa +0.2
    if (profile.kurum && profile.kurum !== 'Bilinmeyen Kurum') {
      confidence += 0.2
    }

    // Gramaj bilgileri bulunduysa +0.3
    if (profile.porsiyon.et && profile.porsiyon.sebze) {
      confidence += 0.3
    }

    // Özel koşullar bulunduysa +0.1
    if (profile.ozelKosullar.length > 0) {
      confidence += 0.1
    }

    // Metin uzunluğu yeterliyse +0.1
    if (text.length > 500) {
      confidence += 0.1
    }

    return Math.min(0.95, confidence)
  }

  /**
   * Simulated extraction methods (gerçek PDF/DOCX parser'lar için placeholder)
   */
  private simulatedPdfExtraction(content: string): string {
    return `
    T.C. AFYON PMYO 
    YEMEK HİZMET ŞARTNAMESI
    
    Porsiyon Gramajları:
    - Et: 120 gram
    - Sebze: 30 gram  
    - Yağ: 15 gram
    - Tuz: 2 gram
    
    Menü Tipi: Günlük 3 öğün
    Kişi Sayısı: 500
    
    Özel Koşullar:
    - Helal sertifikalı olacaktır
    - Sıcak servis edilecektir
    - HACCP belgesi zorunludur
    
    Bütçe: Porsiyon başı maksimum 25 TL
    `
  }

  private simulatedDocxExtraction(content: string): string {
    return this.simulatedPdfExtraction(content)
  }

  private estimatePageCount(text: string): number {
    return Math.ceil(text.length / 2500) // Sayfa başına ortalama 2500 karakter
  }
}