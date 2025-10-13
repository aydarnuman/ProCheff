import React, { useState, useCallback } from 'react';
import { GoogleGenerativeAI, SchemaType as Type } from "@google/generative-ai";
import { PublicMenu, PublicRecipe, ToastMessage, Recipe } from '../types';
import Icon from './Icon';

const publicMenuSchema = {
    type: Type.ARRAY,
    description: "Yemek listesi. Her öğe bir yemeğin adını ve reçetesini içerir.",
    items: {
        type: Type.OBJECT,
        properties: {
            mealName: {
                type: Type.STRING,
                description: "Yemeğin adı."
            },
            ingredients: {
                type: Type.ARRAY,
                description: "Yemeğin malzeme listesi.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Malzeme adı." },
                        qty: { type: Type.NUMBER, description: "Malzeme miktarı." },
                        unit: { type: Type.STRING, description: "Birim (g, ml, veya adet)." }
                    },
                    required: ["name", "qty", "unit"]
                }
            }
        },
        required: ["mealName", "ingredients"]
    }
};

const generatePublicMenuWithGemini = async (prompt: string): Promise<PublicMenu | null> => {
    try {
        const ai = new GoogleGenerativeAI(process.env.API_KEY || '');
        const systemInstruction = `Sen kamu kurumları için yemek menüleri ve reçeteleri oluşturan bir uzmansın. Görevin, kamu yemek şartnamelerindeki asgari gramajlara ve porsiyon standartlarına harfiyen uymaktır. Yalnızca sağlanan JSON şemasına uygun bir JSON dizisi döndür. Açıklama, yorum veya markdown ekleme. KESİNLİKLE UYULMASI GEREKEN KURALLAR: Her dizi öğesi bir yemeği temsil etmeli ve 'mealName' ile dolu bir 'ingredients' listesi içermelidir. Porsiyon standardı: ana yemek 200–250 g, çorba 250 ml, garnitür 150 g. Etli yemeklerde et 90–120 g; yağ 10–20 g; tuz 2–3 g. Birimler sadece 'g', 'ml', veya 'adet' olmalı. Eksik bilgileri mantıklı bir şekilde tamamla. Çıktıdaki her yemeğin altına “Reçete (Kamu Standartları)” başlığı ekleme, bu sunum katmanında yapılacak.`;

        const model = ai.getGenerativeModel({ 
          model: 'gemini-2.0-flash-exp',
          systemInstruction,
          generationConfig: { 
            responseMimeType: "application/json", 
            responseSchema: publicMenuSchema as any 
          }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;

        const jsonStr = response.text().trim();
        const generatedData = JSON.parse(jsonStr);
        
        if (Array.isArray(generatedData) && generatedData.length > 0) {
            const isValid = generatedData.every(item => 
                typeof item.mealName === 'string' && 
                Array.isArray(item.ingredients) &&
                item.ingredients.length > 0
            );
            if(isValid) {
                return generatedData as PublicMenu;
            }
        }
        
        console.error("Gemini response validation failed for the new array structure.", generatedData);
        return null;

    } catch (e) {
        console.error("Gemini API ile kamu menüsü oluşturulamadı:", e);
        return null;
    }
};


interface PublicMenuTabProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[] | ((prevState: Recipe[]) => Recipe[])) => void;
}

const PublicMenuTab: React.FC<PublicMenuTabProps> = ({ addToast, recipes, setRecipes }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedMenu, setGeneratedMenu] = useState<PublicMenu | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMenu = useCallback(async () => {
    if (!prompt.trim()) {
      addToast('Lütfen oluşturmak istediğiniz menü hakkında bir açıklama girin.', 'warning');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedMenu(null);
    try {
      const result = await generatePublicMenuWithGemini(prompt);
      if (result) {
        setGeneratedMenu(result);
        addToast('Kamu menüsü başarıyla oluşturuldu!', 'success');
      } else {
        throw new Error('Yapay zeka geçerli bir menü oluşturamadı. Lütfen tekrar deneyin veya isteğinizi değiştirin.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen bir hata oluştu.';
      setError(errorMessage);
      addToast(`Menü oluşturulurken hata: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, addToast]);
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      addToast('Panoya kopyalandı!', 'info');
    }, (err) => {
      addToast('Kopyalama başarısız oldu.', 'error');
      console.error('Could not copy text: ', err);
    });
  };

  const handleSaveToLibrary = useCallback(() => {
    if (!generatedMenu) return;

    let newRecipesCount = 0;
    let existingRecipesCount = 0;

    const newRecipes = generatedMenu.reduce((acc, publicRecipe) => {
        const recipeExists = recipes.some(r => r.name.trim().toLowerCase() === publicRecipe.mealName.trim().toLowerCase());
        
        if (!recipeExists) {
            const newRecipe: Recipe = {
                name: publicRecipe.mealName,
                group: 'Yapay Zeka', // Default group
                ingredients: publicRecipe.ingredients.map(ing => ({
                    name: ing.name,
                    qty: ing.qty,
                    unit: ing.unit,
                })),
            };
            acc.push(newRecipe);
            newRecipesCount++;
        } else {
            existingRecipesCount++;
        }
        return acc;
    }, [] as Recipe[]);

    if (newRecipes.length > 0) {
      setRecipes(prevRecipes => [...prevRecipes, ...newRecipes]);
    }
    
    let toastMessage = '';
    if (newRecipesCount > 0) {
        toastMessage += `${newRecipesCount} yeni tarif kütüphaneye eklendi. `;
    }
    if (existingRecipesCount > 0) {
        toastMessage += `${existingRecipesCount} tarif zaten mevcut olduğu için atlandı.`;
    }
    
    if(toastMessage) {
       addToast(toastMessage.trim(), newRecipesCount > 0 ? 'success' : 'info');
    }

  }, [generatedMenu, recipes, setRecipes, addToast]);


  const formatMenuForCopy = (menuData: PublicRecipe[]): string => {
    let text = "Kamu Standartlarına Uygun Menü\n\n";
    menuData.forEach(recipe => {
        text += `--- ${recipe.mealName} ---\n`;
        text += "Reçete (Kamu Standartları):\n";
        recipe.ingredients.forEach(ingredient => {
            text += `- ${ingredient.name}: ${ingredient.qty} ${ingredient.unit}\n`;
        });
        text += "\n";
    });
    return text;
  };

  return (
    <div className="public-menu-container">
      <div className="card">
        <div className="public-menu-header">
          <Icon name="gemini" className="mr-2 h-7 w-7 text-purple-400" />
          <h2>Yapay Zeka Destekli Kamu Menüsü Oluşturucu</h2>
        </div>
        <p className="public-menu-description">
          Oluşturmak istediğiniz menünün özelliklerini belirtin (örn: "Bir haftalık okul mönüsü", "5 günlük et ağırlıklı 4 çeşit menü"). Yapay zeka, kamu standartlarına uygun gramaj ve içeriklerle size özel bir menü ve reçeteler hazırlayacaktır.
        </p>
        <div className="public-menu-form">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Örn: Kış ayları için 1 haftalık, 4 çeşit, besleyici bir yurt menüsü oluştur."
            className="form-textarea"
            rows={3}
            disabled={isLoading}
            style={{ resize: 'vertical' }}
          />
          <button
            onClick={handleGenerateMenu}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <Icon name="spinner" className="animate-spin icon" />
                Oluşturuluyor...
              </>
            ) : (
                <>
                 <Icon name="gemini" className="icon" />
                 Menü Oluştur
                </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <strong className="font-bold">Hata!</strong>
          <span className="ml-2">{error}</span>
        </div>
      )}

      {generatedMenu && (
         <div className="card public-menu-results">
            <div className="card-header">
                 <h3>Oluşturulan Menü ve Reçeteler</h3>
                 <div className="actions">
                    <button 
                        onClick={handleSaveToLibrary}
                        className="btn"
                        style={{ backgroundColor: 'var(--color-secondary-accent)'}}
                        aria-label="Kütüphaneye Aktar"
                    >
                         <Icon name="save" className="icon" />
                         Kütüphaneye Aktar
                     </button>
                     <button 
                        onClick={() => handleCopy(formatMenuForCopy(generatedMenu))}
                        className="btn btn-secondary"
                        aria-label="Menüyü kopyala"
                    >
                         <Icon name="copy" className="icon" />
                         Tümünü Kopyala
                     </button>
                 </div>
            </div>

            <div className="public-menu-grid">
                {generatedMenu.map((recipe, index) => (
                    <div key={index} className="public-menu-recipe-card">
                         <h4>{recipe.mealName}</h4>
                         <p className="recipe-subtitle">Reçete (Kamu Standartları)</p>
                         <ul>
                             {recipe.ingredients.map((ingredient, i) => (
                                 <li key={i}>
                                     <span>{ingredient.name}:</span> {ingredient.qty} {ingredient.unit}
                                 </li>
                             ))}
                         </ul>
                    </div>
                ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default PublicMenuTab;