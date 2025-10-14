export interface MenuCategory {
  id: string
  title: string
  icon: string
  count?: number
}

export interface MenuItemData {
  id: string
  title: string
  icon: string
  count: string
  description: string
  category: string
  actions: ActionItem[]
}

export interface ActionItem {
  id: string
  title: string
  status: 'available' | 'coming-soon' | 'disabled'
  badge?: string
}

export const menuCategories: MenuCategory[] = [
  { id: 'all', title: 'Tümü', icon: '🍽️' },
  { id: 'recipes', title: 'Tarifler', icon: '🥘', count: 247 },
  { id: 'costs', title: 'Maliyetler', icon: '�', count: 45 },
  { id: 'ingredients', title: 'Malzemeler', icon: '🥬', count: 156 },
  { id: 'menus', title: 'Menüler', icon: '�', count: 8 }
]

export const menuItems: MenuItemData[] = [
  {
    id: 'recipes-management',
    title: 'Tarif Yönetimi',
    icon: '🥘',
    count: '247',
    description: 'Tarif oluşturma, düzenleme ve kategori yönetimi',
    category: 'recipes',
    actions: [
      { id: 'add-recipe', title: 'Yeni Tarif Ekle', status: 'available' },
      { id: 'edit-recipes', title: 'Tarifleri Düzenle', status: 'available' },
      { id: 'categories', title: 'Kategoriler', status: 'available' }
    ]
  },
  {
    id: 'cost-analysis',
    title: 'Maliyet & Fiyatlandırma',
    icon: '�',
    count: '45',
    description: 'Maliyet hesaplama ve karlılık analizi',
    category: 'costs',
    actions: [
      { id: 'cost-calculate', title: 'Maliyet Hesapla', status: 'available' },
      { id: 'profit-analysis', title: 'Karlılık Analizi', status: 'available' },
      { id: 'generate-report', title: 'Rapor Oluştur', status: 'available' }
    ]
  },
  {
    id: 'inventory-management',
    title: 'Malzeme Havuzu',
    icon: '📦',
    count: '156',
    description: 'Malzeme stok takibi ve tedarikçi yönetimi',
    category: 'ingredients',
    actions: [
      { id: 'stock-status', title: 'Stok Durumu', status: 'available' },
      { id: 'add-ingredient', title: 'Yeni Malzeme', status: 'available' },
      { id: 'supplier-mgmt', title: 'Tedarikçiler', status: 'available' }
    ]
  },
  {
    id: 'menu-planning',
    title: 'Menü Planlama',
    icon: '📅',
    count: '8',
    description: 'Haftalık menü planları ve organizasyon',
    category: 'menus',
    actions: [
      { id: 'new-plan', title: 'Yeni Plan', status: 'available' },
      { id: 'calendar-view', title: 'Takvim Görünümü', status: 'available' },
      { id: 'copy-plan', title: 'Plan Kopyala', status: 'available' }
    ]
  }
]

export const quickActions = [
  { id: 'cost-calculator', title: 'Maliyet Hesapla', icon: '🧮', color: 'var(--status-warning)' },
  { id: 'inventory-check', title: 'Havuz Durumu', icon: '📋', color: 'var(--status-info)' },
  { id: 'menu-planner', title: 'Menü Planla', icon: '�', color: 'var(--accent-primary)' }
]