// lib/services/costSimulator.ts

export interface Supplier {
  id: string
  name: string
  contact: {
    phone?: string
    email?: string
    address?: string
  }
  products: SupplierProduct[]
  reliability: number // 0-1 arası güvenilirlik skoru
  deliverySpeed: number // Günlük teslimat süresi
  paymentTerms: {
    cashDiscount?: number // Peşin ödemede indirim %
    creditDays?: number // Vadeli ödeme günü
  }
  location: {
    city: string
    region: string
    deliveryCost: number // km başına maliyet
  }
  certifications: string[] // Hijyen sertifikaları vs.
  lastUpdated: Date
}

export interface SupplierProduct {
  productId: string
  name: string
  category: 'et' | 'tavuk' | 'balik' | 'sebze' | 'meyve' | 'tahil' | 'yag' | 'baharat' | 'sut' | 'other'
  unitPrice: number // Birim fiyat (kg başına)
  unit: 'kg' | 'gram' | 'litre' | 'adet'
  minimumOrder: number // Minimum sipariş miktarı
  stock: number // Mevcut stok
  quality: 'A' | 'B' | 'C' // Kalite sınıfı
  organic: boolean
  halal: boolean
  priceValidUntil: Date
  seasonal?: {
    season: 'spring' | 'summer' | 'autumn' | 'winter'
    priceMultiplier: number
  }
}

export interface CostCalculation {
  totalCost: number
  costPerPortion: number
  profitMargin: number
  finalPrice: number
  breakdown: {
    ingredients: number
    delivery: number
    labor: number
    overhead: number
    profit: number
  }
  suppliers: SelectedSupplier[]
  alternatives: CostAlternative[]
  confidence: number
  warnings: string[]
}

export interface SelectedSupplier {
  supplier: Supplier
  products: {
    product: SupplierProduct
    quantity: number
    totalCost: number
  }[]
  totalCost: number
  deliveryCost: number
  reliabilityScore: number
}

export interface CostAlternative {
  description: string
  savingsAmount: number
  savingsPercent: number
  tradeoffs: string[]
  feasibility: 'high' | 'medium' | 'low'
}

export interface OptimizationRequest {
  ingredients: RequiredIngredient[]
  portionCount: number
  targetProfitMargin: number // %20 gibi
  maxBudgetPerPortion?: number
  qualityPreference: 'premium' | 'standard' | 'budget'
  specialRequirements: {
    organic?: boolean
    halal?: boolean
    local?: boolean
    certified?: boolean
  }
  batchSize: 'small' | 'medium' | 'large' // Üretim batch boyutu
}

export interface RequiredIngredient {
  name: string
  category: SupplierProduct['category']
  quantity: number // gram cinsinden
  alternatives: string[] // Alternatif ürün isimleri
  priority: 'essential' | 'important' | 'optional'
}

/**
 * 💰 Maliyet Simülasyon Motoru
 * 
 * AI destekli tedarikçi optimizasyonu ve maliyet hesaplama sistemi.
 * En uygun tedarikçi kombinasyonlarını bulur, kar marjını optimize eder.
 */
export class CostSimulator {
  private suppliers: Supplier[] = []
  private priceHistory: Map<string, number[]> = new Map()

  constructor() {
    this.initializeSampleSuppliers()
  }

  /**
   * 🎯 Ana optimizasyon fonksiyonu
   */
  async optimizeCost(request: OptimizationRequest): Promise<CostCalculation> {
    try {
      // 1. Uygun tedarikçileri filtrele
      const suitableSuppliers = this.filterSuppliers(request)
      
      // 2. En uygun kombinasyonu bul
      const bestCombination = await this.findOptimalCombination(request, suitableSuppliers)
      
      // 3. Maliyetleri hesapla
      const calculation = this.calculateTotalCost(request, bestCombination)
      
      // 4. Alternatif öneriler oluştur
      const alternatives = await this.generateAlternatives(request, calculation)
      
      // 5. AI ile doğrula ve optimize et
      const optimizedCalculation = await this.aiOptimizeCalculation(calculation, request)

      return {
        ...optimizedCalculation,
        alternatives,
        confidence: this.calculateConfidence(optimizedCalculation, request)
      }

    } catch (error) {
      throw new Error(`Maliyet optimizasyonu başarısız: ${error}`)
    }
  }

  /**
   * 🔍 Tedarikçi filtreleme
   */
  private filterSuppliers(request: OptimizationRequest): Supplier[] {
    return this.suppliers.filter(supplier => {
      // Özel gereksinimler
      const requirementsOk = this.checkSpecialRequirements(supplier, request.specialRequirements)
      
      // Kalite seviyesi
      const qualityOk = this.checkQualityLevel(supplier, request.qualityPreference)
      
      // Güvenilirlik skoru
      const reliabilityOk = supplier.reliability >= 0.7
      
      // Batch size uygunluğu
      const batchOk = this.checkBatchCompatibility(supplier, request.batchSize)
      
      return requirementsOk && qualityOk && reliabilityOk && batchOk
    })
  }

  /**
   * 🧮 Optimal kombinasyon bulma
   */
  private async findOptimalCombination(
    request: OptimizationRequest, 
    suppliers: Supplier[]
  ): Promise<SelectedSupplier[]> {
    
    const combinations: SelectedSupplier[][] = []
    
    // Her ingredient için en iyi tedarikçileri bul
    for (const ingredient of request.ingredients) {
      const supplierOptions: SelectedSupplier[] = []
      
      for (const supplier of suppliers) {
        const matchingProducts = supplier.products.filter(product => 
          this.matchesIngredient(product, ingredient)
        )
        
        if (matchingProducts.length > 0) {
          const bestProduct = this.selectBestProduct(matchingProducts, request.qualityPreference)
          const quantity = this.calculateRequiredQuantity(ingredient, request.portionCount)
          
          if (quantity >= bestProduct.minimumOrder && quantity <= bestProduct.stock) {
            supplierOptions.push({
              supplier,
              products: [{
                product: bestProduct,
                quantity,
                totalCost: quantity * bestProduct.unitPrice
              }],
              totalCost: quantity * bestProduct.unitPrice,
              deliveryCost: 0, // ProCheff teslimat yapmaz
              reliabilityScore: supplier.reliability
            })
          }
        }
      }
      
      // Her ingredient için en az 1 tedarikçi olmalı
      if (supplierOptions.length === 0 && ingredient.priority === 'essential') {
        throw new Error(`${ingredient.name} için uygun tedarikçi bulunamadı`)
      }
      
      combinations.push(supplierOptions)
    }

    // En düşük toplam maliyetli kombinasyonu seç
    return this.selectOptimalCombination(combinations, request)
  }

  /**
   * 💸 Toplam maliyet hesaplama
   */
  private calculateTotalCost(
    request: OptimizationRequest, 
    selectedSuppliers: SelectedSupplier[]
  ): CostCalculation {
    
    const ingredientsCost = selectedSuppliers.reduce((total, supplier) => 
      total + supplier.totalCost, 0
    )
    
    const deliveryCost = selectedSuppliers.reduce((total, supplier) => 
      total + supplier.deliveryCost, 0
    )
    
    // Sabit maliyetler (işçilik, genel giderler vs.)
    const laborCost = ingredientsCost * 0.15 // %15 işçilik
    const overheadCost = ingredientsCost * 0.10 // %10 genel gider
    
    const totalDirectCost = ingredientsCost + deliveryCost + laborCost + overheadCost
    
    // Kar marjı hesaplama
    const profitAmount = totalDirectCost * (request.targetProfitMargin / 100)
    const finalPrice = totalDirectCost + profitAmount
    
    const costPerPortion = finalPrice / request.portionCount

    return {
      totalCost: totalDirectCost,
      costPerPortion,
      profitMargin: request.targetProfitMargin,
      finalPrice,
      breakdown: {
        ingredients: ingredientsCost,
        delivery: deliveryCost,
        labor: laborCost,
        overhead: overheadCost,
        profit: profitAmount
      },
      suppliers: selectedSuppliers,
      alternatives: [], // Daha sonra doldurulacak
      confidence: 0.8,
      warnings: this.generateWarnings(request, selectedSuppliers)
    }
  }

  /**
   * 🤖 AI ile optimizasyon
   */
  private async aiOptimizeCalculation(
    calculation: CostCalculation, 
    request: OptimizationRequest
  ): Promise<CostCalculation> {
    
    // Gemini AI ile maliyet analizi
    const optimizationPrompt = `
    Maliyet analizi optimizasyonu yapın:
    
    MEVCUT DURUM:
    - Toplam maliyet: ${calculation.totalCost} TL
    - Porsiyon başı: ${calculation.costPerPortion} TL
    - Kar marjı: %${calculation.profitMargin}
    
    HEDEF:
    - ${request.portionCount} porsiyon
    - %${request.targetProfitMargin} kar marjı
    - Kalite tercihi: ${request.qualityPreference}
    
    TEDARIKÇILER:
    ${calculation.suppliers.map(s => 
      `- ${s.supplier.name}: ${s.totalCost} TL (Güvenilirlik: ${s.reliabilityScore})`
    ).join('\n')}
    
    Lütfen şu konularda analiz yapın:
    1. Maliyet optimize edilebilir mi?
    2. Hangi alanlarda tasarruf mümkün?
    3. Risk faktörleri neler?
    4. Alternatif stratejiler önerisi
    
    JSON formatında yanıt verin:
    {
      "optimizationScore": 0.85,
      "recommendations": [
        "Öneri 1",
        "Öneri 2"
      ],
      "riskFactors": [
        "Risk 1",
        "Risk 2"
      ],
      "potentialSavings": 150.50
    }
    `

    // Şimdilik simulated response - gerçek implementasyonda Gemini kullanılacak
    const aiResponse = {
      optimizationScore: 0.85,
      recommendations: [
        "Et tedarikçisini değiştirerek %12 tasarruf sağlanabilir",
        "Sebze alımını mevsimsel dönemlere göre ayarlayın",
        "Toplu sipariş indirimlerini değerlendirin"
      ],
      riskFactors: [
        "Ana et tedarikçisi tek kaynak riski oluşturuyor",
        "Mevsimsel fiyat dalgalanmaları maliyeti %15 artırabilir"
      ],
      potentialSavings: calculation.totalCost * 0.08 // %8 potansiyel tasarruf
    }

    // AI önerilerine göre hesaplamayı güncelle
    const optimizedCost = calculation.totalCost - aiResponse.potentialSavings
    const optimizedCostPerPortion = optimizedCost / request.portionCount

    return {
      ...calculation,
      totalCost: optimizedCost,
      costPerPortion: optimizedCostPerPortion,
      confidence: aiResponse.optimizationScore,
      warnings: [
        ...calculation.warnings,
        ...aiResponse.riskFactors
      ]
    }
  }

  /**
   * 🔄 Alternatif öneriler
   */
  private async generateAlternatives(
    request: OptimizationRequest, 
    baseCalculation: CostCalculation
  ): Promise<CostAlternative[]> {
    
    const alternatives: CostAlternative[] = []

    // 1. Kalite seviyesi düşürme
    if (request.qualityPreference !== 'budget') {
      alternatives.push({
        description: "Kalite seviyesini 'budget' yaparak maliyet düşürme",
        savingsAmount: baseCalculation.totalCost * 0.15,
        savingsPercent: 15,
        tradeoffs: ["Ürün kalitesi düşer", "Müşteri memnuniyeti azalabilir"],
        feasibility: 'high'
      })
    }

    // 2. Tedarikçi konsolidasyonu
    if (baseCalculation.suppliers.length > 2) {
      alternatives.push({
        description: "Tedarikçi sayısını azaltarak lojistik maliyetlerini düşürme",
        savingsAmount: baseCalculation.breakdown.delivery * 0.30,
        savingsPercent: Math.round((baseCalculation.breakdown.delivery * 0.30) / baseCalculation.totalCost * 100),
        tradeoffs: ["Tedarikçi bağımlılığı artar", "Esneklik azalır"],
        feasibility: 'medium'
      })
    }

    // 3. Mevsimsel ürün değişimi
    alternatives.push({
      description: "Mevsimsel ürünleri tercih ederek %20 tasarruf",
      savingsAmount: baseCalculation.breakdown.ingredients * 0.20,
      savingsPercent: 20,
      tradeoffs: ["Menü esnekliği kısıtlanır", "Stok yönetimi zorlaşır"],
      feasibility: 'medium'
    })

    // 4. Toplu sipariş indirimleri
    alternatives.push({
      description: "Aylık toplu sipariş ile indirim kazanma",
      savingsAmount: baseCalculation.breakdown.ingredients * 0.08,
      savingsPercent: 8,
      tradeoffs: ["Nakit akışı zorlanır", "Depolama maliyeti artar"],
      feasibility: 'high'
    })

    return alternatives.sort((a, b) => b.savingsAmount - a.savingsAmount)
  }

  /**
   * 📊 Güven skoru hesaplama
   */
  private calculateConfidence(
    calculation: CostCalculation, 
    request: OptimizationRequest
  ): number {
    let confidence = 0.5 // Başlangıç skoru

    // Tedarikçi güvenilirliği
    const avgReliability = calculation.suppliers.reduce((sum, s) => 
      sum + s.reliabilityScore, 0
    ) / calculation.suppliers.length
    confidence += avgReliability * 0.3

    // Fiyat güncellik durumu
    const recentPrices = calculation.suppliers.every(s => 
      s.products.every(p => 
        (Date.now() - p.product.priceValidUntil.getTime()) / (1000 * 60 * 60 * 24) < 7 // 7 gün
      )
    )
    if (recentPrices) confidence += 0.2

    // Alternatif sayısı
    if (calculation.alternatives.length > 2) confidence += 0.1

    return Math.min(0.95, confidence)
  }

  /**
   * Helper metodları
   */
  private checkBatchCompatibility(supplier: Supplier, batchSize: 'small' | 'medium' | 'large'): boolean {
    // Batch size uygunluğu kontrolü - ProCheff üretim odaklı
    // Güvenilirlik skoruna göre batch uygunluğu hesapla
    const avgProductPrice = supplier.products.reduce((sum, p) => sum + p.unitPrice, 0) / supplier.products.length
    
    switch (batchSize) {
      case 'small':
        return avgProductPrice <= 50 && supplier.reliability >= 0.8 // Küçük batch: güvenilir + uygun fiyat
      case 'medium':
        return supplier.reliability >= 0.7 // Orta batch: orta güvenilirlik
      case 'large':
        return true // Büyük batch: Tüm tedarikçiler uygun
      default:
        return true
    }
  }

  private checkLocationCompatibility(supplier: Supplier, location: { city: string }): boolean {
    // Şimdilik basit şehir karşılaştırması
    return supplier.location.city === location.city || 
           supplier.location.region === this.getCityRegion(location.city)
  }

  private checkSpecialRequirements(supplier: Supplier, requirements: any): boolean {
    if (requirements.halal) {
      return supplier.products.some(p => p.halal)
    }
    if (requirements.organic) {
      return supplier.products.some(p => p.organic)
    }
    return true
  }

  private checkQualityLevel(supplier: Supplier, preference: string): boolean {
    const qualityMap = { premium: ['A'], standard: ['A', 'B'], budget: ['A', 'B', 'C'] }
    const acceptableQualities = qualityMap[preference as keyof typeof qualityMap] || ['A', 'B', 'C']
    return supplier.products.some(p => acceptableQualities.includes(p.quality))
  }

  private matchesIngredient(product: SupplierProduct, ingredient: RequiredIngredient): boolean {
    return product.category === ingredient.category || 
           ingredient.alternatives.some(alt => 
             product.name.toLowerCase().includes(alt.toLowerCase())
           )
  }

  private selectBestProduct(products: SupplierProduct[], preference: string): SupplierProduct {
    // Kalite ve fiyat dengesine göre en iyi ürünü seç
    return products.sort((a, b) => {
      if (preference === 'premium') return a.quality.localeCompare(b.quality)
      if (preference === 'budget') return a.unitPrice - b.unitPrice
      // Standard için kalite-fiyat dengesi
      return (a.unitPrice / this.getQualityScore(a.quality)) - 
             (b.unitPrice / this.getQualityScore(b.quality))
    })[0]
  }

  private getQualityScore(quality: 'A' | 'B' | 'C'): number {
    return { A: 3, B: 2, C: 1 }[quality]
  }

  private calculateRequiredQuantity(ingredient: RequiredIngredient, portionCount: number): number {
    return (ingredient.quantity * portionCount) / 1000 // gram'dan kg'a çevir
  }

  private calculateDeliveryCallback(supplier: Supplier, location: { city: string }): number {
    // Basit mesafe hesabı - gerçekte Google Maps API kullanılabilir
    const baseDistance = supplier.location.city === location.city ? 10 : 50
    return baseDistance * supplier.location.deliveryCost
  }

  private selectOptimalCombination(
    combinations: SelectedSupplier[][], 
    request: OptimizationRequest
  ): SelectedSupplier[] {
    // Her ingredient grubu için en iyi tedarikçiyi seç
    const selected: SelectedSupplier[] = []
    
    for (const supplierGroup of combinations) {
      if (supplierGroup.length > 0) {
        // En düşük maliyetli + en güvenilir kombinasyonu bul
        const best = supplierGroup.sort((a, b) => 
          (a.totalCost + a.deliveryCost) / a.reliabilityScore - 
          (b.totalCost + b.deliveryCost) / b.reliabilityScore
        )[0]
        
        selected.push(best)
      }
    }
    
    return selected
  }

  private generateWarnings(request: OptimizationRequest, suppliers: SelectedSupplier[]): string[] {
    const warnings: string[] = []

    // Tek tedarikçi riski
    if (suppliers.length === 1) {
      warnings.push("Tek tedarikçiye bağımlılık riski mevcut")
    }

    // Düşük stok uyarısı
    suppliers.forEach(s => {
      s.products.forEach(p => {
        if (p.quantity > p.product.stock * 0.8) {
          warnings.push(`${p.product.name} stoku kritik seviyede`)
        }
      })
    })

    // Fiyat geçerlilik uyarısı
    suppliers.forEach(s => {
      s.products.forEach(p => {
        const daysUntilExpiry = (p.product.priceValidUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        if (daysUntilExpiry < 3) {
          warnings.push(`${p.product.name} fiyatı yakında güncellenebilir`)
        }
      })
    })

    return warnings
  }

  private getCityRegion(city: string): string {
    // Türkiye bölge haritası - basitleştirilmiş
    const regions: { [key: string]: string } = {
      'Istanbul': 'Marmara',
      'Ankara': 'İç Anadolu',
      'Izmir': 'Ege',
      'Bursa': 'Marmara',
      'Antalya': 'Akdeniz'
    }
    return regions[city] || 'Diğer'
  }

  /**
   * 🎲 Örnek tedarikçi verilerini başlat
   */
  private initializeSampleSuppliers(): void {
    this.suppliers = [
      {
        id: 'sup001',
        name: 'Anadolu Et Üretici Birliği',
        contact: {
          phone: '+90 312 123 4567',
          email: 'info@anadoluet.com',
          address: 'Ankara Organize Sanayi'
        },
        products: [
          {
            productId: 'et001',
            name: 'Dana Kuşbaşı',
            category: 'et',
            unitPrice: 85.50,
            unit: 'kg',
            minimumOrder: 10,
            stock: 500,
            quality: 'A',
            organic: false,
            halal: true,
            priceValidUntil: new Date('2024-02-15')
          },
          {
            productId: 'et002', 
            name: 'Kuzu Pirzola',
            category: 'et',
            unitPrice: 120.00,
            unit: 'kg',
            minimumOrder: 5,
            stock: 200,
            quality: 'A',
            organic: true,
            halal: true,
            priceValidUntil: new Date('2024-02-10')
          }
        ],
        reliability: 0.92,
        deliverySpeed: 2,
        paymentTerms: {
          cashDiscount: 3,
          creditDays: 30
        },
        location: {
          city: 'Ankara',
          region: 'İç Anadolu',
          deliveryCost: 0.50
        },
        certifications: ['HACCP', 'ISO 22000', 'Helal Sertifikası'],
        lastUpdated: new Date()
      },
      {
        id: 'sup002',
        name: 'Trakya Sebze ve Meyve',
        contact: {
          phone: '+90 212 987 6543',
          email: 'siparis@trakyasebze.com'
        },
        products: [
          {
            productId: 'sbz001',
            name: 'Domates',
            category: 'sebze',
            unitPrice: 8.50,
            unit: 'kg',
            minimumOrder: 50,
            stock: 2000,
            quality: 'A',
            organic: true,
            halal: true,
            priceValidUntil: new Date('2024-02-20'),
            seasonal: {
              season: 'summer',
              priceMultiplier: 0.8
            }
          },
          {
            productId: 'sbz002',
            name: 'Soğan',
            category: 'sebze',
            unitPrice: 4.20,
            unit: 'kg',
            minimumOrder: 25,
            stock: 1500,
            quality: 'B',
            organic: false,
            halal: true,
            priceValidUntil: new Date('2024-02-25')
          }
        ],
        reliability: 0.88,
        deliverySpeed: 1,
        paymentTerms: {
          cashDiscount: 5,
          creditDays: 15
        },
        location: {
          city: 'Istanbul',
          region: 'Marmara',
          deliveryCost: 0.30
        },
        certifications: ['Organik Sertifikası', 'GAP'],
        lastUpdated: new Date()
      }
    ]
  }
}