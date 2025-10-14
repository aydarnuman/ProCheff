'use client'

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  text?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'text-blue-500',
  text = 'Yükleniyor...' 
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      
      {/* Spinner */}
      <div 
        className={`${sizeClasses[size]} ${color} animate-spin`}
        role="status"
        aria-label="Yükleniyor"
      >
        <svg 
          className="w-full h-full" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      {/* Text */}
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  )
}

/**
 * Inline Loading Spinner (for buttons etc.)
 */
export function InlineSpinner({ 
  size = 'sm', 
  className = '' 
}: { 
  size?: 'sm' | 'md'
  className?: string 
}) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  
  return (
    <div 
      className={`${sizeClass} animate-spin ${className}`}
      role="status"
    >
      <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

/**
 * Full Screen Loading
 */
export function FullScreenLoading({ text = 'Sistem yükleniyor...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-50">
      <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  )
}