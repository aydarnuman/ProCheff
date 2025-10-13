import { GoogleGenerativeAI, SchemaType as Type } from "@google/generative-ai";
import { AnalysisScope, AnalysisSummary, PriceList, Recipe } from '../types';

const analysisSummarySchema = {
    type: Type.OBJECT,
    properties: {
        totalCost: { 
            type: Type.NUMBER,
            description: "Belirtilen kişi sayısı için tüm planın toplam maliyeti (Türk Lirası)."
        },
        avgDailyCost: { 
            type: Type.NUMBER,
            description: "Yemek planlanan günler için günlük ortalama maliyet (Türk Lirası)."
        },
        expensiveDay: {
            type: Type.OBJECT,
            description: "Maliyetin en yüksek olduğu gün ve o günün maliyeti.",
            properties: {
                date: { type: Type.STRING, description: "YYYY-AA-GG formatında tarih." },
                cost: { type: Type.NUMBER },
            },
            required: ['date', 'cost']
        },
        cheapDay: {
            type: Type.OBJECT,
            description: "Maliyetin en düşük olduğu gün ve o günün maliyeti.",
            properties: {
                date: { type: Type.STRING, description: "YYYY-AA-GG formatında tarih." },
                cost: { type: Type.NUMBER },
            },
            required: ['date', 'cost']
        },
        diversityScore: { 
            type: Type.NUMBER,
            description: "Menü çeşitliliğini 0-100 arasında puanlayan bir skor. Aynı yemeklerin ne sıklıkla tekrarlandığına ve ana yemek türlerinin (kırmızı et, beyaz et, sebze) dengesine göre hesaplanır."
        },
        costHistory: {
            type: Type.ARRAY,
            description: "Planlanan her gün için maliyet geçmişi.",
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING, description: "YYYY-AA-GG formatında tarih." },
                    cost: { type: Type.NUMBER, description: "O günün toplam maliyeti." },
                },
                required: ['date', 'cost']
            }
        }
    },
    required: ["totalCost", "avgDailyCost", "expensiveDay", "cheapDay", "diversityScore", "costHistory"]
};

export const performGeminiAnalysis = async (
    scope: AnalysisScope,
    recipes: Recipe[],
    priceList: PriceList,
    monthlyPlan: import("../types").MonthlyPlan
): Promise<AnalysisSummary> => {

    const planData = {
        personCount: monthlyPlan.personCount,
        days: monthlyPlan.days
    };

    // Reduce data size sent to Gemini
    const relevantRecipes = recipes.filter(r => 
        Object.values(planData.days || {}).some(day => 
            Object.values(day).some(meal => meal?.name === r.name)
        )
    );

    const relevantIngredients = [...new Set(relevantRecipes.flatMap(r => r.ingredients.map(i => i.name)))];
    const relevantPrices = Object.fromEntries(
        Object.entries(priceList).filter(([name]) => relevantIngredients.includes(name))
    );

    const prompt = `
        Sen bir maliyet analizi uzmanısın. Sağlanan yemek planı, tarifler ve malzeme fiyatlarına dayanarak kapsamlı bir analiz yap.
        Analizi ${scope.year} yılının ${scope.month + 1}. ayı için yapıyorsun.
        
        Veriler:
        - Yemek Planı: ${JSON.stringify(planData)}
        - Tarifler: ${JSON.stringify(relevantRecipes)}
        - Fiyat Listesi: ${JSON.stringify(relevantPrices)}

        Görevin:
        1.  Verilen kişi sayısı için planın toplam maliyetini hesapla.
        2.  Yemek planlanan günler için ortalama günlük maliyeti hesapla.
        3.  En pahalı ve en ucuz günleri maliyetleriyle birlikte bul.
        4.  Menü çeşitliliğini 0-100 arasında bir skorla değerlendir. Düşük skor, tekrarlayan yemekler veya dengesiz öğün türleri anlamına gelir.
        5.  Her planlanmış gün için maliyet geçmişini bir liste olarak oluştur.
        
        Sonucu yalnızca sağlanan JSON şemasına uygun bir JSON nesnesi olarak döndür. Başka hiçbir metin, açıklama veya markdown ekleme.
    `;

    try {
        const ai = new GoogleGenerativeAI(process.env.API_KEY || '');
        const model = ai.getGenerativeModel({ 
          model: 'gemini-2.0-flash-exp',
          generationConfig: { 
            responseMimeType: "application/json", 
            responseSchema: analysisSummarySchema as any 
          }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const jsonStr = response.text().trim();
        const generatedData = JSON.parse(jsonStr);

        // Basic validation
        if (typeof generatedData.totalCost !== 'number' || !Array.isArray(generatedData.costHistory)) {
             throw new Error("AI response validation failed.");
        }

        return generatedData as AnalysisSummary;

    } catch (e) {
        console.error("Gemini analysis error:", e);
        if (e instanceof Error && e.message.includes('429')) {
             throw new Error("Rate limit exceeded");
        }
        throw new Error("Yapay zeka ile analiz gerçekleştirilemedi.");
    }
};
