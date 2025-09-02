import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WaitingListCounter from "@/components/WaitingListCounter";
import { 
  Zap, 
  Shield, 
  Network, 
  Brain, 
  ArrowRight, 
  Wallet, 
  TrendingUp,
  Target,
  Activity
} from "lucide-react";

const NeuroTrader = () => {
  const features = [
    {
      icon: Zap,
      title: "Gasless Transactions",
      description: "0xgasless AgentKit + Paymaster integration"
    },
    {
      icon: Shield,
      title: "Smart Accounts",
      description: "ERC-4337 compliant smart contract wallets"
    },
    {
      icon: Network,
      title: "Bundler Execution",
      description: "Multi-chain: Avax, Moonbeam, Fantom"
    }
  ];

  const strategies = [
    {
      title: "Dynamic Sizing",
      description: "AI-controlled position scaling based on market conditions",
      color: "text-blue-400"
    },
    {
      title: "Dynamic Exiting",
      description: "Intelligent partial profit-taking strategies",
      color: "text-green-400"
    },
    {
      title: "Risk Management",
      description: "AI-powered stop loss and risk assessment",
      color: "text-yellow-400"
    }
  ];

  const flowSteps = [
    { icon: Wallet, title: "Connect Wallet", status: "connected" },
    { icon: Brain, title: "AI Analysis", status: "analyzing" },
    { icon: Target, title: "Strategy Selection", status: "pending" },
    { icon: Activity, title: "Execution", status: "pending" },
    { icon: TrendingUp, title: "Portfolio Update", status: "pending" }
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
            Meet <span className="gradient-text">NeuroTrader</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI Trading Agent powered by advanced algorithms and gasless execution
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-silver-bright mb-4">Why Choose NeuroTrader</h3>
              <p className="text-muted-foreground">
                Our AI-powered trading platform uses neural networks and advanced algorithms to provide you with
                unparalleled market insights and trading opportunities. Reserve your spot today for early access.
              </p>
            </div>
          </div>
          <div className="lg:col-span-4">
            <WaitingListCounter />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-silver-bright">Core Features</h3>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-lg glass border border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-silver-bright mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-silver-bright">Advanced Strategies</h3>
              {strategies.map((strategy, index) => (
                <motion.div
                  key={strategy.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="p-4 rounded-lg glass border border-primary/20"
                >
                  <h4 className={`font-semibold mb-2 ${strategy.color}`}>{strategy.title}</h4>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button variant="hero" size="lg" className="w-full group">
                Launch NeuroTrader
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Workflow */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="glass border-primary/20 p-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-center text-silver-bright">AI Trading Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {flowSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-card-glass/50 border border-primary/20">
                      <div className={`p-3 rounded-full ${
                        step.status === "connected" ? "bg-green-500/20 border-green-500/50" :
                        step.status === "analyzing" ? "bg-primary/20 border-primary/50 animate-pulse" :
                        "bg-muted/20 border-muted/50"
                      } border`}>
                        <step.icon className={`h-5 w-5 ${
                          step.status === "connected" ? "text-green-400" :
                          step.status === "analyzing" ? "text-primary" :
                          "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-silver">{step.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`mt-1 ${
                            step.status === "connected" ? "border-green-500/50 text-green-400" :
                            step.status === "analyzing" ? "border-primary/50 text-primary" :
                            "border-muted/50 text-muted-foreground"
                          }`}
                        >
                          {step.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {index < flowSteps.length - 1 && (
                      <div className="absolute left-8 top-full w-0.5 h-6 bg-gradient-to-b from-primary/50 to-transparent" />
                    )}
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="p-4 rounded-lg bg-primary/10 border border-primary/30 mt-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">AI Status</span>
                  </div>
                  <p className="text-sm text-silver animate-typing">
                    Analyzing Ethereum market sentiment and volatility patterns...
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NeuroTrader;