const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Slotted Test Backend' 
  });
});

app.post('/api/campaigns/generate-topics', (req, res) => {
  const { mcpContext, weeks = 13 } = req.body;
  
  if (!mcpContext) {
    return res.status(400).json({ error: 'MCP context is required' });
  }

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
  ].slice(0, weeks);

  const topics = mockTopics.map((title, index) => ({
    week: index + 1,
    title,
    description: `Strategic campaign topic for week ${index + 1}`,
    primaryChannel: mcpContext.marketingGoals?.channels?.primary?.[0] || 'Blog',
    secondaryChannels: mcpContext.marketingGoals?.channels?.secondary || ['Social Media'],
    contentTypes: ['blog', 'social', 'email'],
    estimatedEffort: 6,
  }));

  res.json({ 
    topics, 
    weeks,
    generatedAt: new Date().toISOString(),
    mcpVersion: mcpContext.metadata?.version,
    note: 'Mock campaign topics generated successfully!'
  });
});

app.post('/api/google/test-connection', (req, res) => {
  const { credentials } = req.body;
  
  if (!credentials) {
    return res.status(400).json({ error: 'Credentials required' });
  }

  try {
    const parsed = JSON.parse(credentials);
    res.json({ 
      success: true, 
      sheets: true, 
      drive: true,
      message: 'Mock connection test successful!',
      email: parsed.client_email
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: 'Invalid credentials format'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test Backend running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log('🧪 Ready for testing campaign generation!');
});