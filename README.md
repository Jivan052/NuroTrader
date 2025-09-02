
# NuroTrader Analytics Platform

NuroTrader is an AI-powered cryptocurrency analytics platform with comprehensive market insights and an integrated AI agent.

## Features

- **Analytics Dashboard**: View comprehensive market analytics with AI-powered insights
- **Embedded AI Agent**: Chat with our blockchain AI assistant directly from the analytics dashboard
- **Multi-Chain Support**: Compatible with major blockchains including Avalanche
- **Real-Time Data**: Live market data, sentiment analysis, and trading insights
- **AgentKit Integration**: Seamless integration with AgentKit for blockchain interactions

## Setup and Installation

1. Install dependencies:
   ```bash
   bun install
   ```

2. Make sure AgentKit environment variables are set in `backend/agentkit/.env`

3. To run both the frontend and backend simultaneously, use the provided PowerShell script:
   ```powershell
   .\start-agent-app.ps1
   ```

This will start both the frontend development server and the agent backend server, and provide URLs to access them.

The frontend will be available at http://localhost:5173

## How to Use

1. Open the application at http://localhost:5173
2. Navigate to the Analytics Dashboard
3. Use the chat widget in the bottom-right corner to interact with the AI agent
4. Ask questions about market data, trading recommendations, or blockchain information

## Technologies Used

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Framer Motion

### Backend
- Node.js
- Express
- SQLite (for persistent storage)
- ts-node (for running TypeScript files)
- AgentKit integration

## Application Architecture

The application uses a simplified architecture:

1. **Frontend**: React-based UI with Tailwind CSS styling
   - Analytics Dashboard: Displays market data, sentiment analysis, and price charts
   - AI Agent Widget: Chat interface that appears in the bottom corner of the dashboard

2. **Backend**: Express server for handling agent interactions
   - Simple Express server: Handles API requests from the frontend
   - AgentKit Integration: Connects to the AgentKit module for blockchain interactions
   - In-memory storage: Stores chat sessions during runtime

3. **Integration**: The agent widget in the dashboard directly communicates with the backend server
   - Real-time responses: Get immediate responses from the AI agent
   - Blockchain capabilities: Leverage AgentKit's blockchain interaction capabilities

