import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  fetchSantimentCompleteData,
  SentimentData
} from '../services/santiment';
import { 
  fetchTokenCompleteData,
  fetchTokenMarketData,
  CoinGeckoMarketData,
  PriceChartData,
  VolumeChartData
} from '../services/coingecko';
import { 
  fetchAiInsights,
  generateAIInsights,
  AIInsightResponse
} from '../services/gemini';

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
      
      // Fetch data for all tokens in parallel for better performance
      const tokenPromises = tokens.map(async (token) => {
        try {
          // Use Promise.all to fetch CoinGecko and Santiment data in parallel
          const [marketDataResult, historicalData, santimentData] = await Promise.all([
            // 1. Fetch CoinGecko market data
            (async () => {
              console.log(`Fetching CoinGecko data for ${token}...`);
              return await fetchTokenMarketData(token);
            })(),
            
            // 2. Fetch CoinGecko historical price and volume data
            (async () => {
              console.log(`Fetching CoinGecko historical data for ${token}...`);
              return await fetchTokenCompleteData(token, 30);
            })(),
            
            // 3. Fetch Santiment sentiment data
            (async () => {
              console.log(`Fetching Santiment sentiment data for ${token}...`);
              return await fetchSantimentCompleteData(token, '24h');
            })()
          ]);
          
          // Store the results
          marketData[token] = marketDataResult;
          
          if (historicalData) {
            priceData[token] = historicalData.historicalData.prices;
            volumeData[token] = historicalData.historicalData.volumes;
          }
          
          if (santimentData) {
            sentimentData[token] = santimentData.sentimentData;
            
            // 4. Generate AI insights using both data sources
            if (marketDataResult && santimentData.sentimentData) {
              console.log(`Generating AI insights for ${token}...`);
              const insightResult = await generateAIInsights(
                marketDataResult,
                santimentData.sentimentData,
                token
              );
              
              aiInsights[token] = insightResult;
            }
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
