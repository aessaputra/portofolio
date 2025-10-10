/**
 * Format seconds to a human-readable format (e.g., "2h 30m", "22m 15s", "45s")
 * @param seconds - Total seconds to format
 * @returns Formatted time string in a human-readable format
 */
export function toMMSS(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  let formattedTime = '';
  
  if (hours > 0) {
    formattedTime = `${hours}h`;
    if (minutes > 0) {
      formattedTime += ` ${minutes}m`;
    }
  } else if (minutes > 0) {
    formattedTime = `${minutes}m`;
    if (remainingSeconds > 0) {
      formattedTime += ` ${remainingSeconds}s`;
    }
  } else {
    formattedTime = `${remainingSeconds}s`;
  }
  
  return formattedTime.trim();
}

/**
 * Calculate percentage change between current and previous values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (positive for increase, negative for decrease)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  
  return ((current - previous) / Math.max(previous, 1)) * 100;
}

/**
 * Format a number with locale-specific formatting
 * @param value - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a percentage with locale-specific formatting
 * @param value - Percentage value (e.g., 25.5 for 25.5%)
 * @param locale - Locale string (default: 'en-US')
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, locale: string = 'en-US', decimals: number = 1): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Get trend indicator based on percentage change
 * @param percentageChange - Percentage change value
 * @returns Object with trend information
 */
export function getTrendIndicator(percentageChange: number) {
  const isPositive = percentageChange > 0;
  const isNeutral = percentageChange === 0;
  
  return {
    isPositive,
    isNeutral,
    icon: isPositive ? '▲' : isNeutral ? '●' : '▼',
    colorClass: isPositive ? 'text-green-500' : isNeutral ? 'text-gray-500' : 'text-red-500',
  };
}

/**
 * Calculate bounce rate from bounces and visits
 * @param bounces - Number of bounces
 * @param visits - Number of visits
 * @returns Bounce rate as percentage
 */
export function calculateBounceRate(bounces: number, visits: number): number {
  if (!visits || visits === 0) return 0;
  return (bounces / visits) * 100;
}

/**
 * Calculate average visit time from total time and visits
 * @param totalTime - Total time in seconds
 * @param visits - Number of visits
 * @returns Average visit time in seconds
 */
export function calculateAverageVisitTime(totalTime: number, visits: number): number {
  if (!visits || visits === 0) return 0;
  return totalTime / visits;
}
/**
 * Format visit duration as MM:SS or H:MM:SS (zero-padded)
 * @param seconds - Duration in seconds
 * @returns Formatted duration string, e.g., "02:33" or "1:02:33"
 */
export function formatVisitDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const pad2 = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad2(minutes)}:${pad2(secs)}`;
  }

  return `${pad2(minutes)}:${pad2(secs)}`;
}