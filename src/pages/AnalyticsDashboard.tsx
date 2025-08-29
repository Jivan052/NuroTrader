import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddress } from "@thirdweb-dev/react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  LineChart, 
  ArrowUpRight, 
  ArrowDownRight,
  MessageSquare, 
  Activity,
  RefreshCcw,
  ExternalLink
} from "lucide-react";
import { 
  fetchSantimentCompleteData,
  generateAIInsights,
  ChainData as SantimentChainData,
  SentimentData as SantimentSentimentData,
  AIInsightRequest,
  AIInsightResponse
} from "../services/santiment";
import { useData } from "../context/DataContext";

// Import chart components
import { PriceChart } from "../components/charts/PriceChart";
import { SentimentGauge } from "../components/charts/SentimentGauge";
import { VolumeChart } from "../components/charts/VolumeChart";
import { MarketStats } from "../components/charts/MarketStats";

// Types for our data models
type ChainData = {
  price: number;
  priceChange24h: number;
  volume24h: number;
  volumeChange24h: number;
  activeAddresses: number;
  activeAddressesChange24h: number;
  token: string;
  liquidityDepth: number;
  priceHistory: Array<{date: string; price: number}>;
  volumeHistory: Array<{date: string; volume: number}>;
  activeAddressesHistory: Array<{date: string; activeAddresses: number}>;
  developmentActivity: Array<{date: string; activity: number}>;
};

type SentimentData = {
  overall: number; // -100 to 100
  social: number;
  news: number;
  positiveTopics: string[];
  negativeTopics: string[];
  sources: {
    twitter: number;
    reddit: number;
    news: number;
  };
  sentimentHistory: Array<{date: string; value: number}>;
};

type NewsItem = {
  title: string;
  url: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  timestamp: number;
};

// Align this with AIInsightResponse from gemini.ts service
type AIInsight = {
  conclusion: string;
  bullishFactors: string[];
  bearishFactors: string[];
  recommendation: string;
  confidence: number;
};

const AnalyticsDashboard: React.FC = () => {
  const [activeToken, setActiveToken] = useState<string>("ETH");
  const [timeframe, setTimeframe] = useState<string>("24h");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [chainData, setChainData] = useState<ChainData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const contextData = useData();
  const { marketData, priceData, volumeData, sentimentData: contextSentimentData, aiInsights: contextAiInsights, loading } = contextData;
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const walletAddress = useAddress();
  
  const tokens = ["ETH", "BTC", "AVAX", "SOL", "GLMR", "FTM"];
  
  // This function is no longer needed as we're using context data
  // It's replaced with an effect that updates local state when context data changes
  
  // This function is no longer needed as AI insights are now generated in the DataContext
  // We're now using contextAiInsights from the DataContext
  
  // Fetch news for the selected token
  const fetchNews = async (token: string) => {
    try {
      // In a real implementation, this would call Crypto News API or CoinDesk
      // For demonstration, we're using mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate more positive news for AVAX
      const mockNews: NewsItem[] = token === "AVAX" ? [
        {
          title: "Avalanche Partners with Major Financial Institution to Enhance Blockchain Infrastructure",
          url: "#",
          source: "CoinDesk",
          sentiment: "positive",
          timestamp: Date.now() - 3600000 // 1 hour ago
        },
        {
          title: "Developer Activity on Avalanche Network Reaches All-Time High",
          url: "#",
          source: "CryptoNews",
          sentiment: "positive",
          timestamp: Date.now() - 7200000 // 2 hours ago
        },
        {
          title: "New DeFi Protocol on Avalanche Sees $100M TVL in First Week",
          url: "#",
          source: "DeFiPulse",
          sentiment: "positive",
          timestamp: Date.now() - 14400000 // 4 hours ago
        },
        {
          title: "Regulatory Clarity Needed for Avalanche's Further Growth, Says Analyst",
          url: "#",
          source: "BlockchainInsider",
          sentiment: "neutral",
          timestamp: Date.now() - 28800000 // 8 hours ago
        },
        {
          title: "Market Analysts Predict Strong Q4 for Avalanche Ecosystem",
          url: "#",
          source: "TokenInsight",
          sentiment: "positive",
          timestamp: Date.now() - 43200000 // 12 hours ago
        }
      ] : [
        {
          title: `${token} Price Analysis: Technical Indicators Suggest Potential Reversal`,
          url: "#",
          source: "CryptoAnalyst",
          sentiment: Math.random() > 0.5 ? "positive" : "negative",
          timestamp: Date.now() - Math.random() * 86400000 // random time within 24h
        },
        {
          title: `New Development Update for ${token} Protocol Announced`,
          url: "#",
          source: "CoinTelegraph",
          sentiment: "positive",
          timestamp: Date.now() - Math.random() * 86400000
        },
        {
          title: `${token} Faces Resistance at Key Level as Volume Decreases`,
          url: "#",
          source: "CoinDesk",
          sentiment: "negative",
          timestamp: Date.now() - Math.random() * 86400000
        },
        {
          title: `Institutional Interest in ${token} Shows Mixed Signals`,
          url: "#",
          source: "TokenInsight",
          sentiment: "neutral",
          timestamp: Date.now() - Math.random() * 86400000
        }
      ];
      
      setNews(mockNews);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };
  
  // Refresh all data
  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the data context
      await contextData.refreshData();
      
      // Also refresh local news data
      await fetchNews(activeToken);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Effect to update local state when context data or active token changes
  useEffect(() => {
    const loadData = async () => {
      // Update loading state based on context
      setIsLoading(loading || !marketData || !marketData[activeToken]);
      
      // Fetch news for the selected token
      await fetchNews(activeToken);
    };
    
    loadData();
  }, [activeToken, marketData, loading]);
  
  // Effect to update local state with context data for the selected token
  useEffect(() => {
    if (!loading && marketData && marketData[activeToken] && contextSentimentData && contextSentimentData[activeToken]) {
      // No need to manually fetch data - use the context data
      console.log(`Using context data for ${activeToken}`);
    }
  }, [activeToken, marketData, contextSentimentData, loading]);
  
  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  // Format currency
  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num);
  };
  
  // Get formatted time since timestamp
  const getTimeSince = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-silver-bright">Analytics Dashboard</h1>
          <p className="text-silver mt-2">Powered by AI and on-chain data analysis</p>
        </div>
        
        <div className="flex mt-4 lg:mt-0">
          <Button 
            variant="outline" 
            className="mr-2 border-primary/30" 
            onClick={refreshAllData}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          {!walletAddress && (
            <Button variant="hero">Connect Wallet</Button>
          )}
        </div>
      </div>
      
      {/* Token selector */}
      <div className="flex overflow-x-auto pb-2 mb-6 no-scrollbar">
        {tokens.map((token) => (
          <Button
            key={token}
            variant={token === activeToken ? "default" : "outline"}
            className={`mr-2 min-w-[80px] ${token === activeToken ? 'bg-primary text-black' : 'border-primary/30'}`}
            onClick={() => setActiveToken(token)}
          >
            {token}
          </Button>
        ))}
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Charts and stats */}
        <div className="lg:col-span-8 space-y-6">
          {/* Price chart card */}
          <Card className="border-primary/20 bg-black/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-silver-bright text-xl">{activeToken} Price</CardTitle>
                <CardDescription>
                  {loading || !marketData || !marketData[activeToken] ? (
                    <Skeleton className="h-6 w-32 bg-primary/10" />
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-silver-bright">${marketData[activeToken]?.current_price.toLocaleString()}</span>
                      <Badge 
                        className={`ml-2 ${marketData[activeToken]?.price_change_percentage_24h >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}
                      >
                        {marketData[activeToken]?.price_change_percentage_24h >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {Math.abs(marketData[activeToken]?.price_change_percentage_24h || 0).toFixed(2)}%
                      </Badge>
                    </>
                  )}
                </CardDescription>
              </div>
              
              <Tabs defaultValue="24h" className="w-[200px]">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="1h">1h</TabsTrigger>
                  <TabsTrigger value="24h">24h</TabsTrigger>
                  <TabsTrigger value="7d">7d</TabsTrigger>
                  <TabsTrigger value="30d">30d</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full bg-primary/10" />
              ) : (
                <div className="h-[300px]">
                  <PriceChart token={activeToken} />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Volume and Active Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Volume chart */}
            <Card className="border-primary/20 bg-black/40">
              <CardHeader>
                <CardTitle className="text-silver-bright">Trading Volume</CardTitle>
                {loading || !marketData || !marketData[activeToken] ? (
                  <Skeleton className="h-5 w-32 bg-primary/10" />
                ) : (
                  <CardDescription className="flex items-center">
                    <span className="text-lg font-semibold">${(marketData[activeToken]?.total_volume / 1000000).toFixed(2)}M</span>
                    <Badge 
                      className={`ml-2 ${(marketData[activeToken]?.market_cap_change_percentage_24h || 0) >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}
                    >
                      {(marketData[activeToken]?.market_cap_change_percentage_24h || 0) >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {Math.abs(marketData[activeToken]?.market_cap_change_percentage_24h || 0).toFixed(2)}%
                    </Badge>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[150px] w-full bg-primary/10" />
                ) : (
                  <div className="h-[150px]">
                    <VolumeChart token={activeToken} />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Market Stats */}
            <Card className="border-primary/20 bg-black/40">
              <CardHeader>
                <CardTitle className="text-silver-bright">Market Stats</CardTitle>
                {loading || !marketData || !marketData[activeToken] ? (
                  <Skeleton className="h-5 w-32 bg-primary/10" />
                ) : (
                  <CardDescription className="flex items-center">
                    <span className="text-lg font-semibold">Rank #{marketData[activeToken]?.market_cap_rank || '?'}</span>
                    <Badge 
                      variant="outline" 
                      className="ml-2 border-primary/30"
                    >
                      {marketData[activeToken]?.symbol?.toUpperCase() || activeToken}
                    </Badge>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[150px] w-full bg-primary/10" />
                ) : (
                  <div className="h-[150px]">
                    <MarketStats token={activeToken} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* News feed */}
          <Card className="border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="text-silver-bright flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Latest {activeToken} News & Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="mb-4">
                      <Skeleton className="h-6 w-full bg-primary/10 mb-2" />
                      <Skeleton className="h-4 w-3/4 bg-primary/10" />
                    </div>
                  ))}
                </>
              ) : (
                <div className="space-y-4">
                  {news.map((item, index) => (
                    <div key={index} className="border-b border-primary/10 pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-silver-bright font-medium">{item.title}</h4>
                        <Badge 
                          className={
                            item.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-300' : 
                            item.sentiment === 'negative' ? 'bg-rose-500/20 text-rose-300' : 
                            'bg-primary/20 text-primary'
                          }
                        >
                          {item.sentiment}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.source}</span>
                        <span>{getTimeSince(item.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-primary/30">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full News Feed
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right column - Sentiment and AI insights */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sentiment gauge */}
          <Card className="border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="text-silver-bright">Overall Sentiment</CardTitle>
              <CardDescription>Combined social & news sentiment</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {loading || !contextSentimentData || !contextSentimentData[activeToken] ? (
                <Skeleton className="h-[200px] w-[200px] rounded-full bg-primary/10" />
              ) : (
                <div className="h-[200px]">
                  <SentimentGauge sentiment={contextSentimentData[activeToken]?.overall || 0} />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Social</p>
                <p className={`font-medium ${(contextSentimentData && contextSentimentData[activeToken]?.social || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {contextSentimentData && contextSentimentData[activeToken]?.social ? Math.abs(contextSentimentData[activeToken].social).toFixed(1) : 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Twitter</p>
                <p className={`font-medium ${(contextSentimentData && contextSentimentData[activeToken]?.sources?.twitter || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {contextSentimentData && contextSentimentData[activeToken]?.sources?.twitter ? Math.abs(contextSentimentData[activeToken].sources.twitter).toFixed(1) : 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">News</p>
                <p className={`font-medium ${(contextSentimentData && contextSentimentData[activeToken]?.sources?.news || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {contextSentimentData && contextSentimentData[activeToken]?.sources?.news ? Math.abs(contextSentimentData[activeToken].sources.news).toFixed(1) : 0}%
                </p>
              </div>
            </CardFooter>
          </Card>
          
          {/* Topics */}
          <div className="grid grid-cols-2 gap-4">
            {/* Positive topics */}
            <Card className="border-primary/20 bg-black/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-silver-bright text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-emerald-400" />
                  Bullish Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !contextSentimentData || !contextSentimentData[activeToken] ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full bg-primary/10 mb-2" />
                    ))}
                  </>
                ) : (
                  <ul className="text-xs space-y-1">
                    {contextSentimentData[activeToken]?.positiveTopics.map((topic, i) => (
                      <li key={i} className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            {/* Negative topics */}
            <Card className="border-primary/20 bg-black/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-silver-bright text-sm flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2 text-rose-400" />
                  Bearish Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !contextSentimentData || !contextSentimentData[activeToken] ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full bg-primary/10 mb-2" />
                    ))}
                  </>
                ) : (
                  <ul className="text-xs space-y-1">
                    {contextSentimentData[activeToken]?.negativeTopics.map((topic, i) => (
                      <li key={i} className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-2"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* AI Insights */}
          <Card className="border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="text-silver-bright flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" />
                AI Analysis
              </CardTitle>
              {contextAiInsights && contextAiInsights[activeToken] && (
                <CardDescription className="flex justify-between items-center">
                  <span>Generated recently</span>
                  <Badge className="bg-primary/20 text-primary">
                    {contextAiInsights[activeToken]?.confidence.toFixed(0)}% Confidence
                  </Badge>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loading || !contextAiInsights || !contextAiInsights[activeToken] ? (
                <>
                  <Skeleton className="h-5 w-full bg-primary/10 mb-2" />
                  <Skeleton className="h-5 w-full bg-primary/10 mb-2" />
                  <Skeleton className="h-5 w-full bg-primary/10 mb-2" />
                  <Skeleton className="h-5 w-3/4 bg-primary/10 mb-4" />
                  <Skeleton className="h-4 w-full bg-primary/10 mb-2" />
                  <Skeleton className="h-4 w-full bg-primary/10 mb-2" />
                </>
              ) : (
                <>
                  <p className="text-silver-bright mb-4">{contextAiInsights[activeToken]?.conclusion}</p>
                  
                  <h4 className="font-medium text-sm text-silver-bright mb-2">Key Factors</h4>
                  <div className="space-y-3 mb-4">
                    <div>
                      <h5 className="text-xs text-emerald-400 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Bullish
                      </h5>
                      <ul className="text-xs space-y-1 mt-1">
                        {contextAiInsights[activeToken]?.bullishFactors.map((factor, i) => (
                          <li key={i} className="flex items-center">
                            <span className="h-1 w-1 rounded-full bg-emerald-400 mr-2"></span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-xs text-rose-400 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Bearish
                      </h5>
                      <ul className="text-xs space-y-1 mt-1">
                        {contextAiInsights[activeToken]?.bearishFactors.map((factor, i) => (
                          <li key={i} className="flex items-center">
                            <span className="h-1 w-1 rounded-full bg-rose-400 mr-2"></span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-sm text-silver-bright mb-1">AI Recommendation</h4>
                  <p className="text-xs">{contextAiInsights[activeToken]?.recommendation}</p>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full border-primary/30" 
                onClick={refreshAllData}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Generating...' : 'Generate New Analysis'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
