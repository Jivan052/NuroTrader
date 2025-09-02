// db.cjs
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the db directory exists
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'neurotrader.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with required tables
function initializeDatabase() {
    db.serialize(() => {
        // Create users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wallet_address TEXT UNIQUE,
                username TEXT,
                email TEXT,
                avatar_url TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create transactions table for future use
        db.run(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wallet_address TEXT,
                type TEXT,
                amount TEXT,
                symbol TEXT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'completed',
                tx_hash TEXT,
                FOREIGN KEY (wallet_address) REFERENCES users (wallet_address)
            )
        `);
        
        console.log('Database initialized successfully.');
    });
}

// Get user profile by wallet address
function getUserProfile(walletAddress) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM users WHERE wallet_address = ?',
            [walletAddress],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            }
        );
    });
}

// Create or update user profile
function saveUserProfile(walletAddress, username, email, avatarUrl = '') {
    return new Promise((resolve, reject) => {
        // Check if user exists
        db.get(
            'SELECT * FROM users WHERE wallet_address = ?',
            [walletAddress],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                const now = new Date().toISOString();
                
                if (row) {
                    // Update existing user
                    db.run(
                        `UPDATE users 
                         SET username = ?, email = ?, avatar_url = ?, updated_at = ?
                         WHERE wallet_address = ?`,
                        [username, email, avatarUrl, now, walletAddress],
                        function(err) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve({
                                id: row.id,
                                walletAddress,
                                username,
                                email,
                                avatarUrl,
                                updatedAt: now
                            });
                        }
                    );
                } else {
                    // Create new user
                    db.run(
                        `INSERT INTO users (wallet_address, username, email, avatar_url, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [walletAddress, username, email, avatarUrl, now, now],
                        function(err) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve({
                                id: this.lastID,
                                walletAddress,
                                username,
                                email,
                                avatarUrl,
                                createdAt: now,
                                updatedAt: now
                            });
                        }
                    );
                }
            }
        );
    });
}

// Get user transactions
function getUserTransactions(walletAddress, limit = 10) {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM transactions WHERE wallet_address = ? ORDER BY timestamp DESC LIMIT ?',
            [walletAddress, limit],
            (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows || []);
            }
        );
    });
}

// Add a transaction record
function addTransaction(walletAddress, type, amount, symbol, status = 'completed', txHash = '') {
    return new Promise((resolve, reject) => {
        const timestamp = new Date().toISOString();
        db.run(
            `INSERT INTO transactions (wallet_address, type, amount, symbol, timestamp, status, tx_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [walletAddress, type, amount, symbol, timestamp, status, txHash],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    id: this.lastID,
                    walletAddress,
                    type,
                    amount,
                    symbol,
                    timestamp,
                    status,
                    txHash
                });
            }
        );
    });
}

// Initialize the database on module import
initializeDatabase();

module.exports = {
    getUserProfile,
    saveUserProfile,
    getUserTransactions,
    addTransaction
};
