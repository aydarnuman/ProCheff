'use client'

import Link from 'next/link'

export default function DashboardPage() {
  const quickStats = [
    { title: 'İşlenen Şartname', value: '15', change: '+8', icon: '�', color: 'from-blue-500 to-indigo-600' },
    { title: 'Optimizasyon', value: '127', change: '+24', icon: '�', color: 'from-green-500 to-emerald-600' },
    { title: 'Adapte Tarif', value: '89', change: '+19', icon: '🍽️', color: 'from-purple-500 to-pink-600' },
    { title: 'AI Güven', value: '%94', change: '+2.1%', icon: '🤖', color: 'from-orange-500 to-red-600' }
  ]

  const quickActions = [
    { 
      title: '🚀 Otomatik Teklif Paneli', 
      description: 'Şartname → Tarif → Maliyet → Teklif',
      icon: '📊', 
      href: '/proposal-panel',
      color: 'from-blue-600 to-purple-600',
      features: ['Tam Otomasyon', 'AI Entegrasyon', 'Hazır İhale Teklifi'],
      badge: 'YENİ'
    },
    { 
      title: 'Şartname Motoru', 
      description: 'PDF/Word şartname analizi',
      icon: '🧩', 
      href: '/spec-parser',
      color: 'from-blue-500 to-indigo-600',
      features: ['AI Analizi', 'Otomatik Çıkarım', 'Kurum Profili']
    },
    { 
      title: 'Maliyet Simülatörü', 
      description: 'Tedarikçi & kar optimizasyonu',
      icon: '💰', 
      href: '/cost-simulator',
      color: 'from-emerald-500 to-green-600',
      features: ['AI Optimizasyon', 'Tedarikçi Analizi', 'Kar Marjı']
    },
    { 
      title: 'Tarif Adaptörü', 
      description: 'Otomatik tarif ölçeklendirme',
      icon: '🍽️', 
      href: '/recipe-adapter',
      color: 'from-purple-500 to-pink-600',
      features: ['Gramaj Uyumu', 'Beslenme Koruması', 'Menü Oluştur']
    },
    { 
      title: 'Menü Yönetimi', 
      description: 'Geleneksel tarif yönetimi',
      icon: '📝', 
      href: '/menu-management',
      color: 'from-orange-500 to-red-600',
      features: ['247 Tarif', '8 Aktif Plan', '156 Malzeme']
    },
    { 
      title: 'Raporlar', 
      description: 'Analitikler ve performans',
      icon: '📊', 
      href: '/reports',
      color: 'from-cyan-500 to-blue-600',
      features: ['15 Rapor', 'Canlı Analitik', 'Trend Takibi']
    },
    { 
      title: 'AI Ayarları', 
      description: 'Meta-zeka ve ayarlar',
      icon: '🤖', 
      href: '/ai-settings',
      color: 'from-pink-500 to-rose-600',
      features: ['Meta-AI', 'Reflexive AI', 'Context Store']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
              🎯 Teklif Zekâsı Dashboard
            </h1>
            <p className="text-gray-400">AI destekli tender optimizasyon sistemi</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
              <span className="text-green-400 text-sm font-medium">🟢 Tüm Sistemler Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <div className="text-xs text-green-400 font-medium">+{stat.change}</div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className="group relative overflow-hidden rounded-3xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-8 hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer">
              
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
              
              {/* Content */}
              <div className="relative">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {action.icon}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {action.title}
                  </h3>
                  {(action as any).badge && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-semibold animate-pulse">
                      {(action as any).badge}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm mb-4">
                  {action.description}
                </p>

                {/* Features List */}
                <div className="space-y-2">
                  {action.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                      <span className="text-xs text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Arrow Icon */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* System Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System Performance */}
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
          <h3 className="text-white font-bold text-lg mb-6">Sistem Performansı</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">CPU Kullanımı</span>
              <span className="text-green-400 font-semibold">23%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{width: '23%'}}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Bellek Kullanımı</span>
              <span className="text-blue-400 font-semibold">67%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full" style={{width: '67%'}}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Veritabanı</span>
              <span className="text-purple-400 font-semibold">Active</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">AI Servisleri</span>
              <span className="text-green-400 font-semibold">Online</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
          <h3 className="text-white font-bold text-lg mb-6">Son Aktiviteler</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
              <div>
                <div className="text-gray-300 text-sm font-medium">Yeni tarif eklendi</div>
                <div className="text-gray-500 text-xs">Tavuk Çorbası • 15 dk önce</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="text-gray-300 text-sm font-medium">Menü planı güncellendi</div>
                <div className="text-gray-500 text-xs">Haftalık Menü #3 • 2 saat önce</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <div className="text-gray-300 text-sm font-medium">AI önerisi oluşturuldu</div>
                <div className="text-gray-500 text-xs">Sezonluk malzemeler • 1 gün önce</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <div className="text-gray-300 text-sm font-medium">Maliyet raporu hazır</div>
                <div className="text-gray-500 text-xs">Ekim 2024 Raporu • 2 gün önce</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}