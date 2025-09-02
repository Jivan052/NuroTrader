# NuroTrader Documentation

This document provides comprehensive information about the NuroTrader Analytics Platform, including architecture, components, configuration options, and troubleshooting guides.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Component Documentation](#component-documentation)
  - [AgentChatWidget](#agentchatwidget)
  - [Analytics Components](#analytics-components)
- [API Reference](#api-reference)
- [Configuration Guide](#configuration-guide)
- [Troubleshooting](#troubleshooting)
- [Development Guide](#development-guide)

## Architecture Overview

NuroTrader combines a React frontend with a Node.js backend to create a seamless crypto analytics platform:

```
┌─────────────────┐         ┌──────────────────┐         ┌────────────────────┐
│                 │         │                  │         │                    │
│  React Frontend │◄─────►  │   Express API    │◄─────►  │   AgentKit         │
│  (Vite + React) │   API   │                  │  Agent  │   Blockchain API   │
│                 │  Calls  │                  │ Requests│                    │
└─────────────────┘         └──────────────────┘         └────────────────────┘
         │                           │                             │
         │                           │                             │
         ▼                           ▼                             ▼
┌─────────────────┐         ┌──────────────────┐         ┌────────────────────┐
│                 │         │                  │         │                    │
│   UI Components │         │ Firebase Services│         │   Blockchain Data  │
│                 │         │  • Firestore     │         │                    │
│                 │         │  • Auth          │         │                    │
│                 │         │  • Realtime DB   │         │                    │
└─────────────────┘         └──────────────────┘         └────────────────────┘
```

### Frontend Architecture

The frontend follows a component-based architecture with:

- **Pages**: Top-level route components
- **Components**: Reusable UI elements
- **Hooks**: Custom React hooks for shared logic
- **Utils**: Utility functions and helpers

### Backend Architecture

The backend architecture consists of:

1. **Express Server**: Handles API requests from the frontend
2. **AgentKit Integration**: Processes AI agent requests
3. **Firebase Services**:
   - **Firestore**: Document database for structured data storage
   - **Realtime Database**: Real-time data synchronization
   - **Authentication**: User authentication and session management

The data flow is as follows:

1. Frontend sends requests to Express API
2. Express processes requests and interacts with Firebase/AgentKit
3. Data is stored/retrieved from Firebase services
4. Responses are returned to the frontend

## Component Documentation

### AgentChatWidget

The `AgentChatWidget` component is a sophisticated chat interface for interacting with the blockchain AI agent.

#### Features

- **Expandable Interface**: Toggle between minimized and expanded states
- **Fullscreen Mode**: Enhanced view for detailed responses
- **Markdown Support**: Renders formatted text, code blocks, tables, and lists
- **Copy Functionality**: Easy copying of agent responses
- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Navigation**: ESC to exit fullscreen mode

#### Props

| Prop             | Type                   | Default        | Description                                |
|------------------|------------------------|--------------|--------------------------------------------|
| initialExpanded  | boolean                | false        | Start with the widget expanded             |
| position         | 'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left' | 'bottom-right' | Position of the widget on screen |
| theme            | 'light' \| 'dark' \| 'auto' | 'auto'       | Color theme for the widget               |

#### Usage Example

```tsx
import AgentChatWidget from '@/components/AgentChatWidget';

function MyPage() {
  return (
    <div>
      <h1>My Analytics Dashboard</h1>
      {/* Other content */}
      <AgentChatWidget 
        initialExpanded={false}
        position="bottom-right"
        theme="dark"
      />
    </div>
  );
}
```

#### Component Structure

```
AgentChatWidget
├── Collapsed State (Button with MessageSquare icon)
└── Expanded State
    ├── Header (Title, Clear Chat, Fullscreen toggle)
    ├── Message Container
    │   ├── Empty State (Suggestions)
    │   └── Messages
    │       ├── User Messages (Right aligned)
    │       └── Agent Messages (Left aligned, with Markdown)
    └── Input Area (Textarea and Send button)
```

### Analytics Components

The analytics dashboard is built using several components that work together to display market data.

#### AnalyticsHub

This is the main container for all analytics components. It organizes the layout and manages data fetching.

#### Chart Component

The chart component uses Recharts to visualize price data and market trends.

#### Key Features

- **Interactive Charts**: Zoom and pan functionality
- **Multiple Timeframes**: View data in different time intervals
- **Comparison Mode**: Compare multiple tokens
- **Technical Indicators**: Moving averages and other indicators

## Firebase Integration

The application uses Firebase for user management, waitlist functionality, and data storage. For detailed information about the Firebase integration, please see the [Firebase Integration Documentation](./FIREBASE_INTEGRATION.md).

### Key Firebase Features

- **Waitlist Management**: Store and manage users on the waiting list
- **User Authentication**: Secure user authentication with wallet connections
- **Real-time Updates**: Live updates for waitlist counts and user status
- **Data Persistence**: Reliable storage for user information

## API Reference

### Agent API Endpoints

#### POST `/api/agent/chat`

Send a message to the AI agent.

**Request Body:**
```json
{
  "message": "What is the current price of Bitcoin?",
  "role": "user"
}
```

**Response:**
```json
{
  "agentResponse": {
    "id": "resp_123456",
    "content": "The current price of Bitcoin is $60,123.45, which represents a 2.3% increase in the last 24 hours.",
    "role": "assistant",
    "timestamp": "2025-09-02T12:34:56.789Z"
  }
}
```

## Configuration Guide

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# AgentKit configuration
AGENTKIT_API_KEY=your_api_key_here
MODEL_PROVIDER=openai
MODEL_NAME=gpt-4o
ENABLE_TRACING=false
LOG_LEVEL=info

# Firebase configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Other API keys
VITE_EMAILJS_PUBLIC_KEY=your-emailjs-public-key
```

### Frontend Configuration

The frontend can be configured in the `vite.config.ts` file:

```ts
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3002'
    }
  }
});
```

## Troubleshooting

### Common Issues and Solutions

#### Agent Server Connection Failed

**Symptoms:**
- Error messages in the chat widget
- Console errors related to API calls

**Solutions:**
1. Ensure the backend server is running on port 3002
2. Check your API keys in the .env file
3. Verify that CORS is properly configured
4. Check network connectivity

#### UI Rendering Issues

**Symptoms:**
- Broken UI elements
- Missing styles or components

**Solutions:**
1. Clear your browser cache
2. Run `npm install` to ensure all dependencies are installed
3. Check browser console for JavaScript errors
4. Verify that all UI components are correctly imported

#### AgentKit Integration Problems

**Symptoms:**
- Agent not responding correctly
- Error messages about AgentKit

**Solutions:**
1. Verify your AgentKit API key is valid
2. Check the backend logs for any authentication errors
3. Ensure the model provider is correctly specified
4. Update AgentKit to the latest version

## Development Guide

### Adding New Features

#### 1. Extend the Agent Capabilities

To add new agent capabilities:

1. Update the agent prompt in `backend/agent-server.cjs`
2. Add new response handling in the frontend
3. Test with various queries

#### 2. Add New Analytics Components

To add new analytics visualizations:

1. Create a new component in `src/components/`
2. Add data fetching logic
3. Import and use in the AnalyticsHub component

#### 3. Customize the Theme

The visual design can be customized in:

- `tailwind.config.ts`: Main color scheme and design tokens
- `src/index.css`: Global CSS variables and utility classes
- Individual component files: Component-specific styles
