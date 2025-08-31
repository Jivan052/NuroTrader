/**
 * Session Service
 * Handles session management and message history
 */

const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SessionService {
  constructor(db) {
    this.db = db;
  }
  
  /**
   * Create a new session
   * @returns {Promise<Object>} - The created session
   */
  async createSession() {
    const sessionId = uuidv4();
    const metadata = JSON.stringify({ 
      createdAt: new Date().toISOString(),
      userAgent: 'web'
    });
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO sessions (id, metadata) VALUES (?, ?)',
        [sessionId, metadata],
        (err) => {
          if (err) {
            console.error('Error creating session:', err);
            reject(err);
          } else {
            resolve({ 
              id: sessionId, 
              createdAt: new Date().toISOString() 
            });
          }
        }
      );
    });
  }
  
  /**
   * Get a session by ID
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object|null>} - The session or null if not found
   */
  async getSession(sessionId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM sessions WHERE id = ?',
        [sessionId],
        (err, row) => {
          if (err) {
            console.error('Error getting session:', err);
            reject(err);
          } else {
            if (!row) {
              resolve(null);
            } else {
              try {
                const metadata = JSON.parse(row.metadata || '{}');
                resolve({
                  id: row.id,
                  createdAt: row.created_at,
                  updatedAt: row.updated_at,
                  metadata
                });
              } catch (e) {
                console.error('Error parsing session metadata:', e);
                resolve({
                  id: row.id,
                  createdAt: row.created_at,
                  updatedAt: row.updated_at,
                  metadata: {}
                });
              }
            }
          }
        }
      );
    });
  }
  
  /**
   * Delete a session
   * @param {string} sessionId - The session ID
   * @returns {Promise<boolean>} - Whether the session was deleted
   */
  async deleteSession(sessionId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM sessions WHERE id = ?',
        [sessionId],
        function(err) {
          if (err) {
            console.error('Error deleting session:', err);
            reject(err);
          } else {
            // Check if any rows were affected
            resolve(this.changes > 0);
          }
        }
      );
    });
  }
  
  /**
   * Add a message to a session
   * @param {string} sessionId - The session ID
   * @param {string} role - The role (user or assistant)
   * @param {string} content - The message content
   * @returns {Promise<Object>} - The created message
   */
  async addMessage(sessionId, role, content) {
    const messageId = uuidv4();
    
    return new Promise((resolve, reject) => {
      // First, update the session's updated_at timestamp
      this.db.run(
        'UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [sessionId],
        (err) => {
          if (err) {
            console.error('Error updating session timestamp:', err);
            reject(err);
            return;
          }
          
          // Then, insert the message
          this.db.run(
            'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
            [messageId, sessionId, role, content],
            (err) => {
              if (err) {
                console.error('Error adding message:', err);
                reject(err);
              } else {
                resolve({ 
                  id: messageId, 
                  sessionId,
                  role,
                  content,
                  createdAt: new Date().toISOString() 
                });
              }
            }
          );
        }
      );
    });
  }
  
  /**
   * Get messages for a session
   * @param {string} sessionId - The session ID
   * @returns {Promise<Array>} - The session messages
   */
  async getMessages(sessionId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC',
        [sessionId],
        (err, rows) => {
          if (err) {
            console.error('Error getting messages:', err);
            reject(err);
          } else {
            resolve(rows.map(row => ({
              id: row.id,
              sessionId: row.session_id,
              role: row.role,
              content: row.content,
              createdAt: row.created_at
            })));
          }
        }
      );
    });
  }
}

module.exports = SessionService;
