# NeuroTrader Real-time API Integration

This document explains how NeuroTrader has been updated to use real-time data from Santiment and AI analysis from Google Gemini.

## API Integration Overview

NeuroTrader now uses two main APIs:

1. **Santiment API** - For all blockchain data and sentiment analysis
2. **Google Gemini API** - For AI-powered trading insights

## How to Use the Real-time APIs

### Setup

1. The `.env.example` file already contains your Santiment and Gemini API keys:

```
VITE_SANTIMENT_API_KEY=vxuh7yymjmutdj64_kuw4xqernuochl6p
VITE_GEMINI_API_KEY=AIzaSyBcMPULyB2VeHwptdgryTI_R8o56e-bOI4
```

2. Copy this file to create your `.env` file:

```
cp .env.example .env
```

### Data Flow

1. **Santiment API**: 
   - Provides comprehensive blockchain data including price, volume, active addresses, development activity
   - Delivers sentiment analysis from social media and news sources
   - All this data is fetched through the `fetchSantimentCompleteData` function in `src/services/santiment.ts`

2. **Google Gemini API**:
   - Receives the data from Santiment
   - Analyzes it to provide trading insights
   - Generates conclusions, bullish/bearish factors, and recommendations

## What Changed

1. **New Services**:
   - Created `src/services/santiment.ts` with enhanced functionality to fetch all data from Santiment
   - Implemented `generateAIInsights` function that uses Gemini API with real-time data from Santiment

2. **Dashboard Updates**:
   - Modified `AnalyticsDashboard.tsx` to use the new services
   - Combined data fetching into a single `fetchTokenData` function
   - Updated AI insights generation to use real data from Santiment with Gemini

## Benefits of This Approach

1. **Simplified Architecture**: Using primarily Santiment for all data needs reduces API dependencies
2. **Better Data Consistency**: All data comes from a single source, ensuring consistency
3. **Real-time AI Analysis**: Gemini API analyzes actual blockchain data rather than mock data
4. **Fallback Support**: Still includes fallback to mock data if API calls fail

## Getting Started

1. The application will automatically use these APIs when you run it:

```
npm run dev
```

2. You can test different tokens and timeframes to see the real-time data and AI insights

3. No additional configuration needed - the API integration is already complete

## Customization

If you want to modify the API integration:

1. Edit `src/services/santiment.ts` to change what data is fetched
2. Modify the Gemini prompt in `generateAIInsights` function to change the AI analysis

## Troubleshooting

- Check browser console for detailed API responses and error messages
- Make sure your API keys are correctly set in the `.env` file
- If APIs fail, the application will fall back to mock data
