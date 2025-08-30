#!/bin/bash

echo "Installing backend dependencies..."
cd backend
npm install express cors body-parser
npm install --save-dev nodemon
echo "Backend dependencies installed!"
echo ""
echo "To start the backend server, run:"
echo "cd backend"
echo "npm run dev"
