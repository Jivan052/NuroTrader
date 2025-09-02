# Firebase Integration Documentation

This document explains how Firebase is integrated into the NeuroTrader application to store waitlist user data and manage authentication.

## Overview

NeuroTrader uses Firebase for:
1. Storing waitlist user data
2. User authentication
3. Analytics tracking
4. Real-time data synchronization

## Firebase Configuration

The Firebase configuration is stored in environment variables for security. These are accessed in `firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

## Waitlist Service

The waitlist service (`waitlistService.js`) provides functions for managing the waitlist:

### Adding Users to Waitlist

```javascript
// Add a user to the waiting list
const result = await waitlistService.addToWaitlist({
  walletAddress: "0x123...",
  name: "User Name",
  email: "user@example.com",
  reason: "Interested in AI trading"
});
```

### Checking Waitlist Status

```javascript
// Check if a user is already on the waitlist
const exists = await waitlistService.checkIfUserExists("0x123...");
```

### Getting Waitlist Count

```javascript
// Get the total number of users on the waitlist
const count = await waitlistService.getWaitlistCount();
```

### Getting Waitlisted Users

```javascript
// Get paginated list of users on the waitlist
const result = await waitlistService.getWaitlistedUsers(1, 10); // page 1, 10 users per page
```

### Updating User Status

```javascript
// Update a user's status (approve or reject)
const result = await waitlistService.updateUserStatus(
  "0x123...", // wallet address
  "approved"  // new status: "pending", "approved", or "rejected"
);
```

## Database Structure

### Firestore Collections

- **waitlist**: Stores detailed user information
  - Fields: walletAddress, name, email, reason, referralCode, joinedAt, status

### Realtime Database

- **waitlist/{walletAddress}**: Stores user data for real-time access
  - Fields: walletAddress, name, email, reason, referralCode, joinedAt, status, firestoreId

## Security Rules

Ensure you set up proper security rules in your Firebase console:

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Waitlist collection
    match /waitlist/{document=**} {
      // Only admin users can read all waitlist entries
      allow read: if request.auth != null && request.auth.token.admin == true;
      // Anyone can write to waitlist (for signup)
      allow create: if true;
      // Only admin users can update or delete
      allow update, delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Realtime Database Rules

```json
{
  "rules": {
    "waitlist": {
      ".read": "auth != null && auth.token.admin === true",
      ".write": "auth != null && auth.token.admin === true",
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || auth.token.admin === true)",
        ".write": "auth != null && (auth.uid === $uid || auth.token.admin === true)"
      }
    }
  }
}
```

## Setting up Firebase

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Add your app to the project (Web app)
3. Enable Firestore Database and Realtime Database
4. Enable Google Analytics (optional)
5. Configure Authentication methods as needed
6. Set up Security Rules for Firestore and Realtime Database
7. Copy your Firebase configuration to your `.env` file

## Deployment Considerations

When deploying the application:

1. Make sure environment variables are properly set in your deployment environment
2. Consider using Firebase Functions for additional backend functionality
3. Set up proper security rules for production
4. Configure CORS settings if needed for API access
