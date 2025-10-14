'use client'

import { useState, useEffect } from 'react'
import { RecipeAdapter, Recipe, AdaptedRecipe, AdaptationRequest } from '@/lib/services/recipeAdapter'
import { InstitutionProfile } from '@/lib/services/specParser'

export default function RecipeAdapterPage() {
  const [adapter] = useState(new RecipeAdapter())
  const [isProcessing, setIsProcessing] = useState(false)
  const [adaptedRecipe, setAdaptedRecipe] = useState<AdaptedRecipe | null>(null)
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([])
  const [activeTab, setActiveTab] = useState('single') // 'single' | 'menu'
  
  // Form state
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

  // Menü generation state
  const [generatedMenu, setGeneratedMenu] = useState<any>(null)
  const [menuDuration, setMenuDuration] = useState(7)

  useEffect(() => {
    // Mevcut tarifleri yükle
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
      const menu = await adapter.generateMenuForInstitution(
        institutionProfile,
        menuDuration,
        institutionProfile.ogunSayisi
      )
      setGeneratedMenu(menu)
      
    } catch (error) {
      console.error('Menü oluşturma hatası:', error)
      alert('Menü oluşturma sırasında hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🍽️ Tarif Adaptör Sistemi
          </h1>
          <p className="text-lg text-gray-600">
            Tarifleri kurum profiline göre otomatik olarak adapte edin
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'single'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🍽️ Tekil Tarif Adaptasyonu
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'menu'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📅 Haftalık Menü Oluştur
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Panel - Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Kurum Profili */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🏢 Kurum Profili
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kurum Adı
                  </label>
                  <input
                    type="text"
                    value={institutionProfile.kurum}
                    onChange={(e) => setInstitutionProfile(prev => ({ ...prev, kurum: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kişi Sayısı
                  </label>
                  <input
                    type="number"
                    value={institutionProfile.kisiSayisi}
                    onChange={(e) => setInstitutionProfile(prev => ({ ...prev, kisiSayisi: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Et Gramajı (g)
                  </label>
                  <input
                    type="number"
                    value={institutionProfile.porsiyon.et}
                    onChange={(e) => setInstitutionProfile(prev => ({ 
                      ...prev, 
                      porsiyon: { ...prev.porsiyon, et: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sebze Gramajı (g)
                  </label>
                  <input
                    type="number"
                    value={institutionProfile.porsiyon.sebze}
                    onChange={(e) => setInstitutionProfile(prev => ({ 
                      ...prev, 
                      porsiyon: { ...prev.porsiyon, sebze: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öğün Sayısı
                  </label>
                  <select
                    value={institutionProfile.ogunSayisi}
                    onChange={(e) => setInstitutionProfile(prev => ({ ...prev, ogunSayisi: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>1 Öğün</option>
                    <option value={2}>2 Öğün</option>
                    <option value={3}>3 Öğün</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Bütçe/Porsiyon (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={institutionProfile.maliyetSiniri?.maksimum || ''}
                    onChange={(e) => setInstitutionProfile(prev => ({ 
                      ...prev, 
                      maliyetSiniri: { ...prev.maliyetSiniri, maksimum: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {activeTab === 'single' && (
              <>
                {/* Tarif Seçimi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    📋 Tarif Seçimi
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adaptasyona Edilecek Tarif
                      </label>
                      <select
                        value={selectedRecipeId}
                        onChange={(e) => setSelectedRecipeId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Tarif Seçiniz</option>
                        {availableRecipes.map(recipe => (
                          <option key={recipe.id} value={recipe.id}>
                            {recipe.name} ({recipe.servings} kişilik - ₺{recipe.cost?.perServing.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seçilen Tarihin Detayları */}
                    {selectedRecipeId && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {(() => {
                          const recipe = availableRecipes.find(r => r.id === selectedRecipeId)
                          if (!recipe) return null
                          
                          return (
                            <div>
                              <h3 className="font-semibold mb-2">{recipe.name}</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Kategori:</span> {recipe.category}
                                </div>
                                <div>
                                  <span className="text-gray-500">Süre:</span> {recipe.cookingTime} dk
                                </div>
                                <div>
                                  <span className="text-gray-500">Zorluk:</span> {recipe.difficulty}
                                </div>
                                <div>
                                  <span className="text-gray-500">Kalori:</span> {recipe.nutrition.perServing.calories} kcal
                                </div>
                              </div>
                              <div className="mt-3">
                                <span className="text-gray-500 text-sm">Ana Malzemeler:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {ing.name}
                                    </span>
                                  ))}
                                  {recipe.ingredients.length > 4 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                      +{recipe.ingredients.length - 4} daha
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Adaptasyon Hedefleri */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    🎯 Adaptasyon Hedefleri
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adaptationGoals.maintainNutrition}
                        onChange={(e) => setAdaptationGoals(prev => ({ ...prev, maintainNutrition: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm">Beslenme Değerlerini Koru</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adaptationGoals.optimizeCost}
                        onChange={(e) => setAdaptationGoals(prev => ({ ...prev, optimizeCost: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm">Maliyeti Optimize Et</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adaptationGoals.respectPortion}
                        onChange={(e) => setAdaptationGoals(prev => ({ ...prev, respectPortion: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm">Gramaj Gereksinimlerini Uygula</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adaptationGoals.maintainTaste}
                        onChange={(e) => setAdaptationGoals(prev => ({ ...prev, maintainTaste: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm">Lezzet Dengesini Koru</span>
                    </label>
                  </div>
                </div>

                {/* Adaptasyon Butonu */}
                <div className="text-center">
                  <button
                    onClick={handleAdaptRecipe}
                    disabled={isProcessing || !selectedRecipeId}
                    className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        AI Adapte Ediyor...
                      </span>
                    ) : (
                      '🔧 Tarifi Adapte Et'
                    )}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'menu' && (
              <>
                {/* Menü Ayarları */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    📅 Menü Ayarları
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Menü Süresi (Gün)
                      </label>
                      <select
                        value={menuDuration}
                        onChange={(e) => setMenuDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={7}>1 Hafta</option>
                        <option value={14}>2 Hafta</option>
                        <option value={30}>1 Ay</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Menü Oluştur Butonu */}
                <div className="text-center">
                  <button
                    onClick={handleGenerateMenu}
                    disabled={isProcessing}
                    className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Menü Oluşturuluyor...
                      </span>
                    ) : (
                      '📋 Haftalık Menü Oluştur'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="space-y-6">
            {activeTab === 'single' && adaptedRecipe ? (
              <>
                {/* Adaptasyon Özeti */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    ✅ Adaptasyon Tamamlandı
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Orijinal Porsiyon:</span>
                      <span className="font-medium">{adaptedRecipe.adaptationInfo.scaleFactor > 0 ? Math.round(adaptedRecipe.servings / adaptedRecipe.adaptationInfo.scaleFactor) : 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Yeni Porsiyon:</span>
                      <span className="font-medium">{adaptedRecipe.servings}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ölçek Faktörü:</span>
                      <span className="font-medium">x{adaptedRecipe.adaptationInfo.scaleFactor.toFixed(2)}</span>
                    </div>
                    
                    {adaptedRecipe.cost && (
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-gray-600">Porsiyon Başı Maliyet:</span>
                        <span className="font-medium">₺{adaptedRecipe.cost.perServing.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <div className={`text-center text-sm px-3 py-1 rounded-full ${
                        adaptedRecipe.adaptationInfo.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                        adaptedRecipe.adaptationInfo.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Güven: %{Math.round(adaptedRecipe.adaptationInfo.confidence * 100)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Beslenme Karşılaştırması */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">📊 Beslenme Karşılaştırması</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Kalori Değişimi</span>
                      <span className={`font-medium text-sm ${
                        adaptedRecipe.adaptationInfo.nutritionComparison.caloriesDiff > 0 ? 'text-red-600' : 
                        adaptedRecipe.adaptationInfo.nutritionComparison.caloriesDiff < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {adaptedRecipe.adaptationInfo.nutritionComparison.caloriesDiff > 0 ? '+' : ''}
                        {adaptedRecipe.adaptationInfo.nutritionComparison.caloriesDiff.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Protein Değişimi</span>
                      <span className={`font-medium text-sm ${
                        adaptedRecipe.adaptationInfo.nutritionComparison.proteinDiff > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {adaptedRecipe.adaptationInfo.nutritionComparison.proteinDiff > 0 ? '+' : ''}
                        {adaptedRecipe.adaptationInfo.nutritionComparison.proteinDiff.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Porsiyon Başı Beslenme</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Kalori: {Math.round(adaptedRecipe.nutrition.perServing.calories)} kcal</div>
                        <div>Protein: {Math.round(adaptedRecipe.nutrition.perServing.protein)}g</div>
                        <div>Karbonhidrat: {Math.round(adaptedRecipe.nutrition.perServing.carbs)}g</div>
                        <div>Yağ: {Math.round(adaptedRecipe.nutrition.perServing.fat)}g</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Malzeme Listesi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">🥘 Adapte Edilmiş Malzemeler</h3>
                  
                  <div className="space-y-2">
                    {adaptedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm font-medium">{ingredient.name}</span>
                        <span className="text-sm text-gray-600">
                          {ingredient.amount} {ingredient.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uyarılar */}
                {adaptedRecipe.adaptationInfo.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Uyarılar</h3>
                    <ul className="space-y-1">
                      {adaptedRecipe.adaptationInfo.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-700">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : activeTab === 'menu' && generatedMenu ? (
              <>
                {/* Menü Özeti */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">📋 Menü Özeti</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Toplam Maliyet:</span>
                      <span className="text-xl font-bold">₺{generatedMenu.totalCost.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Günlük Ortalama:</span>
                      <span className="font-medium">₺{(generatedMenu.totalCost / menuDuration).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Kişi Başı Günlük:</span>
                      <span className="font-medium">₺{((generatedMenu.totalCost / menuDuration) / (institutionProfile.kisiSayisi || 1)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Menü Takvimi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">🗓️ Menü Takvimi</h3>
                  
                  <div className="space-y-4">
                    {Object.entries(generatedMenu.menu).map(([day, meals]: [string, any]) => (
                      <div key={day} className="border border-gray-200 rounded-lg p-3">
                        <div className="font-semibold text-sm mb-2 text-blue-600">
                          {day.replace('gun_', 'Gün ')}
                        </div>
                        <div className="grid gap-2">
                          {Object.entries(meals).map(([mealType, recipe]: [string, any]) => (
                            <div key={mealType} className="text-xs">
                              <span className="font-medium">
                                {mealType === 'kahvalti' ? 'Kahvaltı' : 
                                 mealType === 'ogle' ? 'Öğle' : 'Akşam'}:
                              </span>
                              <span className="ml-2 text-gray-600">{recipe.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Beslenme Ortalaması */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">📊 Ortalama Beslenme</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-gray-500">Öğün Başı Kalori</div>
                      <div className="font-bold">{Math.round(generatedMenu.nutritionSummary.perServing.calories)} kcal</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-gray-500">Öğün Başı Protein</div>
                      <div className="font-bold">{Math.round(generatedMenu.nutritionSummary.perServing.protein)}g</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-gray-500">Öğün Başı Karbonhidrat</div>
                      <div className="font-bold">{Math.round(generatedMenu.nutritionSummary.perServing.carbs)}g</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-gray-500">Öğün Başı Yağ</div>
                      <div className="font-bold">{Math.round(generatedMenu.nutritionSummary.perServing.fat)}g</div>
                    </div>
                  </div>
                </div>

                {/* Menü Uyarıları */}
                {generatedMenu.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Menü Uyarıları</h3>
                    <ul className="space-y-1">
                      {generatedMenu.warnings.map((warning: string, index: number) => (
                        <li key={index} className="text-sm text-yellow-700">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-3">🍽️</div>
                  <p>
                    {activeTab === 'single' 
                      ? 'Tarif adaptasyonu yapmak için soldaki formu doldurun.'
                      : 'Haftalık menü oluşturmak için kurum profilini ayarlayın.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}