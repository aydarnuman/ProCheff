'use client'

import React from 'react'

/**
 * Basic Skeleton Box
 */
export function SkeletonBox({ 
  className = '',
  height = 'h-4',
  animated = true 
}: {
  className?: string
  height?: string
  animated?: boolean
}) {
  return (
    <div 
      className={`
        bg-gray-700/50 rounded ${height} ${className}
        ${animated ? 'animate-pulse' : ''}
      `}
      role="status"
      aria-label="Yükleniyor"
    />
  )
}

/**
 * Card Skeleton
 */
export function SkeletonCard() {
  return (
    <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
      <div className="animate-pulse">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <SkeletonBox className="w-12 h-12 rounded-full" animated={false} />
          <div className="flex-1">
            <SkeletonBox className="w-3/4 mb-2" height="h-5" animated={false} />
            <SkeletonBox className="w-1/2" height="h-3" animated={false} />
          </div>
        </div>

        {/* Content Lines */}
        <div className="space-y-3">
          <SkeletonBox className="w-full" height="h-3" animated={false} />
          <SkeletonBox className="w-4/5" height="h-3" animated={false} />
          <SkeletonBox className="w-3/5" height="h-3" animated={false} />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <SkeletonBox className="w-20" height="h-8" animated={false} />
          <SkeletonBox className="w-16" height="h-8" animated={false} />
        </div>
      </div>
    </div>
  )
}

/**
 * Stats Card Skeleton
 */
export function SkeletonStatsCard() {
  return (
    <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
      <div className="animate-pulse">
        
        {/* Icon + Badge */}
        <div className="flex justify-between items-start mb-4">
          <SkeletonBox className="w-8 h-8 rounded-lg" animated={false} />
          <SkeletonBox className="w-12" height="h-5" animated={false} />
        </div>

        {/* Main Value */}
        <SkeletonBox className="w-20 mb-2" height="h-8" animated={false} />
        
        {/* Label */}
        <SkeletonBox className="w-16" height="h-4" animated={false} />
      </div>
    </div>
  )
}

/**
 * List Item Skeleton
 */
export function SkeletonListItem() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-700/50">
      <div className="animate-pulse flex-1 flex items-center space-x-4">
        
        {/* Avatar */}
        <SkeletonBox className="w-10 h-10 rounded-full" animated={false} />
        
        {/* Content */}
        <div className="flex-1">
          <SkeletonBox className="w-3/4 mb-2" height="h-4" animated={false} />
          <SkeletonBox className="w-1/2" height="h-3" animated={false} />
        </div>
        
        {/* Action */}
        <SkeletonBox className="w-16" height="h-6" animated={false} />
      </div>
    </div>
  )
}

/**
 * AI Settings Skeleton
 */
export function SkeletonAISettings() {
  return (
    <div className="space-y-6">
      
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <SkeletonBox className="w-48 mb-2" height="h-8" animated={false} />
        <SkeletonBox className="w-72" height="h-5" animated={false} />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-1 bg-gray-800/40 rounded-xl p-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBox 
            key={i} 
            className="flex-1" 
            height="h-10" 
            animated={false} 
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * Dashboard Stats Skeleton
 */
export function SkeletonDashboardStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonStatsCard key={i} />
      ))}
    </div>
  )
}