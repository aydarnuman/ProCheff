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
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
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