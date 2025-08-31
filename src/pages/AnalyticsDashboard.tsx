import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Timer,
  Globe,
  Filter,
  Search,
  Calendar,
  PieChart,
  DollarSign,
  Users,
  Zap
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

// Enhanced types
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
  overall: number;
  social: number;
  news: number;
  positiveTopics: string[];
  negativeTopics: string[];
  sentimentHistory?: Array<{date: string; value: number}>;
};

type NewsItem = {
  title: string;
  url: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  timestamp: number;
  impact?: "high" | "medium" | "low";
};

type AIInsight = {
  conclusion: string;
  bullishFactors: string[];
  bearishFactors: string[];
  recommendation: string;
  confidence: number;
  riskLevel?: "low" | "medium" | "high";
  priceTarget?: number;
  timeHorizon?: string;
};

// Make sure AIInsightResponse has the same properties as AIInsight type
interface AIInsightResponse {
  conclusion: string;
  bullishFactors: string[];
  bearishFactors: string[];
  recommendation: string;
  confidence: number;
  riskLevel?: "low" | "medium" | "high";
  priceTarget?: number;
  timeHorizon?: string;
}

type TimeframeOption = {
  value: string;
  label: string;
  hours: number;
};

const AnalyticsDashboard: React.FC = () => {
  const [activeToken, setActiveToken] = useState<string>("ETH");
  const [timeframe, setTimeframe] = useState<string>("24h");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [newsFilter, setNewsFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  
  const contextData = useData();
  const { 
    marketData, 
    priceData, 
    volumeData, 
    sentimentData: contextSentimentData, 
    aiInsights: contextAiInsights, 
    loading 
  } = contextData;
  
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const walletAddress = useAddress();
  
  const tokens = ["ETH", "BTC", "AVAX", "SOL", "GLMR", "FTM"];
  
  const timeframeOptions: TimeframeOption[] = [
    { value: "1h", label: "1H", hours: 1 },
    { value: "24h", label: "24H", hours: 24 },
    { value: "7d", label: "7D", hours: 168 },
    { value: "30d", label: "30D", hours: 720 }
  ];

  // Enhanced mock news generator with more realistic data
  const generateMockNews = useCallback((token: string): NewsItem[] => {
    const baseNews = {
      ETH: [
        { title: "Ethereum Foundation Announces Major Protocol Upgrade", sentiment: "positive" as const, impact: "high" as const },
        { title: "Layer 2 Solutions See Record Transaction Volume on Ethereum", sentiment: "positive" as const, impact: "medium" as const },
        { title: "Institutional Adoption of Ethereum Staking Reaches New Milestone", sentiment: "positive" as const, impact: "high" as const },
        { title: "Regulatory Concerns Surface Around Ethereum's Proof-of-Stake Model", sentiment: "negative" as const, impact: "medium" as const },
      ],
      BTC: [
        { title: "Bitcoin ETF Sees Record Inflows This Quarter", sentiment: "positive" as const, impact: "high" as const },
        { title: "Mining Difficulty Adjustment Impacts Network Security", sentiment: "neutral" as const, impact: "medium" as const },
        { title: "Central Bank Digital Currencies Could Challenge Bitcoin Adoption", sentiment: "negative" as const, impact: "high" as const },
        { title: "Lightning Network Reaches 5,000 Node Milestone", sentiment: "positive" as const, impact: "medium" as const },
      ],
      AVAX: [
        { title: "Avalanche Partners with Major Financial Institution", sentiment: "positive" as const, impact: "high" as const },
        { title: "Developer Activity on Avalanche Reaches All-Time High", sentiment: "positive" as const, impact: "medium" as const },
        { title: "New DeFi Protocol on Avalanche Sees $100M TVL", sentiment: "positive" as const, impact: "high" as const },
        { title: "Network Congestion Issues Reported During Peak Hours", sentiment: "negative" as const, impact: "low" as const },
      ]
    };

    const tokenNews = baseNews[token as keyof typeof baseNews] || [
      { title: `${token} Technical Analysis Shows Bullish Patterns`, sentiment: "positive" as const, impact: "medium" as const },
      { title: `${token} Trading Volume Increases 40% Week-over-Week`, sentiment: "positive" as const, impact: "medium" as const },
      { title: `Market Volatility Affects ${token} Price Action`, sentiment: "negative" as const, impact: "low" as const },
    ];

    const sources = ["CoinDesk", "CryptoNews", "BlockchainInsider", "TokenInsight", "DeFiPulse"];
    
    return tokenNews.map((newsItem, index) => ({
      ...newsItem,
      url: "#",
      source: sources[index % sources.length],
      timestamp: Date.now() - (index + 1) * 3600000 - Math.random() * 86400000,
    }));
  }, []);

  // Memoized filtered news
  const filteredNews = useMemo(() => {
    if (newsFilter === "all") return news;
    return news.filter(item => item.sentiment === newsFilter);
  }, [news, newsFilter]);

  // Enhanced refresh function with error handling
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      // Refresh context data
      await contextData.refreshData();
      
      // Refresh local news data
      const mockNews = generateMockNews(activeToken);
      setNews(mockNews);
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error refreshing data:", error);
      setRefreshError(error instanceof Error ? error.message : "Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  }, [contextData, activeToken, generateMockNews]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshAllData();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshAllData]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(loading || !marketData || !marketData[activeToken]);
      
      const mockNews = generateMockNews(activeToken);
      setNews(mockNews);
    };
    
    loadInitialData();
  }, [activeToken, marketData, loading, generateMockNews]);

  // Utility functions
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', { 
      notation: num >= 1000000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      notation: num >= 1000000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(num);
  };

  const getTimeSince = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-rose-400';
      default: return 'text-primary';
    }
  };

  const currentTokenData = marketData?.[activeToken];
  const currentSentimentData = contextSentimentData?.[activeToken];
  const currentAIInsights = contextAiInsights?.[activeToken];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <motion.h1 
            className="text-4xl font-bold gradient-text mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Analytics Dashboard
          </motion.h1>
          <p className="text-silver flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            AI-powered blockchain analytics and insights
          </p>
          <div className="flex items-center mt-2 text-sm text-silver/70">
            <Timer className="h-3 w-3 mr-1" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0">
          <Button 
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="border-primary/30"
          >
            <Zap className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button 
            variant="outline" 
            className="border-primary/30" 
            onClick={refreshAllData}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          
          {!walletAddress && (
            <Button variant="hero">
              <Users className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {refreshError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <Alert className="border-rose-500/20 bg-rose-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {refreshError}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Token Selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tokens.map((token) => (
          <motion.div
            key={token}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={token === activeToken ? "default" : "outline"}
              className={`min-w-[80px] ${
                token === activeToken 
                  ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                  : 'border-primary/30 hover:border-primary/60'
              }`}
              onClick={() => setActiveToken(token)}
            >
              {token}
              {currentTokenData && token === activeToken && (
                <Badge 
                  className={`ml-2 ${
                    (currentTokenData.price_change_percentage_24h || 0) >= 0 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {(currentTokenData.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                  {(currentTokenData.price_change_percentage_24h || 0).toFixed(1)}%
                </Badge>
              )}
            </Button>
          </motion.div>
        ))}
      </div>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Charts and Analysis */}
        <div className="lg:col-span-8 space-y-6">
          {/* Enhanced Price Chart */}
          <Card className="border-primary/20 bg-black/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="text-silver-bright text-2xl flex items-center">
                  <DollarSign className="h-6 w-6 mr-2 text-primary" />
                  {activeToken} Price
                </CardTitle>
                <CardDescription>
                  {loading || !currentTokenData ? (
                    <Skeleton className="h-8 w-48 bg-primary/10" />
                  ) : (
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl font-bold text-silver-bright">
                        {formatCurrency(currentTokenData.current_price)}
                      </span>
                      <Badge 
                        className={`${
                          (currentTokenData.price_change_percentage_24h || 0) >= 0 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {(currentTokenData.price_change_percentage_24h || 0) >= 0 
                          ? <ArrowUpRight className="h-4 w-4 mr-1" /> 
                          : <ArrowDownRight className="h-4 w-4 mr-1" />
                        }
                        {Math.abs(currentTokenData.price_change_percentage_24h || 0).toFixed(2)}%
                      </Badge>
                      <span className="text-sm text-silver/70">
                        24h: {formatCurrency(Math.abs((currentTokenData.price_change_24h || 0)))}
                      </span>
                    </div>
                  )}
                </CardDescription>
              </div>
              
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList className="grid grid-cols-4 bg-black/60">
                  {timeframeOptions.map(option => (
                    <TabsTrigger key={option.value} value={option.value}>
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full bg-primary/10 rounded-lg" />
              ) : (
                <div className="h-[400px] relative">
                  <PriceChart token={activeToken} timeframe={timeframe} />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Volume Chart */}
            <Card className="border-primary/20 bg-black/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-silver-bright flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Volume (24h)
                </CardTitle>
                {loading || !currentTokenData ? (
                  <Skeleton className="h-6 w-32 bg-primary/10" />
                ) : (
                  <CardDescription className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-silver-bright">
                      {formatCurrency(currentTokenData.total_volume)}
                    </span>
                    <Badge 
                      className={`${
                        (currentTokenData.market_cap_change_percentage_24h || 0) >= 0 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {(currentTokenData.market_cap_change_percentage_24h || 0) >= 0 ? '+' : ''}
                      {(currentTokenData.market_cap_change_percentage_24h || 0).toFixed(1)}%
                    </Badge>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[120px] w-full bg-primary/10" />
                ) : (
                  <div className="h-[120px]">
                    <VolumeChart token={activeToken} />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Market Cap */}
            <Card className="border-primary/20 bg-black/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-silver-bright flex items-center text-lg">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Market Cap
                </CardTitle>
                {loading || !currentTokenData ? (
                  <Skeleton className="h-6 w-32 bg-primary/10" />
                ) : (
                  <CardDescription>
                    <span className="text-xl font-bold text-silver-bright">
                      {formatCurrency(currentTokenData.market_cap)}
                    </span>
                    <div className="text-sm text-silver/70 mt-1">
                      Rank #{currentTokenData.market_cap_rank || '?'}
                    </div>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[120px] w-full bg-primary/10" />
                ) : (
                  <div className="h-[120px]">
                    <MarketStats token={activeToken} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Stats */}
            <Card className="border-primary/20 bg-black/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-silver-bright flex items-center text-lg">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  Additional Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading || !currentTokenData ? (
                  <>
                    <Skeleton className="h-4 w-full bg-primary/10" />
                    <Skeleton className="h-4 w-full bg-primary/10" />
                    <Skeleton className="h-4 w-full bg-primary/10" />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-silver/70">24h High</span>
                      <span className="text-sm font-medium">{formatCurrency(currentTokenData.high_24h || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-silver/70">24h Low</span>
                      <span className="text-sm font-medium">{formatCurrency(currentTokenData.low_24h || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-silver/70">Supply</span>
                      <span className="text-sm font-medium">{formatNumber(currentTokenData.circulating_supply || 0)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Enhanced News Section */}
          <Card className="border-primary/20 bg-black/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-silver-bright flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Latest {activeToken} News & Analysis
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={newsFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewsFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={newsFilter === "positive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewsFilter("positive")}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  Positive
                </Button>
                <Button
                  variant={newsFilter === "negative" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewsFilter("negative")}
                  className="text-rose-400 hover:text-rose-300"
                >
                  Negative
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-full bg-primary/10" />
                      <Skeleton className="h-4 w-3/4 bg-primary/10" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredNews.map((item, index) => (
                      <motion.div 
                        key={`${item.title}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-b border-primary/10 pb-4 last:border-b-0 hover:bg-primary/5 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-silver-bright font-medium leading-snug">{item.title}</h4>
                          <div className="flex gap-2">
                            {item.impact && (
                              <Badge variant="outline" className="text-xs border-primary/30">
                                {item.impact} impact
                              </Badge>
                            )}
                            <Badge 
                              className={`text-xs ${
                                item.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-300' : 
                                item.sentiment === 'negative' ? 'bg-rose-500/20 text-rose-300' : 
                                'bg-primary/20 text-primary'
                              }`}
                            >
                              {item.sentiment}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-silver/70">
                          <span className="flex items-center">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {item.source}
                          </span>
                          <span>{getTimeSince(item.timestamp)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Sentiment and AI */}
        <div className="lg:col-span-4 space-y-6">
          {/* Enhanced Sentiment Gauge */}
          <Card className="border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="text-silver-bright flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" />
                Market Sentiment
              </CardTitle>
              <CardDescription>Real-time social and news sentiment analysis</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {loading || !currentSentimentData ? (
                <Skeleton className="h-[200px] w-[200px] rounded-full bg-primary/10" />
              ) : (
                <div className="h-[200px]">
                  <SentimentGauge sentiment={currentSentimentData.overall || 0} />
                </div>
              )}
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-silver/70">Social</p>
                <p className={`font-bold ${(currentSentimentData?.social || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentSentimentData?.social ? Math.abs(currentSentimentData.social).toFixed(0) : 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-silver/70">News</p>
                <p className={`font-bold ${(currentSentimentData?.news || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentSentimentData?.news ? Math.abs(currentSentimentData.news).toFixed(0) : 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-silver/70">Overall</p>
                <p className={`font-bold ${(currentSentimentData?.overall || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentSentimentData?.overall ? Math.abs(currentSentimentData.overall).toFixed(0) : 0}
                </p>
              </div>
            </CardFooter>
          </Card>
          
          {/* Enhanced Topics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-primary/20 bg-black/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-silver-bright text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-emerald-400" />
                  Bullish Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !currentSentimentData ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-3 w-full bg-primary/10" />
                    ))}
                  </div>
                ) : (
                  <ul className="text-xs space-y-1">
                    {currentSentimentData.positiveTopics.slice(0, 4).map((topic, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2"></span>
                        {topic}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            {/* Bearish Signals */}
            <Card className="border-primary/20 bg-black/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-silver-bright text-sm flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2 text-rose-400" />
                  Bearish Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !currentSentimentData ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-3 w-full bg-primary/10" />
                    ))}
                  </div>
                ) : (
                  <ul className="text-xs space-y-1">
                    {currentSentimentData.negativeTopics.slice(0, 4).map((topic, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-2"></span>
                        {topic}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Enhanced AI Insights */}
          <Card className="border-primary/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-silver-bright flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Market Analysis
              </CardTitle>
              {currentAIInsights && (
                <CardDescription className="flex justify-between items-center">
                  <span className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    Updated {getTimeSince(Date.now() - 300000)}
                  </span>
                  <div className="flex gap-2">
                    <Badge className="bg-primary/20 text-primary">
                      {currentAIInsights.confidence.toFixed(0)}% Confidence
                    </Badge>
                    {currentAIInsights.riskLevel && (
                      <Badge 
                        className={`${
                          currentAIInsights.riskLevel === 'low' ? 'bg-emerald-500/20 text-emerald-300' :
                          currentAIInsights.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {currentAIInsights.riskLevel} risk
                      </Badge>
                    )}
                  </div>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loading || !currentAIInsights ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full bg-primary/10" />
                  <Skeleton className="h-5 w-full bg-primary/10" />
                  <Skeleton className="h-5 w-3/4 bg-primary/10" />
                  <div className="space-y-2 mt-4">
                    <Skeleton className="h-4 w-full bg-primary/10" />
                    <Skeleton className="h-4 w-full bg-primary/10" />
                    <Skeleton className="h-4 w-2/3 bg-primary/10" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-silver-bright leading-relaxed">{currentAIInsights.conclusion}</p>
                    {currentAIInsights.priceTarget && (
                      <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-silver/70">Price Target</span>
                          <span className="font-bold text-primary">{formatCurrency(currentAIInsights.priceTarget)}</span>
                        </div>
                        {currentAIInsights.timeHorizon && (
                          <div className="text-xs text-silver/60 mt-1">
                            Timeframe: {currentAIInsights.timeHorizon}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm text-emerald-400 flex items-center mb-2">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Bullish Factors
                      </h5>
                      <ul className="space-y-1">
                        {currentAIInsights.bullishFactors.map((factor, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start text-xs"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 mt-1.5 flex-shrink-0"></span>
                            <span className="leading-relaxed">{factor}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm text-rose-400 flex items-center mb-2">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Bearish Factors
                      </h5>
                      <ul className="space-y-1">
                        {currentAIInsights.bearishFactors.map((factor, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start text-xs"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-2 mt-1.5 flex-shrink-0"></span>
                            <span className="leading-relaxed">{factor}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-black/30 rounded-lg">
                    <h5 className="text-sm text-silver-bright mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI Recommendation
                    </h5>
                    <p className="text-xs leading-relaxed text-silver/90">{currentAIInsights.recommendation}</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border-primary/30 hover:bg-primary/10" 
                onClick={refreshAllData}
                disabled={isRefreshing}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Analyzing...' : 'Refresh Analysis'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-primary/30"
                disabled
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Performance Summary */}
          <Card className="border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="text-silver-bright flex items-center text-lg">
                <LineChart className="h-5 w-5 mr-2 text-primary" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading || !currentTokenData ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-primary/10" />
                  <Skeleton className="h-4 w-full bg-primary/10" />
                  <Skeleton className="h-4 w-3/4 bg-primary/10" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-silver/70">24h Performance</span>
                    <div className="flex items-center">
                      {(currentTokenData.price_change_percentage_24h || 0) >= 0 ? 
                        <ArrowUpRight className="h-4 w-4 text-emerald-400 mr-1" /> : 
                        <ArrowDownRight className="h-4 w-4 text-rose-400 mr-1" />
                      }
                      <span className={`font-medium ${
                        (currentTokenData.price_change_percentage_24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {(currentTokenData.price_change_percentage_24h || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-silver/70">Volume Trend</span>
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 text-primary mr-1" />
                      <span className="font-medium text-primary">
                        {formatCurrency(currentTokenData.total_volume)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-silver/70">Market Sentiment</span>
                    <div className="flex items-center">
                      {(currentSentimentData?.overall || 0) > 0 ? 
                        <TrendingUp className="h-4 w-4 text-emerald-400 mr-1" /> : 
                        <TrendingDown className="h-4 w-4 text-rose-400 mr-1" />
                      }
                      <span className={`font-medium ${
                        (currentSentimentData?.overall || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {(currentSentimentData?.overall || 0) > 0 ? 'Bullish' : 'Bearish'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;