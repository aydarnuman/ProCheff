'use client';

import React from 'react';
import type { CostSummary } from '@/lib/types';

interface SummaryBarProps {
  selectedMonth: number;
  selectedYear: number;
  personCount: number;
  costSummary: CostSummary | null;
  isCalculating: boolean;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onPersonCountChange: (count: number) => void;
  onCalculate: () => void;
}

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const PERSON_PRESETS = [1, 2, 4, 6, 8, 10];

export function SummaryBar({
  selectedMonth,
  selectedYear,
  personCount,
  costSummary,
  isCalculating,
  onMonthChange,
  onYearChange,
  onPersonCountChange,
  onCalculate
}: SummaryBarProps) {
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
      {/* Üst Şerit - CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Ay Seçici */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Ay:</span>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {MONTHS.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month} {selectedYear}
                </option>
              ))}
            </select>
          </div>

          {/* Kişi Sayısı Seçici */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Kişi:</span>
            <div className="flex items-center gap-1">
              {PERSON_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onPersonCountChange(preset)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    personCount === preset
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
              {!PERSON_PRESETS.includes(personCount) && (
                <input
                  type="number"
                  value={personCount}
                  onChange={(e) => onPersonCountChange(Math.max(1, Number(e.target.value)))}
                  className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  min="1"
                  max="50"
                />
              )}
            </div>
          </div>
        </div>

        {/* Hesapla Butonu */}
        <button
          onClick={onCalculate}
          disabled={isCalculating}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Hesaplanıyor...
            </>
          ) : (
            <>
              <span>📊</span>
              Planı Hesapla
            </>
          )}
        </button>
      </div>

      {/* Ana Metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toplam Plan Maliyeti */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {costSummary ? `₺${costSummary.totalTRY.toFixed(2)}` : '₺0,00'}
          </div>
          <div className="text-sm text-gray-600">
            Toplam Plan Maliyeti
            {personCount > 1 && (
              <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {personCount} kişi
              </span>
            )}
          </div>
        </div>

        {/* Günlük Ortalama */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {costSummary ? `₺${costSummary.avgPerPersonPerDayTRY.toFixed(2)}` : '₺0,00'}
          </div>
          <div className="text-sm text-gray-600">
            Günlük Ortalama / Kişi
          </div>
        </div>
      </div>

      {/* Boş Durum Kopyası */}
      {!costSummary && !isCalculating && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-gray-500 text-sm">
            <span className="block mb-2">📋 Henüz plan yok</span>
            Aşağıdan ayı ve kişi sayısını seç, takvimde tarifler ekle. 
            Tarif kitaplığındaki maliyetler otomatik hesaplanacak.
          </div>
        </div>
      )}

      {/* Uyarılar */}
      {costSummary?.warnings && (
        <div className="mt-4 space-y-2">
          {costSummary.warnings.missingPrices.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-sm text-yellow-800">
                {costSummary.warnings.missingPrices.length} malzemenin fiyatı yok
              </span>
              <button className="ml-auto text-xs text-yellow-700 hover:text-yellow-900 underline">
                Listeye git
              </button>
            </div>
          )}
          
          {costSummary.warnings.stalePrices.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-orange-600">🕒</span>
              <span className="text-sm text-orange-800">
                {costSummary.warnings.stalePrices.length} fiyat 30+ gün eski
              </span>
              <button className="ml-auto text-xs text-orange-700 hover:text-orange-900 underline">
                Güncelle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}