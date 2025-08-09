// Phase 3 Content Components
export { ContentEditor } from './ContentEditor'
export { AssetApprovalSystem } from './AssetApprovalSystem'
export { RegenerationAgent } from './RegenerationAgent'
export { Phase4Dashboard } from './Phase4Dashboard'

// Phase 3 Content Generators
export { ScriptGenerator } from './ScriptGenerator'
export { EmailGenerator } from './EmailGenerator'
export { SocialMediaGenerator } from './SocialMediaGenerator'
export { Phase3Dashboard } from './Phase3Dashboard'

// Types
export interface Asset {
  id: string
  name: string
  type: 'blog' | 'social' | 'email' | 'script' | 'image' | 'video' | 'audio'
  content: string
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published'
  createdAt: Date
  updatedAt: Date
  author: string
  reviewer?: string
  reviewComments?: string[]
  version: number
}

export interface ContentVersion {
  id: string
  content: string
  timestamp: Date
  author: string
  changes: string
}

export interface RegenerationStyle {
  id: string
  name: string
  description: string
  icon: string
  prompt: string
} 