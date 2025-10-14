'use client'

import React from 'react'
import { Input, Textarea, Select, Button } from '@/app/components/ui'
import { useFormValidation, commonValidations, ValidationRules } from '@/lib/hooks/useFormValidation'
import { InstitutionProfile } from '@/lib/services/specParser'

export interface ProposalFormData {
  institutionName: string
  institutionCode: string
  personCount: number
  meatPortion: number
  chickenPortion: number
  vegetablePortion: number
  oilPortion: number
  saltPortion: number
  ricePortion: number
  bulgurPortion: number
  breadPortion: number
  profitMargin: number
  validityDays: number
  deliveryTerms: string
  paymentTerms: string
  specialNotes: string
  prioritizeLocalSuppliers: boolean
  organicPreference: boolean
  seasonalMenu: boolean
}

export interface ProposalFormProps {
  formData: ProposalFormData
  errors: Record<string, string>
  onSubmit: (data: ProposalFormData) => void
  onFieldChange: (field: keyof ProposalFormData, value: any) => void
  isGenerating: boolean
  className?: string
}

export function ProposalForm({
  formData,
  errors,
  onSubmit,
  onFieldChange,
  isGenerating,
  className = ''
}: ProposalFormProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Kurum Bilgileri */}
      <div className="p-6 rounded-xl border space-y-4" 
           style={{ 
             backgroundColor: 'var(--bg-secondary)',
             borderColor: 'var(--border-primary)'
           }}>
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          📋 Kurum Bilgileri
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Kurum Adı
            </label>
            <input
              type="text"
              value={formData.institutionName}
              onChange={(e) => onFieldChange('institutionName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border transition-colors duration-200"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: errors.institutionName ? 'var(--status-error)' : 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              placeholder="Örn: Ankara Üniversitesi PMYO"
            />
            {errors.institutionName && (
              <p className="text-xs mt-1" style={{ color: 'var(--status-error)' }}>
                {errors.institutionName}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Kurum Kodu
            </label>
            <input
              type="text"
              value={formData.institutionCode}
              onChange={(e) => onFieldChange('institutionCode', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border transition-colors duration-200"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: errors.institutionCode ? 'var(--status-error)' : 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              placeholder="Örn: AU001"
            />
            {errors.institutionCode && (
              <p className="text-xs mt-1" style={{ color: 'var(--status-error)' }}>
                {errors.institutionCode}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Kişi Sayısı
            </label>
            <input
              type="number"
              value={formData.personCount}
              onChange={(e) => onFieldChange('personCount', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border transition-colors duration-200"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: errors.personCount ? 'var(--status-error)' : 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              min="1"
            />
            {errors.personCount && (
              <p className="text-xs mt-1" style={{ color: 'var(--status-error)' }}>
                {errors.personCount}
              </p>
            )}
          </div>
        </div>

        {/* Gramaj Bilgileri */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            Gramaj Gereksinimleri (g/porsiyon)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'meatPortion', label: 'Et' },
              { key: 'chickenPortion', label: 'Tavuk' },
              { key: 'vegetablePortion', label: 'Sebze' },
              { key: 'oilPortion', label: 'Yağ' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </label>
                <input
                  type="number"
                  value={formData[key as keyof ProposalFormData] as number}
                  onChange={(e) => onFieldChange(key as keyof ProposalFormData, Number(e.target.value))}
                  className="w-full px-2 py-1 text-sm rounded border"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-primary)'
                  }}
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teklif Ayarları */}
      <div className="p-6 rounded-xl border space-y-4" 
           style={{ 
             backgroundColor: 'var(--bg-secondary)',
             borderColor: 'var(--border-primary)'
           }}>
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          ⚙️ Teklif Ayarları
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Hedef Kar Marjı (%)
            </label>
            <input
              type="number"
              value={formData.profitMargin}
              onChange={(e) => onFieldChange('profitMargin', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: errors.profitMargin ? 'var(--status-error)' : 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              min="0"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Geçerlilik Süresi (Gün)
            </label>
            <input
              type="number"
              value={formData.validityDays}
              onChange={(e) => onFieldChange('validityDays', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Teslimat Koşulları
            </label>
            <select
              value={formData.deliveryTerms}
              onChange={(e) => onFieldChange('deliveryTerms', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="Kurum teslimatı">Kurum Teslimatı</option>
              <option value="Depo teslimi">Depo Teslimi</option>
              <option value="Franco fabrika">Franco Fabrika</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Ödeme Koşulları
            </label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => onFieldChange('paymentTerms', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="Peşin ödeme">Peşin Ödeme</option>
              <option value="15 gün vadeli">15 Gün Vadeli</option>
              <option value="30 gün vadeli">30 Gün Vadeli</option>
              <option value="45 gün vadeli">45 Gün Vadeli</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Özel Notlar
            </label>
            <textarea
              value={formData.specialNotes}
              onChange={(e) => onFieldChange('specialNotes', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border resize-none"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              rows={3}
              placeholder="İlave koşullar ve notlar..."
            />
          </div>
        </div>
      </div>

      {/* Özelleştirmeler */}
      <div className="p-6 rounded-xl border space-y-4" 
           style={{ 
             backgroundColor: 'var(--bg-secondary)',
             borderColor: 'var(--border-primary)'
           }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          🎛️ Özelleştirmeler
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.prioritizeLocalSuppliers}
              onChange={(e) => onFieldChange('prioritizeLocalSuppliers', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Yerel tedarikçileri öncelendir
            </span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.organicPreference}
              onChange={(e) => onFieldChange('organicPreference', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Organik ürünleri tercih et
            </span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.seasonalMenu}
              onChange={(e) => onFieldChange('seasonalMenu', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Mevsimsel menü planı
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={isGenerating}
          className="px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white'
          }}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              AI Teklif Oluşturuyor...
            </>
          ) : (
            <>
              🚀 Otomatik Teklif Oluştur
            </>
          )}
        </button>
      </div>
    </form>
  )
}