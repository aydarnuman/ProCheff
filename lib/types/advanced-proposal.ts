// lib/types/advanced-proposal.ts
// 🎯 Profesyonel Şartname Ekstraksiyon ve KİK Sistemi

export interface AdvancedSpecificationExtraction {
  // Ana proje bilgileri
  project: {
    name: string
    location: string
    administrative_unit: string
    contract_type: 'açık_ihale' | 'pazarlık' | 'doğrudan_temin' | 'diğer'
    start_date: string
    end_date: string
    duration_months: number
    daily_portions: number
    total_monthly_portions: number
  }

  // Menü detayları (yapısal)
  menu: {
    meal_type: 'kahvaltı' | 'öğle' | 'akşam' | 'ara_öğün'
    portions_per_day: number
    portion_weight_g: number
    items: {
      name: string
      gram: number
      unit: string
      category: 'ana_yemek' | 'yan_yemek' | 'çorba' | 'salata' | 'tatlı' | 'ekmek' | 'içecek'
    }[]
    serving_days: string[] // ["pazartesi", "salı", ...]
    special_requirements: string[]
  }[]

  // Personel gereksinimleri
  staff_requirements: {
    chefs: number
    serving_staff: number
    management: number
    shifts: string
    total_headcount: number
    specialized_roles: string[]
  }

  // Malzeme listesi (tablolardan çıkarılır)
  materials: {
    item_name: string
    quantity: number
    unit: string
    frequency: 'günlük' | 'haftalık' | 'aylık'
    category: string
    quality_specs: string[]
  }[]

  // Operasyonel şartlar
  operational_conditions: {
    delivery_times: string[]
    quality_criteria: string[]
    hygiene_requirements: string[]
    certification_requirements: string[]
    penalties: {
      condition: string
      penalty_amount: number
      penalty_type: 'sabit' | 'yüzde'
    }[]
  }

  // Değerlendirme kriterleri
  evaluation_criteria: {
    technical_score_weight: number
    price_score_weight: number
    experience_score_weight: number
    quality_requirements: string[]
    mandatory_documents: string[]
  }

  // Kaynak referansları (confidence için)
  source_references: {
    page: number
    section: string
    text_snippet: string
    confidence: number
    extraction_method: 'table' | 'text' | 'ocr' | 'inferred'
  }[]

  // Genel güven skoru
  confidence_scores: {
    project_name: number
    menu_details: number
    portion_weights: number
    staff_requirements: number
    materials: number
    overall: number
  }

  // Uyarılar ve eksikler
  flags: {
    missing_critical: string[]
    low_confidence_fields: string[]
    inconsistencies: string[]
    requires_human_review: boolean
  }
}

export interface KIKCostCalculation {
  // Temel maliyet bileşenleri
  unit_costs: {
    material_cost: number        // Malzeme maliyeti (TL/porsiyon)
    labor_cost: number          // İşçilik maliyeti (TL/porsiyon)
    overhead_cost: number       // Genel gider (TL/porsiyon)
    profit_margin: number       // Kâr marjı (TL/porsiyon)
    total_unit_cost: number     // Toplam birim maliyet (TL/porsiyon)
  }

  // KİK hesaplamaları
  kik_calculations: {
    K_factor: number            // K katsayısı (0.93 for yemek)
    threshold_value: number     // Sınır değer (total_unit_cost × K)
    bid_ratio_threshold: number // Aşırı düşük eşiği (0.70)
  }

  // Aşırı düşük analizi
  abnormally_low_analysis: {
    material_cost_ratio: number    // Malzeme/piyasa ortalaması
    labor_cost_ratio: number      // İşçilik/beklenen oran
    is_abnormally_low: boolean    // Genel aşırı düşük durumu
    risk_level: 'düşük' | 'orta' | 'yüksek' | 'kritik'
    risk_factors: string[]        // Risk faktörleri listesi
  }

  // Piyasa karşılaştırması
  market_comparison: {
    industry_average_unit_cost: number
    regional_price_index: number
    similar_projects_avg: number
    cost_competitiveness: 'çok_düşük' | 'düşük' | 'ortalama' | 'yüksek' | 'çok_yüksek'
  }

  // Hesaplama detayları
  calculation_details: {
    calculated_at: Date
    methodology: string
    assumptions: string[]
    data_sources: string[]
    confidence_level: number
  }
}

export interface HumanReviewSession {
  session_id: string
  specification_id: string
  reviewer_id: string
  
  // İnceleme durumu
  review_status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision'
  
  // Alan bazlı düzeltmeler
  field_corrections: {
    field_path: string          // "project.daily_portions"
    original_value: any
    corrected_value: any
    confidence_before: number
    confidence_after: number
    correction_reason: string
    human_notes: string
  }[]

  // Genel yorumlar
  review_notes: {
    section: string
    note: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    requires_action: boolean
  }[]

  // Onay durumu
  approval_status: {
    approved_by: string
    approved_at: Date | null
    final_confidence: number
    ready_for_bidding: boolean
    additional_requirements: string[]
  }
}

export interface ProposalOutput {
  // Executive summary
  executive_summary: {
    project_overview: string
    key_numbers: {
      daily_portions: number
      contract_duration: string
      estimated_monthly_cost: number
      recommended_unit_price: number
    }
    critical_requirements: string[]
    risk_assessment: string
    recommendation: string
  }

  // Detaylı JSON (machine readable)
  detailed_json: AdvancedSpecificationExtraction
  
  // KİK analizi
  cost_analysis: KIKCostCalculation

  // Dokümantasyon
  documents: {
    executive_pdf: string       // Base64 encoded PDF
    detailed_excel: string      // Base64 encoded Excel
    kik_compliance_report: string // KİK uyumluluk raporu
    technical_specifications: string // Teknik şartname özeti
  }

  // Meta bilgiler
  metadata: {
    generated_at: Date
    version: string
    processing_time_ms: number
    total_confidence: number
    human_reviewed: boolean
    approved_for_bidding: boolean
  }
}

// API Request/Response Types
export interface AdvancedAnalysisRequest {
  file: File
  analysis_options?: {
    enable_ocr: boolean
    confidence_threshold: number
    human_review_required: boolean
    kik_analysis: boolean
  }
}

export interface AdvancedAnalysisResponse {
  success: boolean
  data?: {
    extraction_id: string
    extracted_data: AdvancedSpecificationExtraction
    cost_calculation: KIKCostCalculation
    requires_review: boolean
    review_session_id?: string
  }
  error?: {
    code: string
    message: string
    details: any
  }
}