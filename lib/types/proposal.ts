// lib/types/proposal.ts
// 🎯 Şartname Analizi ve Teklif Sistemi

export interface SpecificationUpload {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  uploadDate: Date
  status: 'processing' | 'analyzed' | 'approved' | 'rejected'
}

export interface ExtractedData {
  projectInfo: {
    name: string
    location: string
    institution: string
    contractPeriod: string
    startDate: string
    endDate: string
  }
  servingDetails: {
    dailyServings: number
    mealsPerDay: number
    totalServings: number
    specialRequirements: string[]
  }
  portionSizes: {
    [mealType: string]: {
      mainCourse: number  // gram
      side: number
      soup: number
      dessert: number
      bread: number
    }
  }
  nutritionalRequirements: {
    calories: number
    protein: number
    carbs: number
    fat: number
    specialDiets: string[]
  }
  qualityStandards: {
    certifications: string[]
    hygiene: string[]
    storage: string[]
    service: string[]
  }
  budgetInfo: {
    estimatedBudget?: number
    maxPricePerServing?: number
    paymentTerms?: string
  }
  aiConfidence: number
  warnings: string[]
  extractedAt: Date
}

export interface ReviewedData extends ExtractedData {
  isApproved: boolean
  userAdjustments: {
    [key: string]: any
  }
  reviewNotes: string
  reviewedAt: Date
  reviewedBy: string
}

export interface CostCalculation {
  ingredients: {
    category: string
    items: {
      name: string
      quantity: number
      unit: string
      unitPrice: number
      totalCost: number
      supplier?: string
    }[]
    subtotal: number
  }[]
  labor: {
    chefs: number
    assistants: number
    service: number
    management: number
    totalMonthlyCost: number
  }
  operational: {
    energy: number
    rent: number
    equipment: number
    hygiene: number
    insurance: number
    other: number
    subtotal: number
  }
  margins: {
    overhead: number      // %
    profit: number        // %
    contingency: number   // %
  }
  totals: {
    ingredientCost: number
    laborCost: number
    operationalCost: number
    subtotal: number
    overheadAmount: number
    profitAmount: number
    contingencyAmount: number
    finalTotal: number
    pricePerServing: number
  }
  calculatedAt: Date
}

export interface ProposalDocument {
  id: string
  specificationId: string
  projectData: ReviewedData
  costCalculation: CostCalculation
  proposalSections: {
    executive: string        // Yönetici özeti
    technical: string        // Teknik özellikler
    methodology: string      // Yöntem
    timeline: string         // Zaman planı
    quality: string          // Kalite güvencesi
    pricing: string          // Fiyatlandırma
    terms: string           // Şartlar
  }
  documents: {
    pdf: string             // Base64 PDF
    word: string            // Base64 Word
    excel: string           // Base64 Excel
  }
  status: 'draft' | 'ready' | 'sent' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

export interface ProjectTracking {
  id: string
  proposalId: string
  isActive: boolean
  actualCosts: {
    date: Date
    category: string
    amount: number
    description: string
    variance: number        // vs planned
  }[]
  monthlyReports: {
    month: string
    plannedCost: number
    actualCost: number
    variance: number
    varancePercentage: number
    notes: string
  }[]
  alerts: {
    type: 'budget_exceeded' | 'cost_spike' | 'quality_issue'
    message: string
    severity: 'low' | 'medium' | 'high'
    date: Date
    resolved: boolean
  }[]
  createdAt: Date
  updatedAt: Date
}

// API Request/Response Types
export interface AnalyzeSpecRequest {
  file: File
  extractionPrompt?: string
}

export interface AnalyzeSpecResponse {
  success: boolean
  data?: {
    specificationId: string
    extractedData: ExtractedData
  }
  error?: string
}

export interface ReviewDataRequest {
  specificationId: string
  reviewedData: ReviewedData
}

export interface CalculateCostRequest {
  specificationId: string
  projectData: ReviewedData
  customRates?: {
    laborRates?: { [role: string]: number }
    operationalRates?: { [category: string]: number }
    margins?: { overhead: number, profit: number, contingency: number }
  }
}

export interface GenerateProposalRequest {
  specificationId: string
  costCalculation: CostCalculation
  customSections?: Partial<ProposalDocument['proposalSections']>
  template?: 'standard' | 'detailed' | 'simple'
}

export interface ProposalWorkflowState {
  currentStep: 'upload' | 'analyze' | 'review' | 'calculate' | 'generate' | 'track'
  specificationUpload?: SpecificationUpload
  extractedData?: ExtractedData
  reviewedData?: ReviewedData
  costCalculation?: CostCalculation
  proposalDocument?: ProposalDocument
  projectTracking?: ProjectTracking
}