'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, MoreHorizontal, X, ExternalLink, BarChart3 } from 'lucide-react'
import { PriceTrackerService, ProductPrice, PriceTrackerFilters } from '@/lib/services/priceTrackerService'

const priceTracker = new PriceTrackerService()

export default function PriceTrackerPage() {
  const [products, setProducts] = useState<ProductPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingMarkets, setUpdatingMarkets] = useState<Set<string>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<ProductPrice | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
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
    const product = products.find(p => p.id === productId)
    if (product) {
      setSelectedProduct(product)
      setShowDetailModal(true)
    }
  }

  const openCostSimulator = (productId: string) => {
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

      {/* Detay Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedProduct.name}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Detaylı Fiyat Analizi
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Fiyat Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>En Düşük Fiyat</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>
                    {selectedProduct.cheapestPrice.unitPrice.toFixed(2)}₺
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {selectedProduct.cheapestPrice.market}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ortalama Fiyat</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedProduct.averagePrice.toFixed(2)}₺
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Tüm marketler
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Trend</p>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(selectedProduct.trend)}
                    <span className="text-xl font-bold" style={{ 
                      color: selectedProduct.trend.direction === 'up' ? 'var(--status-error)' :
                             selectedProduct.trend.direction === 'down' ? 'var(--status-success)' : 'var(--text-muted)'
                    }}>
                      {selectedProduct.trend.percentage > 0 ? '+' : ''}{selectedProduct.trend.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Market Karşılaştırması */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Market Karşılaştırması
                </h3>
                <div className="space-y-2">
                  {selectedProduct.markets.map((marketData, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: marketData.status === 'cheapest' ? 'var(--status-success)' : 'var(--border-primary)'
                      }}
                    >
                      {/* Üst satır: Market adı ve durum */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {marketData.market}
                          </h4>
                          {marketData.dataSource === 'predicted' && (
                            <span 
                              className="px-2 py-1 text-xs rounded-full"
                              style={{ backgroundColor: 'var(--status-warning)', color: 'white' }}
                            >
                              Tahmini
                            </span>
                          )}
                          {marketData.status === 'cheapest' && (
                            <span 
                              className="px-2 py-1 text-xs rounded-full"
                              style={{ backgroundColor: 'var(--status-success)', color: 'white' }}
                            >
                              En Ucuz
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {marketData.unitPrice.toFixed(2)}₺/{selectedProduct.unit}
                          </span>
                        </div>
                      </div>
                      
                      {/* Alt satır: İki Katmanlı Veri Yapısı */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* Sol Kolon: Gerçek Veriler */}
                        <div>
                          <p style={{ color: 'var(--text-muted)' }} className="font-medium mb-1">📦 Gerçek Veriler</p>
                          <p style={{ color: 'var(--text-primary)' }}>Ambalaj: {marketData.package}</p>
                          <p style={{ color: 'var(--text-primary)' }}>Toplam: {marketData.price.toFixed(2)}₺</p>
                          <p style={{ color: 'var(--text-primary)' }}>Net: {marketData.amount} {selectedProduct.unit}</p>
                          {marketData.dataSource && (
                            <p style={{ color: 'var(--text-muted)' }}>Kaynak: {marketData.dataSource}</p>
                          )}
                        </div>
                        
                        {/* Sağ Kolon: Hesaplanan Değerler */}
                        <div>
                          <p style={{ color: 'var(--text-muted)' }} className="font-medium mb-1">🧮 Formül & Analiz</p>
                          {marketData.formula && (
                            <p style={{ color: 'var(--accent-primary)' }} className="font-mono text-xs">
                              {marketData.formula}
                            </p>
                          )}
                          {marketData.confidenceScore && (
                            <p style={{ color: 'var(--text-primary)' }}>
                              Güven: {(marketData.confidenceScore * 100).toFixed(0)}%
                            </p>
                          )}
                          {marketData.priceEfficiency && (
                            <p style={{ color: 'var(--text-primary)' }}>
                              Verimlilik: {(marketData.priceEfficiency * 100).toFixed(0)}%
                            </p>
                          )}
                          {marketData.recommendation && (
                            <p style={{ color: 'var(--text-muted)' }} className="text-xs italic">
                              💡 {marketData.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <button
                  onClick={() => openCostSimulator(selectedProduct.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                >
                  <BarChart3 className="w-4 h-4" />
                  Maliyet Simülatörü
                </button>
                
                <button
                  onClick={() => updatePrice(selectedProduct.id)}
                  disabled={updatingMarkets.has(selectedProduct.id)}
                  className="px-4 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <RefreshCw className={`w-4 h-4 ${
                    updatingMarkets.has(selectedProduct.id) ? 'animate-spin' : ''
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}