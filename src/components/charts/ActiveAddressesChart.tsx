import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

type ActiveAddressesChartProps = {
  network: string;
  timeframe?: string;
};

const formatYAxis = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value;
};

export const ActiveAddressesChart: React.FC<ActiveAddressesChartProps> = ({ 
  network, 
  timeframe = '30d' 
}) => {
  const { addressData, loading } = useData();
  
  // Detect if we're on mobile
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;
  
  // Show loading state if no data is available
  if (loading || !addressData[network] || addressData[network].length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-6 border-2 border-primary/50 border-t-transparent rounded-full animate-spin mb-2"></div>
          <div className="text-xs sm:text-sm text-gray-400">Loading active addresses data...</div>
        </div>
      </div>
    );
  }
  
  // Filter data based on timeframe
  const msPerDay = 86400000;
  const now = Date.now();
  let filteredData = [...addressData[network]];
  
  if (timeframe === '7d') {
    filteredData = filteredData.filter(d => now - d.timestamp < 7 * msPerDay);
  } else if (timeframe === '30d') {
    filteredData = filteredData.filter(d => now - d.timestamp < 30 * msPerDay);
  }
  
  // Sort data chronologically
  filteredData.sort((a, b) => a.timestamp - b.timestamp);
  
  // For mobile, sample data to avoid overcrowding
  let sampledData = filteredData;
  if (isMobileView && filteredData.length > 15) {
    const step = Math.ceil(filteredData.length / 15);
    sampledData = filteredData.filter((_, i) => i % step === 0 || i === filteredData.length - 1);
  }
  
  // Format data for chart
  const chartData = sampledData.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    }),
    active: item.activeAddresses,
    new: item.newAddresses
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: 5,
          right: isMobileView ? 5 : 10,
          left: isMobileView ? 0 : 10,
          bottom: isMobileView ? 0 : 5
        }}
      >
        <defs>
          <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--secondary, 280 91% 56%))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--secondary, 280 91% 56%))" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#999', fontSize: isMobileView ? 8 : 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          interval={isMobileView ? "preserveStartEnd" : 0}
          minTickGap={isMobileView ? 30 : 20}
        />
        <YAxis
          tick={{ fill: '#999', fontSize: isMobileView ? 8 : 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickFormatter={formatYAxis}
          width={isMobileView ? 35 : 45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            fontSize: isMobileView ? '11px' : '13px',
            padding: isMobileView ? '4px 6px' : '8px 10px',
            borderRadius: '4px'
          }}
          labelStyle={{ color: '#bbb', fontSize: isMobileView ? '10px' : '12px' }}
          formatter={(value: number, name: string) => [
            value.toLocaleString(), 
            name === 'active' ? 'Active Addresses' : 'New Addresses'
          ]}
        />
        <Area
          type="monotone"
          dataKey="active"
          name="Active"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorActive)"
          strokeWidth={1.5}
          activeDot={{ r: 4, strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="new"
          name="New"
          stroke="hsl(var(--secondary, 280 91% 56%))"
          fillOpacity={1}
          fill="url(#colorNew)"
          strokeWidth={1.5}
          activeDot={{ r: 4, strokeWidth: 1 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ActiveAddressesChart;
