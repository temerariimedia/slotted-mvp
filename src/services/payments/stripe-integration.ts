import { z } from 'zod'

// Payment plan schemas
export const PaymentPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string().default('usd'),
  features: z.array(z.string()),
  popular: z.boolean().default(false),
  limitations: z.object({
    analysesPerMonth: z.number().optional(),
    websiteAnalysis: z.boolean(),
    aiModels: z.array(z.string()),
    exportFormats: z.array(z.string()),
  }),
})

export type PaymentPlan = z.infer<typeof PaymentPlanSchema>

// MVP #1 pricing plans
export const MVP1_PLANS: PaymentPlan[] = [
  {
    id: 'mvp1-basic',
    name: 'Basic Analysis',
    description: 'Perfect for trying out company DNA extraction',
    price: 29,
    currency: 'usd',
    features: [
      'Company profile analysis',
      'Basic brand voice detection',
      'Target audience insights',
      'JSON export',
      'Email support'
    ],
    popular: false,
    limitations: {
      analysesPerMonth: 1,
      websiteAnalysis: false,
      aiModels: ['gpt-4o'],
      exportFormats: ['json'],
    },
  },
  {
    id: 'mvp1-enhanced',
    name: 'Enhanced Analysis',
    description: 'Complete brand DNA with website analysis',
    price: 49,
    currency: 'usd',
    features: [
      'Everything in Basic',
      'Advanced website scraping',
      'Visual brand analysis (colors, fonts)',
      'Business insights extraction',
      'All AI models available',
      'Priority support'
    ],
    popular: true,
    limitations: {
      analysesPerMonth: 1,
      websiteAnalysis: true,
      aiModels: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash'],
      exportFormats: ['json', 'pdf'],
    },
  },
  {
    id: 'mvp1-bulk',
    name: 'Bulk Package',
    description: 'Best value for agencies and consultants',
    price: 199,
    currency: 'usd',
    features: [
      'Everything in Enhanced',
      '5 company analyses',
      'Bulk export capabilities',
      'White-label reports',
      'API access (coming soon)',
      'Dedicated support'
    ],
    popular: false,
    limitations: {
      analysesPerMonth: 5,
      websiteAnalysis: true,
      aiModels: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash'],
      exportFormats: ['json', 'pdf', 'csv'],
    },
  },
]

// MVP #2 pricing plans
export const MVP2_PLANS: PaymentPlan[] = [
  {
    id: 'mvp2-basic',
    name: 'Basic Calendar',
    description: 'Perfect for small businesses starting their marketing',
    price: 99,
    currency: 'usd',
    features: [
      '13-week marketing calendar',
      'Strategic campaign topics',
      'Content type recommendations',
      'Basic channel strategy',
      'CSV export',
      'Email support'
    ],
    popular: false,
    limitations: {
      analysesPerMonth: 1,
      websiteAnalysis: false,
      aiModels: ['gpt-4o'],
      exportFormats: ['csv'],
    },
  },
  {
    id: 'mvp2-enhanced',
    name: 'Enhanced Calendar',
    description: 'Complete marketing strategy with advanced planning',
    price: 199,
    currency: 'usd',
    features: [
      'Everything in Basic',
      'Company DNA integration',
      'Advanced campaign themes',
      'KPI tracking framework',
      'Channel distribution strategy',
      'All AI models available',
      'Google Sheets formatting',
      'Priority support'
    ],
    popular: true,
    limitations: {
      analysesPerMonth: 1,
      websiteAnalysis: true,
      aiModels: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash'],
      exportFormats: ['csv', 'xlsx', 'json'],
    },
  },
  {
    id: 'mvp2-agency',
    name: 'Agency Package',
    description: 'Best value for agencies and marketing teams',
    price: 499,
    currency: 'usd',
    features: [
      'Everything in Enhanced',
      '5 marketing calendars',
      'Custom focus areas',
      'Budget planning tools',
      'Quarterly strategy reports',
      'White-label exports',
      'API access (coming soon)',
      'Dedicated support'
    ],
    popular: false,
    limitations: {
      analysesPerMonth: 5,
      websiteAnalysis: true,
      aiModels: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash'],
      exportFormats: ['csv', 'xlsx', 'json', 'pdf'],
    },
  },
]

// MVP #3 pricing plans
export const MVP3_PLANS: PaymentPlan[] = [
  {
    id: 'mvp3-basic',
    name: 'Basic Blog Post',
    description: 'Professional blog content with SEO optimization',
    price: 49,
    currency: 'usd',
    features: [
      'Single 1500-2000 word blog post',
      'Basic SEO optimization',
      'Keyword integration',
      'Professional structure',
      'Markdown export',
      'Email support'
    ],
    popular: false,
    limitations: {
      analysesPerMonth: 1,
      websiteAnalysis: false,
      aiModels: ['gpt-4o'],
      exportFormats: ['markdown'],
    },
  },
  {
    id: 'mvp3-enhanced',
    name: 'Enhanced Blog Post',
    description: 'Brand-optimized content with advanced features',
    price: 99,
    currency: 'usd',
    features: [
      'Everything in Basic',
      'Company DNA brand voice integration',
      'Advanced SEO analysis',
      'Campaign calendar integration',
      'Multiple export formats',
      'Real-time editing interface',
      'Priority support'
    ],
    popular: true,
    limitations: {
      analysesPerMonth: 1,
      websiteAnalysis: true,
      aiModels: ['gpt-4o', 'claude-3-5-sonnet'],
      exportFormats: ['markdown', 'html', 'json'],
    },
  },
  {
    id: 'mvp3-content-package',
    name: 'Content Package',
    description: 'Best value for content teams and agencies',
    price: 299,
    currency: 'usd',
    features: [
      'Everything in Enhanced',
      '5 blog posts',
      'Campaign calendar integration',
      'Keyword research included',
      'White-label exports',
      'Bulk generation tools',
      'Content series planning',
      'Dedicated support'
    ],
    popular: false,
    limitations: {
      analysesPerMonth: 5,
      websiteAnalysis: true,
      aiModels: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash'],
      exportFormats: ['markdown', 'html', 'json', 'pdf'],
    },
  },
]

// Payment session schema
export const PaymentSessionSchema = z.object({
  sessionId: z.string(),
  planId: z.string(),
  customerEmail: z.string().email(),
  companyName: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  createdAt: z.string(),
  metadata: z.record(z.any()).optional(),
})

export type PaymentSession = z.infer<typeof PaymentSessionSchema>

// Mock Stripe integration (replace with real Stripe in production)
export class StripePaymentProcessor {
  private apiKey: string
  private sessions: Map<string, PaymentSession> = new Map()

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Create payment session for MVP #1
   */
  public async createPaymentSession(options: {
    planId: string
    customerEmail: string
    companyName: string
    successUrl: string
    cancelUrl: string
  }): Promise<{ sessionId: string; checkoutUrl: string }> {
    try {
      const allPlans = [...MVP1_PLANS, ...MVP2_PLANS, ...MVP3_PLANS]
      const plan = allPlans.find(p => p.id === options.planId)
      if (!plan) {
        throw new Error(`Invalid plan ID: ${options.planId}`)
      }

      // In production, this would call the real Stripe API
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const session: PaymentSession = {
        sessionId,
        planId: options.planId,
        customerEmail: options.customerEmail,
        companyName: options.companyName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        metadata: {
          plan: plan.name,
          price: plan.price,
        },
      }

      this.sessions.set(sessionId, session)

      // Mock checkout URL (replace with real Stripe checkout in production)
      const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}#fidkdWxOYHwnPyd1blppbHNgWjA0VUJfY`

      console.log(`💳 Payment session created: ${sessionId} for plan ${plan.name} ($${plan.price})`)

      return { sessionId, checkoutUrl }
    } catch (error) {
      console.error('❌ Payment session creation failed:', error)
      throw new Error(`Failed to create payment session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verify payment completion
   */
  public async verifyPayment(sessionId: string): Promise<{
    success: boolean
    planId?: string
    customerEmail?: string
    companyName?: string
  }> {
    try {
      // In production, this would verify with Stripe webhook
      const session = this.sessions.get(sessionId)
      
      if (!session) {
        return { success: false }
      }

      // Mock successful payment (in production, check actual payment status)
      session.status = 'completed'
      this.sessions.set(sessionId, session)

      console.log(`✅ Payment verified: ${sessionId}`)

      return {
        success: true,
        planId: session.planId,
        customerEmail: session.customerEmail,
        companyName: session.companyName,
      }
    } catch (error) {
      console.error('❌ Payment verification failed:', error)
      return { success: false }
    }
  }

  /**
   * Get payment session details
   */
  public getSession(sessionId: string): PaymentSession | null {
    return this.sessions.get(sessionId) || null
  }

  /**
   * Check if user has valid access to features
   */
  public hasAccess(userEmail: string, feature: string): boolean {
    // In production, this would check user's subscription status
    // For now, mock as true for development
    return true
  }
}

// Payment state management
export class PaymentStateManager {
  private purchases: Map<string, {
    email: string
    planId: string
    purchasedAt: string
    analysesUsed: number
  }> = new Map()

  /**
   * Record successful purchase
   */
  public recordPurchase(email: string, planId: string): void {
    const key = `${email}-${planId}-${Date.now()}`
    this.purchases.set(key, {
      email,
      planId,
      purchasedAt: new Date().toISOString(),
      analysesUsed: 0,
    })

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('slotted_purchases', JSON.stringify(Array.from(this.purchases.entries())))
    }
  }

  /**
   * Check remaining analyses for user
   */
  public getRemainingAnalyses(email: string): number {
    const userPurchases = Array.from(this.purchases.values())
      .filter(p => p.email === email)

    let totalRemaining = 0
    
    for (const purchase of userPurchases) {
      const allPlans = [...MVP1_PLANS, ...MVP2_PLANS, ...MVP3_PLANS]
      const plan = allPlans.find(p => p.id === purchase.planId)
      if (plan && plan.limitations.analysesPerMonth) {
        const remaining = plan.limitations.analysesPerMonth - purchase.analysesUsed
        totalRemaining += Math.max(0, remaining)
      }
    }

    return totalRemaining
  }

  /**
   * Use one analysis credit
   */
  public useAnalysisCredit(email: string): boolean {
    const remaining = this.getRemainingAnalyses(email)
    if (remaining <= 0) {
      return false
    }

    // Find the most recent purchase and increment usage
    const userPurchases = Array.from(this.purchases.entries())
      .filter(([_, p]) => p.email === email)
      .sort(([_, a], [__, b]) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())

    if (userPurchases.length > 0) {
      const [key, purchase] = userPurchases[0]
      purchase.analysesUsed += 1
      this.purchases.set(key, purchase)

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('slotted_purchases', JSON.stringify(Array.from(this.purchases.entries())))
      }
    }

    return true
  }

  /**
   * Load purchases from localStorage
   */
  public loadPurchases(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('slotted_purchases')
      if (stored) {
        try {
          const entries = JSON.parse(stored)
          this.purchases = new Map(entries)
        } catch (error) {
          console.error('Failed to load purchases:', error)
        }
      }
    }
  }
}

// Export singleton instances
export const stripeProcessor = new StripePaymentProcessor(
  process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_key'
)

export const paymentStateManager = new PaymentStateManager()

// Load existing purchases on initialization
paymentStateManager.loadPurchases()