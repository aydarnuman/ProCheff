// Fiyat takip için merkezi veri modeli

export interface PriceProduct {
  id: string
  name: string
  category: string
  unit: string
  currentPrice: number
  previousPrice: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  supplier: string
  lastUpdate: Date
  priceHistory: PriceHistoryEntry[]
  status: 'available' | 'limited' | 'unavailable'
  quality: 'premium' | 'standard' | 'economy'
  seasonality: {
    inSeason: boolean
    peakMonths: string[]
  }
  alerts: PriceAlert[]
}

export interface PriceHistoryEntry {
  date: Date
  price: number
  supplier: string
  notes?: string
}

export interface PriceAlert {
  id: string
  type: 'price_increase' | 'price_decrease' | 'availability' | 'quality'
  threshold: number
  isActive: boolean
  message: string
  createdAt: Date
}

export interface PriceFilter {
  category: string | null
  supplier: string | null
  trend: string | null
  status: string | null
  priceRange: {
    min: number | null
    max: number | null
  }
}

export const mockPriceData: PriceProduct[] = [
  {
    id: 'prod_001',
    name: 'Dana Kuşbaşı',
    category: 'Et Ürünleri',
    unit: 'kg',
    currentPrice: 485.50,
    previousPrice: 465.00,
    trend: 'up',
    trendPercentage: 4.4,
    supplier: 'Marmara Et A.Ş.',
    lastUpdate: new Date('2024-01-20'),
    status: 'available',
    quality: 'premium',
    seasonality: {
      inSeason: true,
      peakMonths: ['Ocak', 'Şubat', 'Mart']
    },
    priceHistory: [
      { date: new Date('2024-01-15'), price: 465.00, supplier: 'Marmara Et A.Ş.' },
      { date: new Date('2024-01-10'), price: 455.00, supplier: 'Marmara Et A.Ş.' },
      { date: new Date('2024-01-05'), price: 475.00, supplier: 'Marmara Et A.Ş.' }
    ],
    alerts: [
      {
        id: 'alert_001',
        type: 'price_increase',
        threshold: 5.0,
        isActive: false,
        message: 'Fiyat %5\'den fazla arttı',
        createdAt: new Date('2024-01-20')
      }
    ]
  },
  {
    id: 'prod_002',
    name: 'Tavuk But',
    category: 'Et Ürünleri',
    unit: 'kg',
    currentPrice: 58.75,
    previousPrice: 62.50,
    trend: 'down',
    trendPercentage: -6.0,
    supplier: 'Beyaz Et Gıda',
    lastUpdate: new Date('2024-01-20'),
    status: 'available',
    quality: 'standard',
    seasonality: {
      inSeason: true,
      peakMonths: ['Tüm Yıl']
    },
    priceHistory: [
      { date: new Date('2024-01-15'), price: 62.50, supplier: 'Beyaz Et Gıda' },
      { date: new Date('2024-01-10'), price: 65.00, supplier: 'Beyaz Et Gıda' },
      { date: new Date('2024-01-05'), price: 60.00, supplier: 'Beyaz Et Gıda' }
    ],
    alerts: []
  },
  {
    id: 'prod_003',
    name: 'Domates',
    category: 'Sebze & Meyve',
    unit: 'kg',
    currentPrice: 12.50,
    previousPrice: 12.50,
    trend: 'stable',
    trendPercentage: 0,
    supplier: 'Antalya Sebze Hal',
    lastUpdate: new Date('2024-01-20'),
    status: 'available',
    quality: 'standard',
    seasonality: {
      inSeason: false,
      peakMonths: ['Haziran', 'Temmuz', 'Ağustos', 'Eylül']
    },
    priceHistory: [
      { date: new Date('2024-01-15'), price: 12.50, supplier: 'Antalya Sebze Hal' },
      { date: new Date('2024-01-10'), price: 13.00, supplier: 'Antalya Sebze Hal' },
      { date: new Date('2024-01-05'), price: 11.75, supplier: 'Antalya Sebze Hal' }
    ],
    alerts: []
  },
  {
    id: 'prod_004',
    name: 'Pirinç (Osmancık)',
    category: 'Tahıllar',
    unit: 'kg',
    currentPrice: 28.90,
    previousPrice: 27.50,
    trend: 'up',
    trendPercentage: 5.1,
    supplier: 'Samsun Tarım Kooperatifi',
    lastUpdate: new Date('2024-01-20'),
    status: 'available',
    quality: 'premium',
    seasonality: {
      inSeason: true,
      peakMonths: ['Ekim', 'Kasım', 'Aralık']
    },
    priceHistory: [
      { date: new Date('2024-01-15'), price: 27.50, supplier: 'Samsun Tarım Kooperatifi' },
      { date: new Date('2024-01-10'), price: 26.75, supplier: 'Samsun Tarım Kooperatifi' },
      { date: new Date('2024-01-05'), price: 28.00, supplier: 'Samsun Tarım Kooperatifi' }
    ],
    alerts: []
  },
  {
    id: 'prod_005',
    name: 'Zeytinyağı (Naturel)',
    category: 'Yağlar',
    unit: 'litre',
    currentPrice: 185.00,
    previousPrice: 175.00,
    trend: 'up',
    trendPercentage: 5.7,
    supplier: 'Ege Zeytinyağı Üreticileri',
    lastUpdate: new Date('2024-01-20'),
    status: 'limited',
    quality: 'premium',
    seasonality: {
      inSeason: false,
      peakMonths: ['Kasım', 'Aralık', 'Ocak']
    },
    priceHistory: [
      { date: new Date('2024-01-15'), price: 175.00, supplier: 'Ege Zeytinyağı Üreticileri' },
      { date: new Date('2024-01-10'), price: 170.00, supplier: 'Ege Zeytinyağı Üreticileri' },
      { date: new Date('2024-01-05'), price: 180.00, supplier: 'Ege Zeytinyağı Üreticileri' }
    ],
    alerts: [
      {
        id: 'alert_005',
        type: 'availability',
        threshold: 0,
        isActive: true,
        message: 'Stok durumu sınırlı',
        createdAt: new Date('2024-01-18')
      }
    ]
  },
  {
    id: 'prod_006',
    name: 'Soğan',
    category: 'Sebze & Meyve',
    unit: 'kg',
    currentPrice: 8.25,
    previousPrice: 9.50,
    trend: 'down',
    trendPercentage: -13.2,
    supplier: 'Konya Tarım Kooperatifi',
    lastUpdate: new Date('2024-01-20'),
    status: 'available',
    quality: 'standard',
    seasonality: {
      inSeason: true,
      peakMonths: ['Ağustos', 'Eylül', 'Ekim']
    },
    priceHistory: [
      { date: new Date('2024-01-15'), price: 9.50, supplier: 'Konya Tarım Kooperatifi' },
      { date: new Date('2024-01-10'), price: 10.75, supplier: 'Konya Tarım Kooperatifi' },
      { date: new Date('2024-01-05'), price: 9.00, supplier: 'Konya Tarım Kooperatifi' }
    ],
    alerts: []
  }
]

export const categories = [
  'Tümü',
  'Et Ürünleri',
  'Sebze & Meyve',
  'Tahıllar',
  'Yağlar',
  'Süt Ürünleri',
  'Baharatlar',
  'Konserveler'
]

export const suppliers = [
  'Tümü',
  'Marmara Et A.Ş.',
  'Beyaz Et Gıda',
  'Antalya Sebze Hal',
  'Samsun Tarım Kooperatifi',
  'Ege Zeytinyağı Üreticileri',
  'Konya Tarım Kooperatifi'
]

export const trendOptions = [
  'Tümü',
  'Artan',
  'Azalan',
  'Sabit'
]