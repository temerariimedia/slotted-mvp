# 🚀 Slotted MVP Setup Guide

## Quick Start

### 1. Frontend Setup
```bash
# In the main directory
npm install
npm start
```

### 2. Backend Setup
```bash
# In the backend directory
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

## 🔧 Configuration Required

### AI Providers (Required)
Get API keys and configure in the UI:
- **OpenAI**: [platform.openai.com](https://platform.openai.com) → API Keys
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) → API Keys

### Google Workspace (Phase 1 Complete)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project and enable APIs:
   - Google Sheets API
   - Google Drive API
3. Create service account → Download JSON key
4. Paste JSON in the Google Config panel

### Optional Media APIs (Phase 3)
- **ElevenLabs** (Voice): [elevenlabs.io](https://elevenlabs.io) → API Keys
- **Midjourney** (Images): Via Discord bot or API service

## 📁 What You Get

### ✅ Phase 1: Foundation (Complete)
- **MCP Context Engine**: Company onboarding → structured context
- **AI Orchestration**: Multi-provider content generation  
- **Google Integration**: Drive folders + Sheets calendar creation
- **Dashboard**: Campaign management interface

### 🔄 Phase 2: Campaign Planning (Backend Ready)
- **13-Week Generator**: AI-powered campaign topic creation
- **Channel Matrix**: Primary/secondary channel mapping
- **Asset Organization**: Auto-folder creation per campaign

### 📝 Phase 3: Content Pipeline (Backend Ready) 
- **Blog Generation**: 2000+ word posts with SEO
- **Video Scripts**: Timed scripts with scene descriptions
- **Social Posts**: Platform-optimized content
- **Email Campaigns**: Subject lines + full content
- **Voice Generation**: ElevenLabs integration
- **Image Creation**: DALL-E integration

## 🎯 Current Status

**Your Interface ✅**: Professional dashboard with all panels ready
**Backend Systems ✅**: Full API layer for all roadmap phases
**Google Integration ✅**: Real Drive + Sheets creation
**AI Content ✅**: Multi-provider content generation
**Campaign Planning ✅**: 13-week strategic planning

## 🚦 How to Use

1. **Complete Onboarding**: Fill out your company's MCP context
2. **Configure AI**: Add OpenAI or Anthropic API key  
3. **Configure Google**: Add service account JSON
4. **Generate Campaigns**: Click "Generate Campaigns" for 13-week plan
5. **Create Assets**: Click "Create Assets" for Drive folders + calendar
6. **Start Content**: Select campaigns to generate blog/video/social content

## 🔗 API Endpoints

### Google Workspace
- `POST /api/google/test-connection` - Test credentials
- `POST /api/google/drive/create-campaign-folders` - Create folder structure
- `POST /api/google/sheets/create-campaign-calendar` - Generate calendar

### Campaign Planning  
- `POST /api/campaigns/generate-topics` - 13-week campaign topics
- `POST /api/campaigns/generate-plan` - Detailed campaign strategy
- `POST /api/campaigns/channel-matrix` - Channel recommendations

### Content Generation
- `POST /api/content/generate-blog` - Blog posts with SEO
- `POST /api/content/generate-video-script` - Video scripts
- `POST /api/content/generate-social` - Social media posts
- `POST /api/content/generate-email` - Email campaigns
- `POST /api/content/generate-package` - Complete content package

## 🎯 Success Metrics

✅ **MCP Context**: Captures complete brand DNA
✅ **AI Integration**: Multi-provider content generation
✅ **Google APIs**: Real Drive/Sheets integration  
✅ **Campaign Planning**: Strategic 13-week roadmap
✅ **Content Pipeline**: Full omnichannel content creation
✅ **Future-Ready**: Modular architecture for Phase 4+ features

## 🚨 Production Notes

- Store API keys securely (not in localStorage)
- Implement proper authentication
- Add database for campaign/content persistence  
- Configure cloud storage for generated assets
- Add comprehensive error handling
- Implement rate limiting for API calls

---

**You now have a complete MCP-powered marketing system that generates strategic campaigns and creates content across all channels!**