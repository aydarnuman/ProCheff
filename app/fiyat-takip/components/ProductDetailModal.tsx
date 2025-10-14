'use client'

import React from 'react'
import { Modal } from '@/app/components/ui'
import { PriceProduct, PriceHistoryEntry } from '@/lib/data/priceTracking'
import { X, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock, Truck, Star, Calendar } from 'lucide-react'

export interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: PriceProduct | null
  className?: string
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  className = ''
}: ProductDetailModalProps) {
  if (!product) return null

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} style={{ color: 'var(--status-error)' }} />
      case 'down': return <TrendingDown size={16} style={{ color: 'var(--status-success)' }} />
      case 'stable': return <Minus size={16} style={{ color: 'var(--text-muted)' }} />
      default: return null
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'var(--status-error)'
      case 'down': return 'var(--status-success)'
      case 'stable': return 'var(--text-muted)'
      default: return 'var(--text-muted)'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'var(--status-success)'
      case 'limited': return 'var(--status-warning)'
      case 'unavailable': return 'var(--status-error)'
      default: return 'var(--text-muted)'
    }
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'premium': return '⭐⭐⭐'
      case 'standard': return '⭐⭐'
      case 'economy': return '⭐'
      default: return ''
    }
  }

  const formatPrice = (price: number) => `₺${price.toFixed(2)}`
  const formatDate = (date: Date) => date.toLocaleDateString('tr-TR')

  const priceChange = product.currentPrice - product.previousPrice
  const priceChangePercent = ((priceChange / product.previousPrice) * 100).toFixed(1)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${product.name} - Fiyat Detayı`}
      className={className}
    >
      <div className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol Panel - Fiyat Bilgileri */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                💰 Fiyat Bilgileri
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Güncel Fiyat:</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(product.currentPrice)} / {product.unit}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Önceki Fiyat:</span>
                  <span className="text-lg" style={{ color: 'var(--text-muted)' }}>
                    {formatPrice(product.previousPrice)} / {product.unit}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Değişim:</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(product.trend)}
                    <span
                      className="font-medium"
                      style={{ color: getTrendColor(product.trend) }}
                    >
                      {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)} 
                      ({priceChange >= 0 ? '+' : ''}{priceChangePercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ürün Bilgileri */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                📦 Ürün Bilgileri
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kategori:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {product.category}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kalite:</span>
                  <div className="flex items-center gap-2">
                    <span>{getQualityIcon(product.quality)}</span>
                    <span className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                      {product.quality}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Durum:</span>
                  <div className="flex items-center gap-2">
                    {product.status === 'available' && <CheckCircle size={14} style={{ color: 'var(--status-success)' }} />}
                    {product.status === 'limited' && <AlertTriangle size={14} style={{ color: 'var(--status-warning)' }} />}
                    {product.status === 'unavailable' && <X size={14} style={{ color: 'var(--status-error)' }} />}
                    <span
                      className="font-medium capitalize"
                      style={{ color: getStatusColor(product.status) }}
                    >
                      {product.status === 'available' ? 'Mevcut' : 
                       product.status === 'limited' ? 'Sınırlı' : 'Mevcut Değil'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tedarikçi:</span>
                  <div className="flex items-center gap-2">
                    <Truck size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {product.supplier}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Son Güncelleme:</span>
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(product.lastUpdate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Panel - Mevsimsellik ve Uyarılar */}
          <div className="space-y-4">
            {/* Mevsimsel Bilgi */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                🌱 Mevsimsellik
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Mevsimi:</span>
                  <div className="flex items-center gap-2">
                    {product.seasonality.inSeason ? (
                      <CheckCircle size={14} style={{ color: 'var(--status-success)' }} />
                    ) : (
                      <X size={14} style={{ color: 'var(--status-error)' }} />
                    )}
                    <span
                      className="font-medium"
                      style={{ color: product.seasonality.inSeason ? 'var(--status-success)' : 'var(--status-error)' }}
                    >
                      {product.seasonality.inSeason ? 'Mevsimi' : 'Mevsimi Değil'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Verim Ayları:</span>
                  <div className="flex flex-wrap gap-1">
                    {product.seasonality.peakMonths.map((month, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: 'var(--bg-accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Aktif Uyarılar */}
            {product.alerts.length > 0 && (
              <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-warning-subtle)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  ⚠️ Aktif Uyarılar
                </h3>
                
                <div className="space-y-2">
                  {product.alerts.filter(alert => alert.isActive).map((alert, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle size={14} className="mt-0.5" style={{ color: 'var(--status-warning)' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {alert.message}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fiyat Geçmişi */}
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            📈 Fiyat Geçmişi (Son 7 Gün)
          </h3>
          
          <div className="space-y-2">
            {product.priceHistory.slice(0, 7).map((entry, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg" 
                   style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="flex items-center gap-3">
                  <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatDate(entry.date)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {entry.supplier}
                  </span>
                  <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(entry.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Butonları */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)'
            }}
          >
            Kapat
          </button>
          
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            Uyarı Ayarla
          </button>
        </div>
      </div>
    </Modal>
  )
}