import { chromium, type Browser, type Page, type BrowserContext } from 'playwright'
import * as cheerio from 'cheerio'
import { z } from 'zod'

// Enhanced website analysis schemas
export const EnhancedWebsiteAnalysisSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  content: z.object({
    headings: z.array(z.object({
      level: z.number(),
      text: z.string(),
      hierarchy: z.string(),
    })),
    paragraphs: z.array(z.object({
      text: z.string(),
      wordCount: z.number(),
      sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
    })),
    links: z.array(z.object({
      href: z.string(),
      text: z.string(),
      type: z.enum(['internal', 'external', 'email', 'phone']),
    })),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string().optional(),
      title: z.string().optional(),
      dimensions: z.object({
        width: z.number(),
        height: z.number(),
      }).optional(),
    })),
    forms: z.array(z.object({
      action: z.string().optional(),
      method: z.string().optional(),
      fields: z.array(z.string()),
    })),
  }),
  metadata: z.object({
    metaDescription: z.string().optional(),
    metaKeywords: z.array(z.string()),
    openGraph: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      type: z.string().optional(),
    }),
    twitter: z.object({
      card: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }),
    canonicalUrl: z.string().optional(),
    language: z.string().optional(),
  }),
  brandElements: z.object({
    colors: z.object({
      dominant: z.array(z.string()),
      palette: z.array(z.object({
        color: z.string(),
        usage: z.string(),
        frequency: z.number(),
      })),
    }),
    typography: z.object({
      fonts: z.array(z.object({
        family: z.string(),
        usage: z.enum(['heading', 'body', 'accent']),
        weight: z.string().optional(),
      })),
      headingStyles: z.array(z.object({
        level: z.string(),
        fontSize: z.string(),
        fontWeight: z.string(),
        color: z.string(),
      })),
    }),
    layout: z.object({
      structure: z.enum(['single-column', 'multi-column', 'grid', 'asymmetric']),
      navigation: z.object({
        type: z.enum(['horizontal', 'vertical', 'hamburger', 'mega']),
        items: z.array(z.string()),
      }),
      sections: z.array(z.object({
        type: z.string(),
        content: z.string(),
      })),
    }),
  }),
  technicalDetails: z.object({
    performance: z.object({
      loadTime: z.number(),
      domContentLoaded: z.number(),
      firstContentfulPaint: z.number().optional(),
      largestContentfulPaint: z.number().optional(),
    }),
    seo: z.object({
      hasStructuredData: z.boolean(),
      hasRobotsMeta: z.boolean(),
      hasCanonicalUrl: z.boolean(),
      headingStructure: z.enum(['good', 'fair', 'poor']),
      imageAltTags: z.number(),
    }),
    accessibility: z.object({
      hasSkipLinks: z.boolean(),
      colorContrast: z.enum(['good', 'fair', 'poor']),
      semanticMarkup: z.enum(['good', 'fair', 'poor']),
    }),
  }),
  businessInsights: z.object({
    companySize: z.enum(['startup', 'small', 'medium', 'enterprise']).optional(),
    industry: z.string().optional(),
    businessModel: z.array(z.string()),
    targetAudience: z.array(z.string()),
    valuePropositions: z.array(z.string()),
    callsToAction: z.array(z.object({
      text: z.string(),
      type: z.enum(['primary', 'secondary', 'tertiary']),
      location: z.string(),
    })),
  }),
  screenshots: z.array(z.object({
    type: z.enum(['full-page', 'above-fold', 'mobile', 'tablet']),
    path: z.string(),
    dimensions: z.object({
      width: z.number(),
      height: z.number(),
    }),
  })),
  analyzedAt: z.string(),
  analysisVersion: z.string(),
})

export type EnhancedWebsiteAnalysis = z.infer<typeof EnhancedWebsiteAnalysisSchema>

export class EnhancedWebsiteAnalyzer {
  private browser: Browser | null = null
  private context: BrowserContext | null = null

  /**
   * Initialize browser with optimized settings
   */
  public async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      })

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        deviceScaleFactor: 1,
        hasTouch: false,
        javaScriptEnabled: true,
      })

      console.log('🚀 Enhanced website analyzer initialized')
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error)
      throw error
    }
  }

  /**
   * Comprehensive website analysis
   */
  public async analyzeWebsite(url: string): Promise<EnhancedWebsiteAnalysis> {
    if (!this.context) {
      await this.initialize()
    }

    const page = await this.context!.newPage()
    const startTime = Date.now()

    try {
      console.log(`🔍 Starting comprehensive analysis of: ${url}`)

      // Navigate with performance monitoring
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })

      if (!response || !response.ok()) {
        throw new Error(`Failed to load page: ${response?.status() || 'Unknown error'}`)
      }

      // Wait for dynamic content
      await page.waitForTimeout(2000)

      // Extract basic performance metrics
      const performanceMetrics = await this.extractPerformanceMetrics(page, startTime)

      // Extract page content
      const content = await page.content()
      const $ = cheerio.load(content)

      // Extract all data in parallel for efficiency
      const [
        basicInfo,
        extractedContent,
        metadata,
        brandElements,
        technicalDetails,
        businessInsights,
        screenshots
      ] = await Promise.all([
        this.extractBasicInfo(page, $),
        this.extractContent(page, $),
        this.extractMetadata(page, $),
        this.extractBrandElements(page, $),
        this.extractTechnicalDetails(page, $, performanceMetrics),
        this.extractBusinessInsights(page, $),
        this.takeScreenshots(page)
      ])

      const analysis: EnhancedWebsiteAnalysis = {
        url,
        title: basicInfo.title,
        description: basicInfo.description,
        content: extractedContent,
        metadata,
        brandElements,
        technicalDetails,
        businessInsights,
        screenshots,
        analyzedAt: new Date().toISOString(),
        analysisVersion: '2.0.0',
      }

      await page.close()
      return EnhancedWebsiteAnalysisSchema.parse(analysis)

    } catch (error) {
      await page.close()
      console.error('❌ Website analysis failed:', error)
      throw new Error(`Failed to analyze website ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract performance metrics
   */
  private async extractPerformanceMetrics(page: Page, startTime: number): Promise<any> {
    try {
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          largestContentfulPaint: paint.find(p => p.name === 'largest-contentful-paint')?.startTime,
        }
      })

      return {
        loadTime: Date.now() - startTime,
        ...performanceMetrics,
      }
    } catch (error) {
      return {
        loadTime: Date.now() - startTime,
        domContentLoaded: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
      }
    }
  }

  /**
   * Extract basic page information
   */
  private async extractBasicInfo(page: Page, $: cheerio.CheerioAPI): Promise<any> {
    const title = await page.title()
    const metaDescription = $('meta[name="description"]').attr('content') || ''
    
    return {
      title,
      description: metaDescription,
    }
  }

  /**
   * Extract page content with semantic analysis
   */
  private async extractContent(page: Page, $: cheerio.CheerioAPI): Promise<any> {
    // Extract headings with hierarchy
    const headings: any[] = []
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim()
      const level = parseInt(element.tagName.substring(1))
      if (text) {
        headings.push({
          level,
          text,
          hierarchy: `h${level}`,
        })
      }
    })

    // Extract paragraphs with word count
    const paragraphs: any[] = []
    $('p').each((_, element) => {
      const text = $(element).text().trim()
      if (text && text.length > 20) {
        paragraphs.push({
          text,
          wordCount: text.split(' ').length,
        })
      }
    })

    // Extract links with classification
    const links: any[] = []
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')
      const text = $(element).text().trim()
      if (href) {
        let type: 'internal' | 'external' | 'email' | 'phone' = 'external'
        
        if (href.startsWith('/') || href.includes(page.url())) {
          type = 'internal'
        } else if (href.startsWith('mailto:')) {
          type = 'email'
        } else if (href.startsWith('tel:')) {
          type = 'phone'
        }

        links.push({ href, text, type })
      }
    })

    // Extract images with details
    const images: any[] = []
    $('img[src]').each((_, element) => {
      const src = $(element).attr('src')
      const alt = $(element).attr('alt')
      const title = $(element).attr('title')
      if (src) {
        images.push({ src, alt, title })
      }
    })

    // Extract forms
    const forms: any[] = []
    $('form').each((_, element) => {
      const action = $(element).attr('action')
      const method = $(element).attr('method')
      const fields: string[] = []
      
      $(element).find('input, textarea, select').each((_, field) => {
        const name = $(field).attr('name') || $(field).attr('id')
        if (name) fields.push(name)
      })

      forms.push({ action, method, fields })
    })

    return {
      headings: headings.slice(0, 50),
      paragraphs: paragraphs.slice(0, 20),
      links: links.slice(0, 100),
      images: images.slice(0, 30),
      forms,
    }
  }

  /**
   * Extract metadata and SEO information
   */
  private async extractMetadata(page: Page, $: cheerio.CheerioAPI): Promise<any> {
    const metaDescription = $('meta[name="description"]').attr('content')
    const metaKeywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || []
    
    const openGraph = {
      title: $('meta[property="og:title"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      type: $('meta[property="og:type"]').attr('content'),
    }

    const twitter = {
      card: $('meta[name="twitter:card"]').attr('content'),
      title: $('meta[name="twitter:title"]').attr('content'),
      description: $('meta[name="twitter:description"]').attr('content'),
      image: $('meta[name="twitter:image"]').attr('content'),
    }

    const canonicalUrl = $('link[rel="canonical"]').attr('href')
    const language = $('html').attr('lang')

    return {
      metaDescription,
      metaKeywords,
      openGraph,
      twitter,
      canonicalUrl,
      language,
    }
  }

  /**
   * Extract brand elements (colors, typography, layout)
   */
  private async extractBrandElements(page: Page, $: cheerio.CheerioAPI): Promise<any> {
    try {
      const brandData = await page.evaluate(() => {
        const colors: string[] = []
        const fonts: any[] = []
        const headingStyles: any[] = []

        // Extract colors from computed styles
        document.querySelectorAll('*').forEach(element => {
          const styles = window.getComputedStyle(element)
          const bgColor = styles.backgroundColor
          const color = styles.color
          
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            colors.push(bgColor)
          }
          if (color && color !== 'rgba(0, 0, 0, 0)') {
            colors.push(color)
          }
        })

        // Extract fonts
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span').forEach(element => {
          const styles = window.getComputedStyle(element)
          const fontFamily = styles.fontFamily
          if (fontFamily) {
            fonts.push({
              family: fontFamily,
              usage: element.tagName.toLowerCase().startsWith('h') ? 'heading' : 'body',
              weight: styles.fontWeight,
            })
          }
        })

        // Extract heading styles
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(element => {
          const styles = window.getComputedStyle(element)
          headingStyles.push({
            level: element.tagName.toLowerCase(),
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            color: styles.color,
          })
        })

        return { colors, fonts, headingStyles }
      })

      // Process and deduplicate
      const uniqueColors = [...new Set(brandData.colors)].slice(0, 20)
      const uniqueFonts = brandData.fonts.reduce((acc: any[], font) => {
        if (!acc.find(f => f.family === font.family)) {
          acc.push(font)
        }
        return acc
      }, []).slice(0, 10)

      // Analyze navigation
      const navigation = {
        type: 'horizontal' as const,
        items: [] as string[],
      }

      $('nav a, header a, .menu a').each((_, element) => {
        const text = $(element).text().trim()
        if (text && text.length < 50) {
          navigation.items.push(text)
        }
      })

      return {
        colors: {
          dominant: uniqueColors.slice(0, 5),
          palette: uniqueColors.map(color => ({
            color,
            usage: 'unknown',
            frequency: 1,
          })),
        },
        typography: {
          fonts: uniqueFonts,
          headingStyles: brandData.headingStyles.slice(0, 6),
        },
        layout: {
          structure: 'multi-column' as const,
          navigation,
          sections: [], // Would be analyzed further with AI
        },
      }
    } catch (error) {
      console.error('Brand elements extraction failed:', error)
      return {
        colors: { dominant: [], palette: [] },
        typography: { fonts: [], headingStyles: [] },
        layout: { structure: 'single-column', navigation: { type: 'horizontal', items: [] }, sections: [] },
      }
    }
  }

  /**
   * Extract technical SEO and accessibility details
   */
  private async extractTechnicalDetails(page: Page, $: cheerio.CheerioAPI, performanceMetrics: any): Promise<any> {
    const hasStructuredData = $('script[type="application/ld+json"]').length > 0
    const hasRobotsMeta = $('meta[name="robots"]').length > 0
    const hasCanonicalUrl = $('link[rel="canonical"]').length > 0
    
    // Check heading structure
    const headingLevels = [] as number[]
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      headingLevels.push(parseInt(element.tagName.substring(1)))
    })
    
    const headingStructure = headingLevels.length > 0 && headingLevels[0] === 1 ? 'good' : 'fair'
    const imageAltTags = $('img[alt]').length

    return {
      performance: performanceMetrics,
      seo: {
        hasStructuredData,
        hasRobotsMeta,
        hasCanonicalUrl,
        headingStructure,
        imageAltTags,
      },
      accessibility: {
        hasSkipLinks: $('a[href^="#"]').length > 0,
        colorContrast: 'fair' as const, // Would need more analysis
        semanticMarkup: 'fair' as const, // Would need more analysis
      },
    }
  }

  /**
   * Extract business insights
   */
  private async extractBusinessInsights(page: Page, $: cheerio.CheerioAPI): Promise<any> {
    const callsToAction: any[] = []
    
    // Find CTAs
    $('button, .btn, .cta, a').each((_, element) => {
      const text = $(element).text().trim()
      if (text && (
        text.toLowerCase().includes('get started') ||
        text.toLowerCase().includes('sign up') ||
        text.toLowerCase().includes('learn more') ||
        text.toLowerCase().includes('contact') ||
        text.toLowerCase().includes('buy') ||
        text.toLowerCase().includes('try')
      )) {
        callsToAction.push({
          text,
          type: 'primary',
          location: 'page',
        })
      }
    })

    return {
      companySize: undefined,
      industry: undefined,
      businessModel: [],
      targetAudience: [],
      valuePropositions: [],
      callsToAction: callsToAction.slice(0, 10),
    }
  }

  /**
   * Take screenshots at different viewport sizes
   */
  private async takeScreenshots(page: Page): Promise<any[]> {
    const screenshots: any[] = []
    const timestamp = Date.now()

    try {
      // Full page screenshot
      const fullPagePath = `/tmp/screenshot-full-${timestamp}.png`
      await page.screenshot({ 
        path: fullPagePath, 
        fullPage: true 
      })
      
      screenshots.push({
        type: 'full-page',
        path: fullPagePath,
        dimensions: { width: 1920, height: 1080 },
      })

      // Above the fold screenshot
      const aboveFoldPath = `/tmp/screenshot-fold-${timestamp}.png`
      await page.screenshot({ 
        path: aboveFoldPath,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      })
      
      screenshots.push({
        type: 'above-fold',
        path: aboveFoldPath,
        dimensions: { width: 1920, height: 1080 },
      })

    } catch (error) {
      console.error('Screenshot capture failed:', error)
    }

    return screenshots
  }

  /**
   * Extract content for AI brand analysis
   */
  public extractContentForAI(analysis: EnhancedWebsiteAnalysis): string {
    let content = `Website Analysis for ${analysis.url}\n\n`
    
    content += `Title: ${analysis.title}\n`
    content += `Description: ${analysis.description}\n\n`
    
    if (analysis.content.headings.length > 0) {
      content += `Headings:\n`
      analysis.content.headings.slice(0, 10).forEach(heading => {
        content += `${heading.hierarchy.toUpperCase()}: ${heading.text}\n`
      })
      content += '\n'
    }
    
    if (analysis.content.paragraphs.length > 0) {
      content += `Content Excerpts:\n`
      analysis.content.paragraphs.slice(0, 5).forEach(para => {
        content += `${para.text}\n\n`
      })
    }

    if (analysis.businessInsights.callsToAction.length > 0) {
      content += `Calls to Action:\n`
      analysis.businessInsights.callsToAction.forEach(cta => {
        content += `- ${cta.text}\n`
      })
      content += '\n'
    }

    return content
  }

  /**
   * Cleanup browser resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close()
        this.context = null
      }
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
      console.log('🧹 Enhanced website analyzer cleaned up')
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }
}

// Export singleton instance
export const enhancedWebsiteAnalyzer = new EnhancedWebsiteAnalyzer()