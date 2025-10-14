// app/api/system/keys-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerApiKeysStatus } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    const keysStatus = await getServerApiKeysStatus()
    
    return NextResponse.json({
      success: true,
      data: keysStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('API keys status check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'API key durumu kontrol edilemedi'
      },
      { status: 500 }
    )
  }
}