// API Route: /api/sonnet-extraction/extract
// Sonnet ekibinin implement edeceği endpoint ile entegrasyon

import { NextRequest, NextResponse } from 'next/server';
import { sonnetService } from '@/lib/services/sonnet-extraction';
import { SonnetExtractionRequest } from '@/lib/types/sonnet-extraction';

export async function POST(request: NextRequest) {
  try {
    const { document_text, document_metadata, extraction_hints } = await request.json() as SonnetExtractionRequest;
    
    // Validate required fields
    if (!document_text || !document_metadata) {
      return NextResponse.json(
        { error: 'Missing required fields: document_text and document_metadata' },
        { status: 400 }
      );
    }
    
    if (!document_metadata.filename || !document_metadata.file_type) {
      return NextResponse.json(
        { error: 'Missing required metadata: filename and file_type' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Starting Sonnet extraction for: ${document_metadata.filename}`);
    console.log(`[API] Document info: ${document_metadata.pages} pages, type: ${document_metadata.file_type}, OCR: ${document_metadata.ocr_used}`);
    
    // Call Sonnet service with retry logic
    const result = await sonnetService.extractWithRetry({
      document_text,
      document_metadata,
      extraction_hints
    }, 3, 1000);
    
    if (!result.success) {
      console.error(`[API] Sonnet extraction failed after ${result.attempts} attempts:`, result.error);
      
      return NextResponse.json(
        { 
          error: result.error,
          attempts: result.attempts,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
    console.log(`[API] Sonnet extraction successful after ${result.attempts} attempts`);
    console.log(`[API] Overall confidence: ${result.data?.confidence_score}`);
    
    // Determine review requirements based on new table-first rules
    const needsReview = result.needs_review || result.data!.confidence_score < 0.60;
    const needsVerification = result.data!.confidence_score >= 0.60 && result.data!.confidence_score < 0.90;
    const institutionBlocked = result.institution_candidates && 
      result.institution_candidates.length > 0 && 
      result.institution_candidates[0].confidence < 0.60;
    
    return NextResponse.json({
      success: true,
      extraction_data: result.data,
      institution_candidates: result.institution_candidates || [],
      processing_info: {
        attempts: result.attempts,
        needs_review: needsReview,
        needs_verification: needsVerification,
        institution_blocked: institutionBlocked,
        auto_approved: !needsReview && !needsVerification && !institutionBlocked,
        table_first_used: true,
        timestamp: new Date().toISOString()
      },
      workflow_status: {
        can_approve: !needsReview && !institutionBlocked,
        requires_institution_selection: institutionBlocked,
        manual_review_required: needsReview
      }
    });
    
  } catch (error) {
    console.error('[API] Sonnet extraction endpoint error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during extraction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  try {
    const health = await sonnetService.healthCheck();
    
    return NextResponse.json({
      service: 'sonnet-extraction',
      status: health.healthy ? 'healthy' : 'unhealthy',
      latency_ms: health.latency_ms,
      version: health.version,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        service: 'sonnet-extraction',
        status: 'error',
        error: error instanceof Error ? error.message : 'Health check failed'
      },
      { status: 503 }
    );
  }
}