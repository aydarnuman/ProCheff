'use client';

import React from 'react';
import type { CostSummary } from '@/lib/types';

interface InsightsProps {
  costSummary: CostSummary;
  isLoading?: boolean;
}

export function Insights({ costSummary, isLoading = false }: InsightsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Skeleton Loading */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatTurkishDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const formatCurrency = (amount: number) => {
    return `₺${amount.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* En Pahalı Gün */}
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-400">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-500 text-lg">📈</span>
          <h3 className="text-sm font-semibold text-gray-700">En Pahalı Gün</h3>
        </div>
        {costSummary.mostExpensiveDay ? (
          <div>
            <div className="text-xl font-bold text-red-600 mb-1">
              {formatCurrency(costSummary.mostExpensiveDay.cost)}
            </div>
            <div className="text-sm text-gray-600">
              {formatTurkishDate(costSummary.mostExpensiveDay.date)}
            </div>
            <div className="text-xs text-red-500 mt-1">
              +{formatCurrency(costSummary.mostExpensiveDay.difference)} ortalamanın üstü
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Veri yok</div>
        )}
      </div>

      {/* En Ucuz Gün */}
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-500 text-lg">📉</span>
          <h3 className="text-sm font-semibold text-gray-700">En Ucuz Gün</h3>
        </div>
        {costSummary.leastExpensiveDay ? (
          <div>
            <div className="text-xl font-bold text-green-600 mb-1">
              {formatCurrency(costSummary.leastExpensiveDay.cost)}
            </div>
            <div className="text-sm text-gray-600">
              {formatTurkishDate(costSummary.leastExpensiveDay.date)}
            </div>
            <div className="text-xs text-green-500 mt-1">
              -{formatCurrency(costSummary.leastExpensiveDay.difference)} ortalamanın altı
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Veri yok</div>
        )}
      </div>

      {/* En Maliyetli 3 Malzeme */}
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-500 text-lg">🥇</span>
          <h3 className="text-sm font-semibold text-gray-700">Top Malzemeler</h3>
        </div>
        <div className="space-y-2">
          {costSummary.topMaterials.length > 0 ? (
            costSummary.topMaterials.map((material, index) => (
              <div key={material.materialId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-700 truncate">
                    {material.materialName}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-blue-600">
                    {formatCurrency(material.totalCostTRY)}
                  </div>
                  <div className="text-xs text-gray-500">
                    %{material.percentage.toFixed(1)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">Malzeme analizi yok</div>
          )}
        </div>
      </div>
    </div>
  );
}