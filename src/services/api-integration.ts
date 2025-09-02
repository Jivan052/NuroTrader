/**
 * API Integration Service for NeuroTrader
 * This service connects the UI with both CoinGecko and Santiment API services
 */

import { fetchTokenMarketData, fetchTokenHistoricalData } from './coingecko';
import { fetchSantimentCompleteData } from './santiment';
import { generateAIInsights } from './gemini';
import { useEffect, useState } from 'react';

// Configuration for API endpoints
const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';
const SANTIMENT_API_BASE_URL = 'https://api.santiment.net';

// Cache mechanism to avoid excessive API calls
const dataCache: Record<string, {
  timestamp: number;
  data: any;
}> = {};

// Cache expiration in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000; 

/**
 * Check if data in cache is still valid
 */
const isCacheValid = (cacheKey: string): boolean => {
  if (!dataCache[cacheKey]) return false;
  
  const now = Date.now();
  return (now - dataCache[cacheKey].timestamp) < CACHE_EXPIRATION;
};

/**
 * Integrated function to fetch complete market data for a token
 * Combines data from both CoinGecko and Santiment
 */
export const fetchTokenData = async (symbol: string, timeframe: string) => {
  const cacheKey = `${symbol}-${timeframe}`;
  
  // Check cache first
  if (isCacheValid(cacheKey)) {
    console.log(`Using cached data for ${symbol} with timeframe ${timeframe}`);
    return dataCache[cacheKey].data;
  }
  
  try {
    // Fetch data from both APIs in parallel
    const [marketData, santimentData] = await Promise.all([
      fetchTokenMarketData(symbol),
      fetchSantimentCompleteData(symbol, timeframe)
    ]);
    
    // Process historical data based on timeframe
    const timeframeDays = 
      timeframe === '1h' ? '1' :
      timeframe === '24h' ? '1' :
      timeframe === '7d' ? '7' : 
      timeframe === '30d' ? '30' : '30';
      
    const historicalData = await fetchTokenHistoricalData(symbol, timeframeDays);
    
    // Generate AI insights using combined data
    let aiInsights = null;
    
    if (santimentData && marketData) {
      try {
        console.log(`Generating AI insights for ${symbol}...`);
        aiInsights = await generateAIInsights(
          marketData,
          santimentData.sentimentData,
          symbol
        );
        console.log(`AI insights generated for ${symbol}:`, aiInsights ? 'Success' : 'Failed');
      } catch (error) {
        console.error(`Error generating AI insights for ${symbol}:`, error);
      }
    }
    
    // Combine all data
    const combinedData = {
      marketData,
      priceHistory: historicalData.prices,
      volumeHistory: historicalData.volumes,
      sentimentData: santimentData?.sentimentData || null,
      chainData: santimentData?.chainData || null,
      aiInsights
    };
    
    // Update cache
    dataCache[cacheKey] = {
      timestamp: Date.now(),
      data: combinedData
    };
    
    return combinedData;
  } catch (error) {
    console.error(`Error fetching combined data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * React hook to fetch token data with loading state
 */
export const useTokenData = (symbol: string, timeframe: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchTokenData(symbol, timeframe);
        setData(result);
      } catch (err) {
        console.error(`Error in useTokenData for ${symbol}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [symbol, timeframe]);
  
  return { data, loading, error };
};

/**
 * Clear all cached data
 */
export const clearCache = () => {
  Object.keys(dataCache).forEach(key => {
    delete dataCache[key];
  });
};

/**
 * Get API configuration for frontend display
 */
export const getApiConfig = () => {
  return {
    coingeckoApiUrl: COINGECKO_API_BASE_URL,
    santimentApiUrl: SANTIMENT_API_BASE_URL,
    hasCoinGeckoApiKey: !!import.meta.env.VITE_COINGECKO_API_KEY,
    hasSantimentApiKey: !!import.meta.env.VITE_SANTIMENT_API_KEY,
  };
};
