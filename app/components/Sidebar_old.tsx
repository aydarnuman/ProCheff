'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  href: string;
  active: boolean;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Ana Sayfa',
    icon: '🏠',
    href: '/',
    active: true
  },
  {
    id: 'proposal-panel',
    title: 'Teklif Paneli',
    icon: '📊',
    href: '/proposal-panel',
    active: false,
    badge: 'YENİ' as const
  },
  {
    id: 'spec-parser',
    title: 'Şartname Analizi',
    icon: '📄',
    href: '/spec-parser',
    active: false
  },
  {
    id: 'spec-database',
    title: 'Şartname Veritabanı',
    icon: '🗄️',
    href: '/spec-database',
    active: false
  },
  {
    id: 'market-intelligence',
    title: 'Piyasa Trend Zekâsı',
    icon: '📈',
    href: '/market-intelligence',
    active: false,
    badge: 'YENİ' as const
  },
  {
    id: 'recipe-adapter',
    title: 'Tarif Adaptörü',
    icon: '🍽️',
    href: '/recipe-adapter',
    active: false
  },
  {
    id: 'cost-simulator',
    title: 'Maliyet Simülasyonu',
    icon: '💰',
    href: '/cost-simulator',
    active: false
  },
  {
    id: 'menu-management',
    title: 'Menü Yönetimi',
    icon: '🍽️',
    href: '/menu-management',
    active: false
  },
  {
    id: 'reports',
    title: 'Raporlar',
    icon: '�',
    href: '/reports',
    active: false
  },
  {
    id: 'ai-settings',
    title: 'AI Ayarları',
    icon: '🤖',
    href: '/ai-settings',
    active: false
  },
  {
    id: 'settings',
    title: 'Sistem Ayarları',
    icon: '⚙️',
    href: '/settings',
    active: false
  }
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('dashboard')

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
        w-64 flex flex-col border-r border-gray-700
      `}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">👨‍🍳</div>
              <h1 className="text-xl font-bold text-white">ProCheff</h1>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">Chef Management System</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => setActiveItem(item.id)}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative
                    ${activeItem === item.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              N
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Numan Aydar</p>
              <p className="text-xs text-gray-400 truncate">Chef Manager</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}