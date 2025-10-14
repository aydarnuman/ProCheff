// lib/validation/schemas.ts

/**
 * Input Validation Schemas
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Temel validation fonksiyonları
 */
export class Validator {
  
  static required(value: any, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} zorunludur`
    }
    return null
  }

  static minLength(value: string, min: number, fieldName: string): string | null {
    if (value && value.length < min) {
      return `${fieldName} en az ${min} karakter olmalıdır`
    }
    return null
  }

  static maxLength(value: string, max: number, fieldName: string): string | null {
    if (value && value.length > max) {
      return `${fieldName} en fazla ${max} karakter olmalıdır`
    }
    return null
  }

  static email(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      return 'Geçerli bir e-posta adresi girin'
    }
    return null
  }

  static number(value: any, fieldName: string): string | null {
    if (value && isNaN(Number(value))) {
      return `${fieldName} sayı olmalıdır`
    }
    return null
  }

  static positiveNumber(value: number, fieldName: string): string | null {
    if (value && value <= 0) {
      return `${fieldName} pozitif sayı olmalıdır`
    }
    return null
  }

  static url(value: string): string | null {
    try {
      new URL(value)
      return null
    } catch {
      return 'Geçerli bir URL girin'
    }
  }

  static apiKey(value: string, provider: string): string | null {
    if (!value) return `${provider} API key gereklidir`
    
    const patterns = {
      'Anthropic': /^sk-ant-/,
      'OpenAI': /^sk-/,
      'Google': /^AIza/
    }

    const pattern = patterns[provider as keyof typeof patterns]
    if (pattern && !pattern.test(value)) {
      return `Geçersiz ${provider} API key formatı`
    }
    
    return null
  }
}

/**
 * Recipe Validation Schema
 */
export function validateRecipe(recipe: any): ValidationResult {
  const errors: string[] = []

  // Required fields
  const nameError = Validator.required(recipe.name, 'Tarif adı')
  if (nameError) errors.push(nameError)

  const descriptionError = Validator.required(recipe.description, 'Tarif açıklaması')
  if (descriptionError) errors.push(descriptionError)

  // Name length
  const nameMinError = Validator.minLength(recipe.name, 3, 'Tarif adı')
  if (nameMinError) errors.push(nameMinError)
  
  const nameMaxError = Validator.maxLength(recipe.name, 100, 'Tarif adı')
  if (nameMaxError) errors.push(nameMaxError)

  // Ingredients validation
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    errors.push('Malzemeler listesi gereklidir')
  } else if (recipe.ingredients.length === 0) {
    errors.push('En az bir malzeme ekleyin')
  } else {
    recipe.ingredients.forEach((ingredient: any, index: number) => {
      const ingredientNameError = Validator.required(ingredient.name, `Malzeme ${index + 1} adı`)
      if (ingredientNameError) errors.push(ingredientNameError)

      const quantityError = Validator.positiveNumber(ingredient.quantity, `Malzeme ${index + 1} miktarı`)
      if (quantityError) errors.push(quantityError)
    })
  }

  // Cooking time validation
  if (recipe.cookingTime) {
    const timeError = Validator.positiveNumber(recipe.cookingTime, 'Pişirme süresi')
    if (timeError) errors.push(timeError)
  }

  // Serving size validation
  if (recipe.servingSize) {
    const servingError = Validator.positiveNumber(recipe.servingSize, 'Porsiyon sayısı')
    if (servingError) errors.push(servingError)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * User Input Sanitization
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

/**
 * API Request Validation
 */
export function validateApiRequest(data: any, requiredFields: string[]): ValidationResult {
  const errors: string[] = []

  requiredFields.forEach(field => {
    const fieldError = Validator.required(data[field], field)
    if (fieldError) errors.push(fieldError)
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Market Price Request Validation
 */
export function validateMarketPriceRequest(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.products || !Array.isArray(data.products)) {
    errors.push('Ürün listesi gereklidir')
  } else if (data.products.length === 0) {
    errors.push('En az bir ürün seçin')
  } else if (data.products.length > 50) {
    errors.push('En fazla 50 ürün seçebilirsiniz')
  } else {
    data.products.forEach((product: string, index: number) => {
      if (!product || typeof product !== 'string') {
        errors.push(`Ürün ${index + 1} geçersiz`)
      } else if (product.length > 100) {
        errors.push(`Ürün ${index + 1} adı çok uzun`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * AI Analysis Request Validation
 */
export function validateAIAnalysisRequest(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.action || typeof data.action !== 'string') {
    errors.push('İşlem türü gereklidir')
  }

  const validActions = ['recipe-analysis', 'inventory-optimization', 'business-insights']
  if (data.action && !validActions.includes(data.action)) {
    errors.push('Geçersiz işlem türü')
  }

  if (!data.data) {
    errors.push('Analiz verisi gereklidir')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}