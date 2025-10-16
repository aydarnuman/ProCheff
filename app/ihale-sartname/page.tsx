'use client';

import { useState } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Eye, Download, 
  Edit, Save, Calculator, Clock, MessageSquare, Settings,
  Target, BookOpen, TrendingUp, Plus, Trash2
} from 'lucide-react';

interface ExtractionResult {
  institution_name?: string;
  institution_candidates?: Array<{
    name: string;
    confidence: number;
    source_snippet: string;
  }>;
  servings_per_day?: number;
  meal_types?: string[];
  contract_duration_days?: number;
  project_name?: string;
  location?: string;
  start_date?: string;
  currency?: string;
  confidence_scores?: {
    institution: number;
    servings: number;
    overall: number;
  };
  processing_info?: {
    table_data_found: boolean;
    ocr_used: boolean;
    processing_time_ms: number;
  };
  snippets?: Array<{
    field: string;
    text: string;
    page: number;
    confidence: number;
    source_type: 'table' | 'heading' | 'list' | 'paragraph';
  }>;
}

interface MealType {
  name: string;
  weekly_frequency: number;
  portion_size: number;
  menu_examples: string[];
}

export default function IhaleSartnamePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<'uploaded' | 'extracted' | 'needs_review' | 'approved'>('uploaded');
  const [mealTypes, setMealTypes] = useState<MealType[]>([
    { name: 'Kahvaltı', weekly_frequency: 7, portion_size: 250, menu_examples: ['peynir', 'zeytin', 'simit'] },
    { name: 'Öğle', weekly_frequency: 7, portion_size: 500, menu_examples: ['et yemeği', 'pilav', 'salata'] }
  ]);
  const [comments, setComments] = useState([
    { user: 'Admin', text: 'Ramazan ayında özel menü gerekli', time: '15:30' },
    { user: 'Reviewer', text: 'Portion boyutları kontrol edildi ✓', time: '15:45' }
  ]);
  const [newComment, setNewComment] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    project_name: '',
    location: '',
    institution_type: '',
    contract_duration: 0,
    servings_per_day: 0,
    currency: 'TRY',
    start_date: ''
  });

  // Additional functionality states
  const [activeTab, setActiveTab] = useState('extraction');
  const [databaseStats, setDatabaseStats] = useState<any>(null);
  const [useEnhancedParser, setUseEnhancedParser] = useState(false);
  const [parserResults, setParserResults] = useState<any[]>([]);
  const [kikAnalysis, setKikAnalysis] = useState<any>(null);
  const [proposalData, setProposalData] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setLoading(true);
    setError('');
    setResult(null);
    setStatus('uploaded');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/sonnet-extraction/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setStatus('extracted');

      // Update form data
      setFormData({
        project_name: data.project_name || '',
        location: data.location || '',
        institution_type: data.institution_name || '',
        contract_duration: data.contract_duration_days || 0,
        servings_per_day: data.servings_per_day || 0,
        currency: data.currency || 'TRY',
        start_date: data.start_date || ''
      });

      // Auto-select highest confidence institution
      if (data.institution_candidates?.length > 0) {
        const highest = data.institution_candidates.reduce((prev: any, current: any) => 
          (current.confidence > prev.confidence) ? current : prev
        );
        setSelectedInstitution(highest.name);
      }

      setStatus('needs_review');
    } catch (error) {
      console.error('Extraction error:', error);
      setError(error instanceof Error ? error.message : 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const canApprove = selectedInstitution && (result?.confidence_scores?.overall || 0) >= 0.6;

  const addMealType = () => {
    setMealTypes([...mealTypes, { name: '', weekly_frequency: 7, portion_size: 0, menu_examples: [] }]);
  };

  const removeMealType = (index: number) => {
    setMealTypes(mealTypes.filter((_, i) => i !== index));
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, { user: 'You', text: newComment, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }]);
    setNewComment('');
  };

  const calculateCost = () => {
    const dailyCost = formData.servings_per_day * 25; // 25 TRY per person
    const monthlyCost = dailyCost * 30;
    const totalCost = monthlyCost * (formData.contract_duration / 30);
    return { dailyCost, monthlyCost, totalCost };
  };

  const { dailyCost, monthlyCost, totalCost } = calculateCost();

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch('/api/spec-database/stats');
      const data = await response.json();
      setDatabaseStats(data);
    } catch (error) {
      console.error('Database stats error:', error);
    }
  };

  const handleParserUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('enhanced', useEnhancedParser.toString());
        
        const response = await fetch('/api/spec-parser/parse', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        setParserResults(prev => [...prev, { file: file.name, result }]);
      } catch (error) {
        console.error('Parser error:', error);
      }
    }
  };

  const runKikAnalysis = async () => {
    if (!result) return;
    
    try {
      const response = await fetch('/api/advanced-spec-analyzer/kik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      
      const analysis = await response.json();
      setKikAnalysis(analysis);
    } catch (error) {
      console.error('KIK analysis error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Meta Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🛒 ProCheff — İhale Merkezi
              </h1>
              <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                <option>Proje Seçin</option>
                <option>Ankara Şehir Hastanesi</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                status === 'extracted' ? 'bg-yellow-100 text-yellow-800' :
                status === 'needs_review' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {status === 'uploaded' ? 'Uploaded' :
                 status === 'extracted' ? 'Extracted' :
                 status === 'needs_review' ? 'Needs Review' : 'Approved'}
              </span>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-1" />
                {isEditing ? 'Kaydet' : 'Düzenle'}
              </button>
              <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                <CheckCircle className="h-4 w-4 mr-1" />
                Onayla ve Devam Et
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 pb-4">
            <button
              onClick={() => setActiveTab('extraction')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'extraction'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              📄 Şartname Ekstraksiyon (Table-First)
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'database'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              🗄️ Şartname Veritabanı
            </button>
            <button
              onClick={() => setActiveTab('parser')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'parser'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              🔍 Şartname Parser
            </button>
            <button
              onClick={() => setActiveTab('kik_analysis')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'kik_analysis'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              🎯 Profesyonel KİK Analizi
            </button>
            <button
              onClick={() => setActiveTab('proposal_panel')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'proposal_panel'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              📋 Teklif Paneli
            </button>
          </div>

          {/* Quick Actions based on active tab */}
          <div className="flex space-x-4 pb-4">
            {activeTab === 'extraction' && (
              <>
                <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="h-4 w-4 mr-1" />
                  Yeni Şartname Yükle
                </button>
                <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Versiyon Geçmişi
                </button>
              </>
            )}
            {activeTab === 'database' && (
              <button 
                onClick={loadDatabaseStats}
                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                İstatistikleri Yenile
              </button>
            )}
            {activeTab === 'parser' && (
              <label className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useEnhancedParser}
                  onChange={(e) => setUseEnhancedParser(e.target.checked)}
                  className="mr-2"
                />
                Enhanced Parser Kullan
              </label>
            )}
            {activeTab === 'kik_analysis' && (
              <button 
                onClick={runKikAnalysis}
                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                disabled={!result}
              >
                <Target className="h-4 w-4 mr-1" />
                KİK Analizi Başlat
              </button>
            )}
            {activeTab === 'proposal_panel' && (
              <>
                <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="h-4 w-4 mr-1" />
                  Yeni Teklif Oluştur
                </button>
                <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                  <FileText className="h-4 w-4 mr-1" />
                  Teklif Şablonları
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Content */}
        {activeTab === 'extraction' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Extraction Content */}
            <div className="lg:col-span-2 space-y-6">
            {/* Document Viewer */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Dosya Görüntüleyici
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleUpload}
                        disabled={loading}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          PDF, DOC, DOCX veya TXT dosyası seçin
                        </p>
                      </label>
                    </div>

                    {file && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}

                    {loading && (
                      <div className="mt-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">İşleniyor...</span>
                      </div>
                    )}
                  </div>

                  {/* File Meta */}
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-medium mb-2">📄 Dosya Meta Bilgileri</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Yükleyen: {file ? 'You' : 'N/A'}</p>
                      <p>Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
                      <p>Boyut: {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                      <p>OCR Durumu: {result?.processing_info?.ocr_used ? '✅ Başarılı' : '❌ Kullanılmadı'}</p>
                      <p>Versiyon: v1.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extraction Form */}
            {result && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Çıkarılan Bilgiler - Edit & Review</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Temel Bilgiler</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Proje Adı*
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={formData.project_name}
                            onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                            disabled={!isEditing}
                          />
                          <span className="text-green-600">🟢</span>
                          <span className="text-xs text-gray-500">0.95</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lokasyon
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                            disabled={!isEditing}
                          />
                          <span className="text-yellow-600">🟡</span>
                          <span className="text-xs text-gray-500">0.75</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sözleşme Süresi (gün)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={formData.contract_duration}
                            onChange={(e) => setFormData({...formData, contract_duration: parseInt(e.target.value)})}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                            disabled={!isEditing}
                          />
                          <span className="text-yellow-600">🟡</span>
                          <span className="text-xs text-gray-500">0.68</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Servis Detayları</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Günlük Porsiyon*
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={formData.servings_per_day}
                            onChange={(e) => setFormData({...formData, servings_per_day: parseInt(e.target.value)})}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                            disabled={!isEditing}
                          />
                          <span className="text-green-600">🟢</span>
                          <span className="text-xs text-gray-500">0.95</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Para Birimi
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({...formData, currency: e.target.value})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          disabled={!isEditing}
                        >
                          <option value="TRY">TRY</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Başlangıç Tarihi
                        </label>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Meal Types */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Öğün Tipleri</h3>
                      <button
                        onClick={addMealType}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={!isEditing}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Öğün Ekle
                      </button>
                    </div>
                    <div className="space-y-3">
                      {mealTypes.map((meal, index) => (
                        <div key={index} className="border border-gray-200 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <input
                              type="text"
                              placeholder="Öğün adı"
                              value={meal.name}
                              onChange={(e) => {
                                const updated = [...mealTypes];
                                updated[index].name = e.target.value;
                                setMealTypes(updated);
                              }}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                              disabled={!isEditing}
                            />
                            <button
                              onClick={() => removeMealType(index)}
                              className="text-red-600 hover:text-red-800"
                              disabled={!isEditing}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">Haftalık</label>
                              <input
                                type="number"
                                value={meal.weekly_frequency}
                                onChange={(e) => {
                                  const updated = [...mealTypes];
                                  updated[index].weekly_frequency = parseInt(e.target.value);
                                  setMealTypes(updated);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Porsiyon (g)</label>
                              <input
                                type="number"
                                value={meal.portion_size}
                                onChange={(e) => {
                                  const updated = [...mealTypes];
                                  updated[index].portion_size = parseInt(e.target.value);
                                  setMealTypes(updated);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Institution Detection */}
            {result?.institution_candidates && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Kurum Tespiti (Kritik)
                  </h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {result.institution_candidates.map((candidate, index) => (
                      <label key={index} className="flex items-start space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="institution"
                          value={candidate.name}
                          checked={selectedInstitution === candidate.name}
                          onChange={(e) => setSelectedInstitution(e.target.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{candidate.name}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getConfidenceColor(candidate.confidence)}`}>
                              {(candidate.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            "{candidate.source_snippet.substring(0, 80)}..."
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {!canApprove && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-700">
                        ⚠️ Confidence &lt; 0.60: Zorunlu Onay Gerekli
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Evidence/Snippets */}
            {result?.snippets && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Kanıt Kaynakları
                  </h2>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {result.snippets.map((snippet, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">🔍 {snippet.field}</span>
                          <span className="text-xs text-gray-500">(S.{snippet.page})</span>
                        </div>
                        <p className="text-gray-600">"{snippet.text.substring(0, 60)}..."</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cost Summary */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Maliyet Önizleme
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Günlük:</span>
                    <span className="font-medium">{dailyCost.toLocaleString()} TRY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Aylık:</span>
                    <span className="font-medium">{monthlyCost.toLocaleString()} TRY</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm text-gray-600">Toplam:</span>
                    <span className="font-bold text-lg">{totalCost.toLocaleString()} TRY</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    🧮 Detaylı Hesapla
                  </button>
                  <button className="w-full px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    📊 Maliyet Analizi
                  </button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Notlar & Yorumlar
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3 mb-4">
                  {comments.map((comment, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{comment.user}:</span>
                        <span className="text-xs text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-sm text-gray-700">"{comment.text}"</p>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Yeni not ekle..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={addComment}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Gönder
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Geçmiş & Değişiklikler
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">15.10.2025 14:45 - Sonnet v4.2 ekstraksiyon</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">15.10.2025 15:12 - User123: servings_per_day düzelt</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">15.10.2025 15:30 - Admin456: İdare onayladı</span>
                  </div>
                </div>
                <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                  📚 Tam Geçmişi Görüntüle
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Database Tab Content */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">🗄️ Şartname Veritabanı İstatistikleri</h2>
              {databaseStats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-blue-600 font-medium">Toplam Şartname</p>
                    <p className="text-2xl font-bold text-blue-900">{databaseStats.total_specs}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-green-600 font-medium">Kurum Sayısı</p>
                    <p className="text-2xl font-bold text-green-900">{databaseStats.unique_institutions}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <p className="text-sm text-purple-600 font-medium">Ortalama Güven</p>
                    <p className="text-2xl font-bold text-purple-900">{(databaseStats.avg_confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-yellow-600 font-medium">Son 7 Gün</p>
                    <p className="text-2xl font-bold text-yellow-900">{databaseStats.recent_count}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">İstatistikleri yüklemek için butona tıklayın</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parser Tab Content */}
        {activeTab === 'parser' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">🔍 Şartname Parser</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => e.target.files && handleParserUpload(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Multiple files desteklenir. {useEnhancedParser ? 'Enhanced' : 'Basic'} parser kullanılacak.
                </p>
              </div>
              
              {parserResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Parser Sonuçları</h3>
                  <div className="space-y-3">
                    {parserResults.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded p-4">
                        <h4 className="font-medium">{item.file}</h4>
                        <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(item.result, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KIK Analysis Tab Content */}
        {activeTab === 'kik_analysis' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">🎯 Profesyonel KİK Analizi</h2>
              {!result ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">KİK analizi için önce şartname ekstraksiyon sekmesinden dosya yükleyin</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-blue-600">Mevcut extraction verisi ile KİK analizi yapılabilir</p>
                    <button 
                      onClick={runKikAnalysis}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      KİK Analizi Başlat
                    </button>
                  </div>
                  
                  {kikAnalysis && (
                    <div className="border border-gray-200 rounded p-4">
                      <h3 className="font-medium mb-3">KİK Analizi Sonuçları</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm text-green-600 font-medium">Risk Skoru</p>
                          <p className="text-lg font-bold text-green-900">{kikAnalysis.risk_score}/100</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded">
                          <p className="text-sm text-yellow-600 font-medium">Komplekslik</p>
                          <p className="text-lg font-bold text-yellow-900">{kikAnalysis.complexity_level}</p>
                        </div>
                      </div>
                      {kikAnalysis.recommendations && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Öneriler:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {kikAnalysis.recommendations.map((rec: string, index: number) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proposal Panel Tab Content */}
        {activeTab === 'proposal_panel' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">📋 Teklif Paneli</h2>
              
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {[
                    { id: 1, name: 'Kurum Profili', icon: '🏢' },
                    { id: 2, name: 'Tarif Seçimi', icon: '📄' },
                    { id: 3, name: 'Maliyet Ayarları', icon: '💰' },
                    { id: 4, name: 'Teklif Üretimi', icon: '📊' }
                  ].map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{step.name}</p>
                      </div>
                      {index < 3 && (
                        <div className="flex-1 mx-4">
                          <div className="h-1 bg-gray-200 rounded">
                            <div className={`h-1 rounded ${index === 0 ? 'bg-blue-600 w-full' : 'bg-gray-200 w-0'}`}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form */}
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">🏢 Kurum Bilgileri</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kurum Adı</label>
                        <input
                          type="text"
                          defaultValue={result?.institution_name || formData.project_name || 'Ankara Üniversitesi PMYO'}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Kişi Sayısı</label>
                          <input
                            type="number"
                            defaultValue={result?.servings_per_day || formData.servings_per_day || 500}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sözleşme Süresi</label>
                          <input
                            type="number"
                            defaultValue={result?.contract_duration_days || formData.contract_duration || 365}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="Gün"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">🍽️ Porsiyon Ayarları</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Et Porsiyonu (g)</label>
                        <input type="number" defaultValue="120" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tavuk Porsiyonu (g)</label>
                        <input type="number" defaultValue="100" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sebze Porsiyonu (g)</label>
                        <input type="number" defaultValue="50" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilav/Bulgur (g)</label>
                        <input type="number" defaultValue="80" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">💰 Maliyet Ayarları</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kar Marjı (%)</label>
                        <input type="number" defaultValue="20" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Geçerlilik Süresi (Gün)</label>
                        <input type="number" defaultValue="30" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Şartları</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                          <option>30 gün vadeli</option>
                          <option>45 gün vadeli</option>
                          <option>60 gün vadeli</option>
                          <option>Peşin ödeme</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Preview */}
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">📊 Maliyet Özeti</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Günlük Maliyet:</span>
                        <span className="font-medium">{dailyCost.toLocaleString()} TRY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Aylık Maliyet:</span>
                        <span className="font-medium">{monthlyCost.toLocaleString()} TRY</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm text-gray-600">Yıllık Toplam:</span>
                        <span className="font-bold text-lg">{(monthlyCost * 12).toLocaleString()} TRY</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">⚙️ Özelleştirmeler</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Yerel tedarikçileri öncelikle</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Organik ürün tercihi</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Mevsimsel menü</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Helal sertifikalı</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      🤖 AI Teklif Oluştur
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                      📄 Şablon Kullan
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                      💾 Taslak Kaydet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions - Only show for extraction tab */}
        {activeTab === 'extraction' && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  🔄 Geri Gönder
                </button>
                <button 
                  className={`flex items-center px-4 py-2 rounded text-sm ${
                    canApprove 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!canApprove}
                >
                  ✅ Onayla ve Devam Et
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  📤 Export
                </button>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                📋 Create Tender Package
              </button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-blue-900">
              {activeTab === 'extraction' && 'Table-First Stratejisi Nasıl Çalışır?'}
              {activeTab === 'database' && 'Şartname Veritabanı Hakkında'}
              {activeTab === 'parser' && 'Şartname Parser Özellikleri'}
              {activeTab === 'kik_analysis' && 'KİK Analizi Detayları'}
              {activeTab === 'proposal_panel' && 'Teklif Paneli Özellikleri'}
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {activeTab === 'extraction' && (
                <>
                  <li>• <strong>1. Tablolar</strong> öncelikle taranır (en yüksek güven - confidence 1.0)</li>
                  <li>• <strong>2. Başlıklar</strong> ikincil kaynak (confidence 0.9)</li>
                  <li>• <strong>3. Listeler</strong> üçüncül kaynak (confidence 0.8)</li>
                  <li>• <strong>4. Paragraflar</strong> son çare (confidence 0.6)</li>
                  <li>• <strong>OCR fallback</strong> düşük kalite dokümanlar için otomatik devreye girer</li>
                </>
              )}
              {activeTab === 'database' && (
                <>
                  <li>• Tüm işlenmiş şartnameler merkezi veritabanında saklanır</li>
                  <li>• Kurum profilleri ve benzerlik analizi yapılır</li>
                  <li>• Geçmiş verilerle karşılaştırma imkanı sağlar</li>
                  <li>• AI destekli öneri sistemi mevcuttur</li>
                </>
              )}
              {activeTab === 'parser' && (
                <>
                  <li>• Çoklu dosya upload desteği</li>
                  <li>• Basic ve Enhanced parser seçenekleri</li>
                  <li>• Stage-by-stage işlem logları</li>
                  <li>• JSON formatında detaylı çıktı</li>
                </>
              )}
              {activeTab === 'kik_analysis' && (
                <>
                  <li>• Profesyonel risk değerlendirmesi</li>
                  <li>• Komplekslik seviye analizi</li>
                  <li>• Otomatik öneri sistemi</li>
                  <li>• KİK standartlarına uygunluk kontrolü</li>
                </>
              )}
              {activeTab === 'proposal_panel' && (
                <>
                  <li>• AI destekli otomatik teklif oluşturma</li>
                  <li>• Şartname verilerini kullanarak akıllı doluluk</li>
                  <li>• Porsiyon ve maliyet hesaplamaları</li>
                  <li>• Özelleştirilebilir kar marjı ve şartlar</li>
                  <li>• Yerel tedarikçi ve organik ürün seçenekleri</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}