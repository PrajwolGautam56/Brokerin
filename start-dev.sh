#!/bin/bash
# Development server startup script with better error visibility

echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache .eslintcache

echo "🚀 Starting development server..."
echo "📝 This may take 1-3 minutes on first run..."
echo ""

# Kill any existing processes on port 3000
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null

# Start with verbose output using npm (which will find react-scripts)
BROWSER=none npm start 2>&1 | tee npm-start.log

