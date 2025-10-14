// Gemini AI Price Trend Analyzer Service
// Market verilerini analiz edip trend tahminleri yapar

import { GoogleGenerativeAI } from '@google/generative-ai'
import { MarketPrice, MarketDataSummary, TrendAnalysis } from './marketDataService'

export interface GeminiPrediction {
  productName: string
  currentPrice: number
  predictedPrice: {
    oneWeek: number
    twoWeeks: number
    oneMonth: number
  }
  priceChange: {
    oneWeek: number
    twoWeeks: number  
    oneMonth: number
  }
  confidence: number
  factors: {
    seasonal: string
    economic: string
    supply: string
    demand: string
  }
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    score: number
    reasoning: string
  }
  recommendation: {
    action: 'increase' | 'decrease' | 'maintain'
    marginAdjustment: number
    reasoning: string
  }
}

export interface MarketTrendReport {
  reportDate: string
  overallTrend: 'bullish' | 'bearish' | 'neutral'
  volatilityIndex: number
  predictions: GeminiPrediction[]
  marketFactors: {
    inflation: number
    seasonality: string
    supplyChain: string
    geopolitical: string
  }
  alerts: Array<{
    type: 'price_spike' | 'volatility' | 'opportunity'
    product: string
    message: string
    urgency: 'low' | 'medium' | 'high'
  }>
}

export class GeminiTrendAnalyzer {
  private genAI: GoogleGenerativeAI
  private model: any
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 1000 * 60 * 60 * 2 // 2 saat cache

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || ''
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY environment variable not found')
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })
  }

  /**
   * Ana trend analizi - birden fazla ürün için predictions
   */
  async analyzeTrends(marketPrices: MarketPrice[]): Promise<MarketTrendReport> {
    const cacheKey = 'market-trend-report'
    
    // Cache kontrolü
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      // Market verilerini kategorilere göre grupla
      const groupedPrices = this.groupPricesByCategory(marketPrices)
      
      // Her kategori için trend analizi
      const predictions: GeminiPrediction[] = []
      
      const categories = Array.from(groupedPrices.keys())
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i]
        const prices = groupedPrices.get(category)!
        
        // En önemli 3-5 ürünü seç (fiyat volatilitesi + yaygınlık)
        const topProducts = this.selectKeyProducts(prices, 5)
        
        for (const product of topProducts) {
          const prediction = await this.analyzeProductTrend(product, prices)
          predictions.push(prediction)
        }
      }

      // Genel market trend analizi
      const overallAnalysis = await this.analyzeOverallMarket(marketPrices)
      
      const report: MarketTrendReport = {
        reportDate: new Date().toISOString(),
        overallTrend: overallAnalysis.trend,
        volatilityIndex: overallAnalysis.volatility,
        predictions,
        marketFactors: overallAnalysis.factors,
        alerts: this.generateAlerts(predictions)
      }

      // Cache'e kaydet
      this.cache.set(cacheKey, {
        data: report,
        timestamp: Date.now()
      })

      return report

    } catch (error) {
      console.error('Gemini trend analysis error:', error)
      
      // Fallback: Basit istatistiksel analiz
      return this.fallbackAnalysis(marketPrices)
    }
  }

  /**
   * Tek ürün için detaylı trend analizi
   */
  async analyzeProductTrend(
    product: MarketPrice, 
    categoryPrices: MarketPrice[]
  ): Promise<GeminiPrediction> {
    
    try {
      // Gemini için prompt hazırla
      const prompt = this.buildTrendAnalysisPrompt(product, categoryPrices)
      
      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      // Gemini yanıtını parse et
      const analysis = this.parseGeminiResponse(text, product)
      return analysis

    } catch (error) {
      console.error(`Product trend analysis error for ${product.name}:`, error)
      
      // Fallback: Basit matematiksel trend
      return this.fallbackProductAnalysis(product, categoryPrices)
    }
  }

  /**
   * Spesifik ürün için hızlı trend sorgusu
   */
  async getQuickTrend(productName: string, marketPrices: MarketPrice[]): Promise<GeminiPrediction | null> {
    const product = marketPrices.find(p => 
      p.name.toLowerCase().includes(productName.toLowerCase())
    )
    
    if (!product) {
      return null
    }

    const categoryPrices = marketPrices.filter(p => p.category === product.category)
    return await this.analyzeProductTrend(product, categoryPrices)
  }

  /**
   * Gemini için trend analizi prompt'u oluştur
   */
  private buildTrendAnalysisPrompt(product: MarketPrice, categoryPrices: MarketPrice[]): string {
    const categoryData = categoryPrices.map(p => ({
      name: p.name,
      price: p.avgPrice,
      change: p.changePercent,
      freshness: p.freshness
    }))

    return `
Türkiye gıda piyasası trend analisti olarak, aşağıdaki verileri analiz et ve JSON formatında tahmin yap:

ÜRÜN: ${product.name}
GÜNCEL FİYAT: ₺${product.avgPrice}/${product.unit}
DEĞİŞİM: %${product.changePercent}
ŞEHİR: ${product.city}
VERİ YAŞI: ${product.freshness} gün

KATEGORİ VERİLERİ (${product.category}):
${JSON.stringify(categoryData, null, 2)}

MEVSIM: Ekim 2025 (sonbahar)
EKONOMİK DURUM: Türkiye enflasyon ortamı

Lütfen şu formatta JSON yanıt ver:

{
  "productName": "${product.name}",
  "currentPrice": ${product.avgPrice},
  "predictedPrice": {
    "oneWeek": [1 hafta sonraki tahmini fiyat],
    "twoWeeks": [2 hafta sonraki tahmini fiyat], 
    "oneMonth": [1 ay sonraki tahmini fiyat]
  },
  "confidence": [0-1 arası güven skoru],
  "factors": {
    "seasonal": "[mevsimsel faktör açıklaması]",
    "economic": "[ekonomik faktör açıklaması]",
    "supply": "[arz durumu açıklaması]",
    "demand": "[talep durumu açıklaması]"
  },
  "riskAssessment": {
    "level": "low|medium|high",
    "score": [0-100 risk skoru],
    "reasoning": "[risk açıklaması]"
  },
  "recommendation": {
    "action": "increase|decrease|maintain",
    "marginAdjustment": [₺ cinsinden margin ayarlama önerisi],
    "reasoning": "[öneri açıklaması]"
  }
}

Analizinde şunları dikkate al:
- Türkiye'deki mevsimsel değişimler
- Enflasyon etkisi
- Arz-talep dinamikleri  
- Jeopolitik faktörler
- Geçmiş fiyat hareketleri
`
  }

  /**
   * Genel market analizi
   */
  private async analyzeOverallMarket(prices: MarketPrice[]): Promise<{
    trend: 'bullish' | 'bearish' | 'neutral'
    volatility: number
    factors: any
  }> {
    
    const avgChange = prices.reduce((sum, p) => sum + p.changePercent, 0) / prices.length
    const volatility = this.calculateVolatility(prices)
    
    // Gemini ile genel trend analizi
    try {
      const prompt = `
Türkiye gıda piyasası için genel trend analizi yap:

ORTALAMA DEĞİŞİM: %${avgChange.toFixed(2)}
VOLATİLİTE: ${volatility.toFixed(2)}
TOPLAM ÜRÜN: ${prices.length}
TARİH: Ekim 2025

JSON formatında yanıt ver:
{
  "trend": "bullish|bearish|neutral",
  "volatility": ${volatility},
  "factors": {
    "inflation": [enflasyon etkisi %],
    "seasonality": "[mevsimsel durum]",
    "supplyChain": "[tedarik zinciri durumu]", 
    "geopolitical": "[jeopolitik faktörler]"
  }
}
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const jsonMatch = response.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          trend: parsed.trend || 'neutral',
          volatility: parsed.volatility || volatility,
          factors: parsed.factors || {}
        }
      }
    } catch (error) {
      console.error('Overall market analysis error:', error)
    }

    // Fallback analysis
    return {
      trend: avgChange > 2 ? 'bullish' : avgChange < -2 ? 'bearish' : 'neutral',
      volatility,
      factors: {
        inflation: 45,
        seasonality: 'Sonbahar mevsimi - hasat dönemi',
        supplyChain: 'Stabil',
        geopolitical: 'Orta risk'
      }
    }
  }

  /**
   * Gemini yanıtını parse et
   */
  private parseGeminiResponse(text: string, product: MarketPrice): GeminiPrediction {
    try {
      const jsonMatch = text.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        
        // Fiyat değişimlerini hesapla
        const oneWeekChange = ((parsed.predictedPrice.oneWeek - product.avgPrice) / product.avgPrice) * 100
        const twoWeeksChange = ((parsed.predictedPrice.twoWeeks - product.avgPrice) / product.avgPrice) * 100
        const oneMonthChange = ((parsed.predictedPrice.oneMonth - product.avgPrice) / product.avgPrice) * 100

        return {
          productName: parsed.productName || product.name,
          currentPrice: parsed.currentPrice || product.avgPrice,
          predictedPrice: parsed.predictedPrice || {
            oneWeek: product.avgPrice * 1.02,
            twoWeeks: product.avgPrice * 1.03,
            oneMonth: product.avgPrice * 1.05
          },
          priceChange: {
            oneWeek: oneWeekChange,
            twoWeeks: twoWeeksChange,
            oneMonth: oneMonthChange
          },
          confidence: parsed.confidence || 0.75,
          factors: parsed.factors || {},
          riskAssessment: parsed.riskAssessment || {
            level: 'medium',
            score: 50,
            reasoning: 'Orta seviye risk'
          },
          recommendation: parsed.recommendation || {
            action: 'maintain',
            marginAdjustment: 0,
            reasoning: 'Mevcut fiyatı koru'
          }
        }
      }
      
      throw new Error('JSON parse edilemedi')
    } catch (error) {
      console.error('Gemini response parse error:', error)
      return this.fallbackProductAnalysis(product, [])
    }
  }

  /**
   * Yardımcı fonksiyonlar
   */
  private groupPricesByCategory(prices: MarketPrice[]): Map<string, MarketPrice[]> {
    const groups = new Map<string, MarketPrice[]>()
    
    prices.forEach(price => {
      if (!groups.has(price.category)) {
        groups.set(price.category, [])
      }
      groups.get(price.category)!.push(price)
    })

    return groups
  }

  private selectKeyProducts(prices: MarketPrice[], count: number): MarketPrice[] {
    // Volatilite ve fiyat seviyesine göre sırala
    return prices
      .sort((a, b) => {
        const scoreA = Math.abs(a.changePercent) * a.avgPrice
        const scoreB = Math.abs(b.changePercent) * b.avgPrice
        return scoreB - scoreA
      })
      .slice(0, count)
  }

  private calculateVolatility(prices: MarketPrice[]): number {
    const changes = prices.map(p => Math.abs(p.changePercent))
    const avg = changes.reduce((sum, c) => sum + c, 0) / changes.length
    return Math.round(avg * 10) / 10
  }

  private generateAlerts(predictions: GeminiPrediction[]): Array<{
    type: 'price_spike' | 'volatility' | 'opportunity'
    product: string
    message: string
    urgency: 'low' | 'medium' | 'high'
  }> {
    const alerts: any[] = []

    predictions.forEach(pred => {
      // Yüksek fiyat artışı uyarısı
      if (pred.priceChange.oneWeek > 10) {
        alerts.push({
          type: 'price_spike',
          product: pred.productName,
          message: `${pred.productName} fiyatında %${pred.priceChange.oneWeek.toFixed(1)} artış bekleniyor`,
          urgency: pred.priceChange.oneWeek > 20 ? 'high' : 'medium'
        })
      }

      // Yüksek risk uyarısı
      if (pred.riskAssessment.level === 'high') {
        alerts.push({
          type: 'volatility',
          product: pred.productName,
          message: `${pred.productName} yüksek volatilite riski taşıyor`,
          urgency: 'high'
        })
      }

      // Fırsat uyarısı
      if (pred.priceChange.oneWeek < -5 && pred.confidence > 0.7) {
        alerts.push({
          type: 'opportunity',
          product: pred.productName,
          message: `${pred.productName} fiyat düşüşü - rekabetçi fırsat`,
          urgency: 'medium'
        })
      }
    })

    return alerts.slice(0, 10) // En fazla 10 alert
  }

  private fallbackAnalysis(prices: MarketPrice[]): MarketTrendReport {
    const predictions: GeminiPrediction[] = prices.slice(0, 10).map(price => 
      this.fallbackProductAnalysis(price, [])
    )

    return {
      reportDate: new Date().toISOString(),
      overallTrend: 'neutral',
      volatilityIndex: this.calculateVolatility(prices),
      predictions,
      marketFactors: {
        inflation: 45,
        seasonality: 'Sonbahar - hasat dönemi',
        supplyChain: 'Stabil',
        geopolitical: 'Orta risk'
      },
      alerts: []
    }
  }

  private fallbackProductAnalysis(product: MarketPrice, categoryPrices: MarketPrice[]): GeminiPrediction {
    const baseGrowth = 0.02 // %2 haftalık büyüme varsayımı
    const volatilityFactor = Math.abs(product.changePercent) / 100

    return {
      productName: product.name,
      currentPrice: product.avgPrice,
      predictedPrice: {
        oneWeek: product.avgPrice * (1 + baseGrowth + volatilityFactor),
        twoWeeks: product.avgPrice * (1 + baseGrowth * 2 + volatilityFactor),
        oneMonth: product.avgPrice * (1 + baseGrowth * 4 + volatilityFactor)
      },
      priceChange: {
        oneWeek: (baseGrowth + volatilityFactor) * 100,
        twoWeeks: (baseGrowth * 2 + volatilityFactor) * 100,
        oneMonth: (baseGrowth * 4 + volatilityFactor) * 100
      },
      confidence: 0.6,
      factors: {
        seasonal: 'Sonbahar etkisi',
        economic: 'Enflasyonist ortam',
        supply: 'Stabil arz',
        demand: 'Orta talep'
      },
      riskAssessment: {
        level: volatilityFactor > 0.1 ? 'high' : volatilityFactor > 0.05 ? 'medium' : 'low',
        score: Math.min(100, volatilityFactor * 1000),
        reasoning: 'İstatistiksel hesaplama'
      },
      recommendation: {
        action: product.changePercent > 5 ? 'increase' : product.changePercent < -5 ? 'decrease' : 'maintain',
        marginAdjustment: product.changePercent * 0.1, // Değişimin %10'u kadar margin ayarlama
        reasoning: 'Otomatik hesaplama'
      }
    }
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    
    return (Date.now() - cached.timestamp) < this.cacheTimeout
  }

  /**
   * Cache temizleme
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
    try {
      const testResult = await this.model.generateContent('Test message for health check')
      return {
        status: 'healthy',
        message: 'Gemini AI connection successful'
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Gemini AI connection failed: ${error}`
      }
    }
  }
}

// Singleton instance
export const geminiTrendAnalyzer = new GeminiTrendAnalyzer()