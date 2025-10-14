'use client'

import { useState, useRef } from 'react'
import { InstitutionProfile, ParseResult, SpecificationParser } from '@/lib/services/specParser'

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
          // Enhanced 5-Stage Parser kullan
          const { EnhancedSpecParserClient } = await import('@/lib/services/enhancedSpecParserClient')
          const enhancedParser = new EnhancedSpecParserClient()
          
          const textContent = buffer.toString('utf-8') // Basit text conversion
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
          // Standart parser kullan
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

        // İlk tab'ı aktif yap (benzerlik analizi varsa onu, yoksa profili)
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
    if (confidence >= 0.8) return 'px-3 py-1 rounded-full text-green-800 bg-green-100'
    if (confidence >= 0.6) return 'px-3 py-1 rounded-full text-yellow-800 bg-yellow-100'
    return 'px-3 py-1 rounded-full text-red-800 bg-red-100'
  }

  const getStatusBadge = (status: string) => {
    const baseClass = "px-3 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'completed':
        return `${baseClass} bg-green-100 text-green-800`
      case 'error':
        return `${baseClass} bg-red-100 text-red-800`
      case 'processing':
        return `${baseClass} bg-blue-100 text-blue-800`
      default:
        return `${baseClass} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                🧩 Dinamik Şartname Motoru
              </h1>
              <p className="text-lg text-gray-600">
                PDF ve Word şartnamelerini yükleyin, AI ile otomatik analiz edilsin
              </p>
            </div>
            
            {/* Enhanced Parser Toggle */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Analiz Modu</p>
                <p className="text-gray-500 text-xs">
                  {useEnhancedParser ? '5-Stage Enhanced' : 'Standart'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useEnhancedParser}
                  onChange={(e) => setUseEnhancedParser(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              {useEnhancedParser && (
                <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold animate-pulse">
                  YENİ
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Parser Info */}
          {useEnhancedParser && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-4 rounded-lg border border-blue-200 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                🚀 5-Stage Enhanced Analysis
              </h3>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-1">A</div>
                  <p className="text-blue-700">Gramaj Çıkarım</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-1">B</div>
                  <p className="text-blue-700">Koşul Analizi</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-1">C</div>
                  <p className="text-blue-700">Profil Oluştur</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-1">D</div>
                  <p className="text-blue-700">Chunk Birleştir</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-1">E</div>
                  <p className="text-blue-700">Benzerlik Analizi</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              📤 Dosya Yükleme
            </h2>
            <p className="text-gray-600">PDF, Word veya metin dosyalarını buraya sürükleyin</p>
          </div>
          
          <div className="p-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                if (e.dataTransfer.files) {
                  handleFileUpload(e.dataTransfer.files)
                }
              }}
            >
              <div className="text-6xl mb-4">📄</div>
              <p className="text-xl mb-2 font-medium">Dosyaları buraya sürükleyin</p>
              <p className="text-sm text-gray-500 mb-6">
                veya tıklayarak seçin (PDF, DOCX, TXT)
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-blue-900 font-medium">🧠 AI analizi devam ediyor...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {uploads.length > 0 && (
          <div className="space-y-6">
            {uploads.map((upload) => (
              <div key={upload.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* File Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{upload.file.name}</h3>
                        {upload.result && (
                          <p className="text-sm text-gray-500">
                            Güven Skoru: 
                            <span className={`ml-2 text-xs ${getConfidenceColor(upload.result.confidence)}`}>
                              %{Math.round(upload.result.confidence * 100)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {upload.status === 'completed' && <span className="text-2xl">✅</span>}
                      {upload.status === 'error' && <span className="text-2xl">❌</span>}
                      {upload.status === 'processing' && (
                        <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                      )}
                      
                      <span className={getStatusBadge(upload.status)}>
                        {upload.status === 'pending' && 'Bekliyor'}
                        {upload.status === 'processing' && 'İşleniyor'}
                        {upload.status === 'completed' && 'Tamamlandı'}
                        {upload.status === 'error' && 'Hata'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {upload.result && (
                  <div className="p-6">
                    {upload.result.success && upload.result.profile ? (
                      <div>
                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-200 mb-6">
                          {[
                            { id: 'profile', label: '🏢 Kurum Profili' },
                            { id: 'portions', label: '⚖️ Gramajlar' },
                            { id: 'conditions', label: '📋 Koşullar' },
                            { id: 'similarity', label: '🔍 Benzerlik Analizi' },
                            ...(upload.enhancedMode ? [{ id: 'stages', label: '🔄 Stage Analizi' }] : [])
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(prev => ({ ...prev, [upload.id]: tab.id }))}
                              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab[upload.id] === tab.id
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        {activeTab[upload.id] === 'profile' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-gray-500">Kurum Adı</label>
                                <p className="text-lg font-semibold mt-1">{upload.result.profile.kurum}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-gray-500">Kurum Kodu</label>
                                <p className="text-lg mt-1">{upload.result.profile.kurumKodu}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-gray-500">Menü Tipi</label>
                                <p className="text-lg mt-1">{upload.result.profile.menuTipi}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-gray-500">Öğün Sayısı</label>
                                <p className="text-lg mt-1">{upload.result.profile.ogunSayisi}</p>
                              </div>
                              {upload.result.profile.kisiSayisi && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <label className="text-sm font-medium text-gray-500">Kişi Sayısı</label>
                                  <p className="text-lg mt-1">{upload.result.profile.kisiSayisi?.toLocaleString()}</p>
                                </div>
                              )}
                              {upload.result.profile.maliyetSiniri && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <label className="text-sm font-medium text-gray-500">Bütçe Limiti</label>
                                  <p className="text-lg mt-1">
                                    {upload.result.profile.maliyetSiniri.minimum && `Min: ${upload.result.profile.maliyetSiniri.minimum}₺`}
                                    {upload.result.profile.maliyetSiniri.minimum && upload.result.profile.maliyetSiniri.maksimum && ' - '}
                                    {upload.result.profile.maliyetSiniri.maksimum && `Max: ${upload.result.profile.maliyetSiniri.maksimum}₺`}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <button 
                                onClick={() => handleDownloadProfile(upload.result!.profile!)}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                              >
                                💾 JSON İndir
                              </button>
                            </div>
                          </div>
                        )}

                        {activeTab[upload.id] === 'portions' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(upload.result.profile.porsiyon).map(([key, value]) => (
                              value && (
                                <div key={key} className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                                  <div className="text-sm text-blue-600 font-medium capitalize mb-1">{key}</div>
                                  <div className="text-2xl font-bold text-blue-900">{value}g</div>
                                </div>
                              )
                            ))}
                          </div>
                        )}

                        {activeTab[upload.id] === 'conditions' && (
                          <div className="space-y-6">
                            {upload.result.profile.ozelKosullar.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3 text-gray-900">🔹 Özel Koşullar</h4>
                                <div className="flex flex-wrap gap-2">
                                  {upload.result.profile.ozelKosullar.map((condition, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                      {condition}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {upload.result.profile.hijyenKosullar.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3 text-gray-900">🧼 Hijyen Koşulları</h4>
                                <div className="flex flex-wrap gap-2">
                                  {upload.result.profile.hijyenKosullar.map((condition, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                      {condition}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {upload.result.profile.servisKosullar.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3 text-gray-900">🍽️ Servis Koşulları</h4>
                                <div className="flex flex-wrap gap-2">
                                  {upload.result.profile.servisKosullar.map((condition, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                      {condition}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {upload.result.profile.teslimKosullar && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-3 text-gray-900">🚚 Teslimat Bilgileri</h4>
                                <div className="space-y-2 text-sm">
                                  {upload.result.profile.teslimKosullar.adres && (
                                    <p><strong>Adres:</strong> {upload.result.profile.teslimKosullar.adres}</p>
                                  )}
                                  {upload.result.profile.teslimKosullar.zaman && (
                                    <p><strong>Zaman:</strong> {upload.result.profile.teslimKosullar.zaman}</p>
                                  )}
                                  {upload.result.profile.teslimKosullar.sıklık && (
                                    <p><strong>Sıklık:</strong> {upload.result.profile.teslimKosullar.sıklık}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Similarity Analysis Tab */}
                        {activeTab[upload.id] === 'similarity' && upload.result.similarityAnalysis && (
                          <div className="space-y-6">
                            
                            {/* AI Insights */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
                              <h3 className="text-xl font-semibold mb-4 text-blue-900 flex items-center gap-2">
                                🤖 AI Analiz Sonucu
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-blue-700 font-medium">En İyi Eşleşme:</p>
                                  <p className="text-lg font-semibold text-blue-900">
                                    {upload.result.similarityAnalysis.aiInsights.bestMatch}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-blue-700 font-medium">AI Güven Seviyesi:</p>
                                  <p className="text-lg font-semibold text-green-600">
                                    %{Math.round(upload.result.similarityAnalysis.aiInsights.confidenceLevel * 100)}
                                  </p>
                                </div>
                              </div>

                              {upload.result.similarityAnalysis.aiInsights.recommendations.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-semibold mb-2 text-blue-800">💡 AI Önerileri:</h4>
                                  <ul className="space-y-1">
                                    {upload.result.similarityAnalysis.aiInsights.recommendations.map((rec, idx) => (
                                      <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {upload.result.similarityAnalysis.aiInsights.riskFactors.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2 text-orange-700">⚠️ Risk Faktörleri:</h4>
                                  <ul className="space-y-1">
                                    {upload.result.similarityAnalysis.aiInsights.riskFactors.map((risk, idx) => (
                                      <li key={idx} className="text-sm text-orange-600 flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">⚡</span>
                                        <span>{risk}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Similar Profiles */}
                            {upload.result.similarityAnalysis.similarProfiles.length > 0 ? (
                              <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                  📊 Benzer Şartnameler ({upload.result.similarityAnalysis.similarProfiles.length})
                                </h3>
                                
                                <div className="space-y-4">
                                  {upload.result.similarityAnalysis.similarProfiles.map((similar, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                                      
                                      {/* Header */}
                                      <div className="flex items-center justify-between mb-3">
                                        <div>
                                          <h4 className="font-semibold text-gray-900">
                                            {similar.record.institutionProfile.kurum}
                                          </h4>
                                          <p className="text-sm text-gray-500">
                                            {similar.record.fileName} • {similar.record.uploadDate.toLocaleDateString('tr-TR')}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            similar.similarity > 0.8 ? 'bg-green-100 text-green-800' :
                                            similar.similarity > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            %{Math.round(similar.similarity * 100)} Benzer
                                          </div>
                                        </div>
                                      </div>

                                      {/* Tags */}
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                          📍 {similar.record.tags.region}
                                        </span>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                          🏢 {similar.record.tags.institutionType}
                                        </span>
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                          👥 {similar.record.tags.personCount} kişi
                                        </span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                          ⚖️ {similar.record.tags.gramajCategory} gramaj
                                        </span>
                                      </div>

                                      {/* Match Reasons & Differences */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {similar.matchReasons.length > 0 && (
                                          <div>
                                            <h5 className="font-medium text-green-700 mb-2">✅ Benzerlikler:</h5>
                                            <ul className="space-y-1">
                                              {similar.matchReasons.map((reason: string, ridx: number) => (
                                                <li key={ridx} className="text-xs text-green-600 flex items-start gap-1">
                                                  <span className="text-green-500 mt-0.5">•</span>
                                                  <span>{reason}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {similar.differences.length > 0 && (
                                          <div>
                                            <h5 className="font-medium text-orange-700 mb-2">⚠️ Farklar:</h5>
                                            <ul className="space-y-1">
                                              {similar.differences.map((diff: string, didx: number) => (
                                                <li key={didx} className="text-xs text-orange-600 flex items-start gap-1">
                                                  <span className="text-orange-500 mt-0.5">•</span>
                                                  <span>{diff}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>

                                      {/* Quick Stats Comparison */}
                                      <div className="mt-4 pt-3 border-t border-gray-100">
                                        <div className="grid grid-cols-3 gap-4 text-center text-xs">
                                          <div>
                                            <p className="text-gray-500">Et Gramajı</p>
                                            <p className="font-semibold">{similar.record.institutionProfile.porsiyon.et}g</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-500">Kişi Sayısı</p>
                                            <p className="font-semibold">{similar.record.institutionProfile.kisiSayisi || 'N/A'}</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-500">Maliyet Sınırı</p>
                                            <p className="font-semibold">
                                              ₺{similar.record.institutionProfile.maliyetSiniri?.maksimum?.toFixed(2) || 'N/A'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <div className="text-4xl mb-2">🎯</div>
                                <p className="text-gray-600 font-medium">İlk Şartname Kaydı</p>
                                <p className="text-sm text-gray-500">Bu kurumun veritabanında benzer profil bulunmuyor.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Stage Analysis Tab */}
                        {activeTab[upload.id] === 'stages' && upload.stageLogs && upload.stageLogs.length > 0 && (
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h3 className="text-lg font-semibold text-blue-800 mb-2">🔄 5-Stage Analysis Logs</h3>
                              <p className="text-sm text-blue-600">Enhanced Claude prompt analysis through 5 stages</p>
                            </div>
                            
                            <div className="space-y-4">
                              {upload.stageLogs.map((log, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-800">{log.stage}</h4>
                                      <span className="text-xs text-gray-500">
                                        {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-4">
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border overflow-x-auto">
                                      {log.content}
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-red-800 font-semibold mb-2">❌ Analiz Başarısız</p>
                        {upload.result.errors && (
                          <ul className="text-sm text-red-600 space-y-1">
                            {upload.result.errors.map((error, idx) => (
                              <li key={idx}>• {error}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {uploads.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg">Henüz dosya yüklenmedi</p>
            <p className="text-sm">Şartname dosyalarınızı yükleyerek başlayın</p>
          </div>
        )}
      </div>
    </div>
  )
}