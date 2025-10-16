// API Route: /api/sonnet-extraction/batch
// Çoklu doküman işleme endpoint'i

import { NextRequest, NextResponse } from 'next/server';
import { sonnetService } from '@/lib/services/sonnet-extraction';
import { SonnetExtractionRequest } from '@/lib/types/sonnet-extraction';

export async function POST(request: NextRequest) {
  try {
    const { requests } = await request.json() as { requests: SonnetExtractionRequest[] };
    
    // Validate batch request
    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { error: 'Invalid batch request: requests array is required and cannot be empty' },
        { status: 400 }
      );
    }
    
    if (requests.length > 10) {
      return NextResponse.json(
        { error: 'Batch size too large: maximum 10 documents per batch' },
        { status: 400 }
      );
    }
    
    // Validate each request
    for (let i = 0; i < requests.length; i++) {
      const req = requests[i];
      if (!req.document_text || !req.document_metadata?.filename || !req.document_metadata?.file_type) {
        return NextResponse.json(
          { error: `Invalid request at index ${i}: missing required fields` },
          { status: 400 }
        );
      }
    }
    
    console.log(`[API] Starting Sonnet batch extraction for ${requests.length} documents`);
    
    const startTime = Date.now();
    const result = await sonnetService.extractBatch(requests);
    const processingTime = Date.now() - startTime;
    
    console.log(`[API] Batch extraction completed in ${processingTime}ms`);
    
    // Calculate success statistics
    const successCount = result.results.filter(r => r.success).length;
    const failureCount = result.results.length - successCount;
    
    return NextResponse.json({
      success: result.success,
      batch_info: {
        total_documents: requests.length,
        successful_extractions: successCount,
        failed_extractions: failureCount,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString()
      },
      results: result.results.map(r => ({
        request_id: r.request_id,
        success: r.success,
        extraction_data: r.data,
        error: r.error,
        needs_review: r.data ? r.data.confidence_score < 0.60 : true,
        needs_verification: r.data ? (r.data.confidence_score >= 0.60 && r.data.confidence_score < 0.90) : false
      }))
    });
    
  } catch (error) {
    console.error('[API] Sonnet batch extraction error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during batch extraction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}