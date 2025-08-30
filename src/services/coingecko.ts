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
 * Get token name from symbol
 */
const getTokenName = (symbol: string): string => {
  const nameMap: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'AVAX': 'Avalanche',
    'GLMR': 'Moonbeam',
    'FTM': 'Fantom',
    'UNI': 'Uniswap',
    'MATIC': 'Polygon',
    'DOT': 'Polkadot',
    'ADA': 'Cardano',
    'XRP': 'XRP',
    'LINK': 'Chainlink',
    'DOGE': 'Dogecoin'
  };
  
  return nameMap[symbol] || `${symbol} Token`;
};

/**
 * Generate realistic mock market data for a token
 * @param symbol Token symbol
 * @returns Mock market data
 */
const generateMockMarketData = (symbol: string): CoinGeckoMarketData => {
  // Use consistent but "random" values based on the token symbol
  const symbolHash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomSeed = symbolHash / 100;
  
  // Generate mock price and other values based on typical ranges for well-known coins
  let basePrice: number;
  let marketCap: number;
  let volume: number;
  let supply: number;
  let maxSupply: number | null;
  let rank: number;
  
  switch (symbol) {
    case 'BTC':
      basePrice = 35000 + (randomSeed * 5000);
      marketCap = basePrice * 19000000;
      volume = marketCap * 0.05;
      supply = 19000000;
      maxSupply = 21000000;
      rank = 1;
      break;
    case 'ETH':
      basePrice = 1800 + (randomSeed * 400);
      marketCap = basePrice * 120000000;
      volume = marketCap * 0.06;
      supply = 120000000;
      maxSupply = null;
      rank = 2;
      break;
    case 'SOL':
      basePrice = 40 + (randomSeed * 15);
      marketCap = basePrice * 400000000;
      volume = marketCap * 0.08;
      supply = 400000000;
      maxSupply = null;
      rank = 5;
      break;
    case 'AVAX':
      basePrice = 20 + (randomSeed * 8);
      marketCap = basePrice * 350000000;
      volume = marketCap * 0.07;
      supply = 350000000;
      maxSupply = 720000000;
      rank = 11;
      break;
    default:
      basePrice = 10 + (randomSeed * 20);
      marketCap = basePrice * 100000000;
      volume = marketCap * 0.06;
      supply = 100000000;
      maxSupply = 200000000;
      rank = Math.floor(10 + (randomSeed * 20));
  }
  
  // Generate price changes (using the day of month for consistency)
  const day = new Date().getDate();
  const priceChangeDirection = ((day % 3) === 0) ? -1 : 1; 
  const priceChangePercent = priceChangeDirection * ((day % 10) + (randomSeed % 5));
  const priceChange = (basePrice * priceChangePercent) / 100;
  
  // Market cap changes
  const marketCapChangePercent = priceChangePercent + (((day % 7) - 3) / 2);
  const marketCapChange = (marketCap * marketCapChangePercent) / 100;
  
  // Generate high/low based on current price and changes
  const high24h = basePrice * (1 + Math.abs(priceChangePercent / 100) * 1.5);
  const low24h = basePrice * (1 - Math.abs(priceChangePercent / 100) * 0.8);
  
  // All-time high and low
  const ath = basePrice * (1 + ((symbolHash % 10) / 10) + 0.5);
  const athChangePercent = ((basePrice / ath) - 1) * 100;
  const atl = basePrice * (1 - ((symbolHash % 15) / 20) - 0.3);
  const atlChangePercent = ((basePrice / atl) - 1) * 100;
  
  // Generate image URL - using a consistent pattern based on symbol
  const lowerSymbol = symbol.toLowerCase();
  const image = `https://assets.coingecko.com/coins/images/${(symbolHash % 1000) + 1}/small/${lowerSymbol}.png`;
  
  return {
    id: getTokenId(symbol),
    symbol: symbol.toLowerCase(),
    name: getTokenName(symbol),
    image,
    current_price: basePrice,
    market_cap: marketCap,
    market_cap_rank: rank,
    fully_diluted_valuation: maxSupply ? basePrice * maxSupply : marketCap * 1.2,
    total_volume: volume,
    high_24h: high24h,
    low_24h: low24h,
    price_change_24h: priceChange,
    price_change_percentage_24h: priceChangePercent,
    market_cap_change_24h: marketCapChange,
    market_cap_change_percentage_24h: marketCapChangePercent,
    circulating_supply: supply,
    total_supply: maxSupply || supply * 1.1,
    max_supply: maxSupply,
    ath: ath,
    ath_change_percentage: athChangePercent,
    ath_date: `202${Math.floor(randomSeed % 3)}-${String(Math.floor((randomSeed * 10) % 12) + 1).padStart(2, '0')}-${String(Math.floor((randomSeed * 100) % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
    atl: atl,
    atl_change_percentage: atlChangePercent,
    atl_date: `201${Math.floor(randomSeed % 9)}-${String(Math.floor((randomSeed * 10) % 12) + 1).padStart(2, '0')}-${String(Math.floor((randomSeed * 100) % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
    last_updated: new Date().toISOString()
  };
};

/**
 * Generate realistic historical price data
 */
const generateHistoricalData = (
  symbol: string, 
  days: number, 
  currentPrice: number
): CoinGeckoHistoricalData => {
  const prices: [number, number][] = [];
  const market_caps: [number, number][] = [];
  const total_volumes: [number, number][] = [];
  
  // Get a seed value based on symbol
  const symbolHash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Base volatility factor depends on the token
  let volatilityFactor: number;
  switch (symbol) {
    case 'BTC':
      volatilityFactor = 0.02; // 2% daily volatility
      break;
    case 'ETH':
      volatilityFactor = 0.025; // 2.5% daily volatility
      break;
    case 'SOL':
      volatilityFactor = 0.04; // 4% daily volatility
      break;
    default:
      volatilityFactor = 0.035; // 3.5% daily volatility
  }
  
  // Generate a somewhat realistic price trend
  let price = currentPrice;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // We'll generate a general trend direction first
  const trendDirection = ((symbolHash % 10) > 5) ? 1 : -1;
  const trendStrength = (symbolHash % 5) / 10; // 0-0.4
  
  // For more realistic data, we'll add some mini-trends
  const miniTrendDuration = Math.floor(days / 5) || 1; // Several mini-trends within the period
  let currentTrend = trendDirection;
  let currentTrendDay = 0;
  
  // Generate data points for each day
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * dayMs);
    const date = new Date(timestamp);
    const dayOfWeek = date.getDay();
    
    // Check if we need to switch mini-trend
    if (currentTrendDay >= miniTrendDuration) {
      currentTrend = -currentTrend; // Reverse trend
      currentTrendDay = 0;
    }
    
    // Generate daily volatility, higher on weekends
    const dailyVolatility = volatilityFactor * (dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1);
    
    // Calculate daily change combining:
    // 1. Random volatility
    // 2. General trend direction
    // 3. Current mini-trend
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    const dailyChange = 
      (randomFactor * dailyVolatility) + // Random daily volatility
      (trendDirection * trendStrength * 0.01) + // General trend
      (currentTrend * 0.005); // Current mini-trend
    
    // Update price
    price = price * (1 + dailyChange);
    if (price < 0) price = 0.01; // Ensure price doesn't go negative
    
    // Push data points
    prices.push([timestamp, price]);
    
    // Generate market cap based on price and some fixed supply
    const baseSupply = symbol === 'BTC' ? 19000000 : 
                      symbol === 'ETH' ? 120000000 : 
                      100000000 + (symbolHash * 1000);
    const marketCap = price * baseSupply;
    market_caps.push([timestamp, marketCap]);
    
    // Generate volume as a percentage of market cap, higher on volatile days
    const volumePercent = 0.03 + (Math.abs(dailyChange) * 0.5);
    const volume = marketCap * volumePercent;
    total_volumes.push([timestamp, volume]);
    
    currentTrendDay++;
  }
  
  return { prices, market_caps, total_volumes };
};

/**
 * Fetch current market data for a specific token
 * @param symbol Token symbol (e.g., BTC, ETH)
 * @returns Promise with current market data
 */
export const fetchTokenMarketData = async (symbol: string): Promise<CoinGeckoMarketData> => {
  try {
    const tokenId = getTokenId(symbol);
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenId}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.warn(`CoinGecko API error: ${response.status} ${response.statusText}. Using mock data.`);
      throw new Error('API request failed');
    }
    
    const data = await response.json() as CoinGeckoMarketData[];
    if (!data || data.length === 0) {
      console.warn(`No data found for token ${symbol}. Using mock data.`);
      throw new Error('No data found');
    }
    
    return data[0];
  } catch (error) {
    // Return mock data on failure
    console.log(`Using mock data for ${symbol}`);
    return generateMockMarketData(symbol);
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
): Promise<{ prices: PriceChartData[], volumes: VolumeChartData[] }> => {
  try {
    const tokenId = getTokenId(symbol);
    const daysNum = typeof days === 'string' ? parseInt(days) : days;
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.warn(`CoinGecko API error: ${response.status} ${response.statusText}. Using mock data.`);
      throw new Error('API request failed');
    }
    
    const data = await response.json() as CoinGeckoHistoricalData;
    
    if (!data || !data.prices || !data.total_volumes) {
      console.warn(`No historical data found for token ${symbol}. Using mock data.`);
      throw new Error('Invalid data format');
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
    // Use mock data when the API fails
    console.log(`Using mock historical data for ${symbol}`);
    
    // Get current price from mock market data to ensure consistency
    const mockMarketData = generateMockMarketData(symbol);
    const daysNum = typeof days === 'string' ? parseInt(days) : days;
    const mockHistoricalData = generateHistoricalData(symbol, daysNum, mockMarketData.current_price);
    
    // Format price data for charts
    const prices = mockHistoricalData.prices.map(([timestamp, price]) => ({
      timestamp,
      date: new Date(timestamp).toISOString().split('T')[0],
      price
    }));
    
    // Format volume data for charts
    const volumes = mockHistoricalData.total_volumes.map(([timestamp, volume]) => ({
      timestamp,
      date: new Date(timestamp).toISOString().split('T')[0],
      volume
    }));
    
    return { prices, volumes };
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
    
    return {
      marketData,
      historicalData
    };
  } catch (error) {
    console.error(`Error fetching complete data for ${symbol}:`, error);
    
    // Generate fallback data if API calls fail
    const mockMarketData = generateMockMarketData(symbol);
    const daysNum = typeof days === 'string' ? parseInt(days) : days;
    const mockHistoricalData = generateHistoricalData(symbol, daysNum, mockMarketData.current_price);
    
    // Format price data for charts
    const prices = mockHistoricalData.prices.map(([timestamp, price]) => ({
      timestamp,
      date: new Date(timestamp).toISOString().split('T')[0],
      price
    }));
    
    // Format volume data for charts
    const volumes = mockHistoricalData.total_volumes.map(([timestamp, volume]) => ({
      timestamp,
      date: new Date(timestamp).toISOString().split('T')[0],
      volume
    }));
    
    return {
      marketData: mockMarketData,
      historicalData: { prices, volumes }
    };
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
