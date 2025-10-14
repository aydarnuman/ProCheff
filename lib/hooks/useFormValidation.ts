import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule
}

export interface ValidationErrors {
  [fieldName: string]: string
}

export interface UseFormValidationReturn<T> {
  values: T
  errors: ValidationErrors
  isValid: boolean
  setFieldValue: (field: keyof T, value: any) => void
  setFieldError: (field: keyof T, error: string) => void
  validateField: (field: keyof T) => boolean
  validateAll: () => boolean
  resetForm: (initialValues?: Partial<T>) => void
  resetErrors: () => void
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules = {}
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = useCallback((field: keyof T): boolean => {
    const fieldName = String(field)
    const value = values[field]
    const rules = validationRules[fieldName]

    if (!rules) return true

    let error = ''

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      error = 'Bu alan zorunludur'
    }

    // String validations
    if (typeof value === 'string' && !error) {
      if (rules.minLength && value.length < rules.minLength) {
        error = `En az ${rules.minLength} karakter olmalı`
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        error = `En fazla ${rules.maxLength} karakter olmalı`
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        error = 'Geçersiz format'
      }
    }

    // Number validations
    if (typeof value === 'number' && !error) {
      if (rules.min !== undefined && value < rules.min) {
        error = `En az ${rules.min} olmalı`
      }
      if (rules.max !== undefined && value > rules.max) {
        error = `En fazla ${rules.max} olmalı`
      }
    }

    // Custom validation
    if (rules.custom && !error) {
      const customResult = rules.custom(value)
      if (customResult !== true) {
        error = typeof customResult === 'string' ? customResult : 'Geçersiz değer'
      }
    }

    // Update errors
    setErrors(prev => {
      if (error) {
        return { ...prev, [fieldName]: error }
      } else {
        const { [fieldName]: _, ...rest } = prev
        return rest
      }
    })

    return !error
  }, [values, validationRules])

  const validateAll = useCallback((): boolean => {
    let isFormValid = true
    const newErrors: ValidationErrors = {}

    Object.keys(validationRules).forEach(field => {
      const fieldValid = validateField(field as keyof T)
      if (!fieldValid) {
        isFormValid = false
      }
    })

    return isFormValid
  }, [validationRules, validateField])

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    const fieldName = String(field)
    if (errors[fieldName]) {
      setErrors(prev => {
        const { [fieldName]: _, ...rest } = prev
        return rest
      })
    }
  }, [errors])

  const setFieldError = useCallback((field: keyof T, error: string) => {
    const fieldName = String(field)
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }, [])

  const resetForm = useCallback((newInitialValues?: Partial<T>) => {
    setValues(newInitialValues ? { ...initialValues, ...newInitialValues } : initialValues)
    setErrors({})
  }, [initialValues])

  const resetErrors = useCallback(() => {
    setErrors({})
  }, [])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    isValid,
    setFieldValue,
    setFieldError,
    validateField,
    validateAll,
    resetForm,
    resetErrors
  }
}

// Utility function for common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[0-9\s\-\(\)]{10,}$/,
  currency: /^\d+([.,]\d{1,2})?$/,
  positiveNumber: /^\d*\.?\d+$/
}

// Common validation rules
export const commonValidations = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: validationPatterns.email 
  },
  phone: { 
    required: true, 
    pattern: validationPatterns.phone 
  },
  positiveNumber: {
    required: true,
    custom: (value: any) => {
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }
  },
  currency: {
    required: true,
    pattern: validationPatterns.currency
  }
}