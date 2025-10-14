'use client'

import React from 'react'
import { CostSimulation } from '@/lib/data/costSimulator'
import { PieChart, BarChart, TrendingUp, TrendingDown, Calculator, DollarSign, Package, Users } from 'lucide-react'

export interface ResultsVisualizationProps {
  simulation: CostSimulation
  className?: string
}

export function ResultsVisualization({
  simulation,
  className = ''
}: ResultsVisualizationProps) {
  
  const formatPrice = (price: number) => `₺${price.toFixed(2)}`
  const formatPercent = (value: number) => `%${value.toFixed(1)}`

  // Kategori bazında maliyet dağılımı
  const categoryBreakdown = simulation.ingredients.reduce((acc, ingredient) => {
    acc[ingredient.category] = (acc[ingredient.category] || 0) + ingredient.totalCost
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.entries(categoryBreakdown)
    .map(([category, cost]) => ({
      category,
      cost,
      percentage: (cost / simulation.totalCost) * 100
    }))
    .sort((a, b) => b.cost - a.cost)

  // En pahalı malzemeler
  const topExpensiveIngredients = [...simulation.ingredients]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5)

  // Maliyetlerin renk kodları
  const getCategoryColor = (index: number) => {
    const colors = [
      'var(--accent-primary)',
      'var(--status-success)',
      'var(--status-warning)',
      'var(--status-error)',
      'var(--text-muted)',
      'var(--bg-accent-subtle)'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-2">
            <Calculator size={20} style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Toplam Maliyet</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(simulation.totalCost)}
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-2">
            <Users size={20} style={{ color: 'var(--status-success)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Porsiyon Maliyeti</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(simulation.costPerServing)}
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={20} style={{ color: 'var(--status-warning)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kar Marjı</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatPercent(simulation.profitMargin)}
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} style={{ color: 'var(--status-success)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Satış Fiyatı</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>
            {formatPrice(simulation.sellingPrice)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategori Dağılımı */}
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <PieChart size={20} />
            Kategori Dağılımı
          </h3>
          
          <div className="space-y-3">
            {categoryData.map((item, index) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.category}
                  </span>
                  <div className="text-right">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatPrice(item.cost)}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatPercent(item.percentage)}
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: getCategoryColor(index)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* En Pahalı Malzemeler */}
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BarChart size={20} />
            En Pahalı Malzemeler
          </h3>
          
          <div className="space-y-4">
            {topExpensiveIngredients.map((ingredient, index) => (
              <div key={ingredient.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                       style={{ backgroundColor: getCategoryColor(index), color: 'white' }}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {ingredient.name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {ingredient.quantity} {ingredient.unit} × {formatPrice(ingredient.unitPrice)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(ingredient.totalCost)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatPercent((ingredient.totalCost / simulation.totalCost) * 100)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detaylı Malzeme Listesi */}
      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Package size={20} />
          Tüm Malzemeler
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Malzeme</th>
                <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Kategori</th>
                <th className="text-right py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Miktar</th>
                <th className="text-right py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Birim Fiyat</th>
                <th className="text-right py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Toplam</th>
                <th className="text-right py-3 px-4" style={{ color: 'var(--text-secondary)' }}>Oran</th>
              </tr>
            </thead>
            <tbody>
              {simulation.ingredients.map((ingredient) => (
                <tr key={ingredient.id} className="border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                  <td className="py-3 px-4">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {ingredient.name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {ingredient.supplier}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                      {ingredient.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right" style={{ color: 'var(--text-primary)' }}>
                    {ingredient.quantity} {ingredient.unit}
                  </td>
                  <td className="py-3 px-4 text-right" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(ingredient.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(ingredient.totalCost)}
                  </td>
                  <td className="py-3 px-4 text-right" style={{ color: 'var(--text-muted)' }}>
                    {formatPercent((ingredient.totalCost / simulation.totalCost) * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kar Analizi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-accent-subtle)', borderColor: 'var(--border-primary)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Maliyet Analizi</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Malzeme Maliyeti:</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatPrice(simulation.totalCost)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Porsiyon Başı:</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatPrice(simulation.costPerServing)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Porsiyon Sayısı:</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {simulation.servings}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-success-subtle)', borderColor: 'var(--border-primary)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Kar Analizi</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kar Marjı:</span>
              <span className="font-semibold" style={{ color: 'var(--status-success)' }}>
                {formatPercent(simulation.profitMargin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kar Miktarı:</span>
              <span className="font-semibold" style={{ color: 'var(--status-success)' }}>
                {formatPrice(simulation.sellingPrice - simulation.costPerServing)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Toplam Kar:</span>
              <span className="font-semibold" style={{ color: 'var(--status-success)' }}>
                {formatPrice((simulation.sellingPrice - simulation.costPerServing) * simulation.servings)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-warning-subtle)', borderColor: 'var(--border-primary)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Satış Bilgileri</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Porsiyon Fiyatı:</span>
              <span className="font-semibold" style={{ color: 'var(--status-success)' }}>
                {formatPrice(simulation.sellingPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Toplam Satış:</span>
              <span className="font-semibold" style={{ color: 'var(--status-success)' }}>
                {formatPrice(simulation.sellingPrice * simulation.servings)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Net Kar:</span>
              <span className="font-semibold" style={{ color: 'var(--status-success)' }}>
                {formatPrice((simulation.sellingPrice * simulation.servings) - simulation.totalCost)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}