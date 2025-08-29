import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

type PriceChartProps = {
  token: string;
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

export const PriceChart: React.FC<PriceChartProps> = ({ token }) => {
  const { priceData, loading } = useData();
  
  // Show loading state if no data is available
  if (loading || !priceData[token] || priceData[token].length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-sm text-gray-400">Loading price data...</div>
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
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#999', fontSize: 10 }} 
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <YAxis 
          tick={{ fill: '#999', fontSize: 10 }} 
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickFormatter={formatYAxis}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            borderColor: 'rgba(255,255,255,0.2)',
            color: '#fff'
          }}
          labelStyle={{ color: '#bbb' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
