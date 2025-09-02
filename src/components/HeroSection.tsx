import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight, FileText, TrendingUp, Wallet, Play, Loader, User } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import networkBg from "@/assets/network-bg.jpg";
import { 
  useAddress, 
  useBalance, 
  useChain, 
  useConnectionStatus, 
  useDisconnect,
  useConnect,
  ConnectWallet
} from "@thirdweb-dev/react";

const HeroSection = () => {
  // ThirdWeb hooks to manage wallet connection and data
  const address = useAddress(); // Get connected wallet address
  const connectionStatus = useConnectionStatus(); // Get connection status
  const { data: balance } = useBalance(); // Get wallet balance
  const chain = useChain(); // Get current chain info
  const disconnect = useDisconnect(); // Function to disconnect wallet
  const connect = useConnect(); // Function to connect wallet

  const isConnected = connectionStatus === "connected" && address;
  
  // Format the wallet data for display
  const getWalletData = () => {
    if (!isConnected || !address) return null;
    
    return {
      address: address,
      chainId: chain ? Number(chain.chainId) : 1,
      balance: balance ? `${parseFloat(balance.displayValue).toFixed(4)} ${balance.symbol}` : "0.0000 ETH",
      chainName: chain?.name || "Ethereum",
      provider: "ThirdWeb"
    };
  };

  // Get formatted wallet data
  const walletData = getWalletData();
  
  // Add any effects you need here

  return (
    <TooltipProvider>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">{/* Added pt-16 for navbar space */}
        {/* Background with animated particles */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            src={networkBg} 
            alt="Network background" 
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          />
          
          {/* Enhanced floating particles */}
          {[...Array(12)].map((_, i) => {
            // Randomize particle size
            const size = 1 + Math.random() * 2;
            
            // Create more varied positions
            const xPos = 10 + (Math.random() * 80);
            const yPos = 10 + (Math.random() * 80);
            
            // Randomize animation duration
            const duration = 2 + Math.random() * 4;
            
            return (
              <motion.div
                key={i}
                className="absolute bg-primary rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${xPos}%`,
                  top: `${yPos}%`,
                  filter: `blur(${Math.random() > 0.7 ? "1px" : "0px"})`,
                  opacity: 0.2 + (Math.random() * 0.6)
                }}
                animate={{
                  y: [0, -15 - (Math.random() * 15), 0],
                  x: [0, (Math.random() * 10) - 5, 0],
                  scale: [1, 1 + (Math.random() * 0.5), 1],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span className="text-primary">Advanced</span><br />
                  <span className="text-silver-bright">Analytics &</span><br />
                  <span className="text-silver-bright">Trading</span><br />
                  <span className="text-silver text-4xl lg:text-5xl">for Web3</span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-silver max-w-xl leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Powered by <span className="text-primary font-semibold">0xgasless Agentkit</span>, 
                  <span className="text-primary font-semibold"> AI</span>, and 
                  <span className="text-primary font-semibold"> Real-Time Data</span>
                </motion.p>
              </div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {/* Using ThirdWeb's ConnectWallet button with custom styling */}
                {!isConnected ? (
                  <ConnectWallet 
                    theme="dark"
                    btnTitle="Connect Wallet"
                    modalSize="wide"
                    welcomeScreen={{
                      title: "NeuroTrader",
                      subtitle: "Connect your wallet to access your personalized AI trading analytics",
                    }}
                    modalTitle="Connect Your Wallet"
                  />
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button variant="hero" size="lg" className="group relative" asChild>
                            <Link to="/profile">
                              <span className="flex items-center">
                                {walletData?.address.substring(0, 6)}...{walletData?.address.substring(walletData.address.length - 4)}
                                <User className="ml-2 h-5 w-5" />
                              </span>
                              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                              </span>
                              <span className="sr-only">View Profile</span>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-background/90 backdrop-blur-sm border-primary/20">
                          <p>View your wallet profile</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="lg" className="group border-primary/20" onClick={disconnect}>
                            <span className="flex items-center">
                              <Wallet className="mr-2 h-5 w-5" />
                              Wallet
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-background/90 backdrop-blur-sm border-primary/20">
                          <p>Manage wallet connection</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  </div>
                )}
                <Button variant="silver" size="lg" className="group" asChild>
                  <Link to="https://github.com/Jivan052/NuroTrader">
                    <FileText className="mr-2 h-10 w-10" />
                    Docs
                  </Link>
                </Button>
              </motion.div>

              {/* Stats with enhanced animations */}
              <div className="flex gap-8 pt-8">
                {[
                  { value: "24/7", label: "Active Trading" },
                  { value: "4", label: "Chains Supported" },
                  { value: "AI", label: "Powered" }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20, 
                      delay: 0.6 + (index * 0.1) 
                    }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-primary"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 10, 
                        delay: 0.8 + (index * 0.1) 
                      }}
                    >
                      {stat.value}
                    </motion.div>
                    <motion.div 
                      className="text-sm text-silver"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.9 + (index * 0.1) }}
                    >
                      {stat.label}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Dashboard Mockup with Image Transitions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15, 
                delay: 0.3 
              }}
              className="relative"
            >
              <motion.div 
                className="relative glass rounded-2xl p-6 border border-primary/20"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-primary opacity-10 rounded-2xl" 
                  animate={{ 
                    opacity: [0.05, 0.2, 0.05],
                    scale: [0.98, 1.01, 0.98],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                
               
                <motion.div 
                  className="relative w-full rounded-lg shadow-2xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  
                  {/* Dashboard image with animation */}
                  <motion.img 
                    src={heroDashboard} 
                    alt="AI Trading Dashboard" 
                    className="w-full h-auto"
                    initial={{ scale: 1.1, filter: "blur(10px)" }}
                    animate={{ 
                      scale: 1, 
                      filter: "blur(0px)",
                      y: [0, -5, 0]
                    }}
                    transition={{ 
                      scale: { duration: 1.2 },
                      filter: { duration: 1 },
                      y: { 
                        duration: 6, 
                        repeat: Infinity, 
                        ease: "easeInOut"
                      }
                    }}
                  />
                  
                  {/* Overlay gradient for better text visibility */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </motion.div>
                
                {/* Enhanced overlay elements with animations */}
                <motion.div 
                  className="absolute top-8 right-8 glass rounded-lg p-3 border border-primary/30"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20, 
                    delay: 0.9 
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0 0 20px rgba(var(--primary-rgb) / 0.3)" 
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="text-sm text-silver">Live Trading</span>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute bottom-8 left-8 glass rounded-lg p-4 border border-primary/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    boxShadow: ["0 0 10px hsl(var(--primary) / 0.1)", "0 0 30px hsl(var(--primary) / 0.3)", "0 0 10px hsl(var(--primary) / 0.1)"]
                  }}
                  transition={{ 
                    opacity: { duration: 0.8, delay: 1.1 },
                    y: { type: "spring", stiffness: 300, damping: 20, delay: 1.1 },
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -5
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, 0, -5, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div>
                      <motion.div 
                        className="text-sm font-semibold text-silver-bright"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.3 }}
                      >
                        +12.4%
                      </motion.div>
                      <motion.div 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                      >
                        Portfolio Growth
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* ThirdWeb handles the wallet modal internally */}
    </TooltipProvider>
  );

  // Custom wallet info display would go here if needed
};

export default HeroSection;