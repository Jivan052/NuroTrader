// Simple test script for CoinGecko API integration
const { fetchTokenMarketData, fetchTokenHistoricalData, fetchTokenCompleteData } = require('./src/services/coingecko');

// Test function to run all API calls
async function testCoinGeckoAPI() {
  try {
    console.log("===== TESTING COINGECKO API INTEGRATION =====\n");
    
    // Test 1: Fetch market data for a single token
    console.log("Test 1: Fetching market data for BTC...");
    const marketData = await fetchTokenMarketData("BTC");
    console.log("Market data response:", marketData ? "SUCCESS" : "FAILED");
    if (marketData) {
      console.log(`- Current price: $${marketData.current_price}`);
      console.log(`- 24h change: ${marketData.price_change_percentage_24h.toFixed(2)}%`);
      console.log(`- Market cap: $${marketData.market_cap.toLocaleString()}`);
      console.log(`- 24h volume: $${marketData.total_volume.toLocaleString()}`);
    }
    console.log("\n");
    
    // Test 2: Fetch historical data
    console.log("Test 2: Fetching historical data for ETH (7 days)...");
    const historicalData = await fetchTokenHistoricalData("ETH", "7");
    console.log("Historical data response:", historicalData ? "SUCCESS" : "FAILED");
    if (historicalData) {
      console.log(`- Price data points: ${historicalData.prices.length}`);
      console.log(`- Volume data points: ${historicalData.volumes.length}`);
      console.log(`- First price entry: ${new Date(historicalData.prices[0].timestamp).toLocaleDateString()} - $${historicalData.prices[0].price.toFixed(2)}`);
      console.log(`- Last price entry: ${new Date(historicalData.prices[historicalData.prices.length-1].timestamp).toLocaleDateString()} - $${historicalData.prices[historicalData.prices.length-1].price.toFixed(2)}`);
    }
    console.log("\n");
    
    // Test 3: Fetch complete data
    console.log("Test 3: Fetching complete data for SOL (14 days)...");
    const completeData = await fetchTokenCompleteData("SOL", "14");
    console.log("Complete data response:", completeData ? "SUCCESS" : "FAILED");
    if (completeData) {
      console.log(`- Market data: ${completeData.marketData ? "Present" : "Missing"}`);
      console.log(`- Historical prices: ${completeData.historicalData.prices.length} entries`);
      console.log(`- Historical volumes: ${completeData.historicalData.volumes.length} entries`);
    }
    
    console.log("\n===== TESTING COMPLETE =====");
  } catch (error) {
    console.error("ERROR DURING TESTING:", error);
  }
}

// Run the test
testCoinGeckoAPI();
