# NeuroTrader API Integration

NeuroTrader uses two primary external APIs to fetch real-time market data and sentiment analysis:

## 1. CoinGecko API

CoinGecko provides cryptocurrency market data including:
- Current prices and market caps
- Historical price data
- Trading volumes
- Basic market statistics

### Configuration
1. Get a CoinGecko API key from [https://www.coingecko.com/api/pricing](https://www.coingecko.com/api/pricing)
2. Add your API key to the `.env` file:
```
VITE_COINGECKO_API_KEY=your_api_key_here
```

If no API key is provided, the application will use the public API which has rate limiting.

## 2. Santiment API

Santiment provides on-chain data, social sentiment analysis and market insights:
- Social volume metrics
- Development activity
- Network growth
- Sentiment analysis from social media and news sources

### Configuration
1. Sign up for a Santiment account at [https://app.santiment.net/](https://app.santiment.net/)
2. Get your API key from your account settings
3. Add your API key to the `.env` file:
```
VITE_SANTIMENT_API_KEY=your_api_key_here
```

Without a Santiment API key, the application will generate simulated sentiment data.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_COINGECKO_API_KEY=your_coingecko_api_key
VITE_SANTIMENT_API_KEY=your_santiment_api_key
```

## API Usage Notes

1. **Rate Limiting**: Be mindful of API rate limits, especially when using free tiers
2. **Caching**: The application implements caching to reduce API calls
3. **Fallback**: If APIs are unavailable, the application generates realistic simulated data
4. **Development**: For development purposes, you can set `VITE_USE_MOCK_DATA=true` to always use simulated data

## Advanced Configuration

Additional configuration options can be found in:
- `src/services/coingecko.ts` - CoinGecko API integration
- `src/services/santiment.ts` - Santiment API integration
- `src/services/api-integration.ts` - Combined API service

## Supported Cryptocurrencies

The following cryptocurrencies are supported by default:
- BTC (Bitcoin)
- ETH (Ethereum) 
- SOL (Solana)
- AVAX (Avalanche)
- GLMR (Moonbeam)
- FTM (Fantom)

Additional tokens can be added by updating the token mappings in the respective API service files.
