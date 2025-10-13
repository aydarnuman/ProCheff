'use client';

import React, { useState } from 'react';
import type { MonthPlan, Recipe, MenuSuggestion } from '@/lib/types';
import type { CostEngine } from '@/lib/cost-engine';
import { AIMenuModal } from './AIMenuModal';

interface MonthCalendarProps {
  year: number;
  month: number;
  plan: MonthPlan | null;
  recipes: Recipe[];
  onPlanUpdate: (plan: MonthPlan) => void;
  costEngine: CostEngine;
}

interface DayModalProps {
  date: string;
  recipes: Recipe[];
  selectedRecipeIds: string[];
  onClose: () => void;
  onSave: (recipeIds: string[]) => void;
}

// Gün modalı component'i
function DayModal({ date, recipes, selectedRecipeIds, onClose, onSave }: DayModalProps) {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedRecipeIds);
  
  const toggleRecipe = (recipeId: string) => {
    setTempSelected(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const handleSave = () => {
    onSave(tempSelected);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long',
      weekday: 'long'
    });
  };

  // Kategorilere göre grupla
  const recipesByCategory = recipes.reduce((acc, recipe) => {
    if (!acc[recipe.category]) {
      acc[recipe.category] = [];
    }
    acc[recipe.category].push(recipe);
    return acc;
  }, {} as Record<string, Recipe[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              📅 {formatDate(date)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Bu gün için tarifleri seçin
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-6">
            {Object.entries(recipesByCategory).map(([category, categoryRecipes]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  {category === 'Çorba' && '🍲'}
                  {category === 'Ana' && '🍖'}
                  {category === 'Garnitür' && '🥗'}
                  {category === 'İçecek' && '🥤'}
                  {category === 'Tatlı' && '🍰'}
                  {category}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {categoryRecipes.map((recipe) => (
                    <label
                      key={recipe.id}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={tempSelected.includes(recipe.id)}
                        onChange={() => toggleRecipe(recipe.id)}
                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{recipe.name}</div>
                        <div className="text-sm text-gray-500">
                          {recipe.portions} porsiyon • {recipe.cookingTime} dakika
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {tempSelected.length} tarif seçildi
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MonthCalendar({ 
  year, 
  month, 
  plan, 
  recipes, 
  onPlanUpdate, 
  costEngine 
}: MonthCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  if (!plan) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Plan yükleniyor...</div>
      </div>
    );
  }

  // Ay başlangıç günü ve gün sayısı
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Pazar

  // Takvim günlerini oluştur
  const calendarDays: (string | null)[] = [];
  
  // Boş günler (önceki aydan)
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Gerçek günler
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    calendarDays.push(dateStr);
  }

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleModalSave = (recipeIds: string[]) => {
    if (!selectedDate || !plan) return;

    const updatedDays = plan.days.map(day => 
      day.date === selectedDate 
        ? { ...day, recipeIds, isComplete: recipeIds.length > 0 }
        : day
    );

    const updatedPlan = {
      ...plan,
      days: updatedDays,
      lastModified: new Date().toISOString()
    };

    onPlanUpdate(updatedPlan);
  };

  const handleAISuggestion = (suggestion: MenuSuggestion) => {
    if (!plan) return;

    // AI önerisini plana uygula
    const updatedDays = plan.days.map(day => {
      const suggestionDay = suggestion.days.find(s => s.date === day.date);
      return suggestionDay 
        ? { ...day, recipeIds: suggestionDay.suggestedRecipeIds, isComplete: true }
        : day;
    });

    const updatedPlan = {
      ...plan,
      days: updatedDays,
      lastModified: new Date().toISOString()
    };

    onPlanUpdate(updatedPlan);
  };

  const getDayPlan = (date: string) => {
    return plan?.days.find(day => day.date === date);
  };

  const getDaySummary = (date: string) => {
    const dayPlan = getDayPlan(date);
    if (!dayPlan || dayPlan.recipeIds.length === 0) {
      return null;
    }

    const cost = costEngine.estimateQuickCost(dayPlan.recipeIds, plan.personCount);
    return {
      cost,
      recipeCount: dayPlan.recipeIds.length
    };
  };

  const WEEKDAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const MONTH_NAMES = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Takvim Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📅 {MONTH_NAMES[month - 1]} {year}
        </h2>
        
        {/* Haftanın günleri */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Takvim Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-20"></div>;
            }

            const dayPlan = getDayPlan(date);
            const summary = getDaySummary(date);
            const dayNum = parseInt(date.split('-')[2]);
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <div
                key={date}
                onClick={() => handleDayClick(date)}
                className={`
                  h-20 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                  ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${dayPlan?.isComplete ? 'bg-green-50 border-green-200' : ''}
                `}
              >
                {/* Gün numarası */}
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {dayNum}
                </div>

                {/* Gün özeti */}
                {summary ? (
                  <div className="text-xs">
                    <div className="font-semibold text-green-600">
                      ₺{summary.cost.toFixed(0)}
                    </div>
                    <div className="text-gray-500">
                      {summary.recipeCount} çeşit
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">
                    Tarif ekle
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mod seçenekleri */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            <div className="text-sm font-medium text-gray-700 mb-2 w-full">
              Doldurma Yöntemleri:
            </div>
            <button 
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              title="Günlere tek tek tıklayarak manuel olarak tarif ekle"
            >
              ✏️ Elle Ata
            </button>
            <button 
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              title="Hazır menü şablonlarından seç"
            >
              📋 Şablondan Doldur
            </button>
            <button 
              onClick={() => setShowAIModal(true)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              title="AI ile otomatik menü oluştur"
            >
              🤖 AI ile Doldur
            </button>
          </div>
        </div>
      </div>

      {/* Gün modalı */}
      {selectedDate && (
        <DayModal
          date={selectedDate}
          recipes={recipes}
          selectedRecipeIds={getDayPlan(selectedDate)?.recipeIds || []}
          onClose={() => setSelectedDate(null)}
          onSave={handleModalSave}
        />
      )}

      {/* AI Menü modalı */}
      <AIMenuModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApply={handleAISuggestion}
        recipes={recipes}
        startDate={`${year}-${month.toString().padStart(2, '0')}-01`}
        endDate={`${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`}
        personCount={plan?.personCount || 1}
      />
    </div>
  );
}