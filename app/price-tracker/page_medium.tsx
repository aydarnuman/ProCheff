'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink } from 'lucide-react'
import { PriceTrackerService, ProductPrice, PriceTrackerFilters } from '@/lib/services/priceTrackerService'

const priceTracker = new PriceTrackerService()

export default function PriceTrackerPage() {
  const [products, setProducts] = useState<ProductPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingMarkets, setUpdatingMarkets] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<PriceTrackerFilters>({
    searchQuery: '',
    sortBy: 'name'
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

  const getTrendIcon = (trend: ProductPrice['trend']) => {
    const IconComponent = trend.direction === 'up' ? TrendingUp : 
                         trend.direction === 'down' ? TrendingDown : Minus
    const color = trend.direction === 'up' ? 'text-red-500' : 
                  trend.direction === 'down' ? 'text-green-500' : 'text-gray-400'
    return <IconComponent className={`w-4 h-4 ${color}`} />
  }

  const exportToCostSimulator = (productId: string) => {
    const url = `/cost-simulator?product=${productId}`
    window.open(url, '_blank')
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Minimal Başlık ve Filtreler */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          💰 Fiyat Takip
        </h1>
        
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Ara..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="pl-7 pr-3 py-1.5 text-sm border border-[var(--border-primary)] rounded focus:ring-1 focus:ring-[var(--accent-primary)] w-48"
            />
          </div>
          
          <select
            value={filters.sortBy || 'name'}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
            className="px-2 py-1.5 text-sm border border-[var(--border-primary)] rounded"
          >
            <option value="name">Ad</option>
            <option value="price">Fiyat</option>
            <option value="trend">Trend</option>
          </select>
        </div>
      </div>      {/* Ultra Kompakt Tablo */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--accent-primary)]" />
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] overflow-hidden">
          {/* Tablo Header */}
          <div className="grid grid-cols-12 gap-2 p-2 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] text-xs font-medium text-[var(--text-secondary)]">
            <div className="col-span-4">ÜRÜN</div>
            <div className="col-span-2 text-center">EN UCUZ</div>
            <div className="col-span-2 text-center">ORTALAMA</div>
            <div className="col-span-2 text-center">TREND</div>
            <div className="col-span-2 text-center">İŞLEM</div>
          </div>

          {/* Ürün Satırları */}
          {products.map((product) => {
            const isUpdating = updatingMarkets.has(product.id)
            const isStale = product.freshness > 7

            return (
              <div
                key={product.id}
                className={`grid grid-cols-12 gap-2 p-2 text-sm border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-colors ${
                  isStale ? 'bg-red-50' : ''
                }`}
              >
                {/* Ürün Adı */}
                <div className="col-span-4 flex items-center">
                  <div>
                    <div className="font-medium text-[var(--text-primary)] truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <span>{product.category}</span>
                      {isStale && <span className="text-red-500">⚠️</span>}
                    </div>
                  </div>
                </div>

                {/* En Ucuz Fiyat */}
                <div className="col-span-2 text-center">
                  <div className="font-semibold text-[var(--text-primary)]">
                    {product.cheapestPrice.unitPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    ₺/{product.unit}
                  </div>
                </div>

                {/* Ortalama Fiyat */}
                <div className="col-span-2 text-center">
                  <div className="font-medium text-[var(--text-primary)]">
                    {product.averagePrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    ₺/{product.unit}
                  </div>
                </div>

                {/* Trend */}
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(product.trend)}
                    <span className={`text-xs font-medium ${
                      product.trend.direction === 'up' ? 'text-red-500' :
                      product.trend.direction === 'down' ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {product.trend.percentage > 0 ? '+' : ''}{product.trend.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* İşlemler */}
                <div className="col-span-2 flex items-center justify-center gap-1">
                  <button
                    onClick={() => updatePrice(product.id)}
                    disabled={isUpdating}
                    className={`p-1 rounded transition-all ${
                      isUpdating 
                        ? 'bg-purple-500 text-white cursor-wait' 
                        : 'bg-[var(--accent-primary)] text-white hover:opacity-90'
                    }`}
                    title="Fiyat Güncelle"
                  >
                    <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={() => exportToCostSimulator(product.id)}
                    className="p-1 border border-[var(--border-primary)] text-[var(--text-primary)] rounded hover:bg-[var(--bg-primary)] transition-colors"
                    title="Maliyet Simülatörü"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Boş durum */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            Ürün Bulunamadı
          </h3>
          <p className="text-[var(--text-secondary)]">
            Arama teriminizi değiştirerek tekrar deneyin
          </p>
        </div>
      )}
    </div>
  )
}