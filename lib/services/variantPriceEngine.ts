// 🧮 Birim Fiyat Hesaplama ve Varyant Optimizasyon Algoritmaları
// İhale analizi için profesyonel seviye fiyat karşılaştırma

import { 
  Product, 
  ProductVariant, 
  ProductComparison, 
  CostSimulationInput,
  CostSimulationResult,
  PriceAnalytics 
} from '../data/variantPricing'

/**
 * 🎯 Ana Birim Fiyat Hesaplayıcı
 * Her varyant için ₺/kg, ₺/adet hesabı yapar
 */
export class VariantPriceCalculator {
  
  /**
   * Tek varyant için birim fiyat hesapla
   */
  static calculateUnitPrice(variant: ProductVariant): number {
    if (variant.size <= 0) {
      throw new Error(`Geçersiz boyut: ${variant.size}`)
    }
    
    // Birim dönüştürme (gr -> kg)
    let normalizedSize = variant.size
    if (variant.sizeUnit === 'gr' || variant.sizeUnit === 'gram') {
      normalizedSize = variant.size / 1000
    }
    
    return Number((variant.price / normalizedSize).toFixed(2))
  }

  /**
   * Tüm varyantların birim fiyatlarını hesapla ve güncelle
   */
  static updateAllUnitPrices(variants: ProductVariant[]): ProductVariant[] {
    return variants.map(variant => ({
      ...variant,
      unitPrice: this.calculateUnitPrice(variant)
    }))
  }

  /**
   * En ucuz birim fiyatlı varyantı bul
   */
  static findBestPriceVariant(variants: ProductVariant[]): ProductVariant | null {
    if (variants.length === 0) return null
    
    // Sadece mevcut varyantları değerlendir
    const availableVariants = variants.filter(v => v.availability === 'available')
    if (availableVariants.length === 0) return null
    
    // Güvenilirlik faktörünü de hesaba kat
    const scoredVariants = availableVariants.map(variant => {
      const confidenceWeight = variant.priceSource.confidence
      const adjustedUnitPrice = variant.unitPrice / confidenceWeight
      
      return {
        variant,
        score: adjustedUnitPrice,
        unitPrice: variant.unitPrice
      }
    })
    
    // En düşük skora sahip varyantı döndür
    return scoredVariants.reduce((best, current) => 
      current.score < best.score ? current : best
    ).variant
  }

  /**
   * Base price flag'lerini güncelle (sadece en ucuz varyant true olacak)
   */
  static updateBasePriceFlags(variants: ProductVariant[]): ProductVariant[] {
    const bestVariant = this.findBestPriceVariant(variants)
    
    return variants.map(variant => ({
      ...variant,
      isBasePrice: bestVariant ? variant.id === bestVariant.id : false
    }))
  }
}

/**
 * 🔍 Ürün Karşılaştırma ve Analiz Motoru
 */
export class ProductComparisonEngine {
  
  /**
   * Ürün için kapsamlı karşılaştırma analizi
   */
  static createComparison(product: Product): ProductComparison {
    const variants = product.variants
    const unitPrices = variants.map(v => v.unitPrice).filter(p => p > 0)
    
    if (unitPrices.length === 0) {
      throw new Error(`${product.name} için geçerli fiyat verisi bulunamadı`)
    }
    
    const bestVariant = VariantPriceCalculator.findBestPriceVariant(variants)!
    const minPrice = Math.min(...unitPrices)
    const maxPrice = Math.max(...unitPrices)
    const priceSpread = ((maxPrice - minPrice) / minPrice) * 100
    
    return {
      productId: product.id,
      productName: product.name,
      baseUnitPrice: bestVariant.unitPrice,
      bestVariant,
      variantCount: variants.length,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        spread: Number(priceSpread.toFixed(1))
      },
      marketCoverage: Array.from(new Set(variants.map(v => v.market))),
      averageConfidence: Number(
        (variants.reduce((sum, v) => sum + v.priceSource.confidence, 0) / variants.length).toFixed(2)
      ),
      lastUpdate: new Date(Math.max(...variants.map(v => v.lastUpdated.getTime())))
    }
  }

  /**
   * Çoklu ürün karşılaştırması (kategori bazlı)
   */
  static compareCategoryProducts(products: Product[]): ProductComparison[] {
    return products
      .map(product => this.createComparison(product))
      .sort((a, b) => a.baseUnitPrice - b.baseUnitPrice) // En ucuzdan pahalıya
  }
}

/**
 * 💰 Maliyet Simülasyonu Hesaplayıcısı
 * İhtiyaç miktarına göre en optimal varyantı önerir
 */
export class CostSimulationEngine {
  
  /**
   * Maliyet simülasyonu çalıştır
   */
  static simulate(product: Product, input: CostSimulationInput): CostSimulationResult {
    // Seçilen varyant veya en ucuz varyantı al
    let selectedVariant: ProductVariant
    
    if (input.selectedVariantId) {
      const found = product.variants.find(v => v.id === input.selectedVariantId)
      if (!found) throw new Error('Seçilen varyant bulunamadı')
      selectedVariant = found
    } else {
      const best = VariantPriceCalculator.findBestPriceVariant(product.variants)
      if (!best) throw new Error('Uygun varyant bulunamadı')
      selectedVariant = best
    }
    
    // Temel hesaplama
    const calculation = this.calculateCost(selectedVariant, input.requiredQuantity)
    
    // Alternatif varyant analizleri
    const alternatives = this.findAlternatives(product.variants, selectedVariant, input.requiredQuantity)
    
    // Bütçe analizi
    const budgetAnalysis = input.targetBudget 
      ? this.analyzeBudget(calculation.totalCost, input.targetBudget)
      : undefined
    
    return {
      productName: product.name,
      selectedVariant,
      calculation,
      alternatives,
      budgetAnalysis
    }
  }

  /**
   * Varyant için maliyet hesaplaması
   */
  private static calculateCost(variant: ProductVariant, requiredQuantity: number) {
    const packageCount = Math.ceil(requiredQuantity / variant.size)
    const totalQuantity = packageCount * variant.size
    const remainingAmount = totalQuantity - requiredQuantity
    const totalCost = packageCount * variant.price
    
    return {
      unitPrice: variant.unitPrice,
      quantity: totalQuantity,
      totalCost: Number(totalCost.toFixed(2)),
      packageCount,
      remainingAmount: Number(remainingAmount.toFixed(2))
    }
  }

  /**
   * Alternatif varyantları değerlendir
   */
  private static findAlternatives(
    variants: ProductVariant[], 
    selectedVariant: ProductVariant, 
    requiredQuantity: number
  ) {
    return variants
      .filter(v => v.id !== selectedVariant.id && v.availability === 'available')
      .map(variant => {
        const calculation = this.calculateCost(variant, requiredQuantity)
        const selectedCost = this.calculateCost(selectedVariant, requiredQuantity).totalCost
        
        return {
          variant,
          totalCost: calculation.totalCost,
          savings: Number((selectedCost - calculation.totalCost).toFixed(2))
        }
      })
      .sort((a, b) => a.totalCost - b.totalCost) // En ucuz alternatifler önce
      .slice(0, 3) // En iyi 3 alternatif
  }

  /**
   * Bütçe analizi
   */
  private static analyzeBudget(totalCost: number, targetBudget: number) {
    const budgetUsage = (totalCost / targetBudget) * 100
    const savingsOrOverrun = targetBudget - totalCost
    
    return {
      isWithinBudget: totalCost <= targetBudget,
      budgetUsage: Number(budgetUsage.toFixed(1)),
      savingsOrOverrun: Number(savingsOrOverrun.toFixed(2))
    }
  }
}

/**
 * 📊 Piyasa Trend Analizöru
 */
export class MarketTrendAnalyzer {
  
  /**
   * Kategori bazlı fiyat trend analizi
   */
  static analyzeCategoryTrends(products: Product[]): PriceAnalytics['categoryTrends'] {
    const categoryMap = new Map<string, ProductVariant[]>()
    
    // Kategorilere göre grupla
    products.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, [])
      }
      categoryMap.get(product.category)!.push(...product.variants)
    })
    
    // Her kategori için trend hesapla
    return Array.from(categoryMap.entries()).map(([category, variants]) => {
      const trends = variants.map(v => v.trend.percentage).filter(p => !isNaN(p))
      const averageChange = trends.length > 0 
        ? Number((trends.reduce((sum, p) => sum + p, 0) / trends.length).toFixed(1))
        : 0
      
      let trendDirection: 'up' | 'down' | 'stable' = 'stable'
      if (averageChange > 2) trendDirection = 'up'
      else if (averageChange < -2) trendDirection = 'down'
      
      return {
        category,
        trendDirection,
        averageChange
      }
    })
  }

  /**
   * Market bazlı fiyat dağılımı
   */
  static analyzeMarketDistribution(products: Product[]): PriceAnalytics['marketDistribution'] {
    const marketMap = new Map<string, { prices: number[], count: number }>()
    
    products.forEach(product => {
      product.variants.forEach(variant => {
        if (!marketMap.has(variant.market)) {
          marketMap.set(variant.market, { prices: [], count: 0 })
        }
        const marketData = marketMap.get(variant.market)!
        marketData.prices.push(variant.unitPrice)
        marketData.count++
      })
    })
    
    return Array.from(marketMap.entries()).map(([market, data]) => ({
      market,
      productCount: data.count,
      averagePrice: Number(
        (data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length).toFixed(2)
      )
    }))
  }
}

/**
 * 🔄 Otomatik Güncelleme ve Bakım
 */
export class VariantMaintenanceService {
  
  /**
   * Tüm ürünlerin varyant hesaplamalarını güncelle
   */
  static refreshAllCalculations(products: Product[]): Product[] {
    return products.map(product => ({
      ...product,
      variants: VariantPriceCalculator.updateBasePriceFlags(
        VariantPriceCalculator.updateAllUnitPrices(product.variants)
      ),
      updatedAt: new Date()
    }))
  }

  /**
   * Eski fiyat verilerini temizle
   */
  static cleanOldPriceData(variants: ProductVariant[], maxAge: number = 30): ProductVariant[] {
    const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000)
    
    return variants.map(variant => ({
      ...variant,
      priceHistory: variant.priceHistory.filter(entry => entry.date > cutoffDate)
    }))
  }

  /**
   * Güvenilirlik skoruna göre varyantları filtrele
   */
  static filterByConfidence(variants: ProductVariant[], minConfidence: number = 0.7): ProductVariant[] {
    return variants.filter(variant => variant.priceSource.confidence >= minConfidence)
  }
}

// 🎯 Utility fonksiyonları
export const VariantUtils = {
  
  // Fiyat formatla
  formatPrice: (price: number, unit: string = 'TL') => `${price.toFixed(2)} ${unit}`,
  
  // Birim fiyat formatla
  formatUnitPrice: (price: number, unit: string = 'kg') => `${price.toFixed(2)} ₺/${unit}`,
  
  // Trend yüzdesini formatla
  formatTrend: (percentage: number) => `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
  
  // Güven skorunu label'a çevir
  confidenceToLabel: (confidence: number) => {
    if (confidence >= 0.9) return 'Yüksek'
    if (confidence >= 0.7) return 'Orta'
    return 'Düşük'
  },
  
  // Güncellik durumunu kontrol et
  checkFreshness: (lastUpdate: Date) => {
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceUpdate < 24) return 'fresh'      // Güncel
    if (hoursSinceUpdate < 72) return 'moderate'   // Orta yaşlı
    return 'stale'                                // Eski
  }
}