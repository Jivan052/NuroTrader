/**
 * Simplified server for testing
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// For better error visibility
process.on('uncaughtException', error => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Load environment variables
dotenv.config();
console.log('Environment loaded');

// Import the simplified database
const { initDatabase } = require('./db/simple-database');
console.log('Database module imported');

// Create app
const app = express();
console.log('Express app created');

// Basic middleware
app.use(cors());
app.use(express.json());
console.log('Middleware configured');

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
console.log('Routes configured');

// Start server
async function startServer() {
  try {
    console.log('Initializing database...');
    const db = await initDatabase();
    console.log('Database initialized');
    
    // Just start the server without complex services for now
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      console.log(`Simple test server running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT}/health to verify it's working`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

console.log('Starting server...');
startServer();
