#!/bin/bash

# 🚀 Slotted MVP Deployment Script
# Run this script to deploy your MVP platform to Vercel

echo "🚀 Starting Slotted MVP Deployment Process..."
echo "================================================"

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the slotted-mvp directory"
    echo "   Please run: cd /home/temerarii/slotted-mvp"
    exit 1
fi

echo "✅ In correct directory: $(pwd)"

# Step 2: Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready: $(vercel --version)"

# Step 3: Authenticate with Vercel
echo "🔐 Starting Vercel authentication..."
echo "   1. Browser will open for GitHub OAuth"
echo "   2. Click 'Authorize Vercel'"
echo "   3. Return here when complete"
echo ""
echo "Press ENTER to start authentication..."
read -r

vercel login

# Check if authentication was successful
if [ $? -eq 0 ]; then
    echo "✅ Authentication successful!"
else
    echo "❌ Authentication failed. Please try again."
    exit 1
fi

# Step 4: Deploy to production
echo ""
echo "🚀 Deploying to Vercel production..."
echo "   Answer the prompts as follows:"
echo "   - Set up and deploy? → YES"
echo "   - Which scope? → Choose your account"
echo "   - Link to existing project? → NO"
echo "   - Project name? → slotted-mvp (or keep default)"
echo "   - Directory? → ./ (current directory)"
echo ""
echo "Press ENTER to start deployment..."
read -r

vercel --prod

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "================================================"
    echo ""
    echo "🔑 CRITICAL NEXT STEP: Add your OpenAI API Key"
    echo "   Run this command:"
    echo "   vercel env add VITE_OPENAI_API_KEY production"
    echo ""
    echo "   Then paste this key:"
    echo "   sk-..."
    echo ""
    echo "   Then redeploy:"
    echo "   vercel --prod"
    echo ""
    echo "💰 Your MVP platform is now LIVE and ready to generate revenue!"
    echo "   - Company DNA Extractor: $29-49 per analysis"
    echo "   - Marketing Calendar: $99-199 per calendar"
    echo "   - Total customer value: $128-248"
    echo ""
    echo "🎯 Visit your live URL and test everything works!"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi