import React, { useState, useMemo, useCallback } from 'react';
import { MonthlyPlan, Recipe, PriceList, ToastMessage, MealSlots, PlannerRecipe } from '../types';
import { DAY_NAMES, MEAL_SLOTS } from '../constants';
import Icon from './Icon';
import { calculateCost, getBaseUnit, convertToBaseUnitValue } from '../utils';

// --- RECIPE SELECT MODAL ---
interface SelectRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (recipe: PlannerRecipe) => void;
    recipes: Recipe[];
    mealSlot: keyof MealSlots;
}

const SelectRecipeModal: React.FC<SelectRecipeModalProps> = ({ isOpen, onClose, onSelect, recipes, mealSlot }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRecipes = useMemo(() => {
        // For 'Ek / Diğer' slot, also include 'Salata/Turşu' and 'Meşrubat/Komposto'
        const relevantGroups = mealSlot === 'Ek / Diğer'
            ? ['Tatlı', 'Salata/Turşu', 'Meşrubat/Komposto']
            : [mealSlot];

        const mealRecipes = recipes.filter(r => relevantGroups.includes(r.group));
        return mealRecipes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [recipes, mealSlot, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{mealSlot} için Tarif Seç</h3>
                    <button onClick={onClose} className="modal-close-btn"><Icon name="close" /></button>
                </div>
                <div className="modal-body">
                    <input
                        type="text"
                        placeholder="Tarif ara..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-input mb-4"
                    />
                    <div className="max-h-80 overflow-y-auto space-y-2">
                        {filteredRecipes.length > 0 ? filteredRecipes.map(recipe => (
                            <div key={recipe.name} onClick={() => onSelect({ name: recipe.name, group: recipe.group })}
                                className="p-3 bg-gray-900 rounded-md cursor-pointer hover:bg-gray-700 transition-colors flex justify-between items-center"
                            >
                                <span className="font-medium text-white">{recipe.name}</span>
                                <span className="text-xs text-gray-400">{recipe.group}</span>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center py-4">Bu kategori için uygun tarif bulunamadı.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN PLAN TAB COMPONENT ---
interface PlanTabProps {
    monthlyPlan: MonthlyPlan;
    setMonthlyPlan: (plan: MonthlyPlan | ((prevState: MonthlyPlan) => MonthlyPlan)) => void;
    recipes: Recipe[];
    priceList: PriceList;
    addToast: (message: string, type: ToastMessage['type']) => void;
}

const PlanTab: React.FC<PlanTabProps> = ({ monthlyPlan, setMonthlyPlan, recipes, priceList, addToast }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalState, setModalState] = useState<{ isOpen: boolean; date: string; meal: keyof MealSlots; }>({ isOpen: false, date: '', meal: 'Çorba' });
    const [copiedDay, setCopiedDay] = useState<MealSlots | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...

    const handlePersonCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(e.target.value, 10);
        setMonthlyPlan(prev => ({ ...prev, personCount: isNaN(count) || count < 1 ? 1 : count }));
    };

    const handleSelectRecipe = (recipe: PlannerRecipe) => {
        const { date, meal } = modalState;
        setMonthlyPlan(prev => {
            const newPlan = { ...prev };
            if (!newPlan.days) newPlan.days = {};
            if (!newPlan.days[date]) newPlan.days[date] = { 'Çorba': null, 'Ana Yemek': null, 'Garnitür': null, 'Ek / Diğer': null };
            (newPlan.days[date] as any)[meal] = recipe;
            return newPlan;
        });
        setModalState({ isOpen: false, date: '', meal: 'Çorba' });
    };

    const handleRemoveRecipe = (date: string, meal: string) => {
        setMonthlyPlan(prev => {
            const newPlan = { ...prev };
            if (newPlan.days && newPlan.days[date]) {
                 (newPlan.days[date] as any)[meal] = null;
            }
            return newPlan;
        });
    };
    
    const handleCopyDay = (dateStr: string) => {
        const dayToCopy = monthlyPlan.days?.[dateStr];
        if (dayToCopy) {
            setCopiedDay(dayToCopy);
            addToast("Menü panoya kopyalandı. Boş bir güne yapıştırabilirsiniz.", "info");
        }
    };

    const handlePasteDay = (dateStr: string) => {
        if (copiedDay) {
            setMonthlyPlan(prev => {
                const newDays = { ...(prev.days || {}), [dateStr]: copiedDay };
                return { ...prev, days: newDays };
            });
            addToast("Menü başarıyla yapıştırıldı.", "success");
        }
    };

    const costAnalysis = useMemo(() => {
        const dailyCosts: { [date: string]: number } = {};
        const ingredientUsage: { [name: string]: { total: number; unit: string } } = {};
        let totalCost = 0;
        let plannedDays = 0;
        const personCount = monthlyPlan.personCount || 1;

        if (monthlyPlan.days) {
            Object.entries(monthlyPlan.days).forEach(([date, day]) => {
                let dailyTotal = 0;
                let isDayPlanned = false;
                Object.values(day).forEach(meal => {
                    if (meal) {
                        isDayPlanned = true;
                        const recipe = recipes.find(r => r.name === meal.name);
                        if (recipe) {
                            const mealCost = calculateCost(recipe.ingredients, priceList);
                            dailyTotal += mealCost;

                            recipe.ingredients.forEach(ing => {
                                const baseUnit = getBaseUnit(ing.unit);
                                if(baseUnit) {
                                    const qtyInBase = convertToBaseUnitValue(ing.qty, ing.unit);
                                    if(!ingredientUsage[ing.name]) {
                                        ingredientUsage[ing.name] = { total: 0, unit: baseUnit };
                                    }
                                    ingredientUsage[ing.name].total += qtyInBase * personCount;
                                }
                            });
                        }
                    }
                });

                if (isDayPlanned) {
                    dailyCosts[date] = dailyTotal * personCount;
                    totalCost += dailyCosts[date];
                    plannedDays++;
                }
            });
        }
        
        const avgDailyCost = plannedDays > 0 ? totalCost / plannedDays : 0;
        
        let mostExpensiveDay = { date: '', cost: 0 };
        let cheapestDay = { date: '', cost: Infinity };
        if(plannedDays > 0) {
            for(const [date, cost] of Object.entries(dailyCosts)) {
                if (cost > mostExpensiveDay.cost) mostExpensiveDay = { date, cost };
                if (cost < cheapestDay.cost) cheapestDay = { date, cost };
            }
        }
        if(cheapestDay.cost === Infinity) cheapestDay.cost = 0;

        const topIngredients = Object.entries(ingredientUsage)
            .map(([name, data]) => {
                const priceInfo = priceList[name];
                const effectivePrice = priceInfo?.status === 'manual' ? priceInfo.manualOverridePrice : priceInfo?.price;
                const cost = (effectivePrice || 0) * data.total;
                return { name, ...data, cost };
            })
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 5);


        return { totalCost, avgDailyCost, dailyCosts, mostExpensiveDay, cheapestDay, topIngredients };
    }, [monthlyPlan, recipes, priceList]);
    
    const handleAiFillMonth = useCallback(() => {
        if (!window.confirm("Yapay zekanın takvimdeki tüm boş günleri otomatik olarak doldurmasını istiyor musunuz? Mevcut planlanmış günleriniz etkilenmeyecektir.")) {
            return;
        }

        const availableRecipes = MEAL_SLOTS.reduce((acc, slot) => {
            const relevantGroups = slot === 'Ek / Diğer' 
                ? ['Tatlı', 'Salata/Turşu', 'Meşrubat/Komposto']
                : [slot];
            acc[slot] = recipes.filter(r => relevantGroups.includes(r.group));
            return acc;
        }, {} as Record<keyof MealSlots, Recipe[]>);

        if (MEAL_SLOTS.some(slot => availableRecipes[slot].length === 0)) {
            addToast("Otomatik doldurma için her kategoride (Çorba, Ana Yemek, vb.) en az bir tarif bulunmalıdır.", "warning");
            return;
        }

        let lastUsedIndices = MEAL_SLOTS.reduce((acc, slot) => ({ ...acc, [slot]: -1 }), {} as Record<keyof MealSlots, number>);

        setMonthlyPlan(prev => {
            const newPlanDays = { ...(prev.days || {}) };
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isDayEmpty = !(newPlanDays[dateStr] && Object.values(newPlanDays[dateStr]).some(meal => meal !== null));
                
                if (isDayEmpty) {
                    const newDay: MealSlots = { 'Çorba': null, 'Ana Yemek': null, 'Garnitür': null, 'Ek / Diğer': null };
                    MEAL_SLOTS.forEach(slot => {
                        const recipesForSlot = availableRecipes[slot];
                        if (recipesForSlot.length > 0) {
                            lastUsedIndices[slot] = (lastUsedIndices[slot] + 1) % recipesForSlot.length;
                            const recipe = recipesForSlot[lastUsedIndices[slot]];
                            newDay[slot] = { name: recipe.name, group: recipe.group };
                        }
                    });
                    newPlanDays[dateStr] = newDay;
                }
            }
            return { ...prev, days: newPlanDays };
        });

        addToast("Yapay zeka boş günleri başarıyla doldurdu.", "success");
    }, [recipes, setMonthlyPlan, addToast, daysInMonth, year, month]);


    const renderCalendar = () => {
        const calendarDays = [];
        const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust to Mon=0

        for (let i = 0; i < startDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="day-cell-empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayPlan = monthlyPlan.days?.[dateStr];
            const isDayPlanned = dayPlan && Object.values(dayPlan).some(m => m !== null);
            const dayCost = costAnalysis.dailyCosts[dateStr] || 0;

            let costClass = '';
            let costTooltip = '';
            let costIcon = null;

            if (dayCost > 0 && costAnalysis.avgDailyCost > 0) {
                const ratio = dayCost / costAnalysis.avgDailyCost;
                const diff = Math.round((ratio - 1) * 100);
                if (ratio < 0.85) {
                    costClass = 'cost-low';
                    costTooltip = `Ortalamanın %${-diff} altında`;
                    costIcon = <Icon name="leaf" className="w-4 h-4 text-green-400" title={costTooltip} />;
                } else if (ratio > 1.15) {
                    costClass = 'cost-high';
                    costTooltip = `Ortalamanın %${diff} üzerinde`;
                    costIcon = <Icon name="fire" className="w-4 h-4 text-red-400" title={costTooltip} />;
                } else {
                    costClass = 'cost-medium';
                }
            }
            
            calendarDays.push(
                <div key={day} className={`day-cell ${costClass}`}>
                    <div className="day-header">
                        <span className="day-number">{day}</span>
                        {dayCost > 0 && (
                            <div className="flex items-center gap-1.5" data-tooltip={costTooltip}>
                                {costIcon}
                                <span className="day-cost">{dayCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                            </div>
                        )}
                         <div className="day-actions">
                            {isDayPlanned && (
                                <button onClick={() => handleCopyDay(dateStr)} title="Günü kopyala" className="day-action-btn">
                                    <Icon name="copy" className="w-4 h-4"/>
                                </button>
                            )}
                            {!isDayPlanned && copiedDay && (
                                 <button onClick={() => handlePasteDay(dateStr)} title="Menüyü yapıştır" className="day-action-btn paste-btn">
                                    <Icon name="clipboard-document" className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="day-body">
                        {MEAL_SLOTS.map(slot => {
                            const meal = dayPlan?.[slot as keyof MealSlots];
                            const fullRecipe = meal ? recipes.find(r => r.name === meal.name) : null;
                            const mealCost = fullRecipe ? calculateCost(fullRecipe.ingredients, priceList) : 0;
                            const personCount = monthlyPlan.personCount || 1;
                            const totalMealCost = mealCost * personCount;

                            return (
                                <div
                                    key={slot}
                                    onClick={() => !meal && setModalState({ isOpen: true, date: dateStr, meal: slot })}
                                    className={`meal-slot ${meal ? 'meal-slot-planned' : 'meal-slot-empty'}`}
                                >
                                    {meal ? (
                                        <div 
                                            className="planned-meal-wrapper"
                                            data-tooltip={`Porsiyon Maliyeti: ${totalMealCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`}
                                        >
                                            <span className="meal-name" title={meal.name}>{meal.name}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveRecipe(dateStr, slot); }}
                                                className="remove-meal-btn"
                                                title={`${meal.name} tarifini sil`}
                                            >
                                                <Icon name="trash" className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="add-meal-text">
                                            <Icon name="plus" className="w-3 h-3 mr-1"/>
                                            {slot}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return calendarDays;
    };


    return (
        <div className="space-y-6">
            <div className="plan-stats-dashboard">
                <div className="plan-primary-stat">
                     <h3 className="stat-title">Toplam Plan Maliyeti</h3>
                     <p className="stat-value">{costAnalysis.totalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                     <p className="stat-subtext">Maliyetler {monthlyPlan.personCount || 1} kişi üzerinden hesaplanmıştır.</p>
                </div>
                <div className="plan-secondary-stats-grid">
                    <div className="plan-secondary-stat">
                        <h4 className="stat-title">Ortalama Günlük Maliyet</h4>
                        <p className="stat-value secondary">{costAnalysis.avgDailyCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                    </div>
                    <div className="plan-secondary-stat">
                        <h4 className="stat-title">En Pahalı Gün</h4>
                        {costAnalysis.mostExpensiveDay.date ? (
                            <>
                               <p className="stat-value secondary cost-high">{costAnalysis.mostExpensiveDay.cost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                               <p className="stat-subtext">{new Date(costAnalysis.mostExpensiveDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</p>
                            </>
                        ) : <p className="stat-value secondary nil">-</p>}
                    </div>
                     <div className="plan-secondary-stat">
                        <h4 className="stat-title">En Ucuz Gün</h4>
                         {costAnalysis.cheapestDay.date ? (
                            <>
                               <p className="stat-value secondary cost-low">{costAnalysis.cheapestDay.cost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                               <p className="stat-subtext">{new Date(costAnalysis.cheapestDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</p>
                            </>
                        ) : <p className="stat-value secondary nil">-</p>}
                    </div>
                </div>
                 <div className="plan-top-ingredients">
                    <h3 className="stat-title">En Çok Maliyetli Malzemeler</h3>
                    <div className="plan-top-ingredients-list">
                        {costAnalysis.topIngredients.length > 0 ? costAnalysis.topIngredients.map(({ name, cost, total, unit }) =>(
                           <div key={name} className="ingredient-item">
                               <span className="ingredient-name" title={`${name} (${total.toFixed(2)} ${unit})`}>{name}</span>
                               <span className="ingredient-cost">{cost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                           </div>
                        )) : <p className="stat-subtext text-center">Planlama yapıldığında burada gösterilir.</p>}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                        <h2 className="text-xl font-bold text-white">
                            {currentDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })} Takvimi
                        </h2>
                     </div>
                     <div className="flex items-center flex-wrap gap-4">
                        <label className="flex items-center gap-2">
                           <span className="font-medium text-gray-300">Kişi Sayısı:</span>
                           <input type="number" min="1" value={monthlyPlan.personCount || 1} onChange={handlePersonCountChange}
                                  className="form-input w-20 text-center" />
                        </label>
                         <div className="flex">
                            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="btn btn-secondary rounded-r-none">Önceki Ay</button>
                            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="btn btn-secondary rounded-l-none border-l-0">Sonraki Ay</button>
                        </div>
                        {copiedDay && (
                             <button onClick={() => setCopiedDay(null)} className="btn btn-danger">
                                Kopyalamayı İptal Et
                            </button>
                        )}
                        <button onClick={handleAiFillMonth} className="btn btn-primary">
                            <Icon name="gemini" className="icon text-purple-400"/>
                            Yapay Zeka ile Doldur
                        </button>
                     </div>
                </div>
            </div>
            
            <div className="card !p-2 md:!p-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {DAY_NAMES.map(day => <div key={day} className="font-bold text-gray-400 text-sm p-2">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {renderCalendar()}
                </div>
            </div>

            <SelectRecipeModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onSelect={handleSelectRecipe}
                recipes={recipes}
                mealSlot={modalState.meal}
            />
        </div>
    );
};

export default PlanTab;