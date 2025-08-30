
# NeuroTrader AI Trading Platform

NeuroTrader is an AI-powered cryptocurrency trading platform with analytics, market insights, and an interactive AI agent.

## Features

- **Interactive AI Agent**: Chat with our AI trading assistant
- **Analytics Dashboard**: View comprehensive market analytics
- **Multi-Chain Support**: Compatible with Ethereum, Solana, Avalanche, and Fantom
- **Real-Time Data**: Live market data and trading insights

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

1. Run the setup script to install backend dependencies:
   ```bash
   # On Windows
   setup-backend.bat
   
   # On Unix/Mac
   chmod +x setup-backend.sh
   ./setup-backend.sh
   ```

2. Start the backend server:
   ```bash
   cd backend
   npm run dev
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

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d2f3f54b-9cf5-4cb4-89b9-bf50bd9f52e7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

