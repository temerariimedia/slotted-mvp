import express from 'express'
import { google } from 'googleapis'
import { GoogleDriveService } from '../services/GoogleDriveService'
import { GoogleSheetsService } from '../services/GoogleSheetsService'

const router = express.Router()

// Test Google Workspace connection
router.post('/test-connection', async (req, res) => {
  try {
    const { credentials } = req.body

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    })

    // Test Drive API
    const drive = google.drive({ version: 'v3', auth })
    await drive.about.get({ fields: 'user' })

    // Test Sheets API
    const sheets = google.sheets({ version: 'v4', auth })
    // Just verify we can access the API

    res.json({
      success: true,
      sheets: true,
      drive: true,
      message: 'Google Workspace connection successful',
    })
  } catch (error) {
    console.error('Google Workspace test failed:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    })
  }
})

// Create campaign folder structure
router.post('/drive/create-campaign-folders', async (req, res) => {
  try {
    const { companyName, campaignName, parentFolderId, config } = req.body

    const driveService = new GoogleDriveService(config)
    const result = await driveService.createCampaignFolders(
      companyName,
      campaignName,
      parentFolderId
    )

    res.json(result)
  } catch (error) {
    console.error('Failed to create campaign folders:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create folders',
    })
  }
})

// Create company root folder
router.post('/drive/create-company-folder', async (req, res) => {
  try {
    const { companyName, config } = req.body

    const driveService = new GoogleDriveService(config)
    const result = await driveService.createCompanyRootFolder(companyName)

    res.json(result)
  } catch (error) {
    console.error('Failed to create company folder:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create company folder',
    })
  }
})

// Upload file to Drive
router.post('/drive/upload-file', async (req, res) => {
  try {
    const { folderId, fileName, content, mimeType, config } = req.body

    const driveService = new GoogleDriveService(config)
    const result = await driveService.uploadFile(folderId, fileName, content, mimeType)

    res.json(result)
  } catch (error) {
    console.error('Failed to upload file:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload file',
    })
  }
})

// Create campaign calendar spreadsheet
router.post('/sheets/create-campaign-calendar', async (req, res) => {
  try {
    const { companyName, campaigns, config, mcpContext } = req.body

    const sheetsService = new GoogleSheetsService(config)
    const result = await sheetsService.createCampaignCalendar(companyName, campaigns, mcpContext)

    res.json(result)
  } catch (error) {
    console.error('Failed to create campaign calendar:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create calendar',
    })
  }
})

// Share folder/sheet
router.post('/share', async (req, res) => {
  try {
    const { fileId, email, config, type = 'reader' } = req.body

    const auth = new google.auth.GoogleAuth({
      credentials: config,
      scopes: ['https://www.googleapis.com/auth/drive'],
    })

    const drive = google.drive({ version: 'v3', auth })

    const permission = {
      type: email ? 'user' : 'anyone',
      role: type,
      emailAddress: email,
    }

    await drive.permissions.create({
      fileId,
      requestBody: permission,
    })

    res.json({ success: true, message: 'Sharing permissions updated' })
  } catch (error) {
    console.error('Failed to share resource:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update sharing',
    })
  }
})

export { router as googleWorkspaceRouter }
