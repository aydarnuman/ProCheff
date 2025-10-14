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
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
            <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{analysis.productName}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p style={{ color: 'var(--text-muted)' }}>Haftalık Değişim</p>
                <p className="font-semibold" style={{ 
                  color: analysis.weeklyChange > 0 ? 'var(--status-error)' : 
                         analysis.weeklyChange < 0 ? 'var(--status-success)' : 'var(--text-muted)'
                }}>
                  {analysis.weeklyChange > 0 ? '+' : ''}{analysis.weeklyChange.toFixed(1)}%
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)' }}>Aylık Tahmini</p>
                <p className="font-semibold" style={{
                  color: analysis.monthlyChange > 0 ? 'var(--status-error)' : 
                         analysis.monthlyChange < 0 ? 'var(--status-success)' : 'var(--text-muted)'
                }}>
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
    <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>🧠 Gemini AI Tahminleri</h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-secondary)' }}
        >
          {isLoading ? '🔄' : '⚡'}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" 
               style={{ borderColor: 'var(--accent-secondary)' }}></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI analiz yapıyor...</p>
        </div>
      ) : predictions.length > 0 ? (
        <div className="space-y-4">
          {predictions.slice(0, 5).map((pred, index) => (
            <div key={index} className="rounded-lg p-4" 
                 style={{ 
                   border: `1px solid var(--border-secondary)`,
                   backgroundColor: 'var(--bg-tertiary)'
                 }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{pred.productName}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: pred.riskAssessment.level === 'high' ? 'var(--status-error-bg)' :
                                          pred.riskAssessment.level === 'medium' ? 'var(--status-warning-bg)' :
                                          'var(--status-success-bg)',
                          color: pred.riskAssessment.level === 'high' ? 'var(--status-error)' :
                                 pred.riskAssessment.level === 'medium' ? 'var(--status-warning)' :
                                 'var(--status-success)'
                        }}>
                    {pred.riskAssessment.level.toUpperCase()}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    %{Math.round(pred.confidence * 100)} güven
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Güncel Fiyat</p>
                  <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>₺{pred.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>1 Hafta Tahmini</p>
                  <p className="font-semibold text-lg" style={{
                    color: pred.priceChange.oneWeek > 0 ? 'var(--status-error)' : 
                           pred.priceChange.oneWeek < 0 ? 'var(--status-success)' : 'var(--text-muted)'
                  }}>
                    ₺{pred.predictedPrice.oneWeek.toFixed(2)}
                    <span className="text-sm ml-1">
                      ({pred.priceChange.oneWeek > 0 ? '+' : ''}{pred.priceChange.oneWeek.toFixed(1)}%)
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>AI Önerisi:</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{pred.recommendation.reasoning}</p>
                {pred.recommendation.marginAdjustment !== 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: pred.recommendation.action === 'increase' ? 'var(--status-error-bg)' :
                                            pred.recommendation.action === 'decrease' ? 'var(--status-success-bg)' :
                                            'var(--bg-secondary)',
                            color: pred.recommendation.action === 'increase' ? 'var(--status-error)' :
                                   pred.recommendation.action === 'decrease' ? 'var(--status-success)' :
                                   'var(--text-secondary)'
                          }}>
                      {pred.recommendation.action === 'increase' && '📈 ARTIR'}
                      {pred.recommendation.action === 'decrease' && '📉 AZALT'}
                      {pred.recommendation.action === 'maintain' && '➡️ KORUT'}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {pred.recommendation.marginAdjustment > 0 ? '+' : ''}₺{pred.recommendation.marginAdjustment.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Mevsimsel:</span>
                  <p style={{ color: 'var(--text-secondary)' }}>{pred.factors.seasonal}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Ekonomik:</span>
                  <p style={{ color: 'var(--text-secondary)' }}>{pred.factors.economic}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Arz:</span>
                  <p style={{ color: 'var(--text-secondary)' }}>{pred.factors.supply}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Talep:</span>
                  <p style={{ color: 'var(--text-secondary)' }}>{pred.factors.demand}</p>
                </div>
              </div>
            </div>
          ))}
          
          {predictions.length > 5 && (
            <div className="text-center py-2">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                +{predictions.length - 5} ürün daha analiz edildi
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-2">🤖</div>
          <p>AI tahmin verisi bulunamadı</p>
          <button
            onClick={onRefresh}
            className="mt-2 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent-secondary)' }}
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



  useEffect(() => {
    loadMarketData()
  }, [])

  const loadGeminiAnalysis = async (marketPrices: MarketPrice[]) => {
    setIsGeminiLoading(true)
    setGeminiError('')

    try {
      // Gerçekçi AI analiz simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const { generateRealisticGeminiPredictions } = await import('@/lib/services/realisticMarketData')
      const realisticPredictions = generateRealisticGeminiPredictions(marketPrices)

      setGeminiPredictions(realisticPredictions)

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
      // Gerçekçi veri simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Gerçekçi market verilerini dinamik olarak yükle
      const { realisticMarketPrices, realisticMarketSummary } = await import('@/lib/services/realisticMarketData')
      
      setPrices(realisticMarketPrices)
      setSummary(realisticMarketSummary)
      setLastUpdate(new Date())

      // Gemini AI analizi başlat
      loadGeminiAnalysis(realisticMarketPrices)

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
      
      // Gerçekçi trend analizi
      const { generateRealisticTrendAnalysis } = await import('@/lib/services/realisticMarketData')
      const realisticAnalysis = generateRealisticTrendAnalysis(productName)
      
      setAnalysis(realisticAnalysis)

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