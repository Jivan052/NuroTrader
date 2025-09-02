import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CoinGeckoMarketData,
  PriceChartData,
  VolumeChartData
} from '../services/coingecko';
import { 
  SentimentData
} from '../services/santiment';
import {
  AIInsightResponse
} from '../services/gemini';
import { fetchTokenData, clearCache } from '../services/api-integration';

interface DataContextType {
  marketData: Record<string, CoinGeckoMarketData | null>;
  priceData: Record<string, PriceChartData[]>;
  volumeData: Record<string, VolumeChartData[]>;
  sentimentData: Record<string, SentimentData | null>;
  aiInsights: Record<string, AIInsightResponse | null>;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const defaultContextValue: DataContextType = {
  marketData: {},
  priceData: {},
  volumeData: {},
  sentimentData: {},
  aiInsights: {},
  loading: true,
  error: null,
  refreshData: async () => {}, // This will be replaced with the actual implementation
};

const DataContext = createContext<DataContextType>(defaultContextValue);

export const useData = () => useContext(DataContext);

interface DataProviderProps {
  children: ReactNode;
}

// We no longer need this function as we're using the integrated API service

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const tokens = ['BTC', 'ETH', 'SOL', 'AVAX', 'GLMR', 'FTM'];
  
  // Create the fetch data function
  const fetchAllData = async () => {
    try {
      // Set loading state
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Initialize state collections
      const marketData: Record<string, CoinGeckoMarketData | null> = {};
      const priceData: Record<string, PriceChartData[]> = {};
      const volumeData: Record<string, VolumeChartData[]> = {};
      const sentimentData: Record<string, SentimentData | null> = {};
      const aiInsights: Record<string, AIInsightResponse | null> = {};
      
      // Clear any cached data first
      clearCache();
      
      // Fetch data for all tokens in parallel for better performance
      const tokenPromises = tokens.map(async (token) => {
        try {
          // Use our new integrated API service
          console.log(`Fetching integrated data for ${token}...`);
          const timeframe = '24h'; // Default timeframe
          const tokenData = await fetchTokenData(token, timeframe);
          
          // Store the results
          marketData[token] = tokenData.marketData;
          
          if (tokenData.priceHistory) {
            priceData[token] = tokenData.priceHistory;
          }
          
          if (tokenData.volumeHistory) {
            volumeData[token] = tokenData.volumeHistory;
          }
          
          if (tokenData.sentimentData) {
            sentimentData[token] = tokenData.sentimentData;
          }
          
          if (tokenData.aiInsights) {
            aiInsights[token] = tokenData.aiInsights;
          }
          
          return { token, success: true };
        } catch (error) {
          console.error(`Error processing data for ${token}:`, error);
          return { token, success: false, error };
        }
      });
      
      // Wait for all token data to be fetched
      const results = await Promise.all(tokenPromises);
      console.log(`Data fetching completed for ${results.filter(r => r.success).length}/${tokens.length} tokens`);

      // Update state with all fetched data
      setState({
        marketData,
        priceData,
        volumeData,
        sentimentData,
        aiInsights,
        loading: false,
        error: null,
        refreshData: fetchAllData, // Include the refresh function in state
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch data. Please try again later.',
      }));
    }
  };
  
  // Initialize state with the refresh function
  const [state, setState] = useState<DataContextType>({
    ...defaultContextValue,
    refreshData: fetchAllData,
  });

  // Fetch data on initial load
  useEffect(() => {
    fetchAllData();
  }, []);

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
};
