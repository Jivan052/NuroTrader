/**
 * Agent Router
 * Handles all routes related to agent interactions
 */
const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Session storage (in-memory for simplicity)
// In production, use a database or Redis
// Initialize the sessions Map
const sessions = new Map();

// Generate a unique session ID
const generateSessionId = () => crypto.randomBytes(16).toString('hex');

const setupAgentRouter = (app) => {
  // Agent chat endpoint
  app.post('/api/agent/chat', async (req, res) => {
    try {
      const { message, sessionId: clientSessionId, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          error: 'Message is required'
        });
      }
      
      // Create or retrieve session
      const sessionId = clientSessionId || generateSessionId();
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
          history: [],
          created: Date.now(),
          context: context || {}
        });
      }
      
      // Get session
      const session = sessions.get(sessionId);
      
      // Add user message to history
      session.history.push({
        role: 'user',
        content: message
      });
      
      // Call OpenRouter API
      const response = await callOpenRouter(session.history);
      
      // Add assistant response to history
      if (response && response.content) {
        session.history.push({
          role: 'assistant',
          content: response.content
        });
        
        // Limit history size to prevent token overflow
        if (session.history.length > 20) {
          // Keep system message if present, plus recent messages
          const systemMessage = session.history.find(m => m.role === 'system');
          const recentMessages = session.history.slice(-12);
          
          session.history = systemMessage 
            ? [systemMessage, ...recentMessages] 
            : recentMessages;
        }
        
        // Return response to client
        return res.json({
          sessionId,
          response: {
            content: response.content,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        throw new Error('Failed to get valid response from LLM');
      }
    } catch (error) {
      console.error('Error in agent chat:', error);
      
      // Provide helpful error message
      return res.status(500).json({
        error: 'Failed to process your request',
        details: error.message,
        tip: 'The AI agent is currently unavailable. Please try again later.'
      });
    }
  });
  
  // Fetch agent session history
  app.get('/api/agent/history/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Get the chat history for the session
      if (!sessions.has(sessionId)) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const session = sessions.get(sessionId);
      
      res.json({ 
        sessionId, 
        history: session.history,
        created: session.created
      });
    } catch (error) {
      console.error('Error fetching agent history:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  });
  
  // Create new agent session
  app.post('/api/agent/session', (req, res) => {
    try {
      const { userId, initialContext } = req.body;
      const sessionId = generateSessionId();
      
      // Create a new session
      sessions.set(sessionId, {
        history: [],
        created: Date.now(),
        userId: userId || 'anonymous',
        context: initialContext || {
          tokenSymbols: ['BTC', 'ETH', 'SOL', 'AVAX', 'FTM', 'GLMR']
        }
      });
      
      res.json({
        sessionId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating agent session:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  });
  
  // Clear session
  app.delete('/api/agent/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }
    
    res.json({ success: true });
  });
};

// Session storage (in-memory for demo purposes)

// Create a new chat session
const createNewSession = (userId, initialContext = {}) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Initialize session with context
  const sessionData = {
    id: sessionId,
    userId: userId || 'anonymous',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    context: {
      ...initialContext,
      tokenSymbols: ['BTC', 'ETH', 'SOL', 'AVAX', 'FTM', 'GLMR'] // Default tokens
    },
    history: []
  };
  
  // Store session
  sessions.set(sessionId, sessionData);
  
  return {
    sessionId,
    createdAt: sessionData.createdAt
  };
};

// Get session history
const getSessionHistory = (sessionId) => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return [];
  }
  
  return session.history;
};

/**
 * Call OpenRouter API to get AI response
 * @param {Array} messages - Chat history messages
 * @returns {Object} - AI response
 */
const callOpenRouter = async (messages) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key is missing');
    }
    
    // Add system prompt if not present
    if (!messages.some(m => m.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: `You are NeuroTrader, an expert AI assistant specializing in cryptocurrency trading, investing, and blockchain analysis.

Your capabilities:
- Analyze cryptocurrency markets and provide trading insights
- Explain blockchain concepts and technologies
- Show token balances and portfolio analysis
- Provide technical analysis for major cryptocurrencies
- Explain DeFi protocols and strategies
- Compare different cryptocurrencies
- Stay updated on market trends and news

Focus on providing accurate, educational information about cryptocurrencies like BTC, ETH, SOL, AVAX, and other major tokens. When you're not sure about current price data, explain that you don't have access to real-time prices but can provide analysis based on historical trends and patterns.

Always prioritize responsible investing practices including risk management, diversification, and long-term thinking. Never provide guaranteed price predictions or financial advice.

Keep responses concise, factual, and focused on the crypto space.`
      });
    }
    
    // Call the OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.MODEL_NAME || 'anthropic/claude-3-haiku',
        messages,
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://neurotrader.ai',
          'X-Title': 'NeuroTrader AI',
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 &&
        response.data.choices[0].message) {
      return response.data.choices[0].message;
    } else {
      throw new Error('Invalid response format from OpenRouter API');
    }
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    
    // Return fallback response
    return {
      role: 'assistant',
      content: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment. If you need immediate help with cryptocurrency analysis, you might try checking recent market data or try a more specific question about crypto trends or technology."
    };
  }
};

module.exports = {
  setupAgentRouter
};
