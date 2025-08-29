import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Brain, DollarSign, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

const AnalyticsHub = () => {
  const [sentiment, setSentiment] = useState(72);
  const [aiInsight, setAiInsight] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const insights = [
      "Ethereum shows bullish sentiment with +12% price surge, supported by strong liquidity pools",
      "Bitcoin momentum building with institutional accumulation patterns detected",
      "DeFi sector showing consolidation phase with selective altcoin strength"
    ];
    
    const startTyping = () => {
      setIsTyping(true);
      setAiInsight("");
      const insight = insights[Math.floor(Math.random() * insights.length)];
      
      let i = 0;
      const typeWriter = () => {
        if (i < insight.length) {
          setAiInsight(insight.slice(0, i + 1));
          i++;
          setTimeout(typeWriter, 50);
        } else {
          setIsTyping(false);
        }
      };
      typeWriter();
    };

    startTyping();
    const interval = setInterval(startTyping, 8000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Price", value: "$2,847.32", change: "+4.2%", trending: "up" },
    { label: "Volume", value: "$1.2B", change: "+12.1%", trending: "up" },
    { label: "24h High", value: "$2,891.45", change: "", trending: "neutral" },
    { label: "Market Cap", value: "$342.8B", change: "-0.8%", trending: "down" },
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
            Advanced on-chain and off-chain data analysis powered by AI insights
          </p>
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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.map((stat, index) => (
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
                          stat.trending === "up" ? "text-green-400" : "text-red-400"
                        }`}>
                          {stat.trending === "up" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {stat.change}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{sentiment}%</div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    Bullish
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sentiment Score</span>
                    <span className="text-silver">{sentiment}/100</span>
                  </div>
                  <Progress value={sentiment} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">News</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Positive</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Social Media</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Neutral</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">On-chain</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Strong</Badge>
                  </div>
                </div>
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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-card-glass/50 border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-2">Latest Insight</div>
                  <div className="text-silver min-h-[60px] leading-relaxed">
                    {aiInsight}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-card-glass/30">
                    <BarChart3 className="h-6 w-6 text-primary mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">Technical Score</div>
                    <div className="font-semibold text-primary">8.2/10</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card-glass/30">
                    <Brain className="h-6 w-6 text-primary mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">Risk Level</div>
                    <div className="font-semibold text-yellow-400">Medium</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsHub;