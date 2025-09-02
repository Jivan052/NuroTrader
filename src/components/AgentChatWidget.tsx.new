import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Bot, 
  User, 
  Send, 
  RefreshCw, 
  X, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  RotateCcw, 
  Copy, 
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
// @ts-ignore - ReactMarkdown type issues
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface AgentChatWidgetProps {
  initialExpanded?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
}

const AgentChatWidget: React.FC<AgentChatWidgetProps> = ({ 
  initialExpanded = false,
  position = 'bottom-right',
  theme = 'auto'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(initialExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-focus on textarea when expanded
  useEffect(() => {
    if (expanded && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [expanded]);
  
  // Handle keyboard shortcuts (ESC to exit fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);
  
  // Format timestamp to readable time
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format agent responses for better display
  const formatAgentResponse = (content: string): string => {
    if (!content) return '';
    
    // Clean up extra dashes and newlines
    let formatted = content
      .replace(/-------------------/g, '') // Remove separator lines
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with just two
      .trim();
    
    // Handle proper code block formatting
    // First, find if there are explicit code blocks
    const hasCodeBlocks = /```[\s\S]*?```/g.test(formatted);
    
    if (hasCodeBlocks) {
      // Ensure code blocks have proper formatting
      formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
        // Detect if there's a language specified
        const firstLine = code.trim().split('\n')[0];
        const hasLanguage = firstLine && !firstLine.includes(' ') && firstLine.length < 20;
        
        if (hasLanguage) {
          // Keep the language specification
          return `\n\`\`\`${firstLine}\n${code.substring(firstLine.length).trim()}\n\`\`\`\n`;
        } else {
          // No language specified
          return `\n\`\`\`\n${code.trim()}\n\`\`\`\n`;
        }
      });
    } else {
      // If the response looks like code but doesn't have code blocks, add them
      if (formatted.includes('function') || 
          formatted.includes('const ') ||
          formatted.includes('class ') || 
          formatted.includes('import ') ||
          /[\{\}][\s]*[\n]/.test(formatted)) {
        
        // Might be code without proper formatting
        if (!formatted.includes('```')) {
          formatted = `\`\`\`\n${formatted}\n\`\`\``;
        }
      }
    }
    
    // Format possible tables for markdown
    formatted = formatted.replace(/(\|[-|\s]+\|)\s*\n/g, '$1\n|---|---|---|\n');
    
    return formatted;
  };

  // Copy message content to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Clear all messages
  const clearChat = () => {
    setMessages([]);
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    
    try {
      // Create user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: input,
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      // Add user message immediately for better UX
      setMessages(prev => [...prev, userMessage]);
      
      // Clear input field
      setInput('');
      
      // Show typing indicator
      setShowTypingIndicator(true);
      
      // Send request to server
      const response = await fetch('http://localhost:3002/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          role: 'user'
        }),
      });
      
      // Hide typing indicator
      setShowTypingIndicator(false);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add assistant's response with formatting
      if (data.agentResponse) {
        // Format the agent response for better display
        const formattedResponse = {
          ...data.agentResponse,
          content: formatAgentResponse(data.agentResponse.content)
        };
        
        setMessages(prev => [
          ...prev.filter(m => m.id !== userMessage.id), 
          userMessage, 
          formattedResponse
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setShowTypingIndicator(false);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: 'Error: Failed to get a response from the agent. Please try again later.',
          role: 'assistant',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  // Get position classes
  const getPositionClasses = () => {
    if (isFullscreen) {
      return '';
    }
    
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  // Determine chat width based on screen size and fullscreen mode
  const getChatWidth = () => {
    if (isFullscreen) {
      return 'w-full max-w-full';
    }
    
    if (windowWidth < 640) {
      return 'w-[calc(100%-32px)] max-w-[400px]';
    }
    
    return 'w-[380px]';
  };
  
  // Calculate max height based on screen size and fullscreen mode
  const getChatHeight = () => {
    if (isFullscreen) {
      return 'h-[calc(100vh-100px)]';
    }
    
    if (windowWidth < 640) {
      return 'max-h-[calc(100vh-180px)]';
    }
    
    return 'h-[450px]';
  };

  // Animation variants for chat widget
  const chatVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 20 }
  };

  // Button animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };
  
  // Render floating button when collapsed
  if (!expanded) {
    return (
      <motion.div
        className={`fixed ${getPositionClasses()} z-50`}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={toggleExpanded}
                className="rounded-full w-14 h-14 shadow-xl bg-primary hover:bg-primary/90 p-0 flex items-center justify-center"
                aria-label="Open chat with blockchain agent"
              >
                <MessageSquare className="h-6 w-6" />
                {messages.length > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {messages.length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Chat with AI Agent
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  }

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-2 rounded-lg bg-muted max-w-[85%]">
      <Bot className="h-3 w-3 text-primary mr-1" />
      <span className="text-xs opacity-70">Agent</span>
      <div className="flex space-x-1 items-center mt-1">
        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={chatVariants}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`fixed ${getPositionClasses()} ${getChatWidth()} z-50 ${isFullscreen ? 'chat-fullscreen' : ''}`}
      >
        <Card 
          className={`shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm overflow-hidden flex flex-col h-full ${
            isFullscreen ? 'chat-fullscreen-keyhandler' : ''
          }`}
          tabIndex={isFullscreen ? 0 : undefined}
        >
          {/* Enhanced Header */}
          <CardHeader 
            className={`py-2 px-4 border-b flex flex-row items-center justify-between ${isFullscreen ? 'bg-black/60' : 'bg-black/40'}`}
            style={{ position: 'sticky', top: 0, zIndex: 10 }}
          >
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-primary animate-pulse" />
              <CardTitle className="text-sm font-medium flex items-center">
                Blockchain Agent
                <Badge variant="outline" className="ml-2 text-xs">AgentKit</Badge>
              </CardTitle>
            </div>
            <div className="flex gap-1">
              {messages.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat}>
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Clear chat
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen mode"}
                    >
                      {isFullscreen ? 
                        <Minimize2 className="h-4 w-4" /> : 
                        <Maximize2 className="h-4 w-4" />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? "Exit fullscreen" : "Fullscreen mode"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {!isFullscreen && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={toggleExpanded}
                  aria-label="Minimize chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          {/* Enhanced Message Container */}
          <CardContent 
            className={`p-0 flex-1 flex flex-col ${getChatHeight()} overflow-hidden`}
            ref={chatContainerRef}
          >
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent p-3">
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center text-muted-foreground"
                >
                  <Bot className="h-14 w-14 mb-4 opacity-40 text-primary" />
                  <p className="text-sm mb-2">How can I help you with blockchain analytics today?</p>
                  <div className="grid grid-cols-2 gap-2 max-w-[280px] mt-4">
                    {[
                      "Bitcoin price prediction", 
                      "Latest Ethereum news",
                      "Avalanche token analysis",
                      "Market sentiment today"
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1.5 border-primary/30 hover:bg-primary/10"
                        onClick={() => {
                          setInput(suggestion);
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div 
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={cn(
                            "rounded-lg p-3 group",
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]' 
                              : 'bg-muted overflow-hidden max-w-[90%]'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            <div className="flex items-center">
                              {message.role === 'user' ? (
                                <User className="h-3 w-3 mr-1" />
                              ) : (
                                <Bot className="h-3 w-3 mr-1 text-primary" />
                              )}
                              <span className="text-xs font-medium opacity-90">
                                {message.role === 'user' ? 'You' : 'Agent'}
                              </span>
                            </div>
                            <span className="text-[10px] opacity-50">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className="relative">
                            {message.role === 'assistant' ? (
                              <div className="markdown-content text-sm leading-relaxed overflow-x-auto">
                                <ReactMarkdown>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {message.content}
                              </div>
                            )}
                            
                            {/* Copy button for messages */}
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-6 w-6" 
                                      onClick={() => copyToClipboard(message.content, message.id)}
                                    >
                                      {copiedMessageId === message.id ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Copy to clipboard</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing indicator */}
                    {showTypingIndicator && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-start"
                      >
                        <TypingIndicator />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Enhanced Input Area */}
            <div className="p-3 border-t bg-background/80 backdrop-blur-sm">
              <div className="flex items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about blockchain analytics..."
                  className="resize-none min-h-[50px] max-h-[120px] text-sm flex-1 mr-2 py-2 px-3"
                  disabled={loading}
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || loading}
                  className={cn(
                    "mb-[1px]",
                    loading ? "bg-primary/70" : ""
                  )}
                  size="sm"
                >
                  {loading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-muted-foreground">
                  {loading ? "AI is generating a response..." : "Powered by AgentKit"}
                </span>
                {input.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {input.length} characters
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgentChatWidget;
