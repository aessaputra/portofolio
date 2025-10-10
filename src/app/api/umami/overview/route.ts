import { NextRequest, NextResponse } from 'next/server';
import {
  safeParseUmamiAuthResponse,
  safeParseUmamiStats,
  safeParseUmamiActiveResponse,
  safeParseUmamiOverviewResponse,
  type UmamiOverviewResponse,
  type UmamiStats,
  type UmamiActiveResponse
} from '@/lib/umami-schema';

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
  const authResponse = safeParseUmamiAuthResponse(data, 'auth response');
  return authResponse.token;
}

// Get stats from Umami API
async function getUmamiStats(
  token: string,
  startAt: number,
  endAt: number
): Promise<UmamiStats> {
  validateEnvironment();

  const response = await fetch(
    `${UMAMI_BASE_URL}/api/websites/${UMAMI_WEBSITE_ID}/stats?startAt=${startAt}&endAt=${endAt}`,
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
    throw new Error(`Failed to get Umami stats: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return safeParseUmamiStats(data, 'stats response');
}

// Get active visitors from Umami API
async function getUmamiActiveVisitors(token: string): Promise<UmamiActiveResponse> {
  validateEnvironment();

  const response = await fetch(
    `${UMAMI_BASE_URL}/api/websites/${UMAMI_WEBSITE_ID}/active`,
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
    throw new Error(`Failed to get active visitors: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return safeParseUmamiActiveResponse(data, 'active visitors response');
}

export async function GET(request: NextRequest) {
  try {
    // Get start and end dates from query parameters
    const { searchParams } = new URL(request.url);
    const startAt = searchParams.get('startAt') 
      ? parseInt(searchParams.get('startAt') as string, 10)
      : Date.now() - 7 * 24 * 60 * 60 * 1000; // Default: 7 days ago
    const endAt = searchParams.get('endAt')
      ? parseInt(searchParams.get('endAt') as string, 10)
      : Date.now(); // Default: now

    // Validate date range
    if (isNaN(startAt) || isNaN(endAt) || startAt >= endAt) {
      return NextResponse.json(
        { error: 'Invalid date range provided' },
        { status: 400 }
      );
    }

    // Get token (cached or new)
    const token = await getCachedToken();

    // Get stats and active visitors in parallel
    const [stats, rawActiveData] = await Promise.all([
      getUmamiStats(token, startAt, endAt),
      getUmamiActiveVisitors(token),
    ]);

    // Map the raw Umami active response to our expected format
    const active = {
      visitors: rawActiveData.visitors
    };

    // Validate response structure using schema guards
    try {
      const responseData = safeParseUmamiOverviewResponse({
        stats,
        active,
        startAt,
        endAt,
      }, 'overview response');
      
      // Add cache headers for client-side caching (5 minutes)
      const response = NextResponse.json(responseData);
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate');
      
      return response;
    } catch (validationError) {
      // If validation fails, return a more detailed error message
      return NextResponse.json(
        {
          error: validationError instanceof Error ? validationError.message : 'Validation error',
          details: {
            stats,
            active,
            startAt,
            endAt,
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}