# API Integration Guide for NeuroTrader

This document provides guidance on how to integrate the real API services into the NeuroTrader application. The application has been prepared with all the necessary integration points to connect with The Graph, Santiment, The Tie, and StockGeist.ai APIs.

## Getting Started with API Integration

### Step 1: Set Up Environment Variables

1. Copy the `.env.example` file to create a new `.env` file:
   ```
   cp .env.example .env
   ```

2. Open the `.env` file and add your API keys:
   ```
   VITE_THE_GRAPH_API_ENDPOINT=https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3
   VITE_SANTIMENT_API_KEY=your_santiment_api_key_here
   VITE_THE_TIE_API_KEY=your_tie_api_key_here
   VITE_STOCKGEIST_API_KEY=your_stockgeist_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Step 2: Use the API Services

All API services have been implemented in `src/services/api.ts`. The functions are ready to use in your components. Simply import the services and call the appropriate functions:

```typescript
import { fetchTokenDataFromGraph, fetchSantimentData, fetchTheTieData, fetchStockGeistData } from '../services/api';

// In your component function
const loadData = async () => {
  // Get on-chain data from The Graph
  const graphData = await fetchTokenDataFromGraph('ETH');
  
  // Get development activity and active addresses from Santiment
  const santimentData = await fetchSantimentData('ethereum');
  
  // Get sentiment data from The Tie
  const tieData = await fetchTheTieData('ETH');
  
  // Get additional sentiment from StockGeist
  const stockGeistData = await fetchStockGeistData('ETH');
  
  // Process and combine the data
  if (graphData && santimentData && tieData && stockGeistData) {
    // Update your component state with the real data
  }
};
```

### Step 3: Replace Mock Data in AnalyticsDashboard.tsx

The `AnalyticsDashboard.tsx` component currently uses mock data with API integration points marked by comments. To use real data:

1. Import the API services at the top of the file:
   ```typescript
   import { 
     fetchTokenDataFromGraph, 
     fetchSantimentData,
     fetchTheTieData,
     fetchStockGeistData,
     generateAIInsights,
     calculatePercentChange
   } from '../services/api';
   ```

2. Update the `fetchChainData` function to use the real API:
   ```typescript
   const fetchChainData = async (token: string) => {
     setIsLoading(true);
     try {
       // Convert token symbol to address (in a real app, you'd have a mapping)
       const tokenAddress = token.toLowerCase();
       
       // Fetch data from The Graph
       const graphData = await fetchTokenDataFromGraph(tokenAddress, timeframe);
       
       // Fetch data from Santiment
       const santimentData = await fetchSantimentData(token.toLowerCase(), timeframe);
       
       if (graphData && santimentData) {
         // Process and transform the data
         const processedData: ChainData = {
           price: parseFloat(graphData.token.priceUSD),
           priceChange24h: calculatePercentChange(
             graphData.tokenDayDatas[1]?.priceUSD || 0,
             graphData.token.priceUSD
           ),
           volume24h: parseFloat(graphData.token.volumeUSD),
           volumeChange24h: calculatePercentChange(
             graphData.tokenDayDatas[1]?.volumeUSD || 0,
             graphData.token.volumeUSD
           ),
           activeAddresses: santimentData.getMetric[1]?.timeseriesData[0]?.value || 0,
           activeAddressesChange24h: calculatePercentChange(
             santimentData.getMetric[1]?.timeseriesData[1]?.value || 0,
             santimentData.getMetric[1]?.timeseriesData[0]?.value || 0
           ),
           token: token,
           liquidityDepth: parseFloat(graphData.token.totalLiquidity) * parseFloat(graphData.token.priceUSD)
         };
         
         setChainData(processedData);
       } else {
         // Fall back to mock data if API calls fail
         // Mock data implementation remains unchanged
       }
     } catch (error) {
       console.error("Error fetching on-chain data:", error);
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. Update the `fetchSentimentData` function similarly:
   ```typescript
   const fetchSentimentData = async (token: string) => {
     try {
       // Fetch sentiment data from The Tie
       const tieData = await fetchTheTieData(token);
       
       // Fetch sentiment from StockGeist
       const stockGeistData = await fetchStockGeistData(token);
       
       if (tieData && stockGeistData) {
         // Combine sentiment data from multiple sources
         const combinedSentiment: SentimentData = {
           overall: (tieData.score + stockGeistData.sentimentScore) / 2,
           social: tieData.socialScore,
           news: stockGeistData.newsScore,
           positiveTopics: [...tieData.positiveFactors, ...stockGeistData.positiveTopics],
           negativeTopics: [...tieData.negativeFactors, ...stockGeistData.negativeTopics],
           sources: {
             twitter: tieData.twitterScore,
             reddit: tieData.redditScore,
             news: stockGeistData.newsScore
           }
         };
         
         setSentimentData(combinedSentiment);
       } else {
         // Fall back to mock data if API calls fail
         // Mock data implementation remains unchanged
       }
     } catch (error) {
       console.error("Error fetching sentiment data:", error);
     }
   };
   ```

## Additional Notes

- The API services include proper error handling and fallbacks to ensure the application doesn't break if an API is unavailable.
- Type definitions for API responses are included to provide TypeScript support.
- The implementation includes helper functions like `calculatePercentChange` to process the data.
- Remember to keep your API keys secure and never commit them to version control.

### Step 4: Integrate AI Analysis with Google's Gemini API

The application also supports AI-powered trading insights using Google's Gemini API. To implement this:

1. Get a Gemini API key from Google AI Studio (https://ai.google.dev/)

2. Add the key to your `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Update the `generateAiInsights` function in `AnalyticsDashboard.tsx`:
   ```typescript
   const generateAiInsights = async (token: string, chainData: ChainData | null, sentimentData: SentimentData | null) => {
     try {
       if (!chainData || !sentimentData) return;
       
       // Prepare the data for the AI analysis
       const insightData: AIInsightRequest = {
         token,
         chainData: {
           price: chainData.price,
           priceChange24h: chainData.priceChange24h,
           volume24h: chainData.volume24h,
           volumeChange24h: chainData.volumeChange24h,
           activeAddresses: chainData.activeAddresses,
           activeAddressesChange24h: chainData.activeAddressesChange24h
         },
         sentimentData: {
           overall: sentimentData.overall,
           social: sentimentData.social,
           news: sentimentData.news,
           positiveTopics: sentimentData.positiveTopics,
           negativeTopics: sentimentData.negativeTopics
         },
         timeframe: timeframe
       };
       
       // Call the Gemini API
       const insights = await generateAIInsights(insightData);
       
       if (insights) {
         setAiInsights(insights);
       } else {
         // Fall back to mock insights if the API call fails
         // Mock insights implementation remains unchanged
       }
     } catch (error) {
       console.error("Error generating AI insights:", error);
     }
   };
   ```

## Additional Notes

- The API services include proper error handling and fallbacks to ensure the application doesn't break if an API is unavailable.
- Type definitions for API responses are included to provide TypeScript support.
- The implementation includes helper functions like `calculatePercentChange` to process the data.
- Remember to keep your API keys secure and never commit them to version control.

## Next Steps for Enhancement

1. **Add API Caching**: Implement a caching mechanism to reduce API calls and improve performance.
2. **Implement Rate Limiting**: Add rate limiting to prevent exceeding API usage limits.
3. **Error Recovery**: Enhance error handling with retry mechanisms and user feedback.
4. **Real-time Updates**: Consider using WebSockets for real-time data where available.
5. **Expand Data Sources**: Add more data sources for comprehensive analysis.
