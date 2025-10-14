'use client'

import { useState, useEffect } from 'react'
import { SpecificationDatabaseClient, DatabaseStats } from '@/lib/services/specificationDatabaseClient'

export default function SpecDatabasePage() {
  const [database] = useState(new SpecificationDatabaseClient())
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const statistics = await database.getStatistics()
      setStats(statistics)
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Veritabanı istatistikleri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🗄️ Şartname Veritabanı
          </h1>
          <p className="text-lg text-gray-600">
            AI destekli kurum profili analizi ve benzerlik veritabanı
          </p>
        </div>

        {stats ? (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">📊</div>
                  <div className="text-xs text-blue-600 font-medium">TOPLAM</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalRecords}</div>
                <div className="text-sm text-gray-500">Kayıtlı Şartname</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">👥</div>
                  <div className="text-xs text-green-600 font-medium">ORTALAMA</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {Math.round(stats.averagePersonCount)}
                </div>
                <div className="text-sm text-gray-500">Kişi Sayısı</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">📍</div>
                  <div className="text-xs text-purple-600 font-medium">BÖLGE</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {Object.keys(stats.byRegion).length}
                </div>
                <div className="text-sm text-gray-500">Farklı Şehir</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">🏢</div>
                  <div className="text-xs text-orange-600 font-medium">TİP</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {Object.keys(stats.byInstitutionType).length}
                </div>
                <div className="text-sm text-gray-500">Kurum Tipi</div>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              {/* Region Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">📍 Bölge Dağılımı</h3>
                
                {Object.keys(stats.byRegion).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(stats.byRegion)
                      .sort(([,a], [,b]) => b - a)
                      .map(([region, count]) => {
                        const percentage = (count / stats.totalRecords) * 100
                        return (
                          <div key={region} className="relative">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">{region}</span>
                              <span className="text-sm text-gray-500">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🌍</div>
                    <p>Henüz bölge verisi yok</p>
                  </div>
                )}
              </div>

              {/* Institution Type Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">🏢 Kurum Tipi Dağılımı</h3>
                
                {Object.keys(stats.byInstitutionType).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(stats.byInstitutionType)
                      .sort(([,a], [,b]) => b - a)
                      .map(([type, count]) => {
                        const percentage = (count / stats.totalRecords) * 100
                        const getTypeIcon = (type: string) => {
                          switch(type.toLowerCase()) {
                            case 'üniversite': return '🎓'
                            case 'myo': return '🎯'
                            case 'hastane': return '🏥'
                            case 'okul': return '🏫'
                            default: return '🏢'
                          }
                        }
                        
                        return (
                          <div key={type} className="relative">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <span>{getTypeIcon(type)}</span>
                                <span className="text-sm font-medium text-gray-700">{type}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🏢</div>
                    <p>Henüz kurum tipi verisi yok</p>
                  </div>
                )}
              </div>
            </div>

            {/* Latest Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">📅 Son Aktivite</h3>
              
              {stats.latestUpload ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="font-medium text-gray-900">Son Şartname Yüklendi</p>
                      <p className="text-sm text-gray-500">
                        {stats.latestUpload.toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-blue-600 text-2xl">✨</div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">⏰</div>
                  <p>Henüz aktivite yok</p>
                  <p className="text-sm">İlk şartname analizini yapın</p>
                </div>
              )}
            </div>

            {/* AI Features */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-semibold mb-4 text-purple-900 flex items-center gap-2">
                🤖 AI Veritabanı Özellikleri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🔍</div>
                  <h4 className="font-semibold text-purple-800 mb-1">Benzerlik Analizi</h4>
                  <p className="text-sm text-purple-600">
                    Cosine similarity ile gramaj ve gereksinim vektörlerini karşılaştırır
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-2">🧠</div>
                  <h4 className="font-semibold text-purple-800 mb-1">Claude AI Integration</h4>
                  <p className="text-sm text-purple-600">
                    Her yeni profil için akıllı öneriler ve risk analizi
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <h4 className="font-semibold text-purple-800 mb-1">Öğrenen Sistem</h4>
                  <p className="text-sm text-purple-600">
                    Her analiz ile güven skoru artar ve tahminler gelişir
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/50 rounded-lg">
                <p className="text-sm text-purple-700 flex items-start gap-2">
                  <span className="text-purple-500 mt-1">💡</span>
                  <span>
                    <strong>Nasıl Çalışır:</strong> Yeni bir şartname yüklendiğinde sistem otomatik olarak 
                    gramaj profilini, kurum tipini ve gereksinimleri analiz eder. Daha sonra mevcut 
                    veritabanındaki benzer profilleri bulur ve %80+ benzerlik oranında öneriler sunar.
                  </span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Veritabanı Boş</h3>
            <p className="text-gray-600 mb-6">
              Henüz şartname analizi yapılmamış. İlk analizi başlatmak için şartname yükleyin.
            </p>
            <a 
              href="/spec-parser" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📄 Şartname Yükle
            </a>
          </div>
        )}
        
        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadStatistics}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            🔄 İstatistikleri Yenile
          </button>
        </div>
      </div>
    </div>
  )
}