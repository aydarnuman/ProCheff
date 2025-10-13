/**
 * ProCheff Maliyet Hesaplama Motoru
 * 
 * Deterministik, test edilebilir ve şeffaf maliyet hesaplamaları.
 * AI'ya ihtiyaç duymayan saf TypeScript mantığı.
 */

import type { 
  Recipe, 
  Price, 
  MonthPlan, 
  CostSummary, 
  DayCost, 
  CostBreakdown,
  ValidationError,
  Ingredient
} from './types';
import { 
  normalizeIngredientCost, 
  isPriceStale,
  getUnitLabel,
  suggestDisplayUnit 
} from './normalization';

export class CostEngine {
  private recipes: Map<string, Recipe> = new Map();
  private prices: Map<string, Price> = new Map();
  
  constructor(recipes: Recipe[] = [], prices: Price[] = []) {
    this.updateRecipes(recipes);
    this.updatePrices(prices);
  }
  
  /**
   * Tarif veritabanını güncelle
   */
  updateRecipes(recipes: Recipe[]): void {
    this.recipes.clear();
    recipes.forEach(recipe => {
      this.recipes.set(recipe.id, recipe);
    });
  }
  
  /**
   * Fiyat veritabanını güncelle
   */
  updatePrices(prices: Price[]): void {
    this.prices.clear();
    prices.forEach(price => {
      this.prices.set(price.materialId, price);
    });
  }
  
  /**
   * Tek bir tarif için porsiyon başı maliyeti hesapla
   * 
   * @param recipeId - Tarif ID'si
   * @returns Porsiyon başı maliyet bilgisi
   */
  calculateRecipeCost(recipeId: string): {
    costPerPortion: number;
    totalCost: number;
    portions: number;
    breakdown: CostBreakdown[];
    warnings: ValidationError[];
  } {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      throw new Error(`Recipe not found: ${recipeId}`);
    }
    
    const breakdown: CostBreakdown[] = [];
    const warnings: ValidationError[] = [];
    let totalCost = 0;
    
    for (const ingredient of recipe.ingredients) {
      const price = this.prices.get(ingredient.materialId);
      
      if (!price) {
        warnings.push({
          type: 'missing_price',
          materialId: ingredient.materialId,
          recipeId: recipe.id,
          message: `Fiyat bulunamadı: ${ingredient.materialId}`,
          severity: 'error'
        });
        continue;
      }
      
      // Eski fiyat uyarısı
      if (isPriceStale(price.updatedAt)) {
        warnings.push({
          type: 'stale_price',
          materialId: ingredient.materialId,
          recipeId: recipe.id,
          message: `Fiyat 30+ gün eski: ${ingredient.materialId}`,
          severity: 'warning'
        });
      }
      
      try {
        const { normalizedQty, unitPrice } = normalizeIngredientCost(ingredient, price);
        const ingredientCost = normalizedQty * unitPrice;
        
        totalCost += ingredientCost;
        
        breakdown.push({
          materialId: ingredient.materialId,
          materialName: ingredient.name || ingredient.materialId,
          totalQty: ingredient.qty,
          unit: ingredient.unit,
          unitPrice: price.priceTRY,
          totalCost: ingredientCost,
          daysUsed: [] // Bu fonksiyonda boş, plan hesaplamasında doldurulur
        });
        
      } catch (error) {
        warnings.push({
          type: 'invalid_quantity',
          materialId: ingredient.materialId,
          recipeId: recipe.id,
          message: `Birim dönüşüm hatası: ${error}`,
          severity: 'error'
        });
      }
    }
    
    const costPerPortion = recipe.portions > 0 ? totalCost / recipe.portions : totalCost;
    
    return {
      costPerPortion,
      totalCost,
      portions: recipe.portions,
      breakdown,
      warnings
    };
  }
  
  /**
   * Tek bir gün için maliyet hesapla
   * 
   * @param date - Tarih (YYYY-MM-DD)
   * @param recipeIds - O gün yapılacak tarifler
   * @param personCount - Kişi sayısı
   * @returns Günlük maliyet bilgisi
   */
  calculateDayCost(date: string, recipeIds: string[], personCount: number): DayCost {
    let totalCost = 0;
    const recipes: DayCost['recipes'] = [];
    
    for (const recipeId of recipeIds) {
      const recipeCost = this.calculateRecipeCost(recipeId);
      const recipe = this.recipes.get(recipeId);
      
      if (!recipe) continue;
      
      // Kişi sayısına göre ölçeklendir
      const scaledCost = recipeCost.costPerPortion * personCount;
      totalCost += scaledCost;
      
      recipes.push({
        recipeId,
        recipeName: recipe.name,
        costTRY: scaledCost
      });
    }
    
    return {
      date,
      totalCostTRY: totalCost,
      recipeCount: recipeIds.length,
      recipes
    };
  }
  
  /**
   * Aylık plan için kapsamlı maliyet analizi
   * 
   * @param plan - Aylık plan
   * @returns Detaylı maliyet özeti
   */
  calculateMonthCost(plan: MonthPlan): CostSummary {
    const dailyCosts: DayCost[] = [];
    const materialUsage: Map<string, CostBreakdown> = new Map();
    const allWarnings: ValidationError[] = [];
    
    // Her gün için maliyet hesapla
    for (const dayPlan of plan.days) {
      if (dayPlan.recipeIds.length === 0) continue;
      
      const dayCost = this.calculateDayCost(
        dayPlan.date, 
        dayPlan.recipeIds, 
        plan.personCount
      );
      
      dailyCosts.push(dayCost);
      
      // Malzeme kullanımını topla
      for (const recipeId of dayPlan.recipeIds) {
        const recipeCost = this.calculateRecipeCost(recipeId);
        allWarnings.push(...recipeCost.warnings);
        
        for (const breakdown of recipeCost.breakdown) {
          const existing = materialUsage.get(breakdown.materialId);
          if (existing) {
            existing.totalCost += breakdown.totalCost * plan.personCount;
            existing.totalQty += breakdown.totalQty * plan.personCount;
            existing.daysUsed.push(dayPlan.date);
          } else {
            materialUsage.set(breakdown.materialId, {
              ...breakdown,
              totalCost: breakdown.totalCost * plan.personCount,
              totalQty: breakdown.totalQty * plan.personCount,
              daysUsed: [dayPlan.date]
            });
          }
        }
      }
    }
    
    // Toplam maliyet
    const totalTRY = dailyCosts.reduce((sum, day) => sum + day.totalCostTRY, 0);
    const plannedDays = dailyCosts.length;
    const avgPerDayTRY = plannedDays > 0 ? totalTRY / plannedDays : 0;
    const avgPerPersonPerDayTRY = plan.personCount > 0 ? avgPerDayTRY / plan.personCount : 0;
    
    // En pahalı/ucuz günler
    let mostExpensiveDay, leastExpensiveDay;
    
    if (dailyCosts.length > 0) {
      const sortedDays = [...dailyCosts].sort((a, b) => b.totalCostTRY - a.totalCostTRY);
      
      mostExpensiveDay = {
        date: sortedDays[0].date,
        cost: sortedDays[0].totalCostTRY,
        difference: sortedDays[0].totalCostTRY - avgPerDayTRY
      };
      
      leastExpensiveDay = {
        date: sortedDays[sortedDays.length - 1].date,
        cost: sortedDays[sortedDays.length - 1].totalCostTRY,
        difference: avgPerDayTRY - sortedDays[sortedDays.length - 1].totalCostTRY
      };
    }
    
    // Top 3 malzeme
    const topMaterials = Array.from(materialUsage.values())
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 3)
      .map(material => ({
        materialId: material.materialId,
        materialName: material.materialName,
        totalCostTRY: material.totalCost,
        percentage: totalTRY > 0 ? (material.totalCost / totalTRY) * 100 : 0
      }));
    
    // Uyarıları kategorize et
    const missingPrices = [...new Set(
      allWarnings
        .filter(w => w.type === 'missing_price')
        .map(w => w.materialId!)
    )];
    
    const stalePrices = [...new Set(
      allWarnings
        .filter(w => w.type === 'stale_price')
        .map(w => w.materialId!)
    )];
    
    const portionMismatches = [...new Set(
      allWarnings
        .filter(w => w.type === 'portion_mismatch')
        .map(w => w.recipeId!)
    )];
    
    return {
      totalTRY,
      avgPerDayTRY,
      avgPerPersonPerDayTRY,
      mostExpensiveDay,
      leastExpensiveDay,
      topMaterials,
      dailyCosts,
      materialBreakdown: Array.from(materialUsage.values()),
      warnings: {
        missingPrices,
        stalePrices,
        portionMismatches
      }
    };
  }
  
  /**
   * Malzeme fiyat eksikliklerini kontrol et
   * 
   * @param recipeIds - Kontrol edilecek tarif ID'leri
   * @returns Eksik fiyatlar listesi
   */
  findMissingPrices(recipeIds: string[]): string[] {
    const missingMaterials = new Set<string>();
    
    for (const recipeId of recipeIds) {
      const recipe = this.recipes.get(recipeId);
      if (!recipe) continue;
      
      for (const ingredient of recipe.ingredients) {
        if (!this.prices.has(ingredient.materialId)) {
          missingMaterials.add(ingredient.materialId);
        }
      }
    }
    
    return Array.from(missingMaterials);
  }
  
  /**
   * Hızlı maliyet tahmini (detaysız)
   * 
   * @param recipeIds - Tarif ID'leri
   * @param personCount - Kişi sayısı
   * @returns Yaklaşık toplam maliyet
   */
  estimateQuickCost(recipeIds: string[], personCount: number): number {
    let totalCost = 0;
    
    for (const recipeId of recipeIds) {
      try {
        const recipeCost = this.calculateRecipeCost(recipeId);
        totalCost += recipeCost.costPerPortion * personCount;
      } catch {
        // Hata durumunda atla
        continue;
      }
    }
    
    return totalCost;
  }
}

// === YARDIMCI FONKSİYONLAR ===

/**
 * Günlük maliyetleri tarih aralığına göre filtrele
 */
export function filterCostsByDateRange(
  costs: DayCost[], 
  startDate: string, 
  endDate: string
): DayCost[] {
  return costs.filter(cost => 
    cost.date >= startDate && cost.date <= endDate
  );
}

/**
 * Maliyetleri haftalık gruplara ayır
 */
export function groupCostsByWeek(costs: DayCost[]): Record<string, DayCost[]> {
  const weeks: Record<string, DayCost[]> = {};
  
  costs.forEach(cost => {
    const date = new Date(cost.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Haftanın başı
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    weeks[weekKey].push(cost);
  });
  
  return weeks;
}

/**
 * Maliyet trendini hesapla (yükselen/düşen)
 */
export function calculateCostTrend(costs: DayCost[]): {
  trend: 'rising' | 'falling' | 'stable';
  percentage: number;
} {
  if (costs.length < 2) {
    return { trend: 'stable', percentage: 0 };
  }
  
  const sortedCosts = costs.sort((a, b) => a.date.localeCompare(b.date));
  const firstHalf = sortedCosts.slice(0, Math.floor(sortedCosts.length / 2));
  const secondHalf = sortedCosts.slice(Math.floor(sortedCosts.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, c) => sum + c.totalCostTRY, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, c) => sum + c.totalCostTRY, 0) / secondHalf.length;
  
  const percentageChange = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (Math.abs(percentageChange) < 5) {
    return { trend: 'stable', percentage: percentageChange };
  }
  
  return {
    trend: percentageChange > 0 ? 'rising' : 'falling',
    percentage: Math.abs(percentageChange)
  };
}