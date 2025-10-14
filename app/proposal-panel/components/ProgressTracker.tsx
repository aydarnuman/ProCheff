'use client'

import React from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import { getIcon } from '@/lib/utils/icons'

export interface ProgressStep {
  id: number
  name: string
  description: string
  icon?: string
  status?: 'pending' | 'current' | 'completed' | 'error'
}

export interface ProgressTrackerProps {
  steps: ProgressStep[]
  currentStep: number
  className?: string
}

export function ProgressTracker({ steps, currentStep, className = '' }: ProgressTrackerProps) {
  const getStepStatus = (stepId: number): 'pending' | 'current' | 'completed' | 'error' => {
    if (stepId < currentStep) return 'completed'
    if (stepId === currentStep) return 'current'
    return 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'var(--status-success)'
      case 'current':
        return 'var(--accent-primary)'
      case 'error':
        return 'var(--status-error)'
      default:
        return 'var(--text-muted)'
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300"
                style={{
                  borderColor: getStatusColor(status),
                  backgroundColor: status === 'completed' || status === 'current' 
                    ? getStatusColor(status) 
                    : 'transparent',
                  color: status === 'completed' || status === 'current' 
                    ? 'white' 
                    : getStatusColor(status)
                }}
              >
                {status === 'completed' ? (
                  <CheckCircle size={20} />
                ) : status === 'current' ? (
                  <Clock size={20} />
                ) : step.icon ? (
                  getIcon(step.icon, { size: 20 })
                ) : (
                  <span className="text-sm font-semibold">{step.id + 1}</span>
                )}
              </div>

              {/* Step Info */}
              <div className="ml-3 flex-1">
                <div 
                  className="font-medium text-sm"
                  style={{ 
                    color: status === 'current' ? 'var(--accent-primary)' : 'var(--text-primary)' 
                  }}
                >
                  {step.name}
                </div>
                <div 
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {step.description}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div 
                  className="flex-1 h-0.5 mx-4 transition-all duration-300"
                  style={{
                    backgroundColor: step.id < currentStep 
                      ? 'var(--status-success)' 
                      : 'var(--border-secondary)'
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export interface StepProgressProps {
  currentStep: number
  totalSteps: number
  message?: string
  subMessage?: string
  className?: string
}

export function StepProgress({ 
  currentStep, 
  totalSteps, 
  message, 
  subMessage,
  className = '' 
}: StepProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className={`text-center ${className}`}>
      {/* Progress Bar */}
      <div 
        className="w-full h-2 rounded-full mb-4"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <div 
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ 
            width: `${progressPercentage}%`,
            backgroundColor: 'var(--accent-primary)'
          }}
        />
      </div>

      {/* Step Counter */}
      <div className="mb-2">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Adım {currentStep} / {totalSteps}
        </span>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-1">
          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {message}
          </div>
        </div>
      )}
      
      {subMessage && (
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {subMessage}
        </div>
      )}
    </div>
  )
}