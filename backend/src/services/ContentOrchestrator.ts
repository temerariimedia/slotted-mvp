// Using built-in fetch (Node 18+)

export interface AIConfig {
  provider: 'openai' | 'anthropic'
  model: string
  apiKey: string
  temperature?: number
  maxTokens?: number
}

export interface BlogContent {
  title: string
  outline: string[]
  content: string
  wordCount: number
  readTime: number
  seoKeywords: string[]
  metaDescription: string
}

export interface VideoScript {
  title: string
  script: string
  duration: number
  scenes: Array<{
    timeStart: number
    timeEnd: number
    description: string
    visualCue: string
    audio: string
  }>
  callToAction: string
}

export interface SocialPost {
  platform: string
  post: string
  hashtags: string[]
  timing: string
  engagement: string[]
  visualSuggestions: string[]
}

export interface EmailCampaign {
  subject: string
  previewText: string
  content: string
  plainText: string
  callToAction: string
  segmentation: string[]
}

export class ContentOrchestrator {
  private aiConfig?: AIConfig

  constructor(aiConfig?: AIConfig) {
    this.aiConfig = aiConfig
  }

  async generateBlog(
    mcpContext: any,
    topic: string,
    length = 2000,
    customInstructions?: string
  ): Promise<BlogContent> {
    const prompt = `
COMPANY CONTEXT:
${this.formatMCPContext(mcpContext)}

TASK: Write a comprehensive blog post about "${topic}"

REQUIREMENTS:
- Target length: ${length} words
- Include compelling headline
- Create detailed outline
- Write engaging introduction that hooks readers
- Use brand voice: ${mcpContext.brandDNA?.brandTone?.communicationStyle || 'conversational'}
- Address target audience pain points: ${mcpContext.brandDNA?.targetAudience?.painPoints?.join(', ') || ''}
- Include actionable insights
- Strong conclusion with clear call-to-action
- SEO optimized with relevant keywords
- Meta description for search

${customInstructions ? `Additional instructions: ${customInstructions}` : ''}

Return as JSON with title, outline (array), content (full markdown), wordCount, readTime, seoKeywords (array), metaDescription
`

    const response = await this.callAI(prompt)
    return this.parseBlogResponse(response, length)
  }

  async generateVideoScript(
    mcpContext: any,
    topic: string,
    blogContent?: string
  ): Promise<VideoScript> {
    const sourceContent = blogContent ? `Based on this blog content:\n${blogContent}\n\n` : ''

    const prompt = `
COMPANY CONTEXT:
${this.formatMCPContext(mcpContext)}

${sourceContent}TASK: Create an engaging video script about "${topic}"

REQUIREMENTS:
- Hook viewers in first 5-10 seconds
- Clear value proposition early
- Conversational, engaging tone
- Include visual cues and scene descriptions
- Build to strong call-to-action
- Target duration: 3-5 minutes
- Brand voice: ${mcpContext.brandDNA?.brandTone?.communicationStyle || 'conversational'}
- Address audience: ${mcpContext.brandDNA?.targetAudience?.demographics || 'business professionals'}

Return as JSON with title, script (full text), duration (seconds), scenes array with timeStart/timeEnd/description/visualCue/audio, callToAction
`

    const response = await this.callAI(prompt)
    return this.parseVideoResponse(response)
  }

  async generateSocialPosts(
    mcpContext: any,
    topic: string,
    platforms: string[] = ['linkedin', 'twitter', 'facebook']
  ): Promise<Record<string, SocialPost>> {
    const posts: Record<string, SocialPost> = {}

    for (const platform of platforms) {
      const prompt = `
COMPANY CONTEXT:
${this.formatMCPContext(mcpContext)}

TASK: Create a ${platform} post about "${topic}"

PLATFORM REQUIREMENTS:
${this.getPlatformRequirements(platform)}

BRAND REQUIREMENTS:
- Voice: ${mcpContext.brandDNA?.brandTone?.communicationStyle || 'conversational'}
- Personality: ${mcpContext.brandDNA?.brandTone?.personality?.join(', ') || 'professional, approachable'}
- Target audience: ${mcpContext.brandDNA?.targetAudience?.demographics || 'business professionals'}

Return as JSON with post (optimized text), hashtags (array), timing (best time to post), engagement (suggested engagement tactics), visualSuggestions (array)
`

      const response = await this.callAI(prompt)
      posts[platform] = this.parseSocialResponse(response, platform)
    }

    return posts
  }

  async generateEmail(
    mcpContext: any,
    topic: string,
    type: 'newsletter' | 'promotion' | 'announcement' = 'newsletter'
  ): Promise<EmailCampaign> {
    const prompt = `
COMPANY CONTEXT:
${this.formatMCPContext(mcpContext)}

TASK: Create a ${type} email about "${topic}"

REQUIREMENTS:
- Compelling subject line (under 50 characters)
- Preview text that complements subject
- Email length: ${mcpContext.contentPreferences?.lengthPreferences?.email || 500} words
- Mobile-friendly formatting
- Clear value proposition
- Strong call-to-action
- Brand voice: ${mcpContext.brandDNA?.brandTone?.communicationStyle || 'conversational'}
- Target: ${mcpContext.brandDNA?.targetAudience?.demographics || 'business professionals'}

Return as JSON with subject, previewText, content (HTML), plainText, callToAction, segmentation (array of audience segments)
`

    const response = await this.callAI(prompt)
    return this.parseEmailResponse(response)
  }

  async generateVoice(
    text: string,
    voiceId?: string,
    settings?: any
  ): Promise<{ audioUrl: string; duration: number }> {
    // ElevenLabs integration
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    const voice = voiceId || 'pNInz6obpgDQGcFmaJgB' // Default voice

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: settings?.stability || 0.5,
          similarity_boost: settings?.similarity_boost || 0.5,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate voice')
    }

    // In production, save to cloud storage and return URL
    const audioBuffer = await response.arrayBuffer()
    const audioUrl = `data:audio/mpeg;base64,${Buffer.from(audioBuffer).toString('base64')}`

    return {
      audioUrl,
      duration: Math.ceil(text.length / 15), // Rough estimate: 15 chars per second
    }
  }

  async generateImages(
    mcpContext: any,
    topic: string,
    imageType: 'blog-header' | 'social-post' | 'email-header' | 'thumbnail' = 'blog-header',
    specifications?: any
  ): Promise<{ images: Array<{ url: string; prompt: string; type: string }> }> {
    const imagePrompt = this.buildImagePrompt(mcpContext, topic, imageType, specifications)

    // DALL-E integration
    if (this.aiConfig?.provider === 'openai') {
      return this.generateWithDALLE(imagePrompt, imageType)
    }

    // Fallback: return placeholder
    return {
      images: [
        {
          url: `https://via.placeholder.com/800x400/2563eb/ffffff?text=${encodeURIComponent(topic)}`,
          prompt: imagePrompt,
          type: imageType,
        },
      ],
    }
  }

  async createVideo(
    script: string,
    voiceSettings?: any,
    videoSettings?: any
  ): Promise<{ videoUrl: string; duration: number }> {
    // This would integrate with video generation services like:
    // - D-ID, Synthesia for AI avatars
    // - Pictory, Lumen5 for automated video creation
    // - OpusClip for video editing

    // For MVP, return placeholder
    return {
      videoUrl: 'https://example.com/generated-video.mp4',
      duration: 180, // 3 minutes
    }
  }

  async generateContentPackage(
    mcpContext: any,
    topic: string,
    contentTypes: string[] = ['blog', 'video', 'social', 'email']
  ): Promise<any> {
    const contentPackage: any = {
      topic,
      generatedAt: new Date().toISOString(),
      content: {},
    }

    // Generate all content types in sequence
    if (contentTypes.includes('blog')) {
      contentPackage.content.blog = await this.generateBlog(mcpContext, topic)
    }

    if (contentTypes.includes('video') && contentPackage.content.blog) {
      contentPackage.content.video = await this.generateVideoScript(
        mcpContext,
        topic,
        contentPackage.content.blog.content
      )
    }

    if (contentTypes.includes('social')) {
      const platforms = mcpContext.marketingGoals?.channels?.primary || ['linkedin']
      contentPackage.content.social = await this.generateSocialPosts(mcpContext, topic, platforms)
    }

    if (contentTypes.includes('email')) {
      contentPackage.content.email = await this.generateEmail(mcpContext, topic)
    }

    if (contentTypes.includes('images')) {
      contentPackage.content.images = await this.generateImages(mcpContext, topic)
    }

    return contentPackage
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
Primary Channels: ${mcpContext.marketingGoals?.channels?.primary?.join(', ') || ''}
`
  }

  private getPlatformRequirements(platform: string): string {
    const requirements = {
      linkedin:
        '- Professional tone\n- 1300 character limit\n- Include industry insights\n- Use 3-5 relevant hashtags',
      twitter:
        '- Conversational tone\n- 280 character limit\n- Include trending hashtags\n- Encourage engagement',
      facebook:
        '- Friendly, approachable tone\n- Up to 2000 characters\n- Visual content friendly\n- Community focused',
      instagram:
        '- Visual-first approach\n- Up to 2200 characters\n- Story-driven content\n- Use 11-20 hashtags',
    }

    return requirements[platform as keyof typeof requirements] || requirements.linkedin
  }

  private buildImagePrompt(
    mcpContext: any,
    topic: string,
    imageType: string,
    specifications?: any
  ): string {
    const brandColors = mcpContext.brandDNA?.brandColors
    const style = specifications?.style || 'modern, professional'

    return `Create a ${imageType} image for "${topic}". Style: ${style}. Brand colors: ${brandColors?.primary}, ${brandColors?.secondary}. Company: ${mcpContext.company?.name}. Industry: ${mcpContext.company?.industry}.`
  }

  private async generateWithDALLE(
    prompt: string,
    imageType: string
  ): Promise<{ images: Array<{ url: string; prompt: string; type: string }> }> {
    if (!this.aiConfig?.apiKey) {
      throw new Error('OpenAI API key required for image generation')
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.aiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    })

    const data = (await response.json()) as any
    return {
      images: data.data.map((img: any) => ({
        url: img.url,
        prompt,
        type: imageType,
      })),
    }
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

  private parseBlogResponse(response: string, targetLength: number): BlogContent {
    try {
      const parsed = JSON.parse(response)
      return {
        ...parsed,
        wordCount: parsed.wordCount || this.countWords(parsed.content || ''),
        readTime: Math.ceil((parsed.wordCount || targetLength) / 200),
      }
    } catch (error) {
      return {
        title: 'Generated Blog Post',
        outline: [],
        content: response,
        wordCount: this.countWords(response),
        readTime: Math.ceil(this.countWords(response) / 200),
        seoKeywords: [],
        metaDescription: '',
      }
    }
  }

  private parseVideoResponse(response: string): VideoScript {
    try {
      return JSON.parse(response)
    } catch (error) {
      return {
        title: 'Generated Video Script',
        script: response,
        duration: 180,
        scenes: [],
        callToAction: 'Learn more about our services',
      }
    }
  }

  private parseSocialResponse(response: string, platform: string): SocialPost {
    try {
      const parsed = JSON.parse(response)
      return { platform, ...parsed }
    } catch (error) {
      return {
        platform,
        post: response,
        hashtags: [],
        timing: '9:00 AM',
        engagement: [],
        visualSuggestions: [],
      }
    }
  }

  private parseEmailResponse(response: string): EmailCampaign {
    try {
      return JSON.parse(response)
    } catch (error) {
      return {
        subject: 'Newsletter Update',
        previewText: '',
        content: response,
        plainText: response.replace(/<[^>]*>/g, ''),
        callToAction: 'Learn More',
        segmentation: [],
      }
    }
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length
  }
}
