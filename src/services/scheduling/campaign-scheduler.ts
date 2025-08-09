/**
 * Campaign Scheduler Service
 * Handles automated posting and scheduling across multiple marketing channels
 * Supports social media, email, and content publishing automation
 */

interface ScheduledPost {
  id: string
  campaignId: string
  channelType: 'social_media' | 'email' | 'blog' | 'press_release' | 'ad_campaign'
  channelId: string // e.g., 'twitter', 'facebook', 'instagram', 'linkedin'
  content: {
    title?: string
    text: string
    media?: {
      type: 'image' | 'video' | 'gif'
      url: string
      alt?: string
    }[]
    hashtags?: string[]
    mentions?: string[]
  }
  scheduledFor: string // ISO date string
  status: 'scheduled' | 'published' | 'failed' | 'cancelled'
  retryCount: number
  publishedAt?: string
  error?: string
  metrics?: {
    impressions?: number
    clicks?: number
    engagements?: number
    shares?: number
  }
}

interface CampaignSchedule {
  campaignId: string
  campaignTitle: string
  startDate: string
  endDate: string
  posts: ScheduledPost[]
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
  channels: string[]
  autoPublish: boolean
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: string
}

interface SchedulingRule {
  id: string
  name: string
  channelType: string
  daysOfWeek: number[] // 0=Sunday, 1=Monday, etc.
  timeSlots: string[] // e.g., ['09:00', '13:00', '17:00']
  timeZone: string
  maxPostsPerDay: number
  minIntervalHours: number
}

export class CampaignScheduler {
  private schedules: Map<string, CampaignSchedule> = new Map()
  private rules: SchedulingRule[] = []
  private isRunning = false
  private checkInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeDefaultRules()
    this.startScheduler()
  }

  /**
   * Initialize default scheduling rules for different platforms
   */
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'twitter-optimal',
        name: 'Twitter Optimal Times',
        channelType: 'twitter',
        daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
        timeSlots: ['09:00', '12:00', '15:00', '18:00'],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        maxPostsPerDay: 3,
        minIntervalHours: 2
      },
      {
        id: 'facebook-optimal',
        name: 'Facebook Optimal Times',
        channelType: 'facebook',
        daysOfWeek: [2, 3, 4], // Tue-Thu
        timeSlots: ['13:00', '15:00'],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        maxPostsPerDay: 1,
        minIntervalHours: 24
      },
      {
        id: 'linkedin-optimal',
        name: 'LinkedIn Business Hours',
        channelType: 'linkedin',
        daysOfWeek: [2, 3, 4], // Tue-Thu
        timeSlots: ['08:00', '12:00', '17:00'],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        maxPostsPerDay: 1,
        minIntervalHours: 24
      },
      {
        id: 'instagram-optimal',
        name: 'Instagram Peak Hours',
        channelType: 'instagram',
        daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon-Sat
        timeSlots: ['11:00', '14:00', '17:00'],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        maxPostsPerDay: 2,
        minIntervalHours: 6
      }
    ]
  }

  /**
   * Create a campaign schedule with automated posting
   */
  async createCampaignSchedule(
    campaignId: string,
    campaignTitle: string,
    startDate: string,
    endDate: string,
    channels: string[],
    content: any[],
    options: {
      frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
      autoPublish?: boolean
      requiresApproval?: boolean
    } = {}
  ): Promise<CampaignSchedule> {
    const {
      frequency = 'daily',
      autoPublish = false,
      requiresApproval = true
    } = options

    // Generate scheduled posts based on content and rules
    const posts = await this.generateScheduledPosts(
      campaignId,
      startDate,
      endDate,
      channels,
      content,
      frequency
    )

    const schedule: CampaignSchedule = {
      campaignId,
      campaignTitle,
      startDate,
      endDate,
      posts,
      frequency,
      channels,
      autoPublish,
      requiresApproval
    }

    this.schedules.set(campaignId, schedule)
    console.log(`Created schedule for campaign ${campaignId} with ${posts.length} posts`)
    
    return schedule
  }

  /**
   * Generate scheduled posts based on campaign parameters
   */
  private async generateScheduledPosts(
    campaignId: string,
    startDate: string,
    endDate: string,
    channels: string[],
    content: any[],
    frequency: string
  ): Promise<ScheduledPost[]> {
    const posts: ScheduledPost[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    for (const channel of channels) {
      const rule = this.rules.find(r => r.channelType === channel)
      if (!rule) continue

      // Calculate posting schedule based on frequency and rules
      const postingDates = this.calculatePostingDates(start, end, rule, frequency)

      for (const [index, date] of postingDates.entries()) {
        const contentIndex = index % content.length
        const postContent = content[contentIndex]

        posts.push({
          id: `${campaignId}_${channel}_${index}`,
          campaignId,
          channelType: this.mapChannelToType(channel),
          channelId: channel,
          content: {
            text: postContent.text || postContent.description || '',
            title: postContent.title,
            media: postContent.media || [],
            hashtags: postContent.hashtags || [],
            mentions: postContent.mentions || []
          },
          scheduledFor: date.toISOString(),
          status: 'scheduled',
          retryCount: 0
        })
      }
    }

    return posts.sort((a, b) => 
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    )
  }

  /**
   * Calculate optimal posting dates based on rules and frequency
   */
  private calculatePostingDates(
    startDate: Date,
    endDate: Date,
    rule: SchedulingRule,
    frequency: string
  ): Date[] {
    const dates: Date[] = []
    const current = new Date(startDate)

    while (current <= endDate) {
      // Check if current day is in allowed days of week
      if (rule.daysOfWeek.includes(current.getDay())) {
        // Add time slots for this day
        for (const timeSlot of rule.timeSlots) {
          const [hours, minutes] = timeSlot.split(':').map(Number)
          const scheduledDate = new Date(current)
          scheduledDate.setHours(hours, minutes, 0, 0)

          if (scheduledDate >= startDate && scheduledDate <= endDate) {
            dates.push(new Date(scheduledDate))
          }

          // Respect max posts per day limit
          if (dates.filter(d => d.toDateString() === current.toDateString()).length >= rule.maxPostsPerDay) {
            break
          }
        }
      }

      // Advance to next day based on frequency
      switch (frequency) {
        case 'daily':
          current.setDate(current.getDate() + 1)
          break
        case 'weekly':
          current.setDate(current.getDate() + 7)
          break
        case 'biweekly':
          current.setDate(current.getDate() + 14)
          break
        case 'monthly':
          current.setMonth(current.getMonth() + 1)
          break
        default:
          current.setDate(current.getDate() + 1)
      }
    }

    return dates
  }

  /**
   * Map channel string to channel type
   */
  private mapChannelToType(channel: string): ScheduledPost['channelType'] {
    if (['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'].includes(channel)) {
      return 'social_media'
    }
    if (channel === 'email') return 'email'
    if (channel === 'blog') return 'blog'
    if (channel === 'press') return 'press_release'
    return 'ad_campaign'
  }

  /**
   * Start the scheduler to check for posts to publish
   */
  private startScheduler(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.checkInterval = setInterval(() => {
      this.checkScheduledPosts()
    }, 60000) // Check every minute

    console.log('Campaign scheduler started')
  }

  /**
   * Stop the scheduler
   */
  stopScheduler(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    console.log('Campaign scheduler stopped')
  }

  /**
   * Check for posts that need to be published
   */
  private async checkScheduledPosts(): Promise<void> {
    const now = new Date()
    const tolerance = 2 * 60 * 1000 // 2-minute tolerance

    for (const schedule of this.schedules.values()) {
      if (!schedule.autoPublish) continue

      for (const post of schedule.posts) {
        if (post.status !== 'scheduled') continue

        const scheduledTime = new Date(post.scheduledFor).getTime()
        const currentTime = now.getTime()

        // Check if it's time to publish (within tolerance window)
        if (currentTime >= scheduledTime - tolerance && currentTime <= scheduledTime + tolerance) {
          await this.publishPost(post)
        }
      }
    }
  }

  /**
   * Publish a scheduled post
   */
  private async publishPost(post: ScheduledPost): Promise<void> {
    try {
      console.log(`Publishing post ${post.id} to ${post.channelId}`)
      
      // Update status to publishing
      post.status = 'published'
      post.publishedAt = new Date().toISOString()

      // Here you would integrate with actual social media APIs
      // For now, we'll simulate the publishing process
      await this.simulatePublish(post)

      console.log(`Successfully published post ${post.id}`)
    } catch (error) {
      console.error(`Failed to publish post ${post.id}:`, error)
      post.status = 'failed'
      post.error = error instanceof Error ? error.message : 'Unknown error'
      post.retryCount++

      // Retry failed posts (max 3 attempts)
      if (post.retryCount < 3) {
        // Schedule retry in 15 minutes
        setTimeout(() => {
          post.status = 'scheduled'
          post.scheduledFor = new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }, 1000)
      }
    }
  }

  /**
   * Simulate publishing to social media (replace with actual API calls)
   */
  private async simulatePublish(post: ScheduledPost): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simulate occasional failures (10% failure rate)
    if (Math.random() < 0.1) {
      throw new Error(`${post.channelId} API returned error 429: Rate limit exceeded`)
    }

    // Simulate metrics after publishing
    post.metrics = {
      impressions: Math.floor(Math.random() * 1000) + 100,
      clicks: Math.floor(Math.random() * 50) + 5,
      engagements: Math.floor(Math.random() * 30) + 2,
      shares: Math.floor(Math.random() * 10)
    }
  }

  /**
   * Get campaign schedule
   */
  getCampaignSchedule(campaignId: string): CampaignSchedule | undefined {
    return this.schedules.get(campaignId)
  }

  /**
   * Update post content
   */
  updatePost(postId: string, content: Partial<ScheduledPost['content']>): void {
    for (const schedule of this.schedules.values()) {
      const post = schedule.posts.find(p => p.id === postId)
      if (post && post.status === 'scheduled') {
        post.content = { ...post.content, ...content }
        console.log(`Updated post ${postId}`)
        break
      }
    }
  }

  /**
   * Cancel a scheduled post
   */
  cancelPost(postId: string): void {
    for (const schedule of this.schedules.values()) {
      const post = schedule.posts.find(p => p.id === postId)
      if (post && post.status === 'scheduled') {
        post.status = 'cancelled'
        console.log(`Cancelled post ${postId}`)
        break
      }
    }
  }

  /**
   * Reschedule a post
   */
  reschedulePost(postId: string, newDateTime: string): void {
    for (const schedule of this.schedules.values()) {
      const post = schedule.posts.find(p => p.id === postId)
      if (post && post.status === 'scheduled') {
        post.scheduledFor = newDateTime
        console.log(`Rescheduled post ${postId} to ${newDateTime}`)
        break
      }
    }
  }

  /**
   * Approve campaign for publishing
   */
  approveCampaign(campaignId: string, approvedBy: string): void {
    const schedule = this.schedules.get(campaignId)
    if (schedule && schedule.requiresApproval) {
      schedule.approvedBy = approvedBy
      schedule.approvedAt = new Date().toISOString()
      schedule.autoPublish = true
      console.log(`Campaign ${campaignId} approved for publishing by ${approvedBy}`)
    }
  }

  /**
   * Get schedule analytics
   */
  getScheduleAnalytics(campaignId: string): any {
    const schedule = this.schedules.get(campaignId)
    if (!schedule) return null

    const published = schedule.posts.filter(p => p.status === 'published')
    const failed = schedule.posts.filter(p => p.status === 'failed')
    const scheduled = schedule.posts.filter(p => p.status === 'scheduled')

    const totalMetrics = published.reduce((acc, post) => {
      if (post.metrics) {
        acc.impressions += post.metrics.impressions || 0
        acc.clicks += post.metrics.clicks || 0
        acc.engagements += post.metrics.engagements || 0
        acc.shares += post.metrics.shares || 0
      }
      return acc
    }, { impressions: 0, clicks: 0, engagements: 0, shares: 0 })

    return {
      totalPosts: schedule.posts.length,
      published: published.length,
      failed: failed.length,
      scheduled: scheduled.length,
      successRate: schedule.posts.length > 0 ? (published.length / schedule.posts.length) * 100 : 0,
      totalMetrics,
      averageMetrics: published.length > 0 ? {
        impressions: Math.round(totalMetrics.impressions / published.length),
        clicks: Math.round(totalMetrics.clicks / published.length),
        engagements: Math.round(totalMetrics.engagements / published.length),
        shares: Math.round(totalMetrics.shares / published.length)
      } : null
    }
  }

  /**
   * Add custom scheduling rule
   */
  addSchedulingRule(rule: Omit<SchedulingRule, 'id'>): void {
    const newRule: SchedulingRule = {
      ...rule,
      id: `custom_${Date.now()}`
    }
    this.rules.push(newRule)
    console.log(`Added custom scheduling rule: ${newRule.name}`)
  }

  /**
   * Get all scheduling rules
   */
  getSchedulingRules(): SchedulingRule[] {
    return [...this.rules]
  }

  /**
   * Get all campaign schedules
   */
  getAllSchedules(): CampaignSchedule[] {
    return Array.from(this.schedules.values())
  }
}

// Export singleton instance
export const campaignScheduler = new CampaignScheduler()

// Export types
export type { ScheduledPost, CampaignSchedule, SchedulingRule }