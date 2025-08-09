var C = Object.defineProperty
var T = (m, e, s) =>
  e in m ? C(m, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : (m[e] = s)
var y = (m, e, s) => T(m, typeof e != 'symbol' ? e + '' : e, s)
import { r as S, e as h, o as l, s as n, a as o, n as u } from './index-x1NvUnkb.js'
const b = l({
    week: u().min(1).max(52),
    title: n(),
    description: n(),
    theme: n(),
    primaryChannel: n(),
    secondaryChannels: o(n()),
    contentTypes: o(h(['blog', 'video', 'social', 'email', 'infographic', 'case-study'])),
    keywords: o(n()),
    callToAction: n(),
    estimatedEffort: u().min(1).max(10),
    businessGoal: h(['awareness', 'engagement', 'leads', 'sales', 'retention']),
    seasonalRelevance: n().optional(),
    competitorAnalysis: n().optional(),
  }),
  k = l({
    companyName: n(),
    period: l({ startDate: n(), endDate: n(), weeks: u() }),
    strategy: l({
      overallTheme: n(),
      quarterlyFocus: o(n()),
      keyMetrics: o(n()),
      budget: n().optional(),
    }),
    campaigns: o(b),
    channelStrategy: l({
      primary: o(n()),
      secondary: o(n()),
      experimental: o(n()),
      distribution: S(u()),
    }),
    contentCalendar: l({
      sunday: o(n()),
      monday: o(n()),
      tuesday: o(n()),
      wednesday: o(n()),
      thursday: o(n()),
      friday: o(n()),
      saturday: o(n()),
    }),
    kpiTracking: l({
      metrics: o(l({ name: n(), target: u(), measurement: n() })),
      reportingSchedule: n(),
    }),
    generatedAt: n(),
    version: n(),
  })
class P {
  constructor(e) {
    y(this, 'aiOrchestrator')
    this.aiOrchestrator = e
  }
  async generateMarketingCalendar(e) {
    const s = e.weeks || 13,
      t = e.startDate || new Date(),
      r = new Date(t)
    r.setDate(t.getDate() + s * 7),
      console.log(`📅 Generating ${s}-week marketing calendar for ${e.companyDNA.company.name}`)
    try {
      const a = await this.generateCampaignTopics(e.companyDNA, s, e.focusAreas),
        i = await this.generateStrategy(e.companyDNA, a, e.budget),
        p = this.createChannelStrategy(e.companyDNA, a),
        c = this.generateContentCalendar(a, e.companyDNA),
        d = this.setupKPITracking(e.companyDNA, a),
        g = {
          companyName: e.companyDNA.company.name,
          period: { startDate: t.toISOString(), endDate: r.toISOString(), weeks: s },
          strategy: i,
          campaigns: a,
          channelStrategy: p,
          contentCalendar: c,
          kpiTracking: d,
          generatedAt: new Date().toISOString(),
          version: '2.0.0',
        }
      return k.parse(g)
    } catch (a) {
      throw (
        (console.error('❌ Marketing calendar generation failed:', a),
        new Error(
          `Failed to generate marketing calendar: ${a instanceof Error ? a.message : 'Unknown error'}`
        ))
      )
    }
  }
  async generateCampaignTopics(e, s, t) {
    const r = this.buildCampaignPrompt(e, s, t),
      a = await this.aiOrchestrator.generateContent({
        type: 'campaign-topics',
        customInstructions: r,
      })
    return this.parseCampaignTopics(a.content, s, e)
  }
  buildCampaignPrompt(e, s, t) {
    const { company: r, brandDNA: a, marketingInsights: i } = e
    return `
Generate exactly ${s} strategic marketing campaign topics for ${r.name}.

COMPANY CONTEXT:
- Industry: ${r.industry}
- Size: ${r.size}
- Value Propositions: ${a.valuePropositions.join(', ')}
- Target Audience: ${a.targetAudience.demographics}
- Pain Points: ${a.targetAudience.painPoints.join(', ')}
- Brand Voice: ${a.brandVoice.personality.join(', ')} - ${a.brandVoice.tone}

MARKETING STRATEGY:
- Competitive Advantage: ${i.competitiveAdvantage}
- Market Position: ${i.marketPosition}
- Recommended Channels: ${i.recommendedChannels.join(', ')}

${t ? `FOCUS AREAS: ${t.join(', ')}` : ''}

REQUIREMENTS:
1. Create a narrative arc across all ${s} weeks
2. Balance awareness, engagement, lead generation, and retention goals
3. Include seasonal and timely opportunities
4. Vary content types and channels strategically
5. Build momentum toward business objectives
6. Consider the target audience's journey and pain points

OUTPUT FORMAT:
Return as JSON array with this exact structure:
[
  {
    "week": 1,
    "title": "Campaign Title",
    "description": "Detailed description of campaign focus and objectives",
    "theme": "Overarching theme (e.g., Education, Problem-Solution, Social Proof)",
    "primaryChannel": "Blog",
    "secondaryChannels": ["LinkedIn", "Email"],
    "contentTypes": ["blog", "social", "email"],
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "callToAction": "Specific CTA for this campaign",
    "estimatedEffort": 7,
    "businessGoal": "awareness",
    "seasonalRelevance": "Optional seasonal context",
    "competitorAnalysis": "How this differentiates from competitors"
  }
]

Ensure each campaign builds logically on previous ones and addresses different aspects of the customer journey.
`
  }
  parseCampaignTopics(e, s, t) {
    try {
      const r = JSON.parse(e)
      if (Array.isArray(r) && r.length >= s)
        return r.slice(0, s).map((a, i) => ({ ...a, week: i + 1 }))
    } catch {
      console.warn('Failed to parse AI response, generating fallback topics')
    }
    return this.generateFallbackTopics(s, t)
  }
  generateFallbackTopics(e, s) {
    const { company: t, brandDNA: r, marketingInsights: a } = s,
      i = [
        {
          title: `Introducing ${t.name}: Our Mission and Vision`,
          theme: 'Brand Introduction',
          businessGoal: 'awareness',
        },
        {
          title: `Understanding ${r.targetAudience.demographics}: Pain Points and Solutions`,
          theme: 'Problem Identification',
          businessGoal: 'awareness',
        },
        {
          title: `${r.valuePropositions[0] || 'Our Core Value'}: Deep Dive`,
          theme: 'Value Proposition',
          businessGoal: 'engagement',
        },
        {
          title: `Industry Insights: ${t.industry} Trends and Opportunities`,
          theme: 'Thought Leadership',
          businessGoal: 'engagement',
        },
        {
          title: 'Behind the Scenes: How We Work',
          theme: 'Transparency',
          businessGoal: 'engagement',
        },
        {
          title: 'Customer Success Stories and Case Studies',
          theme: 'Social Proof',
          businessGoal: 'leads',
        },
        {
          title: `${a.competitiveAdvantage}: What Sets Us Apart`,
          theme: 'Differentiation',
          businessGoal: 'leads',
        },
        { title: 'Expert Tips and Best Practices', theme: 'Education', businessGoal: 'engagement' },
        {
          title: 'Community Spotlight and User-Generated Content',
          theme: 'Community Building',
          businessGoal: 'retention',
        },
        {
          title: 'Product Updates and New Features',
          theme: 'Product Marketing',
          businessGoal: 'retention',
        },
        {
          title: 'Data-Driven Insights and Research',
          theme: 'Thought Leadership',
          businessGoal: 'engagement',
        },
        { title: 'Future Vision and Roadmap', theme: 'Innovation', businessGoal: 'engagement' },
        {
          title: 'Year in Review and Looking Ahead',
          theme: 'Reflection',
          businessGoal: 'retention',
        },
      ]
    return Array.from({ length: e }, (p, c) => {
      var g
      const d = i[c] || i[c % i.length]
      return {
        week: c + 1,
        title: d.title,
        description: `Strategic campaign for week ${c + 1} focusing on ${d.theme.toLowerCase()}`,
        theme: d.theme,
        primaryChannel: a.recommendedChannels[0] || 'Blog',
        secondaryChannels: a.recommendedChannels.slice(1, 3) || ['Social Media'],
        contentTypes: ['blog', 'social'],
        keywords: [
          `${t.name}`,
          t.industry.toLowerCase(),
          ((g = r.valuePropositions[0]) == null ? void 0 : g.toLowerCase().split(' ')[0]) ||
            'business',
        ].filter(Boolean),
        callToAction:
          c % 4 === 0
            ? 'Contact Us'
            : c % 4 === 1
              ? 'Learn More'
              : c % 4 === 2
                ? 'Get Started'
                : 'Download Now',
        estimatedEffort: Math.floor(Math.random() * 3) + 5,
        businessGoal: d.businessGoal,
        seasonalRelevance: c % 6 === 0 ? 'Consider current season and holidays' : void 0,
      }
    })
  }
  async generateStrategy(e, s, t) {
    const r = [...new Set(s.map((a) => a.theme))]
    return (
      [...new Set(s.map((a) => a.businessGoal))],
      {
        overallTheme: `Strategic ${e.company.industry} Marketing: ${e.marketingInsights.marketPosition}`,
        quarterlyFocus: r.slice(0, 3),
        keyMetrics: [
          'Brand Awareness (Reach & Impressions)',
          'Engagement Rate (Likes, Comments, Shares)',
          'Lead Generation (Form Submissions, Downloads)',
          'Website Traffic (Sessions, Page Views)',
          'Conversion Rate (Trial-to-Paid, Contact-to-Sale)',
        ],
        budget: t || 'To be determined based on channel performance',
      }
    )
  }
  createChannelStrategy(e, s) {
    const { marketingInsights: t } = e,
      r = new Map()
    return (
      s.forEach((a) => {
        r.set(a.primaryChannel, (r.get(a.primaryChannel) || 0) + 2),
          a.secondaryChannels.forEach((i) => {
            r.set(i, (r.get(i) || 0) + 1)
          })
      }),
      {
        primary: t.recommendedChannels.slice(0, 2),
        secondary: t.recommendedChannels.slice(2, 5),
        experimental: ['TikTok', 'Podcast', 'YouTube Shorts'],
        distribution: Object.fromEntries(r),
      }
    )
  }
  generateContentCalendar(e, s) {
    return {
      sunday: ['Newsletter Planning', 'Week Prep'],
      monday: ['Blog Post Release', 'Industry News'],
      tuesday: ['Social Media Push', 'Community Engagement'],
      wednesday: ['Educational Content', 'Behind the Scenes'],
      thursday: ['Case Studies', 'Customer Spotlights'],
      friday: ['Product Updates', 'Team Highlights'],
      saturday: ['User-Generated Content', 'Community Features'],
    }
  }
  setupKPITracking(e, s) {
    return {
      metrics: [...new Set(s.map((a) => a.businessGoal))].map((a) => {
        switch (a) {
          case 'awareness':
            return { name: 'Brand Awareness', target: 1e4, measurement: 'Monthly Reach' }
          case 'engagement':
            return { name: 'Engagement Rate', target: 5, measurement: 'Percentage' }
          case 'leads':
            return { name: 'Lead Generation', target: 100, measurement: 'Monthly Leads' }
          case 'sales':
            return { name: 'Conversion Rate', target: 2, measurement: 'Percentage' }
          case 'retention':
            return { name: 'Customer Retention', target: 85, measurement: 'Percentage' }
          default:
            return { name: 'Website Traffic', target: 5e3, measurement: 'Monthly Sessions' }
        }
      }),
      reportingSchedule: 'Weekly reviews on Fridays, Monthly deep dives on first Monday',
    }
  }
  exportToGoogleSheets(e) {
    return {
      'Campaign Overview': [
        ['Week', 'Campaign Title', 'Theme', 'Primary Channel', 'Business Goal', 'Effort', 'Status'],
        ...e.campaigns.map((t) => [
          t.week,
          t.title,
          t.theme,
          t.primaryChannel,
          t.businessGoal,
          t.estimatedEffort,
          'Planned',
        ]),
      ],
      'Content Calendar': [
        ['Week', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        ...e.campaigns.map((t) => [
          `Week ${t.week}`,
          t.contentTypes.includes('blog') ? t.title : '',
          t.contentTypes.includes('social') ? 'Social Push' : '',
          'Educational Content',
          'Case Study/Customer Focus',
          'Product/Team Updates',
          'Community Content',
          'Week Planning',
        ]),
      ],
      'KPI Tracking': [
        ['Metric', 'Target', 'Current', 'Progress %', 'Notes'],
        ...e.kpiTracking.metrics.map((t) => [t.name, t.target, 0, 0, 'Track weekly']),
      ],
      'Channel Strategy': [
        ['Channel', 'Type', 'Usage Count', 'Content Types'],
        ...Object.entries(e.channelStrategy.distribution).map(([t, r]) => [
          t,
          e.channelStrategy.primary.includes(t) ? 'Primary' : 'Secondary',
          r,
          'Blog, Social, Email',
        ]),
      ],
    }
  }
}
export { P as AdvancedCampaignGenerator, b as CampaignTopicSchema, k as MarketingCalendarSchema }
//# sourceMappingURL=campaign-generator-Disw7MEQ.js.map
