import React from 'react'
import { getIcon } from '@/lib/utils/icons'

export interface BaseCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'stable'
  icon?: string
  className?: string
}

export interface InfoCardProps {
  title: string
  description: string
  icon?: string
  badge?: string
  badgeType?: 'new' | 'priority' | 'status'
  href?: string
  stats?: string
  onClick?: () => void
  className?: string
}

/**
 * Temel kart bileşeni - diğer tüm kartlar için temel
 */
export function BaseCard({ 
  children, 
  className = '', 
  onClick, 
  hover = false,
  padding = 'md'
}: BaseCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  }

  return (
    <div
      className={`
        rounded-xl border transition-all duration-300 ease-out
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]' : ''}
        ${onClick ? 'cursor-pointer active:scale-95' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)'
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/**
 * İstatistik kartı - dashboard'da sayılar göstermek için
 * React.memo ile optimize edilmiş - gereksiz re-render önlenir
 */
export const StatCard = React.memo(function StatCard({ 
  title, 
  value, 
  change, 
  trend = 'stable', 
  icon, 
  className = '' 
}: StatCardProps) {
  const getTrendColor = (trend: string) => {
    // Financial standard colors: green = increase, red = decrease
    switch (trend) {
      case 'up': return 'var(--status-success)' // Green for positive/increase
      case 'down': return 'var(--status-error)' // Red for negative/decrease
      default: return 'var(--text-muted)'
    }
  }

  return (
    <BaseCard hover className={className}>
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <div className="text-2xl">
            {getIcon(icon, { size: 24 })}
          </div>
        )}
        {change && (
          <div 
            className="text-xs font-medium"
            style={{ color: getTrendColor(trend) }}
          >
            {change}
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {title}
      </div>
    </BaseCard>
  )
})

/**
 * Bilgi kartı - özellikler, modüller için
 * React.memo ile optimize edilmiş
 */
export const InfoCard = React.memo(function InfoCard({ 
  title, 
  description, 
  icon, 
  badge, 
  badgeType = 'status',
  href,
  stats,
  onClick,
  className = '' 
}: InfoCardProps) {
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'new':
        return {
          backgroundColor: 'var(--status-success)',
          color: 'white'
        }
      case 'priority':
        return {
          backgroundColor: 'var(--status-warning)',
          color: 'white'
        }
      default:
        return {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)'
        }
    }
  }

  const CardWrapper = href ? 'a' : 'div'
  const cardProps = href ? { href } : {}

  return (
    <CardWrapper {...cardProps}>
      <BaseCard 
        hover={!!href || !!onClick} 
        onClick={onClick}
        className={`group ${className}`}
        padding="lg"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="text-2xl">
                {getIcon(icon, { size: 24 })}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
                {badge && (
                  <span 
                    className="px-2 py-0.5 text-xs font-semibold rounded-full"
                    style={getBadgeStyle(badgeType)}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {description}
              </p>
            </div>
          </div>
          
          {(href || onClick) && (
            <div 
              className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
              style={{ color: 'var(--text-muted)' }}
            >
              →
            </div>
          )}
        </div>
        
        {stats && (
          <div 
            className="text-xs font-medium pt-2 border-t"
            style={{ 
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-secondary)'
            }}
          >
            {stats}
          </div>
        )}
      </BaseCard>
    </CardWrapper>
  )
})