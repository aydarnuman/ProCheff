'use client'

import { useState, useEffect } from 'react'
import { ProposalGenerator, ProposalRequest, GeneratedProposal } from '@/lib/services/proposalGenerator'
import { InstitutionProfile } from '@/lib/services/specParser'

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

  const [selectedRecipes] = useState(['recipe001', 'recipe002']) // Örnek tarif ID'leri
  
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
    { id: 0, name: 'Kurum Profili', icon: '🏢', desc: 'Kurum bilgileri ve gereksinimler' },
    { id: 1, name: 'Tarif Seçimi', icon: '🍽️', desc: 'Menü içeriği belirleme' },
    { id: 2, name: 'Maliyet Ayarları', icon: '💰', desc: 'Kar marjı ve fiyatlandırma' },
    { id: 3, name: 'Teklif Üretimi', icon: '📊', desc: 'AI ile otomatik teklif oluşturma' }
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

      // Simulate step-by-step progress
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
        // Progress update burada yapılabilir
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
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'  
      case 'high': return 'text-red-600 bg-red-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            📊 Otomatik Teklif Paneli
          </h1>
          <p className="text-lg text-gray-600">
            Şartname → Tarif → Maliyet → Hazır İhale Teklifi
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full text-sm font-semibold
                  ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                  ${currentStep === step.id && isGenerating ? 'animate-pulse' : ''}
                `}>
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-400">{step.desc}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-6 h-0.5 w-16 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Panel - Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Kurum Profili */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🏢 Kurum Profili
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kurum Adı
                  </label>
                  <input
                    type="text"
                    value={institutionProfile.kurum}
                    onChange={(e) => setInstitutionProfile(prev => ({ ...prev, kurum: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kişi Sayısı
                  </label>
                  <input
                    type="number"
                    value={institutionProfile.kisiSayisi}
                    onChange={(e) => setInstitutionProfile(prev => ({ ...prev, kisiSayisi: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gramaj Gereksinimleri (g/porsiyon)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Et</label>
                      <input
                        type="number"
                        value={institutionProfile.porsiyon.et}
                        onChange={(e) => setInstitutionProfile(prev => ({ 
                          ...prev, 
                          porsiyon: { ...prev.porsiyon, et: Number(e.target.value) }
                        }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Sebze</label>
                      <input
                        type="number"
                        value={institutionProfile.porsiyon.sebze}
                        onChange={(e) => setInstitutionProfile(prev => ({ 
                          ...prev, 
                          porsiyon: { ...prev.porsiyon, sebze: Number(e.target.value) }
                        }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Yağ</label>
                      <input
                        type="number"
                        value={institutionProfile.porsiyon.yag}
                        onChange={(e) => setInstitutionProfile(prev => ({ 
                          ...prev, 
                          porsiyon: { ...prev.porsiyon, yag: Number(e.target.value) }
                        }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Pirinç</label>
                      <input
                        type="number"
                        value={institutionProfile.porsiyon.pirinc}
                        onChange={(e) => setInstitutionProfile(prev => ({ 
                          ...prev, 
                          porsiyon: { ...prev.porsiyon, pirinc: Number(e.target.value) }
                        }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Teklif Ayarları */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                ⚙️ Teklif Ayarları
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hedef Kar Marjı (%)
                  </label>
                  <input
                    type="number"
                    value={proposalSettings.profitMargin}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, profitMargin: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Geçerlilik Süresi (Gün)
                  </label>
                  <input
                    type="number"
                    value={proposalSettings.validityDays}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, validityDays: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Koşulları
                  </label>
                  <select
                    value={proposalSettings.deliveryTerms}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Kurum teslimatı">Kurum Teslimatı</option>
                    <option value="Depo teslimi">Depo Teslimi</option>
                    <option value="Franco fabrika">Franco Fabrika</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ödeme Koşulları
                  </label>
                  <select
                    value={proposalSettings.paymentTerms}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Peşin ödeme">Peşin Ödeme</option>
                    <option value="15 gün vadeli">15 Gün Vadeli</option>
                    <option value="30 gün vadeli">30 Gün Vadeli</option>
                    <option value="45 gün vadeli">45 Gün Vadeli</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özel Notlar
                  </label>
                  <textarea
                    value={proposalSettings.specialNotes}
                    onChange={(e) => setProposalSettings(prev => ({ ...prev, specialNotes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="İlave koşullar ve notlar..."
                  />
                </div>
              </div>
            </div>

            {/* Özelleştirmeler */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🎛️ Özelleştirmeler
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customizations.prioritizeLocalSuppliers}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, prioritizeLocalSuppliers: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">Yerel tedarikçileri öncelendir</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customizations.organicPreference}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, organicPreference: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">Organik ürünleri tercih et</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customizations.seasonalMenu}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, seasonalMenu: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">Mevsimsel menü planı</span>
                </label>
              </div>
            </div>

            {/* Teklif Oluştur Butonu */}
            <div className="text-center">
              <button
                onClick={handleGenerateProposal}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    AI Teklif Oluşturuyor...
                  </span>
                ) : (
                  '🚀 Otomatik Teklif Oluştur'
                )}
              </button>
            </div>
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="space-y-6">
            {proposal ? (
              <>
                {/* Teklif Özeti */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-900 flex items-center gap-2">
                    📊 Teklif Özeti
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Kurum:</span>
                      <span className="font-semibold text-blue-900">{proposal.institutionName}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Toplam Maliyet:</span>
                      <span className="text-xl font-bold text-blue-900">₺{proposal.summary.totalCost.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Kar Marjı:</span>
                      <span className="text-lg font-semibold text-green-600">%{proposal.summary.profitMargin}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-blue-300 pt-2">
                      <span className="text-blue-700">Satış Fiyatı:</span>
                      <span className="text-2xl font-bold text-green-600">₺{proposal.summary.finalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Porsiyon Başı:</span>
                      <span className="text-lg font-semibold">₺{proposal.summary.costPerPortion.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Değerlendirmesi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">⚠️ Risk Analizi</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pazar Riski</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(proposal.costBreakdown.riskAssessment.marketVolatility)}`}>
                        {proposal.costBreakdown.riskAssessment.marketVolatility}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tedarikçi Riski</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(proposal.costBreakdown.riskAssessment.supplierRisk)}`}>
                        {proposal.costBreakdown.riskAssessment.supplierRisk}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Genel Risk</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(proposal.costBreakdown.riskAssessment.overallRisk)}`}>
                        {proposal.costBreakdown.riskAssessment.overallRisk}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Önerileri */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">🤖 AI Önerileri</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Maliyet Optimizasyonu</h4>
                      <ul className="space-y-1">
                        {proposal.aiRecommendations.costOptimizations.slice(0, 2).map((rec, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Rekabet Avantajları</h4>
                      <ul className="space-y-1">
                        {proposal.aiRecommendations.competitiveAdvantages.slice(0, 2).map((rec, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* İndir Butonları */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">📥 İndir</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleDownloadProposal('summary')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      📄 Özet Rapor (.txt)
                    </button>
                    
                    <button
                      onClick={() => handleDownloadProposal('json')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      💾 Detaylı Veri (.json)
                    </button>
                  </div>
                </div>

                {/* Meta Bilgiler */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>ID: {proposal.id}</div>
                    <div>İşlem Süresi: {proposal.metadata.processingTime}ms</div>
                    <div>AI Güven: %{Math.round(proposal.metadata.aiConfidence * 100)}</div>
                    <div>Geçerlilik: {proposal.validUntil.toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-sm">Teklif oluşturmak için soldaki formu doldurun ve "Otomatik Teklif Oluştur" butonuna tıklayın.</p>
                  <div className="mt-4 text-xs text-gray-400">
                    Sistem şartname analizi → tarif adaptasyonu → maliyet optimizasyonu adımlarını otomatik olarak gerçekleştirecek.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}