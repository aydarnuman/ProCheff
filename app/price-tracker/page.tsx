'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, MoreHorizontal, X, ExternalLink, BarChart3, Package, ShoppingCart, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { 
  Product, 
  ProductVariant, 
  ProductComparison 
} from '@/lib/data/variantPricing'
import { 
  VariantPriceCalculator, 
  ProductComparisonEngine,
  VariantUtils,
  VariantMaintenanceService 
} from '@/lib/services/variantPriceEngine'
import VariantDetailModal from '@/app/components/VariantDetailModal'

// Mock data - gerçek API ile değiştirilecek
const mockProducts: Product[] = [
  {
    id: 'dana-eti-001',
    name: 'Dana Eti (Kuşbaşı)',
    brand: 'Genel',
    category: 'Et ve Et Ürünleri',
    baseUnit: 'kg',
    description: 'Taze dana kuşbaşı, yemeklik',
    keywords: ['dana', 'et', 'kuşbaşı', 'kırmızı et'],
    variants: [
      {
        id: 'dana-bim-5kg',
        productId: 'dana-eti-001',
        size: 5,
        sizeUnit: 'kg',
        packageType: 'ekonomik paket',
        market: 'BİM',
        price: 445.00,
        unitPrice: 89.00,
        isBasePrice: true,
        availability: 'available',
        priceSource: {
          id: 'bim-api-001',
          type: 'supplier_api',
          name: 'BİM API',
          lastCheck: new Date('2024-10-14'),
          isActive: true,
          confidence: 0.95
        },
        priceHistory: [],
        trend: { direction: 'down', percentage: -2.3, period: '7d', confidence: 0.88 },
        lastUpdated: new Date('2024-10-14')
      },
      {
        id: 'dana-migros-3kg',
        productId: 'dana-eti-001',
        size: 3,
        sizeUnit: 'kg',
        packageType: 'normal paket',
        market: 'Migros',
        price: 285.00,
        unitPrice: 95.00,
        isBasePrice: false,
        availability: 'available',
        priceSource: {
          id: 'migros-scraper-001',
          type: 'direct_scraping',
          name: 'Migros Scraper',
          lastCheck: new Date('2024-10-14'),
          isActive: true,
          confidence: 0.82
        },
        priceHistory: [],
        trend: { direction: 'up', percentage: 1.8, period: '7d', confidence: 0.75 },
        lastUpdated: new Date('2024-10-14')
      },
      {
        id: 'dana-a101-2kg',
        productId: 'dana-eti-001',
        size: 2,
        sizeUnit: 'kg',
        packageType: 'aile boyu',
        market: 'A101',
        price: 198.00,
        unitPrice: 99.00,
        isBasePrice: false,
        availability: 'limited',
        priceSource: {
          id: 'a101-manual-001',
          type: 'manual_entry',
          name: 'Manuel Giriş',
          lastCheck: new Date('2024-10-13'),
          isActive: true,
          confidence: 0.70
        },
        priceHistory: [],
        trend: { direction: 'stable', percentage: 0.2, period: '7d', confidence: 0.60 },
        lastUpdated: new Date('2024-10-13')
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-14')
  },
  {
    id: 'pirinc-001',
    name: 'Baldo Pirinç',
    brand: 'Genel',
    category: 'Tahıl ve Hububat',
    baseUnit: 'kg',
    description: 'Kaliteli baldo pirinç',
    keywords: ['pirinç', 'baldo', 'tahıl', 'pilav'],
    variants: [
      {
        id: 'pirinc-bim-10kg',
        productId: 'pirinc-001',
        size: 10,
        sizeUnit: 'kg',
        packageType: 'jumbo paket',
        market: 'BİM',
        price: 180.00,
        unitPrice: 18.00,
        isBasePrice: true,
        availability: 'available',
        priceSource: {
          id: 'bim-api-002',
          type: 'supplier_api',
          name: 'BİM API',
          lastCheck: new Date('2024-10-14'),
          isActive: true,
          confidence: 0.92
        },
        priceHistory: [],
        trend: { direction: 'down', percentage: -5.2, period: '30d', confidence: 0.85 },
        lastUpdated: new Date('2024-10-14')
      },
      {
        id: 'pirinc-migros-5kg',
        productId: 'pirinc-001',
        size: 5,
        sizeUnit: 'kg',
        packageType: 'ekonomik',
        market: 'Migros',
        price: 105.00,
        unitPrice: 21.00,
        isBasePrice: false,
        availability: 'available',
        priceSource: {
          id: 'migros-scraper-002',
          type: 'direct_scraping',
          name: 'Migros Scraper',
          lastCheck: new Date('2024-10-14'),
          isActive: true,
          confidence: 0.88
        },
        priceHistory: [],
        trend: { direction: 'stable', percentage: 0.5, period: '30d', confidence: 0.70 },
        lastUpdated: new Date('2024-10-14')
      }
    ],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-10-14')
  }
]

export default function AdvancedPriceTrackerPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [comparisons, setComparisons] = useState<ProductComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<Set<string>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Mock data - gerçek API ile değiştirilecek
      const productsWithCalculations = VariantMaintenanceService.refreshAllCalculations(mockProducts)
      setProducts(productsWithCalculations)
      
      // Karşılaştırma analizleri oluştur
      const productComparisons = ProductComparisonEngine.compareCategoryProducts(productsWithCalculations)
      setComparisons(productComparisons)
      
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProduct = async (productId: string) => {
    setRefreshing(prev => new Set(prev).add(productId))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      await loadProducts()
    } catch (error) {
      console.error('Ürün yenilenirken hata:', error)
    } finally {
      setRefreshing(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'limited':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'out_of_stock':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800'
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }} className="shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Gelişmiş Fiyat Takibi</h1>
                <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Varyant bazlı fiyat analizi ve karşılaştırma</p>
              </div>
              <button
                onClick={loadProducts}
                disabled={loading}
                className="flex items-center px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Tüm Fiyatları Yenile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="rounded-xl shadow-sm p-6 mb-8 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Kategori:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-primary)'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Tüm Kategoriler' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Toplam Ürün</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{products.length}</p>
              </div>
              <Package className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>

          <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Toplam Varyant</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {products.reduce((sum, p) => sum + p.variants.length, 0)}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8" style={{ color: 'var(--success-primary)' }} />
            </div>
          </div>

          <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Ortalama Güven</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {comparisons.length > 0 
                    ? (comparisons.reduce((sum, c) => sum + c.averageConfidence, 0) / comparisons.length * 100).toFixed(0)
                    : '0'
                  }%
                </p>
              </div>
              <BarChart3 className="w-8 h-8" style={{ color: 'var(--warning-primary)' }} />
            </div>
          </div>

          <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Aktif Market</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {Array.from(new Set(products.flatMap(p => p.variants.map(v => v.market)))).length}
                </p>
              </div>
              <ExternalLink className="w-8 h-8" style={{ color: 'var(--error-primary)' }} />
            </div>
          </div>
        </div>

        {/* Product Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Yükleniyor...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProducts.map((product) => {
              const comparison = comparisons.find(c => c.productId === product.id)
              const isRefreshing = refreshing.has(product.id)

              return (
                <div key={product.id} className="rounded-xl shadow-sm overflow-hidden border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                  {/* Product Header */}
                  <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                          <span className="px-2 py-1 text-sm rounded-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                            {product.category}
                          </span>
                        </div>
                        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
                        
                        {comparison && (
                          <div className="flex items-center space-x-6 mt-3">
                            <div className="text-sm">
                              <span style={{ color: 'var(--text-secondary)' }}>En İyi Fiyat: </span>
                              <span className="font-semibold" style={{ color: 'var(--success-primary)' }}>
                                {VariantUtils.formatUnitPrice(comparison.baseUnitPrice)}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span style={{ color: 'var(--text-secondary)' }}>Varyant: </span>
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{comparison.variantCount} seçenek</span>
                            </div>
                            <div className="text-sm">
                              <span style={{ color: 'var(--text-secondary)' }}>Fiyat Aralığı: </span>
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>%{comparison.priceRange.spread}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => refreshProduct(product.id)}
                          disabled={isRefreshing}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowDetailModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Variants Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Market / Paket
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Boyut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Toplam Fiyat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Birim Fiyat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trend
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                        {product.variants.map((variant) => (
                          <tr 
                            key={variant.id} 
                            className={`hover:opacity-80 transition-opacity ${variant.isBasePrice ? 'border-l-4' : ''}`}
                            style={{ 
                              backgroundColor: variant.isBasePrice ? 'rgba(35, 134, 54, 0.1)' : 'transparent',
                              borderLeftColor: variant.isBasePrice ? 'var(--success-primary)' : 'transparent'
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-primary)' }}>
                                  <span className="font-semibold text-sm text-white">
                                    {variant.market.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{variant.market}</div>
                                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{variant.packageType}</div>
                                </div>
                                {variant.isBasePrice && (
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    En Ucuz
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {variant.size} {variant.sizeUnit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-white">
                                {VariantUtils.formatPrice(variant.price)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-blue-600">
                                {VariantUtils.formatUnitPrice(variant.unitPrice)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getTrendIcon(variant.trend.direction)}
                                <span className={`ml-1 text-sm ${
                                  variant.trend.direction === 'up' ? 'text-red-600' : 
                                  variant.trend.direction === 'down' ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {VariantUtils.formatTrend(variant.trend.percentage)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {getAvailabilityBadge(variant.availability)}
                                <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceBadge(variant.priceSource.confidence)}`}>
                                  {VariantUtils.confidenceToLabel(variant.priceSource.confidence)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <VariantDetailModal
        product={selectedProduct!}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  )
}