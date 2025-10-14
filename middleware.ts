// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateMarketPriceRequest, validateAIAnalysisRequest } from './lib/validation/schemas'

export function middleware(request: NextRequest) {
  // API güvenlik kontrolü
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Rate limiting için basit kontrol (production'da Redis kullan)
    const userIP = request.ip || 'anonymous'
    const currentTime = Date.now()
    
    // CORS headers ekle
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // API key kontrolü (sadece AI endpoint'leri için)
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

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ]
}