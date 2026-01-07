#!/bin/bash

echo "==========================================="
echo "   ID Card Generation System - Launcher    "
echo "==========================================="

# 0. Check if Node/NPM is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: 'node' command not found."
    echo "👉 You must install Node.js. Run this on your Linux terminal:"
    echo "   sudo dpkg --configure -a"
    echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: 'npm' command not found."
    echo "👉 Please install npm: sudo apt-get install -y npm"
    exit 1
fi

# 1. Check Node.js Version
REQUIRED_NODE_VERSION=18
CURRENT_NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')

if [ "$CURRENT_NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
    echo "❌ ERROR: Your Node.js version is too old ($CURRENT_NODE_VERSION). You need version $REQUIRED_NODE_VERSION or higher."
    echo "👉 Please install a newer version of Node.js."
    echo "   Try: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# 2. Clean Start Check
# If user copied node_modules from another OS (like Mac), it will fail.
# We'll check if tsc exists. If not, or if forced, we reinstall.
if [ ! -f "node_modules/.bin/tsc" ]; then
    echo "⚠️  Essential tools missing or corrupted. cleaning..."
    rm -rf node_modules package-lock.json
fi

# 3. Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing required libraries..."
    npm install
else
    echo "Dependencies ready."
fi

# 4. Build the frontend
echo "Building the application..."
if ! npm run build; then
    echo "❌ Build failed. Attempting to fix by reinstalling dependencies..."
    rm -rf node_modules package-lock.json
    npm install
    if ! npm run build; then
         echo "❌ Critical build error. Please check the logs."
         exit 1
    fi
fi

# 5. Start the server
echo "-------------------------------------------"
echo "✅ System is starting..."
echo "👉 Open your browser to: http://localhost:3000"
echo "-------------------------------------------"
npm start
