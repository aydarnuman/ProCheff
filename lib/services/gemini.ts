// lib/services/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getApiConfig } from '../api-config'

interface MarketPrice {
  productName: string
  market: string
  price: number
  unit: string
  date: string
  url?: string
}

interface PriceAnalysis {
  product: string
  averagePrice: number
  priceRange: { min: number, max: number }
  trend: 'increasing' | 'decreasing' | 'stable'
  recommendation: string
  bestMarket: string
  savings: number
}

export class GeminiPriceService {
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    const config = getApiConfig()
    if (config.gemini) {
      this.genAI = new GoogleGenerativeAI(config.gemini)
    }
  }

  async analyzePrices(prices: MarketPrice[]): Promise<PriceAnalysis[]> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured')
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
    Aşağıdaki market fiyat verilerini analiz et ve her ürün için öneriler ver:
    
    ${JSON.stringify(prices, null, 2)}
    
    Her ürün için şu bilgileri JSON formatında döndür:
    - product: ürün adı
    - averagePrice: ortalama fiyat
    - priceRange: { min, max } fiyat aralığı
    - trend: 'increasing', 'decreasing', 'stable' trend durumu
    - recommendation: satın alma önerisi (Türkçe)
    - bestMarket: en uygun market
    - savings: en pahalı markete göre tasarruf miktarı
    
    Sadece JSON array döndür, başka açıklama ekleme.
    `

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const analysis = JSON.parse(response.text())
      return analysis
    } catch (error) {
      console.error('Gemini price analysis error:', error)
      throw new Error('Fiyat analizi yapılamadı')
    }
  }

  async generatePurchaseRecommendations(analysis: PriceAnalysis[]): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured')
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
    Aşağıdaki fiyat analizi verilerine dayanarak, bir restoranın bu hafta için satın alma stratejisi öner:
    
    ${JSON.stringify(analysis, null, 2)}
    
    Şu konularda öneride bulun:
    1. Hangi ürünleri bu hafta almalı, hangilerini beklemeli
    2. Hangi marketlerden alışveriş yapmalı
    3. Toplam ne kadar tasarruf edebilir
    4. Fiyat artışı beklenilen ürünler için stok önerisi
    
    Türkçe, profesyonel ve uygulanabilir öneriler ver.
    `

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini recommendation error:', error)
      throw new Error('Satın alma önerileri oluşturulamadı')
    }
  }

  async predictPriceTrends(historicalPrices: MarketPrice[]): Promise<{ [product: string]: string }> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured')
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
    Aşağıdaki geçmiş fiyat verilerini analiz ederek, önümüzdeki hafta için fiyat tahminleri yap:
    
    ${JSON.stringify(historicalPrices, null, 2)}
    
    Her ürün için şu formatta tahmin ver:
    {
      "productName": "2-3 cümlelik trend analizi ve fiyat tahmini"
    }
    
    Sadece JSON formatında döndür.
    `

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return JSON.parse(response.text())
    } catch (error) {
      console.error('Gemini prediction error:', error)
      throw new Error('Fiyat tahmini yapılamadı')
    }
  }
}