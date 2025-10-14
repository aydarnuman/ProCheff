import { 
  FileText, 
  Zap, 
  UtensilsCrossed, 
  Bot,
  Rocket,
  Clipboard,
  Calculator,
  Database,
  TrendingUp,
  FileSpreadsheet,
  BarChart3,
  Settings,
  DollarSign,
  Users,
  Calendar,
  Package,
  Truck,
  ChefHat,
  Percent,
  Target,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  LucideProps
} from 'lucide-react'

export interface IconMapping {
  [key: string]: React.ComponentType<LucideProps>
}

export const iconMap: IconMapping = {
  // Dashboard Icons
  'document': FileText,
  'optimization': Zap,
  'recipe': UtensilsCrossed,
  'ai': Bot,
  
  // Workflow Icons
  'rocket': Rocket,
  'clipboard': Clipboard,
  'calculator': Calculator,
  'utensils': UtensilsCrossed,
  
  // Data & Management Icons
  'database': Database,
  'trending': TrendingUp,
  'reports': FileSpreadsheet,
  'chart': BarChart3,
  'settings': Settings,
  
  // Business Icons
  'money': DollarSign,
  'users': Users,
  'calendar': Calendar,
  'package': Package,
  'truck': Truck,
  'chef': ChefHat,
  'percent': Percent,
  'target': Target,
  'star': Star,
  'clock': Clock,
  
  // Status Icons
  'success': CheckCircle,
  'error': XCircle,
  'warning': AlertCircle,
  'info': Info
}

/**
 * Merkezi ikon alma fonksiyonu
 * @param iconName - İkon adı (string) veya emoji
 * @param options - İkon seçenekleri (size, className, style)
 */
export function getIcon(
  iconName: string, 
  options: { size?: number; className?: string; style?: React.CSSProperties } = {}
) {
  // Emoji kontrolü - eğer iconName bir emoji ise direkt döndür
  const commonEmojis = ['📄', '⚡', '🍽️', '🤖', '🚀', '📋', '💰', '🗄️', '📈', '📝', '📊', '⚙️']
  const isEmoji = iconName.length <= 4 && (commonEmojis.includes(iconName) || iconName.match(/[\u2600-\u27BF]|[\uD83C][\uDF00-\uDFFF]|[\uD83D][\uDC00-\uDE4F]|[\uD83D][\uDE80-\uDEFF]/))
  
  if (isEmoji) {
    return (
      <span 
        className={`inline-block ${options.className || ''}`}
        style={{ fontSize: options.size ? `${options.size}px` : '1rem', ...options.style }}
      >
        {iconName}
      </span>
    )
  }
  
  // Lucide icon kontrolü
  const IconComponent = iconMap[iconName.toLowerCase()]
  
  if (IconComponent) {
    return (
      <IconComponent 
        size={options.size || 20} 
        className={options.className || ''} 
        style={options.style || {}} 
      />
    )
  }
  
  // Fallback - bilinmeyen ikon için varsayılan
  return (
    <Info 
      size={options.size || 20} 
      className={options.className || ''} 
      style={options.style || {}} 
    />
  )
}

/**
 * Trend ikonu alma fonksiyonu
 * @param trend - 'up' | 'down' | 'stable'
 * @param size - İkon boyutu
 */
export function getTrendIcon(trend: 'up' | 'down' | 'stable', size: number = 16) {
  switch (trend) {
    case 'up':
      return <TrendingUp size={size} className="text-green-500" />
    case 'down':
      return <TrendingUp size={size} className="text-red-500 rotate-180" />
    case 'stable':
      return <div className={`w-${size/4} h-0.5 bg-gray-400 rounded`} />
    default:
      return <Info size={size} className="text-gray-400" />
  }
}

/**
 * Öncelik rengi alma fonksiyonu
 * @param priority - 'high' | 'medium' | 'low'
 */
export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'var(--status-error)'
    case 'medium':
      return 'var(--status-warning)'
    case 'low':
      return 'var(--status-success)'
    default:
      return 'var(--text-muted)'
  }
}