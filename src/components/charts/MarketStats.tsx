import React from 'react';
import { useData } from '../../context/DataContext';

type MarketStatsProps = {
  token: string;
};

// Memoized helper functions outside the component to avoid recreating on every render
const formatNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}k`;
  }
  return value.toFixed(2);
};

// Format percentage change
const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const MarketStats: React.FC<MarketStatsProps> = ({ token }) => {
  const { marketData, loading } = useData();
  
  // Show loading state if no data is available yet
  if (loading || !marketData[token]) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-sm text-gray-400">Loading market data...</div>
      </div>
    );
  }
  
  const data = marketData[token];
  
  return (
    <div className="h-full flex flex-col justify-around p-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Market Cap Rank:</span>
        <span className="text-sm font-medium">#{data?.market_cap_rank || '?'}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">24h High:</span>
        <span className="text-sm font-medium text-emerald-400">${data?.high_24h?.toLocaleString() || '?'}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">24h Low:</span>
        <span className="text-sm font-medium text-rose-400">${data?.low_24h?.toLocaleString() || '?'}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Market Cap:</span>
        <span className="text-sm font-medium">${formatNumber(data?.market_cap || 0)}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Circulating Supply:</span>
        <span className="text-sm font-medium">{formatNumber(data?.circulating_supply || 0)} {data?.symbol?.toUpperCase()}</span>
      </div>
      
      {data?.max_supply && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Max Supply:</span>
          <span className="text-sm font-medium">{formatNumber(data?.max_supply)} {data?.symbol?.toUpperCase()}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">All Time High:</span>
        <span className="text-sm font-medium">${data?.ath?.toLocaleString() || '?'} <span className="text-xs text-muted-foreground">({formatPercentage(data?.ath_change_percentage || 0)})</span></span>
      </div>
    </div>
  );
};
