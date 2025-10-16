# Solo Developer Implementation Plan - İhale & Şartname Merkezi

## 🚀 HIZLI BAŞLANGIC (2-3 Saat)

### Adım 1: Core Page Oluştur

```bash
# Önce minimal page oluşturalım
mkdir -p app/ihale-sartname
touch app/ihale-sartname/page.tsx
```

### Adım 2: Mevcut Sonnet Service'i Güncelle

Zaten hazır olan `lib/services/sonnet-extraction.ts` dosyasını kullanacaksınız, sadece table-first strategy eklenmiş durumda.

### Adım 3: Basic UI Component

Basit file upload + results gösterimi yapacak component.

---

## 📋 HAFTALIK PLAN (Tek Developer)

### HAFTA 1: Core Functionality

#### Gün 1-2: Basic Setup
- [x] **Mevcut Sonnet entegrasyonu zaten hazır**
- [ ] Single page (`app/ihale-sartname/page.tsx`) oluştur  
- [ ] File upload functionality
- [ ] Basic UI layout

#### Gün 3-4: API Integration  
- [x] **API endpoint zaten hazır** (`app/api/sonnet-extraction/extract/route.ts`)
- [ ] Frontend'den API'yi çağır
- [ ] Loading states ekle
- [ ] Error handling

#### Gün 5-7: Institution Detection
- [ ] Institution candidates gösterimi
- [ ] Radio button selection
- [ ] Confidence indicators

### HAFTA 2: Polish & Advanced Features  

#### Gün 8-10: UI Improvements
- [ ] Progress bar during processing  
- [ ] Confidence color coding
- [ ] Better error messages
- [ ] Responsive design

#### Gün 11-14: Optional Advanced Features
- [ ] OCR fallback (eğer vakit varsa)
- [ ] Manual editing capability
- [ ] Export functionality

---

## 🎯 MİNİMAL VİABLE PRODUCT (MVP)

Bu özellikleri ilk implement edin, diğerleri optional:

### ✅ ZATEN HAZIR OLANLAR
- Sonnet API entegrasyonu (`lib/services/sonnet-extraction.ts`)
- Table-first extraction logic
- Institution candidates system  
- API endpoint (`app/api/sonnet-extraction/extract/route.ts`)
- TypeScript types

### 🔧 YAPMANIZ GEREKENLER (Kritik)

1. **Single Page Component** (`app/ihale-sartname/page.tsx`)
2. **File Upload UI** 
3. **Results Display**
4. **Institution Selection**
5. **Basic Error Handling**

### 🎨 İSTEĞE BAĞLI (Sonra yapabilirsiniz)

- Advanced UI polish
- OCR fallback
- Audit trail  
- Export features
- Detailed confidence breakdowns

---

## 🚦 QUICK START COMMANDS

### 1. Page Component Oluştur

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
  confidence_scores?: {
    institution: number;
    servings: number;
    overall: number;
  };
}

export default function IhaleSartnameMerkezi() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/sonnet-extraction/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Extraction failed');

      const data = await response.json();
      setResult(data);
      setProgress(100);
      
      // Auto-select highest confidence institution
      if (data.institution_candidates?.length > 0) {
        const highestConfidence = data.institution_candidates.reduce((prev: any, current: any) => 
          (current.confidence > prev.confidence) ? current : prev
        );
        setSelectedInstitution(highestConfidence.name);
      }
    } catch (error) {
      console.error('Extraction error:', error);
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          İhale & Şartname Merkezi
        </h1>
        <p className="text-gray-600">
          Şartname dokümanlarından otomatik bilgi çıkarımı - Table-first stratejisi ile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Doküman Yükleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    PDF, DOC, DOCX veya TXT dosyası seçin
                  </p>
                </label>
              </div>

              {file && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>İşleniyor...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Çıkarım Sonuçları</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center text-gray-500 py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>Doküman yükleyerek başlayın</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Institution Selection */}
                {result.institution_candidates && result.institution_candidates.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">İdare Seçimi</h4>
                    {result.institution_candidates.map((candidate, index) => (
                      <div key={index} className="mb-2">
                        <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                          <input
                            type="radio"
                            name="institution"
                            value={candidate.name}
                            checked={selectedInstitution === candidate.name}
                            onChange={(e) => setSelectedInstitution(e.target.value)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{candidate.name}</span>
                              <div className="flex items-center gap-1">
                                {getConfidenceIcon(candidate.confidence)}
                                <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(candidate.confidence)}`}>
                                  {(candidate.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              "{candidate.source_snippet.substring(0, 100)}..."
                            </p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {result.servings_per_day && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-blue-600 font-medium">Günlük Porsiyon</p>
                      <p className="text-lg font-bold text-blue-900">
                        {result.servings_per_day.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {result.contract_duration_days && (
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-green-600 font-medium">Süre (Gün)</p>
                      <p className="text-lg font-bold text-green-900">
                        {result.contract_duration_days}
                      </p>
                    </div>
                  )}
                </div>

                {/* Meal Types */}
                {result.meal_types && result.meal_types.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Öğün Türleri</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.meal_types.map((meal, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {meal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Scores */}
                {result.confidence_scores && (
                  <div>
                    <h4 className="font-medium mb-2">Güven Skorları</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Genel</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${result.confidence_scores.overall * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {(result.confidence_scores.overall * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    className="flex-1"
                    disabled={!selectedInstitution || (result.confidence_scores?.overall || 0) < 0.6}
                  >
                    Onayla ve Kaydet
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Manuel Düzenle
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}