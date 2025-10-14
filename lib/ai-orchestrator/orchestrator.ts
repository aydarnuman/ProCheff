// lib/ai-orchestrator/orchestrator.ts

import { AIModel, AIRequest, AIResponse, AIPerformanceMetric, OrchestrationResult } from './types'
import { ClaudeService } from '../services/claude'
import { ContextStore, ContextEntry } from './context-store'
import { ReflexiveAI, SelfAssessmentResult } from './reflexive-ai'

/**
 * 🧠 ProCheff AI Orchestrator - Meta-Zeka Sistemi
 * 
 * Bu sınıf tüm AI modellerini yönetir, performanslarını izler 
 * ve her görev için en uygun modeli seçer.
 */
export class AIOrchestrator {
  private models: Map<string, AIModel> = new Map()
  private performanceMetrics: Map<string, AIPerformanceMetric[]> = new Map()
  private contextStore: ContextStore = new ContextStore()
  private reflexiveAI: ReflexiveAI = new ReflexiveAI()
  private selfAssessments: SelfAssessmentResult[] = []

  constructor() {
    this.initializeModels()
  }

  /**
   * Mevcut AI modellerini kaydet
   */
  private initializeModels() {
    const models: AIModel[] = [
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        capabilities: ['recipe-analysis', 'cost-calculation', 'fast-response'],
        costPerToken: 0.00025,
        avgResponseTime: 2000,
        reliability: 0.92
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet', 
        provider: 'Anthropic',
        capabilities: ['complex-analysis', 'menu-optimization', 'trend-analysis'],
        costPerToken: 0.003,
        avgResponseTime: 4000,
        reliability: 0.95
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        capabilities: ['creative-suggestions', 'recipe-generation', 'cost-analysis'],
        costPerToken: 0.01,
        avgResponseTime: 3000,
        reliability: 0.88
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'Google',
        capabilities: ['market-analysis', 'price-prediction', 'real-time-data'],
        costPerToken: 0.0005,
        avgResponseTime: 2500,
        reliability: 0.90
      }
    ]

    models.forEach(model => {
      this.models.set(model.id, model)
    })
  }

  /**
   * 🎯 Akıllı Model Seçimi
   * Görev tipine, performans geçmişine ve bağlama göre en iyi modeli seç
   */
  async selectBestModel(request: AIRequest): Promise<string> {
    const candidateModels = Array.from(this.models.values())
      .filter(model => {
        // Gerekli yetenekleri kontrol et
        if (request.requiredCapabilities) {
          return request.requiredCapabilities.every(cap => 
            model.capabilities.includes(cap)
          )
        }
        return true
      })
      .filter(model => {
        // Maliyet sınırını kontrol et
        if (request.maxCost) {
          const estimatedCost = model.costPerToken * 1000 // Tahmini 1000 token
          return estimatedCost <= request.maxCost
        }
        return true
      })

    if (candidateModels.length === 0) {
      throw new Error('Kriterlere uygun AI model bulunamadı')
    }

    // Performans skoruna göre sırala
    const scoredModels = candidateModels.map(model => ({
      model,
      score: this.calculateModelScore(model, request)
    })).sort((a, b) => b.score - a.score)

    return scoredModels[0].model.id
  }

  /**
   * 📊 Model Performans Skoru Hesaplama
   */
  private calculateModelScore(model: AIModel, request: AIRequest): number {
    const metrics = this.getModelMetrics(model.id, request.task)
    
    let score = 0
    
    // Güvenilirlik (40%)
    score += model.reliability * 0.4
    
    // Geçmiş başarı oranı (30%)
    if (metrics) {
      score += metrics.successRate * 0.3
    } else {
      score += 0.15 // Varsayılan orta skor
    }
    
    // Maliyet etkinliği (20%)
    const costEfficiency = 1 / model.costPerToken
    score += (costEfficiency / 10000) * 0.2
    
    // Hız (10%)
    const speedScore = Math.max(0, (10000 - model.avgResponseTime) / 10000)
    score += speedScore * 0.1
    
    // Öncelik bonusu
    if (request.priority === 'high') {
      score *= 1.1
    }
    
    return score
  }

  /**
   * 🎭 Paralel AI Çalıştırma ve Karşılaştırma
   */
  async runParallelComparison(request: AIRequest): Promise<OrchestrationResult> {
    const selectedModelId = await this.selectBestModel(request)
    const startTime = Date.now()

    try {
      // Ana model ile çalıştır
      const primaryResponse = await this.executeWithModel(selectedModelId, request)
      
      // Güven skoru düşükse alternatif model dene
      if (primaryResponse.confidence < 0.7) {
        const alternativeModels = Array.from(this.models.keys())
          .filter(id => id !== selectedModelId)
          .slice(0, 2) // En fazla 2 alternatif

        const alternativeResponses = await Promise.allSettled(
          alternativeModels.map(modelId => 
            this.executeWithModel(modelId, request)
          )
        )

        const validAlternatives = alternativeResponses
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<AIResponse>).value)

        // En iyi alternatifi bul
        if (validAlternatives.length > 0) {
          const bestAlternative = validAlternatives
            .sort((a, b) => b.confidence - a.confidence)[0]
          
          if (bestAlternative.confidence > primaryResponse.confidence) {
            return {
              selectedModel: bestAlternative.modelId,
              response: bestAlternative,
              alternativeResponses: [primaryResponse, ...validAlternatives],
              reasoning: `${bestAlternative.modelId} daha yüksek güven skoru ile seçildi (${bestAlternative.confidence.toFixed(2)} vs ${primaryResponse.confidence.toFixed(2)})`,
              confidenceScore: bestAlternative.confidence
            }
          }
        }
      }

      // Performans metriklerini güncelle
      this.updatePerformanceMetrics(primaryResponse, request.task, true)

      // Reflexive AI ile öz-değerlendirme yap
      let finalResponse = primaryResponse
      let finalConfidence = primaryResponse.confidence
      
      if (primaryResponse.confidence < 0.9) { // Sadece güven skoru düşükse çalıştır
        try {
          const assessment = await this.reflexiveAI.performSelfAssessment({
            task: request.task,
            originalInput: request.context,
            originalOutput: primaryResponse.data,
            model: selectedModelId,
            context: request
          })
          
          this.selfAssessments.push(assessment)
          
          // Eğer iyileştirilmiş versiyon varsa onu kullan
          if (assessment.improvedResponse && assessment.finalConfidence > primaryResponse.confidence) {
            finalResponse = {
              ...primaryResponse,
              data: assessment.improvedResponse,
              confidence: assessment.finalConfidence
            }
            finalConfidence = assessment.finalConfidence
          }
          
        } catch (reflexiveError) {
          console.warn('Reflexive AI failed:', reflexiveError)
          // Reflexive AI başarısız olursa orijinal cevaba devam et
        }
      }

      // Context Store'a ekle
      this.addToContextStore({
        type: 'analysis',
        input: request.context,
        output: finalResponse.data,
        model: selectedModelId,
        confidence: finalConfidence,
        tags: request.requiredCapabilities || [],
        executionTime: finalResponse.executionTime,
        cost: finalResponse.cost,
        tokenUsed: finalResponse.tokenUsed
      })

      return {
        selectedModel: selectedModelId,
        response: finalResponse,
        reasoning: `${selectedModelId} en yüksek performans skoruyla seçildi${finalResponse !== primaryResponse ? ' (Reflexive AI ile iyileştirildi)' : ''}`,
        confidenceScore: finalConfidence
      }

    } catch (error) {
      // Hata durumunda fallback model dene
      const fallbackModel = Array.from(this.models.keys())
        .find(id => id !== selectedModelId)

      if (fallbackModel) {
        const fallbackResponse = await this.executeWithModel(fallbackModel, request)
        return {
          selectedModel: fallbackModel,
          response: fallbackResponse,
          reasoning: `${selectedModelId} başarısız, ${fallbackModel} fallback olarak kullanıldı`,
          confidenceScore: fallbackResponse.confidence * 0.8 // Penalty
        }
      }

      throw error
    }
  }

  /**
   * 🚀 Belirtilen model ile görev çalıştır
   */
  private async executeWithModel(modelId: string, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now()
    
    try {
      let result: any
      let confidence = 0.8 // Varsayılan

      switch (modelId) {
        case 'claude-3-haiku':
        case 'claude-3-sonnet':
          const claude = new ClaudeService()
          if (request.task === 'recipe-analysis') {
            result = await claude.generateRecipeAnalysis(request.context)
            confidence = 0.9
          } else {
            result = await claude.generateBusinessInsights([], [])
            confidence = 0.85
          }
          break

        case 'gpt-4-turbo':
          // OpenAI çağrısı
          result = { suggestion: 'GPT-4 analizi', creativity: 'high' }
          confidence = 0.88
          break

        case 'gemini-pro':
          // Gemini çağrısı  
          result = { marketData: 'Güncel fiyatlar', trend: 'rising' }
          confidence = 0.92
          break

        default:
          throw new Error(`Bilinmeyen model: ${modelId}`)
      }

      const executionTime = Date.now() - startTime
      const model = this.models.get(modelId)!
      
      return {
        modelId,
        data: result,
        confidence,
        executionTime,
        tokenUsed: Math.floor(Math.random() * 1000) + 500, // Simulated
        cost: model.costPerToken * 750, // Simulated
        timestamp: new Date()
      }

    } catch (error) {
      throw new Error(`${modelId} model hatası: ${error}`)
    }
  }

  /**
   * 📈 Performans metriklerini güncelle
   */
  private updatePerformanceMetrics(
    response: AIResponse, 
    taskType: string, 
    success: boolean
  ) {
    const key = `${response.modelId}-${taskType}`
    let metrics = this.performanceMetrics.get(key)

    if (!metrics) {
      metrics = []
    }

    // Yeni metrik ekle veya güncelle
    const existing = metrics.find(m => m.taskType === taskType)
    if (existing) {
      existing.totalUsage++
      existing.successRate = success ? 
        (existing.successRate * (existing.totalUsage - 1) + 1) / existing.totalUsage :
        (existing.successRate * (existing.totalUsage - 1)) / existing.totalUsage
      existing.avgExecutionTime = (existing.avgExecutionTime + response.executionTime) / 2
      existing.lastUpdated = new Date()
    } else {
      metrics.push({
        modelId: response.modelId,
        taskType,
        successRate: success ? 1 : 0,
        avgConfidence: response.confidence,
        avgExecutionTime: response.executionTime,
        totalUsage: 1,
        costEfficiency: 1 / response.cost,
        lastUpdated: new Date()
      })
    }

    this.performanceMetrics.set(key, metrics)
  }

  /**
   * 📊 Model metrikleri al
   */
  private getModelMetrics(modelId: string, taskType: string): AIPerformanceMetric | null {
    const key = `${modelId}-${taskType}`
    const metrics = this.performanceMetrics.get(key)
    return metrics ? metrics[0] : null
  }

  /**
   * 🧠 Context Store - AI Belleği
   */
  addToContextStore(context: {
    type: 'analysis' | 'recommendation' | 'prediction' | 'optimization'
    input: any
    output: any
    model: string
    confidence: number
    tags?: string[]
    executionTime: number
    cost: number
    tokenUsed: number
  }) {
    return this.contextStore.addContext({
      type: context.type,
      input: context.input,
      output: context.output,
      model: context.model,
      confidence: context.confidence,
      tags: context.tags || [],
      metadata: {
        executionTime: context.executionTime,
        cost: context.cost,
        tokenUsed: context.tokenUsed
      }
    })
  }

  /**
   * 🔍 İlgili context'leri bul
   */
  getRelevantContext(query: string, limit: number = 5): ContextEntry[] {
    return this.contextStore.queryContexts({
      limit
    }).filter(ctx => 
      JSON.stringify(ctx.input).toLowerCase().includes(query.toLowerCase()) ||
      JSON.stringify(ctx.output).toLowerCase().includes(query.toLowerCase())
    )
  }

  /**
   * 💡 Context tabanlı öneriler
   */
  getContextSuggestions(input: any, type: string): ContextEntry[] {
    return this.contextStore.getContextBasedSuggestions(input, type)
  }

  /**
   * 🔍 Reflexive AI performans analizi
   */
  getReflexiveAnalysis() {
    return this.reflexiveAI.analyzePerformanceTrend(this.selfAssessments)
  }

  /**
   * 📊 Son self-assessment'ları al
   */
  getRecentAssessments(limit: number = 10): SelfAssessmentResult[] {
    return this.selfAssessments.slice(-limit)
  }

  /**
   * 📊 Sistem performans raporu
   */
  getPerformanceReport(): any {
    const contextAnalysis = this.contextStore.getPerformanceAnalysis()
    
    const report = {
      totalModels: this.models.size,
      totalMetrics: Array.from(this.performanceMetrics.values()).flat().length,
      contextStoreSize: contextAnalysis.totalContexts,
      contextAnalysis,
      modelPerformance: {} as any
    }

    this.models.forEach((model, id) => {
      const allMetrics = Array.from(this.performanceMetrics.values())
        .flat()
        .filter(m => m.modelId === id)
      
      if (allMetrics.length > 0) {
        report.modelPerformance[id] = {
          avgSuccessRate: allMetrics.reduce((sum, m) => sum + m.successRate, 0) / allMetrics.length,
          totalUsage: allMetrics.reduce((sum, m) => sum + m.totalUsage, 0),
          avgResponseTime: allMetrics.reduce((sum, m) => sum + m.avgExecutionTime, 0) / allMetrics.length
        }
      }
    })

    return report
  }
}