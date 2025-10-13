import React, { useState, useMemo, useCallback, useContext, useEffect } from 'react';
import { MonthlyPlan, Recipe, PriceList, ApiResource, AiError, AnalysisSummary, InstitutionalMenus, MealSlots, AnalysisScope, ToastMessage, AiAnalysisJob } from '../types';
import Icon from './Icon';
import { calculateCost } from '../utils';
import { AiAnalysisContext } from '../App';

type ModalTab = 'summary' | 'menus' | 'risks' | 'learning';

// --- MAIN MODAL COMPONENT ---
interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownPlan: MonthlyPlan;
  recipes: Recipe[];
  priceList: PriceList;
  apiResources: ApiResource[];
  aiErrors: AiError[];
  institutionalMenus: InstitutionalMenus;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({ isOpen, onClose, ownPlan, recipes, priceList, apiResources, aiErrors, institutionalMenus, addToast }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('summary');
  const [selectedInstitution, setSelectedInstitution] = useState<string>("Kendi Menüm");
  const aiContext = useContext(AiAnalysisContext);

  const menus = useMemo(() => ({ "Kendi Menüm": ownPlan, ...institutionalMenus }), [ownPlan, institutionalMenus]);
  const currentMenu = menus[selectedInstitution as keyof typeof menus];
  
  const currentScope: AnalysisScope = useMemo(() => {
    const now = new Date();
    return {
        institution: selectedInstitution,
        year: now.getFullYear(),
        month: now.getMonth(),
    }
  }, [selectedInstitution]);

  const jobKey = useMemo(() => `${currentScope.institution}|${currentScope.year}-${currentScope.month}`,[currentScope]);

  const analysisData = aiContext?.analysisState.cache[jobKey];
  const activeJob = aiContext?.analysisState.jobs.find(j => j.status === 'running' || j.status === 'queued');
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);
  
  const handleRequestAnalysis = useCallback(() => {
    if (!aiContext) return;
    aiContext.requestAnalysis(currentScope, currentMenu)
        .then(() => {
            addToast("Analiz başarıyla tamamlandı.", "success");
        })
        .catch((err: Error) => {
            addToast(err.message, "error");
        });
        addToast("Analiz isteği kuyruğa eklendi.", "info");
  }, [aiContext, currentScope, currentMenu, addToast]);

  if (!isOpen) return null;
  
  const formatCurrency = (value: number) => value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 });
  
  // --- TAB COMPONENTS ---
  const SummaryTab = () => {
      if (!analysisData) {
          return <div className="text-center py-10"><p className="text-gray-400">Bu menü için analiz sonucu bulunmuyor. Lütfen analizi başlatın.</p></div>
      }
      const summary = analysisData.summary;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card text-center">
                <h4 className="stat-title">Toplam Maliyet</h4>
                <p className="stat-value text-emerald-400">{formatCurrency(summary.totalCost)}</p>
            </div>
            <div className="card text-center">
                <h4 className="stat-title">Günlük Ortalama</h4>
                <p className="stat-value">{formatCurrency(summary.avgDailyCost)}</p>
            </div>
            <div className="card text-center">
                <h4 className="stat-title">Pahalı/Ucuz Gün</h4>
                <p className="stat-value">
                    <span className="text-red-400">{formatCurrency(summary.expensiveDay.cost)}</span> / <span className="text-green-400">{formatCurrency(summary.cheapDay.cost)}</span>
                </p>
            </div>
            <div className="card text-center">
                <h4 className="stat-title">Çeşitlilik Skoru</h4>
                <p className="stat-value text-blue-400">{summary.diversityScore}/100</p>
            </div>
            <div className="card lg:col-span-4">
                 <h4 className="font-semibold text-white mb-2">Kişi Başı Maliyet (Son 15 Gün)</h4>
                 <p className="text-xs text-gray-400">Bu alan, maliyet anormalliklerini gösteren bir grafik içerecektir.</p>
            </div>
        </div>
      );
  };

  const InstitutionMenuTab = () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();

      const renderCalendar = () => {
        const calendarDays = [];
        const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < startDay; i++) {
          calendarDays.push(<div key={`empty-${i}`} className="mini-calendar-day empty"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayPlan = currentMenu.days?.[dateStr];
          const personCount = currentMenu.personCount || 1;
          
          let dailyCost = 0;
          if (dayPlan) {
              (Object.keys(dayPlan) as Array<keyof MealSlots>).forEach(slot => {
                  const meal = dayPlan[slot];
                  if(meal) {
                      const recipe = recipes.find(r => r.name === meal.name);
                      if (recipe) {
                          dailyCost += calculateCost(recipe.ingredients, priceList) * personCount;
                      }
                  }
              });
          }

          calendarDays.push(
            <div key={day} className={`mini-calendar-day ${dayPlan ? 'planned' : ''}`}>
              <div className="day-number">{day}</div>
              {dayPlan && (
                <div className="day-cost">{formatCurrency(dailyCost / personCount)}</div>
              )}
            </div>
          );
        }
        return calendarDays;
      };

      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <select value={selectedInstitution} onChange={e => setSelectedInstitution(e.target.value)} className="form-select w-auto">
              {Object.keys(menus).map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <span className="text-sm text-gray-400">Kişi Sayısı: <strong className="text-white">{currentMenu.personCount || 'N/A'}</strong></span>
          </div>
          <div className="mini-calendar-grid">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => <div key={d} className="mini-calendar-header">{d}</div>)}
            {renderCalendar()}
          </div>
        </div>
      );
  };
  
  const RisksTab = () => {
    // This is mock data, in a real app this would be computed by AI
    const risks = [
      { id: 1, type: 'Fiyat', desc: '3 malzemenin fiyatı 7 günden eski.', severity: 'medium' },
      { id: 2, type: 'Kaynak', desc: '5 malzemenin 3\'ten az fiyat kaynağı var.', severity: 'medium' },
      { id: 3, type: 'Maliyet', desc: '15. gündeki menü, aylık ortalamanın %45 üzerinde.', severity: 'high' },
      { id: 4, type: 'Porsiyon', desc: 'Tavuk Sote tarifinin porsiyon gramajı standartların altında.', severity: 'low' },
    ];
    return (
      <div className="space-y-3">
        {risks.map(risk => (
          <div key={risk.id} className={`risk-item severity-${risk.severity}`}>
            <div className="risk-info">
              <span className="risk-type">{risk.type}</span>
              <p className="risk-desc">{risk.desc}</p>
            </div>
            <button className="btn btn-secondary text-sm">Önerileri Gör (Diff)</button>
          </div>
        ))}
      </div>
    );
  };

  const LearningTab = () => (
      <div className="space-y-4">
        <div className="card">
            <h4 className="font-semibold text-white mb-2">Analiz Geçmişi (Son 10)</h4>
            <div className="table-wrapper">
                <table className="table">
                    <thead><tr><th>Tarih</th><th>Durum</th><th>Detay</th></tr></thead>
                    <tbody className="table-body">
                        {aiContext?.analysisState.history.slice(0, 10).map((job: AiAnalysisJob) => (
                            <tr key={job.key + job.createdAt}>
                                <td>{new Date(job.createdAt).toLocaleString('tr-TR')}</td>
                                <td>
                                    <span className={`status-badge ${job.status === 'completed' ? 'status-badge-auto' : 'status-badge-manual'}`}>{job.status}</span>
                                </td>
                                <td>{job.error || 'Başarılı'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
  );
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary': return <SummaryTab />;
      case 'menus': return <InstitutionMenuTab />;
      case 'risks': return <RisksTab />;
      case 'learning': return <LearningTab />;
      default: return null;
    }
  };
  
  const UpdateButton = () => {
    const [cooldown, setCooldown] = useState(0);
    const state = aiContext!.analysisState;
    const now = Date.now();

    useEffect(() => {
        const interval = setInterval(() => {
            const cd = state.cooldowns[jobKey];
            if (cd && now < cd) {
                setCooldown(Math.ceil((cd - now) / 1000));
            } else {
                setCooldown(0);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [state.cooldowns, jobKey, now]);

    if (activeJob) {
        const queuePosition = state.jobs.findIndex(j => j.key === activeJob.key);
        const totalInQueue = state.jobs.length;
        const statusText = activeJob.status === 'running' 
            ? `İşleniyor (Deneme: ${activeJob.retries + 1})`
            : `Kuyrukta (${queuePosition + 1}/${totalInQueue})`;

        return <button className="btn btn-secondary" disabled><Icon name="spinner" className="animate-spin icon"/> {statusText}</button>
    }
    
    if (cooldown > 0) {
       return <button className="btn btn-secondary" disabled>Bekleyin ({cooldown}s)</button>
    }
    
    return <button onClick={handleRequestAnalysis} className="btn btn-primary">Analizi Güncelle</button>
  }


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ai-analysis-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Kurum Analizleri (AI)</h3>
            <p className="text-sm text-gray-400 mt-1">
                {analysisData ? `Son güncelleme: ${new Date(analysisData.timestamp).toLocaleString('tr-TR')}` : 'Önizleme modu, henüz analiz yapılmadı.'}
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn"><Icon name="close" /></button>
        </div>
        
        {aiContext?.analysisState.circuitBreaker.state === 'OPEN' && (
            <div className="m-4 p-3 text-center bg-yellow-900/50 border border-yellow-700 text-yellow-300 rounded-lg text-sm">
                <Icon name="warning" className="inline w-4 h-4 mr-2"/>
                Yoğunluk nedeniyle analiz geçici olarak durduruldu. Lütfen daha sonra tekrar deneyin.
            </div>
        )}

        <div className="modal-body">
            <div className="ai-modal-tabs">
                <button onClick={() => setActiveTab('summary')} className={activeTab === 'summary' ? 'active' : ''}><Icon name="chart-bar" />Aylık Özet</button>
                <button onClick={() => setActiveTab('menus')} className={activeTab === 'menus' ? 'active' : ''}><Icon name="building" />Kurum Menüleri</button>
                <button onClick={() => setActiveTab('risks')} className={activeTab === 'risks' ? 'active' : ''}><Icon name="warning" />Risk & Uyarılar</button>
                <button onClick={() => setActiveTab('learning')} className={activeTab === 'learning' ? 'active' : ''}><Icon name="lab" />Analiz Geçmişi</button>
            </div>
            <div className="ai-modal-content">
                {renderTabContent()}
            </div>
        </div>

        <div className="modal-footer justify-end">
            <UpdateButton />
        </div>
      </div>
    </div>
  );
};

export default AiAnalysisModal;
