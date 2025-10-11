import React, { useState, useMemo, useCallback } from 'react';
import { Recipe, PriceList, ToastMessage, RecipeIngredient } from '../types';
import { RECIPE_CATEGORIES, UNITS } from '../constants';
import Icon from './Icon';
import { calculateCost } from '../utils';

// --- MODAL COMPONENT ---
interface RecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (recipe: Recipe) => void;
    recipeToEdit: Recipe | null;
    priceList: PriceList;
    addToast: (message: string, type: ToastMessage['type']) => void;
    onDelete?: (recipeName: string) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, onClose, onSave, recipeToEdit, priceList, addToast, onDelete }) => {
    const [recipe, setRecipe] = useState<Recipe>(
        recipeToEdit || { name: '', group: 'Ana Yemek', ingredients: [{ name: '', qty: 0, unit: 'g', lossPercentage: 0 }] }
    );
    const [isCostDetailsOpen, setIsCostDetailsOpen] = useState(true);
    
    React.useEffect(() => {
        setRecipe(recipeToEdit || { name: '', group: 'Ana Yemek', ingredients: [{ name: '', qty: 0, unit: 'g', lossPercentage: 0 }] });
        setIsCostDetailsOpen(true);
    }, [recipeToEdit, isOpen]);

    const costBreakdown = useMemo(() => {
        const validIngredients = recipe.ingredients.filter(ing => ing.name && ing.qty > 0);
        const ingredientCosts = validIngredients.map(ing => {
            const cost = calculateCost([ing], priceList);
            return { name: ing.name, cost };
        });
        
        const totalCost = ingredientCosts.reduce((acc, item) => acc + item.cost, 0);

        return { ingredientCosts, totalCost };
    }, [recipe.ingredients, priceList]);

    if (!isOpen) return null;

    const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: string | number) => {
        const newIngredients = [...recipe.ingredients];
        (newIngredients[index] as any)[field] = value;
        
        if(field === 'lossPercentage' && typeof value === 'number' && value > 99) {
            (newIngredients[index] as any)[field] = 99;
        }

        setRecipe({ ...recipe, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setRecipe({ ...recipe, ingredients: [...recipe.ingredients, { name: '', qty: 0, unit: 'g', lossPercentage: 0 }] });
    };

    const removeIngredient = (index: number) => {
        setRecipe({ ...recipe, ingredients: recipe.ingredients.filter((_, i) => i !== index) });
    };

    const ingredientOptions = Object.keys(priceList).sort();

    const handleSave = () => {
        if (!recipe.name.trim()) {
            addToast('Tarif adı boş olamaz.', 'warning');
            return;
        }

        const validIngredients = recipe.ingredients.filter(ing => ing.name.trim() && ing.qty > 0);

        if (validIngredients.length === 0) {
            addToast('Bir tarif en az bir geçerli malzeme içermelidir.', 'warning');
            return;
        }
        
        const cleanedRecipe: Recipe = {
            ...recipe,
            name: recipe.name.trim(),
            ingredients: validIngredients.map(ing => ({
                ...ing,
                name: ing.name.trim()
            }))
        };

        const ingredientExists = (name: string) => {
            const trimmedLowerName = name.trim().toLowerCase();
            return ingredientOptions.some(opt => opt.trim().toLowerCase() === trimmedLowerName);
        };
        
        const invalidIngredient = cleanedRecipe.ingredients.find(ing => !ingredientExists(ing.name));

        if (invalidIngredient) {
            addToast(`'${invalidIngredient.name}' geçerli bir malzeme değil. Lütfen listeden seçin.`, 'error');
            return;
        }

        onSave(cleanedRecipe);
    };


    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{recipeToEdit ? 'Tarifi Düzenle' : 'Yeni Tarif Ekle'}</h3>
                    <button onClick={onClose} className="modal-close-btn"><Icon name="close" /></button>
                </div>
                <div className="modal-body">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Tarif Adı</label>
                                <input
                                    type="text"
                                    value={recipe.name}
                                    onChange={e => setRecipe({ ...recipe, name: e.target.value })}
                                    className="form-input"
                                    placeholder="Örn: Mercimek Çorbası"
                                />
                            </div>
                            <div>
                                <label className="form-label">Kategori</label>
                                <select
                                    value={recipe.group}
                                    onChange={e => setRecipe({ ...recipe, group: e.target.value })}
                                    className="form-select"
                                >
                                    {RECIPE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                        <hr className="border-gray-700" />
                        <h4 className="font-semibold text-white">Malzemeler</h4>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                             <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium px-1">
                                <div className="col-span-6">Malzeme Adı</div>
                                <div className="col-span-2">Miktar</div>
                                <div className="col-span-2">Birim</div>
                                <div className="col-span-1">Fire %</div>
                                <div className="col-span-1"></div>
                            </div>
                            {recipe.ingredients.map((ing, index) => {
                                const findCanonicalName = (name: string | undefined): string => {
                                    if (!name) return '';
                                    const trimmedLowerName = name.trim().toLowerCase();
                                    return ingredientOptions.find(opt => opt.trim().toLowerCase() === trimmedLowerName) || '';
                                };
                                const canonicalName = findCanonicalName(ing.name);

                                return (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6">
                                        <select
                                            value={canonicalName}
                                            onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                                            className="form-select"
                                        >
                                            <option value="" disabled>Malzeme Seçin...</option>
                                            {ingredientOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={ing.qty}
                                            onChange={e => handleIngredientChange(index, 'qty', parseFloat(e.target.value) || 0)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <select
                                            value={ing.unit}
                                            onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                                            className="form-select"
                                        >
                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <input
                                            type="number"
                                            value={ing.lossPercentage ?? ''}
                                            placeholder="0"
                                            onChange={e => handleIngredientChange(index, 'lossPercentage', parseFloat(e.target.value) || 0)}
                                            className="form-input"
                                            min="0"
                                            max="99"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <button onClick={() => removeIngredient(index)} className="btn btn-danger btn-icon-only"><Icon name="trash" className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                        <button onClick={addIngredient} className="btn btn-secondary text-sm">
                            <Icon name="plus" className="w-4 h-4 mr-2" /> Malzeme Ekle
                        </button>

                        <div className="cost-details-accordion">
                            <button type="button" className="accordion-header" onClick={() => setIsCostDetailsOpen(!isCostDetailsOpen)} aria-expanded={isCostDetailsOpen}>
                                <h4 className="font-semibold text-white">Maliyet Detayları</h4>
                                <Icon name="chevron-down" className={`chevron ${isCostDetailsOpen ? 'open' : ''}`} />
                            </button>
                            <div className={`accordion-content ${isCostDetailsOpen ? 'open' : ''}`}>
                                <div className="accordion-content-inner">
                                    {costBreakdown.ingredientCosts.length > 0 ? (
                                        <ul className="cost-breakdown-list">
                                            {costBreakdown.ingredientCosts.map((item, index) => (
                                                <li key={index} className="cost-breakdown-item">
                                                    <span>{item.name}</span>
                                                    <span className="font-mono">{item.cost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400 text-center text-sm py-2">Maliyet hesaplamak için malzeme ve miktar ekleyin.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="modal-footer">
                    <div className="recipe-total-cost mr-auto">
                        <strong className="text-gray-400 font-medium">Porsiyon Maliyeti:</strong>
                        <span className="font-mono font-bold text-xl text-emerald-400">
                            {costBreakdown.totalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span>
                    </div>

                    {onDelete && recipeToEdit && <button onClick={() => onDelete(recipeToEdit.name)} className="btn btn-danger">Tarifi Sil</button>}
                    <button onClick={onClose} className="btn btn-secondary">İptal</button>
                    <button onClick={handleSave} className="btn btn-primary">Kaydet</button>
                </div>
            </div>
        </div>
    );
};


// --- CARD COMPONENT ---
const RecipeCard: React.FC<{ recipe: Recipe; onEdit: () => void; cost: number }> = ({ recipe, onEdit, cost }) => (
  <div className="card h-full flex flex-col justify-between interactive" onClick={onEdit}>
    <div>
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-white mb-1">{recipe.name}</h3>
            <span className="text-xs font-medium bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{recipe.group}</span>
        </div>
        <p className="text-sm text-gray-400 mb-3">{recipe.ingredients.length} malzeme</p>
    </div>
    <div className="flex justify-between items-center mt-4">
      <p className="text-xl font-bold text-emerald-400">
        {cost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        <span className="text-xs text-gray-400 font-medium"> / Porsiyon</span>
      </p>
      <button onClick={(e) => { e.stopPropagation(); onEdit();}} className="btn btn-secondary btn-icon-only">
        <Icon name="edit" className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
interface RecipesTabProps {
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[] | ((prevState: Recipe[]) => Recipe[])) => void;
  priceList: PriceList;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const RecipesTab: React.FC<RecipesTabProps> = ({ recipes, setRecipes, priceList, addToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
      return recipes
        .filter(recipe => {
            const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = !activeFilter || recipe.group === activeFilter;
            return matchesSearch && matchesFilter;
        })
        .sort((a,b) => a.name.localeCompare(b.name));
  }, [recipes, searchTerm, activeFilter]);
  
  const handleOpenModal = (recipe: Recipe | null) => {
      setRecipeToEdit(recipe);
      setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setRecipeToEdit(null);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    const trimmedName = recipe.name.trim();
    if (recipeToEdit) { // Editing
      if (recipeToEdit.name.toLowerCase() !== trimmedName.toLowerCase() && recipes.some(r => r.name.toLowerCase() === trimmedName.toLowerCase())) {
        addToast('Bu isimde başka bir tarif zaten mevcut.', 'error');
        return;
      }
      setRecipes(prev => prev.map(r => r.name === recipeToEdit.name ? { ...recipe, name: trimmedName } : r));
      addToast(`${trimmedName} başarıyla güncellendi.`, 'success');
    } else { // Adding
      if (recipes.some(r => r.name.toLowerCase() === trimmedName.toLowerCase())) {
        addToast('Bu isimde bir tarif zaten mevcut.', 'error');
        return;
      }
      setRecipes(prev => [...prev, { ...recipe, name: trimmedName }]);
      addToast(`${trimmedName} başarıyla eklendi.`, 'success');
    }
    handleCloseModal();
  };

  const handleDeleteRecipe = (recipeName: string) => {
    if (window.confirm(`'${recipeName}' tarifini silmek istediğinizden emin misiniz?`)) {
        setRecipes(prev => prev.filter(r => r.name !== recipeName));
        addToast(`${recipeName} başarıyla silindi.`, 'success');
        handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-auto flex-grow max-w-sm">
            <input
                type="text"
                placeholder="Tarif ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input pl-10"
            />
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
            <select
                value={activeFilter || ''}
                onChange={e => setActiveFilter(e.target.value || null)}
                className="form-select"
            >
                <option value="">Tüm Kategoriler</option>
                {RECIPE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button onClick={() => handleOpenModal(null)} className="btn btn-primary">
                <Icon name="add" className="icon" /> Yeni Tarif Ekle
            </button>
        </div>
      </div>
      
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.name} 
              recipe={recipe} 
              onEdit={() => handleOpenModal(recipe)} 
              cost={calculateCost(recipe.ingredients, priceList)}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-16 card">
            <h3 className="text-xl font-semibold text-white">Tarif Bulunamadı</h3>
            <p className="text-gray-400 mt-2">Aradığınız kriterlere uygun bir tarif bulunamadı veya henüz hiç tarif eklemediniz.</p>
            <button onClick={() => handleOpenModal(null)} className="btn btn-primary mt-4">
                İlk Tarifi Ekle
            </button>
         </div>
      )}

      <RecipeModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRecipe}
        recipeToEdit={recipeToEdit}
        priceList={priceList}
        addToast={addToast}
        onDelete={handleDeleteRecipe}
      />
    </div>
  );
};

export default RecipesTab;