/**
 * Simplified database module to ensure it works correctly
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Get database path
const dbDir = path.join(__dirname, '..');
const dbPath = process.env.DB_PATH || path.join(dbDir, 'db', 'neurotrader.sqlite');

// Ensure the directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

console.log(`Database path: ${dbPath}`);

// Initialize SQLite database
const initDatabase = () => {
  console.log('Creating database connection...');
  
  return new Promise((resolve, reject) => {
    try {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to the SQLite database.');
          
          // Create tables if they don't exist
          db.serialize(() => {
            console.log('Creating tables if they don\'t exist...');
            
            // Sessions table for chat history
            db.run(`CREATE TABLE IF NOT EXISTS sessions (
              id TEXT PRIMARY KEY,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              metadata TEXT
            )`, (tableErr) => {
              if (tableErr) {
                console.error('Error creating sessions table:', tableErr);
              } else {
                console.log('Sessions table is ready');
              }
            });
            
            // Messages table for storing conversation history
            db.run(`CREATE TABLE IF NOT EXISTS messages (
              id TEXT PRIMARY KEY,
              session_id TEXT NOT NULL,
              role TEXT NOT NULL,
              content TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
            )`, (tableErr) => {
              if (tableErr) {
                console.error('Error creating messages table:', tableErr);
              } else {
                console.log('Messages table is ready');
              }
            });
            
            // Test database is working
            db.get("SELECT sqlite_version() as version", [], (testErr, row) => {
              if (testErr) {
                console.error('Error testing database:', testErr);
                reject(testErr);
              } else {
                console.log(`SQLite version: ${row.version}`);
                resolve(db);
              }
            });
          });
        }
      });
    } catch (error) {
      console.error('Unexpected error during database initialization:', error);
      reject(error);
    }
  });
};

module.exports = {
  initDatabase
};
