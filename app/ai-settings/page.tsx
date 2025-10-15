'use client'

import { useState } from 'react'
import { BaseCard } from '@/app/components/ui/Card'
import { Bot, Settings, Zap, DollarSign, Target, Link } from 'lucide-react'

export default function AISettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('models')
  const [selectedModel, setSelectedModel] = useState<string>('claude-3-haiku')
  const [integrationStates, setIntegrationStates] = useState<{[key: string]: string}>({
    'anthropic': 'connected',
    'openai': 'available',
    'google-cloud': 'available',
    'gemini': 'available',
    'market-apis': 'development'
  })
  const [apiKeys, setApiKeys] = useState<{[key: string]: string}>({
    'anthropic': '••••••••••••••••sk_ant_1234',
    'openai': 'Yapılandırılmamış',
    'google-cloud': 'Yapılandırılmamış',
    'gemini': 'Yapılandırılmamış',
    'market-apis': 'Geliştiriliyor'
  })
  const [showApiKeyModal, setShowApiKeyModal] = useState<string | null>(null)
  const [tempApiKey, setTempApiKey] = useState<string>('')

  const handleConnectionToggle = (integrationId: string) => {
    const currentStatus = integrationStates[integrationId]
    
    if (currentStatus === 'connected') {
      // Bağlantıyı kes
      setIntegrationStates(prev => ({
        ...prev,
        [integrationId]: 'available'
      }))
      setApiKeys(prev => ({
        ...prev,
        [integrationId]: 'Yapılandırılmamış'
      }))
      console.log(`${integrationId} bağlantısı kesildi`)
      alert(`${integrationId} servisi bağlantısı kesildi`)
    } else if (currentStatus === 'available') {
      // Modal aç
      setShowApiKeyModal(integrationId)
      setTempApiKey('')
    } else if (currentStatus === 'development') {
      alert('Bu entegrasyon henüz geliştirme aşamasında. Yakında kullanılabilir olacak.')
    }
  }

  const handleApiKeySubmit = () => {
    if (showApiKeyModal && tempApiKey.trim()) {
      setApiKeys(prev => ({
        ...prev,
        [showApiKeyModal]: `••••••••••••••••${tempApiKey.slice(-4)}`
      }))
      setIntegrationStates(prev => ({
        ...prev,
        [showApiKeyModal]: 'connected'
      }))
      setShowApiKeyModal(null)
      setTempApiKey('')
      alert(`${showApiKeyModal} başarıyla bağlandı!`)
    } else {
      alert('Geçerli bir API key giriniz!')
    }
  }

  const tabs = [
    { id: 'models', title: 'AI Modeller', icon: '🤖' },
    { id: 'orchestrator', title: 'Meta-Zeka', icon: '🧠' },
    { id: 'automation', title: 'Otomasyonlar', icon: '⚡' },
    { id: 'market-prices', title: 'Market Fiyatları', icon: '💰' },
    { id: 'preferences', title: 'Tercihler', icon: '🎯' },
    { id: 'integrations', title: 'Entegrasyonlar', icon: '🔗' }
  ]

  const aiModels = [
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: 'Hızlı ve ekonomik model - günlük işlemler için ideal',
      status: 'active',
      usage: 'Günlük kullanım',
      capabilities: ['Tarif öneri', 'Maliyet hesaplama', 'Hızlı yanıtlar'],
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic', 
      description: 'Dengeli performans - karmaşık analizler için',
      status: 'available',
      usage: 'İhtiyaç halinde',
      capabilities: ['Detaylı analiz', 'Menü optimizasyonu', 'Trend analizi'],
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      description: 'En gelişmiş model - profesyonel analizler için',
      status: 'premium',
      usage: 'Özel projeler',
      capabilities: ['Gelişmiş strateji', 'Pazar analizi', 'Yaratıcı öneriler'],
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      description: 'Çok amaçlı güçlü model',
      status: 'available',
      usage: 'Yaratıcı işler',
      capabilities: ['Görsel analiz', 'Kod üretimi', 'Multimodal'],
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Google\'ın gelişmiş AI modeli - piyasa analizi için optimize',
      status: 'available',
      usage: 'Piyasa analizi',
      capabilities: ['Piyasa analizi', 'Fiyat tahmini', 'Trend analizi', 'Web scraping'],
      gradient: 'from-indigo-500 to-purple-600'
    }
  ]

  const automationRules = [
    {
      id: 'recipe-suggestions',
      title: 'Otomatik Tarif Önerileri',
      description: 'Sezonluk malzemelere göre günlük tarif önerileri',
      status: true,
      trigger: 'Her sabah 09:00',
      lastRun: '2 saat önce'
    },
    {
      id: 'cost-alerts',
      title: 'Maliyet Uyarıları',
      description: 'Malzeme fiyatlarında %10+ artış olduğunda uyar',
      status: true,
      trigger: 'Fiyat değişimi',
      lastRun: '1 gün önce'
    },
    {
      id: 'inventory-optimization',
      title: 'Stok Optimizasyonu',
      description: 'Haftalık stok önerilerini AI ile oluştur',
      status: false,
      trigger: 'Her Pazar',
      lastRun: 'Henüz çalışmadı'
    },
    {
      id: 'menu-analysis',
      title: 'Menü Performans Analizi',
      description: 'Aylık menü başarı oranları ve iyileştirme önerileri',
      status: true,
      trigger: 'Ayın son günü',
      lastRun: '3 gün önce'
    },
    {
      id: 'market-price-scraping',
      title: 'Otomatik Market Fiyat Takibi',
      description: 'A101, BİM, ŞOK, Migros, Metro ve hal fiyatlarını günlük çekme',
      status: false,
      trigger: 'Her gün 08:00',
      lastRun: 'Henüz aktif değil',
      priority: 'high',
      sources: ['A101', 'BİM', 'ŞOK', 'Migros', 'Metro', 'Tarım Kredi', 'Toptancı Halleri']
    },
    {
      id: 'price-trend-analysis',
      title: 'Fiyat Trend Analizi',
      description: 'Haftalık fiyat değişimlerini analiz edip satın alma önerileri',
      status: false,
      trigger: 'Haftalık',
      lastRun: 'Henüz aktif değil',
      aiModel: 'gemini-pro'
    }
  ]

  const integrations = [
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      status: integrationStates['anthropic'],
      description: 'Claude AI modelleri aktif',
      icon: '🤖',
      apiKey: apiKeys['anthropic'],
      lastSync: integrationStates['anthropic'] === 'connected' ? '5 dakika önce' : 'Hiç'
    },
    {
      id: 'openai',
      name: 'OpenAI GPT',
      status: integrationStates['openai'],
      description: 'GPT modellerine erişim için API key gerekli',
      icon: '⚡',
      apiKey: apiKeys['openai'],
      lastSync: integrationStates['openai'] === 'connected' ? '2 dakika önce' : 'Hiç'
    },
    {
      id: 'google-cloud',
      name: 'Google Cloud AI',
      status: integrationStates['google-cloud'],
      description: 'Vertex AI ve Gemini modelleri',
      icon: '☁️',
      apiKey: apiKeys['google-cloud'],
      lastSync: integrationStates['google-cloud'] === 'connected' ? '1 dakika önce' : 'Hiç'
    },
    {
      id: 'gemini',
      name: 'Google Gemini Pro',
      status: integrationStates['gemini'],
      description: 'Piyasa analizi ve fiyat tahminleri için optimize edilmiş',
      icon: '💎',
      apiKey: apiKeys['gemini'],
      lastSync: integrationStates['gemini'] === 'connected' ? 'Az önce' : 'Hiç',
      features: ['Web Scraping', 'Fiyat Analizi', 'Trend Tahmini']
    },
    {
      id: 'market-apis',
      name: 'Market API Entegrasyonları',
      status: integrationStates['market-apis'],
      description: 'A101, BİM, ŞOK, Migros fiyat API\'leri',
      icon: '🛒',
      apiKey: apiKeys['market-apis'],
      lastSync: 'Henüz yok',
      markets: ['A101', 'BİM', 'ŞOK', 'Migros', 'Metro', 'Tarım Kredi']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'available': return 'bg-blue-500'
      case 'premium': return 'bg-purple-500'
      case 'connected': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <BaseCard className="mb-8 p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
               style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
            <Bot size={32} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              AI Ayarları & Yapılandırma
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Yapay zeka modelleri, otomasyonlar ve entegrasyonlar
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Settings size={14} />
              <span>Model optimizasyonu • Performans izleme • API entegrasyonları</span>
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Tab Navigation */}
      <BaseCard className="mb-8 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const getTabIcon = (iconName: string) => {
              switch(iconName) {
                case '🤖': return <Bot size={18} />
                case '🧠': return <Settings size={18} />
                case '⚡': return <Zap size={18} />
                case '💰': return <DollarSign size={18} />
                case '🎯': return <Target size={18} />
                case '🔗': return <Link size={18} />
                default: return <Settings size={18} />
              }
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium"
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--bg-accent-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-on-accent)' : 'var(--text-secondary)'
                }}
              >
                {getTabIcon(tab.icon)}
                <span>{tab.title}</span>
              </button>
            )
          })}
        </div>
      </BaseCard>

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Kompakt AI Model Seçicisi */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">🤖</span>
              AI Modelleri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {aiModels.map((model) => (
                <div
                  key={model.id}
                  className={`
                    relative p-4 rounded-xl border transition-all cursor-pointer
                    ${selectedModel === model.id 
                      ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/30' 
                      : 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-600/40'
                    }
                  `}
                  onClick={() => setSelectedModel(model.id)}
                >
                  {/* Status & Provider */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">{model.provider}</span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(model.status)}`}></div>
                      {selectedModel === model.id && <span className="text-xs text-blue-400">✓ Aktif</span>}
                    </div>
                  </div>

                  {/* Model Name & Usage */}
                  <div className="mb-3">
                    <h4 className="text-white font-medium text-sm mb-1">{model.name}</h4>
                    <p className="text-gray-400 text-xs">{model.usage}</p>
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {model.capabilities.slice(0, 2).map((cap, index) => (
                      <span key={index} className="bg-gray-600/40 text-gray-300 text-xs px-2 py-1 rounded">
                        {cap}
                      </span>
                    ))}
                    {model.capabilities.length > 2 && (
                      <span className="text-gray-500 text-xs">+{model.capabilities.length - 2}</span>
                    )}
                  </div>

                  {/* Select Button */}
                  <button className={`
                    w-full py-2 text-xs font-medium rounded-lg transition-colors
                    ${selectedModel === model.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600/50 text-gray-300 hover:bg-gray-500/50'
                    }
                  `}>
                    {selectedModel === model.id ? 'Aktif' : 'Seç'}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Selected Model Details */}
            {selectedModel && (
              <div className="mt-6 p-4 bg-gray-700/30 rounded-xl">
                <h4 className="text-white font-medium mb-2">Seçilen Model Detayları</h4>
                {(() => {
                  const model = aiModels.find(m => m.id === selectedModel)
                  return model ? (
                    <div className="text-sm text-gray-300">
                      <p className="mb-2">{model.description}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-gray-400">Yetenekler:</span>
                        {model.capabilities.map((cap, index) => (
                          <span key={index} className="bg-gray-600/40 px-2 py-1 rounded text-xs">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            )}
          </div>

          {/* Kompakt İstatistikler */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50">
            <h4 className="text-white font-medium mb-3 text-sm">📊 Bu Ay Kullanım</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">2.4M</div>
                <div className="text-gray-400 text-xs">Token</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">156</div>
                <div className="text-gray-400 text-xs">API Çağrı</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">₺84</div>
                <div className="text-gray-400 text-xs">Maliyet</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-400">98%</div>
                <div className="text-gray-400 text-xs">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <div className="space-y-4">
          {automationRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 ${
                rule.priority === 'high' ? 'ring-2 ring-orange-500/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-white font-semibold">{rule.title}</h3>
                    <div className={`w-2 h-2 rounded-full ${rule.status ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    {rule.priority === 'high' && (
                      <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full">
                        Öncelikli
                      </span>
                    )}
                    {rule.aiModel && (
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                        {rule.aiModel}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{rule.description}</p>
                  
                  {/* Market Sources for Price Scraping */}
                  {rule.sources && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rule.sources.map((source, index) => (
                        <span key={index} className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">
                          {source}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Tetik: {rule.trigger}</span>
                    <span>•</span>
                    <span>Son çalışma: {rule.lastRun}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${rule.status ? 'bg-blue-600' : 'bg-gray-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${rule.status ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                  
                  <button className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-white font-semibold">{integration.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`}></div>
                      <span className="text-xs text-gray-400 capitalize">{integration.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">{integration.description}</p>
              
              {/* Features for Gemini */}
              {integration.features && (
                <div className="mb-4">
                  <span className="text-gray-500 text-xs">Özellikler</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {integration.features.map((feature, index) => (
                      <span key={index} className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Markets for Market API */}
              {integration.markets && (
                <div className="mb-4">
                  <span className="text-gray-500 text-xs">Desteklenen Marketler</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {integration.markets.map((market, index) => (
                      <span key={index} className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                        {market}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-xs">API Key</span>
                  <div className="text-gray-300 text-sm font-mono">{integration.apiKey}</div>
                </div>
                
                <div>
                  <span className="text-gray-500 text-xs">Son Senkronizasyon</span>
                  <div className="text-gray-300 text-sm">{integration.lastSync}</div>
                </div>
              </div>
              
              <button 
                onClick={() => handleConnectionToggle(integration.id)}
                className={`
                  w-full mt-4 py-3 rounded-xl font-medium transition-all duration-300
                  ${integration.status === 'connected' 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : integration.status === 'development'
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }
                `}
                disabled={integration.status === 'development'}
              >
                {integration.status === 'connected' ? 'Bağlantıyı Kes' : 
                 integration.status === 'development' ? 'Geliştiriliyor' : 'Bağlan'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Market Prices Tab */}
      {activeTab === 'market-prices' && (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="text-white font-semibold mb-1">Son Güncelleme</h3>
                <p className="text-gray-400 text-sm">2 saat önce</p>
                <div className="mt-2 text-xs text-green-400">✓ Aktif</div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="text-center">
                <div className="text-3xl mb-2">🏪</div>
                <h3 className="text-white font-semibold mb-1">Takip Edilen Market</h3>
                <p className="text-gray-400 text-sm">7 Market</p>
                <div className="mt-2 text-xs text-blue-400">A101, BİM, ŞOK...</div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="text-white font-semibold mb-1">Günlük Fiyat Değişimi</h3>
                <p className="text-gray-400 text-sm">±3.2% ortalama</p>
                <div className="mt-2 text-xs text-orange-400">156 ürün takipte</div>
              </div>
            </div>
          </div>

          {/* Market Sources Configuration */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">🛒</span>
              Market Kaynakları
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['A101', 'BİM', 'ŞOK', 'Migros', 'Metro', 'Tarım Kredi', 'Carrefoursa', 'Toptancı Halleri'].map((market) => (
                <div key={market} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{market}</h4>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-400 text-xs">Son güncelleme: 2s önce</p>
                  <p className="text-gray-500 text-xs">189 ürün</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Settings */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">🤖</span>
              AI Fiyat Analizi Ayarları
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Otomatik Fiyat Güncellemesi</h4>
                  <p className="text-gray-400 text-sm">Gemini Pro ile günlük fiyat çekimi</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Fiyat Trend Analizi</h4>
                  <p className="text-gray-400 text-sm">Haftalık trend ve tahmin raporları</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Maliyet Optimizasyon Önerileri</h4>
                  <p className="text-gray-400 text-sm">En uygun satın alma zamanı önerileri</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Price Changes */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">📈</span>
              Son Fiyat Değişiklikleri
            </h3>
            
            <div className="space-y-3">
              {[
                { product: 'Domates', market: 'A101', oldPrice: '15.90', newPrice: '17.50', change: '+10.1%', changeType: 'increase' },
                { product: 'Soğan', market: 'BİM', oldPrice: '8.50', newPrice: '7.90', change: '-7.1%', changeType: 'decrease' },
                { product: 'Tavuk Eti', market: 'ŞOK', oldPrice: '89.90', newPrice: '94.50', change: '+5.1%', changeType: 'increase' },
                { product: 'Pirinç', market: 'Migros', oldPrice: '42.00', newPrice: '39.90', change: '-5.0%', changeType: 'decrease' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.product}</h4>
                    <p className="text-gray-400 text-sm">{item.market}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300 text-sm">{item.oldPrice}₺ → {item.newPrice}₺</p>
                    <p className={`text-sm font-medium ${
                      item.changeType === 'increase' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {item.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Test Section */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">🧪</span>
              API Testleri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/market-prices?mock=true')
                    const data = await response.json()
                    console.log('Mock Market Data:', data)
                    alert('Test başarılı! Konsolu kontrol edin.')
                  } catch (error) {
                    console.error('Test failed:', error)
                    alert('Test başarısız!')
                  }
                }}
                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl p-4 text-left transition-all"
              >
                <div className="text-blue-400 font-medium mb-1">Mock Fiyat Verisi</div>
                <div className="text-gray-400 text-sm">Test amaçlı mock market verilerini getir</div>
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const mockPrices = [
                      { productName: 'Domates', market: 'A101', price: 15.90, unit: 'kg', date: new Date().toISOString() },
                      { productName: 'Soğan', market: 'BİM', price: 8.50, unit: 'kg', date: new Date().toISOString() }
                    ]
                    
                    const response = await fetch('/api/market-prices', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'analyze', data: mockPrices })
                    })
                    
                    const data = await response.json()
                    console.log('Gemini Analysis:', data)
                    alert(data.success ? 'Gemini analizi başarılı!' : 'Gemini analizi başarısız!')
                  } catch (error) {
                    console.error('Gemini test failed:', error)
                    alert('Gemini testi başarısız!')
                  }
                }}
                className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl p-4 text-left transition-all"
              >
                <div className="text-purple-400 font-medium mb-1">Gemini AI Test</div>
                <div className="text-gray-400 text-sm">Gemini Pro ile fiyat analizi testi</div>
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/ai/menu-suggestions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ingredients: ['domates', 'soğan', 'tavuk eti', 'pirinç'],
                        budget: 500,
                        dietaryRestrictions: []
                      })
                    })
                    
                    const data = await response.json()
                    console.log('OpenAI Menu Suggestions:', data)
                    alert(data.success ? 'OpenAI menü önerileri başarılı!' : 'OpenAI testi başarısız!')
                  } catch (error) {
                    console.error('OpenAI test failed:', error)
                    alert('OpenAI testi başarısız!')
                  }
                }}
                className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-xl p-4 text-left transition-all"
              >
                <div className="text-green-400 font-medium mb-1">OpenAI Test</div>
                <div className="text-gray-400 text-sm">GPT-4 ile menü önerileri testi</div>
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const mockRecipe = {
                      name: 'Tavuklu Pilav',
                      ingredients: ['tavuk eti', 'pirinç', 'soğan', 'domates'],
                      instructions: ['Soğanı kavur', 'Tavuk ekle', 'Pirinç ekle', 'Pişir'],
                      servings: 4
                    }
                    
                    const response = await fetch('/api/ai/claude-analysis', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'recipe-analysis',
                        data: mockRecipe
                      })
                    })
                    
                    const data = await response.json()
                    console.log('Claude Recipe Analysis:', data)
                    alert(data.success ? 'Claude analizi başarılı!' : 'Claude testi başarısız!')
                  } catch (error) {
                    console.error('Claude test failed:', error)
                    alert('Claude testi başarısız!')
                  }
                }}
                className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-xl p-4 text-left transition-all"
              >
                <div className="text-orange-400 font-medium mb-1">Claude AI Test</div>
                <div className="text-gray-400 text-sm">Claude ile tarif analizi testi</div>
              </button>
            </div>
            
            
            {/* AI Comparison Test */}
            <div className="mt-6">
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/ai/compare', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        task: 'menu-optimization',
                        data: {
                          ingredients: ['domates', 'soğan', 'tavuk eti', 'pirinç'],
                          budget: 500,
                          dietaryRestrictions: []
                        }
                      })
                    })
                    
                    const data = await response.json()
                    console.log('AI Comparison Results:', data)
                    alert('AI karşılaştırma testi başarılı! Konsolu kontrol edin.')
                  } catch (error) {
                    console.error('AI comparison failed:', error)
                    alert('AI karşılaştırma testi başarısız!')
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 rounded-xl p-6 text-center transition-all"
              >
                <div className="text-xl mb-2">🤖🆚🤖🆚🤖</div>
                <div className="text-white font-medium mb-1">AI Servisleri Karşılaştırması</div>
                <div className="text-gray-400 text-sm">Claude vs OpenAI vs Gemini aynı görevde test</div>
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-medium mb-2">✅ API Anahtarları Yapılandırıldı:</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• <code className="bg-green-600/20 text-green-400 px-2 py-1 rounded">ANTHROPIC_API_KEY</code> ✅ Aktif</p>
                <p>• <code className="bg-green-600/20 text-green-400 px-2 py-1 rounded">GOOGLE_GEMINI_API_KEY</code> ✅ Aktif</p>
                <p>• <code className="bg-green-600/20 text-green-400 px-2 py-1 rounded">OPENAI_API_KEY</code> ✅ Aktif</p>
                <p>• <code className="bg-orange-600/20 text-orange-400 px-2 py-1 rounded">SCRAPING_BEE_API_KEY</code> ⏳ Isteğe bağlı</p>
              </div>
              <p className="text-xs text-green-400 mt-2">
                🎉 Tüm AI servisleri kullanıma hazır! Yukarıdaki test butonlarını deneyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Meta-Zeka (Orchestrator) Tab */}
      {activeTab === 'orchestrator' && (
        <div className="space-y-6">
          
          {/* Orchestrator Status */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-4xl">🧠</div>
              <div>
                <h3 className="text-white font-bold text-xl">ProCheff Meta-Zeka</h3>
                <p className="text-gray-300 text-sm">AI Orchestrator sistemi - Tüm AI modellerini akıllıca yönetir</p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Aktif</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">4</div>
                <div className="text-gray-400 text-xs">AI Model</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">98%</div>
                <div className="text-gray-400 text-xs">Doğruluk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">2.1s</div>
                <div className="text-gray-400 text-xs">Ort. Hız</div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 rounded-xl p-3">
              <p className="text-gray-300 text-sm">
                <span className="text-purple-400">💡 Akıllı Seçim:</span> Her görev için en uygun AI modelini otomatik seçer ve performansları sürekli izler.
              </p>
            </div>
          </div>

          {/* Model Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Claude Performance */}
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h4 className="text-white font-semibold">Claude 3 Sonnet</h4>
                    <p className="text-gray-400 text-xs">Analitik görevlerde lider</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-400">95%</div>
                  <div className="text-xs text-gray-500">Başarı oranı</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tarif Analizi</span>
                  <span className="text-green-400">Mükemmel</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Maliyet Optimizasyonu</span>
                  <span className="text-green-400">Mükemmel</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Hız</span>
                  <span className="text-yellow-400">İyi</span>
                </div>
              </div>
            </div>

            {/* Gemini Performance */}
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💎</div>
                  <div>
                    <h4 className="text-white font-semibold">Gemini Pro</h4>
                    <p className="text-gray-400 text-xs">Güncel veri uzmanı</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">92%</div>
                  <div className="text-xs text-gray-500">Başarı oranı</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Market Analizi</span>
                  <span className="text-green-400">Mükemmel</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fiyat Tahmini</span>
                  <span className="text-green-400">Mükemmel</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Hız</span>
                  <span className="text-green-400">Mükemmel</span>
                </div>
              </div>
            </div>

          </div>

          {/* Orchestrator Settings */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4">🎛️ Meta-Zeka Ayarları</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm font-medium">Otomatik Model Seçimi</span>
                  <p className="text-gray-400 text-xs">Her görev için en iyi modeli otomatik seç</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm font-medium">Paralel Karşılaştırma</span>
                  <p className="text-gray-400 text-xs">Düşük güven durumunda 2. model çalıştır</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm font-medium">Öğrenme Modu</span>
                  <p className="text-gray-400 text-xs">Performans verilerini toplayayıp modeli sürekli iyileştir</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                </button>
              </div>
              
              <div className="border-t border-gray-600 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Güven Eşiği</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm">70%</span>
                    <input type="range" min="50" max="95" value="70" className="w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Context Memory */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4">🧠 AI Belleği (Context Store)</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">47</div>
                <div className="text-gray-400 text-xs">Saklanan Context</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">12</div>
                <div className="text-gray-400 text-xs">Aktif Bağlantı</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">85%</div>
                <div className="text-gray-400 text-xs">Hatırlama Oranı</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Son Tarif Analizi</span>
                  <span className="text-gray-400 text-xs">2 dk önce</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">"Tavuk sote maliyeti %15 arttı" - Claude 3 Sonnet</p>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Market Fiyat Güncellemesi</span>
                  <span className="text-gray-400 text-xs">5 dk önce</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">"Domates fiyatları yükselişte" - Gemini Pro</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4">AI Davranış Ayarları</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">Yaratıcılık Seviyesi</div>
                  <div className="text-gray-400 text-xs">AI'ın ne kadar yaratıcı öneriler vermesini istiyorsunuz</div>
                </div>
                <div className="text-blue-400 font-medium">Orta</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">Öneri Sıklığı</div>
                  <div className="text-gray-400 text-xs">Günlük öneri bildirimleri</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">Maliyet Optimizasyonu</div>
                  <div className="text-gray-400 text-xs">Maliyetleri minimize eden öneriler önceliklendir</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4">Dil ve Bölge</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Varsayılan Dil</span>
                <select className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm">
                  <option>Türkçe</option>
                  <option>English</option>
                  <option>Français</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Bölge</span>
                <select className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm">
                  <option>Türkiye</option>
                  <option>Europe</option>
                  <option>North America</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Para Birimi</span>
                <select className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm">
                  <option>TRY (₺)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold mb-2">API Key Ekle</h3>
              <p className="text-gray-400 text-sm">
                {showApiKeyModal} servisine bağlanmak için API key girin
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                API Key
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="API key'inizi buraya girin..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleApiKeySubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Bağlan
              </button>
              <button
                onClick={() => {
                  setShowApiKeyModal(null)
                  setTempApiKey('')
                }}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}