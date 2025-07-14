import { z } from 'zod'
import type { CompanyDNA } from '../ai/modern-ai-orchestrator'
import type { CampaignTopic } from '../campaigns/campaign-generator'

// Blog post structure schema
export const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string(), // Markdown format
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  estimatedReadTime: z.number(),
  seoScore: z.number(),
  brandConsistencyScore: z.number(),
  structure: z.object({
    introduction: z.string(),
    mainSections: z.array(z.object({
      heading: z.string(),
      content: z.string(),
      subsections: z.array(z.string()).optional(),
    })),
    conclusion: z.string(),
    callToAction: z.string(),
  }),
  metadata: z.object({
    wordCount: z.number(),
    generatedAt: z.string(),
    aiProvider: z.string(),
    processingTimeMs: z.number(),
    revision: z.number(),
    topic: z.string(),
    tone: z.string(),
  }),
})

export type BlogPost = z.infer<typeof BlogPostSchema>

// Blog generation options
export const BlogGenerationOptionsSchema = z.object({
  topic: z.string(),
  companyDNA: z.any(), // CompanyDNA type
  campaignContext: z.any().optional(), // CampaignTopic type
  targetKeywords: z.array(z.string()).optional(),
  contentLength: z.number().min(1000).max(5000).default(2000),
  tone: z.enum(['professional', 'casual', 'technical', 'conversational']).default('professional'),
  includeImages: z.boolean().default(false),
  seoOptimization: z.boolean().default(true),
  callToActionType: z.enum(['contact', 'download', 'trial', 'subscribe', 'custom']).default('contact'),
  customCTA: z.string().optional(),
})

export type BlogGenerationOptions = z.infer<typeof BlogGenerationOptionsSchema>

// SEO analysis schema
export const SEOAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  recommendations: z.array(z.string()),
  keywordDensity: z.record(z.number()),
  readabilityScore: z.number(),
  structureScore: z.number(),
  metaOptimization: z.number(),
})

export type SEOAnalysis = z.infer<typeof SEOAnalysisSchema>

/**
 * Advanced Blog Content Generator
 * Transforms topics into professional blog posts with brand voice consistency
 */
export class BlogContentGenerator {
  private aiOrchestrator: any

  constructor(aiOrchestrator: any) {
    this.aiOrchestrator = aiOrchestrator
  }

  /**
   * Generate comprehensive blog post
   */
  public async generateBlogPost(options: BlogGenerationOptions): Promise<BlogPost> {
    const startTime = Date.now()
    
    console.log(`📝 Generating blog post: "${options.topic}"`)
    console.log(`   Target length: ${options.contentLength} words`)
    console.log(`   Tone: ${options.tone}`)
    console.log(`   Company: ${options.companyDNA.company.name}`)

    try {
      // Validate options
      const validatedOptions = BlogGenerationOptionsSchema.parse(options)
      
      // Generate keywords if not provided
      const keywords = validatedOptions.targetKeywords || 
        await this.generateKeywords(validatedOptions.topic, validatedOptions.companyDNA)
      
      // Create comprehensive blog content
      const content = await this.generateContent(validatedOptions, keywords)
      
      // Generate SEO-optimized title and meta description
      const seoElements = await this.generateSEOElements(validatedOptions, content, keywords)
      
      // Analyze content quality
      const seoAnalysis = await this.analyzeSEO(content, keywords)
      const brandConsistency = await this.analyzeBrandConsistency(content, validatedOptions.companyDNA)
      
      // Calculate estimated read time (average 200 words per minute)
      const wordCount = content.split(/\s+/).length
      const estimatedReadTime = Math.ceil(wordCount / 200)

      const blogPost: BlogPost = {
        id: `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: seoElements.title,
        subtitle: seoElements.subtitle,
        content,
        metaDescription: seoElements.metaDescription,
        keywords,
        estimatedReadTime,
        seoScore: seoAnalysis.score,
        brandConsistencyScore: brandConsistency,
        structure: await this.parseContentStructure(content),
        metadata: {
          wordCount,
          generatedAt: new Date().toISOString(),
          aiProvider: 'gpt-4o',
          processingTimeMs: Date.now() - startTime,
          revision: 1,
          topic: validatedOptions.topic,
          tone: validatedOptions.tone,
        },
      }

      console.log(`✅ Blog post generated successfully`)
      console.log(`   Word count: ${wordCount}`)
      console.log(`   SEO score: ${Math.round(seoAnalysis.score)}/100`)
      console.log(`   Brand consistency: ${Math.round(brandConsistency * 100)}%`)
      console.log(`   Processing time: ${Date.now() - startTime}ms`)

      return BlogPostSchema.parse(blogPost)
    } catch (error) {
      console.error('❌ Blog post generation failed:', error)
      throw new Error(`Failed to generate blog post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate content using AI orchestrator
   */
  private async generateContent(options: BlogGenerationOptions, keywords: string[]): Promise<string> {
    const prompt = this.buildContentPrompt(options, keywords)
    
    const response = await this.aiOrchestrator.generateContent({
      type: 'blog-content',
      customInstructions: prompt,
      maxTokens: Math.ceil(options.contentLength * 1.5), // Allow for formatting
    })

    return this.formatContent(response.content, options)
  }

  /**
   * Build comprehensive content generation prompt
   */
  private buildContentPrompt(options: BlogGenerationOptions, keywords: string[]): string {
    const { companyDNA, topic, tone, contentLength, campaignContext, callToActionType } = options
    const { company, brandDNA, marketingInsights } = companyDNA

    return `
Write a comprehensive ${contentLength}-word blog post on the topic: "${topic}"

COMPANY CONTEXT:
- Company: ${company.name}
- Industry: ${company.industry}
- Value Propositions: ${brandDNA.valuePropositions.join(', ')}
- Target Audience: ${brandDNA.targetAudience.demographics}
- Brand Voice: ${brandDNA.brandVoice.personality.join(', ')} - ${brandDNA.brandVoice.tone}
- Communication Style: ${brandDNA.brandVoice.communication.join(', ')}

${campaignContext ? `
CAMPAIGN CONTEXT:
- Campaign Theme: ${campaignContext.theme}
- Business Goal: ${campaignContext.businessGoal}
- Primary Channel: ${campaignContext.primaryChannel}
- Call to Action: ${campaignContext.callToAction}
` : ''}

TARGET KEYWORDS: ${keywords.join(', ')}

WRITING REQUIREMENTS:
1. Tone: ${tone}
2. Word count: ${contentLength} words (approximately)
3. SEO-optimized with natural keyword integration
4. Brand voice consistency throughout
5. Professional blog post structure
6. Actionable insights and value for the target audience
7. Proper markdown formatting

STRUCTURE REQUIREMENTS:
- Compelling introduction (10% of content)
- 3-5 main sections with descriptive headings (70% of content)
- Actionable conclusion (15% of content)
- Clear call-to-action (5% of content)

CONTENT GUIDELINES:
- Write in ${brandDNA.brandVoice.tone} tone
- Use ${brandDNA.brandVoice.communication.join(' and ')} communication style
- Address pain points: ${brandDNA.targetAudience.painPoints.join(', ')}
- Highlight value propositions naturally
- Include actionable advice and insights
- Use examples relevant to ${company.industry}
- Maintain professional credibility
- Integrate keywords naturally (avoid keyword stuffing)

OUTPUT FORMAT:
Return the content in markdown format with:
- H1 title
- H2 section headings
- H3 subsection headings where appropriate
- Bullet points and numbered lists for readability
- **Bold** and *italic* emphasis where relevant
- Natural paragraph breaks for readability

The content should sound authentic to the brand while providing genuine value to readers interested in ${topic}.
`
  }

  /**
   * Format and clean generated content
   */
  private formatContent(rawContent: string, options: BlogGenerationOptions): string {
    let content = rawContent.trim()
    
    // Ensure proper markdown formatting
    content = content.replace(/^# /gm, '# ')
    content = content.replace(/^## /gm, '## ')
    content = content.replace(/^### /gm, '### ')
    
    // Add call-to-action if not present
    if (!content.includes('call-to-action') && !content.includes('CTA')) {
      const cta = this.generateCallToAction(options)
      content += `\n\n## Ready to Get Started?\n\n${cta}`
    }
    
    // Ensure proper spacing
    content = content.replace(/\n\n\n+/g, '\n\n')
    
    return content
  }

  /**
   * Generate appropriate call-to-action
   */
  private generateCallToAction(options: BlogGenerationOptions): string {
    const { companyDNA, callToActionType, customCTA } = options
    
    if (customCTA) {
      return customCTA
    }
    
    const companyName = companyDNA.company.name
    
    switch (callToActionType) {
      case 'contact':
        return `Ready to transform your ${companyDNA.company.industry.toLowerCase()} operations? Contact ${companyName} today to learn how we can help you achieve your goals.`
      
      case 'download':
        return `Download our free guide to learn more about optimizing your ${companyDNA.company.industry.toLowerCase()} strategy. Get expert insights from ${companyName}.`
      
      case 'trial':
        return `Start your free trial with ${companyName} today and experience the difference our solution can make for your business.`
      
      case 'subscribe':
        return `Subscribe to our newsletter for more insights on ${companyDNA.company.industry.toLowerCase()} trends and best practices from the ${companyName} team.`
      
      default:
        return `Learn more about how ${companyName} can help you succeed. Contact us for a personalized consultation.`
    }
  }

  /**
   * Generate SEO elements (title, subtitle, meta description)
   */
  private async generateSEOElements(
    options: BlogGenerationOptions, 
    content: string, 
    keywords: string[]
  ): Promise<{ title: string; subtitle?: string; metaDescription: string }> {
    const primaryKeyword = keywords[0] || options.topic
    const companyName = options.companyDNA.company.name
    
    // Generate compelling title with primary keyword
    const title = `${this.capitalizeFirst(primaryKeyword)}: ${this.generateTitleVariation(options.topic, companyName)}`
    
    // Generate meta description
    const metaDescription = `Discover ${primaryKeyword} strategies and insights from ${companyName}. Learn how to ${options.topic.toLowerCase()} effectively with expert guidance and proven techniques.`
    
    return {
      title: title.length > 60 ? title.substring(0, 57) + '...' : title,
      metaDescription: metaDescription.length > 160 ? metaDescription.substring(0, 157) + '...' : metaDescription,
    }
  }

  /**
   * Generate topic-relevant keywords
   */
  private async generateKeywords(topic: string, companyDNA: CompanyDNA): Promise<string[]> {
    const baseKeywords = [
      topic.toLowerCase(),
      `${topic.toLowerCase()} guide`,
      `${topic.toLowerCase()} tips`,
      `${companyDNA.company.industry.toLowerCase()} ${topic.toLowerCase()}`,
      companyDNA.company.industry.toLowerCase(),
    ]
    
    // Add company-specific keywords
    const companyKeywords = [
      ...companyDNA.brandDNA.valuePropositions.map(vp => vp.toLowerCase().split(' ')[0]).filter(Boolean),
      ...companyDNA.marketingInsights.contentThemes.map(theme => theme.toLowerCase()),
    ]
    
    return [...baseKeywords, ...companyKeywords.slice(0, 3)].slice(0, 8)
  }

  /**
   * Analyze SEO quality
   */
  private async analyzeSEO(content: string, keywords: string[]): Promise<SEOAnalysis> {
    const wordCount = content.split(/\s+/).length
    let score = 0
    const recommendations: string[] = []
    
    // Keyword density analysis
    const keywordDensity: Record<string, number> = {}
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'gi')
      const matches = content.toLowerCase().match(regex) || []
      const density = (matches.length / wordCount) * 100
      keywordDensity[keyword] = density
      
      if (density > 0.5 && density < 3) {
        score += 15
      } else if (density === 0) {
        recommendations.push(`Add keyword "${keyword}" to content`)
      } else if (density > 3) {
        recommendations.push(`Reduce keyword density for "${keyword}"`)
      }
    })
    
    // Structure analysis
    const headings = content.match(/^#{1,6}\s+.+$/gm) || []
    if (headings.length >= 3) {
      score += 20
    } else {
      recommendations.push('Add more section headings for better structure')
    }
    
    // Length analysis
    if (wordCount >= 1500 && wordCount <= 3000) {
      score += 20
    } else if (wordCount < 1500) {
      recommendations.push('Increase content length for better SEO')
    }
    
    // Readability (simple check for sentence length)
    const sentences = content.split(/[.!?]+/)
    const avgSentenceLength = wordCount / sentences.length
    const readabilityScore = avgSentenceLength < 20 ? 80 : 60
    
    if (readabilityScore >= 70) {
      score += 15
    } else {
      recommendations.push('Improve readability with shorter sentences')
    }
    
    // Meta optimization
    const hasTitle = content.includes('# ')
    const hasMetaKeywords = keywords.some(k => content.toLowerCase().includes(k.toLowerCase()))
    
    if (hasTitle && hasMetaKeywords) {
      score += 30
    }
    
    return {
      score: Math.min(score, 100),
      recommendations,
      keywordDensity,
      readabilityScore,
      structureScore: headings.length >= 3 ? 100 : (headings.length * 33),
      metaOptimization: hasTitle && hasMetaKeywords ? 100 : 50,
    }
  }

  /**
   * Analyze brand voice consistency
   */
  private async analyzeBrandConsistency(content: string, companyDNA: CompanyDNA): Promise<number> {
    const { brandVoice } = companyDNA.brandDNA
    let score = 0
    
    // Check for brand voice keywords
    const brandKeywords = [
      ...brandVoice.personality,
      brandVoice.communicationStyle,
      brandVoice.tone.toLowerCase(),
    ]
    
    const contentLower = content.toLowerCase()
    const matchingKeywords = brandKeywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    )
    
    // Basic scoring (can be enhanced with ML models)
    score = Math.min((matchingKeywords.length / brandKeywords.length) * 0.8 + 0.2, 1.0)
    
    return score
  }

  /**
   * Parse content structure from markdown
   */
  private async parseContentStructure(content: string): Promise<BlogPost['structure']> {
    const lines = content.split('\n')
    const structure: BlogPost['structure'] = {
      introduction: '',
      mainSections: [],
      conclusion: '',
      callToAction: '',
    }
    
    let currentSection: string | null = null
    let currentContent: string[] = []
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          const content = currentContent.join('\n').trim()
          
          if (currentSection.toLowerCase().includes('conclusion') || 
              currentSection.toLowerCase().includes('summary')) {
            structure.conclusion = content
          } else if (currentSection.toLowerCase().includes('call') || 
                     currentSection.toLowerCase().includes('action')) {
            structure.callToAction = content
          } else {
            structure.mainSections.push({
              heading: currentSection,
              content,
              subsections: [],
            })
          }
        }
        
        currentSection = line.replace('## ', '')
        currentContent = []
      } else if (!line.startsWith('#') && line.trim() && currentSection) {
        currentContent.push(line)
      } else if (!currentSection && line.trim() && !line.startsWith('#')) {
        // Introduction content
        structure.introduction += line + '\n'
      }
    }
    
    // Handle last section
    if (currentSection && currentContent.length > 0) {
      const content = currentContent.join('\n').trim()
      structure.mainSections.push({
        heading: currentSection,
        content,
        subsections: [],
      })
    }
    
    return structure
  }

  /**
   * Utility functions
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private generateTitleVariation(topic: string, companyName: string): string {
    const variations = [
      `Complete Guide by ${companyName}`,
      `Expert Insights from ${companyName}`,
      `Best Practices Guide`,
      `Professional Strategies`,
      `Ultimate Guide for Success`,
    ]
    
    return variations[Math.floor(Math.random() * variations.length)]
  }

  /**
   * Export blog post to different formats
   */
  public async exportBlogPost(blogPost: BlogPost, format: 'markdown' | 'html' | 'json'): Promise<string> {
    switch (format) {
      case 'markdown':
        return blogPost.content
      
      case 'html':
        return this.convertMarkdownToHTML(blogPost.content)
      
      case 'json':
        return JSON.stringify(blogPost, null, 2)
      
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Convert markdown to HTML (basic implementation)
   */
  private convertMarkdownToHTML(markdown: string): string {
    return markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
  }
}

// Export singleton instance (will be configured with AI orchestrator)
export const blogContentGenerator = new BlogContentGenerator(null) // Will be injected when needed