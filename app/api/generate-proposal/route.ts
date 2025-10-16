// app/api/generate-proposal/route.ts
// 📄 Teklif Hazırlama API

import { NextRequest, NextResponse } from 'next/server'
import { CostCalculation, ReviewedData, ProposalDocument } from '@/lib/types/proposal'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectData, costData }: { 
      projectData: ReviewedData, 
      costData: CostCalculation 
    } = body

    // Teklif dokümanı oluştur
    const proposal = generateProposalDocument(projectData, costData)
    
    return NextResponse.json({
      success: true,
      data: proposal
    })
    
  } catch (error) {
    console.error('Teklif oluşturma hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Teklif oluşturma başarısız oldu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

function generateProposalDocument(projectData: ReviewedData, costData: CostCalculation) {
  const { name, location, contractPeriod } = projectData.projectInfo
  const { dailyServings } = projectData.servingDetails
  const { finalTotal, pricePerServing } = costData.totals
  
  // Contract period'u ay sayısına çevir
  const durationMonths = parseInt(contractPeriod.match(/\d+/)?.[0] || '12')
  
  // Teklif metni oluştur
  const proposalText = `
# TEKLİF RAPORU
**Proje:** ${name}
**Lokasyon:** ${location}
**Süre:** ${contractPeriod}

## PROJENİN KAPSAMI
${name} projesi kapsamında günlük ${dailyServings.toLocaleString()} porsiyon yemek hizmeti verilecektir.

## HİZMET DETAYLARI
### Servis Kapasitesi
- **Günlük Porsiyon:** ${dailyServings.toLocaleString()} adet
- **Aylık Porsiyon:** ${(dailyServings * 30).toLocaleString()} adet
- **Sözleşme Süresi:** ${contractPeriod}

### Menü Yapısı
- **Ana Yemek:** ${projectData.portionSizes.lunch?.mainCourse || 150}g porsiyon
- **Yan Yemek:** ${projectData.portionSizes.lunch?.side || 100}g porsiyon
- **Çorba:** ${projectData.portionSizes.lunch?.soup || 200}ml porsiyon

### Beslenme Standartları
- **Kalori/Porsiyon:** ${projectData.nutritionalRequirements.calories} kcal
- **Protein:** ${projectData.nutritionalRequirements.protein}g minimum
- **Karbonhidrat:** ${projectData.nutritionalRequirements.carbs}g
- **Yağ:** ${projectData.nutritionalRequirements.fat}g

## MALİYET ANALİZİ
### Maliyet Detayları
- **Malzeme Maliyeti:** ${costData.totals.ingredientCost.toLocaleString()} TL/ay
- **İşçilik Maliyeti:** ${costData.totals.laborCost.toLocaleString()} TL/ay
- **Operasyonel Giderler:** ${costData.totals.operationalCost.toLocaleString()} TL/ay

### Genel Giderler ve Marjlar
- **Genel Giderler (%${costData.margins.overhead}):** ${costData.totals.overheadAmount.toLocaleString()} TL/ay
- **Kar Marjı (%${costData.margins.profit}):** ${costData.totals.profitAmount.toLocaleString()} TL/ay
- **Beklenmeyen Giderler (%${costData.margins.contingency}):** ${costData.totals.contingencyAmount.toLocaleString()} TL/ay

### Fiyatlandırma
- **Aylık Toplam:** ${finalTotal.toLocaleString()} TL
- **Porsiyon Başına:** ${pricePerServing.toFixed(2)} TL
- **${durationMonths} Aylık Toplam:** ${(finalTotal * durationMonths).toLocaleString()} TL

## KALITE GÜVENCE
### Hijyen ve Güvenlik
- HACCP sertifikalı üretim
- ISO 22000 kalite yönetim sistemi
- Günlük mikrobiyoloji testleri
- Soğuk zincir kontrolü

### Personel Yeterlilikleri
- Lisanslı aşçıbaşı
- Sertifikalı mutfak personeli
- Hijyen eğitimi almış servis ekibi
- 7/24 kalite kontrol

## ÖDEME KOŞULLARI
- **Ödeme Planı:** Aylık faturalandırma
- **Avans:** %15 proje başlangıç avansı
- **Vade:** 30 gün
- **KDV:** %8 (gıda hizmetleri)

## TAAHHÜTLER
### Hizmet Garantileri
- 7 gün 24 saat hizmet
- %99.5 servis kalitesi garantisi
- Şikayet çözüm süresi: maksimum 2 saat
- Yedek plan ve acil durum protokolü

### Yasal Uyum
- Gıda Kanunu uyumluluğu
- İş Sağlığı ve Güvenliği mevzuatı
- Çevre yönetmeliklerine uyum
- Vergi ve SGK yükümlülükleri

## PROJE BAŞLANGICI
- **Hazırlık Süresi:** 15 gün
- **Ekipman Kurulumu:** 5 gün
- **Personel Eğitimi:** 3 gün
- **Test Süreci:** 2 gün

Bu teklif ${new Date().toLocaleDateString('tr-TR')} tarihinden itibaren 30 gün geçerlidir.

---
**ProCheff Catering Services**
*Professional Food Solutions*
  `.trim()

  return {
    id: `proposal-${Date.now()}`,
    specificationId: `spec-${Date.now()}`,
    projectData,
    costCalculation: costData,
    proposalSections: {
      executive: proposalText,
      technical: 'Teknik detaylar ve ekipman gereksinimleri',
      methodology: 'Hizmet metodolojisi ve süreç yönetimi',
      timeline: 'Proje zaman planı ve kilometre taşları',
      quality: 'Kalite güvencesi ve kontrol prosedürleri',
      pricing: 'Detaylı fiyatlandırma ve ödeme koşulları',
      terms: 'Sözleşme şartları ve koşulları'
    },
    documents: {
      pdf: '',
      word: '',
      excel: ''
    },
    status: 'draft' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Ek meta veriler
    summary: {
      name,
      location,
      duration: durationMonths,
      dailyServings,
      monthlyTotal: finalTotal,
      pricePerServing,
      totalValue: finalTotal * durationMonths
    },
    costBreakdown: {
      ingredients: costData.totals.ingredientCost,
      labor: costData.totals.laborCost,
      operational: costData.totals.operationalCost,
      margins: costData.totals.overheadAmount + costData.totals.profitAmount + costData.totals.contingencyAmount,
      total: finalTotal
    },
    recommendedActions: [
      'Müşteri ile fiyat görüşmesi yapılması',
      'Sözleşme hazırlığına başlanması',
      'Ekipman ve personel planlamasının yapılması',
      'Tedarik zinciri kurulumunun başlatılması'
    ]
  }
}