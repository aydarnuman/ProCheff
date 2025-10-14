'use client'

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, Zap, Settings, Plus, Trash2, Download, ArrowRight, Target, DollarSign, ShoppingCart, Package, BarChart3 } from 'lucide-react'
import { 
  Product, 
  ProductVariant, 
  CostSimulationInput,
  CostSimulationResult 
} from '@/lib/data/variantPricing'
import { 
  CostSimulationEngine,
  VariantPriceCalculator,
  VariantUtils 
} from '@/lib/services/variantPriceEngine'

// Mock product data - gerçek API ile değiştirilecek
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
      }
    ],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-10-14')
  },
  {
    id: 'sogan-001',
    name: 'Soğan',
    brand: 'Genel',
    category: 'Sebze ve Meyve',
    baseUnit: 'kg',
    description: 'Taze kuru soğan',
    keywords: ['soğan', 'sebze', 'kuru soğan'],
    variants: [
      {
        id: 'sogan-bim-2kg',
        productId: 'sogan-001',
        size: 2,
        sizeUnit: 'kg',
        packageType: 'file',
        market: 'BİM',
        price: 18.00,
        unitPrice: 9.00,
        isBasePrice: true,
        availability: 'available',
        priceSource: {
          id: 'bim-api-003',
          type: 'supplier_api',
          name: 'BİM API',
          lastCheck: new Date('2024-10-14'),
          isActive: true,
          confidence: 0.90
        },
        priceHistory: [],
        trend: { direction: 'stable', percentage: 0.1, period: '7d', confidence: 0.70 },
        lastUpdated: new Date('2024-10-14')
      }
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-10-14')
  }
]

interface SimulationRequest {
  productId: string
  requiredQuantity: number
  targetBudget?: number
}

export default function AdvancedCostSimulatorPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [simulationRequests, setSimulationRequests] = useState<SimulationRequest[]>([
    { productId: 'dana-eti-001', requiredQuantity: 50 },
    { productId: 'pirinc-001', requiredQuantity: 20 },
    { productId: 'sogan-001', requiredQuantity: 10 }
  ])
  
  const [results, setResults] = useState<CostSimulationResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [servingCount, setServingCount] = useState(100)
  const [totalBudget, setTotalBudget] = useState<number | undefined>(undefined)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      // Mock data - gerçek API ile değiştirilecek
      setProducts(mockProducts)
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error)
    }
  }

  const addSimulationRequest = () => {
    setSimulationRequests(prev => [...prev, {
      productId: '',
      requiredQuantity: 1
    }])
  }

  const removeSimulationRequest = (index: number) => {
    setSimulationRequests(prev => prev.filter((_, i) => i !== index))
  }

  const updateSimulationRequest = (index: number, updates: Partial<SimulationRequest>) => {
    setSimulationRequests(prev => prev.map((req, i) => 
      i === index ? { ...req, ...updates } : req
    ))
  }

  const runSimulation = async () => {
    setIsCalculating(true)
    try {
      const simulationResults: CostSimulationResult[] = []
      
      for (const request of simulationRequests) {
        if (!request.productId || request.requiredQuantity <= 0) continue
        
        const product = products.find(p => p.id === request.productId)
        if (!product) continue
        
        const input: CostSimulationInput = {
          productId: request.productId,
          requiredQuantity: request.requiredQuantity,
          requiredUnit: product.baseUnit,
          targetBudget: request.targetBudget
        }
        
        const result = CostSimulationEngine.simulate(product, input)
        simulationResults.push(result)
      }
      
      setResults(simulationResults)
    } catch (error) {
      console.error('Simülasyon hatası:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const getTotalCost = () => {
    return results.reduce((sum, result) => sum + result.calculation.totalCost, 0)
  }

  const getCostPerServing = () => {
    const total = getTotalCost()
    return servingCount > 0 ? total / servingCount : 0
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="shadow-sm border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Maliyet Simülatörü</h1>
                <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Varyant bazlı maliyet hesaplama ve optimizasyon</p>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                  showSettings 
                    ? 'border-blue-300 text-blue-400' 
                    : 'hover:opacity-80'
                }`}
                style={{ 
                  backgroundColor: showSettings ? 'var(--accent-primary)' : 'var(--bg-primary)', 
                  borderColor: showSettings ? 'var(--accent-primary)' : 'var(--border-primary)',
                  color: showSettings ? 'white' : 'var(--text-primary)'
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Panel - Simülasyon Parametreleri */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Genel Ayarlar */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Genel Parametreler</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Porsiyon Sayısı
                  </label>
                  <input
                    type="number"
                    value={servingCount}
                    onChange={(e) => setServingCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-primary)', 
                      color: 'var(--text-primary)' 
                    }}
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Toplam Bütçe (Opsiyonel)
                  </label>
                  <input
                    type="number"
                    value={totalBudget || ''}
                    onChange={(e) => setTotalBudget(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-primary)', 
                      color: 'var(--text-primary)' 
                    }}
                    placeholder="Bütçe sınırı"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Aksiyonlar */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Aksiyonlar</h3>
              
              <div className="space-y-3">
                <button
                  onClick={runSimulation}
                  disabled={isCalculating || simulationRequests.length === 0}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  {isCalculating ? 'Hesaplanıyor...' : 'Simülasyon Çalıştır'}
                </button>
                
                <button
                  onClick={() => {/* Export işlevi */}}
                  disabled={results.length === 0}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium border transition-all disabled:opacity-50 hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)' 
                  }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Sonuçları Dışa Aktar
                </button>
              </div>
            </div>

            {/* Ürün Listesi */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Ürün Listesi</h3>
                <button
                  onClick={addSimulationRequest}
                  className="flex items-center px-3 py-2 text-sm rounded-lg hover:opacity-80"
                  style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ürün Ekle
                </button>
              </div>

              <div className="space-y-4">
                {simulationRequests.map((request, index) => (
                  <div key={index} className="p-4 border rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Ürün {index + 1}</span>
                      <button
                        onClick={() => removeSimulationRequest(index)}
                        className="hover:opacity-80"
                        style={{ color: 'var(--error-primary)' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <select
                          value={request.productId}
                          onChange={(e) => updateSimulationRequest(index, { productId: e.target.value })}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            borderColor: 'var(--border-primary)', 
                            color: 'var(--text-primary)' 
                          }}
                        >
                          <option value="">Ürün seçin...</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <input
                          type="number"
                          value={request.requiredQuantity}
                          onChange={(e) => updateSimulationRequest(index, { requiredQuantity: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            borderColor: 'var(--border-primary)', 
                            color: 'var(--text-primary)' 
                          }}
                          placeholder="Miktar"
                          min="0.1"
                          step="0.1"
                        />
                      </div>

                      <div>
                        <input
                          type="number"
                          value={request.targetBudget || ''}
                          onChange={(e) => updateSimulationRequest(index, { 
                            targetBudget: e.target.value ? Number(e.target.value) : undefined 
                          })}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            borderColor: 'var(--border-primary)', 
                            color: 'var(--text-primary)' 
                          }}
                          placeholder="Hedef bütçe (opsiyonel)"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Özet Kartlar */}
            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Toplam Maliyet</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {VariantUtils.formatPrice(getTotalCost())}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8" style={{ color: 'var(--success-primary)' }} />
                  </div>
                </div>

                <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Porsiyon Maliyeti</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {VariantUtils.formatPrice(getCostPerServing())}
                      </p>
                    </div>
                    <Target className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                </div>

                <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Ürün Sayısı</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{results.length}</p>
                    </div>
                    <Package className="w-8 h-8" style={{ color: 'var(--warning-primary)' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Simülasyon Sonuçları */}
            {results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="rounded-xl shadow-sm overflow-hidden border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                    
                    {/* Ürün Header */}
                    <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{result.productName}</h3>
                          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {result.selectedVariant.market} - {result.selectedVariant.size} {result.selectedVariant.sizeUnit}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                            {VariantUtils.formatPrice(result.calculation.totalCost)}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {VariantUtils.formatUnitPrice(result.calculation.unitPrice)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hesaplama Detayları */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>İhtiyaç</div>
                          <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {simulationRequests[index]?.requiredQuantity} kg
                          </div>
                        </div>
                        <div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Alınan Miktar</div>
                          <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {result.calculation.quantity} kg
                          </div>
                        </div>
                        <div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Paket Sayısı</div>
                          <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {result.calculation.packageCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Kalan</div>
                          <div className="text-lg font-semibold text-white">
                            {result.calculation.remainingAmount} kg
                          </div>
                        </div>
                      </div>

                      {/* Bütçe Analizi */}
                      {result.budgetAnalysis && (
                        <div className="p-4 rounded-lg border" style={{
                          backgroundColor: result.budgetAnalysis.isWithinBudget ? 'rgba(35, 134, 54, 0.1)' : 'rgba(218, 54, 51, 0.1)',
                          borderColor: result.budgetAnalysis.isWithinBudget ? 'var(--success-primary)' : 'var(--error-primary)'
                        }}>
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              Bütçe Durumu: {result.budgetAnalysis.isWithinBudget ? '✅ Uygun' : '❌ Aşım'}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              %{result.budgetAnalysis.budgetUsage} kullanım
                            </div>
                          </div>
                          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {result.budgetAnalysis.savingsOrOverrun >= 0 ? 'Tasarruf: ' : 'Aşım: '}
                            {VariantUtils.formatPrice(Math.abs(result.budgetAnalysis.savingsOrOverrun))}
                          </div>
                        </div>
                      )}

                      {/* Alternatifler */}
                      {result.alternatives.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Alternatif Seçenekler</h4>
                          <div className="space-y-3">
                            {result.alternatives.slice(0, 3).map((alternative, altIndex) => (
                              <div key={altIndex} className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                                <div>
                                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {alternative.variant.market} - {alternative.variant.size} {alternative.variant.sizeUnit}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {VariantUtils.formatUnitPrice(alternative.variant.unitPrice)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {VariantUtils.formatPrice(alternative.totalCost)}
                                  </div>
                                  <div className={`text-sm`} style={{ color: alternative.savings > 0 ? 'var(--success-primary)' : 'var(--error-primary)' }}>
                                    {alternative.savings > 0 ? '+' : ''}{VariantUtils.formatPrice(alternative.savings)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl shadow-sm p-12 text-center border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Simülasyon Sonucu Yok</h3>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Maliyet analizi görmek için ürün ekleyip simülasyonu çalıştırın.
                </p>
                <button
                  onClick={addSimulationRequest}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  İlk Ürünü Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}