import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json({ limit: '50mb' }))

// Simple test routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Slotted Backend API (Simple Mode)',
  })
})

// Mock campaign generation for testing
app.post('/api/campaigns/generate-topics', async (req, res) => {
  try {
    const { mcpContext, weeks = 13 } = req.body

    if (!mcpContext) {
      return res.status(400).json({ error: 'MCP context is required' })
    }

    // Generate mock topics based on company context
    const mockTopics = [
      `Introducing ${mcpContext.company.name}: Our Vision and Mission`,
      `Understanding ${mcpContext.company.industry} Trends in 2024`,
      `How ${mcpContext.company.name} Solves Common Industry Challenges`,
      `Customer Success Story: Real Results with Our Solutions`,
      `Behind the Scenes: Our Company Culture and Values`,
      `Expert Insights: Future of ${mcpContext.company.industry}`,
      `Educational Content: Best Practices for Your Business`,
      `Problem-Solution Focus: Addressing Your Pain Points`,
      `Community Building: Connecting with Industry Leaders`,
      `Data-Driven Insights: Industry Analytics and Trends`,
      `Innovation Spotlight: Our Latest Developments`,
      `Partnership Success: Collaborating for Better Results`,
      `Year-End Recap: Achievements and Future Goals`,
    ].slice(0, weeks)

    const topics = mockTopics.map((title, index) => ({
      week: index + 1,
      title,
      description: `Strategic campaign topic for week ${index + 1}`,
      primaryChannel: mcpContext.marketingGoals?.channels?.primary?.[0] || 'Blog',
      secondaryChannels: mcpContext.marketingGoals?.channels?.secondary || ['Social Media'],
      contentTypes: ['blog', 'social', 'email'],
      estimatedEffort: 6,
    }))

    res.json({
      topics,
      weeks,
      generatedAt: new Date().toISOString(),
      mcpVersion: mcpContext.metadata?.version,
      note: 'Mock data - configure AI providers for real generation',
    })
  } catch (error) {
    console.error('Failed to generate campaign topics:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate topics',
    })
  }
})

// Mock Google Workspace test
app.post('/api/google/test-connection', async (req, res) => {
  try {
    const { credentials } = req.body

    if (!credentials) {
      return res.status(400).json({ error: 'Credentials required' })
    }

    // Simple validation
    const parsed = JSON.parse(credentials)
    if (!parsed.client_email || !parsed.private_key) {
      return res.status(400).json({ error: 'Invalid credentials format' })
    }

    res.json({
      success: true,
      sheets: true,
      drive: true,
      message: 'Mock connection test successful - real Google APIs not implemented yet',
      email: parsed.client_email,
    })
  } catch (error) {
    console.error('Google Workspace test failed:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    })
  }
})

// Mock content generation
app.post('/api/content/generate-blog', async (req, res) => {
  try {
    const { mcpContext, topic, length = 2000 } = req.body

    if (!mcpContext || !topic) {
      return res.status(400).json({ error: 'MCP context and topic are required' })
    }

    const mockBlog = {
      title: `${topic} - A Deep Dive for ${mcpContext.company.name}`,
      outline: [
        'Introduction and Hook',
        'Understanding the Challenge',
        'Our Unique Approach',
        'Real-World Applications',
        'Benefits and Results',
        'Getting Started',
        'Conclusion and Next Steps',
      ],
      content: `# ${topic} - A Deep Dive for ${mcpContext.company.name}

## Introduction

In today's competitive ${mcpContext.company.industry} landscape, ${topic.toLowerCase()} has become more critical than ever. At ${mcpContext.company.name}, we understand the challenges businesses face when trying to navigate this complex area.

## Understanding the Challenge

Our target audience - ${mcpContext.brandDNA?.targetAudience?.demographics || 'business professionals'} - often struggle with:
${mcpContext.brandDNA?.targetAudience?.painPoints?.map((p: string) => `- ${p}`).join('\n') || '- Common industry challenges'}

## Our Unique Approach

What sets ${mcpContext.company.name} apart is our commitment to:
${mcpContext.brandDNA?.valuePropositions?.map((v: string) => `- ${v}`).join('\n') || '- Delivering exceptional value'}

## Real-World Applications

[This section would include specific examples and case studies relevant to ${topic}]

## Benefits and Results

Clients who work with us typically see:
- Improved efficiency and results
- Better alignment with business goals
- Reduced complexity and risk

## Getting Started

Ready to learn more about how ${mcpContext.company.name} can help with ${topic.toLowerCase()}? Contact our team today.

---

*This is a mock blog post. Configure AI providers for full content generation.*`,
      wordCount: length,
      readTime: Math.ceil(length / 200),
      seoKeywords: [topic.toLowerCase(), mcpContext.company.industry],
      metaDescription: `Learn how ${mcpContext.company.name} approaches ${topic.toLowerCase()} in the ${mcpContext.company.industry} industry.`,
    }

    res.json(mockBlog)
  } catch (error) {
    console.error('Failed to generate blog:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate blog',
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Slotted Backend (Simple Mode) running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Frontend CORS: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log('')
  console.log('🧪 TESTING MODE: Mock data will be returned')
  console.log('💡 Configure AI providers in .env for real content generation')
})
