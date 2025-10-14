// 🔍 Varyant Detay Modal - Accordion Sistemi ile Kapsamlı Analiz

import React, { useState } from 'react'
import { X, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, BarChart3, Calculator, AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react'
import { Product, ProductVariant, ProductComparison } from '@/lib/data/variantPricing'
import { VariantUtils, CostSimulationEngine, ProductComparisonEngine } from '@/lib/services/variantPriceEngine'

interface VariantDetailModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

interface AccordionSection {
  id: string
  title: string
  icon: React.ReactNode
  badge?: string
}

export default function VariantDetailModal({ product, isOpen, onClose }: VariantDetailModalProps) {
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [simulationQuantity, setSimulationQuantity] = useState<number>(100)
  const [selectedVariantForSim, setSelectedVariantForSim] = useState<string>('')

  if (!isOpen || !product) return null

  // Karşılaştırma analizi oluştur
  const comparison = ProductComparisonEngine.createComparison(product)

  // Maliyet simülasyonu
  const runCostSimulation = () => {
    if (!selectedVariantForSim || simulationQuantity <= 0) return null
    
    try {
      return CostSimulationEngine.simulate(product, {
        productId: product.id,
        requiredQuantity: simulationQuantity,
        requiredUnit: product.baseUnit,
        selectedVariantId: selectedVariantForSim || undefined
      })
    } catch (error) {
      console.error('Simülasyon hatası:', error)
      return null
    }
  }

  const simulationResult = runCostSimulation()

  // Accordion sections
  const accordionSections: AccordionSection[] = [
    {
      id: 'overview',
      title: 'Genel Bakış',
      icon: <BarChart3 className="w-5 h-5" />,
      badge: `${product.variants.length} varyant`
    },
    {
      id: 'variants',
      title: 'Varyant Karşılaştırması',
      icon: <CheckCircle2 className="w-5 h-5" />,
      badge: comparison.bestVariant.market
    },
    {
      id: 'trends',
      title: 'Fiyat Trendleri',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: `${comparison.marketCoverage.length} market`
    },
    {
      id: 'simulation',
      title: 'Maliyet Simülasyonu',
      icon: <Calculator className="w-5 h-5" />,
      badge: simulationResult ? `₺${simulationResult.calculation.totalCost}` : undefined
    }
  ]

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getAvailabilityIcon = (availability: string) => {
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

  const getFreshnessIcon = (lastUpdate: Date) => {
    const freshness = VariantUtils.checkFreshness(lastUpdate)
    
    switch (freshness) {
      case 'fresh':
        return <Zap className="w-4 h-4 text-green-500" />
      case 'moderate':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Ürün Özet Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
          <div className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>En İyi Birim Fiyat</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {VariantUtils.formatUnitPrice(comparison.baseUnitPrice)}
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {comparison.bestVariant.market} - {comparison.bestVariant.size} {comparison.bestVariant.sizeUnit}
          </div>
        </div>

        <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
          <div className="text-sm font-medium" style={{ color: 'var(--success-primary)' }}>Fiyat Aralığı</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            %{comparison.priceRange.spread}
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {VariantUtils.formatUnitPrice(comparison.priceRange.min)} - {VariantUtils.formatUnitPrice(comparison.priceRange.max)}
          </div>
        </div>

        <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
          <div className="text-sm font-medium" style={{ color: 'var(--warning-primary)' }}>Ortalama Güven</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {(comparison.averageConfidence * 100).toFixed(0)}%
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {VariantUtils.confidenceToLabel(comparison.averageConfidence)}
          </div>
        </div>
      </div>

      {/* Market Dağılımı */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Market Dağılımı</h4>
        <div className="flex flex-wrap gap-2">
          {comparison.marketCoverage.map(market => {
            const marketVariants = product.variants.filter(v => v.market === market)
            const avgPrice = marketVariants.reduce((sum, v) => sum + v.unitPrice, 0) / marketVariants.length

            return (
              <div key={market} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">{market}</span>
                <span className="text-sm text-gray-500">
                  ({marketVariants.length} varyant, ort: {VariantUtils.formatUnitPrice(avgPrice)})
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Ürün Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Ürün Detayları</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Kategori:</span>
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Marka:</span>
              <span className="font-medium">{product.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Temel Birim:</span>
              <span className="font-medium">{product.baseUnit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Son Güncelleme:</span>
              <span className="font-medium">{comparison.lastUpdate.toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Anahtar Kelimeler</h4>
          <div className="flex flex-wrap gap-2">
            {product.keywords.map(keyword => (
              <span
                key={keyword}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderVariantsSection = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-300">Market / Paket</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-300">Boyut</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-300">Toplam Fiyat</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-300">Birim Fiyat</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-300">Durum</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-300">Güvenilirlik</th>
            </tr>
          </thead>
          <tbody>
            {product.variants
              .sort((a, b) => a.unitPrice - b.unitPrice)
              .map((variant, index) => (
              <tr 
                key={variant.id} 
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  variant.isBasePrice ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">
                        {variant.market.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-white">{variant.market}</div>
                      <div className="text-xs text-gray-500">{variant.packageType}</div>
                    </div>
                    {variant.isBasePrice && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        En Ucuz
                      </span>
                    )}
                    {index === 0 && !variant.isBasePrice && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        En İyi Fiyat
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-white">
                  {variant.size} {variant.sizeUnit}
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-semibold text-white">
                    {VariantUtils.formatPrice(variant.price)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-bold text-blue-600">
                    {VariantUtils.formatUnitPrice(variant.unitPrice)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getAvailabilityIcon(variant.availability)}
                    {getFreshnessIcon(variant.lastUpdated)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      variant.priceSource.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                      variant.priceSource.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {VariantUtils.confidenceToLabel(variant.priceSource.confidence)}
                    </div>
                    <span className="text-xs text-gray-500">{variant.priceSource.name}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderTrendsSection = () => (
    <div className="space-y-6">
      {/* Trend Özet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['up', 'down', 'stable'].map(direction => {
          const variantsWithDirection = product.variants.filter(v => v.trend.direction === direction)
          const avgChange = variantsWithDirection.length > 0
            ? variantsWithDirection.reduce((sum, v) => sum + v.trend.percentage, 0) / variantsWithDirection.length
            : 0

          return (
            <div key={direction} className="border rounded-xl p-4" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(direction)}
                  <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-secondary)' }}>
                    {direction === 'up' ? 'Artan' : direction === 'down' ? 'Azalan' : 'Sabit'}
                  </span>
                </div>
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {variantsWithDirection.length}
                </span>
              </div>
              {variantsWithDirection.length > 0 && (
                <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Ort: {VariantUtils.formatTrend(avgChange)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detaylı Trend Tablosu */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Varyant Bazlı Trend Analizi</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Varyant</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Trend</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Değişim</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Periyot</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Güven</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map(variant => (
                <tr key={variant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-white">
                      {variant.market} ({variant.size} {variant.sizeUnit})
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {getTrendIcon(variant.trend.direction)}
                      <span className={`ml-2 text-sm ${
                        variant.trend.direction === 'up' ? 'text-red-600' : 
                        variant.trend.direction === 'down' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {variant.trend.direction === 'up' ? 'Artış' : 
                         variant.trend.direction === 'down' ? 'Düşüş' : 'Sabit'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      variant.trend.direction === 'up' ? 'text-red-600' : 
                      variant.trend.direction === 'down' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {VariantUtils.formatTrend(variant.trend.percentage)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {variant.trend.period === '1d' ? '1 Gün' :
                     variant.trend.period === '7d' ? '7 Gün' : '30 Gün'}
                  </td>
                  <td className="py-3 px-4">
                    <div className={`px-2 py-1 text-xs rounded-full inline-block ${
                      variant.trend.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                      variant.trend.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      %{(variant.trend.confidence * 100).toFixed(0)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSimulationSection = () => (
    <div className="space-y-6">
      {/* Simülasyon Girişleri */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Maliyet Hesaplama Parametreleri</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İhtiyaç Miktarı ({product.baseUnit})
            </label>
            <input
              type="number"
              value={simulationQuantity}
              onChange={(e) => setSimulationQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Varyant Seçimi
            </label>
            <select
              value={selectedVariantForSim}
              onChange={(e) => setSelectedVariantForSim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">En ucuz varyantı otomatik seç</option>
              {product.variants.map(variant => (
                <option key={variant.id} value={variant.id}>
                  {variant.market} - {variant.size} {variant.sizeUnit} ({VariantUtils.formatUnitPrice(variant.unitPrice)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Simülasyon Sonuçları */}
      {simulationResult && (
        <div className="space-y-6">
          {/* Seçilen Varyant */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">Seçilen Varyant</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-blue-700">Market</div>
                <div className="text-lg font-bold text-blue-900">{simulationResult.selectedVariant.market}</div>
              </div>
              <div>
                <div className="text-sm text-blue-700">Paket Boyutu</div>
                <div className="text-lg font-bold text-blue-900">
                  {simulationResult.selectedVariant.size} {simulationResult.selectedVariant.sizeUnit}
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-700">Birim Fiyat</div>
                <div className="text-lg font-bold text-blue-900">
                  {VariantUtils.formatUnitPrice(simulationResult.selectedVariant.unitPrice)}
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-700">Paket Sayısı</div>
                <div className="text-lg font-bold text-blue-900">{simulationResult.calculation.packageCount}</div>
              </div>
            </div>
          </div>

          {/* Maliyet Hesabı */}
          <div className="bg-green-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-green-900 mb-4">Maliyet Analizi</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-green-700">Toplam Miktar</div>
                <div className="text-xl font-bold text-green-900">
                  {simulationResult.calculation.quantity} {product.baseUnit}
                </div>
              </div>
              <div>
                <div className="text-sm text-green-700">Toplam Maliyet</div>
                <div className="text-2xl font-bold text-green-900">
                  {VariantUtils.formatPrice(simulationResult.calculation.totalCost)}
                </div>
              </div>
              <div>
                <div className="text-sm text-green-700">Kalan Miktar</div>
                <div className="text-lg font-bold text-green-900">
                  {simulationResult.calculation.remainingAmount} {product.baseUnit}
                </div>
              </div>
            </div>
          </div>

          {/* Alternatifler */}
          {simulationResult.alternatives.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Alternatif Seçenekler</h4>
              <div className="space-y-3">
                {simulationResult.alternatives.map((alternative, index) => (
                  <div key={alternative.variant.id} className="border rounded-xl p-4" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {alternative.variant.market} - {alternative.variant.size} {alternative.variant.sizeUnit}
                          </div>
                          <div className="text-sm text-gray-500">
                            Birim: {VariantUtils.formatUnitPrice(alternative.variant.unitPrice)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {VariantUtils.formatPrice(alternative.totalCost)}
                        </div>
                        <div className={`text-sm ${alternative.savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {alternative.savings > 0 ? '+' : ''}{VariantUtils.formatPrice(alternative.savings)} tasarruf
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{product.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{product.category} • {product.variants.length} varyant</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:opacity-80 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <X className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Accordion Navigation */}
        <div className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex overflow-x-auto">
            {accordionSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === section.id ? '' : 'border-transparent hover:opacity-80'
                }`}
                style={{
                  borderBottomColor: activeSection === section.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeSection === section.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backgroundColor: activeSection === section.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}
              >
                {section.icon}
                <span className="font-medium">{section.title}</span>
                {section.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full`}
                    style={{
                      backgroundColor: activeSection === section.id ? 'var(--accent-primary)' : 'var(--bg-primary)',
                      color: activeSection === section.id ? 'white' : 'var(--text-secondary)'
                    }}>
                    {section.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {activeSection === 'overview' && renderOverviewSection()}
          {activeSection === 'variants' && renderVariantsSection()}
          {activeSection === 'trends' && renderTrendsSection()}
          {activeSection === 'simulation' && renderSimulationSection()}
        </div>
      </div>
    </div>
  )
}