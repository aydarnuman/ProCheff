// app/api/advanced-analysis/route.ts
// 🎯 Gelişmiş Şartname Analizi API

import { NextRequest, NextResponse } from 'next/server'
import { advancedExtractor } from '@/lib/services/advanced-extractor'
import { kikCalculator } from '@/lib/services/kik-calculator'
import { AdvancedAnalysisRequest, AdvancedSpecificationExtraction, KIKCostCalculation } from '@/lib/types/advanced-proposal'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'Dosya bulunamadı',
          details: 'Lütfen bir şartname dosyası yükleyin'
        }
      }, { status: 400 })
    }

    // Dosya validasyonu
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Dosya boyutu çok büyük',
          details: 'Maksimum dosya boyutu 50MB olmalıdır'
        }
      }, { status: 400 })
    }

    // Analiz seçenekleri
    const analysisOptions = {
      enable_ocr: formData.get('enable_ocr') === 'true',
      confidence_threshold: parseFloat(formData.get('confidence_threshold') as string) || 0.6,
      human_review_required: formData.get('human_review_required') !== 'false',
      kik_analysis: formData.get('kik_analysis') !== 'false'
    }

    const analysisRequest: AdvancedAnalysisRequest = {
      file,
      analysis_options: analysisOptions
    }

    console.log(`🎯 Analiz başlatıldı: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // 1. Şartname ekstraksionu
    const extractedData = await advancedExtractor.extractSpecification(analysisRequest)
    
    // 2. KİK maliyet analizi
    let costCalculation: KIKCostCalculation | null = null
    if (analysisOptions.kik_analysis) {
      try {
        costCalculation = kikCalculator.calculateKIKCosts(extractedData)
        console.log(`💰 KİK analizi tamamlandı - Sınır değer: ${costCalculation.kik_calculations.threshold_value} TL`)
      } catch (error) {
        console.error('KİK hesaplama hatası:', error)
      }
    }

    // 3. İnsan kontrolü gerekli mi?
    const requiresReview = 
      extractedData.flags.requires_human_review ||
      extractedData.confidence_scores.overall < analysisOptions.confidence_threshold ||
      (costCalculation?.abnormally_low_analysis.is_abnormally_low && costCalculation.abnormally_low_analysis.risk_level !== 'düşük')

    // 4. Review session oluştur (gerekirse)
    let reviewSessionId: string | undefined
    if (requiresReview) {
      reviewSessionId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log(`👥 İnsan kontrolü gerekli - Session: ${reviewSessionId}`)
    }

    // 5. Başarılı yanıt
    const response = {
      success: true,
      data: {
        extraction_id: `extract_${Date.now()}`,
        extracted_data: extractedData,
        cost_calculation: costCalculation,
        requires_review: requiresReview,
        review_session_id: reviewSessionId,
        processing_summary: {
          file_name: file.name,
          file_size_mb: Math.round(file.size / 1024 / 1024 * 100) / 100,
          processing_time_ms: Date.now(), // Placeholder
          confidence_overall: extractedData.confidence_scores.overall,
          critical_warnings: extractedData.flags.missing_critical.length,
          kik_risk_level: costCalculation?.abnormally_low_analysis.risk_level || 'hesaplanmadı'
        }
      }
    }

    console.log(`✅ Analiz tamamlandı - Güven: ${(extractedData.confidence_scores.overall * 100).toFixed(1)}%`)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('🚨 Analiz hatası:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'Şartname analizi başarısız oldu',
        details: error instanceof Error ? error.message : 'Bilinmeyen sistem hatası'
      }
    }, { status: 500 })
  }
}

// GET endpoint - analiz durumu sorgulama
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const extractionId = searchParams.get('extraction_id')
  const reviewSessionId = searchParams.get('review_session_id')

  if (!extractionId && !reviewSessionId) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'MISSING_PARAMETER',
        message: 'extraction_id veya review_session_id parametresi gerekli'
      }
    }, { status: 400 })
  }

  // Analiz durumu sorgulama (gerçek uygulamada database'den gelecek)
  return NextResponse.json({
    success: true,
    data: {
      status: 'completed',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }
  })
}