'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { PriceTrackerService, ProductPrice, PriceTrackerFilters } from '@/lib/services/priceTrackerService'

const priceTracker = new PriceTrackerService()

export default function PriceTrackerPage() {
  const [products, setProducts] = useState<ProductPrice[]>([])
  const [loading, setLoading] = useState(true)
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

  const getTrendIcon = (trend: ProductPrice['trend']) => {
    if (trend.direction === 'up') return <TrendingUp className="w-3 h-3 text-red-500" />
    if (trend.direction === 'down') return <TrendingDown className="w-3 h-3 text-green-500" />
    return <Minus className="w-3 h-3 text-gray-400" />
  }

  return (
    <div className="p-2 max-w-4xl mx-auto">
      {/* Minimal Header */}
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-base font-medium">💰 Fiyat Takip</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder="Ara..."
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-4 text-xs text-gray-500">Yükleniyor...</div>
      ) : (
        <div className="space-y-0.5">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between py-1 px-2 text-xs hover:bg-gray-50 rounded"
            >
              {/* Sol: Ürün */}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900 truncate block">
                  {product.name}
                </span>
              </div>

              {/* Orta: Fiyat */}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-600 font-semibold">
                  {product.cheapestPrice.unitPrice.toFixed(2)}₺
                </span>
                <span className="text-gray-500">
                  ort: {product.averagePrice.toFixed(2)}₺
                </span>
              </div>

              {/* Sağ: Trend */}
              <div className="flex items-center gap-1 ml-3">
                {getTrendIcon(product.trend)}
                <span className={`text-xs ${
                  product.trend.direction === 'up' ? 'text-red-500' :
                  product.trend.direction === 'down' ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {product.trend.percentage > 0 ? '+' : ''}{product.trend.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-6 text-xs text-gray-400">
          Ürün bulunamadı
        </div>
      )}
    </div>
  )
}