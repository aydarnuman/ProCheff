// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateMarketPriceRequest, validateAIAnalysisRequest } from './lib/validation/schemas'

export function middleware(request: NextRequest) {
  // Sadece AI endpoint'leri için API key kontrolü
  if (request.nextUrl.pathname.startsWith('/api/ai/')) {
    const hasApiKeys = process.env.ANTHROPIC_API_KEY || 
                       process.env.OPENAI_API_KEY || 
                       process.env.GOOGLE_GEMINI_API_KEY

    if (!hasApiKeys) {
      return NextResponse.json(
        { success: false, error: 'AI servisleri yapılandırılmamış' },
        { status: 503 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ]
}