'use client'

import React from 'react'
import { InfoCard } from '@/app/components/ui'

export interface MenuItem {
  id: string
  title: string
  icon: string
  count: string
  description: string
  category: string
  actions: string[]
}

export interface MenuCardProps {
  item: MenuItem
  onActionClick: (itemId: string, action: string) => void
  className?: string
}

export function MenuCard({ item, onActionClick, className = '' }: MenuCardProps) {
  const handleCardClick = () => {
    // Varsayılan aksiyon - genellikle ilk aksiyon
    if (item.actions.length > 0) {
      onActionClick(item.id, item.actions[0])
    }
  }

  return (
    <div className={`group ${className}`}>
      <InfoCard
        title={item.title}
        description={item.description}
        icon={item.icon}
        stats={`${item.count} öğe`}
        onClick={handleCardClick}
      />
      
      {/* Action Buttons */}
      <div className="mt-3 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {item.actions.slice(0, 3).map((action, index) => (
          <button
            key={action}
            onClick={(e) => {
              e.stopPropagation()
              onActionClick(item.id, action)
            }}
            className={`
              w-full text-left px-3 py-1.5 text-sm rounded transition-colors duration-150
              hover:bg-opacity-10
              ${index === 0 ? 'font-medium' : ''}
            `}
            style={{
              backgroundColor: 'transparent',
              color: index === 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderLeft: index === 0 ? '2px solid var(--accent-primary)' : 'none',
              paddingLeft: index === 0 ? '0.75rem' : '1rem'
            }}
          >
            {action}
          </button>
        ))}
        
        {item.actions.length > 3 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onActionClick(item.id, 'show-all')
            }}
            className="w-full text-left px-3 py-1.5 text-xs rounded transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
          >
            +{item.actions.length - 3} daha fazla...
          </button>
        )}
      </div>
    </div>
  )
}

export interface MenuGridProps {
  items: MenuItem[]
  selectedCategory: string
  onActionClick: (itemId: string, action: string) => void
  className?: string
}

export function MenuGrid({ 
  items, 
  selectedCategory, 
  onActionClick, 
  className = '' 
}: MenuGridProps) {
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {filteredItems.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          onActionClick={onActionClick}
        />
      ))}
      
      {filteredItems.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Bu kategoride öğe bulunamadı
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Farklı bir kategori seçin veya yeni öğe ekleyin
          </p>
        </div>
      )}
    </div>
  )
}