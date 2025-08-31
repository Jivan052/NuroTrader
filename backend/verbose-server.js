/**
 * Modified server with better error handling and logging
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Set up process-level error handlers to catch any unhandled errors
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

console.log('Starting server initialization...');

// Load environment variables from .env file
dotenv.config();
console.log('Environment variables loaded');

// Import database module
const { initDatabase } = require('./db/database');
console.log('Database module imported');

// Create Express application
const app = express();
console.log('Express app created');

// Set up CORS options
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
  origin: [frontendUrl, frontendUrl.replace('http://localhost', 'http://127.0.0.1')],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
console.log('CORS options configured with frontend URL:', frontendUrl);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging middleware
console.log('Express middleware configured');

try {
  // Rate limiting
  console.log('Loading rate limiter...');
  const { apiLimiter, chatLimiter } = require('./middleware/rateLimiter');
  app.use('/api/', apiLimiter);
  app.use('/api/agent/chat', chatLimiter);
  console.log('Rate limiting configured');
} catch (error) {
  console.error('Failed to configure rate limiting:', error);
  // Continue without rate limiting
}

// Import route handlers
console.log('Loading route handlers...');
const createAgentRouter = require('./routes/agentRoutes');
const SessionService = require('./services/sessionService');
console.log('Route handlers and services loaded');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});
console.log('Health check endpoint configured');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
console.log('Error handling middleware configured');

// Initialize database and start the server
async function startServer() {
  console.log('Initializing server...');
  try {
    // Initialize the database
    console.log('Initializing database...');
    const db = await initDatabase();
    console.log('Database initialized successfully');
    
    // Initialize services with database connection
    console.log('Initializing services...');
    const sessionService = new SessionService(db);
    console.log('Session service initialized');
    
    // Initialize routes
    console.log('Setting up routes...');
    app.use('/api/agent', createAgentRouter(sessionService));
    console.log('Routes configured');
    
    // Start the server
    const PORT = process.env.PORT || 3002;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check available at: http://localhost:${PORT}/health`);
    });
    
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
console.log('Calling startServer()...');
startServer();

module.exports = app;
