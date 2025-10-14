// app/api/ai/claude-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/services/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    const claudeService = new ClaudeService()

    switch (action) {
      case 'recipe-analysis': {
        const analysis = await claudeService.generateRecipeAnalysis(data)
        return NextResponse.json({
          success: true,
          data: analysis
        })
      }

      case 'inventory-optimization': {
        const { currentInventory, upcomingOrders } = data
        const optimization = await claudeService.optimizeInventory(currentInventory, upcomingOrders)
        return NextResponse.json({
          success: true,
          data: optimization
        })
      }

      case 'business-insights': {
        const { salesData, costData } = data
        const insights = await claudeService.generateBusinessInsights(salesData, costData)
        return NextResponse.json({
          success: true,
          data: insights
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz işlem' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Claude analysis API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Claude analizi gerçekleştirilemedi',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}