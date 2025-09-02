import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AgentInterface.css';
import config from '@/config';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, Bot, User, Loader2, RefreshCcw, Terminal, ChevronRight, Bitcoin, BadgeCheck, 
  TrendingUp, AlertTriangle, Search, MoreHorizontal, Copy, Share2, Save, MessageSquare,
  ArrowUpRight, FileText, BrainCircuit, Clock, Sparkles, Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  type: 'user' | 'agent';
  timestamp: Date;
  loading?: boolean;
  error?: boolean;
  charts?: ChartData[];
  actions?: ActionButton[];
}

interface ChartData {
  type: 'price' | 'volume' | 'market_cap';
  title: string;
  data: any;
}

interface ActionButton {
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

interface AgentResponse {
  content: string;
  timestamp: string;
  charts?: ChartData[];
  actions?: ActionButton[];
}

interface ConversationMeta {
  title: string;
  preview: string;
  date: Date;
  id: string;
}

const AgentInterface: React.FC = () => {
  // Core chat states
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Enhanced UX states
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [savedConversations, setSavedConversations] = useState<ConversationMeta[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [typingEffect, setTypingEffect] = useState<boolean>(true);
  
  // Theme and appearance
  const [visualMode, setVisualMode] = useState<'default' | 'minimal' | 'charts'>('default');
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Generate a placeholder message while waiting for response
  const createPlaceholderMessage = (): Message => {
    return {
      id: `placeholder-${Date.now()}`,
      content: '',
      type: 'agent',
      timestamp: new Date(),
      loading: true
    };
  };

  // Simulate a typing effect for the response
  const simulateTypingEffect = (message: Message, finalContent: string, speed: number = 20) => {
    const contentLength = finalContent.length;
    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += Math.floor(Math.random() * 3) + 1; // Randomize typing speed slightly
      
      if (currentLength >= contentLength) {
        clearInterval(interval);
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === message.id 
              ? { ...msg, content: finalContent, loading: false } 
              : msg
          )
        );
        return;
      }
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === message.id 
            ? { ...msg, content: finalContent.substring(0, currentLength) } 
            : msg
        )
      );
    }, speed);
  };
  
  // Process the agent response to extract any special features like charts
  const processAgentResponse = (content: string) => {
    // Simple example of processing to find chart data
    // In a real app you might use regex or JSON parsing
    let charts: ChartData[] = [];
    let actions: ActionButton[] = [];
    
    // If the content contains specific chart keywords, generate mock chart data
    if (content.toLowerCase().includes('price chart') || content.toLowerCase().includes('price trend')) {
      charts.push({
        type: 'price',
        title: 'Price Chart',
        data: { /* mock chart data */ }
      });
    }
    
    // Add actions based on content
    if (content.toLowerCase().includes('portfolio')) {
      actions.push({
        label: 'View Portfolio',
        icon: <ArrowUpRight className="h-4 w-4" />,
        action: () => console.log('View portfolio action')
      });
    }
    
    if (content.toLowerCase().includes('market') && content.toLowerCase().includes('report')) {
      actions.push({
        label: 'Save Report',
        icon: <Save className="h-4 w-4" />,
        action: () => console.log('Save report action')
      });
    }
    
    return { charts, actions };
  };
  
  // Send message to agent
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Save the original input for potential retry
    const originalInput = input;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);
    
    // Add placeholder message for smoother UX
    if (typingEffect) {
      const placeholderMessage = createPlaceholderMessage();
      setMessages(prev => [...prev, placeholderMessage]);
    }
    
    try {
      const apiUrl = config.apiUrl;
      
      const response = await fetch(`${apiUrl}/api/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: originalInput,
          sessionId: sessionId,
          includeCharts: visualMode !== 'minimal'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from agent');
      }
      
      // Store session ID if it's the first message
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        
        // If this is first message in new conversation, create a title for the conversation
        if (messages.length === 0) {
          const newConversation: ConversationMeta = {
            id: data.sessionId,
            title: originalInput.length > 30 ? `${originalInput.substring(0, 30)}...` : originalInput,
            preview: originalInput,
            date: new Date()
          };
          setSavedConversations(prev => [newConversation, ...prev]);
        }
      }
      
      if (data.response) {
        // Process response for any special features
        const { charts, actions } = processAgentResponse(data.response.content);
        
        const responseTime = new Date(data.response.timestamp || Date.now());
        
        if (typingEffect) {
          // If typing effect is enabled, update the placeholder message
          setMessages(prevMessages => {
            const updated = prevMessages.map(msg => 
              msg.loading 
                ? { 
                    ...msg, 
                    id: Date.now().toString() + Math.random(),
                    timestamp: responseTime,
                    charts,
                    actions
                  }
                : msg
            );
            
            // Start typing effect
            const lastMessage = updated.find(m => m.loading);
            if (lastMessage) {
              simulateTypingEffect(lastMessage, data.response.content);
            }
            
            return updated;
          });
        } else {
          // No typing effect, just add the message directly
          const agentMessage: Message = {
            id: Date.now().toString() + Math.random(),
            content: data.response.content,
            type: 'agent',
            timestamp: responseTime,
            charts,
            actions
          };
          
          setMessages(prev => {
            // Remove any placeholder messages first
            const withoutPlaceholders = prev.filter(msg => !msg.loading);
            return [...withoutPlaceholders, agentMessage];
          });
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`,
        type: 'agent',
        timestamp: new Date(),
        error: true
      };
      
      setMessages(prev => {
        // Remove any placeholder messages first
        const withoutPlaceholders = prev.filter(msg => !msg.loading);
        return [...withoutPlaceholders, errorMessage];
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle keyboard shortcuts and commands
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'l': // Clear chat with Ctrl/Cmd+L
          e.preventDefault();
          clearChat();
          break;
        case 'k': // Focus search with Ctrl/Cmd+K
          e.preventDefault();
          // Focus search functionality would go here
          break;
      }
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date for conversation list
  const formatDate = (date: Date): string => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return 'Today';
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString();
  };
  
  // Clear current conversation and start a new one
  const clearChat = async () => {
    setMessages([]);
    if (sessionId) {
      try {
        const apiUrl = config.apiUrl;
        await fetch(`${apiUrl}/api/agent/session/${sessionId}`, {
          method: 'DELETE'
        });
        setSessionId(null);
      } catch (err) {
        console.error("Failed to clear session:", err);
      }
    }
  };
  
  // Copy message content to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // Show toast notification
    console.log("Copied to clipboard");
  };
  
  // Save the current conversation
  const saveConversation = () => {
    if (messages.length === 0 || !sessionId) return;
    
    // Get the first user message as title
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (!firstUserMessage) return;
    
    const title = firstUserMessage.content.length > 30 
      ? `${firstUserMessage.content.substring(0, 30)}...` 
      : firstUserMessage.content;
      
    const newSavedConversation: ConversationMeta = {
      id: sessionId,
      title,
      preview: firstUserMessage.content,
      date: new Date()
    };
    
    setSavedConversations(prev => {
      // Check if already saved
      const exists = prev.some(c => c.id === sessionId);
      if (exists) {
        return prev;
      }
      return [newSavedConversation, ...prev];
    });
  };
  
  // Load a saved conversation
  const loadConversation = async (conversationId: string) => {
    try {
      setLoading(true);
      const apiUrl = config.apiUrl;
      const response = await fetch(`${apiUrl}/api/agent/session/${conversationId}/history`);
      
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      
      const data = await response.json();
      
      // Convert to Message format
      const loadedMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg.id || Date.now().toString() + Math.random(),
        content: msg.content,
        type: msg.role === 'user' ? 'user' : 'agent',
        timestamp: new Date(msg.timestamp)
      }));
      
      setMessages(loadedMessages);
      setSessionId(conversationId);
      
      // Switch to chat tab
      setActiveTab('chat');
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
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

    // Memoized saved conversations list for performance
  const conversationsList = useMemo(() => {
    // Group conversations by date
    const byDate: Record<string, ConversationMeta[]> = {};
    
    savedConversations.forEach(conv => {
      const dateKey = formatDate(conv.date);
      if (!byDate[dateKey]) {
        byDate[dateKey] = [];
      }
      byDate[dateKey].push(conv);
    });
    
    return Object.entries(byDate).map(([date, conversations]) => (
      <div key={date} className="mb-3 sm:mb-4">
        <h3 className="text-[0.65rem] xs:text-xs text-silver/60 uppercase tracking-wider mb-1 sm:mb-2 px-1">{date}</h3>
        <div className="space-y-0.5 sm:space-y-1">
          {conversations.map(conv => (
            <Button
              key={conv.id}
              variant="ghost"
              className="w-full justify-start text-left h-auto py-1.5 xs:py-2 px-2 sm:px-3 hover:bg-primary/10 rounded-md"
              onClick={() => loadConversation(conv.id)}
            >
              <div className="truncate w-full">
                <div className="font-medium text-silver-bright truncate text-xs sm:text-sm">{conv.title}</div>
                <div className="text-[0.65rem] xs:text-xs text-silver/60 truncate">{conv.preview}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    ));
  }, [savedConversations]);  return (
    <div className="w-full container mx-auto px-1 xs:px-2 sm:px-4 py-2 xs:py-4 sm:py-6 md:py-8 max-w-full sm:max-w-5xl">
      <Card className="border-primary/20 bg-black/40 shadow-lg shadow-primary/10">
        <CardHeader className="border-b border-primary/10 px-3 py-2.5 xs:px-4 xs:py-3 sm:p-4 md:p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative mr-2 xs:mr-3">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative"
                >
                  <Bot className="h-6 w-6 xs:h-7 xs:w-7 text-primary" />
                  <motion.div 
                    className="absolute -right-1 -top-1 w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>
              <div>
                <CardTitle className="text-silver-bright text-lg xs:text-xl sm:text-2xl font-bold">
                  NeuroTrader AI
                </CardTitle>
                <CardDescription className="text-silver/60 text-[0.65rem] xs:text-xs">
                  AI-powered crypto insights and trading analysis
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-silver/70 hover:text-silver-bright hover:bg-primary/10 h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 rounded-full"
                      onClick={() => setVisualMode(prev => 
                        prev === 'default' ? 'minimal' : prev === 'minimal' ? 'charts' : 'default'
                      )}
                    >
                      {visualMode === 'default' && <MessageSquare className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
                      {visualMode === 'minimal' && <Terminal className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
                      {visualMode === 'charts' && <BrainCircuit className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>Switch visual mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-silver/70 hover:text-silver-bright hover:bg-primary/10 h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 rounded-full"
                      onClick={saveConversation}
                      disabled={messages.length === 0}
                    >
                      <Star className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>Save conversation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-silver/70 hover:text-silver-bright hover:bg-primary/10 h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 rounded-full"
                      onClick={() => setTypingEffect(prev => !prev)}
                    >
                      {typingEffect ? <Sparkles className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" /> : <Clock className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>{typingEffect ? "Turn off typing effect" : "Turn on typing effect"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-2 sm:px-4 pt-2 sm:pt-4">
              <TabsList className="grid grid-cols-2 bg-black/20 w-full max-w-xs mx-auto sm:mx-0 rounded-xl overflow-hidden">
                <TabsTrigger 
                  value="chat" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary py-2 sm:py-2.5 text-xs sm:text-sm font-medium"
                >
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Chat</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary py-2 sm:py-2.5 text-xs sm:text-sm font-medium"
                >
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Chat Tab */}
            <TabsContent value="chat" className="p-2 sm:p-4">
              {/* Quick Market Insights */}
              {(messages.length === 0 || showSuggestions) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <h3 className="text-xs sm:text-sm font-medium text-silver-bright mb-2 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" />
                    Quick Market Insights
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {marketRecommendations.map((rec, i) => (
                      <Button 
                        key={i} 
                        size="sm" 
                        variant={
                          rec.type === 'buy' ? 'default' :
                          rec.type === 'hold' ? 'secondary' :
                          rec.type === 'consider' ? 'outline' : 'ghost'
                        }
                        className={`
                          text-[0.65rem] sm:text-xs px-2 sm:px-3 h-7 sm:h-8 
                          ${rec.type === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
                          rounded-full
                        `}
                        onClick={() => setInput(
                          rec.type === 'overview' ? 'Give me a market overview of top cryptocurrencies' :
                          `What's your ${rec.type === 'buy' ? 'bull case' : rec.type === 'hold' ? 'analysis' : 'opinion'} for ${rec.token}?`
                        )}
                      >
                        {rec.type === 'buy' && <BadgeCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />}
                        {rec.type === 'watch' && <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />}
                        {rec.type === 'overview' ? rec.label : `${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}: ${rec.token}`}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Chat Area */}
              <div className="mb-4 h-[500px] sm:h-[550px] md:h-[600px] overflow-y-auto bg-black/20 rounded-lg p-2 sm:p-3 md:p-4 border border-primary/10 backdrop-blur-sm relative chat-container">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-[10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] animate-pulse-glow opacity-30"></div>
                  <div className="absolute bottom-0 right-[10%] w-[250px] h-[250px] bg-blue-500/5 rounded-full blur-[80px] animate-pulse-glow opacity-30" style={{animationDelay: "2s"}}></div>
                  <div className="absolute top-[50%] left-[50%] w-[150px] h-[150px] bg-indigo-500/10 rounded-full blur-[50px] animate-pulse-glow opacity-20" style={{animationDelay: "3s"}}></div>
                </div>
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center relative z-10 px-1 sm:px-2">
                <div className="relative mb-4 sm:mb-6">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, -5, 5, -3, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <Bot size={48} className="sm:h-16 sm:w-16 md:h-[64px] md:w-[64px] text-primary" />
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center">
                      <Bitcoin size={10} className="sm:h-3 sm:w-3 text-white" />
                    </div>
                  </motion.div>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-silver-bright mb-2 gradient-text">Crypto Trading Assistant</h3>
                <p className="text-xs sm:text-sm text-silver/80 mb-4 sm:mb-6 max-w-xs sm:max-w-sm md:max-w-md">Get expert cryptocurrency market analysis, trading insights, and portfolio recommendations powered by AI</p>
                
                {/* Example prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-xs sm:max-w-md md:max-w-lg mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0">
                  {examplePrompts.map((prompt, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      className="border-primary/20 hover:border-primary/50 bg-black/40 hover:bg-black/60 text-left justify-start h-auto py-2 sm:py-3 text-xs sm:text-sm px-2.5 sm:px-3"
                      onClick={() => setInput(prompt)}
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" />
                      <span className="line-clamp-2">{prompt}</span>
                    </Button>
                  ))}
                </div>
                
                {/* Trending topics */}
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg px-1">
                  <h4 className="text-[0.65rem] sm:text-xs uppercase tracking-wider text-silver/70 mb-1.5 sm:mb-2">Trending Topics</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                    {trendingTopics.map((topic, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="cursor-pointer bg-secondary/40 hover:bg-secondary/60 text-[0.65rem] sm:text-xs h-5 sm:h-6"
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
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div 
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`
                          rounded-lg p-3 max-w-[85%] shadow-md relative
                          ${message.type === 'user' 
                            ? 'bg-primary/90 text-primary-foreground ml-auto border border-primary/20' 
                            : message.error
                              ? 'bg-red-900/30 text-red-100 border border-red-500/50 backdrop-blur-sm'
                              : 'bg-black/50 text-silver-bright border border-blue-500/20 backdrop-blur-sm'
                          }
                          ${message.loading ? 'border-dashed animate-pulse' : ''}
                          ${selectedMessage === message.id ? 'ring-1 ring-primary' : ''}
                        `}
                        onClick={() => setSelectedMessage(message.id === selectedMessage ? null : message.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            {message.type === 'user' ? (
                              <User className="h-4 w-4 mr-2 text-blue-100" />
                            ) : message.error ? (
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-300" />
                            ) : (
                              <Bot className="h-4 w-4 mr-2 text-primary" />
                            )}
                            <span className="text-xs opacity-70">
                              {message.type === 'user' ? 'You' : 'NeuroTrader AI'}
                              {' • '}
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          
                          {selectedMessage === message.id && message.type === 'agent' && (
                            <div className="flex space-x-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                                onClick={() => copyToClipboard(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-black/80 border-primary/30">
                                  <DropdownMenuItem className="text-xs cursor-pointer">
                                    <Share2 className="h-3 w-3 mr-2" /> Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs cursor-pointer">
                                    <Save className="h-3 w-3 mr-2" /> Save to notes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs cursor-pointer">
                                    <FileText className="h-3 w-3 mr-2" /> View as markdown
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                        
                        {/* Message content with typing effect if loading */}
                        <div className="whitespace-pre-wrap">
                          {message.loading ? (
                            <>
                              {message.content}
                              <span className="inline-block w-2 h-4 bg-primary/70 ml-1 animate-pulse"></span>
                            </>
                          ) : (
                            message.content
                          )}
                        </div>
                        
                        {/* Action buttons */}
                        {!message.loading && message.actions && message.actions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.actions.map((action, idx) => (
                              <Button 
                                key={idx} 
                                variant="outline" 
                                size="sm" 
                                className="bg-primary/20 hover:bg-primary/30 text-xs"
                                onClick={action.action}
                              >
                                {action.icon}
                                <span className="ml-1">{action.label}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
            
            {/* Loading indicator */}
            {loading && !typingEffect && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-2 xs:py-3 sm:py-4 z-20 relative"
              >
                <div className="flex items-center bg-black/60 px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-full border border-primary/30 backdrop-blur-sm shadow-lg">
                  <Loader2 className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 animate-spin text-primary mr-1.5 xs:mr-2" />
                  <span className="text-xs xs:text-sm text-silver-bright">Analyzing market data...</span>
                </div>
              </motion.div>
            )}
          </div>
              </TabsContent>
              
              {/* History Tab */}
              <TabsContent value="history" className="p-2 sm:p-3 md:p-4 h-[500px] sm:h-[550px] md:h-[600px] lg:h-[680px] overflow-y-auto">
                {savedConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <Clock size={48} className="sm:h-16 sm:w-16 md:h-[64px] md:w-[64px] text-primary/40 mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-silver-bright mb-1 sm:mb-2">No saved conversations</h3>
                    <p className="text-xs sm:text-sm text-silver/80 max-w-xs sm:max-w-sm md:max-w-md">
                      Your conversation history will appear here once you start chatting with the AI agent.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 sm:mb-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-silver/50" />
                        <Input 
                          placeholder="Search conversations..." 
                          className="pl-8 sm:pl-9 h-8 sm:h-9 text-xs sm:text-sm bg-black/30 border-primary/20 focus-visible:ring-primary/30"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4 pr-0.5">
                      {conversationsList}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          
          {/* Input area */}
          <div className="relative mt-2 xs:mt-3 sm:mt-4 px-2 xs:px-3 sm:px-4 pt-0">
            <div className="flex items-center bg-black/30 rounded-lg border border-primary/30 p-1.5 xs:p-2 shadow-lg backdrop-blur-sm">
              <Textarea 
                placeholder="Ask about crypto markets, trading strategies, or technical analysis..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 h-12 xs:h-14 sm:h-16 text-sm placeholder:text-xs sm:placeholder:text-sm"
                disabled={loading || activeTab !== 'chat'}
              />
              <Button
                className="ml-1.5 xs:ml-2 bg-primary hover:bg-primary/80 shrink-0 transition-all" 
                size="sm"
                onClick={handleSend}
                disabled={!input.trim() || loading || activeTab !== 'chat'}
              >
                {loading ? 
                  <Loader2 className="h-3.5 w-3.5 xs:h-4 xs:w-4 animate-spin" /> : 
                  <>
                    <Send className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1.5 xs:mr-2" />
                    <span className="text-xs xs:text-sm">Send</span>
                  </>
                }
              </Button>
            </div>
          </div>
          {/* Clear chat button & error message */}
          <div className="flex flex-wrap justify-between items-center mt-1 xs:mt-1.5 sm:mt-2 px-2 xs:px-3 sm:px-4 pb-2 xs:pb-3 sm:pb-4">
            {messages.length > 0 && activeTab === 'chat' && (
              <Button 
                variant="outline" 
                className="border-primary/30 hover:border-primary/50 text-[0.65rem] xs:text-xs h-7 px-2" 
                size="sm"
                onClick={clearChat}
              >
                <RefreshCcw className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-0.5 xs:mr-1" />
                New Conversation
              </Button>
            )}
            
            {error && activeTab === 'chat' && (
              <div className="p-1.5 xs:p-2 bg-red-500/20 text-red-300 rounded-md text-[0.65rem] xs:text-xs flex-1 ml-1.5 xs:ml-2 mt-1 xs:mt-0">
                {error}
              </div>
            )}
            
            {!error && messages.length > 0 && activeTab === 'chat' && (
              <div className="text-[0.65rem] xs:text-xs text-silver/50 ml-1.5 xs:ml-2 mt-1 xs:mt-0">
                Powered by NeuroTrader AI
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-primary/10 p-2 xs:p-3 sm:p-4 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
          <div className="flex items-center gap-1.5 xs:gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-[0.65rem] xs:text-xs text-silver/70 hover:text-silver-bright h-7 px-2"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                  >
                    {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showSuggestions ? 'Hide market suggestion buttons' : 'Show market suggestion buttons'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Badge variant="outline" className="text-[0.65rem] xs:text-xs bg-primary/10 hover:bg-primary/20 h-5 xs:h-6">
              <Bot className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-0.5 xs:mr-1 text-primary" />
              v1.0
            </Badge>
          </div>
          
          <div className="text-[0.65rem] xs:text-xs text-silver/50 flex flex-wrap justify-end gap-1.5 xs:gap-0">
            <div className="flex items-center">
              <kbd className="px-1 py-0.5 bg-black/50 border border-primary/20 rounded text-[0.6rem] xs:text-xs mr-1">Ctrl+K</kbd>
              <span>Search</span>
            </div>
            <span className="hidden xs:inline mx-2">|</span>
            <div className="flex items-center">
              <kbd className="px-1 py-0.5 bg-black/50 border border-primary/20 rounded text-[0.6rem] xs:text-xs mr-1">Ctrl+L</kbd>
              <span>Clear</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentInterface;
