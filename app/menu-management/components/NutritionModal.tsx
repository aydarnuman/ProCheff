'use client'

import React, { useState } from 'react'
import { Modal, Button, ButtonGroup } from '@/app/components/ui'

export interface NutritionModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemTitle: string
}

export function NutritionModal({ 
  isOpen, 
  onClose, 
  itemId, 
  itemTitle 
}: NutritionModalProps) {
  const [activeTab, setActiveTab] = useState<'nutrition' | 'portions' | 'allergies'>('nutrition')

  const nutritionData = {
    nutrition: {
      calories: '450 kcal',
      protein: '25g',
      carbs: '35g',
      fat: '18g',
      fiber: '8g',
      sodium: '650mg'
    },
    portions: {
      defaultSize: '200g',
      servings: '4 kişilik',
      prepTime: '25 dk',
      cookTime: '45 dk',
      totalTime: '1 saat 10 dk'
    },
    allergies: [
      { name: 'Gluten', present: true },
      { name: 'Süt', present: false },
      { name: 'Yumurta', present: true },
      { name: 'Fındık', present: false },
      { name: 'Soya', present: false }
    ]
  }

  const tabs = [
    { id: 'nutrition' as const, label: 'Beslenme Değerleri', icon: '🥗' },
    { id: 'portions' as const, label: 'Porsiyon & Süre', icon: '⏱️' },
    { id: 'allergies' as const, label: 'Allerjen Bilgisi', icon: '⚠️' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${itemTitle} - Beslenme & Porsiyon Bilgileri`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <ButtonGroup className="w-full">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1"
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </ButtonGroup>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'nutrition' && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(nutritionData.nutrition).map(([key, value]) => (
                <div 
                  key={key}
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-secondary)'
                  }}
                >
                  <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    {key === 'calories' ? 'Kalori' :
                     key === 'protein' ? 'Protein' :
                     key === 'carbs' ? 'Karbonhidrat' :
                     key === 'fat' ? 'Yağ' :
                     key === 'fiber' ? 'Lif' :
                     'Sodyum'}
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'portions' && (
            <div className="space-y-4">
              {Object.entries(nutritionData.portions).map(([key, value]) => (
                <div 
                  key={key}
                  className="flex justify-between items-center p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-secondary)'
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {key === 'defaultSize' ? 'Varsayılan Porsiyon' :
                     key === 'servings' ? 'Servis Miktarı' :
                     key === 'prepTime' ? 'Hazırlık Süresi' :
                     key === 'cookTime' ? 'Pişirme Süresi' :
                     'Toplam Süre'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'allergies' && (
            <div className="space-y-3">
              {nutritionData.allergies.map((allergy) => (
                <div 
                  key={allergy.name}
                  className="flex justify-between items-center p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-secondary)'
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {allergy.name}
                  </span>
                  <span 
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      allergy.present ? 'text-white' : ''
                    }`}
                    style={{
                      backgroundColor: allergy.present 
                        ? 'var(--status-warning)' 
                        : 'var(--status-success)',
                      color: allergy.present ? 'white' : 'white'
                    }}
                  >
                    {allergy.present ? 'İçerir' : 'İçermez'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
          <Button variant="secondary" onClick={onClose}>
            Kapat
          </Button>
          <Button variant="primary">
            Düzenle
          </Button>
        </div>
      </div>
    </Modal>
  )
}