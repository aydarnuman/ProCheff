'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary yakaladı:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Production'da error tracking servisi
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry, LogRocket vb. error tracking
      console.error('Production Error:', { error, errorInfo })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30">
            
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚨</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Oops! Bir Hata Oluştu
              </h2>
              <p className="text-gray-400 text-sm">
                Beklenmeyen bir sorun yaşandı. Lütfen tekrar deneyin.
              </p>
            </div>

            {/* Error Details (sadece development'ta) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                <h3 className="text-red-400 font-medium text-sm mb-2">Geliştirici Bilgisi:</h3>
                <pre className="text-red-300 text-xs overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                🔄 Tekrar Dene
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-700 text-gray-300 font-medium py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors"
              >
                🏠 Ana Sayfaya Dön
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                Sorun devam ederse, sistem yöneticisine başvurun.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary