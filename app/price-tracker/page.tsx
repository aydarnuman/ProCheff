'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, RotateCcw, TrendingUp, TrendingDown, Minus, ShoppingCart, ChevronDown, ChevronUp, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react'
import { PriceTrackerService, ProductPrice, PriceTrackerFilters, MarketPriceData } from '@/lib/services/priceTrackerService'
import { MarketDataService } from '@/lib/services/marketDataService'
import { unitLearningEngine } from '@/lib/services/unitLearningEngine'

const priceTracker = new PriceTrackerService()
const marketDataService = new MarketDataService()

// Development debug
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.debugPriceTracker = {
    unitLearningEngine,
    showLearningStatus: () => unitLearningEngine.debugLearningEngine(),
    exportLearningData: () => unitLearningEngine.exportLearningData()
  }
}

export default function PriceTrackerPage() {
  const [products, setProducts] = useState<ProductPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const [updatingMarkets, setUpdatingMarkets] = useState<Set<string>>(new Set())
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set())
  const [updateErrors, setUpdateErrors] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<PriceTrackerFilters>({
    category: 'all',
    unit: 'all',
    sortBy: 'name',
    trendFilter: 'all',
    searchQuery: ''
  })

  // Veri yükleme
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

  // Fiyat güncelleme
  const updatePrice = async (productId: string, marketName?: string) => {
    const marketKey = marketName ? `${productId}-${marketName}` : productId
    
    try {
      // Animation başlat
      setUpdatingMarkets(prev => new Set(prev).add(marketKey))
      setUpdateErrors(prev => {
        const newSet = new Set(prev)
        newSet.delete(marketKey)
        return newSet
      })
      
      await priceTracker.updateProductPrice(productId, marketName)
      
      // Success animation
      setUpdatingMarkets(prev => {
        const newSet = new Set(prev)
        newSet.delete(marketKey)
        return newSet
      })
      setRecentlyUpdated(prev => new Set(prev).add(marketKey))
      
      await loadProducts() // Verileri yenile
      
      // Success effect'i 2 saniye sonra kaldır
      setTimeout(() => {
        setRecentlyUpdated(prev => {
          const newSet = new Set(prev)
          newSet.delete(marketKey)
          return newSet
        })
      }, 2000)
      
    } catch (error) {
      console.error('Fiyat güncellenirken hata:', error)
      
      // Error animation
      setUpdatingMarkets(prev => {
        const newSet = new Set(prev)
        newSet.delete(marketKey)
        return newSet
      })
      setUpdateErrors(prev => new Set(prev).add(marketKey))
      
      // Error effect'i 3 saniye sonra kaldır
      setTimeout(() => {
        setUpdateErrors(prev => {
          const newSet = new Set(prev)
          newSet.delete(marketKey)
          return newSet
        })
      }, 3000)
    }
  }

  // Cost Simulator'a gönder
  const exportToCostSimulator = async (productId: string) => {
    try {
      const simulatorUrl = priceTracker.generateCostSimulatorUrl(productId)
      
      // Yeni sekmede Cost Simulator'ı aç
      window.open(simulatorUrl, '_blank')
    } catch (error) {
      console.error('Export hatası:', error)
      alert('Maliyet simülatörüne yönlendirme başarısız!')
    }
  }

  // Trend ikonu
  const getTrendIcon = (trend: ProductPrice['trend']) => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  // Trend yüzdesi rengi
  const getTrendColor = (trend: ProductPrice['trend']) => {
    switch (trend.direction) {
      case 'up':
        return 'text-red-500'
      case 'down':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  // Tazelik göstergesi
  const getFreshnessColor = (freshness: number) => {
    if (freshness <= 1) return 'bg-green-500'
    if (freshness <= 3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Market durumu badge
  const getMarketStatusBadge = (market: MarketPriceData) => {
    if (market.isPredicted) {
      return (
        <span 
          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium cursor-help"
          title={`Tahmini ₺/kg değeri — ${market.prediction?.explanation} (${market.prediction?.confidence}% güven)`}
        >
          Tahmini
        </span>
      )
    }

    switch (market.status) {
      case 'cheapest':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">En Ucuz</span>
      case 'expensive':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Pahalı</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Ortalama</span>
    }
  }

  // Mini sparkline grafiği
  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60
      const y = 20 - ((value - min) / range) * 20
      return `${x},${y}`
    }).join(' ')

    return (
      <svg width="60" height="20" className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="opacity-60"
        />
      </svg>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="w-8 h-8 text-[var(--accent-primary)]" />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Nerede Ne Kaç Para?
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg">
          Gerçek zamanlı fiyat karşılaştırması ve trend analizi
        </p>
      </div>

      {/* Filtreler */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 mb-6 border border-[var(--border-primary)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
            />
          </div>

          {/* Kategori */}
          <select
            value={filters.category || 'all'}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
          >
            <option value="all">Tüm Kategoriler</option>
            {priceTracker.getCategories().map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Birim */}
          <select
            value={filters.unit || 'all'}
            onChange={(e) => setFilters({ ...filters, unit: e.target.value as any })}
            className="px-4 py-2 border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
          >
            <option value="all">Tüm Birimler</option>
            <option value="kg">Kilogram</option>
            <option value="lt">Litre</option>
            <option value="adet">Adet</option>
          </select>

          {/* Trend Filtresi */}
          <select
            value={filters.trendFilter || 'all'}
            onChange={(e) => setFilters({ ...filters, trendFilter: e.target.value as any })}
            className="px-4 py-2 border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
          >
            <option value="all">Tüm Trendler</option>
            <option value="rising">Yükseliş</option>
            <option value="falling">Düşüş</option>
            <option value="stable">Sabit</option>
          </select>

          {/* Sıralama */}
          <select
            value={filters.sortBy || 'name'}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
            className="px-4 py-2 border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
          >
            <option value="name">İsme Göre</option>
            <option value="price">Fiyata Göre</option>
            <option value="trend">Trend'e Göre</option>
            <option value="freshness">Tazeliğe Göre</option>
          </select>
        </div>
      </div>

      {/* Ürün Listesi */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const productUpdateKey = product.id
            const isProductUpdating = updatingMarkets.has(productUpdateKey)
            const isRecentlyUpdated = recentlyUpdated.has(productUpdateKey)
            const hasUpdateError = updateErrors.has(productUpdateKey)
            const isStale = product.freshness > 7

            return (
            <div
              key={product.id}
              className={`bg-[var(--bg-secondary)] rounded-xl border overflow-hidden transition-all duration-300 ${
                isRecentlyUpdated 
                  ? 'border-green-400 animate-success-glow' 
                  : hasUpdateError 
                  ? 'border-orange-400 animate-error-pulse' 
                  : isStale
                  ? 'border-red-300'
                  : 'border-[var(--border-primary)]'
              } ${isRecentlyUpdated ? 'animate-update-price' : ''}`}
            >
              {/* Ana Satır */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                        {product.name}
                      </h3>
                      <span className="px-3 py-1 bg-[var(--accent-secondary)] text-[var(--accent-primary)] text-sm rounded-full font-medium">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${getFreshnessColor(product.freshness)}`} />
                        <span className={`text-sm transition-colors duration-1000 ${
                          isStale ? 'text-red-500 animate-freshness-fade' : 'text-[var(--text-secondary)]'
                        }`}>
                          {product.freshness === 0 ? 'Bugün güncellendi' : `${product.freshness} gün önce`}
                          {isStale && ' ⚠️'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* En Ucuz Fiyat */}
                      <div className="flex flex-col">
                        <span className="text-sm text-[var(--text-secondary)] mb-1">En Ucuz</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[var(--text-primary)]">
                            {product.cheapestPrice.unitPrice.toFixed(2)} ₺/{product.unit}
                          </span>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {product.cheapestPrice.market}
                          </span>
                        </div>
                      </div>

                      {/* Trend */}
                      <div className="flex flex-col items-center">
                        <span className="text-sm text-[var(--text-secondary)] mb-1">Trend</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(product.trend)}
                          <span className={`font-semibold ${getTrendColor(product.trend)}`}>
                            {product.trend.percentage > 0 ? '+' : ''}{product.trend.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Mini Grafik */}
                      <div className="flex flex-col items-center">
                        <span className="text-sm text-[var(--text-secondary)] mb-1">Son 10 Gün</span>
                        <div className={getTrendColor(product.trend)}>
                          {renderSparkline(product.trend.sparkline)}
                        </div>
                      </div>

                      {/* Ortalama Fiyat */}
                      <div className="flex flex-col">
                        <span className="text-sm text-[var(--text-secondary)] mb-1">Ortalama</span>
                        <span className="text-lg font-semibold text-[var(--text-primary)]">
                          {product.averagePrice.toFixed(2)} ₺/{product.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* İşlem Butonları */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePrice(product.id)}
                      disabled={isProductUpdating}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        isProductUpdating 
                          ? 'bg-purple-500 text-white cursor-wait' 
                          : isRecentlyUpdated
                          ? 'bg-green-500 text-white'
                          : hasUpdateError
                          ? 'bg-orange-500 text-white'
                          : 'bg-[var(--accent-primary)] text-white hover:opacity-90'
                      }`}
                    >
                      <RotateCcw className={`w-4 h-4 ${isProductUpdating ? 'animate-colorful-spin' : ''}`} />
                      {isProductUpdating ? 'Güncelleniyor...' : isRecentlyUpdated ? 'Güncellendi ✓' : hasUpdateError ? 'Tekrar dene' : 'Güncelle'}
                    </button>

                    <button
                      onClick={() => exportToCostSimulator(product.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Simülatör
                    </button>

                    <button
                      onClick={() => setExpandedProduct(
                        expandedProduct === product.id ? null : product.id
                      )}
                      className="flex items-center gap-2 px-4 py-2 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      {expandedProduct === product.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Detaylar
                    </button>
                  </div>
                </div>

                {/* Analiz */}
                {product.analysis && (
                  <div className="mt-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-primary)]">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[var(--accent-primary)] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[var(--text-secondary)] mb-1">
                          {product.analysis.packageEfficiency}
                        </p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {product.analysis.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detay Satırları */}
              {expandedProduct === product.id && (
                <div className="border-t border-[var(--border-primary)] bg-[var(--bg-primary)]">
                  <div className="p-6">
                    <h4 className="font-semibold text-[var(--text-primary)] mb-4">
                      Market Karşılaştırması
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {product.markets.map((market, index) => {
                        const marketKey = `${product.id}-${market.market}`
                        const isMarketUpdating = updatingMarkets.has(marketKey)
                        const isMarketRecentlyUpdated = recentlyUpdated.has(marketKey)
                        const hasMarketError = updateErrors.has(marketKey)

                        return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 animate-fade-in-scale ${
                            isMarketRecentlyUpdated 
                              ? 'bg-green-50 border-green-300 animate-success-glow' 
                              : hasMarketError 
                              ? 'bg-orange-50 border-orange-300 animate-error-pulse' 
                              : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`font-semibold ${market.isPredicted ? 'text-purple-600' : 'text-[var(--text-primary)]'}`}>
                                {market.market}
                                {market.isPredicted && (
                                  <span 
                                    className="ml-2 text-xs cursor-help" 
                                    title={`AI tahmini: ${market.prediction?.explanation}\nGüven: ${market.prediction?.confidence}%\nYöntem: ${market.prediction?.method}`}
                                  >
                                    🤖
                                  </span>
                                )}
                              </span>
                              {getMarketStatusBadge(market)}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                              <span>{market.package}</span>
                              <span>•</span>
                              <span className={market.isPredicted ? 'prediction-text' : ''}>{market.price.toFixed(2)} ₺</span>
                              <span>•</span>
                              <span className={`font-medium ${market.isPredicted ? 'prediction-text' : 'text-[var(--text-primary)]'}`}>
                                {market.unitPrice.toFixed(2)} ₺/{product.unit}
                              </span>
                              {market.isPredicted && market.prediction && (
                                <span className="text-xs text-purple-600 animate-fade-in-scale">
                                  ({market.prediction.confidence}% güven)
                                </span>
                              )}
                            </div>

                            {market.error && (
                              <p className="text-red-500 text-sm mt-1">
                                {market.error}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => updatePrice(product.id, market.market)}
                            disabled={market.isUpdating || isMarketUpdating}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                              isMarketUpdating
                                ? 'border-purple-400 text-purple-600 bg-purple-50'
                                : isMarketRecentlyUpdated
                                ? 'border-green-400 text-green-700 bg-green-50'
                                : hasMarketError
                                ? 'border-orange-400 text-orange-700 bg-orange-50'
                                : 'border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                            } ${market.isUpdating || isMarketUpdating ? 'cursor-wait opacity-75' : ''}`}
                          >
                            <RefreshCw className={`w-4 h-4 transition-all ${
                              market.isUpdating || isMarketUpdating ? 'animate-colorful-spin' : ''
                            }`} />
                            {market.isUpdating || isMarketUpdating 
                              ? 'Güncelleniyor...' 
                              : isMarketRecentlyUpdated 
                              ? 'Güncellendi ✓' 
                              : hasMarketError 
                              ? 'Tekrar dene ⚠️' 
                              : 'Güncelle'}
                          </button>
                        </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            )
          })}
        </div>
      )}

      {/* Boş durum */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Ürün Bulunamadı
          </h3>
          <p className="text-[var(--text-secondary)]">
            Arama kriterlerinizi değiştirerek tekrar deneyin
          </p>
        </div>
      )}
    </div>
  )
}