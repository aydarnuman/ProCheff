// Gerçekçi market verisi servisi
import { MarketPrice, MarketDataSummary, TrendAnalysis } from './marketDataService'
import { GeminiPrediction } from './geminiTrendAnalyzer'

// Gerçekçi piyasa verileri (Türkiye hal verileri baz alınarak)
export const realisticMarketPrices: MarketPrice[] = [
  {
    name: 'Domates',
    category: 'sebze',
    unit: 'kg',
    minPrice: 8.50,
    maxPrice: 12.00,
    avgPrice: 10.25,
    city: 'İstanbul',
    date: '2025-10-14',
    source: 'hal',
    trend: 'up',
    changePercent: 3.2,
    freshness: 1
  },
  {
    name: 'Patates',
    category: 'sebze', 
    unit: 'kg',
    minPrice: 6.00,
    maxPrice: 8.50,
    avgPrice: 7.25,
    city: 'İstanbul',
    date: '2025-10-14',
    source: 'hal',
    trend: 'stable',
    changePercent: 0.1,
    freshness: 1
  },
  {
    name: 'Soğan',
    category: 'sebze',
    unit: 'kg',
    minPrice: 4.50,
    maxPrice: 6.00,
    avgPrice: 5.25,
    city: 'İstanbul', 
    date: '2025-10-14',
    source: 'hal',
    trend: 'down',
    changePercent: -1.8,
    freshness: 1
  },
  {
    name: 'Elma',
    category: 'meyve',
    unit: 'kg',
    minPrice: 15.00,
    maxPrice: 22.00,
    avgPrice: 18.50,
    city: 'Ankara',
    date: '2025-10-13',
    source: 'hal',
    trend: 'down',
    changePercent: -2.1,
    freshness: 2
  },
  {
    name: 'Muz',
    category: 'meyve',
    unit: 'kg',
    minPrice: 18.00,
    maxPrice: 25.00,
    avgPrice: 21.50,
    city: 'Mersin',
    date: '2025-10-14',
    source: 'hal',
    trend: 'up',
    changePercent: 4.5,
    freshness: 1
  },
  {
    name: 'Dana Kıyma',
    category: 'et',
    unit: 'kg',
    minPrice: 185.00,
    maxPrice: 220.00,
    avgPrice: 202.50,
    city: 'İstanbul',
    date: '2025-10-14',
    source: 'market',
    trend: 'up',
    changePercent: 2.8,
    freshness: 1
  },
  {
    name: 'Tavuk But',
    category: 'et',
    unit: 'kg',
    minPrice: 45.00,
    maxPrice: 52.00,
    avgPrice: 48.50,
    city: 'İstanbul',
    date: '2025-10-14',
    source: 'market',
    trend: 'stable',
    changePercent: 0.5,
    freshness: 1
  },
  {
    name: 'Süt',
    category: 'süt-ürünleri',
    unit: 'lt',
    minPrice: 18.00,
    maxPrice: 22.00,
    avgPrice: 20.00,
    city: 'İstanbul',
    date: '2025-10-14',
    source: 'üretici',
    trend: 'up',
    changePercent: 1.2,
    freshness: 1
  },
  {
    name: 'Beyaz Peynir',
    category: 'süt-ürünleri',
    unit: 'kg',
    minPrice: 85.00,
    maxPrice: 120.00,
    avgPrice: 102.50,
    city: 'İzmir',
    date: '2025-10-13',
    source: 'hal',
    trend: 'stable',
    changePercent: -0.3,
    freshness: 2
  },
  {
    name: 'Bulgur',
    category: 'tahıl',
    unit: 'kg',
    minPrice: 12.00,
    maxPrice: 16.00,
    avgPrice: 14.00,
    city: 'Şanlıurfa',
    date: '2025-10-12',
    source: 'üretici',
    trend: 'stable',
    changePercent: 0.2,
    freshness: 3
  },
  {
    name: 'Pirinç',
    category: 'tahıl',
    unit: 'kg',
    minPrice: 22.00,
    maxPrice: 28.00,
    avgPrice: 25.00,
    city: 'Çanakkale',
    date: '2025-10-13',
    source: 'üretici',
    trend: 'up',
    changePercent: 1.8,
    freshness: 2
  },
  {
    name: 'Biber',
    category: 'sebze',
    unit: 'kg',
    minPrice: 12.00,
    maxPrice: 18.00,
    avgPrice: 15.00,
    city: 'Antalya',
    date: '2025-10-14',
    source: 'hal',
    trend: 'up',
    changePercent: 5.2,
    freshness: 1
  }
]

export const realisticMarketSummary: MarketDataSummary = {
  totalProducts: 156,
  categories: [
    { 
      category: 'sebze', 
      productCount: 64, 
      avgPriceChange: 2.3, 
      trend: 'up' 
    },
    { 
      category: 'meyve', 
      productCount: 42, 
      avgPriceChange: -0.8, 
      trend: 'down' 
    },
    { 
      category: 'et', 
      productCount: 28, 
      avgPriceChange: 4.1, 
      trend: 'up' 
    },
    { 
      category: 'süt-ürünleri', 
      productCount: 15, 
      avgPriceChange: 1.2, 
      trend: 'stable' 
    },
    { 
      category: 'tahıl', 
      productCount: 7, 
      avgPriceChange: 0.5, 
      trend: 'stable' 
    }
  ],
  lastUpdate: new Date().toISOString(),
  dataFreshness: 1,
  priceVolatility: 'medium'
}

// Gerçekçi trend analizi verileri
export const generateRealisticTrendAnalysis = (productName: string): TrendAnalysis => {
  const productData = realisticMarketPrices.find(p => 
    p.name.toLowerCase().includes(productName.toLowerCase())
  )

  if (!productData) {
    return {
      productName,
      weeklyChange: 0,
      monthlyChange: 0,
      volatilityScore: 5,
      riskLevel: 'medium',
      recommendation: 'Belirtilen ürün bulunamadı. Lütfen mevcut ürünlerden birini seçiniz.',
      confidenceScore: 0.5
    }
  }

  // Gerçekçi hesaplamalar
  const baseChange = productData.changePercent
  const weeklyChange = baseChange
  const monthlyChange = baseChange * (2.8 + (productData.freshness * 0.3))
  
  let riskLevel: 'low' | 'medium' | 'high' = 'medium'
  if (Math.abs(monthlyChange) < 5) riskLevel = 'low'
  if (Math.abs(monthlyChange) > 15) riskLevel = 'high'

  const recommendations = {
    'Domates': 'Sonbahar sezonu etkisiyle fiyatlar yükselişte. Alternatif tedarikçi araştırılması önerilir.',
    'Patates': 'Stabil fiyat seyri devam ediyor. Büyük alım için uygun dönem.',
    'Soğan': 'Hasat dönemi nedeniyle fiyatlar düşüşte. Stok artırımı yapılabilir.',
    'Elma': 'Yeni sezon etkisiyle fiyat düşüşü beklentisi. Beklemek mantıklı.',
    'Muz': 'İthalat maliyetlerindeki artış fiyatlara yansıyor. Alternatif meyve seçenekleri değerlendirilebilir.',
    'Dana Kıyma': 'Et fiyatlarında süregelen artış trendi. Portion kontrolü önerilir.',
    'Tavuk But': 'Görece stabil seyrini koruyor. Güvenli alım yapılabilir.'
  }

  return {
    productName: productData.name,
    weeklyChange,
    monthlyChange,
    volatilityScore: Math.abs(monthlyChange) * 0.8,
    riskLevel,
    recommendation: recommendations[productData.name as keyof typeof recommendations] || 
                   'Bu ürün için piyasa stabil görünüyor. Mevcut stratejinizi koruyabilirsiniz.',
    confidenceScore: 0.75 + (productData.freshness === 1 ? 0.2 : 0.1)
  }
}

// Gerçekçi AI tahminleri
export const generateRealisticGeminiPredictions = (prices: MarketPrice[]): GeminiPrediction[] => {
  return prices.slice(0, 8).map(price => {
    const seasonalFactor = getSeasonalFactor(price.category, price.name)
    const economicFactor = getEconomicFactor(price.category)
    
    // Gerçekçi fiyat tahminleri
    const weeklyPrediction = price.avgPrice * (1 + (price.changePercent / 100) * 0.7 + seasonalFactor)
    const twoWeeksPrediction = price.avgPrice * (1 + (price.changePercent / 100) * 1.2 + seasonalFactor * 1.3)
    const monthlyPrediction = price.avgPrice * (1 + (price.changePercent / 100) * 2.1 + seasonalFactor * 2)

    const weeklyChange = ((weeklyPrediction - price.avgPrice) / price.avgPrice) * 100
    const monthlyChange = ((monthlyPrediction - price.avgPrice) / price.avgPrice) * 100

    let riskLevel: 'low' | 'medium' | 'high' = 'medium'
    if (Math.abs(monthlyChange) < 8) riskLevel = 'low'
    if (Math.abs(monthlyChange) > 20) riskLevel = 'high'

    let action: 'increase' | 'decrease' | 'maintain' = 'maintain'
    if (monthlyChange > 10) action = 'increase'
    if (monthlyChange < -5) action = 'decrease'

    return {
      productName: price.name,
      currentPrice: price.avgPrice,
      predictedPrice: {
        oneWeek: weeklyPrediction,
        twoWeeks: twoWeeksPrediction,
        oneMonth: monthlyPrediction
      },
      priceChange: {
        oneWeek: weeklyChange,
        twoWeeks: ((twoWeeksPrediction - price.avgPrice) / price.avgPrice) * 100,
        oneMonth: monthlyChange
      },
      confidence: 0.7 + (price.freshness === 1 ? 0.2 : price.freshness === 2 ? 0.1 : 0.05),
      factors: {
        seasonal: getSeasonalDescription(price.category, price.name),
        economic: economicFactor.description,
        supply: getSupplyDescription(price.category, price.changePercent),
        demand: getDemandDescription(price.category, price.changePercent)
      },
      riskAssessment: {
        level: riskLevel,
        score: Math.min(Math.abs(monthlyChange) * 4, 100),
        reasoning: getRiskReasoning(riskLevel, monthlyChange, price.name)
      },
      recommendation: {
        action,
        marginAdjustment: getMarginAdjustment(action, monthlyChange, price.avgPrice),
        reasoning: getRecommendationReasoning(action, monthlyChange, price.name)
      }
    }
  })
}

// Yardımcı fonksiyonlar
function getSeasonalFactor(category: string, productName: string): number {
  const currentMonth = new Date().getMonth() // 0-11
  
  if (category === 'sebze') {
    if (currentMonth >= 9 || currentMonth <= 2) return 0.05 // Kış
    if (currentMonth >= 6 && currentMonth <= 8) return -0.03 // Yaz
  }
  
  if (category === 'meyve') {
    if (currentMonth >= 8 && currentMonth <= 10) return -0.08 // Sonbahar - hasat
    if (currentMonth >= 3 && currentMonth <= 5) return 0.12 // İlkbahar - kıtlık
  }
  
  return 0
}

function getEconomicFactor(category: string) {
  const factors = {
    'et': { impact: 0.08, description: 'Yem fiyatlarındaki artış maliyetleri etkiliyor' },
    'süt-ürünleri': { impact: 0.06, description: 'Enflasyon süt ürünlerine yansımaya devam ediyor' },
    'sebze': { impact: 0.04, description: 'Mazot ve gübre maliyetleri üretimi etkiliyor' },
    'meyve': { impact: 0.05, description: 'İhracat talebi iç piyasa fiyatlarını destekliyor' },
    'tahıl': { impact: 0.03, description: 'Destekleme alımları fiyat istikrarını sağlıyor' }
  }
  
  return factors[category as keyof typeof factors] || { impact: 0.04, description: 'Genel ekonomik koşullar fiyatları etkiliyor' }
}

function getSeasonalDescription(category: string, productName: string): string {
  const descriptions = {
    'sebze': 'Kış sebzeleri sezonunda artış beklentisi',
    'meyve': 'Meyve sezonunun sonu, depo ürünlerine geçiş',
    'et': 'Bayram öncesi talep artışı beklentisi', 
    'süt-ürünleri': 'Kış aylarında süt verimi düşüşü',
    'tahıl': 'Hasat sonrası stabil dönem'
  }
  
  return descriptions[category as keyof typeof descriptions] || 'Mevsimsel etki orta seviyede'
}

function getSupplyDescription(category: string, changePercent: number): string {
  if (changePercent > 3) return 'Arz kısıtlı, üretimde sorunlar var'
  if (changePercent < -2) return 'Bol arz var, üretim normal seyrinde'
  return 'Arz-talep dengesi normal seviyede'
}

function getDemandDescription(category: string, changePercent: number): string {
  if (changePercent > 3) return 'Yüksek talep, tüketim arttı'
  if (changePercent < -2) return 'Talep azaldı, tüketim düşük'
  return 'Normal talep seviyesi, istikrarlı tüketim'
}

function getRiskReasoning(riskLevel: string, monthlyChange: number, productName: string): string {
  if (riskLevel === 'high') {
    return `${productName} fiyatlarında %${Math.abs(monthlyChange).toFixed(1)} değişim riski yüksek`
  }
  if (riskLevel === 'low') {
    return `${productName} fiyatları stabil seyrini koruyacak`
  }
  return `${productName} için orta düzey fiyat dalgalanması bekleniyor`
}

function getMarginAdjustment(action: string, monthlyChange: number, currentPrice: number): number {
  if (action === 'increase') return currentPrice * (Math.abs(monthlyChange) / 100) * 0.3
  if (action === 'decrease') return -(currentPrice * (Math.abs(monthlyChange) / 100) * 0.2)
  return 0
}

function getRecommendationReasoning(action: string, monthlyChange: number, productName: string): string {
  if (action === 'increase') {
    return `${productName} fiyat artışı bekleniyor, menü fiyatlarını önceden ayarlayın`
  }
  if (action === 'decrease') {
    return `${productName} fiyat düşüşü fırsatı, promosyonlarda kullanabilirsiniz`
  }
  return `${productName} fiyatları stabil, mevcut stratejinizi koruyun`
}