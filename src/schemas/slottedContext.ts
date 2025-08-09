export interface SlottedContext {
  // Backward compatibility for existing components
  companyName?: string
  industry?: string
  brandVoice?: string
  targetAudience?: string
  
  company?: {
    name: string
    industry: string
    size: 'startup' | 'small' | 'medium' | 'enterprise'
    description: string
    website?: string
  }
  
  // New enhanced structure
  companyInfo?: {
    companyName: string
    industry: string
    size: 'startup' | 'small' | 'medium' | 'enterprise'
    description: string
    website?: string
  }
  
  targetSegments?: {
    primarySegment?: {
      name: string
      description?: string
    }
  }
  brandDNA?: {
    valuePropositions?: string[]
    coreOfferings?: string[]
    targetAudience?: {
      demographics?: string
      psychographics?: string
      painPoints?: string[]
      impact?: string
    }
    brandTone?: {
      personality?: string[]
      voiceAttributes?: string[]
      communicationStyle?: 'formal' | 'casual' | 'conversational' | 'technical'
    }
    brandColors?: {
      primary?: string
      secondary?: string
      accent?: string
    }
  }
  marketingGoals?: {
    primaryGoals?: string[]
    kpis?: string[]
    cadence?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly'
    budget?: string
    channels?: {
      primary?: string[]
      secondary?: string[]
      experimental?: string[]
    }
  }
  gtmStrategy?: {
    segments?: Array<{
      name: string
      description: string
      channels: string[]
      messaging: string
    }>
    competitiveAdvantage?: string
    marketPosition?: string
  }
  contentPreferences?: {
    contentTypes?: string[]
    lengthPreferences?: {
      blog?: number
      social?: number
      email?: number
    }
    styleGuidelines?: string[]
  }
  aiPersona?: {
    personalityTraits?: string[]
    communicationPattern?: string
    knowledgeAreas?: string[]
    constraints?: string[]
  }
  // Enhanced features from improved UX
  competitiveAnalysis?: {
    competitors: Array<{
      name: string
      website: string
      strengths: string[]
      weaknesses: string[]
      marketPosition: string
    }>
    swotAnalysis: {
      strengths: string[]
      weaknesses: string[]
      opportunities: string[]
      threats: string[]
    }
    marketGaps: string[]
  }
  pricingStrategy?: {
    model: 'subscription' | 'one-time' | 'usage-based' | 'freemium' | 'tiered'
    tiers: Array<{
      name: string
      price: number
      features: string[]
      targetSegment: string
    }>
    valueProposition: string
    competitivePricing: string[]
  }
  channelConfiguration?: {
    primary: Array<{
      name: string
      priority: 'high' | 'medium' | 'low'
      audience: string
      contentTypes: string[]
      frequency: string
    }>
    journeyMap: {
      awareness: string[]
      consideration: string[]
      decision: string[]
      retention: string[]
    }
    integrations: string[]
  }
  successMetrics?: {
    metrics: Array<{
      id: string
      name: string
      category: string
      unit: string
      currentValue?: string
      targetValue?: string
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
      stages: string[]
      isCustom?: boolean
    }>
    framework: string
    reviewFrequency: 'weekly' | 'monthly' | 'quarterly'
  }
  calendarScope?: {
    timeframe: 'monthly' | 'quarterly' | 'yearly' | 'custom'
    startDate: string
    endDate: string
    planningHorizon: '3-months' | '6-months' | '12-months' | 'custom'
    campaignFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly'
    focusAreas: string[]
    businessCycle: 'retail' | 'b2b' | 'saas' | 'ecommerce' | 'seasonal' | 'evergreen'
    reviewCycle: 'weekly' | 'monthly' | 'quarterly'
    budgetCycle: 'monthly' | 'quarterly' | 'yearly'
  }
  scopeMetrics?: {
    durationDays: number
    durationWeeks: number
    estimatedCampaigns: number
    focusAreaCount: number
    appliedAt: string
    selectedPreset?: string
  }
  retailCampaigns?: Array<{
    id: string
    title: string
    description: string
    retailWeeks: number[]
    retailMonth: string
    monthStructure: '4-week' | '5-week'
    channels: string[]
    budget: number
    campaignType: 'awareness' | 'consideration' | 'conversion' | 'retention'
    retailAdvantage: string
    shoppingBehavior: string
    kpis: string[]
    promotionalTiming: string
    yearOverYearTracking: string
    quarter: number
    year: number
    generatedAt: string
  }>
  lastRetailCampaignGeneration?: string
  integratedCampaigns?: any[]
  lastIntegrationSync?: string
  googleDriveIntegration?: {
    connected: boolean
    accountEmail?: string
    rootFolderId?: string
    folderStructure?: Array<{
      id: string
      name: string
      type: 'folder'
      color?: string
    }>
    syncStatus: 'idle' | 'syncing' | 'success' | 'error'
    lastSyncAt?: string
    permissions: string[]
    collaborators?: string[]
    completed?: boolean
    completedAt?: string
  }
  contentPipeline?: {
    configured: boolean
    status: 'idle' | 'running' | 'paused'
    contentItems?: Array<{
      id: string
      title: string
      description: string
      type: 'blog' | 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'email' | 'video' | 'image'
      stage: 'ideas' | 'progress' | 'review' | 'scheduled' | 'published'
      scheduledDate?: string
      publishDate?: string
      assignee: string
      assigneeType: 'user' | 'ai' | 'team'
      priority: 'low' | 'medium' | 'high'
      campaign?: string
      tags: string[]
      aiGenerated: boolean
      wordCount?: number
      estimatedReadTime?: number
      approvals: string[]
      comments: number
    }>
    pipelineRules?: Array<{
      id: string
      name: string
      description: string
      contentType: string[]
      trigger: 'schedule' | 'manual' | 'approval' | 'campaign'
      actions: string[]
      enabled: boolean
    }>
    qualityChecks?: Array<{
      id: string
      name: string
      description: string
      type: 'grammar' | 'brand' | 'seo' | 'readability' | 'tone'
      enabled: boolean
      threshold?: number
    }>
    completedAt?: string
  }
  marketingPlan?: {
    configured: boolean
    status: 'draft' | 'active' | 'paused' | 'completed'
    campaigns?: Array<{
      id: string
      name: string
      description: string
      type: 'awareness' | 'consideration' | 'conversion' | 'retention'
      startDate: string
      endDate: string
      budget: number
      channels: string[]
      content: Array<{
        id: string
        type: 'blog' | 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'email' | 'video' | 'image'
        title: string
        status: 'draft' | 'scheduled' | 'published'
        scheduledDate?: string
        platform?: string
        metrics?: {
          reach?: number
          engagement?: number
          clicks?: number
          conversions?: number
        }
      }>
      kpis: string[]
      progress: number
    }>
    contentCalendar?: Array<{
      id: string
      date: string
      time: string
      platform: string
      contentType: string
      title: string
      description: string
      status: 'draft' | 'scheduled' | 'published' | 'failed'
      campaignId?: string
      metrics?: {
        impressions?: number
        engagement?: number
        clicks?: number
        shares?: number
      }
    }>
    publishingIntegration?: {
      platforms: Array<{
        name: string
        connected: boolean
        status: 'healthy' | 'warning' | 'error'
        lastSync?: string
        accountInfo?: {
          username?: string
          followers?: number
          verified?: boolean
        }
      }>
      publishingQueue: Array<{
        id: string
        platform: string
        contentId: string
        scheduledTime: string
        status: 'queued' | 'publishing' | 'published' | 'failed'
        retryCount: number
      }>
      automationRules: Array<{
        id: string
        name: string
        trigger: string
        action: string
        enabled: boolean
      }>
    }
    performance?: {
      overview: {
        totalReach: number
        totalEngagement: number
        totalClicks: number
        totalConversions: number
        engagementRate: number
        clickThroughRate: number
        conversionRate: number
        period: string
      }
      platformMetrics: Array<{
        platform: string
        reach: number
        engagement: number
        clicks: number
        conversions: number
        growthRate: number
        topContent: Array<{
          id: string
          title: string
          performance: number
          type: string
        }>
      }>
      trends: Array<{
        metric: string
        change: number
        period: string
        trend: 'up' | 'down' | 'stable'
      }>
    }
    completedAt?: string
  }
  currentPhase?: 'welcome' | 'onboarding' | 'mvp1' | 'mvp2' | 'mvp3' | 'mvp4' | 'complete'
  metadata?: {
    version?: string
    createdAt?: string
    updatedAt?: string
    mcpCompatible?: boolean
  }
  createdAt?: string
  updatedAt?: string
}

export const defaultSlottedContext = {
  brandDNA: {
    brandColors: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      accent: '#10b981',
    },
  },
  marketingGoals: {
    cadence: 'weekly' as const,
  },
  contentPreferences: {
    lengthPreferences: {
      blog: 2000,
      social: 280,
      email: 500,
    },
  },
}
