'use client'

import { useState, useEffect } from 'react'
import { RecipeAdapter, Recipe, AdaptedRecipe, AdaptationRequest } from '@/lib/services/recipeAdapter'
import { InstitutionProfile } from '@/lib/services/specParser'
import { ChefHat, Target, Settings, Play, Download, ArrowRight, CheckCircle2, TrendingUp, Calendar, Calculator } from 'lucide-react'

export default function RecipeAdapterPage() {
  const [adapter] = useState(new RecipeAdapter())
  const [isProcessing, setIsProcessing] = useState(false)
  const [adaptedRecipe, setAdaptedRecipe] = useState<AdaptedRecipe | null>(null)
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([])
  const [activeTab, setActiveTab] = useState('single')
  
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile>({
    kurum: 'Örnek Kurum',
    kurumKodu: 'ORN001',
    tarih: new Date(),
    porsiyon: {
      et: 120,
      tavuk: 100,
      sebze: 50,
      yag: 15,
      tuz: 2,
      pirinc: 80,
      bulgur: 60,
      ekmek: 100
    },
    menuTipi: 'Günlük 3 öğün',
    ogunSayisi: 3,
    kisiSayisi: 500,
    ozelKosullar: ['Helal sertifikalı'],
    hijyenKosullar: ['HACCP'],
    servisKosullar: ['Sıcak servis'],
    maliyetSiniri: {
      maksimum: 25.0
    },
    teslimKosullar: {
      sıklık: 'Günlük'
    },
    metadata: {
      processedAt: new Date(),
      confidence: 0.9,
      sourceFile: 'manual'
    }
  })

  const [adaptationGoals, setAdaptationGoals] = useState({
    maintainNutrition: true,
    optimizeCost: true,
    respectPortion: true,
    maintainTaste: true
  })

  const [generatedMenu, setGeneratedMenu] = useState<any>(null)
  const [menuDuration, setMenuDuration] = useState(7)

  useEffect(() => {
    loadAvailableRecipes()
  }, [])

  const loadAvailableRecipes = async () => {
    try {
      const recipes = await adapter.findSuitableRecipes(institutionProfile)
      setAvailableRecipes(recipes)
      if (recipes.length > 0) {
        setSelectedRecipeId(recipes[0].id)
      }
    } catch (error) {
      console.error('Tarif yükleme hatası:', error)
    }
  }

  const handleAdaptRecipe = async () => {
    if (!selectedRecipeId) return

    setIsProcessing(true)
    
    try {
      const selectedRecipe = availableRecipes.find(r => r.id === selectedRecipeId)
      if (!selectedRecipe) throw new Error('Tarif bulunamadı')

      const request: AdaptationRequest = {
        baseRecipe: selectedRecipe,
        targetProfile: institutionProfile,
        adaptationGoals,
        constraints: {
          maxBudgetPerServing: institutionProfile.maliyetSiniri?.maksimum
        }
      }

      const result = await adapter.adaptRecipe(request)
      setAdaptedRecipe(result)
      
    } catch (error) {
      console.error('Adaptasyon hatası:', error)
      alert('Tarif adaptasyonu sırasında hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateMenu = async () => {
    setIsProcessing(true)
    
    try {
      // Mock menu generation
      const menu = {
        totalRecipes: menuDuration * 3,
        averageCost: 18.50,
        dailyMenus: []
      }
      setGeneratedMenu(menu)
    } catch (error) {
      console.error('Menü üretim hatası:', error)
      alert('Menü üretimi sırasında hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadRecipe = () => {
    if (!adaptedRecipe) return

    const data = JSON.stringify(adaptedRecipe, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${adaptedRecipe.name}_adapted.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const adaptationFeatures = [
    {
      icon: Target,
      title: 'Gramaj Uyumluluğu',
      description: 'Şartname gereksinimlerine göre porsiyon ayarı',
      active: adaptationGoals.respectPortion
    },
    {
      icon: TrendingUp,
      title: 'Maliyet Optimizasyonu',
      description: 'En uygun fiyat/performans dengesi',
      active: adaptationGoals.optimizeCost
    },
    {
      icon: CheckCircle2,
      title: 'Beslenme Koruması',
      description: 'Orijinal beslenme değerlerini korur',
      active: adaptationGoals.maintainNutrition
    },
    {
      icon: ChefHat,
      title: 'Lezzet Dengesi',
      description: 'Tat profilini mümkün olduğunca korur',
      active: adaptationGoals.maintainTaste
    }
  ]

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                🍽️ Tarif Adaptörü
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Tarifleri kurum gereksinimlerine göre otomatik uyarlayın
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                   style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <ChefHat size={16} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {availableRecipes.length} Tarif Mevcut
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mb-8">
          <div className="flex space-x-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-3 text-sm font-medium rounded transition-colors duration-200 flex items-center gap-2 ${
                activeTab === 'single' ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'single' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'single' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Target size={16} />
              Tekli Tarif Adaptasyonu
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-3 text-sm font-medium rounded transition-colors duration-200 flex items-center gap-2 ${
                activeTab === 'menu' ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'menu' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'menu' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Calendar size={16} />
              Menü Üretimi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Panel - Ayarlar */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'single' ? (
              <>
                {/* Tarif Seçimi */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-secondary)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}>
                    <ChefHat size={20} style={{ color: 'var(--accent-primary)' }} />
                    Tarif Seçimi
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2"
                             style={{ color: 'var(--text-secondary)' }}>
                        Mevcut Tarifler
                      </label>
                      <select
                        value={selectedRecipeId}
                        onChange={(e) => setSelectedRecipeId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border transition-colors duration-200"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {availableRecipes.map((recipe) => (
                          <option key={recipe.id} value={recipe.id}>
                            {recipe.name} ({recipe.servings || 4} porsiyon)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2"
                             style={{ color: 'var(--text-secondary)' }}>
                        Hedef Kişi Sayısı
                      </label>
                      <input
                        type="number"
                        value={institutionProfile.kisiSayisi}
                        onChange={(e) => setInstitutionProfile(prev => ({ 
                          ...prev, 
                          kisiSayisi: Number(e.target.value) 
                        }))}
                        className="w-full px-3 py-2 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Adaptasyon Hedefleri */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-secondary)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}>
                    <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
                    Adaptasyon Hedefleri
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adaptationFeatures.map((feature, index) => {
                      const IconComponent = feature.icon
                      return (
                        <label key={index} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-colors duration-200"
                               style={{ 
                                 borderColor: feature.active ? 'var(--accent-primary)' : 'var(--border-secondary)',
                                 backgroundColor: feature.active ? 'var(--bg-accent-subtle)' : 'transparent'
                               }}>
                          <input
                            type="checkbox"
                            checked={feature.active}
                            onChange={(e) => {
                              const key = Object.keys(adaptationGoals)[index] as keyof typeof adaptationGoals
                              setAdaptationGoals(prev => ({ ...prev, [key]: e.target.checked }))
                            }}
                            className="mt-1"
                            style={{ accentColor: 'var(--accent-primary)' }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <IconComponent size={16} style={{ color: 'var(--accent-primary)' }} />
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {feature.title}
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {feature.description}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Kurum Profili Özeti */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-secondary)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h2 className="text-lg font-semibold mb-4"
                      style={{ color: 'var(--text-primary)' }}>
                    📋 Kurum Profili Özeti
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Kurum</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {institutionProfile.kurum}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Kişi Sayısı</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {institutionProfile.kisiSayisi}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Öğün Sayısı</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {institutionProfile.ogunSayisi}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Maliyet Limiti</p>
                      <p className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                        ₺{institutionProfile.maliyetSiniri?.maksimum}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Adaptasyon Butonu */}
                <div className="text-center">
                  <button
                    onClick={handleAdaptRecipe}
                    disabled={isProcessing || !selectedRecipeId}
                    className="px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'white'
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adaptasyon Yapılıyor...
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        Tarif Adaptasyonunu Başlat
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Menü Üretimi Tab */
              <>
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-secondary)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}>
                    <Calendar size={20} style={{ color: 'var(--accent-primary)' }} />
                    Menü Üretimi Ayarları
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2"
                             style={{ color: 'var(--text-secondary)' }}>
                        Menü Süresi (Gün)
                      </label>
                      <select
                        value={menuDuration}
                        onChange={(e) => setMenuDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value={7}>1 Hafta (7 gün)</option>
                        <option value={14}>2 Hafta (14 gün)</option>
                        <option value={30}>1 Ay (30 gün)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2"
                             style={{ color: 'var(--text-secondary)' }}>
                        Menü Tipi
                      </label>
                      <select
                        value={institutionProfile.menuTipi}
                        onChange={(e) => setInstitutionProfile(prev => ({ 
                          ...prev, 
                          menuTipi: e.target.value 
                        }))}
                        className="w-full px-3 py-2 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option>Günlük 3 öğün</option>
                        <option>Günlük 2 öğün</option>
                        <option>Sadece öğle yemeği</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleGenerateMenu}
                    disabled={isProcessing}
                    className="px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'white'
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Menü Üretiliyor...
                      </>
                    ) : (
                      <>
                        <Calendar size={20} />
                        {menuDuration} Günlük Menü Üret
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="space-y-6">
            {adaptedRecipe && activeTab === 'single' ? (
              <>
                {/* Adaptasyon Özeti */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-accent-subtle)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--status-success)' }} />
                    Adaptasyon Tamamlandı
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {adaptedRecipe.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {institutionProfile.kisiSayisi} porsiyon için uyarlandı
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Adaptasyon</p>
                        <p className="font-bold" style={{ color: 'var(--status-success)' }}>
                          Tamamlandı
                        </p>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Tarif Tipi</p>
                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {adaptedRecipe.name.split(' ')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Malzemeler */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-secondary)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h3 className="text-lg font-semibold mb-4"
                      style={{ color: 'var(--text-primary)' }}>
                    🥄 Malzemeler
                  </h3>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {adaptedRecipe.ingredients.slice(0, 5).map((ingredient, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded"
                           style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {ingredient.name}
                        </span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                          {ingredient.amount} {ingredient.unit}
                        </span>
                      </div>
                    ))}
                    {adaptedRecipe.ingredients.length > 5 && (
                      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                        +{adaptedRecipe.ingredients.length - 5} malzeme daha...
                      </p>
                    )}
                  </div>
                </div>

                {/* İndir Butonları */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-secondary)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}>
                    <Download size={20} style={{ color: 'var(--accent-primary)' }} />
                    İndir & Devam Et
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadRecipe}
                      className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      📄 Tarif Dosyası (.json)
                    </button>
                    
                    <button
                      className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white'
                      }}
                    >
                      <Calculator size={16} />
                      Maliyet Simülasyonuna Gönder
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : generatedMenu && activeTab === 'menu' ? (
              <>
                {/* Menü Özeti */}
                <div className="p-6 rounded-xl border" 
                     style={{ 
                       backgroundColor: 'var(--bg-accent-subtle)',
                       borderColor: 'var(--border-primary)'
                     }}>
                  <h3 className="text-lg font-semibold mb-4"
                      style={{ color: 'var(--text-primary)' }}>
                    📅 {menuDuration} Günlük Menü
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Toplam Tarif:</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {generatedMenu.totalRecipes}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Ortalama Maliyet:</span>
                      <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                        ₺{generatedMenu.averageCost?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 rounded-xl border text-center" 
                   style={{ 
                     backgroundColor: 'var(--bg-secondary)',
                     borderColor: 'var(--border-primary)'
                   }}>
                <div className="text-4xl mb-3">🍽️</div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {activeTab === 'single' 
                    ? 'Tarif adaptasyonu için ayarları yapın ve başlatın'
                    : 'Menü üretimi için parametreleri belirleyin'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}