/**
 * Database Setup Script
 * Run this script to initialize the SQLite database
 */

const { initDatabase } = require('./db/database');

// Create tables
async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Initialize database (this will create tables if they don't exist)
    const db = await initDatabase();
    
    console.log('✓ Sessions table created');
    console.log('✓ Messages table created');
    console.log('Database setup complete!');
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  } catch (err) {
    console.error('Failed to set up database:', err);
  }
}

// Run setup
setupDatabase();
