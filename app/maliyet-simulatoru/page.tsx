'use client'

import { useReducer } from 'react'
import { BaseCard } from '@/app/components/ui/Card'
import { IngredientManager, ResultsVisualization } from './components'
import { 
  costSimulatorReducer, 
  initialCostSimulatorState, 
  createNewSimulation 
} from '@/lib/data/costSimulator'
import { Calculator, RefreshCw, Save } from 'lucide-react'

export default function CostSimulatorPage() {
  const [state, dispatch] = useReducer(costSimulatorReducer, initialCostSimulatorState)
  const { currentSimulation, simulations } = state

  const handleNewSimulation = () => {
    const newSimulation = createNewSimulation('Yeni Simülasyon')
    dispatch({ type: 'ADD_SIMULATION', payload: newSimulation })
    dispatch({ type: 'SET_CURRENT_SIMULATION', payload: newSimulation.id })
  }

  const handleResetSimulation = () => {
    if (currentSimulation && window.confirm('Mevcut simülasyonu sıfırlamak istediğinizden emin misiniz?')) {
      dispatch({ 
        type: 'UPDATE_SIMULATION', 
        payload: { 
          id: currentSimulation.id, 
          updates: { 
            ingredients: [], 
            totalCost: 0, 
            profitMargin: 20
          } 
        } 
      })
    }
  }

  const handleSaveSimulation = () => {
    // Simülasyonu kaydetme işlemi burada gerçekleştirilebir
    alert('Simülasyon kaydedildi!')
  }

  const totalIngredients = currentSimulation?.ingredients?.length || 0
  const totalCost = currentSimulation?.totalCost || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Calculator className="text-blue-600" size={32} />
                Maliyet Simülatörü
              </h1>
              <p className="text-gray-600 mt-2">
                Malzeme maliyetlerini analiz edin ve kar marjlarını hesaplayın
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleNewSimulation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         transition-colors flex items-center gap-2 font-medium"
              >
                <Calculator size={20} />
                Yeni Simülasyon
              </button>
              
              <button
                onClick={handleResetSimulation}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 
                         transition-colors flex items-center gap-2 font-medium"
                disabled={!currentSimulation}
              >
                <RefreshCw size={20} />
                Sıfırla
              </button>
              
              <button
                onClick={handleSaveSimulation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors flex items-center gap-2 font-medium"
                disabled={!currentSimulation || totalIngredients === 0}
              >
                <Save size={20} />
                Kaydet
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {currentSimulation && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <BaseCard className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {totalIngredients}
                </div>
                <div className="text-gray-600 font-medium">Toplam Malzeme</div>
              </div>
            </BaseCard>
            
            <BaseCard className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ₺{totalCost.toFixed(2)}
                </div>
                <div className="text-gray-600 font-medium">Toplam Maliyet</div>
              </div>
            </BaseCard>
            
            <BaseCard className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  %{currentSimulation.profitMargin}
                </div>
                <div className="text-gray-600 font-medium">Kar Marjı</div>
              </div>
            </BaseCard>
            
            <BaseCard className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  ₺{currentSimulation.finalPrice.toFixed(2)}
                </div>
                <div className="text-gray-600 font-medium">Satış Fiyatı</div>
              </div>
            </BaseCard>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Ingredient Manager */}
          <div className="space-y-6">
            <IngredientManager
              simulation={currentSimulation}
              onUpdateSimulation={(updates: any) => {
                if (currentSimulation) {
                  dispatch({
                    type: 'UPDATE_SIMULATION',
                    payload: { id: currentSimulation.id, updates }
                  })
                }
              }}
            />
          </div>

          {/* Results Visualization */}
          <div className="space-y-6">
            {currentSimulation && (
              <ResultsVisualization
                simulation={currentSimulation}
              />
            )}
          </div>
        </div>

        {/* Simulation List */}
        {simulations.length > 1 && (
          <BaseCard className="mt-8 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Kayıtlı Simülasyonlar
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {simulations.map((simulation) => (
                <div
                  key={simulation.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    currentSimulation?.id === simulation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => dispatch({ 
                    type: 'SET_CURRENT_SIMULATION', 
                    payload: simulation.id 
                  })}
                >
                  <div className="font-medium text-gray-800 mb-2">
                    {simulation.name}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Malzeme:</span>
                      <span>{simulation.ingredients.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maliyet:</span>
                      <span>₺{simulation.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Satış Fiyatı:</span>
                      <span>₺{simulation.finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(simulation.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          </BaseCard>
        )}

        {/* No Simulation State */}
        {!currentSimulation && (
          <BaseCard className="p-12 text-center">
            <Calculator className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Simülasyon Bulunamadı
            </h3>
            <p className="text-gray-500 mb-6">
              Maliyet analizi yapmak için yeni bir simülasyon oluşturun
            </p>
            <button
              onClick={handleNewSimulation}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors flex items-center gap-2 font-medium mx-auto"
            >
              <Calculator size={20} />
              Yeni Simülasyon Oluştur
            </button>
          </BaseCard>
        )}
      </div>
    </div>
  )
}