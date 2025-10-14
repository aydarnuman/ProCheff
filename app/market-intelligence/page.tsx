'use client'

import { useState, useEffect } from 'react'
import { MarketPrice, MarketDataSummary, TrendAnalysis } from '@/lib/services/marketDataService'
import { GeminiPrediction, MarketTrendReport } from '@/lib/services/geminiTrendAnalyzer'

interface PriceChartProps {
  prices: MarketPrice[]
  selectedCategory: string
}

function PriceChart({ prices, selectedCategory }: PriceChartProps) {
  const filteredPrices = selectedCategory === 'all' 
    ? prices 
    : prices.filter(p => p.category === selectedCategory)

  return (
    <div className="p-6 rounded-lg border" 
         style={{ 
           backgroundColor: 'var(--bg-secondary)', 
           borderColor: 'var(--border-primary)' 
         }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          📊 Fiyat Trendi
        </h3>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {filteredPrices.length} ürün
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredPrices.slice(0, 10).map((price, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded" 
               style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full`} 
                   style={{ 
                     backgroundColor: price.trend === 'up' ? 'var(--status-success)' : 
                                    price.trend === 'down' ? 'var(--status-error)' : 'var(--text-muted)'
                   }} />
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{price.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{price.city} • {price.unit}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                ₺{price.avgPrice.toFixed(2)}
              </p>
              <p className="text-xs font-medium" 
                 style={{ 
                   color: price.changePercent > 0 ? 'var(--status-error)' : 
                          price.changePercent < 0 ? 'var(--status-success)' : 'var(--text-muted)'
                 }}>
                {price.changePercent > 0 ? '+' : ''}{price.changePercent.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface MarketSummaryCardProps {
  summary: MarketDataSummary
}

function MarketSummaryCard({ summary }: MarketSummaryCardProps) {
  const getVolatilityColor = (volatility: string) => {
    switch(volatility) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getVolatilityIcon = (volatility: string) => {
    switch(volatility) {
      case 'high': return '🔥'
      case 'medium': return '⚠️'
      case 'low': return '✅'
      default: return '📊'
    }
  }

  return (
    <div className="p-6 rounded-lg border" 
         style={{ 
           backgroundColor: 'var(--bg-primary)', 
           borderColor: 'var(--border-primary)' 
         }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>📈 Piyasa Özeti</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg" 
             style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{summary.totalProducts}</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Toplam Ürün</p>
        </div>
        
        <div className="text-center p-4 rounded-lg" 
             style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{summary.dataFreshness} gün</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Veri Tazeliği</p>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${getVolatilityColor(summary.priceVolatility)}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{getVolatilityIcon(summary.priceVolatility)}</span>
          <div>
            <p className="font-semibold">Piyasa Volatilitesi: {summary.priceVolatility.toUpperCase()}</p>
            <p className="text-sm opacity-80">
              {summary.priceVolatility === 'high' && 'Yüksek fiyat dalgalanması - Dikkatli olun!'}
              {summary.priceVolatility === 'medium' && 'Orta düzey dalgalanma - İzlemeye devam edin'}
              {summary.priceVolatility === 'low' && 'Düşük dalgalanma - Stabil piyasa'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Kategori Analizi</h4>
        <div className="space-y-2">
          {summary.categories.map((cat, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded" 
                 style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {cat.category === 'sebze' && '🥕'}
                  {cat.category === 'meyve' && '🍎'}
                  {cat.category === 'et' && '🥩'}
                  {cat.category === 'süt-ürünleri' && '🥛'}
                  {cat.category === 'tahıl' && '🌾'}
                </span>
                <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{cat.category}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({cat.productCount} ürün)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium"
                      style={{ 
                        color: cat.trend === 'up' ? 'var(--status-success)' : 
                               cat.trend === 'down' ? 'var(--status-error)' : 'var(--text-muted)'
                      }}>
                  {cat.trend === 'up' && '↗️'}
                  {cat.trend === 'down' && '↘️'}
                  {cat.trend === 'stable' && '→'}
                </span>
                <span className="text-sm font-medium"
                      style={{ 
                        color: cat.avgPriceChange > 0 ? 'var(--status-success)' : 
                               cat.avgPriceChange < 0 ? 'var(--status-error)' : 'var(--text-muted)'
                      }}>
                  {cat.avgPriceChange > 0 ? '+' : ''}{cat.avgPriceChange.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface TrendAnalysisCardProps {
  analysis: TrendAnalysis | null
  productName: string
  onProductSearch: (name: string) => void
}

function TrendAnalysisCard({ analysis, productName, onProductSearch }: TrendAnalysisCardProps) {
  const [searchInput, setSearchInput] = useState(productName)

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'high': return { color: 'var(--status-error)', backgroundColor: 'var(--status-error-bg)', borderColor: 'var(--status-error)' }
      case 'medium': return { color: 'var(--status-warning)', backgroundColor: 'var(--status-warning-bg)', borderColor: 'var(--status-warning)' }
      case 'low': return { color: 'var(--status-success)', backgroundColor: 'var(--status-success-bg)', borderColor: 'var(--status-success)' }
      default: return { color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }
    }
  }

  return (
    <div className="p-6 rounded-lg border" 
         style={{ 
           backgroundColor: 'var(--bg-primary)', 
           borderColor: 'var(--border-primary)' 
         }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>🎯 Trend Analizi</h3>
      
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ürün adı girin (örn: domates)"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-primary)'
            }}
          />
          <button
            onClick={() => onProductSearch(searchInput)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Ara
          </button>
        </div>
      </div>

      {analysis ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">{analysis.productName}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Haftalık Değişim</p>
                <p className={`font-semibold ${
                  analysis.weeklyChange > 0 ? 'text-red-600' : 
                  analysis.weeklyChange < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {analysis.weeklyChange > 0 ? '+' : ''}{analysis.weeklyChange.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-600">Aylık Tahmini</p>
                <p className={`font-semibold ${
                  analysis.monthlyChange > 0 ? 'text-red-600' : 
                  analysis.monthlyChange < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {analysis.monthlyChange > 0 ? '+' : ''}{analysis.monthlyChange.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={getRiskColor(analysis.riskLevel)}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">
                {analysis.riskLevel === 'high' && '🔴'}
                {analysis.riskLevel === 'medium' && '🟡'}
                {analysis.riskLevel === 'low' && '🟢'}
              </span>
              <span className="font-semibold">Risk Seviyesi: {analysis.riskLevel.toUpperCase()}</span>
            </div>
            <p className="text-sm opacity-90">{analysis.recommendation}</p>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Güven Skoru</span>
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                {Math.round(analysis.confidenceScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analysis.confidenceScore * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>Ürün arayarak trend analizi başlatın</p>
        </div>
      )}
    </div>
  )
}

interface GeminiPredictionsCardProps {
  predictions: GeminiPrediction[]
  isLoading: boolean
  onRefresh: () => void
}

function GeminiPredictionsCard({ predictions, isLoading, onRefresh }: GeminiPredictionsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🧠 Gemini AI Tahminleri</h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? '🔄' : '⚡'}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">AI analiz yapıyor...</p>
        </div>
      ) : predictions.length > 0 ? (
        <div className="space-y-4">
          {predictions.slice(0, 5).map((pred, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">{pred.productName}</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pred.riskAssessment.level === 'high' ? 'bg-red-100 text-red-700' :
                    pred.riskAssessment.level === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {pred.riskAssessment.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    %{Math.round(pred.confidence * 100)} güven
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Güncel Fiyat</p>
                  <p className="font-semibold text-lg">₺{pred.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">1 Hafta Tahmini</p>
                  <p className={`font-semibold text-lg ${
                    pred.priceChange.oneWeek > 0 ? 'text-red-600' : 
                    pred.priceChange.oneWeek < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    ₺{pred.predictedPrice.oneWeek.toFixed(2)}
                    <span className="text-sm ml-1">
                      ({pred.priceChange.oneWeek > 0 ? '+' : ''}{pred.priceChange.oneWeek.toFixed(1)}%)
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">AI Önerisi:</p>
                <p className="text-sm text-gray-600">{pred.recommendation.reasoning}</p>
                {pred.recommendation.marginAdjustment !== 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      pred.recommendation.action === 'increase' ? 'bg-red-100 text-red-700' :
                      pred.recommendation.action === 'decrease' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {pred.recommendation.action === 'increase' && '📈 ARTIR'}
                      {pred.recommendation.action === 'decrease' && '📉 AZALT'}
                      {pred.recommendation.action === 'maintain' && '➡️ KORUT'}
                    </span>
                    <span className="text-sm font-medium">
                      {pred.recommendation.marginAdjustment > 0 ? '+' : ''}₺{pred.recommendation.marginAdjustment.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Mevsimsel:</span>
                  <p className="text-gray-700">{pred.factors.seasonal}</p>
                </div>
                <div>
                  <span className="text-gray-500">Ekonomik:</span>
                  <p className="text-gray-700">{pred.factors.economic}</p>
                </div>
                <div>
                  <span className="text-gray-500">Arz:</span>
                  <p className="text-gray-700">{pred.factors.supply}</p>
                </div>
                <div>
                  <span className="text-gray-500">Talep:</span>
                  <p className="text-gray-700">{pred.factors.demand}</p>
                </div>
              </div>
            </div>
          ))}
          
          {predictions.length > 5 && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">
                +{predictions.length - 5} ürün daha analiz edildi
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🤖</div>
          <p>AI tahmin verisi bulunamadı</p>
          <button
            onClick={onRefresh}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
          >
            Tekrar Dene
          </button>
        </div>
      )}
    </div>
  )
}

export default function MarketIntelligencePage() {
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [summary, setSummary] = useState<MarketDataSummary | null>(null)
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Gemini AI states
  const [geminiPredictions, setGeminiPredictions] = useState<GeminiPrediction[]>([])
  const [isGeminiLoading, setIsGeminiLoading] = useState(false)
  const [geminiError, setGeminiError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Mock data için - gerçek API bağlandığında kaldırılacak
  const mockPrices: MarketPrice[] = [
    {
      name: 'Domates',
      category: 'sebze',
      unit: 'kg',
      minPrice: 8.5,
      maxPrice: 12.0,
      avgPrice: 10.25,
      city: 'Istanbul',
      date: '2024-10-14',
      source: 'hal',
      trend: 'up',
      changePercent: 3.2,
      freshness: 1
    },
    {
      name: 'Patates',
      category: 'sebze',
      unit: 'kg',
      minPrice: 6.0,
      maxPrice: 8.5,
      avgPrice: 7.25,
      city: 'Istanbul',
      date: '2024-10-14',
      source: 'hal',
      trend: 'stable',
      changePercent: 0.1,
      freshness: 1
    },
    {
      name: 'Elma',
      category: 'meyve',
      unit: 'kg',
      minPrice: 15.0,
      maxPrice: 22.0,
      avgPrice: 18.5,
      city: 'Ankara',
      date: '2024-10-13',
      source: 'hal',
      trend: 'down',
      changePercent: -2.1,
      freshness: 2
    }
  ]

  const mockSummary: MarketDataSummary = {
    totalProducts: 156,
    categories: [
      { category: 'sebze', productCount: 64, avgPriceChange: 2.3, trend: 'up' },
      { category: 'meyve', productCount: 42, avgPriceChange: -0.8, trend: 'down' },
      { category: 'et', productCount: 28, avgPriceChange: 4.1, trend: 'up' },
      { category: 'süt-ürünleri', productCount: 15, avgPriceChange: 1.2, trend: 'stable' },
      { category: 'tahıl', productCount: 7, avgPriceChange: 0.5, trend: 'stable' }
    ],
    lastUpdate: new Date().toISOString(),
    dataFreshness: 1,
    priceVolatility: 'medium'
  }

  useEffect(() => {
    loadMarketData()
  }, [])

  const loadGeminiAnalysis = async (marketPrices: MarketPrice[]) => {
    setIsGeminiLoading(true)
    setGeminiError('')

    try {
      // Mock Gemini predictions - gerçek API'ye bağlandığında değişecek
      await new Promise(resolve => setTimeout(resolve, 2000)) // AI analiz simülasyonu
      
      const mockGeminiPredictions: GeminiPrediction[] = marketPrices.slice(0, 5).map(price => ({
        productName: price.name,
        currentPrice: price.avgPrice,
        predictedPrice: {
          oneWeek: price.avgPrice * (1 + (Math.random() - 0.5) * 0.1),
          twoWeeks: price.avgPrice * (1 + (Math.random() - 0.5) * 0.15),
          oneMonth: price.avgPrice * (1 + (Math.random() - 0.5) * 0.25)
        },
        priceChange: {
          oneWeek: (Math.random() - 0.5) * 10,
          twoWeeks: (Math.random() - 0.5) * 15,
          oneMonth: (Math.random() - 0.5) * 25
        },
        confidence: 0.7 + Math.random() * 0.25,
        factors: {
          seasonal: 'Sonbahar mevsimi etkisi',
          economic: 'Enflasyonist ortam',
          supply: 'Stabil arz koşulları',
          demand: 'Orta seviye talep'
        },
        riskAssessment: {
          level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          score: Math.floor(Math.random() * 100),
          reasoning: 'AI risk değerlendirmesi'
        },
        recommendation: {
          action: ['increase', 'decrease', 'maintain'][Math.floor(Math.random() * 3)] as 'increase' | 'decrease' | 'maintain',
          marginAdjustment: (Math.random() - 0.5) * 2,
          reasoning: 'Piyasa trendlerine göre otomatik öneri'
        }
      }))

      setGeminiPredictions(mockGeminiPredictions)

      // Gerçek Gemini API kodu:
      // const { geminiTrendAnalyzer } = await import('@/lib/services/geminiTrendAnalyzer')
      // const trendReport = await geminiTrendAnalyzer.analyzeTrends(marketPrices)
      // setGeminiPredictions(trendReport.predictions)
      
    } catch (err) {
      setGeminiError(`Gemini AI analizi başarısız: ${err}`)
      console.error('Gemini analysis error:', err)
    } finally {
      setIsGeminiLoading(false)
    }
  }

  const loadMarketData = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Mock data kullan - gerçek API'ye bağlandığında değişecek
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simülasyon
      
      setPrices(mockPrices)
      setSummary(mockSummary)
      setLastUpdate(new Date())

      // Gemini AI analizi başlat
      loadGeminiAnalysis(mockPrices)

      // Gerçek API kodu:
      // const { marketDataService } = await import('@/lib/services/marketDataService')
      // const [pricesData, summaryData] = await Promise.all([
      //   marketDataService.getAllMarketPrices(),
      //   marketDataService.getMarketSummary()
      // ])
      // setPrices(pricesData)
      // setSummary(summaryData)
      // loadGeminiAnalysis(pricesData)
      
    } catch (err) {
      setError(`Piyasa verileri yüklenirken hata: ${err}`)
      console.error('Market data error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductSearch = async (productName: string) => {
    if (!productName.trim()) return

    try {
      setError('')
      
      // Mock trend analysis
      const mockAnalysis: TrendAnalysis = {
        productName: productName,
        weeklyChange: Math.random() * 10 - 5, // -5 ile +5 arası
        monthlyChange: Math.random() * 20 - 10,
        volatilityScore: Math.random() * 20,
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        recommendation: 'Bu ürün için piyasa stabil görünüyor. Mevcut fiyatlandırmanızı koruyabilirsiniz.',
        confidenceScore: 0.75 + Math.random() * 0.25
      }
      
      setAnalysis(mockAnalysis)

      // Gerçek API kodu:
      // const { marketDataService } = await import('@/lib/services/marketDataService')
      // const analysisData = await marketDataService.getProductTrend(productName)
      // setAnalysis(analysisData)
      
    } catch (err) {
      setError(`"${productName}" ürünü için trend analizi yapılamadı: ${err}`)
      console.error('Product trend error:', err)
    }
  }

  const refreshData = () => {
    loadMarketData()
    setAnalysis(null)
  }

  const refreshGeminiAnalysis = () => {
    if (prices.length > 0) {
      loadGeminiAnalysis(prices)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
               style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Piyasa verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="shadow-sm border-b" 
           style={{ 
             backgroundColor: 'var(--bg-secondary)', 
             borderColor: 'var(--border-primary)' 
           }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                📊 Piyasa Trend Zekâsı
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Güncel hal fiyatları ve trend analizleri
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                </div>
              )}
              <button
                onClick={refreshData}
                className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                style={{ 
                  backgroundColor: 'var(--accent-primary)', 
                  color: 'white' 
                }}
              >
                🔄 Yenile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="border-l-4 p-4 mx-4 mt-4" 
             style={{ 
               backgroundColor: 'var(--bg-secondary)', 
               borderColor: 'var(--status-error)' 
             }}>
          <p style={{ color: 'var(--status-error)' }}>{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-8">
          {/* Left Column - Summary */}
          <div className="space-y-6">
            {summary && <MarketSummaryCard summary={summary} />}
          </div>

          {/* Middle Column - Price Chart */}
          <div className="space-y-6">
            <div className="p-4 rounded-lg border" 
                 style={{ 
                   backgroundColor: 'var(--bg-primary)', 
                   borderColor: 'var(--border-primary)' 
                 }}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Kategori Filtresi
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="sebze">🥕 Sebze</option>
                <option value="meyve">🍎 Meyve</option>
                <option value="et">🥩 Et</option>
                <option value="süt-ürünleri">🥛 Süt Ürünleri</option>
                <option value="tahıl">🌾 Tahıl</option>
              </select>
            </div>
            
            <PriceChart prices={prices} selectedCategory={selectedCategory} />
          </div>

          {/* Right Column - Trend Analysis */}
          <div className="space-y-6">
            <TrendAnalysisCard 
              analysis={analysis}
              productName=""
              onProductSearch={handleProductSearch}
            />
          </div>

          {/* Fourth Column - Gemini AI Predictions (XL screens only) */}
          <div className="space-y-6 xl:block lg:hidden">
            <GeminiPredictionsCard 
              predictions={geminiPredictions}
              isLoading={isGeminiLoading}
              onRefresh={refreshGeminiAnalysis}
            />
          </div>
        </div>
      </div>
    </div>
  )
}