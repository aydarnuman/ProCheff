// lib/services/claude.ts
import Anthropic from '@anthropic-ai/sdk'
import { getApiConfig } from '../api-config'

export class ClaudeService {
  private anthropic: Anthropic | null = null

  constructor() {
    const config = getApiConfig()
    if (config.anthropic) {
      this.anthropic = new Anthropic({
        apiKey: config.anthropic
      })
    }
  }

  async generateRecipeAnalysis(recipe: any): Promise<any> {
    if (!this.anthropic) {
      throw new Error('Claude API key not configured')
    }

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `
          Bu tarifi analiz et ve iyileştirme önerileri ver:
          ${JSON.stringify(recipe, null, 2)}
          
          Şu konularda analiz yap:
          1. Besin değeri
          2. Maliyet optimizasyonu
          3. Lezzet iyileştirmeleri
          4. Sunum önerileri
          
          JSON formatında döndür:
          {
            "nutritionalAnalysis": "besin analizi",
            "costOptimization": ["maliyet önerileri"],
            "flavorImprovements": ["lezzet önerileri"],
            "presentationTips": ["sunum önerileri"],
            "overallRating": 1-10_arası_puan,
            "improvements": ["genel iyileştirmeler"]
          }
          `
        }]
      })

      const content = message.content[0]
      if (content.type === 'text') {
        return JSON.parse(content.text)
      }
      throw new Error('Unexpected response format')

    } catch (error) {
      console.error('Claude recipe analysis error:', error)
      throw new Error('Tarif analizi yapılamadı')
    }
  }

  async optimizeInventory(currentInventory: any[], upcomingOrders: any[]): Promise<any> {
    if (!this.anthropic) {
      throw new Error('Claude API key not configured')
    }

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `
          Mevcut stok durumu: ${JSON.stringify(currentInventory)}
          Yaklaşan siparişler: ${JSON.stringify(upcomingOrders)}
          
          Stok optimizasyonu yap ve şu formatta JSON döndür:
          {
            "currentStatus": "stok durumu özeti",
            "criticalItems": ["kritik seviyedeki ürünler"],
            "orderRecommendations": [
              {
                "item": "ürün adı",
                "currentStock": number,
                "recommendedOrder": number,
                "reasoning": "neden bu kadar sipariş öneriliyor"
              }
            ],
            "costSavings": "tahmini tasarruf",
            "wasteReduction": "fire azaltma önerileri"
          }
          `
        }]
      })

      const content = message.content[0]
      if (content.type === 'text') {
        return JSON.parse(content.text)
      }
      throw new Error('Unexpected response format')

    } catch (error) {
      console.error('Claude inventory optimization error:', error)
      throw new Error('Stok optimizasyonu yapılamadı')
    }
  }

  async generateBusinessInsights(salesData: any[], costData: any[]): Promise<any> {
    if (!this.anthropic) {
      throw new Error('Claude API key not configured')
    }

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `
          Satış verileri: ${JSON.stringify(salesData)}
          Maliyet verileri: ${JSON.stringify(costData)}
          
          İş analitics raporu oluştur:
          {
            "profitabilityAnalysis": {
              "topPerformers": ["en karlı ürünler"],
              "underperformers": ["düşük performans gösterenler"],
              "profitMargins": {"ürün": kar_marjı}
            },
            "trendsAnalysis": {
              "salesTrends": "satış eğilimleri",
              "seasonalPatterns": "mevsimsel desenler",
              "growthOpportunities": ["büyüme fırsatları"]
            },
            "actionableInsights": [
              {
                "category": "kategori",
                "insight": "görüş",
                "recommendation": "öneri",
                "expectedImpact": "beklenen etki"
              }
            ],
            "keyMetrics": {
              "totalRevenue": number,
              "totalCosts": number,
              "netProfit": number,
              "profitMargin": "yüzde"
            }
          }
          `
        }]
      })

      const content = message.content[0]
      if (content.type === 'text') {
        return JSON.parse(content.text)
      }
      throw new Error('Unexpected response format')

    } catch (error) {
      console.error('Claude business insights error:', error)
      throw new Error('İş analizi yapılamadı')
    }
  }
}