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
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          💰 Fiyat Takip
        </h1>
        <p className="text-[var(--text-secondary)]">
          Anlık fiyat karşılaştırması
        </p>
      </div>

      {/* Minimal Filtreler */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
          />
        </div>
        
        <select
          value={filters.sortBy || 'name'}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
          className="px-3 py-2 text-sm border border-[var(--border-primary)] rounded-lg"
        >
          <option value="name">İsme Göre</option>
          <option value="price">Fiyata Göre</option>
          <option value="trend">Trend'e Göre</option>
        </select>
      </div>

      {/* Kompakt Ürün Listesi */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => {
            const isUpdating = updatingMarkets.has(product.id)
            const isStale = product.freshness > 7

            return (
              <div
                key={product.id}
                className={`bg-[var(--bg-secondary)] rounded-lg border p-4 transition-all hover:shadow-sm ${
                  isStale ? 'border-red-200' : 'border-[var(--border-primary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Sol: Ürün Bilgisi */}
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {product.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-[var(--accent-secondary)] text-[var(--accent-primary)] text-xs rounded-full">
                          {product.category}
                        </span>
                        {isStale && (
                          <span className="text-xs text-red-500">⚠️ Eski</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                        <span>En ucuz: <strong className="text-[var(--text-primary)]">
                          {product.cheapestPrice.unitPrice.toFixed(2)} ₺/{product.unit}
                        </strong></span>
                        
                        <span>Ort: <strong>
                          {product.averagePrice.toFixed(2)} ₺/{product.unit}
                        </strong></span>
                        
                        <div className="flex items-center gap-1">
                          {getTrendIcon(product.trend)}
                          <span className={`font-medium ${
                            product.trend.direction === 'up' ? 'text-red-500' :
                            product.trend.direction === 'down' ? 'text-green-500' : 'text-gray-500'
                          }`}>
                            {product.trend.percentage > 0 ? '+' : ''}{product.trend.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sağ: İşlem Butonları */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updatePrice(product.id)}
                      disabled={isUpdating}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-all ${
                        isUpdating 
                          ? 'bg-purple-500 text-white cursor-wait' 
                          : 'bg-[var(--accent-primary)] text-white hover:opacity-90'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                      {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
                    </button>

                    <button
                      onClick={() => exportToCostSimulator(product.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-[var(--border-primary)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Simülatör
                    </button>
                  </div>
                </div>

                {/* Genişletilebilir Market Listesi */}
                <details className="mt-3">
                  <summary className="text-sm text-[var(--accent-primary)] cursor-pointer hover:underline">
                    {product.markets.length} market detayı →
                  </summary>
                  
                  <div className="mt-2 pt-2 border-t border-[var(--border-primary)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.markets.map((market, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-[var(--bg-primary)] rounded text-sm"
                        >
                          <div>
                            <span className="font-medium">{market.market}</span>
                            <span className="text-[var(--text-secondary)] ml-2">
                              {market.package}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">
                              {market.unitPrice.toFixed(2)} ₺/{product.unit}
                            </div>
                            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                              market.status === 'cheapest' ? 'bg-green-100 text-green-700' :
                              market.status === 'expensive' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {market.status === 'cheapest' ? 'En Ucuz' :
                               market.status === 'expensive' ? 'Pahalı' : 'Ortalama'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
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