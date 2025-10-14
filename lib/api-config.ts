// lib/api-config.ts
import { validateApiKeys as validateApiKeysSecure, ApiKeysStatus } from './validation/api-keys'

interface ApiConfig {
  anthropic?: string
  gemini?: string
  openai?: string
  googleCloud?: {
    projectId: string
    credentials: string
  }
  scraping?: {
    scrapingBee?: string
    proxyMesh?: string
  }
}

export const getApiConfig = (): ApiConfig => {
  return {
    anthropic: process.env.ANTHROPIC_API_KEY,
    gemini: process.env.GOOGLE_GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    googleCloud: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
    },
    scraping: {
      scrapingBee: process.env.SCRAPING_BEE_API_KEY,
      proxyMesh: process.env.PROXY_MESH_API_KEY
    }
  }
}

export const validateApiKeys = (config: ApiConfig): { [key: string]: boolean } => {
  return {
    anthropic: !!config.anthropic,
    gemini: !!config.gemini,
    openai: !!config.openai,
    googleCloud: !!config.googleCloud?.projectId && !!config.googleCloud?.credentials,
    scrapingBee: !!config.scraping?.scrapingBee,
    proxyMesh: !!config.scraping?.proxyMesh
  }
}

/**
 * Server-side güvenli API key kontrolü
 */
export const getServerApiKeysStatus = async (): Promise<ApiKeysStatus> => {
  return await validateApiKeysSecure()
}

// Market scraping endpoints
export const MARKET_ENDPOINTS = {
  a101: 'https://www.a101.com.tr',
  bim: 'https://www.bim.com.tr',
  sok: 'https://www.sokmarket.com.tr',
  migros: 'https://www.migros.com.tr',
  metro: 'https://www.metro.com.tr',
  tarımKredi: 'https://www.tarimkredi.com.tr'
} as const

export type MarketName = keyof typeof MARKET_ENDPOINTS