// lib/services/market-scraper.ts
import { MarketName, MARKET_ENDPOINTS } from '../api-config'

interface ScrapedPrice {
  productName: string
  price: number
  unit: string
  market: MarketName
  category?: string
  imageUrl?: string
  productUrl?: string
  scrapedAt: Date
}

interface ScrapeResult {
  success: boolean
  data: ScrapedPrice[]
  error?: string
  market: MarketName
}

export class MarketScraperService {
  private readonly scrapingBeeApiKey: string | null
  private readonly baseUrl = 'https://app.scrapingbee.com/api/v1/'

  constructor(apiKey?: string) {
    this.scrapingBeeApiKey = apiKey || process.env.SCRAPING_BEE_API_KEY || null
  }

  async scrapeMarket(market: MarketName, productCategories: string[] = ['et-balik', 'sebze-meyve', 'temel-gida']): Promise<ScrapeResult> {
    if (!this.scrapingBeeApiKey) {
      return {
        success: false,
        error: 'ScrapingBee API key not configured',
        data: [],
        market
      }
    }

    try {
      const results: ScrapedPrice[] = []

      for (const category of productCategories) {
        const categoryResults = await this.scrapeCategoryPrices(market, category)
        results.push(...categoryResults)
      }

      return {
        success: true,
        data: results,
        market
      }
    } catch (error) {
      console.error(`Error scraping ${market}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        market
      }
    }
  }

  private async scrapeCategoryPrices(market: MarketName, category: string): Promise<ScrapedPrice[]> {
    const url = this.buildCategoryUrl(market, category)
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.scrapingBeeApiKey,
          url: url,
          render_js: true,
          premium_proxy: true,
          country_code: 'tr'
        })
      })

      if (!response.ok) {
        throw new Error(`Scraping failed: ${response.statusText}`)
      }

      const html = await response.text()
      return this.parseProductsFromHtml(html, market)
      
    } catch (error) {
      console.error(`Error scraping category ${category} from ${market}:`, error)
      return []
    }
  }

  private buildCategoryUrl(market: MarketName, category: string): string {
    const baseUrl = MARKET_ENDPOINTS[market]
    
    // Her market için URL yapısı farklı olabilir
    const categoryMappings: { [key in MarketName]: { [category: string]: string } } = {
      a101: {
        'et-balik': '/kategori/et-tavuk-balik',
        'sebze-meyve': '/kategori/meyve-sebze',
        'temel-gida': '/kategori/temel-gida'
      },
      bim: {
        'et-balik': '/Categories/Detail/1004',
        'sebze-meyve': '/Categories/Detail/1003',
        'temel-gida': '/Categories/Detail/1001'
      },
      sok: {
        'et-balik': '/et-tavuk-balik-c-24',
        'sebze-meyve': '/meyve-sebze-c-21',
        'temel-gida': '/temel-gida-c-26'
      },
      migros: {
        'et-balik': '/et-balik-c-134',
        'sebze-meyve': '/meyve-sebze-c-1c5',
        'temel-gida': '/temel-gida-c-16e'
      },
      metro: {
        'et-balik': '/kategori/et-balik',
        'sebze-meyve': '/kategori/meyve-sebze',
        'temel-gida': '/kategori/temel-gida'
      },
      tarımKredi: {
        'et-balik': '/kategori/et-urunleri',
        'sebze-meyve': '/kategori/sebze-meyve',
        'temel-gida': '/kategori/temel-gida'
      }
    }

    return baseUrl + (categoryMappings[market]?.[category] || '')
  }

  private parseProductsFromHtml(html: string, market: MarketName): ScrapedPrice[] {
    // Bu fonksiyon her market için özelleştirilmeli
    // Şimdilik mock data döndürüyoruz
    const mockProducts: ScrapedPrice[] = [
      {
        productName: 'Domates',
        price: Math.random() * 10 + 15,
        unit: 'kg',
        market,
        category: 'sebze-meyve',
        scrapedAt: new Date()
      },
      {
        productName: 'Soğan',
        price: Math.random() * 5 + 8,
        unit: 'kg', 
        market,
        category: 'sebze-meyve',
        scrapedAt: new Date()
      },
      {
        productName: 'Tavuk Eti',
        price: Math.random() * 20 + 85,
        unit: 'kg',
        market,
        category: 'et-balik',
        scrapedAt: new Date()
      }
    ]

    return mockProducts
  }

  async scrapeAllMarkets(): Promise<ScrapeResult[]> {
    const markets: MarketName[] = ['a101', 'bim', 'sok', 'migros', 'metro', 'tarımKredi']
    const results: ScrapeResult[] = []

    for (const market of markets) {
      const result = await this.scrapeMarket(market)
      results.push(result)
      
      // Rate limiting - marketler arası 1 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return results
  }
}

// Mock data generator for development
export const generateMockPrices = (market: MarketName): ScrapedPrice[] => {
  const products = [
    'Domates', 'Soğan', 'Patates', 'Havuç', 'Biber', 'Patlıcan', 
    'Tavuk Eti', 'Dana Eti', 'Balık', 'Yumurta',
    'Ekmek', 'Süt', 'Peynir', 'Yoğurt', 'Pirinç', 'Bulgur'
  ]

  return products.map(product => ({
    productName: product,
    price: Math.random() * 50 + 10,
    unit: ['kg', 'lt', 'adet', 'paket'][Math.floor(Math.random() * 4)],
    market,
    category: product.includes('Et') || product.includes('Balık') || product === 'Yumurta' ? 'et-balik' :
             product.includes('Domates') || product.includes('Soğan') || product.includes('Patates') ? 'sebze-meyve' : 'temel-gida',
    scrapedAt: new Date()
  }))
}