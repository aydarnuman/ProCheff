export interface QuickStat {
  title: string
  value: string
  change: string
  icon: string
  trend: 'up' | 'down' | 'stable'
}

export interface WorkflowStep {
  title: string
  description: string
  icon: string
  href: string
  isNew?: boolean
  priority: 'high' | 'medium' | 'low'
  workflowNext: string
}

export interface DataModule {
  title: string
  description: string
  icon: string
  href: string
  stats: string
  isNew?: boolean
}

export interface ManagementTool {
  title: string
  description: string
  icon: string
  href: string
  stats: string
}

export const quickStats: QuickStat[] = [
  { title: 'İşlenen Şartname', value: '15', change: '+8', icon: '📄', trend: 'up' },
  { title: 'Optimizasyon Oranı', value: '%94', change: '+2.1%', icon: '⚡', trend: 'up' },
  { title: 'Adapte Tarif', value: '89', change: '+19', icon: '🍽️', trend: 'up' },
  { title: 'AI Güven Skoru', value: '%96', change: '+1.2%', icon: '🤖', trend: 'up' }
]

export const workflowSteps: WorkflowStep[] = [
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

export const dataModules: DataModule[] = [
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

export const managementTools: ManagementTool[] = [
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