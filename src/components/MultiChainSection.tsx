import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const MultiChainSection = () => {
  const chains = [
    { 
      name: "Ethereum", 
      logo: "⟐", 
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/30"
    },
    { 
      name: "Avalanche", 
      logo: "▲", 
      color: "text-red-400",
      bgColor: "bg-red-500/10 border-red-500/30"
    },
    { 
      name: "Moonbeam", 
      logo: "●", 
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/30"
    },
    { 
      name: "Fantom", 
      logo: "♦", 
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10 border-cyan-500/30"
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
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
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              viewport={{ once: true }}
              className="group"
            >
              <div className={`glass rounded-2xl p-8 text-center border ${chain.bgColor} hover:border-primary/40 transition-all duration-300 glow-hover h-full flex flex-col items-center justify-center`}>
                <motion.div
                  className={`text-6xl mb-4 ${chain.color}`}
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  {chain.logo}
                </motion.div>
                
                <h3 className="text-xl font-semibold text-silver-bright mb-2">
                  {chain.name}
                </h3>
                
                <Badge 
                  variant="outline" 
                  className={`${chain.bgColor} ${chain.color} border-current`}
                >
                  Active
                </Badge>
                
                <motion.div 
                  className="mt-4 w-8 h-0.5 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: 32 }}
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
          <div className="glass rounded-2xl p-8 max-w-3xl mx-auto border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">99.9%</div>
                <p className="text-muted-foreground">Uptime Guarantee</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">&lt;2s</div>
                <p className="text-muted-foreground">Cross-Chain Execution</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
                <p className="text-muted-foreground">Autonomous Trading</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MultiChainSection;