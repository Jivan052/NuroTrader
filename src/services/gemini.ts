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
export const generateAIInsights = async (
  marketData: CoinGeckoMarketData,
  sentimentData: SentimentData,
  token: string
): Promise<AIInsightResponse | null> => {
  try {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      return null;
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
      throw new Error(`HTTP error! status: ${response.status}`);
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
      
      return {
        ...insights,
        generatedAt: Date.now()
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError);
      throw new Error('Invalid JSON format in Gemini response');
    }
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return null;
  }
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
