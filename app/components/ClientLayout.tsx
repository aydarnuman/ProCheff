'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import ErrorBoundary from './ErrorBoundary'
import { ToastProvider } from './ui/Toast'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Top Header for Mobile */}
          <header className="lg:hidden backdrop-blur-md shadow-sm px-6 py-4" style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            borderBottom: '1px solid var(--border-primary)' 
          }}>
            <div className="flex items-center justify-between">
              <button
                onClick={toggleSidebar}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-white">ProCheff</h1>
              <div className="w-6" /> {/* Spacer */}
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}