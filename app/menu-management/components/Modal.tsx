'use client'

import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 bg-white">
          {children}
        </div>
      </div>
    </div>
  )
}

export function StockStatusModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const stockData = [
    { name: 'Tavuk Göğsü', current: 2.5, minimum: 5, unit: 'kg', status: 'critical' },
    { name: 'Domates', current: 8, minimum: 10, unit: 'kg', status: 'low' },
    { name: 'Soğan', current: 15, minimum: 8, unit: 'kg', status: 'good' },
    { name: 'Zeytinyağı', current: 3, minimum: 2, unit: 'L', status: 'good' },
    { name: 'Tuz', current: 0.5, minimum: 1, unit: 'kg', status: 'critical' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Malzeme Havuzu Durumu">
      <div className="space-y-4">
        {stockData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">Minimum: {item.minimum} {item.unit}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{item.current} {item.unit}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                item.status === 'critical' ? 'bg-red-100 text-red-700' :
                item.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {item.status === 'critical' ? 'Kritik' :
                 item.status === 'low' ? 'Düşük' : 'İyi'}
              </span>
            </div>
          </div>
        ))}
        
        <div className="mt-6 space-y-2">
          <button 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            onClick={() => alert('Otomatik sipariş sistemi aktifleştiriliyor...')}
          >
            Otomatik Sipariş Ver
          </button>
          <button 
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function MenuPlanModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selectedWeek, setSelectedWeek] = React.useState('current')
  
  const menuPlans = {
    current: [
      { day: 'Pazartesi', main: 'Tavuklu Pilav', soup: 'Mercimek Çorbası', cost: '₺12.50' },
      { day: 'Salı', main: 'Kıymalı Makarna', soup: 'Domates Çorbası', cost: '₺15.00' },
      { day: 'Çarşamba', main: 'Balık Tava', soup: 'Tavuk Çorbası', cost: '₺18.00' },
      { day: 'Perşembe', main: 'Et Sote', soup: 'Yayla Çorbası', cost: '₺22.00' },
      { day: 'Cuma', main: 'Sebze Yemeği', soup: 'Ezogelin Çorbası', cost: '₺10.00' }
    ]
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Haftalık Menü Planlama">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hafta Seçin
          </label>
          <select 
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="current">Bu Hafta</option>
            <option value="next">Gelecek Hafta</option>
          </select>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Günlük Menü</h3>
          {menuPlans.current.map((plan, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{plan.day}</h4>
                  <p className="text-sm text-gray-600">Ana: {plan.main}</p>
                  <p className="text-sm text-gray-600">Çorba: {plan.soup}</p>
                </div>
                <span className="text-sm font-semibold text-green-600">{plan.cost}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <button 
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            onClick={() => alert('Menü planı kaydedildi!')}
          >
            Planı Kaydet
          </button>
          <button 
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            İptal
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function RecipeEditModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [searchTerm, setSearchTerm] = React.useState('')
  
  const recipes = [
    { id: 1, name: 'Tavuklu Pilav', category: 'Ana Yemek', lastEdit: '2 gün önce', status: 'active' },
    { id: 2, name: 'Mercimek Çorbası', category: 'Çorba', lastEdit: '1 hafta önce', status: 'active' },
    { id: 3, name: 'Kıymalı Makarna', category: 'Ana Yemek', lastEdit: '3 gün önce', status: 'draft' },
    { id: 4, name: 'Domates Çorbası', category: 'Çorba', lastEdit: '5 gün önce', status: 'active' }
  ]

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tarif Düzenleme">
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Tarif ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="border rounded-lg p-3 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                  <p className="text-sm text-gray-600">{recipe.category}</p>
                  <p className="text-xs text-gray-400">Son değişiklik: {recipe.lastEdit}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    recipe.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {recipe.status === 'active' ? 'Aktif' : 'Taslak'}
                  </span>
                  <button
                    onClick={() => alert(`${recipe.name} tarifi düzenleniyor...`)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <button 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            onClick={() => alert('Yeni tarif oluşturma sayfası açılıyor...')}
          >
            Yeni Tarif Oluştur
          </button>
          <button 
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function CategoryManagementModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [categories] = React.useState([
    { id: 1, name: 'Ana Yemekler', count: 45, color: '#ef4444' },
    { id: 2, name: 'Çorbalar', count: 12, color: '#f97316' },
    { id: 3, name: 'Salatalar', count: 8, color: '#22c55e' },
    { id: 4, name: 'Tatlılar', count: 15, color: '#a855f7' },
    { id: 5, name: 'İçecekler', count: 6, color: '#06b6d4' }
  ])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kategori Yönetimi">
      <div className="space-y-4">
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.count} tarif</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`${category.name} kategorisi düzenleniyor...`)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => alert(`${category.name} kategorisi siliniyor...`)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <button 
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            onClick={() => alert('Yeni kategori ekleme formu açılıyor...')}
          >
            Yeni Kategori Ekle
          </button>
          <button 
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function AddIngredientModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [formData, setFormData] = React.useState({
    name: '',
    category: '',
    unit: '',
    cost: '',
    supplier: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Yeni malzeme eklendi: ${formData.name}`)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Malzeme Ekle">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Malzeme Adı
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Örn: Domates"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Seçiniz</option>
            <option value="sebze">Sebze</option>
            <option value="et">Et & Tavuk</option>
            <option value="balik">Balık</option>
            <option value="sut">Süt Ürünleri</option>
            <option value="baharat">Baharat</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birim
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Seçiniz</option>
              <option value="kg">kg</option>
              <option value="g">gram</option>
              <option value="l">litre</option>
              <option value="adet">adet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birim Fiyat (₺)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tedarikçi
          </label>
          <input
            type="text"
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Tedarikçi adı"
          />
        </div>

        <div className="mt-6 space-y-2">
          <button 
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Malzeme Ekle
          </button>
          <button 
            type="button"
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            İptal
          </button>
        </div>
      </form>
    </Modal>
  )
}