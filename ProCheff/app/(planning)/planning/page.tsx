'use client';

import React, { useState, useEffect } from 'react';
import { SummaryBar } from '@/components/planning/SummaryBar';
import { Insights } from '@/components/planning/Insights';
import { MonthCalendar } from '@/components/planning/MonthCalendar';
import { CostEngine } from '@/lib/cost-engine';
import type { MonthPlan, CostSummary, Recipe, Price } from '@/lib/types';

// Mock data - gerçek uygulamada API'dan gelecek
const mockRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Türk Usulü Menemen',
    portions: 2,
    ingredients: [
      { materialId: 'yumurta', qty: 4, unit: 'adet', name: 'Yumurta' },
      { materialId: 'domates', qty: 2, unit: 'adet', name: 'Domates' },
      { materialId: 'biber', qty: 1, unit: 'adet', name: 'Yeşil Biber' },
      { materialId: 'tereyagi', qty: 1, unit: 'g', name: 'Tereyağı' }
    ],
    category: 'Ana',
    difficulty: 'easy',
    cookingTime: 15,
    tags: ['Türk', 'Kahvaltı']
  },
  {
    id: 'recipe-2', 
    name: 'Mercimek Çorbası',
    portions: 4,
    ingredients: [
      { materialId: 'mercimek', qty: 200, unit: 'g', name: 'Kırmızı Mercimek' },
      { materialId: 'sogan', qty: 1, unit: 'adet', name: 'Soğan' },
      { materialId: 'havuc', qty: 1, unit: 'adet', name: 'Havuç' }
    ],
    category: 'Çorba',
    difficulty: 'easy', 
    cookingTime: 30
  }
];

const mockPrices: Price[] = [
  { materialId: 'yumurta', unit: 'adet', priceTRY: 1.5, updatedAt: '2024-10-01' },
  { materialId: 'domates', unit: 'adet', priceTRY: 2.0, updatedAt: '2024-10-01' },
  { materialId: 'biber', unit: 'adet', priceTRY: 1.0, updatedAt: '2024-10-01' },
  { materialId: 'tereyagi', unit: 'g', priceTRY: 0.1, updatedAt: '2024-10-01' },
  { materialId: 'mercimek', unit: 'g', priceTRY: 0.02, updatedAt: '2024-10-01' },
  { materialId: 'sogan', unit: 'adet', priceTRY: 0.5, updatedAt: '2024-10-01' },
  { materialId: 'havuc', unit: 'adet', priceTRY: 0.8, updatedAt: '2024-10-01' }
];

export default function PlanningPage() {
  // State yönetimi
  const [selectedMonth, setSelectedMonth] = useState(10); // Ekim
  const [selectedYear, setSelectedYear] = useState(2025);
  const [personCount, setPersonCount] = useState(2);
  const [currentPlan, setCurrentPlan] = useState<MonthPlan | null>(null);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [costEngine] = useState(() => new CostEngine(mockRecipes, mockPrices));

  // Plan hesaplama
  const calculatePlan = async () => {
    if (!currentPlan) return;
    
    setIsCalculating(true);
    
    try {
      // Kısa bir delay (UI için)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const summary = costEngine.calculateMonthCost(currentPlan);
      setCostSummary(summary);
    } catch (error) {
      console.error('Plan hesaplama hatası:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Plan güncelleme handler'ı
  const handlePlanUpdate = (updatedPlan: MonthPlan) => {
    setCurrentPlan(updatedPlan);
  };

  // Kişi sayısı değişikliği
  const handlePersonCountChange = (newCount: number) => {
    setPersonCount(newCount);
    if (currentPlan) {
      const updatedPlan = { ...currentPlan, personCount: newCount };
      setCurrentPlan(updatedPlan);
    }
  };

  // İlk yükleme - boş plan oluştur
  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      days.push({
        date,
        recipeIds: [],
        isComplete: false
      });
    }
    
    const newPlan: MonthPlan = {
      year: selectedYear,
      month: selectedMonth,
      personCount,
      days,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    setCurrentPlan(newPlan);
    setCostSummary(null);
  }, [selectedMonth, selectedYear]);

  // Plan değiştiğinde otomatik hesapla
  useEffect(() => {
    if (currentPlan && currentPlan.days.some(day => day.recipeIds.length > 0)) {
      calculatePlan();
    }
  }, [currentPlan]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Sayfa Başlığı */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Menü Planlama & Maliyet
          </h1>
          <p className="text-gray-600">
            Aylık menü planınızı oluşturun ve maliyetleri şeffaf şekilde hesaplayın
          </p>
        </div>

        {/* Ana İçerik */}
        <div className="space-y-6">
          {/* Özet Bar - Yapışkan */}
          <div className="sticky top-4 z-10">
            <SummaryBar
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              personCount={personCount}
              costSummary={costSummary}
              isCalculating={isCalculating}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onPersonCountChange={handlePersonCountChange}
              onCalculate={calculatePlan}
            />
          </div>

          {/* İçgörüler (En pahalı gün, ucuz gün, top malzemeler) */}
          {costSummary && (
            <Insights 
              costSummary={costSummary}
              isLoading={isCalculating}
            />
          )}

          {/* Takvim */}
          <MonthCalendar
            year={selectedYear}
            month={selectedMonth}
            plan={currentPlan}
            recipes={mockRecipes}
            onPlanUpdate={handlePlanUpdate}
            costEngine={costEngine}
          />
        </div>
      </div>
    </div>
  );
}