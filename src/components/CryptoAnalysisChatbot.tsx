// src/components/CryptoAnalysisChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Loader2, RefreshCcw, ChevronRight, Bitcoin, BadgeCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getApiClient } from '../api/api-client';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'agent';
  timestamp: Date;
}

const CryptoAnalysisChatbot: React.FC = () => {
  const { toast } = useToast();
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Send message to the AI through our API client
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Get API client
      const apiClient = getApiClient();
      
      // For demo purposes, use the mock response
      // In production, replace this with apiClient.chatWithAI(input, sessionId)
      const data = await apiClient.mockChatResponse(input);
      
      // Store session ID if it's the first message
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      
      if (data.response) {
        const agentMessage: Message = {
          id: Date.now().toString() + Math.random(),
          content: data.response.content,
          type: 'agent',
          timestamp: new Date(data.response.timestamp || Date.now())
        };
        
        setMessages(prev => [...prev, agentMessage]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      const errorMsg: Message = {
        id: Date.now().toString(),
        content: `Error: ${errorMessage}`,
        type: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const clearChat = async () => {
    setMessages([]);
    setSessionId(null);
  };
  
  // Example prompts for users
  const examplePrompts = [
    "What is the current market outlook for Bitcoin?",
    "Should I invest in Ethereum right now?",
    "What's your analysis of SOL vs ETH?",
    "Show me a potential crypto portfolio allocation",
    "What are the key technical indicators for BTC?"
  ];
  
  // Market recommendations
  const marketRecommendations = [
    { type: 'buy', token: 'BTC', strength: 'strong' },
    { type: 'hold', token: 'ETH' },
    { type: 'consider', token: 'SOL' },
    { type: 'watch', token: 'AVAX' },
    { type: 'overview', label: 'Market Overview' }
  ];
  
  // Trending topics
  const trendingTopics = [
    'Bitcoin ETF Impact',
    'Ethereum Layer 2 Solutions',
    'DeFi Market Analysis',
    'NFT Market Recovery',
    'Altcoin Season Indicators'
  ];
  
  const handleExamplePrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-primary/20 bg-black/40">
        <CardHeader>
          <CardTitle className="text-silver-bright flex items-center text-2xl">
            <Bot className="mr-2 h-6 w-6 text-primary" />
            NeuroTrader AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Market Insights */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-silver-bright mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-primary" />
              Quick Market Insights
            </h3>
            <div className="flex flex-wrap gap-2">
              {marketRecommendations.map((rec, i) => (
                <Button 
                  key={i} 
                  size="sm" 
                  variant={
                    rec.type === 'buy' ? 'default' :
                    rec.type === 'hold' ? 'secondary' :
                    rec.type === 'consider' ? 'outline' : 'ghost'
                  }
                  className={`text-xs ${rec.type === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => setInput(
                    rec.type === 'overview' ? 'Give me a market overview of top cryptocurrencies' :
                    `What's your ${rec.type === 'buy' ? 'bull case' : rec.type === 'hold' ? 'analysis' : 'opinion'} for ${rec.token}?`
                  )}
                >
                  {rec.type === 'buy' && <BadgeCheck className="h-3 w-3 mr-1" />}
                  {rec.type === 'watch' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {rec.type === 'overview' ? rec.label : `${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}: ${rec.token}`}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="mb-4 h-[600px] overflow-y-auto bg-black/20 rounded-lg p-4 border border-primary/10 backdrop-blur-sm relative">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-[10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] animate-pulse-glow opacity-30"></div>
              <div className="absolute bottom-0 right-[10%] w-[250px] h-[250px] bg-blue-500/5 rounded-full blur-[80px] animate-pulse-glow opacity-30" style={{animationDelay: "2s"}}></div>
              <div className="absolute top-[50%] left-[50%] w-[150px] h-[150px] bg-indigo-500/10 rounded-full blur-[50px] animate-pulse-glow opacity-20" style={{animationDelay: "3s"}}></div>
            </div>
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
                <div className="relative mb-6">
                  <Bot size={64} className="text-primary" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Bitcoin size={12} className="text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-silver-bright mb-2 gradient-text">Crypto Trading Assistant</h3>
                <p className="text-silver/80 mb-6 max-w-md">Get expert cryptocurrency market analysis, trading insights, and portfolio recommendations with real-time market data</p>
                
                {/* Example prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mb-8">
                  {examplePrompts.map((prompt, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      className="border-primary/20 hover:border-primary/50 bg-black/40 hover:bg-black/60 text-left justify-start h-auto py-3"
                      onClick={() => setInput(prompt)}
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                      {prompt}
                    </Button>
                  ))}
                </div>
                
                {/* Trending topics */}
                <div className="w-full max-w-lg">
                  <h4 className="text-xs uppercase tracking-wider text-silver/70 mb-2">Trending Topics</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {trendingTopics.map((topic, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="cursor-pointer bg-secondary/40 hover:bg-secondary/60"
                        onClick={() => setInput(`Tell me about ${topic}`)}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                {messages.map(message => (
                  <motion.div 
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`
                        rounded-lg p-3 max-w-[85%] shadow-md
                        ${message.type === 'user' 
                          ? 'bg-primary/90 text-primary-foreground ml-auto border border-primary/20' 
                          : 'bg-black/50 text-silver-bright border border-blue-500/20 backdrop-blur-sm'
                        }
                      `}
                    >
                      <div className="flex items-center mb-1">
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 mr-2 text-blue-100" />
                        ) : (
                          <Bot className="h-4 w-4 mr-2 text-primary" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.type === 'user' ? 'You' : 'NeuroTrader AI'}
                          {' • '}
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            
            {/* Loading indicator */}
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-4 z-20 relative"
              >
                <div className="flex items-center bg-black/60 px-4 py-2 rounded-full border border-primary/30">
                  <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                  <span className="text-sm text-silver-bright">Analyzing market data...</span>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Input area */}
          <div className="relative mt-4">
            <div className="flex items-center bg-black/30 rounded-lg border border-primary/30 p-2 shadow-lg">
              <Textarea 
                placeholder="Ask about crypto markets, trading strategies, or technical analysis..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 h-16"
                disabled={loading}
              />
              <Button
                className="ml-2 bg-primary hover:bg-primary/80 shrink-0" 
                size="sm"
                onClick={handleSend}
                disabled={!input.trim() || loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send
              </Button>
            </div>
          </div>
          {/* Clear chat button & error message */}
          <div className="flex justify-between items-center mt-2">
            {messages.length > 0 && (
              <Button 
                variant="outline" 
                className="border-primary/30 hover:border-primary/50 text-xs" 
                size="sm"
                onClick={clearChat}
              >
                <RefreshCcw className="h-3 w-3 mr-1" />
                New Conversation
              </Button>
            )}
            
            {!messages.length && (
              <div className="text-xs text-silver/50 ml-2">
                Powered by NeuroTrader AI & CoinGecko
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoAnalysisChatbot;
