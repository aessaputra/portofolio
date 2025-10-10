'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MetricData {
  x: string; // Name (country, device, browser)
  y: number; // Value
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface MiniDonutsProps {
  startAt?: number;
  endAt?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

// Function to limit data to top 8 and combine the rest into "Other"
const processChartData = (data: MetricData[]): ChartData[] => {
  if (!data || data.length === 0) return [];
  
  if (data.length <= 8) {
    return data.map((item, index) => ({
      name: item.x,
      value: item.y,
      color: COLORS[index % COLORS.length],
    }));
  }

  const top8 = data.slice(0, 8);
  const other = data.slice(8).reduce((sum, item) => sum + item.y, 0);

  return [
    ...top8.map((item, index) => ({
      name: item.x,
      value: item.y,
      color: COLORS[index],
    })),
    {
      name: 'Other',
      value: other,
      color: COLORS[8] || '#94A3B8',
    },
  ];
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md z-10">
        <p className="font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{payload[0].value} visitors</p>
      </div>
    );
  }
  return null;
};

const ChartLegend = ({ data }: { data: ChartData[] }) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 max-h-20 overflow-y-auto">
      {data.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center text-xs">
          <div 
            className="w-3 h-3 rounded-full mr-1.5 flex-shrink-0" 
            style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
          />
          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[80px]" title={entry.name}>
            {entry.name}
          </span>
        </div>
      ))}
    </div>
  );
};

const DonutChartCard = ({ 
  data, 
  title, 
  ariaLabel, 
  loading 
}: { 
  data: ChartData[]; 
  title: string; 
  ariaLabel: string;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm h-full flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-3"></div>
            <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm h-full flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
              aria-label={ariaLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend data={data} />
    </div>
  );
};

export default function MiniDonuts({ startAt, endAt }: MiniDonutsProps) {
  const [countries, setCountries] = useState<ChartData[]>([]);
  const [devices, setDevices] = useState<ChartData[]>([]);
  const [browsers, setBrowsers] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const baseParams = {
          startAt: startAt?.toString() || '',
          endAt: endAt?.toString() || '',
        };
        
        // Fetch data for all three types in parallel
        const [countriesData, devicesData, browsersData] = await Promise.all([
          fetch(`/api/umami/metrics?type=country&limit=10&${new URLSearchParams(baseParams).toString()}`),
          fetch(`/api/umami/metrics?type=device&limit=10&${new URLSearchParams(baseParams).toString()}`),
          fetch(`/api/umami/metrics?type=browser&limit=10&${new URLSearchParams(baseParams).toString()}`),
        ]);
        
        if (!countriesData.ok || !devicesData.ok || !browsersData.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const countriesJson = await countriesData.json();
        const devicesJson = await devicesData.json();
        const browsersJson = await browsersData.json();
        
        setCountries(processChartData(countriesJson || []));
        setDevices(processChartData(devicesJson || []));
        setBrowsers(processChartData(browsersJson || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startAt, endAt]);

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-red-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500 font-medium">Error loading data</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <DonutChartCard 
        data={countries} 
        title="Countries" 
        ariaLabel="Visitors by country" 
        loading={loading}
      />
      <DonutChartCard 
        data={devices} 
        title="Devices" 
        ariaLabel="Visitors by device type" 
        loading={loading}
      />
      <DonutChartCard 
        data={browsers} 
        title="Browsers" 
        ariaLabel="Visitors by browser" 
        loading={loading}
      />
    </div>
  );
}