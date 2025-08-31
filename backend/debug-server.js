/**
 * Debug script for server startup
 * This will help identify where the startup process is failing
 */

console.log('==== DEBUG STARTUP SCRIPT ====');
console.log('1. Loading required modules');

try {
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const morgan = require('morgan');
  const dotenv = require('dotenv');
  
  console.log('2. All modules loaded successfully');
  
  // Load environment variables
  console.log('3. Loading environment variables');
  dotenv.config();
  console.log('   Environment loaded:', {
    PORT: process.env.PORT || '(not set)',
    NODE_ENV: process.env.NODE_ENV || '(not set)',
    DB_PATH: process.env.DB_PATH || '(not set)',
    FRONTEND_URL: process.env.FRONTEND_URL || '(not set)'
  });
  
  // Import database module
  console.log('4. Importing database module');
  const { initDatabase } = require('./db/database');
  console.log('   Database module imported');
  
  // Create Express application
  console.log('5. Creating Express application');
  const app = express();
  
  // Import middleware
  console.log('6. Importing rate limiter');
  const rateLimiterPath = './middleware/rateLimiter';
  console.log('   Checking if rate limiter exists:', require.resolve(rateLimiterPath));
  const { apiLimiter, chatLimiter } = require(rateLimiterPath);
  
  console.log('7. Importing routes');
  const routesPath = './routes/agentRoutes';
  console.log('   Checking if routes exist:', require.resolve(routesPath));
  const createAgentRouter = require(routesPath);
  
  console.log('8. Importing session service');
  const servicePath = './services/sessionService';
  console.log('   Checking if service exists:', require.resolve(servicePath));
  const SessionService = require(servicePath);
  
  console.log('9. Testing database initialization');
  initDatabase()
    .then((db) => {
      console.log('   Database initialized successfully');
      console.log('10. Initializing service with database connection');
      const sessionService = new SessionService(db);
      
      console.log('11. Initializing routes');
      app.use('/api/agent', createAgentRouter(sessionService));
      
      console.log('12. Starting server');
      const PORT = process.env.PORT || 3002;
      app.listen(PORT, () => {
        console.log(`13. Server is running on port ${PORT}`);
      });
    })
    .catch(error => {
      console.error('ERROR during database initialization:', error);
    });
} catch (error) {
  console.error('STARTUP ERROR:', error);
}
