// app/api/ai/orchestrator/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AIOrchestrator } from '@/lib/ai-orchestrator/orchestrator'
import { AIRequest } from '@/lib/ai-orchestrator/types'

const orchestrator = new AIOrchestrator()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'smart-analysis': {
        const aiRequest: AIRequest = {
          task: 'recipe-analysis',
          context: data,
          priority: 'medium',
          requiredCapabilities: ['recipe-analysis']
        }

        const result = await orchestrator.runParallelComparison(aiRequest)
        
        // Context store'a ekle
        orchestrator.addToContextStore({
          type: 'analysis',
          input: data,
          output: result.response.data,
          model: result.selectedModel,
          confidence: result.confidenceScore,
          tags: ['recipe-analysis'],
          executionTime: result.response.executionTime,
          cost: result.response.cost,
          tokenUsed: result.response.tokenUsed
        })

        return NextResponse.json({
          success: true,
          data: {
            result: result.response.data,
            metadata: {
              selectedModel: result.selectedModel,
              confidence: result.confidenceScore,
              reasoning: result.reasoning,
              executionTime: result.response.executionTime,
              cost: result.response.cost
            }
          }
        })
      }

      case 'model-comparison': {
        const aiRequest: AIRequest = {
          task: data.task || 'general',
          context: data.context,
          priority: 'high'
        }

        const result = await orchestrator.runParallelComparison(aiRequest)

        return NextResponse.json({
          success: true,
          data: {
            primary: result.response,
            alternatives: result.alternativeResponses || [],
            recommendation: result.reasoning
          }
        })
      }

      case 'performance-report': {
        const report = orchestrator.getPerformanceReport()
        
        return NextResponse.json({
          success: true,
          data: report
        })
      }

      case 'context-search': {
        const { query, limit } = data
        const contexts = orchestrator.getRelevantContext(query, limit)
        
        return NextResponse.json({
          success: true,
          data: contexts
        })
      }

      case 'reflexive-analysis': {
        const analysis = orchestrator.getReflexiveAnalysis()
        const recentAssessments = orchestrator.getRecentAssessments(data.limit || 10)
        
        return NextResponse.json({
          success: true,
          data: {
            analysis,
            recentAssessments
          }
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz orchestrator işlemi' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('AI Orchestrator error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Orchestrator işlemi başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}