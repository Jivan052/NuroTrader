// waitlist.cjs
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

// Initialize database with waitlist table
function initializeWaitlistTable() {
    db.serialize(() => {
        // Create waitlist table
        db.run(`
            CREATE TABLE IF NOT EXISTS waitlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wallet_address TEXT UNIQUE,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                reason TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('Waitlist table initialized successfully.');
    });
}

// Check if user exists in waitlist
function checkWaitlist(walletAddress) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM waitlist WHERE wallet_address = ?',
            [walletAddress],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ exists: !!row, data: row });
            }
        );
    });
}

// Add user to waitlist
function addToWaitlist(walletAddress, name, email, reason = '') {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        
        db.run(
            `INSERT INTO waitlist (wallet_address, name, email, reason, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [walletAddress, name, email, reason, now],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    id: this.lastID,
                    walletAddress,
                    name,
                    email,
                    reason,
                    createdAt: now,
                    status: 'pending'
                });
            }
        );
    });
}

// Get waitlist count
function getWaitlistCount() {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT COUNT(*) as count FROM waitlist',
            [],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row ? row.count : 0);
            }
        );
    });
}

// Get all waitlist entries
function getAllWaitlistEntries(limit = 100, offset = 0, status = null) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM waitlist';
        const params = [];
        
        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows || []);
        });
    });
}

// Update waitlist entry status
function updateWaitlistStatus(id, status) {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE waitlist SET status = ? WHERE id = ?',
            [status, id],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (this.changes === 0) {
                    reject(new Error('Entry not found'));
                    return;
                }
                
                resolve({ id, status });
            }
        );
    });
}

// Initialize the table on module import
initializeWaitlistTable();

module.exports = {
    checkWaitlist,
    addToWaitlist,
    getWaitlistCount,
    getAllWaitlistEntries,
    updateWaitlistStatus
};
