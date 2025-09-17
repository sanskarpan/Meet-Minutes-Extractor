#!/bin/bash

# Start Development Servers for Meeting Minutes Extractor
# This script starts both the backend and frontend development servers

echo "Starting AI Meeting Minutes Extractor Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check if required ports are available
echo "🔍 Checking port availability..."
if ! check_port 3000; then
    echo "Backend port 3000 is in use. Please stop the process using port 3000."
    exit 1
fi

if ! check_port 3001; then
    echo "Frontend port 3001 is in use. Please stop the process using port 3001."
    exit 1
fi

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "Backend .env file not found. Creating from template..."
    cp backend/.env.example backend/.env
    echo "Please edit backend/.env and add your OpenAI API key before continuing."
    echo "   Get your API key from: https://platform.openai.com/api-keys"
    read -p "Press Enter after you've added your API key to continue..."
fi

# Install dependencies if needed
echo "Installing dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
fi
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi
cd ..

# Start backend server
echo "Starting backend server on port 3000..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:3000/health > /dev/null; then
    echo "Backend server is running on http://localhost:3000"
else
    echo "Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend server
echo "Starting frontend server on port 3001..."
cd frontend
PORT=3001 npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if curl -s http://localhost:3001 > /dev/null; then
    echo "Frontend server is running on http://localhost:3001"
else
    echo "Frontend server failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "Development environment is ready!"
echo "=================================================="
echo "Frontend: http://localhost:3001"
echo "Backend:  http://localhost:3000"
echo "Health:   http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user to stop the servers
trap 'echo ""; echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "Servers stopped"; exit 0' INT

# Keep script running
wait
