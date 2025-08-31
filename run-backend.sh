#!/bin/bash

echo "Installing backend dependencies..."
cd backend
npm run install-deps

echo "Setting up and starting the backend server..."
npm run quick-start
