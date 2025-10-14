'use client'

import { useState } from 'react'
import { StatCard, Button, BaseCard } from '@/app/components/ui'
import { CategoryFilter, MenuGrid, NutritionModal, AIRecipeGenerator } from './components'
import { menuCategories, menuItems, quickActions } from '@/lib/data/menu-management'
import { useMenuManagementData } from '@/lib/hooks/useMenuManagementData'
import { ChefHat, Plus, Settings, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react'

export default function MenuManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [nutritionModalOpen, setNutritionModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ id: string; title: string } | null>(null)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  
  const { 
    formattedStats, 
    alerts, 
    loading, 
    error, 
    refreshData, 
    lastUpdated 
  } = useMenuManagementData()

  const handleActionClick = (itemId: string, action: string) => {
    console.log(`Action: ${action} for item: ${itemId}`)
    
    // Beslenme analizi modalını aç
    if (action.includes('Beslenme') || action.includes('Besin') || action.includes('Kalori')) {
      const item = menuItems.find(i => i.id === itemId)
      if (item) {
        setSelectedItem({ id: item.id, title: item.title })
        setNutritionModalOpen(true)
      }
    }
  }

  const handleQuickAction = (actionId: string) => {
    console.log(`Quick action: ${actionId}`)
    
    if (actionId === 'cost-calculator') {
      // Maliyet hesaplama sayfasına yönlendir
      window.open('/cost-simulator', '_blank')
    } else if (actionId === 'inventory-check') {
      // Malzeme havuzu durumu modalını aç
      console.log('Malzeme havuzu durumu kontrol ediliyor...')
    } else if (actionId === 'menu-planner') {
      // Menü planlama modalını aç
      console.log('Menü planlama başlatılıyor...')
    }
  }

  // Dinamik istatistikler veya varsayılan değerler
  const totalStats = formattedStats || [
    { title: 'Toplam Tarif', value: '247', change: '+12', trend: 'up' as const, icon: '🥘' },
    { title: 'Aktif Menü', value: '8', change: '+2', trend: 'up' as const, icon: '📝' },
    { title: 'Malzeme Havuzu', value: '156', change: '-5', trend: 'down' as const, icon: '📦' },
    { title: 'Aylık Maliyet', value: '₺24.5K', change: '+8%', trend: 'up' as const, icon: '💰' }
  ]

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <BaseCard className="mb-8 p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                 style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
              <ChefHat size={32} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Menü Yönetimi Sistemi
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Tarifler, menüler ve maliyet yönetimi merkezi
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <Settings size={14} />
                <span>Otomatik besin analizi • Maliyet hesaplama • Stok entegrasyonu</span>
                {lastUpdated && (
                  <span className="ml-4 text-xs">
                    Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="primary" 
              size="md" 
              className="flex items-center gap-2"
              onClick={() => setShowAIGenerator(!showAIGenerator)}
            >
              <Plus size={18} />
              {showAIGenerator ? 'Kapat' : 'AI Tarif Oluştur'}
            </Button>
            
            <Button 
              variant="secondary" 
              size="md" 
              className="flex items-center gap-2"
              onClick={() => refreshData()}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Yenile
            </Button>
          </div>
        </div>
      </BaseCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {totalStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Stock Alerts */}
      {alerts && alerts.length > 0 && (
        <BaseCard className="mb-8 border-amber-200 bg-amber-50/50">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-800">Stok Uyarıları</h3>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border" 
                     style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--error-primary)' }}></div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{alert.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Mevcut: {alert.currentStock} • Minimum: {alert.minimumStock}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{alert.supplier}</p>
                    <Button 
                      size="sm" 
                      variant="primary" 
                      className="mt-1"
                      onClick={() => console.log('Order from supplier:', alert.supplier)}
                    >
                      Sipariş Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BaseCard>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          ⚡ Hızlı İşlemler
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              icon={action.icon}
              variant="secondary"
              className="flex-shrink-0"
            >
              {action.title}
            </Button>
          ))}
        </div>
      </div>

      {/* AI Recipe Generator */}
      {showAIGenerator && (
        <div className="mb-8">
          <AIRecipeGenerator 
            onRecipeGenerated={(recipe) => {
              console.log('Generated recipe:', recipe)
              // Burada tarifi veritabanına kaydetme işlemi olacak
              setShowAIGenerator(false)
            }}
          />
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <CategoryFilter
          categories={menuCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Menu Items Grid */}
      <MenuGrid
        items={menuItems}
        selectedCategory={selectedCategory}
        onActionClick={handleActionClick}
        className="mb-8"
      />

      {/* Nutrition Modal */}
      {selectedItem && (
        <NutritionModal
          isOpen={nutritionModalOpen}
          onClose={() => {
            setNutritionModalOpen(false)
            setSelectedItem(null)
          }}
          itemId={selectedItem.id}
          itemTitle={selectedItem.title}
        />
      )}
    </div>
  )
}