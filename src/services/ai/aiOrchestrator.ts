import { ChatAnthropic } from '@langchain/anthropic'
import type { BaseLanguageModel } from '@langchain/core/language_models/base'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import { mcpContextEngine } from '../mcp/contextEngine'

export type AIProvider = 'openai' | 'anthropic'
export type AIModel = 'gpt-4o' | 'gpt-4' | 'claude-3-5-sonnet' | 'claude-3-haiku'

export interface AIConfig {
  provider: AIProvider
  model: AIModel
  apiKey: string
  temperature?: number
  maxTokens?: number
}

export interface ContentGenerationRequest {
  type: 'blog' | 'script' | 'social' | 'email' | 'gtm-strategy' | 'campaign-topics'
  topic?: string
  length?: number
  tone?: string
  customInstructions?: string
}

export interface ContentGenerationResponse {
  content: string
  metadata: {
    wordCount: number
    estimatedReadTime: number
    generatedAt: string
    model: string
  }
}

export class AIOrchestrator {
  private models: Map<string, BaseLanguageModel> = new Map()
  private defaultProvider: AIProvider = 'openai'
  private defaultModel: AIModel = 'gpt-4o'

  public configureProvider(config: AIConfig): void {
    const key = `${config.provider}-${config.model}`

    let model: BaseLanguageModel

    switch (config.provider) {
      case 'openai':
        model = new ChatOpenAI({
          modelName: config.model,
          openAIApiKey: config.apiKey,
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 4000,
        })
        break

      case 'anthropic':
        model = new ChatAnthropic({
          modelName: config.model,
          anthropicApiKey: config.apiKey,
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 4000,
        })
        break

      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`)
    }

    this.models.set(key, model)
    console.log(`AI provider configured: ${key}`)
  }

  public setDefaultProvider(provider: AIProvider, model: AIModel): void {
    this.defaultProvider = provider
    this.defaultModel = model
  }

  private getModel(provider?: AIProvider, model?: AIModel): BaseLanguageModel {
    const targetProvider = provider || this.defaultProvider
    const targetModel = model || this.defaultModel
    const key = `${targetProvider}-${targetModel}`

    const modelInstance = this.models.get(key)
    if (!modelInstance) {
      throw new Error(`AI model not configured: ${key}. Please configure the provider first.`)
    }

    return modelInstance
  }

  public async generateContent(
    request: ContentGenerationRequest,
    provider?: AIProvider,
    model?: AIModel
  ): Promise<ContentGenerationResponse> {
    try {
      const llm = this.getModel(provider, model)
      const mcpContext = mcpContextEngine.getMCPPromptContext()

      const systemPrompt = this.buildSystemPrompt(request.type, mcpContext)
      const userPrompt = this.buildUserPrompt(request)

      const messages = [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)]

      const response = await llm.invoke(messages)
      const content = response.content.toString()

      return {
        content,
        metadata: {
          wordCount: content.split(' ').length,
          estimatedReadTime: Math.ceil(content.split(' ').length / 200),
          generatedAt: new Date().toISOString(),
          model: `${provider || this.defaultProvider}-${model || this.defaultModel}`,
        },
      }
    } catch (error) {
      console.error('Content generation failed:', error)
      throw new Error(
        `AI content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private buildSystemPrompt(contentType: string, mcpContext: string): string {
    const basePrompt = `You are an expert marketing content creator working with the MCP (Model Context Protocol) framework. 

${mcpContext}

Use this context to create highly targeted, brand-aligned content that resonates with the target audience and reflects the company's unique value proposition and brand voice.

IMPORTANT GUIDELINES:
- Always maintain the specified brand tone and communication style
- Incorporate the company's value propositions naturally
- Address the target audience's specific pain points
- Follow the established content cadence and channel preferences
- Ensure all content aligns with the GTM strategy and market positioning
`

    const typeSpecificPrompts = {
      blog: `Create a comprehensive blog post that educates and engages the target audience. Structure should include:
- Compelling headline
- Introduction that hooks the reader
- Well-organized main content with subheadings
- Actionable insights and takeaways
- Strong conclusion with call-to-action`,

      script: `Create a video script that is engaging and conversational. Include:
- Hook (first 5 seconds)
- Clear value proposition
- Structured narrative flow
- Visual cues and timing notes
- Strong call-to-action`,

      social: `Create social media content that drives engagement. Consider:
- Platform-specific best practices
- Hashtag strategy
- Visual content suggestions
- Engagement hooks
- Community-building elements`,

      email: `Create email content that converts. Include:
- Subject line options
- Personalized opening
- Clear value delivery
- Compelling call-to-action
- Mobile-friendly formatting`,

      'gtm-strategy': `Create a comprehensive go-to-market strategy based on the company context. Include:
- Market analysis and positioning
- Target customer segments
- Channel strategy
- Messaging framework
- Launch timeline and milestones`,

      'campaign-topics': `Generate a list of campaign topics that align with the marketing goals. Include:
- Topic relevance to target audience
- SEO and trending considerations
- Seasonal/timely opportunities
- Content variety and format suggestions
- Engagement potential assessment`,
    }

    return (
      basePrompt +
      '\n\n' +
      (typeSpecificPrompts[contentType as keyof typeof typeSpecificPrompts] || '')
    )
  }

  private buildUserPrompt(request: ContentGenerationRequest): string {
    let prompt = `Create ${request.type} content`

    if (request.topic) {
      prompt += ` about: ${request.topic}`
    }

    if (request.length) {
      prompt += `\nTarget length: ${request.length} words`
    }

    if (request.tone) {
      prompt += `\nTone: ${request.tone}`
    }

    if (request.customInstructions) {
      prompt += `\nAdditional instructions: ${request.customInstructions}`
    }

    prompt +=
      '\n\nPlease ensure the content is optimized for the target audience and aligns with the brand guidelines provided in the context.'

    return prompt
  }

  public async generateCampaignTopics(weeks = 13): Promise<string[]> {
    const response = await this.generateContent({
      type: 'campaign-topics',
      customInstructions: `Generate exactly ${weeks} campaign topics that span a quarter. Each topic should be distinct, engaging, and build upon the previous ones to create a cohesive narrative arc.`,
    })

    const topics = response.content
      .split('\n')
      .filter((line) => line.trim() && (line.includes('.') || line.includes('-')))
      .map((line) => line.replace(/^\d+\.?\s*[-•]?\s*/, '').trim())
      .slice(0, weeks)

    return topics.length >= weeks ? topics : this.generateFallbackTopics(weeks)
  }

  private generateFallbackTopics(weeks: number): string[] {
    return Array.from({ length: weeks }, (_, i) => `Campaign Topic ${i + 1}`)
  }

  public async generateBlogFromTopic(
    topic: string,
    length = 2000
  ): Promise<ContentGenerationResponse> {
    return this.generateContent({
      type: 'blog',
      topic,
      length,
    })
  }

  public async generateVideoScript(blogContent: string): Promise<ContentGenerationResponse> {
    return this.generateContent({
      type: 'script',
      customInstructions: `Convert this blog post into an engaging video script:\n\n${blogContent}`,
    })
  }

  public async generateSocialPosts(
    topic: string,
    platforms: string[]
  ): Promise<Record<string, string>> {
    const posts: Record<string, string> = {}

    for (const platform of platforms) {
      const response = await this.generateContent({
        type: 'social',
        topic,
        customInstructions: `Create a ${platform} post optimized for that platform's best practices and audience behavior.`,
      })
      posts[platform] = response.content
    }

    return posts
  }

  public async generateEmailCampaign(
    topic: string,
    type: 'newsletter' | 'promotion' | 'announcement' = 'newsletter'
  ): Promise<ContentGenerationResponse> {
    return this.generateContent({
      type: 'email',
      topic,
      customInstructions: `Create a ${type} email that drives engagement and conversions.`,
    })
  }

  public getConfiguredProviders(): string[] {
    return Array.from(this.models.keys())
  }

  public isConfigured(): boolean {
    return this.models.size > 0
  }
}

export const aiOrchestrator = new AIOrchestrator()
