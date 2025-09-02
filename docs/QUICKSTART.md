# NeuroTrader Quick Start Guide

This guide will help you get up and running with NeuroTrader quickly. Follow these simple steps to start exploring cryptocurrency analytics and interacting with the AI agent.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 16+ or Bun
- Git
- A code editor (e.g., VS Code)

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Jivan052/NeuroTrader.git
cd NeuroTrader
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using Bun (faster):
```bash
bun install
```

### Step 3: Configure Environment Variables

Create a file named `.env` in the `backend/agentkit/` directory:

```
AGENTKIT_API_KEY=your_api_key_here
MODEL_PROVIDER=openai
MODEL_NAME=gpt-4o
```

You'll need to obtain an API key from [AgentKit](https://agentkit.dev) or use your OpenAI API key.

## Running the Application

### Windows Users

For Windows users, we provide a convenient script that starts both the frontend and backend:

```powershell
.\start-agent-app.ps1
```

### Manual Start

If you prefer to start services manually or you're on Mac/Linux:

#### Terminal 1: Start the Frontend
```bash
npm run dev
```

#### Terminal 2: Start the Backend
```bash
npm run agent
```

## Accessing the Application

Once both services are running:

1. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)
2. You should see the NeuroTrader dashboard with charts and analytics
3. The AI chat widget is located in the bottom right corner

## Using the AI Agent

1. Click on the chat icon in the bottom right corner to expand the chat widget
2. Type a question related to cryptocurrency markets, such as:
   - "What is the current price of Bitcoin?"
   - "How has Ethereum performed over the last week?"
   - "Show me a price analysis of Avalanche"
3. Press Enter or click the send button
4. The AI agent will process your request and provide a response
5. Use the fullscreen button to expand longer responses

## Tips for Best Results

- Be specific in your questions
- For complex data analysis, break down your questions
- Use the copy button to save important information
- Try different timeframes when asking about market performance
- Explore the dashboard analytics alongside the AI chat for a comprehensive view

## Next Steps

After getting familiar with the basic functionality, explore:

- The Analytics Dashboard for detailed market insights
- Different query types for the AI agent
- Multi-chain analytics for various blockchain networks
- Setting up custom alerts and notifications

## Troubleshooting

If you encounter issues:

1. Ensure both the frontend and backend servers are running
2. Check that your API key is correctly configured
3. Clear your browser cache if you see UI inconsistencies
4. Check the terminal for any error messages

For more detailed information, refer to the [full documentation](./DOCUMENTATION.md).

---

Happy trading with NeuroTrader! 📈
