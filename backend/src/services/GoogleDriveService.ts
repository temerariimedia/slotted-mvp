import { google } from 'googleapis'

export interface DriveFolder {
  id: string
  name: string
  parentId?: string
  webViewLink: string
  createdTime: string
}

export interface CampaignFolderStructure {
  campaignRoot: DriveFolder
  subfolders: {
    blog: DriveFolder
    video: DriveFolder
    graphics: DriveFolder
    social: DriveFolder
    email: DriveFolder
    assets: DriveFolder
  }
}

export class GoogleDriveService {
  private drive: any
  private auth: any

  constructor(credentials: any) {
    if (!credentials) {
      throw new Error('Google Drive credentials are required')
    }

    try {
      this.auth = new google.auth.GoogleAuth({
        credentials: typeof credentials === 'string' ? JSON.parse(credentials) : credentials,
        scopes: ['https://www.googleapis.com/auth/drive'],
      })

      this.drive = google.drive({ version: 'v3', auth: this.auth })
    } catch (error) {
      throw new Error(
        `Failed to initialize Google Drive service: ${error instanceof Error ? error.message : 'Invalid credentials'}`
      )
    }
  }

  async createFolder(name: string, parentId?: string): Promise<DriveFolder> {
    try {
      const fileMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      }

      const response = await this.executeWithRetry(async () => {
        return await this.drive.files.create({
          requestBody: fileMetadata,
          fields: 'id,name,parents,webViewLink,createdTime',
        })
      })

      return {
        id: response.data.id,
        name: response.data.name,
        parentId: parentId,
        webViewLink: response.data.webViewLink,
        createdTime: response.data.createdTime,
      }
    } catch (error) {
      throw new Error(
        `Failed to create folder "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async createCompanyRootFolder(companyName: string): Promise<DriveFolder> {
    const sanitizedName = `${companyName} - Slotted Marketing Hub`
    return this.createFolder(sanitizedName)
  }

  async createCampaignFolders(
    companyName: string,
    campaignName: string,
    parentFolderId?: string
  ): Promise<CampaignFolderStructure> {
    // Create campaign root folder
    const campaignRoot = await this.createFolder(campaignName, parentFolderId)

    // Create subfolders
    const subfolderNames = [
      'Blog Posts',
      'Video Content',
      'Graphics & Visuals',
      'Social Media',
      'Email Templates',
      'Raw Assets',
    ]

    const subfolders = {} as CampaignFolderStructure['subfolders']

    for (const folderName of subfolderNames) {
      const folder = await this.createFolder(folderName, campaignRoot.id)

      // Map to our interface keys
      const key = folderName
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .replace('rawassets', 'assets') as keyof CampaignFolderStructure['subfolders']
      const mappedKey = this.mapFolderKey(folderName)
      subfolders[mappedKey] = folder
    }

    return {
      campaignRoot,
      subfolders,
    }
  }

  private mapFolderKey(folderName: string): keyof CampaignFolderStructure['subfolders'] {
    const mapping: Record<string, keyof CampaignFolderStructure['subfolders']> = {
      'Blog Posts': 'blog',
      'Video Content': 'video',
      'Graphics & Visuals': 'graphics',
      'Social Media': 'social',
      'Email Templates': 'email',
      'Raw Assets': 'assets',
    }

    return mapping[folderName] || 'assets'
  }

  async uploadFile(
    folderId: string,
    fileName: string,
    content: string,
    mimeType: string
  ): Promise<{ id: string; webViewLink: string }> {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    }

    let media
    if (content.startsWith('data:')) {
      // Handle base64 content
      const base64Data = content.split(',')[1]
      media = {
        mimeType,
        body: Buffer.from(base64Data, 'base64'),
      }
    } else {
      // Handle text content
      media = {
        mimeType,
        body: content,
      }
    }

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id,webViewLink',
    })

    return {
      id: response.data.id,
      webViewLink: response.data.webViewLink,
    }
  }

  async shareFolder(folderId: string, email?: string): Promise<void> {
    const permission = {
      type: email ? 'user' : 'anyone',
      role: 'reader',
      emailAddress: email,
    }

    await this.drive.permissions.create({
      fileId: folderId,
      requestBody: permission,
    })
  }

  generateCampaignFolderName(campaignTopic: string, weekNumber: number): string {
    const sanitized = campaignTopic
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()

    return `Week ${weekNumber.toString().padStart(2, '0')} - ${sanitized}`
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        // If it's a quota error, wait longer
        if (lastError.message.includes('quota') || lastError.message.includes('rate')) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
          console.log(`Rate limit hit, waiting ${delay}ms before retry ${attempt}/${maxRetries}`)
          await this.sleep(delay)
          continue
        }

        // If it's not a retryable error, fail immediately
        if (lastError.message.includes('permission') || lastError.message.includes('auth')) {
          throw lastError
        }

        // For other errors, retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = 1000 * attempt
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
          await this.sleep(delay)
        }
      }
    }

    throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError!.message}`)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async checkFolderExists(name: string, parentId?: string): Promise<DriveFolder | null> {
    try {
      const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
      const queryWithParent = parentId ? `${query} and '${parentId}' in parents` : query

      const response = await this.executeWithRetry(async () => {
        return await this.drive.files.list({
          q: queryWithParent,
          fields: 'files(id,name,parents,webViewLink,createdTime)',
        })
      })

      const folder = response.data.files?.[0]
      if (folder) {
        return {
          id: folder.id,
          name: folder.name,
          parentId: parentId,
          webViewLink: folder.webViewLink,
          createdTime: folder.createdTime,
        }
      }

      return null
    } catch (error) {
      console.error(`Error checking if folder "${name}" exists:`, error)
      return null
    }
  }
}
