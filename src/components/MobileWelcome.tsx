import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ConnectWallet } from '@thirdweb-dev/react';
import { ArrowRight, ChevronDown } from 'lucide-react';

type MobileWelcomeProps = {
  title: string;
  subtitle?: string;
  showWalletConnect?: boolean;
  showScrollIndicator?: boolean;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
};

const MobileWelcome: React.FC<MobileWelcomeProps> = ({
  title,
  subtitle,
  showWalletConnect = false,
  showScrollIndicator = false,
  ctaText,
  ctaLink,
  onCtaClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sm:hidden w-full px-4 pt-6 pb-8"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2 gradient-text">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mb-5">
            {subtitle}
          </p>
        )}
        
        <div className="flex flex-col gap-3 mt-4">
          {showWalletConnect && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ConnectWallet
                theme="dark"
                btnTitle="Connect Wallet"
                modalSize="compact"
              />
            </motion.div>
          )}
          
          {ctaText && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                className="w-full" 
                size="lg"
                onClick={onCtaClick}
                asChild={Boolean(ctaLink)}
              >
                {ctaLink ? (
                  <a href={ctaLink}>
                    {ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                ) : (
                  <>
                    {ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
        
        {showScrollIndicator && (
          <motion.div 
            className="mt-8 flex justify-center"
            animate={{ 
              y: [0, 5, 0],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MobileWelcome;
