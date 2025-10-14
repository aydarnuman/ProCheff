// 🧩 Tarif Adaptörü - Core Engine
// Şartname & Serbest Tarif modları ile profesyonel mutfak analizi

import { Product, ProductVariant, CostSimulationInput } from '../data/variantPricing'
import { CostSimulationEngine } from './variantPriceEngine'

// 🎯 Temel Veri Modelleri
export interface RecipeIngredient {
  id: string
  name: string
  category: string
  amount: number          // Tarif miktarı (gram/kişi)
  unit: 'gr' | 'kg' | 'adet' | 'lt' | 'ml'
  isRequired: boolean
  nutritionCategory?: 'protein' | 'carb' | 'fat' | 'vegetable' | 'dairy' | 'spice'
}

export interface SpecificationStandard {
  id: string
  institutionName: string // "MEB", "MSB", "Askeri Birim" vs
  category: string        // "Kırmızı Et", "Beyaz Et", "Tahıl" vs
  minGramPerPerson: number
  maxGramPerPerson?: number
  qualityRequirements: string[]
  complianceLevel: 'strict' | 'flexible' | 'guideline'
}

export interface Recipe {
  id: string
  name: string
  description: string
  servingCount: number    // Kaç kişilik tarif
  ingredients: RecipeIngredient[]
  preparationTime: number // dakika
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// 🔄 Adaptör Modları
export type AdapterMode = 'specification' | 'freeform'

export interface AdapterSettings {
  mode: AdapterMode
  targetServings: number
  selectedSpecification?: SpecificationStandard
  priceDataSource: 'latest' | 'average' | 'cheapest'
  includeAlternatives: boolean
}

// 📊 Analiz Sonuçları
export interface GramageCompliance {
  ingredientId: string
  ingredientName: string
  recipeGram: number
  specGram: number
  difference: number
  compliancePercent: number
  status: 'compliant' | 'insufficient' | 'excessive' | 'missing'
}

export interface CostBreakdown {
  ingredientId: string
  ingredientName: string
  unitPrice: number       // ₺/kg
  usedAmount: number      // kullanılan miktar (kg)
  totalCost: number       // toplam maliyet
  priceSource: string
  confidence: number
  lastUpdated: Date
}

export interface AdaptationResult {
  recipeId: string
  recipeName: string
  mode: AdapterMode
  originalServings: number
  targetServings: number
  scaleFactor: number
  
  // Gramaj Analizi
  gramageCompliance: GramageCompliance[]
  overallComplianceScore: number
  
  // Maliyet Analizi
  costBreakdown: CostBreakdown[]
  totalCostPerServing: number
  totalCostForTarget: number
  
  // KİK Uyumluluk
  kikCompliance?: {
    isCompliant: boolean
    kValue: number
    riskLevel: 'low' | 'medium' | 'high'
    explanation: string
  }
  
  // Uyarılar & Öneriler
  warnings: string[]
  suggestions: string[]
  
  // Metadata
  adaptedAt: Date
  confidence: number
}

/**
 * 🎛️ Tarif Adaptörü - Ana Motor
 */
export class RecipeAdapterEngine {
  
  /**
   * Tarifi seçilen moda göre adapte et
   */
  static async adaptRecipe(
    recipe: Recipe,
    settings: AdapterSettings,
    availableProducts: Product[]
  ): Promise<AdaptationResult> {
    
    const scaleFactor = settings.targetServings / recipe.servingCount
    
    // Mod bazlı işlem
    if (settings.mode === 'specification') {
      return this.adaptWithSpecification(recipe, settings, availableProducts, scaleFactor)
    } else {
      return this.adaptFreeform(recipe, settings, availableProducts, scaleFactor)
    }
  }

  /**
   * 🏛️ Şartname Modu - Kurumsal standartlara göre adaptasyon
   */
  private static async adaptWithSpecification(
    recipe: Recipe,
    settings: AdapterSettings,
    products: Product[],
    scaleFactor: number
  ): Promise<AdaptationResult> {
    
    if (!settings.selectedSpecification) {
      throw new Error('Şartname modu için şartname seçimi gerekli')
    }
    
    const spec = settings.selectedSpecification
    const gramageCompliance: GramageCompliance[] = []
    const costBreakdown: CostBreakdown[] = []
    const warnings: string[] = []
    const suggestions: string[] = []
    
    // Her malzeme için şartname uyum analizi
    for (const ingredient of recipe.ingredients) {
      const specStandard = await this.findSpecificationMatch(ingredient, spec)
      
      if (specStandard) {
        // Gramaj uyumunu değerlendir
        const compliance = this.calculateGramageCompliance(
          ingredient, 
          specStandard, 
          scaleFactor
        )
        gramageCompliance.push(compliance)
        
        // Uyum durumuna göre uyarı/öneri ekle
        if (compliance.status === 'insufficient') {
          warnings.push(
            `${ingredient.name} şartname gramajının %${(100 - compliance.compliancePercent).toFixed(1)} eksik`
          )
          suggestions.push(
            `${ingredient.name} için ${compliance.specGram}g/kişi kullanın (mevcut: ${compliance.recipeGram}g/kişi)`
          )
        }
        
        // Maliyet hesaplaması (şartname gramajı kullanılacak)
        const usedGram = Math.max(compliance.recipeGram, compliance.specGram)
        const cost = await this.calculateIngredientCost(
          ingredient, 
          usedGram, 
          settings.targetServings, 
          products,
          settings.priceDataSource
        )
        
        if (cost) {
          costBreakdown.push(cost)
        }
      } else {
        warnings.push(`${ingredient.name} için şartname karşılığı bulunamadı`)
      }
    }
    
    // Genel uyum skoru
    const overallCompliance = gramageCompliance.length > 0 
      ? gramageCompliance.reduce((sum, g) => sum + g.compliancePercent, 0) / gramageCompliance.length
      : 0
    
    // KİK uyumluluk değerlendirmesi
    const kikCompliance = this.evaluateKikCompliance(costBreakdown, overallCompliance)
    
    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      mode: settings.mode,
      originalServings: recipe.servingCount,
      targetServings: settings.targetServings,
      scaleFactor,
      gramageCompliance,
      overallComplianceScore: Number(overallCompliance.toFixed(1)),
      costBreakdown,
      totalCostPerServing: this.calculateTotalCostPerServing(costBreakdown, settings.targetServings),
      totalCostForTarget: costBreakdown.reduce((sum, c) => sum + c.totalCost, 0),
      kikCompliance,
      warnings,
      suggestions,
      adaptedAt: new Date(),
      confidence: this.calculateConfidence(gramageCompliance, costBreakdown)
    }
  }

  /**
   * 🍳 Serbest Tarif Modu - Orijinal tarife dayalı ölçekleme
   */
  private static async adaptFreeform(
    recipe: Recipe,
    settings: AdapterSettings,
    products: Product[],
    scaleFactor: number
  ): Promise<AdaptationResult> {
    
    const costBreakdown: CostBreakdown[] = []
    const warnings: string[] = []
    const suggestions: string[] = []
    
    // Her malzeme için serbest maliyet hesaplaması
    for (const ingredient of recipe.ingredients) {
      const scaledAmount = ingredient.amount * scaleFactor
      
      const cost = await this.calculateIngredientCost(
        ingredient,
        scaledAmount,
        settings.targetServings,
        products,
        settings.priceDataSource
      )
      
      if (cost) {
        costBreakdown.push(cost)
      } else {
        warnings.push(`${ingredient.name} için fiyat bilgisi bulunamadı`)
      }
    }
    
    // Serbest modda gramaj uyumu yok, sadece maliyet analizi
    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      mode: settings.mode,
      originalServings: recipe.servingCount,
      targetServings: settings.targetServings,
      scaleFactor,
      gramageCompliance: [], // Serbest modda gramaj analizi yok
      overallComplianceScore: 100, // Serbest modda her zaman uyumlu
      costBreakdown,
      totalCostPerServing: this.calculateTotalCostPerServing(costBreakdown, settings.targetServings),
      totalCostForTarget: costBreakdown.reduce((sum, c) => sum + c.totalCost, 0),
      warnings,
      suggestions,
      adaptedAt: new Date(),
      confidence: this.calculateConfidence([], costBreakdown)
    }
  }

  /**
   * 📏 Gramaj uyumluluğunu hesapla
   */
  private static calculateGramageCompliance(
    ingredient: RecipeIngredient,
    specGram: number,
    scaleFactor: number
  ): GramageCompliance {
    
    const scaledRecipeGram = ingredient.amount * scaleFactor
    const difference = scaledRecipeGram - specGram
    const compliancePercent = (scaledRecipeGram / specGram) * 100
    
    let status: GramageCompliance['status']
    if (compliancePercent >= 95 && compliancePercent <= 110) {
      status = 'compliant'
    } else if (compliancePercent < 95) {
      status = 'insufficient'
    } else {
      status = 'excessive'
    }
    
    return {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      recipeGram: Number(scaledRecipeGram.toFixed(1)),
      specGram: Number(specGram.toFixed(1)),
      difference: Number(difference.toFixed(1)),
      compliancePercent: Number(compliancePercent.toFixed(1)),
      status
    }
  }

  /**
   * 💰 Malzeme maliyet hesaplaması
   */
  private static async calculateIngredientCost(
    ingredient: RecipeIngredient,
    usedGramPerPerson: number,
    targetServings: number,
    products: Product[],
    priceSource: AdapterSettings['priceDataSource']
  ): Promise<CostBreakdown | null> {
    
    // Ürün eşleştirmesi (AI ile geliştirilebilir)
    const matchedProduct = this.findMatchingProduct(ingredient, products)
    
    if (!matchedProduct) return null
    
    // En uygun varyantı seç
    let selectedVariant: ProductVariant
    
    switch (priceSource) {
      case 'cheapest':
        const cheapest = matchedProduct.variants
          .filter(v => v.availability === 'available')
          .sort((a, b) => a.unitPrice - b.unitPrice)[0]
        selectedVariant = cheapest
        break
        
      case 'latest':
        selectedVariant = matchedProduct.variants
          .filter(v => v.availability === 'available')
          .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())[0]
        break
        
      default: // average
        const availableVariants = matchedProduct.variants.filter(v => v.availability === 'available')
        const avgPrice = availableVariants.reduce((sum, v) => sum + v.unitPrice, 0) / availableVariants.length
        selectedVariant = availableVariants.find(v => Math.abs(v.unitPrice - avgPrice) < 0.5) || availableVariants[0]
    }
    
    if (!selectedVariant) return null
    
    // Maliyet hesaplama
    const totalGramNeeded = usedGramPerPerson * targetServings
    const totalKgNeeded = totalGramNeeded / 1000
    const totalCost = selectedVariant.unitPrice * totalKgNeeded
    
    return {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      unitPrice: selectedVariant.unitPrice,
      usedAmount: Number(totalKgNeeded.toFixed(3)),
      totalCost: Number(totalCost.toFixed(2)),
      priceSource: `${selectedVariant.market}`,
      confidence: selectedVariant.priceSource.confidence,
      lastUpdated: selectedVariant.lastUpdated
    }
  }

  /**
   * 🎯 KİK uyumluluk değerlendirmesi
   */
  private static evaluateKikCompliance(
    costBreakdown: CostBreakdown[],
    gramageComplianceScore: number
  ) {
    const totalCost = costBreakdown.reduce((sum, c) => sum + c.totalCost, 0)
    const avgConfidence = costBreakdown.reduce((sum, c) => sum + c.confidence, 0) / costBreakdown.length
    
    // K değeri hesaplama (0.93 sınır değeri)
    const kValue = (gramageComplianceScore / 100) * avgConfidence
    
    let riskLevel: 'low' | 'medium' | 'high'
    let explanation: string
    
    if (kValue >= 0.93) {
      riskLevel = 'low'
      explanation = 'İhale şartnamelerine tam uyumlu, güvenli teklif aralığı'
    } else if (kValue >= 0.85) {
      riskLevel = 'medium'
      explanation = 'Şartname uyumu orta seviye, dikkatli teklif gerekir'
    } else {
      riskLevel = 'high'
      explanation = 'Şartname uyumu yetersiz, yüksek ret riski'
    }
    
    return {
      isCompliant: kValue >= 0.93,
      kValue: Number(kValue.toFixed(3)),
      riskLevel,
      explanation
    }
  }

  // Utility Methods
  private static calculateTotalCostPerServing(breakdown: CostBreakdown[], servings: number): number {
    return breakdown.reduce((sum, c) => sum + c.totalCost, 0) / servings
  }

  private static calculateConfidence(gramage: GramageCompliance[], cost: CostBreakdown[]): number {
    const gramageConf = gramage.length > 0 ? gramage.filter(g => g.status === 'compliant').length / gramage.length : 1
    const costConf = cost.length > 0 ? cost.reduce((sum, c) => sum + c.confidence, 0) / cost.length : 0
    return Number(((gramageConf + costConf) / 2).toFixed(2))
  }

  private static async findSpecificationMatch(ingredient: RecipeIngredient, spec: SpecificationStandard): Promise<number | null> {
    // Basit kategori eşleştirmesi (AI ile geliştirilebilir)
    if (ingredient.nutritionCategory === 'protein' && spec.category.includes('Et')) {
      return spec.minGramPerPerson
    }
    // Diğer kategori eşleştirmeleri...
    return null
  }

  private static findMatchingProduct(ingredient: RecipeIngredient, products: Product[]): Product | null {
    // Basit isim eşleştirmesi (AI ile geliştirilebilir)
    return products.find(p => 
      p.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
      ingredient.name.toLowerCase().includes(p.name.toLowerCase())
    ) || null
  }
}

/**
 * 🧠 AI Entegrasyon Katmanı
 */
export class RecipeAIProcessor {
  
  /**
   * Şartname PDF'inden gramaj tablosu çıkarımı
   */
  static async extractSpecificationFromPDF(pdfContent: string): Promise<SpecificationStandard[]> {
    // AI implementasyonu burada olacak
    // Şimdilik mock data döndür
    return [
      {
        id: 'meb-standard',
        institutionName: 'MEB',
        category: 'Kırmızı Et',
        minGramPerPerson: 120,
        maxGramPerPerson: 150,
        qualityRequirements: ['Dana eti', 'Yağsız', 'Taze'],
        complianceLevel: 'strict'
      }
    ]
  }

  /**
   * Malzeme kategori tanıma
   */
  static async categorizeIngredient(ingredientName: string): Promise<RecipeIngredient['nutritionCategory']> {
    // AI kategori tanıma burada olacak
    const proteinKeywords = ['et', 'dana', 'kuzu', 'tavuk', 'balık']
    const carbKeywords = ['pirinç', 'makarna', 'bulgur', 'ekmek']
    
    const name = ingredientName.toLowerCase()
    
    if (proteinKeywords.some(keyword => name.includes(keyword))) {
      return 'protein'
    }
    if (carbKeywords.some(keyword => name.includes(keyword))) {
      return 'carb'
    }
    
    return undefined
  }

  /**
   * Ürün ismi normalizasyonu
   */
  static normalizeProductName(productName: string): string {
    return productName
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .trim()
  }
}