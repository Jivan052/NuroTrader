import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Brain, DollarSign, BarChart3, RefreshCw, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchTokenData } from "@/services/api-integration";
import { formatCurrency, formatPercentChange } from "@/services/coingecko";
import { AIInsightResponse } from "@/services/gemini";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Extended AIInsightResponse to match the one used in AnalyticsDashboard
interface ExtendedAIInsightResponse extends AIInsightResponse {
  riskLevel?: "low" | "medium" | "high";
  priceTarget?: number;
  timeHorizon?: string;
}

const AnalyticsHub = () => {
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [timeframe, setTimeframe] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [marketData, setMarketData] = useState<any>(null);
  const [sentiment, setSentiment] = useState(72);
  const [aiInsight, setAiInsight] = useState<ExtendedAIInsightResponse | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typedConclusion, setTypedConclusion] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch data from API integration service
        const data = await fetchTokenData(selectedToken, timeframe);
        console.log(`AnalyticsHub: Fetched data for ${selectedToken}:`, {
          hasMarketData: !!data.marketData, 
          hasSentiment: !!data.sentimentData, 
          hasAiInsights: !!data.aiInsights
        });
        
        // Set market data
        setMarketData(data.marketData);
        
        // Set sentiment data if available
        if (data.sentimentData) {
          // Normalize sentiment from -100 to 100 scale to 0-100 for UI display
          const normalizedSentiment = Math.round((data.sentimentData.overall + 100) / 2);
          setSentiment(normalizedSentiment);
        }
        
        // Set AI insight data - ensure we have AI insights
        if (data.aiInsights) {
          console.log(`AnalyticsHub: Setting AI insights for ${selectedToken}:`, data.aiInsights);
          setAiInsight(data.aiInsights);
          
          // Start typing animation for conclusion
          animateTyping(data.aiInsights.conclusion);
        } else {
          console.warn(`AnalyticsHub: No AI insights available for ${selectedToken}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedToken, timeframe]);
  
  // Animate typing effect for AI insights
  const animateTyping = (text: string) => {
    setIsTyping(true);
    setTypedConclusion("");
    
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        setTypedConclusion(text.slice(0, i + 1));
        i++;
        setTimeout(typeWriter, 30);
      } else {
        setIsTyping(false);
      }
    };
    
    typeWriter();
  };

  // Prepare stats from market data or use placeholder when loading
  const stats = marketData ? [
    { 
      label: "Price", 
      value: formatCurrency(marketData.current_price),
      change: formatPercentChange(marketData.price_change_percentage_24h),
      trending: marketData.price_change_percentage_24h >= 0 ? "up" : "down" 
    },
    { 
      label: "Volume", 
      value: formatCurrency(marketData.total_volume),
      change: formatPercentChange(marketData.market_cap_change_percentage_24h), // Using as proxy for volume change
      trending: marketData.market_cap_change_percentage_24h >= 0 ? "up" : "down" 
    },
    { 
      label: "24h High", 
      value: formatCurrency(marketData.high_24h),
      change: "",
      trending: "neutral" 
    },
    { 
      label: "Market Cap", 
      value: formatCurrency(marketData.market_cap),
      change: formatPercentChange(marketData.market_cap_change_percentage_24h),
      trending: marketData.market_cap_change_percentage_24h >= 0 ? "up" : "down" 
    },
  ] : [
    { label: "Price", value: "Loading...", change: "", trending: "neutral" },
    { label: "Volume", value: "Loading...", change: "", trending: "neutral" },
    { label: "24h High", value: "Loading...", change: "", trending: "neutral" },
    { label: "Market Cap", value: "Loading...", change: "", trending: "neutral" },
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">Real-Time</span>{" "}
            <span className="text-silver-bright">Blockchain Analytics</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced on-chain and off-chain data analysis powered by Gemini AI
          </p>
          
          {/* Token selector and timeframe */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex gap-2 border border-primary/20 rounded-lg overflow-hidden">
              {["BTC", "ETH", "SOL", "AVAX"].map((token) => (
                <button
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={`px-4 py-2 text-sm ${
                    selectedToken === token
                      ? "bg-primary text-background font-semibold"
                      : "text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 border border-primary/20 rounded-lg overflow-hidden">
              {["24h", "7d", "30d"].map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeframe(time)}
                  className={`px-4 py-2 text-sm ${
                    timeframe === time
                      ? "bg-primary text-background font-semibold"
                      : "text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setLoading(true);
                      // Re-trigger the useEffect by forcing a state update
                      setSelectedToken(prev => prev);
                    }}
                    className="p-2 border border-primary/20 rounded-lg text-primary hover:bg-primary/10"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* On-chain Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="glass border-primary/20 h-full hover:border-primary/40 transition-all duration-300 glow-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-silver-bright">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Onchain Stats
                  <Badge variant="outline" className="ml-auto text-xs">
                    CoinGecko
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-3 rounded-lg bg-card-glass/50">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-20" />
                          <div className="space-y-1 text-right">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-3 w-16 ml-auto" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center p-4 text-red-400">
                    <p>Failed to load market data</p>
                    <button 
                      onClick={() => setSelectedToken(prev => prev)}
                      className="text-sm text-primary mt-2 hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 rounded-lg bg-card-glass/50"
                    >
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <div className="text-right">
                        <div className="font-semibold text-silver-bright">{stat.value}</div>
                        {stat.change && (
                          <div className={`text-xs flex items-center gap-1 ${
                            stat.trending === "up" ? "text-green-400" : 
                            stat.trending === "down" ? "text-red-400" : "text-blue-400"
                          }`}>
                            {stat.trending === "up" ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : stat.trending === "down" ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {stat.change}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sentiment Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="glass border-primary/20 h-full hover:border-primary/40 transition-all duration-300 glow-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-silver-bright">
                  <Activity className="h-5 w-5 text-primary" />
                  Market Sentiment
                  <Badge variant="outline" className="ml-auto text-xs">
                    Santiment
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Skeleton className="h-8 w-20 mx-auto mb-2" />
                      <Skeleton className="h-6 w-24 mx-auto" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center p-4 text-red-400">
                    <p>Failed to load sentiment data</p>
                    <button 
                      onClick={() => setSelectedToken(prev => prev)}
                      className="text-sm text-primary mt-2 hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{sentiment}%</div>
                      <Badge 
                        variant="secondary" 
                        className={`${
                          sentiment >= 75 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                          sentiment >= 50 ? "bg-primary/20 text-primary border-primary/30" :
                          sentiment >= 25 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                          "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {sentiment >= 75 ? "Very Bullish" :
                         sentiment >= 50 ? "Bullish" :
                         sentiment >= 25 ? "Bearish" :
                         "Very Bearish"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sentiment Score</span>
                        <span className="text-silver">{sentiment}/100</span>
                      </div>
                      <Progress 
                        value={sentiment} 
                        className={`h-2 ${
                          sentiment >= 75 ? "bg-green-500/20" :
                          sentiment >= 50 ? "bg-primary/20" :
                          sentiment >= 25 ? "bg-yellow-500/20" :
                          "bg-red-500/20"
                        }`}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">News</span>
                        <Badge 
                          className={`${
                            sentiment >= 60 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                            sentiment >= 40 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                            "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {sentiment >= 60 ? "Positive" :
                           sentiment >= 40 ? "Neutral" : "Negative"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Social Media</span>
                        <Badge 
                          className={`${
                            sentiment >= 70 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                            sentiment >= 30 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                            "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {sentiment >= 70 ? "Positive" :
                           sentiment >= 30 ? "Neutral" : "Negative"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">On-chain</span>
                        <Badge 
                          className={`${
                            sentiment >= 65 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                            sentiment >= 35 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                            "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {sentiment >= 65 ? "Strong" :
                           sentiment >= 35 ? "Neutral" : "Weak"}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="glass border-primary/20 h-full hover:border-primary/40 transition-all duration-300 glow-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-silver-bright">
                  <Brain className="h-5 w-5 text-primary animate-pulse" />
                  AI Analysis
                  <Badge variant="outline" className="ml-auto text-xs">
                    Gemini
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-card-glass/50 border border-primary/20">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-card-glass/30">
                        <Skeleton className="h-6 w-6 mx-auto mb-1" />
                        <Skeleton className="h-3 w-20 mx-auto mb-1" />
                        <Skeleton className="h-5 w-12 mx-auto" />
                      </div>
                      <div className="text-center p-3 rounded-lg bg-card-glass/30">
                        <Skeleton className="h-6 w-6 mx-auto mb-1" />
                        <Skeleton className="h-3 w-20 mx-auto mb-1" />
                        <Skeleton className="h-5 w-12 mx-auto" />
                      </div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center p-4 text-red-400">
                    <p>Failed to load AI analysis</p>
                    <button 
                      onClick={() => setSelectedToken(prev => prev)}
                      className="text-sm text-primary mt-2 hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-lg bg-card-glass/50 border border-primary/20">
                      <div className="text-sm text-muted-foreground mb-2">AI Insight</div>
                      <div className="text-silver min-h-[60px] leading-relaxed">
                        {typedConclusion}
                        {isTyping && <span className="animate-pulse">|</span>}
                      </div>
                    </div>
                    
                    {aiInsight && aiInsight.bullishFactors && aiInsight.bearishFactors && (
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-xs text-emerald-400 flex items-center mb-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Bullish Factors
                          </h5>
                          <ul className="space-y-1">
                            {aiInsight.bullishFactors.slice(0, 2).map((factor, i) => (
                              <motion.li 
                                key={i}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start text-xs"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 mt-1 flex-shrink-0"></span>
                                <span className="leading-relaxed text-xs text-silver/90">{factor}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-xs text-rose-400 flex items-center mb-1">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Bearish Factors
                          </h5>
                          <ul className="space-y-1">
                            {aiInsight.bearishFactors.slice(0, 2).map((factor, i) => (
                              <motion.li 
                                key={i}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start text-xs"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5 mt-1 flex-shrink-0"></span>
                                <span className="leading-relaxed text-xs text-silver/90">{factor}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-card-glass/30">
                        <BarChart3 className="h-6 w-6 text-primary mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className={`font-semibold ${
                          !aiInsight ? "text-muted-foreground" :
                          aiInsight.confidence >= 80 ? "text-green-400" :
                          aiInsight.confidence >= 60 ? "text-primary" :
                          aiInsight.confidence >= 40 ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {!aiInsight ? "N/A" : 
                           aiInsight.confidence >= 80 ? "Very High" :
                           aiInsight.confidence >= 60 ? "High" :
                           aiInsight.confidence >= 40 ? "Medium" :
                           aiInsight.confidence >= 20 ? "Low" : "Very Low"}
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-card-glass/30">
                        <Brain className="h-6 w-6 text-primary mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">Recommendation</div>
                        <div className={`font-semibold ${
                          !aiInsight ? "text-muted-foreground" :
                          aiInsight.recommendation?.includes("BUY") ? "text-green-400" :
                          aiInsight.recommendation?.includes("HOLD") ? "text-yellow-400" :
                          aiInsight.recommendation?.includes("SELL") ? "text-red-400" :
                          "text-primary"
                        }`}>
                          {!aiInsight ? "N/A" :
                           aiInsight.recommendation?.includes("BUY") ? "BUY" :
                           aiInsight.recommendation?.includes("HOLD") ? "HOLD" :
                           aiInsight.recommendation?.includes("SELL") ? "SELL" :
                           aiInsight.recommendation?.split(" ")[0] || "N/A"}
                        </div>
                      </div>
                    </div>
                    
                    {aiInsight && (
                      <div className="text-xs text-muted-foreground text-right">
                        Analysis generated {aiInsight.generatedAt ? 
                          new Date(aiInsight.generatedAt).toLocaleTimeString() : 
                          "recently"}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Data attribution */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Data provided by <span className="text-primary">CoinGecko</span> and <span className="text-primary">Santiment</span>. 
            AI analysis powered by <span className="text-primary">Google Gemini</span>.
          </p>
          <p className="mt-1">
            <Badge variant="outline" className="text-xs border-primary/20">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              Real-time market intelligence
            </Badge>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsHub;