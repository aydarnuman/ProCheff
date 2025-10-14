import { useState, useEffect, useMemo } from 'react'

interface MenuStats {
  totalRecipes: number
  activeMenus: number
  ingredientStock: number
  monthlyCost: number
  lastUpdated: Date
  trends: {
    recipes: number
    menus: number
    stock: number
    cost: number
  }
}

interface IngredientAlert {
  id: string
  name: string
  currentStock: number
  minimumStock: number
  supplier?: string
  lastRestocked: Date
}

interface MenuAnalytics {
  popularRecipes: Array<{
    id: string
    name: string
    usage: number
    rating: number
  }>
  costEfficiencyByCategory: Array<{
    category: string
    averageCost: number
    profit: number
  }>
  seasonalTrends: Array<{
    month: string
    revenue: number
    cost: number
  }>
}

export function useMenuManagementData() {
  const [stats, setStats] = useState<MenuStats | null>(null)
  const [alerts, setAlerts] = useState<IngredientAlert[]>([])
  const [analytics, setAnalytics] = useState<MenuAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      // Simulated API call - gerçek implementasyonda backend'den gelecek
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const currentStats: MenuStats = {
        totalRecipes: 247 + Math.floor(Math.random() * 10), // Dynamically changing
        activeMenus: 8 + Math.floor(Math.random() * 3),
        ingredientStock: 156 - Math.floor(Math.random() * 10),
        monthlyCost: 24500 + Math.floor(Math.random() * 2000),
        lastUpdated: new Date(),
        trends: {
          recipes: Math.random() > 0.5 ? Math.floor(Math.random() * 15) + 5 : -Math.floor(Math.random() * 5),
          menus: Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : -Math.floor(Math.random() * 2),
          stock: Math.random() > 0.4 ? -Math.floor(Math.random() * 10) : Math.floor(Math.random() * 5),
          cost: Math.random() > 0.5 ? Math.floor(Math.random() * 12) + 3 : -Math.floor(Math.random() * 8)
        }
      }
      
      setStats(currentStats)
      
    } catch (err) {
      setError('İstatistikler alınamadı')
    }
  }

  const fetchAlerts = async () => {
    try {
      const currentAlerts: IngredientAlert[] = [
        {
          id: 'ing1',
          name: 'Domates',
          currentStock: 15,
          minimumStock: 25,
          supplier: 'Trakya Sebze Ltd.',
          lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 gün önce
        },
        {
          id: 'ing2', 
          name: 'Zeytinyağı',
          currentStock: 8,
          minimumStock: 20,
          supplier: 'Anadolu Yağ San.',
          lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 gün önce
        }
      ].filter(() => Math.random() > 0.3) // Rastgele alert göster
      
      setAlerts(currentAlerts)
      
    } catch (err) {
      console.error('Alerts fetch failed:', err)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const analyticsData: MenuAnalytics = {
        popularRecipes: [
          { id: 'r1', name: 'Tavuk Sote', usage: 85, rating: 4.7 },
          { id: 'r2', name: 'Mercimek Çorbası', usage: 92, rating: 4.8 },
          { id: 'r3', name: 'Karnıyarık', usage: 67, rating: 4.5 },
          { id: 'r4', name: 'Pilav', usage: 78, rating: 4.2 },
          { id: 'r5', name: 'Sebze Güveç', usage: 54, rating: 4.4 }
        ],
        costEfficiencyByCategory: [
          { category: 'Ana Yemek', averageCost: 18.50, profit: 12.30 },
          { category: 'Çorba', averageCost: 6.20, profit: 8.80 },
          { category: 'Salata', averageCost: 4.50, profit: 10.50 },
          { category: 'Tatlı', averageCost: 8.20, profit: 16.80 }
        ],
        seasonalTrends: [
          { month: 'Ocak', revenue: 45000, cost: 28000 },
          { month: 'Şubat', revenue: 48000, cost: 29500 },
          { month: 'Mart', revenue: 52000, cost: 31200 },
          { month: 'Nisan', revenue: 55000, cost: 32800 },
          { month: 'Mayıs', revenue: 58000, cost: 34000 }
        ]
      }
      
      setAnalytics(analyticsData)
      
    } catch (err) {
      console.error('Analytics fetch failed:', err)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        fetchStats(),
        fetchAlerts(), 
        fetchAnalytics()
      ])
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
    
    // Her 30 saniyede bir otomatik güncelle
    const interval = setInterval(() => {
      fetchStats()
      fetchAlerts()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const formattedStats = useMemo(() => {
    if (!stats) return null
    
    return [
      { 
        title: 'Toplam Tarif', 
        value: stats.totalRecipes.toString(), 
        change: stats.trends.recipes > 0 ? `+${stats.trends.recipes}` : stats.trends.recipes.toString(),
        trend: stats.trends.recipes >= 0 ? 'up' as const : 'down' as const, 
        icon: '🥘' 
      },
      { 
        title: 'Aktif Menü', 
        value: stats.activeMenus.toString(), 
        change: stats.trends.menus > 0 ? `+${stats.trends.menus}` : stats.trends.menus.toString(),
        trend: stats.trends.menus >= 0 ? 'up' as const : 'down' as const, 
        icon: '📝' 
      },
      { 
        title: 'Malzeme Havuzu', 
        value: stats.ingredientStock.toString(), 
        change: stats.trends.stock > 0 ? `+${stats.trends.stock}` : stats.trends.stock.toString(),
        trend: stats.trends.stock >= 0 ? 'up' as const : 'down' as const, 
        icon: '📦' 
      },
      { 
        title: 'Aylık Maliyet', 
        value: `₺${(stats.monthlyCost / 1000).toFixed(1)}K`, 
        change: stats.trends.cost > 0 ? `+${stats.trends.cost}%` : `${stats.trends.cost}%`,
        trend: stats.trends.cost >= 0 ? 'up' as const : 'down' as const, 
        icon: '💰' 
      }
    ]
  }, [stats])

  return {
    stats,
    alerts,
    analytics,
    loading,
    error,
    refreshData,
    formattedStats,
    lastUpdated: stats?.lastUpdated
  }
}