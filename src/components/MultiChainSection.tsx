import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Import the SVG logos
import ethereumLogo from "../assets/chain-logos/ethereum.svg";
import avalancheLogo from "../assets/chain-logos/avalanche.svg";
import moonbeamLogo from "../assets/chain-logos/moonbeam.svg";
import fantomLogo from "../assets/chain-logos/fantom.svg";

const MultiChainSection = () => {
  const chains = [
    { 
      name: "Ethereum", 
      logo: ethereumLogo, 
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/30",
      technologyName: "EVM Compatible",
    },
    { 
      name: "Avalanche", 
      logo: avalancheLogo, 
      color: "text-red-400",
      bgColor: "bg-red-500/10 border-red-500/30",
      technologyName: "Subnet Architecture",
    },
    { 
      name: "Moonbeam", 
      logo: moonbeamLogo, 
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/30",
      technologyName: "Polkadot Parachain",
    },
    { 
      name: "Fantom", 
      logo: fantomLogo, 
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10 border-cyan-500/30",
      technologyName: "DAG-based",
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-silver-bright">
            Built for <span className="gradient-text">Multi-Chain</span> Autonomy
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Seamlessly execute trades across multiple blockchain networks with unified AI strategy
          </p>
        </motion.div>

        {/* Supported chains heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl font-semibold text-silver-bright inline-block relative">
            Supported Networks
            <motion.div 
              className="h-1 w-full bg-gradient-primary mt-1"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            />
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {chains.map((chain, index) => (
            <motion.div
              key={chain.name}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { duration: 0.3 }
              }}
              viewport={{ once: true }}
              className="group"
            >
              <div className={`glass rounded-2xl p-6 text-center border ${chain.bgColor} hover:border-primary/40 transition-all duration-300 glow-hover h-full flex flex-col items-center justify-between`}>
                {/* Top logo area with hover animation */}
                <motion.div
                  className="relative w-24 h-24 mb-4 flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1,
                    rotateY: 10,
                    transition: { duration: 0.5 }
                  }}
                >
                  {/* Animated glow backdrop */}
                  <div className={`absolute inset-0 rounded-full ${chain.bgColor.replace('10', '20')} blur-lg scale-90 group-hover:scale-110 transition-all duration-500`}></div>
                  
                  {/* Chain logo image */}
                  <img 
                    src={chain.logo} 
                    alt={`${chain.name} logo`} 
                    className="w-16 h-16 object-contain relative z-10"
                  />
                </motion.div>
                
                {/* Chain name */}
                <h3 className="text-xl font-semibold text-silver-bright mb-1">
                  {chain.name}
                </h3>
                
                {/* Technology name */}
                <p className="text-sm text-muted-foreground mb-3">
                  {chain.technologyName}
                </p>
                
                {/* Active badge */}
                <Badge 
                  variant="outline" 
                  className={`${chain.bgColor} ${chain.color} border-current`}
                >
                  Active
                </Badge>
                
                {/* Animated underline on hover */}
                <motion.div 
                  className="mt-4 w-12 h-0.5 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: 48 }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass rounded-2xl p-8 max-w-4xl mx-auto border border-primary/20 relative overflow-hidden">
            {/* Background network nodes effect */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="network" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#network)" />
              </svg>
            </div>
            
            {/* Connected chains title */}
            <h3 className="text-2xl font-semibold text-silver-bright mb-8 relative z-10">
              Unified Cross-Chain <span className="gradient-text">Performance</span>
            </h3>
            
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">99.9%</div>
                <p className="text-muted-foreground">Uptime Guarantee</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                    <path d="M21 8h-3a2 2 0 0 0-2 2v3"></path>
                    <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
                  </svg>
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">&lt;2s</div>
                <p className="text-muted-foreground">Cross-Chain Execution</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
                <p className="text-muted-foreground">Autonomous Trading</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MultiChainSection;