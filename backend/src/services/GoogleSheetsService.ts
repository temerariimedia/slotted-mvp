import { google } from 'googleapis'

export interface CampaignCalendarRow {
  week: number
  date: string
  topic: string
  primaryChannel: string
  secondaryChannels: string
  contentTypes: string
  status: string
  driveFolder: string
  notes: string
}

export class GoogleSheetsService {
  private sheets: any
  private auth: any

  constructor(credentials: any) {
    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth: this.auth })
  }

  async createCampaignCalendar(
    companyName: string,
    campaigns: string[],
    mcpContext: any
  ): Promise<{ id: string; url: string }> {
    // Create new spreadsheet
    const spreadsheet = await this.sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${companyName} - 13-Week Campaign Calendar`,
        },
        sheets: [
          {
            properties: {
              title: 'Campaign Calendar',
              gridProperties: {
                rowCount: 100,
                columnCount: 20,
              },
            },
          },
          {
            properties: {
              title: 'Company Context',
            },
          },
        ],
      },
    })

    const spreadsheetId = spreadsheet.data.spreadsheetId!

    // Setup main calendar sheet
    await this.setupCalendarSheet(spreadsheetId, campaigns, mcpContext)

    // Setup context sheet
    await this.setupContextSheet(spreadsheetId, mcpContext)

    return {
      id: spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    }
  }

  private async setupCalendarSheet(
    spreadsheetId: string,
    campaigns: string[],
    mcpContext: any
  ): Promise<void> {
    const headers = [
      'Week #',
      'Start Date',
      'Campaign Topic',
      'Primary Channel',
      'Secondary Channels',
      'Content Types',
      'Status',
      'Drive Folder',
      'Blog Status',
      'Video Status',
      'Social Status',
      'Email Status',
      'Notes',
      'Performance Metrics',
    ]

    // Add headers
    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Campaign Calendar!A1:N1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    })

    // Generate calendar data
    const calendarData = this.generateCalendarData(campaigns, mcpContext)

    // Add calendar data
    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Campaign Calendar!A2:N${calendarData.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: calendarData,
      },
    })

    // Format the sheet
    await this.formatCalendarSheet(spreadsheetId)
  }

  private generateCalendarData(campaigns: string[], mcpContext: any): string[][] {
    const data: string[][] = []
    const startDate = new Date()

    // Primary and secondary channels from MCP context
    const primaryChannels = mcpContext?.marketingGoals?.channels?.primary || ['Blog']
    const secondaryChannels = mcpContext?.marketingGoals?.channels?.secondary || ['Social Media']

    campaigns.forEach((topic, index) => {
      const weekNumber = index + 1
      const weekStartDate = new Date(startDate)
      weekStartDate.setDate(startDate.getDate() + index * 7)

      const row = [
        weekNumber.toString(),
        weekStartDate.toLocaleDateString(),
        topic,
        primaryChannels[0] || 'Blog',
        secondaryChannels.join(', '),
        'Blog, Video, Social, Email',
        'Planned',
        `Week ${weekNumber.toString().padStart(2, '0')} - ${this.sanitizeTopicForFolder(topic)}`,
        'Not Started',
        'Not Started',
        'Not Started',
        'Not Started',
        '',
        '',
      ]

      data.push(row)
    })

    return data
  }

  private async setupContextSheet(spreadsheetId: string, mcpContext: any): Promise<void> {
    const contextData = [
      ['COMPANY CONTEXT'],
      [''],
      ['Company Name', mcpContext?.company?.name || ''],
      ['Industry', mcpContext?.company?.industry || ''],
      ['Company Size', mcpContext?.company?.size || ''],
      [''],
      ['BRAND DNA'],
      [''],
      ['Value Propositions', (mcpContext?.brandDNA?.valuePropositions || []).join(', ')],
      ['Target Audience', mcpContext?.brandDNA?.targetAudience?.demographics || ''],
      ['Brand Tone', (mcpContext?.brandDNA?.brandTone?.personality || []).join(', ')],
      ['Communication Style', mcpContext?.brandDNA?.brandTone?.communicationStyle || ''],
      [''],
      ['MARKETING STRATEGY'],
      [''],
      ['Content Cadence', mcpContext?.marketingGoals?.cadence || ''],
      ['Primary Channels', (mcpContext?.marketingGoals?.channels?.primary || []).join(', ')],
      ['Secondary Channels', (mcpContext?.marketingGoals?.channels?.secondary || []).join(', ')],
      ['Primary Goals', (mcpContext?.marketingGoals?.primaryGoals || []).join(', ')],
      [''],
      ['CONTENT PREFERENCES'],
      [''],
      [
        'Blog Length',
        mcpContext?.contentPreferences?.lengthPreferences?.blog?.toString() || '2000',
      ],
      [
        'Social Length',
        mcpContext?.contentPreferences?.lengthPreferences?.social?.toString() || '280',
      ],
      [
        'Email Length',
        mcpContext?.contentPreferences?.lengthPreferences?.email?.toString() || '500',
      ],
      [''],
      ['Generated on', new Date().toLocaleString()],
      ['MCP Version', mcpContext?.metadata?.version || '1.0.0'],
    ]

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Company Context!A1:B30',
      valueInputOption: 'RAW',
      requestBody: {
        values: contextData,
      },
    })
  }

  private async formatCalendarSheet(spreadsheetId: string): Promise<void> {
    const requests = [
      // Header formatting
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
              textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
            },
          },
          fields: 'userEnteredFormat',
        },
      },
      // Auto-resize columns
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 14,
          },
        },
      },
      // Freeze header row
      {
        updateSheetProperties: {
          properties: {
            sheetId: 0,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: 'gridProperties.frozenRowCount',
        },
      },
    ]

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    })
  }

  async updateCampaignStatus(
    spreadsheetId: string,
    week: number,
    column: string,
    status: string
  ): Promise<void> {
    const columnMap: Record<string, string> = {
      blog: 'I',
      video: 'J',
      social: 'K',
      email: 'L',
      overall: 'G',
    }

    const targetColumn = columnMap[column]
    if (!targetColumn) {
      throw new Error(`Invalid column: ${column}`)
    }

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Campaign Calendar!${targetColumn}${week + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    })
  }

  private sanitizeTopicForFolder(topic: string): string {
    return topic
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
  }
}
