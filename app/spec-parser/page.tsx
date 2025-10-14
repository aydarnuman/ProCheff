'use client'

import { useState, useRef } from 'react'
import { InstitutionProfile, ParseResult, SpecificationParser } from '@/lib/services/specParser'
import { Upload, FileText, Brain, Settings, Download, CheckCircle, AlertCircle, Clock, Zap, Target, ArrowRight } from 'lucide-react'

interface FileUpload {
  file: File
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  result?: ParseResult
  enhancedMode?: boolean
  stageLogs?: { stage: string; content: string; timestamp: number }[]
}

export default function SpecificationParserPage() {
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({})
  const [useEnhancedParser, setUseEnhancedParser] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const parser = new SpecificationParser()

  const handleFileUpload = (files: FileList) => {
    const newUploads: FileUpload[] = Array.from(files).map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      status: 'pending',
      enhancedMode: useEnhancedParser
    }))

    setUploads(prev => [...prev, ...newUploads])
    processFiles(newUploads)
  }

  const processFiles = async (fileUploads: FileUpload[]) => {
    setIsProcessing(true)

    for (const upload of fileUploads) {
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'processing' } : u
      ))

      try {
        const fileContent = await upload.file.arrayBuffer()
        const buffer = Buffer.from(fileContent)
        const fileType = getFileType(upload.file.name)
        
        let result: ParseResult
        
        if (useEnhancedParser) {
          const { EnhancedSpecParserClient } = await import('@/lib/services/enhancedSpecParserClient')
          const enhancedParser = new EnhancedSpecParserClient()
          
          const textContent = buffer.toString('utf-8')
          const enhancedResult = await enhancedParser.analyzeSpecificationEnhanced(
            textContent, 
            upload.file.name
          )
          
          result = {
            success: true,
            profile: enhancedResult.finalProfile,
            rawText: textContent,
            confidence: enhancedResult.finalProfile.metadata.confidence,
            suggestions: enhancedResult.stageLogs
          }
        } else {
          result = await parser.parseSpecification(
            buffer, 
            upload.file.name, 
            fileType
          )
        }

        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { 
            ...u, 
            status: result.success ? 'completed' : 'error',
            result,
            enhancedMode: useEnhancedParser,
            stageLogs: useEnhancedParser && result.suggestions ? 
              result.suggestions.map((log: any, index: number) => ({
                stage: `Stage ${String.fromCharCode(65 + index)}`,
                content: typeof log === 'string' ? log : JSON.stringify(log, null, 2),
                timestamp: Date.now() + index
              })) : []
          } : u
        ))

        setActiveTab(prev => ({ 
          ...prev, 
          [upload.id]: result.similarityAnalysis ? 'similarity' : 'profile' 
        }))

      } catch (error) {
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { 
            ...u, 
            status: 'error',
            result: {
              success: false,
              errors: [`Dosya işleme hatası: ${error}`],
              confidence: 0
            }
          } : u
        ))
      }
    }

    setIsProcessing(false)
  }

  const getFileType = (fileName: string): 'pdf' | 'docx' | 'txt' => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (ext === 'docx' || ext === 'doc') return 'docx'
    return 'txt'
  }

  const handleDownloadProfile = (profile: InstitutionProfile) => {
    const dataStr = JSON.stringify(profile, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${profile.kurum.replace(/\s+/g, '_')}_profile.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return { bg: 'var(--bg-success-subtle)', text: 'var(--status-success)' }
    if (confidence >= 0.6) return { bg: 'var(--bg-warning-subtle)', text: 'var(--status-warning)' }
    return { bg: 'var(--bg-error-subtle)', text: 'var(--status-error)' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} style={{ color: 'var(--status-success)' }} />
      case 'error': return <AlertCircle size={16} style={{ color: 'var(--status-error)' }} />
      case 'processing': return <Clock size={16} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      default: return <Clock size={16} style={{ color: 'var(--text-muted)' }} />
    }
  }

  const analysisStages = [
    { id: 'A', name: 'Gramaj Çıkarım', color: 'var(--accent-primary)' },
    { id: 'B', name: 'Koşul Analizi', color: 'var(--status-success)' },
    { id: 'C', name: 'Profil Oluştur', color: 'var(--status-warning)' },
    { id: 'D', name: 'Chunk Birleştir', color: 'var(--accent-secondary)' },
    { id: 'E', name: 'Benzerlik Analizi', color: 'var(--status-error)' }
  ]

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0f1419' }}>
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                📋 Şartname Analizi
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                PDF ve Word şartnamelerini AI ile otomatik analiz edin
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                   style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <Brain size={16} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  AI Destekli Analiz
                </span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Parser Toggle */}
          <div className="p-4 rounded-xl border" 
               style={{ 
                 backgroundColor: 'var(--bg-secondary)',
                 borderColor: 'var(--border-primary)'
               }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Settings size={18} style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Analiz Modu
                  </h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {useEnhancedParser ? '5-Stage Enhanced Analysis' : 'Standart Analiz'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {useEnhancedParser && (
                  <span 
                    className="px-2 py-1 text-xs font-semibold rounded-full animate-pulse"
                    style={{
                      backgroundColor: 'var(--status-success)',
                      color: 'white'
                    }}
                  >
                    YENİ
                  </span>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useEnhancedParser}
                    onChange={(e) => setUseEnhancedParser(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div 
                    className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style={{
                      backgroundColor: useEnhancedParser ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)'
                    }}
                  />
                </label>
              </div>
            </div>
            
            {/* Enhanced Parser Info */}
            {useEnhancedParser && (
              <div className="mt-4 p-4 rounded-lg border" 
                   style={{ 
                     backgroundColor: 'var(--bg-accent-subtle)',
                     borderColor: 'var(--border-secondary)'
                   }}>
                <h4 className="font-semibold mb-3 flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}>
                  <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
                  5-Stage Enhanced Analysis
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {analysisStages.map((stage, index) => (
                    <div key={stage.id} className="text-center">
                      <div 
                        className="w-8 h-8 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-semibold"
                        style={{ backgroundColor: stage.color }}
                      >
                        {stage.id}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {stage.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="p-6 rounded-xl border mb-8" 
             style={{ 
               backgroundColor: 'var(--bg-secondary)',
               borderColor: 'var(--border-primary)'
             }}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
              <Upload size={20} style={{ color: 'var(--accent-primary)' }} />
              Dosya Yükleme
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              PDF, Word veya metin dosyalarını buraya sürükleyin
            </p>
          </div>
          
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:shadow-sm"
            style={{ borderColor: 'var(--border-secondary)' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.style.borderColor = 'var(--accent-primary)'
              e.currentTarget.style.backgroundColor = 'var(--bg-accent-subtle)'
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-secondary)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.style.borderColor = 'var(--border-secondary)'
              e.currentTarget.style.backgroundColor = 'transparent'
              if (e.dataTransfer.files) {
                handleFileUpload(e.dataTransfer.files)
              }
            }}
          >
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              Dosyaları buraya sürükleyin
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              veya tıklayarak seçin (PDF, DOCX, TXT)
            </p>
            <button 
              className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:shadow-sm"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              Dosya Seç
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files)
              }
            }}
          />
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="p-6 rounded-xl border mb-8" 
               style={{ 
                 backgroundColor: 'var(--bg-accent-subtle)',
                 borderColor: 'var(--border-primary)'
               }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" 
                   style={{ 
                     borderColor: 'var(--accent-primary)',
                     borderTopColor: 'transparent'
                   }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                🧠 AI analizi devam ediyor...
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {uploads.length > 0 && (
          <div className="space-y-6">
            {uploads.map((upload) => (
              <div key={upload.id} className="rounded-xl border overflow-hidden" 
                   style={{ 
                     backgroundColor: 'var(--bg-secondary)',
                     borderColor: 'var(--border-primary)'
                   }}>
                
                {/* File Header */}
                <div className="p-6 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {upload.file.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {(upload.file.size / 1024).toFixed(1)} KB
                          {upload.enhancedMode && ' • Enhanced Mode'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {upload.result?.confidence !== undefined && (
                        <div 
                          className="px-3 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: getConfidenceColor(upload.result.confidence).bg,
                            color: getConfidenceColor(upload.result.confidence).text
                          }}
                        >
                          %{Math.round(upload.result.confidence * 100)} Güven
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(upload.status)}
                        <span className="text-sm font-medium" 
                              style={{ color: 'var(--text-secondary)' }}>
                          {upload.status === 'completed' ? 'Tamamlandı' :
                           upload.status === 'processing' ? 'İşleniyor' :
                           upload.status === 'error' ? 'Hata' : 'Bekliyor'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Content */}
                {upload.result && upload.status === 'completed' && (
                  <div className="p-6">
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 mb-6 p-1 rounded-lg" 
                         style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <button
                        onClick={() => setActiveTab(prev => ({ ...prev, [upload.id]: 'profile' }))}
                        className={`px-4 py-2 text-sm font-medium rounded transition-colors duration-200 ${
                          activeTab[upload.id] === 'profile' ? 'shadow-sm' : ''
                        }`}
                        style={{
                          backgroundColor: activeTab[upload.id] === 'profile' ? 'var(--accent-primary)' : 'transparent',
                          color: activeTab[upload.id] === 'profile' ? 'white' : 'var(--text-secondary)'
                        }}
                      >
                        Kurum Profili
                      </button>
                      {upload.result.similarityAnalysis && (
                        <button
                          onClick={() => setActiveTab(prev => ({ ...prev, [upload.id]: 'similarity' }))}
                          className={`px-4 py-2 text-sm font-medium rounded transition-colors duration-200 ${
                            activeTab[upload.id] === 'similarity' ? 'shadow-sm' : ''
                          }`}
                          style={{
                            backgroundColor: activeTab[upload.id] === 'similarity' ? 'var(--accent-primary)' : 'transparent',
                            color: activeTab[upload.id] === 'similarity' ? 'white' : 'var(--text-secondary)'
                          }}
                        >
                          Benzerlik Analizi
                        </button>
                      )}
                      {upload.stageLogs && (
                        <button
                          onClick={() => setActiveTab(prev => ({ ...prev, [upload.id]: 'stages' }))}
                          className={`px-4 py-2 text-sm font-medium rounded transition-colors duration-200 ${
                            activeTab[upload.id] === 'stages' ? 'shadow-sm' : ''
                          }`}
                          style={{
                            backgroundColor: activeTab[upload.id] === 'stages' ? 'var(--accent-primary)' : 'transparent',
                            color: activeTab[upload.id] === 'stages' ? 'white' : 'var(--text-secondary)'
                          }}
                        >
                          Analiz Aşamaları
                        </button>
                      )}
                    </div>

                    {/* Tab Content */}
                    {activeTab[upload.id] === 'profile' && upload.result.profile && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <h4 className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                              Kurum Bilgileri
                            </h4>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {upload.result.profile.kurum}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {upload.result.profile.kisiSayisi} kişi • {upload.result.profile.ogunSayisi} öğün
                            </p>
                          </div>
                          
                          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <h4 className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                              Maliyet Limiti
                            </h4>
                            <p className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                              ₺{upload.result.profile.maliyetSiniri?.maksimum || 'Belirtilmemiş'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t"
                             style={{ borderColor: 'var(--border-secondary)' }}>
                          <div className="flex items-center gap-2">
                            <Target size={16} style={{ color: 'var(--accent-primary)' }} />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              Sonraki: Tarif Adaptörü
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownloadProfile(upload.result!.profile!)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              <Download size={16} />
                              İndir
                            </button>
                            <button
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                              style={{
                                backgroundColor: 'var(--accent-primary)',
                                color: 'white'
                              }}
                            >
                              Tarif Adaptörüne Gönder
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Similarity Analysis Tab */}
                    {activeTab[upload.id] === 'similarity' && upload.result.similarityAnalysis && (
                      <div className="space-y-4">
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Benzerlik Analizi
                        </h4>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                Benzer Şartnameler Bulundu
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Veritabanında benzer şartnameler mevcut
                              </p>
                            </div>
                            <span 
                              className="px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: 'var(--bg-success-subtle)',
                                color: 'var(--status-success)'
                              }}
                            >
                              Analiz Tamamlandı
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analysis Stages Tab */}
                    {activeTab[upload.id] === 'stages' && upload.stageLogs && (
                      <div className="space-y-4">
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Analiz Aşamaları
                        </h4>
                        <div className="space-y-3">
                          {upload.stageLogs.map((log, index) => (
                            <div key={index} className="p-4 rounded-lg"
                                 style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                              <div className="flex items-center gap-2 mb-2">
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                                  style={{ backgroundColor: analysisStages[index]?.color || 'var(--text-muted)' }}
                                >
                                  {analysisStages[index]?.id || index + 1}
                                </div>
                                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                                  {log.stage}
                                </span>
                              </div>
                              <pre className="text-xs overflow-x-auto whitespace-pre-wrap"
                                   style={{ color: 'var(--text-muted)' }}>
                                {log.content.substring(0, 200)}...
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Error State */}
                {upload.status === 'error' && upload.result && (
                  <div className="p-6">
                    <div className="p-4 rounded-lg border" 
                         style={{ 
                           backgroundColor: 'var(--bg-error-subtle)',
                           borderColor: 'var(--status-error)'
                         }}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} style={{ color: 'var(--status-error)' }} />
                        <span className="font-medium" style={{ color: 'var(--status-error)' }}>
                          İşleme Hatası
                        </span>
                      </div>
                      {upload.result.errors && upload.result.errors.map((error, index) => (
                        <p key={index} className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {uploads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Şartname Analizi Bekleniyor
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Şartname dosyalarını yükleyin ve AI ile otomatik analiz başlasın
            </p>
          </div>
        )}
      </div>
    </div>
  )
}