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
  actions: string[]
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
      'Yeni Tarif Ekle', 
      'Tarifleri Düzenle', 
      'Kategoriler & Etiketler', 
      'Arama & Filtre', 
      'Tarif Şablonları',
      'Beslenme Analizi',
      'Maliyet Hesaplama'
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
      'Yeni Plan Oluştur', 
      'Şablon Kullan', 
      'Takvim Görünümü', 
      'Plan Kopyala', 
      'Sezonluk Planlar'
    ]
  },
  {
    id: 'ingredients-stock',
    title: 'Malzeme Stoku',
    icon: '📦',
    count: '156',
    description: 'Envanter takibi ve stok yönetimi',
    category: 'ingredients',
    actions: [
      'Stok Durumu', 
      'Yeni Malzeme Ekle', 
      'Tedarikçi Yönetimi', 
      'Kritik Seviye Uyarıları',
      'Stok Geçmişi'
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
      'Maliyet Hesapla', 
      'Karlılık Analizi', 
      'Fiyat Önerileri', 
      'Trend Analizi',
      'Rapor Oluştur'
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
      'Besin Değeri Hesapla', 
      'Allerjen Tarama', 
      'Diyet Uyumluluğu', 
      'Kalori Hesaplama'
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
      'Tedarikçi Listesi', 
      'Sipariş Ver', 
      'Fiyat Karşılaştır', 
      'Performans Değerlendir'
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
      'Sezon Planı Oluştur', 
      'Etkinlik Menüleri', 
      'Özel Günler', 
      'Trend Menüler'
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
      'Kalite Kriterleri', 
      'Denetim Kayıtları', 
      'İyileştirme Önerileri', 
      'Standart Oluştur'
    ]
  }
]

export const quickActions = [
  { id: 'add-recipe', title: 'Hızlı Tarif Ekle', icon: '➕', color: 'var(--status-success)' },
  { id: 'menu-wizard', title: 'Menü Sihirbazı', icon: '🪄', color: 'var(--accent-primary)' },
  { id: 'cost-calculator', title: 'Maliyet Hesapla', icon: '🧮', color: 'var(--status-warning)' },
  { id: 'inventory-check', title: 'Stok Kontrolü', icon: '📋', color: 'var(--status-info)' }
]