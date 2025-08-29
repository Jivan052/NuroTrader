import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, TrendingUp, Wallet, Play, Loader } from "lucide-react";
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
  // Video state management
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
  
  // Handle video loading and errors
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Check if the video is already loaded
      if (video.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
        setVideoLoading(false);
      }
      
      // Add event listeners for video loading
      const handleCanPlay = () => setVideoLoading(false);
      const handleError = () => {
        console.error("Video loading error");
        setVideoLoading(false);
        setVideoError(true);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      
      // Set a timeout to show fallback if video takes too long
      const timeout = setTimeout(() => {
        if (videoLoading) {
          console.warn("Video loading timeout - showing fallback");
          setVideoLoading(false);
          setVideoError(true);
        }
      }, 5000); // 5 second timeout
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        clearTimeout(timeout);
      };
    }
  }, []);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">{/* Added pt-16 for navbar space */}
        {/* Background with animated particles */}
        <div className="absolute inset-0 z-0">
          <img 
            src={networkBg} 
            alt="Network background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/60" />
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
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
                  <span className="text-primary">Autonomous</span><br />
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
                <ConnectWallet 
                  theme="dark"
                  btnTitle="Connect Wallet"
                  modalSize="wide"
                  welcomeScreen={{
                    title: "NeuroTrader",
                    subtitle: "Connect your wallet to access your personalized AI trading analytics",
                  }}
                  modalTitle="Connect Your Wallet"
                  detailsBtn={() => {
                    return walletData ? (
                      <Button variant="hero" size="lg" className="group" onClick={disconnect}>
                        {walletData.address.substring(0, 6)}...{walletData.address.substring(walletData.address.length - 4)}
                        <Wallet className="ml-2 h-5 w-5" />
                      </Button>
                    ) : null;
                  }}
                />
                <Button variant="silver" size="lg" className="group" asChild>
                  <Link to="/analytics">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    View Analytics
                  </Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="flex gap-8 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-silver">Active Trading</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4</div>
                  <div className="text-sm text-silver">Chains Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">AI</div>
                  <div className="text-sm text-silver">Powered</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Dashboard Mockup with Video */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative glass rounded-2xl p-6 border border-primary/20">
                <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-2xl animate-pulse-glow" />
                
                {/* Video component with fallback to image */}
                <div className="relative w-full rounded-lg shadow-2xl overflow-hidden">
                  {/* Show loader while video is loading */}
                  {videoLoading && !videoError && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40">
                      <div className="flex flex-col items-center">
                        <Loader className="h-10 w-10 text-primary animate-spin mb-2" />
                        <span className="text-sm text-silver">Loading dashboard preview...</span>
                      </div>
                    </div>
                  )}
                  
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={`w-full h-auto rounded-lg ${videoError ? 'hidden' : ''}`}
                    poster={heroDashboard} // Use image as poster while video loads
                    onLoadedData={() => setVideoLoading(false)}
                    onError={(e) => {
                      console.log("Video failed to load, using fallback image");
                      setVideoLoading(false);
                      setVideoError(true);
                    }}
                  >
                    {/* Using a crypto/trading related video */}
                    <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
                    {/* Replace with your actual dashboard video when available */}
                    {/* <source src="/videos/dashboard-demo.mp4" type="video/mp4" /> */}
                  </video>
                  
                  {/* Explicit fallback image that will be shown if video fails */}
                  <img 
                    src={heroDashboard} 
                    alt="AI Trading Dashboard" 
                    className={`w-full h-auto ${videoError ? '' : 'hidden'}`}
                  />
                  
                  {/* Play button overlay for video restart */}
                  {!videoLoading && !videoError && (
                    <button 
                      className="absolute bottom-4 right-4 bg-primary/20 hover:bg-primary/40 transition-colors p-2 rounded-full backdrop-blur-sm border border-primary/30"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          videoRef.current.play();
                        }
                      }}
                      title="Replay video"
                    >
                      <Play className="h-5 w-5 text-white" />
                    </button>
                  )}
                  
                  {/* Overlay gradient for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                </div>
                
                {/* Overlay elements */}
                <div className="absolute top-8 right-8 glass rounded-lg p-3 border border-primary/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm text-silver">Live Trading</span>
                  </div>
                </div>

                <motion.div 
                  className="absolute bottom-8 left-8 glass rounded-lg p-4 border border-primary/30"
                  animate={{ 
                    boxShadow: ["0 0 20px hsl(var(--primary) / 0.2)", "0 0 40px hsl(var(--primary) / 0.4)", "0 0 20px hsl(var(--primary) / 0.2)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm font-semibold text-silver-bright">+12.4%</div>
                      <div className="text-xs text-muted-foreground">Portfolio Growth</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* ThirdWeb handles the wallet modal internally */}
    </>
  );

  // Custom wallet info display would go here if needed
};

export default HeroSection;