// app/spec-analyzer/page.tsx
// 🎯 Şartname Analizi ve Teklif Hazırlama Sistemi

'use client'

import { useState, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  Calculator, 
  FileDown,
  AlertTriangle,
  Edit,
  Save,
  ArrowRight,
  Loader,
  X
} from 'lucide-react'
import { BaseCard } from '@/app/components/ui/Card'
import { 
  SpecificationUpload, 
  ExtractedData, 
  ReviewedData, 
  CostCalculation,
  ProposalWorkflowState 
} from '@/lib/types/proposal'

export default function SpecificationAnalyzerPage() {
  const [workflowState, setWorkflowState] = useState<ProposalWorkflowState>({
    currentStep: 'upload'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 📋 1. ŞARTNAME YÜKLEME
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      // Dosya validasyonu
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('Dosya boyutu 50MB\'dan küçük olmalıdır')
      }

      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf'
      ]
      if (!allowedTypes.includes(file.type)) {
        throw new Error('PDF, Word (.doc/.docx), RTF veya Text dosyaları desteklenir')
      }

      // Upload simulation
      const specUpload: SpecificationUpload = {
        id: `spec_${Date.now()}`,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
        uploadDate: new Date(),
        status: 'processing'
      }

      setWorkflowState(prev => ({
        ...prev,
        specificationUpload: specUpload,
        currentStep: 'analyze'
      }))

      // AI analiz başlat
      setTimeout(() => {
        analyzeSpecification(file)
      }, 1000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Dosya yükleme hatası')
      setIsProcessing(false)
    }
  }

  // 🤖 2. AI ANALİZ
  const analyzeSpecification = async (file: File) => {
    try {
      // API çağrısı simülasyonu
      const response = await fetch('/api/analyze-specification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size })
      })

      if (!response.ok) {
        throw new Error('Analiz başarısız oldu')
      }

      const result = await response.json()
      
      setWorkflowState(prev => ({
        ...prev,
        extractedData: result.data,
        currentStep: 'review',
        specificationUpload: {
          ...prev.specificationUpload!,
          status: 'analyzed'
        }
      }))

    } catch (error) {
      setError('AI analizi başarısız oldu')
    } finally {
      setIsProcessing(false)
    }
  }

  // ✅ 3. KULLANICI ONAY/DÜZELTME
  const handleDataReview = (reviewedData: ReviewedData) => {
    setWorkflowState(prev => ({
      ...prev,
      reviewedData,
      currentStep: 'calculate'
    }))
    
    // Otomatik maliyet hesaplama başlat
    calculateCosts(reviewedData)
  }

  // 💰 4. MALİYET HESAPLAMA
  const calculateCosts = async (projectData: ReviewedData) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/calculate-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectData })
      })

      const result = await response.json()
      
      setWorkflowState(prev => ({
        ...prev,
        costCalculation: result.data,
        currentStep: 'generate'
      }))

    } catch (error) {
      setError('Maliyet hesaplama hatası')
    } finally {
      setIsProcessing(false)
    }
  }

  // 📄 5. TEKLİF OLUŞTURMA
  const generateProposal = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: workflowState.reviewedData,
          costCalculation: workflowState.costCalculation
        })
      })

      const result = await response.json()
      
      setWorkflowState(prev => ({
        ...prev,
        proposalDocument: result.data,
        currentStep: 'track'
      }))

    } catch (error) {
      setError('Teklif oluşturma hatası')
    } finally {
      setIsProcessing(false)
    }
  }

  // 🔄 Yeniden başlat
  const resetWorkflow = () => {
    setWorkflowState({ currentStep: 'upload' })
    setError(null)
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Şartname Analizi & Teklif Hazırlama
          </h1>
          <p className="text-gray-600">
            Şartname yükleyin, AI analizi ile otomatik teklif hazırlayın
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[
              { key: 'upload', label: 'Yükle', icon: Upload },
              { key: 'analyze', label: 'Analiz', icon: Brain },
              { key: 'review', label: 'Onay', icon: CheckCircle },
              { key: 'calculate', label: 'Maliyet', icon: Calculator },
              { key: 'generate', label: 'Teklif', icon: FileDown }
            ].map((step, index) => {
              const isActive = workflowState.currentStep === step.key
              const isCompleted = ['upload', 'analyze', 'review', 'calculate', 'generate'].indexOf(workflowState.currentStep) > index
              const IconComponent = step.icon

              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    isActive ? 'border-blue-500 text-blue-500' :
                    'border-gray-300 text-gray-400'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </div>
                  </div>
                  {index < 4 && (
                    <ArrowRight className="w-4 h-4 mx-4 text-gray-300" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <div className="flex-1">
              <div className="text-red-800 font-medium">Hata</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Based on Current Step */}
        <div className="max-w-4xl mx-auto">
          {workflowState.currentStep === 'upload' && (
            <UploadStep 
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
              fileInputRef={fileInputRef}
            />
          )}

          {workflowState.currentStep === 'analyze' && (
            <AnalyzeStep 
              specification={workflowState.specificationUpload!}
              isProcessing={isProcessing}
            />
          )}

          {workflowState.currentStep === 'review' && workflowState.extractedData && (
            <ReviewStep 
              extractedData={workflowState.extractedData}
              onReview={handleDataReview}
              isProcessing={isProcessing}
            />
          )}

          {workflowState.currentStep === 'calculate' && workflowState.costCalculation && (
            <CalculateStep 
              costCalculation={workflowState.costCalculation}
              onGenerate={generateProposal}
              isProcessing={isProcessing}
            />
          )}

          {workflowState.currentStep === 'generate' && workflowState.proposalDocument && (
            <GenerateStep 
              proposalDocument={workflowState.proposalDocument}
              onTrack={() => setWorkflowState(prev => ({ ...prev, currentStep: 'track' }))}
            />
          )}
        </div>

        {/* Reset Button */}
        <div className="text-center mt-8">
          <button
            onClick={resetWorkflow}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Yeni Analiz Başlat
          </button>
        </div>
      </div>
    </div>
  )
}

// Alt Bileşenler ayrı dosyalarda olacak
function UploadStep({ onFileUpload, isProcessing, fileInputRef }: any) {
  return (
    <BaseCard>
      <div className="text-center py-12">
        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Şartname Dosyası Yükleyin</h3>
        <p className="text-gray-600 mb-6">
          PDF, Word (.doc/.docx), RTF veya Text formatında şartname dosyanızı yükleyin
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf"
          onChange={onFileUpload}
          className="hidden"
          disabled={isProcessing}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin inline" />
              Yükleniyor...
            </>
          ) : (
            'Dosya Seç'
          )}
        </button>
        
        <div className="mt-4 text-sm text-gray-500">
          Maksimum dosya boyutu: 50MB
        </div>
      </div>
    </BaseCard>
  )
}

function AnalyzeStep({ specification, isProcessing }: any) {
  return (
    <BaseCard>
      <div className="text-center py-12">
        <Brain className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h3 className="text-xl font-semibold mb-2">AI Analizi Yapılıyor</h3>
        <p className="text-gray-600 mb-6">
          {specification.fileName} dosyası analiz ediliyor...
        </p>
        
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-blue-500 mr-3" />
            <span>Analiz devam ediyor...</span>
          </div>
        ) : (
          <div className="text-green-600">
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            Analiz tamamlandı!
          </div>
        )}
      </div>
    </BaseCard>
  )
}

function ReviewStep({ extractedData, onReview, isProcessing }: any) {
  const [editedData, setEditedData] = useState(extractedData)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    const reviewedData: ReviewedData = {
      ...editedData,
      isApproved: true,
      userAdjustments: {},
      reviewNotes: 'Kullanıcı onayı',
      reviewedAt: new Date(),
      reviewedBy: 'current_user'
    }
    onReview(reviewedData)
  }

  return (
    <BaseCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Çıkarılan Bilgileri Kontrol Edin</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-2 inline" />
              {isEditing ? 'İptal' : 'Düzenle'}
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Onayla ve Devam Et
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Proje Bilgileri */}
          <div>
            <h4 className="font-semibold mb-3">Proje Bilgileri</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Ad:</strong> {editedData.projectInfo?.name}</div>
              <div><strong>Yer:</strong> {editedData.projectInfo?.location}</div>
              <div><strong>Kurum:</strong> {editedData.projectInfo?.institution}</div>
              <div><strong>Süre:</strong> {editedData.projectInfo?.contractPeriod}</div>
            </div>
          </div>

          {/* Servis Detayları */}
          <div>
            <h4 className="font-semibold mb-3">Servis Detayları</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Günlük Porsiyon:</strong> {editedData.servingDetails?.dailyServings?.toLocaleString()}</div>
              <div><strong>Öğün Sayısı:</strong> {editedData.servingDetails?.mealsPerDay}</div>
              <div><strong>Aylık Toplam:</strong> {editedData.servingDetails?.totalServings?.toLocaleString()}</div>
            </div>
          </div>

          {/* Porsiyon Boyutları */}
          <div>
            <h4 className="font-semibold mb-3">Porsiyon Boyutları</h4>
            {editedData.portionSizes?.lunch && (
              <div className="space-y-2 text-sm">
                <div><strong>Ana Yemek:</strong> {editedData.portionSizes.lunch.mainCourse}g</div>
                <div><strong>Yan Yemek:</strong> {editedData.portionSizes.lunch.side}g</div>
                <div><strong>Çorba:</strong> {editedData.portionSizes.lunch.soup}ml</div>
                <div><strong>Tatlı:</strong> {editedData.portionSizes.lunch.dessert}g</div>
              </div>
            )}
          </div>

          {/* Bütçe */}
          <div>
            <h4 className="font-semibold mb-3">Bütçe Bilgileri</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Tahmini Bütçe:</strong> ₺{editedData.budgetInfo?.estimatedBudget?.toLocaleString()}</div>
              <div><strong>Max Porsiyon Fiyatı:</strong> ₺{editedData.budgetInfo?.maxPricePerServing}</div>
              <div><strong>Ödeme:</strong> {editedData.budgetInfo?.paymentTerms}</div>
            </div>
          </div>
        </div>

        {/* AI Güven Skoru */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">AI Güven Skoru</span>
            <span className="text-lg font-bold text-blue-600">
              {Math.round((editedData.aiConfidence || 0) * 100)}%
            </span>
          </div>
          {editedData.warnings && editedData.warnings.length > 0 && (
            <div className="mt-2">
              <div className="text-sm font-medium text-orange-600 mb-1">Uyarılar:</div>
              <ul className="text-sm text-orange-700 space-y-1">
                {editedData.warnings.map((warning: any, index: any) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  )
}

function CalculateStep({ costCalculation, onGenerate, isProcessing }: any) {
  return (
    <BaseCard>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-6">Maliyet Hesaplama Sonuçları</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ₺{costCalculation.totals?.finalTotal?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Toplam Maliyet</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ₺{costCalculation.totals?.pricePerServing?.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Porsiyon Fiyatı</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {costCalculation.margins?.profit || 15}%
            </div>
            <div className="text-sm text-gray-600">Kar Marjı</div>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isProcessing}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin inline" />
              Teklif Hazırlanıyor...
            </>
          ) : (
            'Teklif Hazırla'
          )}
        </button>
      </div>
    </BaseCard>
  )
}

function GenerateStep({ proposalDocument }: any) {
  return (
    <BaseCard>
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold mb-2">Teklif Hazırlandı!</h3>
        <p className="text-gray-600 mb-6">
          Teklifiniz başarıyla oluşturuldu ve indirmeye hazır
        </p>
        
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <FileDown className="w-4 h-4 mr-2 inline" />
            PDF İndir
          </button>
          <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            <FileDown className="w-4 h-4 mr-2 inline" />
            Excel İndir
          </button>
        </div>
      </div>
    </BaseCard>
  )
}