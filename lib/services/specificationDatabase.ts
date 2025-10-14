import fs from 'fs/promises'
import path from 'path'
import { InstitutionProfile } from './specParser'

// Şartname veritabanı profil yapısı
export interface SpecificationRecord {
  id: string
  fileName: string
  uploadDate: Date
  institutionProfile: InstitutionProfile
  tags: {
    region: string          // Bölge (Ankara, İstanbul, Afyon)
    institutionType: string // Kurum tipi (Üniversite, Hastane, Okul)
    personCount: number     // Kişi sayısı kategorisi
    gramajCategory: string  // Gramaj profil kategorisi
  }
  fingerprint: SpecificationFingerprint
  metadata: {
    processingVersion: string
    confidence: number
    sourceHash: string
  }
}

// Şartname parmak izi - benzerlik analizi için
export interface SpecificationFingerprint {
  gramajVector: number[]     // Normalized gramaj değerleri [et, tavuk, sebze, yağ, ...]
  requirementVector: number[] // Requirements encoding [helal, organik, sıcak, ...]
  institutionVector: number[] // Institution type encoding
  complexityScore: number     // Şartname karmaşıklık skoru
}

// Benzerlik analizi sonucu
export interface SimilarityResult {
  record: SpecificationRecord
  similarity: number         // 0-1 arası benzerlik skoru
  matchReasons: string[]     // Benzerlik sebepleri
  differences: string[]      // Farklar
}

// AI analiz sonucu
export interface ProfileComparison {
  targetProfile: InstitutionProfile
  similarProfiles: SimilarityResult[]
  aiInsights: {
    bestMatch: string
    confidenceLevel: number
    recommendations: string[]
    riskFactors: string[]
  }
}

export class SpecificationDatabase {
  private dataPath: string
  private profilesPath: string

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'specifications')
    this.profilesPath = path.join(process.cwd(), 'data', 'profiles')
  }

  // Yeni şartname kaydı ekleme
  async addSpecification(
    fileName: string,
    profile: InstitutionProfile,
    sourceContent?: string
  ): Promise<SpecificationRecord> {
    const id = this.generateSpecId()
    
    const tags = this.extractTags(profile)
    const fingerprint = await this.createFingerprint(profile)
    
    const record: SpecificationRecord = {
      id,
      fileName,
      uploadDate: new Date(),
      institutionProfile: profile,
      tags,
      fingerprint,
      metadata: {
        processingVersion: '1.0.0',
        confidence: profile.metadata.confidence,
        sourceHash: sourceContent ? this.hashContent(sourceContent) : ''
      }
    }

    // Kayıt dosyasına yaz
    await this.saveRecord(record)
    
    return record
  }

  // Benzer şartnameleri bulma
  async findSimilarSpecifications(
    targetProfile: InstitutionProfile,
    limit: number = 5
  ): Promise<SimilarityResult[]> {
    const allRecords = await this.loadAllRecords()
    const targetFingerprint = await this.createFingerprint(targetProfile)
    
    const similarities: SimilarityResult[] = []
    
    for (const record of allRecords) {
      const similarity = this.calculateSimilarity(targetFingerprint, record.fingerprint)
      
      if (similarity > 0.3) { // Minimum %30 benzerlik
        const matchReasons = this.analyzeMatchReasons(targetProfile, record.institutionProfile)
        const differences = this.analyzeDifferences(targetProfile, record.institutionProfile)
        
        similarities.push({
          record,
          similarity,
          matchReasons,
          differences
        })
      }
    }

    // Benzerlik skoruna göre sırala ve limit uygula
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  // AI ile gelişmiş profil karşılaştırması
  async compareProfilesWithAI(targetProfile: InstitutionProfile): Promise<ProfileComparison> {
    const similarProfiles = await this.findSimilarSpecifications(targetProfile, 10)
    
    if (similarProfiles.length === 0) {
      return {
        targetProfile,
        similarProfiles: [],
        aiInsights: {
          bestMatch: 'Benzer profil bulunamadı',
          confidenceLevel: 0,
          recommendations: ['İlk şartname kaydı olarak veritabanına eklenecek'],
          riskFactors: ['Referans veri yok - dikkatli değerlendirin']
        }
      }
    }

    // Claude AI ile detaylı analiz
    const aiInsights = await this.generateAIInsights(targetProfile, similarProfiles)
    
    return {
      targetProfile,
      similarProfiles,
      aiInsights
    }
  }

  // Şartname parmak izi oluşturma
  private async createFingerprint(profile: InstitutionProfile): Promise<SpecificationFingerprint> {
    // Gramaj vektörü (normalize edilmiş)
    const gramajVector = [
      profile.porsiyon.et / 200,                    // Max 200g varsayımı ile normalize
      (profile.porsiyon.tavuk || 0) / 200,
      profile.porsiyon.sebze / 100,                 // Max 100g
      profile.porsiyon.yag / 30,                    // Max 30g
      profile.porsiyon.tuz / 5,                     // Max 5g
      (profile.porsiyon.pirinc || 0) / 100,         // Max 100g
      (profile.porsiyon.bulgur || 0) / 100,
      (profile.porsiyon.ekmek || 0) / 150           // Max 150g
    ].map(x => Math.min(x, 1)) // 0-1 arasında sınırla

    // Gereksinim vektörü
    const requirements = profile.ozelKosullar || []
    const requirementVector = [
      requirements.includes('Helal sertifikalı') ? 1 : 0,
      requirements.includes('Organik') ? 1 : 0,
      requirements.includes('Sıcak servis') ? 1 : 0,
      requirements.includes('Sertifikalı tedarikçi') ? 1 : 0,
      requirements.includes('Yerel üretim') ? 1 : 0
    ]

    // Kurum tipi vektörü
    const institutionVector = [
      profile.kurum.toLowerCase().includes('üniversite') ? 1 : 0,
      profile.kurum.toLowerCase().includes('hastane') ? 1 : 0,
      profile.kurum.toLowerCase().includes('okul') ? 1 : 0,
      profile.kurum.toLowerCase().includes('pmyo') ? 1 : 0
    ]

    // Karmaşıklık skoru
    const complexityScore = (
      (profile.ogunSayisi || 1) * 0.2 +
      Math.log(profile.kisiSayisi || 100) * 0.3 +
      (profile.ozelKosullar?.length || 0) * 0.1 +
      (profile.hijyenKosullar?.length || 0) * 0.1
    ) / 4

    return {
      gramajVector,
      requirementVector,
      institutionVector,
      complexityScore
    }
  }

  // Benzerlik skorunu hesaplama (cosine similarity)
  private calculateSimilarity(
    fingerprint1: SpecificationFingerprint,
    fingerprint2: SpecificationFingerprint
  ): number {
    const similarity1 = this.cosineSimilarity(fingerprint1.gramajVector, fingerprint2.gramajVector)
    const similarity2 = this.cosineSimilarity(fingerprint1.requirementVector, fingerprint2.requirementVector)
    const similarity3 = this.cosineSimilarity(fingerprint1.institutionVector, fingerprint2.institutionVector)
    
    // Ağırlıklı ortalama
    return (similarity1 * 0.5 + similarity2 * 0.3 + similarity3 * 0.2)
  }

  // Cosine similarity hesaplama
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0
    return dotProduct / (magnitudeA * magnitudeB)
  }

  // Etiketleri çıkarma
  private extractTags(profile: InstitutionProfile): SpecificationRecord['tags'] {
    const kurum = profile.kurum.toLowerCase()
    
    // Bölge çıkarımı
    let region = 'Diğer'
    if (kurum.includes('ankara')) region = 'Ankara'
    else if (kurum.includes('istanbul')) region = 'İstanbul'
    else if (kurum.includes('afyon')) region = 'Afyon'
    else if (kurum.includes('izmir')) region = 'İzmir'

    // Kurum tipi
    let institutionType = 'Diğer'
    if (kurum.includes('üniversite')) institutionType = 'Üniversite'
    else if (kurum.includes('hastane')) institutionType = 'Hastane'
    else if (kurum.includes('okul')) institutionType = 'Okul'
    else if (kurum.includes('pmyo')) institutionType = 'MYO'

    // Gramaj kategorisi
    const etGramaj = profile.porsiyon.et
    let gramajCategory = 'Orta'
    if (etGramaj < 80) gramajCategory = 'Düşük'
    else if (etGramaj > 150) gramajCategory = 'Yüksek'

    return {
      region,
      institutionType,
      personCount: profile.kisiSayisi || 0,
      gramajCategory
    }
  }

  // Benzerlik sebeplerini analiz etme
  private analyzeMatchReasons(profile1: InstitutionProfile, profile2: InstitutionProfile): string[] {
    const reasons: string[] = []
    
    // Gramaj benzerliği
    const etFark = Math.abs(profile1.porsiyon.et - profile2.porsiyon.et)
    if (etFark < 20) reasons.push(`Et gramajı benzer (${profile1.porsiyon.et}g ≈ ${profile2.porsiyon.et}g)`)
    
    // Kişi sayısı benzerliği
    const kisi1 = profile1.kisiSayisi || 0
    const kisi2 = profile2.kisiSayisi || 0
    const kisiOrani = Math.min(kisi1, kisi2) / Math.max(kisi1, kisi2)
    if (kisiOrani > 0.7) reasons.push(`Benzer kişi sayısı (${kisi1} ≈ ${kisi2})`)
    
    // Özel koşul benzerliği
    const ortakKosullar = (profile1.ozelKosullar || []).filter(k => 
      (profile2.ozelKosullar || []).includes(k)
    )
    if (ortakKosullar.length > 0) {
      reasons.push(`Ortak koşullar: ${ortakKosullar.join(', ')}`)
    }

    return reasons
  }

  // Farkları analiz etme
  private analyzeDifferences(profile1: InstitutionProfile, profile2: InstitutionProfile): string[] {
    const differences: string[] = []
    
    // Gramaj farkları
    const etFark = Math.abs(profile1.porsiyon.et - profile2.porsiyon.et)
    if (etFark > 30) {
      differences.push(`Et gramajı farkı: ${etFark}g`)
    }

    // Maliyet farkı
    if (profile1.maliyetSiniri?.maksimum && profile2.maliyetSiniri?.maksimum) {
      const maliyetFark = Math.abs(profile1.maliyetSiniri.maksimum - profile2.maliyetSiniri.maksimum)
      if (maliyetFark > 5) {
        differences.push(`Maliyet farkı: ₺${maliyetFark.toFixed(2)}`)
      }
    }

    return differences
  }

  // AI insights üretme
  private async generateAIInsights(
    targetProfile: InstitutionProfile,
    similarProfiles: SimilarityResult[]
  ): Promise<ProfileComparison['aiInsights']> {
    const bestMatch = similarProfiles[0]
    const confidenceLevel = bestMatch.similarity

    const recommendations: string[] = []
    const riskFactors: string[] = []

    // En iyi match analizi
    if (confidenceLevel > 0.8) {
      recommendations.push(`%${Math.round(confidenceLevel * 100)} benzerlikle ${bestMatch.record.institutionProfile.kurum} profilini referans alabilirsiniz`)
    } else if (confidenceLevel > 0.6) {
      recommendations.push(`Orta benzerlik (%${Math.round(confidenceLevel * 100)}) - dikkatli adaptasyon önerilir`)
    }

    // Risk faktörleri
    if (similarProfiles.length < 3) {
      riskFactors.push('Az sayıda benzer profil - referans verisi sınırlı')
    }

    const avgPersonCount = similarProfiles.reduce((sum, p) => sum + (p.record.institutionProfile.kisiSayisi || 0), 0) / similarProfiles.length
    if (Math.abs((targetProfile.kisiSayisi || 0) - avgPersonCount) > 200) {
      riskFactors.push('Kişi sayısı ortalamayla önemli fark gösteriyor')
    }

    return {
      bestMatch: `${Math.round(confidenceLevel * 100)}% ${bestMatch.record.institutionProfile.kurum}`,
      confidenceLevel,
      recommendations: recommendations.length > 0 ? recommendations : ['Genel best practices kullanın'],
      riskFactors: riskFactors.length > 0 ? riskFactors : ['Düşük risk profili']
    }
  }

  // Yardımcı fonksiyonlar
  private generateSpecId(): string {
    return `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private hashContent(content: string): string {
    return Buffer.from(content).toString('base64').slice(0, 32)
  }

  private async saveRecord(record: SpecificationRecord): Promise<void> {
    try {
      await fs.mkdir(this.dataPath, { recursive: true })
      const filePath = path.join(this.dataPath, `${record.id}.json`)
      await fs.writeFile(filePath, JSON.stringify(record, null, 2))
    } catch (error) {
      console.error('Kayıt hatası:', error)
      throw new Error('Şartname kaydı başarısız')
    }
  }

  private async loadAllRecords(): Promise<SpecificationRecord[]> {
    try {
      const files = await fs.readdir(this.dataPath)
      const jsonFiles = files.filter(f => f.endsWith('.json'))
      
      const records: SpecificationRecord[] = []
      for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(this.dataPath, file), 'utf-8')
        const record = JSON.parse(content) as SpecificationRecord
        // Date nesnelerini restore et
        record.uploadDate = new Date(record.uploadDate)
        record.institutionProfile.tarih = new Date(record.institutionProfile.tarih)
        records.push(record)
      }
      
      return records
    } catch (error) {
      console.log('Henüz kayıtlı şartname yok')
      return []
    }
  }

  // İstatistikler
  async getStatistics(): Promise<{
    totalRecords: number
    byRegion: Record<string, number>
    byInstitutionType: Record<string, number>
    averagePersonCount: number
    latestUpload: Date | null
  }> {
    const records = await this.loadAllRecords()
    
    const byRegion: Record<string, number> = {}
    const byInstitutionType: Record<string, number> = {}
    let totalPersons = 0
    let latestUpload: Date | null = null

    for (const record of records) {
      byRegion[record.tags.region] = (byRegion[record.tags.region] || 0) + 1
      byInstitutionType[record.tags.institutionType] = (byInstitutionType[record.tags.institutionType] || 0) + 1
      totalPersons += record.tags.personCount
      
      if (!latestUpload || record.uploadDate > latestUpload) {
        latestUpload = record.uploadDate
      }
    }

    return {
      totalRecords: records.length,
      byRegion,
      byInstitutionType,
      averagePersonCount: records.length > 0 ? totalPersons / records.length : 0,
      latestUpload
    }
  }
}