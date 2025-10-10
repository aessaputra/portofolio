import { NextRequest, NextResponse } from 'next/server';

// Umami API configuration
const UMAMI_BASE_URL = process.env.NEXT_UMAMI_API_URL;
const UMAMI_USERNAME = process.env.NEXT_UMAMI_USERNAME;
const UMAMI_PASSWORD = process.env.NEXT_UMAMI_PASSWORD;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

// Token cache with in-memory storage (for production, consider Redis or similar)
let tokenCache: {
  token: string | null;
  expiresAt: number | null;
} = {
  token: null,
  expiresAt: null,
};

// Validate environment variables
function validateEnvironment() {
  if (!UMAMI_BASE_URL || !UMAMI_USERNAME || !UMAMI_PASSWORD || !UMAMI_WEBSITE_ID) {
    throw new Error('Missing required Umami environment variables');
  }
}

// Get cached token or fetch new one if expired
async function getCachedToken(): Promise<string> {
  // If we have a valid token, return it
  if (tokenCache.token && tokenCache.expiresAt && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  // Fetch new token
  const token = await loginToUmami();
  
  // Cache token with 1 hour expiration (adjust based on your Umami instance's token lifetime)
  tokenCache = {
    token,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  };

  return token;
}

// Login to Umami API and get token
async function loginToUmami(): Promise<string> {
  validateEnvironment();

  const response = await fetch(`${UMAMI_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: UMAMI_USERNAME,
      password: UMAMI_PASSWORD,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to login to Umami: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.token;
}

// Get metrics from Umami API
async function getUmamiMetrics(
  token: string,
  type: string,
  startAt: number,
  endAt: number,
  limit: number
): Promise<any> {
  validateEnvironment();

  const response = await fetch(
    `${UMAMI_BASE_URL}/api/websites/${UMAMI_WEBSITE_ID}/metrics?type=${type}&startAt=${startAt}&endAt=${endAt}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get Umami metrics: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'url'; // Default: url
    const startAt = searchParams.get('startAt') 
      ? parseInt(searchParams.get('startAt') as string, 10)
      : Date.now() - 7 * 24 * 60 * 60 * 1000; // Default: 7 days ago
    const endAt = searchParams.get('endAt')
      ? parseInt(searchParams.get('endAt') as string, 10)
      : Date.now(); // Default: now
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit') as string, 10)
      : 10; // Default: 10

    // Validate parameters
    if (isNaN(startAt) || isNaN(endAt) || startAt >= endAt) {
      return NextResponse.json(
        { error: 'Invalid date range provided' },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json(
        { error: 'Invalid limit provided' },
        { status: 400 }
      );
    }

    // Get token (cached or new)
    const token = await getCachedToken();

    // Get metrics
    const metrics = await getUmamiMetrics(token, type, startAt, endAt, limit);
    
    // Return the response as-is
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}