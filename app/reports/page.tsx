'use client'

import { useState } from 'react'

export default function ReportsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('month')
  
  const timeframes = [
    { id: 'week', label: 'Bu Hafta', icon: '📅' },
    { id: 'month', label: 'Bu Ay', icon: '🗓️' },
    { id: 'quarter', label: 'Bu Çeyrek', icon: '📊' },
    { id: 'year', label: 'Bu Yıl', icon: '📈' }
  ]

  const reportCategories = [
    {
      id: 'financial',
      title: 'Mali Raporlar',
      icon: '💰',
      gradient: 'from-green-500 to-emerald-600',
      reports: [
        { name: 'Maliyet Analizi', description: 'Tarif ve menü maliyetleri', status: 'ready' },
        { name: 'Kar-Zarar Raporu', description: 'Detaylı finansal analiz', status: 'ready' },
        { name: 'Bütçe Takibi', description: 'Hedef vs gerçekleşen', status: 'processing' },
        { name: 'ROI Analizi', description: 'Yatırım getiri oranları', status: 'ready' }
      ]
    },
    {
      id: 'operational',
      title: 'Operasyonel Raporlar',
      icon: '🔧',
      gradient: 'from-blue-500 to-indigo-600',
      reports: [
        { name: 'Tarif Performansı', description: 'En çok kullanılan tarifler', status: 'ready' },
        { name: 'Stok Durumu', description: 'Malzeme envanter raporu', status: 'ready' },
        { name: 'Üretim Verimliliği', description: 'Zaman ve kaynak analizi', status: 'ready' },
        { name: 'Kalite Kontrolü', description: 'Standart uyumluluk raporu', status: 'scheduled' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analitik Raporlar',
      icon: '📊',
      gradient: 'from-purple-500 to-pink-600',
      reports: [
        { name: 'Trend Analizi', description: 'Sezonluk ve dönemsel trendler', status: 'ready' },
        { name: 'Müşteri Tercihleri', description: 'Popüler menü itemleri', status: 'ready' },
        { name: 'Pazar Analizi', description: 'Rekabet ve konumlama', status: 'processing' },
        { name: 'Tahmin Modelleri', description: 'AI destekli projeksiyonlar', status: 'ready' }
      ]
    },
    {
      id: 'compliance',
      title: 'Uyumluluk Raporları',
      icon: '📋',
      gradient: 'from-orange-500 to-red-500',
      reports: [
        { name: 'HACCP Raporu', description: 'Gıda güvenliği uyumluluk', status: 'ready' },
        { name: 'Hijyen Kontrolü', description: 'Temizlik ve sanitasyon', status: 'ready' },
        { name: 'Alerjen Takibi', description: 'Alerjen madde raporlaması', status: 'ready' },
        { name: 'Yasal Uyumluluk', description: 'Mevzuat uygunluk kontrolleri', status: 'scheduled' }
      ]
    }
  ]

  const quickStats = [
    { title: 'Toplam Rapor', value: '156', change: '+23', color: 'from-blue-500 to-indigo-600' },
    { title: 'Bu Ay Oluşturulan', value: '24', change: '+8', color: 'from-green-500 to-emerald-600' },
    { title: 'Otomatik Raporlar', value: '12', change: '+3', color: 'from-purple-500 to-pink-600' },
    { title: 'Zamanlanmış', value: '8', change: '+2', color: 'from-orange-500 to-red-600' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400 bg-green-500/20'
      case 'processing': return 'text-yellow-400 bg-yellow-500/20'
      case 'scheduled': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Hazır'
      case 'processing': return 'İşleniyor'
      case 'scheduled': return 'Zamanlandı'
      default: return 'Bilinmiyor'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
              Raporlar & Analitikler
            </h1>
            <p className="text-gray-400">Tüm raporlarınızı ve analizlerinizi tek yerden yönetin</p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex bg-gray-800/50 rounded-2xl p-1">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300
                  ${selectedTimeframe === timeframe.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                <span>{timeframe.icon}</span>
                <span className="text-sm font-medium">{timeframe.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-4"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10`}></div>
            <div className="relative text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400 mb-2">{stat.title}</div>
              <div className="text-xs text-green-400 font-medium">+{stat.change} bu ay</div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {reportCategories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden"
          >
            
            {/* Category Header */}
            <div className={`bg-gradient-to-r ${category.gradient} p-6 text-white`}>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{category.icon}</div>
                <div>
                  <h3 className="text-xl font-bold">{category.title}</h3>
                  <p className="text-white/80 text-sm">{category.reports.length} rapor mevcut</p>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="p-6 space-y-4">
              {category.reports.map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-700/30 hover:bg-gray-600/40 rounded-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{report.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{report.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 hover:text-green-300 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Generate All Button */}
              <button className={`
                w-full p-4 mt-4 rounded-xl bg-gradient-to-r ${category.gradient} 
                text-white font-medium hover:opacity-90 transition-opacity duration-300
                flex items-center justify-center space-x-2
              `}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Tüm Raporları Oluştur</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled Reports */}
      <div className="mt-8 bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-6">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
          <span>🕒</span>
          <span>Zamanlanmış Raporlar</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Haftalık Özet</span>
              <span className="text-xs text-blue-400">Her Pazartesi</span>
            </div>
            <p className="text-gray-400 text-sm">Haftalık performans raporu</p>
          </div>
          
          <div className="p-4 bg-gray-700/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Aylık Mali Rapor</span>
              <span className="text-xs text-green-400">Ayın 1'i</span>
            </div>
            <p className="text-gray-400 text-sm">Detaylı finansal analiz</p>
          </div>
          
          <div className="p-4 bg-gray-700/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Çeyreklik Trend</span>
              <span className="text-xs text-purple-400">Her 3 ayda</span>
            </div>
            <p className="text-gray-400 text-sm">Trend ve pazar analizi</p>
          </div>
        </div>
      </div>
    </div>
  )
}