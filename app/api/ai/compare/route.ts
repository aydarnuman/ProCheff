// app/api/ai/compare/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GeminiPriceService } from '@/lib/services/gemini'
import { OpenAIService } from '@/lib/services/openai'
import { ClaudeService } from '@/lib/services/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, data } = body

    // Aynı görev için 3 AI servisini karşılaştır
    const results: {
      gemini: any
      openai: any
      claude: any
      comparison: any
    } = {
      gemini: null,
      openai: null,
      claude: null,
      comparison: null
    }

    if (task === 'price-analysis' && data.prices) {
      try {
        // Gemini ile fiyat analizi
        const geminiService = new GeminiPriceService()
        results.gemini = await geminiService.analyzePrices(data.prices)
      } catch (error) {
        console.error('Gemini error:', error)
        results.gemini = { error: 'Gemini analizi başarısız' }
      }

      // Comparison summary
      results.comparison = {
        task: 'Fiyat Analizi',
        geminiStrength: 'Web scraping ve güncel veri analizi',
        openaiStrength: 'Yaratıcı öneriler ve menü optimizasyonu',
        claudeStrength: 'Detaylı maliyet analizi ve iş zekası',
        recommendation: 'Fiyat analizi için Gemini, menü optimizasyonu için OpenAI, iş analizi için Claude kullanın'
      }
    }

    if (task === 'menu-optimization' && data.ingredients) {
      try {
        // OpenAI ile menü önerisi
        const openaiService = new OpenAIService()
        results.openai = await openaiService.generateMenuSuggestions(
          data.ingredients,
          data.budget || 1000,
          data.dietaryRestrictions
        )
      } catch (error) {
        console.error('OpenAI error:', error)
        results.openai = { error: 'OpenAI analizi başarısız' }
      }

      try {
        // Claude ile tarif analizi
        const claudeService = new ClaudeService()
        const mockRecipe = {
          name: 'Önerilen Menü',
          ingredients: data.ingredients,
          instructions: ['Malzemeleri hazırla', 'Pişirme işlemini başlat'],
          servings: 4
        }
        results.claude = await claudeService.generateRecipeAnalysis(mockRecipe)
      } catch (error) {
        console.error('Claude error:', error)
        results.claude = { error: 'Claude analizi başarısız' }
      }

      results.comparison = {
        task: 'Menü Optimizasyonu',
        geminiStrength: 'Piyasa verisi entegrasyonu',
        openaiStrength: 'Yaratıcı menü kombinasyonları',
        claudeStrength: 'Besin değeri ve maliyet analizi',
        recommendation: 'En iyi sonuç için 3 servisi birlikte kullanın'
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI comparison API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'AI karşılaştırması gerçekleştirilemedi',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}