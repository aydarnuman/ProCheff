'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Target } from 'lucide-react'
import { quickStats, workflowSteps, dataModules, managementTools } from '@/lib/data/dashboard'
import { getIcon, getTrendIcon, getPriorityColor } from '@/lib/utils/icons'
import { StatCard, InfoCard } from '@/app/components/ui'

export default function DashboardPage() {

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              🎯 Teklif Zekâsı Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              AI destekli tender optimizasyon sistemi
            </p>
          </div>
          
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl" 
               style={{ backgroundColor: 'var(--bg-success-subtle)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" 
                 style={{ backgroundColor: 'var(--status-success)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--status-success)' }}>
              Tüm Sistemler Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Main Workflow Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Zap size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            🌟 Ana İş Akışı
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {workflowSteps.map((step) => (
            <InfoCard
              key={step.href}
              title={step.title}
              description={step.description}
              icon={step.icon}
              badge={step.isNew ? 'YENİ' : undefined}
              badgeType="new"
              href={step.href}
              stats={`Sonraki: ${step.workflowNext}`}
              className="hover:-translate-y-1"
            />
          ))}
        </div>
      </div>

      {/* Data & Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Zeka & Veriler */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-lg">📊</span>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Zekâ & Veriler
            </h2>
          </div>
          
          <div className="space-y-4">
            {dataModules.map((module) => (
              <InfoCard
                key={module.href}
                title={module.title}
                description={module.description}
                icon={module.icon}
                badge={module.isNew ? 'YENİ' : undefined}
                badgeType="new"
                href={module.href}
                stats={module.stats}
              />
            ))}
          </div>
        </div>

        {/* Yönetim Araçları */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-lg">⚙️</span>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Yönetim
            </h2>
          </div>
          
          <div className="space-y-4">
            {managementTools.map((tool) => (
              <InfoCard
                key={tool.href}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
                stats={tool.stats}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="mt-8 p-6 rounded-xl border" 
           style={{ 
             backgroundColor: 'var(--bg-accent-subtle)',
             borderColor: 'var(--border-primary)'
           }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Hızlı Başlangıç
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Yeni bir ihale için otomatik teklif sürecini başlatın
            </p>
          </div>
          
          <Link href="/proposal-panel">
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              <Zap size={16} />
              <span>Teklif Panelini Başlat</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

    </div>
  )
}