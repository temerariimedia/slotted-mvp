// Using built-in fetch (Node 18+)

export interface AIConfig {
  provider: 'openai' | 'anthropic'
  model: string
  apiKey: string
  temperature?: number
  maxTokens?: number
}

export interface CampaignTopic {
  week: number
  title: string
  description: string
  primaryChannel: string
  secondaryChannels: string[]
  contentTypes: string[]
  estimatedEffort: number
  seasonalRelevance?: string
}

export interface DetailedCampaignPlan {
  overview: string
  quarterlyThemes: string[]
  campaigns: CampaignTopic[]
  channelStrategy: {
    primary: string[]
    secondary: string[]
    experimental: string[]
  }
  timeline: string
  kpiMapping: Record<string, string[]>
}

export interface CampaignContent {
  blog: {
    title: string
    outline: string[]
    content: string
    wordCount: number
  }
  video: {
    title: string
    script: string
    duration: number
    scenes: string[]
  }
  social: {
    platforms: Record<
      string,
      {
        post: string
        hashtags: string[]
        timing: string
      }
    >
  }
  email: {
    subject: string
    preview: string
    content: string
    cta: string
  }
}

export class CampaignGenerator {
  private aiConfig?: AIConfig

  constructor(aiConfig?: AIConfig) {
    this.aiConfig = aiConfig
  }

  async generateCampaignTopics(mcpContext: any, weeks = 13): Promise<CampaignTopic[]> {
    const prompt = this.buildTopicGenerationPrompt(mcpContext, weeks)
    const response = await this.callAI(prompt)

    return this.parseCampaignTopics(response, weeks)
  }

  async generateDetailedCampaignPlan(
    mcpContext: any,
    topics: string[]
  ): Promise<DetailedCampaignPlan> {
    const prompt = this.buildPlanGenerationPrompt(mcpContext, topics)
    const response = await this.callAI(prompt)

    return this.parseCampaignPlan(response, mcpContext, topics)
  }

  async generateCampaignContent(
    mcpContext: any,
    topic: string,
    contentTypes: string[] = ['blog', 'video', 'social', 'email']
  ): Promise<CampaignContent> {
    const content: Partial<CampaignContent> = {}

    for (const type of contentTypes) {
      const prompt = this.buildContentGenerationPrompt(mcpContext, topic, type)
      const response = await this.callAI(prompt)
      content[type as keyof CampaignContent] = this.parseContentResponse(response, type)
    }

    return content as CampaignContent
  }

  async createChannelMatrix(mcpContext: any, topics?: string[]): Promise<any> {
    const channels = {
      primary: mcpContext.marketingGoals?.channels?.primary || ['Blog'],
      secondary: mcpContext.marketingGoals?.channels?.secondary || ['Social Media'],
      experimental: mcpContext.marketingGoals?.channels?.experimental || [],
    }

    const matrix = {
      channels,
      recommendations: await this.generateChannelRecommendations(mcpContext),
      topicMapping: topics ? this.mapTopicsToChannels(topics, channels) : null,
    }

    return matrix
  }

  async simulatePersonaEngagement(mcpContext: any, campaignContent: any): Promise<any> {
    const prompt = this.buildEngagementSimulationPrompt(mcpContext, campaignContent)
    const response = await this.callAI(prompt)

    return this.parseEngagementSimulation(response)
  }

  private buildTopicGenerationPrompt(mcpContext: any, weeks: number): string {
    return `
COMPANY CONTEXT:
${this.formatMCPContext(mcpContext)}

TASK: Generate exactly ${weeks} campaign topics for a ${weeks}-week marketing calendar.

REQUIREMENTS:
- Each topic should align with the company's value propositions
- Topics should address target audience pain points
- Create a narrative arc across the ${weeks} weeks
- Include seasonal/timely opportunities
- Vary content difficulty and engagement types
- Consider the specified content cadence: ${mcpContext.marketingGoals?.cadence || 'weekly'}

FORMAT: Return as JSON array with this structure:
[
  {
    "week": 1,
    "title": "Topic Title",
    "description": "Brief description of the campaign focus",
    "primaryChannel": "Blog",
    "secondaryChannels": ["Social Media", "Email"],
    "contentTypes": ["blog", "video", "social"],
    "estimatedEffort": 8,
    "seasonalRelevance": "Optional seasonal context"
  }
]

Generate topics that build upon each other and create momentum throughout the quarter.
`
  }

  private buildPlanGenerationPrompt(mcpContext: any, topics: string[]): string {
    return `
COMPANY CONTEXT:
${this.formatMCPContext(mcpContext)}

CAMPAIGN TOPICS:
${topics.map((topic, i) => `Week ${i + 1}: ${topic}`).join('\n')}

TASK: Create a comprehensive campaign plan that integrates all topics into a cohesive strategy.

REQUIREMENTS:
- Identify quarterly themes
- Map topics to optimal channels
- Create KPI tracking framework
- Suggest content amplification strategies
- Outline resource requirements

Return as structured JSON with overview, themes, channel strategy, timeline, and KPI mapping.
`
  }

  private buildContentGenerationPrompt(
    mcpContext: any,
    topic: string,
    contentType: string
  ): string {
    const typePrompts = {
      blog: `Create a comprehensive blog post about "${topic}". Include title, outline, and full content (${mcpContext.contentPreferences?.lengthPreferences?.blog || 2000} words).`,
      video: `Create a video script for "${topic}". Include title, full script with timing, scene descriptions, and visual cues.`,
      social: `Create social media posts for "${topic}" across platforms: ${mcpContext.marketingGoals?.channels?.primary?.join(', ') || 'LinkedIn, Twitter'}. Include platform-specific content, hashtags, and posting times.`,
      email: `Create an email campaign for "${topic}". Include subject line, preview text, full email content, and clear CTA.`,
    }

    return `
COMPANY CONTEXT:
${this.formatMCPContext(mcpContext)}

CAMPAIGN TOPIC: ${topic}

TASK: ${typePrompts[contentType as keyof typeof typePrompts]}

BRAND VOICE: ${mcpContext.brandDNA?.brandTone?.communicationStyle || 'conversational'}
TARGET AUDIENCE: ${mcpContext.brandDNA?.targetAudience?.demographics || 'general business audience'}

Return as structured JSON appropriate for the content type.
`
  }

  private buildEngagementSimulationPrompt(mcpContext: any, campaignContent: any): string {
    return `
COMPANY CONTEXT:
${this.formatMCPContext(mcpContext)}

CAMPAIGN CONTENT TO SIMULATE:
${JSON.stringify(campaignContent, null, 2)}

TASK: Simulate how the target persona would engage with this content.

Analyze:
- Initial reaction and interest level
- Key engagement points
- Potential objections or concerns
- Likelihood to take desired action
- Suggestions for improvement

Return as JSON with persona response, engagement score (1-10), and optimization recommendations.
`
  }

  private formatMCPContext(mcpContext: any): string {
    return `
Company: ${mcpContext.company?.name} - ${mcpContext.company?.industry}
Size: ${mcpContext.company?.size}
Description: ${mcpContext.company?.description}

Value Propositions: ${mcpContext.brandDNA?.valuePropositions?.join(', ') || ''}
Target Audience: ${mcpContext.brandDNA?.targetAudience?.demographics || ''}
Pain Points: ${mcpContext.brandDNA?.targetAudience?.painPoints?.join(', ') || ''}
Brand Tone: ${mcpContext.brandDNA?.brandTone?.personality?.join(', ') || ''} - ${mcpContext.brandDNA?.brandTone?.communicationStyle || ''}

Primary Goals: ${mcpContext.marketingGoals?.primaryGoals?.join(', ') || ''}
Content Cadence: ${mcpContext.marketingGoals?.cadence || 'weekly'}
Primary Channels: ${mcpContext.marketingGoals?.channels?.primary?.join(', ') || ''}
`
  }

  private async callAI(prompt: string): Promise<string> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not provided')
    }

    if (this.aiConfig.provider === 'openai') {
      return this.callOpenAI(prompt)
    } else if (this.aiConfig.provider === 'anthropic') {
      return this.callAnthropic(prompt)
    } else {
      throw new Error(`Unsupported AI provider: ${this.aiConfig.provider}`)
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.aiConfig!.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.aiConfig!.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.aiConfig!.temperature || 0.7,
        max_tokens: this.aiConfig!.maxTokens || 4000,
      }),
    })

    const data = (await response.json()) as any
    return data.choices[0].message.content
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.aiConfig!.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.aiConfig!.model,
        max_tokens: this.aiConfig!.maxTokens || 4000,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.aiConfig!.temperature || 0.7,
      }),
    })

    const data = (await response.json()) as any
    return data.content[0].text
  }

  private parseCampaignTopics(response: string, weeks: number): CampaignTopic[] {
    try {
      const parsed = JSON.parse(response)
      return Array.isArray(parsed) ? parsed.slice(0, weeks) : []
    } catch (error) {
      // Fallback: extract topics from text response
      return this.generateFallbackTopics(weeks)
    }
  }

  private parseCampaignPlan(
    response: string,
    mcpContext: any,
    topics: string[]
  ): DetailedCampaignPlan {
    try {
      return JSON.parse(response)
    } catch (error) {
      // Fallback plan
      return {
        overview: 'AI-generated campaign plan based on company context',
        quarterlyThemes: ['Brand Awareness', 'Product Education', 'Customer Success'],
        campaigns: topics.map((topic, i) => ({
          week: i + 1,
          title: topic,
          description: `Campaign focus for week ${i + 1}`,
          primaryChannel: mcpContext.marketingGoals?.channels?.primary?.[0] || 'Blog',
          secondaryChannels: mcpContext.marketingGoals?.channels?.secondary || ['Social Media'],
          contentTypes: ['blog', 'social'],
          estimatedEffort: 6,
        })),
        channelStrategy: mcpContext.marketingGoals?.channels || {
          primary: ['Blog'],
          secondary: ['Social Media'],
          experimental: [],
        },
        timeline: '13 weeks',
        kpiMapping: {
          'Brand Awareness': ['Reach', 'Impressions'],
          Engagement: ['Likes', 'Comments', 'Shares'],
          Conversion: ['Click-through Rate', 'Lead Generation'],
        },
      }
    }
  }

  private parseContentResponse(response: string, type: string): any {
    try {
      return JSON.parse(response)
    } catch (error) {
      // Return basic fallback structure
      const fallbacks = {
        blog: { title: 'Generated Blog Post', outline: [], content: response, wordCount: 0 },
        video: { title: 'Generated Video', script: response, duration: 0, scenes: [] },
        social: { platforms: { linkedin: { post: response, hashtags: [], timing: '9am' } } },
        email: { subject: 'Generated Email', preview: '', content: response, cta: 'Learn More' },
      }
      return fallbacks[type as keyof typeof fallbacks] || response
    }
  }

  private parseEngagementSimulation(response: string): any {
    try {
      return JSON.parse(response)
    } catch (error) {
      return {
        personaResponse: 'Positive initial interest',
        engagementScore: 7,
        optimizationRecommendations: [
          'Add more specific examples',
          'Include stronger call-to-action',
        ],
      }
    }
  }

  private generateFallbackTopics(weeks: number): CampaignTopic[] {
    const fallbackTopics = [
      'Company Introduction and Vision',
      'Industry Trends and Insights',
      'Product/Service Deep Dive',
      'Customer Success Stories',
      'Behind the Scenes',
      'Thought Leadership',
      'Educational Content',
      'Problem-Solution Focus',
      'Community Building',
      'Expert Interviews',
      'Data and Analytics',
      'Future Outlook',
      'Year-End Recap',
    ]

    return Array.from({ length: weeks }, (_, i) => ({
      week: i + 1,
      title: fallbackTopics[i] || `Campaign Topic ${i + 1}`,
      description: `Generated campaign topic for week ${i + 1}`,
      primaryChannel: 'Blog',
      secondaryChannels: ['Social Media'],
      contentTypes: ['blog', 'social'],
      estimatedEffort: 6,
    }))
  }

  private async generateChannelRecommendations(mcpContext: any): Promise<string[]> {
    return [
      'Focus on primary channels for consistent messaging',
      'Test experimental channels with 20% of content',
      'Cross-promote content across all channels',
      'Adapt content format for each platform',
    ]
  }

  private mapTopicsToChannels(topics: string[], channels: any): Record<string, string[]> {
    const mapping: Record<string, string[]> = {}

    topics.forEach((topic, i) => {
      mapping[`Week ${i + 1}: ${topic}`] = [...channels.primary, ...channels.secondary.slice(0, 2)]
    })

    return mapping
  }
}
