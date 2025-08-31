// src/api/api-client.ts

/**
 * API client for cryptocurrency data and AI analysis
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://api.example.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get current cryptocurrency prices from CoinGecko
   */
  async getCryptoPrices(coins: string[] = ['bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin']) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      throw error;
    }
  }

  /**
   * Chat with AI about cryptocurrency
   */
  async chatWithAI(message: string, sessionId?: string) {
    try {
      // This should be replaced with your actual API endpoint
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          // You can add any additional context here
          context: {
            source: 'NeuroTrader App',
            type: 'crypto_analysis'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw error;
    }
  }
  
  /**
   * Get market analysis for a specific coin
   */
  async getMarketAnalysis(coin: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/market-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coin }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting market analysis:', error);
      throw error;
    }
  }

  /**
   * Mock method that simulates API responses for demo purposes
   */
  async mockChatResponse(message: string) {
    // For demonstration without an actual backend
    console.log("Using mock response since no API endpoint is configured");
    
    // Get real crypto data to enhance the mock response
    let cryptoData;
    try {
      cryptoData = await this.getCryptoPrices();
    } catch (error) {
      console.warn("Could not fetch real crypto data, using static responses");
      cryptoData = null;
    }
    
    // Generate a relevant response based on the input message
    let response = "";
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('bitcoin') || lowercaseMessage.includes('btc')) {
      const btcPrice = cryptoData?.bitcoin?.usd || '~$50,000';
      const btcChange = cryptoData?.bitcoin?.usd_24h_change?.toFixed(2) || '0.5';
      
      response = `Bitcoin is currently trading at ${btcPrice}. In the past 24 hours, it has ${parseFloat(btcChange) >= 0 ? 'increased' : 'decreased'} by ${Math.abs(parseFloat(btcChange))}%. The overall market sentiment appears to be ${parseFloat(btcChange) >= 0 ? 'positive' : 'cautious'}. Key resistance levels are at $52,000 and $55,000, with support at $47,500 and $45,000.`;
    } else if (lowercaseMessage.includes('ethereum') || lowercaseMessage.includes('eth')) {
      const ethPrice = cryptoData?.ethereum?.usd || '~$3,000';
      const ethChange = cryptoData?.ethereum?.usd_24h_change?.toFixed(2) || '0.8';
      
      response = `Ethereum is currently trading at ${ethPrice}. In the past 24 hours, it has ${parseFloat(ethChange) >= 0 ? 'increased' : 'decreased'} by ${Math.abs(parseFloat(ethChange))}%. With recent protocol upgrades and increasing adoption of Layer 2 solutions, the outlook remains cautiously optimistic. Watch for resistance at $3,200 and support at $2,850.`;
    } else if (lowercaseMessage.includes('market') || lowercaseMessage.includes('overview')) {
      response = "The overall crypto market shows mixed signals with Bitcoin dominance at 51%. Altcoins have been showing moderate gains against BTC in recent days, with DeFi tokens outperforming the broader market. Liquidity metrics indicate potential consolidation before the next trend-setting move. Risk management remains essential in the current environment.";
    } else if (lowercaseMessage.includes('portfolio') || lowercaseMessage.includes('allocation')) {
      response = "For a balanced crypto portfolio allocation, consider:\n\n- 40-50% Bitcoin (core holding)\n- 25-30% Ethereum (smart contract exposure)\n- 10-15% Large cap alternatives (Solana, Polkadot, Cardano)\n- 5-10% DeFi blue chips\n- 5% Small cap high potential projects\n\nAdjust based on your risk tolerance and time horizon. This is not financial advice.";
    } else {
      response = "I understand you're interested in cryptocurrency analysis. For the most accurate and personalized insights, I'd need more specific information about which aspects of the market you're curious about. Consider asking about specific coins, market trends, technical analysis, or investment strategies.";
    }
    
    return {
      response: {
        content: response,
        timestamp: new Date().toISOString(),
      },
      sessionId: "mock-session-" + Math.random().toString(36).substring(2, 9)
    };
  }
}

// Export a singleton instance with configurable base URL
let apiClientInstance: ApiClient | null = null;

export const getApiClient = (baseUrl?: string): ApiClient => {
  if (!apiClientInstance) {
    // Default to environment variable or fallback
    const url = baseUrl || import.meta.env.VITE_API_URL || 'https://api.example.com';
    apiClientInstance = new ApiClient(url);
  }
  
  return apiClientInstance;
};
