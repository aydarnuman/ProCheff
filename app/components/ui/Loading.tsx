import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'var(--accent-primary)',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${className}`}
      style={{ borderColor: color, borderTopColor: 'transparent' }}
    />
  )
}

export interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = 'Yükleniyor...',
  className = '' 
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-lg"
          style={{ 
            backgroundColor: 'rgba(var(--bg-primary-rgb), 0.8)',
            backdropFilter: 'blur(2px)'
          }}
        >
          <div className="text-center">
            <LoadingSpinner size="lg" />
            {message && (
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  lines?: number
  rounded?: boolean
}

export function Skeleton({ 
  className = '',
  width = '100%',
  height = '1rem',
  lines = 1,
  rounded = false
}: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`animate-pulse mb-2 last:mb-0 ${rounded ? 'rounded-full' : 'rounded'}`}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              width: index === lines - 1 ? '75%' : width,
              height
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div 
      className={`animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        width,
        height
      }}
    />
  )
}

export interface CardSkeletonProps {
  className?: string
  showImage?: boolean
  showButton?: boolean
}

export function CardSkeleton({ 
  className = '', 
  showImage = true, 
  showButton = false 
}: CardSkeletonProps) {
  return (
    <div 
      className={`p-6 rounded-xl border ${className}`}
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)'
      }}
    >
      <div className="flex items-start space-x-4">
        {showImage && (
          <Skeleton width="3rem" height="3rem" rounded />
        )}
        <div className="flex-1">
          <Skeleton height="1.25rem" className="mb-2" />
          <Skeleton lines={2} height="0.875rem" className="mb-4" />
          {showButton && (
            <Skeleton width="6rem" height="2rem" rounded />
          )}
        </div>
      </div>
    </div>
  )
}

export interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}: TableSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} height="1rem" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="0.875rem" />
          ))}
        </div>
      ))}
    </div>
  )
}