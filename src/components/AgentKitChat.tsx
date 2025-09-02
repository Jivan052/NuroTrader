import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Send, RefreshCw, User, Bot } from 'lucide-react';
import config from '@/config';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: Date;
  loading?: boolean;
}

const AgentKitChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Scroll to the bottom initially
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, []);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and show loading
    setInput('');
    setLoading(true);
    setError(null);

    // Create a placeholder for the bot's response
    const placeholderId = Date.now().toString() + '-bot';
    const placeholderMessage: Message = {
      id: placeholderId,
      content: '...',
      role: 'bot',
      timestamp: new Date(),
      loading: true,
    };

    setMessages(prev => [...prev, placeholderMessage]);

    try {
      // Call the AgentKit API
      const response = await fetch(`${config.apiUrl}/api/agentkit/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from agent');
      }

      // Replace placeholder with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === placeholderId
            ? {
                id: Date.now().toString(),
                content: data.response,
                role: 'bot',
                timestamp: new Date(data.timestamp),
                loading: false,
              }
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Update placeholder to show error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === placeholderId
            ? {
                id: Date.now().toString(),
                content: `Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`,
                role: 'bot',
                timestamp: new Date(),
                loading: false,
              }
            : msg
        )
      );
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

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/40 border border-primary/20">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary" />
          AgentKit Blockchain Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Messages container */}
        <div className="h-[500px] overflow-y-auto p-4 bg-background/5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-16 w-16 text-primary/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Blockchain Agent</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask me anything about blockchain transactions, token balances, or other on-chain activities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[75%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-card/80 border border-primary/10'
                      }
                    `}
                  >
                    <div className="flex items-center mb-1">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 mr-2" />
                      ) : (
                        <Bot className="h-4 w-4 mr-2 text-primary" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.role === 'user' ? 'You' : 'AgentKit Bot'}
                      </span>
                    </div>
                    
                    <div className="whitespace-pre-wrap">
                      {message.loading ? (
                        <div className="flex items-center">
                          <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                          <span>Processing your request...</span>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="p-3 border-t border-primary/10">
          {error && (
            <div className="mb-2 p-2 bg-destructive/20 text-destructive rounded flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          <div className="flex">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about blockchain transactions, check token balances..."
              className="resize-none min-h-24 flex-1 mr-2 bg-background/50"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="self-end"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Powered by 0xGasless AgentKit • Supports blockchain queries and gasless transactions
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentKitChat;
