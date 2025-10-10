# Umami Analytics Dashboard Overview

This implementation provides an Overview Cards (KPI section) for the admin dashboard that retrieves data from Umami self-hosted analytics.

## Features

- **4 KPI Cards**: Visitors, Pageviews, Bounce Rate, and Average Visit Time
- **Real-time Card**: Active Now with 10-second polling
- **Responsive Layout**: 4-column grid on desktop, 2-column on tablet/medium
- **Secure Data Fetching**: All requests go through server-side route handlers
- **Delta Indicators**: Shows percentage change vs previous period
- **Loading & Error States**: Skeleton loading and error handling

## Implementation Details

### Files Created

1. **Route Handler**: `src/app/api/umami/overview/route.ts`
   - Handles authentication with Umami API
   - Fetches stats and active visitors data
   - Returns combined JSON response

2. **Utility Functions**: `src/lib/umami-utils.ts`
   - `toMMSS(seconds)`: Formats seconds to MM:SS
   - `calculatePercentageChange(current, previous)`: Calculates percentage change
   - `formatNumber(value)`: Formats numbers with locale
   - `formatPercentage(value)`: Formats percentages
   - `getTrendIndicator(percentageChange)`: Returns trend information
   - `calculateBounceRate(bounces, visits)`: Calculates bounce rate
   - `calculateAverageVisitTime(totalTime, visits)`: Calculates average visit time

3. **Server Component**: `src/app/(admin)/dashboard/Overview.tsx`
   - Main dashboard component
   - Fetches data from the route handler
   - Renders KPI cards with calculated metrics
   - Includes loading and error states

4. **Client Component**: `src/app/(admin)/dashboard/ActiveNow.tsx`
   - Real-time active visitors counter
   - Polls the API every 10 seconds
   - Shows pulsing green indicator for live status

5. **Validation Script**: `scripts/validate-umami-utils.js`
   - Tests all utility functions
   - Validates calculations with mock data

### Environment Variables

Add these to your `.env` file:

```
# Umami Analytics Configuration
NEXT_UMAMI_API_URL=https://your-umami-instance.com
NEXT_UMAMI_USERNAME=admin
NEXT_UMAMI_PASSWORD=your-password
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
```

## Usage

1. Import the Overview component in your admin dashboard:

```tsx
import Overview from '@/app/(admin)/dashboard/Overview';

// In your dashboard component
<Overview startAt={startDate} endAt={endDate} />
```

2. The component accepts optional `startAt` and `endAt` parameters (epoch milliseconds) to specify the date range for the stats.

## Data Flow

1. Client component requests data from `/api/umami/overview`
2. Server route handler authenticates with Umami API using cached token
3. Handler fetches stats and active visitors in parallel
4. Handler returns combined response to client with cache headers
5. Overview component processes and displays the data
6. ActiveNow component polls `/api/umami/active` every 10 seconds for real-time updates
7. ActiveNow component pauses polling when tab is not visible and implements exponential backoff on errors

## Security

- All Umami API credentials are stored in environment variables
- Authentication happens server-side only with token caching (1 hour TTL)
- No tokens or credentials are exposed to the client
- All requests to Umami go through the server route handler
- Environment variables are validated at startup

## Styling

- Uses Tailwind CSS classes
- Responsive grid layout
- Color-coded metrics:
  - Visitors: Blue
  - Pageviews: Green
  - Bounce Rate: Yellow
  - Average Visit Time: Purple
  - Active Now: Green with pulsing indicator

## Testing

Run the validation script to test utility functions:

```bash
node scripts/validate-umami-utils.js
```

## Future Enhancements

- Add trend charts for each metric
- Implement date range picker
- Add more detailed analytics pages
- Include export functionality
- Add comparison with custom periods