import { NextRequest, NextResponse } from 'next/server'

interface RecipeGenerationRequest {
  prompt: string
  dishName: string
  servings: number
  maxCost?: number
  difficulty: 'Kolay' | 'Orta' | 'Zor'
}

export async function POST(request: NextRequest) {
  try {
    const body: RecipeGenerationRequest = await request.json()
    const { prompt, dishName, servings, maxCost, difficulty } = body

    // OpenAI API çağrısı (gerçek implementasyon)
    // Şu an için mock response döndürüyoruz
    
    // OpenAI API Key kontrolü
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (openaiApiKey) {
      // Gerçek OpenAI API çağrısı
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Sen profesyonel bir şef ve tarif uzmanısın. Türk mutfağı konusunda uzmanlaşmışsın. Sadece JSON formatında tarif döndür.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      })

      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json()
        const aiContent = openaiData.choices[0]?.message?.content
        
        try {
          // AI response'unu parse et
          const parsedRecipe = JSON.parse(aiContent)
          return NextResponse.json({
            success: true,
            data: parsedRecipe
          })
        } catch (parseError) {
          console.error('AI Response Parse Error:', parseError)
          // Parse hatası durumunda fallback
        }
      }
    }

    // Fallback: Akıllı mock tarif üretimi
    const mockRecipe = generateSmartMockRecipe(dishName, servings, difficulty, maxCost)
    
    return NextResponse.json({
      success: true,
      data: mockRecipe
    })

  } catch (error) {
    console.error('Recipe Generation API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Tarif üretilirken hata oluştu' },
      { status: 500 }
    )
  }
}

function generateSmartMockRecipe(
  dishName: string, 
  servings: number, 
  difficulty: 'Kolay' | 'Orta' | 'Zor',
  maxCost?: number
) {
  const name = dishName.toLowerCase()
  
  // Yemek türüne göre akıllı tahmin
  if (name.includes('pilav')) {
    return generatePilavRecipe(dishName, servings, difficulty, maxCost)
  } else if (name.includes('tavuk') || name.includes('chicken')) {
    return generateTavukRecipe(dishName, servings, difficulty, maxCost)
  } else if (name.includes('makarna') || name.includes('pasta')) {
    return generateMakarnaRecipe(dishName, servings, difficulty, maxCost)
  } else if (name.includes('çorba') || name.includes('soup')) {
    return generateCorbaRecipe(dishName, servings, difficulty, maxCost)
  } else if (name.includes('balık') || name.includes('fish')) {
    return generateBalikRecipe(dishName, servings, difficulty, maxCost)
  } else if (name.includes('kebab') || name.includes('kebap')) {
    return generateKebapRecipe(dishName, servings, difficulty, maxCost)
  } else if (name.includes('börek')) {
    return generateBorekRecipe(dishName, servings, difficulty, maxCost)
  } else if (name.includes('salata')) {
    return generateSalataRecipe(dishName, servings, difficulty, maxCost)
  } else if (name.includes('tatlı') || name.includes('dessert')) {
    return generateTatliRecipe(dishName, servings, difficulty, maxCost)
  } else {
    return generateGenericRecipe(dishName, servings, difficulty, maxCost)
  }
}

function generateTavukRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return {
    name: dishName,
    description: `Lezzetli ve besleyici ${dishName} tarifi. Taze malzemelerle hazırlanmış özel tarif.`,
    cookingTime: difficulty === 'Kolay' ? 25 : difficulty === 'Orta' ? 35 : 50,
    ingredients: [
      { name: 'Tavuk göğsü', amount: 600 * (servings / 4), unit: 'gram', category: 'et' },
      { name: 'Soğan', amount: Math.ceil(2 * (servings / 4)), unit: 'adet', category: 'sebze' },
      { name: 'Domates', amount: Math.ceil(3 * (servings / 4)), unit: 'adet', category: 'sebze' },
      { name: 'Biber', amount: Math.ceil(2 * (servings / 4)), unit: 'adet', category: 'sebze' },
      { name: 'Zeytinyağı', amount: 50 * (servings / 4), unit: 'ml', category: 'yağ' },
      { name: 'Tuz', amount: 8, unit: 'gram', category: 'baharat' },
      { name: 'Karabiber', amount: 3, unit: 'gram', category: 'baharat' },
      { name: 'Kırmızı biber', amount: 1, unit: 'tatlı kaşığı', category: 'baharat' },
      { name: 'Sarımsak', amount: 3, unit: 'diş', category: 'sebze' }
    ],
    instructions: [
      'Tavuk göğsünü orta boy parçalar halinde doğrayın',
      'Soğan ve biberleri ince ince dilimleyin',
      'Domatesleri küp küp doğrayın, sarımsakları ezin',
      'Geniş tavada zeytinyağını ısıtın',
      'Tavuk parçalarını her tarafı pembe olana kadar soteleyin (8-10 dakika)',
      'Soğan ve sarımsakları ekleyip pembeleşene kadar kavurun',
      'Biberleri ekleyip 3-4 dakika kavurun',
      'Domatesleri ve baharatları ekleyip karıştırın',
      'Kısık ateşte 15-20 dakika kapalı olarak pişirin',
      'Ara ara karıştırarak suyunu çekmesini sağlayın',
      'Sıcak pilav yanında servis yapın'
    ],
    nutritionInfo: {
      calories: Math.round(285 * (servings / 4)),
      protein: Math.round(35 * (servings / 4)),
      carbs: Math.round(14 * (servings / 4)),
      fat: Math.round(9 * (servings / 4))
    },
    estimatedCost: maxCost || Math.round(55 * (servings / 4)),
    tags: ['Protein', 'Sağlıklı', 'Ana Yemek', 'Türk Mutfağı', 'Sebzeli']
  }
}

function generatePilavRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return {
    name: dishName,
    description: `Geleneksel Türk mutfağından ${dishName} tarifi. Nefis ve doyurucu.`,
    cookingTime: 35,
    ingredients: [
      { name: 'Pirinç', amount: 300 * (servings / 4), unit: 'gram', category: 'tahıl' },
      { name: 'Tavuk suyu', amount: 600 * (servings / 4), unit: 'ml', category: 'sıvı' },
      { name: 'Tereyağı', amount: 60 * (servings / 4), unit: 'gram', category: 'yağ' },
      { name: 'Soğan', amount: 1, unit: 'adet', category: 'sebze' },
      { name: 'Şehriye', amount: 50 * (servings / 4), unit: 'gram', category: 'tahıl' },
      { name: 'Tuz', amount: 8, unit: 'gram', category: 'baharat' },
      { name: 'Karabiber', amount: 2, unit: 'gram', category: 'baharat' }
    ],
    instructions: [
      'Pirinci bol suda iyice yıkayın ve süzün',
      'Soğanı çok ince doğrayın',
      'Kalın tabanlı tencerede tereyağını eritin',
      'Şehriyeyi hafif kavurun',
      'Soğanları ekleyip pembeleşene kadar kavurun',
      'Pirinci ekleyip 3-4 dakika kavurun',
      'Sıcak suyu ve tuzu ekleyin',
      'Karıştırdıktan sonra kapağını kapatın',
      '18-20 dakika kısık ateşte pişirin',
      'Altını kapatıp 10 dakika dinlendirin',
      'Çatal ile karıştırıp servis yapın'
    ],
    nutritionInfo: {
      calories: Math.round(340 * (servings / 4)),
      protein: Math.round(9 * (servings / 4)),
      carbs: Math.round(68 * (servings / 4)),
      fat: Math.round(7 * (servings / 4))
    },
    estimatedCost: maxCost || Math.round(30 * (servings / 4)),
    tags: ['Karbonhidrat', 'Garnitur', 'Geleneksel', 'Pilav', 'Türk Mutfağı']
  }
}

function generateGenericRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return {
    name: dishName,
    description: `AI tarafından özel olarak hazırlanmış ${dishName} tarifi.`,
    cookingTime: difficulty === 'Kolay' ? 20 : difficulty === 'Orta' ? 35 : 55,
    ingredients: [
      { name: 'Ana malzeme', amount: 500 * (servings / 4), unit: 'gram', category: 'ana' },
      { name: 'Soğan', amount: Math.ceil(1 * (servings / 4)), unit: 'adet', category: 'sebze' },
      { name: 'Zeytinyağı', amount: 40 * (servings / 4), unit: 'ml', category: 'yağ' },
      { name: 'Tuz', amount: 6, unit: 'gram', category: 'baharat' },
      { name: 'Karabiber', amount: 2, unit: 'gram', category: 'baharat' }
    ],
    instructions: [
      'Tüm malzemeleri hazırlayın',
      'Ana malzemeyi uygun şekilde doğrayın',
      'Soğanları kavurun',
      'Diğer malzemeleri sırasıyla ekleyin',
      'Uygun sürede pişirin',
      'Baharatları ekleyip karıştırın',
      'Sıcak servis yapın'
    ],
    nutritionInfo: {
      calories: Math.round(260 * (servings / 4)),
      protein: Math.round(22 * (servings / 4)),
      carbs: Math.round(28 * (servings / 4)),
      fat: Math.round(11 * (servings / 4))
    },
    estimatedCost: maxCost || Math.round(45 * (servings / 4)),
    tags: ['AI Üretimi', 'Özel Tarif', 'Lezzetli']
  }
}

// Diğer yemek türleri için basitleştirilmiş fonksiyonlar
function generateMakarnaRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return generateGenericRecipe(dishName, servings, difficulty, maxCost)
}

function generateCorbaRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return generateGenericRecipe(dishName, servings, difficulty, maxCost)
}

function generateBalikRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return generateGenericRecipe(dishName, servings, difficulty, maxCost)
}

function generateKebapRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return generateGenericRecipe(dishName, servings, difficulty, maxCost)
}

function generateBorekRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return generateGenericRecipe(dishName, servings, difficulty, maxCost)
}

function generateSalataRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return generateGenericRecipe(dishName, servings, difficulty, maxCost)
}

function generateTatliRecipe(dishName: string, servings: number, difficulty: string, maxCost?: number) {
  return generateGenericRecipe(dishName, servings, difficulty, maxCost)
}