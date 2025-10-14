import React from 'react'
import { getIcon } from '@/lib/utils/icons'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export function Input({
  label,
  error,
  helper,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          >
            {getIcon(icon, { size: 18 })}
          </div>
        )}
        
        <input
          id={inputId}
          className={`
            w-full px-3 py-2 rounded-lg border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-opacity-20
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error ? 'border-red-500' : ''}
          `}
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: error ? 'var(--status-error)' : 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          >
            {getIcon(icon, { size: 18 })}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {helper}
        </p>
      )}
    </div>
  )
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
  fullWidth?: boolean
}

export function Textarea({
  label,
  error,
  helper,
  fullWidth = false,
  className = '',
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}
      
      <textarea
        id={inputId}
        rows={rows}
        className={`
          w-full px-3 py-2 rounded-lg border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-vertical
          ${error ? 'border-red-500' : ''}
        `}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: error ? 'var(--status-error)' : 'var(--border-primary)',
          color: 'var(--text-primary)'
        }}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {helper}
        </p>
      )}
    </div>
  )
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helper?: string
  fullWidth?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({
  label,
  error,
  helper,
  fullWidth = false,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}
      
      <select
        id={inputId}
        className={`
          w-full px-3 py-2 rounded-lg border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-opacity-20
          ${error ? 'border-red-500' : ''}
        `}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: error ? 'var(--status-error)' : 'var(--border-primary)',
          color: 'var(--text-primary)'
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {helper}
        </p>
      )}
    </div>
  )
}