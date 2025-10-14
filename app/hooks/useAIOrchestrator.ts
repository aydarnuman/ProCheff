'use client'

import { useState, useCallback } from 'react'

export interface OrchestrationResult {
  result: any
  metadata: {
    selectedModel: string
    confidence: number
    reasoning: string
    executionTime: number
    cost: number
  }
}

export function useAIOrchestrator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const smartAnalysis = useCallback(async (data: any): Promise<OrchestrationResult> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'smart-analysis',
          data
        })
      })

      if (!response.ok) {
        throw new Error('Akıllı analiz başarısız')
      }

      const result = await response.json()
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Orchestrator hatası'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const compareModels = useCallback(async (task: string, context: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'model-comparison',
          data: { task, context }
        })
      })

      if (!response.ok) {
        throw new Error('Model karşılaştırması başarısız')
      }

      const result = await response.json()
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Karşılaştırma hatası'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getPerformanceReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'performance-report',
          data: {}
        })
      })

      if (!response.ok) {
        throw new Error('Performans raporu alınamadı')
      }

      const result = await response.json()
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rapor hatası'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchContext = useCallback(async (query: string, limit: number = 5) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'context-search',
          data: { query, limit }
        })
      })

      if (!response.ok) {
        throw new Error('Context araması başarısız')
      }

      const result = await response.json()
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Arama hatası'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    smartAnalysis,
    compareModels,
    getPerformanceReport,
    searchContext
  }
}