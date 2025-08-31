/**
 * Agent API Routes
 * Handles all routes for the agent API
 */

const express = require('express');
const router = express.Router();
const agentKitService = require('../services/agentKitService');

// Create router with dependency injection for session service
const createRouter = (sessionService) => {
  // Chat with agent
  router.post('/chat', async (req, res) => {
    try {
      const { message, sessionId: clientSessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Create or retrieve session
      let sessionId = clientSessionId;
      let session;
      
      if (!sessionId) {
        session = await sessionService.createSession();
        sessionId = session.id;
      } else {
        session = await sessionService.getSession(sessionId);
        if (!session) {
          session = await sessionService.createSession();
          sessionId = session.id;
        }
      }
      
      // Add user message to history
      await sessionService.addMessage(sessionId, 'user', message);
      
      // Process message with AgentKit
      const agentResponse = await agentKitService.processMessage(message);
      
      // Add agent response to history
      await sessionService.addMessage(sessionId, 'assistant', agentResponse);
      
      // Return response to client
      return res.json({
        sessionId,
        response: {
          content: agentResponse,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error in agent chat:', error);
      return res.status(500).json({
        error: 'Failed to process your request',
        details: error.message
      });
    }
  });
  
  // Get session history
  router.get('/session/:sessionId/history', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await sessionService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const messages = await sessionService.getMessages(sessionId);
      
      return res.json({
        sessionId,
        history: messages,
        session
      });
      
    } catch (error) {
      console.error('Error getting session history:', error);
      return res.status(500).json({
        error: 'Failed to retrieve session history',
        details: error.message
      });
    }
  });
  
  // Create new session
  router.post('/session', async (req, res) => {
    try {
      const session = await sessionService.createSession();
      
      return res.json(session);
      
    } catch (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({
        error: 'Failed to create session',
        details: error.message
      });
    }
  });
  
  // Delete session
  router.delete('/session/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const deleted = await sessionService.deleteSession(sessionId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      return res.json({ success: true });
      
    } catch (error) {
      console.error('Error deleting session:', error);
      return res.status(500).json({
        error: 'Failed to delete session',
        details: error.message
      });
    }
  });

  return router;
};

module.exports = createRouter;
