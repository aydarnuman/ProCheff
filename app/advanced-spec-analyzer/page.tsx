// app/advanced-spec-analyzer/page.tsx
// 🎯 Profesyonel Şartname Analizi ve KİK Sistemi

'use client'

import { useState, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  Calculator, 
  AlertTriangle,
  Edit,
  Save,
  ArrowRight,
  Loader,
  X,
  Eye,
  TrendingUp,
  Shield,
  FileDown,
  Zap,
  Target
} from 'lucide-react'
import { BaseCard } from '@/app/components/ui/Card'
import { 
  AdvancedSpecificationExtraction, 
  KIKCostCalculation,
  HumanReviewSession 
} from '@/lib/types/advanced-proposal'

type WorkflowStep = 'upload' | 'analyze' | 'review' | 'kik' | 'approve' | 'generate'

interface WorkflowState {
  currentStep: WorkflowStep
  extractionId?: string
  reviewSessionId?: string
  extractedData?: AdvancedSpecificationExtraction
  costCalculation?: KIKCostCalculation
  reviewSession?: HumanReviewSession
  finalApproval?: boolean
}

export default function AdvancedSpecAnalyzerPage() {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStep: 'upload'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingLog, setProcessingLog] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 📤 1. Dosya yükleme ve analiz başlatma
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setProcessingLog(['📄 Dosya yükleniyor...'])

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('enable_ocr', 'true')
      formData.append('confidence_threshold', '0.6')
      formData.append('human_review_required', 'true')
      formData.append('kik_analysis', 'true')

      setProcessingLog(prev => [...prev, '🤖 AI analizi başlatılıyor...'])
      
      const response = await fetch('/api/advanced-analysis', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error.message || 'Analiz başarısız oldu')
      }

      setProcessingLog(prev => [...prev, 
        `✅ Ekstraksiyon tamamlandı (Güven: ${(result.data.extracted_data.confidence_scores.overall * 100).toFixed(1)}%)`,
        `💰 KİK analizi tamamlandı (Risk: ${result.data.cost_calculation?.abnormally_low_analysis.risk_level || 'yok'})`
      ])

      // Workflow state güncelle
      setWorkflowState({
        currentStep: result.data.requires_review ? 'review' : 'kik',
        extractionId: result.data.extraction_id,
        reviewSessionId: result.data.review_session_id,
        extractedData: result.data.extracted_data,
        costCalculation: result.data.cost_calculation
      })

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bilinmeyen hata')
      setProcessingLog(prev => [...prev, `❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`])
    } finally {
      setIsProcessing(false)
    }
  }

  // 👥 2. İnsan onay süreci
  const handleReviewApproval = () => {
    setWorkflowState(prev => ({
      ...prev,
      currentStep: 'kik'
    }))
  }

  // 💰 3. KİK analizi onayı
  const handleKIKApproval = () => {
    setWorkflowState(prev => ({
      ...prev,
      currentStep: 'approve'
    }))
  }

  // ✅ 4. Final onay
  const handleFinalApproval = () => {
    setWorkflowState(prev => ({
      ...prev,
      currentStep: 'generate',
      finalApproval: true
    }))
  }

  // 🚫 Reset işlemi
  const handleReset = () => {
    setWorkflowState({ currentStep: 'upload' })
    setError(null)
    setProcessingLog([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const steps = [
    { id: 'upload', title: 'Yükle', icon: Upload },
    { id: 'analyze', title: 'Analiz Et', icon: Brain },
    { id: 'review', title: 'Gözden Geçir', icon: Eye },
    { id: 'kik', title: 'KİK Analizi', icon: Calculator },
    { id: 'approve', title: 'Onayla', icon: CheckCircle },
    { id: 'generate', title: 'Teklif Üret', icon: FileDown }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Profesyonel Şartname Analizi
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI destekli ekstraksiyon, KİK uyumlu maliyet analizi ve aşırı düşük teklif tespiti
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const isActive = step.id === workflowState.currentStep
              const isCompleted = steps.findIndex(s => s.id === workflowState.currentStep) > index
              const StepIcon = step.icon
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-colors
                    ${isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-600 text-white' : 
                      'bg-gray-300 text-gray-600'}
                  `}>
                    <StepIcon size={20} />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-3" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <BaseCard className="border-red-200 bg-red-50">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Analiz Hatası</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Yeniden Dene
                </button>
              </div>
            </div>
          </BaseCard>
        )}

        {/* Processing Log */}
        {processingLog.length > 0 && (
          <BaseCard>
            <h3 className="font-semibold mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-blue-600" />
              İşlem Günlüğü
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {processingLog.map((log, index) => (
                <div key={index} className="text-sm text-gray-600 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </BaseCard>
        )}

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {workflowState.currentStep === 'upload' && (
              <UploadStep 
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
                fileInputRef={fileInputRef}
              />
            )}

            {workflowState.currentStep === 'review' && workflowState.extractedData && (
              <ReviewStep
                extractedData={workflowState.extractedData}
                onApprove={handleReviewApproval}
              />
            )}

            {workflowState.currentStep === 'kik' && workflowState.costCalculation && (
              <KIKAnalysisStep
                costCalculation={workflowState.costCalculation}
                onApprove={handleKIKApproval}
              />
            )}

            {workflowState.currentStep === 'approve' && (
              <FinalApprovalStep
                onApprove={handleFinalApproval}
                extractedData={workflowState.extractedData}
                costCalculation={workflowState.costCalculation}
              />
            )}

            {workflowState.currentStep === 'generate' && (
              <GenerateStep
                extractedData={workflowState.extractedData}
                costCalculation={workflowState.costCalculation}
              />
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            {workflowState.extractedData && (
              <ProjectSummaryCard 
                data={workflowState.extractedData}
                costData={workflowState.costCalculation}
              />
            )}
            
            <SystemInfoCard />
          </div>
        </div>
      </div>
    </div>
  )
}

// Alt Bileşenler
function UploadStep({ onFileUpload, isProcessing, fileInputRef }: any) {
  return (
    <BaseCard>
      <div className="text-center py-12">
        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Profesyonel Şartname Analizi</h3>
        <p className="text-gray-600 mb-6">
          PDF, Word veya görüntü formatında şartname dosyanızı yükleyin
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.jpg,.png"
          onChange={onFileUpload}
          className="hidden"
          disabled={isProcessing}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin inline" />
              Analiz Ediliyor...
            </>
          ) : (
            'Şartname Yükle'
          )}
        </button>
        
        <div className="mt-6 text-sm text-gray-500 space-y-1">
          <div>📊 <strong>Desteklenen Özellikler:</strong></div>
          <div>• AI destekli içerik ekstraksionu</div>
          <div>• OCR ile taranmış doküman işleme</div>
          <div>• KİK uyumlu maliyet analizi</div>
          <div>• Aşırı düşük teklif tespiti</div>
          <div>• Confidence scoring sistemi</div>
          <div className="pt-2">
            <strong>Maksimum dosya boyutu:</strong> 50MB
          </div>
        </div>
      </div>
    </BaseCard>
  )
}

function ReviewStep({ extractedData, onApprove }: any) {
  return (
    <BaseCard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            Çıkarılan Bilgileri Gözden Geçirin
          </h3>
          <div className="text-sm text-gray-500">
            Genel Güven: {(extractedData.confidence_scores.overall * 100).toFixed(1)}%
          </div>
        </div>

        {/* Proje Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proje Adı
                <span className="text-green-600 ml-1">
                  ({(extractedData.confidence_scores.project_name * 100).toFixed(0)}%)
                </span>
              </label>
              <input
                type="text"
                defaultValue={extractedData.project.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasyon
              </label>
              <input
                type="text"
                defaultValue={extractedData.project.location}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Günlük Porsiyon Sayısı
              </label>
              <input
                type="number"
                defaultValue={extractedData.project.daily_portions}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sözleşme Süresi (ay)
              </label>
              <input
                type="number"
                defaultValue={extractedData.project.duration_months}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Uyarılar */}
        {extractedData.flags.missing_critical.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Kritik Eksikler</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {extractedData.flags.missing_critical.map((item: string, index: number) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Düzenle
          </button>
          <button
            onClick={onApprove}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Onayla ve Devam Et
          </button>
        </div>
      </div>
    </BaseCard>
  )
}

function KIKAnalysisStep({ costCalculation, onApprove }: any) {
  const riskColors: { [key: string]: string } = {
    'düşük': 'text-green-600 bg-green-50',
    'orta': 'text-yellow-600 bg-yellow-50', 
    'yüksek': 'text-orange-600 bg-orange-50',
    'kritik': 'text-red-600 bg-red-50'
  }

  return (
    <BaseCard>
      <div className="space-y-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          KİK Maliyet Analizi
        </h3>

        {/* Maliyet Döküm */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {costCalculation.unit_costs.material_cost.toFixed(2)} ₺
            </div>
            <div className="text-sm text-gray-600">Malzeme</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {costCalculation.unit_costs.labor_cost.toFixed(2)} ₺
            </div>
            <div className="text-sm text-gray-600">İşçilik</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {costCalculation.unit_costs.overhead_cost.toFixed(2)} ₺
            </div>
            <div className="text-sm text-gray-600">Genel Gider</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {costCalculation.unit_costs.total_unit_cost.toFixed(2)} ₺
            </div>
            <div className="text-sm text-gray-600">Toplam</div>
          </div>
        </div>

        {/* KİK Hesaplamaları */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">KİK Eşik Değerleri</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">K Katsayısı</span>
              <div className="text-lg font-semibold">{costCalculation.kik_calculations.K_factor}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Sınır Değer</span>
              <div className="text-lg font-semibold text-red-600">
                {costCalculation.kik_calculations.threshold_value.toFixed(2)} ₺
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Aşırı Düşük Eşiği (%70)</span>
              <div className="text-lg font-semibold">
                {(costCalculation.kik_calculations.threshold_value * 0.70).toFixed(2)} ₺
              </div>
            </div>
          </div>
        </div>

        {/* Risk Analizi */}
        <div className={`rounded-lg p-4 ${riskColors[costCalculation.abnormally_low_analysis.risk_level]}`}>
          <h4 className="font-semibold mb-2">
            🛡️ Risk Değerlendirmesi: {costCalculation.abnormally_low_analysis.risk_level.toUpperCase()}
          </h4>
          {costCalculation.abnormally_low_analysis.risk_factors.length > 0 && (
            <ul className="text-sm space-y-1">
              {costCalculation.abnormally_low_analysis.risk_factors.map((factor: string, index: number) => (
                <li key={index}>• {factor}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onApprove}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            KİK Analizini Onayla
          </button>
        </div>
      </div>
    </BaseCard>
  )
}

function FinalApprovalStep({ onApprove, extractedData, costCalculation }: any) {
  return (
    <BaseCard>
      <div className="text-center py-8">
        <Shield className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold mb-4">Final Onay</h3>
        <p className="text-gray-600 mb-6">
          Tüm analizler tamamlandı. Teklif hazırlığına geçmek için onaylayın.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="text-left">
            <div className="font-medium">Proje: {extractedData?.project.name}</div>
            <div className="text-gray-600">Günlük: {extractedData?.project.daily_portions} porsiyon</div>
          </div>
          <div className="text-right">
            <div className="font-medium">Birim Maliyet: {costCalculation?.unit_costs.total_unit_cost.toFixed(2)} ₺</div>
            <div className="text-gray-600">Sınır Değer: {costCalculation?.kik_calculations.threshold_value.toFixed(2)} ₺</div>
          </div>
        </div>
        
        <button
          onClick={onApprove}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold"
        >
          ✅ Onayla ve Teklif Hazırla
        </button>
      </div>
    </BaseCard>
  )
}

function GenerateStep({ extractedData, costCalculation }: any) {
  return (
    <BaseCard>
      <div className="text-center py-8">
        <FileDown className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h3 className="text-xl font-semibold mb-4">Teklif Hazırlandı</h3>
        <p className="text-gray-600 mb-6">
          Profesyonel teklif dokümanlarınız hazır. İndirmek için aşağıdaki seçenekleri kullanın.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <div className="font-medium">Executive PDF</div>
            <div className="text-sm text-gray-600">Yönetici özeti</div>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Calculator className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="font-medium">Detaylı Excel</div>
            <div className="text-sm text-gray-600">Maliyet dökümleri</div>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="font-medium">KİK Raporu</div>
            <div className="text-sm text-gray-600">Uyumluluk belgesi</div>
          </button>
        </div>
      </div>
    </BaseCard>
  )
}

function ProjectSummaryCard({ data, costData }: any) {
  return (
    <BaseCard>
      <h3 className="font-semibold mb-4 flex items-center">
        <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
        Proje Özeti
      </h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Proje:</span>
          <span className="font-medium">{data.project.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Günlük Porsiyon:</span>
          <span className="font-medium">{data.project.daily_portions.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Süre:</span>
          <span className="font-medium">{data.project.duration_months} ay</span>
        </div>
        
        {costData && (
          <>
            <hr className="my-3" />
            <div className="flex justify-between">
              <span className="text-gray-600">Birim Maliyet:</span>
              <span className="font-medium">{costData.unit_costs.total_unit_cost.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sınır Değer:</span>
              <span className="font-medium text-red-600">{costData.kik_calculations.threshold_value.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk Seviyesi:</span>
              <span className={`font-medium ${
                costData.abnormally_low_analysis.risk_level === 'düşük' ? 'text-green-600' :
                costData.abnormally_low_analysis.risk_level === 'orta' ? 'text-yellow-600' :
                costData.abnormally_low_analysis.risk_level === 'yüksek' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {costData.abnormally_low_analysis.risk_level}
              </span>
            </div>
          </>
        )}
      </div>
    </BaseCard>
  )
}

function SystemInfoCard() {
  return (
    <BaseCard>
      <h3 className="font-semibold mb-4 flex items-center">
        <Zap className="w-4 h-4 mr-2 text-blue-600" />
        Sistem Bilgileri
      </h3>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div>✅ AI Ekstraksiyon Aktif</div>
        <div>✅ KİK Analizi Aktif</div>
        <div>✅ OCR Desteği Aktif</div>
        <div>✅ Confidence Scoring</div>
        <div>✅ Risk Değerlendirmesi</div>
        
        <div className="pt-3 mt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div>KİK Tebliği: 2022</div>
            <div>K Faktörü: 0.93</div>
            <div>Sistem v2.1.0</div>
          </div>  
        </div>
      </div>
    </BaseCard>
  )
}