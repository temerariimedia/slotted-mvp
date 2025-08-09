export interface ChannelData {
  id: string
  name: string
  priority: 'primary' | 'secondary' | 'experimental' | ''
  goals: string[]
  metrics: string[]
  kpis: Array<{
    name?: string
    metric?: string
    target: string
    timeframe?: string
  }>
  notes: string
  integrations: string[]
}

export interface ChannelOption {
  id: string
  name: string
  description: string
  metrics: string[]
  recommendedStages?: string[]
}

export interface ChannelCategory {
  name: string
  description: string
  icon: React.ReactNode
  options: ChannelOption[]
  tooltips: Record<string, string>
}

export interface MarketingGoal {
  id: string
  name: string
  description: string
  category: string
}

export interface MarketingMetric {
  id: string
  name: string
  description: string
  unit: string
}

// Additional types for useMarketingState hook
export interface ContentSchedule {
  blogPosts: number
  videos: number
  socialPosts: number
  emailNewsletters: number
  textMessages: number
}

export interface KeyDate {
  id: string
  name: string
  date: string
  description?: string
  type: 'launch' | 'campaign' | 'event' | 'deadline' | 'seasonal'
  priority: 'high' | 'medium' | 'low'
  recurring?: boolean
  reminderDays?: number
}

export interface ProductService {
  id: string
  name: string
  description: string
  category: string
  price?: number
  target?: string
  features?: string[]
}

export interface Offer {
  id: string
  title: string
  description: string
  type: 'discount' | 'bundle' | 'trial' | 'bonus' | 'seasonal'
  value: string
  validFrom?: string
  validTo?: string
  conditions?: string[]
}

export interface Event {
  id: string
  name: string
  type: 'webinar' | 'workshop' | 'conference' | 'launch' | 'sale' | 'other'
  date: string
  duration?: string
  description?: string
  target?: string
  registration?: string
}

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
export type WorkType = 'b2b' | 'b2c' | 'nonprofit' | 'agency' | 'consultant' | 'ecommerce' | 'saas' | 'other'
export type MarketingGoalType = 'awareness' | 'leads' | 'sales' | 'retention' | 'engagement' | 'traffic' | 'other'
export type MarketingTool = 'email' | 'social' | 'content' | 'seo' | 'ads' | 'analytics' | 'crm' | 'automation' | 'other'
export type RefSource = 'search' | 'social' | 'referral' | 'advertising' | 'direct' | 'other'

export interface MarketingState {
  // Onboarding status
  onboardingCompleted: boolean
  onboardingSkipped: boolean
  lastCompletedStep: number
  completedSteps: number[]
  onboardingStartedAt?: string
  onboardingCompletedAt?: string
  
  // Company DNA
  companyName: string
  industry: string
  otherIndustry: string
  companySize: CompanySize | ''
  refSource: RefSource | ''
  workTypes: WorkType[]
  goals: MarketingGoalType[]
  currentTools: MarketingTool[]
  otherTools: string
  website?: string
  
  // Value & Offering
  uvp: string // Unique Value Proposition
  prodSvc: ProductService[] // Required: at least one product/service to continue
  offers: Offer[] // Optional promotional offers
  events: Event[] // Optional events
  
  // Key Dates - Optional but valuable for planning
  keyDates: KeyDate[]
  
  // Content Schedule preferences
  contentSchedule: ContentSchedule
  
  // Additional marketing data
  targetAudience?: {
    demographics?: string
    psychographics?: string
    painPoints?: string[]
    channels?: string[]
  }
  
  brandVoice?: {
    tone: string[]
    style: string
    personality: string[]
    doNots: string[]
  }
  
  competitorInfo?: {
    directCompetitors: string[]
    indirectCompetitors: string[]
    advantages: string[]
    challenges: string[]
  }
  
  budgetInfo?: {
    monthlyBudget: number
    priorities: string[]
    constraints: string[]
  }
  
  // Integration status
  integrations?: {
    googleDrive?: boolean
    socialPlatforms?: string[]
    emailProvider?: string
    analyticsTools?: string[]
  }
  
  // Validation flags
  validation?: {
    companyInfoValid: boolean
    productsValid: boolean
    goalsValid: boolean
    scheduleValid: boolean
  }
  
  // Metadata
  version?: string
  lastUpdated?: string
  createdAt?: string
}

export interface MarketingContextType {
  state: MarketingState
  setState: (state: MarketingState) => void
  updateState: (updates: Partial<MarketingState>) => void
  resetState: () => void
  exportState: () => string
  importState: (stateJson: string) => boolean
  validateState: () => boolean
  getCompletionPercentage: () => number
}

// Validation schemas
export const REQUIRED_FIELDS = {
  basic: ['companyName', 'industry', 'companySize'],
  products: ['prodSvc'], // Must have at least one product/service
  goals: ['goals'], // Must have at least one goal
  schedule: ['contentSchedule']
} as const

export const VALIDATION_RULES = {
  companyName: (value: string) => value.length >= 2,
  industry: (value: string) => value.length >= 2,
  companySize: (value: string) => ['startup', 'small', 'medium', 'large', 'enterprise'].includes(value),
  prodSvc: (value: ProductService[]) => value.length >= 1,
  goals: (value: MarketingGoalType[]) => value.length >= 1,
  uvp: (value: string) => value.length >= 10,
  workTypes: (value: WorkType[]) => value.length >= 1
} as const

// Default states for different stages
export const DEFAULT_CONTENT_SCHEDULE: ContentSchedule = {
  blogPosts: 1,
  videos: 1,
  socialPosts: 3,
  emailNewsletters: 1,
  textMessages: 2
}

// Helper functions
export const createEmptyKeyDate = (): KeyDate => ({
  id: `date_${Date.now()}`,
  name: '',
  date: '',
  type: 'event',
  priority: 'medium'
})

export const createEmptyProductService = (): ProductService => ({
  id: `product_${Date.now()}`,
  name: '',
  description: '',
  category: ''
})

export const createEmptyOffer = (): Offer => ({
  id: `offer_${Date.now()}`,
  title: '',
  description: '',
  type: 'discount',
  value: ''
})

export const createEmptyEvent = (): Event => ({
  id: `event_${Date.now()}`,
  name: '',
  type: 'webinar',
  date: ''
})