// 🧪 Tarif Adaptörü - Sample Data & Test Cases
// Gerçek dünya senaryoları için test verisi

import { 
  Recipe, 
  SpecificationStandard, 
  AdapterSettings,
  RecipeIngredient 
} from '../services/recipeAdapterEngine'

/**
 * 📋 Şartname Örnekleri (Kurumsal Standartlar)
 */
export const sampleSpecifications: SpecificationStandard[] = [
  {
    id: 'meb-2024',
    institutionName: 'Milli Eğitim Bakanlığı',
    category: 'Kırmızı Et',
    minGramPerPerson: 120,
    maxGramPerPerson: 150,
    qualityRequirements: [
      'Dana eti (18 aylık max)',
      'Yağ oranı %15 max',
      'Halal kesim sertifikalı',
      'Veteriner hekim raporu'
    ],
    complianceLevel: 'strict'
  },
  {
    id: 'meb-2024-white-meat',
    institutionName: 'Milli Eğitim Bakanlığı',
    category: 'Beyaz Et',
    minGramPerPerson: 100,
    maxGramPerPerson: 130,
    qualityRequirements: [
      'Tavuk göğsü/but eti',
      'Antibiyotik kalıntısı yok',
      'Soğuk zincir korunmuş'
    ],
    complianceLevel: 'strict'
  },
  {
    id: 'msb-2024',
    institutionName: 'Milli Savunma Bakanlığı',
    category: 'Kırmızı Et', 
    minGramPerPerson: 150,
    maxGramPerPerson: 200,
    qualityRequirements: [
      'Dana/kuzu eti',
      'Protein oranı min %18',
      'Taze (dondurulmamış)',
      'TSE standardı'
    ],
    complianceLevel: 'strict'
  },
  {
    id: 'saglik-2024',
    institutionName: 'Sağlık Bakanlığı',
    category: 'Tahıl Ürünleri',
    minGramPerPerson: 80,
    maxGramPerPerson: 120,
    qualityRequirements: [
      'Tam buğday/pirinç',
      'Pestisit kalıntısı max limit',
      'Aflatoksin analizi temiz'
    ],
    complianceLevel: 'flexible'
  }
]

/**
 * 🍽️ Örnek Tarifler
 */
export const sampleRecipes: Recipe[] = [
  {
    id: 'beef-stew-classic',
    name: 'Klasik Et Yemeği',
    description: 'Geleneksel dana eti haşlaması, sebzeli',
    servingCount: 10,
    ingredients: [
      {
        id: 'beef-chunk',
        name: 'Dana Eti (Kuşbaşı)',
        category: 'Et Ürünleri',
        amount: 100, // gram/kişi
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'protein'
      },
      {
        id: 'onion',
        name: 'Soğan',
        category: 'Sebze',
        amount: 50,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'vegetable'
      },
      {
        id: 'carrot',
        name: 'Havuç',
        category: 'Sebze',
        amount: 30,
        unit: 'gr',
        isRequired: false,
        nutritionCategory: 'vegetable'
      },
      {
        id: 'potato',
        name: 'Patates',
        category: 'Sebze',
        amount: 80,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'carb'
      },
      {
        id: 'tomato-paste',
        name: 'Salça',
        category: 'Baharat',
        amount: 10,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'spice'
      },
      {
        id: 'rice',
        name: 'Pirinç (Pilav)',
        category: 'Tahıl',
        amount: 60,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'carb'
      }
    ],
    preparationTime: 120,
    difficulty: 'medium',
    cuisine: 'Türk Mutfağı',
    tags: ['Ana Yemek', 'Et Yemeği', 'Geleneksel'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-14')
  },
  {
    id: 'chicken-rice-pilaf',
    name: 'Tavuklu Pilav',
    description: 'Sebzeli tavuk göğsü ile nefis pilav',
    servingCount: 8,
    ingredients: [
      {
        id: 'chicken-breast',
        name: 'Tavuk Göğsü',
        category: 'Et Ürünleri',
        amount: 80,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'protein'
      },
      {
        id: 'rice-baldo',
        name: 'Baldo Pirinç',
        category: 'Tahıl',
        amount: 90,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'carb'
      },
      {
        id: 'butter',
        name: 'Tereyağı',
        category: 'Süt Ürünleri',
        amount: 15,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'fat'
      },
      {
        id: 'green-peas',
        name: 'Bezelye',
        category: 'Sebze',
        amount: 40,
        unit: 'gr',
        isRequired: false,
        nutritionCategory: 'vegetable'
      }
    ],
    preparationTime: 45,
    difficulty: 'easy',
    cuisine: 'Türk Mutfağı', 
    tags: ['Ana Yemek', 'Pilav', 'Tavuk'],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-10-14')
  },
  {
    id: 'lentil-soup-school',
    name: 'Okul Tipi Mercimek Çorbası',
    description: 'Besleyici kırmızı mercimek çorbası',
    servingCount: 20,
    ingredients: [
      {
        id: 'red-lentil',
        name: 'Kırmızı Mercimek',
        category: 'Baklagil',
        amount: 40,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'protein'
      },
      {
        id: 'onion-soup',
        name: 'Soğan',
        category: 'Sebze',
        amount: 20,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'vegetable'
      },
      {
        id: 'flour',
        name: 'Un',
        category: 'Tahıl',
        amount: 10,
        unit: 'gr',
        isRequired: true,
        nutritionCategory: 'carb'
      }
    ],
    preparationTime: 30,
    difficulty: 'easy',
    cuisine: 'Türk Mutfağı',
    tags: ['Çorba', 'Mercimek', 'Okul Yemeği'],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-10-14')
  }
]

/**
 * ⚙️ Örnek Adaptör Ayarları
 */
export const sampleAdapterSettings: AdapterSettings[] = [
  {
    mode: 'specification',
    targetServings: 100,
    selectedSpecification: sampleSpecifications[0], // MEB Kırmızı Et
    priceDataSource: 'cheapest',
    includeAlternatives: true
  },
  {
    mode: 'specification',
    targetServings: 50,
    selectedSpecification: sampleSpecifications[2], // MSB Kırmızı Et
    priceDataSource: 'average',
    includeAlternatives: false
  },
  {
    mode: 'freeform',
    targetServings: 25,
    priceDataSource: 'latest',
    includeAlternatives: true
  }
]

/**
 * 🧪 Test Senaryoları
 */
export const testScenarios = [
  {
    name: 'MEB Okul Yemeği - Et Eksikliği Senaryosu',
    description: 'Tarifteki et miktarı şartname standardının altında',
    recipe: sampleRecipes[0], // Klasik Et Yemeği (100g/kişi)
    settings: sampleAdapterSettings[0], // MEB standard (120g/kişi)
    expectedResult: {
      complianceIssue: 'insufficient',
      expectedWarning: 'Dana eti şartname gramajının %16.7 eksik',
      suggestedFix: 'Dana eti için 120g/kişi kullanın (mevcut: 100g/kişi)'
    }
  },
  {
    name: 'MSB Askeri Birlik - Yüksek Protein İhtiyacı',
    description: 'Askeri birlik için protein yoğun menü adaptasyonu', 
    recipe: sampleRecipes[0],
    settings: sampleAdapterSettings[1], // MSB standard (150g/kişi)
    expectedResult: {
      complianceIssue: 'insufficient',
      expectedWarning: 'Dana eti şartname gramajının %33.3 eksik',
      kikRisk: 'high'
    }
  },
  {
    name: 'Serbest Tarif - Catering Firması',
    description: 'Özel etkinlik için serbest ölçekleme',
    recipe: sampleRecipes[1], // Tavuklu Pilav  
    settings: sampleAdapterSettings[2], // Serbest mod
    expectedResult: {
      noComplianceCheck: true,
      onlyScaling: true,
      flexibleCosting: true
    }
  }
]

/**
 * 🎯 KİK Uyumluluk Test Verileri
 */
export const kikComplianceTests = [
  {
    scenario: 'İdeal Uyum',
    gramageScore: 98, // %98 şartname uyumu
    priceConfidence: 0.95, // Yüksek fiyat güvenilirliği
    expectedKValue: 0.93, // Sınır değer
    expectedRisk: 'low'
  },
  {
    scenario: 'Sınırda Uyum', 
    gramageScore: 92,
    priceConfidence: 0.88,
    expectedKValue: 0.81,
    expectedRisk: 'medium'
  },
  {
    scenario: 'Risk Senaryosu',
    gramageScore: 85,
    priceConfidence: 0.75,
    expectedKValue: 0.64,
    expectedRisk: 'high'
  }
]

/**
 * 🏢 Kurum Profilleri (AI Öğrenen Sistem için)
 */
export const institutionProfiles = [
  {
    name: 'Milli Eğitim Bakanlığı',
    abbreviation: 'MEB',
    sector: 'Eğitim',
    avgServingSize: 100,
    budgetSensitivity: 'high',
    qualityPriority: 'medium',
    commonRequirements: [
      'Helal sertifika zorunlu',
      'Çocuk beslenmesine uygun',
      'Alerjen uyarı sistemi',
      'Mevsimel menü rotasyonu'
    ],
    frequentCategories: ['Ana Yemek', 'Çorba', 'Pilav', 'Sebze Yemeği']
  },
  {
    name: 'Milli Savunma Bakanlığı',
    abbreviation: 'MSB', 
    sector: 'Savunma',
    avgServingSize: 150,
    budgetSensitivity: 'medium',
    qualityPriority: 'high',
    commonRequirements: [
      'Yüksek protein gereksinimi',
      'Uzun saklanabilir malzemeler',
      'Saha koşullarına dayanıklılık',
      'Hızlı hazırlanabilir'
    ],
    frequentCategories: ['Et Yemeği', 'Yüksek Kalori', 'Pratik Yemekler']
  },
  {
    name: 'Sağlık Bakanlığı',
    abbreviation: 'SB',
    sector: 'Sağlık',
    avgServingSize: 80,
    budgetSensitivity: 'medium',
    qualityPriority: 'very_high',
    commonRequirements: [
      'Diyet uygunluğu',
      'Düşük sodium',
      'Organik tercih',
      'Hasta beslenmesi uyumlu'
    ],
    frequentCategories: ['Diyet Yemekler', 'Çorba', 'Hafif Yemekler']
  }
]

/**
 * 💡 Utility Functions - Test & Development
 */
export const AdapterTestUtils = {
  
  // Hızlı test senaryosu oluşturucu
  createTestScenario: (
    recipeName: string,
    institutionName: string,
    servings: number
  ) => {
    const recipe = sampleRecipes.find(r => r.name.includes(recipeName))
    const spec = sampleSpecifications.find(s => s.institutionName.includes(institutionName))
    
    if (!recipe || !spec) {
      throw new Error('Test verisi bulunamadı')
    }
    
    return {
      recipe,
      settings: {
        mode: 'specification' as const,
        targetServings: servings,
        selectedSpecification: spec,
        priceDataSource: 'average' as const,
        includeAlternatives: true
      }
    }
  },
  
  // KİK risk simülatörü
  simulateKikRisk: (gramageScore: number, confidence: number) => {
    const kValue = (gramageScore / 100) * confidence
    
    return {
      kValue: Number(kValue.toFixed(3)),
      isAboveLimit: kValue >= 0.93,
      riskLevel: kValue >= 0.93 ? 'low' : kValue >= 0.85 ? 'medium' : 'high'
    }
  },
  
  // Maliyet karşılaştırma
  compareCosts: (freeformCost: number, specCost: number) => {
    const difference = specCost - freeformCost
    const percentChange = (difference / freeformCost) * 100
    
    return {
      difference: Number(difference.toFixed(2)),
      percentChange: Number(percentChange.toFixed(1)),
      recommendation: percentChange > 15 ? 'Şartname maliyeti yüksek, alternatif değerlendir' : 'Maliyet farkı kabul edilebilir'
    }
  }
}

// Export all for easy testing
export default {
  specifications: sampleSpecifications,
  recipes: sampleRecipes,
  settings: sampleAdapterSettings,
  scenarios: testScenarios,
  kikTests: kikComplianceTests,
  institutions: institutionProfiles,
  utils: AdapterTestUtils
}