// AI Recipe Generation Service
interface RecipeGenerationRequest {
  dishName: string
  servings: number
  cuisine?: string
  difficulty: 'Kolay' | 'Orta' | 'Zor'
  maxCost?: number
  dietaryRestrictions?: string
  availableIngredients?: string
}

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

export class AIRecipeService {
  private static readonly API_URL = '/api/ai/generate-recipe'

  static async generateRecipe(request: RecipeGenerationRequest): Promise<GeneratedRecipe> {
    try {
      // OpenAI API çağrısı için prompt oluştur
      const prompt = this.buildPrompt(request)
      
      // API çağrısı yap
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          dishName: request.dishName,
          servings: request.servings,
          maxCost: request.maxCost,
          difficulty: request.difficulty
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      return this.parseAIResponse(result, request)
      
    } catch (error) {
      console.error('AI Recipe Generation Error:', error)
      // Fallback to intelligent mock data based on dish name
      return this.generateIntelligentMockRecipe(request)
    }
  }

  private static buildPrompt(request: RecipeGenerationRequest): string {
    return `
Türk mutfağı uzmanı bir şef olarak, "${request.dishName}" isimli bir yemek için detaylı tarif oluştur.

Gereksinimler:
- Porsiyon: ${request.servings} kişilik
- Zorluk seviyesi: ${request.difficulty}
${request.maxCost ? `- Maksimum maliyet: ${request.maxCost}₺` : ''}
${request.cuisine ? `- Mutfak türü: ${request.cuisine}` : ''}
${request.dietaryRestrictions ? `- Diyet kısıtlamaları: ${request.dietaryRestrictions}` : ''}
${request.availableIngredients ? `- Mevcut malzemeler: ${request.availableIngredients}` : ''}

Lütfen şu formatta yanıt ver:
{
  "name": "Yemek adı",
  "description": "Kısa açıklama",
  "cookingTime": süre_dakika,
  "ingredients": [{"name": "malzeme", "amount": miktar, "unit": "birim", "category": "kategori"}],
  "instructions": ["adım1", "adım2", ...],
  "nutritionInfo": {"calories": kalori, "protein": protein_g, "carbs": karbonhidrat_g, "fat": yağ_g},
  "estimatedCost": tahmini_maliyet,
  "tags": ["etiket1", "etiket2"]
}
`
  }

  private static parseAIResponse(apiResponse: any, request: RecipeGenerationRequest): GeneratedRecipe {
    // AI response'unu parse et ve GeneratedRecipe formatına çevir
    const aiData = apiResponse.data || apiResponse

    return {
      name: aiData.name || request.dishName,
      description: aiData.description || `${request.dishName} için özel tarif`,
      cookingTime: aiData.cookingTime || 30,
      servings: request.servings,
      difficulty: request.difficulty,
      ingredients: aiData.ingredients || [],
      instructions: aiData.instructions || [],
      nutritionInfo: aiData.nutritionInfo || {
        calories: 250,
        protein: 20,
        carbs: 30,
        fat: 10
      },
      estimatedCost: aiData.estimatedCost || request.maxCost || 50,
      tags: aiData.tags || ['AI Üretimi']
    }
  }

  private static generateIntelligentMockRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    const dishName = request.dishName.toLowerCase()
    
    // Yemek adına göre akıllı tarif üretimi
    if (dishName.includes('pilav') || dishName.includes('rice')) {
      return this.generateRiceRecipe(request)
    } else if (dishName.includes('tavuk') || dishName.includes('chicken')) {
      return this.generateChickenRecipe(request)
    } else if (dishName.includes('balık') || dishName.includes('fish')) {
      return this.generateFishRecipe(request)
    } else if (dishName.includes('et') || dishName.includes('meat')) {
      return this.generateMeatRecipe(request)
    } else if (dishName.includes('sebze') || dishName.includes('vegetable')) {
      return this.generateVegetableRecipe(request)
    } else if (dishName.includes('çorba') || dishName.includes('soup')) {
      return this.generateSoupRecipe(request)
    } else if (dishName.includes('salata') || dishName.includes('salad')) {
      return this.generateSaladRecipe(request)
    } else if (dishName.includes('börek') || dishName.includes('börek')) {
      return this.generateBorekRecipe(request)
    } else if (dishName.includes('makarna') || dishName.includes('pasta')) {
      return this.generatePastaRecipe(request)
    } else {
      return this.generateGenericRecipe(request)
    }
  }

  private static generateChickenRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    return {
      name: request.dishName,
      description: `Lezzetli ve besleyici ${request.dishName} tarifi`,
      cookingTime: request.difficulty === 'Kolay' ? 25 : request.difficulty === 'Orta' ? 35 : 50,
      servings: request.servings,
      difficulty: request.difficulty,
      ingredients: [
        { name: 'Tavuk göğsü', amount: 500 * (request.servings / 4), unit: 'gram', category: 'et' },
        { name: 'Soğan', amount: Math.ceil(1 * (request.servings / 4)), unit: 'adet', category: 'sebze' },
        { name: 'Domates', amount: Math.ceil(2 * (request.servings / 4)), unit: 'adet', category: 'sebze' },
        { name: 'Zeytinyağı', amount: 30 * (request.servings / 4), unit: 'ml', category: 'yağ' },
        { name: 'Tuz', amount: 5, unit: 'gram', category: 'baharat' },
        { name: 'Karabiber', amount: 2, unit: 'gram', category: 'baharat' },
        { name: 'Kırmızı biber', amount: 1, unit: 'tatlı kaşığı', category: 'baharat' }
      ],
      instructions: [
        'Tavuk göğsünü orta boy parçalar halinde doğrayın',
        'Soğanları ince ince dilimleyin',
        'Domatesleri küp küp doğrayın',
        'Tavada zeytinyağını ısıtın',
        'Tavuk parçalarını soteleyin (8-10 dakika)',
        'Soğanları ekleyip pembeleşene kadar kavurun',
        'Domatesleri ekleyip karıştırın',
        'Baharatları ekleyip 15-20 dakika pişirin',
        'Sıcak servis yapın'
      ],
      nutritionInfo: {
        calories: Math.round(280 * (request.servings / 4)),
        protein: Math.round(32 * (request.servings / 4)),
        carbs: Math.round(12 * (request.servings / 4)),
        fat: Math.round(8 * (request.servings / 4))
      },
      estimatedCost: request.maxCost || Math.round(45 * (request.servings / 4)),
      tags: ['Protein', 'Sağlıklı', 'Ana Yemek', 'Türk Mutfağı']
    }
  }

  private static generateRiceRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    return {
      name: request.dishName,
      description: `Geleneksel ${request.dishName} tarifi`,
      cookingTime: 35,
      servings: request.servings,
      difficulty: request.difficulty,
      ingredients: [
        { name: 'Pirinç', amount: 250 * (request.servings / 4), unit: 'gram', category: 'tahıl' },
        { name: 'Tavuk suyu', amount: 500 * (request.servings / 4), unit: 'ml', category: 'sıvı' },
        { name: 'Tereyağı', amount: 50 * (request.servings / 4), unit: 'gram', category: 'yağ' },
        { name: 'Soğan', amount: 1, unit: 'adet', category: 'sebze' },
        { name: 'Tuz', amount: 5, unit: 'gram', category: 'baharat' }
      ],
      instructions: [
        'Pirinci iyice yıkayın ve süzün',
        'Soğanı ince doğrayın',
        'Tavada tereyağını eritin',
        'Soğanları kavurun',
        'Pirinci ekleyip 2-3 dakika kavurun',
        'Sıcak suyu ekleyin',
        'Tuz ekleyip karıştırın',
        'Kapağını kapatıp 18-20 dakika pişirin',
        'Altını kapatıp 10 dakika dinlendirin'
      ],
      nutritionInfo: {
        calories: Math.round(320 * (request.servings / 4)),
        protein: Math.round(8 * (request.servings / 4)),
        carbs: Math.round(65 * (request.servings / 4)),
        fat: Math.round(6 * (request.servings / 4))
      },
      estimatedCost: request.maxCost || Math.round(25 * (request.servings / 4)),
      tags: ['Karbonhidrat', 'Garnitur', 'Geleneksel', 'Pilav']
    }
  }

  private static generateGenericRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    return {
      name: request.dishName,
      description: `${request.dishName} için özel hazırlanmış tarif`,
      cookingTime: 30,
      servings: request.servings,
      difficulty: request.difficulty,
      ingredients: [
        { name: 'Ana malzeme', amount: 500, unit: 'gram', category: 'ana' },
        { name: 'Soğan', amount: 1, unit: 'adet', category: 'sebze' },
        { name: 'Zeytinyağı', amount: 30, unit: 'ml', category: 'yağ' },
        { name: 'Tuz', amount: 5, unit: 'gram', category: 'baharat' },
        { name: 'Karabiber', amount: 2, unit: 'gram', category: 'baharat' }
      ],
      instructions: [
        'Malzemeleri hazırlayın',
        'Ana malzemeyi uygun şekilde doğrayın',
        'Soğanı kavurun',
        'Diğer malzemeleri sırasıyla ekleyin',
        'Uygun sürede pişirin',
        'Sıcak servis yapın'
      ],
      nutritionInfo: {
        calories: 250,
        protein: 20,
        carbs: 25,
        fat: 10
      },
      estimatedCost: request.maxCost || 40,
      tags: ['AI Üretimi', 'Özel Tarif']
    }
  }

  // Diğer yemek türleri için benzer fonksiyonlar...
  private static generateFishRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    // Balık tarifleri için implementasyon
    return this.generateGenericRecipe(request)
  }

  private static generateVegetableRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    // Sebze tarifleri için implementasyon
    return this.generateGenericRecipe(request)
  }

  private static generateSoupRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    // Çorba tarifleri için implementasyon
    return this.generateGenericRecipe(request)
  }

  private static generateSaladRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    // Salata tarifleri için implementasyon
    return this.generateGenericRecipe(request)
  }

  private static generateBorekRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    // Börek tarifleri için implementasyon
    return this.generateGenericRecipe(request)
  }

  private static generatePastaRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    // Makarna tarifleri için implementasyon
    return this.generateGenericRecipe(request)
  }

  private static generateMeatRecipe(request: RecipeGenerationRequest): GeneratedRecipe {
    // Et tarifleri için implementasyon
    return this.generateGenericRecipe(request)
  }
}