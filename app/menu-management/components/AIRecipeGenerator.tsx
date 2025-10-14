'use client'

import { useState } from 'react'
import { BaseCard } from '@/app/components/ui/Card'
import { ChefHat, Sparkles, Clock, Users, Calculator, Lightbulb } from 'lucide-react'

interface RecipeIngredient {
  name: string
  amount: number
  unit: string
  category: string
}

interface GeneratedRecipe {
  name: string
  description: string
  cookingTime: number
  servings: number
  difficulty: 'Kolay' | 'Orta' | 'Zor'
  ingredients: RecipeIngredient[]
  instructions: string[]
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  estimatedCost: number
  tags: string[]
}

interface AIRecipeGeneratorProps {
  onRecipeGenerated?: (recipe: GeneratedRecipe) => void
}

export function AIRecipeGenerator({ onRecipeGenerated }: AIRecipeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [formData, setFormData] = useState({
    dishName: '',
    servings: 4,
    dietaryRestrictions: '',
    availableIngredients: '',
    maxCost: '',
    cuisine: '',
    difficulty: 'Orta' as const
  })

  const generateRecipe = async () => {
    setIsGenerating(true)
    
    try {
      // Simulated AI recipe generation - gerçek implementasyonda API çağrısı olacak
      await new Promise(resolve => setTimeout(resolve, 3000)) // 3 saniye simülasyon
      
      const recipe: GeneratedRecipe = {
        name: formData.dishName || 'AI Önerisi: Sebzeli Tavuk Sote',
        description: 'Taze sebzelerle hazırlanmış lezzetli ve besleyici tavuk sote',
        cookingTime: 35,
        servings: formData.servings,
        difficulty: formData.difficulty,
        ingredients: [
          { name: 'Tavuk göğsü', amount: 500, unit: 'gram', category: 'et' },
          { name: 'Domates', amount: 2, unit: 'adet', category: 'sebze' },
          { name: 'Soğan', amount: 1, unit: 'adet', category: 'sebze' },
          { name: 'Biber', amount: 2, unit: 'adet', category: 'sebze' },
          { name: 'Zeytinyağı', amount: 30, unit: 'ml', category: 'yağ' },
          { name: 'Tuz', amount: 5, unit: 'gram', category: 'baharat' },
          { name: 'Karabiber', amount: 2, unit: 'gram', category: 'baharat' }
        ],
        instructions: [
          'Tavuk göğsünü küp küp doğrayın',
          'Sebzeleri ince ince dilimleyin',
          'Tavada zeytinyağını ısıtın',
          'Tavukları soteleyin (8-10 dk)',
          'Sebzeleri ekleyin ve karıştırın',
          'Baharat ekleyip 15 dakika pişirin',
          'Sıcak servis yapın'
        ],
        nutritionInfo: {
          calories: 280,
          protein: 32,
          carbs: 12,
          fat: 8
        },
        estimatedCost: parseFloat(formData.maxCost) || 45.50,
        tags: ['Sağlıklı', 'Protein', 'Az Yağlı', 'Hızlı']
      }
      
      setGeneratedRecipe(recipe)
      onRecipeGenerated?.(recipe)
      
    } catch (error) {
      console.error('Recipe generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveRecipe = async () => {
    if (!generatedRecipe) return
    
    try {
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Başarı mesajı
      alert('Tarif başarıyla kaydedildi!')
      
      // Formu temizle
      setGeneratedRecipe(null)
      setFormData({
        dishName: '',
        servings: 4,
        dietaryRestrictions: '',
        availableIngredients: '',
        maxCost: '',
        cuisine: '',
        difficulty: 'Orta'
      })
      
    } catch (error) {
      console.error('Recipe save failed:', error)
      alert('Tarif kaydedilirken hata oluştu!')
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Recipe Generator Form */}
      <BaseCard className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Tarif Üretici</h3>
            <p className="text-sm text-gray-600">Yapay zeka ile özel tarifinizi oluşturun</p>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              AI teknolojisiyle size özel tarif oluşturuyoruz
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Yemek Adı</label>
              <input
                type="text"
                placeholder="Örn: Sebzeli Tavuk Sote"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.dishName}
                onChange={(e) => setFormData(prev => ({ ...prev, dishName: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Porsiyon Sayısı</label>
              <input
                type="number"
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mutfak Türü</label>
              <select
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.cuisine}
                onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
              >
                <option value="">Seçiniz</option>
                <option value="turkish">Türk Mutfağı</option>
                <option value="mediterranean">Akdeniz</option>
                <option value="asian">Asya</option>
                <option value="european">Avrupa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Zorluk Seviyesi</label>
              <select
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
              >
                <option value="Kolay">Kolay</option>
                <option value="Orta">Orta</option>
                <option value="Zor">Zor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Maksimum Maliyet (₺)</label>
              <input
                type="number"
                placeholder="50.00"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.maxCost}
                onChange={(e) => setFormData(prev => ({ ...prev, maxCost: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Diyet Kısıtlamaları</label>
              <input
                type="text"
                placeholder="Vegetaryen, Gluten-free vb."
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mevcut Malzemeler</label>
            <textarea
              placeholder="Elinizdeki malzemeleri virgülle ayırarak yazın..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.availableIngredients}
              onChange={(e) => setFormData(prev => ({ ...prev, availableIngredients: e.target.value }))}
            />
          </div>

          <button
            onClick={generateRecipe}
            disabled={isGenerating || !formData.dishName.trim()}
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI Tarif Oluşturuyor...
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5" />
                AI ile Tarif Oluştur
              </>
            )}
          </button>
        </div>
      </BaseCard>

      {/* Generated Recipe Display */}
      {generatedRecipe && (
        <BaseCard className="border-green-200 bg-green-50/50">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-green-800 mb-2">🎉 AI Tarafından Oluşturulan Tarif</h3>
              <p className="text-sm text-green-600">Size özel hazırlanmış tarif detayları</p>
            </div>
            <div className="mb-6">
              <h4 className="text-lg font-bold text-green-800 mb-2">{generatedRecipe.name}</h4>
              <p className="text-green-700">{generatedRecipe.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{generatedRecipe.cookingTime} dakika</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{generatedRecipe.servings} porsiyon</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calculator className="w-4 h-4 text-purple-500" />
                <span>₺{generatedRecipe.estimatedCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span>{generatedRecipe.difficulty}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Ingredients */}
              <div>
                <h4 className="font-semibold mb-3">Malzemeler</h4>
                <div className="space-y-2">
                  {generatedRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border">
                      <span className="text-sm">{ingredient.name}</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition Info */}
              <div>
                <h4 className="font-semibold mb-3">Beslenme Değerleri (Porsiyon Başı)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border">
                    <span className="text-sm">Kalori</span>
                    <span className="text-sm font-medium">{generatedRecipe.nutritionInfo.calories} kcal</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border">
                    <span className="text-sm">Protein</span>
                    <span className="text-sm font-medium">{generatedRecipe.nutritionInfo.protein}g</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border">
                    <span className="text-sm">Karbonhidrat</span>
                    <span className="text-sm font-medium">{generatedRecipe.nutritionInfo.carbs}g</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border">
                    <span className="text-sm">Yağ</span>
                    <span className="text-sm font-medium">{generatedRecipe.nutritionInfo.fat}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Pişirme Talimatları</h4>
              <ol className="space-y-2">
                {generatedRecipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Etiketler</h4>
              <div className="flex flex-wrap gap-2">
                {generatedRecipe.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveRecipe}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Tarifi Kaydet
              </button>
              <button
                onClick={() => setGeneratedRecipe(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </BaseCard>
      )}
    </div>
  )
}