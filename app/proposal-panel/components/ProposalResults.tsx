'use client'

import React from 'react'
import { Download, TrendingUp, Shield } from 'lucide-react'

export interface ProposalResultsData {
  institutionName: string
  totalCost: number
  profitMargin: number
  finalPrice: number
  costPerPortion: number
  menuItems: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
    category: string
  }>
  riskAssessment: {
    marketVolatility: 'low' | 'medium' | 'high'
    supplierRisk: 'low' | 'medium' | 'high'
    overallRisk: 'low' | 'medium' | 'high'
  }
  aiRecommendations: {
    costOptimizations: string[]
    competitiveAdvantages: string[]
    marketInsights: string[]
  }
  metadata: {
    proposalId: string
    processingTime: number
    aiConfidence: number
    validUntil: Date
  }
}

export interface ProposalResultsProps {
  results: ProposalResultsData
  onExport: (format: 'json' | 'summary') => void
  className?: string
}

export function ProposalResults({
  results,
  onExport,
  className = ''
}: ProposalResultsProps) {

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return { bg: 'var(--bg-success-subtle)', text: 'var(--status-success)' }
      case 'medium': return { bg: 'var(--bg-warning-subtle)', text: 'var(--status-warning)' }
      case 'high': return { bg: 'var(--bg-error-subtle)', text: 'var(--status-error)' }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Teklif Özeti */}
      <div className="p-6 rounded-xl border" 
           style={{ 
             backgroundColor: 'var(--bg-accent-subtle)',
             borderColor: 'var(--border-primary)'
           }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}>
          <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
          Teklif Özeti
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)' }}>Kurum:</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {results.institutionName}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)' }}>Toplam Maliyet:</span>
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              ₺{results.totalCost.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)' }}>Kar Marjı:</span>
            <span className="text-lg font-semibold" style={{ color: 'var(--status-success)' }}>
              %{results.profitMargin}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t"
               style={{ borderColor: 'var(--border-secondary)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Satış Fiyatı:</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>
              ₺{results.finalPrice.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)' }}>Porsiyon Başı:</span>
            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              ₺{results.costPerPortion.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Değerlendirmesi */}
      <div className="p-6 rounded-xl border" 
           style={{ 
             backgroundColor: 'var(--bg-secondary)',
             borderColor: 'var(--border-primary)'
           }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}>
          <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
          Risk Analizi
        </h3>
        
        <div className="space-y-3">
          {[
            { label: 'Pazar Riski', risk: results.riskAssessment.marketVolatility },
            { label: 'Tedarikçi Riski', risk: results.riskAssessment.supplierRisk },
            { label: 'Genel Risk', risk: results.riskAssessment.overallRisk }
          ].map((item, index) => {
            const colors = getRiskColor(item.risk)
            return (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.label}
                </span>
                <span 
                  className="px-2 py-1 text-xs rounded-full font-medium"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text
                  }}
                >
                  {item.risk.toUpperCase()}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Önerileri */}
      <div className="p-6 rounded-xl border" 
           style={{ 
             backgroundColor: 'var(--bg-secondary)',
             borderColor: 'var(--border-primary)'
           }}>
        <h3 className="text-lg font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}>
          🤖 AI Önerileri
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Maliyet Optimizasyonu
            </h4>
            <ul className="space-y-1">
              {results.aiRecommendations.costOptimizations.slice(0, 2).map((rec: any, idx: number) => (
                <li key={idx} className="text-xs flex items-start gap-2"
                    style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--status-success)' }}>•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Rekabet Avantajları
            </h4>
            <ul className="space-y-1">
              {results.aiRecommendations.competitiveAdvantages.slice(0, 2).map((rec: any, idx: number) => (
                <li key={idx} className="text-xs flex items-start gap-2"
                    style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* İndir Butonları */}
      <div className="p-6 rounded-xl border" 
           style={{ 
             backgroundColor: 'var(--bg-secondary)',
             borderColor: 'var(--border-primary)'
           }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}>
          <Download size={20} style={{ color: 'var(--accent-primary)' }} />
          İndir
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={() => onExport('summary')}
            className="w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            style={{
              backgroundColor: 'var(--status-success)',
              color: 'white'
            }}
          >
            📄 Özet Rapor (.txt)
          </button>
          
          <button
            onClick={() => onExport('json')}
            className="w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            💾 Detaylı Veri (.json)
          </button>
        </div>
      </div>

      {/* Meta Bilgiler */}
      <div className="p-4 rounded-xl" 
           style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
          <div>ID: {results.metadata.proposalId}</div>
          <div>İşlem Süresi: {results.metadata.processingTime}ms</div>
          <div>AI Güven: %{Math.round(results.metadata.aiConfidence * 100)}</div>
          <div>Geçerlilik: {results.metadata.validUntil.toLocaleDateString('tr-TR')}</div>
        </div>
      </div>
    </div>
  )
}