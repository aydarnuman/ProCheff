
import React, { useMemo, useState, useContext } from 'react';
import { Recipe, PriceList, MonthlyPlan, ActiveTab, ApiResource, AiError, AnalysisScope, ToastMessage } from '../types';
import Icon from './Icon';
import { calculateCost } from '../utils';
import AiAnalysisModal from './AiAnalysisModal';
import { MOCK_INSTITUTIONAL_MENUS } from '../constants';
import { AiAnalysisContext } from '../App';

interface DashboardTabProps {
  recipes: Recipe[];
  priceList: PriceList;
  monthlyPlan: MonthlyPlan;
  setActiveTab: (tab: ActiveTab) => void;
  apiResources: ApiResource[];
  aiErrors: AiError[];
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; onClick?: () => void, cta?: string; icon: React.ReactNode; className?: string; }> = ({ title, value, onClick, cta, icon, className = '' }) => (
    <div 
      className={`card interactive flex flex-col justify-between ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default'}}
    >
      <div className="flex items-center justify-between text-gray-400">
        <h3 className="font-medium uppercase tracking-wider text-sm">{title}</h3>
        {icon}
      </div>
      <div>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        {cta && <p className="text-sm text-emerald-400 mt-2 font-medium">{cta}</p>}
      </div>
    </div>
);


const DashboardTab: React.FC<DashboardTabProps> = ({ recipes, priceList, monthlyPlan, setActiveTab, apiResources, aiErrors, addToast }) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const aiAnalysisContext = useContext(AiAnalysisContext);

  const recipeCount = recipes.length;
  const priceCount = Object.keys(priceList).length;

  const totalPlanCost = useMemo(() => {
    let totalCost = 0;
    const personCount = monthlyPlan.personCount || 1;
    
    Object.values(monthlyPlan.days || {}).forEach(day => {
        Object.values(day).forEach(meal => {
            if (meal) {
                const recipe = recipes.find(r => r.name === meal.name);
                if (recipe) {
                    totalCost += calculateCost(recipe.ingredients, priceList) * personCount;
                }
            }
        });
    });
    return totalCost;
  }, [monthlyPlan, recipes, priceList]);

  const aiInfo = useMemo(() => {
    const activeApis = apiResources.filter(api => !api.deleted);
    const correctedErrors = aiErrors.filter(e => e.status === 'Düzeltilmiş');
    const lastSync = activeApis.reduce((latest, api) => {
        const apiDate = new Date(api.lastSyncAt);
        return apiDate > latest ? apiDate : latest;
    }, new Date(0));
    
    // Get last analysis date from context cache
    const analysisCache = aiAnalysisContext?.analysisState.cache;
    const lastAnalysisTimestamp = analysisCache 
        ? Math.max(0, ...Object.values(analysisCache).map(c => c.timestamp))
        : 0;
    
    const lastDate = lastAnalysisTimestamp > lastSync.getTime() ? new Date(lastAnalysisTimestamp) : lastSync;

    return {
        apiCount: activeApis.length,
        correctionsCount: correctedErrors.length,
        lastSyncDate: lastDate > new Date(0) ? lastDate.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A',
    };
  }, [apiResources, aiErrors, aiAnalysisContext]);


  return (
    <>
    <div className="space-y-6 p-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Tarif Kütüphanesi" 
                value={recipeCount} 
                onClick={() => setActiveTab(ActiveTab.Recipes)}
                cta="Kütüphaneye git →"
                icon={<Icon name="recipes" className="w-8 h-8"/>}
            />
            <StatCard 
                title="Fiyat Listesi" 
                value={priceCount} 
                onClick={() => setActiveTab(ActiveTab.Prices)}
                cta="Fiyatları yönet →"
                icon={<Icon name="prices" className="w-8 h-8"/>}

            />
             <StatCard 
                title="Bu Ayın Plan Maliyeti" 
                value={totalPlanCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                onClick={() => setActiveTab(ActiveTab.Plan)}
                cta="Planlamayı aç →"
                icon={<Icon name="plan" className="w-8 h-8"/>}
            />
             <div 
                className="card interactive ai-info-card"
                onClick={() => setIsAiModalOpen(true)}
              >
                <div className="flex items-center justify-between text-purple-300">
                    <h3 className="font-medium uppercase tracking-wider text-sm">AI Bilgileri</h3>
                    <Icon name="gemini" className="w-8 h-8"/>
                </div>
                <div className="mt-2">
                    <p className="text-sm">
                        <span className="font-bold text-white">{aiInfo.apiCount}</span> API • <span className="font-bold text-white">{aiInfo.correctionsCount}</span> Düzeltme
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Son İşlem: {aiInfo.lastSyncDate}</p>
                    <p className="text-sm text-purple-400 mt-2 font-medium">Kurum Analizini Aç →</p>
                </div>
            </div>
       </div>
       <div className="card">
            <h2 className="text-xl font-bold text-emerald-400 mb-3">MaliyetŞef'e Hoş Geldiniz!</h2>
            <p className="text-gray-400 max-w-3xl">
                Bu uygulama, gıda maliyetlerinizi kolayca yönetmeniz için tasarlanmıştır. Kenar çubuğunu kullanarak uygulamanın farklı bölümleri arasında geçiş yapabilirsiniz:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li><strong className="font-semibold text-white">Planlama & Maliyet:</strong> Aylık yemek planları oluşturun ve toplam maliyetleri anında görün.</li>
                <li><strong className="font-semibold text-white">Menü Planlama:</strong> Yapay zeka ile kamu standartlarına uygun menüler ve reçeteler oluşturun.</li>
                <li><strong className="font-semibold text-white">Tarif Kütüphanesi:</strong> Kendi tariflerinizi ekleyin, düzenleyin ve porsiyon maliyetlerini hesaplayın.</li>
                <li><strong className="font-semibold text-white">Fiyat Listesi:</strong> Malzeme fiyat listenizi güncel tutun ve maliyet hesaplamalarınızın doğruluğundan emin olun.</li>
            </ul>
       </div>
    </div>
    
    <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        ownPlan={monthlyPlan}
        recipes={recipes}
        priceList={priceList}
        apiResources={apiResources}
        aiErrors={aiErrors}
        institutionalMenus={MOCK_INSTITUTIONAL_MENUS}
        addToast={addToast}
      />
    </>
  );
};

export default DashboardTab;