#!/bin/bash

# Kill any existing processes on the required ports
echo "Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true

# Activate virtual environment and start Django backend
echo "Starting Django backend..."
source .venv/bin/activate
python manage.py runserver &

# Wait a moment to ensure backend starts
sleep 2

# Start frontend
echo "Starting frontend..."
cd frontend && npm run dev &

# Wait for either process to exit
wait

# Kill both processes on exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT