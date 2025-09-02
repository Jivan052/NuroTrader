// agent-server.cjs
const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

// Add error handling for database initialization
let db;
try {
  db = require('./db.cjs');
  console.log('Database module loaded successfully');
} catch (error) {
  console.error('Error loading database module:', error.message);
  // Create a mock database if the real one fails to load
  db = {
    getUserProfile: () => Promise.resolve(null),
    saveUserProfile: () => Promise.resolve({}),
    getUserTransactions: () => Promise.resolve([]),
    addTransaction: () => Promise.resolve({})
  };
}

// Load waitlist module
let waitlist;
try {
  waitlist = require('./waitlist.cjs');
  console.log('Waitlist module loaded successfully');
} catch (error) {
  console.error('Error loading waitlist module:', error.message);
  // Create a mock waitlist module if the real one fails to load
  waitlist = {
    checkWaitlist: () => Promise.resolve({ exists: false, data: null }),
    addToWaitlist: () => Promise.resolve({}),
    getWaitlistCount: () => Promise.resolve(0),
    getAllWaitlistEntries: () => Promise.resolve([]),
    updateWaitlistStatus: () => Promise.resolve({})
  };
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://127.0.0.1:8080', 
           'http://localhost:8081', 'http://127.0.0.1:8081'], // Add port 8081 for Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory chat history storage
const chatHistory = [];

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'AgentKit Chat API is running',
    endpoints: [
      '/api/agent/chat',
      '/api/agent/history'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Endpoint to handle agent chat messages
app.post('/api/agent/chat', (req, res) => {
  try {
    const { message, role = 'user' } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Save the user message to chat history
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role,
      timestamp: new Date().toISOString()
    };
    
    chatHistory.push(userMessage);
    
    // Process with AgentKit if it's a user message
    if (role === 'user') {
      try {
        // Execute the AgentKit script with PowerShell syntax
        const isWindows = process.platform === 'win32';
        const command = isWindows
          ? `cd "${path.join(__dirname, 'agentkit')}"; bun run index.ts "${message.replace(/"/g, '\\"')}"`
          : `cd "${path.join(__dirname, 'agentkit')}" && bun run index.ts "${message.replace(/"/g, '\\"')}"`;
        
        const output = execSync(command, { 
          encoding: 'utf-8',
          shell: isWindows ? 'powershell.exe' : '/bin/bash'
        });
        
        // Save the agent's response to chat history
        const agentMessage = {
          id: (Date.now() + 1).toString(),
          content: output.trim(),
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        chatHistory.push(agentMessage);
        
        // Return both the user message and agent response
        res.json({
          userMessage: userMessage,
          agentResponse: agentMessage
        });
      } catch (error) {
        console.error('Error executing AgentKit:', error);
        res.status(500).json({ 
          error: 'Failed to process message',
          details: error.message
        });
      }
    } else {
      // If it's not a user message, just return the saved message
      res.json({ message: userMessage });
    }
  } catch (err) {
    console.error('Error saving chat message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to get chat history
app.get('/api/agent/history', (req, res) => {
  res.json({ history: chatHistory });
});

// User profile endpoints
app.get('/api/users/profile', async (req, res) => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    if (!db || !db.getUserProfile) {
      console.error('Database module not properly initialized');
      return res.status(503).json({ 
        error: 'Database service unavailable',
        message: 'Profile service is currently unavailable. Please try again later.' 
      });
    }
    
    const user = await db.getUserProfile(walletAddress);
    
    if (user) {
      // Format user data for frontend
      res.json({
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      });
    } else {
      // If user not found, return empty profile instead of 404
      res.json({
        walletAddress,
        username: '',
        email: '',
        avatarUrl: '',
      });
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ 
      error: 'Server error',
      message: err.message || 'Failed to fetch user profile'
    });
  }
});

app.post('/api/users/profile', async (req, res) => {
  try {
    const { walletAddress, username, email, avatarUrl } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const user = await db.saveUserProfile(walletAddress, username, email, avatarUrl);
    
    res.json({
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    console.error('Error saving user profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/transactions', async (req, res) => {
  try {
    const { walletAddress, limit = 10 } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const transactions = await db.getUserTransactions(walletAddress, parseInt(limit));
    
    res.json({ transactions });
  } catch (err) {
    console.error('Error fetching user transactions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users/transactions', async (req, res) => {
  try {
    const { walletAddress, type, amount, symbol, status, txHash } = req.body;
    
    if (!walletAddress || !type || !amount) {
      return res.status(400).json({ error: 'Wallet address, type, and amount are required' });
    }
    
    const transaction = await db.addTransaction(walletAddress, type, amount, symbol, status, txHash);
    
    res.json(transaction);
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Waitlist endpoints
app.get('/api/waitlist/check', async (req, res) => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await waitlist.checkWaitlist(walletAddress);
    res.json({ exists: result.exists });
  } catch (err) {
    console.error('Error checking waitlist status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/waitlist/join', async (req, res) => {
  try {
    const { walletAddress, name, email, reason } = req.body;
    
    if (!walletAddress || !name || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Wallet address, name, and email are required' 
      });
    }
    
    // Check if already in waitlist
    const existingEntry = await waitlist.checkWaitlist(walletAddress);
    if (existingEntry.exists) {
      return res.status(409).json({ 
        error: 'Already registered',
        message: 'This wallet address is already registered on the waiting list'
      });
    }
    
    // Add to waitlist
    const result = await waitlist.addToWaitlist(walletAddress, name, email, reason);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding to waitlist:', err);
    res.status(500).json({ 
      error: 'Server error',
      message: err.message || 'Failed to join the waiting list'
    });
  }
});

app.get('/api/waitlist/count', async (req, res) => {
  try {
    const count = await waitlist.getWaitlistCount();
    res.json({ count });
  } catch (err) {
    console.error('Error getting waitlist count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin endpoints - These should be protected in production
app.get('/api/admin/waitlist', async (req, res) => {
  try {
    const { limit = 100, offset = 0, status } = req.query;
    const entries = await waitlist.getAllWaitlistEntries(
      parseInt(limit), 
      parseInt(offset),
      status
    );
    
    res.json({ entries });
  } catch (err) {
    console.error('Error fetching waitlist entries:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/waitlist/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: 'Status must be one of: pending, approved, rejected'
      });
    }
    
    const result = await waitlist.updateWaitlistStatus(id, status);
    res.json(result);
  } catch (err) {
    console.error('Error updating waitlist status:', err);
    res.status(500).json({ 
      error: 'Server error',
      message: err.message || 'Failed to update status'
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AgentKit server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`API available at http://${require('os').hostname()}:${PORT}`);
});
