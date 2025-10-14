// lib/services/recipeAdapter.ts

import { InstitutionProfile } from './specParser'

export interface Recipe {
  id: string
  name: string
  description?: string
  category: 'ana_yemek' | 'corba' | 'salata' | 'pilav' | 'tatli' | 'icecek' | 'kahvalti'
  servings: number
  cookingTime: number // dakika
  difficulty: 'kolay' | 'orta' | 'zor'
  ingredients: RecipeIngredient[]
  instructions: string[]
  nutrition: NutritionInfo
  tags: string[]
  cost?: {
    estimated: number
    perServing: number
  }
  restrictions?: {
    halal?: boolean
    vegetarian?: boolean
    vegan?: boolean
    glutenFree?: boolean
  }
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface RecipeIngredient {
  name: string
  amount: number
  unit: 'gram' | 'kg' | 'ml' | 'litre' | 'adet' | 'yemek_kasigi' | 'cay_kasigi' | 'su_bardagi'
  category: 'et' | 'tavuk' | 'balik' | 'sebze' | 'meyve' | 'tahil' | 'yag' | 'baharat' | 'sut' | 'other'
  optional: boolean
  alternatives?: string[]
  nutritionPer100g?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export interface NutritionInfo {
  perServing: {
    calories: number
    protein: number // gram
    carbs: number // gram
    fat: number // gram
    fiber: number // gram
    sodium: number // mg
    sugar: number // gram
  }
  total: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sodium: number
    sugar: number
  }
}

export interface AdaptationRequest {
  baseRecipe: Recipe
  targetProfile: InstitutionProfile
  adaptationGoals: {
    maintainNutrition?: boolean
    optimizeCost?: boolean
    respectPortion?: boolean
    maintainTaste?: boolean
  }
  constraints: {
    maxBudgetPerServing?: number
    availableIngredients?: string[]
    forbiddenIngredients?: string[]
    allergies?: string[]
  }
}

export interface AdaptedRecipe extends Recipe {
  adaptationInfo: {
    originalRecipe: string
    scaleFactor: number
    adaptationReason: string[]
    nutritionComparison: {
      caloriesDiff: number
      proteinDiff: number
      carbsDiff: number
      fatDiff: number
    }
    costComparison?: {
      originalCost: number
      adaptedCost: number
      savingsPercent: number
    }
    substitutions: Substitution[]
    confidence: number
    warnings: string[]
  }
}

export interface Substitution {
  original: string
  substitute: string
  reason: string
  nutritionImpact: 'positive' | 'neutral' | 'negative'
  costImpact: number // % değişim
}

/**
 * 🍽️ Tarif Adaptör Sistemi
 * 
 * Mevcut tarifleri kurum profillerine göre otomatik olarak adapte eder.
 * Gramaj gereksinimlerini karşılar, beslenme değerlerini korur.
 */
export class RecipeAdapter {
  private baseRecipes: Recipe[] = []
  private nutritionDatabase: Map<string, any> = new Map()

  constructor() {
    this.initializeSampleRecipes()
    this.initializeNutritionDatabase()
  }

  /**
   * 🎯 Ana adaptasyon fonksiyonu
   */
  async adaptRecipe(request: AdaptationRequest): Promise<AdaptedRecipe> {
    try {
      // 1. Hedef porsiyon sayısını hesapla
      const targetServings = request.targetProfile.kisiSayisi || request.baseRecipe.servings
      const scaleFactor = targetServings / request.baseRecipe.servings

      // 2. Temel ölçeklendirme yap
      let adaptedRecipe = this.scaleRecipe(request.baseRecipe, scaleFactor)

      // 3. Gramaj gereksinimlerine göre ayarla
      adaptedRecipe = await this.adjustForPortionRequirements(
        adaptedRecipe, 
        request.targetProfile, 
        request.adaptationGoals
      )

      // 4. Maliyet optimizasyonu yap (gerekirse)
      if (request.adaptationGoals.optimizeCost) {
        adaptedRecipe = await this.optimizeCost(adaptedRecipe, request.constraints)
      }

      // 5. Beslenme değerlerini yeniden hesapla
      const nutrition = this.calculateNutrition(adaptedRecipe)

      // 6. AI ile doğrula ve geliştir
      const finalRecipe = await this.aiValidateAndImprove(adaptedRecipe, request)

      // 7. Adaptasyon bilgilerini oluştur
      const adaptationInfo = this.generateAdaptationInfo(
        request.baseRecipe, 
        finalRecipe, 
        scaleFactor, 
        request
      )

      return {
        ...finalRecipe,
        nutrition,
        adaptationInfo
      }

    } catch (error) {
      throw new Error(`Tarif adaptasyonu başarısız: ${error}`)
    }
  }

  /**
   * 🔍 Kurum profiline uygun tarifleri bul
   */
  async findSuitableRecipes(profile: InstitutionProfile): Promise<Recipe[]> {
    const suitableRecipes = this.baseRecipes.filter(recipe => {
      // Helal kontrolü
      if (profile.ozelKosullar.includes('Helal sertifikalı') && 
          !recipe.restrictions?.halal) {
        return false
      }

      // Bütçe kontrolü
      if (profile.maliyetSiniri?.maksimum && recipe.cost && 
          recipe.cost.perServing > profile.maliyetSiniri.maksimum) {
        return false
      }

      // Menü tipine uygunluk
      if (profile.menuTipi.includes('3 öğün')) {
        return ['ana_yemek', 'corba', 'salata', 'pilav'].includes(recipe.category)
      }

      return true
    })

    // AI ile uygunluk skoruna göre sırala
    return this.rankRecipesBySuitability(suitableRecipes, profile)
  }

  /**
   * 📊 Toplu tarif adaptasyonu (menü oluşturma)
   */
  async generateMenuForInstitution(
    profile: InstitutionProfile,
    menuDuration: number = 7, // gün
    mealsPerDay: number = 3
  ): Promise<{
    menu: { [day: string]: { [meal: string]: AdaptedRecipe } }
    totalCost: number
    nutritionSummary: NutritionInfo
    warnings: string[]
  }> {
    
    const menu: { [day: string]: { [meal: string]: AdaptedRecipe } } = {}
    let totalCost = 0
    const warnings: string[] = []

    const mealTypes = ['kahvalti', 'ogle', 'aksam'].slice(0, mealsPerDay)
    const days = Array.from({ length: menuDuration }, (_, i) => `gun_${i + 1}`)

    for (const day of days) {
      menu[day] = {}

      for (const mealType of mealTypes) {
        // Öğüne uygun tarifleri bul
        const categoryMap: { [key: string]: Recipe['category'][] } = {
          kahvalti: ['kahvalti', 'icecek'],
          ogle: ['ana_yemek', 'corba', 'salata', 'pilav'],
          aksam: ['ana_yemek', 'salata', 'tatli']
        }

        const suitableRecipes = this.baseRecipes.filter(recipe => 
          categoryMap[mealType]?.includes(recipe.category)
        )

        if (suitableRecipes.length > 0) {
          // Random seçim (gerçekte AI skorlama kullanılabilir)
          const selectedRecipe = suitableRecipes[Math.floor(Math.random() * suitableRecipes.length)]
          
          const adaptedRecipe = await this.adaptRecipe({
            baseRecipe: selectedRecipe,
            targetProfile: profile,
            adaptationGoals: {
              maintainNutrition: true,
              optimizeCost: true,
              respectPortion: true
            },
            constraints: {
              maxBudgetPerServing: profile.maliyetSiniri?.maksimum
            }
          })

          menu[day][mealType] = adaptedRecipe
          totalCost += adaptedRecipe.cost?.estimated || 0
        } else {
          warnings.push(`${day} ${mealType} için uygun tarif bulunamadı`)
        }
      }
    }

    // Toplam beslenme özetini hesapla
    const nutritionSummary = this.calculateMenuNutrition(menu)

    return {
      menu,
      totalCost,
      nutritionSummary,
      warnings
    }
  }

  /**
   * 📏 Tarifi ölçeklendir
   */
  private scaleRecipe(recipe: Recipe, scaleFactor: number): Recipe {
    const scaledIngredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      amount: ingredient.amount * scaleFactor
    }))

    return {
      ...recipe,
      servings: Math.round(recipe.servings * scaleFactor),
      ingredients: scaledIngredients,
      cost: recipe.cost ? {
        estimated: recipe.cost.estimated * scaleFactor,
        perServing: recipe.cost.perServing
      } : undefined
    }
  }

  /**
   * ⚖️ Gramaj gereksinimlerine göre ayarlama
   */
  private async adjustForPortionRequirements(
    recipe: Recipe, 
    profile: InstitutionProfile,
    goals: AdaptationRequest['adaptationGoals']
  ): Promise<Recipe> {
    
    if (!goals.respectPortion) return recipe

    const adjustedIngredients: RecipeIngredient[] = []

    for (const ingredient of recipe.ingredients) {
      let adjustedAmount = ingredient.amount
      
      // Et gramajı ayarlaması
      if (ingredient.category === 'et') {
        const targetAmount = (profile.porsiyon.et || 120) * recipe.servings / 1000 // kg
        adjustedAmount = targetAmount
      }
      
      // Tavuk gramajı ayarlaması
      else if (ingredient.category === 'tavuk') {
        const targetAmount = (profile.porsiyon.tavuk || 100) * recipe.servings / 1000
        adjustedAmount = targetAmount
      }
      
      // Sebze gramajı ayarlaması
      else if (ingredient.category === 'sebze') {
        const targetAmount = (profile.porsiyon.sebze || 50) * recipe.servings / 1000
        adjustedAmount = targetAmount
      }
      
      // Yağ gramajı ayarlaması
      else if (ingredient.category === 'yag') {
        const targetAmount = (profile.porsiyon.yag || 15) * recipe.servings / 1000
        adjustedAmount = targetAmount
      }

      adjustedIngredients.push({
        ...ingredient,
        amount: adjustedAmount
      })
    }

    return {
      ...recipe,
      ingredients: adjustedIngredients
    }
  }

  /**
   * 💰 Maliyet optimizasyonu
   */
  private async optimizeCost(
    recipe: Recipe, 
    constraints: AdaptationRequest['constraints']
  ): Promise<Recipe> {
    
    const optimizedIngredients: RecipeIngredient[] = []
    const substitutions: Substitution[] = []

    for (const ingredient of recipe.ingredients) {
      let currentIngredient = { ...ingredient }
      
      // Pahalı malzemeleri ucuz alternatiflerle değiştir
      if (ingredient.alternatives && ingredient.alternatives.length > 0) {
        const cheaperAlternative = this.findCheaperAlternative(ingredient)
        
        if (cheaperAlternative) {
          substitutions.push({
            original: ingredient.name,
            substitute: cheaperAlternative.name,
            reason: 'Maliyet optimizasyonu',
            nutritionImpact: 'neutral',
            costImpact: -20 // %20 tasarruf
          })
          
          currentIngredient = cheaperAlternative
        }
      }

      optimizedIngredients.push(currentIngredient)
    }

    return {
      ...recipe,
      ingredients: optimizedIngredients
    }
  }

  /**
   * 🤖 AI doğrulama ve geliştirme
   */
  private async aiValidateAndImprove(
    recipe: Recipe, 
    request: AdaptationRequest
  ): Promise<Recipe> {
    
    // Gemini AI ile tarif analizi
    const validationPrompt = `
    Tarif adaptasyon kalitesi analiz et:
    
    HEDEF PROFIL:
    - Kurum: ${request.targetProfile.kurum}
    - Porsiyon: Et ${request.targetProfile.porsiyon.et}g, Sebze ${request.targetProfile.porsiyon.sebze}g
    - Özel koşullar: ${request.targetProfile.ozelKosullar.join(', ')}
    
    ADAPTE EDİLEN TARİF:
    - Adı: ${recipe.name}
    - Porsiyon: ${recipe.servings}
    - Malzemeler: ${recipe.ingredients.map(i => `${i.name}: ${i.amount}${i.unit}`).join(', ')}
    
    Lütfen şu konuları değerlendir:
    1. Gramaj gereksinimleri karşılanıyor mu?
    2. Lezzet dengesini koruyacak öneriler?
    3. Beslenme değerleri uygun mu?
    4. Maliyet optimize edilebilir mi?
    
    JSON formatında yanıt ver:
    {
      "qualityScore": 0.85,
      "recommendations": [
        "Öneri 1",
        "Öneri 2"
      ],
      "nutritionWarnings": [
        "Uyarı 1"
      ],
      "improvements": {
        "ingredients": [
          {
            "name": "malzeme_adi",
            "adjustedAmount": 150,
            "reason": "sebep"
          }
        ]
      }
    }
    `

    // Simulated AI response
    const aiResponse = {
      qualityScore: 0.88,
      recommendations: [
        "Et miktarı kurumun gramaj gereksinimine uygun",
        "Sebze çeşitliliği artırılabilir",
        "Tuz miktarı azaltılabilir"
      ],
      nutritionWarnings: [
        "Protein oranı biraz yüksek"
      ],
      improvements: {
        ingredients: [
          {
            name: "Dana Eti",
            adjustedAmount: request.targetProfile.porsiyon.et || 120,
            reason: "Kurum gramaj gereksinimi"
          }
        ]
      }
    }

    // AI önerilerine göre tarifi güncelle
    const improvedIngredients = recipe.ingredients.map(ingredient => {
      const improvement = aiResponse.improvements.ingredients.find(imp => 
        imp.name === ingredient.name
      )
      
      if (improvement) {
        return {
          ...ingredient,
          amount: improvement.adjustedAmount
        }
      }
      
      return ingredient
    })

    return {
      ...recipe,
      ingredients: improvedIngredients
    }
  }

  /**
   * 🧮 Beslenme değerlerini hesapla
   */
  private calculateNutrition(recipe: Recipe): NutritionInfo {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0
    let totalSodium = 0
    let totalSugar = 0

    for (const ingredient of recipe.ingredients) {
      const nutritionData = this.nutritionDatabase.get(ingredient.name) || {
        calories: 200, protein: 10, carbs: 20, fat: 8, fiber: 2, sodium: 300, sugar: 5
      }

      const amountInGrams = this.convertToGrams(ingredient.amount, ingredient.unit)
      const factor = amountInGrams / 100 // Beslenme verileri 100g bazında

      totalCalories += nutritionData.calories * factor
      totalProtein += nutritionData.protein * factor
      totalCarbs += nutritionData.carbs * factor
      totalFat += nutritionData.fat * factor
      totalFiber += nutritionData.fiber * factor
      totalSodium += nutritionData.sodium * factor
      totalSugar += nutritionData.sugar * factor
    }

    return {
      total: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        fiber: totalFiber,
        sodium: totalSodium,
        sugar: totalSugar
      },
      perServing: {
        calories: totalCalories / recipe.servings,
        protein: totalProtein / recipe.servings,
        carbs: totalCarbs / recipe.servings,
        fat: totalFat / recipe.servings,
        fiber: totalFiber / recipe.servings,
        sodium: totalSodium / recipe.servings,
        sugar: totalSugar / recipe.servings
      }
    }
  }

  /**
   * Helper metodları
   */
  private rankRecipesBySuitability(recipes: Recipe[], profile: InstitutionProfile): Recipe[] {
    return recipes.sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      // Beslenme dengesi skoru
      if (a.nutrition.perServing.protein >= 15) scoreA += 10
      if (b.nutrition.perServing.protein >= 15) scoreB += 10

      // Maliyet skoru
      const budgetLimit = profile.maliyetSiniri?.maksimum || 30
      if (a.cost && a.cost.perServing <= budgetLimit * 0.8) scoreA += 15
      if (b.cost && b.cost.perServing <= budgetLimit * 0.8) scoreB += 15

      // Kolay pişirme skoru
      if (a.difficulty === 'kolay') scoreA += 5
      if (b.difficulty === 'kolay') scoreB += 5

      return scoreB - scoreA
    })
  }

  private generateAdaptationInfo(
    original: Recipe, 
    adapted: Recipe, 
    scaleFactor: number, 
    request: AdaptationRequest
  ): AdaptedRecipe['adaptationInfo'] {
    
    const nutritionComparison = {
      caloriesDiff: (adapted.nutrition.perServing.calories - original.nutrition.perServing.calories) / original.nutrition.perServing.calories * 100,
      proteinDiff: (adapted.nutrition.perServing.protein - original.nutrition.perServing.protein) / original.nutrition.perServing.protein * 100,
      carbsDiff: (adapted.nutrition.perServing.carbs - original.nutrition.perServing.carbs) / original.nutrition.perServing.carbs * 100,
      fatDiff: (adapted.nutrition.perServing.fat - original.nutrition.perServing.fat) / original.nutrition.perServing.fat * 100
    }

    return {
      originalRecipe: original.id,
      scaleFactor,
      adaptationReason: [
        `Porsiyon sayısı ${original.servings}'den ${adapted.servings}'e çıkarıldı`,
        'Gramaj gereksinimleri kurum profiline göre ayarlandı',
        request.adaptationGoals.optimizeCost ? 'Maliyet optimizasyonu yapıldı' : ''
      ].filter(Boolean),
      nutritionComparison,
      costComparison: original.cost && adapted.cost ? {
        originalCost: original.cost.perServing,
        adaptedCost: adapted.cost.perServing,
        savingsPercent: ((original.cost.perServing - adapted.cost.perServing) / original.cost.perServing) * 100
      } : undefined,
      substitutions: [], // Daha sonra doldurulacak
      confidence: 0.85,
      warnings: this.generateAdaptationWarnings(original, adapted, request)
    }
  }

  private generateAdaptationWarnings(
    original: Recipe, 
    adapted: Recipe, 
    request: AdaptationRequest
  ): string[] {
    const warnings: string[] = []

    // Büyük porsiyon değişimi uyarısı
    const scaleChange = (adapted.servings - original.servings) / original.servings * 100
    if (Math.abs(scaleChange) > 200) {
      warnings.push(`Porsiyon sayısı %${Math.round(Math.abs(scaleChange))} değişti`)
    }

    // Beslenme değişimi uyarısı
    const calorieChange = Math.abs((adapted.nutrition.perServing.calories - original.nutrition.perServing.calories) / original.nutrition.perServing.calories * 100)
    if (calorieChange > 20) {
      warnings.push('Kalori değeri %20\'den fazla değişti')
    }

    return warnings
  }

  private convertToGrams(amount: number, unit: RecipeIngredient['unit']): number {
    const conversions: { [key in RecipeIngredient['unit']]: number } = {
      gram: 1,
      kg: 1000,
      ml: 1, // Yaklaşık olarak
      litre: 1000,
      adet: 100, // Ortalama
      yemek_kasigi: 15,
      cay_kasigi: 5,
      su_bardagi: 200
    }

    return amount * (conversions[unit] || 1)
  }

  private findCheaperAlternative(ingredient: RecipeIngredient): RecipeIngredient | null {
    // Basit alternativ bulma - gerçekte veritabanından çekilir
    const alternatives: { [key: string]: string } = {
      'Dana Eti': 'Tavuk Eti',
      'Zeytinyağı': 'Ayçiçek Yağı',
      'Organik Domates': 'Domates'
    }

    const alternative = alternatives[ingredient.name]
    if (alternative) {
      return {
        ...ingredient,
        name: alternative
      }
    }

    return null
  }

  private calculateMenuNutrition(menu: { [day: string]: { [meal: string]: AdaptedRecipe } }): NutritionInfo {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0
    let totalSodium = 0
    let totalSugar = 0

    let totalMeals = 0

    for (const day in menu) {
      for (const meal in menu[day]) {
        const recipe = menu[day][meal]
        totalCalories += recipe.nutrition.perServing.calories
        totalProtein += recipe.nutrition.perServing.protein
        totalCarbs += recipe.nutrition.perServing.carbs
        totalFat += recipe.nutrition.perServing.fat
        totalFiber += recipe.nutrition.perServing.fiber
        totalSodium += recipe.nutrition.perServing.sodium
        totalSugar += recipe.nutrition.perServing.sugar
        totalMeals++
      }
    }

    return {
      total: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        fiber: totalFiber,
        sodium: totalSodium,
        sugar: totalSugar
      },
      perServing: {
        calories: totalCalories / totalMeals,
        protein: totalProtein / totalMeals,
        carbs: totalCarbs / totalMeals,
        fat: totalFat / totalMeals,
        fiber: totalFiber / totalMeals,
        sodium: totalSodium / totalMeals,
        sugar: totalSugar / totalMeals
      }
    }
  }

  /**
   * 🎲 Örnek tarifleri başlat
   */
  private initializeSampleRecipes(): void {
    this.baseRecipes = [
      {
        id: 'recipe001',
        name: 'Et Sote',
        description: 'Geleneksel et sote tarifi',
        category: 'ana_yemek',
        servings: 4,
        cookingTime: 45,
        difficulty: 'orta',
        ingredients: [
          {
            name: 'Dana Eti',
            amount: 500,
            unit: 'gram',
            category: 'et',
            optional: false,
            alternatives: ['Kuzu Eti']
          },
          {
            name: 'Soğan',
            amount: 2,
            unit: 'adet',
            category: 'sebze',
            optional: false
          },
          {
            name: 'Domates',
            amount: 3,
            unit: 'adet',
            category: 'sebze',
            optional: false
          },
          {
            name: 'Zeytinyağı',
            amount: 50,
            unit: 'ml',
            category: 'yag',
            optional: false,
            alternatives: ['Ayçiçek Yağı']
          }
        ],
        instructions: [
          'Eti küp küp doğrayın',
          'Soğanları ince ince doğrayın',
          'Yağı tavaya alın ve eti soteleyin',
          'Soğanları ekleyin',
          'Domatesleri ekleyin ve pişirin'
        ],
        nutrition: {
          perServing: {
            calories: 320,
            protein: 28,
            carbs: 8,
            fat: 18,
            fiber: 2,
            sodium: 450,
            sugar: 6
          },
          total: {
            calories: 1280,
            protein: 112,
            carbs: 32,
            fat: 72,
            fiber: 8,
            sodium: 1800,
            sugar: 24
          }
        },
        tags: ['et', 'sote', 'geleneksel'],
        cost: {
          estimated: 45.00,
          perServing: 11.25
        },
        restrictions: {
          halal: true,
          vegetarian: false,
          vegan: false,
          glutenFree: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'recipe002',
        name: 'Mercimek Çorbası',
        category: 'corba',
        servings: 6,
        cookingTime: 30,
        difficulty: 'kolay',
        ingredients: [
          {
            name: 'Kırmızı Mercimek',
            amount: 300,
            unit: 'gram',
            category: 'tahil',
            optional: false
          },
          {
            name: 'Soğan',
            amount: 1,
            unit: 'adet',
            category: 'sebze',
            optional: false
          },
          {
            name: 'Havuç',
            amount: 1,
            unit: 'adet',
            category: 'sebze',
            optional: true
          }
        ],
        instructions: [
          'Mercimekleri yıkayın',
          'Tüm malzemeleri tencereye alın',
          'Su ekleyip kaynatın',
          'Blenderdan geçirin'
        ],
        nutrition: {
          perServing: {
            calories: 180,
            protein: 12,
            carbs: 28,
            fat: 2,
            fiber: 8,
            sodium: 320,
            sugar: 4
          },
          total: {
            calories: 1080,
            protein: 72,
            carbs: 168,
            fat: 12,
            fiber: 48,
            sodium: 1920,
            sugar: 24
          }
        },
        tags: ['çorba', 'mercimek', 'sağlıklı'],
        cost: {
          estimated: 18.00,
          perServing: 3.00
        },
        restrictions: {
          halal: true,
          vegetarian: true,
          vegan: true,
          glutenFree: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  /**
   * 🍎 Beslenme veritabanını başlat
   */
  private initializeNutritionDatabase(): void {
    // 100g başına beslenme değerleri
    const nutritionData = [
      ['Dana Eti', { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sodium: 72, sugar: 0 }],
      ['Tavuk Eti', { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74, sugar: 0 }],
      ['Domates', { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5, sugar: 2.6 }],
      ['Soğan', { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sodium: 4, sugar: 4.2 }],
      ['Zeytinyağı', { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 2, sugar: 0 }],
      ['Kırmızı Mercimek', { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sodium: 2, sugar: 1.8 }],
      ['Havuç', { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sodium: 69, sugar: 4.7 }]
    ]

    nutritionData.forEach(([name, data]) => {
      this.nutritionDatabase.set(name as string, data)
    })
  }
}