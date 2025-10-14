import { NextRequest, NextResponse } from 'next/server'
import { SpecificationDatabase } from '@/lib/services/specificationDatabase'

export async function GET() {
  try {
    const database = new SpecificationDatabase()
    const stats = await database.getStatistics()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Database stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load database statistics'
    }, { status: 500 })
  }
}