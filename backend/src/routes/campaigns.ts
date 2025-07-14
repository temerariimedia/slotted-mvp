import express from 'express';
import { CampaignGenerator } from '../services/CampaignGenerator';

const router = express.Router();

// Generate 13-week campaign topics
router.post('/generate-topics', async (req, res) => {
  try {
    const { mcpContext, weeks = 13, aiConfig } = req.body;
    
    if (!mcpContext) {
      return res.status(400).json({ error: 'MCP context is required' });
    }
    
    const generator = new CampaignGenerator(aiConfig);
    const topics = await generator.generateCampaignTopics(mcpContext, weeks);
    
    res.json({ 
      topics, 
      weeks,
      generatedAt: new Date().toISOString(),
      mcpVersion: mcpContext.metadata?.version 
    });
  } catch (error) {
    console.error('Failed to generate campaign topics:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate topics'
    });
  }
});

// Generate detailed campaign plan
router.post('/generate-plan', async (req, res) => {
  try {
    const { mcpContext, topics, aiConfig } = req.body;
    
    if (!mcpContext || !topics) {
      return res.status(400).json({ error: 'MCP context and topics are required' });
    }
    
    const generator = new CampaignGenerator(aiConfig);
    const plan = await generator.generateDetailedCampaignPlan(mcpContext, topics);
    
    res.json(plan);
  } catch (error) {
    console.error('Failed to generate campaign plan:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate plan'
    });
  }
});

// Generate content for specific campaign
router.post('/generate-content', async (req, res) => {
  try {
    const { mcpContext, topic, contentTypes, aiConfig } = req.body;
    
    if (!mcpContext || !topic) {
      return res.status(400).json({ error: 'MCP context and topic are required' });
    }
    
    const generator = new CampaignGenerator(aiConfig);
    const content = await generator.generateCampaignContent(mcpContext, topic, contentTypes);
    
    res.json(content);
  } catch (error) {
    console.error('Failed to generate campaign content:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate content'
    });
  }
});

// Create channel matrix
router.post('/channel-matrix', async (req, res) => {
  try {
    const { mcpContext, topics } = req.body;
    
    if (!mcpContext) {
      return res.status(400).json({ error: 'MCP context is required' });
    }
    
    const generator = new CampaignGenerator();
    const matrix = await generator.createChannelMatrix(mcpContext, topics);
    
    res.json(matrix);
  } catch (error) {
    console.error('Failed to create channel matrix:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create channel matrix'
    });
  }
});

// Simulate persona engagement
router.post('/simulate-engagement', async (req, res) => {
  try {
    const { mcpContext, campaignContent, aiConfig } = req.body;
    
    if (!mcpContext || !campaignContent) {
      return res.status(400).json({ error: 'MCP context and campaign content are required' });
    }
    
    const generator = new CampaignGenerator(aiConfig);
    const simulation = await generator.simulatePersonaEngagement(mcpContext, campaignContent);
    
    res.json(simulation);
  } catch (error) {
    console.error('Failed to simulate engagement:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to simulate engagement'
    });
  }
});

export { router as campaignRouter };