
# NuroTrader AI Trading Platform

NuroTrader is an AI-powered cryptocurrency trading platform with analytics, market insights, and an interactive AI agent.

## Features

- **Interactive AI Agent**: Chat with our AI trading assistant with persistent conversations
- **Analytics Dashboard**: View comprehensive market analytics
- **Multi-Chain Support**: Compatible with Ethereum, Solana, Avalanche, and Fantom
- **Real-Time Data**: Live market data and trading insights
- **Persistent Chat Sessions**: User conversations stored in SQLite database
- **AgentKit Integration**: Backend integration with AgentKit for intelligent responses

## Setup and Installation

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the frontend development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install express cors sqlite3 dotenv morgan express-rate-limit ts-node typescript uuid
   ```

3. Initialize the SQLite database:
   ```bash
   node setup-db.js
   ```

4. Create a `.env` file based on `.env.example` (optional):
   ```bash
   copy .env.example .env
   ```

5. Start the backend server:
   ```bash
   node server.js
   ```

### Running Both Frontend and Backend

To run both servers simultaneously (requires concurrently package):

```bash
npm install -g concurrently  # Install globally if needed
npm run dev:all
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

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

## Backend Architecture

The backend is built with a modular architecture:

1. **Express Server**: Handles HTTP requests and responses
2. **SQLite Database**: Stores chat sessions and message history
3. **Service Layer**: Interfaces with the AgentKit module
4. **API Routes**: RESTful endpoints for the frontend
5. **Rate Limiting**: Prevents API abuse
6. **Error Handling**: Graceful error recovery

All conversations with the AI agent are persisted in the database, allowing users to continue their sessions across visits.

