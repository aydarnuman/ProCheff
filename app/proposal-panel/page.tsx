'use client'

import { useState, useEffect } from 'react'
import { ProposalGenerator, ProposalRequest, GeneratedProposal } from '@/lib/services/proposalGenerator'
import { InstitutionProfile } from '@/lib/services/specParser'
import { Play, Download, Shield, TrendingUp, CheckCircle, Clock, ArrowRight, Settings, Building, Calculator, FileText } from 'lucide-react'

export default function ProposalPanelPage() {
  const [generator] = useState(new ProposalGenerator())
  const [isGenerating, setIsGenerating] = useState(false)
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  
  // Form state
  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile>({
    kurum: 'Ankara Üniversitesi PMYO',
    kurumKodu: 'AU001',
    tarih: new Date(),
    porsiyon: {
      et: 120,
      tavuk: 100,
      sebze: 50,
      yag: 15,
      tuz: 2,
      pirinc: 80,
      bulgur: 60,
      ekmek: 100
    },
    menuTipi: 'Günlük 3 öğün',
    ogunSayisi: 3,
    kisiSayisi: 500,
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

  const handleGenerateProposal = async () => {
    setIsGenerating(true)
    setCurrentStep(3)
    
    try {
      const request: ProposalRequest = {
        institutionProfile,
        selectedRecipes,
        proposalSettings,
        customizations
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
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                🚀 Otomatik Teklif Paneli
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Şartname → Tarif → Maliyet → Hazır İhale Teklifi
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                   style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Ortalama süre: 2-3 dk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 p-6 rounded-xl border" 
             style={{ 
               backgroundColor: 'var(--bg-secondary)',
               borderColor: 'var(--border-primary)'
             }}>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep >= step.id
              const isCurrent = currentStep === step.id
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div 
                      className={`
                        flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
                        ${isCurrent && isGenerating ? 'animate-pulse' : ''}
                      `}
                      style={{
                        backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: isActive ? 'white' : 'var(--text-muted)'
                      }}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle size={20} />
                      ) : (
                        <StepIcon size={20} />
                      )}
                    </div>
                    
                    <div className="ml-3 min-w-0">
                      <div 
                        className="text-sm font-medium"
                        style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                      >
                        {step.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div 
                        className="h-0.5 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: currentStep > step.id ? 'var(--accent-primary)' : 'var(--border-secondary)'
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Panel - Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Kurum Profili */}
            <div className="p-6 rounded-xl border" 
                 style={{ 
                   backgroundColor: 'var(--bg-secondary)',
                   borderColor: 'var(--border-primary)'
                 }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}>
                <Building size={20} style={{ color: 'var(--accent-primary)' }} />
                Kurum Profili
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Kurum Adı
                  </label>
                  <input
                    type="text"
                    value={institutionProfile.kurum}
                    onChange={(e) => setInstitutionProfile(prev => ({ ...prev, kurum: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border transition-colors duration-200"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Kişi Sayısı
                  </label>
                  <input
                    type="number"
                    value={institutionProfile.kisiSayisi}
                    onChange={(e) => setInstitutionProfile(prev => ({ ...prev, kisiSayisi: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border transition-colors duration-200"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-3"
                         style={{ color: 'var(--text-secondary)' }}>
                    Gramaj Gereksinimleri (g/porsiyon)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(institutionProfile.porsiyon).slice(0, 4).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setInstitutionProfile(prev => ({ 
                            ...prev, 
                            porsiyon: { ...prev.porsiyon, [key]: Number(e.target.value) }
                          }))}
                          className="w-full px-2 py-1 text-sm rounded border"
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--border-secondary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Teklif Ayarları */}
            <div className="p-6 rounded-xl border" 
                 style={{ 
                   backgroundColor: 'var(--bg-secondary)',
                   borderColor: 'var(--border-primary)'
                 }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}>
                <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
                Teklif Ayarları
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Hedef Kar Marjı (%)
                  </label>
                  <input
                    type="number"
                    value={proposalSettings.profitMargin}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, profitMargin: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Geçerlilik Süresi (Gün)
                  </label>
                  <input
                    type="number"
                    value={proposalSettings.validityDays}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, validityDays: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Teslimat Koşulları
                  </label>
                  <select
                    value={proposalSettings.deliveryTerms}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, deliveryTerms: e.target.value }))}
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
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Ödeme Koşulları
                  </label>
                  <select
                    value={proposalSettings.paymentTerms}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, paymentTerms: e.target.value }))}
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
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: 'var(--text-secondary)' }}>
                    Özel Notlar
                  </label>
                  <textarea
                    value={proposalSettings.specialNotes}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, specialNotes: e.target.value }))}
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
            <div className="p-6 rounded-xl border" 
                 style={{ 
                   backgroundColor: 'var(--bg-secondary)',
                   borderColor: 'var(--border-primary)'
                 }}>
              <h2 className="text-lg font-semibold mb-4"
                  style={{ color: 'var(--text-primary)' }}>
                🎛️ Özelleştirmeler
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customizations.prioritizeLocalSuppliers}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, prioritizeLocalSuppliers: e.target.checked }))}
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
                    checked={customizations.organicPreference}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, organicPreference: e.target.checked }))}
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
                    checked={customizations.seasonalMenu}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, seasonalMenu: e.target.checked }))}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Mevsimsel menü planı
                  </span>
                </label>
              </div>
            </div>

            {/* Teklif Oluştur Butonu */}
            <div className="text-center">
              <button
                onClick={handleGenerateProposal}
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
                    <Play size={20} />
                    Otomatik Teklif Oluştur
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="space-y-6">
            {proposal ? (
              <>
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
                        {proposal.institutionName}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-secondary)' }}>Toplam Maliyet:</span>
                      <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        ₺{proposal.summary.totalCost.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-secondary)' }}>Kar Marjı:</span>
                      <span className="text-lg font-semibold" style={{ color: 'var(--status-success)' }}>
                        %{proposal.summary.profitMargin}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t"
                         style={{ borderColor: 'var(--border-secondary)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Satış Fiyatı:</span>
                      <span className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>
                        ₺{proposal.summary.finalPrice.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-secondary)' }}>Porsiyon Başı:</span>
                      <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ₺{proposal.summary.costPerPortion.toFixed(2)}
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
                      { label: 'Pazar Riski', risk: proposal.costBreakdown.riskAssessment.marketVolatility },
                      { label: 'Tedarikçi Riski', risk: proposal.costBreakdown.riskAssessment.supplierRisk },
                      { label: 'Genel Risk', risk: proposal.costBreakdown.riskAssessment.overallRisk }
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
                        {proposal.aiRecommendations.costOptimizations.slice(0, 2).map((rec, idx) => (
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
                        {proposal.aiRecommendations.competitiveAdvantages.slice(0, 2).map((rec, idx) => (
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
                      onClick={() => handleDownloadProposal('summary')}
                      className="w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      style={{
                        backgroundColor: 'var(--status-success)',
                        color: 'white'
                      }}
                    >
                      📄 Özet Rapor (.txt)
                    </button>
                    
                    <button
                      onClick={() => handleDownloadProposal('json')}
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
                    <div>ID: {proposal.id}</div>
                    <div>İşlem Süresi: {proposal.metadata.processingTime}ms</div>
                    <div>AI Güven: %{Math.round(proposal.metadata.aiConfidence * 100)}</div>
                    <div>Geçerlilik: {proposal.validUntil.toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>
              </>
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