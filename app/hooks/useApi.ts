'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Generic API Hook
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): ApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(errorMessage)
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

/**
 * AI Keys Status Hook
 */
export function useApiKeysStatus() {
  return useApi(async () => {
    const response = await fetch('/api/system/keys-status')
    if (!response.ok) {
      throw new Error('API keys durumu alınamadı')
    }
    const result = await response.json()
    return result.data
  })
}

/**
 * Claude Analysis Hook
 */
export function useClaudeAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeRecipe = useCallback(async (recipe: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/claude-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'recipe-analysis',
          data: recipe
        })
      })

      if (!response.ok) {
        throw new Error('Claude analizi başarısız')
      }

      const result = await response.json()
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analiz hatası'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const optimizeInventory = useCallback(async (inventory: any, orders: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/claude-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'inventory-optimization',
          data: { currentInventory: inventory, upcomingOrders: orders }
        })
      })

      if (!response.ok) {
        throw new Error('Envanter optimizasyonu başarısız')
      }

      const result = await response.json()
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Optimizasyon hatası'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    analyzeRecipe,
    optimizeInventory
  }
}

/**
 * Menu Suggestions Hook
 */
export function useMenuSuggestions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSuggestions = useCallback(async (preferences: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/menu-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })

      if (!response.ok) {
        throw new Error('Menü önerileri alınamadı')
      }

      const result = await response.json()
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Öneri hatası'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    generateSuggestions
  }
}

/**
 * Market Prices Hook
 */
export function useMarketPrices() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPrices = useCallback(async (products: string[]) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/market-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products })
      })

      if (!response.ok) {
        throw new Error('Market fiyatları alınamadı')
      }

      const result = await response.json()
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fiyat hatası'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getPrices
  }
}