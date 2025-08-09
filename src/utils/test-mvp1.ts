/**
 * Test script for MVP #1 (Company DNA Extractor)
 * This file helps validate the complete functionality
 */

import {
  type AIConfig,
  type CompanyDNA,
  modernAIOrchestrator,
} from '../services/ai/modern-ai-orchestrator'
import { modernMCPEngine } from '../services/mcp/modern-mcp-server'
import { enhancedWebsiteAnalyzer } from '../services/web-automation/enhanced-website-analyzer'

// Test configuration
const TEST_CONFIG: AIConfig = {
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  apiKey: process.env.VITE_ANTHROPIC_API_KEY || '',
  temperature: 0.7,
  maxTokens: 4000,
}

const TEST_COMPANIES = [
  {
    name: 'OpenAI',
    website: 'https://openai.com',
    industry: 'Artificial Intelligence',
    description: 'AI research and deployment company',
  },
  {
    name: 'Anthropic',
    website: 'https://anthropic.com',
    industry: 'AI Safety',
    description: 'AI safety company focused on beneficial AI',
  },
  {
    name: 'Vercel',
    website: 'https://vercel.com',
    industry: 'Developer Tools',
    description: 'Frontend cloud platform for developers',
  },
]

export class MVP1Tester {
  private testResults: Array<{
    company: string
    success: boolean
    duration: number
    confidence: number
    error?: string
    dna?: CompanyDNA
  }> = []

  /**
   * Run comprehensive MVP #1 tests
   */
  public async runTests(): Promise<void> {
    console.log('🧪 Starting MVP #1 comprehensive tests...')

    // Validate environment
    if (!this.validateEnvironment()) {
      console.error('❌ Environment validation failed')
      return
    }

    // Test AI orchestrator configuration
    await this.testAIConfiguration()

    // Test website analyzer
    await this.testWebsiteAnalyzer()

    // Test MCP engine
    await this.testMCPEngine()

    // Test end-to-end company DNA extraction
    await this.testCompanyDNAExtraction()

    // Generate test report
    this.generateTestReport()
  }

  /**
   * Validate test environment
   */
  private validateEnvironment(): boolean {
    console.log('🔍 Validating test environment...')

    const requiredEnvVars = [
      'VITE_ANTHROPIC_API_KEY',
      // Add other required env vars as needed
    ]

    const missing = requiredEnvVars.filter((key) => !process.env[key])

    if (missing.length > 0) {
      console.error(`❌ Missing environment variables: ${missing.join(', ')}`)
      return false
    }

    console.log('✅ Environment validation passed')
    return true
  }

  /**
   * Test AI orchestrator configuration
   */
  private async testAIConfiguration(): Promise<void> {
    console.log('🤖 Testing AI orchestrator configuration...')

    try {
      modernAIOrchestrator.configureProvider(TEST_CONFIG)

      if (!modernAIOrchestrator.isConfigured()) {
        throw new Error('AI orchestrator not configured properly')
      }

      const providers = modernAIOrchestrator.getConfiguredProviders()
      console.log(`✅ AI orchestrator configured with providers: ${providers.join(', ')}`)
    } catch (error) {
      console.error('❌ AI configuration test failed:', error)
      throw error
    }
  }

  /**
   * Test enhanced website analyzer
   */
  private async testWebsiteAnalyzer(): Promise<void> {
    console.log('🌐 Testing enhanced website analyzer...')

    try {
      await enhancedWebsiteAnalyzer.initialize()

      // Test with a simple, reliable website
      const testUrl = 'https://example.com'
      const analysis = await enhancedWebsiteAnalyzer.analyzeWebsite(testUrl)

      if (!analysis.title || !analysis.url) {
        throw new Error('Website analysis missing required fields')
      }

      console.log(`✅ Website analyzer test passed - analyzed ${testUrl}`)
      console.log(`   Title: ${analysis.title}`)
      console.log(`   Performance: ${analysis.technicalDetails.performance.loadTime}ms`)

      await enhancedWebsiteAnalyzer.cleanup()
    } catch (error) {
      console.error('❌ Website analyzer test failed:', error)
      await enhancedWebsiteAnalyzer.cleanup()
      throw error
    }
  }

  /**
   * Test MCP engine functionality
   */
  private async testMCPEngine(): Promise<void> {
    console.log('🔧 Testing MCP engine...')

    try {
      // Test context loading (should return null for new installation)
      const existingContext = await modernMCPEngine.loadContext()
      console.log(`   Existing context: ${existingContext ? 'Found' : 'None'}`)

      // Test tools and resources
      const tools = modernMCPEngine.getTools()
      const resources = modernMCPEngine.getResources()

      console.log(`✅ MCP engine test passed`)
      console.log(`   Available tools: ${tools.length}`)
      console.log(`   Available resources: ${resources.length}`)
    } catch (error) {
      console.error('❌ MCP engine test failed:', error)
      throw error
    }
  }

  /**
   * Test end-to-end company DNA extraction
   */
  private async testCompanyDNAExtraction(): Promise<void> {
    console.log('🧬 Testing end-to-end company DNA extraction...')

    for (const company of TEST_COMPANIES.slice(0, 1)) {
      // Test with first company only
      const startTime = Date.now()

      try {
        console.log(`   Extracting DNA for: ${company.name}`)

        const dna = await modernAIOrchestrator.extractCompanyDNA({
          companyName: company.name,
          website: company.website,
          industry: company.industry,
          description: company.description,
        })

        const duration = Date.now() - startTime

        // Validate DNA structure
        if (!dna.company.name || !dna.brandDNA || !dna.metadata) {
          throw new Error('Invalid DNA structure returned')
        }

        this.testResults.push({
          company: company.name,
          success: true,
          duration,
          confidence: dna.metadata.confidenceScore,
          dna,
        })

        console.log(`✅ DNA extraction successful for ${company.name}`)
        console.log(`   Duration: ${duration}ms`)
        console.log(`   Confidence: ${Math.round(dna.metadata.confidenceScore * 100)}%`)
        console.log(`   Value props: ${dna.brandDNA.valuePropositions.length}`)
      } catch (error) {
        const duration = Date.now() - startTime

        this.testResults.push({
          company: company.name,
          success: false,
          duration,
          confidence: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        console.error(`❌ DNA extraction failed for ${company.name}:`, error)
      }
    }
  }

  /**
   * Generate comprehensive test report
   */
  private generateTestReport(): void {
    console.log('\n📊 MVP #1 Test Report')
    console.log('================================')

    const totalTests = this.testResults.length
    const successfulTests = this.testResults.filter((r) => r.success).length
    const failedTests = totalTests - successfulTests

    console.log(`Total tests: ${totalTests}`)
    console.log(`Successful: ${successfulTests}`)
    console.log(`Failed: ${failedTests}`)
    console.log(
      `Success rate: ${totalTests > 0 ? Math.round((successfulTests / totalTests) * 100) : 0}%`
    )

    if (this.testResults.length > 0) {
      console.log('\nDetailed Results:')
      this.testResults.forEach((result) => {
        const status = result.success ? '✅' : '❌'
        console.log(`${status} ${result.company}`)
        console.log(`   Duration: ${result.duration}ms`)
        if (result.success) {
          console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`)
          console.log(`   Website analyzed: ${result.dna?.metadata.websiteAnalyzed ? 'Yes' : 'No'}`)
        } else {
          console.log(`   Error: ${result.error}`)
        }
        console.log('')
      })
    }

    // Overall assessment
    if (successfulTests === totalTests && totalTests > 0) {
      console.log('🎉 All tests passed! MVP #1 is ready for production.')
    } else if (successfulTests > 0) {
      console.log('⚠️  Some tests passed. Review failed tests before deployment.')
    } else {
      console.log('🚨 All tests failed. Major issues need to be resolved.')
    }
  }

  /**
   * Export test results as JSON
   */
  public exportResults(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        testSuite: 'MVP #1 - Company DNA Extractor',
        version: '2.0.0',
        results: this.testResults,
        summary: {
          total: this.testResults.length,
          successful: this.testResults.filter((r) => r.success).length,
          failed: this.testResults.filter((r) => !r.success).length,
          averageDuration:
            this.testResults.reduce((sum, r) => sum + r.duration, 0) / this.testResults.length,
          averageConfidence:
            this.testResults.filter((r) => r.success).reduce((sum, r) => sum + r.confidence, 0) /
            this.testResults.filter((r) => r.success).length,
        },
      },
      null,
      2
    )
  }
}

// Export test runner for use in development
export const testMVP1 = async () => {
  const tester = new MVP1Tester()
  await tester.runTests()
  return tester.exportResults()
}

// For browser console testing
if (typeof window !== 'undefined') {
  ;(window as any).testMVP1 = testMVP1
}
