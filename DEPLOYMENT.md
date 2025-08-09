# Slotted MVP - Digital Ocean Deployment Guide

## 🚀 Quick Deploy to Digital Ocean

### Prerequisites
1. Digital Ocean account
2. GitHub repository with code pushed
3. API keys for AI services (optional for initial deployment)

### Deployment Steps

#### Option 1: Using Digital Ocean App Platform (Recommended)

1. **Login to Digital Ocean**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"

2. **Connect Repository**
   - Select "GitHub"
   - Choose repository: `temerariimedia/slotted-mvp`
   - Branch: `main`
   - Auto-deploy: ✅ Enabled

3. **Configure Build & Runtime**
   - **Build Command**: `npm ci --production=false && npm run build`
   - **Run Command**: `npm start`
   - **Port**: `8080`
   - **Instance Type**: Basic ($5/month)

4. **Environment Variables** (Optional - add later)
   ```
   NODE_ENV=production
   VITE_APP_ENV=production
   VITE_OPENAI_API_KEY=(your-key)
   VITE_ANTHROPIC_API_KEY=(your-key)
   VITE_GOOGLE_AI_API_KEY=(your-key)
   VITE_STRIPE_PUBLISHABLE_KEY=(your-key)
   ```

5. **Deploy**
   - Review configuration
   - Click "Create Resources"
   - Wait for deployment (5-10 minutes)

#### Option 2: Using App Spec File

1. **Upload App Spec**
   - In Digital Ocean, go to Apps → Create App
   - Select "Import from App Spec"
   - Upload `.do/app.yaml` file from the repository

2. **Review and Deploy**
   - Review the generated configuration
   - Add environment variables if needed
   - Click "Create Resources"

### Post-Deployment

#### 1. Verify Deployment
- Check the provided URL (e.g., `https://slotted-mvp-xyz.ondigitalocean.app`)
- Test core functionality:
  - Home page loads
  - MVP 1 (Company DNA Extractor) works without API keys
  - MVP 2 & MVP 3 accessible

#### 2. Configure API Keys (For Full Functionality)
- Go to App → Settings → Environment Variables
- Add the following variables:
  ```
  VITE_OPENAI_API_KEY=sk-...
  VITE_ANTHROPIC_API_KEY=sk-ant-...
  VITE_GOOGLE_AI_API_KEY=...
  VITE_STRIPE_PUBLISHABLE_KEY=pk_...
  ```

#### 3. Custom Domain (Optional)
- Go to App → Settings → Domains
- Add your custom domain
- Configure DNS records as instructed

### 🎯 Current Status

**✅ Production Ready Features:**
- MVP 1: Company DNA Extractor (works with mock data)
- MVP 2: Marketing Calendar Generator  
- MVP 3: Blog Content Generator
- Complete onboarding flow
- Responsive design

**🔧 Requires API Keys for Full Functionality:**
- AI content generation
- Website analysis
- Payment processing

### 📊 Estimated Costs

- **Basic Plan**: $5/month (512MB RAM, 1 vCPU)
- **Pro Plan**: $12/month (1GB RAM, 1 vCPU) - Recommended for production
- **Bandwidth**: 1TB included

### 🔗 Live Site Access

Once deployed, your site will be available at:
- Digital Ocean URL: `https://[app-name]-[hash].ondigitalocean.app`
- Custom domain: Configure in settings

### 🛠️ Development Workflow

**Local Development:**
```bash
npm install
npm run dev
# http://localhost:5173
```

**Production Build:**
```bash
npm run build
npm start
# http://localhost:8080
```

**Deployment:**
- Push to `main` branch
- Digital Ocean automatically redeploys
- Check deployment logs in DO dashboard

### 📝 Notes

- Site works without API keys for demonstration
- Add real API keys for full AI functionality
- All MVP features are implemented and working
- Ready to continue adding features from previous project

---

**Next Steps**: Once deployed, you can continue adding the advanced features from your previous project while the site is live and accessible for preview.