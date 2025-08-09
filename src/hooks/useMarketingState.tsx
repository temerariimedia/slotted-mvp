/**
 * useMarketingState.tsx
 * Central state management for onboarding and marketing data
 * Features: State persistence, LocalStorage integration, Step tracking, Data validation
 */

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react'
import { 
  MarketingState, 
  MarketingContextType, 
  DEFAULT_CONTENT_SCHEDULE,
  VALIDATION_RULES,
  REQUIRED_FIELDS,
  MarketingGoalType,
  WorkType,
  MarketingTool,
  ProductService
} from '../types/marketing'

const STORAGE_KEY = 'slotted_marketing_state'
const STATE_VERSION = '1.0.0'

const initialState: MarketingState = {
  // Onboarding status
  onboardingCompleted: false,
  onboardingSkipped: false,
  lastCompletedStep: -1,
  completedSteps: [],
  
  // Company DNA
  companyName: '',
  industry: '',
  otherIndustry: '',
  companySize: '',
  refSource: '',
  workTypes: [],
  goals: [],
  currentTools: [],
  otherTools: '',
  
  // Value & Offering
  uvp: '',
  prodSvc: [], // Required: at least one product/service to continue
  offers: [], // Optional
  events: [], // Optional
  
  // Key Dates - Optional
  keyDates: [],
  
  // Content Schedule
  contentSchedule: DEFAULT_CONTENT_SCHEDULE,
  
  // Additional data
  targetAudience: {
    demographics: '',
    psychographics: '',
    painPoints: [],
    channels: []
  },
  
  brandVoice: {
    tone: [],
    style: '',
    personality: [],
    doNots: []
  },
  
  competitorInfo: {
    directCompetitors: [],
    indirectCompetitors: [],
    advantages: [],
    challenges: []
  },
  
  budgetInfo: {
    monthlyBudget: 0,
    priorities: [],
    constraints: []
  },
  
  integrations: {
    googleDrive: false,
    socialPlatforms: [],
    emailProvider: '',
    analyticsTools: []
  },
  
  validation: {
    companyInfoValid: false,
    productsValid: false,
    goalsValid: false,
    scheduleValid: false
  },
  
  // Metadata
  version: STATE_VERSION,
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
}

const MarketingContext = createContext<MarketingContextType>({
  state: initialState,
  setState: () => {},
  updateState: () => {},
  resetState: () => {},
  exportState: () => '',
  importState: () => false,
  validateState: () => false,
  getCompletionPercentage: () => 0
})

export const MarketingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setStateInternal] = useState<MarketingState>(initialState)
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Load state from localStorage on initial render
  useEffect(() => {
    const loadState = () => {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY)
        if (savedState) {
          const parsedState = JSON.parse(savedState) as MarketingState
          
          // Validate version compatibility
          if (parsedState.version !== STATE_VERSION) {
            console.warn('Marketing state version mismatch. Migrating data...')
            // Could add migration logic here if needed
          }
          
          // Merge with initialState to ensure all required fields exist
          const mergedState: MarketingState = {
            ...initialState,
            ...parsedState,
            version: STATE_VERSION,
            lastUpdated: new Date().toISOString()
          }
          
          setStateInternal(mergedState)
        }
      } catch (error) {
        console.error('Failed to parse saved marketing state:', error)
        // Fallback to initial state on parse error
        setStateInternal(initialState)
      } finally {
        setIsHydrated(true)
      }
    }
    
    loadState()
  }, [])
  
  // Save state to localStorage whenever it changes (but only after hydration)
  const saveToStorage = useCallback((newState: MarketingState) => {
    if (!isHydrated) return
    
    try {
      const stateToSave = {
        ...newState,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save marketing state to localStorage:', error)
    }
  }, [isHydrated])
  
  // Main state setter
  const setState = useCallback((newState: MarketingState) => {
    setStateInternal(newState)
    saveToStorage(newState)
  }, [saveToStorage])
  
  // Partial state updater
  const updateState = useCallback((updates: Partial<MarketingState>) => {
    const newState = { ...state, ...updates }
    setState(newState)
  }, [state, setState])
  
  // Reset state to initial values
  const resetState = useCallback(() => {
    const newState = {
      ...initialState,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
    setState(newState)
  }, [setState])
  
  // Export state as JSON string
  const exportState = useCallback(() => {
    try {
      return JSON.stringify(state, null, 2)
    } catch (error) {
      console.error('Failed to export marketing state:', error)
      return '{}'
    }
  }, [state])
  
  // Import state from JSON string
  const importState = useCallback((stateJson: string) => {
    try {
      const importedState = JSON.parse(stateJson) as MarketingState
      
      // Validate basic structure
      if (typeof importedState !== 'object' || importedState === null) {
        throw new Error('Invalid state format')
      }
      
      // Merge with current state to preserve any missing fields
      const mergedState: MarketingState = {
        ...initialState,
        ...importedState,
        version: STATE_VERSION,
        lastUpdated: new Date().toISOString()
      }
      
      setState(mergedState)
      return true
    } catch (error) {
      console.error('Failed to import marketing state:', error)
      return false
    }
  }, [setState])
  
  // Validate current state against requirements
  const validateState = useCallback(() => {
    try {
      // Basic company info validation
      const companyInfoValid = 
        VALIDATION_RULES.companyName(state.companyName) &&
        VALIDATION_RULES.industry(state.industry) &&
        VALIDATION_RULES.companySize(state.companySize)
      
      // Products/services validation
      const productsValid = VALIDATION_RULES.prodSvc(state.prodSvc)
      
      // Goals validation
      const goalsValid = VALIDATION_RULES.goals(state.goals)
      
      // Work types validation
      const workTypesValid = state.workTypes.length > 0
      
      // Update validation flags in state
      updateState({
        validation: {
          companyInfoValid,
          productsValid,
          goalsValid,
          scheduleValid: true // Content schedule is always valid with defaults
        }
      })
      
      return companyInfoValid && productsValid && goalsValid && workTypesValid
    } catch (error) {
      console.error('State validation failed:', error)
      return false
    }
  }, [state, updateState])
  
  // Calculate completion percentage
  const getCompletionPercentage = useCallback(() => {
    const checks = [
      // Basic info (25%)
      state.companyName.length >= 2,
      state.industry.length >= 2,
      state.companySize !== '',
      state.workTypes.length > 0,
      
      // Goals and tools (25%)
      state.goals.length > 0,
      state.currentTools.length > 0,
      state.refSource !== '',
      
      // Value proposition and products (25%)
      state.uvp.length >= 10,
      state.prodSvc.length > 0,
      
      // Additional data (25%)
      state.targetAudience?.demographics && state.targetAudience.demographics.length > 0,
      state.brandVoice?.tone && state.brandVoice.tone.length > 0,
      state.contentSchedule.blogPosts > 0
    ]
    
    const completedChecks = checks.filter(Boolean).length
    return Math.round((completedChecks / checks.length) * 100)
  }, [state])
  
  // Context value with all methods
  const contextValue: MarketingContextType = {
    state,
    setState,
    updateState,
    resetState,
    exportState,
    importState,
    validateState,
    getCompletionPercentage
  }
  
  // Don't render until hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return null
  }
  
  return (
    <MarketingContext.Provider value={contextValue}>
      {children}
    </MarketingContext.Provider>
  )
}

// Custom hook to use marketing state
export const useMarketingState = () => {
  const context = useContext(MarketingContext)
  
  if (!context) {
    throw new Error('useMarketingState must be used within a MarketingProvider')
  }
  
  return context
}

// Additional helper hooks for specific use cases
export const useMarketingValidation = () => {
  const { state, validateState } = useMarketingState()
  
  return {
    validation: state.validation,
    validate: validateState,
    isValid: validateState(),
    completionPercentage: state.validation ? 
      Object.values(state.validation).filter(Boolean).length / 4 * 100 : 0
  }
}

export const useMarketingPersistence = () => {
  const { exportState, importState, resetState } = useMarketingState()
  
  const downloadState = useCallback(() => {
    const stateJson = exportState()
    const blob = new Blob([stateJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `slotted-marketing-state-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }, [exportState])
  
  const uploadState = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) {
          resolve(false)
          return
        }
        
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          const success = importState(content)
          resolve(success)
        }
        reader.onerror = () => resolve(false)
        reader.readAsText(file)
      }
      
      input.click()
    })
  }, [importState])
  
  return {
    exportState,
    importState,
    resetState,
    downloadState,
    uploadState
  }
}

// Step management hook
export const useMarketingSteps = () => {
  const { state, updateState } = useMarketingState()
  
  const markStepCompleted = useCallback((stepIndex: number) => {
    const newCompletedSteps = [...new Set([...state.completedSteps, stepIndex])]
    const lastCompletedStep = Math.max(...newCompletedSteps, state.lastCompletedStep)
    
    updateState({
      completedSteps: newCompletedSteps,
      lastCompletedStep,
      lastUpdated: new Date().toISOString()
    })
  }, [state.completedSteps, state.lastCompletedStep, updateState])
  
  const markOnboardingComplete = useCallback(() => {
    updateState({
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    })
  }, [updateState])
  
  const isStepCompleted = useCallback((stepIndex: number) => {
    return state.completedSteps.includes(stepIndex)
  }, [state.completedSteps])
  
  const getNextIncompleteStep = useCallback(() => {
    // Define total number of onboarding steps
    const totalSteps = 9 // Based on ComprehensiveOnboarding
    
    for (let i = 0; i < totalSteps; i++) {
      if (!isStepCompleted(i)) {
        return i
      }
    }
    
    return -1 // All steps completed
  }, [isStepCompleted])
  
  return {
    completedSteps: state.completedSteps,
    lastCompletedStep: state.lastCompletedStep,
    onboardingCompleted: state.onboardingCompleted,
    markStepCompleted,
    markOnboardingComplete,
    isStepCompleted,
    getNextIncompleteStep,
    completionPercentage: state.completedSteps.length / 9 * 100
  }
}