#!/bin/bash
# Simple script to run AgentKit directly with Bun

# Check if a prompt was provided
if [ -z "$1" ]; then
  echo "Usage: $0 \"your prompt here\""
  echo "Example: $0 \"What is the balance of the wallet?\""
  exit 1
fi

# Run the AgentKit index.ts with the provided prompt
cd "$(dirname "$0")"
bun run index.ts "$1"
