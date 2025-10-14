'use client'

import { useState, useMemo } from 'react'
import { BaseCard as Card } from '@/app/components/ui'
import { ProductDetailModal } from './components/ProductDetailModal'
import { PriceProduct, PriceFilter, mockPriceData, categories, suppliers, trendOptions } from '@/lib/data/priceTracking'
import { getTrendIcon } from '@/lib/utils/icons'
import { Search, Filter, RefreshCw, Download, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

export default function FiyatTakipPage() {
  const [products] = useState<PriceProduct[]>(mockPriceData)
  const [selectedProduct, setSelectedProduct] = useState<PriceProduct | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<PriceFilter>({
    category: null,
    supplier: null,
    trend: null,
    status: null,
    priceRange: { min: null, max: null }
  })

  // Filtreleme ve arama
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Arama terimi kontrolü
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.category.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.supplier.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Kategori filtresi
      if (filters.category && filters.category !== 'Tümü' && product.category !== filters.category) {
        return false
      }

      // Tedarikçi filtresi
      if (filters.supplier && filters.supplier !== 'Tümü' && product.supplier !== filters.supplier) {
        return false
      }

      // Trend filtresi
      if (filters.trend && filters.trend !== 'Tümü') {
        const trendMap = { 'Artan': 'up', 'Azalan': 'down', 'Sabit': 'stable' }
        if (product.trend !== trendMap[filters.trend as keyof typeof trendMap]) {
          return false
        }
      }

      // Durum filtresi
      if (filters.status && filters.status !== 'Tümü' && product.status !== filters.status) {
        return false
      }

      // Fiyat aralığı filtresi
      if (filters.priceRange.min !== null && product.currentPrice < filters.priceRange.min) {
        return false
      }
      if (filters.priceRange.max !== null && product.currentPrice > filters.priceRange.max) {
        return false
      }

      return true
    })
  }, [products, searchTerm, filters])

  const handleProductClick = (product: PriceProduct) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleFilterChange = (key: keyof PriceFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      category: null,
      supplier: null,
      trend: null,
      status: null,
      priceRange: { min: null, max: null }
    })
    setSearchTerm('')
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'var(--status-success)'     // Yeşil - Artış (Finansal Standart)
      case 'down': return 'var(--status-error)'     // Kırmızı - Düşüş (Finansal Standart)
      case 'stable': return 'var(--text-muted)'
      default: return 'var(--text-muted)'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'var(--status-success)'
      case 'limited': return 'var(--status-warning)'
      case 'unavailable': return 'var(--status-error)'
      default: return 'var(--text-muted)'
    }
  }

  const formatPrice = (price: number) => `₺${price.toFixed(2)}`

  // İstatistikler
  const stats = useMemo(() => {
    const totalProducts = filteredProducts.length
    const risingPrices = filteredProducts.filter(p => p.trend === 'up').length
    const fallingPrices = filteredProducts.filter(p => p.trend === 'down').length
    const stablePrices = filteredProducts.filter(p => p.trend === 'stable').length
    const activeAlerts = filteredProducts.reduce((acc, p) => acc + p.alerts.filter(a => a.isActive).length, 0)

    return { totalProducts, risingPrices, fallingPrices, stablePrices, activeAlerts }
  }, [filteredProducts])

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                📊 Fiyat Takip Sistemi
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Gerçek zamanlı malzeme fiyat izleme ve trend analizi
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                <RefreshCw size={16} />
                <span>Fiyatları Güncelle</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <Download size={16} />
                <span>Rapor İndir</span>
              </button>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Toplam Ürün</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.totalProducts}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
                📦
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Artan Fiyatlar</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>
                  {stats.risingPrices}
                </p>
              </div>
              <TrendingUp size={24} style={{ color: 'var(--status-success)' }} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Azalan Fiyatlar</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--status-error)' }}>
                  {stats.fallingPrices}
                </p>
              </div>
              <TrendingDown size={24} style={{ color: 'var(--status-error)' }} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sabit Fiyatlar</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>
                  {stats.stablePrices}
                </p>
              </div>
              <Minus size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Aktif Uyarılar</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--status-warning)' }}>
                  {stats.activeAlerts}
                </p>
              </div>
              <AlertTriangle size={24} style={{ color: 'var(--status-warning)' }} />
            </div>
          </Card>
        </div>

        {/* Filtreler */}
        <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Filter size={20} />
              Filtreler
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm px-3 py-1 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              Temizle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Arama */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                       style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ürün, kategori veya tedarikçi ara..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Kategori */}
            <div>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category === 'Tümü' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Tedarikçi */}
            <div>
              <select
                value={filters.supplier || ''}
                onChange={(e) => handleFilterChange('supplier', e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier === 'Tümü' ? '' : supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>

            {/* Trend */}
            <div>
              <select
                value={filters.trend || ''}
                onChange={(e) => handleFilterChange('trend', e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                {trendOptions.map(trend => (
                  <option key={trend} value={trend === 'Tümü' ? '' : trend}>
                    {trend}
                  </option>
                ))}
              </select>
            </div>

            {/* Durum */}
            <div>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">Tüm Durumlar</option>
                <option value="available">Mevcut</option>
                <option value="limited">Sınırlı</option>
                <option value="unavailable">Mevcut Değil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ürün Listesi */}
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => handleProductClick(product)}
            >
              <div className="flex items-center justify-between">
                {/* Sol - Ürün Bilgileri */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
                       style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
                    {product.category === 'Et Ürünleri' ? '🥩' :
                     product.category === 'Sebze & Meyve' ? '🥕' :
                     product.category === 'Tahıllar' ? '🌾' :
                     product.category === 'Yağlar' ? '🫒' : '📦'}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {product.category} • {product.supplier}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: getStatusColor(product.status) + '20',
                              color: getStatusColor(product.status)
                            }}>
                        {product.status === 'available' ? 'Mevcut' :
                         product.status === 'limited' ? 'Sınırlı' : 'Mevcut Değil'}
                      </span>
                      {product.alerts.some(a => a.isActive) && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle size={12} style={{ color: 'var(--status-warning)' }} />
                          <span className="text-xs" style={{ color: 'var(--status-warning)' }}>
                            {product.alerts.filter(a => a.isActive).length} uyarı
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Orta - Fiyat Bilgileri */}
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(product.currentPrice)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    /{product.unit}
                  </div>
                </div>

                {/* Sağ - Trend Bilgileri */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    {getTrendIcon(product.trend)}
                    <span className="font-bold" style={{ color: getTrendColor(product.trend) }}>
                      {product.trendPercentage > 0 ? '+' : ''}
                      {product.trendPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    önceki: {formatPrice(product.previousPrice)}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {product.lastUpdate.toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Sonuç bulunamadı */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Ürün Bulunamadı
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Arama kriterlerinize uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.
            </p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  )
}