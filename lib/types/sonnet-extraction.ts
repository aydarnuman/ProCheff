// Sonnet Ekibi İçin - TypeScript Tipler ve Validasyon
// Bu dosya SONNET_DELIVERY_SPEC.md'deki JSON schema'nın TypeScript karşılığıdır

export interface SonnetExtractionRequest {
  // Raw input
  document_text: string;
  document_metadata: {
    filename: string;
    pages: number;
    file_type: 'pdf' | 'word' | 'image';
    ocr_used: boolean;
  };
  
  // Processing hints
  extraction_hints?: {
    institution_type_hint?: string;
    expected_servings_range?: [number, number];
    expected_currency?: string;
  };
}

export interface SonnetExtractionResponse {
  // Core extracted data (EXACT schema match with SONNET_DELIVERY_SPEC.md)
  project_name: string | null;
  location: string | null;
  institution_type: string | null;
  start_date: string | null; // YYYY-MM-DD format
  end_date: string | null; // YYYY-MM-DD format
  contract_duration_days: number | null;
  servings_per_day: number | null;
  currency: string | null; // 3-letter ISO code
  
  meal_types: Array<{
    name: 'kahvaltı' | 'öğle' | 'akşam' | 'ara_öğün';
    frequency_per_week: number | null;
    portion_gram_per_person: number;
    menu_examples: string[];
  }>;
  
  dietary_restrictions: Array<'helal' | 'vejeteryan' | 'vegan' | 'glütensiz' | 'diyabetik' | 'hipertansiyon' | 'böbrek_hastası'>;
  critical_requirements: string[];
  notes: string | null;
  
  // Confidence and validation
  confidence_score: number; // 0.0-1.0
  field_confidences: {
    project_name?: number;
    location?: number;
    servings_per_day?: number;
    start_date?: number;
    meal_types?: number;
    [key: string]: number | undefined;
  };
  
  snippets: Array<{
    field: string;
    page: number;
    short_text_reference: string; // Max 1000 chars
  }>;
  
  error: string | null;
  
  // Processing metadata (for Sonnet team internal use)
  processing_metadata?: {
    model_version: string;
    processing_time_ms: number;
    source_evidence_types: Record<string, 'table_cell' | 'explicit_paragraph_match' | 'multiple_overlapping_snippets' | 'single_sentence_inference' | 'model_inferred_no_source'>;
    parsing_confidence_scores: Record<string, number>;
    model_self_confidence: number;
  };
}

// Validation functions that Sonnet team should implement
export const validateSonnetResponse = (response: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields check
  if (typeof response.confidence_score !== 'number' || response.confidence_score < 0 || response.confidence_score > 1) {
    errors.push('confidence_score must be a number between 0 and 1');
  }
  
  if (!response.field_confidences || typeof response.field_confidences !== 'object') {
    errors.push('field_confidences is required and must be an object');
  }
  
  if (!Array.isArray(response.snippets)) {
    errors.push('snippets must be an array');
  }
  
  // Date format validation
  const dateFields = ['start_date', 'end_date'];
  dateFields.forEach(field => {
    if (response[field] && !/^\d{4}-\d{2}-\d{2}$/.test(response[field])) {
      errors.push(`${field} must be in YYYY-MM-DD format`);
    }
  });
  
  // Currency validation
  if (response.currency && !/^[A-Z]{3}$/.test(response.currency)) {
    errors.push('currency must be a 3-letter ISO code');
  }
  
  // Meal types validation
  if (Array.isArray(response.meal_types)) {
    response.meal_types.forEach((meal: any, index: number) => {
      if (!meal.name || !['kahvaltı', 'öğle', 'akşam', 'ara_öğün'].includes(meal.name)) {
        errors.push(`meal_types[${index}].name must be one of: kahvaltı, öğle, akşam, ara_öğün`);
      }
      if (typeof meal.portion_gram_per_person !== 'number' || meal.portion_gram_per_person < 50 || meal.portion_gram_per_person > 2000) {
        errors.push(`meal_types[${index}].portion_gram_per_person must be a number between 50 and 2000`);
      }
    });
  }
  
  // Servings validation
  if (response.servings_per_day !== null && (typeof response.servings_per_day !== 'number' || response.servings_per_day < 10 || response.servings_per_day > 50000)) {
    errors.push('servings_per_day must be a number between 10 and 50000');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Confidence calculation helper (Sonnet team should implement this logic)
export const calculateFieldConfidence = (
  modelSelfConfidence: number,
  sourceEvidence: 'table_cell' | 'explicit_paragraph_match' | 'multiple_overlapping_snippets' | 'single_sentence_inference' | 'model_inferred_no_source',
  parsingConfidence: number
): number => {
  const sourceScores = {
    'table_cell': 1.0,
    'explicit_paragraph_match': 0.9,
    'multiple_overlapping_snippets': 0.85,
    'single_sentence_inference': 0.55,
    'model_inferred_no_source': 0.10
  };
  
  const sourceEvidence_score = sourceScores[sourceEvidence];
  
  // Formula from SONNET_DELIVERY_SPEC.md
  return 0.2 * modelSelfConfidence + 0.5 * sourceEvidence_score + 0.3 * parsingConfidence;
};

// Status determination based on confidence
export const determineFieldStatus = (confidence: number): 'AUTO_APPROVED' | 'NEEDS_VERIFICATION' | 'NEEDS_REVIEW' => {
  if (confidence >= 0.90) return 'AUTO_APPROVED';
  if (confidence >= 0.60) return 'NEEDS_VERIFICATION';
  return 'NEEDS_REVIEW';
};

// Critical field validation
export const validateCriticalFields = (response: SonnetExtractionResponse): { isValid: boolean; criticalErrors: string[] } => {
  const criticalErrors: string[] = [];
  
  // Critical field minimum confidence requirements
  if (response.field_confidences.servings_per_day !== undefined && response.field_confidences.servings_per_day < 0.70) {
    criticalErrors.push('servings_per_day confidence below required threshold (0.70)');
  }
  
  if (response.meal_types.length > 0 && response.field_confidences.meal_types !== undefined && response.field_confidences.meal_types < 0.70) {
    criticalErrors.push('meal_types confidence below required threshold (0.70)');
  }
  
  if (response.field_confidences.start_date !== undefined && response.field_confidences.start_date < 0.80) {
    criticalErrors.push('start_date confidence below required threshold (0.80)');
  }
  
  return {
    isValid: criticalErrors.length === 0,
    criticalErrors
  };
};

// Test helper for Sonnet team
export const createTestResponse = (): SonnetExtractionResponse => ({
  project_name: "Ankara Şehir Hastanesi Yemekhane İşletmesi",
  location: "Ankara/Çankaya", 
  institution_type: "hastane",
  start_date: "2025-01-01",
  end_date: "2026-12-31",
  contract_duration_days: 730,
  servings_per_day: 3000,
  currency: "TRY",
  meal_types: [
    {
      name: "kahvaltı",
      frequency_per_week: 7,
      portion_gram_per_person: 200,
      menu_examples: ["Ekmek 50g", "Peynir 30g", "Çay"]
    },
    {
      name: "öğle", 
      frequency_per_week: 7,
      portion_gram_per_person: 500,
      menu_examples: ["Ana yemek 200g", "Pilav 150g", "Salata 100g"]
    }
  ],
  dietary_restrictions: ["helal"],
  critical_requirements: ["HACCP sertifikası", "Soğuk zincir", "Günlük menü onayı"],
  notes: "Ramazan aylarında özel menü düzenlemesi gereklidir",
  confidence_score: 0.87,
  field_confidences: {
    project_name: 0.95,
    location: 0.90,
    servings_per_day: 0.88,
    start_date: 0.92,
    meal_types: 0.85
  },
  snippets: [
    {
      field: "servings_per_day", 
      page: 1,
      short_text_reference: "Günlük 3.000 porsiyon ana yemek servisi yapılacaktır..."
    },
    {
      field: "project_name",
      page: 1, 
      short_text_reference: "ANKARA ŞEHİR HASTANESİ YEMEKHANESİ İŞLETME İHALESİ ŞARTNAME"
    }
  ],
  error: null
});