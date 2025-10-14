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
  { id: 'menus', title: 'Menüler', icon: '📝', count: 8 },
  { id: 'ingredients', title: 'Malzemeler', icon: '🥬', count: 156 },
  { id: 'costs', title: 'Maliyetler', icon: '💰', count: 45 }
]

export const menuItems: MenuItemData[] = [
  {
    id: 'recipes-management',
    title: 'Tarif Yönetimi',
    icon: '🥘',
    count: '247',
    description: 'Tüm tariflerinizi ve kategorileri yönetin',
    category: 'recipes',
    actions: [
      { id: 'add-recipe', title: 'Yeni Tarif Ekle', status: 'available' },
      { id: 'edit-recipes', title: 'Tarifleri Düzenle', status: 'available' },
      { id: 'categories', title: 'Kategoriler & Etiketler', status: 'available' },
      { id: 'search-filter', title: 'Arama & Filtre', status: 'available' },
      { id: 'templates', title: 'Tarif Şablonları', status: 'coming-soon', badge: 'Yakında' },
      { id: 'nutrition', title: 'Beslenme Analizi', status: 'available' },
      { id: 'cost-calc', title: 'Maliyet Hesaplama', status: 'available' }
    ]
  },
  {
    id: 'menu-planning',
    title: 'Menü Planlama',
    icon: '📅',
    count: '8',
    description: 'Haftalık ve aylık menü planları',
    category: 'menus',
    actions: [
      { id: 'new-plan', title: 'Yeni Plan Oluştur', status: 'available' },
      { id: 'use-template', title: 'Şablon Kullan', status: 'coming-soon', badge: 'Yakında' },
      { id: 'calendar-view', title: 'Takvim Görünümü', status: 'available' },
      { id: 'copy-plan', title: 'Plan Kopyala', status: 'available' },
      { id: 'seasonal-plans', title: 'Sezonluk Planlar', status: 'disabled', badge: 'Beta' }
    ]
  },
  {
    id: 'inventory-management',
    title: 'Malzeme Havuzu',
    icon: '📦',
    count: '156',
    description: 'Depo ve malzeme havuzu takibi',
    category: 'ingredients',
    actions: [
      { id: 'stock-status', title: 'Stok Durumu', status: 'available' },
      { id: 'add-ingredient', title: 'Yeni Malzeme Ekle', status: 'available' },
      { id: 'supplier-mgmt', title: 'Tedarikçi Yönetimi', status: 'available' },
      { id: 'critical-alerts', title: 'Kritik Seviye Uyarıları', status: 'available' },
      { id: 'stock-history', title: 'Stok Geçmişi', status: 'coming-soon', badge: 'Yakında' }
    ]
  },
  {
    id: 'cost-analysis',
    title: 'Maliyet Analizi',
    icon: '💰',
    count: '45',
    description: 'Tarif maliyetleri ve karlılık analizi',
    category: 'costs',
    actions: [
      { id: 'cost-calculate', title: 'Maliyet Hesapla', status: 'available' },
      { id: 'profit-analysis', title: 'Karlılık Analizi', status: 'available' },
      { id: 'price-suggestions', title: 'Fiyat Önerileri', status: 'coming-soon', badge: 'Yakında' },
      { id: 'trend-analysis', title: 'Trend Analizi', status: 'available' },
      { id: 'generate-report', title: 'Rapor Oluştur', status: 'available' }
    ]
  },
  {
    id: 'nutrition-analysis',
    title: 'Beslenme Analizi',
    icon: '🥗',
    count: '189',
    description: 'Besin değerleri ve allerjen analizi',
    category: 'recipes',
    actions: [
      { id: 'nutrition-calc', title: 'Besin Değeri Hesapla', status: 'available' },
      { id: 'allergen-scan', title: 'Allerjen Tarama', status: 'coming-soon', badge: 'Yakında' },
      { id: 'diet-compatibility', title: 'Diyet Uyumluluğu', status: 'available' },
      { id: 'calorie-calc', title: 'Kalori Hesaplama', status: 'available' }
    ]
  },
  {
    id: 'supplier-management',
    title: 'Tedarikçi Yönetimi',
    icon: '🚚',
    count: '23',
    description: 'Tedarikçi ilişkileri ve sipariş yönetimi',
    category: 'ingredients',
    actions: [
      { id: 'supplier-list', title: 'Tedarikçi Listesi', status: 'available' },
      { id: 'place-order', title: 'Sipariş Ver', status: 'available' },
      { id: 'price-compare', title: 'Fiyat Karşılaştır', status: 'available' },
      { id: 'performance-eval', title: 'Performans Değerlendir', status: 'coming-soon', badge: 'Yakında' }
    ]
  },
  {
    id: 'seasonal-menus',
    title: 'Sezonluk Menüler',
    icon: '🍂',
    count: '12',
    description: 'Mevsimsel menü planları ve özel etkinlikler',
    category: 'menus',
    actions: [
      { id: 'seasonal-plan', title: 'Sezon Planı Oluştur', status: 'available' },
      { id: 'event-menus', title: 'Etkinlik Menüleri', status: 'available' },
      { id: 'special-days', title: 'Özel Günler', status: 'coming-soon', badge: 'Yakında' },
      { id: 'trend-menus', title: 'Trend Menüler', status: 'disabled', badge: 'Beta' }
    ]
  },
  {
    id: 'quality-control',
    title: 'Kalite Kontrol',
    icon: '⭐',
    count: '34',
    description: 'Kalite standartları ve denetim süreçleri',
    category: 'recipes',
    actions: [
      { id: 'quality-criteria', title: 'Kalite Kriterleri', status: 'available' },
      { id: 'audit-records', title: 'Denetim Kayıtları', status: 'available' },
      { id: 'improvement-suggestions', title: 'İyileştirme Önerileri', status: 'coming-soon', badge: 'Yakında' },
      { id: 'create-standards', title: 'Standart Oluştur', status: 'disabled', badge: 'Pro' }
    ]
  }
]

export const quickActions = [
  { id: 'cost-calculator', title: 'Maliyet Hesapla', icon: '🧮', color: 'var(--status-warning)' },
  { id: 'inventory-check', title: 'Havuz Durumu', icon: '📋', color: 'var(--status-info)' },
  { id: 'menu-planner', title: 'Menü Planla', icon: '�', color: 'var(--accent-primary)' }
]