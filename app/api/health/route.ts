import { NextResponse } from 'next/server';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected';
    ai: 'available' | 'unavailable';
    storage: 'ready' | 'error';
  };
  memory: {
    used: number;
    free: number;
    total: number;
  };
}

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Simulated service checks
    const healthData: HealthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected', // Future: actual DB check
        ai: process.env.ANTHROPIC_API_KEY ? 'available' : 'unavailable',
        storage: 'ready'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        free: Math.round((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    // Check if any service is down
    const hasUnhealthyService = Object.values(healthData.services).some(
      service => service === 'disconnected' || service === 'unavailable' || service === 'error'
    );

    if (hasUnhealthyService) {
      healthData.status = 'unhealthy';
    }

    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      ...healthData,
      responseTime: `${responseTime}ms`
    }, {
      status: healthData.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'ProCheff-v1'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check service error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'ProCheff-v1'
      }
    });
  }
}