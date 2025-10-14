// Price Tracker Service - "Nerede Ne Kaç Para?" sistemi
import { MarketDataService, MarketPrice } from './marketDataService'
import { unitLearningEngine, PricePrediction, HistoricalPricePoint } from './unitLearningEngine'
export interface ProductPrice {
  id: string
  name: string
  category: string
  unit: 'kg' | 'lt' | 'adet'
  lastUpdate: string
  freshness: number // 0-7 gün (0=bugün)
  trend: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    sparkline: number[] // Son 10 günlük fiyat değişimi
  }
  cheapestPrice: {
    market: string
    price: number
    unitPrice: number
    package: string
    amount: number
  }
  averagePrice: number
  markets: MarketPriceData[]
  analysis?: {
    packageEfficiency: string
    priceAlert?: string
    recommendation: string
  }
}

export interface MarketPriceData {
  market: string
  package: string
  price: number
  amount: number
  unitPrice: number
  status: 'cheapest' | 'average' | 'expensive'
  lastUpdate: string
  isUpdating: boolean
  error?: string
  isPredicted?: boolean
  prediction?: PricePrediction
}

export interface PriceTrackerFilters {
  category?: string
  unit?: 'all' | 'kg' | 'lt' | 'adet'
  sortBy?: 'name' | 'price' | 'trend' | 'freshness'
  trendFilter?: 'all' | 'rising' | 'falling' | 'stable'
  searchQuery?: string
}

export class PriceTrackerService {
  private cache: Map<string, ProductPrice> = new Map()
  private priceHistory: Map<string, number[]> = new Map()
  private marketDataService?: MarketDataService

  constructor() {
    this.initializeMockData()
    // MarketDataService entegrasyonu - isteğe bağlı
    try {
      this.marketDataService = new MarketDataService()
    } catch (error) {
      console.warn('MarketDataService başlatılamadı, mock data kullanılacak')
    }
    
    // İlk olarak mock data'yı yükle
    this.feedLearningEngine()
  }

  // Mevcut verileri öğrenen motora besle
  private feedLearningEngine() {
    const products = Array.from(this.cache.values())
    
    products.forEach(product => {
      product.markets.forEach(market => {
        const pricePoint: HistoricalPricePoint = {
          price: market.price,
          amount: market.amount,
          unitPrice: market.unitPrice,
          package: market.package,
          market: market.market,
          date: market.lastUpdate,
          unit: product.unit
        }
        
        unitLearningEngine.addHistoricalData(product.name, pricePoint)
      })
    })
  }

  // Eksik ambalaj boyutu için tahmin oluştur
  addPredictedMarket(product: ProductPrice, targetAmount: number, targetMarket: string): MarketPriceData {
    const prediction = unitLearningEngine.predictUnitPrice(
      product.name,
      targetAmount,
      product.unit,
      product.category
    )
    
    const predictedPrice = prediction.predictedUnitPrice * targetAmount
    
    return {
      market: targetMarket,
      package: `${targetAmount} ${product.unit}`,
      price: predictedPrice,
      amount: targetAmount,
      unitPrice: prediction.predictedUnitPrice,
      status: 'average', // Başlangıçta ortalama olarak işaretle
      lastUpdate: new Date().toISOString(),
      isUpdating: false,
      isPredicted: true,
      prediction: prediction
    }
  }

  private initializeMockData() {
    // Mock ürün verileri - gerçek API entegrasyonuna kadar
    const mockProducts: ProductPrice[] = [
      {
        id: 'bezelye-konserve',
        name: 'Bezelye Konserve',
        category: 'konserve',
        unit: 'kg',
        lastUpdate: '2025-10-14T08:45:00Z',
        freshness: 0,
        trend: {
          direction: 'up',
          percentage: 3.2,
          sparkline: [22.1, 21.8, 22.3, 22.7, 23.1, 22.9, 23.4, 22.8, 23.2, 22.98]
        },
        cheapestPrice: {
          market: 'A101',
          price: 114.90,
          unitPrice: 22.98,
          package: '5 kg',
          amount: 5.0
        },
        averagePrice: 24.96,
        markets: [
          {
            market: 'A101',
            package: '5 kg',
            price: 114.90,
            amount: 5.0,
            unitPrice: 22.98,
            status: 'cheapest',
            lastUpdate: '2025-10-14T08:45:00Z',
            isUpdating: false
          },
          {
            market: 'BİM',
            package: '2 kg',
            price: 52.50,
            amount: 2.0,
            unitPrice: 26.25,
            status: 'average',
            lastUpdate: '2025-10-14T08:30:00Z',
            isUpdating: false
          },
          {
            market: 'Migros',
            package: '800 g',
            price: 21.90,
            amount: 0.8,
            unitPrice: 27.38,
            status: 'expensive',
            lastUpdate: '2025-10-14T07:15:00Z',
            isUpdating: false
          },
          {
            market: 'Metro',
            package: '4.5 kg',
            price: 109.00,
            amount: 4.5,
            unitPrice: 24.22,
            status: 'average',
            lastUpdate: '2025-10-14T06:20:00Z',
            isUpdating: false
          },
          {
            market: 'Tarım Kredi',
            package: '2.5 kg',
            price: 59.90,
            amount: 2.5,
            unitPrice: 23.96,
            status: 'average',
            lastUpdate: '2025-10-14T05:45:00Z',
            isUpdating: false
          }
        ],
        analysis: {
          packageEfficiency: '5 kg pakette 22.98 ₺/kg • 800g pakette 27.38 ₺/kg • Büyük ambalaj %15 daha ekonomik',
          recommendation: 'Büyük ambalaj tercihi önerilir'
        }
      },
      {
        id: 'domates-salcasi',
        name: 'Domates Salçası',
        category: 'konserve',
        unit: 'kg',
        lastUpdate: '2025-10-14T07:20:00Z',
        freshness: 1,
        trend: {
          direction: 'down',
          percentage: -2.1,
          sparkline: [45.2, 44.8, 44.1, 43.7, 43.2, 42.9, 42.3, 41.8, 42.1, 41.95]
        },
        cheapestPrice: {
          market: 'BİM',
          price: 33.56,
          unitPrice: 41.95,
          package: '800 g',
          amount: 0.8
        },
        averagePrice: 44.20,
        markets: [
          {
            market: 'BİM',
            package: '800 g',
            price: 33.56,
            amount: 0.8,
            unitPrice: 41.95,
            status: 'cheapest',
            lastUpdate: '2025-10-14T07:20:00Z',
            isUpdating: false
          },
          {
            market: 'A101',
            package: '1 kg',
            price: 44.90,
            amount: 1.0,
            unitPrice: 44.90,
            status: 'average',
            lastUpdate: '2025-10-14T06:45:00Z',
            isUpdating: false
          },
          {
            market: 'Migros',
            package: '650 g',
            price: 29.90,
            amount: 0.65,
            unitPrice: 46.00,
            status: 'expensive',
            lastUpdate: '2025-10-14T05:30:00Z',
            isUpdating: false
          }
        ],
        analysis: {
          packageEfficiency: 'Küçük ambalajlarda kg fiyatı daha uygun',
          recommendation: 'Fiyat düşüş trendinde, stok yapma uygun'
        }
      },
      {
        id: 'pilav-pirinci',
        name: 'Pirinç (Baldo)',
        category: 'tahıl',
        unit: 'kg',
        lastUpdate: '2025-10-14T09:00:00Z',
        freshness: 0,
        trend: {
          direction: 'stable',
          percentage: 0.3,
          sparkline: [28.5, 28.7, 28.4, 28.6, 28.8, 28.5, 28.9, 28.6, 28.7, 28.65]
        },
        cheapestPrice: {
          market: 'Metro',
          price: 142.50,
          unitPrice: 28.50,
          package: '5 kg',
          amount: 5.0
        },
        averagePrice: 31.25,
        markets: [
          {
            market: 'Metro',
            package: '5 kg',
            price: 142.50,
            amount: 5.0,
            unitPrice: 28.50,
            status: 'cheapest',
            lastUpdate: '2025-10-14T09:00:00Z',
            isUpdating: false
          },
          {
            market: 'Carrefour',
            package: '2.5 kg',
            price: 74.50,
            amount: 2.5,
            unitPrice: 29.80,
            status: 'average',
            lastUpdate: '2025-10-14T08:15:00Z',
            isUpdating: false
          },
          {
            market: 'A101',
            package: '1 kg',
            price: 32.90,
            amount: 1.0,
            unitPrice: 32.90,
            status: 'expensive',
            lastUpdate: '2025-10-14T07:30:00Z',
            isUpdating: false
          }
        ],
        analysis: {
          packageEfficiency: 'Büyük ambalaj %13 daha ekonomik',
          recommendation: 'Fiyat stabil, normal alım önerilir'
        }
      }
    ]

    mockProducts.forEach(product => {
      this.cache.set(product.id, product)
      this.priceHistory.set(product.id, product.trend.sparkline)
    })

    // Öğrenen motor için tahminli marketler ekle
    this.addSmartPredictions()
  }

  // Akıllı tahminler ekle
  private addSmartPredictions() {
    // Bezelye konservesi için 3kg paketi tahmin et
    const bezelye = this.cache.get('bezelye-konserve')
    if (bezelye) {
      const predictedMarket = this.addPredictedMarket(bezelye, 3.0, 'Carrefour (Tahmini)')
      bezelye.markets.push(predictedMarket)
      this.cache.set('bezelye-konserve', bezelye)
    }

    // Pirinç için 10kg paketi tahmin et  
    const pirinc = this.cache.get('pilav-pirinci')
    if (pirinc) {
      const predictedMarket = this.addPredictedMarket(pirinc, 10.0, 'Şok (Tahmini)')
      pirinc.markets.push(predictedMarket)
      this.cache.set('pilav-pirinci', pirinc)
    }

    // Domates salçası için 1.5kg paketi tahmin et
    const salca = this.cache.get('domates-salcasi')
    if (salca) {
      const predictedMarket = this.addPredictedMarket(salca, 1.5, 'Metro (Tahmini)')
      salca.markets.push(predictedMarket)
      this.cache.set('domates-salcasi', salca)
    }
  }

  async getProducts(filters?: PriceTrackerFilters): Promise<ProductPrice[]> {
    let products = Array.from(this.cache.values())

    // Filtreleme
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        products = products.filter(p => p.category === filters.category)
      }
      
      if (filters.unit && filters.unit !== 'all') {
        products = products.filter(p => p.unit === filters.unit)
      }
      
      if (filters.trendFilter && filters.trendFilter !== 'all') {
        products = products.filter(p => {
          switch (filters.trendFilter) {
            case 'rising': return p.trend.direction === 'up'
            case 'falling': return p.trend.direction === 'down'
            case 'stable': return p.trend.direction === 'stable'
            default: return true
          }
        })
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        products = products.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        )
      }
    }

    // Sıralama
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price':
          products.sort((a, b) => a.cheapestPrice.unitPrice - b.cheapestPrice.unitPrice)
          break
        case 'trend':
          products.sort((a, b) => Math.abs(b.trend.percentage) - Math.abs(a.trend.percentage))
          break
        case 'freshness':
          products.sort((a, b) => a.freshness - b.freshness)
          break
        default:
          products.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
      }
    }

    return products
  }

  async getProduct(id: string): Promise<ProductPrice | null> {
    return this.cache.get(id) || null
  }

  // MarketDataService ile gerçek veri entegrasyonu
  private async integrateWithMarketData(product: ProductPrice): Promise<ProductPrice> {
    if (!this.marketDataService) return product

    try {
      // Hal verilerini çek
      const marketData = await this.marketDataService.getAllMarketPrices()
      const matchingProduct = marketData.find((item: MarketPrice) => 
        item.name.toLowerCase().includes(product.name.toLowerCase()) ||
        product.name.toLowerCase().includes(item.name.toLowerCase())
      )

      if (matchingProduct) {
        // Hal fiyatını market listesine ekle
        const halMarket: MarketPriceData = {
          market: 'Hal Fiyatı',
          package: `1 ${matchingProduct.unit}`,
          price: matchingProduct.avgPrice,
          amount: 1,
          unitPrice: matchingProduct.avgPrice,
          status: 'average',
          lastUpdate: matchingProduct.date,
          isUpdating: false
        }

        // Eğer hal fiyatı yoksa ekle
        const existingHal = product.markets.find(m => m.market === 'Hal Fiyatı')
        if (!existingHal) {
          product.markets.push(halMarket)
        } else {
          Object.assign(existingHal, halMarket)
        }

        // Trend bilgisini güncelle
        if (matchingProduct.trend) {
          product.trend.direction = matchingProduct.trend
          product.trend.percentage = matchingProduct.changePercent
        }
      }
    } catch (error) {
      console.warn('MarketDataService entegrasyonunda hata:', error)
    }

    return product
  }

  async updateProductPrice(productId: string, marketName?: string): Promise<boolean> {
    const product = this.cache.get(productId)
    if (!product) return false

    try {
      // Önce MarketDataService ile entegre et
      const updatedProduct = await this.integrateWithMarketData(product)
      
      // Güncelleme simülasyonu
      if (marketName) {
        const market = product.markets.find(m => m.market === marketName)
        if (market) {
          market.isUpdating = true
          this.cache.set(productId, { ...product })

          // 2 saniye bekle (gerçek API simülasyonu)
          await new Promise(resolve => setTimeout(resolve, 2000))

          // Fiyatı hafifçe değiştir
          const priceChange = (Math.random() - 0.5) * 2 // -1 ile +1 arası değişim
          market.price = Math.max(0, market.price + priceChange)
          market.unitPrice = market.price / market.amount
          market.lastUpdate = new Date().toISOString()
          market.isUpdating = false

          // Durumu yeniden hesapla
          const sortedMarkets = product.markets.sort((a, b) => a.unitPrice - b.unitPrice)
          sortedMarkets.forEach((m, index) => {
            if (index === 0) m.status = 'cheapest'
            else if (index === sortedMarkets.length - 1) m.status = 'expensive'
            else m.status = 'average'
          })

          this.cache.set(productId, { ...product })
        }
      } else {
        // Tüm marketleri güncelle
        product.markets.forEach(market => {
          market.isUpdating = true
        })
        this.cache.set(productId, { ...product })

        await new Promise(resolve => setTimeout(resolve, 3000))

        product.markets.forEach(market => {
          const priceChange = (Math.random() - 0.5) * 2
          market.price = Math.max(0, market.price + priceChange)
          market.unitPrice = market.price / market.amount
          market.lastUpdate = new Date().toISOString()
          market.isUpdating = false
        })

        // En ucuz fiyatı güncelle
        const cheapest = product.markets.reduce((min, current) => 
          current.unitPrice < min.unitPrice ? current : min
        )
        
        product.cheapestPrice = {
          market: cheapest.market,
          price: cheapest.price,
          unitPrice: cheapest.unitPrice,
          package: cheapest.package,
          amount: cheapest.amount
        }

        product.lastUpdate = new Date().toISOString()
        this.cache.set(productId, { ...product })
      }

      return true
    } catch (error) {
      // Hata durumu
      if (marketName) {
        const market = product.markets.find(m => m.market === marketName)
        if (market) {
          market.isUpdating = false
          market.error = 'Güncelleme başarısız'
          this.cache.set(productId, { ...product })
        }
      }
      return false
    }
  }

  async exportToCostSimulator(productId: string): Promise<any> {
    const product = this.cache.get(productId)
    if (!product) return null

    // Category mapping for Cost Simulator
    const categoryMap: Record<string, string> = {
      'konserve': 'konserve',
      'tahıl': 'tahıl',
      'sebze': 'sebze',
      'meyve': 'meyve',
      'et': 'et',
      'süt-ürünleri': 'süt-ürünleri',
      'bakliyat': 'bakliyat'
    }

    // Cost Simulator için RequiredIngredient formatı
    return {
      name: product.name,
      category: categoryMap[product.category] || product.category,
      quantity: 1000, // Default 1kg
      alternatives: product.markets.map(market => market.market).slice(0, 3),
      priority: 'important' as const,
      priceData: {
        cheapestPrice: product.cheapestPrice.unitPrice,
        averagePrice: product.averagePrice,
        supplier: product.cheapestPrice.market,
        reliability: product.freshness <= 1 ? 'high' : 'medium',
        lastUpdate: product.lastUpdate,
        trend: product.trend,
        alternatives: product.markets.map(market => ({
          supplier: market.market,
          unitPrice: market.unitPrice,
          package: market.package,
          status: market.status
        }))
      }
    }
  }

  // Cost Simulator URL'sine yönlendirme parametreleri oluştur
  generateCostSimulatorUrl(productId: string): string {
    const baseUrl = '/cost-simulator'
    const params = new URLSearchParams({
      import: 'price-tracker',
      productId: productId,
      source: 'price-comparison'
    })
    return `${baseUrl}?${params.toString()}`
  }

  getCategories(): string[] {
    return ['konserve', 'tahıl', 'sebze', 'meyve', 'et', 'süt-ürünleri', 'bakliyat']
  }

  getMarkets(): string[] {
    return ['A101', 'BİM', 'Migros', 'Metro', 'Carrefour', 'Tarım Kredi', 'Şok']
  }
}