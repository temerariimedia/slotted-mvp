/**
 * Campaign Integration Service
 * Integrates campaign planning with existing channel configuration and success metrics
 * Provides bidirectional sync between planning components and SlottedContext
 */

import type { SlottedContext } from '../../schemas/slottedContext'

interface Campaign {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  channel: string
  campaignType: 'product_launch' | 'awareness' | 'seasonal' | 'retention' | 'lead_generation'
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'paused'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  budget?: number
  progress: number
  milestones?: Array<{
    id: string
    title: string
    date: string
    completed: boolean
  }>
  metrics?: {
    targetReach?: number
    targetEngagement?: number
    targetConversions?: number
    actualReach?: number
    actualEngagement?: number
    actualConversions?: number
  }
}

interface CampaignPerformance {
  campaignId: string
  channelName: string
  metricsData: Array<{
    metricId: string
    metricName: string
    value: number
    target: number
    period: string
    progress: number
  }>
}

export class CampaignIntegrationService {
  /**
   * Generate campaign suggestions based on channel configuration
   */
  static generateCampaignSuggestionsFromChannels(context: SlottedContext): Partial<Campaign>[] {
    const suggestions: Partial<Campaign>[] = []
    
    if (!context.channelConfiguration?.primary) {
      return suggestions
    }

    // Generate campaigns based on configured channels
    context.channelConfiguration.primary.forEach((channel, index) => {
      const campaignType = this.mapChannelToCampaignType(channel.name)
      const priority = channel.priority
      
      suggestions.push({
        title: `${channel.name} Campaign - ${this.generateCampaignName(channel, context)}`,
        description: `Strategic ${channel.name.toLowerCase()} campaign targeting ${channel.audience}`,
        channel: channel.name,
        campaignType,
        priority,
        startDate: this.calculateOptimalStartDate(channel, index),
        endDate: this.calculateCampaignDuration(channel),
        budget: this.estimateBudget(channel, context),
        progress: 0
      })
    })

    // Add journey-based campaigns
    if (context.channelConfiguration.journeyMap) {
      const journeyStages = ['awareness', 'consideration', 'decision', 'retention'] as const
      
      journeyStages.forEach((stage) => {
        const stageChannels = context.channelConfiguration?.journeyMap[stage]
        if (stageChannels && stageChannels.length > 0) {
          suggestions.push({
            title: `${stage.charAt(0).toUpperCase() + stage.slice(1)} Campaign`,
            description: `Multi-channel ${stage} campaign across ${stageChannels.join(', ')}`,
            channel: 'Multi-channel',
            campaignType: this.mapStageToCampaignType(stage),
            priority: stage === 'awareness' || stage === 'decision' ? 'high' : 'medium',
            startDate: this.calculateStageOptimalDate(stage),
            endDate: this.calculateStageDuration(stage),
            budget: this.estimateStageBudget(stage, context)
          })
        }
      })
    }

    return suggestions
  }

  /**
   * Map channel names to campaign types
   */
  private static mapChannelToCampaignType(channelName: string): Campaign['campaignType'] {
    const channelMap: { [key: string]: Campaign['campaignType'] } = {
      'Social Media': 'awareness',
      'Email': 'retention', 
      'Content Marketing': 'awareness',
      'Paid Advertising': 'lead_generation',
      'SEO': 'awareness',
      'PR': 'awareness',
      'Events': 'lead_generation',
      'Webinars': 'lead_generation',
      'Partnerships': 'lead_generation'
    }
    
    return channelMap[channelName] || 'awareness'
  }

  /**
   * Map customer journey stages to campaign types
   */
  private static mapStageToCampaignType(stage: string): Campaign['campaignType'] {
    const stageMap: { [key: string]: Campaign['campaignType'] } = {
      'awareness': 'awareness',
      'consideration': 'awareness',
      'decision': 'lead_generation',
      'retention': 'retention'
    }
    
    return stageMap[stage] || 'awareness'
  }

  /**
   * Generate campaign names based on channel and company context
   */
  private static generateCampaignName(channel: any, context: SlottedContext): string {
    const companyName = context.companyInfo?.companyName || context.companyName || 'Company'
    const industry = context.companyInfo?.industry || context.industry || 'Business'
    
    const nameTemplates = [
      `${companyName} ${channel.name} Launch`,
      `${industry} ${channel.name} Initiative`,
      `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${channel.name} Push`,
      `${channel.name} Growth Campaign`
    ]
    
    return nameTemplates[Math.floor(Math.random() * nameTemplates.length)]
  }

  /**
   * Calculate optimal start date for campaigns
   */
  private static calculateOptimalStartDate(channel: any, index: number): string {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + (index * 7)) // Stagger campaigns weekly
    return startDate.toISOString().split('T')[0]
  }

  /**
   * Calculate campaign duration based on channel type
   */
  private static calculateCampaignDuration(channel: any): string {
    const durationDays: { [key: string]: number } = {
      'Social Media': 30,
      'Email': 14,
      'Content Marketing': 60,
      'Paid Advertising': 21,
      'SEO': 90,
      'PR': 45,
      'Events': 7,
      'Webinars': 1,
      'Partnerships': 180
    }
    
    const days = durationDays[channel.name] || 30
    const endDate = new Date(this.calculateOptimalStartDate(channel, 0))
    endDate.setDate(endDate.getDate() + days)
    
    return endDate.toISOString().split('T')[0]
  }

  /**
   * Estimate budget based on channel and company context
   */
  private static estimateBudget(channel: any, context: SlottedContext): number {
    const baseBudgets: { [key: string]: number } = {
      'Social Media': 5000,
      'Email': 2000,
      'Content Marketing': 8000,
      'Paid Advertising': 15000,
      'SEO': 10000,
      'PR': 12000,
      'Events': 25000,
      'Webinars': 3000,
      'Partnerships': 5000
    }
    
    const baseBudget = baseBudgets[channel.name] || 5000
    
    // Adjust based on company size
    const sizeMultiplier: { [key: string]: number } = {
      'startup': 0.5,
      'small': 1,
      'medium': 2,
      'enterprise': 4
    }
    
    const companySize = context.companyInfo?.size || 'small'
    const multiplier = sizeMultiplier[companySize] || 1
    
    // Adjust based on priority
    const priorityMultiplier = channel.priority === 'high' ? 1.5 : 
                              channel.priority === 'low' ? 0.7 : 1
    
    return Math.round(baseBudget * multiplier * priorityMultiplier)
  }

  /**
   * Calculate stage-specific optimal dates
   */
  private static calculateStageOptimalDate(stage: string): string {
    const stageOffsets: { [key: string]: number } = {
      'awareness': 0,      // Start immediately
      'consideration': 14,  // 2 weeks after awareness
      'decision': 28,      // 4 weeks total
      'retention': 60      // 2 months for retention
    }
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + (stageOffsets[stage] || 0))
    return startDate.toISOString().split('T')[0]
  }

  /**
   * Calculate stage-specific duration
   */
  private static calculateStageDuration(stage: string): string {
    const stageDurations: { [key: string]: number } = {
      'awareness': 30,     // 1 month
      'consideration': 21, // 3 weeks
      'decision': 14,      // 2 weeks
      'retention': 90      // 3 months
    }
    
    const days = stageDurations[stage] || 30
    const endDate = new Date(this.calculateStageOptimalDate(stage))
    endDate.setDate(endDate.getDate() + days)
    
    return endDate.toISOString().split('T')[0]
  }

  /**
   * Estimate stage-specific budget
   */
  private static estimateStageBudget(stage: string, context: SlottedContext): number {
    const stageBudgets: { [key: string]: number } = {
      'awareness': 15000,
      'consideration': 10000,
      'decision': 20000,
      'retention': 8000
    }
    
    const baseBudget = stageBudgets[stage] || 10000
    const companySize = context.companyInfo?.size || 'small'
    const sizeMultiplier: { [key: string]: number } = {
      'startup': 0.4,
      'small': 1,
      'medium': 2.5,
      'enterprise': 5
    }
    
    return Math.round(baseBudget * (sizeMultiplier[companySize] || 1))
  }

  /**
   * Link campaigns to success metrics
   */
  static linkCampaignToMetrics(campaign: Campaign, context: SlottedContext): Campaign {
    if (!context.successMetrics?.metrics) {
      return campaign
    }

    // Find relevant metrics for this campaign type and channel
    const relevantMetrics = context.successMetrics.metrics.filter(metric => {
      // Match by campaign stage
      const campaignStages = this.getCampaignStages(campaign.campaignType)
      const hasMatchingStage = metric.stages.some(stage => campaignStages.includes(stage))
      
      // Match by metric category
      const relevantCategories = this.getRelevantMetricCategories(campaign.campaignType, campaign.channel)
      const hasMatchingCategory = relevantCategories.includes(metric.category.toLowerCase())
      
      return hasMatchingStage || hasMatchingCategory
    })

    // Set campaign targets based on metrics
    const campaignMetrics = {
      targetReach: this.extractMetricTarget(relevantMetrics, ['reach', 'impressions', 'awareness']),
      targetEngagement: this.extractMetricTarget(relevantMetrics, ['engagement', 'interactions', 'clicks']),
      targetConversions: this.extractMetricTarget(relevantMetrics, ['conversions', 'leads', 'sales'])
    }

    return {
      ...campaign,
      metrics: campaignMetrics
    }
  }

  /**
   * Get campaign stages for metric matching
   */
  private static getCampaignStages(campaignType: Campaign['campaignType']): string[] {
    const stageMap: { [key: string]: string[] } = {
      'awareness': ['awareness', 'consideration'],
      'product_launch': ['awareness', 'consideration', 'decision'],
      'lead_generation': ['consideration', 'decision'],
      'retention': ['retention'],
      'seasonal': ['awareness', 'decision']
    }
    
    return stageMap[campaignType] || ['awareness']
  }

  /**
   * Get relevant metric categories for campaign
   */
  private static getRelevantMetricCategories(campaignType: string, channel: string): string[] {
    const categories = ['marketing', 'sales', 'engagement']
    
    // Add channel-specific categories
    const channelCategories: { [key: string]: string[] } = {
      'Social Media': ['social', 'engagement', 'brand'],
      'Email': ['email', 'retention'],
      'Paid Advertising': ['advertising', 'acquisition'],
      'SEO': ['organic', 'traffic'],
      'Content Marketing': ['content', 'organic']
    }
    
    return [...categories, ...(channelCategories[channel] || [])]
  }

  /**
   * Extract metric target value
   */
  private static extractMetricTarget(metrics: any[], keywords: string[]): number | undefined {
    const matchingMetric = metrics.find(metric => 
      keywords.some(keyword => 
        metric.name.toLowerCase().includes(keyword) || 
        metric.category.toLowerCase().includes(keyword)
      )
    )
    
    if (matchingMetric?.targetValue) {
      // Parse numeric value from target
      const numericValue = parseFloat(matchingMetric.targetValue.replace(/[^0-9.]/g, ''))
      return isNaN(numericValue) ? undefined : numericValue
    }
    
    return undefined
  }

  /**
   * Update campaign performance against metrics
   */
  static updateCampaignPerformance(campaign: Campaign, actualMetrics: any): CampaignPerformance {
    const performance: CampaignPerformance = {
      campaignId: campaign.id,
      channelName: campaign.channel,
      metricsData: []
    }

    if (campaign.metrics) {
      // Compare actual vs target metrics
      const metricComparisons = [
        { name: 'Reach', target: campaign.metrics.targetReach, actual: actualMetrics.reach },
        { name: 'Engagement', target: campaign.metrics.targetEngagement, actual: actualMetrics.engagement },
        { name: 'Conversions', target: campaign.metrics.targetConversions, actual: actualMetrics.conversions }
      ]

      metricComparisons.forEach((metric, index) => {
        if (metric.target && metric.actual !== undefined) {
          performance.metricsData.push({
            metricId: `metric_${index}`,
            metricName: metric.name,
            value: metric.actual,
            target: metric.target,
            period: `${campaign.startDate}_${campaign.endDate}`,
            progress: (metric.actual / metric.target) * 100
          })
        }
      })
    }

    return performance
  }

  /**
   * Generate campaign milestones based on success metrics
   */
  static generateMilestones(campaign: Campaign, context: SlottedContext): Array<{
    id: string
    title: string
    date: string
    completed: boolean
  }> {
    const milestones: Array<{ id: string; title: string; date: string; completed: boolean }> = []
    const startDate = new Date(campaign.startDate)
    const endDate = new Date(campaign.endDate)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Generate milestones based on campaign type
    const milestoneTemplates = this.getMilestoneTemplates(campaign.campaignType)
    
    milestoneTemplates.forEach((template, index) => {
      const milestoneDate = new Date(startDate)
      milestoneDate.setDate(startDate.getDate() + Math.round((totalDays / milestoneTemplates.length) * (index + 1)))
      
      milestones.push({
        id: `milestone_${campaign.id}_${index}`,
        title: template.replace('{channel}', campaign.channel),
        date: milestoneDate.toISOString().split('T')[0],
        completed: false
      })
    })

    return milestones
  }

  /**
   * Get milestone templates by campaign type
   */
  private static getMilestoneTemplates(campaignType: Campaign['campaignType']): string[] {
    const templates: { [key: string]: string[] } = {
      'awareness': [
        'Content creation completed',
        '{channel} campaign launched',
        'Mid-campaign performance review',
        'Campaign optimization implemented',
        'Final results analyzed'
      ],
      'product_launch': [
        'Pre-launch materials ready',
        'Teaser campaign activated',
        'Official launch executed',
        'Post-launch amplification',
        'Launch success evaluation'
      ],
      'lead_generation': [
        'Landing pages optimized',
        'Lead magnets deployed',
        'Campaign targeting refined',
        'Follow-up sequences activated',
        'Lead quality assessment'
      ],
      'retention': [
        'Customer segmentation completed',
        'Personalized campaigns launched',
        'Engagement tracking implemented',
        'Retention strategies optimized',
        'Loyalty program results'
      ],
      'seasonal': [
        'Seasonal content prepared',
        'Campaign timing optimized',
        'Peak season launch',
        'Performance monitoring',
        'Post-season analysis'
      ]
    }

    return templates[campaignType] || templates['awareness']
  }

  /**
   * Sync campaign results back to success metrics
   */
  static syncCampaignToMetrics(campaign: Campaign, actualResults: any, context: SlottedContext): SlottedContext {
    if (!context.successMetrics?.metrics || !campaign.metrics) {
      return context
    }

    // Update relevant metrics with campaign results
    const updatedMetrics = context.successMetrics.metrics.map(metric => {
      // Check if this metric is relevant to the campaign
      const isRelevant = this.isMetricRelevantToCampaign(metric, campaign)
      
      if (isRelevant && actualResults) {
        // Update current value based on campaign contribution
        const contribution = this.calculateMetricContribution(metric, actualResults, campaign)
        const currentValue = parseFloat(metric.currentValue || '0')
        const newValue = currentValue + contribution

        return {
          ...metric,
          currentValue: newValue.toString()
        }
      }

      return metric
    })

    return {
      ...context,
      successMetrics: {
        ...context.successMetrics,
        metrics: updatedMetrics
      }
    }
  }

  /**
   * Check if metric is relevant to campaign
   */
  private static isMetricRelevantToCampaign(metric: any, campaign: Campaign): boolean {
    const campaignStages = this.getCampaignStages(campaign.campaignType)
    const relevantCategories = this.getRelevantMetricCategories(campaign.campaignType, campaign.channel)
    
    const hasMatchingStage = metric.stages.some((stage: string) => campaignStages.includes(stage))
    const hasMatchingCategory = relevantCategories.includes(metric.category.toLowerCase())
    
    return hasMatchingStage || hasMatchingCategory
  }

  /**
   * Calculate metric contribution from campaign
   */
  private static calculateMetricContribution(metric: any, actualResults: any, campaign: Campaign): number {
    // Map actual results to metric based on metric name/category
    const metricName = metric.name.toLowerCase()
    
    if (metricName.includes('reach') || metricName.includes('impressions')) {
      return actualResults.reach || 0
    }
    
    if (metricName.includes('engagement') || metricName.includes('interaction')) {
      return actualResults.engagement || 0
    }
    
    if (metricName.includes('conversion') || metricName.includes('lead')) {
      return actualResults.conversions || 0
    }
    
    if (metricName.includes('revenue') || metricName.includes('sales')) {
      return actualResults.revenue || 0
    }
    
    // Default: use engagement as general contribution
    return actualResults.engagement || actualResults.reach || 0
  }
}

export default CampaignIntegrationService