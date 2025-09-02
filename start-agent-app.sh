#!/usr/bin/env bash

# Start the AgentKit server
echo "Starting the AgentKit server..."
node backend/agent-server.cjs &
AGENT_PID=$!

# Wait a bit for the server to start
sleep 2

# Start the frontend
echo "Starting the frontend development server..."
npm run dev

# When the frontend is stopped, kill the agent server
kill $AGENT_PID
