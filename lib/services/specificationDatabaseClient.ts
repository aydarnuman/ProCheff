import { InstitutionProfile } from './specParser'

export interface DatabaseStats {
  totalRecords: number
  byRegion: Record<string, number>
  byInstitutionType: Record<string, number>
  averagePersonCount: number
  latestUpload: Date | null
}

export interface ProfileComparison {
  targetProfile: InstitutionProfile
  similarProfiles: any[]
  aiInsights: {
    bestMatch: string
    confidenceLevel: number
    recommendations: string[]
    riskFactors: string[]
  }
}

export class SpecificationDatabaseClient {
  async getStatistics(): Promise<DatabaseStats> {
    const response = await fetch('/api/spec-database/stats')
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    // Date parsing
    if (result.data.latestUpload) {
      result.data.latestUpload = new Date(result.data.latestUpload)
    }
    
    return result.data
  }

  async compareProfiles(targetProfile: InstitutionProfile): Promise<ProfileComparison> {
    const response = await fetch('/api/spec-database/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetProfile })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data
  }

  async addSpecification(fileName: string, profile: InstitutionProfile, sourceContent?: string) {
    const response = await fetch('/api/spec-database/compare', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileName, profile, sourceContent })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data
  }
}