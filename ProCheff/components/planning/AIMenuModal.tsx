'use client';

import React, { useState } from 'react';
import type { MenuConstraints, MenuSuggestion, Recipe } from '@/lib/types';

interface AIMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (suggestion: MenuSuggestion) => void;
  recipes: Recipe[];
  startDate: string;
  endDate: string;
  personCount: number;
}

export function AIMenuModal({
  isOpen,
  onClose,
  onApply,
  recipes,
  startDate,
  endDate,
  personCount
}: AIMenuModalProps) {
  const [constraints, setConstraints] = useState<MenuConstraints>({
    dietaryRestrictions: [],
    budgetTargetTRY: undefined,
    dishVariety: 4,
    forbiddenIngredients: [],
    preferredIngredients: [],
    maxRepeatDays: 7
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const dietaryOptions = [
    { id: 'vegetarian', label: '🥗 Vejetaryen', description: 'Et içermez' },
    { id: 'vegan', label: '🌱 Vegan', description: 'Hayvansal ürün yok' },
    { id: 'halal', label: '☪️ Helal', description: 'İslami kurallara uygun' },
    { id: 'gluten-free', label: '🌾 Glutensiz', description: 'Gluten içermez' },
    { id: 'dairy-free', label: '🥛 Sütsüz', description: 'Süt ürünü yok' }
  ] as const;

  const varietyOptions = [3, 4, 5];

  const handleDietaryChange = (restriction: typeof dietaryOptions[number]['id']) => {
    setConstraints(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  const handleTagInput = (value: string, field: 'forbiddenIngredients' | 'preferredIngredients') => {
    const tags = value.split(',').map(t => t.trim()).filter(Boolean);
    setConstraints(prev => ({
      ...prev,
      [field]: tags
    }));
  };

  const generateMenu = async () => {
    setIsGenerating(true);
    
    try {
      // Kısa delay (UI için)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI önerisi - gerçek uygulamada API çağrısı olacak
      const mockSuggestion: MenuSuggestion = {
        planId: `ai-plan-${Date.now()}`,
        days: [
          {
            date: startDate,
            suggestedRecipeIds: recipes.slice(0, constraints.dishVariety).map(r => r.id),
            estimatedCostTRY: 45.50
          }
        ],
        totalEstimatedCostTRY: 45.50 * personCount,
        confidence: 0.87,
        reasoning: `${constraints.dishVariety} çeşit yemek ile dengeli bir menü önerisi. ${
          constraints.budgetTargetTRY ? `Günlük ₺${constraints.budgetTargetTRY} bütçe hedefine uygun.` : ''
        } ${
          constraints.dietaryRestrictions.length > 0 
            ? `Diyet kısıtları: ${constraints.dietaryRestrictions.join(', ')}.`
            : ''
        }`
      };
      
      onApply(mockSuggestion);
      onClose();
      
    } catch (error) {
      console.error('AI menü oluşturma hatası:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              🤖 AI Menü Önerici
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            4 kısa parametre ile hızlı menü önerisi
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-96">
          
          {/* 1. Diyet Kısıtları */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              1️⃣ Diyet/Kısıtlar (çoklu seçim)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {dietaryOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={constraints.dietaryRestrictions.includes(option.id)}
                    onChange={() => handleDietaryChange(option.id)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Bütçe Hedefi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2️⃣ Bütçe Hedefi (opsiyonel)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={constraints.budgetTargetTRY || ''}
                onChange={(e) => setConstraints(prev => ({
                  ...prev,
                  budgetTargetTRY: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder="₺/kişi/gün"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">₺/kişi/gün</span>
            </div>
          </div>

          {/* 3. Çeşit Sayısı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3️⃣ Çeşit Sayısı
            </label>
            <div className="flex gap-2">
              {varietyOptions.map((variety) => (
                <button
                  key={variety}
                  onClick={() => setConstraints(prev => ({ ...prev, dishVariety: variety }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    constraints.dishVariety === variety
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {variety} çeşit
                </button>
              ))}
            </div>
          </div>

          {/* 4. Malzeme Tercihleri */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4️⃣ Yasak Malzemeler (virgülle ayır)
              </label>
              <input
                type="text"
                placeholder="domates, biber, soğan"
                onChange={(e) => handleTagInput(e.target.value, 'forbiddenIngredients')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tercih Edilen Malzemeler (virgülle ayır)
              </label>
              <input
                type="text"
                placeholder="tavuk, pirinç, sebze"
                onChange={(e) => handleTagInput(e.target.value, 'preferredIngredients')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {personCount} kişi için menü önerisi
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={generateMenu}
              disabled={isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Planı Öner
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}