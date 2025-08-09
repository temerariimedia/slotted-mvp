import { GoogleGenerativeAI } from '@google/generative-ai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'

// Modern AI provider configuration
export const AIProviderSchema = z.enum(['openai', 'anthropic', 'google'])
export const AIModelSchema = z.enum([
  'gpt-4-turbo-2024-04-09',
  'gpt-4o',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
])

export type AIProvider = z.infer<typeof AIProviderSchema>
export type AIModel = z.infer<typeof AIModelSchema>

export const AIConfigSchema = z.object({
  provider: AIProviderSchema,
  model: AIModelSchema,
  apiKey: z.string().min(1),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(8192).default(4000),
})

export type AIConfig = z.infer<typeof AIConfigSchema>

// Company DNA extraction specific schemas
export const CompanyDNASchema = z.object({
  company: z.object({
    name: z.string(),
    industry: z.string(),
    size: z.enum(['startup', 'small', 'medium', 'enterprise']),
    description: z.string(),
    website: z.string().url().optional(),
  }),
  brandDNA: z.object({
    valuePropositions: z.array(z.string()),
    coreOfferings: z.array(z.string()),
    targetAudience: z.object({
      demographics: z.string(),
      psychographics: z.string(),
      painPoints: z.array(z.string()),
    }),
    brandVoice: z.object({
      personality: z.array(z.string()),
      tone: z.enum(['professional', 'friendly', 'authoritative', 'casual', 'technical']),
      communicationStyle: z.string(),
    }),
    brandColors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
    }),
  }),
  marketingInsights: z.object({
    competitiveAdvantage: z.string(),
    marketPosition: z.string(),
    contentThemes: z.array(z.string()),
    recommendedChannels: z.array(z.string()),
  }),
  metadata: z.object({
    extractedAt: z.string(),
    websiteAnalyzed: z.boolean(),
    confidenceScore: z.number().min(0).max(1),
    version: z.string(),
  }),
})

export type CompanyDNA = z.infer<typeof CompanyDNASchema>

export class ModernAIOrchestrator {
  private configs: Map<string, AIConfig> = new Map()
  private models: Map<string, any> = new Map()

  /**
   * Configure AI provider with validation
   */
  public configureProvider(config: AIConfig): void {
    // Validate configuration
    const validatedConfig = AIConfigSchema.parse(config)

    const key = `${config.provider}-${config.model}`
    this.configs.set(key, validatedConfig)

    // Initialize the appropriate model
    let model: any

    switch (config.provider) {
      case 'openai':
        model = new ChatOpenAI({
          modelName: config.model,
          openAIApiKey: config.apiKey,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        })
        break

      case 'anthropic':
        model = new ChatAnthropic({
          modelName: config.model,
          anthropicApiKey: config.apiKey,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        })
        break

      case 'google':
        model = new GoogleGenerativeAI(config.apiKey)
        break

      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`)
    }

    this.models.set(key, model)
    console.log(`✅ Modern AI provider configured: ${key}`)
  }

  /**
   * Extract company DNA from website URL and basic info
   */
  public async extractCompanyDNA(input: {
    companyName: string
    website?: string
    industry?: string
    description?: string
  }): Promise<CompanyDNA> {
    try {
      // 1. Scrape website if provided
      let websiteContent = ''
      let websiteAnalyzed = false

      if (input.website) {
        websiteContent = await this.scrapeWebsite(input.website)
        websiteAnalyzed = true
      }

      // 2. Generate comprehensive brand analysis
      const brandAnalysis = await this.analyzeBrandFromContent({
        companyName: input.companyName,
        websiteContent,
        industry: input.industry,
        description: input.description,
      })

      // 3. Validate and return structured DNA
      const companyDNA = CompanyDNASchema.parse({
        company: {
          name: input.companyName,
          industry: brandAnalysis.industry || input.industry || 'Unknown',
          size: brandAnalysis.estimatedSize || 'startup',
          description: brandAnalysis.description || input.description || '',
          website: input.website,
        },
        brandDNA: brandAnalysis.brandDNA,
        marketingInsights: brandAnalysis.marketingInsights,
        metadata: {
          extractedAt: new Date().toISOString(),
          websiteAnalyzed,
          confidenceScore: brandAnalysis.confidenceScore,
          version: '2.0.0',
        },
      })

      return companyDNA
    } catch (error) {
      console.error('❌ Company DNA extraction failed:', error)
      throw new Error(
        `Failed to extract company DNA: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Scrape website content for analysis
   */
  private async scrapeWebsite(url: string): Promise<string> {
    try {
      console.log(`🔍 Scraping website: ${url}`)

      // Use enhanced website analyzer
      const { enhancedWebsiteAnalyzer } = await import(
        '../web-automation/enhanced-website-analyzer'
      )

      await enhancedWebsiteAnalyzer.initialize()
      const analysis = await enhancedWebsiteAnalyzer.analyzeWebsite(url)
      const content = enhancedWebsiteAnalyzer.extractContentForAI(analysis)
      await enhancedWebsiteAnalyzer.cleanup()

      console.log(`✅ Successfully analyzed website: ${url}`)
      return content
    } catch (error) {
      console.error('❌ Website scraping failed:', error)
      return `Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  /**
   * Analyze brand from scraped content and inputs
   */
  private async analyzeBrandFromContent(input: {
    companyName: string
    websiteContent: string
    industry?: string
    description?: string
  }): Promise<any> {
    const model = this.getDefaultModel()

    const prompt = `
You are an expert brand strategist analyzing a company to extract comprehensive brand DNA.

COMPANY INFORMATION:
- Name: ${input.companyName}
- Industry: ${input.industry || 'Unknown'}
- Description: ${input.description || 'Not provided'}

WEBSITE CONTENT:
${input.websiteContent || 'No website content available'}

TASK: Analyze all available information and extract comprehensive brand DNA.

OUTPUT FORMAT: Return a JSON object with this exact structure:
{
  "industry": "string - identified industry",
  "estimatedSize": "startup | small | medium | enterprise",
  "description": "string - comprehensive company description",
  "brandDNA": {
    "valuePropositions": ["string array - key value propositions"],
    "coreOfferings": ["string array - main products/services"],
    "targetAudience": {
      "demographics": "string - target customer demographics",
      "psychographics": "string - target customer psychographics", 
      "painPoints": ["string array - customer pain points addressed"]
    },
    "brandVoice": {
      "personality": ["string array - brand personality traits"],
      "tone": "professional | friendly | authoritative | casual | technical",
      "communicationStyle": "string - how the brand communicates"
    },
    "brandColors": {
      "primary": "#hex - primary brand color",
      "secondary": "#hex - secondary brand color", 
      "accent": "#hex - accent color"
    }
  },
  "marketingInsights": {
    "competitiveAdvantage": "string - unique competitive advantage",
    "marketPosition": "string - position in the market",
    "contentThemes": ["string array - recommended content themes"],
    "recommendedChannels": ["string array - optimal marketing channels"]
  },
  "confidenceScore": 0.85
}

ANALYSIS GUIDELINES:
- Extract specific, actionable insights
- Identify unique value propositions
- Understand target audience deeply
- Recommend appropriate brand voice
- Suggest realistic brand colors (use web standards)
- Provide marketing strategy insights
- Assign confidence score based on available data quality

Return only valid JSON, no additional text.`

    try {
      const response = await model.invoke(prompt)
      const content = response.content || response

      // Parse and validate the JSON response
      const analysis = JSON.parse(content as string)
      return analysis
    } catch (error) {
      console.error('❌ Brand analysis failed:', error)

      // Return fallback analysis
      return {
        industry: input.industry || 'Technology',
        estimatedSize: 'startup',
        description:
          input.description ||
          `${input.companyName} is a company in the ${input.industry || 'technology'} industry.`,
        brandDNA: {
          valuePropositions: ['Innovation', 'Quality', 'Customer Focus'],
          coreOfferings: ['Primary Service'],
          targetAudience: {
            demographics: 'Business professionals',
            psychographics: 'Growth-oriented individuals',
            painPoints: ['Efficiency challenges', 'Cost concerns'],
          },
          brandVoice: {
            personality: ['Professional', 'Reliable', 'Innovative'],
            tone: 'professional' as const,
            communicationStyle: 'Clear and professional communication',
          },
          brandColors: {
            primary: '#2563eb',
            secondary: '#3b82f6',
            accent: '#10b981',
          },
        },
        marketingInsights: {
          competitiveAdvantage: 'Customer-focused approach',
          marketPosition: 'Innovative market challenger',
          contentThemes: ['Industry insights', 'Product updates', 'Customer success'],
          recommendedChannels: ['LinkedIn', 'Blog', 'Email marketing'],
        },
        confidenceScore: 0.3,
      }
    }
  }

  /**
   * Get default configured model
   */
  private getDefaultModel(): any {
    if (this.models.size === 0) {
      throw new Error('No AI providers configured. Please configure at least one provider.')
    }

    // Prefer Claude 3.5 Sonnet for brand analysis
    const preferredModels = [
      'anthropic-claude-3-5-sonnet-20241022',
      'openai-gpt-4o',
      'google-gemini-2.0-flash',
    ]

    for (const modelKey of preferredModels) {
      if (this.models.has(modelKey)) {
        return this.models.get(modelKey)
      }
    }

    // Return first available model
    return Array.from(this.models.values())[0]
  }

  /**
   * Generate content using the configured AI providers
   */
  public async generateContent({
    prompt,
    context,
    temperature = 0.7,
    provider = 'openai',
    model = 'gpt-4o'
  }: {
    prompt: string
    context?: string
    temperature?: number
    provider?: AIProvider
    model?: AIModel
  }): Promise<{ content: string; provider: string; model: string }> {
    const key = `${provider}-${model}`
    const aiModel = this.models.get(key)
    const config = this.configs.get(key)

    if (!aiModel || !config) {
      // Auto-configure with environment variables if available
      try {
        const apiKey = this.getApiKeyForProvider(provider)
        this.configureProvider({ provider, model, apiKey, temperature })
      } catch (error) {
        throw new Error(`AI provider ${provider} not configured and cannot auto-configure: ${error}`)
      }
    }

    try {
      let content: string

      switch (provider) {
        case 'openai':
        case 'anthropic':
          const response = await aiModel.invoke([
            { role: 'user', content: context ? `Context: ${context}\n\nTask: ${prompt}` : prompt }
          ])
          content = response.content
          break

        case 'google':
          const geminiModel = aiModel.getGenerativeModel({ model })
          const result = await geminiModel.generateContent(
            context ? `Context: ${context}\n\nTask: ${prompt}` : prompt
          )
          content = result.response.text()
          break

        default:
          throw new Error(`Unsupported provider: ${provider}`)
      }

      return { content, provider, model }
    } catch (error) {
      console.error(`AI generation failed for ${provider}:`, error)
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get API key for provider from environment
   */
  private getApiKeyForProvider(provider: AIProvider): string {
    switch (provider) {
      case 'openai':
        return import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || ''
      case 'anthropic':
        return import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY || ''
      case 'google':
        return import.meta.env.VITE_GOOGLE_AI_API_KEY || process.env.VITE_GOOGLE_AI_API_KEY || ''
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }

  /**
   * Export company DNA as JSON
   */
  public exportCompanyDNA(dna: CompanyDNA): string {
    return JSON.stringify(dna, null, 2)
  }

  /**
   * Import company DNA from JSON
   */
  public importCompanyDNA(jsonString: string): CompanyDNA {
    try {
      const parsed = JSON.parse(jsonString)
      return CompanyDNASchema.parse(parsed)
    } catch (error) {
      throw new Error(
        `Invalid company DNA JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get configured providers
   */
  public getConfiguredProviders(): string[] {
    return Array.from(this.configs.keys())
  }

  /**
   * Check if any providers are configured
   */
  public isConfigured(): boolean {
    return this.models.size > 0
  }
}

// Export singleton instance
export const modernAIOrchestrator = new ModernAIOrchestrator()
