#!/usr/bin/env node

/**
 * AgentKit Standalone Server
 * 
 * This script acts as a simple HTTP wrapper around the AgentKit index.ts file,
 * allowing it to be called via HTTP requests from the frontend.
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.AGENTKIT_PORT || 3003;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'agentkit', timestamp: new Date().toISOString() });
});

/**
 * Process a prompt with the AgentKit agent
 */
app.post('/process', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    // Path to the agentkit index.ts file
    const agentKitPath = path.join(__dirname, 'index.ts');
    
    // Spawn bun process to run the AgentKit script with the prompt as an argument
    const bunProcess = spawn('bun', ['run', agentKitPath, prompt]);
    
    let responseData = '';
    let errorData = '';

    // Collect stdout data
    bunProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    // Collect stderr data
    bunProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error(`AgentKit stderr: ${data}`);
    });

    // Handle process completion
    bunProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`AgentKit process exited with code ${code}`);
        return res.status(500).json({ 
          error: 'Agent process failed', 
          details: errorData,
          exitCode: code 
        });
      }
      
      // Successfully processed the prompt
      res.json({ 
        response: responseData.trim(),
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('Error processing agent prompt:', error);
    res.status(500).json({ 
      error: 'Failed to process prompt',
      details: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`AgentKit server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
