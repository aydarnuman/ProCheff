'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Toast Types
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

// Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast Hook
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000
    }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Toast Container
function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Individual Toast Item
interface ToastItemProps {
  toast: Toast
  onRemove: () => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove()
    }, 200)
  }

  const getToastStyles = () => {
    const baseStyles = {
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      opacity: isExiting ? '0' : '1',
      transition: 'all 0.3s ease-in-out'
    }

    switch (toast.type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: 'var(--status-success-bg)',
          borderColor: 'var(--status-success)',
          color: 'var(--status-success)'
        }
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: 'var(--status-error-bg)',
          borderColor: 'var(--status-error)',
          color: 'var(--status-error)'
        }
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: 'var(--status-warning-bg)',
          borderColor: 'var(--status-warning)',
          color: 'var(--status-warning)'
        }
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: 'var(--bg-accent-subtle)',
          borderColor: 'var(--accent-primary)',
          color: 'var(--accent-primary)'
        }
      default:
        return baseStyles
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return 'ℹ️'
    }
  }

  return (
    <div
      className="p-4 rounded-lg border shadow-lg backdrop-blur-sm flex items-start gap-3 min-w-0"
      style={getToastStyles()}
    >
      <span className="text-lg flex-shrink-0">{getIcon()}</span>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words" style={{ color: 'var(--text-primary)' }}>
          {toast.message}
        </p>
        
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: 'inherit' }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleRemove}
        className="text-lg hover:opacity-70 transition-opacity flex-shrink-0 ml-2"
        style={{ color: 'var(--text-muted)' }}
      >
        ×
      </button>
    </div>
  )
}

// Convenience functions
export const toast = {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    const context = React.useContext(ToastContext)
    if (context) {
      context.addToast({ message, type: 'success', ...options })
    }
  },
  
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    const context = React.useContext(ToastContext)
    if (context) {
      context.addToast({ message, type: 'error', ...options })
    }
  },
  
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    const context = React.useContext(ToastContext)
    if (context) {
      context.addToast({ message, type: 'warning', ...options })
    }
  },
  
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    const context = React.useContext(ToastContext)
    if (context) {
      context.addToast({ message, type: 'info', ...options })
    }
  }
}

// Hook for easy usage
export function useNotifications() {
  const { addToast } = useToast()
  
  return {
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
      addToast({ message, type: 'success', ...options }),
    
    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
      addToast({ message, type: 'error', ...options }),
    
    warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
      addToast({ message, type: 'warning', ...options }),
    
    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
      addToast({ message, type: 'info', ...options })
  }
}