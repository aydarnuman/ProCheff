'use client'

import { useState } from 'react'
import { BaseCard } from '@/app/components/ui/Card'
import { FileText, Calendar, BarChart3, DollarSign, Settings, TrendingUp } from 'lucide-react'

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
      case 'ready': return { color: 'var(--status-success)', backgroundColor: 'var(--status-success-bg)' }
      case 'processing': return { color: 'var(--status-warning)', backgroundColor: 'var(--status-warning-bg)' }
      case 'scheduled': return { color: 'var(--accent-primary)', backgroundColor: 'var(--bg-accent-subtle)' }
      default: return { color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }
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
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <BaseCard className="mb-8 p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                 style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
              <BarChart3 size={32} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Raporlar & Analitikler
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Tüm raporlarınızı ve analizlerinizi tek yerden yönetin
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <TrendingUp size={14} />
                <span>Gerçek zamanlı veriler • AI destekli analizler • Otomatik raporlama</span>
              </div>
            </div>
          </div>
          
          {/* Timeframe Selector */}
          <BaseCard className="p-2">
            <div className="flex gap-1">
              {timeframes.map((timeframe) => {
                const getTimeIcon = (iconName: string) => {
                  switch(iconName) {
                    case '📅': return <Calendar size={16} />
                    case '🗓️': return <Calendar size={16} />
                    case '📊': return <BarChart3 size={16} />
                    case '📈': return <TrendingUp size={16} />
                    default: return <Calendar size={16} />
                  }
                }
                
                return (
                  <button
                    key={timeframe.id}
                    onClick={() => setSelectedTimeframe(timeframe.id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                    style={{
                      backgroundColor: selectedTimeframe === timeframe.id ? 'var(--bg-accent-primary)' : 'transparent',
                      color: selectedTimeframe === timeframe.id ? 'var(--text-on-accent)' : 'var(--text-secondary)'
                    }}
                  >
                    {getTimeIcon(timeframe.icon)}
                    <span className="text-sm">{timeframe.label}</span>
                  </button>
                )
              })}
            </div>
          </BaseCard>
        </div>
      </BaseCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <BaseCard
            key={index}
            className="relative overflow-hidden p-4"
          >
            <div className="absolute inset-0 opacity-10"
                 style={{ 
                   background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))` 
                 }}></div>
            <div className="relative text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{stat.title}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--status-success)' }}>+{stat.change} bu ay</div>
            </div>
          </BaseCard>
        ))}
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {reportCategories.map((category) => (
          <BaseCard
            key={category.id}
            className="overflow-hidden"
          >
            
            {/* Category Header */}
            <div className="p-6" 
                 style={{ 
                   background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))` 
                 }}>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{category.icon}</div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-on-accent)' }}>{category.title}</h3>
                  <p className="text-sm opacity-80" style={{ color: 'var(--text-on-accent)' }}>{category.reports.length} rapor mevcut</p>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="p-6 space-y-4">
              {category.reports.map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 group cursor-pointer hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    border: `1px solid var(--border-secondary)`
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{report.name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full" style={getStatusColor(report.status)}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{report.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 rounded-lg transition-colors hover:opacity-80"
                            style={{ 
                              backgroundColor: 'var(--bg-accent-subtle)', 
                              color: 'var(--accent-primary)' 
                            }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button className="p-2 rounded-lg transition-colors hover:opacity-80"
                            style={{ 
                              backgroundColor: 'var(--status-success-bg)', 
                              color: 'var(--status-success)' 
                            }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Generate All Button */}
              <button className="w-full p-4 mt-4 rounded-xl font-medium hover:opacity-90 transition-opacity duration-300 flex items-center justify-center space-x-2"
                      style={{ 
                        background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
                        color: 'var(--text-on-accent)'
                      }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Tüm Raporları Oluştur</span>
              </button>
            </div>
          </BaseCard>
        ))}
      </div>

      {/* Scheduled Reports */}
      <BaseCard className="mt-8 p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
          <span>🕒</span>
          <span>Zamanlanmış Raporlar</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Haftalık Özet</span>
              <span className="text-xs" style={{ color: 'var(--accent-primary)' }}>Her Pazartesi</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Haftalık performans raporu</p>
          </div>
          
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Aylık Mali Rapor</span>
              <span className="text-xs" style={{ color: 'var(--status-success)' }}>Ayın 1'i</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Detaylı finansal analiz</p>
          </div>
          
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Çeyreklik Trend</span>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>Her 3 ayda</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Trend ve pazar analizi</p>
          </div>
        </div>
      </BaseCard>
    </div>
  )
}