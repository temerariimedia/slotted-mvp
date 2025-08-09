/**
 * Google Calendar Service
 * Integrates marketing campaigns with Google Calendar
 * Provides two-way sync for campaign scheduling
 */

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  location?: string
  attendees?: { email: string }[]
  colorId?: string
  extendedProperties?: {
    private?: { [key: string]: string }
  }
}

interface Campaign {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  channel: string
  campaignType: string
  status: string
  priority: string
  assignee?: string
  budget?: number
  milestones?: Array<{
    id: string
    title: string
    date: string
    completed: boolean
  }>
}

export class GoogleCalendarService {
  private gapi: any = null
  private isInitialized = false
  private calendarId = 'primary' // Can be customized for dedicated marketing calendar

  constructor() {
    // Initialize Google API client
    this.initializeGoogleAPI()
  }

  /**
   * Initialize Google API and authentication
   */
  private async initializeGoogleAPI(): Promise<void> {
    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPIScript()
      }

      await new Promise((resolve) => {
        window.gapi.load('client:auth2', resolve)
      })

      // Initialize the client
      await window.gapi.client.init({
        apiKey: process.env.VITE_GOOGLE_API_KEY,
        clientId: process.env.VITE_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
      })

      this.gapi = window.gapi
      this.isInitialized = true
      console.log('Google Calendar API initialized successfully')
    } catch (error) {
      console.error('Error initializing Google Calendar API:', error)
      throw new Error('Failed to initialize Google Calendar integration')
    }
  }

  /**
   * Load Google API script dynamically
   */
  private loadGoogleAPIScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google API script'))
      document.head.appendChild(script)
    })
  }

  /**
   * Authenticate user with Google
   */
  async authenticate(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI()
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      
      if (authInstance.isSignedIn.get()) {
        return true
      }

      const result = await authInstance.signIn()
      return result.isSignedIn()
    } catch (error) {
      console.error('Authentication failed:', error)
      return false
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.isInitialized || !this.gapi) {
      return false
    }

    const authInstance = this.gapi.auth2.getAuthInstance()
    return authInstance && authInstance.isSignedIn.get()
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    if (!this.isAuthenticated()) return

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  /**
   * Sync campaign to Google Calendar
   */
  async syncCampaignToCalendar(campaign: Campaign): Promise<string | null> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated with Google Calendar')
    }

    try {
      const event: CalendarEvent = {
        id: `slotted_campaign_${campaign.id}`,
        summary: `📢 ${campaign.title}`,
        description: this.formatCampaignDescription(campaign),
        start: {
          dateTime: this.formatDateTime(campaign.startDate),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: this.formatDateTime(campaign.endDate),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        colorId: this.getCampaignColorId(campaign.campaignType),
        extendedProperties: {
          private: {
            slottedCampaignId: campaign.id,
            campaignType: campaign.campaignType,
            channel: campaign.channel,
            priority: campaign.priority,
            budget: campaign.budget?.toString() || ''
          }
        }
      }

      // Add assignee as attendee if specified
      if (campaign.assignee && campaign.assignee.includes('@')) {
        event.attendees = [{ email: campaign.assignee }]
      }

      const response = await this.gapi.client.calendar.events.insert({
        calendarId: this.calendarId,
        resource: event
      })

      console.log('Campaign synced to calendar:', response.result.id)
      return response.result.id
    } catch (error) {
      console.error('Error syncing campaign to calendar:', error)
      throw new Error('Failed to sync campaign to Google Calendar')
    }
  }

  /**
   * Sync campaign milestones to calendar
   */
  async syncMilestonesToCalendar(campaign: Campaign): Promise<string[]> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated with Google Calendar')
    }

    const eventIds: string[] = []

    try {
      for (const milestone of campaign.milestones || []) {
        const event: CalendarEvent = {
          id: `slotted_milestone_${milestone.id}`,
          summary: `🎯 ${milestone.title}`,
          description: `Milestone for campaign: ${campaign.title}\n\n${campaign.description}`,
          start: {
            dateTime: this.formatDateTime(milestone.date, '09:00'),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: this.formatDateTime(milestone.date, '10:00'),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          colorId: '5', // Yellow for milestones
          extendedProperties: {
            private: {
              slottedMilestoneId: milestone.id,
              slottedCampaignId: campaign.id,
              milestoneType: 'campaign_milestone'
            }
          }
        }

        const response = await this.gapi.client.calendar.events.insert({
          calendarId: this.calendarId,
          resource: event
        })

        eventIds.push(response.result.id)
      }

      console.log(`Synced ${eventIds.length} milestones to calendar`)
      return eventIds
    } catch (error) {
      console.error('Error syncing milestones to calendar:', error)
      throw new Error('Failed to sync milestones to Google Calendar')
    }
  }

  /**
   * Update campaign in calendar
   */
  async updateCampaignInCalendar(campaign: Campaign, calendarEventId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated with Google Calendar')
    }

    try {
      const event: CalendarEvent = {
        id: calendarEventId,
        summary: `📢 ${campaign.title}`,
        description: this.formatCampaignDescription(campaign),
        start: {
          dateTime: this.formatDateTime(campaign.startDate),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: this.formatDateTime(campaign.endDate),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        colorId: this.getCampaignColorId(campaign.campaignType)
      }

      await this.gapi.client.calendar.events.update({
        calendarId: this.calendarId,
        eventId: calendarEventId,
        resource: event
      })

      console.log('Campaign updated in calendar:', calendarEventId)
    } catch (error) {
      console.error('Error updating campaign in calendar:', error)
      throw new Error('Failed to update campaign in Google Calendar')
    }
  }

  /**
   * Delete campaign from calendar
   */
  async deleteCampaignFromCalendar(calendarEventId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated with Google Calendar')
    }

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: calendarEventId
      })

      console.log('Campaign deleted from calendar:', calendarEventId)
    } catch (error) {
      console.error('Error deleting campaign from calendar:', error)
      throw new Error('Failed to delete campaign from Google Calendar')
    }
  }

  /**
   * Get campaigns from calendar
   */
  async getCampaignsFromCalendar(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated with Google Calendar')
    }

    try {
      const params: any = {
        calendarId: this.calendarId,
        orderBy: 'startTime',
        singleEvents: true,
        q: 'slottedCampaignId' // Search for Slotted campaigns
      }

      if (startDate) {
        params.timeMin = new Date(startDate).toISOString()
      }

      if (endDate) {
        params.timeMax = new Date(endDate).toISOString()
      }

      const response = await this.gapi.client.calendar.events.list(params)
      return response.result.items || []
    } catch (error) {
      console.error('Error fetching campaigns from calendar:', error)
      throw new Error('Failed to fetch campaigns from Google Calendar')
    }
  }

  /**
   * Create a dedicated Slotted marketing calendar
   */
  async createSlottedCalendar(): Promise<string> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated with Google Calendar')
    }

    try {
      const calendar = {
        summary: 'Slotted Marketing Campaigns',
        description: 'AI-powered marketing campaign schedule managed by Slotted',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      const response = await this.gapi.client.calendar.calendars.insert({
        resource: calendar
      })

      console.log('Created Slotted calendar:', response.result.id)
      this.calendarId = response.result.id
      return response.result.id
    } catch (error) {
      console.error('Error creating Slotted calendar:', error)
      throw new Error('Failed to create Slotted marketing calendar')
    }
  }

  /**
   * Format campaign description for calendar
   */
  private formatCampaignDescription(campaign: Campaign): string {
    return `
Campaign Details:
• Type: ${campaign.campaignType.replace('_', ' ')}
• Channel: ${campaign.channel}
• Priority: ${campaign.priority.toUpperCase()}
• Status: ${campaign.status}
${campaign.budget ? `• Budget: $${campaign.budget.toLocaleString()}` : ''}
${campaign.assignee ? `• Assignee: ${campaign.assignee}` : ''}

Description:
${campaign.description}

Generated by Slotted - AI Marketing Platform
    `.trim()
  }

  /**
   * Format date and time for Google Calendar API
   */
  private formatDateTime(dateStr: string, timeStr: string = '09:00'): string {
    const date = new Date(dateStr)
    const [hours, minutes] = timeStr.split(':')
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toISOString()
  }

  /**
   * Get Google Calendar color ID based on campaign type
   */
  private getCampaignColorId(campaignType: string): string {
    const colorMap: { [key: string]: string } = {
      'product_launch': '1', // Blue
      'awareness': '2', // Green  
      'seasonal': '6', // Orange
      'retention': '3', // Purple
      'lead_generation': '4', // Red
      'default': '7' // Gray
    }

    return colorMap[campaignType] || colorMap.default
  }

  /**
   * Batch sync multiple campaigns
   */
  async batchSyncCampaigns(campaigns: Campaign[]): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [], failed: [] }

    for (const campaign of campaigns) {
      try {
        await this.syncCampaignToCalendar(campaign)
        results.success.push(campaign.id)
      } catch (error) {
        console.error(`Failed to sync campaign ${campaign.id}:`, error)
        results.failed.push(campaign.id)
      }
    }

    return results
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService()

// TypeScript declarations for Google API
declare global {
  interface Window {
    gapi: any
  }
}