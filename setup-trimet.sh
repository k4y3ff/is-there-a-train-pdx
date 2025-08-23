#!/bin/bash

# TriMet API Setup Script
echo "🚇 Setting up TriMet MAX train integration..."

# Check if config.js already exists
if [ -f "config.js" ]; then
    echo "⚠️  config.js already exists. Backing up to config.js.backup"
    cp config.js config.js.backup
fi

# Copy template to config.js
if [ -f "config.template.js" ]; then
    cp config.template.js config.js
    echo "✅ Created config.js from template"
else
    echo "❌ config.template.js not found"
    exit 1
fi

echo ""
echo "🔧 Next steps:"
echo "1. Edit config.js and add your TriMet App ID"
echo "2. Set simulationMode: false to use real data"
echo "3. Save the file and refresh your app"
echo ""
echo "📝 Your config.js file is now ready to edit!"
echo "🔒 Remember: config.js is in .gitignore and won't be committed"
echo ""
echo "💡 To test: Open index.html and check the browser console for API calls" 