/**
 * ProCheff Birim Normalizasyon Utilities
 * 
 * Farklı birimler arası dönüşüm ve normalizasyon işlemleri.
 * Deterministik maliyet hesaplamaları için kritik.
 */

import type { Unit, Ingredient, Price } from './types';

// === BİRİM DÖNÜŞÜM KATSAYILARI ===
const UNIT_CONVERSIONS: Record<Unit, Record<Unit, number | null>> = {
  'kg': {
    'kg': 1,
    'g': 1000,
    'l': null,
    'ml': null,
    'adet': null
  },
  'g': {
    'kg': 0.001,
    'g': 1,
    'l': null,
    'ml': null,
    'adet': null
  },
  'l': {
    'kg': null,
    'g': null,
    'l': 1,
    'ml': 1000,
    'adet': null
  },
  'ml': {
    'kg': null,
    'g': null,
    'l': 0.001,
    'ml': 1,
    'adet': null
  },
  'adet': {
    'kg': null,
    'g': null,
    'l': null,
    'ml': null,
    'adet': 1
  }
};

/**
 * İki birim arasında dönüşüm yapabilir mi kontrol eder
 */
export function canConvert(fromUnit: Unit, toUnit: Unit): boolean {
  return UNIT_CONVERSIONS[fromUnit][toUnit] !== null;
}

/**
 * Bir miktarı bir birimden diğerine dönüştürür
 * 
 * @param quantity - Dönüştürülecek miktar
 * @param fromUnit - Kaynak birim
 * @param toUnit - Hedef birim
 * @returns Dönüştürülmüş miktar
 * @throws Error - Dönüşüm mümkün değilse
 */
export function convertUnit(quantity: number, fromUnit: Unit, toUnit: Unit): number {
  if (!canConvert(fromUnit, toUnit)) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
  }
  
  const conversionFactor = UNIT_CONVERSIONS[fromUnit][toUnit]!;
  return quantity * conversionFactor;
}

/**
 * Malzeme miktarını fiyat birimi ile normalize eder
 * 
 * @param ingredient - Malzeme bilgisi
 * @param price - Fiyat bilgisi
 * @returns Normalize edilmiş miktar ve birim fiyat
 */
export function normalizeIngredientCost(
  ingredient: Ingredient, 
  price: Price
): { normalizedQty: number; unitPrice: number; isExact: boolean } {
  
  // Aynı birim - direk hesaplama
  if (ingredient.unit === price.unit) {
    return {
      normalizedQty: ingredient.qty,
      unitPrice: price.priceTRY,
      isExact: true
    };
  }
  
  // Birim dönüşümü gerekli
  if (!canConvert(ingredient.unit, price.unit)) {
    throw new Error(
      `Cannot calculate cost: ingredient unit '${ingredient.unit}' is incompatible with price unit '${price.unit}' for material ${ingredient.materialId}`
    );
  }
  
  const normalizedQty = convertUnit(ingredient.qty, ingredient.unit, price.unit);
  
  return {
    normalizedQty,
    unitPrice: price.priceTRY,
    isExact: true
  };
}

/**
 * Birim fiyatı başka birime dönüştürür (UI'da farklı birimler göstermek için)
 * 
 * @param unitPrice - Mevcut birim fiyat
 * @param currentUnit - Mevcut birim
 * @param targetUnit - Hedef birim
 * @returns Dönüştürülmüş birim fiyat
 */
export function convertUnitPrice(
  unitPrice: number, 
  currentUnit: Unit, 
  targetUnit: Unit
): number {
  if (!canConvert(currentUnit, targetUnit)) {
    throw new Error(`Cannot convert unit price from ${currentUnit} to ${targetUnit}`);
  }
  
  // 1 birim currentUnit = x birim targetUnit
  // unitPrice / currentUnit = newPrice / targetUnit
  // newPrice = unitPrice * (targetUnit / currentUnit)
  
  const conversionFactor = convertUnit(1, currentUnit, targetUnit);
  return unitPrice / conversionFactor;
}

/**
 * Akıllı birim önerisi - kullanıcı dostu görünüm için
 * 
 * @param quantity - Miktar
 * @param unit - Mevcut birim
 * @returns Önerilen miktar ve birim
 */
export function suggestDisplayUnit(quantity: number, unit: Unit): { qty: number; unit: Unit } {
  switch (unit) {
    case 'g':
      if (quantity >= 1000) {
        return { qty: quantity / 1000, unit: 'kg' };
      }
      break;
      
    case 'kg':
      if (quantity < 1) {
        return { qty: quantity * 1000, unit: 'g' };
      }
      break;
      
    case 'ml':
      if (quantity >= 1000) {
        return { qty: quantity / 1000, unit: 'l' };
      }
      break;
      
    case 'l':
      if (quantity < 1) {
        return { qty: quantity * 1000, unit: 'ml' };
      }
      break;
  }
  
  return { qty: quantity, unit };
}

/**
 * Birim etiketlerini Türkçe'ye çevirir
 */
export function getUnitLabel(unit: Unit): string {
  const labels: Record<Unit, string> = {
    'kg': 'kg',
    'g': 'g',  
    'l': 'litre',
    'ml': 'ml',
    'adet': 'adet'
  };
  
  return labels[unit];
}

/**
 * Fiyat güncelleme tarihi kontrolü
 */
export function isPriceStale(updatedAt: string, staleDays: number = 30): boolean {
  const updateDate = new Date(updatedAt);
  const now = new Date();
  const diffDays = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return diffDays > staleDays;
}

/**
 * Malzeme adını normalleştir (arama ve eşleştirme için)
 */
export function normalizeMaterialName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}