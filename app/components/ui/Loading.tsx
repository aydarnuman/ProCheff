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

// Chart Loading Skeleton
export interface ChartSkeletonProps {
  height?: string
  className?: string
}

export function ChartSkeleton({ 
  height = '300px', 
  className = '' 
}: ChartSkeletonProps) {
  return (
    <div className={`p-6 rounded-lg ${className}`} style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton width="200px" height="24px" />
        <Skeleton width="100px" height="32px" />
      </div>
      <div className="relative" style={{ height }}>
        {/* Chart bars simulation */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-2">
          {[60, 80, 45, 90, 70, 55, 85].map((barHeight, i) => (
            <div 
              key={i} 
              className="rounded-t animate-pulse"
              style={{ 
                width: '40px', 
                height: `${barHeight}%`, 
                backgroundColor: 'var(--bg-tertiary)' 
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Data Loading State with Error Handling
export interface DataLoadingStateProps {
  isLoading: boolean
  error?: string | null
  isEmpty?: boolean
  onRetry?: () => void
  loadingMessage?: string
  emptyMessage?: string
  children?: React.ReactNode
}

export function DataLoadingState({ 
  isLoading, 
  error, 
  isEmpty = false,
  onRetry,
  loadingMessage = 'Veriler yükleniyor...',
  emptyMessage = 'Veri bulunamadı',
  children
}: DataLoadingStateProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
          {loadingMessage}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--status-error)' }}>
          Bir hata oluştu
        </h3>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            Tekrar Dene
          </button>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <div className="text-4xl mb-4">📭</div>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return <>{children}</>
}

// Page Loader
export interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message = 'Sayfa yükleniyor...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </div>
    </div>
  )
}