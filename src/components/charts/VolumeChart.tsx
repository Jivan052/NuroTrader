import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

type VolumeChartProps = {
  token: string;
};

type ChartDataPoint = {
  day: string;
  volume: number;
};

// Memoized formatting function
const formatYAxis = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}B`;
  }
  return `$${value}M`;
};

export const VolumeChart: React.FC<VolumeChartProps> = ({ token }) => {
  const { volumeData, loading } = useData();
  
  // Show loading state if no data is available
  if (loading || !volumeData[token] || volumeData[token].length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-6 border-2 border-primary/50 border-t-transparent rounded-full animate-spin mb-2"></div>
          <div className="text-xs sm:text-sm text-gray-400">Loading volume data...</div>
        </div>
      </div>
    );
  }
  
  // Create a copy and sort by timestamp to ensure chronological order
  const allData = [...volumeData[token]].sort((a, b) => a.timestamp - b.timestamp);
  
  // Get the last 7 days of data for display
  const recentData = allData.slice(-7);
  
  const chartData = recentData.map((item, index) => {
    // Optimize date handling
    let day;
    if (index === recentData.length - 1) {
      day = 'Today';
    } else if (index === recentData.length - 2) {
      day = 'Yesterday';
    } else {
      // Use more efficient date formatting
      const date = new Date(item.timestamp);
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      day = weekdays[date.getDay()];
    }
    
    return {
      day,
      // Convert to millions for display
      volume: Math.round(item.volume / 1000000)
    };
  });
  
  // Determine if on mobile based on window width
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;
  
  // Adjust data for mobile view - fewer bars on small screens
  const displayData = isMobileView && chartData.length > 5 
    ? chartData.slice(-5) // Show only last 5 days on mobile
    : chartData;
    
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={displayData} 
        margin={{ 
          top: 5, 
          right: isMobileView ? 5 : 10, 
          left: isMobileView ? 0 : 10, 
          bottom: isMobileView ? 0 : 5 
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis 
          dataKey="day" 
          tick={{ fill: '#999', fontSize: isMobileView ? 9 : 10 }} 
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <YAxis 
          tick={{ fill: '#999', fontSize: isMobileView ? 8 : 10 }} 
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickFormatter={formatYAxis}
          width={isMobileView ? 35 : 45}
          tickCount={isMobileView ? 3 : 5}
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
          formatter={(value: number) => [`$${value}M`, 'Volume']}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Bar 
          dataKey="volume" 
          fill="hsl(var(--primary) / 0.7)"
          radius={[4, 4, 0, 0]}
          animationDuration={750}
          animationBegin={300}
          minPointSize={3}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
