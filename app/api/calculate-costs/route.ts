// app/api/calculate-costs/route.ts
// 💰 Maliyet Hesaplama API

import { NextRequest, NextResponse } from 'next/server'
import { CostCalculation, ReviewedData } from '@/lib/types/proposal'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectData }: { projectData: ReviewedData } = body

    // Maliyet hesaplama algoritması
    const costCalculation = calculateProjectCosts(projectData)
    
    return NextResponse.json({
      success: true,
      data: costCalculation
    })
    
  } catch (error) {
    console.error('Maliyet hesaplama hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Maliyet hesaplama başarısız oldu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

function calculateProjectCosts(projectData: ReviewedData): CostCalculation {
  const dailyServings = projectData.servingDetails.dailyServings
  const monthlyServings = dailyServings * 30
  const contractMonths = 24 // Varsayılan

  // Malzeme maliyetleri
  const ingredientCostPerServing = 8.5 // TL
  const totalIngredientCost = monthlyServings * ingredientCostPerServing

  // İşçilik maliyetleri (aylık)
  const laborCosts = {
    chefs: 3, // kişi
    assistants: 6,
    service: 4,
    management: 2,
    totalMonthlyCost: (3 * 45000) + (6 * 25000) + (4 * 22000) + (2 * 35000) // 358,000 TL/ay
  }

  // Operasyonel maliyetler (aylık)
  const operationalCosts = {
    energy: 45000,      // Elektrik + doğalgaz
    rent: 80000,        // Kira
    equipment: 15000,   // Ekipman amortismanı
    hygiene: 12000,     // Hijyen malzemeleri
    insurance: 8000,    // Sigorta
    other: 10000,       // Diğer
    subtotal: 170000
  }

  // Marjlar
  const margins = {
    overhead: 8,      // % Genel giderler
    profit: 15,       // % Kar
    contingency: 5    // % Beklenmeyen giderler
  }

  // Hesaplamalar
  const subtotal = totalIngredientCost + laborCosts.totalMonthlyCost + operationalCosts.subtotal
  const overheadAmount = subtotal * (margins.overhead / 100)
  const profitAmount = (subtotal + overheadAmount) * (margins.profit / 100)
  const contingencyAmount = (subtotal + overheadAmount + profitAmount) * (margins.contingency / 100)
  
  const finalTotal = subtotal + overheadAmount + profitAmount + contingencyAmount
  const pricePerServing = finalTotal / monthlyServings

  return {
    ingredients: [{
      category: 'Tüm Malzemeler',
      items: [
        {
          name: 'Et ve Et Ürünleri',
          quantity: monthlyServings * 0.35,
          unit: 'kg',
          unitPrice: 85,
          totalCost: monthlyServings * 0.35 * 85
        },
        {
          name: 'Sebze ve Meyve',
          quantity: monthlyServings * 0.25,
          unit: 'kg', 
          unitPrice: 12,
          totalCost: monthlyServings * 0.25 * 12
        },
        {
          name: 'Tahıllar ve Bakliyat',
          quantity: monthlyServings * 0.15,
          unit: 'kg',
          unitPrice: 18,
          totalCost: monthlyServings * 0.15 * 18
        }
      ],
      subtotal: totalIngredientCost
    }],
    labor: laborCosts,
    operational: operationalCosts,
    margins,
    totals: {
      ingredientCost: totalIngredientCost,
      laborCost: laborCosts.totalMonthlyCost,
      operationalCost: operationalCosts.subtotal,
      subtotal,
      overheadAmount,
      profitAmount,
      contingencyAmount,
      finalTotal,
      pricePerServing
    },
    calculatedAt: new Date()
  }
}