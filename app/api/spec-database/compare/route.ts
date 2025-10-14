import { NextRequest, NextResponse } from 'next/server'
import { SpecificationDatabase } from '@/lib/services/specificationDatabase'

export async function POST(request: NextRequest) {
  try {
    const { targetProfile } = await request.json()
    
    const database = new SpecificationDatabase()
    const comparison = await database.compareProfilesWithAI(targetProfile)
    
    return NextResponse.json({
      success: true,
      data: comparison
    })
  } catch (error) {
    console.error('Profile comparison error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to compare profiles'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { fileName, profile, sourceContent } = await request.json()
    
    const database = new SpecificationDatabase()
    const record = await database.addSpecification(fileName, profile, sourceContent)
    
    return NextResponse.json({
      success: true,
      data: record
    })
  } catch (error) {
    console.error('Add specification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add specification'
    }, { status: 500 })
  }
}