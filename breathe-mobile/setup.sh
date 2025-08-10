#!/bin/bash

echo "🚀 Setting up Breathe Mobile Development Environment"
echo "====================================================="

# Check Node.js version
echo "📍 Checking Node.js version..."
node_version=$(node -v)
echo "   Node.js version: $node_version"

# Check npm version
echo "📍 Checking npm version..."
npm_version=$(npm -v)
echo "   npm version: $npm_version"

# Install global dependencies
echo "📦 Installing global dependencies..."
npm install -g expo-cli eas-cli

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Check if on macOS for iOS setup
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected - Setting up iOS development tools..."
    
    # Check for Xcode
    if xcode-select -p &> /dev/null; then
        echo "   ✅ Xcode Command Line Tools installed"
    else
        echo "   ❌ Xcode Command Line Tools not found. Installing..."
        xcode-select --install
    fi
    
    # Check for Watchman
    if command -v watchman &> /dev/null; then
        echo "   ✅ Watchman installed"
    else
        echo "   📦 Installing Watchman..."
        brew install watchman
    fi
    
    # Check for CocoaPods
    if command -v pod &> /dev/null; then
        echo "   ✅ CocoaPods installed"
    else
        echo "   📦 Installing CocoaPods..."
        sudo gem install cocoapods
    fi
fi

# Run expo doctor
echo "🏥 Running health check..."
npx expo-doctor

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 To run the app:"
echo "   - iOS Simulator: npm run ios"
echo "   - Android Emulator: npm run android"
echo "   - Expo Go: npm start (scan QR code)"
echo ""
echo "📚 Available commands:"
echo "   npm start         - Start Expo development server"
echo "   npm run ios       - Run on iOS simulator"
echo "   npm run android   - Run on Android emulator"
echo "   npm run web       - Run in web browser"
echo "   npm run clean     - Clean and reinstall dependencies"
echo "   npm run doctor    - Check project health"
echo "   npm run lint      - Check TypeScript errors"
echo ""
echo "Happy coding! 🎉"