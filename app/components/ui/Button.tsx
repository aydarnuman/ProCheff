import React from 'react'
import { getIcon } from '@/lib/utils/icons'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          border: 'none'
        }
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)'
        }
      case 'success':
        return {
          backgroundColor: 'var(--status-success)',
          color: 'white',
          border: 'none'
        }
      case 'danger':
        return {
          backgroundColor: 'var(--status-error)',
          color: 'white',
          border: 'none'
        }
      case 'warning':
        return {
          backgroundColor: 'var(--status-warning)',
          color: 'white',
          border: 'none'
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: 'none'
        }
      default:
        return {
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          border: 'none'
        }
    }
  }

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2'
    }
  }

  const isDisabled = disabled || loading

  return (
    <button
      className={`
        rounded-lg font-medium transition-all duration-200
        ${getSizeClasses(size)}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm active:scale-95'}
        ${className}
      `}
      style={getVariantStyles(variant)}
      disabled={isDisabled}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {icon && iconPosition === 'left' && !loading && (
          <div className="flex-shrink-0">
            {getIcon(icon, { size: size === 'sm' ? 14 : size === 'lg' ? 20 : 16 })}
          </div>
        )}
        
        {loading && (
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
          </div>
        )}
        
        <span>{children}</span>
        
        {icon && iconPosition === 'right' && !loading && (
          <div className="flex-shrink-0">
            {getIcon(icon, { size: size === 'sm' ? 14 : size === 'lg' ? 20 : 16 })}
          </div>
        )}
      </div>
    </button>
  )
}

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: string
  tooltip?: string
}

export function IconButton({
  icon,
  tooltip,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}: IconButtonProps) {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'p-1.5'
      case 'lg':
        return 'p-3'
      default:
        return 'p-2'
    }
  }

  return (
    <button
      className={`
        rounded-lg transition-all duration-200 flex items-center justify-center
        ${getSizeClasses(size)}
        ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm active:scale-95'}
        ${className}
      `}
      style={variant === 'ghost' ? {
        backgroundColor: 'transparent',
        color: 'var(--text-muted)',
        border: 'none'
      } : {}}
      title={tooltip}
      {...props}
    >
      {getIcon(icon, { size: size === 'sm' ? 14 : size === 'lg' ? 24 : 18 })}
    </button>
  )
}

export interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function ButtonGroup({ 
  children, 
  className = '', 
  orientation = 'horizontal' 
}: ButtonGroupProps) {
  return (
    <div className={`
      inline-flex 
      ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}
      ${className}
    `}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0
          const isLast = index === React.Children.count(children) - 1
          
          return React.cloneElement(child, {
            className: `
              ${child.props.className || ''}
              ${orientation === 'horizontal' 
                ? `${isFirst ? 'rounded-r-none' : isLast ? 'rounded-l-none' : 'rounded-none'} border-r-0`
                : `${isFirst ? 'rounded-b-none' : isLast ? 'rounded-t-none' : 'rounded-none'} border-b-0`
              }
            `
          })
        }
        return child
      })}
    </div>
  )
}