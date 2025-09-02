import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const WaitingListCounter: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        // Support multiple backend URLs (localhost with various ports and production)
        const urls = [
          'http://localhost:3002/api/waitlist/count',
          'http://localhost:8080/api/waitlist/count',
          'http://localhost:8081/api/waitlist/count',
          window.location.origin + '/api/waitlist/count'
        ];
        
        // Try each URL until one works
        for (const url of urls) {
          try {
            const response = await fetch(url, { 
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              // Adding these options for better compatibility
              mode: 'cors',
              cache: 'no-cache',
              credentials: 'same-origin'
            });
            
            if (response.ok) {
              const data = await response.json();
              setCount(data.count || 0);
              break; // Stop trying URLs once successful
            }
          } catch (urlError) {
            console.log(`Could not fetch from ${url}:`, urlError);
            // Continue to next URL
          }
        }
      } catch (error) {
        console.error("Error fetching waitlist count:", error);
        // Fallback to a default count if all fetch attempts fail
        setCount(Math.floor(Math.random() * 50) + 10); // Random fallback number between 10-60
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();

    // Poll every 10 seconds to keep the count updated
    const interval = setInterval(fetchCount, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Add animation to increment the counter for visual effect
  const [displayCount, setDisplayCount] = useState<number>(0);

  useEffect(() => {
    if (count > 0 && !isLoading) {
      // Animate the counter
      let current = 0;
      const increment = Math.max(1, Math.floor(count / 20)); // Adjust for smoother animation
      const interval = setInterval(() => {
        current += increment;
        if (current >= count) {
          setDisplayCount(count);
          clearInterval(interval);
        } else {
          setDisplayCount(current);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [count, isLoading]);

  return (
    <motion.div 
      className="glass border border-primary/20 rounded-xl p-4 sm:p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(var(--primary-rgb) / 0.1)" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-primary/20 p-3 mb-1 sm:mb-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        
        <h3 className="text-base sm:text-lg font-semibold">Join Our Waiting List</h3>
        
        <div className="mt-1 mb-2 sm:mb-3">
          {isLoading ? (
            <div className="h-10 flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <motion.span 
                className="text-2xl sm:text-3xl font-bold text-primary"
                animate={{ 
                  scale: [1, 1.05, 1],
                  textShadow: ["0 0 0px rgba(var(--primary-rgb) / 0)", "0 0 8px rgba(var(--primary-rgb) / 0.3)", "0 0 0px rgba(var(--primary-rgb) / 0)"]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {displayCount}
              </motion.span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                users already waiting
              </span>
            </div>
          )}
        </div>
        
        <Button 
          variant="hero" 
          size="sm"
          className="w-full mt-1 sm:mt-2 text-xs sm:text-sm"
          onClick={() => navigate('/waitlist')}
        >
          Reserve Your Spot
        </Button>
      </div>
    </motion.div>
  );
};

export default WaitingListCounter;
