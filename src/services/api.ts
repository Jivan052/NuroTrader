/**
 * API Service for NeuroTrader
 * This file contains functions to interact with various third-party APIs
 */

// Types for API responses
export type GraphQLResponse<T> = {
  data: T;
  errors?: Array<{ message: string }>;
};

export type TokenData = {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  txCount: string;
  totalLiquidity: string;
  volumeUSD: string;
  priceUSD: string;
  pools: Array<{
    id: string;
    token0: { symbol: string };
    token1: { symbol: string };
    volumeUSD: string;
  }>;
};

export type TokenDayData = {
  date: number;
  priceUSD: string;
  volumeUSD: string;
  txCount: string;
};

export type TheGraphResponse = {
  token: TokenData;
  tokenDayDatas: TokenDayData[];
};

export type SantimentTimeseriesData = {
  datetime: string;
  value: number;
};

export type SantimentResponse = {
  getMetric: Array<{
    timeseriesData: SantimentTimeseriesData[];
  }>;
};

export type TheTieResponse = {
  score: number;
  socialScore: number;
  positiveFactors: string[];
  negativeFactors: string[];
  twitterScore: number;
  redditScore: number;
};

export type StockGeistResponse = {
  sentimentScore: number;
  newsScore: number;
  positiveTopics: string[];
  negativeTopics: string[];
};

/**
 * Fetch token data from The Graph API
 * @param tokenAddress The token address or symbol to query
 * @param timeframe The timeframe for historical data (e.g. '1d', '7d', '30d')
 */
export const fetchTokenDataFromGraph = async (
  tokenAddress: string,
  timeframe: string = '30d'
): Promise<TheGraphResponse | null> => {
  try {
    const graphEndpoint = import.meta.env.VITE_THE_GRAPH_API_ENDPOINT;
    if (!graphEndpoint) {
      console.error('The Graph API endpoint not configured');
      return null;
    }
    
    // Calculate days based on timeframe
    const days = timeframe === '1h' ? 1 : 
                timeframe === '24h' ? 1 : 
                timeframe === '7d' ? 7 : 30;
                
    // Create timestamp for query
    const fromTimestamp = Math.floor(Date.now() / 1000) - (days * 86400);
    
    const query = `{
      token(id: "${tokenAddress.toLowerCase()}") {
        id
        name
        symbol
        totalSupply
        txCount
        totalLiquidity
        volumeUSD
        priceUSD
        pools(first: 5, orderBy: volumeUSD, orderDirection: desc) {
          id
          token0 { symbol }
          token1 { symbol }
          volumeUSD
        }
      }
      tokenDayDatas(first: ${days}, orderBy: date, orderDirection: desc, where: { token: "${tokenAddress.toLowerCase()}" }) {
        date
        priceUSD
        volumeUSD
        txCount
      }
    }`;
    
    const response = await fetch(graphEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json() as GraphQLResponse<TheGraphResponse>;
    
    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0].message}`);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching data from The Graph:', error);
    return null;
  }
};

/**
 * Fetch on-chain metrics from Santiment API
 * @param token The token symbol to query
 * @param timeframe The timeframe for historical data
 */
export const fetchSantimentData = async (
  token: string,
  timeframe: string = '30d'
): Promise<SantimentResponse | null> => {
  try {
    const santimentApiKey = import.meta.env.VITE_SANTIMENT_API_KEY;
    const santimentEndpoint = 'https://api.santiment.net/graphql';
    
    if (!santimentApiKey) {
      console.error('Santiment API key not configured');
      return null;
    }
    
    // Calculate days based on timeframe
    const days = timeframe === '1h' ? 1 : 
                timeframe === '24h' ? 1 : 
                timeframe === '7d' ? 7 : 30;
    
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];
    
    const query = `{
      getMetric(metric: "dev_activity") {
        timeseriesData(
          slug: "${token}"
          from: "${fromDate}"
          to: "${toDate}"
          interval: "1d"
        ) {
          datetime
          value
        }
      }
      getMetric(metric: "daily_active_addresses") {
        timeseriesData(
          slug: "${token}"
          from: "${fromDate}"
          to: "${toDate}"
          interval: "1d"
        ) {
          datetime
          value
        }
      }
    }`;
    
    const response = await fetch(santimentEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${santimentApiKey}`
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json() as GraphQLResponse<SantimentResponse>;
    
    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0].message}`);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching data from Santiment:', error);
    return null;
  }
};

/**
 * Fetch sentiment data from The Tie API
 * @param token The token symbol to query
 */
export const fetchTheTieData = async (token: string): Promise<TheTieResponse | null> => {
  try {
    const tieMockApiKey = import.meta.env.VITE_THE_TIE_API_KEY;
    
    if (!tieMockApiKey) {
      console.error('The Tie API key not configured');
      return null;
    }
    
    const response = await fetch(`https://api.thetie.io/sentiment/${token}`, {
      headers: {
        'Authorization': `Bearer ${tieMockApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json() as TheTieResponse;
  } catch (error) {
    console.error('Error fetching data from The Tie:', error);
    return null;
  }
};

/**
 * Fetch sentiment data from StockGeist.ai API
 * @param token The token symbol to query
 */
export const fetchStockGeistData = async (token: string): Promise<StockGeistResponse | null> => {
  try {
    const stockgeistApiKey = import.meta.env.VITE_STOCKGEIST_API_KEY;
    
    if (!stockgeistApiKey) {
      console.error('StockGeist API key not configured');
      return null;
    }
    
    const response = await fetch(`https://api.stockgeist.ai/sentiment/crypto/${token}`, {
      headers: {
        'X-API-KEY': stockgeistApiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json() as StockGeistResponse;
  } catch (error) {
    console.error('Error fetching data from StockGeist:', error);
    return null;
  }
};

/**
 * Generate AI insights using Google's Gemini API
 * @param chainData On-chain data for analysis
 * @param sentimentData Sentiment data for analysis
 * @param token The token being analyzed
 */
export type AIInsightRequest = {
  token: string;
  chainData: {
    price: number;
    priceChange24h: number;
    volume24h: number;
    volumeChange24h: number;
    activeAddresses: number;
    activeAddressesChange24h: number;
  };
  sentimentData: {
    overall: number;
    social: number;
    news: number;
    positiveTopics: string[];
    negativeTopics: string[];
  };
  timeframe: string;
};

export type AIInsightResponse = {
  conclusion: string;
  bullishFactors: string[];
  bearishFactors: string[];
  recommendation: string;
  confidence: number;
  generatedAt: number;
};

export const generateAIInsights = async (
  data: AIInsightRequest
): Promise<AIInsightResponse | null> => {
  try {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      return null;
    }

    const geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // Create a prompt that includes all the relevant data
    const prompt = `
    You are NeuroTrader, an expert cryptocurrency analyst AI. 
    
    Analyze the following data for ${data.token} and provide trading insights:
    
    On-Chain Data:
    - Current Price: $${data.chainData.price}
    - 24h Price Change: ${data.chainData.priceChange24h.toFixed(2)}%
    - 24h Volume: $${(data.chainData.volume24h / 1000000).toFixed(2)}M
    - Volume Change: ${data.chainData.volumeChange24h.toFixed(2)}%
    - Active Addresses: ${data.chainData.activeAddresses}
    - Active Address Change: ${data.chainData.activeAddressesChange24h.toFixed(2)}%
    
    Sentiment Analysis:
    - Overall Sentiment Score: ${data.sentimentData.overall.toFixed(2)} (-100 to 100 scale)
    - Social Media Sentiment: ${data.sentimentData.social.toFixed(2)}
    - News Sentiment: ${data.sentimentData.news.toFixed(2)}
    - Positive Topics: ${data.sentimentData.positiveTopics.join(', ')}
    - Negative Topics: ${data.sentimentData.negativeTopics.join(', ')}
    
    Timeframe: ${data.timeframe}
    
    Provide a JSON response with the following structure:
    {
      "conclusion": "A concise 1-2 sentence analysis of the token's current state",
      "bullishFactors": ["List of 2-4 bullish factors, each as a brief phrase"],
      "bearishFactors": ["List of 1-3 bearish factors or risks, each as a brief phrase"],
      "recommendation": "A clear trading recommendation in 1-2 sentences",
      "confidence": 75 // A number between 0-100 indicating your confidence in this analysis
    }
    
    Make your analysis thoughtful, data-driven, and specific to ${data.token}'s unique situation.
    `;
    
    const response = await fetch(`${geminiEndpoint}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    const generatedText = result.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedText) {
      throw new Error('No text generated by Gemini');
    }
    
    // Extract the JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }
    
    const insights = JSON.parse(jsonMatch[0]);
    
    return {
      ...insights,
      generatedAt: Date.now()
    };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return null;
  }
};

/**
 * Helper function to calculate percentage change
 * @param previous Previous value
 * @param current Current value
 */
export const calculatePercentChange = (previous: number | string, current: number | string): number => {
  const prev = typeof previous === 'string' ? parseFloat(previous) : previous;
  const curr = typeof current === 'string' ? parseFloat(current) : current;
  
  if (prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
};
