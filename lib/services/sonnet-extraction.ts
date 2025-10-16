// Sonnet API Integration Service
// Bu service Sonnet ekibinin endpoint'ini çağırır

import { SonnetExtractionRequest, SonnetExtractionResponse, validateSonnetResponse, validateCriticalFields } from '@/lib/types/sonnet-extraction';

export class SonnetExtractionService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.apiKey = process.env.SONNET_API_KEY || '';
    this.baseUrl = process.env.SONNET_API_URL || 'https://api.sonnet.ai/v1';
    this.timeout = parseInt(process.env.SONNET_TIMEOUT_MS || '30000');
  }

  /**
   * Main extraction method - calls Sonnet team's API with table-first strategy
   */
  async extractSpecification(request: SonnetExtractionRequest): Promise<{
    success: boolean;
    data?: SonnetExtractionResponse;
    error?: string;
    processing_time_ms?: number;
    needs_review?: boolean;
    institution_candidates?: Array<{name: string; confidence: number; source_snippet: string}>;
  }> {
    const startTime = Date.now();
    
    try {
      console.log(`[SonnetService] Starting table-first extraction for ${request.document_metadata.filename}`);
      
      // Add processing hints for Sonnet
      const enhancedRequest = {
        ...request,
        processing_hints: {
          table_first_strategy: true,
          require_institution_candidates: true,
          max_candidates: 3,
          confidence_threshold: 0.60,
          snippet_max_length: 1000
        }
      };
      
      const response = await fetch(`${this.baseUrl}/extract-specification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': `procheff-${Date.now()}`,
          'X-Processing-Strategy': 'table-first',
        },
        body: JSON.stringify(enhancedRequest),
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SonnetService] API error: ${response.status} - ${errorText}`);
        
        return {
          success: false,
          error: `Sonnet API error: ${response.status} - ${response.statusText}`,
          processing_time_ms: Date.now() - startTime
        };
      }
      
      const rawData = await response.json();
      const processingTime = Date.now() - startTime;
      
      console.log(`[SonnetService] Raw response received in ${processingTime}ms`);
      
      // Validate response schema
      const validation = validateSonnetResponse(rawData);
      if (!validation.isValid) {
        console.error(`[SonnetService] Schema validation failed:`, validation.errors);
        return {
          success: false,
          error: `Invalid response schema: ${validation.errors.join(', ')}`,
          processing_time_ms: processingTime
        };
      }
      
      const extractionData = rawData as SonnetExtractionResponse;
      
      // Check for institution candidates (new requirement)
      const institutionCandidates = (rawData as any).institution_candidates || [];
      
      // Validate critical fields
      const criticalValidation = validateCriticalFields(extractionData);
      if (!criticalValidation.isValid) {
        console.warn(`[SonnetService] Critical field validation warnings:`, criticalValidation.criticalErrors);
        // Don't fail the request, but log warnings for review
      }
      
      // Determine review requirements based on confidence thresholds
      const needsReview = extractionData.confidence_score < 0.60;
      const institutionNeedsReview = institutionCandidates.length > 0 && 
        institutionCandidates[0]?.confidence < 0.60;
      
      console.log(`[SonnetService] Extraction completed successfully. Overall confidence: ${extractionData.confidence_score}`);
      console.log(`[SonnetService] Institution candidates: ${institutionCandidates.length}, needs review: ${needsReview || institutionNeedsReview}`);
      
      return {
        success: true,
        data: extractionData,
        processing_time_ms: processingTime,
        needs_review: needsReview || institutionNeedsReview,
        institution_candidates: institutionCandidates
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`[SonnetService] Extraction failed:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          return {
            success: false,
            error: 'Sonnet API timeout - document too complex or service unavailable',
            processing_time_ms: processingTime
          };
        }
        
        return {
          success: false,
          error: `Extraction failed: ${error.message}`,
          processing_time_ms: processingTime
        };
      }
      
      return {
        success: false,
        error: 'Unknown extraction error',
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Health check for Sonnet API
   */
  async healthCheck(): Promise<{ healthy: boolean; latency_ms?: number; version?: string }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000)
      });
      
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          healthy: true,
          latency_ms: latency,
          version: data.version || 'unknown'
        };
      }
      
      return { healthy: false };
      
    } catch (error) {
      console.error('[SonnetService] Health check failed:', error);
      return { healthy: false };
    }
  }

  /**
   * Retry logic for failed extractions
   */
  async extractWithRetry(
    request: SonnetExtractionRequest, 
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<{
    success: boolean;
    data?: SonnetExtractionResponse;
    error?: string;
    attempts: number;
    needs_review?: boolean;
    institution_candidates?: Array<{name: string; confidence: number; source_snippet: string}>;
  }> {
    let lastError = '';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[SonnetService] Extraction attempt ${attempt}/${maxRetries}`);
      
      const result = await this.extractSpecification(request);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          attempts: attempt,
          needs_review: result.needs_review,
          institution_candidates: result.institution_candidates
        };
      }
      
      lastError = result.error || 'Unknown error';
      
      // Don't retry on schema validation errors
      if (lastError.includes('Invalid response schema')) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = backoffMs * Math.pow(2, attempt - 1);
        console.log(`[SonnetService] Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    return {
      success: false,
      error: lastError,
      attempts: maxRetries
    };
  }

  /**
   * Batch processing for multiple documents
   */
  async extractBatch(requests: SonnetExtractionRequest[]): Promise<{
    success: boolean;
    results: Array<{
      request_id: string;
      success: boolean;
      data?: SonnetExtractionResponse;
      error?: string;
    }>;
  }> {
    console.log(`[SonnetService] Starting batch extraction for ${requests.length} documents`);
    
    const results = await Promise.allSettled(
      requests.map(async (request, index) => {
        const requestId = `batch_${Date.now()}_${index}`;
        const result = await this.extractSpecification(request);
        
        return {
          request_id: requestId,
          filename: request.document_metadata.filename,
          ...result
        };
      })
    );
    
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          request_id: result.value.request_id,
          success: result.value.success,
          data: result.value.data,
          error: result.value.error
        };
      } else {
        return {
          request_id: `batch_${Date.now()}_${index}`,
          success: false,
          error: result.reason?.message || 'Batch processing failed'
        };
      }
    });
    
    const successCount = processedResults.filter(r => r.success).length;
    console.log(`[SonnetService] Batch completed: ${successCount}/${requests.length} successful`);
    
    return {
      success: successCount > 0,
      results: processedResults
    };
  }
}

// Singleton instance
export const sonnetService = new SonnetExtractionService();