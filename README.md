# Slotted MVP - AI-Powered Omnichannel Marketing Platform

## Overview
Slotted is an AI-powered omnichannel marketing system built with MCP (Model Context Protocol) as the foundational layer. It enables automated campaign planning, content creation, organization, and delivery across multiple channels.

## Features Implemented

### Phase 1: Foundational Infrastructure ✅
- ✅ **MCP Context Engine**: Structured onboarding form that outputs `slotted_context.json`
- ✅ **Company DNA Storage**: Value props, offerings, tone, colors, cadence
- ✅ **AI Clone + GTM Strategy Builder**: AI persona builder and strategy generator
- ✅ **React + TypeScript Setup**: Modern frontend with Tailwind CSS

### Core Components
- **Onboarding Flow**: 7-step comprehensive company setup
- **MCP Context Management**: Real-time context engine with localStorage persistence
- **AI Orchestration Layer**: Multi-provider support (OpenAI, Anthropic) with LangChain
- **Google Workspace Integration**: Sheets API and Drive API services (backend required)

## Technical Architecture

### MCP Integration
- **Context Schema**: Comprehensive company and brand DNA capture
- **Real-time Updates**: Context changes propagate through the application
- **Model-Agnostic**: Supports multiple AI providers through standardized prompts

### AI Orchestration
- **Multi-Provider Support**: OpenAI GPT-4o, Claude 3.5 Sonnet
- **Content Generation**: Blog posts, video scripts, social media, email campaigns
- **Brand-Aware Prompting**: All content generation uses MCP context

### Google Workspace
- **Campaign Calendars**: Automated Google Sheets creation with 13-week templates
- **Folder Structure**: Organized Google Drive folders for asset management
- **Real-time Sync**: Bidirectional updates between application and Google Workspace

## Known Limitations & Next Steps

### Current Limitations
1. **Google APIs**: Requires backend proxy due to CORS and Node.js dependencies
2. **Firebase/Supabase**: Backend persistence not yet implemented
3. **Campaign Management**: UI components ready, need content generation integration

### Immediate Next Steps
1. **Backend API**: Create Express.js/Node.js backend for Google APIs
2. **Database Integration**: Add Supabase for persistent data storage
3. **Campaign Interface**: Connect AI generation to campaign management UI
4. **Asset Pipeline**: Implement content → Google Drive workflow

## Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Google Cloud Project with Sheets/Drive APIs enabled
- OpenAI and/or Anthropic API keys

### Installation
```bash
npm install
npm start
```

### Configuration
1. Complete the onboarding flow to set up company context
2. Configure AI providers in the dashboard
3. Add Google Workspace credentials (requires backend)

## Project Structure

```
src/
├── components/
│   ├── onboarding/          # Multi-step onboarding form
│   └── dashboard/           # Configuration panels
├── contexts/                # React context providers
├── schemas/                 # TypeScript interfaces
├── services/
│   ├── mcp/                # MCP context engine
│   ├── ai/                 # AI orchestration layer
│   └── google/             # Google Workspace integration
└── utils/                  # Utility functions
```

## Success Criteria Met
- ✅ Complete business onboarding flow
- ✅ MCP context engine with real-time updates
- ✅ AI provider configuration and management
- ✅ Google Workspace service architecture
- ✅ Responsive React UI with Tailwind CSS
- ✅ TypeScript throughout for type safety

## Next Phase Requirements
1. **Backend Development**: Express.js API for Google Workspace
2. **Content Pipeline**: Connect AI generation to asset management
3. **Campaign Management**: Implement campaign creation and tracking
4. **Testing**: Add comprehensive test suite
5. **Deployment**: Production deployment setup

## Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: LangChain, OpenAI, Anthropic
- **APIs**: Google Sheets, Google Drive
- **State**: React Context, localStorage
- **Build**: Create React App, PostCSS

---

This MVP demonstrates the core MCP-based architecture and provides a solid foundation for the full omnichannel marketing platform.