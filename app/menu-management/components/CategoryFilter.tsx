'use client'

import React from 'react'
import { getIcon } from '@/lib/utils/icons'

export interface Category {
  id: string
  title: string
  icon: string
  count?: number
}

export interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
  className?: string
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  className = ''
}: CategoryFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id
        
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg border 
              transition-all duration-200 hover:shadow-sm
              ${isSelected ? 'scale-105' : 'hover:scale-102'}
            `}
            style={{
              backgroundColor: isSelected 
                ? 'var(--accent-primary)' 
                : 'var(--bg-secondary)',
              borderColor: isSelected 
                ? 'var(--accent-primary)' 
                : 'var(--border-primary)',
              color: isSelected ? 'white' : 'var(--text-primary)'
            }}
          >
            <span className="text-sm">
              {getIcon(category.icon, { size: 16 })}
            </span>
            <span className="font-medium text-sm">
              {category.title}
            </span>
            {category.count && (
              <span 
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: isSelected 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'var(--bg-tertiary)',
                  color: isSelected ? 'white' : 'var(--text-muted)'
                }}
              >
                {category.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}