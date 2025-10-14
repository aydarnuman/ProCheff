// app/api/ai/menu-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { OpenAIService } from '@/lib/services/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ingredients, budget, dietaryRestrictions } = body

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { success: false, error: 'Malzemeler gerekli' },
        { status: 400 }
      )
    }

    const openaiService = new OpenAIService()
    const suggestions = await openaiService.generateMenuSuggestions(
      ingredients,
      budget || 1000,
      dietaryRestrictions
    )

    return NextResponse.json({
      success: true,
      data: suggestions
    })

  } catch (error) {
    console.error('Menu suggestions API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Menü önerileri oluşturulamadı',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}