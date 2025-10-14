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
    return <IconComponent className={`w-3 h-3 ${color}`} />
  }

  const exportToCostSimulator = (productId: string) => {
    const url = `/cost-simulator?product=${productId}`
    window.open(url, '_blank')
  }

  return (
    <div className="p-3 max-w-5xl mx-auto">
      {/* Ultra Minimal Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-medium text-gray-900">💰 Fiyat Takip</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Ara..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="pl-7 pr-3 py-1 text-sm border border-gray-300 rounded w-40 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Liste Görünümü */}
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          {products.map((product, index) => {
            const isUpdating = updatingMarkets.has(product.id)
            const isStale = product.freshness > 7

            return (
              <div
                key={product.id}
                className={`grid grid-cols-12 gap-2 p-2 hover:bg-gray-50 transition-colors text-sm ${
                  index !== products.length - 1 ? 'border-b border-gray-100' : ''
                } ${isStale ? 'bg-red-50' : ''}`}
              >
                {/* Ürün Adı */}
                <div className="col-span-5 font-medium text-gray-900 truncate">
                  {product.name}
                  <span className="ml-2 text-xs text-gray-500">{product.category}</span>
                  {isStale && <span className="ml-1 text-red-500 text-xs">⚠️</span>}
                </div>

                {/* En Ucuz Fiyat */}
                <div className="col-span-2 text-right">
                  <span className="font-semibold text-green-600">
                    {product.cheapestPrice.unitPrice.toFixed(2)} ₺
                  </span>
                </div>

                {/* Ortalama Fiyat */}
                <div className="col-span-2 text-right text-gray-600">
                  {product.averagePrice.toFixed(2)} ₺
                </div>

                {/* Trend */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className="flex items-center gap-0.5">
                    {getTrendIcon(product.trend)}
                    <span className={`text-xs ${
                      product.trend.direction === 'up' ? 'text-red-500' :
                      product.trend.direction === 'down' ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {product.trend.percentage > 0 ? '+' : ''}{product.trend.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={() => updatePrice(product.id)}
                    disabled={isUpdating}
                    className={`p-0.5 rounded transition-colors ${
                      isUpdating 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                    title="Fiyat Güncelle"
                  >
                    <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={() => exportToCostSimulator(product.id)}
                    className="p-0.5 hover:bg-gray-200 text-gray-600 rounded transition-colors"
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

      {/* Boş Durum */}
      {!loading && products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Ürün bulunamadı</p>
        </div>
      )}
    </div>
  )
}