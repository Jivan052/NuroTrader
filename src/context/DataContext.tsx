import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  fetchTokenCompleteData,
  fetchTokenMarketData,
  CoinGeckoMarketData,
  PriceChartData,
  VolumeChartData
} from '../services/coingecko';
import { 
  generateAIInsights,
  AIInsightResponse,
  SentimentData
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

// Generate mock sentiment data for a token
const generateMockSentimentData = async (token: string): Promise<{ sentimentData: SentimentData }> => {
  // Use token to create deterministic but varying sentiment
  const symbolHash = token.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomSeed = symbolHash / 100;
  const day = new Date().getDate();
  
  // Base sentiment on day of month for some variation
  const sentimentBase = ((day % 7) - 3) * 10;
  const overall = Math.max(-80, Math.min(80, sentimentBase + randomSeed));
  
  // Social sentiment is more volatile than overall
  const social = Math.max(-90, Math.min(90, overall + ((day % 10) - 5) * 3));
  
  // News sentiment is more stable
  const news = Math.max(-70, Math.min(70, overall + ((day % 5) - 2) * 2));
  
  // Generate realistic topics
  const positivePool = [
    'Growing adoption',
    'Technical strength',
    'Increasing volume',
    'Institutional interest',
    'New partnerships',
    'Development activity',
    'Network growth',
    'Positive media coverage',
    'Market leadership',
    'Strong fundamentals'
  ];
  
  const negativePool = [
    'Market uncertainty',
    'Selling pressure',
    'Regulatory concerns',
    'Competition risks',
    'Technical resistance',
    'Profit taking',
    'Reduced volume',
    'Development delays',
    'Security concerns',
    'Valuation concerns'
  ];
  
  // Select more positive or negative topics based on sentiment
  const positiveCount = Math.max(2, Math.min(5, Math.floor(3 + (overall / 20))));
  const negativeCount = Math.max(2, Math.min(5, Math.floor(3 - (overall / 20))));
  
  // Shuffle arrays using Fisher-Yates algorithm with seed
  const shuffle = (array: string[], seed: number) => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor((i + 1) * ((seed * (i + 3)) % 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  
  const positiveTopics = shuffle(positivePool, randomSeed).slice(0, positiveCount);
  const negativeTopics = shuffle(negativePool, randomSeed + 0.1).slice(0, negativeCount);

  return {
    sentimentData: {
      overall,
      social,
      news,
      positiveTopics,
      negativeTopics
    }
  };
};

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
            
            // 3. Generate mock sentiment data
            (async () => {
              console.log(`Generating sentiment data for ${token}...`);
              return await generateMockSentimentData(token);
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
