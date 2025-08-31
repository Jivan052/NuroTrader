# NeuroTrader Backend Setup

This guide will help you set up the backend server for the NeuroTrader application with AgentKit integration and SQLite database.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite3
- ts-node (for running TypeScript files)

## Installation

1. Install the required dependencies:

```bash
cd backend
npm install
```

Or if you prefer using yarn:

```bash
cd backend
yarn install
```

## Database Setup

Initialize the SQLite database by running:

```bash
npm run setup-db
```

This will create the necessary tables for storing chat sessions and messages.

## Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=3002
NODE_ENV=development
```

## Starting the Server

To start the server in development mode:

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

## API Endpoints

### Agent Chat

- **POST /api/agent/chat**
  - Request body: `{ message: "user message", sessionId: "optional-session-id" }`
  - Response: `{ sessionId: "uuid", response: { content: "agent response", timestamp: "iso-date" } }`

### Session Management

- **POST /api/agent/session**
  - Creates a new session
  - Response: `{ id: "uuid", createdAt: "iso-date", updatedAt: "iso-date" }`

- **GET /api/agent/session/:sessionId/history**
  - Gets the message history for a session
  - Response: `{ sessionId: "uuid", history: [messages], session: {session-info} }`

- **DELETE /api/agent/session/:sessionId**
  - Deletes a session and its messages
  - Response: `{ success: true }`

## Integration with AgentKit

The backend integrates with the AgentKit module by spawning a ts-node process to run the index.ts script with the user message. If ts-node is not available, it falls back to using node directly.

## Error Handling

The API includes proper error handling and returns appropriate HTTP status codes and error messages.

## Rate Limiting

The API includes rate limiting to prevent abuse. By default, it allows 100 requests per 15 minutes per IP address.

## License

This project is licensed under the MIT License.
