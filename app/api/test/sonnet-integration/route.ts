// API Route: /api/test/sonnet-integration
// Development ve QA için test endpoint'i

import { NextRequest, NextResponse } from 'next/server';
import { testRunner, testCases } from '@/lib/tests/sonnet-integration';
import { createMockSonnetResponse } from '@/lib/tests/sonnet-integration';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testName = searchParams.get('test');
  const useMock = searchParams.get('mock') === 'true';
  
  try {
    if (testName) {
      // Run specific test
      const testCase = testCases.find(tc => tc.name === testName);
      if (!testCase) {
        return NextResponse.json(
          { error: `Test case '${testName}' not found` },
          { status: 404 }
        );
      }
      
      if (useMock) {
        // Return mock response for development
        const mockResponse = createMockSonnetResponse(testCase);
        return NextResponse.json({
          test_name: testName,
          mock_mode: true,
          result: mockResponse,
          timestamp: new Date().toISOString()
        });
      }
      
      // Run actual test
      const result = await testRunner.runSingleTest(testCase);
      return NextResponse.json({
        test_name: testName,
        mock_mode: false,
        ...result,
        timestamp: new Date().toISOString()
      });
      
    } else {
      // List all available tests
      return NextResponse.json({
        available_tests: testCases.map(tc => ({
          name: tc.name,
          description: tc.description,
          test_url: `/api/test/sonnet-integration?test=${encodeURIComponent(tc.name)}`,
          mock_url: `/api/test/sonnet-integration?test=${encodeURIComponent(tc.name)}&mock=true`
        })),
        instructions: {
          run_specific_test: "GET /api/test/sonnet-integration?test=Test Name",
          run_with_mock: "GET /api/test/sonnet-integration?test=Test Name&mock=true",
          run_all_tests: "POST /api/test/sonnet-integration"
        }
      });
    }
    
  } catch (error) {
    console.error('[Test API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Test execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { runAll = false, useMock = false } = await request.json().catch(() => ({}));
  
  try {
    if (useMock) {
      // Return mock results for all tests
      const mockResults = testCases.map(testCase => ({
        testName: testCase.name,
        passed: true,
        mockResponse: createMockSonnetResponse(testCase),
        processingTime: Math.floor(Math.random() * 2000) + 500 // Mock processing time
      }));
      
      return NextResponse.json({
        mock_mode: true,
        totalTests: mockResults.length,
        passedTests: mockResults.length,
        failedTests: 0,
        results: mockResults,
        totalTime: mockResults.reduce((sum, r) => sum + r.processingTime, 0),
        timestamp: new Date().toISOString()
      });
    }
    
    // Run all tests
    console.log('[Test API] Running full Sonnet integration test suite...');
    const results = await testRunner.runAllTests();
    
    return NextResponse.json({
      mock_mode: false,
      ...results,
      timestamp: new Date().toISOString(),
      success_rate: results.totalTests > 0 ? ((results.passedTests / results.totalTests) * 100).toFixed(1) + '%' : '0%'
    });
    
  } catch (error) {
    console.error('[Test API] Full suite error:', error);
    return NextResponse.json(
      { 
        error: 'Test suite execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}