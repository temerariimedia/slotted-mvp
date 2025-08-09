import { z } from 'zod'
import type { CompanyDNA } from '../ai/modern-ai-orchestrator'

// MCP Resource schemas
export const MCPResourceSchema = z.object({
  uri: z.string(),
  name: z.string(),
  description: z.string(),
  mimeType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const MCPToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.any()),
    required: z.array(z.string()).optional(),
  }),
})

// Modern MCP Context Engine
export class ModernMCPContextEngine {
  private context: CompanyDNA | null = null
  private resources: Map<string, any> = new Map()
  private tools: Map<string, any> = new Map()
  private listeners: Set<(context: CompanyDNA) => void> = new Set()

  constructor() {
    this.initializeDefaultTools()
  }

  /**
   * Initialize default MCP tools
   */
  private initializeDefaultTools(): void {
    // Company DNA Extractor Tool
    this.registerTool({
      name: 'extract_company_dna',
      description: 'Extract comprehensive company DNA from website and basic information',
      inputSchema: {
        type: 'object',
        properties: {
          companyName: { type: 'string', description: 'Company name' },
          website: { type: 'string', description: 'Company website URL' },
          industry: { type: 'string', description: 'Company industry' },
          description: { type: 'string', description: 'Company description' },
        },
        required: ['companyName'],
      },
    })

    // Brand Analysis Tool
    this.registerTool({
      name: 'analyze_brand_voice',
      description: 'Analyze brand voice and personality from company content',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Content to analyze for brand voice' },
          context: { type: 'object', description: 'Additional context for analysis' },
        },
        required: ['content'],
      },
    })

    // Content Generation Tool
    this.registerTool({
      name: 'generate_marketing_content',
      description: 'Generate marketing content based on company DNA',
      inputSchema: {
        type: 'object',
        properties: {
          contentType: {
            type: 'string',
            enum: ['blog', 'social', 'email', 'video-script'],
            description: 'Type of content to generate',
          },
          topic: { type: 'string', description: 'Content topic or theme' },
          length: { type: 'number', description: 'Desired content length' },
          tone: {
            type: 'string',
            enum: ['professional', 'casual', 'friendly', 'authoritative'],
            description: 'Content tone',
          },
        },
        required: ['contentType', 'topic'],
      },
    })

    console.log('🔧 MCP tools initialized')
  }

  /**
   * Load company context from storage
   */
  public async loadContext(): Promise<CompanyDNA | null> {
    try {
      // Try localStorage first
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('slotted_company_dna_v2')
        if (stored) {
          this.context = JSON.parse(stored)
          this.notifyListeners()
          return this.context
        }
      }

      // Try other storage methods (Supabase, etc.)
      // TODO: Implement database loading

      return null
    } catch (error) {
      console.error('❌ Failed to load MCP context:', error)
      return null
    }
  }

  /**
   * Save company context to storage
   */
  public async saveContext(context: CompanyDNA): Promise<void> {
    try {
      // Update metadata
      context.metadata = {
        ...context.metadata,
        extractedAt: new Date().toISOString(),
        version: '2.0.0',
      }

      this.context = context

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('slotted_company_dna_v2', JSON.stringify(context))
      }

      // TODO: Save to database (Supabase)

      // Update MCP resources
      this.updateMCPResources(context)

      // Notify listeners
      this.notifyListeners()

      console.log('✅ Company DNA saved successfully')
    } catch (error) {
      console.error('❌ Failed to save MCP context:', error)
      throw error
    }
  }

  /**
   * Update MCP resources based on company context
   */
  private updateMCPResources(context: CompanyDNA): void {
    // Company Profile Resource
    this.registerResource({
      uri: 'company://profile',
      name: 'Company Profile',
      description: `Profile for ${context.company.name}`,
      mimeType: 'application/json',
      metadata: {
        company: context.company,
        lastUpdated: context.metadata.extractedAt,
      },
    })

    // Brand DNA Resource
    this.registerResource({
      uri: 'company://brand-dna',
      name: 'Brand DNA',
      description: `Brand DNA and voice guidelines for ${context.company.name}`,
      mimeType: 'application/json',
      metadata: {
        brandDNA: context.brandDNA,
        confidenceScore: context.metadata.confidenceScore,
      },
    })

    // Marketing Insights Resource
    this.registerResource({
      uri: 'company://marketing-insights',
      name: 'Marketing Insights',
      description: `Marketing strategy and insights for ${context.company.name}`,
      mimeType: 'application/json',
      metadata: {
        insights: context.marketingInsights,
        recommendedChannels: context.marketingInsights.recommendedChannels,
      },
    })

    console.log('📚 MCP resources updated')
  }

  /**
   * Register MCP resource
   */
  public registerResource(resource: z.infer<typeof MCPResourceSchema>): void {
    const validated = MCPResourceSchema.parse(resource)
    this.resources.set(validated.uri, validated)
  }

  /**
   * Register MCP tool
   */
  public registerTool(tool: z.infer<typeof MCPToolSchema>): void {
    const validated = MCPToolSchema.parse(tool)
    this.tools.set(validated.name, validated)
  }

  /**
   * Get MCP prompt context for AI models
   */
  public getMCPPromptContext(): string {
    if (!this.context) {
      return 'No company context available. Please extract company DNA first.'
    }

    const { company, brandDNA, marketingInsights } = this.context

    return `
COMPANY CONTEXT (MCP v2.0):
================================

COMPANY PROFILE:
- Name: ${company.name}
- Industry: ${company.industry}
- Size: ${company.size}
- Description: ${company.description}
${company.website ? `- Website: ${company.website}` : ''}

BRAND DNA:
- Value Propositions: ${brandDNA.valuePropositions.join(', ')}
- Core Offerings: ${brandDNA.coreOfferings.join(', ')}
- Target Demographics: ${brandDNA.targetAudience.demographics}
- Target Psychographics: ${brandDNA.targetAudience.psychographics}
- Pain Points Addressed: ${brandDNA.targetAudience.painPoints.join(', ')}

BRAND VOICE & PERSONALITY:
- Personality Traits: ${brandDNA.brandVoice.personality.join(', ')}
- Communication Tone: ${brandDNA.brandVoice.tone}
- Communication Style: ${brandDNA.brandVoice.communicationStyle}

BRAND COLORS:
- Primary: ${brandDNA.brandColors.primary}
- Secondary: ${brandDNA.brandColors.secondary}
- Accent: ${brandDNA.brandColors.accent}

MARKETING STRATEGY:
- Competitive Advantage: ${marketingInsights.competitiveAdvantage}
- Market Position: ${marketingInsights.marketPosition}
- Content Themes: ${marketingInsights.contentThemes.join(', ')}
- Recommended Channels: ${marketingInsights.recommendedChannels.join(', ')}

CONTEXT METADATA:
- Extracted: ${this.context.metadata.extractedAt}
- Website Analyzed: ${this.context.metadata.websiteAnalyzed}
- Confidence Score: ${this.context.metadata.confidenceScore}
- Version: ${this.context.metadata.version}

USE THIS CONTEXT FOR:
- Brand-consistent content generation
- Voice and tone matching
- Target audience alignment
- Channel-appropriate messaging
- Strategic content planning
`.trim()
  }

  /**
   * Export context as JSON
   */
  public exportContext(): string {
    if (!this.context) {
      throw new Error('No context available to export')
    }
    return JSON.stringify(this.context, null, 2)
  }

  /**
   * Import context from JSON
   */
  public async importContext(jsonString: string): Promise<void> {
    try {
      const parsed = JSON.parse(jsonString)
      // TODO: Add schema validation for imported context
      await this.saveContext(parsed)
    } catch (error) {
      throw new Error(
        `Invalid context JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get available MCP resources
   */
  public getResources(): Array<z.infer<typeof MCPResourceSchema>> {
    return Array.from(this.resources.values())
  }

  /**
   * Get available MCP tools
   */
  public getTools(): Array<z.infer<typeof MCPToolSchema>> {
    return Array.from(this.tools.values())
  }

  /**
   * Execute MCP tool
   */
  public async executeTool(toolName: string, parameters: Record<string, any>): Promise<any> {
    const tool = this.tools.get(toolName)
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`)
    }

    // TODO: Implement actual tool execution logic
    console.log(`🔧 Executing MCP tool: ${toolName}`, parameters)

    // For now, return a placeholder response
    return {
      success: true,
      result: `Tool ${toolName} executed with parameters`,
      parameters,
    }
  }

  /**
   * Subscribe to context changes
   */
  public subscribe(listener: (context: CompanyDNA) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of context changes
   */
  private notifyListeners(): void {
    if (this.context) {
      this.listeners.forEach((listener) => listener(this.context!))
    }
  }

  /**
   * Get current context
   */
  public getContext(): CompanyDNA | null {
    return this.context
  }

  /**
   * Check if context is available
   */
  public hasContext(): boolean {
    return this.context !== null
  }

  /**
   * Clear context
   */
  public async clearContext(): Promise<void> {
    this.context = null
    this.resources.clear()

    if (typeof window !== 'undefined') {
      localStorage.removeItem('slotted_company_dna_v2')
    }

    this.initializeDefaultTools()
    console.log('🗑️ MCP context cleared')
  }
}

// Export singleton instance
export const modernMCPEngine = new ModernMCPContextEngine()
