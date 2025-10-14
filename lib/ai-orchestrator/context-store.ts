// lib/ai-orchestrator/context-store.ts

export interface ContextEntry {
  id: string
  type: 'analysis' | 'recommendation' | 'prediction' | 'optimization'
  input: any
  output: any
  model: string
  confidence: number
  timestamp: Date
  tags: string[]
  relatedContexts?: string[]
  userFeedback?: {
    helpful: boolean
    rating: number
    comment?: string
  }
  metadata: {
    executionTime: number
    cost: number
    tokenUsed: number
  }
}

export interface ContextQuery {
  type?: string
  tags?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  minConfidence?: number
  models?: string[]
  limit?: number
}

/**
 * 🧠 AI Context Store - ProCheff'in Bellek Sistemi
 * 
 * Bu sınıf tüm AI etkileşimlerini saklar ve akıllı bağlantılar kurar.
 * AI'lar geçmiş deneyimlerinden öğrenebilir.
 */
export class ContextStore {
  private contexts: Map<string, ContextEntry> = new Map()
  private tagIndex: Map<string, Set<string>> = new Map()
  private typeIndex: Map<string, Set<string>> = new Map()
  private modelIndex: Map<string, Set<string>> = new Map()

  /**
   * 📝 Yeni context ekle
   */
  addContext(entry: Omit<ContextEntry, 'id' | 'timestamp'>): string {
    const id = this.generateId()
    const contextEntry: ContextEntry = {
      ...entry,
      id,
      timestamp: new Date()
    }

    this.contexts.set(id, contextEntry)
    this.updateIndices(contextEntry)
    this.findRelatedContexts(contextEntry)

    return id
  }

  /**
   * 🔍 Context ara
   */
  queryContexts(query: ContextQuery): ContextEntry[] {
    let results = Array.from(this.contexts.values())

    // Tip filtresi
    if (query.type) {
      const typeIds = this.typeIndex.get(query.type) || new Set()
      results = results.filter(ctx => typeIds.has(ctx.id))
    }

    // Tag filtresi
    if (query.tags && query.tags.length > 0) {
      results = results.filter(ctx => 
        query.tags!.some(tag => ctx.tags.includes(tag))
      )
    }

    // Model filtresi
    if (query.models && query.models.length > 0) {
      results = results.filter(ctx => 
        query.models!.includes(ctx.model)
      )
    }

    // Tarih filtresi
    if (query.dateRange) {
      results = results.filter(ctx => 
        ctx.timestamp >= query.dateRange!.from &&
        ctx.timestamp <= query.dateRange!.to
      )
    }

    // Güven skoru filtresi
    if (query.minConfidence) {
      results = results.filter(ctx => 
        ctx.confidence >= query.minConfidence!
      )
    }

    // En yeni önce sırala
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Limit uygula
    if (query.limit) {
      results = results.slice(0, query.limit)
    }

    return results
  }

  /**
   * 🎯 Benzer context'leri bul
   */
  findSimilarContexts(contextId: string, limit: number = 5): ContextEntry[] {
    const context = this.contexts.get(contextId)
    if (!context) return []

    const similar = Array.from(this.contexts.values())
      .filter(ctx => ctx.id !== contextId)
      .map(ctx => ({
        context: ctx,
        similarity: this.calculateSimilarity(context, ctx)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.context)

    return similar
  }

  /**
   * 🔗 İlgili context'leri otomatik bağla
   */
  private findRelatedContexts(newContext: ContextEntry) {
    const related = this.findSimilarContexts(newContext.id, 3)
    
    if (related.length > 0) {
      newContext.relatedContexts = related.map(ctx => ctx.id)
      
      // Karşılıklı bağlantı kur
      related.forEach(ctx => {
        if (!ctx.relatedContexts) {
          ctx.relatedContexts = []
        }
        if (!ctx.relatedContexts.includes(newContext.id)) {
          ctx.relatedContexts.push(newContext.id)
        }
      })
    }
  }

  /**
   * 📊 Context benzerlik skoru hesapla
   */
  private calculateSimilarity(ctx1: ContextEntry, ctx2: ContextEntry): number {
    let similarity = 0

    // Aynı tip (+0.3)
    if (ctx1.type === ctx2.type) {
      similarity += 0.3
    }

    // Aynı model (+0.2)
    if (ctx1.model === ctx2.model) {
      similarity += 0.2
    }

    // Ortak tag'lar (+0.1 * ortak tag sayısı)
    const commonTags = ctx1.tags.filter(tag => ctx2.tags.includes(tag))
    similarity += commonTags.length * 0.1

    // Zaman yakınlığı (+0.2 * zaman faktörü)
    const timeDiff = Math.abs(ctx1.timestamp.getTime() - ctx2.timestamp.getTime())
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
    const timeFactor = Math.max(0, 1 - (daysDiff / 7)) // 7 gün içinde maksimum
    similarity += timeFactor * 0.2

    // Input benzerliği (basit string karşılaştırması)
    try {
      const input1Str = JSON.stringify(ctx1.input).toLowerCase()
      const input2Str = JSON.stringify(ctx2.input).toLowerCase()
      
      const commonWords = input1Str.split(' ')
        .filter(word => input2Str.includes(word) && word.length > 3)
      
      similarity += Math.min(commonWords.length * 0.05, 0.2)
    } catch (e) {
      // JSON stringify hatası durumunda sessizce geç
    }

    return Math.min(similarity, 1) // Maksimum 1
  }

  /**
   * 💡 Context tabanlı öneri al
   */
  getContextBasedSuggestions(input: any, type: string): ContextEntry[] {
    const inputStr = JSON.stringify(input).toLowerCase()
    
    return Array.from(this.contexts.values())
      .filter(ctx => ctx.type === type)
      .filter(ctx => ctx.confidence > 0.8) // Sadece yüksek güvenli olanlar
      .map(ctx => ({
        context: ctx,
        relevance: this.calculateRelevance(inputStr, ctx)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)
      .map(item => item.context)
  }

  /**
   * 🎯 Input ile context arasında ilgi hesapla
   */
  private calculateRelevance(inputStr: string, context: ContextEntry): number {
    try {
      const contextInputStr = JSON.stringify(context.input).toLowerCase()
      
      const inputWords = inputStr.split(/\W+/).filter(w => w.length > 3)
      const contextWords = contextInputStr.split(/\W+/).filter(w => w.length > 3)
      
      const commonWords = inputWords.filter(word => contextWords.includes(word))
      const relevance = commonWords.length / Math.max(inputWords.length, 1)
      
      // Zaman penaltısı
      const daysSince = (Date.now() - context.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      const timePenalty = Math.max(0.5, 1 - (daysSince / 30)) // 30 gün içinde geçerli
      
      return relevance * timePenalty * context.confidence
      
    } catch (e) {
      return 0
    }
  }

  /**
   * 📈 Context performans analizi
   */
  getPerformanceAnalysis(): any {
    const contexts = Array.from(this.contexts.values())
    
    const analysis = {
      totalContexts: contexts.length,
      avgConfidence: contexts.reduce((sum, ctx) => sum + ctx.confidence, 0) / contexts.length,
      typeDistribution: {} as any,
      modelDistribution: {} as any,
      avgExecutionTime: contexts.reduce((sum, ctx) => sum + ctx.metadata.executionTime, 0) / contexts.length,
      totalCost: contexts.reduce((sum, ctx) => sum + ctx.metadata.cost, 0),
      feedbackStats: {
        total: contexts.filter(ctx => ctx.userFeedback).length,
        helpful: contexts.filter(ctx => ctx.userFeedback?.helpful).length,
        avgRating: 0
      }
    }

    // Tip dağılımı
    contexts.forEach(ctx => {
      analysis.typeDistribution[ctx.type] = (analysis.typeDistribution[ctx.type] || 0) + 1
    })

    // Model dağılımı
    contexts.forEach(ctx => {
      analysis.modelDistribution[ctx.model] = (analysis.modelDistribution[ctx.model] || 0) + 1
    })

    // Ortalama rating
    const ratingsSum = contexts
      .filter(ctx => ctx.userFeedback?.rating)
      .reduce((sum, ctx) => sum + (ctx.userFeedback?.rating || 0), 0)
    
    analysis.feedbackStats.avgRating = ratingsSum / Math.max(analysis.feedbackStats.total, 1)

    return analysis
  }

  /**
   * 🗑️ Eski context'leri temizle
   */
  cleanup(olderThanDays: number = 90) {
    const cutoffDate = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000))
    
    const toDelete: string[] = []
    this.contexts.forEach((ctx, id) => {
      if (ctx.timestamp < cutoffDate && ctx.confidence < 0.7) {
        toDelete.push(id)
      }
    })

    toDelete.forEach(id => {
      this.contexts.delete(id)
    })

    this.rebuildIndices()

    return toDelete.length
  }

  /**
   * 🔄 İndeksleri yeniden oluştur
   */
  private rebuildIndices() {
    this.tagIndex.clear()
    this.typeIndex.clear()
    this.modelIndex.clear()

    this.contexts.forEach(ctx => {
      this.updateIndices(ctx)
    })
  }

  /**
   * 📇 İndeksleri güncelle
   */
  private updateIndices(context: ContextEntry) {
    // Tag indeksi
    context.tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set())
      }
      this.tagIndex.get(tag)!.add(context.id)
    })

    // Tip indeksi
    if (!this.typeIndex.has(context.type)) {
      this.typeIndex.set(context.type, new Set())
    }
    this.typeIndex.get(context.type)!.add(context.id)

    // Model indeksi
    if (!this.modelIndex.has(context.model)) {
      this.modelIndex.set(context.model, new Set())
    }
    this.modelIndex.get(context.model)!.add(context.id)
  }

  /**
   * 🆔 Unique ID üret
   */
  private generateId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}