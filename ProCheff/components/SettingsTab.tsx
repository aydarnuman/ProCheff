





import React, { useState, useCallback, useRef } from 'react';
import { AiSettings, ApiResource, AiError, ToastMessage } from '../types';
import Icon from './Icon';
import { safeCall, SafeCallResult } from '../utils/safeCall';

// --- TYPES & STATE MANAGEMENT ---
type AsyncResource<T> = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: string | null;
};

type TestResult = {
  status: 'idle' | 'loading' | 'success' | 'error';
  code?: number;
  latency?: number;
  message?: string;
};

const initialAsyncResource: AsyncResource<any> = { status: 'idle', data: null, error: null };

// --- HELPER & SUB-COMPONENTS ---

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="card">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        {children}
    </div>
);

const DataStateWrapper: React.FC<{
    resource: AsyncResource<any>;
    onLoad: () => void;
    children: React.ReactNode;
    loadButtonText: string;
}> = ({ resource, onLoad, children, loadButtonText }) => {
    switch (resource.status) {
        case 'idle':
            return (
                <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
                    <h4 className="text-lg font-semibold text-white">Veriler yüklenmedi</h4>
                    <p className="text-gray-400 mt-2">Gizlilik ve hız için otomatik çağrı yapmıyoruz. Başlamak için butona tıklayın.</p>
                    <button onClick={onLoad} className="btn btn-primary mt-4">
                        <Icon name="import" className="icon" /> {loadButtonText}
                    </button>
                </div>
            );
        case 'loading':
            return (
                <div className="flex items-center justify-center p-8">
                    <Icon name="spinner" className="animate-spin h-8 w-8 text-emerald-400" />
                    <span className="ml-3 text-lg font-semibold text-gray-300">Yükleniyor...</span>
                </div>
            );
        case 'error':
            return (
                <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-center">
                    <h4 className="font-bold text-red-400">Bağlantı hatası veya yanıt alınamadı.</h4>
                    <p className="text-sm text-red-300 mt-1">{resource.error}</p>
                    <button onClick={onLoad} className="btn btn-secondary mt-3">
                        <Icon name="reset" className="icon" /> Yeniden Dene
                    </button>
                </div>
            );
        case 'success':
            return <>{children}</>;
    }
};


// --- SETTINGS TABS ---
interface IntelligenceCenterTabProps {
  settings: AiSettings;
  errors: AiError[];
  setAiErrors: (errors: AiError[] | ((prevState: AiError[]) => AiError[])) => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const IntelligenceCenterTab: React.FC<IntelligenceCenterTabProps> = ({ settings, errors, setAiErrors, addToast }) => {
    const [aiSettingsState, setAiSettingsState] = useState<AsyncResource<AiSettings>>({ status: 'idle', data: null, error: null });
    const [aiErrorsState, setAiErrorsState] = useState<AsyncResource<AiError[]>>({ status: 'idle', data: null, error: null });

    const handleLoadSettings = async () => {
        setAiSettingsState({ ...initialAsyncResource, status: 'loading' });
        const result = await safeCall(() => new Promise<AiSettings>(res => setTimeout(() => res(settings), 1000)));
        if (result.ok === false) {
            setAiSettingsState({ status: 'error', data: null, error: result.error });
        } else {
            setAiSettingsState({ status: 'success', data: result.data, error: null });
        }
    };
    
    const handleLoadErrors = async () => {
        setAiErrorsState({ ...initialAsyncResource, status: 'loading' });
        const result = await safeCall(() => new Promise<AiError[]>(res => setTimeout(() => res(errors), 800)));
        if (result.ok === false) {
            setAiErrorsState({ status: 'error', data: null, error: result.error });
        } else {
            setAiErrorsState({ status: 'success', data: result.data, error: null });
        }
    };

    const handleCopyErrorDetails = (error: AiError) => {
      if (!error.details) {
        addToast('Bu hata için kopyalanacak detay bulunmuyor.', 'info');
        return;
      }
      const detailsString = JSON.stringify(error.details, null, 2);
      navigator.clipboard.writeText(detailsString).then(() => {
        addToast('Hata detayları panoya kopyalandı.', 'success');
      }).catch(err => {
        addToast('Detaylar kopyalanamadı.', 'error');
        console.error('Copy failed', err);
      });
    };

    const handleMarkAsResolved = (errorId: string) => {
      setAiErrors(prevErrors => 
        prevErrors.map(err => 
          err.id === errorId ? { ...err, status: 'Düzeltilmiş' } : err
        )
      );
      addToast('Hata çözüldü olarak işaretlendi.', 'success');
    };

    return (
        <div className="space-y-6">
            <InfoCard title="AI Davranış Ayarları">
                <DataStateWrapper resource={aiSettingsState} onLoad={handleLoadSettings} loadButtonText="AI Ayarlarını Yükle">
                    <p>AI davranış ayarları burada gösterilecek. Mevcut ayar: {aiSettingsState.data?.analysisMode}</p>
                </DataStateWrapper>
            </InfoCard>
            <InfoCard title="Hata Laboratuvarı">
                <DataStateWrapper resource={aiErrorsState} onLoad={handleLoadErrors} loadButtonText="Son Hata Kayıtlarını Getir">
                    {aiErrorsState.data && aiErrorsState.data.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Tarih</th>
                                        <th>Açıklama</th>
                                        <th>Durum</th>
                                        <th className="text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {aiErrorsState.data.map(err => {
                                        const statusClasses: Record<AiError['status'], string> = {
                                            'Düzeltilmiş': 'error-status-fixed',
                                            'Beklemede': 'error-status-pending',
                                            'Onay Bekliyor': 'error-status-approval',
                                            'İnceleniyor': 'error-status-reviewing',
                                        };
                                        return (
                                            <tr key={err.id}>
                                                <td>{new Date(err.date).toLocaleDateString('tr-TR')}</td>
                                                <td style={{ whiteSpace: 'normal'}}>{err.description}</td>
                                                <td>
                                                    <span className={`error-status-badge ${statusClasses[err.status]}`}>
                                                        {err.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                                                        <button 
                                                            className="btn btn-secondary btn-icon-only"
                                                            onClick={() => handleCopyErrorDetails(err)}
                                                            title="Hata Detaylarını Kopyala"
                                                        >
                                                            <Icon name="copy" className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            className="btn btn-secondary btn-icon-only"
                                                            onClick={() => handleMarkAsResolved(err.id)}
                                                            disabled={err.status === 'Düzeltilmiş'}
                                                            title="Çözüldü Olarak İşaretle"
                                                        >
                                                            <Icon name="check-circle" className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-gray-400 text-center py-4">Görüntülenecek hata kaydı bulunmuyor.</p>}
                </DataStateWrapper>
            </InfoCard>
        </div>
    );
};

const ApiResourcesTab: React.FC<{ initialResources: ApiResource[]; addToast: SettingsTabProps['addToast'] }> = ({ initialResources, addToast }) => {
    const [resourcesState, setResourcesState] = useState<AsyncResource<ApiResource[]>>(initialAsyncResource);
    const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

    const handleLoadResources = async () => {
        setResourcesState({ ...initialAsyncResource, status: 'loading' });
        const result = await safeCall(() => new Promise<ApiResource[]>(res => setTimeout(() => res(initialResources), 1200)));
        if (result.ok === false) {
            setResourcesState({ status: 'error', data: null, error: result.error });
        } else {
            setResourcesState({ status: 'success', data: result.data, error: null });
            // Initialize test results state
            const initialResults: Record<string, TestResult> = {};
            result.data.forEach(r => { initialResults[r.id] = { status: 'idle' } });
            setTestResults(initialResults);
        }
    };
    
    const mockApiTest = (url: string): Promise<{ code: number; latency: number }> => {
        return new Promise((resolve, reject) => {
            const latency = 50 + Math.random() * 800;
            setTimeout(() => {
                const outcome = Math.random();
                if (outcome < 0.7) resolve({ code: 200, latency }); // 70% success
                else if (outcome < 0.8) resolve({ code: 401, latency }); // 10% auth error
                else if (outcome < 0.9) resolve({ code: 429, latency }); // 10% rate limit
                else reject(new Error("Sunucu geçici olarak yanıt vermiyor. (503)")); // 10% server error
            }, latency);
        });
    };

    const runTest = async (api: ApiResource) => {
        setTestResults(prev => ({ ...prev, [api.id]: { status: 'loading' } }));
        const result = await safeCall(() => mockApiTest(api.baseUrl));
        
        if(result.ok === false) {
             const codeMatch = result.error.match(/\((\d{3})\)/);
             const code = codeMatch ? parseInt(codeMatch[1]) : 500;
             setTestResults(prev => ({ ...prev, [api.id]: { status: 'error', code, message: result.error } }));
        } else {
             setTestResults(prev => ({ ...prev, [api.id]: { status: 'success', code: result.data.code, latency: result.data.latency } }));
        }
    };
    
    const runAllTests = () => {
        if (!resourcesState.data) return;
        addToast("Tüm API kaynakları test ediliyor...", "info");
        resourcesState.data.forEach(runTest);
    };

    const getErrorMessage = (code?: number): string => {
        if (code === 401) return "Yetki hatası, oturumu kontrol edin.";
        if (code === 404) return "Kayıt bulunamadı.";
        if (code === 429) return "Sınır aşıldı, 1 dk sonra tekrar deneyin.";
        if (code && code >= 500) return "Sunucu geçici olarak yanıt vermiyor.";
        return "Bilinmeyen bağlantı hatası.";
    };

    return (
        <InfoCard title="API Kaynakları Yönetimi">
            <DataStateWrapper resource={resourcesState} onLoad={handleLoadResources} loadButtonText="Kaynakları Göster">
                <div className="mb-4 flex justify-end">
                    <button onClick={runAllTests} className="btn btn-secondary">
                        <Icon name="check-circle" className="icon" /> Tümünü Test Et
                    </button>
                </div>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kaynak Adı</th>
                                <th>Durum</th>
                                <th>Test Sonucu</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {resourcesState.data?.map(api => {
                                const test = testResults[api.id];
                                return (
                                <tr key={api.id}>
                                    <td className="font-semibold text-white">{api.name}</td>
                                    <td><span className="status-badge status-badge-auto">{api.state}</span></td>
                                    <td className="test-action-wrapper">
                                        {test?.status === 'idle' && <span className="text-sm text-gray-500">-</span>}
                                        {test?.status === 'loading' && <div className="result-chip loading"><Icon name="spinner" className="animate-spin icon" /> Test Ediliyor...</div>}
                                        {test?.status === 'success' && <div className="result-chip success"><Icon name="check-circle" className="icon" /> {test.code} OK ({test.latency?.toFixed(0)}ms)</div>}
                                        {test?.status === 'error' && <div className="result-chip error"><Icon name="x-circle" className="icon" /> {test.code} - {getErrorMessage(test.code)}</div>}
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn btn-secondary btn-icon-only" onClick={() => runTest(api)} title="Test Et"><Icon name="check-circle" className="w-4 h-4" /></button>
                                            <button className="btn btn-secondary btn-icon-only" title="Düzenle"><Icon name="edit" className="w-4 h-4" /></button>
                                            <button className="btn btn-danger btn-icon-only" title="Sil"><Icon name="trash" className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </DataStateWrapper>
        </InfoCard>
    );
};


const GeneralSettingsTab: React.FC<{
    handleExportData: () => void;
    handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearLogs: () => void;
}> = ({ handleExportData, handleImportData, onClearLogs }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <InfoCard title="Genel Uygulama Ayarları">
            <div className="space-y-4">
                <div className="setting-row">
                    <div>
                        <p className="setting-label">Veri Yönetimi</p>
                        <p className="setting-description">Tüm uygulama verilerinizi yedekleyin veya geri yükleyin.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">
                            <Icon name="import" className="icon" /> İçe Aktar (.json)
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json"/>
                        <button onClick={handleExportData} className="btn btn-secondary">
                            <Icon name="export" className="icon" /> Dışa Aktar
                        </button>
                    </div>
                </div>
                <div className="setting-row">
                     <div>
                        <p className="setting-label">Hata Günlüğünü Temizle</p>
                        <p className="setting-description">Yapay zekanın tüm öğrenme ve hata kayıtlarını kalıcı olarak siler.</p>
                    </div>
                    <button onClick={onClearLogs} className="btn btn-danger">
                        <Icon name="trash" className="icon" /> Günlüğü Temizle
                    </button>
                </div>
            </div>
        </InfoCard>
    );
};


// --- MAIN COMPONENT ---
interface SettingsTabProps {
  activeSubTab: 'intelligence' | 'api' | 'general';
  aiSettings: AiSettings;
  setAiSettings: (settings: AiSettings | ((prevState: AiSettings) => AiSettings)) => void;
  apiResources: ApiResource[];
  setApiResources: (resources: ApiResource[] | ((prevState: ApiResource[]) => ApiResource[])) => void;
  aiErrors: AiError[];
  setAiErrors: (errors: AiError[] | ((prevState: AiError[]) => AiError[])) => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
  handleExportData: () => void;
  handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}


const SettingsTab: React.FC<SettingsTabProps> = ({
  activeSubTab,
  aiSettings,
  setAiSettings,
  apiResources,
  setApiResources,
  aiErrors,
  setAiErrors,
  addToast,
  handleExportData,
  handleImportData,
}) => {
  
  const handleClearErrorLog = () => {
    if (window.confirm("Tüm yapay zeka hata ve öğrenme günlüklerini temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
        setAiErrors([]);
        addToast("Hata günlüğü başarıyla temizlendi.", "success");
    }
  };

  const renderContent = () => {
    switch (activeSubTab) {
      case 'general':
        return <GeneralSettingsTab 
                    handleExportData={handleExportData}
                    handleImportData={handleImportData}
                    onClearLogs={handleClearErrorLog}
                />;
      case 'api':
        return <ApiResourcesTab initialResources={apiResources} addToast={addToast} />;
      case 'intelligence':
      default:
        return <IntelligenceCenterTab 
                  settings={aiSettings} 
                  errors={aiErrors} 
                  setAiErrors={setAiErrors}
                  addToast={addToast}
                />;
    }
  };

  return (
    <div className="space-y-6">
        {renderContent()}
    </div>
  );
};

export default SettingsTab;