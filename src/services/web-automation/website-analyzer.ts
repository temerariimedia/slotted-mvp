import { chromium, type Browser, type Page } from 'playwright'
import * as cheerio from 'cheerio'
import { z } from 'zod'

// Website analysis result schema
export const WebsiteAnalysisSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  content: z.object({
    headings: z.array(z.string()),
    paragraphs: z.array(z.string()),
    links: z.array(z.string()),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string().optional(),
    })),
  }),
  metadata: z.object({
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: z.string().optional(),
  }),
  visualElements: z.object({
    colorScheme: z.array(z.string()),
    fonts: z.array(z.string()),
    layout: z.string(),
  }),
  performance: z.object({
    loadTime: z.number(),
    screenshotPath: z.string().optional(),
  }),
  analyzedAt: z.string(),
})

export type WebsiteAnalysis = z.infer<typeof WebsiteAnalysisSchema>

// Brand visual analysis schema
export const BrandVisualAnalysisSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    palette: z.array(z.string()),
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    style: z.enum(['modern', 'classic', 'playful', 'corporate', 'minimalist']),
  }),
  layout: z.object({
    style: z.enum(['grid', 'single-column', 'multi-column', 'asymmetric']),
    spacing: z.enum(['tight', 'comfortable', 'spacious']),
  }),
  imagery: z.object({
    style: z.enum(['photography', 'illustrations', 'icons', 'mixed']),
    quality: z.enum(['professional', 'stock', 'casual', 'high-end']),
  }),
  overallTone: z.enum(['professional', 'creative', 'technical', 'friendly', 'luxury']),
})

export type BrandVisualAnalysis = z.infer<typeof BrandVisualAnalysisSchema>

export class AdvancedWebsiteAnalyzer {
  private browser: Browser | null = null

  /**
   * Initialize browser for analysis
   */
  public async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      console.log('🚀 Website analyzer initialized')
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error)
      throw error
    }
  }

  /**
   * Analyze website comprehensively
   */
  public async analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
    if (!this.browser) {
      await this.initialize()
    }

    const startTime = Date.now()
    const page = await this.browser!.newPage()

    try {
      // Set viewport and user agent
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      })

      // Navigate to the website
      console.log(`🔍 Analyzing website: ${url}`)
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })

      // Extract page content
      const content = await page.content()
      const $ = cheerio.load(content)

      // Extract metadata
      const title = await page.title()
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content') || ''
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content') || ''
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content') || ''
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content') || ''
      
      // Extract keywords from meta tags
      const keywordsContent = await page.locator('meta[name="keywords"]').getAttribute('content') || ''
      const keywords = keywordsContent.split(',').map(k => k.trim()).filter(k => k.length > 0)

      // Extract content elements
      const headings: string[] = []
      $('h1, h2, h3, h4, h5, h6').each((_, element) => {
        const text = $(element).text().trim()
        if (text) headings.push(text)
      })

      const paragraphs: string[] = []
      $('p').each((_, element) => {
        const text = $(element).text().trim()
        if (text && text.length > 20) paragraphs.push(text)
      })

      const links: string[] = []
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href')
        if (href) links.push(href)
      })

      const images: Array<{ src: string; alt?: string }> = []
      $('img[src]').each((_, element) => {
        const src = $(element).attr('src')
        const alt = $(element).attr('alt')
        if (src) images.push({ src, alt })
      })

      // Analyze visual elements
      const visualElements = await this.analyzeVisualElements(page)

      // Take screenshot
      const screenshotPath = `/tmp/screenshot-${Date.now()}.png`
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      })

      const loadTime = Date.now() - startTime

      // Construct analysis result
      const analysis: WebsiteAnalysis = {
        url,
        title,
        description: metaDescription || paragraphs[0] || '',
        content: {
          headings: headings.slice(0, 20), // Limit to first 20 headings
          paragraphs: paragraphs.slice(0, 10), // Limit to first 10 paragraphs
          links: links.slice(0, 50), // Limit to first 50 links
          images: images.slice(0, 20), // Limit to first 20 images
        },
        metadata: {
          metaDescription,
          keywords,
          ogTitle,
          ogDescription,
          ogImage,
        },
        visualElements,
        performance: {
          loadTime,
          screenshotPath,
        },
        analyzedAt: new Date().toISOString(),
      }

      await page.close()
      return WebsiteAnalysisSchema.parse(analysis)

    } catch (error) {
      await page.close()
      console.error('❌ Website analysis failed:', error)
      throw new Error(`Failed to analyze website ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Analyze visual elements and extract brand information
   */
  private async analyzeVisualElements(page: Page): Promise<WebsiteAnalysis['visualElements']> {
    try {
      // Extract computed styles and colors
      const colorScheme = await page.evaluate(() => {
        const colors: string[] = []
        const elements = document.querySelectorAll('*')
        
        elements.forEach(element => {
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
        
        // Convert to hex and deduplicate
        const uniqueColors = [...new Set(colors)]
        return uniqueColors.slice(0, 10) // Limit to 10 most common colors
      })

      // Extract font families
      const fonts = await page.evaluate(() => {
        const fontFamilies: string[] = []
        const elements = document.querySelectorAll('*')
        
        elements.forEach(element => {
          const styles = window.getComputedStyle(element)
          const fontFamily = styles.fontFamily
          if (fontFamily) {
            fontFamilies.push(fontFamily)
          }
        })
        
        return [...new Set(fontFamilies)].slice(0, 5)
      })

      // Analyze layout structure
      const layout = await page.evaluate(() => {
        const body = document.body
        const bodyStyles = window.getComputedStyle(body)
        const display = bodyStyles.display
        const gridTemplateColumns = bodyStyles.gridTemplateColumns
        
        if (gridTemplateColumns && gridTemplateColumns !== 'none') {
          return 'grid-based layout'
        } else if (display === 'flex') {
          return 'flexbox layout'
        } else {
          return 'traditional layout'
        }
      })

      return {
        colorScheme,
        fonts,
        layout,
      }
    } catch (error) {
      console.error('❌ Visual analysis failed:', error)
      return {
        colorScheme: [],
        fonts: [],
        layout: 'unknown',
      }
    }
  }

  /**
   * Extract brand visual analysis using AI
   */
  public async extractBrandVisualAnalysis(analysis: WebsiteAnalysis): Promise<BrandVisualAnalysis> {
    // This would typically use Claude Computer Use or GPT-4V to analyze the screenshot
    // For now, we'll extract what we can from the structured data
    
    const colors = analysis.visualElements.colorScheme
    const fonts = analysis.visualElements.fonts

    // Convert RGB/RGBA colors to hex (simplified)
    const hexColors = colors.map(color => {
      if (color.startsWith('#')) return color
      // For now, return default colors - in production, convert RGB to hex
      return '#2563eb'
    })

    // Extract primary brand colors (this would be AI-enhanced in production)
    const brandColors = {
      primary: hexColors[0] || '#2563eb',
      secondary: hexColors[1] || '#3b82f6', 
      accent: hexColors[2] || '#10b981',
      palette: hexColors.slice(0, 8),
    }

    // Analyze typography (simplified - would be AI-enhanced)
    const typography = {
      headingFont: fonts[0] || 'system-ui',
      bodyFont: fonts[1] || fonts[0] || 'system-ui',
      style: 'modern' as const, // Would be determined by AI analysis
    }

    // Layout analysis (simplified)
    const layout = {
      style: 'grid' as const, // Would be determined by AI analysis
      spacing: 'comfortable' as const,
    }

    // Imagery analysis (would require AI to analyze screenshots)
    const imagery = {
      style: 'photography' as const,
      quality: 'professional' as const,
    }

    const brandAnalysis: BrandVisualAnalysis = {
      colors: brandColors,
      typography,
      layout,
      imagery,
      overallTone: 'professional', // Would be determined by AI analysis
    }

    return BrandVisualAnalysisSchema.parse(brandAnalysis)
  }

  /**
   * Extract content for brand voice analysis
   */
  public extractContentForBrandAnalysis(analysis: WebsiteAnalysis): string {
    const { headings, paragraphs } = analysis.content
    const { metaDescription } = analysis.metadata
    
    let content = ''
    
    if (metaDescription) {
      content += `Meta Description: ${metaDescription}\n\n`
    }
    
    if (headings.length > 0) {
      content += `Headings:\n${headings.slice(0, 10).join('\n')}\n\n`
    }
    
    if (paragraphs.length > 0) {
      content += `Content:\n${paragraphs.slice(0, 5).join('\n\n')}`
    }
    
    return content
  }

  /**
   * Clean up browser resources
   */
  public async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      console.log('🧹 Website analyzer cleaned up')
    }
  }
}

// Export singleton instance
export const websiteAnalyzer = new AdvancedWebsiteAnalyzer()