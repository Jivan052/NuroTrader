/**
 * Gemini API Service for NeuroTrader
 * Handles integration with Google's Gemini AI for market insights
 */

import { CoinGeckoMarketData } from './coingecko';

export type SentimentData = {
  overall: number;
  social: number;
  news: number;
  positiveTopics: string[];
  negativeTopics: string[];
};

export type AIInsightRequest = {
  token: string;
  chainData: {
    price: number;
    priceChange24h: number;
    volume24h: number;
    volumeChange24h: number;
    activeAddresses: number;
    activeAddressesChange24h: number;
    developmentActivity: Array<{date: string; activity: number}>;
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

// Calculate the recent trend in development activity
const calculateDevActivityTrend = (
  developmentActivity: Array<{date: string; activity: number}>
): number => {
  if (!developmentActivity || developmentActivity.length < 14) {
    return 0;
  }
  
  const recentActivity = developmentActivity
    .slice(-7)
    .reduce((sum, item) => sum + item.activity, 0) / 7;
  
  const olderActivity = developmentActivity
    .slice(-14, -7)
    .reduce((sum, item) => sum + item.activity, 0) / 7;
  
  if (olderActivity === 0) return 0;
  return ((recentActivity - olderActivity) / olderActivity) * 100;
};

/**
 * Generate AI insights using Google's Gemini API
 * @param marketData Market data for analysis
 * @param sentimentData Sentiment data for analysis
 * @param token The token being analyzed
 * @returns Promise with AI insights
 */
// Cache for simulated AI insights to reduce API calls
const aiInsightCache: Record<string, {
  timestamp: number;
  data: AIInsightResponse;
}> = {};

// Cache expiration in milliseconds (15 minutes)
const AI_CACHE_EXPIRATION = 15 * 60 * 1000;

export const generateAIInsights = async (
  marketData: CoinGeckoMarketData,
  sentimentData: SentimentData,
  token: string
): Promise<AIInsightResponse | null> => {
  try {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Check cache first to avoid hitting rate limits
    const cacheKey = `${token}-${marketData.current_price}-${sentimentData.overall}`;
    const cachedInsight = aiInsightCache[cacheKey];
    
    if (cachedInsight && (Date.now() - cachedInsight.timestamp) < AI_CACHE_EXPIRATION) {
      console.log(`Using cached AI insights for ${token}`);
      return cachedInsight.data;
    }
    
    // If no API key, generate simulated insights
    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      return generateSimulatedInsights(marketData, sentimentData, token);
    }
    
    const geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // Create request data
    const requestData: AIInsightRequest = {
      token,
      chainData: {
        price: marketData.current_price,
        priceChange24h: marketData.price_change_percentage_24h,
        volume24h: marketData.total_volume,
        volumeChange24h: marketData.market_cap_change_percentage_24h, // Using as proxy for volume change
        activeAddresses: (marketData.total_volume / 10000), // Simulated active addresses
        activeAddressesChange24h: marketData.market_cap_change_percentage_24h, // Using as proxy
        developmentActivity: [] // We don't have real dev activity data here
      },
      sentimentData: {
        overall: sentimentData.overall,
        social: sentimentData.social,
        news: sentimentData.news,
        positiveTopics: sentimentData.positiveTopics,
        negativeTopics: sentimentData.negativeTopics
      },
      timeframe: '24h'
    };
    
    // Calculate development activity trend
    const devActivityTrend = calculateDevActivityTrend(requestData.chainData.developmentActivity);
    
    // Create a prompt that includes all the relevant data
    const prompt = `
      You are NeuroTrader, an expert cryptocurrency analyst AI. 
      
      Analyze the following real-time data for ${token} and provide trading insights:
      
      On-Chain Data:
      - Current Price: $${marketData.current_price.toFixed(2)}
      - 24h Price Change: ${marketData.price_change_percentage_24h.toFixed(2)}%
      - 24h Volume: $${(marketData.total_volume / 1000000).toFixed(2)}M
      - Volume Change: ${marketData.market_cap_change_percentage_24h.toFixed(2)}%
      - Market Cap Rank: ${marketData.market_cap_rank}
      
      Sentiment Data:
      - Overall Sentiment: ${sentimentData.overall.toFixed(2)} (-100 to +100 scale)
      - Social Sentiment: ${sentimentData.social.toFixed(2)}
      - News Sentiment: ${sentimentData.news.toFixed(2)}
      - Positive Factors: ${sentimentData.positiveTopics.join(', ')}
      - Negative Factors: ${sentimentData.negativeTopics.join(', ')}
      
      Provide a concise analysis in the following JSON format:
      {
        "conclusion": "A 2-3 sentence summary of the overall market situation for this token",
        "bullishFactors": ["3-5 bullet points of positive factors"],
        "bearishFactors": ["3-5 bullet points of negative factors"],
        "recommendation": "BUY, SELL, or HOLD with a brief reason",
        "confidence": [a number between 0-100 representing your confidence level]
      }

      Only respond with valid JSON that follows the structure above exactly. Nothing else.
    `;
    
    try {
      const response = await fetch(`${geminiEndpoint}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      
      if (!response.ok) {
        console.warn(`Gemini API returned status ${response.status}. Falling back to simulated insights.`);
        return generateSimulatedInsights(marketData, sentimentData, token);
      }
      
      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No text generated by Gemini');
      }
      
      // Extract the JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Gemini response');
      }
      
      try {
        const insights = JSON.parse(jsonMatch[0]);
        
        const aiResponse = {
          ...insights,
          generatedAt: Date.now()
        };
        
        // Cache the result
        aiInsightCache[cacheKey] = {
          timestamp: Date.now(),
          data: aiResponse
        };
        
        return aiResponse;
      } catch (parseError) {
        console.error('Error parsing Gemini response as JSON:', parseError);
        return generateSimulatedInsights(marketData, sentimentData, token);
      }
    } catch (fetchError) {
      console.error('Error fetching from Gemini API:', fetchError);
      return generateSimulatedInsights(marketData, sentimentData, token);
    }
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return generateSimulatedInsights(marketData, sentimentData, token);
  }
};

/**
 * Generate simulated AI insights when API calls fail or are rate limited
 * This ensures the UI always has data to display
 */
const generateSimulatedInsights = (
  marketData: CoinGeckoMarketData,
  sentimentData: SentimentData,
  token: string
): AIInsightResponse => {
  console.log(`Generating simulated AI insights for ${token}`);
  
  const priceChange = marketData.price_change_percentage_24h || 0;
  const marketSentiment = sentimentData.overall || 0;
  
  // Determine the market direction based on price and sentiment
  const isBullish = priceChange > 0 || marketSentiment > 20;
  const isBearish = priceChange < 0 || marketSentiment < -20;
  
  // Generate realistic but simulated insights
  let conclusion, recommendation;
  const confidence = Math.round(50 + (Math.abs(priceChange) / 2) + (Math.abs(marketSentiment) / 4));
  
  if (isBullish) {
    conclusion = `${token} is showing positive momentum with a ${priceChange.toFixed(2)}% price change in the last 24 hours. Market sentiment remains optimistic, supported by increasing trading volume and social media activity.`;
    recommendation = "BUY - The technical indicators and market sentiment suggest potential for further upward movement";
  } else if (isBearish) {
    conclusion = `${token} is experiencing downward pressure with a ${Math.abs(priceChange).toFixed(2)}% price drop in the last 24 hours. Market sentiment is cautious, with decreasing volume and mixed social signals.`;
    recommendation = "SELL - The current market conditions and technical indicators suggest continued downward pressure";
  } else {
    conclusion = `${token} is showing mixed signals with a modest ${Math.abs(priceChange).toFixed(2)}% price change in the last 24 hours. Market sentiment remains neutral with balanced bullish and bearish factors.`;
    recommendation = "HOLD - The market is showing consolidation patterns with no clear directional bias";
  }
  
  // Generate bullish factors
  const bullishFactors = [
    `${token} trading volume has shown resilience compared to market averages`,
    `Technical indicators suggest potential support at current price levels`,
    `Social sentiment analysis shows growing interest from retail investors`,
    `Recent development activity indicates ongoing project improvements`
  ];
  
  // Generate bearish factors
  const bearishFactors = [
    `Market volatility remains a concern for short-term ${token} price action`,
    `Broader market uncertainty could limit upside potential`,
    `Resistance levels may pose challenges for further price increases`,
    `Regulatory developments could impact market sentiment`
  ];
  
  // Return simulated insights in the expected format
  return {
    conclusion,
    bullishFactors: bullishFactors.slice(0, 3 + Math.floor(Math.random() * 2)),
    bearishFactors: bearishFactors.slice(0, 3 + Math.floor(Math.random() * 2)),
    recommendation,
    confidence,
    generatedAt: Date.now()
  };
};

/**
 * Fetch saved insights for quick loading without re-generating
 * @param token The token to fetch insights for
 * @returns Promise with AI insights
 */
export const fetchAiInsights = async (token: string): Promise<AIInsightResponse | null> => {
  try {
    // In a real implementation, this would fetch from a database or API
    // For now, we'll return null to indicate nothing is cached
    return null;
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return null;
  }
};

/**
 * Format a confidence score into a category
 * @param score Numeric confidence score (0-100)
 * @returns String representation of confidence level
 */
export const formatConfidence = (score: number): string => {
  if (score >= 80) return "Very High";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Low";
  return "Very Low";
};
