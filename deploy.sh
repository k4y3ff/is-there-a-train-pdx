#!/bin/bash

# Deploy script for Train Status App
echo "🚂 Preparing Train Status App for deployment..."

# Check if all required files exist
required_files=("index.html" "styles.css" "script.js" "netlify.toml" "README.md")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files: ${missing_files[*]}"
    exit 1
fi

echo "✅ All required files found"

# Create a simple local test server
echo "🌐 Starting local test server..."
echo "📱 Open http://localhost:8000 in your browser"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "⚠️  Python not found. Please install Python to test locally."
    echo "📁 You can also open index.html directly in your browser."
fi 