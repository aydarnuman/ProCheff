/**
 * ProCheff Planlama & Maliyet Hesaplama - Temel Türler
 * 
 * Bu dosya tüm planlama sistemi için kullanılacak temel türleri tanımlar.
 * Deterministik hesaplamalar için net ve tutarlı veri yapıları.
 */

// === BİRİM & FİYAT TÜRLERİ ===
export type Unit = 'kg' | 'g' | 'l' | 'ml' | 'adet';

export interface Price {
  materialId: string;
  unit: Unit;
  priceTRY: number;
  updatedAt: string;
  isStale?: boolean; // 30+ gün eski fiyat
}

export interface Ingredient {
  materialId: string;
  qty: number;
  unit: Unit;
  name?: string; // UI için
}

// === TARİF TÜRLERİ ===
export interface Recipe {
  id: string;
  name: string;
  portions: number;
  ingredients: Ingredient[];
  category: 'Çorba' | 'Ana' | 'Garnitür' | 'İçecek' | 'Tatlı';
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTime: number; // dakika
  tags?: string[];
  nutritionPer100g?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// === PLANLAMA TÜRLERİ ===
export interface DayPlan {
  date: string; // YYYY-MM-DD format
  recipeIds: string[];
  isComplete: boolean;
}

export interface MonthPlan {
  year: number;
  month: number; // 1-12
  personCount: number;
  days: DayPlan[];
  createdAt: string;
  lastModified: string;
}

// === MALİYET HESAPLAMA TÜRLERİ ===
export interface CostBreakdown {
  materialId: string;
  materialName: string;
  totalQty: number;
  unit: Unit;
  unitPrice: number;
  totalCost: number;
  daysUsed: string[]; // hangi günlerde kullanıldı
}

export interface DayCost {
  date: string;
  totalCostTRY: number;
  recipeCount: number;
  recipes: {
    recipeId: string;
    recipeName: string;
    costTRY: number;
  }[];
}

export interface CostSummary {
  // Ana metrikler
  totalTRY: number;
  avgPerDayTRY: number;
  avgPerPersonPerDayTRY: number;
  
  // En pahalı/ucuz günler
  mostExpensiveDay?: {
    date: string;
    cost: number;
    difference: number; // ortalamadan fark
  };
  leastExpensiveDay?: {
    date: string;
    cost: number;
    difference: number; // ortalamadan fark
  };
  
  // Top malzemeler
  topMaterials: {
    materialId: string;
    materialName: string;
    totalCostTRY: number;
    percentage: number; // toplam maliyetteki payı
  }[];
  
  // Detaylar
  dailyCosts: DayCost[];
  materialBreakdown: CostBreakdown[];
  
  // Uyarılar
  warnings: {
    missingPrices: string[]; // fiyatı olmayan malzemeler
    stalePrices: string[]; // eski fiyatlar
    portionMismatches: string[]; // porsiyon uyumsuzlukları
  };
}

// === AI MENÜ ÖNERİCİ TÜRLERİ ===
export interface MenuConstraints {
  dietaryRestrictions: ('vegetarian' | 'vegan' | 'halal' | 'gluten-free' | 'dairy-free')[];
  budgetTargetTRY?: number; // kişi/gün
  dishVariety: number; // 3-5 çeşit
  forbiddenIngredients: string[];
  preferredIngredients: string[];
  maxRepeatDays: number; // aynı tarif kaç günde bir tekrar edebilir
}

export interface MenuSuggestion {
  planId: string;
  days: {
    date: string;
    suggestedRecipeIds: string[];
    estimatedCostTRY: number;
  }[];
  totalEstimatedCostTRY: number;
  confidence: number; // 0-1 arası AI güven skoru
  reasoning: string; // AI'nın seçim gerekçesi
}

// === HATA TÜRLERİ ===
export interface ValidationError {
  type: 'missing_price' | 'stale_price' | 'portion_mismatch' | 'invalid_quantity';
  materialId?: string;
  recipeId?: string;
  message: string;
  severity: 'warning' | 'error';
}

// === UYGULAMA DURUM TÜRLERİ ===
export interface PlanningState {
  currentPlan?: MonthPlan;
  selectedMonth: number;
  selectedYear: number;
  personCount: number;
  isCalculating: boolean;
  costSummary?: CostSummary;
  errors: ValidationError[];
}