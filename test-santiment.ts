// Simple test script for Santiment API integration
import { 
  fetchSantimentCompleteData,
  calculatePercentChange,
  SentimentData,
  ChainData
} from './src/services/santiment';

// Test function to run all Santiment API calls
async function testSantimentAPI() {
  try {
    console.log("===== TESTING SANTIMENT API INTEGRATION =====\n");
    
    // Test for different tokens
    const tokens = ['BTC', 'ETH', 'SOL'];
    
    for (const token of tokens) {
      console.log(`\nTesting Santiment API for ${token}...`);
      
      // Test complete data fetch
      console.log(`Fetching complete data for ${token} (24h timeframe)...`);
      const startTime = Date.now();
      const completeData = await fetchSantimentCompleteData(token, '24h');
      const endTime = Date.now();
      const requestTime = (endTime - startTime) / 1000; // Convert to seconds
      
      console.log(`Request completed in ${requestTime.toFixed(2)} seconds`);
      
      if (!completeData) {
        console.error(`❌ Failed to fetch data for ${token}`);
        continue;
      }
      
      console.log(`✅ Successfully fetched data for ${token}\n`);
      
      // Log chain data
      const chainData = completeData.chainData;
      console.log("Chain Data:");
      console.log(`- Current price: $${chainData.price.toFixed(2)}`);
      console.log(`- 24h price change: ${chainData.priceChange24h.toFixed(2)}%`);
      console.log(`- 24h volume: $${(chainData.volume24h / 1000000).toFixed(2)}M`);
      console.log(`- Volume change: ${chainData.volumeChange24h.toFixed(2)}%`);
      console.log(`- Active addresses: ${chainData.activeAddresses}`);
      console.log(`- Active addresses change: ${chainData.activeAddressesChange24h.toFixed(2)}%`);
      console.log(`- Price history entries: ${chainData.priceHistory.length}`);
      console.log(`- Volume history entries: ${chainData.volumeHistory.length}`);
      console.log(`- Active addresses history entries: ${chainData.activeAddressesHistory.length}`);
      
      // Log sentiment data
      const sentimentData = completeData.sentimentData;
      console.log("\nSentiment Data:");
      console.log(`- Overall sentiment: ${sentimentData.overall.toFixed(2)}`);
      console.log(`- Social sentiment: ${sentimentData.social.toFixed(2)}`);
      console.log(`- News sentiment: ${sentimentData.news.toFixed(2)}`);
      console.log(`- Sentiment history entries: ${sentimentData.sentimentHistory.length}`);
      console.log(`- Positive topics: ${sentimentData.positiveTopics.join(', ')}`);
      console.log(`- Negative topics: ${sentimentData.negativeTopics.join(', ')}`);
      console.log(`- Twitter sentiment: ${sentimentData.sources.twitter.toFixed(2)}`);
      console.log(`- Reddit sentiment: ${sentimentData.sources.reddit.toFixed(2)}`);
      console.log(`- News sentiment: ${sentimentData.sources.news.toFixed(2)}`);
      
      // Add a separator for the next token
      console.log("\n" + "-".repeat(50));
    }
    
    console.log("\n===== SANTIMENT API TESTING COMPLETE =====");
  } catch (error) {
    console.error("ERROR DURING TESTING:", error);
  }
}

// Run the test
testSantimentAPI();
