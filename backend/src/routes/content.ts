import express from 'express'
import { ContentOrchestrator } from '../services/ContentOrchestrator'

const router = express.Router()

// Generate blog post
router.post('/generate-blog', async (req, res) => {
  try {
    const { mcpContext, topic, length, customInstructions, aiConfig } = req.body

    if (!mcpContext || !topic) {
      return res.status(400).json({ error: 'MCP context and topic are required' })
    }

    const orchestrator = new ContentOrchestrator(aiConfig)
    const blog = await orchestrator.generateBlog(mcpContext, topic, length, customInstructions)

    res.json(blog)
  } catch (error) {
    console.error('Failed to generate blog:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate blog',
    })
  }
})

// Generate video script
router.post('/generate-video-script', async (req, res) => {
  try {
    const { mcpContext, topic, blogContent, aiConfig } = req.body

    if (!mcpContext || !topic) {
      return res.status(400).json({ error: 'MCP context and topic are required' })
    }

    const orchestrator = new ContentOrchestrator(aiConfig)
    const script = await orchestrator.generateVideoScript(mcpContext, topic, blogContent)

    res.json(script)
  } catch (error) {
    console.error('Failed to generate video script:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate video script',
    })
  }
})

// Generate social media posts
router.post('/generate-social', async (req, res) => {
  try {
    const { mcpContext, topic, platforms, aiConfig } = req.body

    if (!mcpContext || !topic) {
      return res.status(400).json({ error: 'MCP context and topic are required' })
    }

    const orchestrator = new ContentOrchestrator(aiConfig)
    const socialPosts = await orchestrator.generateSocialPosts(mcpContext, topic, platforms)

    res.json(socialPosts)
  } catch (error) {
    console.error('Failed to generate social posts:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate social posts',
    })
  }
})

// Generate email campaign
router.post('/generate-email', async (req, res) => {
  try {
    const { mcpContext, topic, type, aiConfig } = req.body

    if (!mcpContext || !topic) {
      return res.status(400).json({ error: 'MCP context and topic are required' })
    }

    const orchestrator = new ContentOrchestrator(aiConfig)
    const email = await orchestrator.generateEmail(mcpContext, topic, type)

    res.json(email)
  } catch (error) {
    console.error('Failed to generate email:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate email',
    })
  }
})

// Generate voice/audio
router.post('/generate-voice', async (req, res) => {
  try {
    const { text, voiceId, settings } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text content is required' })
    }

    const orchestrator = new ContentOrchestrator()
    const audio = await orchestrator.generateVoice(text, voiceId, settings)

    res.json(audio)
  } catch (error) {
    console.error('Failed to generate voice:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate voice',
    })
  }
})

// Generate images
router.post('/generate-images', async (req, res) => {
  try {
    const { mcpContext, topic, imageType, specifications, aiConfig } = req.body

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' })
    }

    const orchestrator = new ContentOrchestrator(aiConfig)
    const images = await orchestrator.generateImages(mcpContext, topic, imageType, specifications)

    res.json(images)
  } catch (error) {
    console.error('Failed to generate images:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate images',
    })
  }
})

// Create video from content
router.post('/create-video', async (req, res) => {
  try {
    const { script, voiceSettings, videoSettings } = req.body

    if (!script) {
      return res.status(400).json({ error: 'Script is required' })
    }

    const orchestrator = new ContentOrchestrator()
    const video = await orchestrator.createVideo(script, voiceSettings, videoSettings)

    res.json(video)
  } catch (error) {
    console.error('Failed to create video:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create video',
    })
  }
})

// Generate complete content package
router.post('/generate-package', async (req, res) => {
  try {
    const { mcpContext, topic, contentTypes, aiConfig } = req.body

    if (!mcpContext || !topic) {
      return res.status(400).json({ error: 'MCP context and topic are required' })
    }

    const orchestrator = new ContentOrchestrator(aiConfig)
    const contentPackage = await orchestrator.generateContentPackage(
      mcpContext,
      topic,
      contentTypes
    )

    res.json(contentPackage)
  } catch (error) {
    console.error('Failed to generate content package:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate content package',
    })
  }
})

export { router as contentRouter }
