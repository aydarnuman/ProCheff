// app/api/market-prices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MarketScraperService, generateMockPrices } from '@/lib/services/market-scraper'
import { GeminiPriceService } from '@/lib/services/gemini'
import { MarketName } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const market = searchParams.get('market') as MarketName
    const useMock = searchParams.get('mock') === 'true'

    if (useMock) {
      // Development için mock data kullan
      const markets: MarketName[] = ['a101', 'bim', 'sok', 'migros', 'metro', 'tarımKredi']
      const allPrices = markets.map(m => ({
        market: m,
        success: true,
        data: generateMockPrices(m),
        error: undefined
      }))

      return NextResponse.json({
        success: true,
        data: allPrices,
        timestamp: new Date().toISOString()
      })
    }

    const scraper = new MarketScraperService()

    if (market) {
      const result = await scraper.scrapeMarket(market)
      return NextResponse.json({
        success: result.success,
        data: [result],
        error: result.error
      })
    } else {
      const results = await scraper.scrapeAllMarkets()
      return NextResponse.json({
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Market prices API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Market fiyatları alınamadı',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === 'analyze') {
      const geminiService = new GeminiPriceService()
      const analysis = await geminiService.analyzePrices(data)
      
      return NextResponse.json({
        success: true,
        analysis
      })
    }

    if (action === 'recommendations') {
      const geminiService = new GeminiPriceService()
      const recommendations = await geminiService.generatePurchaseRecommendations(data)
      
      return NextResponse.json({
        success: true,
        recommendations
      })
    }

    if (action === 'predict') {
      const geminiService = new GeminiPriceService()
      const predictions = await geminiService.predictPriceTrends(data)
      
      return NextResponse.json({
        success: true,
        predictions
      })
    }

    return NextResponse.json(
      { success: false, error: 'Geçersiz işlem' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Market prices POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'İşlem gerçekleştirilemedi',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}