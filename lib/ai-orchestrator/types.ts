// lib/ai-orchestrator/types.ts

export interface AIModel {
  id: string
  name: string
  provider: string
  capabilities: string[]
  costPerToken: number
  avgResponseTime: number
  reliability: number // 0-1 arası
}

export interface AIRequest {
  task: string
  context?: any
  priority: 'low' | 'medium' | 'high'
  maxCost?: number
  maxTime?: number
  requiredCapabilities?: string[]
}

export interface AIResponse {
  modelId: string
  data: any
  confidence: number // 0-1 arası
  executionTime: number
  tokenUsed: number
  cost: number
  timestamp: Date
}

export interface AIPerformanceMetric {
  modelId: string
  taskType: string
  successRate: number
  avgConfidence: number
  avgExecutionTime: number
  totalUsage: number
  costEfficiency: number
  lastUpdated: Date
}

export interface OrchestrationResult {
  selectedModel: string
  response: AIResponse
  alternativeResponses?: AIResponse[]
  reasoning: string
  confidenceScore: number
}