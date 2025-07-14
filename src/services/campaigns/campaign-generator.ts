import { z } from 'zod'
import type { CompanyDNA } from '../ai/modern-ai-orchestrator'

// Campaign topic schema
export const CampaignTopicSchema = z.object({
  week: z.number().min(1).max(52),
  title: z.string(),
  description: z.string(),
  theme: z.string(),
  primaryChannel: z.string(),
  secondaryChannels: z.array(z.string()),
  contentTypes: z.array(z.enum(['blog', 'video', 'social', 'email', 'infographic', 'case-study'])),
  keywords: z.array(z.string()),
  callToAction: z.string(),
  estimatedEffort: z.number().min(1).max(10),
  businessGoal: z.enum(['awareness', 'engagement', 'leads', 'sales', 'retention']),
  seasonalRelevance: z.string().optional(),
  competitorAnalysis: z.string().optional(),
})

export type CampaignTopic = z.infer<typeof CampaignTopicSchema>

// Marketing calendar schema
export const MarketingCalendarSchema = z.object({
  companyName: z.string(),
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
    weeks: z.number(),
  }),
  strategy: z.object({
    overallTheme: z.string(),
    quarterlyFocus: z.array(z.string()),
    keyMetrics: z.array(z.string()),
    budget: z.string().optional(),
  }),
  campaigns: z.array(CampaignTopicSchema),
  channelStrategy: z.object({
    primary: z.array(z.string()),
    secondary: z.array(z.string()),
    experimental: z.array(z.string()),
    distribution: z.record(z.number()),
  }),
  contentCalendar: z.object({
    sunday: z.array(z.string()),
    monday: z.array(z.string()),
    tuesday: z.array(z.string()),
    wednesday: z.array(z.string()),
    thursday: z.array(z.string()),
    friday: z.array(z.string()),
    saturday: z.array(z.string()),
  }),
  kpiTracking: z.object({
    metrics: z.array(z.object({
      name: z.string(),
      target: z.number(),
      measurement: z.string(),
    })),
    reportingSchedule: z.string(),
  }),
  generatedAt: z.string(),
  version: z.string(),
})

export type MarketingCalendar = z.infer<typeof MarketingCalendarSchema>

// Advanced campaign generation with AI
export class AdvancedCampaignGenerator {
  private aiOrchestrator: any

  constructor(aiOrchestrator: any) {
    this.aiOrchestrator = aiOrchestrator
  }

  /**
   * Generate comprehensive 13-week marketing calendar
   */
  public async generateMarketingCalendar(options: {
    companyDNA: CompanyDNA
    weeks?: number
    startDate?: Date
    focusAreas?: string[]
    budget?: string
  }): Promise<MarketingCalendar> {
    const weeks = options.weeks || 13
    const startDate = options.startDate || new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + (weeks * 7))

    console.log(`📅 Generating ${weeks}-week marketing calendar for ${options.companyDNA.company.name}`)

    try {
      // Generate campaign topics using AI
      const campaigns = await this.generateCampaignTopics(options.companyDNA, weeks, options.focusAreas)
      
      // Create strategic framework
      const strategy = await this.generateStrategy(options.companyDNA, campaigns, options.budget)
      
      // Create channel strategy
      const channelStrategy = this.createChannelStrategy(options.companyDNA, campaigns)
      
      // Generate content calendar (Sunday-Saturday posting pattern)
      const contentCalendar = this.generateContentCalendar(campaigns, options.companyDNA)
      
      // Set up KPI tracking
      const kpiTracking = this.setupKPITracking(options.companyDNA, campaigns)

      const calendar: MarketingCalendar = {
        companyName: options.companyDNA.company.name,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          weeks,
        },
        strategy,
        campaigns,
        channelStrategy,
        contentCalendar,
        kpiTracking,
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
      }

      return MarketingCalendarSchema.parse(calendar)
    } catch (error) {
      console.error('❌ Marketing calendar generation failed:', error)
      throw new Error(`Failed to generate marketing calendar: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate strategic campaign topics using AI
   */
  private async generateCampaignTopics(
    companyDNA: CompanyDNA, 
    weeks: number, 
    focusAreas?: string[]
  ): Promise<CampaignTopic[]> {
    const prompt = this.buildCampaignPrompt(companyDNA, weeks, focusAreas)
    
    const response = await this.aiOrchestrator.generateContent({
      type: 'campaign-topics',
      customInstructions: prompt,
    })

    return this.parseCampaignTopics(response.content, weeks, companyDNA)
  }

  /**
   * Build comprehensive campaign generation prompt
   */
  private buildCampaignPrompt(companyDNA: CompanyDNA, weeks: number, focusAreas?: string[]): string {
    const { company, brandDNA, marketingInsights } = companyDNA

    return `
Generate exactly ${weeks} strategic marketing campaign topics for ${company.name}.

COMPANY CONTEXT:
- Industry: ${company.industry}
- Size: ${company.size}
- Value Propositions: ${brandDNA.valuePropositions.join(', ')}
- Target Audience: ${brandDNA.targetAudience.demographics}
- Pain Points: ${brandDNA.targetAudience.painPoints.join(', ')}
- Brand Voice: ${brandDNA.brandVoice.personality.join(', ')} - ${brandDNA.brandVoice.tone}

MARKETING STRATEGY:
- Competitive Advantage: ${marketingInsights.competitiveAdvantage}
- Market Position: ${marketingInsights.marketPosition}
- Recommended Channels: ${marketingInsights.recommendedChannels.join(', ')}

${focusAreas ? `FOCUS AREAS: ${focusAreas.join(', ')}` : ''}

REQUIREMENTS:
1. Create a narrative arc across all ${weeks} weeks
2. Balance awareness, engagement, lead generation, and retention goals
3. Include seasonal and timely opportunities
4. Vary content types and channels strategically
5. Build momentum toward business objectives
6. Consider the target audience's journey and pain points

OUTPUT FORMAT:
Return as JSON array with this exact structure:
[
  {
    "week": 1,
    "title": "Campaign Title",
    "description": "Detailed description of campaign focus and objectives",
    "theme": "Overarching theme (e.g., Education, Problem-Solution, Social Proof)",
    "primaryChannel": "Blog",
    "secondaryChannels": ["LinkedIn", "Email"],
    "contentTypes": ["blog", "social", "email"],
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "callToAction": "Specific CTA for this campaign",
    "estimatedEffort": 7,
    "businessGoal": "awareness",
    "seasonalRelevance": "Optional seasonal context",
    "competitorAnalysis": "How this differentiates from competitors"
  }
]

Ensure each campaign builds logically on previous ones and addresses different aspects of the customer journey.
`
  }

  /**
   * Parse AI response into structured campaign topics
   */
  private parseCampaignTopics(response: string, weeks: number, companyDNA: CompanyDNA): CampaignTopic[] {
    try {
      const parsed = JSON.parse(response)
      if (Array.isArray(parsed) && parsed.length >= weeks) {
        return parsed.slice(0, weeks).map((topic, index) => ({
          ...topic,
          week: index + 1,
        }))
      }
    } catch (error) {
      console.warn('Failed to parse AI response, generating fallback topics')
    }

    // Fallback topics based on company DNA
    return this.generateFallbackTopics(weeks, companyDNA)
  }

  /**
   * Generate fallback campaign topics
   */
  private generateFallbackTopics(weeks: number, companyDNA: CompanyDNA): CampaignTopic[] {
    const { company, brandDNA, marketingInsights } = companyDNA
    
    const baseTopics = [
      {
        title: `Introducing ${company.name}: Our Mission and Vision`,
        theme: 'Brand Introduction',
        businessGoal: 'awareness' as const,
      },
      {
        title: `Understanding ${brandDNA.targetAudience.demographics}: Pain Points and Solutions`,
        theme: 'Problem Identification',
        businessGoal: 'awareness' as const,
      },
      {
        title: `${brandDNA.valuePropositions[0] || 'Our Core Value'}: Deep Dive`,
        theme: 'Value Proposition',
        businessGoal: 'engagement' as const,
      },
      {
        title: `Industry Insights: ${company.industry} Trends and Opportunities`,
        theme: 'Thought Leadership',
        businessGoal: 'engagement' as const,
      },
      {
        title: 'Behind the Scenes: How We Work',
        theme: 'Transparency',
        businessGoal: 'engagement' as const,
      },
      {
        title: 'Customer Success Stories and Case Studies',
        theme: 'Social Proof',
        businessGoal: 'leads' as const,
      },
      {
        title: `${marketingInsights.competitiveAdvantage}: What Sets Us Apart`,
        theme: 'Differentiation',
        businessGoal: 'leads' as const,
      },
      {
        title: 'Expert Tips and Best Practices',
        theme: 'Education',
        businessGoal: 'engagement' as const,
      },
      {
        title: 'Community Spotlight and User-Generated Content',
        theme: 'Community Building',
        businessGoal: 'retention' as const,
      },
      {
        title: 'Product Updates and New Features',
        theme: 'Product Marketing',
        businessGoal: 'retention' as const,
      },
      {
        title: 'Data-Driven Insights and Research',
        theme: 'Thought Leadership',
        businessGoal: 'engagement' as const,
      },
      {
        title: 'Future Vision and Roadmap',
        theme: 'Innovation',
        businessGoal: 'engagement' as const,
      },
      {
        title: 'Year in Review and Looking Ahead',
        theme: 'Reflection',
        businessGoal: 'retention' as const,
      },
    ]

    return Array.from({ length: weeks }, (_, index) => {
      const baseTopic = baseTopics[index] || baseTopics[index % baseTopics.length]
      
      return {
        week: index + 1,
        title: baseTopic.title,
        description: `Strategic campaign for week ${index + 1} focusing on ${baseTopic.theme.toLowerCase()}`,
        theme: baseTopic.theme,
        primaryChannel: marketingInsights.recommendedChannels[0] || 'Blog',
        secondaryChannels: marketingInsights.recommendedChannels.slice(1, 3) || ['Social Media'],
        contentTypes: ['blog', 'social'] as const,
        keywords: [`${company.name}`, company.industry.toLowerCase(), brandDNA.valuePropositions[0]?.toLowerCase().split(' ')[0] || 'business'].filter(Boolean),
        callToAction: index % 4 === 0 ? 'Contact Us' : index % 4 === 1 ? 'Learn More' : index % 4 === 2 ? 'Get Started' : 'Download Now',
        estimatedEffort: Math.floor(Math.random() * 3) + 5, // 5-7 effort
        businessGoal: baseTopic.businessGoal,
        seasonalRelevance: index % 6 === 0 ? 'Consider current season and holidays' : undefined,
      }
    })
  }

  /**
   * Generate overall marketing strategy
   */
  private async generateStrategy(companyDNA: CompanyDNA, campaigns: CampaignTopic[], budget?: string): Promise<any> {
    const themes = [...new Set(campaigns.map(c => c.theme))]
    const goals = [...new Set(campaigns.map(c => c.businessGoal))]

    return {
      overallTheme: `Strategic ${companyDNA.company.industry} Marketing: ${companyDNA.marketingInsights.marketPosition}`,
      quarterlyFocus: themes.slice(0, 3),
      keyMetrics: [
        'Brand Awareness (Reach & Impressions)',
        'Engagement Rate (Likes, Comments, Shares)',
        'Lead Generation (Form Submissions, Downloads)',
        'Website Traffic (Sessions, Page Views)',
        'Conversion Rate (Trial-to-Paid, Contact-to-Sale)',
      ],
      budget: budget || 'To be determined based on channel performance',
    }
  }

  /**
   * Create channel distribution strategy
   */
  private createChannelStrategy(companyDNA: CompanyDNA, campaigns: CampaignTopic[]): any {
    const { marketingInsights } = companyDNA
    const channelUsage = new Map<string, number>()

    // Count channel usage across campaigns
    campaigns.forEach(campaign => {
      channelUsage.set(campaign.primaryChannel, (channelUsage.get(campaign.primaryChannel) || 0) + 2)
      campaign.secondaryChannels.forEach(channel => {
        channelUsage.set(channel, (channelUsage.get(channel) || 0) + 1)
      })
    })

    return {
      primary: marketingInsights.recommendedChannels.slice(0, 2),
      secondary: marketingInsights.recommendedChannels.slice(2, 5),
      experimental: ['TikTok', 'Podcast', 'YouTube Shorts'],
      distribution: Object.fromEntries(channelUsage),
    }
  }

  /**
   * Generate Sunday-Saturday content calendar
   */
  private generateContentCalendar(campaigns: CampaignTopic[], companyDNA: CompanyDNA): any {
    // Sunday-Saturday posting pattern as specified
    return {
      sunday: ['Newsletter Planning', 'Week Prep'],
      monday: ['Blog Post Release', 'Industry News'],
      tuesday: ['Social Media Push', 'Community Engagement'],
      wednesday: ['Educational Content', 'Behind the Scenes'],
      thursday: ['Case Studies', 'Customer Spotlights'],
      friday: ['Product Updates', 'Team Highlights'],
      saturday: ['User-Generated Content', 'Community Features'],
    }
  }

  /**
   * Set up KPI tracking framework
   */
  private setupKPITracking(companyDNA: CompanyDNA, campaigns: CampaignTopic[]): any {
    const businessGoals = [...new Set(campaigns.map(c => c.businessGoal))]

    const metrics = businessGoals.map(goal => {
      switch (goal) {
        case 'awareness':
          return { name: 'Brand Awareness', target: 10000, measurement: 'Monthly Reach' }
        case 'engagement':
          return { name: 'Engagement Rate', target: 5, measurement: 'Percentage' }
        case 'leads':
          return { name: 'Lead Generation', target: 100, measurement: 'Monthly Leads' }
        case 'sales':
          return { name: 'Conversion Rate', target: 2, measurement: 'Percentage' }
        case 'retention':
          return { name: 'Customer Retention', target: 85, measurement: 'Percentage' }
        default:
          return { name: 'Website Traffic', target: 5000, measurement: 'Monthly Sessions' }
      }
    })

    return {
      metrics,
      reportingSchedule: 'Weekly reviews on Fridays, Monthly deep dives on first Monday',
    }
  }

  /**
   * Export calendar to Google Sheets format
   */
  public exportToGoogleSheets(calendar: MarketingCalendar): any {
    const sheets = {
      'Campaign Overview': [
        ['Week', 'Campaign Title', 'Theme', 'Primary Channel', 'Business Goal', 'Effort', 'Status'],
        ...calendar.campaigns.map(campaign => [
          campaign.week,
          campaign.title,
          campaign.theme,
          campaign.primaryChannel,
          campaign.businessGoal,
          campaign.estimatedEffort,
          'Planned'
        ])
      ],
      'Content Calendar': [
        ['Week', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        ...calendar.campaigns.map(campaign => [
          `Week ${campaign.week}`,
          campaign.contentTypes.includes('blog') ? campaign.title : '',
          campaign.contentTypes.includes('social') ? 'Social Push' : '',
          'Educational Content',
          'Case Study/Customer Focus',
          'Product/Team Updates',
          'Community Content',
          'Week Planning'
        ])
      ],
      'KPI Tracking': [
        ['Metric', 'Target', 'Current', 'Progress %', 'Notes'],
        ...calendar.kpiTracking.metrics.map(metric => [
          metric.name,
          metric.target,
          0, // Current value to be filled in
          0, // Progress percentage
          'Track weekly'
        ])
      ],
      'Channel Strategy': [
        ['Channel', 'Type', 'Usage Count', 'Content Types'],
        ...Object.entries(calendar.channelStrategy.distribution).map(([channel, count]) => [
          channel,
          calendar.channelStrategy.primary.includes(channel) ? 'Primary' : 'Secondary',
          count,
          'Blog, Social, Email'
        ])
      ]
    }

    return sheets
  }
}

// Export the service
export const campaignGenerator = new AdvancedCampaignGenerator(null) // Will be injected when needed