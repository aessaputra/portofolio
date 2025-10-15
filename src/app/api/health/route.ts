import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/client';

async function checkDatabase(): Promise<boolean> {
  try {
    return await testConnection();
  } catch (error) {
    return false;
  }
}

// Main health check function
export async function GET(request: NextRequest) {
  try {
    // Check if database is connected
    const databaseOk = await checkDatabase();

    if (databaseOk) {
      return new NextResponse('OK', { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } else {
      return new NextResponse('ERROR', { 
        status: 503,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

  } catch (error) {
    console.error('Health check failed:', error);
    
    return new NextResponse('ERROR', { 
      status: 503,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

export async function HEAD(request: NextRequest) {
  try {
    const databaseOk = await checkDatabase();
    
    return new NextResponse(null, {
      status: databaseOk ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
