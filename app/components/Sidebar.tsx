'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Target, FileText, ChefHat, Calculator, Database, 
  TrendingUp, BookOpen, BarChart3, Settings, X, Menu,
  ChevronDown, ChevronRight, ShoppingCart
} from 'lucide-react'

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  href: string;
  badge?: string;
}

interface MenuGroup {
  title: string;
  icon: string;
  items: MenuItem[];
}

// İkon map'i - string'den React component'e
const iconMap: Record<string, any> = {
  Home, Target, FileText, ChefHat, Calculator, Database, 
  TrendingUp, BookOpen, BarChart3, Settings, ShoppingCart
}

const menuGroups: MenuGroup[] = [
  {
    title: '🌟 Ana İş Akışı',
    icon: '🌟',
    items: [
      {
        id: 'dashboard',
        title: 'Ana Sayfa',
        icon: 'Home',
        href: '/'
      },
      {
        id: 'proposal-panel',
        title: 'Teklif Paneli',
        icon: 'Target',
        href: '/proposal-panel',
        badge: 'YENİ'
      },
      {
        id: 'spec-parser',
        title: 'Şartname Analizi',
        icon: 'FileText',
        href: '/spec-parser'
      },
      {
        id: 'recipe-adapter',
        title: 'Tarif Adaptörü',
        icon: 'ChefHat',
        href: '/recipe-adapter'
      },
      {
        id: 'cost-simulator',
        title: 'Maliyet Simülasyonu',
        icon: 'Calculator',
        href: '/cost-simulator'
      }
    ]
  },
  {
    title: '📊 Zekâ & Veriler',
    icon: '📊',
    items: [
      {
        id: 'spec-database',
        title: 'Şartname Veritabanı',
        icon: 'Database',
        href: '/spec-database'
      },
      {
        id: 'market-intelligence',
        title: 'Piyasa Trend Zekâsı',
        icon: 'TrendingUp',
        href: '/market-intelligence',
        badge: 'YENİ'
      },
      {
        id: 'price-tracker',
        title: 'Fiyat Takip Sistemi',
        icon: 'ShoppingCart',
        href: '/price-tracker',
        badge: 'YENİ'
      }
    ]
  },
  {
    title: '⚙️ Yönetim',
    icon: '⚙️',
    items: [
      {
        id: 'menu-management',
        title: 'Menü Yönetimi',
        icon: 'BookOpen',
        href: '/menu-management'
      },
      {
        id: 'reports',
        title: 'Raporlar',
        icon: 'BarChart3',
        href: '/reports'
      },
      {
        id: 'ai-settings',
        title: 'AI Ayarları',
        icon: 'Settings',
        href: '/ai-settings'
      }
    ]
  }
]

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    '🌟 Ana İş Akışı', '📊 Zekâ & Veriler', '⚙️ Yönetim'
  ])

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(title => title !== groupTitle)
        : [...prev, groupTitle]
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 
          w-72 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>ProCheff</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Teklif Zekâsı</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto max-h-screen">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.title)
            
            return (
              <div key={group.title} className="space-y-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl transition-colors hover:bg-gray-700/30"
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {group.title}
                  </span>
                  {isExpanded ? (
                    <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  )}
                </button>

                {/* Group Items */}
                {isExpanded && (
                  <div className="space-y-1 ml-2">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      const IconComponent = iconMap[item.icon]

                      return (
                        <Link key={item.id} href={item.href} onClick={onToggle}>
                          <div
                            className={`
                              group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200
                              ${isActive 
                                ? 'shadow-sm' 
                                : 'hover:bg-gray-700/30'
                              }
                            `}
                            style={{
                              backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                              borderLeft: isActive ? '3px solid var(--accent-secondary)' : 'none'
                            }}
                          >
                            {/* Active Indicator */}
                            {isActive && (
                              <div
                                className="absolute left-0 w-1 h-6 rounded-r"
                                style={{ backgroundColor: 'var(--accent-secondary)' }}
                              />
                            )}

                            {/* Icon */}
                            {IconComponent && (
                              <IconComponent 
                                size={18} 
                                className="mr-3 flex-shrink-0"
                                style={{ 
                                  color: isActive ? 'white' : 'var(--text-secondary)',
                                  fill: isActive ? 'currentColor' : 'none'
                                }}
                              />
                            )}

                            {/* Title */}
                            <span
                              className={`font-medium text-sm flex-1 ${
                                isActive ? 'text-white' : ''
                              }`}
                              style={{ 
                                color: isActive ? 'white' : 'var(--text-primary)' 
                              }}
                            >
                              {item.title}
                            </span>

                            {/* Badge */}
                            {item.badge && (
                              <span
                                className="px-2 py-0.5 text-xs font-semibold rounded-full animate-pulse"
                                style={{
                                  backgroundColor: 'var(--status-success)',
                                  color: 'white'
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer Status */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center space-x-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--status-success)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Tüm Sistemler Aktif
            </span>
          </div>
        </div>
      </div>
    </>
  )
}