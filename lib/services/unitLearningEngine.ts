// Öğrenen Birim Dönüşüm Motoru - Phase 5.5
// Her ürün için historical data'dan öğrenilmiş katsayılarla birim dönüşümü

export interface UnitConversionFactor {
  productName: string
  productCategory: string
  factors: {
    kg_factor: number
    lt_factor: number
    adet_factor: number
  }
  confidence: number // 0-100 arası güven skoru
  sampleCount: number // Hesaplamada kullanılan veri sayısı
  lastUpdated: string
  regression: {
    slope: number
    intercept: number
    rSquared: number
  }
}

export interface PricePrediction {
  predictedUnitPrice: number
  confidence: number
  method: 'learned' | 'regression' | 'category_average' | 'fallback'
  explanation: string
  usedSamples: number
}

export interface HistoricalPricePoint {
  price: number
  amount: number
  unitPrice: number
  package: string
  market: string
  date: string
  unit: 'kg' | 'lt' | 'adet'
}

export class UnitLearningEngine {
  private conversionFactors: Map<string, UnitConversionFactor> = new Map()
  private historicalData: Map<string, HistoricalPricePoint[]> = new Map()
  private categoryAverages: Map<string, number> = new Map()

  constructor() {
    this.initializeCategoryAverages()
  }

  private initializeCategoryAverages() {
    // Kategori bazlı fallback ortalamalar
    this.categoryAverages.set('konserve', 25.50)
    this.categoryAverages.set('tahıl', 28.75)
    this.categoryAverages.set('sebze', 15.25)
    this.categoryAverages.set('meyve', 18.90)
    this.categoryAverages.set('et', 185.00)
    this.categoryAverages.set('süt-ürünleri', 35.80)
    this.categoryAverages.set('bakliyat', 32.20)
  }

  // Ürün için historical price data ekle
  addHistoricalData(productName: string, pricePoint: HistoricalPricePoint) {
    const key = this.normalizeProductName(productName)
    
    if (!this.historicalData.has(key)) {
      this.historicalData.set(key, [])
    }
    
    const existing = this.historicalData.get(key)!
    existing.push(pricePoint)
    
    // En son 50 veri noktasını tut (performans için)
    if (existing.length > 50) {
      existing.splice(0, existing.length - 50)
    }
    
    // Yeterli veri varsa faktörleri yeniden hesapla
    if (existing.length >= 3) {
      this.recalculateFactors(productName, key)
    }
  }

  // Ürün adını normalize et (tutarlılık için)
  private normalizeProductName(name: string): string {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[şş]/g, 's')
      .replace(/[çç]/g, 'c')
      .replace(/[ğğ]/g, 'g')
      .replace(/[üü]/g, 'u')
      .replace(/[öö]/g, 'o')
      .replace(/[ıi]/g, 'i')
  }

  // Birim dönüşüm faktörlerini yeniden hesapla
  private recalculateFactors(originalName: string, normalizedKey: string) {
    const data = this.historicalData.get(normalizedKey)
    if (!data || data.length < 3) return

    // Regresyon analizi için veri hazırla
    const validData = data.filter(point => 
      point.amount > 0 && 
      point.price > 0 && 
      point.unitPrice > 0
    )

    if (validData.length < 3) return

    // Unit price ortalaması ve regresyon
    const unitPrices = validData.map(d => d.unitPrice)
    const amounts = validData.map(d => d.amount)
    
    // Basit linear regresyon (amount vs unit price)
    const regression = this.calculateLinearRegression(amounts, unitPrices)
    
    // Kategori çıkarımı (ilk datadan)
    const category = this.inferCategory(originalName, validData[0])
    
    // Birim faktörleri hesapla
    const avgUnitPrice = unitPrices.reduce((sum, price) => sum + price, 0) / unitPrices.length
    
    // Farklı birimler için örneklem varsa faktör hesapla
    const kgSamples = validData.filter(d => d.unit === 'kg')
    const ltSamples = validData.filter(d => d.unit === 'lt')
    const adetSamples = validData.filter(d => d.unit === 'adet')
    
    const factors: UnitConversionFactor = {
      productName: originalName,
      productCategory: category,
      factors: {
        kg_factor: kgSamples.length > 0 
          ? kgSamples.reduce((sum, d) => sum + d.unitPrice, 0) / kgSamples.length / avgUnitPrice
          : 1.0,
        lt_factor: ltSamples.length > 0
          ? ltSamples.reduce((sum, d) => sum + d.unitPrice, 0) / ltSamples.length / avgUnitPrice
          : 1.0,
        adet_factor: adetSamples.length > 0
          ? adetSamples.reduce((sum, d) => sum + d.unitPrice, 0) / adetSamples.length / avgUnitPrice
          : 0.06 // Fallback adet faktörü
      },
      confidence: this.calculateConfidence(validData.length, regression.rSquared),
      sampleCount: validData.length,
      lastUpdated: new Date().toISOString(),
      regression: regression
    }

    this.conversionFactors.set(normalizedKey, factors)
  }

  // Linear regresyon hesaplama
  private calculateLinearRegression(x: number[], y: number[]): { slope: number; intercept: number; rSquared: number } {
    const n = x.length
    if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 }

    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)
    const sumYY = y.reduce((sum, val) => sum + val * val, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // R-squared hesaplama
    const meanY = sumY / n
    const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0)
    const ssResidual = x.reduce((sum, val, i) => {
      const predicted = slope * val + intercept
      return sum + Math.pow(y[i] - predicted, 2)
    }, 0)
    
    const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0

    return { slope: isFinite(slope) ? slope : 0, intercept: isFinite(intercept) ? intercept : 0, rSquared: isFinite(rSquared) ? rSquared : 0 }
  }

  // Güven skoru hesaplama
  private calculateConfidence(sampleCount: number, rSquared: number): number {
    const sampleScore = Math.min(sampleCount / 10, 1) * 50 // Max 50 puan
    const regressionScore = rSquared * 50 // Max 50 puan
    return Math.round(sampleScore + regressionScore)
  }

  // Kategori çıkarımı
  private inferCategory(productName: string, sample: HistoricalPricePoint): string {
    const name = productName.toLowerCase()
    
    if (name.includes('konserve') || name.includes('teneke')) return 'konserve'
    if (name.includes('pirinç') || name.includes('bulgur') || name.includes('makarna')) return 'tahıl'
    if (name.includes('domates') || name.includes('soğan') || name.includes('patates')) return 'sebze'
    if (name.includes('elma') || name.includes('portakal') || name.includes('muz')) return 'meyve'
    if (name.includes('et') || name.includes('dana') || name.includes('kuzu')) return 'et'
    if (name.includes('süt') || name.includes('peynir') || name.includes('yoğurt')) return 'süt-ürünleri'
    if (name.includes('fasulye') || name.includes('nohut') || name.includes('mercimek')) return 'bakliyat'
    
    return 'konserve' // Fallback
  }

  // Yeni ambalaj için fiyat tahmini
  predictUnitPrice(productName: string, amount: number, unit: 'kg' | 'lt' | 'adet', category?: string): PricePrediction {
    const key = this.normalizeProductName(productName)
    const factors = this.conversionFactors.get(key)

    // Method 1: Öğrenilmiş faktörler var
    if (factors && factors.confidence > 30) {
      const baseFactor = factors.factors[`${unit}_factor` as keyof typeof factors.factors]
      const basePrice = this.categoryAverages.get(factors.productCategory) || 25.0
      
      const predictedPrice = basePrice * baseFactor
      
      return {
        predictedUnitPrice: predictedPrice,
        confidence: factors.confidence,
        method: 'learned',
        explanation: `${factors.sampleCount} veri noktasından öğrenildi (R²=${factors.regression.rSquared.toFixed(3)})`,
        usedSamples: factors.sampleCount
      }
    }

    // Method 2: Regresyon ile tahmin (historical data var ama faktör yeterli değil)
    const historicalData = this.historicalData.get(key)
    if (historicalData && historicalData.length >= 2) {
      const unitPrices = historicalData.map(d => d.unitPrice)
      const avgPrice = unitPrices.reduce((sum, price) => sum + price, 0) / unitPrices.length
      const variance = unitPrices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / unitPrices.length
      const confidence = Math.max(20, Math.min(85, 100 - (variance / avgPrice) * 100))

      return {
        predictedUnitPrice: avgPrice,
        confidence: Math.round(confidence),
        method: 'regression',
        explanation: `${historicalData.length} geçmiş veriden hesaplandı`,
        usedSamples: historicalData.length
      }
    }

    // Method 3: Kategori ortalaması
    const categoryAvg = this.categoryAverages.get(category || 'konserve')
    if (categoryAvg) {
      return {
        predictedUnitPrice: categoryAvg,
        confidence: 45,
        method: 'category_average',
        explanation: `${category || 'konserve'} kategorisi ortalaması`,
        usedSamples: 0
      }
    }

    // Method 4: Fallback
    return {
      predictedUnitPrice: 25.0,
      confidence: 20,
      method: 'fallback',
      explanation: 'Genel ortalama (veri yetersiz)',
      usedSamples: 0
    }
  }

  // Bulk update için tüm mevcut price tracker verilerini işle
  bulkProcessPriceTrackerData(products: any[]) {
    products.forEach(product => {
      product.markets.forEach((market: any) => {
        const pricePoint: HistoricalPricePoint = {
          price: market.price,
          amount: market.amount,
          unitPrice: market.unitPrice,
          package: market.package,
          market: market.market,
          date: market.lastUpdate,
          unit: product.unit
        }
        
        this.addHistoricalData(product.name, pricePoint)
      })
    })
  }

  // Öğrenilmiş faktörleri export et
  exportLearningData() {
    const data = {
      conversionFactors: Object.fromEntries(this.conversionFactors),
      categoryAverages: Object.fromEntries(this.categoryAverages),
      totalProducts: this.conversionFactors.size,
      totalDataPoints: Array.from(this.historicalData.values()).reduce((sum, arr) => sum + arr.length, 0),
      lastUpdate: new Date().toISOString()
    }
    
    return data
  }

  // Debug bilgisi
  getProductLearningStatus(productName: string) {
    const key = this.normalizeProductName(productName)
    const factors = this.conversionFactors.get(key)
    const historical = this.historicalData.get(key)
    
    return {
      hasFactors: !!factors,
      factorConfidence: factors?.confidence || 0,
      historicalCount: historical?.length || 0,
      canPredict: factors ? factors.confidence > 30 : (historical?.length || 0) >= 2,
      normalizedKey: key,
      learningQuality: factors ? 
        factors.confidence > 70 ? 'excellent' : 
        factors.confidence > 50 ? 'good' : 
        factors.confidence > 30 ? 'fair' : 'poor' : 'none'
    }
  }

  // Console debug için faydalı bilgi
  debugLearningEngine() {
    console.log('🧠 Unit Learning Engine Status:')
    console.log(`📊 Total learned products: ${this.conversionFactors.size}`)
    console.log(`📈 Total data points: ${Array.from(this.historicalData.values()).reduce((sum, arr) => sum + arr.length, 0)}`)
    
    this.conversionFactors.forEach((factor, key) => {
      console.log(`🎯 ${factor.productName}: ${factor.confidence}% confidence (${factor.sampleCount} samples)`)
    })
  }
}

// Singleton instance
export const unitLearningEngine = new UnitLearningEngine()