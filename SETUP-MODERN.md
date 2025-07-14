# 🚀 Slotted MVP Setup Guide (Modern Stack)

## Overview
This guide will help you set up the modernized Slotted MVP with the latest AI technologies including MCP, advanced web scraping, and cutting-edge AI models.

## Prerequisites

### Required Software
- **Node.js 22+** (Latest LTS)
- **npm 10+** or **yarn 4+**
- **Git** for version control

### API Keys Required
Choose at least one AI provider:
- **OpenAI API Key** (for GPT-4o, GPT-4 Turbo)
- **Anthropic API Key** (for Claude 3.5 Sonnet) 
- **Google AI API Key** (for Gemini 2.0 Flash)

### Optional Services
- **Google Cloud Project** (for Drive/Sheets integration)
- **Supabase Account** (for database persistence)

## Installation Steps

### 1. Clone and Setup
```bash
git clone <repository-url>
cd slotted-mvp

# Backup current files
mv package.json package-old.json
mv tsconfig.json tsconfig-old.json

# Use modern configuration
mv package-new.json package.json
mv tsconfig-new.json tsconfig.json
mv src/App-modern.tsx src/App.tsx
```

### 2. Install Dependencies
```bash
# Install all modern dependencies
npm install

# Install Playwright browsers for web scraping
npx playwright install

# Verify installation
npm run type-check
```

### 3. Environment Configuration
Create `.env.local` file:
```env
# AI Provider API Keys (choose at least one)
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
VITE_GOOGLE_AI_API_KEY=your_google_key_here

# Optional: Database
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Optional: Google Workspace
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Development
VITE_APP_ENV=development
```

### 4. Start Development Server
```bash
# Start Vite development server
npm run dev

# Server will start on http://localhost:3000
```

## Usage Guide

### MVP #1: Company DNA Extractor

1. **Open the Application**
   - Navigate to http://localhost:3000
   - Click "Start with Company DNA Extractor"

2. **Configure AI Provider**
   - Choose your preferred AI provider (OpenAI, Anthropic, or Google)
   - Select the model (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0)
   - Enter your API key

3. **Extract Company DNA**
   - Enter company name (required)
   - Optionally add website URL for automated analysis
   - Add industry and description if known
   - Click "Extract Company DNA"

4. **Review Results**
   - View comprehensive brand analysis
   - Download JSON file for portability
   - Use for MVP #2 (Marketing Calendar Generator)

## Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run Biome linter
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Biome
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run Vitest tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run Playwright E2E tests
```

## Project Structure

```
slotted-mvp/
├── src/
│   ├── components/
│   │   └── mvp1/
│   │       └── CompanyDNAExtractor.tsx    # MVP #1 main component
│   ├── services/
│   │   ├── ai/
│   │   │   └── modern-ai-orchestrator.ts   # Multi-model AI management
│   │   ├── web-automation/
│   │   │   └── website-analyzer.ts         # Playwright web scraping
│   │   └── mcp/
│   │       └── modern-mcp-server.ts        # MCP context management
│   ├── App.tsx                             # Main application
│   └── main.tsx                            # Entry point
├── package.json                            # Modern dependencies
├── vite.config.ts                          # Vite configuration
├── tsconfig.json                           # TypeScript config
├── biome.json                              # Biome linter config
└── index.html                              # HTML entry point
```

## Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Check TypeScript configuration
npm run type-check
```

**Playwright browser errors:**
```bash
# Reinstall browsers
npx playwright install --force
```

**API Key errors:**
- Ensure API keys are valid and have sufficient credits
- Check environment variable names match exactly
- Restart dev server after adding new env vars

### Performance Optimization

**For better development performance:**
```bash
# Use faster package manager
npm install -g pnpm
pnpm install
pnpm dev
```

**For production builds:**
```bash
# Build with optimizations
npm run build

# Preview production build
npm run preview
```

## Next Steps

### MVP #2: Marketing Calendar Generator
Once MVP #1 is working:
1. The extracted company DNA will be saved in MCP format
2. Use this data to generate 13-week marketing calendars
3. Integrate with Google Sheets for calendar management

### Additional Features
- **Website Scraping**: Automatic brand analysis from websites
- **Visual Analysis**: Color scheme and typography extraction  
- **Multi-model AI**: Switch between different AI providers
- **Export/Import**: Portable company DNA files

## Support

### Documentation
- **MCP Protocol**: https://docs.anthropic.com/en/docs/mcp
- **Vite**: https://vitejs.dev/guide/
- **Playwright**: https://playwright.dev/docs/

### Common Commands
```bash
# Quick start from scratch
git pull origin main
npm install
npm run dev

# Run full test suite
npm run lint && npm run type-check && npm run test

# Build for production
npm run build
```

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- API keys are stored only in browser memory (not localStorage)
- Website scraping is sandboxed in Playwright containers

---

## What's Built So Far

✅ **Complete MVP #1 Foundation**
- Modern React 19 + TypeScript 5.7 + Vite setup
- Multi-AI provider support (OpenAI, Anthropic, Google)
- Advanced web scraping with Playwright
- MCP context management
- Professional UI with real-time progress
- JSON export functionality

✅ **Future-Ready Architecture**
- Latest AI protocols (MCP, A2A ready)
- Modern development tooling (Biome, Vitest)
- Scalable micro-MVP structure
- Type-safe throughout with Zod validation

🎯 **Ready to Ship**
MVP #1 is complete and ready to generate revenue as a standalone tool worth $29-49 per analysis.