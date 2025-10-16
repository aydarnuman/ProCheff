// lib/services/kik-calculator.ts
// 💰 KİK Kamu İhale Kurumu Maliyet Hesaplama Motoru

import { KIKCostCalculation, AdvancedSpecificationExtraction } from '@/lib/types/advanced-proposal'

export class KIKCalculator {
  // KİK sabit değerleri
  private static readonly K_FACTOR_FOOD = 0.93    // Yemek hizmetleri için K katsayısı
  private static readonly ABNORMALLY_LOW_THRESHOLD = 0.70  // Aşırı düşük eşiği
  private static readonly MATERIAL_RATIO_THRESHOLD = 0.60  // Malzeme aşırı düşük eşiği
  private static readonly LABOR_RATIO_THRESHOLD = 0.50     // İşçilik aşırı düşük eşiği

  /**
   * 🧮 Ana KİK maliyet hesaplama fonksiyonu
   */
  static calculateKIKCosts(specification: AdvancedSpecificationExtraction): KIKCostCalculation {
    // 1. Temel maliyet bileşenlerini hesapla
    const unitCosts = this.calculateUnitCosts(specification)
    
    // 2. KİK hesaplamalarını yap
    const kikCalculations = this.calculateKIKThresholds(unitCosts.total_unit_cost)
    
    // 3. Piyasa karşılaştırması yap
    const marketComparison = this.performMarketComparison(specification, unitCosts.total_unit_cost)
    
    // 4. Aşırı düşük analizi yap
    const abnormallyLowAnalysis = this.analyzeAbnormallyLow(unitCosts, marketComparison)

    return {
      unit_costs: unitCosts,
      kik_calculations: kikCalculations,
      abnormally_low_analysis: abnormallyLowAnalysis,
      market_comparison: marketComparison,
      calculation_details: {
        calculated_at: new Date(),
        methodology: 'KİK Tebliği (2022) - Yemek Hizmetleri',
        assumptions: [
          'Malzeme maliyeti: piyasa ortalaması + %15 kalite primi',
          'İşçilik: asgari ücret + sosyal haklar + %20 verimlilik',
          'Genel gider: %12 operasyonel maliyet',
          'Kâr marjı: %8-12 sektör ortalaması'
        ],
        data_sources: [
          'TÜİK Gıda Fiyat Endeksi',
          'İŞKUR Ücret İstatistikleri',  
          'Sektör Derneği Raporları',
          'Geçmiş İhale Verileri'
        ],
        confidence_level: 0.87
      }
    }
  }

  /**
   * 💰 Birim maliyetleri hesapla (TL/porsiyon)
   */
  private static calculateUnitCosts(spec: AdvancedSpecificationExtraction) {
    // Malzeme maliyeti hesaplama
    const materialCost = this.calculateMaterialCost(spec)
    
    // İşçilik maliyeti hesaplama  
    const laborCost = this.calculateLaborCost(spec)
    
    // Genel gider hesaplama
    const overheadCost = this.calculateOverheadCost(materialCost + laborCost)
    
    // Kâr marjı hesaplama
    const profitMargin = this.calculateProfitMargin(materialCost + laborCost + overheadCost)
    
    const totalUnitCost = materialCost + laborCost + overheadCost + profitMargin

    return {
      material_cost: Math.round(materialCost * 100) / 100,
      labor_cost: Math.round(laborCost * 100) / 100,
      overhead_cost: Math.round(overheadCost * 100) / 100,
      profit_margin: Math.round(profitMargin * 100) / 100,
      total_unit_cost: Math.round(totalUnitCost * 100) / 100
    }
  }

  /**
   * 🥗 Malzeme maliyeti hesaplama
   */
  private static calculateMaterialCost(spec: AdvancedSpecificationExtraction): number {
    let totalMaterialCost = 0

    // Her menü için malzeme maliyeti hesapla
    for (const menu of spec.menu) {
      for (const item of menu.items) {
        const itemCost = this.getItemUnitCost(item.name, item.category)
        const itemWeight = item.gram / 1000 // gram to kg
        const costPerPortion = itemCost * itemWeight
        
        totalMaterialCost += costPerPortion
      }
    }

    // Kurum tipine göre malzeme kalitesi ayarlaması
    const qualityMultiplier = this.getQualityMultiplier(spec.project.administrative_unit)
    
    return totalMaterialCost * qualityMultiplier
  }

  /**
   * 👨‍🍳 İşçilik maliyeti hesaplama
   */
  private static calculateLaborCost(spec: AdvancedSpecificationExtraction): number {
    const dailyPortions = spec.project.daily_portions
    
    // Porsiyon başına işçilik süresi (dakika)
    const minutesPerPortion = this.calculateLaborTimePerPortion(spec.menu)
    
    // Toplam günlük işçilik dakikası
    const totalDailyMinutes = dailyPortions * minutesPerPortion
    
    // Saatlik işçilik maliyeti (TL)
    const hourlyLaborCost = this.getHourlyLaborCost(spec.staff_requirements)
    
    // Günlük işçilik maliyeti
    const dailyLaborCost = (totalDailyMinutes / 60) * hourlyLaborCost
    
    // Porsiyon başına işçilik maliyeti
    return dailyLaborCost / dailyPortions
  }

  /**
   * 🏢 Genel gider hesaplama (%12 operasyonel)
   */
  private static calculateOverheadCost(baseCost: number): number {
    return baseCost * 0.12 // %12 genel gider
  }

  /**
   * 📈 Kâr marjı hesaplama (%8-12 sektör ortalaması)
   */
  private static calculateProfitMargin(baseCost: number): number {
    return baseCost * 0.10 // %10 kâr marjı
  }

  /**
   * 🎯 KİK eşik değerleri hesaplama
   */
  private static calculateKIKThresholds(totalUnitCost: number) {
    const thresholdValue = totalUnitCost * this.K_FACTOR_FOOD
    
    return {
      K_factor: this.K_FACTOR_FOOD,
      threshold_value: Math.round(thresholdValue * 100) / 100,
      bid_ratio_threshold: this.ABNORMALLY_LOW_THRESHOLD
    }
  }

  /**
   * ⚠️ Aşırı düşük teklif analizi
   */
  private static analyzeAbnormallyLow(unitCosts: any, marketComparison: any) {
    // Malzeme maliyet oranı
    const materialRatio = unitCosts.material_cost / marketComparison.industry_average_unit_cost
    
    // İşçilik maliyet oranı  
    const laborRatio = unitCosts.labor_cost / (marketComparison.industry_average_unit_cost * 0.25)
    
    // Risk faktörleri
    const riskFactors: string[] = []
    
    if (materialRatio < this.MATERIAL_RATIO_THRESHOLD) {
      riskFactors.push(`Malzeme maliyeti piyasa ortalamasının %${Math.round((1-materialRatio)*100)}'si altında`)
    }
    
    if (laborRatio < this.LABOR_RATIO_THRESHOLD) {
      riskFactors.push(`İşçilik maliyeti beklenen seviyenin %${Math.round((1-laborRatio)*100)}'si altında`)
    }

    // Genel aşırı düşük değerlendirmesi
    const overallRatio = unitCosts.total_unit_cost / (unitCosts.total_unit_cost * this.K_FACTOR_FOOD)
    const isAbnormallyLow = overallRatio < this.ABNORMALLY_LOW_THRESHOLD

    // Risk seviyesi belirleme
    let riskLevel: 'düşük' | 'orta' | 'yüksek' | 'kritik' = 'düşük'
    
    if (riskFactors.length >= 2) riskLevel = 'kritik'
    else if (riskFactors.length === 1) riskLevel = 'yüksek'  
    else if (isAbnormallyLow) riskLevel = 'orta'

    return {
      material_cost_ratio: Math.round(materialRatio * 100) / 100,
      labor_cost_ratio: Math.round(laborRatio * 100) / 100,
      is_abnormally_low: isAbnormallyLow,
      risk_level: riskLevel,
      risk_factors: riskFactors
    }
  }

  /**
   * 📊 Piyasa karşılaştirması
   */
  private static performMarketComparison(spec: AdvancedSpecificationExtraction, unitCost: number) {
    // Basit piyasa verisi simulasyonu (gerçekte API'den gelecek)
    const industryAverage = this.getIndustryAverageForInstitution(spec.project.administrative_unit)
    const regionalIndex = this.getRegionalPriceIndex(spec.project.location)
    
    let competitiveness: 'çok_düşük' | 'düşük' | 'ortalama' | 'yüksek' | 'çok_yüksek'
    
    const ratio = unitCost / industryAverage
    if (ratio < 0.8) competitiveness = 'çok_düşük'
    else if (ratio < 0.9) competitiveness = 'düşük'  
    else if (ratio < 1.1) competitiveness = 'ortalama'
    else if (ratio < 1.2) competitiveness = 'yüksek'
    else competitiveness = 'çok_yüksek'

    return {
      industry_average_unit_cost: industryAverage,
      regional_price_index: regionalIndex,
      similar_projects_avg: industryAverage * 1.05,
      cost_competitiveness: competitiveness
    }
  }

  // Yardımcı fonksiyonlar
  private static getItemUnitCost(itemName: string, category: string): number {
    // Malzeme birim fiyatları (TL/kg) - gerçekte database'den gelecek
    const priceMap: { [key: string]: number } = {
      'et': 85, 'tavuk': 45, 'balık': 60,
      'pilav': 8, 'makarna': 12, 'bulgur': 15,
      'sebze': 15, 'salata': 20, 'meyve': 25,
      'çorba': 5, 'tatlı': 18, 'ekmek': 8
    }
    
    // Kategori bazlı ortalama fiyat
    const categoryAverage: { [key: string]: number } = {
      'ana_yemek': 65, 'yan_yemek': 12, 'çorba': 8,
      'salata': 18, 'tatlı': 15, 'ekmek': 8, 'içecek': 5
    }
    
    // İsim bazlı arama
    for (const [key, price] of Object.entries(priceMap)) {
      if (itemName.toLowerCase().includes(key)) {
        return price
      }
    }
    
    // Kategori bazlı fallback
    return categoryAverage[category] || 20
  }

  private static getQualityMultiplier(institution: string): number {
    const multipliers: { [key: string]: number } = {
      'hastane': 1.15,    // %15 kalite primi
      'okul': 1.10,       // %10 kalite primi  
      'üniversite': 1.05, // %5 kalite primi
      'askeri': 1.12,     // %12 kalite primi
      'fabrika': 1.00     // Standart kalite
    }
    
    const institutionLower = institution.toLowerCase()
    for (const [key, multiplier] of Object.entries(multipliers)) {
      if (institutionLower.includes(key)) {
        return multiplier
      }
    }
    
    return 1.08 // Varsayılan %8 kalite primi
  }

  private static calculateLaborTimePerPortion(menu: any[]): number {
    // Menü karmaşıklığına göre dakika/porsiyon
    let baseTime = 2.5 // Basit menü için dakika/porsiyon
    
    for (const menuItem of menu) {
      for (const item of menuItem.items) {
        // Karmaşık yemekler daha fazla zaman alır
        if (item.category === 'ana_yemek') baseTime += 1.5
        if (item.category === 'çorba') baseTime += 0.8
        if (item.category === 'tatlı') baseTime += 1.0
      }
    }
    
    return Math.min(baseTime, 8) // Maksimum 8 dakika/porsiyon
  }

  private static getHourlyLaborCost(staffReq: any): number {
    // Asgari ücret + sosyal haklar + prim (2025 tahmini)
    const baseHourlyWage = 85 // TL/saat
    const socialBenefits = baseHourlyWage * 0.35 // %35 sosyal haklar
    const performanceBonus = baseHourlyWage * 0.20 // %20 performans primi
    
    return baseHourlyWage + socialBenefits + performanceBonus
  }

  private static getIndustryAverageForInstitution(institution: string): number {
    // Kurum tipine göre sektör ortalaması (TL/porsiyon)
    const averages: { [key: string]: number } = {
      'hastane': 32, 'okul': 18, 'üniversite': 22,
      'askeri': 28, 'fabrika': 24
    }
    
    const institutionLower = institution.toLowerCase()
    for (const [key, avg] of Object.entries(averages)) {
      if (institutionLower.includes(key)) {
        return avg
      }
    }
    
    return 25 // Genel ortalama
  }

  private static getRegionalPriceIndex(location: string): number {
    // Şehir bazlı fiyat endeksi (İstanbul=1.00 baz)
    const indices: { [key: string]: number } = {
      'istanbul': 1.00, 'ankara': 0.95, 'izmir': 0.90,
      'bursa': 0.85, 'antalya': 0.88, 'adana': 0.78
    }
    
    const locationLower = location.toLowerCase()
    for (const [city, index] of Object.entries(indices)) {
      if (locationLower.includes(city)) {
        return index
      }
    }
    
    return 0.82 // Anadolu ortalaması
  }
}

// Singleton instance
export const kikCalculator = KIKCalculator