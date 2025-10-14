'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, Zap, Target } from 'lucide-react'

export default function DashboardPage() {
  const quickStats = [
    { title: 'İşlenen Şartname', value: '15', change: '+8', icon: '📄', trend: 'up' },
    { title: 'Optimizasyon Oranı', value: '%94', change: '+2.1%', icon: '⚡', trend: 'up' },
    { title: 'Adapte Tarif', value: '89', change: '+19', icon: '🍽️', trend: 'up' },
    { title: 'AI Güven Skoru', value: '%96', change: '+1.2%', icon: '🤖', trend: 'up' }
  ]

  const workflowSteps = [
    { 
      title: 'Otomatik Teklif Paneli', 
      description: 'Şartname → Tarif → Maliyet → Teklif sürecini otomatikleştirin',
      icon: '🚀', 
      href: '/proposal-panel',
      isNew: true,
      priority: 'high',
      workflowNext: 'Şartname Analizi'
    },
    { 
      title: 'Şartname Analizi', 
      description: 'PDF/Word şartnamelerini AI ile analiz edin',
      icon: '📋', 
      href: '/spec-parser',
      priority: 'high',
      workflowNext: 'Tarif Adaptörü'
    },
    { 
      title: 'Tarif Adaptörü', 
      description: 'Tarifleri şartname gereksinimlerine göre uyarlayın',
      icon: '🍽️', 
      href: '/recipe-adapter',
      priority: 'medium',
      workflowNext: 'Maliyet Simülasyonu'
    },
    { 
      title: 'Maliyet Simülasyonu', 
      description: 'Tedarikçi analizi ve kar optimizasyonu',
      icon: '💰', 
      href: '/cost-simulator',
      priority: 'medium',
      workflowNext: 'Teklif Hazırlama'
    }
  ]

  const dataModules = [
    { 
      title: 'Şartname Veritabanı', 
      description: 'Geçmiş şartnameler ve benzerlik analizi',
      icon: '🗄️', 
      href: '/spec-database',
      stats: '247 Şartname'
    },
    { 
      title: 'Piyasa Trend Zekâsı', 
      description: 'AI destekli piyasa analizi ve tahminleri',
      icon: '📈', 
      href: '/market-intelligence',
      isNew: true,
      stats: 'Gemini AI'
    }
  ]

  const managementTools = [
    { 
      title: 'Menü Yönetimi', 
      description: 'Tarif kütüphanesi ve menü planlama',
      icon: '📝', 
      href: '/menu-management',
      stats: '156 Tarif'
    },
    { 
      title: 'Raporlar', 
      description: 'Performans analizi ve trend raporları',
      icon: '📊', 
      href: '/reports',
      stats: '15 Rapor'
    },
    { 
      title: 'AI Ayarları', 
      description: 'Meta-AI konfigürasyon ve optimizasyon',
      icon: '⚙️', 
      href: '/ai-settings',
      stats: '4 Model'
    }
  ]

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              🎯 Teklif Zekâsı Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              AI destekli tender optimizasyon sistemi
            </p>
          </div>
          
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl" 
               style={{ backgroundColor: 'var(--bg-success-subtle)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" 
                 style={{ backgroundColor: 'var(--status-success)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--status-success)' }}>
              Tüm Sistemler Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="p-5 rounded-xl border transition-all duration-200 hover:shadow-sm"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div className="flex items-center space-x-1 text-xs font-medium"
                   style={{ color: 'var(--status-success)' }}>
                <TrendingUp size={12} />
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Main Workflow Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Zap size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            🌟 Ana İş Akışı
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {workflowSteps.map((step, index) => (
            <Link key={index} href={step.href}>
              <div 
                className="group p-6 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {step.title}
                        </h3>
                        {step.isNew && (
                          <span 
                            className="px-2 py-0.5 text-xs font-semibold rounded-full animate-pulse"
                            style={{
                              backgroundColor: 'var(--status-success)',
                              color: 'white'
                            }}
                          >
                            YENİ
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  <ArrowRight 
                    size={16} 
                    className="group-hover:translate-x-1 transition-transform duration-200"
                    style={{ color: 'var(--text-muted)' }}
                  />
                </div>
                
                {step.workflowNext && (
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                    <div className="flex items-center space-x-2 text-xs"
                         style={{ color: 'var(--text-muted)' }}>
                      <Target size={12} />
                      <span>Sonraki: {step.workflowNext}</span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Data & Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Zeka & Veriler */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-lg">📊</span>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Zekâ & Veriler
            </h2>
          </div>
          
          <div className="space-y-4">
            {dataModules.map((module, index) => (
              <Link key={index} href={module.href}>
                <div 
                  className="group p-5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{module.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {module.title}
                          </h3>
                          {module.isNew && (
                            <span 
                              className="px-2 py-0.5 text-xs font-semibold rounded-full"
                              style={{
                                backgroundColor: 'var(--accent-primary)',
                                color: 'white'
                              }}
                            >
                              YENİ
                            </span>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {module.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-xs font-medium px-2 py-1 rounded"
                         style={{ 
                           backgroundColor: 'var(--bg-tertiary)',
                           color: 'var(--text-secondary)'
                         }}>
                      {module.stats}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Yönetim Araçları */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-lg">⚙️</span>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Yönetim
            </h2>
          </div>
          
          <div className="space-y-4">
            {managementTools.map((tool, index) => (
              <Link key={index} href={tool.href}>
                <div 
                  className="group p-5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{tool.icon}</span>
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {tool.title}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-xs font-medium px-2 py-1 rounded"
                         style={{ 
                           backgroundColor: 'var(--bg-tertiary)',
                           color: 'var(--text-secondary)'
                         }}>
                      {tool.stats}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="mt-8 p-6 rounded-xl border" 
           style={{ 
             backgroundColor: 'var(--bg-accent-subtle)',
             borderColor: 'var(--border-primary)'
           }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Hızlı Başlangıç
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Yeni bir ihale için otomatik teklif sürecini başlatın
            </p>
          </div>
          
          <Link href="/proposal-panel">
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              <Zap size={16} />
              <span>Teklif Panelini Başlat</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

    </div>
  )
}