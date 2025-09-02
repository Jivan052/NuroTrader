import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User, Send, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

const SimpleAgentChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Server URL constant
  const SERVER_URL = 'http://localhost:3002';
  
  // Load chat history on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // First check if the server is available
        console.log(`Attempting to fetch chat history from server at ${SERVER_URL}`);
        
        // Check if server is reachable first
        try {
          await fetch(`${SERVER_URL}/health`);
          console.log('Server health endpoint is reachable');
        } catch (err) {
          console.error('Server health check failed:', err);
          // Continue anyway, maybe the history endpoint still works
        }
        
        const response = await fetch(`${SERVER_URL}/api/agent/history`);
        console.log('Server response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('History data received:', data);
        
        if (data.history && Array.isArray(data.history)) {
          setMessages(data.history);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
        // Still set empty messages array to avoid loading state
        setMessages([]);
      }
    };
    
    fetchHistory();
  }, []);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    
    try {
      console.log('Sending message to server:', input);
      
      // Manually add the user message to the UI immediately for better UX
      const userMessage = {
        id: Date.now().toString(),
        content: input,
        role: 'user' as const,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      const response = await fetch(`${SERVER_URL}/api/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          role: 'user'
        }),
      });
      
      console.log('Server response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Server response data:', data);
      
      // Update messages with server response
      if (data.agentResponse) {
        setMessages(prev => [...prev.filter(m => m.id !== userMessage.id), data.userMessage, data.agentResponse]);
      }
      
      // Add both user message and agent response to the chat
      setMessages(prev => [...prev, data.userMessage, data.agentResponse]);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to send message'}`);
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
    <Card className="w-full max-w-4xl mx-auto bg-background shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center text-lg">
          <Bot className="mr-2 h-5 w-5 text-primary" />
          Blockchain Agent Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Chat messages container */}
        <div className="h-[500px] overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-50" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 mr-2" />
                      ) : (
                        <Bot className="h-4 w-4 mr-2 text-primary" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.role === 'user' ? 'You' : 'Agent'}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="p-3 border-t">
          <div className="flex">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="resize-none min-h-[100px] flex-1 mr-2"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleAgentChat;
