/**
 * Runtime schema validation helpers for Umami API responses
 * Provides minimal type guards to ensure data integrity
 */

// Type definitions for Umami API responses
export interface UmamiAuthResponse {
  token: string;
}

export interface UmamiStats {
  pageviews: { value: number; prev: number };
  visitors: { value: number; prev: number };
  visits: { value: number; prev: number };
  bounces: { value: number; prev: number };
  totaltime: { value: number; prev: number };
}

export interface UmamiActiveResponse {
  visitors: number;
}

export interface UmamiActive {
  visitors: number;
}

export interface UmamiOverviewResponse {
  stats: UmamiStats;
  active: UmamiActive;
  startAt: number;
  endAt: number;
}

export interface ActiveVisitorsResponse {
  visitors: number;
}

// Type guard functions for runtime validation
export function isUmamiAuthResponse(data: unknown): data is UmamiAuthResponse {
  return (
    typeof data === 'object' && 
    data !== null &&
    'token' in data &&
    typeof (data as UmamiAuthResponse).token === 'string'
  );
}

export function isUmamiStats(data: unknown): data is UmamiStats {
  if (typeof data !== 'object' || data === null) return false;
  
  const stats = data as UmamiStats;
  
  return (
    'pageviews' in stats &&
    'visitors' in stats &&
    'visits' in stats &&
    'bounces' in stats &&
    'totaltime' in stats &&
    typeof stats.pageviews === 'object' &&
    typeof stats.visitors === 'object' &&
    typeof stats.visits === 'object' &&
    typeof stats.bounces === 'object' &&
    typeof stats.totaltime === 'object' &&
    'value' in stats.pageviews &&
    'prev' in stats.pageviews &&
    'value' in stats.visitors &&
    'prev' in stats.visitors &&
    'value' in stats.visits &&
    'prev' in stats.visits &&
    'value' in stats.bounces &&
    'prev' in stats.bounces &&
    'value' in stats.totaltime &&
    'prev' in stats.totaltime &&
    typeof stats.pageviews.value === 'number' &&
    typeof stats.pageviews.prev === 'number' &&
    typeof stats.visitors.value === 'number' &&
    typeof stats.visitors.prev === 'number' &&
    typeof stats.visits.value === 'number' &&
    typeof stats.visits.prev === 'number' &&
    typeof stats.bounces.value === 'number' &&
    typeof stats.bounces.prev === 'number' &&
    typeof stats.totaltime.value === 'number' &&
    typeof stats.totaltime.prev === 'number'
  );
}

export function isUmamiActiveResponse(data: unknown): data is UmamiActiveResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'visitors' in data &&
    typeof (data as UmamiActiveResponse).visitors === 'number'
  );
}

export function isUmamiOverviewResponse(data: unknown): data is UmamiOverviewResponse {
  if (typeof data !== 'object' || data === null) return false;
  
  const response = data as UmamiOverviewResponse;
  
  return (
    'stats' in response &&
    'active' in response &&
    'startAt' in response &&
    'endAt' in response &&
    isUmamiStats(response.stats) &&
    isUmamiActive(response.active) &&
    typeof response.startAt === 'number' &&
    typeof response.endAt === 'number'
  );
}

export function isUmamiActive(data: unknown): data is UmamiActive {
  return (
    typeof data === 'object' &&
    data !== null &&
    'visitors' in data &&
    typeof (data as UmamiActive).visitors === 'number'
  );
}

export function isActiveVisitorsResponse(data: unknown): data is ActiveVisitorsResponse {
  return (
    typeof data === 'object' && 
    data !== null &&
    'visitors' in data &&
    typeof (data as ActiveVisitorsResponse).visitors === 'number'
  );
}

// Safe parsing function with error logging
export function safeParseUmamiAuthResponse(data: unknown, context: string = 'auth response'): UmamiAuthResponse {
  if (!isUmamiAuthResponse(data)) {
    throw new Error(`Invalid Umami ${context} structure`);
  }
  return data;
}

export function safeParseUmamiStats(data: unknown, context: string = 'stats'): UmamiStats {
  if (!isUmamiStats(data)) {
    throw new Error(`Invalid Umami ${context} structure`);
  }
  return data;
}

export function safeParseUmamiActiveResponse(data: unknown, context: string = 'active response'): UmamiActiveResponse {
  if (!isUmamiActiveResponse(data)) {
    throw new Error(`Invalid Umami ${context} structure`);
  }
  return data;
}

export function safeParseUmamiOverviewResponse(data: unknown, context: string = 'overview response'): UmamiOverviewResponse {
  if (!isUmamiOverviewResponse(data)) {
    throw new Error(`Invalid Umami ${context} structure`);
  }
  return data;
}

export function safeParseActiveVisitorsResponse(data: unknown, context: string = 'active visitors response'): ActiveVisitorsResponse {
  if (!isActiveVisitorsResponse(data)) {
    throw new Error(`Invalid Umami ${context} structure`);
  }
  return data;
}