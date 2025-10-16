// app/api/analyze-specification/route.ts
// 🤖 Şartname AI Analiz API

import { NextRequest, NextResponse } from 'next/server'
import { specificationAnalyzer } from '@/lib/services/specificationAnalyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileSize } = body

    // Mock file object oluştur (gerçekte FormData ile file alınacak)
    const mockFile = new File(['sample content'], fileName, { type: 'text/plain' })
    
    // AI analizi yap
    const extractedData = await specificationAnalyzer.analyzeSpecification(mockFile)
    
    return NextResponse.json({
      success: true,
      data: extractedData
    })
    
  } catch (error) {
    console.error('Şartname analizi hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Şartname analizi başarısız oldu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}