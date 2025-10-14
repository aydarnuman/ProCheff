// lib/services/proposalGenerator.ts

import { InstitutionProfile, SpecificationParser } from './specParser'
import { CostSimulator, OptimizationRequest, CostCalculation, RequiredIngredient } from './costSimulator'
import { RecipeAdapter, Recipe, AdaptedRecipe, AdaptationRequest } from './recipeAdapter'

export interface ProposalRequest {
  institutionProfile: InstitutionProfile
  selectedRecipes: string[] // Recipe ID'leri
  proposalSettings: {
    profitMargin: number // %
    validityDays: number
    deliveryTerms: string
    paymentTerms: string
    specialNotes?: string
  }
  customizations: {
    prioritizeLocalSuppliers: boolean
    organicPreference: boolean
    seasonalMenu: boolean
  }
}

export interface GeneratedProposal {
  id: string
  institutionName: string
  generatedAt: Date
  validUntil: Date
  
  // Özet veriler
  summary: {
    totalMenuItems: number
    totalServings: number
    totalCost: number
    profitMargin: number
    finalPrice: number
    costPerPortion: number
  }

  // Detaylı bölümler
  specification: {
    originalFile?: string
    extractedRequirements: InstitutionProfile
    complianceScore: number
  }

  menuPlan: {
    adaptedRecipes: AdaptedRecipe[]
    nutritionSummary: {
      avgCaloriesPerMeal: number
      avgProteinPerMeal: number
      avgCarbsPerMeal: number
      avgFatPerMeal: number
    }
  }

  costBreakdown: {
    calculation: CostCalculation
    supplierDetails: {
      supplierId: string
      supplierName: string
      totalAmount: number
      deliveryCost: number
      reliability: number
    }[]
    riskAssessment: {
      marketVolatility: 'low' | 'medium' | 'high'
      seasonalRisk: 'low' | 'medium' | 'high'
      supplierRisk: 'low' | 'medium' | 'high'
      overallRisk: 'low' | 'medium' | 'high'
    }
  }

  // Export formatları
  exports: {
    excel: string // Base64 veya dosya yolu
    pdf: string
    json: string
  }

  // AI önerileri
  aiRecommendations: {
    costOptimizations: string[]
    menuImprovements: string[]
    riskMitigations: string[]
    competitiveAdvantages: string[]
  }

  // Meta veriler
  metadata: {
    processingTime: number // millisecond
    aiConfidence: number // 0-1
    generatedBy: 'auto' | 'manual'
    version: string
  }
}

export interface ProposalTemplate {
  id: string
  name: string
  description: string
  sections: {
    coverPage: boolean
    executiveSummary: boolean
    technicalSpecs: boolean
    menuDetails: boolean
    costBreakdown: boolean
    supplierInfo: boolean
    timeline: boolean
    terms: boolean
  }
  styling: {
    theme: 'corporate' | 'modern' | 'classic'
    primaryColor: string
    logoUrl?: string
  }
}

/**
 * 📊 Teklif Üretici - Ana Orchestrator
 * 
 * Üç modülün çıktısını birleştirip tam otomatik teklif oluşturur.
 * Şartname → Tarif → Maliyet → Hazır Teklif
 */
export class ProposalGenerator {
  private specParser: SpecificationParser
  private costSimulator: CostSimulator  
  private recipeAdapter: RecipeAdapter
  
  constructor() {
    this.specParser = new SpecificationParser()
    this.costSimulator = new CostSimulator()
    this.recipeAdapter = new RecipeAdapter()
  }

  /**
   * 🎯 Master fonksiyon - Tam otomatik teklif üretimi
   */
  async generateCompleteProposal(request: ProposalRequest): Promise<GeneratedProposal> {
    const startTime = Date.now()
    
    try {
      console.log('🚀 Otomatik teklif üretimi başladı...')

      // 1️⃣ Kurum profilini hazırla (zaten mevcut)
      const institutionProfile = request.institutionProfile
      
      // 2️⃣ Uygun tarifleri bul ve adapte et
      console.log('🍽️ Tarifleri adapte ediyor...')
      const adaptedRecipes = await this.adaptRecipesForInstitution(
        request.selectedRecipes, 
        institutionProfile
      )

      // 3️⃣ Her tarif için maliyet hesapla
      console.log('💰 Maliyetleri hesaplıyor...')
      const costCalculation = await this.calculateTotalCost(
        adaptedRecipes, 
        institutionProfile, 
        request.proposalSettings
      )

      // 4️⃣ Risk analizi yap
      console.log('⚠️ Riskleri analiz ediyor...')
      const riskAssessment = await this.assessRisks(costCalculation, institutionProfile)

      // 5️⃣ AI önerileri oluştur
      console.log('🤖 AI önerileri oluşturuluyor...')
      const aiRecommendations = await this.generateAIRecommendations(
        institutionProfile, 
        adaptedRecipes, 
        costCalculation
      )

      // 6️⃣ Beslenme özeti hesapla
      const nutritionSummary = this.calculateNutritionSummary(adaptedRecipes)

      // 7️⃣ Tedarikçi detaylarını topla
      const supplierDetails = this.extractSupplierDetails(costCalculation)

      // 8️⃣ Teklif objesini oluştur
      const proposal: GeneratedProposal = {
        id: `PROP-${Date.now()}`,
        institutionName: institutionProfile.kurum,
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + request.proposalSettings.validityDays * 24 * 60 * 60 * 1000),
        
        summary: {
          totalMenuItems: adaptedRecipes.length,
          totalServings: institutionProfile.kisiSayisi || 0,
          totalCost: costCalculation.totalCost,
          profitMargin: request.proposalSettings.profitMargin,
          finalPrice: costCalculation.finalPrice,
          costPerPortion: costCalculation.costPerPortion
        },

        specification: {
          extractedRequirements: institutionProfile,
          complianceScore: this.calculateComplianceScore(institutionProfile, adaptedRecipes)
        },

        menuPlan: {
          adaptedRecipes,
          nutritionSummary
        },

        costBreakdown: {
          calculation: costCalculation,
          supplierDetails,
          riskAssessment
        },

        exports: {
          excel: '', // Daha sonra doldurulacak
          pdf: '',
          json: JSON.stringify({
            institution: institutionProfile.kurum,
            totalCost: costCalculation.totalCost,
            finalPrice: costCalculation.finalPrice,
            recipes: adaptedRecipes.map(r => ({ name: r.name, cost: r.cost }))
          }, null, 2)
        },

        aiRecommendations,

        metadata: {
          processingTime: Date.now() - startTime,
          aiConfidence: this.calculateOverallConfidence(costCalculation, adaptedRecipes),
          generatedBy: 'auto',
          version: '1.0'
        }
      }

      console.log('✅ Teklif başarıyla oluşturuldu!')
      return proposal

    } catch (error) {
      throw new Error(`Teklif üretimi başarısız: ${error}`)
    }
  }

  /**
   * 🍽️ Tarifleri kuruma göre adapte et
   */
  private async adaptRecipesForInstitution(
    recipeIds: string[], 
    profile: InstitutionProfile
  ): Promise<AdaptedRecipe[]> {
    
    const adaptedRecipes: AdaptedRecipe[] = []
    
    // Önce mevcut tarifleri al
    const availableRecipes = await this.recipeAdapter.findSuitableRecipes(profile)
    
    for (const recipeId of recipeIds) {
      const baseRecipe = availableRecipes.find(r => r.id === recipeId)
      if (!baseRecipe) continue

      const request: AdaptationRequest = {
        baseRecipe,
        targetProfile: profile,
        adaptationGoals: {
          maintainNutrition: true,
          optimizeCost: true,
          respectPortion: true,
          maintainTaste: true
        },
        constraints: {
          maxBudgetPerServing: profile.maliyetSiniri?.maksimum
        }
      }

      const adapted = await this.recipeAdapter.adaptRecipe(request)
      adaptedRecipes.push(adapted)
    }

    return adaptedRecipes
  }

  /**
   * 💰 Toplam maliyet hesaplama
   */
  private async calculateTotalCost(
    recipes: AdaptedRecipe[], 
    profile: InstitutionProfile, 
    settings: ProposalRequest['proposalSettings']
  ): Promise<CostCalculation> {
    
    // Tüm tariflerdeki malzemeleri birleştir
    const allIngredients: RequiredIngredient[] = []
    
    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients) {
        const existing = allIngredients.find(ing => 
          ing.name === ingredient.name && ing.category === ingredient.category
        )
        
        if (existing) {
          existing.quantity += ingredient.amount
        } else {
          allIngredients.push({
            name: ingredient.name,
            category: ingredient.category,
            quantity: ingredient.amount,
            alternatives: ingredient.alternatives || [],
            priority: ingredient.optional ? 'optional' : 'essential'
          })
        }
      }
    }

    // Maliyet simülasyonunu çalıştır
    const request: OptimizationRequest = {
      ingredients: allIngredients,
      portionCount: profile.kisiSayisi || 100,
      targetProfitMargin: settings.profitMargin,
      maxBudgetPerPortion: profile.maliyetSiniri?.maksimum,
      qualityPreference: 'standard',
      specialRequirements: {
        organic: profile.ozelKosullar.includes('Organik'),
        halal: profile.ozelKosullar.includes('Helal sertifikalı'),
        local: false,
        certified: profile.hijyenKosullar.length > 0
      },
      batchSize: this.determineBatchSize(profile.kisiSayisi || 100)
    }

    return await this.costSimulator.optimizeCost(request)
  }

  /**
   * ⚠️ Risk değerlendirmesi
   */
  private async assessRisks(
    calculation: CostCalculation, 
    profile: InstitutionProfile
  ): Promise<GeneratedProposal['costBreakdown']['riskAssessment']> {
    
    // Basit risk skorlama
    let marketRisk: 'low' | 'medium' | 'high' = 'low'
    let seasonalRisk: 'low' | 'medium' | 'high' = 'low'
    let supplierRisk: 'low' | 'medium' | 'high' = 'low'

    // Tedarikçi sayısına göre risk
    if (calculation.suppliers.length === 1) {
      supplierRisk = 'high'
    } else if (calculation.suppliers.length === 2) {
      supplierRisk = 'medium'
    }

    // Güven skoruna göre pazar riski
    if (calculation.confidence < 0.7) {
      marketRisk = 'high'
    } else if (calculation.confidence < 0.85) {
      marketRisk = 'medium'
    }

    // Mevsimsel risk (basit)
    const currentMonth = new Date().getMonth()
    if ([11, 0, 1].includes(currentMonth)) { // Kış ayları
      seasonalRisk = 'medium'
    }

    // Genel risk
    const riskScores = { low: 1, medium: 2, high: 3 }
    const avgRisk = (riskScores[marketRisk] + riskScores[seasonalRisk] + riskScores[supplierRisk]) / 3
    const overallRisk = avgRisk <= 1.5 ? 'low' : avgRisk <= 2.5 ? 'medium' : 'high'

    return {
      marketVolatility: marketRisk,
      seasonalRisk,
      supplierRisk,
      overallRisk
    }
  }

  /**
   * 🤖 AI önerileri oluştur
   */
  private async generateAIRecommendations(
    profile: InstitutionProfile,
    recipes: AdaptedRecipe[],
    calculation: CostCalculation
  ): Promise<GeneratedProposal['aiRecommendations']> {
    
    // Simulated AI recommendations - gerçekte Claude/Gemini kullanılacak
    const recommendations = {
      costOptimizations: [
        `Tedarikçi konsolidasyonu ile %${Math.round(Math.random() * 10 + 5)} tasarruf sağlanabilir`,
        'Mevsimsel ürünlere odaklanarak maliyet düşürülebilir',
        `Toplu sipariş indirimleri ile %${Math.round(Math.random() * 8 + 3)} indirim kazanılabilir`
      ],
      menuImprovements: [
        'Protein çeşitliliği artırılarak beslenme değeri yükseltilebilir',
        'Yerel ürünler tercih edilerek tazelik sağlanabilir',
        'Porsiyonlar kurum profiline %95 uygunlukta'
      ],
      riskMitigations: [
        calculation.suppliers.length < 2 ? 'Alternatif tedarikçi opsiyonu eklenmelidir' : 'Tedarikçi çeşitliliği yeterli',
        'Fiyat dalgalanmalarına karşı %10 buffer eklenmesi önerilir',
        'Sözleşmede fiyat sabitleme klauzü eklenebilir'
      ],
      competitiveAdvantages: [
        `%${calculation.confidence * 100} AI güven skoru ile yüksek kalite garantisi`,
        'Otomatik uyarlama ile hızlı teslimat süresi',
        'Şartname uyumluluğu tam otomatik kontrol'
      ]
    }

    return recommendations
  }

  /**
   * Helper metodları
   */
  private calculateNutritionSummary(recipes: AdaptedRecipe[]) {
    const totalCalories = recipes.reduce((sum, r) => sum + r.nutrition.perServing.calories, 0)
    const totalProtein = recipes.reduce((sum, r) => sum + r.nutrition.perServing.protein, 0)
    const totalCarbs = recipes.reduce((sum, r) => sum + r.nutrition.perServing.carbs, 0)
    const totalFat = recipes.reduce((sum, r) => sum + r.nutrition.perServing.fat, 0)
    const mealCount = recipes.length

    return {
      avgCaloriesPerMeal: totalCalories / mealCount,
      avgProteinPerMeal: totalProtein / mealCount,
      avgCarbsPerMeal: totalCarbs / mealCount,
      avgFatPerMeal: totalFat / mealCount
    }
  }

  private extractSupplierDetails(calculation: CostCalculation) {
    return calculation.suppliers.map(supplier => ({
      supplierId: supplier.supplier.id,
      supplierName: supplier.supplier.name,
      totalAmount: supplier.totalCost,
      deliveryCost: supplier.deliveryCost,
      reliability: supplier.reliabilityScore
    }))
  }

  private calculateComplianceScore(profile: InstitutionProfile, recipes: AdaptedRecipe[]): number {
    let score = 0.8 // Base score

    // Gramaj uyumu kontrolü
    const hasEt = recipes.some(r => r.ingredients.some(ing => ing.category === 'et'))
    const hasSebze = recipes.some(r => r.ingredients.some(ing => ing.category === 'sebze'))
    
    if (hasEt && profile.porsiyon.et) score += 0.1
    if (hasSebze && profile.porsiyon.sebze) score += 0.1

    // Özel koşul uyumu
    if (profile.ozelKosullar.includes('Helal sertifikalı')) {
      const allHalal = recipes.every(r => r.restrictions?.halal !== false)
      if (allHalal) score += 0.05
    }

    return Math.min(1.0, score)
  }

  private calculateOverallConfidence(calculation: CostCalculation, recipes: AdaptedRecipe[]): number {
    const costConfidence = calculation.confidence
    const recipeConfidences = recipes.map(r => r.adaptationInfo.confidence)
    const avgRecipeConfidence = recipeConfidences.reduce((a, b) => a + b, 0) / recipeConfidences.length

    return (costConfidence + avgRecipeConfidence) / 2
  }

  private determineBatchSize(personCount: number): 'small' | 'medium' | 'large' {
    if (personCount <= 500) return 'small'
    if (personCount <= 2000) return 'medium'
    return 'large'
  }

  /**
   * 📁 Teklifi dosya sistemi için kaydetme
   */
  async saveProposal(proposal: GeneratedProposal, format: 'json' | 'summary' = 'json'): Promise<string> {
    const filename = `proposal_${proposal.id}_${proposal.institutionName.replace(/\s+/g, '_')}.${format}`
    
    if (format === 'json') {
      return JSON.stringify(proposal, null, 2)
    } else {
      // Summary format
      return `
TEKLIF ÖZETI
============
Kurum: ${proposal.institutionName}
Tarih: ${proposal.generatedAt.toLocaleDateString('tr-TR')}
Geçerlilik: ${proposal.validUntil.toLocaleDateString('tr-TR')}

MALIYET ÖZETI:
- Toplam Maliyet: ₺${proposal.summary.totalCost.toFixed(2)}
- Kar Marjı: %${proposal.summary.profitMargin}
- Satış Fiyatı: ₺${proposal.summary.finalPrice.toFixed(2)}
- Porsiyon Başı: ₺${proposal.summary.costPerPortion.toFixed(2)}

MENÜ:
${proposal.menuPlan.adaptedRecipes.map(r => `- ${r.name} (${r.servings} porsiyon)`).join('\n')}

AI GÜVENİLİRLİK: %${Math.round(proposal.metadata.aiConfidence * 100)}
İŞLEM SÜRESİ: ${proposal.metadata.processingTime}ms
      `.trim()
    }
  }
}