/**
 * Simple AgentBridge - Connects the frontend to the AgentKit index.ts
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');

// In-memory session storage
const sessions = new Map();

// Generate a unique session ID
const generateSessionId = () => crypto.randomBytes(16).toString('hex');

// Setup the agent API endpoints
const setupAgentBridge = (app) => {
  // Agent chat endpoint
  app.post('/api/agent/chat', async (req, res) => {
    try {
      const { message, sessionId: clientSessionId } = req.body;
      console.log(`Received message: ${message}`);
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Create or retrieve session
      const sessionId = clientSessionId || generateSessionId();
      
      // Run the index.ts script with the message
      const agentKitPath = path.join(__dirname, 'agentkit');
      
      console.log(`Executing bun run index.ts in ${agentKitPath}`);
      const child = spawn('bun', ['run', 'index.ts', message], {
        cwd: agentKitPath,
        shell: true
      });
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`stdout: ${data}`);
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`stderr: ${data}`);
      });
      
      child.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        
        if (code !== 0) {
          console.error(`Error: ${errorOutput}`);
          return res.status(500).json({
            error: 'Failed to process message',
            details: errorOutput
          });
        }
        
        // Return the output
        return res.json({
          sessionId,
          response: {
            content: output,
            timestamp: new Date().toISOString()
          }
        });
      });
      
    } catch (error) {
      console.error('Error in agent chat:', error);
      return res.status(500).json({
        error: 'Failed to process your request',
        details: error.message
      });
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

module.exports = {
  setupAgentBridge
};
