'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closable?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closable = true,
  className = ''
}: ModalProps) {
  // Escape tuşu ile kapatma
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Body scroll'u engelle
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closable, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closable ? onClose : undefined}
      />
      
      {/* Modal Container */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div 
          className={`
            relative w-full ${sizeClasses[size]} 
            rounded-2xl shadow-2xl transform transition-all duration-200
            ${className}
          `}
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              {title && (
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h2>
              )}
              {!title && <div />}
              
              {showCloseButton && closable && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-20"
                  style={{ 
                    color: 'var(--text-muted)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className={title || showCloseButton ? 'p-6' : 'p-6'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface ModalHeaderProps {
  children: React.ReactNode
  className?: string
}

export function ModalHeader({ children, className = '' }: ModalHeaderProps) {
  return (
    <div 
      className={`pb-4 border-b mb-4 ${className}`}
      style={{ borderColor: 'var(--border-secondary)' }}
    >
      {children}
    </div>
  )
}

export interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div 
      className={`pt-4 border-t mt-4 flex items-center justify-end space-x-2 ${className}`}
      style={{ borderColor: 'var(--border-secondary)' }}
    >
      {children}
    </div>
  )
}

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  type = 'info'
}: ConfirmModalProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'danger': return 'var(--status-error)'
      case 'warning': return 'var(--status-warning)'
      default: return 'var(--accent-primary)'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <div className="mb-6">
        <p style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </div>
      
      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border transition-colors duration-200"
          style={{ 
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent'
          }}
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm()
            onClose()
          }}
          className="px-4 py-2 rounded-lg text-white transition-colors duration-200"
          style={{ backgroundColor: getTypeColor() }}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  )
}