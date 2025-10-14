'use client'

import { useState, useCallback } from 'react'
import { ValidationResult } from '@/lib/validation/schemas'

export interface FormState<T> {
  values: T
  errors: { [K in keyof T]?: string }
  touched: { [K in keyof T]?: boolean }
  isValid: boolean
  isSubmitting: boolean
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: (values: T) => ValidationResult
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false
  })

  const setValue = useCallback((field: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value
      },
      touched: {
        ...prev.touched,
        [field]: true
      }
    }))
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error
      }
    }))
  }, [])

  const clearError = useCallback((field: keyof T) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: undefined
      }
    }))
  }, [])

  const validate = useCallback(() => {
    if (!validationSchema) return true

    const validation = validationSchema(state.values)
    
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        errors: validation.errors.reduce((acc, error) => {
          // Simple error mapping - in real app you'd need better logic
          const firstField = Object.keys(prev.values)[0] as keyof T
          acc[firstField] = error
          return acc
        }, {} as { [K in keyof T]?: string }),
        isValid: false
      }))
      return false
    }

    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true
    }))
    return true
  }, [state.values, validationSchema])

  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      const isValid = validate()
      if (!isValid) return

      await onSubmit(state.values)
      
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }, [state.values, validate])

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false
    })
  }, [initialValues])

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    setValue,
    setError,
    clearError,
    validate,
    handleSubmit,
    reset
  }
}

/**
 * Input Component with Validation
 */
interface ValidatedInputProps {
  label: string
  name: string
  type?: string
  value: any
  onChange: (value: any) => void
  error?: string
  touched?: boolean
  placeholder?: string
  required?: boolean
  className?: string
}

export function ValidatedInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  touched,
  placeholder,
  required = false,
  className = ''
}: ValidatedInputProps) {
  const hasError = touched && error

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-300"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400
          focus:outline-none focus:ring-2 transition-colors
          ${hasError 
            ? 'border-red-500 focus:ring-red-500/50' 
            : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
          }
        `}
      />

      {hasError && (
        <p className="text-red-400 text-sm flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

/**
 * Textarea Component with Validation
 */
interface ValidatedTextareaProps extends Omit<ValidatedInputProps, 'type'> {
  rows?: number
}

export function ValidatedTextarea({
  label,
  name,
  value,
  onChange,
  error,
  touched,
  placeholder,
  required = false,
  rows = 4,
  className = ''
}: ValidatedTextareaProps) {
  const hasError = touched && error

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-300"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 resize-vertical
          focus:outline-none focus:ring-2 transition-colors
          ${hasError 
            ? 'border-red-500 focus:ring-red-500/50' 
            : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
          }
        `}
      />

      {hasError && (
        <p className="text-red-400 text-sm flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}