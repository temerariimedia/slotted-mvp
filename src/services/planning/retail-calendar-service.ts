/**
 * Retail Calendar Integration Service
 * Integrates 4-4-5 retail calendar with marketing campaign planning
 * Provides retail-optimized scheduling and campaign generation
 */

import type { SlottedContext } from '../../schemas/slottedContext'
import { modernAIOrchestrator } from '../ai/modern-ai-orchestrator'

export interface RetailWeek {
  week: number
  startDate: string
  endDate: string
  month: string
  quarter: number
  isExtendedMonth?: boolean
}

export interface RetailCampaign {
  id: string
  title: string
  description: string
  retailWeeks: number[]
  retailMonth: string
  monthStructure: '4-week' | '5-week'
  channels: string[]
  budget: number
  campaignType: 'awareness' | 'consideration' | 'conversion' | 'retention'
  retailAdvantage: string
  shoppingBehavior: string
  kpis: string[]
  promotionalTiming: string
  yearOverYearTracking: string
  quarter: number
  year: number
  generatedAt: string
}

export interface RetailQuarter {
  quarter: number
  year: number
  theme: string
  focus: string
  retailStrategy: string
  totalWeeks: number
  extendedMonth: string
  campaigns?: RetailCampaign[]
}

export class RetailCalendarService {
  private readonly WEEKS_PER_QUARTER = 13
  private readonly STANDARD_YEAR = 2025 // Base year for calculations

  /**
   * Generate 4-4-5 retail calendar structure for a given year
   */
  generateRetailCalendar(year: number): RetailWeek[] {
    const weeks: RetailWeek[] = []
    
    // Find the first Sunday of the retail year
    // Retail year typically starts the Sunday closest to January 1
    const jan1 = new Date(year, 0, 1)
    const daysToSunday = jan1.getDay() === 0 ? 0 : 7 - jan1.getDay()
    const retailYearStart = new Date(year, 0, 1 + daysToSunday)
    
    // If the first Sunday is too late (after Jan 4), start the previous Sunday
    if (retailYearStart.getDate() > 4) {
      retailYearStart.setDate(retailYearStart.getDate() - 7)
    }

    let currentDate = new Date(retailYearStart)
    
    for (let weekNum = 1; weekNum <= 52; weekNum++) {
      const weekStart = new Date(currentDate)
      const weekEnd = new Date(currentDate)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const quarter = Math.ceil(weekNum / this.WEEKS_PER_QUARTER)
      const weekInQuarter = ((weekNum - 1) % this.WEEKS_PER_QUARTER) + 1
      
      // Determine month based on 4-4-5 structure
      let month: string
      let isExtendedMonth = false
      
      if (weekInQuarter <= 4) {
        month = this.getQuarterMonths(quarter)[0]
      } else if (weekInQuarter <= 8) {
        month = this.getQuarterMonths(quarter)[1]
      } else {
        month = this.getQuarterMonths(quarter)[2]
        isExtendedMonth = true
      }
      
      weeks.push({
        week: weekNum,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        month,
        quarter,
        isExtendedMonth
      })
      
      currentDate.setDate(currentDate.getDate() + 7)
    }
    
    return weeks
  }

  /**
   * Get month names for a quarter
   */
  private getQuarterMonths(quarter: number): [string, string, string] {
    const monthSets: Record<number, [string, string, string]> = {
      1: ['January', 'February', 'March'],
      2: ['April', 'May', 'June'],
      3: ['July', 'August', 'September'],
      4: ['October', 'November', 'December']
    }
    return monthSets[quarter]
  }

  /**
   * Generate retail-optimized campaigns using AI
   */
  async generateRetailCampaigns(
    quarter: number,
    year: number,
    context: SlottedContext
  ): Promise<RetailCampaign[]> {
    const quarterData = this.getQuarterStrategy(quarter)
    const retailWeeks = this.getQuarterWeeks(quarter)
    
    const companyContext = `
      Company: ${context.companyInfo?.companyName || context.companyName || 'Your Company'}
      Industry: ${context.companyInfo?.industry || context.industry || 'Retail'}
      Company Size: ${context.companyInfo?.size || 'medium'}
      Brand Voice: ${context.brandDNA?.brandTone?.personality?.join(', ') || 'Professional'}
      Target Audience: ${context.brandDNA?.targetAudience?.demographics || 'Consumers'}
      Available Channels: ${context.channelConfiguration?.primary?.map(c => c.name).join(', ') || 'Digital Marketing'}
      Success Metrics: ${context.successMetrics?.metrics?.slice(0, 3).map(m => m.name).join(', ') || 'Engagement, Conversions'}
    `

    const prompt = `Generate retail calendar-optimized marketing campaigns for Q${quarter} ${year} using the 4-4-5 retail calendar structure.

COMPANY CONTEXT:
${companyContext}

RETAIL CALENDAR STRATEGY FOR Q${quarter}:
- Theme: ${quarterData.theme}
- Focus: ${quarterData.focus}
- Strategy: ${quarterData.retailStrategy}
- Structure: Months 1&2 have 4 weeks each, Month 3 has 5 weeks
- Extended Month: ${quarterData.extendedMonth} (5 weeks for extended promotions)

RETAIL CALENDAR ADVANTAGES TO LEVERAGE:
1. Year-over-year comparison accuracy (same weekdays each year)
2. Extended promotional periods in 5-week months (25% more time)
3. Retail shopping pattern alignment (industry-standard timing)
4. Standardized quarterly reporting (exactly 13 weeks)
5. Commerce cycle optimization (matches retail buying patterns)

CAMPAIGN REQUIREMENTS:
- Generate 4-6 campaigns that span the quarter strategically
- Use 4-week months for awareness/education campaigns
- Use 5-week month (${quarterData.extendedMonth}) for conversion/promotional campaigns
- Align with retail shopping seasons and consumer behavior
- Include specific retail timing advantages

Generate campaigns in this JSON format:
[
  {
    "title": "Campaign Name (Retail Calendar Optimized)",
    "description": "Detailed campaign description explaining retail calendar timing and advantages",
    "retailWeeks": [1, 2, 3, 4],
    "retailMonth": "January|February|March",
    "monthStructure": "4-week|5-week",
    "channels": ["Primary marketing channels"],
    "budget": 15000,
    "campaignType": "awareness|consideration|conversion|retention",
    "retailAdvantage": "Specific advantages from using retail calendar timing",
    "shoppingBehavior": "Target consumer shopping patterns and seasonal behaviors",
    "kpis": ["Retail-focused KPIs and success metrics"],
    "promotionalTiming": "How 4-4-5 structure enhances promotional effectiveness",
    "yearOverYearTracking": "How to compare performance with previous retail periods"
  }
]

IMPORTANT: Focus on retail calendar-specific benefits like:
- Consistent YoY comparisons (same weekday patterns)
- Extended 5-week months for major promotions
- Retail industry benchmark alignment
- Shopping season synchronization
- Quarter-end conversion optimization`

    try {
      const response = await modernAIOrchestrator.generateContent({
        prompt,
        context: 'retail-calendar-campaign-generation',
        temperature: 0.7
      })

      const generatedCampaigns = JSON.parse(response.content)
      
      return generatedCampaigns.map((campaign: any, index: number): RetailCampaign => ({
        ...campaign,
        id: `retail_q${quarter}_${year}_${Date.now()}_${index}`,
        quarter,
        year,
        generatedAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error generating retail campaigns:', error)
      throw new Error('Failed to generate retail calendar campaigns')
    }
  }

  /**
   * Get strategic information for a quarter
   */
  private getQuarterStrategy(quarter: number): RetailQuarter {
    const strategies: Record<number, Omit<RetailQuarter, 'quarter' | 'year'>> = {
      1: {
        theme: 'New Year Foundation & Brand Building',
        focus: 'Leverage New Year shopping patterns and goal-setting behavior for brand establishment',
        retailStrategy: 'Use 4-4-5 structure to build awareness in January-February, convert in extended March',
        totalWeeks: 13,
        extendedMonth: 'March'
      },
      2: {
        theme: 'Spring Growth & Customer Expansion',
        focus: 'Capitalize on spring renewal and increased consumer spending for growth campaigns',
        retailStrategy: 'Build engagement through April-May, maximize conversions in extended June',
        totalWeeks: 13,
        extendedMonth: 'June'
      },
      3: {
        theme: 'Summer Peak & Back-to-School Preparation',
        focus: 'Leverage summer activities and back-to-school shopping for peak performance',
        retailStrategy: 'Drive summer engagement July-August, capture back-to-school in extended September',
        totalWeeks: 13,
        extendedMonth: 'September'
      },
      4: {
        theme: 'Holiday Shopping & Year-End Conversion',
        focus: 'Maximize holiday shopping season and year-end purchase decisions',
        retailStrategy: 'Build holiday anticipation October-November, peak conversions in extended December',
        totalWeeks: 13,
        extendedMonth: 'December'
      }
    }

    return { quarter, year: 0, ...strategies[quarter] }
  }

  /**
   * Get week numbers for a quarter
   */
  private getQuarterWeeks(quarter: number): number[] {
    const startWeek = (quarter - 1) * this.WEEKS_PER_QUARTER + 1
    return Array.from({ length: this.WEEKS_PER_QUARTER }, (_, i) => startWeek + i)
  }

  /**
   * Calculate optimal campaign timing based on retail calendar
   */
  calculateOptimalTiming(
    campaignType: RetailCampaign['campaignType'],
    quarter: number
  ): { optimalWeeks: number[], reasoning: string } {
    const quarterWeeks = this.getQuarterWeeks(quarter)
    const extendedMonthWeeks = quarterWeeks.slice(-5) // Last 5 weeks of quarter
    
    const timingStrategies = {
      awareness: {
        optimalWeeks: quarterWeeks.slice(0, 4), // First 4 weeks
        reasoning: 'Awareness campaigns benefit from consistent 4-week periods for brand building'
      },
      consideration: {
        optimalWeeks: quarterWeeks.slice(4, 8), // Middle 4 weeks
        reasoning: 'Consideration campaigns work well in the middle 4-week period for sustained engagement'
      },
      conversion: {
        optimalWeeks: extendedMonthWeeks, // Extended 5-week month
        reasoning: 'Conversion campaigns leverage the extended 5-week month for maximum promotional impact'
      },
      retention: {
        optimalWeeks: [...quarterWeeks.slice(0, 2), ...quarterWeeks.slice(-2)], // First 2 and last 2 weeks
        reasoning: 'Retention campaigns benefit from quarter bookends for consistent touchpoints'
      }
    }
    
    return timingStrategies[campaignType]
  }

  /**
   * Analyze retail calendar performance benefits
   */
  analyzeRetailPerformanceBenefits(campaigns: RetailCampaign[]): {
    yearOverYearComparison: string
    extendedMonthAdvantage: string
    shoppingAlignmentScore: number
    consistencyBenefit: string
  } {
    const extendedMonthCampaigns = campaigns.filter(c => c.monthStructure === '5-week')
    const conversionCampaigns = campaigns.filter(c => c.campaignType === 'conversion')
    
    return {
      yearOverYearComparison: `${campaigns.length} campaigns aligned to retail weeks for consistent YoY analysis`,
      extendedMonthAdvantage: `${extendedMonthCampaigns.length} campaigns leverage 5-week months for 25% extended promotional periods`,
      shoppingAlignmentScore: Math.round((conversionCampaigns.length / campaigns.length) * 100),
      consistencyBenefit: 'All campaigns follow 4-4-5 structure for standardized reporting and benchmarking'
    }
  }

  /**
   * Convert retail campaigns to standard campaign format
   */
  convertToStandardCampaigns(retailCampaigns: RetailCampaign[]): any[] {
    return retailCampaigns.map(campaign => {
      const startWeek = Math.min(...campaign.retailWeeks)
      const endWeek = Math.max(...campaign.retailWeeks)
      
      // Calculate actual dates from retail weeks
      const retailCalendar = this.generateRetailCalendar(campaign.year)
      const startDate = retailCalendar.find(w => w.week === startWeek)?.startDate
      const endDate = retailCalendar.find(w => w.week === endWeek)?.endDate
      
      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        startDate,
        endDate,
        channel: campaign.channels.join(', '),
        campaignType: campaign.campaignType,
        status: 'planned' as const,
        priority: campaign.campaignType === 'conversion' ? 'high' : 'medium',
        budget: campaign.budget,
        progress: 0,
        retailWeeks: campaign.retailWeeks,
        retailAdvantage: campaign.retailAdvantage,
        kpis: campaign.kpis
      }
    })
  }

  /**
   * Export retail calendar data
   */
  exportRetailCalendar(quarter: number, year: number, campaigns: RetailCampaign[]): string {
    const quarterData = this.getQuarterStrategy(quarter)
    const retailWeeks = this.generateRetailCalendar(year).filter(w => w.quarter === quarter)
    
    let csvContent = 'Week Number,Start Date,End Date,Month,Structure,Campaign,Budget,Type,Retail Advantage\n'
    
    retailWeeks.forEach(week => {
      const weekCampaigns = campaigns.filter(c => c.retailWeeks.includes(week.week))
      if (weekCampaigns.length > 0) {
        weekCampaigns.forEach(campaign => {
          csvContent += `${week.week},"${week.startDate}","${week.endDate}","${week.month}","${campaign.monthStructure}","${campaign.title}","$${campaign.budget}","${campaign.campaignType}","${campaign.retailAdvantage}"\n`
        })
      } else {
        csvContent += `${week.week},"${week.startDate}","${week.endDate}","${week.month}","${week.isExtendedMonth ? '5-week' : '4-week'}","","","",""\n`
      }
    })
    
    return csvContent
  }

  /**
   * Get retail calendar insights and recommendations
   */
  getRetailCalendarInsights(quarter: number, campaigns: RetailCampaign[]): {
    insights: string[]
    recommendations: string[]
    opportunities: string[]
  } {
    const quarterData = this.getQuarterStrategy(quarter)
    const extendedMonthCampaigns = campaigns.filter(c => c.monthStructure === '5-week')
    const conversionCampaigns = campaigns.filter(c => c.campaignType === 'conversion')
    
    return {
      insights: [
        `Q${quarter} follows 4-4-5 retail calendar structure with ${quarterData.extendedMonth} as the extended month`,
        `${campaigns.length} campaigns generated with retail calendar optimization`,
        `${extendedMonthCampaigns.length} campaigns leverage 5-week month advantage`,
        'Retail calendar enables consistent year-over-year performance comparison'
      ],
      recommendations: [
        `Focus conversion campaigns in ${quarterData.extendedMonth} for maximum promotional impact`,
        'Use 4-week months for sustained awareness and education campaigns',
        'Align campaign launches with retail week boundaries for industry benchmarking',
        'Leverage extended month (5 weeks) for complex campaign rollouts'
      ],
      opportunities: [
        'Extend successful campaigns into 5-week month for additional reach',
        'Use retail week alignment for competitive analysis and market positioning',
        'Implement year-over-year tracking using consistent retail week structure',
        'Optimize budget allocation using retail shopping pattern insights'
      ]
    }
  }
}

// Export singleton instance
export const retailCalendarService = new RetailCalendarService()