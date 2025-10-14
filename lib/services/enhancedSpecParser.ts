import fs from 'fs/promises'
import path from 'path'
import { InstitutionProfile } from './specParser'

// 5-Stage Analysis Results
export interface StageAResult {
  products: Array<{
    ürün: string
    gram: number
    birim: string
    sayfa: number
    güven: number
  }>
}

export interface StageBResult {
  özel_koşullar: string[]
  hijyen_koşullar: string[]
  servis_koşullar: string[]
  sayfa_referansları: number[]
}

export interface StageCResult {
  kurum: string
  kurumKodu: string
  menü_tipi: string
  ogunSayisi: number
  kisiSayisi: number
  porsiyon: Record<string, number>
  özel_koşullar: string[]
  hijyen_koşullar: string[]
  servis_koşullar: string[]
  maliyet_siniri: { minimum?: number, maksimum?: number }
  teslim_koşullar: { adres?: string, sıklık?: string }
  güven: number
}

export interface StageDResult extends StageCResult {
  güven_ortalaması: number
  merge_notlari: string[]
}

export interface StageEResult {
  karşılaştırılan_kurum: string
  'benzerlik_%': number
  benzer_nitelikler: string[]
  farklı_nitelikler: string[]
  güven_skoru: number
  öneri: string
}

export class EnhancedSpecParser {
  private promptsPath: string

  constructor() {
    this.promptsPath = path.join(process.cwd(), 'lib', 'prompts')
  }

  // Ana analiz fonksiyonu - 5 stage'i çalıştırır
  async analyzeSpecificationEnhanced(
    text: string, 
    fileName: string,
    existingProfiles: any[] = []
  ): Promise<{
    stageA: StageAResult
    stageB: StageBResult  
    stageC: StageCResult
    stageD?: StageDResult
    stageE?: StageEResult[]
    finalProfile: InstitutionProfile
  }> {
    
    // Büyük metni chunk'lara böl (10 sayfa ~ 5000 karakter)
    const chunks = this.chunkText(text, 5000)
    console.log(`📑 Metin ${chunks.length} parçaya bölündü`)

    const chunkResults: StageCResult[] = []

    // Her chunk için Stage A → B → C işlemi
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔍 Chunk ${i + 1}/${chunks.length} analiz ediliyor...`)
      
      const stageA = await this.runStageA(chunks[i])
      const stageB = await this.runStageB(chunks[i])
      const stageC = await this.runStageC(stageA, stageB, chunks[i])
      
      chunkResults.push(stageC)
    }

    // Stage D: Chunk'ları birleştir (eğer birden fazla varsa)
    let finalResult: StageCResult | StageDResult
    if (chunkResults.length > 1) {
      console.log(`🔗 ${chunkResults.length} chunk birleştiriliyor...`)
      finalResult = await this.runStageD(chunkResults)
    } else {
      finalResult = chunkResults[0]
    }

    // Stage E: Benzerlik analizi (eğer mevcut profil varsa)
    let stageEResults: StageEResult[] = []
    if (existingProfiles.length > 0) {
      console.log(`🔍 ${existingProfiles.length} mevcut profil ile karşılaştırılıyor...`)
      stageEResults = await this.runStageE(finalResult, existingProfiles)
    }

    // Final profile'ı InstitutionProfile formatına dönüştür
    const institutionProfile = this.convertToInstitutionProfile(finalResult, fileName)

    return {
      stageA: chunkResults[0] ? { products: [] } : { products: [] }, // İlk chunk'ın stage A sonucu
      stageB: chunkResults[0] ? { 
        özel_koşullar: finalResult.özel_koşullar,
        hijyen_koşullar: finalResult.hijyen_koşullar, 
        servis_koşullar: finalResult.servis_koşullar,
        sayfa_referansları: []
      } : { özel_koşullar: [], hijyen_koşullar: [], servis_koşullar: [], sayfa_referansları: [] },
      stageC: chunkResults[0] || finalResult,
      stageD: chunkResults.length > 1 ? finalResult as StageDResult : undefined,
      stageE: stageEResults,
      finalProfile: institutionProfile
    }
  }

  // Stage A: Gramaj çıkarımı
  private async runStageA(text: string): Promise<StageAResult> {
    const prompt = await this.loadPrompt('prompt_stageA_extraction.txt')
    const filledPrompt = prompt.replace('{text}', text)
    
    try {
      const claudeService = new (await import('./claude')).ClaudeService()
      const response = await claudeService.generateRecipeAnalysis(filledPrompt)
      
      // JSON parse et - response'dan text çıkar
      const responseText = JSON.stringify(response)
      const jsonMatch = responseText.match(/\[(.*?)\]/)
      if (jsonMatch) {
        const products = JSON.parse(jsonMatch[0])
        return { products }
      }
      
      return { products: [] }
    } catch (error) {
      console.error('Stage A hatası:', error)
      return { products: [] }
    }
  }

  // Stage B: Özel koşullar
  private async runStageB(text: string): Promise<StageBResult> {
    const prompt = await this.loadPrompt('prompt_stageB_rules.txt')
    const filledPrompt = prompt.replace('{text}', text)
    
    try {
      const claudeService = new (await import('./claude')).ClaudeService()
      const response = await claudeService.generateRecipeAnalysis(filledPrompt)
      
      // JSON parse et - response'dan text çıkar
      const responseText = JSON.stringify(response)
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return {
          özel_koşullar: result.özel_koşullar || [],
          hijyen_koşullar: result.hijyen_koşullar || [],
          servis_koşullar: result.servis_koşullar || [],
          sayfa_referansları: result.sayfa_referansları || []
        }
      }
      
      return {
        özel_koşullar: [],
        hijyen_koşullar: [], 
        servis_koşullar: [],
        sayfa_referansları: []
      }
    } catch (error) {
      console.error('Stage B hatası:', error)
      return {
        özel_koşullar: [],
        hijyen_koşullar: [],
        servis_koşullar: [],
        sayfa_referansları: []
      }
    }
  }

  // Stage C: Profil birleştirme
  private async runStageC(
    stageA: StageAResult, 
    stageB: StageBResult, 
    originalText: string
  ): Promise<StageCResult> {
    const prompt = await this.loadPrompt('prompt_stageC_profile.txt')
    const filledPrompt = prompt
      .replace('{stageA_output}', JSON.stringify(stageA))
      .replace('{stageB_output}', JSON.stringify(stageB))
      .replace('{original_text}', originalText.slice(0, 1000)) // İlk 1000 karakter

    try {
      const claudeService = new (await import('./claude')).ClaudeService()
      const response = await claudeService.generateRecipeAnalysis(filledPrompt)
      
      // JSON parse et - response'dan text çıkar  
      const responseText = JSON.stringify(response)
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        
        return {
          kurum: result.kurum || 'Bilinmeyen Kurum',
          kurumKodu: result.kurumKodu || '',
          menü_tipi: result.menü_tipi || 'Standart',
          ogunSayisi: result.ogunSayisi || 1,
          kisiSayisi: result.kisiSayisi || 100,
          porsiyon: result.porsiyon || {},
          özel_koşullar: result.özel_koşullar || [],
          hijyen_koşullar: result.hijyen_koşullar || [],
          servis_koşullar: result.servis_koşullar || [],
          maliyet_siniri: result.maliyet_siniri || {},
          teslim_koşullar: result.teslim_koşullar || {},
          güven: result.güven || 0.5
        }
      }
      
      throw new Error('JSON parse edilemedi')
    } catch (error) {
      console.error('Stage C hatası:', error)
      
      // Fallback profil
      return {
        kurum: 'Analiz Hatası',
        kurumKodu: 'ERR-001',
        menü_tipi: 'Belirsiz',
        ogunSayisi: 1,
        kisiSayisi: 100,
        porsiyon: { et: 100, sebze: 50, pirinc: 80 },
        özel_koşullar: [],
        hijyen_koşullar: [],
        servis_koşullar: [],
        maliyet_siniri: {},
        teslim_koşullar: {},
        güven: 0.2
      }
    }
  }

  // Stage D: Chunk birleştirme
  private async runStageD(chunks: StageCResult[]): Promise<StageDResult> {
    const prompt = await this.loadPrompt('prompt_stageD_merge.txt')
    const filledPrompt = prompt
      .replace('{chunk1}', JSON.stringify(chunks[0] || {}))
      .replace('{chunk2}', JSON.stringify(chunks[1] || {}))
      .replace('{chunk3}', JSON.stringify(chunks[2] || {}))
      .replace('{chunk4}', JSON.stringify(chunks[3] || {}))
      .replace('{chunk5}', JSON.stringify(chunks[4] || {}))

    try {
      const claudeService = new (await import('./claude')).ClaudeService()
      const response = await claudeService.generateRecipeAnalysis(filledPrompt)
      
      // JSON parse et - response'dan text çıkar
      const responseText = JSON.stringify(response)
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        
        return {
          ...result,
          güven_ortalaması: result.güven_ortalaması || 
            chunks.reduce((sum, c) => sum + c.güven, 0) / chunks.length,
          merge_notlari: result.merge_notlari || [`${chunks.length} chunk birleştirildi`]
        }
      }
      
      // Manuel birleştirme fallback
      return this.manualMergeChunks(chunks)
    } catch (error) {
      console.error('Stage D hatası:', error)
      return this.manualMergeChunks(chunks)
    }
  }

  // Stage E: Benzerlik analizi
  private async runStageE(
    newProfile: StageCResult | StageDResult, 
    existingProfiles: any[]
  ): Promise<StageEResult[]> {
    const prompt = await this.loadPrompt('prompt_stageE_similarity.txt')
    const filledPrompt = prompt
      .replace('{new_profile}', JSON.stringify(newProfile))
      .replace('{existing_profiles}', JSON.stringify(existingProfiles))

    try {
      const claudeService = new (await import('./claude')).ClaudeService()
      const response = await claudeService.generateRecipeAnalysis(filledPrompt)
      
      // JSON parse et - response'dan text çıkar
      const responseText = JSON.stringify(response)
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/)
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0])
        return results
      }
      
      return []
    } catch (error) {
      console.error('Stage E hatası:', error)
      return []
    }
  }

  // Yardımcı fonksiyonlar
  private async loadPrompt(fileName: string): Promise<string> {
    const filePath = path.join(this.promptsPath, fileName)
    return await fs.readFile(filePath, 'utf-8')
  }

  private chunkText(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = []
    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.slice(i, i + maxChunkSize))
    }
    return chunks
  }

  private manualMergeChunks(chunks: StageCResult[]): StageDResult {
    // En sık geçen kurum adı
    const kurumCount: Record<string, number> = {}
    chunks.forEach(c => {
      kurumCount[c.kurum] = (kurumCount[c.kurum] || 0) + 1
    })
    const kurum = Object.keys(kurumCount).reduce((a, b) => 
      kurumCount[a] > kurumCount[b] ? a : b
    )

    // Porsiyon ortalamaları
    const porsiyonKeys = new Set<string>()
    chunks.forEach(c => Object.keys(c.porsiyon).forEach(k => porsiyonKeys.add(k)))
    
    const porsiyon: Record<string, number> = {}
    porsiyonKeys.forEach(key => {
      const values = chunks
        .map(c => c.porsiyon[key])
        .filter(v => v != null && v > 0)
      
      if (values.length > 0) {
        porsiyon[key] = values.reduce((a, b) => a + b, 0) / values.length
      }
    })

    // Diğer alanları birleştir
    const allOzelKosullar = chunks.flatMap(c => c.özel_koşullar)
    const allHijyenKosullar = chunks.flatMap(c => c.hijyen_koşullar)  
    const allServisKosullar = chunks.flatMap(c => c.servis_koşullar)

    return {
      kurum,
      kurumKodu: chunks[0].kurumKodu,
      menü_tipi: chunks[0].menü_tipi,
      ogunSayisi: chunks[0].ogunSayisi,
      kisiSayisi: Math.round(chunks.reduce((sum, c) => sum + c.kisiSayisi, 0) / chunks.length),
      porsiyon,
      özel_koşullar: allOzelKosullar.filter((item, index) => allOzelKosullar.indexOf(item) === index),
      hijyen_koşullar: allHijyenKosullar.filter((item, index) => allHijyenKosullar.indexOf(item) === index),
      servis_koşullar: allServisKosullar.filter((item, index) => allServisKosullar.indexOf(item) === index),
      maliyet_siniri: chunks[0].maliyet_siniri,
      teslim_koşullar: chunks[0].teslim_koşullar,
      güven: chunks.reduce((sum, c) => sum + c.güven, 0) / chunks.length,
      güven_ortalaması: chunks.reduce((sum, c) => sum + c.güven, 0) / chunks.length,
      merge_notlari: [`${chunks.length} chunk manuel birleştirildi`]
    }
  }

  private convertToInstitutionProfile(
    result: StageCResult | StageDResult, 
    fileName: string
  ): InstitutionProfile {
    return {
      kurum: result.kurum,
      kurumKodu: result.kurumKodu,
      tarih: new Date(),
      porsiyon: {
        et: result.porsiyon.et || 100,
        tavuk: result.porsiyon.tavuk,
        sebze: result.porsiyon.sebze || 50,
        yag: result.porsiyon.yag || 15,
        tuz: result.porsiyon.tuz || 2,
        pirinc: result.porsiyon.pirinc,
        bulgur: result.porsiyon.bulgur,
        ekmek: result.porsiyon.ekmek
      },
      menuTipi: result.menü_tipi,
      ogunSayisi: result.ogunSayisi,
      kisiSayisi: result.kisiSayisi,
      ozelKosullar: result.özel_koşullar,
      hijyenKosullar: result.hijyen_koşullar,
      servisKosullar: result.servis_koşullar,
      maliyetSiniri: {
        minimum: result.maliyet_siniri.minimum,
        maksimum: result.maliyet_siniri.maksimum
      },
      teslimKosullar: {
        adres: result.teslim_koşullar.adres,
        sıklık: result.teslim_koşullar.sıklık
      },
      metadata: {
        processedAt: new Date(),
        confidence: result.güven,
        sourceFile: fileName
      }
    }
  }
}