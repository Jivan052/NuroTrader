import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  useAddress, 
  useConnectionStatus, 
  ConnectWallet
} from "@thirdweb-dev/react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, Send, RefreshCw } from "lucide-react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from "sonner";
import emailjs from '@emailjs/browser';

// Create schema for form validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  reason: z.string().optional(),
});

const WaitingListPage: React.FC = () => {
  // ThirdWeb hooks to manage wallet connection and data
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const isConnected = connectionStatus === "connected" && address;

  // State variables
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waitingListCount, setWaitingListCount] = useState<number>(0);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      reason: "",
    },
  });

  // Check if user has already submitted
  useEffect(() => {
    if (address) {
      // Fetch from backend to check if the user is already in the waiting list
      fetch(`http://localhost:3002/api/waitlist/check?walletAddress=${address}`)
        .then(response => response.json())
        .then(data => {
          if (data.exists) {
            setIsSubmitted(true);
            toast.info("You're already on our waiting list!");
          }
        })
        .catch(error => {
          console.error("Error checking waiting list status:", error);
        });
    }
    
    // Fetch total count
    fetch("http://localhost:3002/api/waitlist/count")
      .then(response => response.json())
      .then(data => {
        setWaitingListCount(data.count);
      })
      .catch(error => {
        console.error("Error fetching waiting list count:", error);
      });
  }, [address]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to backend
      const response = await fetch('http://localhost:3002/api/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          name: values.name,
          email: values.email,
          reason: values.reason || '',
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        
        // Send email notification using EmailJS
        await emailjs.send(
          'service_neurotrader', // Replace with your EmailJS service ID
          'template_waitlist', // Replace with your EmailJS template ID
          {
            to_email: 'admin@neurotrader.com', // Replace with your admin email
            from_name: values.name,
            from_email: values.email,
            wallet_address: address,
            reason: values.reason || 'No reason provided',
            message: `New user ${values.name} has joined the waiting list with wallet address ${address}`,
          },
          'YOUR_EMAILJS_PUBLIC_KEY' // Replace with your EmailJS public key
        );
        
        // Update the counter
        setWaitingListCount(prev => prev + 1);
        
        toast.success("Successfully joined the waiting list!");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to join the waiting list");
      }
    } catch (error) {
      console.error("Error joining waiting list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to join the waiting list");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-14 sm:pt-16 pb-6 sm:pb-8">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Join the NeuroTrader Waiting List</h1>
              <p className="text-sm sm:text-base text-muted-foreground mx-auto max-w-lg">Be one of the first to access our AI-powered crypto analytics platform</p>
              
              <motion.div 
                className="mt-5 sm:mt-6 inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Badge variant="outline" className="px-3 py-1 sm:px-4 sm:py-2 text-base sm:text-lg bg-background/50 border-primary/30">
                  <motion.span 
                    className="font-mono font-bold text-primary mr-2"
                    animate={{ 
                      color: ["hsl(var(--primary))", "hsl(var(--primary) / 0.8)", "hsl(var(--primary))"] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {waitingListCount}
                  </motion.span> 
                  <span className="text-muted-foreground">users on the waiting list</span>
                </Badge>
              </motion.div>
            </div>

            <Card className="glass border-primary/20 mt-6 sm:mt-8 overflow-hidden shadow-lg shadow-primary/5">
              <CardHeader className="bg-gradient-to-r from-background to-background/80 px-4 sm:px-6 py-5">
                <CardTitle className="text-lg sm:text-xl">Register Your Interest</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Connect your wallet and fill in your details to join the waiting list
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 sm:pt-6">
                {!isConnected && (
                  <div className="text-center py-4 sm:py-6">
                    <p className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground">Connect your wallet to continue</p>
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <ConnectWallet 
                        theme="dark"
                        btnTitle="Connect Wallet"
                        modalSize="wide"
                        welcomeScreen={{
                          title: "NeuroTrader Waiting List",
                          subtitle: "Connect your wallet to join our exclusive waiting list",
                        }}
                        modalTitle="Connect Your Wallet"
                      />
                    </motion.div>
                  </div>
                )}

                {isConnected && !isSubmitted && (
                  <div className="space-y-6">
                    <motion.div 
                      className="flex items-center gap-2 bg-background/30 rounded-lg p-2 sm:p-3 border border-primary/20"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="text-xs sm:text-sm font-mono overflow-hidden text-ellipsis">
                        {address!.substring(0, 6)}...{address!.substring(address!.length - 4)}
                      </span>
                      <Badge variant="outline" className="ml-auto bg-primary/10 text-[10px] sm:text-xs">
                        Connected
                      </Badge>
                    </motion.div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your name" 
                                  className="h-10 sm:h-11" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="Enter your email" 
                                  className="h-10 sm:h-11" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription className="text-xs sm:text-sm">
                                We'll use this to notify you when you're granted access.
                              </FormDescription>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Why are you interested? (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Tell us why you're interested in NeuroTrader" 
                                  className="h-10 sm:h-11"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />
                        
                        <motion.div 
                          whileHover={{ scale: 1.02 }} 
                          whileTap={{ scale: 0.98 }}
                          className="pt-1"
                        >
                          <Button 
                            type="submit" 
                            className="w-full font-medium" 
                            size="lg"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Join Waiting List
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </div>
                )}

                {isConnected && isSubmitted && (
                  <motion.div 
                    className="py-6 sm:py-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="mb-5 sm:mb-6 flex justify-center"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ duration: 1.5, repeat: 1 }}
                    >
                      <div className="rounded-full bg-primary/20 p-3">
                        <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                      </div>
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">You're on the list!</h3>
                    <p className="text-muted-foreground text-sm sm:text-base mb-5 sm:mb-6 px-2">
                      Thank you for joining our waiting list. We'll notify you when you're granted access.
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="lg" asChild>
                        <a href="/">Return to Homepage</a>
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
              
              <Separator />
              
              <CardFooter className="bg-background/30 px-4 sm:px-6 py-3 sm:py-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your wallet address will be used to verify your identity when we grant access to the platform.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WaitingListPage;
