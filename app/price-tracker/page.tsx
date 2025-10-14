'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, MoreHorizontal } from 'lucide-react'
import { PriceTrackerService, ProductPrice, PriceTrackerFilters } from '@/lib/services/priceTrackerService'

const priceTracker = new PriceTrackerService()

export default function PriceTrackerPage() {
  const [products, setProducts] = useState<ProductPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingMarkets, setUpdatingMarkets] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<PriceTrackerFilters>({
    searchQuery: ''
  })

  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await priceTracker.getProducts(filters)
      setProducts(data)
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePrice = async (productId: string) => {
    try {
      setUpdatingMarkets(prev => new Set(prev).add(productId))
      await priceTracker.updateProductPrice(productId)
      await loadProducts()
    } catch (error) {
      console.error('Fiyat güncellenirken hata:', error)
    } finally {
      setUpdatingMarkets(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const showDetails = (productId: string) => {
    const url = `/cost-simulator?product=${productId}`
    window.open(url, '_blank')
  }

  const getTrendIcon = (trend: ProductPrice['trend']) => {
    if (trend.direction === 'up') return <TrendingUp className="w-4 h-4" style={{ color: 'var(--status-error)' }} />
    if (trend.direction === 'down') return <TrendingDown className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
    return <Minus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Minimal Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>💰 Fiyat Takip</h1>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)'
            }}
          />
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>Yükleniyor...</div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between py-3 px-4 text-sm rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              {/* Sol: Ürün */}
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate block" style={{ color: 'var(--text-primary)' }}>
                  {product.name}
                </span>
              </div>

              {/* Orta: Fiyat */}
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold" style={{ color: 'var(--status-success)' }}>
                  {product.cheapestPrice.unitPrice.toFixed(2)}₺
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  ort: {product.averagePrice.toFixed(2)}₺
                </span>
              </div>

              {/* Sağ: Trend ve İkonlar */}
              <div className="flex items-center gap-2 ml-3">
                <div className="flex items-center gap-2">
                  {getTrendIcon(product.trend)}
                  <span className="text-sm" style={{ 
                    color: product.trend.direction === 'up' ? 'var(--status-error)' :
                           product.trend.direction === 'down' ? 'var(--status-success)' : 'var(--text-muted)'
                  }}>
                    {product.trend.percentage > 0 ? '+' : ''}{product.trend.percentage.toFixed(0)}%
                  </span>
                </div>

                {/* İkonlar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updatePrice(product.id)}
                    disabled={updatingMarkets.has(product.id)}
                    className="p-2 rounded-md transition-colors hover:opacity-80"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    title="Fiyat Güncelle"
                  >
                    <RefreshCw className={`w-4 h-4 ${
                      updatingMarkets.has(product.id) ? 'animate-spin' : ''
                    }`} style={{ color: 'var(--text-secondary)' }} />
                  </button>

                  <button
                    onClick={() => showDetails(product.id)}
                    className="p-2 rounded-md transition-colors hover:opacity-80"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    title="Detaylar"
                  >
                    <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
          Ürün bulunamadı
        </div>
      )}
    </div>
  )
}