import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer'
import { ChannelData } from '../types/marketing'
import { modernAIOrchestrator } from '../services/ai/modern-ai-orchestrator'

export interface KpiTarget {
  target: string
  rationale: string
  timeframe: string
}

const STORAGE_KEY = 'slotted_channel_store'

interface ChannelState {
  // Core state
  channels: ChannelData[]
  activeChannelId: string | null
  
  // Loading states
  isLoading: boolean
  isGeneratingNotes: boolean
  isGeneratingKPIs: boolean
  error: string | null
  
  // Core channel management
  addChannel: (channel: ChannelData) => void
  removeChannel: (channelId: string) => void
  updateChannel: (channelId: string, updates: Partial<ChannelData>) => void
  duplicateChannel: (channelId: string) => void
  setChannels: (channels: ChannelData[]) => void
  
  // Active channel management
  setActiveChannelId: (channelId: string | null) => void
  getChannelById: (channelId: string) => ChannelData | undefined
  getChannel: (channelId: string) => ChannelData | undefined // Alias for compatibility
  
  // Channel configuration
  setChannelPriority: (channelId: string, priority: "primary" | "secondary" | "experimental" | "") => void
  setChannelGoals: (channelId: string, goals: string[]) => void
  toggleChannelGoal: (channelId: string, goal: string) => void
  setChannelMetrics: (channelId: string, metrics: string[]) => void
  toggleChannelMetric: (channelId: string, metric: string) => void
  
  // KPI management
  setChannelKPITarget: (channelId: string, metric: string, target: string) => void
  addChannelKPI: (channelId: string, kpi: { name?: string; metric?: string; target: string; timeframe?: string }) => void
  removeChannelKPI: (channelId: string, kpiIndex: number) => void
  updateChannelKPI: (channelId: string, kpiIndex: number, updates: Partial<{ name?: string; metric?: string; target: string; timeframe?: string }>) => void
  
  // Notes and AI features
  setChannelNotes: (channelId: string, notes: string) => void
  generateChannelNotesAsync: (channelId: string, industry?: string) => Promise<void>
  
  // Integration management
  toggleChannelIntegration: (channelId: string, integrationId: string) => void
  setChannelIntegrations: (channelId: string, integrationIds: string[]) => void
  getChannelIntegrations: (channelId: string) => string[]
  
  // Bulk operations
  bulkUpdateChannelPriority: (channelIds: string[], priority: "primary" | "secondary" | "experimental" | "") => void
  bulkRemoveChannels: (channelIds: string[]) => void
  clearAllChannels: () => void
  
  // Data management
  exportChannelData: () => string
  importChannelData: (data: string) => boolean
  resetChannelStore: () => void
  
  // Loading and error management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Analytics and insights
  getChannelsByPriority: (priority: "primary" | "secondary" | "experimental") => ChannelData[]
  getChannelsWithGoal: (goal: string) => ChannelData[]
  getChannelCompletionScore: (channelId: string) => number
  getOverallCompletionScore: () => number
}

// AI-powered functions
export const generateChannelNotes = async (channelId: string): Promise<string> => {
  const store = useChannelStore.getState()
  const channel = store.getChannelById(channelId)
  
  if (!channel) return ''
  
  const prompt = `Generate strategic marketing notes for the ${channel.name} channel.
  
  Channel Details:
  - Priority: ${channel.priority}
  - Metrics: ${channel.metrics.join(', ')}
  - Current Notes: ${channel.notes || 'None'}
  
  Generate 2-3 actionable strategic recommendations for effectively using this channel, focusing on:
  1. Content strategy and messaging approach
  2. Optimization opportunities based on selected metrics
  3. Integration with other marketing channels
  
  Keep it concise and actionable (max 200 words).`

  try {
    const result = await modernAIOrchestrator.generateContent({
      prompt,
      context: 'channel-strategy',
      temperature: 0.4
    })
    return result.content
  } catch (error) {
    console.error('Failed to generate channel notes:', error)
    return 'Failed to generate AI recommendations. Please add notes manually.'
  }
}

export const generateKpiTargets = async (channelId: string): Promise<Record<string, KpiTarget>> => {
  const store = useChannelStore.getState()
  const channel = store.getChannelById(channelId)
  
  if (!channel || !channel.metrics.length) return {}
  
  const prompt = `Generate realistic KPI targets for the ${channel.name} channel (${channel.priority} priority).
  
  Metrics to target:
  ${channel.metrics.map(metric => `- ${metric}`).join('\n')}
  
  For each metric, provide:
  1. Realistic target value (industry benchmark)
  2. Brief rationale for the target
  3. Suggested timeframe
  
  Return as JSON format:
  {
    "metric_name": {
      "target": "specific target value with unit",
      "rationale": "why this target is appropriate",
      "timeframe": "suggested measurement period"
    }
  }
  
  Base targets on industry standards and channel priority level.`

  try {
    const result = await modernAIOrchestrator.generateContent({
      prompt,
      context: 'kpi-targeting',
      temperature: 0.3
    })
    return JSON.parse(result.content)
  } catch (error) {
    console.error('Failed to generate KPI targets:', error)
    return {}
  }
}

export const useChannelStore = create<ChannelState>()(
  persist(
    (set, get) => ({
      // Initial state
      channels: [],
      activeChannelId: null,
      isLoading: false,
      isGeneratingNotes: false,
      isGeneratingKPIs: false,
      error: null,

      // Core channel management
      setChannels: (channels) => set({ channels, error: null }),

      addChannel: (channel) => set(
        produce((state) => {
          // Ensure unique IDs
          const existingIds = new Set(state.channels.map((c: ChannelData) => c.id))
          let finalChannel = { ...channel }
          
          if (existingIds.has(channel.id)) {
            finalChannel.id = `${channel.id}_${Date.now()}`
          }
          
          state.channels.push(finalChannel)
          state.error = null
        })
      ),

      removeChannel: (channelId) => set(
        produce((state) => {
          state.channels = state.channels.filter((c: ChannelData) => c.id !== channelId)
          if (state.activeChannelId === channelId) {
            state.activeChannelId = null
          }
          state.error = null
        })
      ),

      updateChannel: (channelId, updates) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            Object.assign(channel, updates)
            state.error = null
          }
        })
      ),

      duplicateChannel: (channelId) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            const duplicatedChannel: ChannelData = {
              ...channel,
              id: `${channel.id}_copy_${Date.now()}`,
              name: `${channel.name} (Copy)`
            }
            state.channels.push(duplicatedChannel)
            state.error = null
          }
        })
      ),

      setActiveChannelId: (channelId) => set({ activeChannelId: channelId }),

      getChannelById: (channelId) => get().channels.find((c: ChannelData) => c.id === channelId),
      
      getChannel: (channelId) => get().channels.find((c: ChannelData) => c.id === channelId),

      // Channel configuration updates
      setChannelPriority: (channelId, priority) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            channel.priority = priority
            state.error = null
          }
        })
      ),

      setChannelGoals: (channelId, goals) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            channel.goals = goals
            state.error = null
          }
        })
      ),

      toggleChannelGoal: (channelId, goal) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            if (!Array.isArray(channel.goals)) {
              channel.goals = []
            }
            
            if (channel.goals.includes(goal)) {
              channel.goals = channel.goals.filter((g: string) => g !== goal)
            } else {
              channel.goals.push(goal)
            }
            state.error = null
          }
        })
      ),

      setChannelMetrics: (channelId, metrics) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            channel.metrics = metrics
            
            // Sync KPIs with metrics - preserve existing targets
            const existingKPIs = new Map(channel.kpis.map((k: any) => [k.metric || k.name, k]))
            
            channel.kpis = metrics.map(metric => {
              const existing = existingKPIs.get(metric)
              return existing || { 
                name: metric,
                metric,
                target: '',
                timeframe: 'monthly'
              }
            })
            
            state.error = null
          }
        })
      ),

      toggleChannelMetric: (channelId, metric) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            if (!Array.isArray(channel.metrics)) {
              channel.metrics = []
            }
            
            if (channel.metrics.includes(metric)) {
              channel.metrics = channel.metrics.filter((m: string) => m !== metric)
              // Remove associated KPI
              channel.kpis = channel.kpis.filter((k: any) => k.metric !== metric && k.name !== metric)
            } else {
              channel.metrics.push(metric)
              // Add new KPI
              channel.kpis.push({ 
                name: metric,
                metric,
                target: '',
                timeframe: 'monthly'
              })
            }
            state.error = null
          }
        })
      ),

      // KPI management
      setChannelKPITarget: (channelId, metric, target) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            const kpi = channel.kpis.find((k: any) => k.metric === metric || k.name === metric)
            if (kpi) {
              kpi.target = target
            } else {
              channel.kpis.push({ 
                name: metric,
                metric,
                target,
                timeframe: 'monthly'
              })
            }
            state.error = null
          }
        })
      ),

      addChannelKPI: (channelId, kpi) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            channel.kpis.push(kpi)
            state.error = null
          }
        })
      ),

      removeChannelKPI: (channelId, kpiIndex) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel && channel.kpis[kpiIndex]) {
            channel.kpis.splice(kpiIndex, 1)
            state.error = null
          }
        })
      ),

      updateChannelKPI: (channelId, kpiIndex, updates) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel && channel.kpis[kpiIndex]) {
            Object.assign(channel.kpis[kpiIndex], updates)
            state.error = null
          }
        })
      ),

      setChannelNotes: (channelId, notes) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            channel.notes = notes
            state.error = null
          }
        })
      ),

      generateChannelNotesAsync: async (channelId, industry = 'Marketing') => {
        const channel = get().getChannelById(channelId)
        if (!channel) return

        set({ isGeneratingNotes: true, error: null })

        try {
          const notes = await generateChannelNotes(channelId)
          get().setChannelNotes(channelId, notes)
        } catch (error) {
          console.error('Failed to generate channel notes:', error)
          set({ error: 'Failed to generate channel notes. Please try again.' })
        } finally {
          set({ isGeneratingNotes: false })
        }
      },

      // Integration management
      toggleChannelIntegration: (channelId, integrationId) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            if (!Array.isArray(channel.integrations)) {
              channel.integrations = []
            }
            
            if (channel.integrations.includes(integrationId)) {
              channel.integrations = channel.integrations.filter((id: string) => id !== integrationId)
            } else {
              channel.integrations.push(integrationId)
            }
            state.error = null
          }
        })
      ),

      setChannelIntegrations: (channelId, integrationIds) => set(
        produce((state) => {
          const channel = state.channels.find((c: ChannelData) => c.id === channelId)
          if (channel) {
            channel.integrations = integrationIds
            state.error = null
          }
        })
      ),

      getChannelIntegrations: (channelId) => {
        const channel = get().channels.find(c => c.id === channelId)
        return channel?.integrations || []
      },

      // Bulk operations
      bulkUpdateChannelPriority: (channelIds, priority) => set(
        produce((state) => {
          channelIds.forEach(channelId => {
            const channel = state.channels.find((c: ChannelData) => c.id === channelId)
            if (channel) {
              channel.priority = priority
            }
          })
          state.error = null
        })
      ),

      bulkRemoveChannels: (channelIds) => set(
        produce((state) => {
          state.channels = state.channels.filter((c: ChannelData) => !channelIds.includes(c.id))
          if (channelIds.includes(state.activeChannelId || '')) {
            state.activeChannelId = null
          }
          state.error = null
        })
      ),

      clearAllChannels: () => set({
        channels: [],
        activeChannelId: null,
        error: null
      }),

      // Data management
      exportChannelData: () => {
        try {
          return JSON.stringify(get().channels, null, 2)
        } catch (error) {
          console.error('Failed to export channel data:', error)
          return '[]'
        }
      },

      importChannelData: (data) => {
        try {
          const channels = JSON.parse(data) as ChannelData[]
          
          // Validate basic structure
          if (!Array.isArray(channels)) {
            throw new Error('Invalid channel data format')
          }
          
          // Validate each channel has required fields
          const validChannels = channels.filter(channel => 
            channel && 
            typeof channel.id === 'string' && 
            typeof channel.name === 'string'
          )
          
          set({ 
            channels: validChannels, 
            activeChannelId: null, 
            error: null 
          })
          
          return true
        } catch (error) {
          console.error('Failed to import channel data:', error)
          set({ error: 'Failed to import channel data. Please check the format.' })
          return false
        }
      },

      resetChannelStore: () => set({
        channels: [],
        activeChannelId: null,
        isLoading: false,
        isGeneratingNotes: false,
        isGeneratingKPIs: false,
        error: null
      }),

      // Loading and error management
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Analytics and insights
      getChannelsByPriority: (priority) => {
        return get().channels.filter((channel: ChannelData) => channel.priority === priority && priority !== '')
      },

      getChannelsWithGoal: (goal) => {
        return get().channels.filter((channel: ChannelData) => 
          channel.goals && channel.goals.includes(goal)
        )
      },

      getChannelCompletionScore: (channelId) => {
        const channel = get().getChannelById(channelId)
        if (!channel) return 0
        
        let score = 0
        const maxScore = 7
        
        // Basic configuration (1 point each)
        if (channel.name && channel.name.trim()) score += 1
        if (channel.priority && channel.priority !== '') score += 1
        if (channel.goals && channel.goals.length > 0) score += 1
        if (channel.metrics && channel.metrics.length > 0) score += 1
        
        // Advanced configuration (1 point each)
        if (channel.kpis && channel.kpis.some((k: any) => k.target && k.target.trim())) score += 1
        if (channel.notes && channel.notes.trim()) score += 1
        if (channel.integrations && channel.integrations.length > 0) score += 1
        
        return Math.round((score / maxScore) * 100)
      },

      getOverallCompletionScore: () => {
        const channels = get().channels
        if (channels.length === 0) return 0
        
        const totalScore = channels.reduce((sum, channel) => 
          sum + get().getChannelCompletionScore(channel.id), 0
        )
        
        return Math.round(totalScore / channels.length)
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle data migration if needed
        if (version < 1) {
          // Migration logic for version updates
          return persistedState
        }
        return persistedState
      },
      partialize: (state) => ({
        channels: state.channels,
        activeChannelId: state.activeChannelId
      })
    }
  )
)

// Enhanced helper functions for touchpoints and KPI targeting
export async function generateTouchpoints(stage: string, channelIds: string[]): Promise<string> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const store = useChannelStore.getState()
  const channelNames = channelIds.map(id => {
    const channel = store.getChannelById(id)
    return channel ? channel.name : id
  }).join(', ')
  
  // Stage-specific touchpoint generation with channel integration
  switch(stage.toLowerCase()) {
    case "awareness":
      if (channelIds.length === 0) {
        return "During the Awareness stage, potential customers first discover your brand. Focus on high-visibility touchpoints like targeted digital ads, engaging social media content, SEO-optimized blog posts, and educational webinars that highlight industry problems your product solves."
      } else {
        return `During the Awareness stage, utilize ${channelNames} to maximize brand visibility and reach. Create compelling content that addresses industry pain points, use targeted ads to reach ideal customer profiles, and optimize SEO to improve organic discovery. Focus on educational value rather than hard selling at this stage.`
      }
    
    case "consideration":
      if (channelIds.length === 0) {
        return "In the Consideration stage, prospects evaluate your solution against alternatives. Provide detailed comparison guides, case studies, product demos, email nurture sequences, and retargeting ads that emphasize your unique value proposition and differentiation."
      } else {
        return `For the Consideration stage, leverage ${channelNames} to showcase your unique value proposition. Provide detailed product information, comparison guides, case studies, and expert reviews. Implement retargeting strategies to stay top-of-mind, and offer interactive demos or free trials to help prospects evaluate your solution against alternatives.`
      }
      
    case "decision":
      if (channelIds.length === 0) {
        return "During the Decision stage, prospects are ready to purchase. Focus on removing friction with clear pricing information, limited-time offers, streamlined checkout process, personalized sales consultations, and customer testimonials that address potential objections."
      } else {
        return `At the Decision stage, use ${channelNames} to facilitate conversion and remove purchase barriers. Provide clear pricing, compelling offers, simplified checkout processes, and direct response options. Personalize outreach with sales consultations, and highlight social proof through testimonials and reviews to address final objections.`
      }
      
    case "retention":
      if (channelIds.length === 0) {
        return "The Retention stage focuses on keeping customers engaged and satisfied. Implement onboarding sequences, regular check-ins, exclusive loyalty programs, personalized recommendations, and educational resources that help customers maximize value from your product or service."
      } else {
        return `For Retention, utilize ${channelNames} to nurture ongoing relationships and maximize customer lifetime value. Implement personalized onboarding sequences, regular value-add communications, exclusive community access, and loyalty rewards. Maintain consistent touchpoints to collect feedback, solve issues proactively, and identify expansion opportunities.`
      }
      
    default:
      return `For the ${stage} stage, create targeted touchpoints across ${channelNames} that engage customers with relevant content and offers that match their current journey position.`
  }
}

// Enhanced KPI Target generation with AI integration
export async function generateKpiTargetsEnhanced(
  channelId: string, 
  industry: string = 'Marketing',
  specificMetric?: string
): Promise<Record<string, KpiTarget>> {
  const store = useChannelStore.getState()
  const channel = store.getChannelById(channelId)
  
  if (!channel || channel.metrics.length === 0) {
    return {}
  }

  store.setLoading(true)

  try {
    // Use AI orchestrator for more intelligent KPI generation
    const metricsToProcess = specificMetric 
      ? channel.metrics.filter(m => m === specificMetric) 
      : channel.metrics

    const prompt = `Generate industry-specific KPI targets for a ${channel.priority || 'standard'} priority ${channel.name} channel in the ${industry} industry.

Channel Configuration:
- Goals: ${channel.goals?.join(', ') || 'Not specified'}
- Metrics: ${metricsToProcess.join(', ')}
- Current Notes: ${channel.notes || 'None'}

For each metric, provide:
1. Realistic target value based on ${industry} industry benchmarks
2. Clear rationale explaining why this target is appropriate
3. Context about how this fits with the channel's priority level

Return as JSON object with metric names as keys and objects containing "target" and "rationale" properties.`

    const result = await modernAIOrchestrator.generateContent({
      prompt,
      context: 'kpi-targeting',
      temperature: 0.3
    })

    const aiTargets = JSON.parse(result.content)
    return aiTargets
    
  } catch (error) {
    console.error('AI KPI generation failed, using fallback:', error)
    
    // Fallback to rule-based generation
    const targets: Record<string, KpiTarget> = {}
    
    const metricsToProcess = specificMetric 
      ? channel.metrics.filter(m => m === specificMetric) 
      : channel.metrics
    
    // Simplified fallback logic
    metricsToProcess.forEach(metric => {
      targets[metric] = {
        target: 'Industry benchmark analysis needed',
        rationale: `Custom target should be set based on ${industry} sector analysis and historical performance data.`,
        timeframe: 'monthly'
      }
    })
    
    return targets
    
  } finally {
    store.setLoading(false)
  }
}

// Selector hooks for common use cases
export const useActiveChannel = () => {
  const activeChannelId = useChannelStore(state => state.activeChannelId)
  const getChannelById = useChannelStore(state => state.getChannelById)
  return activeChannelId ? getChannelById(activeChannelId) : null
}

export const useChannelsByPriority = (priority: "primary" | "secondary" | "experimental") => {
  return useChannelStore(state => state.getChannelsByPriority(priority))
}

export const useChannelCompletionStats = () => {
  const getChannelCompletionScore = useChannelStore(state => state.getChannelCompletionScore)
  const getOverallCompletionScore = useChannelStore(state => state.getOverallCompletionScore)
  const channels = useChannelStore(state => state.channels)
  
  return {
    overallScore: getOverallCompletionScore(),
    channelScores: channels.reduce((acc, channel) => ({
      ...acc,
      [channel.id]: getChannelCompletionScore(channel.id)
    }), {} as Record<string, number>),
    totalChannels: channels.length,
    completedChannels: channels.filter(channel => 
      getChannelCompletionScore(channel.id) >= 80
    ).length
  }
}

export const useChannelLoading = () => {
  return useChannelStore(state => ({
    isLoading: state.isLoading,
    isGeneratingNotes: state.isGeneratingNotes,
    isGeneratingKPIs: state.isGeneratingKPIs,
    error: state.error
  }))
}

// Bridge function to connect with marketing state
export const useChannelMarketingBridge = () => {
  const channelStore = useChannelStore()
  
  const syncChannelsToMarketingState = (marketingState: any) => {
    // Convert marketing goals to channel goals
    if (marketingState.goals) {
      channelStore.channels.forEach(channel => {
        if (channel.goals.length === 0) {
          channelStore.setChannelGoals(channel.id, marketingState.goals)
        }
      })
    }
    
    // Sync integrations
    if (marketingState.integrations) {
      const integrationIds = Object.keys(marketingState.integrations).filter(
        key => marketingState.integrations[key]
      )
      
      channelStore.channels.forEach(channel => {
        channelStore.setChannelIntegrations(channel.id, integrationIds)
      })
    }
  }
  
  const getChannelDataForMarketing = () => {
    return {
      channels: channelStore.channels,
      totalChannels: channelStore.channels.length,
      configuredChannels: channelStore.channels.filter(c => 
        channelStore.getChannelCompletionScore(c.id) >= 50
      ).length,
      primaryChannels: channelStore.getChannelsByPriority('primary'),
      overallCompletionScore: channelStore.getOverallCompletionScore()
    }
  }
  
  return {
    syncChannelsToMarketingState,
    getChannelDataForMarketing,
    ...channelStore
  }
}