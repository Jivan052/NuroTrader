// src/api/api-config.ts

// API Configuration
export const API_CONFIG = {
  // Base URL for API endpoints - replace with your actual API URL when ready
  BASE_URL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  
  // Endpoints
  ENDPOINTS: {
    CHAT: '/api/chat',
    MARKET_ANALYSIS: '/api/market-analysis',
    SESSION: '/api/session'
  },
  
  // Default parameters
  DEFAULTS: {
    COINS: ['bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin', 'ripple', 'polkadot'],
    TIMEOUT_MS: 30000
  },
  
  // Request headers
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// For local development, you can set this to true to use mock data
export const USE_MOCK_DATA = true;

// Helper function to get the full URL for an endpoint
export const getEndpointUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
