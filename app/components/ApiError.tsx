'use client'

import React from 'react'

interface ApiErrorProps {
  error: string
  onRetry?: () => void
  onCancel?: () => void
}

export default function ApiError({ error, onRetry, onCancel }: ApiErrorProps) {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
      <div className="flex items-start space-x-4">
        
        {/* Error Icon */}
        <div className="text-2xl">⚠️</div>
        
        {/* Error Content */}
        <div className="flex-1">
          <h3 className="text-red-400 font-semibold text-lg mb-2">
            API Hatası
          </h3>
          <p className="text-red-300 text-sm mb-4">
            {error || 'Bilinmeyen bir hata oluştu'}
          </p>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🔄 Tekrar Dene
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ✕ İptal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Network Error Component
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ApiError
      error="Ağ bağlantısı sorunu. İnternet bağlantınızı kontrol edin."
      onRetry={onRetry}
    />
  )
}

/**
 * Server Error Component  
 */
export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ApiError
      error="Sunucu hatası. Lütfen birkaç dakika sonra tekrar deneyin."
      onRetry={onRetry}
    />
  )
}

/**
 * API Key Error Component
 */
export function ApiKeyError({ provider }: { provider?: string }) {
  return (
    <ApiError
      error={`${provider || 'API'} servisi yapılandırılmamış. Lütfen API ayarlarını kontrol edin.`}
    />
  )
}