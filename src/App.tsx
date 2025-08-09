import type React from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CompanyDNAExtractor } from './components/mvp1/CompanyDNAExtractor'
import { MarketingCalendarGenerator } from './components/mvp2/MarketingCalendarGenerator'
// import MarketingPlanner from './components/planning/MarketingPlanner'
import { OnboardingWizard } from './components/onboarding/OnboardingWizard'
import { SlottedContextProvider } from './contexts/SlottedContext'
import type { CompanyDNA } from './services/ai/modern-ai-orchestrator'
import type { MarketingCalendar } from './services/campaigns/campaign-generator'
import type { SlottedContext } from './schemas/slottedContext'
import { modernMCPEngine } from './services/mcp/modern-mcp-server'

// App state interface
interface AppState {
  currentView: 'welcome' | 'onboarding' | 'landing' | 'mvp1' | 'mvp2' | 'mvp3' | 'mvp4' | 'mvp5' | 'complete'
  slottedContext: SlottedContext | null
  companyDNA: CompanyDNA | null
  marketingCalendar: MarketingCalendar | null
  userEmail: string
  isLoading: boolean
}

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'welcome',
    slottedContext: null,
    companyDNA: null,
    marketingCalendar: null,
    userEmail: '',
    isLoading: true,
  })

  // Load existing context on startup
  useEffect(() => {
    const loadContext = async () => {
      try {
        const context = await modernMCPEngine.loadContext()
        setAppState((prev) => ({
          ...prev,
          companyDNA: context,
          isLoading: false,
        }))
      } catch (error) {
        console.error('Failed to load context:', error)
        setAppState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    loadContext()
  }, [])

  // Subscribe to context changes
  useEffect(() => {
    const unsubscribe = modernMCPEngine.subscribe((context) => {
      setAppState((prev) => ({
        ...prev,
        companyDNA: context,
      }))
    })

    return unsubscribe
  }, [])

  if (appState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Slotted...</p>
        </div>
      </div>
    )
  }

  // Enhanced onboarding complete handler
  const handleOnboardingComplete = (context: SlottedContext) => {
    setAppState(prev => ({
      ...prev,
      slottedContext: context,
      currentView: context.currentPhase || 'mvp1'
    }))
  }

  // Render different views based on current state
  return (
    <SlottedContextProvider>
      <div className="App">
        {(() => {
          switch (appState.currentView) {
            case 'welcome':
              return (
                <OnboardingWizard onComplete={handleOnboardingComplete} />
              )

            case 'onboarding':
              return (
                <OnboardingWizard onComplete={handleOnboardingComplete} />
              )

            case 'mvp1':
              return <CompanyDNAExtractor />

            case 'mvp2':
              return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                  <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                          </svg>
                          Back to Home
                        </button>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">S</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">Slotted</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <MarketingCalendarGenerator
                    companyDNA={appState.companyDNA}
                    userEmail={appState.userEmail}
                    onCalendarGenerated={(calendar) => {
                      setAppState((prev) => ({ ...prev, marketingCalendar: calendar }))
                    }}
                  />
                </div>
              )

            case 'mvp3':
              return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Content Engine</h1>
            <p className="text-gray-600 mb-8 text-lg">Coming soon...</p>
            <button
              onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Back to Home
            </button>
          </div>
        </div>
      )

    case 'mvp4':
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Multi-Channel Asset Creator</h1>
            <p className="text-gray-600 mb-8 text-lg">Coming soon...</p>
            <button
              onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Back to Home
            </button>
          </div>
                </div>
              )

            case 'mvp4':
              return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Multi-Channel Asset Creator</h1>
                    <p className="text-gray-600 mb-8 text-lg">Coming soon...</p>
                    <button
                      onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              )

            /* 
            case 'planner':
              return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                  <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                          </svg>
                          Back to Home
                        </button>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">S</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">Slotted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketing Planner Coming Soon</h2>
                    <p className="text-gray-600">Advanced planning features are being developed.</p>
                  </div>
                </div>
              )
            */

            case 'mvp5':
              return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Campaign Orchestrator</h1>
                    <p className="text-gray-600 mb-8 text-lg">Coming soon...</p>
                    <button
                      onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              )

            default:
              return <LandingPage appState={appState} setAppState={setAppState} />
          }
        })()}
      </div>
    </SlottedContextProvider>
  )
}

// Landing page component
interface LandingPageProps {
  appState: AppState
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
}

const LandingPage: React.FC<LandingPageProps> = ({ appState, setAppState }) => {
  const mvpFeatures = [
    {
      id: 'mvp1',
      title: 'Company DNA Extractor',
      description: 'Get your complete brand profile in 30 minutes',
      price: '$29-49',
      status: 'available',
      icon: '🧬',
      color: 'blue',
      features: [
        'Automated website analysis',
        'Brand voice detection',
        'Value proposition extraction',
        'Target audience insights',
        'Downloadable JSON report',
      ],
    },
    {
      id: 'mvp2',
      title: 'Marketing Calendar Generator',
      description: 'Get a 13-week content calendar in 10 minutes',
      price: '$99-199',
      status: 'available',
      icon: '📅',
      color: 'green',
      features: [
        '13-week strategic calendar',
        'Campaign topic generation',
        'Google Sheets integration',
        'Content theme planning',
        'Optimal timing recommendations',
      ],
    },
    {
      id: 'mvp3',
      title: 'Blog Content Engine',
      description: 'Turn any topic into a professional 2000+ word blog',
      price: '$49-99',
      status: 'coming-soon',
      icon: '✍️',
      color: 'purple',
      features: [
        '2000+ word blog posts',
        'Brand voice consistency',
        'SEO optimization',
        'Editing interface',
        'Multiple format export',
      ],
    },
    {
      id: 'mvp4',
      title: 'Multi-Channel Asset Creator',
      description: 'Transform one blog into 20+ marketing assets',
      price: '$199-399',
      status: 'coming-soon',
      icon: '🎨',
      color: 'pink',
      features: [
        'Multi-platform graphics',
        'Social media adaptations',
        'Email campaigns',
        'Video scripts',
        'Automated organization',
      ],
    },
    {
      id: 'planner',
      title: 'Marketing Planner',
      description: 'Comprehensive marketing planning & coordination interface',
      price: 'Free',
      status: 'available',
      icon: '📊',
      color: 'teal',
      features: [
        'Strategic planning interface',
        'Content calendar management',
        'Publishing integration',
        'Performance tracking',
        'Multi-channel coordination',
      ],
    },
    {
      id: 'mvp5',
      title: 'Campaign Orchestrator',
      description: 'Complete omnichannel campaigns on autopilot',
      price: '$499-999/mo',
      status: 'coming-soon',
      icon: '🚀',
      color: 'indigo',
      features: [
        'Full workflow automation',
        'Campaign performance tracking',
        'Asset management',
        'Multi-agent coordination',
        'Analytics dashboard',
      ],
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      pink: 'from-pink-500 to-pink-600',
      indigo: 'from-indigo-500 to-indigo-600',
      teal: 'from-teal-500 to-teal-600',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.4))] -z-10" />
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Slotted</span>
            </div>

            {appState.companyDNA && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">DNA: {appState.companyDNA.company.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered Marketing,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                One MVP at a Time
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Ship value incrementally with 5 standalone micro MVPs. Each tool provides immediate
              value and can be used independently or combined for maximum impact.
            </p>
          </div>

          {!appState.companyDNA && (
            <button
              onClick={() => setAppState((prev) => ({ ...prev, currentView: 'mvp1' }))}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Start with Company DNA Extractor
            </button>
          )}
        </div>
      </section>

      {/* MVP Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Choose Your Starting Point
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Each MVP is designed to provide immediate value and can be used independently
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {mvpFeatures.map((mvp, index) => (
              <motion.div
                key={mvp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                whileHover={{ 
                  scale: mvp.status === 'available' ? 1.02 : 1,
                  y: mvp.status === 'available' ? -8 : 0,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                whileTap={{ scale: mvp.status === 'available' ? 0.98 : 1 }}
                className={`group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl p-6 lg:p-8 border-2 transition-all duration-300 ${
                  mvp.status === 'available'
                    ? 'border-transparent hover:border-blue-200/50 cursor-pointer'
                    : 'border-gray-100/50 opacity-75'
                }`}
                onClick={() => {
                  if (mvp.status === 'available') {
                    setAppState((prev) => ({
                      ...prev,
                      currentView: mvp.id as AppState['currentView'],
                    }))
                  }
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getColorClasses(mvp.color)} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {mvp.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-500">MVP #{index + 1}</span>
                  </div>
                  {mvp.status === 'available' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Available
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>

                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">{mvp.title}</h3>

                <p className="text-gray-600 mb-6 leading-relaxed">{mvp.description}</p>

                <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-6">{mvp.price}</div>

                <ul className="space-y-3 mb-6">
                  {mvp.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {mvp.status === 'available' && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Try Now
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Build One MVP at a Time?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Immediate Value</h3>
              <p className="text-gray-600 leading-relaxed">
                Each MVP provides standalone value you can use immediately, without waiting for the
                complete system.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Revenue Validation</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate revenue from early MVPs to fund development of more advanced features.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Iterative Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn from user feedback on each MVP to improve the next iteration and overall
                platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Transform Your Marketing?</h3>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Start with one MVP and scale as you see results. Each tool is designed to provide
            immediate value.
          </p>

          {!appState.companyDNA && (
            <button
              onClick={() => setAppState((prev) => ({ ...prev, currentView: 'mvp1' }))}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Get Started with MVP #1
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App
