/**
 * Tarif verilerini doğrulama ve biçimlendirme utilities
 */

export interface RecipeValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRecipe = (recipe: any): RecipeValidationResult => {
  const errors: string[] = [];

  // Başlık kontrolü
  if (!recipe.title || recipe.title.trim().length < 3) {
    errors.push('Tarif başlığı en az 3 karakter olmalıdır');
  }

  // Açıklama kontrolü
  if (!recipe.description || recipe.description.trim().length < 10) {
    errors.push('Tarif açıklaması en az 10 karakter olmalıdır');
  }

  // Malzemeler kontrolü
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    errors.push('En az bir malzeme eklenmelidir');
  }

  // Talimatlar kontrolü
  if (!recipe.instructions || !Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
    errors.push('En az bir talimat eklenmelidir');
  }

  // Pişirme süresi kontrolü
  if (!recipe.cookingTime || recipe.cookingTime < 1) {
    errors.push('Pişirme süresi en az 1 dakika olmalıdır');
  }

  // Porsiyon sayısı kontrolü
  if (!recipe.servings || recipe.servings < 1) {
    errors.push('Porsiyon sayısı en az 1 olmalıdır');
  }

  // Zorluk seviyesi kontrolü
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!recipe.difficulty || !validDifficulties.includes(recipe.difficulty)) {
    errors.push('Geçerli bir zorluk seviyesi seçilmelidir');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatRecipeForDisplay = (recipe: any) => {
  return {
    ...recipe,
    title: recipe.title?.trim(),
    description: recipe.description?.trim(),
    ingredients: recipe.ingredients?.filter((ingredient: string) => ingredient.trim()),
    instructions: recipe.instructions?.filter((instruction: string) => instruction.trim()),
    cookingTime: parseInt(recipe.cookingTime) || 0,
    servings: parseInt(recipe.servings) || 0,
    tags: recipe.tags?.filter((tag: string) => tag.trim()) || []
  };
};

export const formatCookingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} dakika`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} saat`;
  }
  
  return `${hours} saat ${remainingMinutes} dakika`;
};

export const getDifficultyLabel = (difficulty: string): string => {
  const labels = {
    'easy': 'Kolay',
    'medium': 'Orta',
    'hard': 'Zor'
  };
  
  return labels[difficulty as keyof typeof labels] || difficulty;
};

export const getDifficultyColor = (difficulty: string): string => {
  const colors = {
    'easy': 'text-green-600 bg-green-100',
    'medium': 'text-yellow-600 bg-yellow-100',
    'hard': 'text-red-600 bg-red-100'
  };
  
  return colors[difficulty as keyof typeof colors] || 'text-gray-600 bg-gray-100';
};