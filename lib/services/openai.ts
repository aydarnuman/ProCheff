// lib/services/openai.ts
import { getApiConfig } from '../api-config'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface MenuOptimization {
  currentMenu: string[]
  suggestions: string[]
  costSavings: number
  reasoning: string
}

export class OpenAIService {
  private apiKey: string | null = null
  private baseUrl = 'https://api.openai.com/v1'

  constructor() {
    const config = getApiConfig()
    this.apiKey = config.openai || null
  }

  async generateMenuSuggestions(
    currentIngredients: string[],
    budget: number,
    dietaryRestrictions?: string[]
  ): Promise<MenuOptimization> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Sen profesyonel bir şef ve menü optimizasyon uzmanısın. Restoran için maliyet etkin ve lezzetli menü önerileri veriyorsun. Türkçe yanıt ver.`
      },
      {
        role: 'user',
        content: `
        Mevcut malzemelerim: ${currentIngredients.join(', ')}
        Bütçem: ${budget}₺
        ${dietaryRestrictions?.length ? `Diyet kısıtlamaları: ${dietaryRestrictions.join(', ')}` : ''}
        
        Bu malzemelerle optimal menü önerisi ver. JSON formatında döndür:
        {
          "currentMenu": ["mevcut menü önerileri"],
          "suggestions": ["iyileştirme önerileri"],
          "costSavings": estimated_savings_amount,
          "reasoning": "neden bu önerileri verdiğinin açıklaması"
        }
        `
      }
    ]

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // JSON parse et
      const result = JSON.parse(content)
      return result
      
    } catch (error) {
      console.error('OpenAI menu suggestion error:', error)
      throw new Error('Menü önerileri oluşturulamadı')
    }
  }

  async generateRecipeFromIngredients(ingredients: string[]): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Sen yaratıcı bir şefsin. Verilen malzemelerle lezzetli tarifler oluşturuyorsun. Her tarifi detaylı olarak Türkçe açıkla.`
      },
      {
        role: 'user',
        content: `
        Bu malzemelerle bir tarif öner: ${ingredients.join(', ')}
        
        Şu formatta JSON döndür:
        {
          "recipeName": "tarif adı",
          "ingredients": [{"name": "malzeme", "amount": "miktar", "unit": "birim"}],
          "instructions": ["adım 1", "adım 2", "..."],
          "cookingTime": "dakika",
          "difficulty": "kolay/orta/zor",
          "servings": number,
          "tips": ["ipucu 1", "ipucu 2"]
        }
        `
      }
    ]

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages,
          temperature: 0.8,
          max_tokens: 1200
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content)
      
    } catch (error) {
      console.error('OpenAI recipe generation error:', error)
      throw new Error('Tarif oluşturulamadı')
    }
  }

  async analyzeCostEfficiency(
    menuItems: any[],
    marketPrices: any[]
  ): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Sen bir restoran maliyet analiz uzmanısın. Menü öğelerinin maliyet etkinliğini analiz edip optimizasyon önerileri veriyorsun.`
      },
      {
        role: 'user',
        content: `
        Menü öğelerim: ${JSON.stringify(menuItems)}
        Güncel market fiyatları: ${JSON.stringify(marketPrices)}
        
        Maliyet analizi yap ve şu formatta JSON döndür:
        {
          "totalCostAnalysis": {
            "currentTotalCost": number,
            "optimizedCost": number,
            "potentialSavings": number
          },
          "itemAnalysis": [
            {
              "itemName": "string",
              "currentCost": number,
              "optimizedCost": number,
              "recommendations": ["öneri 1", "öneri 2"]
            }
          ],
          "generalRecommendations": ["genel öneri 1", "genel öneri 2"]
        }
        `
      }
    ]

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages,
          temperature: 0.3,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content)
      
    } catch (error) {
      console.error('OpenAI cost analysis error:', error)
      throw new Error('Maliyet analizi yapılamadı')
    }
  }
}