// lib/validation/api-keys.ts
export interface ApiKeyValidation {
  isValid: boolean
  error?: string
  provider?: string
}

export interface ApiKeysStatus {
  anthropic: ApiKeyValidation
  gemini: ApiKeyValidation  
  openai: ApiKeyValidation
  scrapingBee?: ApiKeyValidation
}

/**
 * Server-side API key validation
 * Bu fonksiyon sadece server component'lerde kullanılmalı
 */
export const validateApiKeys = async (): Promise<ApiKeysStatus> => {
  const status: ApiKeysStatus = {
    anthropic: { isValid: false },
    gemini: { isValid: false },
    openai: { isValid: false },
    scrapingBee: { isValid: false }
  }

  // Anthropic Claude validation
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    if (anthropicKey.startsWith('sk-ant-')) {
      status.anthropic = { 
        isValid: true, 
        provider: 'Anthropic Claude' 
      }
    } else {
      status.anthropic = { 
        isValid: false, 
        error: 'Geçersiz Anthropic API key formatı' 
      }
    }
  } else {
    status.anthropic = { 
      isValid: false, 
      error: 'Anthropic API key bulunamadı' 
    }
  }

  // Google Gemini validation
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (geminiKey) {
    if (geminiKey.startsWith('AIza')) {
      status.gemini = { 
        isValid: true, 
        provider: 'Google Gemini' 
      }
    } else {
      status.gemini = { 
        isValid: false, 
        error: 'Geçersiz Google API key formatı' 
      }
    }
  } else {
    status.gemini = { 
      isValid: false, 
      error: 'Google Gemini API key bulunamadı' 
    }
  }

  // OpenAI validation  
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    if (openaiKey.startsWith('sk-')) {
      status.openai = { 
        isValid: true, 
        provider: 'OpenAI GPT' 
      }
    } else {
      status.openai = { 
        isValid: false, 
        error: 'Geçersiz OpenAI API key formatı' 
      }
    }
  } else {
    status.openai = { 
      isValid: false, 
      error: 'OpenAI API key bulunamadı' 
    }
  }

  // ScrapingBee validation (optional)
  const scrapingKey = process.env.SCRAPING_BEE_API_KEY
  if (scrapingKey) {
    status.scrapingBee = { 
      isValid: true, 
      provider: 'ScrapingBee' 
    }
  }

  return status
}

/**
 * Client-safe API key check (sadece varlık kontrolü)
 */
export const getApiKeysStatus = (): { [key: string]: boolean } => {
  // Bu fonksiyon client-side'da çalışabilir ama key'leri göstermez
  return {
    anthropic: !!process.env.NEXT_PUBLIC_HAS_ANTHROPIC,
    gemini: !!process.env.NEXT_PUBLIC_HAS_GEMINI,
    openai: !!process.env.NEXT_PUBLIC_HAS_OPENAI
  }
}