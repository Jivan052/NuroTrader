import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2, RefreshCcw, Terminal, ChevronRight, Bitcoin, Wallet, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import config from "@/config";

interface Message {
  id: string;
  content: string;
  type: 'user' | 'agent';
  timestamp: Date;
}

interface AgentResponse {
  content: string;
  timestamp: string;
}

const AgentChatbot: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Send message to agent
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
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          sessionId: sessionId
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from agent');
      }
      
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
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`,
        type: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
    if (sessionId) {
      try {
        await fetch(`${config.apiUrl}/api/agent/session/${sessionId}`, {
          method: 'DELETE'
        });
        setSessionId(null);
      } catch (err) {
        console.error("Failed to clear session:", err);
      }
    }
  };
  
  // Example prompts for users
  const examplePrompts = [
    "What is my ETH balance?",
    "Show me my token balances",
    "What is AVAX?", 
    "Send 0.1 ETH to 0x1234...",
    "What are the current gas prices?"
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
            Blockchain Agent
          </CardTitle>
          <CardDescription className="text-silver/70">
            Interact with EVM chains using gasless transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chat Area */}
          <div className="mb-4 h-[500px] overflow-y-auto bg-black/20 rounded-lg p-4 border border-primary/10 backdrop-blur-sm relative">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-[10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] animate-pulse-glow opacity-30"></div>
              <div className="absolute bottom-0 right-[10%] w-[250px] h-[250px] bg-blue-500/5 rounded-full blur-[80px] animate-pulse-glow opacity-30" style={{animationDelay: "2s"}}></div>
            </div>
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
                <div className="relative mb-6">
                  <Bot size={64} className="text-primary" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Wallet size={12} className="text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-silver-bright mb-2 gradient-text">Blockchain Agent</h3>
                <p className="text-silver/80 mb-6 max-w-md">
                  Ask about your balances, send tokens, interact with contracts, and perform blockchain operations
                </p>
                
                {/* Example prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mb-8">
                  {examplePrompts.map((prompt, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      className="border-primary/20 hover:border-primary/50 bg-black/40 hover:bg-black/60 text-left justify-start h-auto py-3"
                      onClick={() => handleExamplePrompt(prompt)}
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                      {prompt}
                    </Button>
                  ))}
                </div>
                
                <div className="w-full max-w-lg">
                  <p className="text-xs text-silver/70">
                    This agent uses your connected wallet to perform operations and check balances through 0xGasless
                  </p>
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
                          {message.type === 'user' ? 'You' : 'AgentKit'}
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
                  <span className="text-sm text-silver-bright">Processing blockchain request...</span>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Input area */}
          <div className="relative mt-4">
            <div className="flex items-center bg-black/30 rounded-lg border border-primary/30 p-2 shadow-lg">
              <Textarea 
                placeholder="Ask about balances, send tokens, or interact with contracts..."
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
            
            {error && (
              <div className="p-2 bg-red-500/20 text-red-300 rounded-md text-xs flex-1 ml-2">
                {error}
              </div>
            )}
            
            {!error && messages.length > 0 && (
              <div className="text-xs text-silver/50 ml-2">
                <span className="flex items-center">
                  <Terminal className="h-3 w-3 mr-1" />
                  Powered by AgentKit
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentChatbot;
