/**
 * CoinGecko API Service for NeuroTrader
 * This service handles all cryptocurrency price and market data
 */

// Types for API responses
export type CoinGeckoMarketData = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
};

export type CoinGeckoHistoricalData = {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][]; // [timestamp, market_cap]
  total_volumes: [number, number][]; // [timestamp, volume]
};

export type PriceChartData = {
  timestamp: number;
  date: string;
  price: number;
};

export type VolumeChartData = {
  timestamp: number;
  date: string;
  volume: number;
};

/**
 * Get CoinGecko API ID from token symbol
 */
const getTokenId = (symbol: string): string => {
  const tokenMap: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'AVAX': 'avalanche-2',
    'GLMR': 'moonbeam',
    'FTM': 'fantom',
    'UNI': 'uniswap',
    'MATIC': 'polygon',
    'DOT': 'polkadot',
    'ADA': 'cardano',
    'XRP': 'ripple',
    'LINK': 'chainlink',
    'DOGE': 'dogecoin'
  };
  
  return tokenMap[symbol] || symbol.toLowerCase();
};

/**
 * Fetch current market data for a specific token
 * @param symbol Token symbol (e.g., BTC, ETH)
 * @returns Promise with current market data
 */
export const fetchTokenMarketData = async (symbol: string): Promise<CoinGeckoMarketData | null> => {
  try {
    const tokenId = getTokenId(symbol);
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenId}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as CoinGeckoMarketData[];
    if (!data || data.length === 0) {
      console.error(`No data found for token ${symbol}`);
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch historical price and volume data for a token
 * @param symbol Token symbol (e.g., BTC, ETH)
 * @param days Number of days of historical data to fetch (1, 7, 14, 30, 90, 180, 365, max)
 * @returns Promise with historical price and volume data
 */
export const fetchTokenHistoricalData = async (
  symbol: string,
  days: string | number = '30'
): Promise<{ prices: PriceChartData[], volumes: VolumeChartData[] } | null> => {
  try {
    const tokenId = getTokenId(symbol);
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as CoinGeckoHistoricalData;
    
    if (!data || !data.prices || !data.total_volumes) {
      console.error(`No historical data found for token ${symbol}`);
      return null;
    }
    
    // Format price data for charts
    const prices = data.prices.map(([timestamp, price]) => ({
      timestamp,
      date: new Date(timestamp).toISOString().split('T')[0],
      price
    }));
    
    // Format volume data for charts
    const volumes = data.total_volumes.map(([timestamp, volume]) => ({
      timestamp,
      date: new Date(timestamp).toISOString().split('T')[0],
      volume
    }));
    
    return { prices, volumes };
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch all required token data (current market data and historical data)
 * @param symbol Token symbol (e.g., BTC, ETH)
 * @param days Number of days of historical data
 * @returns Promise with combined market and historical data
 */
export const fetchTokenCompleteData = async (
  symbol: string,
  days: string | number = '30'
) => {
  try {
    // Fetch data in parallel for better performance
    const [marketData, historicalData] = await Promise.all([
      fetchTokenMarketData(symbol),
      fetchTokenHistoricalData(symbol, days)
    ]);
    
    if (!marketData || !historicalData) {
      throw new Error(`Failed to fetch complete data for ${symbol}`);
    }
    
    return {
      marketData,
      historicalData
    };
  } catch (error) {
    console.error(`Error fetching complete data for ${symbol}:`, error);
    return null;
  }
};

/**
 * Format percent change for display
 * @param value Percent change value
 * @returns Formatted string with + or - sign
 */
export const formatPercentChange = (value: number): string => {
  return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
};

/**
 * Format currency for display
 * @param value Currency value
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};
