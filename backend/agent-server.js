// agent-server.js
const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://127.0.0.1:8080'],
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

// Start the server
app.listen(PORT, () => {
  console.log(`AgentKit server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
