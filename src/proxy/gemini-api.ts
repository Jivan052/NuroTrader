// src/proxy/gemini-api.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
  };
}

interface Message {
  role: 'user' | 'model';
  parts: string;
}

interface ChatSession {
  id: string;
  history: Message[];
  createdAt: Date;
}

export class GeminiService {
  private apiKey: string;
  private genAI: GoogleGenerativeAI;
  private model: any;
  private sessions: Map<string, ChatSession> = new Map();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private getOrCreateSession(sessionId?: string): ChatSession {
    if (sessionId && this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    const newSessionId = sessionId || this.generateSessionId();
    const newSession: ChatSession = {
      id: newSessionId,
      history: [],
      createdAt: new Date()
    };

    this.sessions.set(newSessionId, newSession);
    return newSession;
  }

  private async fetchCryptoData(coins: string[] = ['bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin']) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data: CoinGeckoResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      return null;
    }
  }

  private formatCryptoData(data: CoinGeckoResponse | null): string {
    if (!data) return "Unable to fetch cryptocurrency data.";

    let formatted = "# Current Cryptocurrency Market Data\n\n";
    
    for (const [coin, values] of Object.entries(data)) {
      const price = values.usd?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A';
      const change = values.usd_24h_change ? 
        `${values.usd_24h_change > 0 ? '+' : ''}${values.usd_24h_change.toFixed(2)}%` : 
        'N/A';
      const marketCap = values.usd_market_cap ? 
        `$${(values.usd_market_cap / 1e9).toFixed(2)}B` : 
        'N/A';
      const volume = values.usd_24h_vol ? 
        `$${(values.usd_24h_vol / 1e9).toFixed(2)}B` : 
        'N/A';

      formatted += `## ${coin.charAt(0).toUpperCase() + coin.slice(1)}\n`;
      formatted += `- Price: ${price}\n`;
      formatted += `- 24h Change: ${change}\n`;
      formatted += `- Market Cap: ${marketCap}\n`;
      formatted += `- 24h Volume: ${volume}\n\n`;
    }
    
    return formatted;
  }

  private async generatePrompt(message: string): Promise<string> {
    // Fetch crypto data
    const cryptoData = await this.fetchCryptoData();
    const formattedData = this.formatCryptoData(cryptoData);
    
    return `
    You are NeuroTrader, a sophisticated AI cryptocurrency analyst and trading advisor.

    Current Cryptocurrency Market Data:
    ${formattedData}
    
    Please answer this query based on the market data above and your knowledge of crypto markets:
    ${message}
    
    When discussing price trends or making recommendations:
    1. Reference the current data provided above
    2. Be clear about your confidence level
    3. Explain your reasoning briefly
    4. Indicate any important technical indicators that might be relevant
    5. Keep your answers concise and focused on cryptocurrency trading, investing, and market analysis
    `;
  }

  async sendMessage(message: string, sessionId?: string): Promise<{
    response: { content: string; timestamp: string };
    sessionId: string;
  }> {
    try {
      const session = this.getOrCreateSession(sessionId);
      const enhancedPrompt = await this.generatePrompt(message);
      
      // Add user message to history
      session.history.push({ role: 'user', parts: message });

      // Create chat history for Gemini API from session history
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };

      const chat = this.model.startChat({
        generationConfig,
        history: session.history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }]
        })),
      });

      // Send the enhanced prompt to Gemini
      const result = await chat.sendMessage(enhancedPrompt);
      const responseText = result.response.text();

      // Add model response to history
      session.history.push({ role: 'model', parts: responseText });
      
      return {
        response: {
          content: responseText,
          timestamp: new Date().toISOString(),
        },
        sessionId: session.id,
      };
    } catch (error) {
      console.error('Error in Gemini API call:', error);
      throw new Error('Failed to get response from Gemini API');
    }
  }

  getSessionHistory(sessionId: string): Message[] | null {
    const session = this.sessions.get(sessionId);
    return session ? session.history : null;
  }

  clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
}

let geminiServiceInstance: GeminiService | null = null;

export const getGeminiService = (apiKey?: string): GeminiService => {
  if (!geminiServiceInstance && apiKey) {
    geminiServiceInstance = new GeminiService(apiKey);
  } else if (!geminiServiceInstance && !apiKey) {
    throw new Error('API key is required to initialize GeminiService');
  }
  
  return geminiServiceInstance!;
};
