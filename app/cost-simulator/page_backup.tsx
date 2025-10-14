'use client'

import { useState, useEffect } from 'react'
import { CostSimulator, OptimizationRequest, CostCalculation, RequiredIngredient } from '@/lib/services/costSimulator'
import { Calculator, TrendingUp, Zap, Settings, Plus, Trash2, Download, ArrowRight, Target, DollarSign, MapPin, Clock } from 'lucide-react'

export default function CostSimulatorPage() {
  const [simulator] = useState(new CostSimulator())
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<CostCalculation | null>(null)
  
  const [portionCount, setPortionCount] = useState(500)
  const [targetProfitMargin, setTargetProfitMargin] = useState(20)
  const [maxBudgetPerPortion, setMaxBudgetPerPortion] = useState('')
  const [qualityPreference, setQualityPreference] = useState<'premium' | 'standard' | 'budget'>('standard')
  const [batchSize, setBatchSize] = useState<'small' | 'medium' | 'large'>('medium')
  
  const [specialRequirements, setSpecialRequirements] = useState({
    organic: false,
    halal: true,
    local: false,
    certified: true
  })

  const [ingredients, setIngredients] = useState<RequiredIngredient[]>([
    {
      name: 'Dana Eti',
      category: 'et',
      quantity: 120,
      alternatives: ['kuzu eti', 'kırmızı et'],
      priority: 'essential'
    },
    {
      name: 'Sebze Karışımı',
      category: 'sebze', 
      quantity: 50,
      alternatives: ['domates', 'soğan', 'biber'],
      priority: 'important'
    },
    {
      name: 'Ayçiçek Yağı',
      category: 'yag',
      quantity: 15,
      alternatives: ['zeytinyağı', 'mısır yağı'],
      priority: 'essential'
    }
  ])

  const handleOptimize = async () => {
    setIsCalculating(true)
    
    try {
      const request: OptimizationRequest = {
        ingredients,
        portionCount,
        targetProfitMargin,
        maxBudgetPerPortion: maxBudgetPerPortion ? parseFloat(maxBudgetPerPortion) : undefined,
        qualityPreference,
        specialRequirements,
        batchSize
      }

      const calculation = await simulator.optimizeCost(request)
      setResult(calculation)
      
    } catch (error) {
      console.error('Optimizasyon hatası:', error)
      alert('Maliyet optimizasyonu sırasında hata oluştu')
    } finally {
      setIsCalculating(false)
    }
  }

  const addIngredient = () => {
    const newIngredient: RequiredIngredient = {
      name: '',
      category: 'other',
      quantity: 50,
      alternatives: [],
      priority: 'important'
    }
    setIngredients([...ingredients, newIngredient])
  }

  const updateIngredient = (index: number, updates: Partial<RequiredIngredient>) => {
    const updated = ingredients.map((ing, i) => 
      i === index ? { ...ing, ...updates } : ing
    )
    setIngredients(updated)
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const optimizationFeatures = [
    {
      icon: Target,
      title: 'Tedarikçi Optimizasyonu',
      description: 'En uygun tedarikçileri bulur',
      color: 'var(--accent-primary)'
    },
    {
      icon: DollarSign,
      title: 'Maliyet Analizi',
      description: 'Detaylı maliyet kırılımı yapar',
      color: 'var(--status-success)'
    },
    {
      icon: TrendingUp,
      title: 'Kar Marjı Hesabı',
      description: 'Optimal kar marjı önerir',
      color: 'var(--accent-secondary)'
    },
    {
      icon: MapPin,
      title: 'Lojistik Optimizasyonu',
      description: 'Teslimat maliyetlerini minimize eder',
      color: 'var(--status-warning)'
    }
  ]

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'premium': return { label: 'Premium', color: 'var(--accent-primary)' }
      case 'standard': return { label: 'Standart', color: 'var(--status-success)' }
      case 'budget': return { label: 'Ekonomik', color: 'var(--status-warning)' }
      default: return { label: 'Standart', color: 'var(--status-success)' }
    }
  }

  const getBatchSizeLabel = (batch: string) => {
    switch (batch) {
      case 'small': return { label: 'Küçük Batch', color: 'var(--status-warning)' }
      case 'medium': return { label: 'Orta Batch', color: 'var(--accent-primary)' }
      case 'large': return { label: 'Büyük Batch', color: 'var(--status-success)' }
      default: return { label: 'Orta Batch', color: 'var(--accent-primary)' }
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                💰 Maliyet Simülasyonu
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Tedarikçi analizi ve kar optimizasyonu
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                   style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <Calculator size={16} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  AI Optimizasyon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {optimizationFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="p-4 rounded-xl border"
                   style={{ 
                     backgroundColor: 'var(--bg-secondary)',
                     borderColor: 'var(--border-primary)'
                   }}>
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent size={20} style={{ color: feature.color }} />
                  <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Panel - Ayarlar */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Temel Ayarlar */}
            <div className="p-6 rounded-xl border" 
                 style={{ 
                   backgroundColor: 'var(--bg-secondary)',
                   borderColor: 'var(--border-primary)'
                 }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}>
                <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
                Temel Parametreler
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Porsiyon Sayısı
                  </label>
                  <input
                    type="number"
                    value={portionCount}
                    onChange={(e) => setPortionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Hedef Kar Marjı (%)
                  </label>
                  <input
                    type="number"
                    value={targetProfitMargin}
                    onChange={(e) => setTargetProfitMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Maks. Porsiyon Maliyeti (₺)
                  </label>
                  <input
                    type="number"
                    value={maxBudgetPerPortion}
                    onChange={(e) => setMaxBudgetPerPortion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Sınır yok"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Kalite ve Teslimat Ayarları */}
            <div className="p-6 rounded-xl border" 
                 style={{ 
                   backgroundColor: 'var(--bg-secondary)',
                   borderColor: 'var(--border-primary)'
                 }}>
              <h2 className="text-lg font-semibold mb-4"
                  style={{ color: 'var(--text-primary)' }}>
                🎯 Optimizasyon Hedefleri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Kalite Tercihi
                  </label>
                  <select
                    value={qualityPreference}
                    onChange={(e) => setQualityPreference(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="budget">Ekonomik</option>
                    <option value="standard">Standart</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Üretim Batch Boyutu
                  </label>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="small">Küçük (500-2000 porsiyon)</option>
                    <option value="medium">Orta (2000-10000 porsiyon)</option>
                    <option value="large">Büyük (10000+ porsiyon)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Özel Gereksinimler */}
            <div className="p-6 rounded-xl border" 
                 style={{ 
                   backgroundColor: 'var(--bg-secondary)',
                   borderColor: 'var(--border-primary)'
                 }}>
              <h2 className="text-lg font-semibold mb-4"
                  style={{ color: 'var(--text-primary)' }}>
                📋 Özel Gereksinimler
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(specialRequirements).map(([key, value]) => {
                  const labels = {
                    organic: 'Organik',
                    halal: 'Helal Sertifikalı',
                    local: 'Yerel Tedarikçi',
                    certified: 'Kalite Sertifikası'
                  }
                  
                  return (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSpecialRequirements(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {labels[key as keyof typeof labels]}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Malzeme Listesi */}
            <div className="p-6 rounded-xl border" 
                 style={{ 
                   backgroundColor: 'var(--bg-secondary)',
                   borderColor: 'var(--border-primary)'
                 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}>
                  🥄 Malzeme Listesi
                </h2>
                <button
                  onClick={addIngredient}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white'
                  }}
                >
                  <Plus size={16} />
                  Malzeme Ekle
                </button>
              </div>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="p-4 rounded-lg border"
                       style={{ 
                         backgroundColor: 'var(--bg-tertiary)',
                         borderColor: 'var(--border-secondary)'
                       }}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Malzeme adı"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, { name: e.target.value })}
                        className="px-3 py-2 rounded border text-sm"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      
                      <input
                        type="number"
                        placeholder="Miktar (g)"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, { quantity: Number(e.target.value) })}
                        className="px-3 py-2 rounded border text-sm"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      
                      <select
                        value={ingredient.priority}
                        onChange={(e) => updateIngredient(index, { priority: e.target.value as any })}
                        className="px-3 py-2 rounded border text-sm"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="essential">Zorunlu</option>
                        <option value="important">Önemli</option>
                        <option value="optional">İsteğe Bağlı</option>
                      </select>
                      
                      <button
                        onClick={() => removeIngredient(index)}
                        className="flex items-center justify-center px-3 py-2 rounded transition-colors duration-200"
                        style={{
                          backgroundColor: 'var(--status-error)',
                          color: 'white'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {ingredients.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Henüz malzeme eklenmemiş. Yukarıdaki "Malzeme Ekle" butonunu kullanın.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Optimizasyon Butonu */}
            <div className="text-center">
              <button
                onClick={handleOptimize}
                disabled={isCalculating || ingredients.length === 0}
                className="px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white'
                }}
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Optimizasyon Yapılıyor...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Maliyet Optimizasyonunu Başlat
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Maliyet Özeti */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-accent-subtle)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}>
                    <TrendingUp size={20} style={{ color: 'var(--status-success)' }} />
                    Optimizasyon Sonucu
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-secondary)' }}>Toplam Maliyet:</span>
                      <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        ₺{result.totalCost.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-secondary)' }}>Porsiyon Başı:</span>
                      <span className="text-lg font-semibold" style={{ color: 'var(--accent-primary)' }}>
                        ₺{(result.totalCost / portionCount).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t"
                         style={{ borderColor: 'var(--border-secondary)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Hedef Kar Marjı:</span>
                      <span className="text-xl font-bold" style={{ color: 'var(--status-success)' }}>
                        %{targetProfitMargin}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optimizasyon Detayları */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-secondary)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h3 className="text-lg font-semibold mb-4"
                      style={{ color: 'var(--text-primary)' }}>
                    📊 Maliyet Kırılımı
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Malzeme Maliyeti:
                      </span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        ₺{result.breakdown.ingredients.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        İşçilik:
                      </span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        ₺{result.breakdown.labor.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Teslimat:
                      </span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        ₺{result.breakdown.delivery.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Genel Giderler:
                      </span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        ₺{result.breakdown.overhead.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Öneriler */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-secondary)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h3 className="text-lg font-semibold mb-4"
                      style={{ color: 'var(--text-primary)' }}>
                    💡 AI Önerileri
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--accent-primary)' }}>•</span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Yerel tedarikçiler %15 daha uygun maliyetli
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--accent-primary)' }}>•</span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Toplu alım ile %8 indirim fırsatı mevcut
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--accent-primary)' }}>•</span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Alternatif malzemeler ile %12 tasarruf sağlanabilir
                      </span>
                    </div>
                  </div>
                </div>

                {/* İndir & Devam Et */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-secondary)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}>
                    <Download size={20} style={{ color: 'var(--accent-primary)' }} />
                    Sonuçlar
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      📊 Maliyet Raporu (.xlsx)
                    </button>
                    
                    <button
                      className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white'
                      }}
                    >
                      <Target size={16} />
                      Teklif Paneline Gönder
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 rounded-xl border text-center" 
                   style={{ 
                     backgroundColor: 'var(--bg-secondary)',
                     borderColor: 'var(--border-primary)'
                   }}>
                <div className="text-4xl mb-3">💰</div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  Maliyet optimizasyonu için parametreleri ayarlayın ve malzemelerinizi ekleyin
                </p>
                <div className="flex items-center justify-center gap-4 text-xs"
                     style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getQualityLabel(qualityPreference).color }} />
                    {getQualityLabel(qualityPreference).label}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target size={12} />
                    {getBatchSizeLabel(batchSize).label}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calculator size={12} />
                    {portionCount.toLocaleString()} porsiyon
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}