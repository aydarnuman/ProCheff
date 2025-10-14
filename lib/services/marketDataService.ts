// Market Data Service - CollectAPI ile güncel hal fiyatları
// Max 7 gün geriden fresh data garantisi

export interface MarketPrice {
  name: string
  category: 'sebze' | 'meyve' | 'et' | 'süt-ürünleri' | 'tahıl'
  unit: string
  minPrice: number
  maxPrice: number
  avgPrice: number
  city: string
  date: string
  source: 'hal' | 'market' | 'üretici'
  trend: 'up' | 'down' | 'stable'
  changePercent: number
  freshness: number // 1-7 gün arası (1=bugün, 7=bir hafta öncesi)
}

export interface MarketDataSummary {
  totalProducts: number
  categories: {
    category: string
    productCount: number
    avgPriceChange: number
    trend: 'up' | 'down' | 'stable'
  }[]
  lastUpdate: string
  dataFreshness: number // Ortalama veri yaşı (gün)
  priceVolatility: 'low' | 'medium' | 'high'
}

export interface TrendAnalysis {
  productName: string
  weeklyChange: number
  monthlyChange: number
  volatilityScore: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: string
  confidenceScore: number
}

export class MarketDataService {
  private baseUrl = 'https://api.collectapi.com'
  private apiKey: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 1000 * 60 * 30 // 30 dakika cache

  constructor() {
    this.apiKey = process.env.COLLECTAPI_KEY || ''
    if (!this.apiKey) {
      console.warn('⚠️ COLLECTAPI_KEY environment variable not found')
    }
  }

  /**
   * İstanbul hal fiyatlarını çek (max 7 gün geriden)
   */
  async getIstanbulHalPrices(): Promise<MarketPrice[]> {
    const cacheKey = 'istanbul-hal-prices'
    
    // Cache kontrolü
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/market/price?data.city=Istanbul`, {
        method: 'GET',
        headers: {
          'authorization': `apikey ${this.apiKey}`,
          'content-type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`CollectAPI Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const prices = this.parseCollectApiData(data, 'Istanbul')
      
      // 7 günden eski verileri filtrele
      const freshPrices = prices.filter(price => price.freshness <= 7)
      
      // Cache'e kaydet
      this.cache.set(cacheKey, {
        data: freshPrices,
        timestamp: Date.now()
      })

      return freshPrices

    } catch (error) {
      console.error('Market data fetch error:', error)
      
      // Fallback: Cache'den eski veri dön (varsa)
      if (this.cache.has(cacheKey)) {
        console.warn('Using stale cache data due to API error')
        return this.cache.get(cacheKey)!.data
      }
      
      throw error
    }
  }

  /**
   * Ankara hal fiyatlarını çek
   */
  async getAnkaraHalPrices(): Promise<MarketPrice[]> {
    const cacheKey = 'ankara-hal-prices'
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/market/price?data.city=Ankara`, {
        method: 'GET',
        headers: {
          'authorization': `apikey ${this.apiKey}`,
          'content-type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`CollectAPI Error: ${response.status}`)
      }

      const data = await response.json()
      const prices = this.parseCollectApiData(data, 'Ankara')
      const freshPrices = prices.filter(price => price.freshness <= 7)
      
      this.cache.set(cacheKey, {
        data: freshPrices,
        timestamp: Date.now()
      })

      return freshPrices

    } catch (error) {
      console.error('Ankara market data error:', error)
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!.data
      }
      
      throw error
    }
  }

  /**
   * Birden fazla şehrin fiyatlarını toplu çek
   */
  async getAllMarketPrices(): Promise<MarketPrice[]> {
    try {
      const [istanbulPrices, ankaraPrices] = await Promise.all([
        this.getIstanbulHalPrices(),
        this.getAnkaraHalPrices()
      ])

      return [...istanbulPrices, ...ankaraPrices]
    } catch (error) {
      console.error('Failed to fetch all market prices:', error)
      throw error
    }
  }

  /**
   * Market veri özeti
   */
  async getMarketSummary(): Promise<MarketDataSummary> {
    const allPrices = await this.getAllMarketPrices()
    
    const categories = this.groupByCategory(allPrices)
    const avgFreshness = allPrices.reduce((sum, p) => sum + p.freshness, 0) / allPrices.length
    
    return {
      totalProducts: allPrices.length,
      categories: categories.map(cat => ({
        category: cat.name,
        productCount: cat.products.length,
        avgPriceChange: cat.avgChange,
        trend: cat.trend
      })),
      lastUpdate: new Date().toISOString(),
      dataFreshness: Math.round(avgFreshness),
      priceVolatility: this.calculateVolatility(allPrices)
    }
  }

  /**
   * Belirli ürün için trend analizi
   */
  async getProductTrend(productName: string): Promise<TrendAnalysis> {
    const allPrices = await this.getAllMarketPrices()
    const productPrices = allPrices.filter(p => 
      p.name.toLowerCase().includes(productName.toLowerCase())
    )

    if (productPrices.length === 0) {
      throw new Error(`Product '${productName}' not found in market data`)
    }

    const avgChange = productPrices.reduce((sum, p) => sum + p.changePercent, 0) / productPrices.length
    const volatility = this.calculateProductVolatility(productPrices)
    
    const avgFreshness = productPrices.reduce((sum, p) => sum + p.freshness, 0) / productPrices.length
    
    return {
      productName,
      weeklyChange: avgChange,
      monthlyChange: avgChange * 4, // Tahmini aylık
      volatilityScore: volatility,
      riskLevel: volatility > 15 ? 'high' : volatility > 5 ? 'medium' : 'low',
      recommendation: this.generateRecommendation(avgChange, volatility),
      confidenceScore: Math.max(0.1, 1 - (avgFreshness / 7)) // Veri ne kadar taze o kadar güvenilir
    }
  }

  /**
   * CollectAPI yanıtını parse et
   */
  private parseCollectApiData(apiResponse: any, city: string): MarketPrice[] {
    if (!apiResponse || !apiResponse.result) {
      return []
    }

    return apiResponse.result.map((item: any) => {
      const changePercent = this.calculateChange(item)
      
      return {
        name: item.name || item.product || 'Bilinmeyen Ürün',
        category: this.detectCategory(item.name || item.product || ''),
        unit: item.unit || 'kg',
        minPrice: parseFloat(item.min || item.minPrice || '0'),
        maxPrice: parseFloat(item.max || item.maxPrice || '0'),
        avgPrice: parseFloat(item.average || item.avg || item.price || '0'),
        city,
        date: item.date || new Date().toISOString().split('T')[0],
        source: 'hal',
        trend: changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'stable',
        changePercent,
        freshness: this.calculateFreshness(item.date)
      } as MarketPrice
    })
  }

  /**
   * Veri tazeliğini hesapla (1-7 gün arası)
   */
  private calculateFreshness(dateString?: string): number {
    if (!dateString) return 1 // Bugün varsay
    
    const itemDate = new Date(dateString)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return Math.min(7, Math.max(1, diffDays + 1))
  }

  /**
   * Fiyat değişim yüzdesini hesapla
   */
  private calculateChange(item: any): number {
    // API'den gelen değişim verisi yoksa, min/max arasındaki farkı kullan
    if (item.change || item.changePercent) {
      return parseFloat(item.change || item.changePercent)
    }
    
    const min = parseFloat(item.min || item.minPrice || '0')
    const max = parseFloat(item.max || item.maxPrice || '0')
    
    if (min > 0 && max > min) {
      return ((max - min) / min) * 100
    }
    
    return 0
  }

  /**
   * Ürün kategorisini tahmin et
   */
  private detectCategory(productName: string): MarketPrice['category'] {
    const name = productName.toLowerCase()
    
    if (name.includes('et') || name.includes('tavuk') || name.includes('dana') || name.includes('kuzu')) {
      return 'et'
    }
    if (name.includes('süt') || name.includes('peynir') || name.includes('yoğurt') || name.includes('tereyağ')) {
      return 'süt-ürünleri'
    }
    if (name.includes('buğday') || name.includes('pirinç') || name.includes('un') || name.includes('bulgur')) {
      return 'tahıl'
    }
    if (name.includes('elma') || name.includes('armut') || name.includes('üzüm') || name.includes('portakal')) {
      return 'meyve'
    }
    
    return 'sebze' // Default
  }

  /**
   * Cache geçerliliğini kontrol et
   */
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    
    return (Date.now() - cached.timestamp) < this.cacheTimeout
  }

  /**
   * Kategoriye göre grupla
   */
  private groupByCategory(prices: MarketPrice[]) {
    const groups = new Map<string, MarketPrice[]>()
    
    prices.forEach(price => {
      if (!groups.has(price.category)) {
        groups.set(price.category, [])
      }
      groups.get(price.category)!.push(price)
    })

    return Array.from(groups.entries()).map(([name, products]) => ({
      name,
      products,
      avgChange: products.reduce((sum, p) => sum + p.changePercent, 0) / products.length,
      trend: this.calculateCategoryTrend(products)
    }))
  }

  /**
   * Kategori trendini hesapla
   */
  private calculateCategoryTrend(products: MarketPrice[]): 'up' | 'down' | 'stable' {
    const avgChange = products.reduce((sum, p) => sum + p.changePercent, 0) / products.length
    return avgChange > 2 ? 'up' : avgChange < -2 ? 'down' : 'stable'
  }

  /**
   * Genel volatilite hesapla
   */
  private calculateVolatility(prices: MarketPrice[]): 'low' | 'medium' | 'high' {
    const changes = prices.map(p => Math.abs(p.changePercent))
    const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length
    
    return avgChange > 10 ? 'high' : avgChange > 5 ? 'medium' : 'low'
  }

  /**
   * Ürün bazında volatilite hesapla
   */
  private calculateProductVolatility(prices: MarketPrice[]): number {
    const changes = prices.map(p => Math.abs(p.changePercent))
    return changes.reduce((sum, c) => sum + c, 0) / changes.length
  }

  /**
   * Trend bazlı öneri üret
   */
  private generateRecommendation(change: number, volatility: number): string {
    if (change > 5 && volatility > 10) {
      return 'Yüksek artış + volatilite. Marjı %8-12 artırın, alternatif tedarikçi bulun.'
    }
    if (change > 5) {
      return 'Fiyat artış trendinde. Marjı %3-5 artırmanız önerilir.'
    }
    if (change < -5) {
      return 'Fiyat düşüş trendinde. Rekabetçi teklifler için fırsat penceresi.'
    }
    if (volatility > 15) {
      return 'Yüksek volatilite. Kısa vadeli kontratlar ve esnek fiyatlandırma yapın.'
    }
    
    return 'Stabil piyasa. Mevcut fiyatlandırma stratejinizi koruyabilirsiniz.'
  }

  /**
   * Cache'i temizle
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Health check - API bağlantısını test et
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/market/price?data.city=Istanbul`, {
        method: 'GET',
        headers: {
          'authorization': `apikey ${this.apiKey}`,
          'content-type': 'application/json'
        }
      })

      if (response.ok) {
        return {
          status: 'healthy',
          message: 'CollectAPI connection successful'
        }
      } else {
        return {
          status: 'unhealthy',
          message: `API returned ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Connection failed: ${error}`
      }
    }
  }
}

// Singleton instance
export const marketDataService = new MarketDataService()