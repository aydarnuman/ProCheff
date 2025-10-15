'use client'

import React, { useState } from 'react'
import { Modal } from './Modal'

interface AddIngredientModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddIngredientModal({ isOpen, onClose }: AddIngredientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    unitPrice: '',
    supplier: ''
  })

  const categories = [
    'Et ve Tavuk',
    'Sebze ve Meyve', 
    'Süt Ürünleri',
    'Tahıl ve Baklagil',
    'Baharat ve Çeşni',
    'Yağ ve Sos',
    'Diğer'
  ]

  const units = ['kg', 'gram', 'litre', 'adet', 'paket']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Yeni malzeme ekleniyor:', formData)
    // Burada API çağrısı yapılacak
    alert('Malzeme başarıyla eklendi!')
    setFormData({
      name: '',
      category: '',
      unit: '',
      unitPrice: '',
      supplier: ''
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Malzeme Ekle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Malzeme Adı */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Malzeme Adı
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Malzeme adını girin..."
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
            required
          />
        </div>

        {/* Kategori */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
            Kategori
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            required
          >
            <option value="">Kategori seçin...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-gray-900">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Birim ve Birim Fiyat */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="unit" className="block text-sm font-semibold text-gray-900 mb-2">
              Birim
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
            >
              <option value="" className="text-gray-400">Birim seçin...</option>
              {units.map((unit) => (
                <option key={unit} value={unit} className="text-gray-900">
                  {unit}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="unitPrice" className="block text-sm font-semibold text-gray-900 mb-2">
              Birim Fiyat (₺)
            </label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
              required
            />
          </div>
        </div>

        {/* Tedarikçi */}
        <div>
          <label htmlFor="supplier" className="block text-sm font-semibold text-gray-900 mb-2">
            Tedarikçi
          </label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleInputChange}
            placeholder="Tedarikçi adı (opsiyonel)"
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
          />
        </div>

        {/* Butonlar */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium"
          >
            Malzeme Ekle
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            İptal
          </button>
        </div>
      </form>
    </Modal>
  )
}