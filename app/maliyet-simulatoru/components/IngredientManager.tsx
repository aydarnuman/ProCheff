'use client'

import React, { useState } from 'react'
import { Modal, Button, Input } from '@/app/components/ui'
import { CostIngredient, createNewIngredient, calculateIngredientTotalCost, categories } from '@/lib/data/costSimulator'
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react'

export interface IngredientManagerProps {
  simulation: any
  onUpdateSimulation: (updates: any) => void
  className?: string
}

export function IngredientManager({
  simulation,
  onUpdateSimulation,
  className = ''
}: IngredientManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<CostIngredient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('Tümü')

  const [newIngredient, setNewIngredient] = useState<{
    name: string
    category: string
    unit: string
    unitPrice: number
    quantity: number
    supplier: string
    quality: 'premium' | 'standard' | 'economy'
  }>({
    name: '',
    category: 'Et Ürünleri',
    unit: 'kg',
    unitPrice: 0,
    quantity: 1,
    supplier: '',
    quality: 'standard'
  })

  // Filtreleme
    const ingredients = simulation?.ingredients || []
  const filteredIngredients = ingredients.filter((ingredient: CostIngredient) => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'Tümü' || ingredient.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddIngredient = () => {
    const ingredient = createNewIngredient(
      newIngredient.name,
      newIngredient.category,
      newIngredient.unit,
      newIngredient.unitPrice,
      newIngredient.quantity
    )
    
    ingredient.supplier = newIngredient.supplier
    ingredient.quality = newIngredient.quality
    
    const updatedIngredients = [...ingredients, ingredient]
    onUpdateSimulation({ 
      ingredients: updatedIngredients,
      totalCost: updatedIngredients.reduce((sum: number, ing: CostIngredient) => sum + ing.totalCost, 0)
    })
    
    setNewIngredient({
      name: '',
      category: 'Et Ürünleri',
      unit: 'kg',
      unitPrice: 0,
      quantity: 1,
      supplier: '',
      quality: 'standard'
    })
    setIsAddModalOpen(false)
  }

  const handleEditIngredient = () => {
    if (!editingIngredient) return

    const updates = {
      name: editingIngredient.name,
      category: editingIngredient.category,
      unit: editingIngredient.unit,
      unitPrice: editingIngredient.unitPrice,
      quantity: editingIngredient.quantity,
      supplier: editingIngredient.supplier,
      quality: editingIngredient.quality,
      totalCost: calculateIngredientTotalCost(editingIngredient),
      lastUpdate: new Date()
    }

    const updatedIngredients = ingredients.map((ing: CostIngredient) => 
      ing.id === editingIngredient.id ? { ...ing, ...updates } : ing
    )
    onUpdateSimulation({ 
      ingredients: updatedIngredients,
      totalCost: updatedIngredients.reduce((sum: number, ing: CostIngredient) => sum + ing.totalCost, 0)
    })
    setIsEditModalOpen(false)
    setEditingIngredient(null)
  }

  const openEditModal = (ingredient: CostIngredient) => {
    setEditingIngredient({ ...ingredient })
    setIsEditModalOpen(true)
  }

  const formatPrice = (price: number) => `₺${price.toFixed(2)}`

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          🥕 Malzeme Yönetimi
        </h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
        >
          <Plus size={16} />
          Malzeme Ekle
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                 style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Malzeme ara..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Ingredient List */}
      <div className="space-y-3">
        {filteredIngredients.map((ingredient: CostIngredient) => (
          <div key={ingredient.id} 
               className="p-4 rounded-lg border flex items-center justify-between"
               style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: 'var(--bg-accent-subtle)' }}>
                {ingredient.category === 'Et Ürünleri' ? '🥩' :
                 ingredient.category === 'Sebze' ? '🥕' :
                 ingredient.category === 'Tahıllar' ? '🌾' :
                 ingredient.category === 'Yağlar' ? '🫒' : '📦'}
              </div>
              
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {ingredient.name}
                </h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {ingredient.category} • {ingredient.supplier || 'Tedarikçi belirtilmemiş'}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: ingredient.quality === 'premium' ? 'var(--bg-accent-subtle)' :
                                          ingredient.quality === 'standard' ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                          color: 'var(--text-primary)'
                        }}>
                    {ingredient.quality === 'premium' ? 'Premium' : 
                     ingredient.quality === 'standard' ? 'Standart' : 'Ekonomik'}
                  </span>
                  {ingredient.seasonal && (
                    <span className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: 'var(--bg-success-subtle)', color: 'var(--status-success)' }}>
                      Mevsimlik
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatPrice(ingredient.unitPrice)}/{ingredient.unit}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Miktar: {ingredient.quantity} {ingredient.unit}
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--status-success)' }}>
                  {formatPrice(ingredient.totalCost)}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(ingredient)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    const updatedIngredients = ingredients.filter((ing: CostIngredient) => ing.id !== ingredient.id)
                    onUpdateSimulation({ 
                      ingredients: updatedIngredients,
                      totalCost: updatedIngredients.reduce((sum: number, ing: CostIngredient) => sum + ing.totalCost, 0)
                    })
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-error-subtle)', color: 'var(--status-error)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredIngredients.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📦</div>
            <p style={{ color: 'var(--text-muted)' }}>
              {ingredients.length === 0 ? 'Henüz malzeme eklenmemiş' : 'Arama kriterinize uygun malzeme bulunamadı'}
            </p>
          </div>
        )}
      </div>

      {/* Add Ingredient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Yeni Malzeme Ekle"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Malzeme Adı"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Örn: Dana Kuşbaşı"
              fullWidth
            />

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Kategori
              </label>
              <select
                value={newIngredient.category}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                {categories.filter(c => c !== 'Tümü').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <Input
              label="Birim"
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="kg, litre, adet..."
              fullWidth
            />

            <Input
              label="Birim Fiyat (₺)"
              type="number"
              step="0.01"
              value={newIngredient.unitPrice}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
              fullWidth
            />

            <Input
              label="Miktar"
              type="number"
              step="0.01"
              value={newIngredient.quantity}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
              fullWidth
            />

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Kalite
              </label>
              <select
                value={newIngredient.quality}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, quality: e.target.value as 'premium' | 'standard' | 'economy' }))}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="premium">Premium</option>
                <option value="standard">Standart</option>
                <option value="economy">Ekonomik</option>
              </select>
            </div>

            <Input
              label="Tedarikçi"
              value={newIngredient.supplier}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, supplier: e.target.value }))}
              placeholder="Tedarikçi adı (isteğe bağlı)"
              fullWidth
              className="col-span-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
            <Button
              onClick={() => setIsAddModalOpen(false)}
              variant="secondary"
            >
              İptal
            </Button>
            <Button
              onClick={handleAddIngredient}
              variant="primary"
              disabled={!newIngredient.name || newIngredient.unitPrice <= 0}
            >
              Malzeme Ekle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Ingredient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Malzeme Düzenle"
      >
        {editingIngredient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Malzeme Adı"
                value={editingIngredient.name}
                onChange={(e) => setEditingIngredient(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                fullWidth
              />

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Kategori
                </label>
                <select
                  value={editingIngredient.category}
                  onChange={(e) => setEditingIngredient(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {categories.filter(c => c !== 'Tümü').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Birim"
                value={editingIngredient.unit}
                onChange={(e) => setEditingIngredient(prev => prev ? ({ ...prev, unit: e.target.value }) : null)}
                fullWidth
              />

              <Input
                label="Birim Fiyat (₺)"
                type="number"
                step="0.01"
                value={editingIngredient.unitPrice}
                onChange={(e) => setEditingIngredient(prev => prev ? ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }) : null)}
                fullWidth
              />

              <Input
                label="Miktar"
                type="number"
                step="0.01"
                value={editingIngredient.quantity}
                onChange={(e) => setEditingIngredient(prev => prev ? ({ ...prev, quantity: parseFloat(e.target.value) || 0 }) : null)}
                fullWidth
              />

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Kalite
                </label>
                <select
                  value={editingIngredient.quality}
                  onChange={(e) => setEditingIngredient(prev => prev ? ({ ...prev, quality: e.target.value as 'premium' | 'standard' | 'economy' }) : null)}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="premium">Premium</option>
                  <option value="standard">Standart</option>
                  <option value="economy">Ekonomik</option>
                </select>
              </div>

              <Input
                label="Tedarikçi"
                value={editingIngredient.supplier}
                onChange={(e) => setEditingIngredient(prev => prev ? ({ ...prev, supplier: e.target.value }) : null)}
                fullWidth
                className="col-span-2"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                variant="secondary"
              >
                İptal
              </Button>
              <Button
                onClick={handleEditIngredient}
                variant="primary"
                disabled={!editingIngredient.name || editingIngredient.unitPrice <= 0}
              >
                Güncelle
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}