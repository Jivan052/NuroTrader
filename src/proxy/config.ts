// src/proxy/config.ts
// Default configuration with placeholders
export const CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  COINGECKO_API_URL: 'https://api.coingecko.com/api/v3',
  DEFAULT_COINS: ['bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin', 'ripple', 'polkadot', 'dogecoin', 'chainlink', 'avalanche-2'],
  MODEL_NAME: 'gemini-pro',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1024,
};

// Helper function to set the API key at runtime
export const setGeminiApiKey = (apiKey: string): void => {
  CONFIG.GEMINI_API_KEY = apiKey;
};
