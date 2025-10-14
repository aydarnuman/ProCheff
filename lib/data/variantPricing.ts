// 🏗️ Varyant-bazlı Fiyat Takip Sistemi - Profesyonel İhale Analizi
// Tasarım Prensibi: Her ürün = Fiyat Ailesi (Product + Variants + Sources)

export interface Product {
  id: string
  name: string                    // "Torku Pilavlık Bulgur"
  brand: string                   // "Torku" 
  category: string                // "Tahıllar"
  image?: string                  // Ürün görseli
  baseUnit: string                // "kg" | "adet" | "litre"
  description?: string            // Kısa açıklama
  keywords: string[]              // AI normalizasyonu için ["bulgur", "pilavlık", "tahıl"]
  variants: ProductVariant[]      // Farklı gramaj/market kombinasyonları
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  size: number                    // 3, 5 (kg cinsinden)
  sizeUnit: string               // "kg", "gr", "adet" 
  packageType?: string           // "ekonomik", "aile boyu", "normal"
  market: string                 // "BİM", "A101", "Migros"
  price: number                  // 89.50 (TL)
  unitPrice: number              // 17.9 (TL/kg) - Otomatik hesaplanan
  isBasePrice: boolean           // En ucuz varyant mı?
  availability: 'available' | 'limited' | 'out_of_stock'
  priceSource: PriceSource       // Verinin kaynağı ve güvenilirliği
  priceHistory: PriceHistoryEntry[]
  trend: PriceTrend
  lastUpdated: Date
}

export interface PriceSource {
  id: string
  type: 'direct_scraping' | 'ai_prediction' | 'manual_entry' | 'supplier_api'
  name: string                   // "BİM Resmi Site", "AI Tahmin Motoru"
  confidence: number             // 0.94 = %94 güvenilir
  lastCheck: Date
  isActive: boolean
  metadata?: {
    scrapeUrl?: string
    apiEndpoint?: string
    manualEntryUser?: string
  }
}

export interface PriceTrend {
  direction: 'up' | 'down' | 'stable'
  percentage: number             // +5.2, -3.1
  period: '1d' | '7d' | '30d'    // Trend süresi
  confidence: number             // Trend güvenilirliği
}

export interface PriceHistoryEntry {
  date: Date
  price: number
  unitPrice: number
  market: string
  source: string
  confidence: number
}

// 📊 Fiyat Karşılaştırma ve Analiz
export interface ProductComparison {
  productId: string
  productName: string
  baseUnitPrice: number          // En ucuz birim fiyat
  bestVariant: ProductVariant    // En avantajlı seçenek
  variantCount: number           // Kaç farklı varyant var
  priceRange: {
    min: number                  // En düşük birim fiyat
    max: number                  // En yüksek birim fiyat
    spread: number               // Fiyat aralığı %'si
  }
  marketCoverage: string[]       // Hangi marketlerde bulunuyor
  averageConfidence: number      // Ortalama güvenilirlik
  lastUpdate: Date
}

// 🔍 Gelişmiş Filtreleme
export interface VariantFilter {
  categories?: string[]
  brands?: string[]
  markets?: string[]
  priceRange?: {
    min: number
    max: number
  }
  sizeRange?: {
    min: number
    max: number
  }
  sourceTypes?: PriceSource['type'][]
  minConfidence?: number         // Minimum güvenilirlik %
  availability?: ProductVariant['availability'][]
  onlyBestPrices?: boolean       // Sadece en ucuz varyantları göster
}

// 🎯 Maliyet Simülasyonu Entegrasyonu
export interface CostSimulationInput {
  productId: string
  selectedVariantId?: string     // Seçili varyant (yoksa en ucuz alınır)
  requiredQuantity: number       // İhtiyaç miktarı
  requiredUnit: string           // "kg", "adet"
  targetBudget?: number          // Hedef bütçe (opsiyonel)
}

export interface CostSimulationResult {
  productName: string
  selectedVariant: ProductVariant
  calculation: {
    unitPrice: number            // Seçilen varyantın birim fiyatı
    quantity: number             // Hesaplanan miktar
    totalCost: number            // Toplam maliyet
    packageCount: number         // Kaç paket gerekiyor
    remainingAmount: number      // Artık miktar
  }
  alternatives: {                // Alternatif varyantlar
    variant: ProductVariant
    totalCost: number
    savings: number              // Tasarruf miktarı
  }[]
  budgetAnalysis?: {
    isWithinBudget: boolean
    budgetUsage: number          // Bütçe kullanım %'si
    savingsOrOverrun: number     // Tasarruf veya aşım
  }
}

// 🤖 AI Normalizasyon Servisi
export interface AIProductNormalization {
  originalName: string           // "Torku Bulgur 5 KG Ekonomik Paket"
  normalizedName: string         // "Torku Pilavlık Bulgur"
  extractedInfo: {
    brand: string                // "Torku"
    productType: string          // "Pilavlık Bulgur"
    size: number                 // 5
    sizeUnit: string             // "kg"
    packageType?: string         // "Ekonomik"
  }
  confidence: number             // Normalizasyon güvenilirliği
  suggestions: string[]          // Benzer ürün önerileri
}

// 📱 UI/UX Bileşen Arayüzleri
export interface ProductCardData {
  product: Product
  bestVariant: ProductVariant
  comparison: ProductComparison
  displayFormat: 'compact' | 'detailed' | 'comparison'
}

export interface VariantTableRow {
  variant: ProductVariant
  isSelected: boolean
  isBestPrice: boolean
  savingsAmount?: number         // Ana varyanta göre tasarruf
  statusLabel: string            // "Güncel", "Tahmini", "Eski"
  confidenceLabel: string        // "Yüksek", "Orta", "Düşük"
}

// 🔄 Real-time Güncelleme Events
export interface PriceUpdateEvent {
  type: 'price_changed' | 'new_variant' | 'source_updated' | 'trend_changed'
  productId: string
  variantId?: string
  oldValue?: any
  newValue: any
  timestamp: Date
  source: string
}

// 📈 Analytics ve Raporlama
export interface PriceAnalytics {
  period: '1d' | '7d' | '30d' | '90d'
  productCount: number
  variantCount: number
  averageUnitPrice: number
  priceVolatility: number        // Fiyat oynaklığı
  marketDistribution: {
    market: string
    productCount: number
    averagePrice: number
  }[]
  categoryTrends: {
    category: string
    trendDirection: 'up' | 'down' | 'stable'
    averageChange: number
  }[]
  sourceReliability: {
    source: string
    confidence: number
    updateFrequency: number
  }[]
}

// 🎨 UI Tema ve Görselleştirme
export const VARIANT_PRICING_THEME = {
  colors: {
    bestPrice: 'var(--status-success)',      // En iyi fiyat - yeşil
    priceIncrease: 'var(--status-error)',    // Fiyat artışı - kırmızı
    priceDecrease: 'var(--status-success)',  // Fiyat düşüşü - yeşil
    aiPrediction: 'var(--text-muted)',       // AI tahmini - gri
    highConfidence: 'var(--status-success)', // Yüksek güven - yeşil
    lowConfidence: 'var(--status-warning)',  // Düşük güven - sarı
    unavailable: 'var(--status-error)',      // Mevcut değil - kırmızı
  },
  badges: {
    bestPrice: '🏆 En İyi Fiyat',
    trending: '📈 Trend',
    aiPredicted: '🔮 AI Tahmini',
    freshData: '🕐 Güncel',
    oldData: '⚠️ Eski Veri',
    highConfidence: '🔰 Güvenilir',
    lowStock: '⚡ Son Ürünler',
  }
}