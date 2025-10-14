'use client'

import { useState } from 'react'
import { ProposalGenerator, ProposalRequest, GeneratedProposal } from '@/lib/services/proposalGenerator'
import { InstitutionProfile } from '@/lib/services/specParser'
import { ProgressTracker, ProposalForm, ProposalResults } from './components'
import { BaseCard } from '@/app/components/ui/Card'
import { useFormValidation } from '@/lib/hooks/useFormValidation'
import { Play, Download, Shield, TrendingUp, CheckCircle, Clock, ArrowRight, Settings, Building, Calculator, FileText } from 'lucide-react'

export default function ProposalPanelPage() {
  const [generator] = useState(new ProposalGenerator())
  const [isGenerating, setIsGenerating] = useState(false)
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [showResults, setShowResults] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    institutionName: 'Ankara Üniversitesi PMYO',
    institutionCode: 'AU001',
    personCount: 500,
    meatPortion: 120,
    chickenPortion: 100,
    vegetablePortion: 50,
    oilPortion: 15,
    saltPortion: 2,
    ricePortion: 80,
    bulgurPortion: 60,
    breadPortion: 100,
    profitMargin: 20,
    validityDays: 30,
    deliveryTerms: 'Kurum teslimatı',
    paymentTerms: '30 gün vadeli',
    specialNotes: '',
    prioritizeLocalSuppliers: true,
    organicPreference: false,
    seasonalMenu: true
  })

  const { errors, validateField } = useFormValidation({
    institutionName: 'required|string|min:3',
    institutionCode: 'required|string|min:3',
    personCount: 'required|numeric|min:1',
    meatPortion: 'required|numeric|min:0',
    chickenPortion: 'required|numeric|min:0',
    vegetablePortion: 'required|numeric|min:0',
    profitMargin: 'required|numeric|min:0|max:100'
  })

  const [selectedRecipes] = useState(['recipe001', 'recipe002'])
  
  const [proposalSettings, setProposalSettings] = useState({
    profitMargin: 20,
    validityDays: 30,
    deliveryTerms: 'Kurum teslimatı',
    paymentTerms: '30 gün vadeli',
    specialNotes: ''
  })

  const [customizations, setCustomizations] = useState({
    prioritizeLocalSuppliers: true,
    organicPreference: false,
    seasonalMenu: true
  })

  const steps = [
    { id: 0, name: 'Kurum Profili', icon: Building, desc: 'Kurum bilgileri ve gereksinimler' },
    { id: 1, name: 'Tarif Seçimi', icon: FileText, desc: 'Menü içeriği belirleme' },
    { id: 2, name: 'Maliyet Ayarları', icon: Calculator, desc: 'Kar marjı ve fiyatlandırma' },
    { id: 3, name: 'Teklif Üretimi', icon: TrendingUp, desc: 'AI ile otomatik teklif oluşturma' }
  ]

  const handleGenerateProposal = async (data: typeof formData) => {
    setIsGenerating(true)
    setCurrentStep(3)
    
    try {
      // Convert form data to request format
      const institutionProfile: InstitutionProfile = {
        kurum: data.institutionName,
        kurumKodu: data.institutionCode,
        tarih: new Date(),
        porsiyon: {
          et: data.meatPortion,
          tavuk: data.chickenPortion,
          sebze: data.vegetablePortion,
          yag: data.oilPortion,
          tuz: data.saltPortion,
          pirinc: data.ricePortion,
          bulgur: data.bulgurPortion,
          ekmek: data.breadPortion
        },
        menuTipi: 'Günlük 3 öğün',
        ogunSayisi: 3,
        kisiSayisi: data.personCount,
        ozelKosullar: ['Helal sertifikalı', 'Sıcak servis'],
        hijyenKosullar: ['HACCP', 'ISO 22000'],
        servisKosullar: ['Sıcak servis'],
        maliyetSiniri: {
          maksimum: 25.0
        },
        teslimKosullar: {
          sıklık: 'Günlük'
        },
        metadata: {
          processedAt: new Date(),
          confidence: 0.9,
          sourceFile: 'manual'
        }
      }
      
      const request: ProposalRequest = {
        institutionProfile,
        selectedRecipes,
        proposalSettings: {
          profitMargin: data.profitMargin,
          validityDays: data.validityDays,
          deliveryTerms: data.deliveryTerms,
          paymentTerms: data.paymentTerms,
          specialNotes: data.specialNotes
        },
        customizations: {
          prioritizeLocalSuppliers: data.prioritizeLocalSuppliers,
          organicPreference: data.organicPreference,
          seasonalMenu: data.seasonalMenu
        }
      }

      const progressSteps = [
        'Kurum profilini analiz ediyor...',
        'Tarifleri adapte ediyor...',
        'Maliyetleri hesaplıyor...',
        'Tedarikçileri optimize ediyor...',
        'Risk analizini yapıyor...',
        'AI önerilerini oluşturuyor...',
        'Teklifi hazırlıyor...'
      ]

      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const result = await generator.generateCompleteProposal(request)
      setProposal(result)
      
    } catch (error) {
      console.error('Teklif üretim hatası:', error)
      alert('Teklif üretimi sırasında hata oluştu')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadProposal = (format: 'json' | 'summary') => {
    if (!proposal) return

    const content = format === 'json' 
      ? JSON.stringify(proposal, null, 2)
      : `TEKLIF ÖZETI\n============\nKurum: ${proposal.institutionName}\n...`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `teklif_${proposal.institutionName}_${format}.${format === 'json' ? 'json' : 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return { bg: 'var(--bg-success-subtle)', text: 'var(--status-success)' }
      case 'medium': return { bg: 'var(--bg-warning-subtle)', text: 'var(--status-warning)' }
      case 'high': return { bg: 'var(--bg-error-subtle)', text: 'var(--status-error)' }
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <BaseCard className="mb-8 p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
                  <FileText size={24} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Otomatik Teklif Paneli
                  </h1>
                  <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                    AI destekli ihale teklifi hazırlama sistemi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <Settings size={16} />
                <span>Şartname → Tarif Adaptasyonu → Maliyet Hesaplama → Hazır İhale Teklifi</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg"
                   style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
                <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Ortalama süre: 2-3 dakika
                </span>
              </div>
              
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg"
                   style={{ backgroundColor: 'var(--bg-success-subtle)' }}>
                <Shield size={16} style={{ color: 'var(--status-success)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--status-success)' }}>
                  %95 Doğruluk Oranı
                </span>
              </div>
            </div>
          </div>
        </BaseCard>

        {/* Progress Steps */}
        <ProgressTracker
          steps={steps.map(step => ({
            id: step.id,
            name: step.name,
            title: step.name,
            description: step.desc,
            status: currentStep > step.id ? 'completed' : currentStep === step.id ? 'current' : 'pending'
          }))}
          currentStep={currentStep}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Panel - Form */}
          <div className="lg:col-span-2">
            <ProposalForm
              formData={formData}
              errors={errors}
              onSubmit={handleGenerateProposal}
              onFieldChange={(field, value) => {
                setFormData(prev => ({ ...prev, [field]: value }))
              }}
              isGenerating={isGenerating}
            />
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="space-y-6">
            {proposal ? (
              <ProposalResults
                results={{
                  institutionName: proposal.institutionName,
                  totalCost: proposal.summary.totalCost,
                  profitMargin: proposal.summary.profitMargin,
                  finalPrice: proposal.summary.finalPrice,
                  costPerPortion: proposal.summary.costPerPortion,
                  menuItems: proposal.menuPlan.adaptedRecipes.map(recipe => ({
                    name: recipe.name,
                    quantity: recipe.servings,
                    unitPrice: 12.50, // Örnek fiyat
                    totalPrice: recipe.servings * 12.50,
                    category: recipe.category || 'Ana Yemek'
                  })),
                  riskAssessment: {
                    marketVolatility: proposal.costBreakdown.riskAssessment.marketVolatility,
                    supplierRisk: proposal.costBreakdown.riskAssessment.supplierRisk,
                    overallRisk: proposal.costBreakdown.riskAssessment.overallRisk
                  },
                  aiRecommendations: {
                    costOptimizations: proposal.aiRecommendations.costOptimizations,
                    competitiveAdvantages: proposal.aiRecommendations.competitiveAdvantages,
                    marketInsights: proposal.aiRecommendations.riskMitigations || []
                  },
                  metadata: {
                    proposalId: proposal.id,
                    processingTime: proposal.metadata.processingTime,
                    aiConfidence: proposal.metadata.aiConfidence,
                    validUntil: proposal.validUntil
                  }
                }}
                onExport={handleDownloadProposal}
              />
            ) : (
              <div className="p-8 rounded-xl border text-center" 
                   style={{ 
                     backgroundColor: 'var(--bg-secondary)',
                     borderColor: 'var(--border-primary)'
                   }}>
                <div className="text-4xl mb-3">📊</div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  Teklif oluşturmak için soldaki formu doldurun ve "Otomatik Teklif Oluştur" butonuna tıklayın.
                </p>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Sistem şartname analizi → tarif adaptasyonu → maliyet optimizasyonu adımlarını otomatik olarak gerçekleştirecek.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}