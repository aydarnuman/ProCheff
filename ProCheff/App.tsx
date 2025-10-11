

import React, { useState, useEffect, useCallback, createContext } from 'react';
import { ActiveTab, PriceList, Recipe, MonthlyPlan, AiSettings, ApiResource, AiError, AiAnalysisState, AnalysisScope, ToastMessage } from './types';
import { DEFAULT_PRICES, DEFAULT_RECIPES, INITIAL_MONTHLY_PLAN, DEFAULT_AI_SETTINGS, MOCK_API_RESOURCES, MOCK_AI_ERRORS } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import useAiAnalysisManager from './hooks/useAiAnalysisManager';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import PricesTab from './components/PricesTab';
import RecipesTab from './components/RecipesTab';
import PlanTab from './components/PlanTab';
import PublicMenuTab from './components/PublicMenuTab';
import SettingsTab from './components/SettingsTab';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';

// --- AI Analysis Context ---
interface AiAnalysisContextType {
  analysisState: AiAnalysisState;
  requestAnalysis: (scope: AnalysisScope, monthlyPlan: MonthlyPlan) => Promise<any>;
}
export const AiAnalysisContext = createContext<AiAnalysisContextType | null>(null);


function App() {
  const [activeTab, setActiveTab] = useLocalStorage<ActiveTab>('degsan_active_tab', ActiveTab.Dashboard);
  
  const [priceList, setPriceList] = useLocalStorage<PriceList>('degsan_prices', DEFAULT_PRICES);
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('degsan_recipes', DEFAULT_RECIPES);
  const [monthlyPlan, setMonthlyPlan] = useLocalStorage<MonthlyPlan>('degsan_monthly_plan', INITIAL_MONTHLY_PLAN);
  const [deletedDefaults, setDeletedDefaults] = useLocalStorage<string[]>('degsan_deleted_prices', []);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('degsan_theme', 'dark');


  // Settings State
  const [aiSettings, setAiSettings] = useLocalStorage<AiSettings>('degsan_ai_settings', DEFAULT_AI_SETTINGS);
  const [apiResources, setApiResources] = useLocalStorage<ApiResource[]>('degsan_api_resources', MOCK_API_RESOURCES);
  const [aiErrors, setAiErrors] = useLocalStorage<AiError[]>('degsan_ai_errors', MOCK_AI_ERRORS);

  // AI Analysis Manager
  const aiAnalysisManager = useAiAnalysisManager(recipes, priceList);

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    setToasts((prevToasts) => [
      ...prevToasts,
      { id: Date.now(), message, type },
    ]);
  }, []);

  const dismissToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  
  const handleExportData = useCallback(() => {
    try {
      const dataToExport = {
        priceList,
        recipes,
        monthlyPlan,
        deletedDefaults,
        aiSettings
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      const date = new Date().toISOString().slice(0, 10);
      link.download = `yemek_maliyet_yedek_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      addToast('Veriler başarıyla dışa aktarıldı.', 'success');
    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
      addToast('Verileri dışa aktarırken bir hata oluştu.', 'error');
    }
  }, [priceList, recipes, monthlyPlan, deletedDefaults, aiSettings, addToast]);

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Mevcut tüm verilerinizin üzerine içe aktarılan veriler yazılacaktır. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Dosya okunamadı.");
        const data = JSON.parse(text);

        if (typeof data.priceList !== 'object' || !Array.isArray(data.recipes) || typeof data.monthlyPlan !== 'object') {
           throw new Error("Geçersiz dosya formatı.");
        }
        
        setPriceList(data.priceList);
        setRecipes(data.recipes);
        setMonthlyPlan(data.monthlyPlan);
        setDeletedDefaults(data.deletedDefaults || []);
        setAiSettings(data.aiSettings || DEFAULT_AI_SETTINGS);
        addToast('Veriler başarıyla içe aktarıldı.', 'success');
      } catch (error) {
        console.error("İçe aktarma hatası:", error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
        addToast(`Veriler içe aktarılırken hata oluştu: ${errorMessage}`, 'error');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }, [setPriceList, setRecipes, setMonthlyPlan, setDeletedDefaults, setAiSettings, addToast]);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  
  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleSetPriceList = useCallback((newPriceList: PriceList | ((prevState: PriceList) => PriceList)) => {
    setPriceList(newPriceList);
  }, [setPriceList]);

  const handleSetRecipes = useCallback((newRecipes: Recipe[] | ((prevState: Recipe[]) => Recipe[])) => {
    setRecipes(newRecipes);
  }, [setRecipes]);

  const resetPrices = useCallback(() => {
    if (window.confirm('Tüm fiyatları varsayılana sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        setPriceList(DEFAULT_PRICES);
        setDeletedDefaults([]);
        addToast('Fiyatlar varsayılana sıfırlandı.', 'success');
    }
  }, [setPriceList, setDeletedDefaults, addToast]);
  
  const pageTitles: Record<ActiveTab, string> = {
    [ActiveTab.Dashboard]: 'Kontrol Paneli',
    [ActiveTab.Plan]: 'Aylık Planlama ve Maliyet Analizi',
    [ActiveTab.Prices]: 'Malzemeler ve Fiyat Listesi',
    [ActiveTab.Recipes]: 'Tarif Kütüphanesi',
    [ActiveTab.AiMenuPlanner]: 'Yapay Zeka Menü Planlama',
    [ActiveTab.SettingsIntelligence]: 'Ayarlar - Zeka Merkezi',
    [ActiveTab.SettingsApi]: 'Ayarlar - API Kaynakları',
    [ActiveTab.SettingsGeneral]: 'Ayarlar - Genel Ayarlar',
  };


  const renderActiveTab = () => {
    switch (activeTab) {
      case ActiveTab.Plan:
        return <PlanTab 
                  monthlyPlan={monthlyPlan}
                  setMonthlyPlan={setMonthlyPlan}
                  recipes={recipes}
                  priceList={priceList}
                  addToast={addToast}
                />;
      case ActiveTab.Prices:
        return <PricesTab 
                  priceList={priceList} 
                  setPriceList={handleSetPriceList} 
                  resetPrices={resetPrices} 
                  deletedDefaults={deletedDefaults}
                  setDeletedDefaults={setDeletedDefaults}
                  addToast={addToast}
                  handleExportData={handleExportData}
                  handleImportData={handleImportData}
                  aiSettings={aiSettings}
                />;
      case ActiveTab.Recipes:
        return <RecipesTab 
                  recipes={recipes} 
                  setRecipes={handleSetRecipes}
                  priceList={priceList}
                  addToast={addToast}
                />;
       case ActiveTab.AiMenuPlanner:
        return <PublicMenuTab 
                  addToast={addToast} 
                  recipes={recipes}
                  setRecipes={setRecipes}
               />;
      case ActiveTab.SettingsIntelligence:
      case ActiveTab.SettingsApi:
      case ActiveTab.SettingsGeneral:
        const subTabMapping = {
            [ActiveTab.SettingsIntelligence]: 'intelligence',
            [ActiveTab.SettingsApi]: 'api',
            [ActiveTab.SettingsGeneral]: 'general',
        } as const;
        return (
          <ErrorBoundary>
            <SettingsTab 
              activeSubTab={subTabMapping[activeTab]}
              aiSettings={aiSettings}
              setAiSettings={setAiSettings}
              apiResources={apiResources}
              setApiResources={setApiResources}
              aiErrors={aiErrors}
              setAiErrors={setAiErrors}
              addToast={addToast}
              handleExportData={handleExportData}
              handleImportData={handleImportData}
            />
          </ErrorBoundary>
        );
      case ActiveTab.Dashboard:
      default:
        return <DashboardTab 
                  recipes={recipes} 
                  priceList={priceList} 
                  monthlyPlan={monthlyPlan} 
                  setActiveTab={setActiveTab}
                  apiResources={apiResources}
                  aiErrors={aiErrors}
                  addToast={addToast}
                />;
    }
  };

  return (
    <AiAnalysisContext.Provider value={{ analysisState: aiAnalysisManager.state, requestAnalysis: aiAnalysisManager.requestAnalysis }}>
      <div className="app-container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} onToggleTheme={handleToggleTheme} />
        <div className="main-content">
          <Header title={pageTitles[activeTab]} />
          <main>
            {renderActiveTab()}
          </main>
        </div>
        <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      </div>
    </AiAnalysisContext.Provider>
  );
}

export default App;