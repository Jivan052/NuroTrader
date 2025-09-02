import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

type PriceChartProps = {
  token: string;
  timeframe?: string;
};

type ChartDataPoint = {
  time: string;
  price: number;
};

// Format y-axis values
const formatYAxis = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value}`;
};

export const PriceChart: React.FC<PriceChartProps> = ({ token, timeframe = '24h' }) => {
  console.log(`Rendering price chart for ${token} with timeframe ${timeframe}`);
  const { priceData, loading } = useData();
  
  // Show loading state if no data is available
  if (loading || !priceData[token] || priceData[token].length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-6 border-2 border-primary/50 border-t-transparent rounded-full animate-spin mb-2"></div>
          <div className="text-xs sm:text-sm text-gray-400">Loading price data...</div>
        </div>
      </div>
    );
  }
  
  // Format data for chart - with performance optimizations
  // Only process as much data as needed for a smooth chart (max 30 points)
  const dataPoints = [...priceData[token]]; // Create a copy to avoid mutating the original
  
  // Sort by timestamp to ensure chronological order
  dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  
  // Sample data points for smoother rendering
  const step = dataPoints.length > 30 ? Math.floor(dataPoints.length / 30) : 1;
  
  const chartData = dataPoints
    .filter((_, index) => index % step === 0 || index === dataPoints.length - 1)
    .map(item => ({
      time: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      price: item.price
    }));
  
  // Determine font size and margin based on screen width
  // We'll use these variables to adjust chart appearance for mobile
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={chartData} 
        margin={{ 
          top: 5, 
          right: isMobileView ? 5 : 10, 
          left: isMobileView ? 5 : 10, 
          bottom: isMobileView ? 5 : 10 
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#999', fontSize: isMobileView ? 8 : 10 }} 
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          interval={isMobileView ? "preserveStartEnd" : 0}
          minTickGap={15}
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
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          wrapperStyle={{ zIndex: 10 }}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="hsl(var(--primary))" 
          strokeWidth={isMobileView ? 1.5 : 2}
          dot={false}
          activeDot={{ r: isMobileView ? 3 : 4, fill: 'hsl(var(--primary))' }}
          animationDuration={750}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
