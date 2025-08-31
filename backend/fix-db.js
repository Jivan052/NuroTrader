/**
 * Modified setup script to correctly initialize database tables
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Get the database path from environment variables or use default
const dotenv = require('dotenv');
dotenv.config();

const dbDir = path.join(__dirname, 'db');
const dbPath = process.env.DB_PATH || path.join(dbDir, 'neurotrader.sqlite');

// Ensure the db directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

console.log(`Setting up database at: ${dbPath}`);

// Open the database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
    process.exit(1);
  }
  
  console.log('Connected to the SQLite database.');
  
  // Create tables
  db.serialize(() => {
    // Sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating sessions table:', err.message);
      } else {
        console.log('✓ Sessions table created');
      }
    });
    
    // Messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating messages table:', err.message);
      } else {
        console.log('✓ Messages table created');
      }
    });
    
    console.log('Database setup complete!');
    
    // Close the connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
});
